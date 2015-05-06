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
//const UiHelper = imports.UiHelper;
const UiHelper = imports.UiHelperClient;
const Utils = imports.Utils;

// Source mapping
const OMetaMap = JSON.parse(Utils.loadFile('standalone.js.map'));

let _ometaFiles = {};
let ometaCode = function(filename, start, stop) {
  if (!_ometaFiles[filename]) {
    _ometaFiles[filename] = Utils.loadFile('../' + filename);
  }
  return _ometaFiles[filename].slice(start, stop).trim();
};

let ometaLabel = function(id) {
  let sitem = OMetaMap.map[id];
  let filename = OMetaMap.filenames[sitem[0]];
  return [filename, Utils.loadFile('../' + filename), sitem[1], sitem[2]];
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
    for (let i = 0; i < child.ids.length; i++)
      matches.unshift({ id: child.ids[i], start: child.start, stop: child.stop, value: child.value });
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

let structview = new OutputView.OutputView();
paned.addWidget(structview);

//
textview.onChange(function(text) {
  let data = { name: 'OMeta',
               rule: 'topLevel',
               input: text,
               output: 'view0', };
  UiHelper.executeCommand('translate', data, function(error, ret) {
    if (error) {
      textview.hightlightRange('error', error.idx, text.length - 1);
      return;
    }
    textview.removeSelection('error');
  }.bind(this));
}.bind(this));

textview.connect('offset-changed', function(widget, offset) {
  let data = { input: 'view0', output: 'view0', offset: { start: offset, end: offset }, };
  UiHelper.executeCommand('match-structure', data, function(error, ret) {
    if (error) {
      log(error);
      return;
    }
    UiHelper.executeCommand('get-best-match', { input: 'view0' }, function(error, ret) {
      if (error) {
        log(error);
        return;
      }
      let  [idx, match] = ret;
      _structureTreeIdx = idx;
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      structview.setData(match.value);
    }.bind(this));
  }.bind(this));
}.bind(this));
textview.connect('selection-changed', function(widget, startOffset, endOffset) {
  let data = { input: 'view0', output: 'view0', offset: { start: startOffset, end: endOffset }, };
  UiHelper.executeCommand('match-structure', data, function(error, ret) {
    textview.removeSelection();
    if (error) {
      log(error);
      return;
    }
    _structureTreeIdx = 0;
    UiHelper.executeCommand('get-match', { input: 'view0', index: _structureTreeIdx }, function(error, match) {
      if (error) {
        log(error);
        return;
      }
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      structview.setData(match.value);
    }.bind(this));
  }.bind(this));
});

textview.connect('alternate-menu', function(widget, startOffset, endOffset) {
  let data = { input: 'view0', output: 'view0', offset: { start: startOffset, end: endOffset }, };
  UiHelper.executeCommand('match-structure', data, function(error, ret) {
    if (error) {
      log(error);
      return;
    }
    UiHelper.executeCommand('get-best-match', { input: 'view0' }, function(error, ret) {
      if (error) {
        log(error);
        return;
      }
      let  [idx, match] = ret;
      _structureTreeIdx = idx;
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      let rect = textview.getRectForRange(match.start.idx, match.stop.idx);
      popover.pointing_to = rect;
      popoverview.setData.apply(popoverview, ometaLabel(match.id));
      popover.show();
      structview.setData(match.value);
    }.bind(this));
  }.bind(this));
}.bind(this));

popoverview.connect('rule-move', function(widget, way) {
  _structureTreeIdx += way;
  UiHelper.executeCommand('get-match', { input: 'view0', index: _structureTreeIdx }, function(error, match) {
    if (error) {
      log(error);
        return;
    }
    textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
    popoverview.setData.apply(popoverview, ometaLabel(match.id));
    textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
    structview.setData(match.value);
  }.bind(this));
}.bind(this));

//
let source = Utils.loadFile(ARGV[0]);
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
