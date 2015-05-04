const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

const TextView = new Lang.Class({
  Name: 'TextView',
  Extends: GtkSource.View,
  Signals: {
    'alternate-menu': { param_types: [ GObject.TYPE_ULONG, GObject.TYPE_ULONG ] },
    'clicked': { param_types: [ GObject.TYPE_ULONG ] },
    'control-started': {},
    'control-stopped': {},
    'offset-changed': { param_types: [ GObject.TYPE_ULONG ] },
    'selection-changed': { param_types: [ GObject.TYPE_ULONG, GObject.TYPE_ULONG ] },
  },

  _init: function() {
    this.parent();
    this.visible = true;
    this.show_line_numbers = true;
    this.following_highlight = false;

    let lang_manager = GtkSource.LanguageManager.get_default();
    this.buffer.set_language(lang_manager.get_language('js'));

    let tag_table = this.buffer.get_tag_table();
    let tag = new Gtk.TextTag({
      name: 'highlight',
      background: 'lightblue',
    });
    tag_table.add(tag);

    this._setInControl(false);

    this.connect('key-press-event', this._keyPressed.bind(this));
    this.connect('key-release-event', this._keyReleased.bind(this));
    this.connect('button-release-event', this._buttonReleased.bind(this));
    this.connect('motion-notify-event', this._motionNotified.bind(this));
    this.connect('size-allocate', this._sizeAllocated.bind(this));
  },

  _setInControl: function(value) {
    this._inControl = value;
    if (value) this.emit('control-started'); else this.emit('control-stopped');
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
    case Gdk.KEY_Shift_L: case Gdk.KEY_Shift_R: this._emitSignalOnMenu('alternate-menu'); break;
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
    let rect1 = this.get_iter_location(this._iterAtOffset(this._highlight.start)),
        rect2 = this.get_iter_location(this._iterAtOffset(this._highlight.end));
    this.vadjustment.value =
      (rect1.y + rect2.y) / 2 - this.vadjustment.page_increment / 2;
  },

  _emitSignalOnSelection: function(signal) {
    let [, start_iter, end_iter] = this.buffer.get_selection_bounds();
    let startOffset = start_iter.get_offset(),
        endOffset = end_iter.get_offset();
    if (startOffset != endOffset)
      this.emit(signal, startOffset, endOffset);
  },

  _emitSignalOnMenu: function(signal) {
    this.emit(signal, this._highlight.start, this._highlight.end);
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

  _iterAtOffset: function(offset) {
    return this.buffer.get_iter_at_offset(offset);
  },
  _highlightRange: function(start, end) {
    this.buffer.apply_tag_by_name('highlight',
                                  this._iterAtOffset(start),
                                  this._iterAtOffset(end));
  },
  _unhighlightRange: function(start, end) {
    this.buffer.remove_tag_by_name('highlight',
                                   this._iterAtOffset(start),
                                   this._iterAtOffset(end));
  },
  hightlightRange: function(start, end) {
    if (this._highlight)
      this._unhighlightRange(this._highlight.start, this._highlight.end);
    this._highlight = {
      start: start,
      end: end,
    };
    this._highlightRange(this._highlight.start, this._highlight.end);
    if (this.following_highlight)
      this._scrollToHighlight();
  },
  removeSelection: function() {
    let iter = this.buffer.get_iter_at_offset(0);
    this.buffer.select_range(iter, iter);
  },

  setData: function(data) {
    if (!(typeof data === 'string'))
      throw new Error('Cannot display an object other than a string');
    this._data = data;
    this.buffer.set_text(data, -1);
  },

  onChange: function(callback) {
    this.buffer.connect('changed', function() {
      callback(this.buffer.get_text(this.buffer.get_start_iter(),
                                    this.buffer.get_end_iter(),
                                    true));
    }.bind(this));
  },
});
