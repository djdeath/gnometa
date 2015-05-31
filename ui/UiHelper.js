const OMeta = imports.standalone;
const Utils = imports.Utils;

//
let _commands = {};
let _registerCommand = function(name, callback) { _commands[name] = callback; };
let executeCommand = function(name, data) {
  if (!_commands[name]) throw new Error('Unknown command: ' + name);
  return _commands[name](data);
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
  if (data.name == 'OMeta')
    return _compilers[data.name].map;

  OMeta.resetSourceMap();


  let baseFile = '../ometa-base.ometa'
  OMeta.startFileSourceMap(baseFile);
  let baseCode =
      OMeta.BSOMetaJSTranslator.match(
        OMeta.BSOMetaJSParser.matchAll(Utils.loadFile(baseFile), 'topLevel', undefined),
        'trans', undefined);
  OMeta.startFileSourceMap('');
  let structure = OMeta.BSOMetaJSParser.matchAllStructure(data.input, 'topLevel', undefined);
  let code = OMeta.BSOMetaJSTranslator.match(structure.value, 'trans', undefined);

  _compilers[data.name] = {
    generatedCode: baseCode + '\n' + code,
    structure: structure,
    map: OMeta.getSourceMap(),
  };

  return _compilers[data.name].map;
});

_registerCommand('compiler-configure', function(data) {
  if (!_compilers[data.name])
    throw new Error('Compiler ' + data.name + ' does not exist');
  _compilers[data.name].rule = data.main.rule;
  _compilers[data.name].run =
    OMeta.evalCompiler(['(function () { ',
                        _compilers[data.name].generatedCode,
                        '; return function(rule, input) { return ',
                        data.main.variable,
                        '.matchAllStructure(input, rule, undefined); }; })()'].join(''));
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
    if (child.id != -1 && child.start.idx <= startOffset && child.stop.idx >= endOffset)
      matches.unshift({ id: child.id, start: child.start, stop: child.stop, value: child.value });
    child = _findMatchingStructureChild(child, startOffset, endOffset);
    iter++;
  } while (child);
  return matches;
};
let _bestNamedStructureMatch = function(matches) {
  for (let i = 0; i < matches.length; i++)
    if ((matches[i].stop.idx - matches[i].start.idx) >= 2)
      return [i, matches[i]];
  return [matches.length - 1, matches[matches.length - 1]];
};
let _findStructure = function(structure, startOffset, endOffset) {
  if (structure.start.idx == startOffset || structure.stop.idx == endOffset)
    return structure;
  if (structure.start.idx > startOffset || structure.stop.idx < endOffset)
    return null;

  for (let i = 0; i < structure.children.length; i++) {
    let child = _findStructure(structure.children[i], startOffset, endOffset);
    if (child)
      return child;
  }
  return structure;
}

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

// Get structure on a given range.
_registerCommand('get-structure', function(data) {
  return _findStructure(_structures[data.input], data.offset.start, data.offset.end);
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
