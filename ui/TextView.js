const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

let allocationBoxToString = function(box) {
    return '' + box.width + 'x' + box.height + ' @ ' + box.x + 'x' + box.y;
};

const TextView = new Lang.Class({
  Name: 'TextView',
  Extends: GtkSource.View;
  Signals: {
    'location-changed': { }
  },


  _init: function() {
    this.show_line_numbers = true;

    let lang_manager = GtkSource.LanguageManager.get_default();
    this.buffer.set_language(lang_manager.get_language('js'));

    let tag_table = this.buffer.get_tag_table();
    let tag = new Gtk.TextTag({
      name: 'highlight',
      background: 'lightblue',
    });
    tag_table.add(tag);

    this._setInControl(false);
    this.connect('key-press-event', this._keyPressed.bind(this));
    this.connect('key-release-event', this._keyReleased.bind(this));
    this.connect('motion-notify-event', this._motionNotified.bind(this));
  },

  _setInControl: function(value) {
    this._inControl = value;
  },
  _getInControl: function() {
    return this._inControl;
  },

  _keyPressed: function(widget, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_Control_L: _setInControl(true); break;
    }
    return false;
  },
  _keyReleased: function(widget, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_Control_L: _setInControl(false); break;
    }
    return false;
  },
  _motionNotified: function(widget, event) {
    if (!this._getInControl()) return false;
    let [, x, y] = event.get_coords(),
        offset = textview.getOffsetAtLocation(x, y);

    return false;
  },


  getOffsetAtLocation: function(x, y) {
    x += this.get_hadjustment().get_value();
    y += this.get_vadjustment().get_value();
    let iter = this.get_iter_at_location(x, y);

    return iter.get_offset();
  },

  getRectForRange: function(start, stop) {
    let start_iter = this.buffer.get_iter_at_offset(start);
    let end_iter = this.buffer.get_iter_at_offset(stop);

    let rect1 = this.get_iter_location(start_iter),
        rect2 = this.get_iter_location(end_iter);
    let ret =  Gdk.rectangle_union(rect1, rect2);
    ret.x += 20; // GtkSourceView sucks.
    return ret;
  },

  hightlightRange: function(start, stop) {
    let start_iter, end_iter;

    if (this._highlight) {
      start_iter = this.buffer.get_iter_at_offset(this._highlight.start);
      end_iter = this.buffer.get_iter_at_offset(this._highlight.stop);
      this.buffer.remove_tag_by_name('highlight',
                                      start_iter, end_iter);
    }

    start_iter = this.buffer.get_iter_at_offset(start);
    end_iter = this.buffer.get_iter_at_offset(stop);
    this.buffer.apply_tag_by_name('highlight', start_iter, end_iter);

    this._highlight = {
      start: start,
      stop: stop,
    };
  },

  setData: function(data) {
    if (!(typeof data === 'string'))
      throw new Error('Cannot display an object other than a string');
    this._data = data;
    this.buffer.set_text(data, -1);
  },

  onChange: function(callback) {
    this.buffer.connect('changed', function() {
      callback(this.buffer.get_text(this.buffer.get_start_iter(),
                                    this.buffer.get_end_iter(),
                                    true));
    }.bind(this));
  },
});


const TEST = false;
if (TEST) {
  Gtk.init(null, null);

  let scrolled = new Gtk.ScrolledWindow();
  let view = new TextView();
  scrolled.add(widget);
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
