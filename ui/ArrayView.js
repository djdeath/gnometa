const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

let ArrayView = function() {
  this._init();
};

ArrayView.prototype = {
  _init: function() {
    this._widget = new Gtk.TreeView({
      enable_tree_lines: true,
      headers_visible: false,
      activate_on_single_click: true,
    });

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
      callback(this.getValue({ iter: iter, path: path }));
    }.bind(this);

    this._widget.connect('row-activated', emitValue);
    this._widget.connect_after('move-cursor', emitValue);
    this._widget.connect('motion-notify-event', this._filterModifier(emitValue));
  },

  getWidget: function() {
    return this._widget;
  },

  _insertBefore: function(parent, sibling) {
    let ret = { iter: null, path: null };
    ret.iter = this._store.insert_before(parent.iter, sibling);
    ret.path = this._store.get_path(ret.iter);
    return ret;
  },
  _set: function(it, data, values) {
    let columns = values.map(function(el, idx) { return idx; });
    this._store.set(it.iter, columns, values);
    this._dataMap[it.path.to_string()] = data;
  },
  getValue: function(it) {
    return this._dataMap[it.path.to_string()];
  },

  getDataController: function() { return this._controller; },
  setDataController: function(controller) {
    this._controller = controller;

    let columns = this._widget.get_columns();
    for (let i = 0; i < columns.length; i++)
      this._widget.remove_column(columns[i]);

    let model = this._controller.getModel();
    let types = model.map(function(el) { return el.type; });

    this._store = new Gtk.TreeStore();
    this._controller.insertBefore = this._insertBefore.bind(this);
    this._controller.set = this._set.bind(this);

    this._store.set_column_types(types);
    this._widget.model = this._store;

    let createColumn = function(rendererType, property, columnId) {
      let column = new Gtk.TreeViewColumn({});
      let renderer = new rendererType({});
      column.pack_start(renderer, false);
      column.add_attribute(renderer, property, columnId);
      return column;
    };

    let getRenderer = function(name) {
      if (name == 'text')
        return { renderer: Gtk.CellRendererText,
                 property: 'text', };
      return null;
    };

    for (let i = 0; i < model.length; i++) {
      let renderer = getRenderer(model[i].renderer)
      this._widget.append_column(createColumn(renderer.renderer,
                                              renderer.property,
                                              i));
    }
  },

  setData: function(data) {
    if (!(data instanceof Array) &&
        !(data instanceof Object))
      throw new Error('Cannot display an object other than an array or object');
    this._data = data;
    this._refreshView();
  },
  _refreshView: function() {
    this._store.clear();
    this._dataMap = {}
    let iter = { iter: null, path: null };
    this._controller.render(iter, this._data);
  },
};

const TEST = false;
if (TEST) {
  Gtk.init(null, null);

  let dataController = {
    getModel: function() {
      return [{ type: GObject.TYPE_STRING,
                renderer: 'text' },
              { type: GObject.TYPE_INT,
                renderer: 'text' },
              { type: GObject.TYPE_INT,
                renderer: 'text' } ];
    },

    render: function(parent, data) {
      let iter = this.insertBefore(parent, null);
      this.set(iter, data, [data.title, data.start, data.stop]);
      for (let i = 0; i < data.children.length; i++)
        this.render(iter, data.children[i]);
    },
  };

  let scrolled = new Gtk.ScrolledWindow();
  let view = new ArrayView();
  scrolled.add(view.getWidget());
  let file = Gio.File.new_for_path('./test.ast');
  let [, source] = file.load_contents(null);
  let array = JSON.parse('' + source);
  view.setDataController(dataController);
  view.setData(array);


  let win = new Gtk.Window();
  win.connect('destroy', (function() { Gtk.main_quit(); }).bind(this));

  win.resize(600, 400);
  win.add(scrolled);
  win.show_all();

  Gtk.main();
}
