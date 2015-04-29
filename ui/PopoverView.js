const Lang = imports.lang;
const Mainloop = imports.mainloop;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;
const GtkSource = imports.gi.GtkSource;

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

  setData: function(filename, data, startOffset, endOffset) {
    this._filename_label.set_label(filename);
    this._sourceview.buffer.set_text(data, -1);

    let buffer = this._sourceview.buffer;
    let start_iter, end_iter;
    if (this._highlight) {
      start_iter = buffer.get_iter_at_offset(this._highlight.startOffset);
      end_iter = buffer.get_iter_at_offset(this._highlight.endOffset);
      buffer.remove_tag_by_name('highlight', start_iter, end_iter);
    }
    start_iter = buffer.get_iter_at_offset(startOffset);
    end_iter = buffer.get_iter_at_offset(endOffset);
    buffer.apply_tag_by_name('highlight', start_iter, end_iter);
    this._highlight = {
      startOffset: startOffset,
      endOffset: endOffset,
    };

    // let rect = this._sourceview.get_iter_location(start_iter);
    // let adj = this._sourceview.vadjustment;
    // log('val=' + this._sourceview.vadjustment.value
    //     + ' lower=' + this._sourceview.vadjustment.lower
    //     + ' upper=' + this._sourceview.vadjustment.upper);
    // this._sourceview.vadjustment.value = rect.x;
    buffer.delete_mark_by_name('highlight');
    this._markToScrollAt = buffer.create_mark('highlight', start_iter, false);
  },

  _plusPressed: function() {
    this.emit('rule-move', 1);
  },
  _minusPressed: function() {
    this.emit('rule-move', -1);
  },
  _sizeAllocated: function() {
    if (this._markToScrollAt)
      this._sourceview.scroll_to_mark(this._markToScrollAt, 0, true, 0.1, 0.5);
    return false;
  },
});
