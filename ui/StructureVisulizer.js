const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));

const AsyncContinuous = imports.AsyncContinuous;
const CompilerView = imports.CompilerView;
const FileSaver = imports.FileSaver;
const InputView = imports.InputView;
const MatchTreeView = imports.MatchTreeView;
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
    name: 'entry-point',
    shortName: 'e',
    requireArgument: true,
    defaultValue: null,
    help: 'Entry point for the compiler to use (Grammar.Rule)',
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

let repositionPanedAt = function(paned, ratio, param) {
  if (paned.position == 0) {
    let alloc = paned.get_allocation();
    if (alloc.width == alloc.height == 1)
      alloc = paned.get_parent().get_allocation();
    paned.position = alloc[param] * ratio;
  }
};

let start = function() {
  let config = Options.parseArguments(CmdOptions, ARGV);

  if (config.options.help) {
    Options.printHelp('gnometa', CmdOptions);
    return -1;
  }

  if (config.options.compiler && !config.options['entry-point']) {
    print('Cannot use custom compiler without an entry point');
    return -1;
  }

  UiHelper.start();

  // Source mapping
  let OMetaMap = null;

  let ometaFile = function(id) {
    if (id < 0) return null;
    let sitem = OMetaMap.map[id];
    let filename = OMetaMap.filenames[sitem[0]];
    return config.options.compiler ? filename : ('../' + filename);
  };

  let ometaRange = function(id) {
    if (id < 0) return [0, 0];
    let sitem = OMetaMap.map[id];
    return [sitem[1], sitem[2]];
  };

  let ometaText = function(id) {
    if (id < 0) return '';
    let range = ometaRange(id);
    return Utils.loadFile(ometaFile(id)).slice(range[0], range[1]);
  };

  let source = '';
  if (config.options.input)
      source = Utils.loadFile(config.options.input);
  let compiler = config.options.compiler ? config.options.compiler : '../bs-ometa-compiler.ometa';
  let compilerName = config.options.compiler ? 'view0' : 'OMeta';
  let compilerRule = config.options.compiler ? config.options['entry-point'].split('.')[1] : 'topLevel';

  // Structure tree
  let _structureTreeIdx = -1;

  //
  Gtk.init(null, null);

  //
  let builder = Gtk.Builder.new_from_resource('/org/gnome/Gnometa/ui.ui');
  let widget = function(name) { return builder.get_object(name); };

  let paned = new SplitView.SplitView();
  widget('main-paned').remove(widget('main-paned').get_child1());
  widget('main-paned').add1(paned);

  let textview = new InputView.InputView({ name: 'view0', language: 'js' });
  paned.addWidget(textview);

  let matchtreeview = new MatchTreeView.MatchTreeView();
  widget('compiler-paned').add1(matchtreeview);

  let compilerview = new CompilerView.CompilerView({ compiler: compiler });
  widget('compiler-paned').add2(compilerview);

  let structview = new OutputView.OutputView({ name: 'view1' });
  paned.addWidget(structview);

  //
  // let compilerArgs = function(highlightId, hintId) {
  //   let ret = [ometaFile(highlightId),
  //              Utils.loadFile(ometaFile(highlightId))].concat(ometaRange(highlightId));
  //   if (hintId && ret[0] === ometaFile(hintId))
  //     return ret.concat(ometaRange(hintId));
  //   return ret.concat([0, 0]);
  // };
  let compilerArgs = function(highlightId, hintId) {
    let ret = [compiler, Utils.loadFile(compiler)];
    if (ometaFile(highlightId) == compiler)
      ret = ret.concat(ometaRange(highlightId));
    else
      ret = ret.concat([0, 0]);
    if (hintId && ret[0] === ometaFile(hintId))
      ret = ret.concat(ometaRange(hintId));
    else
      ret = ret.concat([0, 0]);
    return ret;
  };

  let inputText = function(from, to) {
    return textview.getData().slice(from, to);
  };

  // Translation
  let translate = AsyncContinuous.createContinuous(function(ac, text) {
    UiHelper.commands.translate(compilerName, text, compilerRule, 'view0', function(error, ret) {

      matchtreeview.setData(null, null);
      compilerview.setData(compiler, Utils.loadFile(compiler), 0, 0, 0, 0);

      textview.setError(error)
      textview.removeAllHighlight();
      if (error) {
        textview.hightlightRange('error', error.idx, text.length - 1);
        ac.done();
        return;
      }
      if (config.options.input) FileSaver.delayedSaveFile(config.options.input, text);
      ac.done();
    }.bind(this));
  });
  let getBestMatch = function(offset) {
    UiHelper.commands.matchStructure('view0', offset, offset, 'view0', function(error, ret) {
      if (error) return Utils.printError(error);
      UiHelper.commands.getBestMatch('view0', function(error, ret) {
        if (error) return Utils.printError(error);
        let  [idx, match] = ret;
        _structureTreeIdx = idx;
        textview.hightlightRange('highlight', match.start, match.stop);
        compilerview.setData.apply(compilerview, compilerArgs(match.id));
        structview.setData(match.value);
      }.bind(this));
    }.bind(this));
    UiHelper.commands.getStructure('view0', offset, offset, function(error, ret) {
      if (error) return Utils.printError(error);
      matchtreeview.setData(ret, ometaText, inputText);
    }.bind(this));
  };
  let selectionChanged = function(startOffset, endOffset) {
    UiHelper.commands.matchStructure('view0', startOffset, endOffset, 'view0', function(error, ret) {
      textview.removeSelection();
      if (error) return Utils.printError(error);
      _structureTreeIdx = 0;
      UiHelper.commands.getMatch('view0', _structureTreeIdx, function(error, ret) {
        if (error) return Utils.printError(error);
        let [idx, match] = ret;
        _structureTreeIdx = idx;
        textview.hightlightRange('highlight', match.start, match.stop);
        compilerview.setData.apply(compilerview, compilerArgs(match.id));
        structview.setData(match.value);
      }.bind(this));
    }.bind(this));
    UiHelper.commands.getStructure('view0', startOffset, endOffset, function(error, ret) {
      if (error) return Utils.printError(error);
      matchtreeview.setData(ret, ometaText, inputText);
    }.bind(this));
  };
  let alternateMenu = function() {
    compilerview.get_parent().show();
    repositionPanedAt(compilerview.get_parent().get_parent(), 2.0 / 3, 'height');
    repositionPanedAt(compilerview.get_parent(), 1.0 / 2, 'width');
  };

  //
  textview.setData(source);

  textview.connect('changed', function(wid, text) {
    translate.run(text);
  }.bind(this));

  textview.connect('offset-changed', function(wid, offset) {
    getBestMatch(offset);
  }.bind(this));
  textview.connect('selection-changed', function(wid, startOffset, endOffset) {
    selectionChanged(startOffset, endOffset);
  });

  //
  matchtreeview.onHover(function(structure) {
    textview.removeSelection();
    textview.hightlightRange('highlight', structure.start, structure.stop);
    compilerview.setData.apply(compilerview, compilerArgs(structure.id,
                                                          structure.call));
    structview.setData(structure.value);
  });
  matchtreeview.onClick(function(structure) {
    textview.removeSelection();
    textview.hightlightRange('highlight', structure.start, structure.stop);
    if (structure.call)
      compilerview
    compilerview.setData.apply(compilerview, compilerArgs(structure.id,
                                                          structure.call));
    structview.setData(structure.value);
    matchtreeview.setData(structure, ometaText, inputText);
  });

  //
  let rebuildCompiler = AsyncContinuous.createContinuous(function(ac, text) {
    textview.setBusy(true);
    let finish = function(error) {
      textview.setBusy(false);
      if (error)
        textview.setError(error);
      else if (compiler)
        FileSaver.delayedSaveFile(compiler, text);
      ac.done();
    };
    UiHelper.commands.compile(compilerName, text, function(error, ret) {
      if (error) return finish(error);

      OMetaMap = ret;
      if (config.options.compiler)
        OMetaMap.filenames[OMetaMap.filenames.length - 1] = compiler;
      else {
        // Using OMeta.
        translate.run(textview.getData());
        finish();
        return;
      }

      let entryPoint = config.options['entry-point'].split('.');
      UiHelper.commands.compilerConfigure(compilerName, entryPoint[0], entryPoint[1], function(error, ret) {
        if (error) return finish(error);
        translate.run(textview.getData());
        finish();
      });
    });
  });
  if (config.options.compiler)
    compilerview.connect('changed', function(wid, text) { rebuildCompiler.run(text); });

  {
    let input = Utils.loadFile(compiler);
    compilerview.setData(compiler, input, 0, 0, 0, 0);
    rebuildCompiler.run(input);
  }

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
    case Gdk.KEY_Escape: compilerview.get_parent().hide(); break;
    case Gdk.KEY_Alt_L: alternateMenu(); break;
    }
    return false;
  }.bind(this));
  win.resize(800, 600);
  win.show();

  Gtk.main();

  FileSaver.saveFiles();
};

start();
