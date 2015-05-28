const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const Utils = imports.Utils;

const MatchTreeView = new Lang.Class({
  Name: 'MatchTreeView',
  Extends: Gtk.ScrolledWindow,
  Signals: {
    'hover': { param_types: [ GObject.TYPE_STRING, GObject.TYPE_LONG, GObject.TYPE_LONG, ] },
  },

  _init: function(args) {
    this.parent(args);
    this.visible = true;
    this.hscrollbar_policy = Gtk.PolicyType.AUTOMATIC;
    this.vscrollbar_policy = Gtk.PolicyType.AUTOMATIC;

    this._cssProvider = new Gtk.CssProvider();
    this._cssProvider.load_from_data(Utils.loadURI('resource:///org/gnome/Gnometa/match-tree-view.css'));

    this._callbacks = {};
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

  _newButton: function(tree) {
    let button = new Gtk.Button({ label: this._text(tree.id) });
    button.get_style_context().add_provider(this._cssProvider, 800);
    button.connect('enter-notify-event', function() { this._emit('hover', tree); }.bind(this));
    button.connect('clicked', function() { this._emit('click', tree); }.bind(this));
    return button;
  },

  _createBoxes: function(box, tree) {
    if (!tree)
      return;

    let packItem = function(box, item, expand) {
      if (!item) return;
      box.pack_start(item, expand, true, 0);
    };

    let cbox = box;
    if (tree.rule) {
      let vbox = new Gtk.Box({ orientation: Gtk.Orientation.VERTICAL });
      packItem(vbox, this._newButton(tree), false);
      cbox = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
      packItem(vbox, cbox, true);
      packItem(box, vbox, false);
    }

    for (let i = 0; i < tree.children.length; i++)
      this._createBoxes(cbox, tree.children[i]);
  },

  setData: function(tree, textFunc) {
    if (this._box) this.remove(this.get_child());

    this._textFunc = textFunc;

    this._box = new Gtk.Frame();
    let box = new Gtk.Box({ orientation: Gtk.Orientation.HORIZONTAL });
    this._createBoxes(box, tree);
    this._box.name = 'main-box';
    this._box.get_style_context().add_provider(this._cssProvider, 10000);
    this._box.add(box);
    this._box.show_all();
    this.add(this._box);
  },

  onClick: function(callback) {
    this._callbacks['click'] = callback;
  },
  onHover: function(callback) {
    this._callbacks['hover'] = callback;
  },
});
