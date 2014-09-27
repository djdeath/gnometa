const Gio = imports.gi.Gio;

let load = function(filename) {
  let file = Gio.File.new_for_path(filename);
  let [, jsSource] = file.load_contents(null);
  eval('(function() { ' + jsSource + ' }).apply(window);');
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


let file = Gio.File.new_for_path(ARGV[0]);
let [, ometaSource] = file.load_contents(null);
ometaSource = '' + ometaSource;

try {
  print(translateCode(ometaSource));
} catch (e) {
  log (e);
  if (e.errorPos !== undefined) {
    let pos = indexToPosition(ometaSource, e.errorPos);
    log('Parsing error at : line ' + pos.line + ' offset ' + pos.offset + '\n\n');
  }
}
