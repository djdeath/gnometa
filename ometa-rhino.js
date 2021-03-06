const GLib = imports.gi.GLib;
const Gio = imports.gi.Gio;
const Options = imports.options;

const CmdOptions = [
  {
    name: 'ast',
    shortName: 'a',
    requireArgument: false,
    defaultValue: false,
    help: 'Output the AST representation of the program',
  },
  {
    name: 'base',
    shortName: 'b',
    requireArgument: false,
    defaultValue: false,
    help: 'Include the base compiler library (useful for standalone compilers)',
  },
  {
    name: 'output',
    shortName: 'o',
    requireArgument: true,
    defaultValue: null,
    help: 'Output file for the compiler',
  },
  {
    name: 'source-map',
    shortName: 's',
    requireArgument: true,
    defaultValue: null,
    help: 'Output file for the source map produced by the compiler',
  },
  {
    name: 'help',
    shortName: 'h',
    requireArgument: false,
    defaultValue: false,
    help: 'Print this screen',
  },
];

// File helpers

let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let saveFile = function(path, content) {
  let file = Gio.File.new_for_path(path);
  file.replace_contents(content, null, false,
                        Gio.FileCreateFlags.REPLACE_DESTINATION,
                        null, null);
};

let printFile = function(path) {
  print(loadFile(path));
};

let indexToPosition = function(source, idx) {
  let lineNum = 0, linePos = 0;
  for (let i = 0; i < idx; i++) {
    if (source.charAt(i) == '\n') {
      linePos = i;
      lineNum++;
    }
  }
  return { line: lineNum + 1,
           offset: idx - linePos };
};

let translateCode = function(s, parser, translator) {
  let result = null;

  parser.matchAll(s, "topLevel", undefined, function(err, struct, tree) {
    if (err)
      throw err;

    if (translator)
      translator.match(tree, "trans", undefined, function(err, struct, code) {
        if (err) {
          log("Translation error - please tell Alex about this!");
          throw err;
        }
        result = code;
      });
    else
      result = JSON.stringify(tree, null, 2);
  });

  return result;
};

let start = function() {
  let config = Options.parseArguments(CmdOptions, ARGV);

  if (config.options.help) {
    Options.printHelp('gnometa', CmdOptions);
    return -1;
  }

  eval(loadFile("ometa-runtime.js"));
  eval(loadFile("ometa-base.js"));
  eval(loadFile("bs-js-compiler.js"));
  eval(loadFile("bs-ometa-optimizer.js"));
  eval(loadFile("bs-ometa-compiler.js"));
  eval(loadFile("bs-ometa-js-compiler.js"));

  let ometaSource = null;
  try {
    let ret = ('// This file was generated using Gnometa\n' +
               '// https://github.com/djdeath/gnometa\n');
    if (config.options.base)
      ret += loadFile('./ometa-runtime.js') + '\n';
    for (let i = 0; i < config.arguments.length; i++) {
      let filename = config.arguments[i];
      startFileSourceMap(filename);
      ometaSource = loadFile(filename);
      ret += translateCode(ometaSource,
                           BSOMetaJSParser,
                           config.options.ast ? null : BSOMetaJSTranslator) + '\n';
    }
    if (config.options.output)
      saveFile(config.options.output, ret);
    else
      print(ret);
    if (config.options['source-map'])
      saveFile(config.options['source-map'], JSON.stringify(getSourceMap()));
  } catch (e) {
    if (e.idx !== undefined) {
      let pos = indexToPosition(ometaSource, e.idx);
      log('Parsing error at : line ' + pos.line + ' offset ' + pos.offset);
    } else {
      log('Internal error : ' + e);
    }
    throw e;
  }
};

start();
