const Gio = imports.gi.Gio;

//
let loadFile = function(path) {
  let file = Gio.File.new_for_path(path);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let loadURI = function(uri) {
  let file = Gio.File.new_for_uri(uri);
  let [, source] = file.load_contents(null);
  return '' + source;
};

let clamp = function(value, min, max) {
  return Math.max(Math.min(value, max), min);
};

let includes = function(value, min, max) {
  return value >= min && value <= max;
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
