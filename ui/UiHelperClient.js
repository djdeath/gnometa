const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const UiHelper = imports.UiHelper;
const Utils = imports.Utils;

const _DEBUG_IO = false;
let _debugIo = function(pre, data) {
  if (_DEBUG_IO) log(pre + data);
};

let _readLine = function(stream, process) {
  stream.read_line_async(0, null, function(stream, res) {
    try {
      let [data, length] = stream.read_line_finish(res);
      if (length > 0) {
        _readLine(stream, process);
        process(data);
      } else
        log('Server gone');
    } catch (error) {
      log('Server connection error : ' + error);
    }
  });
};

let _cmdId = 0;
let _callbacks = {};
let _outputStream = null;
let commands = {};

let _generateIpc = function(name, callback) {
  return function() {
    if ((arguments.length - 1) != callback.length)
      throw new Error('Invalid number of arguments for ' + name +
                      ' : ' + arguments.length +
                      ' expected ' + callback.length);

    let args = [];
    for (let i = 0; i < (arguments.length - 1); i++)
      args.push(arguments[i]);
    let cmd = { id: _cmdId++, op: name, data: args };
    _callbacks[cmd.id] = arguments[arguments.length - 1];
    _debugIo('OUT: ', JSON.stringify(cmd));
    _outputStream.write_all(JSON.stringify(cmd) + '\n', null);
  };
};

let start = function() {
  for (let i in UiHelper.commands)
    commands[i] = _generateIpc(i, UiHelper.commands[i]);

  let [success, pid, inputFd, outputFd, errorFd] =
      GLib.spawn_async_with_pipes(null,
                                  ['./ui-helper'],
                                  [],
                                  GLib.SpawnFlags.DEFAULT,
                                  null);
  let _inputStream = new Gio.UnixInputStream({ fd: outputFd,
                                               close_fd: true, });
  let _errorStream = new Gio.UnixInputStream({ fd: errorFd,
                                               close_fd: true, });
  _outputStream = new Gio.UnixOutputStream({ fd: inputFd,
                                             close_fd: true, });

  _readLine(Gio.DataInputStream.new(_inputStream), function(data) {
    try {
      _debugIo('IN: ', data);
      let cmd = JSON.parse(data);
      let callback = _callbacks[cmd.id];
      delete _callbacks[cmd.id];

      if (!callback) {
        log('No callback for : ' + data);
        return;
      }

      if (cmd.error) {
        let error = new Error();
        for (let i in cmd.error)
          error[i] = cmd.error[i];
        callback(error);
      }
      else
        callback(null, cmd.data);
    } catch (error) {
      log('Client: ' + error);
      log(error.stack);
    }
  }.bind(this));
  _readLine(Gio.DataInputStream.new(_errorStream), function(data) {
    log('Server: ' + data);
  }.bind(this));

};

const TEST = false;
if (TEST) {
  start();
  executeCommand('translate', { name: 'OMeta', rule: 'topLevel', input: Utils.loadFile('./CustomJson.ometa'), output: 'view0'});
  Mainloop.timeout_add(20, function() {
    executeCommand('match-structure', { input: 'view0', offset: { start: 1141, end: 1142 }});
    return true;
  });
  Mainloop.run('test');
}
