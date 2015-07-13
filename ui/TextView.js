const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;
const Pango = imports.gi.Pango;
const Utils = imports.Utils;

const TextView = new Lang.Class({
  Name: 'TextView',
  Extends: GtkSource.View,
  Signals: {
    'offset-changed': { param_types: [ GObject.TYPE_ULONG ] },
    'selection-changed': { param_types: [ GObject.TYPE_ULONG, GObject.TYPE_ULONG ] },
  },

  _colors: {
    'highlight': { name: 'highlight',
                   background: 'lightblue' },
    'alt-highlight': { name: 'alt-highlight',
                       background: '#fde5f6' },
    'hint': { name: 'hint',
              weight: Pango.Weight.BOLD },
    'error': { name: 'error',
               background: 'red' },
  },

  _init: function(args) {
    this.parent(Utils.copyObjectBut(args, 'language'));
    this.visible = true;
    this.show_line_numbers = true;
    this.following_highlight = false;
    this.monospace = true;
    this._data = '';
    this._lastHighlight = 'highlight';

    if (args)
      this.language = args.language;

    this._tagsOffsets = {}
    let tag_table = this.buffer.get_tag_table();
    for (let i in this._colors) {
      let tag = new Gtk.TextTag(this._colors[i]);
      tag_table.add(tag);
      this._tagsOffsets[i] = { start: 0, end: 0 };
    }

    this._setInControl(false);

    this.connect('key-press-event', this._keyPressed.bind(this));
    this.connect('key-release-event', this._keyReleased.bind(this));
    this.connect('button-release-event', this._buttonReleased.bind(this));
    this.connect('motion-notify-event', this._motionNotified.bind(this));
    this.connect('size-allocate', this._sizeAllocated.bind(this));
  },

  get language() {
    let lang = this.buffer.get_language();
    if (!lang) return '';
    lang.get_id();
  },

  set language(v) {
    if (!v) return;
    let lang_manager = GtkSource.LanguageManager.get_default();
    this.buffer.set_language(lang_manager.get_language(v));
  },

  _setInControl: function(value) {
    this._inControl = value;
  },
  _getInControl: function() {
    return this._inControl;
  },

  _buttonReleased: function(widget, event) {
    this._emitSignalOnSelection('selection-changed');
    return false;
  },
  _keyPressed: function(widget, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_Control_L: this._setInControl(true); break;
    }
    return false;
  },
  _keyReleased: function(widget, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_Control_L: this._setInControl(false); break;
    }
    return false;
  },
  _motionNotified: function(widget, event) {
    if (!this._getInControl()) return false;
    let [, x, y] = event.get_coords(),
        offset = this.getOffsetAtLocation(x, y);
    this.emit('offset-changed', offset);
    return false;
  },

  _sizeAllocated: function(widget, alloc) {
    if (this.following_highlight)
      this._scrollToHighlight();
    return false;
  },

  _scrollToHighlight: function() {
    let highlight = this._getRange(this._lastHighlight);
    let rect1 = this.get_iter_location(this._iterAtOffset(highlight.start)),
        rect2 = this.get_iter_location(this._iterAtOffset(highlight.end));
    let visible = [this.vadjustment.value, this.vadjustment.value + this.vadjustment.page_size];
    if (!Utils.includes(rect1.y, visible[0], visible[1]) ||
        !Utils.includes(rect1.y + rect1.height, visible[0], visible[1]) ||
        !Utils.includes(rect2.y, visible[0], visible[1]) ||
        !Utils.includes(rect2.y + rect2.height, visible[0], visible[1]))
      this.vadjustment.value = (rect1.y + rect2.y) / 2 - this.vadjustment.page_increment / 2;
  },

  _emitSignalOnSelection: function(signal) {
    let [, start_iter, end_iter] = this.buffer.get_selection_bounds();
    let startOffset = start_iter.get_offset(),
        endOffset = end_iter.get_offset();
    if (startOffset != endOffset)
      this.emit(signal, startOffset, endOffset);
  },

  getOffsetAtLocation: function(x, y) {
    x += this.get_hadjustment().get_value();
    y += this.get_vadjustment().get_value();
    let iter = this.get_iter_at_location(x, y);

    return iter.get_offset();
  },
  getRectForRange: function(start, stop) {
    let start_iter = this.buffer.get_iter_at_offset(start);
    let end_iter = this.buffer.get_iter_at_offset(stop);

    let rect1 = this.get_iter_location(start_iter),
        rect2 = this.get_iter_location(end_iter);
    rect1 = rect1.union(rect2);
    // GtkSourceView WTF?
    rect1.x += this.buffer_to_window_coords(Gtk.TextWindowType.WIDGET, 0, 0)[0] - 4;
    rect1.x -= this.hadjustment.value;
    rect1.y -= this.vadjustment.value;
    return rect1;
  },

  _getRange: function(name) {
    return this._tagsOffsets[name];
  },
  _iterAtOffset: function(offset) {
    return this.buffer.get_iter_at_offset(offset);
  },
  _highlightRange: function(name, start, end) {
    this._tagsOffsets[name] = { start: start, end: end };
    this.buffer.apply_tag_by_name(name,
                                  this._iterAtOffset(start),
                                  this._iterAtOffset(end));
  },
  _unhighlightRange: function(name, start, end) {
    this.buffer.remove_tag_by_name(name,
                                   this._iterAtOffset(start),
                                   this._iterAtOffset(end));
  },
  hightlightRange: function(name, start, end) {
    let highlight = this._getRange(name);
    this._unhighlightRange(name, highlight.start, highlight.end);
    this._highlightRange(name, start, end);
    this._lastHighlight = name;
    if (this.following_highlight)
      this._scrollToHighlight();
  },
  removeHighlightRange: function(name) {
    let highlight = this._getRange(name);
    this._unhighlightRange(name, highlight.start, highlight.end);
    highlight.start = highlight.end = 0;
  },
  removeAllHighlight: function() {
    for (let i in this._colors)
      this.removeHighlightRange(i);
  },
  removeSelection: function() {
    let iter = this.buffer.get_iter_at_offset(0);
    this.buffer.select_range(iter, iter);
  },

  getData: function() {
    return this.buffer.get_text(this.buffer.get_start_iter(),
                                this.buffer.get_end_iter(),
                                true);
  },
  setData: function(data) {
    if (!(typeof data === 'string'))
      throw new Error('Cannot display an object other than a string');
    this._data = data;
    this.removeAllHighlight();
    this.buffer.set_text(data, -1);
  },
});
