const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

const ArrayView = imports.ArrayView;
const SplitView = imports.SplitView;
const TextView = imports.TextView;
const OMeta = imports.standalone;
const Structure = imports.StructureMapper;

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
let _inControl = { value: false, callbacks: [], };
let setInControl = function(value) { _inControl.value = value; _inControl.callbacks.forEach(function(c) { c.call(_inControl.value); }); };
let getInControl = function() { return _inControl.value; };
let onInControlChanged = function(callback) { _inControl.callbacks.push(callback); };

//
Gtk.init(null, null);

let paned = new SplitView.SplitView();

let scrolled = new Gtk.ScrolledWindow();
let textview = new TextView.TextView();
scrolled.add(textview.getWidget());
paned.addWidget(scrolled);

let popover = new Gtk.Popover({
  position: Gtk.PositionType.BOTTOM,
  relative_to: textview.getWidget(),
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


scrolled = new Gtk.ScrolledWindow();
let structview = new ArrayView.ArrayView();
structview.setDataController(// {
//   getModel: function() {
//     return [{ type: GObject.TYPE_STRING, renderer: 'text' },
//             { type: GObject.TYPE_INT, renderer: 'text' },
//             { type: GObject.TYPE_INT, renderer: 'text' } ];
//   },
//   render: function(parent, data) {
//     let iter = this.insertBefore(parent, null);
//     this.set(iter, data, [data.id >= 0 ? ometaLabel(data.id) : "",
//                           data.start.idx, data.stop.idx]);
//     for (let i = 0; i < data.children.length; i++)
//       this.render(iter, data.children[i]);
//   },
// }
  {
    getModel: function() {
      return [{ type: GObject.TYPE_STRING, renderer: 'text' }];
    },
    render: function(parent, data) {
      if (typeof data != 'object') {
        let iter = this.insertBefore(parent, null);
        this.set(iter, data, ['' + data]);
        return;
      }
      for (let i = 0; i < data.length; i++) {
        let iter = this.insertBefore(parent, null);
        if (typeof data != 'object')
          this.set(iter, data, ['' + data]);
        else
          this.render(iter, data[i]);
      }
    },
  });

scrolled.add(structview.getWidget());
paned.addWidget(scrolled);

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

textview.getWidget().connect('motion-notify-event', function(widget, event) {
  if ((event.get_state()[1] & Gdk.ModifierType.CONTROL_MASK) == 0)
    return false;
  if (!_structure)
    return false;

  let [, x, y] = event.get_coords();
  let offset = textview.getOffsetAtLocation(x, y),
      matches = getMatchStructure(offset),
      [idx, match] = bestStructureMatch(matches);
  textview.hightlightRange(match.start.idx, match.stop.idx);
  //log('offset=' + offset + ' match=' + match.title + ' range=' + match.start + ',' + match.stop);

  return false;
}.bind(this));

let positionPopover = function(popover, parent, x, y) {
  let allocation = parent.get_allocation();
  let rect = popover.pointing_to;
  rect.x = x + allocation.x - parent.hadjustment.value;
  rect.y = y + allocation.y - parent.vadjustment.value;
  popover.pointing_to = rect;
};

onInControlChanged(function(value) { if (!value && !popover.visible) textview.hightlightRange(0, 0); });
popover.connect('hide', function() { textview.hightlightRange(0, 0); });
textview.getWidget().connect('button-release-event', function(widget, event) {
  if (!getInControl())
    return false;
  if (!_structure)
    return false;

  let [, x, y] = event.get_coords();
  let offset = textview.getOffsetAtLocation(x, y),
      matches = getMatchStructure(offset),
      [idx, match] = bestStructureMatch(matches);
  textview.hightlightRange(match.start.idx, match.stop.idx);

  let rect = textview.getRectForRange(match.start.idx, match.stop.idx);
  positionPopover(popover, widget,
                  rect.x + rect.width / 2,
                  rect.y + rect.height);
  popoverview.setData(matches);
  popover.show_all();

  structview.setData(match.value);
  structview.showAll();

  return true;
}.bind(this));
textview.getWidget().connect('button-release-event', function(widget, event) {
  if (!getInControl())
    popover.hide();
  return false;
}.bind(this));

//
popoverview.onChange(function(value) {
  textview.hightlightRange(value.start.idx, value.stop.idx);

  structview.setData(value.value);
  structview.showAll();
});

//
// structview.onChange(function(value) {
//   textview.hightlightRange(value.start.idx, value.stop.idx);
// }.bind(this));
// popoverview.onChange(function(value) {
//   textview.hightlightRange(value.start.idx, value.stop.idx);
// }.bind(this));


//
let source = loadFile(ARGV[0]);
textview.setData(source);

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));
const OutputView = imports.OutputView;

//
let builder = Gtk.Builder.new_from_resource('/org/gnome/Gnometa/ui.ui');
let widget = function(name) { return builder.get_object(name); };

let win = widget('main-window');
win.set_titlebar(widget('titlebar'));
widget('close-button').connect('clicked', (function() { win.hide(); popover.hide(); Gtk.main_quit(); }).bind(this));
win.connect('key-press-event', function(widget, event) {
  let keyval = event.get_keyval()[1];
  switch (keyval) {
  case Gdk.KEY_Control_L: setInControl(true); break;
  case Gdk.KEY_F5: paned.removeLastWidget(); break;
  case Gdk.KEY_F6: paned.addWidget(new OutputView.OutputView()); break;
  case Gdk.KEY_F7: paned.shrinkFocusedChild(10); break;
  case Gdk.KEY_F8: paned.growFocusedChild(10); break;
  }
  return false;
});
win.connect('key-release-event', function(widget, event) {
  let keyval = event.get_keyval()[1];
  switch (keyval) {
  case Gdk.KEY_Control_L: setInControl(false); break;
  }
  return false;
});

win.resize(800, 400);
win.add(paned);
win.show_all();

Gtk.main();
