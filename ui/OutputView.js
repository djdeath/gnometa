const Lang = imports.lang;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;
const TreeView = imports.TreeView;

const TEST = false
if (TEST) { Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource')); }

const OutputView = new Lang.Class({
  Name: 'OutputView',
  Extends: Gtk.Box,
  Template: 'resource:///org/gnome/Gnometa/output-template.ui',
  InternalChildren: ['output-type',
                     'source-buffer',
                     'sourceview',
                     'treeview-viewport'],

  _init: function(args) {
    this.parent(args);
    this._output_type.connect('notify::active', this._renderingChanged.bind(this));
    this._treeview = new TreeView.TreeView();
    this._treeview_viewport.add(this._treeview);
  },

  _renderingChanged: function() {
    this._treeview.get_parent().visible = this._output_type.active == 0;
    this._sourceview.get_parent().visible = this._output_type.active == 1;
  },
});

if (TEST) {
  Gtk.init(null, null);
  let view = new GtkSource.View();
  let win = new Gtk.Window();
  win.add(new OutputView());
  win.show();
  Gtk.main();
}
