const Lang = imports.lang;
const GObject = imports.gi.GObject;
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
  InternalChildren: [ 'output-type',
                      'sourceview',
                      'treeview-viewport'],

  _init: function(args) {
    this.parent(args);
    this._output_type.connect('notify::active', this._renderingChanged.bind(this));
    this._treeview = new TreeView.TreeView();
    this._treeview_viewport.add(this._treeview);
    this._treeview.setDataController({
      getModel: function() {
        return [{ type: GObject.TYPE_STRING, renderer: 'text' }];
      },
      render: function(parent, data) {
        if (typeof data != 'object' || data === null || data === undefined) {
          let iter = this.insertBefore(parent, null);
          this.set(iter, data, ['' + data]);
          return;
        }
        for (let i = 0; i < data.length; i++) {
          let iter = this.insertBefore(parent, null);
          if (typeof data != 'object')
            this.set(iter, data, ['' + data]);
          else
            this.render(iter, data[i]);
        }
      },
    });

    let lang_manager = GtkSource.LanguageManager.get_default();
    this._sourceview.buffer.set_language(lang_manager.get_language('json'));
  },

  _renderingChanged: function() {
    this._treeview.get_parent().visible = this._output_type.active == 0;
    this._sourceview.get_parent().visible = this._output_type.active == 1;
  },

  setData: function(data) {
    this._treeview.setData(data);
    this._treeview.expand_all();
    this._sourceview.buffer.set_text(JSON.stringify(data, null, 2), -1);
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
