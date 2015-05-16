const OMeta = imports.standalone;
const Utils = imports.Utils;

//
let _commands = {};
let _registerCommand = function(name, callback) { _commands[name] = callback; };
let executeCommand = function(name, data, callback) {
  try {
    if (!_commands[name]) throw new Error('Unknown command: ' + name);
    let ret = _commands[name](data);
    callback(null, ret);
  } catch (error) {
    callback(error);
  }
};

//
let _compilers = {
  OMeta: {
    generatedCode: null,
    map: JSON.parse(Utils.loadFile('standalone.js.map')),
    rule: 'topLevel',
    run: function(rule, input) {
      return OMeta.BSOMetaJSParser.matchAllStructure(input, rule, undefined);
    },
  },
};

// Create a new compiler and store it.
_registerCommand('compile', function(data) {
  resetSourceMap();

  let result = null;
  let structure = null;
  OMeta.BSOMetaJSParser.matchAll(data.source, "topLevel", undefined, function(err, struct, tree) {
    if (err)
      throw err;

    structure = struct;
    OMeta.BSOMetaJSTranslator.match(tree, "trans", undefined, function(err, struct, code) {
      if (err) {
        log("Translation error - please tell Alex about this!");
        throw err;
      }
      result = code;
    });
  });

  _compilers[data.name] = {
    generatedCode: result,
    structure: structure,
    map: getSourceMap(),
  };

  // TODO: return map
  return _compilers[data.name].map;
});

_registerCommand('compiler-configure', function(data) {
  _compilers[data.name].rule = data.main.rule;
  _compilers[data.name].run = eval(['(function () { ', result, '; return function(rule, input) { return', data.main.variable, '.matchAll(input, rule, undefined); }; })()'].join(''));
});


let _findMatchingStructureChild = function(parent, startOffset, endOffset) {
  for (let i = 0; i < parent.children.length; i++) {
    let child = parent.children[i];
    if (child.start.idx <= startOffset && child.stop.idx >= endOffset)
      return child;
  }
  return null;
};
let _getMatchStructure = function(structure, startOffset, endOffset) {
  let matches = [], child = structure;
  let iter = 0;
  do {
    for (let i = 0; i < child.ids.length; i++)
      matches.unshift({ id: child.ids[i], start: child.start, stop: child.stop, value: child.value });
    child = _findMatchingStructureChild(child, startOffset, endOffset);
    iter++;
  } while (child);
  return matches;
};
let _bestNamedStructureMatch = function(matches) {
  for (let i = 0; i < matches.length; i++)
    if (matches[i].id != -1 &&
        (matches[i].stop.idx - matches[i].start.idx) >= 2)
      return [i, matches[i]];
  return [matches.length - 1, matches[matches.length - 1]];
};

let _structures = {};
let _matchedStructures = {};
// Match a structre given a particular region.
_registerCommand('match-structure', function(data) {
  let structure = _structures[data.input];
  let matches = _getMatchStructure(structure, data.offset.start, data.offset.end);
  _matchedStructures[data.output] = matches;
  return matches.length;
});

// Get the best match.
_registerCommand('get-best-match', function(data) {
  let ret = _bestNamedStructureMatch(_matchedStructures[data.input]);
  return [ret[0], Utils.copyObjectBut(ret[1], 'children')];
});

// Get a matched structure.
_registerCommand('get-match', function(data) {
  let matches = _matchedStructures[data.input];
  let idx = Utils.clamp(data.index, 0, matches.length - 1);
  return [idx, Utils.copyObjectBut(matches[idx], 'children')];
});

// Translate input to output for a given compiler.
_registerCommand('translate', function(data) {
  let compiler = _compilers[data.name];
  _structures[data.output] = compiler.run(data.rule, data.input);
  return true;
});

// Find main rule & compiler variable from offset.
_registerCommand('find-compiler', function(data) {
  let structure = _structures[data.input];
  let matches = _getMatchStructure(structure, data.offset.start, data.offset.end);
  let ret = { variable: null, rule: null };
  for (let i in matches) {
    let val = matches[i].value;
    if (val) {
      if (val[1] == 'Rule')
        ret.rule = val[2];
      else if (val[0] == 'assignVar') {
        ret.variable = val[1];
        break;
      }
    }
  }
  return ret;
});
