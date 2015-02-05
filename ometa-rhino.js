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
    name: 'help',
    shortName: 'h',
    requireArgument: false,
    defaultValue: false,
    help: 'Print this screen',
  },
];

let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let printFile = function(path) {
  print(loadFile(path));
};

let alert = log;

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

  parser.matchAll(s, "topLevel", undefined, function(err, m, tree) {
    if (err)
      throw err;

    //log(JSON.stringify(m.structure, null, 2));

    if (translator)
      translator.match(tree, "trans", undefined, function(err, m, code) {
        if (err) {
          alert("Translation error - please tell Alex about this!");
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

  eval(loadFile("ometa-base.js"));
  eval(loadFile("bs-js-compiler.js"));
  eval(loadFile("bs-ometa-optimizer.js"));
  eval(loadFile("bs-ometa-compiler.js"));
  eval(loadFile("bs-ometa-js-compiler.js"));

  let ometaSource = null;
  try {
    if (config.options.base)
      print(loadFile('./ometa-base.js'));
    for (let i = 0; i < config.arguments.length; i++) {
      ometaSource = loadFile(config.arguments[i]);
      print(translateCode(ometaSource,
                          BSOMetaJSParser,
                          config.options.ast ? null : BSOMetaJSTranslator));
    }
  } catch (e) {
    if (e.idx !== undefined) {
      let pos = indexToPosition(ometaSource, e.idx);
      log('Parsing error at : line ' + pos.line + ' offset ' + pos.offset);
    }
    throw e;
  }
};

start();
