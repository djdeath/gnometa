const Lang = imports.lang;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;
const TextView = imports.TextView;

const CompilerView = new Lang.Class({
  Name: 'CompilerView',
  Extends: Gtk.Box,
  Template: 'resource:///org/gnome/Gnometa/compiler-template.ui',
  InternalChildren: [ 'filename-label',
                      'sourceview-scrollview'],

  _init: function(args) {
    this.parent(args);
    this.visible = true;

    this._sourceview = new TextView.TextView();
    this._sourceview.following_highlight = true;
    this._sourceview_scrollview.add(this._sourceview);
  },

  setData: function(filename, data, hstart, hend, istart, iend) {
    let textChanged = false;
    if (filename != this._filename_label.label) {
      this._filename_label.label = filename;
      this._sourceview.setData(data);
      textChanged = true;
    }

    this._sourceview.hightlightRange('highlight', hstart, hend);
    this._sourceview.hightlightRange('hint', istart, iend);
  },
});
