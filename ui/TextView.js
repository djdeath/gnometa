const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

let TextView = function() {
  this._init();
};

let allocationBoxToString = function(box) {
    return '' + box.width + 'x' + box.height + ' @ ' + box.x + 'x' + box.y;
};

TextView.prototype = {
  _init: function() {
    this._widget = new GtkSource.View({
      show_line_numbers: true,
    });
    this._buffer = this._widget.buffer;

    let lang_manager = GtkSource.LanguageManager.get_default();
    this._buffer.set_language(lang_manager.get_language('js'));

    let tag_table = this._buffer.get_tag_table();
    let tag = new Gtk.TextTag({
      name: 'highlight',
      background: 'lightblue',
    });
    tag_table.add(tag);
  },

  getWidget: function() {
    return this._widget;
  },

  getOffsetAtLocation: function(x, y) {
    x += this._widget.get_hadjustment().get_value();
    y += this._widget.get_vadjustment().get_value();
    let iter = this._widget.get_iter_at_location(x, y);

    return iter.get_offset();
  },

  getRectForRange: function(start, stop) {
    let start_iter = this._buffer.get_iter_at_offset(start);
    let end_iter = this._buffer.get_iter_at_offset(stop);

    let rect1 = this._widget.get_iter_location(start_iter),
        rect2 = this._widget.get_iter_location(end_iter);
    let ret =  Gdk.rectangle_union(rect1, rect2);
    ret.x += 20; // GtkSourceView sucks.
    return ret;
  },

  hightlightRange: function(start, stop) {
    let start_iter, end_iter;

    if (this._highlight) {
      start_iter = this._buffer.get_iter_at_offset(this._highlight.start);
      end_iter = this._buffer.get_iter_at_offset(this._highlight.stop);
      this._buffer.remove_tag_by_name('highlight',
                                      start_iter, end_iter);
    }

    start_iter = this._buffer.get_iter_at_offset(start);
    end_iter = this._buffer.get_iter_at_offset(stop);
    this._buffer.apply_tag_by_name('highlight', start_iter, end_iter);

    this._highlight = {
      start: start,
      stop: stop,
    };
  },

  setData: function(data) {
    if (!(typeof data === 'string'))
      throw new Error('Cannot display an object other than a string');
    this._data = data;
    this._buffer.set_text(data, -1);
  },

  onChange: function(callback) {
    this._buffer.connect('changed', function() {
      callback(this._buffer.get_text(this._buffer.get_start_iter(),
                                     this._buffer.get_end_iter(),
                                     true));
    }.bind(this));
  },
};


const TEST = false;
if (TEST) {
  Gtk.init(null, null);

  let scrolled = new Gtk.ScrolledWindow();
  let view = new TextView();
  scrolled.add(view.getWidget());
  let file = Gio.File.new_for_path('./lr.ometajs');
  let [, data] = file.load_contents(null);
  let source = '' + data;
  view.setData(source);


  let win = new Gtk.Window();
  win.connect('destroy', (function() { Gtk.main_quit(); }).bind(this));

  win.resize(600, 400);
  win.add(scrolled);
  win.show_all();

  Gtk.main();
}
