const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const UiHelper = imports.UiHelper;
const Utils = imports.Utils;

let [success, pid, inputFd, outputFd, errorFd] =
    GLib.spawn_async_with_pipes(null,
                                ['./ui-helper'],
                                [],
                                GLib.SpawnFlags.DEFAULT,
                                null);
log(pid);
log('inputFd=' + inputFd + ' outputFd=' + outputFd + ' errorFd=' + errorFd);

let _inputStream = new Gio.UnixInputStream({ fd: outputFd,
                                             close_fd: true, });
let _outputStream = new Gio.UnixOutputStream({ fd: inputFd,
                                               close_fd: true, });
let _errorStream = new Gio.UnixInputStream({ fd: errorFd,
                                             close_fd: true, });

let readLine = function(stream, process) {
  stream.read_line_async(0, null, function(stream, res) {
    try {
      let [data, length] = stream.read_line_finish(res);
      if (length > 0) {
        readLine(stream, process);
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
let executeCommand = function(name, data, callback) {
  let cmd = { id: _cmdId++, op: name, data: data, };
  _callbacks[cmd.id] = callback;
  //log('execute cmd: ' + JSON.stringify(cmd));
  _outputStream.write_all(JSON.stringify(cmd) + '\n', null);
};

readLine(Gio.DataInputStream.new(_inputStream), function(data) {
  try {
    let cmd = JSON.parse(data);
    let callback = _callbacks[cmd.id];
    delete _callbacks[cmd.id];
    //log('answer: ' + data + ' -> ' + cmd.data);
    if (callback)
      callback(null, cmd.data);
    //log(cmd.id + ' : ' + data.length);
    else
      log('No callback for : ' + data);
  } catch (error) {
    log('Client: ' + error);
  }
}.bind(this));
readLine(Gio.DataInputStream.new(_errorStream), function(data) {
  log('Server: ' + data);
}.bind(this));

const TEST = false;
if (TEST) {
  executeCommand('translate', { name: 'OMeta', rule: 'topLevel', input: Utils.loadFile('./CustomJson.ometa'), output: 'view0'});
  Mainloop.timeout_add(20, function() {
    executeCommand('match-structure', { input: 'view0', offset: { start: 1141, end: 1142 }});
    return true;
  });
  Mainloop.run('test');
}
