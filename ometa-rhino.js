const Gio = imports.gi.Gio;

let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let printFile = function(path) {
  print(loadFile(path));
};

let load = function(filename) {
  eval('(function() { ' + loadFile(filename) + ' }).apply(window);');
};

load("lib.js");
load("ometa-base.js");
load("bs-js-compiler.js");
load("bs-ometa-compiler.js");
load("bs-ometa-optimizer.js");
load("bs-ometa-js-compiler.js");

let alert = print;

let indexToPosition = function(source, idx) {
  linePos = 0;
  lineNum = 0;
  for (let i = 0; i < idx; i++) {
    if (source.charAt(i) == '\n') {
      linePos = i;
      lineNum++;
    }
  }
  return { line: lineNum + 1,
           offset: idx - linePos + 1 };
};

let translateCode = function(s) {
  var translationError = function(m, i) {
      alert("Translation error - please tell Alex about this!");
      throw fail;
  },
  tree = BSOMetaJSParser.matchAll(s, "topLevel", undefined, function(m, i) {
    throw objectThatDelegatesTo(fail, {errorPos: i});
  });
  return BSOMetaJSTranslator.match(tree, "trans", undefined, translationError)
};

let ometa = function(s) {
  return eval(translateCode(s));
};


let ometaSource = loadFile(ARGV[0]);

try {
  print(translateCode(ometaSource));
} catch (e) {
  log (e);
  if (e.errorPos !== undefined) {
    let pos = indexToPosition(ometaSource, e.errorPos);
    log('Parsing error at : line ' + pos.line + ' offset ' + pos.offset + '\n\n');
  }
}
