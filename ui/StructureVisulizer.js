const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));

const ArrayView = imports.ArrayView;
const OutputView = imports.OutputView;
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
  return ometaCode(OMetaMap.filenames[sitem[0]], sitem[1], sitem[2]);
};

// Structure searching
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

let bestStructureMatch = function(matches) {
  for (let i = 0; i < matches.length; i++)
    if (matches[i].stop.idx - matches[i].start.idx >= 2)
      return [i, matches[i]];
  return [matches.length - 1, matches[matches.length - 1]];
};

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
popover.set_size_request(350, 200);
scrolled = new Gtk.ScrolledWindow();
let popoverview = new ArrayView.ArrayView();
popoverview.setDataController({
  getModel: function() {
    return [{ type: GObject.TYPE_STRING, renderer: 'text' }];
  },
  render: function(parent, data) {
    for (let i = 0; i < data.length; i++) {
      let item = data[i];
      if (item.id >= 0) {
        let iter = this.insertBefore(parent, null);
        this.set(iter, item, [ometaLabel(item.id)]);
      }
    }
  },
});
scrolled.add(popoverview.getWidget());
popover.add(scrolled);

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
  let matches = getMatchStructure(offset),
      [idx, match] = bestStructureMatch(matches);
  textview.hightlightRange(match.start.idx, match.stop.idx);
  structview.setData(match.value);
}.bind(this));

let positionPopover = function(popover, parent, x, y) {
  let allocation = parent.get_allocation();
  let rect = popover.pointing_to;
  rect.x = x;
  rect.y = y;
  popover.pointing_to = rect;
};

textview.connect('clicked', function(widget, offset, point) {
  if (!_structure)
    return false;

  let matches = getMatchStructure(offset),
      [idx, match] = bestStructureMatch(matches);
  textview.hightlightRange(match.start.idx, match.stop.idx);

  let rect = textview.getRectForRange(match.start.idx, match.stop.idx);
  positionPopover(popover, widget,
                  rect.x + rect.width / 2,
                  rect.y + rect.height);
  popoverview.setData(matches);
  popover.show_all();

  structview.setData(match.value);
  //structview.showAll();
}.bind(this));
textview.connect('control-stopped', function() { if (!popover.visible) textview.hightlightRange(0, 0); });
popover.connect('hide', function() { textview.hightlightRange(0, 0); });

//
popoverview.onChange(function(value) {
  textview.hightlightRange(value.start.idx, value.stop.idx);

  structview.setData(value.value);
});

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
