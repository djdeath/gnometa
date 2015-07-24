const Lang = imports.lang;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

const SplitView = new Lang.Class({
  Name: 'SplitView',
  Extends: Gtk.Fixed,

  _init: function(args) {
    this.parent(args);
    this._children = [];
    this._allocations = [];
    this._inResize = false;
    this.visible = true;
  },

  vfunc_get_preferred_height: function() {
    let [min, nat] = this.parent();
    return [0, nat];
  },
  vfunc_get_preferred_width: function() {
    let [min, nat] = this.parent();
    return [0, nat];
  },

  vfunc_size_allocate: function(alloc) {
    this.set_allocation(alloc);

    if (this.get_has_window())
      if (this.get_realized())
        this.get_window().move_resize(alloc.x, alloc.y, alloc.width, alloc.height);

    let visibles = 0;
    this._children.forEach(function(child) { visibles += child.visible ? 1 : 0; });
    let allocation = { x: alloc.x,
                       y: alloc.y,
                       width: alloc.width - (visibles - 1) * 10,
                       height: alloc.height, };
    let lastX = allocation.x;
    for (let i = 0; i < this._children.length; i++) {
      let child = this._children[i];
      if (!child.visible)
        continue;
      alloc.x = lastX;
      alloc.y = allocation.y;
      alloc.width = //child.__splitView * allocation.width;
      (1.0 / visibles) * allocation.width;
      alloc.height = allocation.height;
      child.size_allocate(alloc);
      lastX = alloc.x + alloc.width;
    }
  },

  addWidget: function(widget) {
    let ratio = 1 / (this._children.length + 1);
    widget.__splitView = ratio;
    for (let i = 0; i < this._children.length; i++)
      this._children[i].__splitView -= ratio / this._children.length;
    this._children.push(widget);
    widget.show();
    this.add(widget);
  },
  removeLastWidget: function() {
    if (this._children.length == 0) return;
    let child = this._children[this._children.length - 1];
    this._children.pop();
    for (let i = 0; i < this._children.length; i++)
      this._children[i].__splitView += child.__splitView / this._children.length;
    this.remove(child);
    this.queue_resize();
  },
  nbWidgets: function() { return this._children.length; },

  growFocusedChild: function(value) {
    if (this._children.length < 2) return;
    let child = this.get_focus_child();
    let ratio = value / this.get_allocation().width;
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] != child)
        this._children[i].__splitView -= ratio / (this._children.length - 1);
    }
    child.__splitView += ratio;
    this.queue_resize();
  },
  shrinkFocusedChild: function(value) {
    if (this._children.length < 2) return;
    let child = this.get_focus_child();
    let ratio = value / this.get_allocation().width;
    for (let i = 0; i < this._children.length; i++) {
      if (this._children[i] != child)
        this._children[i].__splitView += ratio / (this._children.length - 1);
    }
    child.__splitView -= ratio;
    this.queue_resize();
  },
});
