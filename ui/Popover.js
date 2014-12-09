const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

let Popover = function() {
  this._init();
};

Popover.prototype = {
  _init: function() {
    this._store = new Gtk.ListStore();
    this._store.set_column_types([GObject.TYPE_STRING,
                                  GObject.TYPE_INT,
                                  GObject.TYPE_INT]);

    this._widget = new Gtk.TreeView({
      enable_tree_lines: true,
      model: this._store,
      headers_visible: false,
      activate_on_single_click: true,
    });

    let addColumn = function(rendererType, property, columnId) {
      let column = new Gtk.TreeViewColumn({});
      let renderer = new rendererType({});
      column.pack_start(renderer, false);
      column.add_attribute(renderer, property, columnId);
      return column;
    };

    this._widget.append_column(addColumn(Gtk.CellRendererText, 'text', 0));
    this._widget.append_column(addColumn(Gtk.CellRendererText, 'text', 1));
    this._widget.append_column(addColumn(Gtk.CellRendererText, 'text', 2));

    this._widget.connect('key-press-event', this._keyEvent.bind(this));
    this._widget.connect('key-release-event', this._keyEvent.bind(this));
  },
  _keyEvent: function(widget, event) {
    this._setHoverExpand(this._isShiftKeyPressed(event));
  },
  _isShiftKeyPressed: function(event) {
    let keyval = event.get_keyval()[1];
    let state = event.get_state()[1];
    if (keyval != Gdk.KEY_Shift_L &&
        keyval != Gdk.GDK_KEY_Shift_R) {
      return (state & Gdk.ModifierType.SHIFT_MASK) != 0;
    } else if (event.get_event_type() == Gdk.EventType.KEY_PRESS)
      return !((state & Gdk.ModifierType.SHIFT_MASK) != 0);
    else
      return !((state & Gdk.ModifierType.SHIFT_MASK) != 0);
  },
  _setHoverExpand: function(value) {
    this._widget.hover_expand = value;
  },

  _filterModifier: function(callback) {
    return function(widget, event) {
      if ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) == 0)
        return false;

      let [, x, y] = event.get_coords();
      let [status, path, column, cell_x, cell_y] =
          this._widget.get_path_at_pos(x, y);
      if (!status)
        return false;

      this._widget.set_cursor(path, column, false);
      callback();

      return false;
    }.bind(this);
  },

  onChange: function(callback) {
    let emitValue = function() {
      let [path, column] = this._widget.get_cursor(path);
      let [status, iter] = this._store.get_iter(path);
      if (!status)
        return;
      log(this._store.get_value(iter, 0));
      let value = {
        start: this._store.get_value(iter, 1),
        stop: this._store.get_value(iter, 2),
      };
      callback(value);
    }.bind(this);

    this._widget.connect('row-activated', emitValue);
    this._widget.connect_after('move-cursor', emitValue);
    this._widget.connect('motion-notify-event', this._filterModifier(emitValue));
  },

  getWidget: function() {
    return this._widget;
  },

  setData: function(data) {
    if (!(data instanceof Array) ||
        !(data instanceof Object))
      throw new Error('Cannot display an object other than an array or object');
    this._data = data[0];
    this._refreshView();
  },
  _refreshView: function() {
    this._store.clear();
    this._insertNodes(null, this._data);
    //log(JSON.stringify(this._data, null, 2));
  },
  _insertNodes: function(parent, data) {
    let isArray = data instanceof Array;
    let iter = this._store.insert_before(parent, null);
    log([data.title, data.start, data.stop]);
    log('children: ' + data.children.length +  ' -> ' + data.children[0]);
    this._store.set(iter, [0, 1, 2], [data.title, data.start, data.stop]);
    for (let i = 0; i < data.children.length; i++)
      this._insertNodes(iter, data.children[i]);
  },
};
