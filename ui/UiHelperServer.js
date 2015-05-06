const Gio = imports.gi.Gio;
const Mainloop = imports.mainloop;
const UiHelper = imports.UiHelper;
const Utils = imports.Utils;

log('server starting!');

let inputStream = new Gio.UnixInputStream({ fd: 0,
                                            close_fd: false, });
let outpuStream = new Gio.UnixOutputStream({ fd: 1,
                                             close_fd: false, });
let inputDataStream = Gio.DataInputStream.new(inputStream);

let handleCommand = function(cmd) {
  try {
    UiHelper.executeCommand(cmd.op, cmd.data, function(error, data) {
      if (error) {
        let msg = { id: cmd.id, op: 'error', message: error.message, idx: error.idx };
        outpuStream.write_all(JSON.stringify(msg) + '\n', null);
        return;
      }
      cmd.data = data;
      outpuStream.write_all(JSON.stringify(cmd) + '\n', null);
    }.bind(this));
  } catch (error) {
    log(error);
  }
};

let readLine = null, gotLine = null;
gotLine = function(stream, res) {
  try {
    let [data, length] = inputDataStream.read_line_finish(res);
    readLine();
    handleCommand(JSON.parse(data));
  } catch (error) {
    log(error);
    Mainloop.quit('ui-helper');
  }
};
readLine = function() {
  inputDataStream.read_line_async(0, null, gotLine.bind(this));
};

readLine();
Mainloop.run('ui-helper');
