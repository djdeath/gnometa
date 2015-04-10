const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

const ArrayView = imports.ArrayView;
const TextView = imports.TextView;
const OMeta = imports.standalone;
const Structure = imports.StructureMapper;

//
Gtk.init(null, null);

let paned = new Gtk.Paned();

let scrolled = new Gtk.ScrolledWindow();
let textview = new TextView.TextView();
scrolled.add(textview.getWidget());
paned.add1(scrolled);

let popover = new Gtk.Popover({
  position: Gtk.PositionType.BOTTOM,
  relative_to: textview.getWidget(),
});
popover.set_size_request(150, 200);
scrolled = new Gtk.ScrolledWindow();
let popoverview = new ArrayView.ArrayView();
popoverview.setDataController({
  getModel: function() {
    return [{ type: GObject.TYPE_STRING, renderer: 'text' }];
  },
  render: function(parent, data) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.name != null) {
        let iter = this.insertBefore(parent, null);
        this.set(iter, item, [item.name]);
      }
    }
  },
});
scrolled.add(popoverview.getWidget());
popover.add(scrolled);


scrolled = new Gtk.ScrolledWindow();
let structview = new ArrayView.ArrayView();
structview.setDataController({
  getModel: function() {
    return [{ type: GObject.TYPE_STRING, renderer: 'text' },
            { type: GObject.TYPE_INT, renderer: 'text' },
            { type: GObject.TYPE_INT, renderer: 'text' } ];
  },
  render: function(parent, data) {
    let iter = this.insertBefore(parent, null);
    this.set(iter, data, [data.name != null ? data.name : "", data.start.idx, data.stop.idx]);
    for (let i = 0; i < data.children.length; i++)
      this.render(iter, data.children[i]);
  },
});

scrolled.add(structview.getWidget());
paned.add2(scrolled);

//
let _structure = null;
let findMatchingStructureChild = function(parent, offset) {
  for (let i = 0; i < parent.children.length; i++) {
    let child = parent.children[i];
    if (child.start.idx <= offset && child.stop.idx >= offset)
      return child;
  }
  return null;
};
let getMatchStructure = function(offset) {
  let matches = [], child = _structure;
  let iter = 0;
  do {
    matches.unshift(child);
    child = findMatchingStructureChild(child, offset);
    iter++;
  } while (child);
  return matches;
};

//
textview.onChange(function(text) {
  OMeta.BSOMetaJSParser.matchAll(text, "topLevel", undefined, function(err, tree, value) {
    if (err) {
      log('Parsing: ' + err);
      return;
    }

    _structure = tree;
    structview.setData(_structure);
  });
}.bind(this));

textview.getWidget().connect('motion-notify-event', function(widget, event) {
  if ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) == 0)
    return false;
  if (!_structure)
    return false;

  let [, x, y] = event.get_coords();
  let offset = textview.getOffsetAtLocation(x, y),
      matches = getMatchStructure(offset),
      match = matches[0];
  textview.hightlightRange(match.start.idx, match.stop.idx);
  //log('offset=' + offset + ' match=' + match.title + ' range=' + match.start + ',' + match.stop);

  return false;
}.bind(this));

let positionPopover = function(popover, parent, x, y) {
  let allocation = parent.get_allocation();
  let rect = popover.pointing_to;
  rect.x = x + allocation.x;
  rect.y = y + allocation.y;
  popover.pointing_to = rect;
};

textview.getWidget().connect('button-release-event', function(widget, event) {
  if ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) == 0)
    return false;
  if (!_structure)
    return false;

  let [, x, y] = event.get_coords();
  let offset = textview.getOffsetAtLocation(x, y),
      matches = getMatchStructure(offset),
      match = matches[0];
  textview.hightlightRange(match.start.idx, match.stop.idx);

  let rect = textview.getRectForRange(match.start.idx, match.stop.idx);
  positionPopover(popover, widget,
                  rect.x + rect.width / 2,
                  rect.y + rect.height);
  popoverview.setData(matches);
  popover.show_all();

  return true;
}.bind(this));
textview.getWidget().connect('button-release-event', function(widget, event) {
  if ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) == 0)
    popover.hide();
  return false;
}.bind(this));

//
structview.onChange(function(value) {
  textview.hightlightRange(value.start.idx, value.stop.idx);
}.bind(this));
popoverview.onChange(function(value) {
  textview.hightlightRange(value.start.idx, value.stop.idx);
}.bind(this));



//
let file = Gio.File.new_for_path('./lr.ometajs');
let [, data] = file.load_contents(null);
let source = '' + data;
textview.setData(source);

//
let win = new Gtk.Window();
win.connect('destroy', (function() { Gtk.main_quit(); }).bind(this));

win.resize(800, 400);
paned.position = 800 / 2;
win.add(paned);
win.show_all();

Gtk.main();
