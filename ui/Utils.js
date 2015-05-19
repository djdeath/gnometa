const Gio = imports.gi.Gio;
const CustomJson = imports.CustomJson;

//
let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let clamp = function(value, min, max) {
  return Math.max(Math.min(value, max), min);
};

let copyObjectBut = function(object, omit) {
  let ret = {};
  for (let i in object) {
    if (i != omit)
      ret[i] = object[i];
  }
  return ret;
};

let copyObject = function(object) {
  let ret = {};
  for (let i in object)
    ret[i] = object[i];
  return ret;
};

let copyArray = function(array) {
  let ret = [];
  for (let i = 0; i < array.length; i++)
    ret[i] = array[i];
  return ret;
};

let copyArrayRange = function(array, from, to) {
  let ret = [], j = 0;
  for (let i = (from ? from : 0); i < (to ? to : array.length); i++)
    ret[j++] = array[i];
  return ret;
};

let forwardSignal = function(from, to, signal) {
  from.connect(signal, function() {
    to.emit.apply(to, [signal].concat(copyArrayRange(arguments, 1)));
  }.bind(this));
};

let forwardCall = function(from, to, func) {
  from[func] = function() { return to[func].apply(to, arguments); };
};

let _stringify = function(atoms, value) {
  let serializeString = function(v) {
    if (atoms.strings[v] !== undefined)
      return "$" + atoms.strings[v];

    atoms.strings[v] = atoms.id++;
    return JSON.stringify(v);
  };
  let serializeArray = function(v) {
    if (atoms.objects.has(v))
      return "$" + atoms.objects.get(v);

    if (v.length == 0) return '[]';
    let s = '[' + _stringify(atoms, v[0]);
    for (let i = 1; i < v.length; i++)
      s += ',' + _stringify(atoms, v[i]);
    return s + ']';
  };
  let serializeObject = function(v) {
    if (atoms.objects.has(v))
      return "$" + atoms.objects.get(v);

    //log('object! keys=' + Object.keys(v));
    let keys = Object.keys(v);
    if (keys.length == 0) return '{}';
    let s = '{"' + keys[0] + '":' + _stringify(atoms, v[keys[0]]);
    for (let i = 1; i < keys.length; i++) {
      let item = v[keys[i]];
      s += ',"' + keys[i] + '":' + _stringify(atoms, item)
    }
    return s + '}';
  }

  if (value === null)
    return 'null';
  else if (value === undefined)
    return 'undefined';
  else if (typeof value == 'boolean' ||
           typeof value == 'number')
    return JSON.stringify(value);
  else if (typeof value == 'string' ||
           value instanceof String)
    return serializeString(value);
  else if (value instanceof Array)
    return serializeArray(value);
  return serializeObject(value);
};

// CustomJson stuff stringify.
let stringify = function(value) {
  let atoms = { id: 0, objects: new WeakMap(), strings: {} };
  return _stringify(atoms, value);
};

// CustomJson stuff parse.
let parse = function(data) {
  return CustomJson.CustomJson.matchAll(data, 'value');
};
