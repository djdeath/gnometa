const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const StructureView = imports.StructureView;
const Utils = imports.Utils;

const MatchTreeView = new Lang.Class({
  Name: 'MatchTreeView',
  Extends: Gtk.ScrolledWindow,

  _init: function(args) {
    this.parent(args);
    this.visible = true;
    this.hscrollbar_policy = Gtk.PolicyType.AUTOMATIC;
    this.vscrollbar_policy = Gtk.PolicyType.AUTOMATIC;

    this._structureview = new StructureView.StructureView();
    this.add(this._structureview);

    Utils.forwardCall(this, this._structureview, 'setData');
    Utils.forwardCall(this, this._structureview, 'onClick');
    Utils.forwardCall(this, this._structureview, 'onHover');
  },
});
