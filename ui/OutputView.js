const Lang = imports.lang;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;
const TextView = imports.TextView;
const TreeView = imports.TreeView;
const Utils = imports.Utils;

const TEST = false
if (TEST) { Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource')); }

const OutputView = new Lang.Class({
  Name: 'OutputView',
  Extends: Gtk.Box,
  Template: 'resource:///org/gnome/Gnometa/output-template.ui',
  InternalChildren: [ 'error',
                      'image',
                      'output-type',
                      'spinner',
                      'textview',
                      'treeview-viewport'],

  _init: function(args) {
    this.parent(Utils.copyObjectBut(args, 'name'));
    this._name = args.name;
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
        for (let i in data) {
          if (typeof data[i] == 'function') continue;
          let iter = this.insertBefore(parent, null);
          if (typeof data[i] != 'object') {
            let s = data.constructor == Array ? '' + data[i] : i + ' : ' + data[i];
            this.set(iter, data, [s]);
          } else
            this.render(iter, data[i]);
        }
      },
    });

    this._lang_manager = GtkSource.LanguageManager.get_default();
    this.setBusy(false);
    this.setError(null);
  },

  _renderingChanged: function() {
    let isString = typeof this._data === 'string';

    this._output_type.sensitive = !isString;
    this._treeview.get_parent().visible = !isString && this._output_type.active == 0;
    this._textview.get_parent().visible = isString || this._output_type.active == 1;
  },

  getName: function() { return this._name; },

  setBusy: function(value) {
    this._spinner.active =  this._spinner.visible = value;
  },

  setError: function(text) {
    this._image.icon_name = text ? 'dialog-error' : 'emblem-default';
    this._error.label = text;
  },

  setData: function(data) {
    this._data = data;
    let lang_manager = GtkSource.LanguageManager.get_default();
    if (typeof this._data === 'string') {
      this._textview.buffer.set_text(data, -1);
      this._textview.buffer.set_language(lang_manager.get_language('js'));
    } else {
      this._treeview.setData(data);
      this._treeview.expand_all();
      this._textview.buffer.set_text(JSON.stringify(data, null, 2), -1);
      this._textview.buffer.set_language(lang_manager.get_language('json'));
    }
    this._renderingChanged();
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
