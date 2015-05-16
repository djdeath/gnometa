const Utils = imports.Utils;

const ContinousCallback = function(callback) {
  this._init(callback);
};
ContinousCallback.prototype = {
  _init: function(callback) {
    this._callback = callback;
    this._waiting = null;
    this._running = false;
  },
  _exec: function() {
    try {
      this._running = true;
      this._callback.apply(this, [this].concat(this._waiting));
    } catch (e) {
      this._running = false;
    }
  },
  run: function() {
    this._waiting = Utils.copyArray(arguments);
    if (!this._running) {
      this._exec();
      this._waiting = null;
    } else {
      this._waiting = Utils.copyArray(arguments);
    }
  },
  done: function() {
    this._running = false;
    if (this._waiting) {
      this._exec();
      this._waiting = null;
    }
  },
};

//
let createContinuous = function(callback) {
  return new ContinousCallback(callback);
};
