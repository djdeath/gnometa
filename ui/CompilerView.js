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
                      'plus-button',
                      'minus-button',
                      'sourceview-scrollview'],
  Signals: {
    'rule-move': { param_types: [ GObject.TYPE_INT ] },
  },

  _init: function(args) {
    this.parent(args);
    this.visible = true;

    this._sourceview = new TextView.TextView();
    this._sourceview.following_highlight = true;
    this._sourceview_scrollview.add(this._sourceview);

    this._plus_button.connect('clicked', function() { this.emit('rule-move', 1); }.bind(this));
    this._minus_button.connect('clicked', function() { this.emit('rule-move', -1); }.bind(this));
  },

  setData: function(filename, data, start, end) {
    let textChanged = false;
    if (filename != this._filename_label.label) {
      this._filename_label.label = filename;
      this._sourceview.setData(data);
      textChanged = true;
    }

    this._sourceview.hightlightRange('highlight', start, end);
  },
});
