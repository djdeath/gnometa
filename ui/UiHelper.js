const OMeta = imports.standalone;
const Utils = imports.Utils;

//
let commands = {};
let executeCommand = function(name, data) {
  if (!commands[name]) throw new Error('Unknown command: ' + name);
  return commands[name](data);
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
commands.compile = function(name, input) {
  if (name == 'OMeta')
    return _compilers[name].map;

  OMeta.resetSourceMap();

  let baseFile = '../ometa-base.ometa'
  OMeta.startFileSourceMap(baseFile);
  let baseCode = OMeta.BSOMetaJSTranslator.match(
    OMeta.BSOMetaJSParser.matchAll(Utils.loadFile(baseFile),
                                   'topLevel', undefined),
    'trans', undefined);
  OMeta.startFileSourceMap('');
  let structure = OMeta.BSOMetaJSParser.matchAllStructure(input, 'topLevel', undefined);
  let code = OMeta.BSOMetaJSTranslator.match(structure.value, 'trans', undefined);

  _compilers[name] = {
    generatedCode: baseCode + '\n' + code,
    structure: structure,
    map: OMeta.getSourceMap(),
  };

  return _compilers[name].map;
};

commands.compilerConfigure = function(name, variable, rule) {
  if (!_compilers[name])
    throw new Error('Compiler ' + name + ' does not exist');
  _compilers[name].rule = rule;
  _compilers[name].run =
    OMeta.evalCompiler(['(function () { ',
                        _compilers[name].generatedCode,
                        '; return function(rule, input) { return ',
                        variable,
                        '.matchAllStructure(input, rule, undefined); }; })()'].join(''));
};


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
commands.matchStructure = function(input, start, end, output) {
  let structure = _structures[input];
  let matches = _getMatchStructure(structure, start, end);
  _matchedStructures[output] = matches;
  return matches.length;
};

// Get the best match.
commands.getBestMatch = function(input) {
  let ret = _bestNamedStructureMatch(_matchedStructures[input]);
  return [ret[0], Utils.copyObjectBut(ret[1], 'children')];
};

// Get a matched structure.
commands.getMatch = function(input, index) {
  let matches = _matchedStructures[input];
  let idx = Utils.clamp(index, 0, matches.length - 1);
  return [idx, Utils.copyObjectBut(matches[idx], 'children')];
};

// Get structure on a given range.
commands.getStructure = function(input, start, end) {
  return _findStructure(_structures[input], start, end);
};

// Translate input to output for a given compiler.
commands.translate = function(name, input, rule, output) {
  let compiler = _compilers[name];
  _structures[output] = compiler.run(rule, input);
  return true;
};

// Find main rule & compiler variable from offset.
commands.findCompiler = function(input, start, end) {
  let structure = _structures[input];
  let matches = _getMatchStructure(structure, start, end);
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
};
