const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));

const AsyncContinuous = imports.AsyncContinuous;
const CompilerView = imports.CompilerView;
const InputView = imports.InputView;
const OutputView = imports.OutputView;
const SplitView = imports.SplitView;
const TextView = imports.TextView;
const Options = imports.options;
const UiHelper = imports.UiHelperClient;
const Utils = imports.Utils;

// Options:
const CmdOptions = [
  {
    name: 'compiler',
    shortName: 'c',
    requireArgument: true,
    defaultValue: null,
    help: 'Compiler to use',
  },
  {
    name: 'input',
    shortName: 'i',
    requireArgument: true,
    defaultValue: null,
    help: 'Input to give to the compiler',
  },
  {
    name: 'help',
    shortName: 'h',
    requireArgument: false,
    defaultValue: false,
    help: 'Print this screen',
  }
];

let repositionPanedAt = function(paned, ratio) {
  if (paned.position == 0)
    paned.position = paned.get_allocation().height * ratio;
};

let start = function() {
  let config = Options.parseArguments(CmdOptions, ARGV);

  if (config.options.help) {
    Options.printHelp('gnometa', CmdOptions);
    return -1;
  }

  UiHelper.start();

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

  // Structure tree
  let _structureTreeIdx = -1;

  //
  Gtk.init(null, null);

  //
  let builder = Gtk.Builder.new_from_resource('/org/gnome/Gnometa/ui.ui');
  let widget = function(name) { return builder.get_object(name); };

  let paned = new SplitView.SplitView();
  widget('main-paned').add1(paned);

  let textview = new InputView.InputView({ name: 'view0' });
  paned.addWidget(textview);

  let compilerview = new CompilerView.CompilerView();
  compilerview.hide();
  widget('main-paned').add2(compilerview);

  let structview = new OutputView.OutputView({ name: 'view1' });
  paned.addWidget(structview);

  // Translation
  let translate = AsyncContinuous.createContinuous(function(ac, text) {
    let data = { name: 'OMeta',
                 rule: 'topLevel',
                 input: text,
                 output: 'view0', };
    UiHelper.executeCommand('translate', data, function(error, ret) {
      if (error) {
        textview.hightlightRange('error', error.idx, text.length - 1);
        ac.done();
        return;
      }
      textview.removeHighlightRange('error');
      ac.done();
    }.bind(this));
  });
  let getBestMatch = function(offset) {
    let data = { input: 'view0', output: 'view0',
                 offset: { start: offset, end: offset }, };
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
        compilerview.setData.apply(compilerview, ometaLabel(match.id));
        structview.setData(match.value);
      }.bind(this));
    }.bind(this));
  };
  let selectionChanged = function(startOffset, endOffset) {
    let data = { input: 'view0', output: 'view0',
                 offset: { start: startOffset, end: endOffset }, };
    UiHelper.executeCommand('match-structure', data, function(error, ret) {
      textview.removeSelection();
      if (error) {
        log(error);
        return;
      }
      _structureTreeIdx = 0;
      UiHelper.executeCommand('get-match', { input: 'view0', index: _structureTreeIdx }, function(error, ret) {
        if (error) {
          log(error);
          return;
        }
        let [idx, match] = ret;
        _structureTreeIdx = idx;
        textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
        compilerview.setData.apply(compilerview, ometaLabel(match.id));
        structview.setData(match.value);
      }.bind(this));
    }.bind(this));
  };
  let alternateMenu = function() {
    UiHelper.executeCommand('get-best-match', { input: 'view0' }, function(error, ret) {
      if (error) {
        log(error);
        return;
      }
      let  [idx, match] = ret;
      _structureTreeIdx = idx;
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      compilerview.setData.apply(compilerview, ometaLabel(match.id));
      compilerview.show();
      repositionPanedAt(compilerview.get_parent(), 2.0 / 3);
      structview.setData(match.value);
    }.bind(this));
  };
  let ruleMove = function(way) {
    _structureTreeIdx += way;
    UiHelper.executeCommand('get-match', { input: 'view0', index: _structureTreeIdx }, function(error, ret) {
      if (error) {
        log(error);
        return;
      }
      let [idx, match] = ret;
      _structureTreeIdx = idx;
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      compilerview.setData.apply(compilerview, ometaLabel(match.id));
      textview.hightlightRange('highlight', match.start.idx, match.stop.idx);
      structview.setData(match.value);
    }.bind(this));
  };


  textview.connect('changed', function(wid, text) {
    translate.run(text);
  }.bind(this));

  textview.connect('offset-changed', function(wid, offset) {
    getBestMatch(offset);
  }.bind(this));
  textview.connect('selection-changed', function(wid, startOffset, endOffset) {
    selectionChanged(startOffset, endOffset);
  });

  compilerview.connect('rule-move', function(wid, way) {
    ruleMove(way);
  }.bind(this));

  //
  let source = Utils.loadFile(config.options.input);
  textview.setData(source);

  //
  let win = widget('main-window');
  win.set_titlebar(widget('titlebar'));
  widget('add-button').connect('clicked', function() { paned.addWidget(new OutputView.OutputView({ name: 'view' + paned.nbWidgets() })); }.bind(this));
  widget('remove-button').connect('clicked', function() { paned.removeLastWidget(); }.bind(this));
  widget('close-button').connect('clicked', function() { win.hide(); Gtk.main_quit(); }.bind(this));
  win.connect('key-press-event', function(w, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_F7: paned.shrinkFocusedChild(10); break;
    case Gdk.KEY_F8: paned.growFocusedChild(10); break;
    case Gdk.KEY_Escape: compilerview.hide(); break;
    case Gdk.KEY_Alt_L: alternateMenu(); break;
    }
    return false;
  }.bind(this));
  win.resize(800, 600);
  win.show();

  Gtk.main();
};

start();
