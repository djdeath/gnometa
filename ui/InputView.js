const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;
const TextView = imports.TextView;
const Utils = imports.Utils;

const InputView = new Lang.Class({
  Name: 'InputView',
  Extends: Gtk.ScrolledWindow,
  Signals: {
    'changed': { param_types: [ GObject.TYPE_STRING ] },
    'offset-changed': { param_types: [ GObject.TYPE_ULONG ] },
    'selection-changed': { param_types: [ GObject.TYPE_ULONG, GObject.TYPE_ULONG ] },
  },

  _init: function(args) {
    this.parent(Utils.copyObjectBut(args, { name: true, language: true }));
    this._name = args.name;
    this._textview = new TextView.TextView({ language: args.language });
    this.add(this._textview);
    this.visible = true;
    Utils.forwardSignal(this._textview, this, 'offset-changed');
    Utils.forwardSignal(this._textview, this, 'selection-changed');
    Utils.forwardCall(this, this._textview, 'hightlightRange');
    Utils.forwardCall(this, this._textview, 'removeHighlightRange');
    Utils.forwardCall(this, this._textview, 'removeSelection');
    Utils.forwardCall(this, this._textview, 'getData');
    Utils.forwardCall(this, this._textview, 'setData');
    this._textview.buffer.connect('changed', function() {
      this.emit('changed', this._textview.getData());
    }.bind(this));
  },

  getName: function() { return this._name; },
});
