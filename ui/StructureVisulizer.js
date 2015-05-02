const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));

const ArrayView = imports.ArrayView;
const OutputView = imports.OutputView;
const PopoverView = imports.PopoverView;
const SplitView = imports.SplitView;
const TextView = imports.TextView;
const OMeta = imports.standalone;

//
let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

// Source mapping
const OMetaMap = JSON.parse(loadFile('standalone.js.map'));

let _ometaFiles = {};
let ometaCode = function(filename, start, stop) {
  if (!_ometaFiles[filename]) {
    _ometaFiles[filename] = loadFile('../' + filename);
  }
  return _ometaFiles[filename].slice(start, stop).trim();
};

let ometaLabel = function(id) {
  let sitem = OMetaMap.map[id];
  let filename = OMetaMap.filenames[sitem[0]];
  return [filename, loadFile('../' + filename), sitem[1], sitem[2]];
};

// Structure searching
let _structure = null;
let findMatchingStructureChild = function(parent, startOffset, endOffset) {
  for (let i = 0; i < parent.children.length; i++) {
    let child = parent.children[i];
    if (child.start.idx <= startOffset && child.stop.idx >= endOffset)
      return child;
  }
  return null;
};
let getMatchStructure = function(startOffset, endOffset) {
  let matches = [], child = _structure;
  let iter = 0;
  do {
    matches.unshift(child);
    child = findMatchingStructureChild(child, startOffset, endOffset);
    iter++;
  } while (child);
  return matches;
};

let bestStructureMatch = function(matches) {
  for (let i = 0; i < matches.length; i++)
    if (matches[i].stop.idx - matches[i].start.idx >= 2)
      return [i, matches[i]];
  return [matches.length - 1, matches[matches.length - 1]];
};
let bestNamedStructureMatch = function(matches) {
  for (let i = 0; i < matches.length; i++)
    if (matches[i].id != -1 &&
        (matches[i].stop.idx - matches[i].start.idx) >= 2)
      return [i, matches[i]];
  return [matches.length - 1, matches[matches.length - 1]];
};

// Structure tree
let _structureTree = null;
let _structureTreeIdx = -1;

//
Gtk.init(null, null);

let paned = new SplitView.SplitView();

let scrolled = new Gtk.ScrolledWindow();
let textview = new TextView.TextView();
scrolled.add(textview);
paned.addWidget(scrolled);

let popover = new Gtk.Popover({
  position: Gtk.PositionType.BOTTOM,
  relative_to: textview,
});
popover.set_size_request(400, 400);
let popoverview = new PopoverView.PopoverView();
popover.add(popoverview);
popoverview.connect('rule-move', function(widget, way) {
  let i = _structureTreeIdx + way;
  while (i >= 0 && i < _structureTree.length && _structureTree[i].id == -1) i += way;
  if (i < 0 || i >= _structureTree.length || _structureTree[_structureTreeIdx].id == -1) return;
  _structureTreeIdx = i;
  let match = _structureTree[_structureTreeIdx];
  popoverview.setData.apply(popoverview, ometaLabel(match.id));
  textview.hightlightRange(match.start.idx, match.stop.idx);
}.bind(this));

let structview = new OutputView.OutputView();
paned.addWidget(structview);

//
textview.onChange(function(text) {
  OMeta.BSOMetaJSParser.matchAll(text, "topLevel", undefined, function(err, tree, value) {
    if (err) {
      log('Parsing: ' + err);
      return;
    }

    _structure = tree;
    //structview.setData(value);
  });
}.bind(this));

textview.connect('offset-changed', function(widget, offset) {
  _structureTree = getMatchStructure(offset, offset);
  let  [idx, match] = bestNamedStructureMatch(_structureTree);
  textview.hightlightRange(match.start.idx, match.stop.idx);
  structview.setData(match.value);
}.bind(this));
textview.connect('selection-changed', function(widget, startOffset, endOffset) {
  _structureTree = getMatchStructure(startOffset, endOffset);
  _structureTreeIdx = 0;
  let match = _structureTree[_structureTreeIdx];
  textview.removeSelection();
  textview.hightlightRange(match.start.idx, match.stop.idx);
  structview.setData(match.value);
});

let positionPopover = function(popover, parent, x, y) {
  let allocation = parent.get_allocation();
  let rect = popover.pointing_to;
  rect.x = x;
  rect.y = y;
  popover.pointing_to = rect;
};

textview.connect('alternate-menu', function(widget, startOffset, endOffset) {
  if (!_structure)
    return false;

  _structureTree = getMatchStructure(startOffset, endOffset);
  let [idx, match] = bestNamedStructureMatch(_structureTree);
  _structureTreeIdx = idx;
  textview.hightlightRange(match.start.idx, match.stop.idx);

  let rect = textview.getRectForRange(match.start.idx, match.stop.idx);
  positionPopover(popover, widget,
                  rect.x + rect.width / 2,
                  rect.y + rect.height);
  popoverview.setData.apply(popoverview, ometaLabel(match.id));
  popover.show();
  structview.setData(match.value);
}.bind(this));

//
let source = loadFile(ARGV[0]);
textview.setData(source);

//
let builder = Gtk.Builder.new_from_resource('/org/gnome/Gnometa/ui.ui');
let widget = function(name) { return builder.get_object(name); };

let win = widget('main-window');
win.set_titlebar(widget('titlebar'));
widget('close-button').connect('clicked', (function() { win.hide(); popover.hide(); Gtk.main_quit(); }).bind(this));
win.connect('key-press-event', function(widget, event) {
  let keyval = event.get_keyval()[1];
  switch (keyval) {
  case Gdk.KEY_F5: paned.removeLastWidget(); break;
  case Gdk.KEY_F6: paned.addWidget(new OutputView.OutputView()); break;
  case Gdk.KEY_F7: paned.shrinkFocusedChild(10); break;
  case Gdk.KEY_F8: paned.growFocusedChild(10); break;
  }
  return false;
});

win.resize(800, 400);
win.add(paned);
win.show();

Gtk.main();
