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
        delete cmd.data;
        cmd.error = error;
        cmd.error.message = error.message;
      } else
        cmd.data = data;
      outpuStream.write_all(JSON.stringify(cmd) + '\n', null);
    }.bind(this));
  } catch (error) {
    cmd.data = null;
    cmd.error = { message: error.message }
    outpuStream.write_all(JSON.stringify(cmd) + '\n', null);
  }
};

let readLine = null, gotLine = null;
gotLine = function(stream, res) {
  let [data, length] = inputDataStream.read_line_finish(res);
  if (length > 0) {
    readLine();
    handleCommand(JSON.parse(data));
  } else
    Mainloop.quit('ui-helper');
};
readLine = function() {
  inputDataStream.read_line_async(0, null, gotLine.bind(this));
};

readLine();
Mainloop.run('ui-helper');
