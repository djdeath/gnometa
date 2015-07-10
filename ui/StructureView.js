const Lang = imports.lang;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const Utils = imports.Utils;

const StructureView = new Lang.Class({
  Name: 'StructureView',
  Extends: Gtk.Fixed,

  _init: function(args) {
    this.parent(args);
    this._root = this._emptyNode();
    this.visible = true;
    this._cssProvider = new Gtk.CssProvider();
    this._cssProvider.load_from_data(Utils.loadURI('resource:///org/gnome/Gnometa/match-tree-view.css'));

    this._callbacks = {};
  },

  vfunc_get_preferred_height: function() {
    let size = this._getPreferredSize(this._root);
    return [size.height, size.height];
  },
  vfunc_get_preferred_width: function() {
    let size = this._getPreferredSize(this._root);
    return [size.width, size.width];
  },

  vfunc_size_allocate: function(alloc) {
    this.set_allocation(alloc);
    this._layoutNodes(this._root, 0, 0);
  },

  _text: function(id) {
    // TODO: We could embed the rule's name into the source map.
    let ret = this._textFunc(id);
    if (!ret) return '';
    ret = ret.match(/\s*([\w\d]+).*/);
    if (!ret) return '';
    return ret[1];
  },

  _emit: function(signal, tree) {
    if (this._callbacks[signal])
      this._callbacks[signal](tree);
  },

  _getPreferredSize: function(node) {
    let size;
    size = { width: 0, height: 0 };

    for (let i = 0; i < node.children.length; i++) {
      let csize = this._getPreferredSize(node.children[i]);
      size.width += csize.width;
      size.height = Math.max(size.height, csize.height);
    }

    if (node.widget) {
      let wsize = node.widget.get_preferred_size()[0];
      size.width = Math.max(size.width, wsize.width);
      size.height += wsize.height;
    }
    return size;
  },

  _layoutNodes: function(node, top, right) {
    if (node.widget) {
      let [min, nat] = node.widget.get_preferred_size();
      node.alloc.x = right;
      node.alloc.y = top;
      node.alloc.width = nat.width;
      node.totalHeight = node.alloc.height = nat.height;
    }

    let cwidth = right, ctop = top + node.alloc.height, height = node.alloc.y + node.alloc.height;
    for (let i = 0; i < node.children.length; i++) {
      let child = node.children[i];
      this._layoutNodes(child, ctop, cwidth);
      cwidth += child.alloc.width;
      node.totalHeight = Math.max(child.totalHeight + node.alloc.height, node.totalHeight);
    }

    node.alloc.width = Math.max(node.alloc.width, cwidth - right);

    if (node.widget)
      node.widget.size_allocate(new Gdk.Rectangle(node.alloc));
  },

  _emptyNode: function() {
    return {widget: null,
            children: [],
            alloc: { x: 0, y: 0, width: 0, height: 0 },
            totalHeight: 0, };
  },

  _createButton: function(tree) {
    let text = this._text(tree.id);
    text = text == 'token' ? tree.value : text;
    let button = new Gtk.Button({ label: text, visible: true });
    this.add(button);
    button.get_style_context().add_provider(this._cssProvider, 1000);
    button.connect('enter-notify-event', function() { this._emit('hover', tree); }.bind(this));
    button.connect('clicked', function() { this._emit('click', tree); }.bind(this));
    return button;
  },

  _createNodes: function(tree) {
    if (!tree)
      return this._emptyNode();

    let node = this._emptyNode();
    if (tree.rule)
      node.widget = this._createButton(tree);

    for (let i = 0; i < tree.children.length; i++) {
      let child = this._createNodes(tree.children[i]);
      if (child)
        node.children.push(child);
    }
    return node;
  },

  _removeChildren: function() {
    let children = this.get_children();
    for (let i = 0; i < children.length; i++)
      children[i].destroy();
  },

  setData: function(tree, textFunc) {
    this._tree = tree;
    this._removeChildren();
    this._textFunc = textFunc;
    this._root = this._createNodes(tree);
    this.queue_resize();
  },

  onClick: function(callback) {
    this._callbacks['click'] = callback;
  },
  onHover: function(callback) {
    this._callbacks['hover'] = callback;
  },
});
