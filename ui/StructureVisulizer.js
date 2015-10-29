const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gdk = imports.gi.Gdk;
const Gtk = imports.gi.Gtk;

Gio.resources_register(Gio.resource_load('org.gnome.Gnometa.gresource'));

const AsyncContinuous = imports.AsyncContinuous;
const FileSaver = imports.FileSaver;
const MatchTreeView = imports.MatchTreeView;
const SplitView = imports.SplitView;
const TreeView = imports.TreeView;
const Translator = imports.Translator;
const Options = imports.options;
const UiHelper = imports.UiHelperClient;
const Utils = imports.Utils;

// Options:
const CmdOptions = [
  {
    name: 'compiler',
    shortName: 'c',
    allowMultiple: true,
    requireArgument: true,
    defaultValue: [],
    help: 'Compiler to use',
  },
  {
    name: 'entry-point',
    shortName: 'e',
    allowMultiple: true,
    requireArgument: true,
    defaultValue: [],
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

  if (config.options.compiler.length != config.options['entry-point'].length) {
    print('Nedd same number of compilers and entry points');
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

  let translators = [];
  let addTranslator = function(compiler, entry_point, input) {
    translators.push(new Translator.Translator({ compiler: compiler,
                                                 entry_point: entry_point,
                                                 input: input }));
    return translators[translators.length - 1];
  };

  for (let i = 0; i < config.options.compiler.length; i++)
    paned.addWidget(addTranslator(config.options.compiler[i],
                                  config.options['entry-point'][i],
                                  i == 0 && config.options.input ? config.options.input : null));
  if (config.options.compiler.length < 1)
    paned.addWidget(addTranslator(null, 'OMeta.topLevel',
                                  config.options.input ? config.options.input : null));
  paned.addWidget(addTranslator(null, '.', null));

  let forwardUpdate = function(parent, child) {
    parent.on('changed', function(ret) {
      child.setData(ret);
    });
  };
  for (let i = 0; i < translators.length - 1; i++) {
    forwardUpdate(translators[i], translators[i + 1]);
  }

  //
  let translatorsTreeview = new TreeView.TreeView({ activate_on_single_click: true,
                                                    hover_selection: true });
  widget('translators-popover').add(translatorsTreeview);
  translatorsTreeview.setDataController({
    getModel: function() {
      return [{ type: GObject.TYPE_BOOLEAN, renderer: 'checkbox' },
              { type: GObject.TYPE_STRING, renderer: 'text' }];
    },
    render: function(parent, data) {
      for (let i = 1; i < translators.length - 1; i++) {
        let iter = this.insertBefore(parent, null);
        this.set(iter,
                 translators[i],
                 [translators[i].visible, translators[i].getName()]);
      }
    },
  });
  translatorsTreeview.on('activated-data', function(translator) {
    translator.visible = !translator.visible;
    translatorsTreeview.setData(null);
  });
  translatorsTreeview.setData(null);

  // //
  // // let compilerArgs = function(highlightId, hintId) {
  // //   let ret = [ometaFile(highlightId),
  // //              Utils.loadFile(ometaFile(highlightId))].concat(ometaRange(highlightId));
  // //   if (hintId && ret[0] === ometaFile(hintId))
  // //     return ret.concat(ometaRange(hintId));
  // //   return ret.concat([0, 0]);
  // // };
  // let compilerArgs = function(highlightId, hintId) {
  //   let ret = [compiler, Utils.loadFile(compiler)];
  //   if (ometaFile(highlightId) == compiler)
  //     ret = ret.concat(ometaRange(highlightId));
  //   else
  //     ret = ret.concat([0, 0]);
  //   if (hintId && ret[0] === ometaFile(hintId))
  //     ret = ret.concat(ometaRange(hintId));
  //   else
  //     ret = ret.concat([0, 0]);
  //   return ret;
  // };

  // let inputText = function(from, to) {
  //   return textview.getData().slice(from, to);
  // };

  // let getBestMatch = function(offset) {
  //   UiHelper.commands.matchStructure('view0', offset, offset, 'view0', function(error, ret) {
  //     if (error) return Utils.printError(error);
  //     UiHelper.commands.getBestMatch('view0', function(error, ret) {
  //       if (error) return Utils.printError(error);
  //       let  [idx, match] = ret;
  //       _structureTreeIdx = idx;
  //       textview.hightlightRange('highlight', match.start, match.stop);
  //       compilerview.setData.apply(compilerview, compilerArgs(match.id));
  //       structview.setData(match.value);
  //     }.bind(this));
  //   }.bind(this));
  //   UiHelper.commands.getStructure('view0', offset, offset, function(error, ret) {
  //     if (error) return Utils.printError(error);
  //     matchtreeview.setData(ret, ometaText, inputText);
  //   }.bind(this));
  // };
  // let selectionChanged = function(startOffset, endOffset) {
  //   UiHelper.commands.matchStructure('view0', startOffset, endOffset, 'view0', function(error, ret) {
  //     textview.removeSelection();
  //     if (error) return Utils.printError(error);
  //     _structureTreeIdx = 0;
  //     UiHelper.commands.getMatch('view0', _structureTreeIdx, function(error, ret) {
  //       if (error) return Utils.printError(error);
  //       let [idx, match] = ret;
  //       _structureTreeIdx = idx;
  //       textview.hightlightRange('highlight', match.start, match.stop);
  //       compilerview.setData.apply(compilerview, compilerArgs(match.id));
  //       structview.setData(match.value);
  //     }.bind(this));
  //   }.bind(this));
  //   UiHelper.commands.getStructure('view0', startOffset, endOffset, function(error, ret) {
  //     if (error) return Utils.printError(error);
  //     matchtreeview.setData(ret, ometaText, inputText);
  //   }.bind(this));
  // };
  let getFocusedTranslator = function() {
    let focus = widget('main-window').get_focus();
    while (focus && focus.get_parent() != paned)
      focus = focus.get_parent();
    return focus;
  };

  let showAlternateMenu = function() {
    let translator = getFocusedTranslator();
    if (!translator)
      return;
    let mainPaned = widget('main-paned');
    if (mainPaned.get_child2())
      mainPaned.remove(mainPaned.get_child2());
    mainPaned.add2(translator.getCompilerView());
    // compilerview.get_parent().show();
    repositionPanedAt(mainPaned, 2.0 / 3, 'height');
    //repositionPanedAt(compilerview.get_parent(), 1.0 / 2, 'width');
  };
  let hideAlternateMenu = function() {
    let mainPaned = widget('main-paned');
    if (mainPaned.get_child2())
      mainPaned.remove(mainPaned.get_child2());
  };

  // //
  // textview.setData(source);

  // textview.connect('changed', function(wid, text) {
  //   translate.run(text);
  // }.bind(this));

  // textview.connect('offset-changed', function(wid, offset) {
  //   getBestMatch(offset);
  // }.bind(this));
  // textview.connect('selection-changed', function(wid, startOffset, endOffset) {
  //   selectionChanged(startOffset, endOffset);
  // });

  // //
  // matchtreeview.onHover(function(structure) {
  //   textview.removeSelection();
  //   textview.hightlightRange('highlight', structure.start, structure.stop);
  //   compilerview.setData.apply(compilerview, compilerArgs(structure.id,
  //                                                         structure.call));
  //   structview.setData(structure.value);
  // });
  // matchtreeview.onClick(function(structure) {
  //   textview.removeSelection();
  //   textview.hightlightRange('highlight', structure.start, structure.stop);
  //   if (structure.call)
  //     compilerview
  //   compilerview.setData.apply(compilerview, compilerArgs(structure.id,
  //                                                         structure.call));
  //   structview.setData(structure.value);
  //   matchtreeview.setData(structure, ometaText, inputText);
  // });

  //
  let win = widget('main-window');
  win.set_titlebar(widget('titlebar'));
  //widget('add-button').connect('clicked', function() { paned.addWidget(new OutputView.OutputView({ name: 'view' + paned.nbWidgets() })); }.bind(this));
  //widget('remove-button').connect('clicked', function() { paned.removeLastWidget(); }.bind(this));
  widget('close-button').connect('clicked', function() { win.hide(); Gtk.main_quit(); }.bind(this));
  win.connect('key-press-event', function(w, event) {
    let keyval = event.get_keyval()[1];
    switch (keyval) {
    case Gdk.KEY_F7: paned.shrinkFocusedChild(10); break;
    case Gdk.KEY_F8: paned.growFocusedChild(10); break;
    case Gdk.KEY_Escape: hideAlternateMenu(); break;
    case Gdk.KEY_Alt_L: showAlternateMenu(); break;
    }
    return false;
  }.bind(this));
  win.resize(800, 600);
  win.show();

  Gtk.main();

  FileSaver.saveFiles();
};

start();
