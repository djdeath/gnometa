const Lang = imports.lang;
const Gtk = imports.gi.Gtk;

const TreeView = new Lang.Class({
  Name: 'TreeView',
  Extends: Gtk.TreeView,

  _init: function(args) {
    this.parent(args);
    this.enable_tree_lines = true;
    this.headers_visible = false;
    this.activate_on_single_click = true;
    this.show();
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

  setData: function(data) {
    this._data = data;
    this._refreshView();
  },
  _refreshView: function() {
    this._store.clear();
    this._dataMap = {}
    let iter = { iter: null, path: null };
    this._controller.render(iter, this._data);
  },
});
