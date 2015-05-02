const Lang = imports.lang;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

let allocationBoxToString = function(box) {
    return '' + box.width + 'x' + box.height + ' @ ' + box.x + 'x' + box.y;
};

const PopoverView = new Lang.Class({
  Name: 'PopoverView',
  Extends: Gtk.Box,
  Template: 'resource:///org/gnome/Gnometa/popover-template.ui',
  InternalChildren: [ 'filename-label',
                      'plus-button',
                      'minus-button',
                      'sourceview'],
  Signals: {
    'rule-move': { param_types: [ GObject.TYPE_INT ] },
  },

  _init: function(args) {
    this.parent(args);

    this._plus_button.connect('clicked', this._plusPressed.bind(this));
    this._minus_button.connect('clicked', this._minusPressed.bind(this));
    this._sourceview.connect('size-allocate', this._sizeAllocated.bind(this));

    let tag_table = this._sourceview.buffer.get_tag_table();
    let tag = new Gtk.TextTag({
      name: 'highlight',
      background: 'lightblue',
    });
    tag_table.add(tag);


    let lang_manager = GtkSource.LanguageManager.get_default();
    this._sourceview.buffer.set_language(lang_manager.get_language('js'));
  },

  _iterAtOffset: function(offset) {
    return this._sourceview.buffer.get_iter_at_offset(offset);
  },

  _highlightRegion: function(start, end) {
    this._sourceview.buffer.apply_tag_by_name('highlight',
                                              this._iterAtOffset(start),
                                              this._iterAtOffset(end));
  },
  _unhighlightRegion: function(start, end) {
    this._sourceview.buffer.remove_tag_by_name('highlight',
                                               this._iterAtOffset(start),
                                               this._iterAtOffset(end));
  },

  setData: function(filename, data, start, end) {
    let textChanged = false;
    if (filename != this._filename_label.label) {
      this._filename_label.label = filename;
      this._sourceview.buffer.set_text(data, -1);
      textChanged = true;
    }

    if (this._highlight)
      this._unhighlightRegion(this._highlight.start, this._highlight.end);
    this._highlight = {
      start: start,
      end: end,
    };
    this._highlightRegion(this._highlight.start, this._highlight.end);

    if (!textChanged)
      this._sizeAllocated();
  },

  _plusPressed: function() {
    this.emit('rule-move', 1);
  },
  _minusPressed: function() {
    this.emit('rule-move', -1);
  },
  _sizeAllocated: function() {
    let rect1 = this._sourceview.get_iter_location(this._iterAtOffset(this._highlight.start)),
        rect2 = this._sourceview.get_iter_location(this._iterAtOffset(this._highlight.end));
    this._sourceview.vadjustment.value =
      (rect1.y + rect2.y) / 2 - this._sourceview.vadjustment.page_increment / 2;
    return false;
  },
});
