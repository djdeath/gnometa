// This file was generated using Gnometa
// https://github.com/djdeath/gnometa
/*
  new syntax:
    #foo and `foo	match the string object 'foo' (it's also accepted in my JS)
    'abc'		match the string object 'abc'
    'c'			match the string object 'c'
    ``abc''		match the sequence of string objects 'a', 'b', 'c'
    "abc"		token('abc')
    [1 2 3]		match the array object [1, 2, 3]
    foo(bar)		apply rule foo with argument bar
    -> ...		semantic actions written in JS (see OMetaParser's atomicHostExpr rule)
*/

/*
var M = ometa {
  number = number:n digit:d -> { n * 10 + d.digitValue() }
         | digit:d          -> { d.digitValue() }
};

translates to...

var M = objectThatDelegatesTo(OMeta, {
  number: function() {
            return this._or(function() {
                              var n = this._apply("number"),
                                  d = this._apply("digit");
                              return n * 10 + d.digitValue();
                            },
                            function() {
                              var d = this._apply("digit");
                              return d.digitValue();
                            }
                           );
          }
});
M.matchAll("123456789", "number");
*/

// try to use StringBuffer instead of string concatenation to improve performance

let StringBuffer = function() {
  this.strings = [];
  for (var idx = 0; idx < arguments.length; idx++)
    this.nextPutAll(arguments[idx]);
};
StringBuffer.prototype.nextPutAll = function(s) { this.strings.push(s); };
StringBuffer.prototype.contents   = function()  { return this.strings.join(""); };
String.prototype.writeStream      = function() { return new StringBuffer(this); };

// make Arrays print themselves sensibly

let printOn = function(x, ws) {
  if (x === undefined || x === null)
    ws.nextPutAll("" + x);
  else if (x.constructor === Array) {
    ws.nextPutAll("[");
    for (var idx = 0; idx < x.length; idx++) {
      if (idx > 0)
        ws.nextPutAll(", ");
      printOn(x[idx], ws);
    }
    ws.nextPutAll("]");
  } else
    ws.nextPutAll(x.toString());
};

Array.prototype.toString = function() {
  var ws = "".writeStream();
  printOn(this, ws);
  return ws.contents();
};

// delegation

let objectThatDelegatesTo = function(x, props) {
  var f = function() { };
  f.prototype = x;
  var r = new f();
  for (var p in props)
    if (props.hasOwnProperty(p))
      r[p] = props[p];
  return r;
};

// some reflective stuff

let ownPropertyNames = function(x) {
  var r = [];
  for (var name in x)
    if (x.hasOwnProperty(name))
      r.push(name);
  return r;
};

let isImmutable = function(x) {
   return (x === null ||
           x === undefined ||
           typeof x === "boolean" ||
           typeof x === "number" ||
           typeof x === "string");
};

String.prototype.digitValue  = function() {
  return this.charCodeAt(0) - "0".charCodeAt(0);
};

let isSequenceable = function(x) {
  return (typeof x == "string" || x.constructor === Array);
};

// some functional programming stuff

Array.prototype.delimWith = function(d) {
  return this.reduce(
    function(xs, x) {
      if (xs.length > 0)
        xs.push(d);
      xs.push(x);
      return xs;
    },
    []);
};

// escape characters

String.prototype.pad = function(s, len) {
  var r = this;
  while (r.length < len)
    r = s + r;
  return r;
};

let escapeStringFor = {};
for (var c = 0; c < 128; c++)
  escapeStringFor[c] = String.fromCharCode(c);
escapeStringFor["'".charCodeAt(0)]  = "\\'";
escapeStringFor['"'.charCodeAt(0)]  = '\\"';
escapeStringFor["\\".charCodeAt(0)] = "\\\\";
escapeStringFor["\b".charCodeAt(0)] = "\\b";
escapeStringFor["\f".charCodeAt(0)] = "\\f";
escapeStringFor["\n".charCodeAt(0)] = "\\n";
escapeStringFor["\r".charCodeAt(0)] = "\\r";
escapeStringFor["\t".charCodeAt(0)] = "\\t";
escapeStringFor["\v".charCodeAt(0)] = "\\v";
let escapeChar = function(c) {
  var charCode = c.charCodeAt(0);
  if (charCode < 128)
    return escapeStringFor[charCode];
  else if (128 <= charCode && charCode < 256)
    return "\\x" + charCode.toString(16).pad("0", 2);
  else
    return "\\u" + charCode.toString(16).pad("0", 4);
};

let unescape = function(s) {
  if (s.charAt(0) == '\\')
    switch (s.charAt(1)) {
    case "'":  return "'";
    case '"':  return '"';
    case '\\': return '\\';
    case 'b':  return '\b';
    case 'f':  return '\f';
    case 'n':  return '\n';
    case 'r':  return '\r';
    case 't':  return '\t';
    case 'v':  return '\v';
    case 'x':  return String.fromCharCode(parseInt(s.substring(2, 4), 16));
    case 'u':  return String.fromCharCode(parseInt(s.substring(2, 6), 16));
    default:   return s.charAt(1);
    }
  else
    return s;
};

String.prototype.toProgramString = function() {
  var ws = '"'.writeStream();
  for (var idx = 0; idx < this.length; idx++)
    ws.nextPutAll(escapeChar(this.charAt(idx)));
  ws.nextPutAll('"');
  return ws.contents();
};

// unique tags for objects (useful for making "hash tables")

let getTag = (function() {
  var numIdx = 0;
  return function(x) {
    if (x === null || x === undefined)
      return x;
    switch (typeof x) {
    case "boolean": return x == true ? "Btrue" : "Bfalse";
    case "string":  return "S" + x;
    case "number":  return "N" + x;
    default:        return x.hasOwnProperty("_id_") ? x._id_ : x._id_ = "R" + numIdx++;
    }
  };
})();


// the failure exception
if (!window._OMetafail) {
  window._OMetafail = new Error();
  window._OMetafail.toString = function() { return "match failed"; };
}
let fail = window._OMetafail;

// streams and memoization

let OMInputStream = function(hd, tl) {
  this.memo = { };
  this.lst  = tl.lst;
  this.idx  = tl.idx;
  this.hd   = hd;
  this.tl   = tl;
};
OMInputStream.prototype.head = function() { return this.hd; };
OMInputStream.prototype.tail = function() { return this.tl; };
OMInputStream.prototype.type = function() { return this.lst.constructor; };
OMInputStream.prototype.upTo = function(that) {
  var r = [], curr = this;
  while (curr != that) {
    r.push(curr.head());
    curr = curr.tail();
  }
  return this.type() == String ? r.join('') : r;
};

let OMInputStreamEnd = function(lst, idx) {
  this.memo = { };
  this.lst = lst;
  this.idx = idx;
};
OMInputStreamEnd.prototype = objectThatDelegatesTo(OMInputStream.prototype);
OMInputStreamEnd.prototype.head = function() { throw fail; };
OMInputStreamEnd.prototype.tail = function() { throw fail; };

// This is necessary b/c in IE, you can't say "foo"[idx]
Array.prototype.at  = function(idx) { return this[idx]; };
String.prototype.at = String.prototype.charAt;

let ListOMInputStream = function(lst, idx) {
  this.memo = { };
  this.lst  = lst;
  this.idx  = idx;
  this.hd   = lst.at(idx);
};
ListOMInputStream.prototype = objectThatDelegatesTo(OMInputStream.prototype);
ListOMInputStream.prototype.head = function() { return this.hd; };
ListOMInputStream.prototype.tail = function() {
  return this.tl || (this.tl = makeListOMInputStream(this.lst, this.idx + 1));
};

let makeListOMInputStream = function(lst, idx) {
  return new (idx < lst.length ? ListOMInputStream : OMInputStreamEnd)(lst, idx);
};

Array.prototype.toOMInputStream  = function() {
  return makeListOMInputStream(this, 0);
}
String.prototype.toOMInputStream = function() {
  return makeListOMInputStream(this, 0);
}

let makeOMInputStreamProxy = function(target) {
  return objectThatDelegatesTo(target, {
    memo:   { },
    target: target,
    tl: undefined,
    tail:   function() {
      return this.tl || (this.tl = makeOMInputStreamProxy(target.tail()));
    }
  });
}

// Failer (i.e., that which makes things fail) is used to detect (direct) left recursion and memoize failures

let Failer = function() { }
Failer.prototype.used = false;

// Source map helpers

let _sourceMap = {
  filenames: [],
  map: [],
};
let startFileSourceMap = function(filename) {
  _sourceMap.filenames.push(filename);
};

let addToSourseMap = function(id, start, stop) {
  _sourceMap.map[id] = [ _sourceMap.filenames.length - 1, start, stop ];
};

let createSourceMapId = function() {
  return _sourceMap.map.length;
};

let getSourceMap = function() { return _sourceMap; };

// the OMeta "class" and basic functionality

let OMeta = {
  _extractLocation: function(retVal) {
    return { input: retVal.start.lst,
             start: retVal.start.idx,
             stop: this.input.idx, };
  },
  _startStructure: function(id) {
    return {
      id: id,
      start: this.input,
      stop: null,
      children: [],
      value: null,
    };
  },
  _appendStructure: function(structure, child) {
    structure.children.push(child);
    return (structure.value = child.value);
  },
  _getStructureValue: function(structure) {
    return structure.value;
  },
  _endStructure: function(structure) {
    structure.stop = this.input;
    return structure;
  },

  _apply: function(rule) {
    var memoRec = this.input.memo[rule];
    if (memoRec == undefined) {
      var origInput = this.input,
          failer    = new Failer();
      if (this[rule] === undefined)
        throw new Error('tried to apply undefined rule "' + rule + '"');
      this.input.memo[rule] = failer;
      this.input.memo[rule] = memoRec = {ans: this[rule].call(this),
                                         nextInput: this.input };
      if (failer.used) {
        var sentinel = this.input;
        while (true) {
          try {
            this.input = origInput;
            var ans = this[rule].call(this);
            if (this.input == sentinel)
              throw fail;
            memoRec.ans       = ans;
            memoRec.nextInput = this.input;
          } catch (f) {
            if (f != fail)
              throw f;
            break;
          }
        }
      }
    } else if (memoRec instanceof Failer) {
      memoRec.used = true;
      throw fail;
    }

    this.input = memoRec.nextInput;
    return memoRec.ans;
  },

  // note: _applyWithArgs and _superApplyWithArgs are not memoized, so they can't be left-recursive
  _applyWithArgs: function(rule) {
    var ruleFn = this[rule];
    var ruleFnArity = ruleFn.length;
    for (var idx = arguments.length - 1; idx >= ruleFnArity + 1; idx--) // prepend "extra" arguments in reverse order
      this._prependInput(arguments[idx]);
    return ruleFnArity == 0 ?
      ruleFn.call(this) :
      ruleFn.apply(this, Array.prototype.slice.call(arguments, 1, ruleFnArity + 1));
  },
  _superApplyWithArgs: function(recv, rule) {
    var ruleFn = this[rule];
    var ruleFnArity = ruleFn.length;
    for (var idx = arguments.length - 1; idx >= ruleFnArity + 2; idx--) // prepend "extra" arguments in reverse order
      recv._prependInput(arguments[idx]);
    return ruleFnArity == 0 ?
      ruleFn.call(recv) :
      ruleFn.apply(recv, Array.prototype.slice.call(arguments, 2, ruleFnArity + 2));
  },
  _prependInput: function(v) {
    this.input = new OMInputStream(v, this.input);
  },

  // if you want your grammar (and its subgrammars) to memoize parameterized rules, invoke this method on it:
  memoizeParameterizedRules: function() {
    this._prependInput = function(v) {
      var newInput;
      if (isImmutable(v)) {
        newInput = this.input[getTag(v)];
        if (!newInput) {
          newInput = new OMInputStream(v, this.input);
          this.input[getTag(v)] = newInput;
        }
      } else
        newInput = new OMInputStream(v, this.input);
      this.input = newInput;
    };
    this._applyWithArgs = function(rule) {
      var ruleFnArity = this[rule].length;
      for (var idx = arguments.length - 1; idx >= ruleFnArity + 1; idx--) // prepend "extra" arguments in reverse order
        this._prependInput(arguments[idx]);
      return ruleFnArity == 0 ?
        this._apply(rule) :
        this[rule].apply(this, Array.prototype.slice.call(arguments, 1, ruleFnArity + 1));
    };
  },

  _pred: function(b) {
    if (b)
      return true;
    throw fail;
  },
  _not: function(x) {
    var r = this._startStructure(-1);
    try {
      this._appendStructure(r, x.call(this));
    } catch (f) {
      if (f != fail)
        throw f;
      this.input = r.start;
      r.value = true;
      return this._endStructure(r);
    }
    throw fail;
  },
  _lookahead: function(x) {
    var origInput = this.input,
        r = x.call(this);
    this.input = origInput;
    return r;
  },
  _or: function() {
    var origInput = this.input;
    for (var idx = 0; idx < arguments.length; idx++) {
      try {
        this.input = origInput;
        return arguments[idx].call(this);
      } catch (f) {
        if (f != fail)
          throw f;
      }
    }
    throw fail;
  },
  _xor: function(ruleName) {
    var idx = 1, newInput, origInput = this.input, r;
    while (idx < arguments.length) {
      try {
        this.input = origInput;
        r = arguments[idx].call(this);
        if (newInput)
          throw new Error('more than one choice matched by "exclusive-OR" in ' + ruleName);
        newInput = this.input;
      } catch (f) {
        if (f != fail)
          throw f;
      }
      idx++;
    }
    if (newInput) {
      this.input = newInput;
      return r;
    }
    throw fail;
  },
  disableXORs: function() {
    this._xor = this._or;
  },
  _opt: function(x) {
    var r = this._startStructure(-1);
    try {
      r = x.call(this);
    } catch (f) {
      if (f != fail)
        throw f;
      this.input = r.start;
    }
    return this._endStructure(r);
  },
  _many: function(x) {
    var r = this._startStructure(-1), ans = [];
    if (arguments.length > 1) { this._appendStructure(r, x.call(this)); ans.push(r.value); }
    while (true) {
      var origInput = this.input;
      try {
        this._appendStructure(r, x.call(this));
        ans.push(r.value);
      } catch (f) {
        if (f != fail)
          throw f;
        this.input = origInput;
        break;
      }
    }
    r.value = ans
    return this._endStructure(r);
  },
  _many1: function(x) { return this._many(x, true); },
  _form: function(x) {
    var r = this._startStructure(-1);
    this._appendStructure(r, this._apply("anything"));
    var v = r.value;
    if (!isSequenceable(v))
      throw fail;
    var origInput = this.input;
    this.input = v.toOMInputStream();
    // TODO: probably append as a child
    this._appendStructure(r, x.call(this));
    this._appendStructure(r, this._apply("end"));
    r.value = v;
    this.input = origInput;
    return this._endStructure(r);
  },
  _consumedBy: function(x) {
    var r = this._startStructure(-1);
    this._appendStructure(r, x.call(this));
    r.value = r.start.upTo(this.input);
    return this._endStructure(r);
  },
  _idxConsumedBy: function(x) {
    var r = this._startStructure(-1);
    this._appendStructure(r, x.call(this));
    r.value = {fromIdx: r.start.idx, toIdx: this.input.idx};
    return this._endStructure(r);
  },
  _interleave: function(mode1, part1, mode2, part2 /* ..., moden, partn */) {
    var currInput = this.input, ans = [], r = this._startStructure(-1);
    for (var idx = 0; idx < arguments.length; idx += 2)
      ans[idx / 2] = (arguments[idx] == "*" || arguments[idx] == "+") ? [] : undefined;
    while (true) {
      var idx = 0, allDone = true;
      while (idx < arguments.length) {
        if (arguments[idx] != "0")
          try {
            this.input = currInput;
            switch (arguments[idx]) {
            case "*":
              ans[idx / 2].push(this._appendStructure(r, arguments[idx + 1].call(this)));
              break;
            case "+":
              ans[idx / 2].push(this._appendStructure(r, arguments[idx + 1].call(this)));
              arguments[idx] = "*";
              break;
            case "?":
              ans[idx / 2] = this._appendStructure(r, arguments[idx + 1].call(this));
              arguments[idx] = "0";
              break;
            case "1":
              ans[idx / 2] = this._appendStructure(r, arguments[idx + 1].call(this));
              arguments[idx] = "0";
              break;
            default:
              throw new Error("invalid mode '" + arguments[idx] + "' in OMeta._interleave");
            }
            currInput = this.input;
            break;
          } catch (f) {
            if (f != fail)
              throw f;
            // if this (failed) part's mode is "1" or "+", we're not done yet
            allDone = allDone && (arguments[idx] == "*" || arguments[idx] == "?");
          }
        idx += 2;
      }
      if (idx == arguments.length) {
        if (allDone) {
          r.value = ans;
          return this._endStructure(r);
        } else
          throw fail;
      }
    }
  },

  // some basic rules
  anything: function() {
    var r = this._startStructure(-1);
    r.value = this.input.head();
    this.input = this.input.tail();
    return this._endStructure(r);
  },
  end: function() {
    return this._not(function() { return this._apply("anything"); });
  },
  pos: function() {
    return this.input.idx;
  },
  empty: function() {
    var r = this._startStructure(-1);
    r.value = true;
    return this._endStructure(r);
  },
  apply: function(r) {
    return this._apply(r);
  },
  foreign: function(g, r) {
    var gi = objectThatDelegatesTo(g, {input: makeOMInputStreamProxy(this.input)});
    gi.initialize();
    var ans = gi._apply(r);
    this.input = gi.input.target;
    return ans;
  },

  //  some useful "derived" rules
  exactly: function(wanted) {
    var r = this._startStructure(-1);
    this._appendStructure(r, this._apply("anything"));
    if (wanted === r.value)
      return this._endStructure(r);
    throw fail;
  },
  seq: function(xs) {
    var r = this._startStructure(-1);
    for (var idx = 0; idx < xs.length; idx++)
      this._applyWithArgs("exactly", xs.at(idx));
    r.value = xs;
    return this._endStructure(r);
  },

  initialize: function() {},
  // match and matchAll are a grammar's "public interface"
  _genericMatch: function(input, rule, args, callback) {
    if (args == undefined)
      args = [];
    var realArgs = [rule];
    for (var idx = 0; idx < args.length; idx++)
      realArgs.push(args[idx]);
    var m = objectThatDelegatesTo(this, {input: input});
    m.initialize();
    try {
      let ret = realArgs.length == 1 ? m._apply.call(m, realArgs[0]) : m._applyWithArgs.apply(m, realArgs);
      if (callback)
        callback(null, ret, ret.value);
      return ret.value;
    } catch (f) {
      if (f != fail)
        throw f;

      var einput = m.input;
      if (einput.idx != undefined) {
        while (einput.tl != undefined && einput.tl.idx != undefined)
          einput = einput.tl;
        einput.idx--;
      }
      var err = new Error();

      err.idx = einput.idx;
      if (callback)
        callback(err);
      else
        throw err;
    }
    return null;
  },
  match: function(obj, rule, args, callback) {
    return this._genericMatch([obj].toOMInputStream(), rule, args, callback);
  },
  matchAll: function(listyObj, rule, args, matchFailed) {
    return this._genericMatch(listyObj.toOMInputStream(), rule, args, matchFailed);
  },
  createInstance: function() {
    var m = objectThatDelegatesTo(this, {});
    m.initialize();
    m.matchAll = function(listyObj, aRule) {
      this.input = listyObj.toOMInputStream();
      return this._apply(aRule);
    };
    return m;
  }
};

let GenericMatcher=objectThatDelegatesTo(OMeta,{
"notLast":function(){var $elf=this,$vars={},$r0=this._startStructure(0);$vars.rule=this._getStructureValue(this.anything());$vars.r=this._appendStructure($r0,this._apply($vars.rule));this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(8);$r1.value=this._appendStructure($r1,this._apply($vars.rule));return this._endStructure($r1);}));$r0.value=$vars.r;return this._endStructure($r0);}});let BaseStrParser=objectThatDelegatesTo(OMeta,{
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(12);$vars.r=this._appendStructure($r0,this.anything());this._pred(((typeof $vars.r) === "string"));$r0.value=$vars.r;return this._endStructure($r0);},
"char":function(){var $elf=this,$vars={},$r0=this._startStructure(18);$vars.r=this._appendStructure($r0,this.anything());this._pred((((typeof $vars.r) === "string") && ($vars.r["length"] == (1))));$r0.value=$vars.r;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(24);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred(($vars.r.charCodeAt((0)) <= (32)));$r0.value=$vars.r;return this._endStructure($r0);},
"spaces":function(){var $elf=this,$vars={},$r0=this._startStructure(30);$r0.value=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(32);$r1.value=this._appendStructure($r1,this._apply("space"));return this._endStructure($r1);}));return this._endStructure($r0);},
"digit":function(){var $elf=this,$vars={},$r0=this._startStructure(36);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "0") && ($vars.r <= "9")));$r0.value=$vars.r;return this._endStructure($r0);},
"lower":function(){var $elf=this,$vars={},$r0=this._startStructure(42);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "a") && ($vars.r <= "z")));$r0.value=$vars.r;return this._endStructure($r0);},
"upper":function(){var $elf=this,$vars={},$r0=this._startStructure(48);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "A") && ($vars.r <= "Z")));$r0.value=$vars.r;return this._endStructure($r0);},
"letter":function(){var $elf=this,$vars={},$r0=this._startStructure(54);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(56);$r1.value=this._appendStructure($r1,this._apply("lower"));return this._endStructure($r1);},function(){var $r1=this._startStructure(60);$r1.value=this._appendStructure($r1,this._apply("upper"));return this._endStructure($r1);}));return this._endStructure($r0);},
"letterOrDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(64);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(66);$r1.value=this._appendStructure($r1,this._apply("letter"));return this._endStructure($r1);},function(){var $r1=this._startStructure(70);$r1.value=this._appendStructure($r1,this._apply("digit"));return this._endStructure($r1);}));return this._endStructure($r0);},
"token":function(){var $elf=this,$vars={},$r0=this._startStructure(74);$vars.tok=this._getStructureValue(this.anything());this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this.seq($vars.tok));return this._endStructure($r0);},
"listOf":function(){var $elf=this,$vars={},$r0=this._startStructure(82);$vars.rule=this._getStructureValue(this.anything());$vars.delim=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(89);$vars.f=this._appendStructure($r1,this._apply($vars.rule));$vars.rs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(97);this._appendStructure($r2,this._applyWithArgs("token",$vars.delim));$r2.value=this._appendStructure($r2,this._apply($vars.rule));return this._endStructure($r2);}));$r1.value=[$vars.f].concat($vars.rs);return this._endStructure($r1);},function(){var $r1=this._startStructure(104);$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"fromTo":function(){var $elf=this,$vars={},$r0=this._startStructure(107);$vars.x=this._getStructureValue(this.anything());$vars.y=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(114);this._appendStructure($r1,this.seq($vars.x));this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(120);this._appendStructure($r2,this._not(function(){var $r3=this._startStructure(124);$r3.value=this._appendStructure($r3,this.seq($vars.y));return this._endStructure($r3);}));$r2.value=this._appendStructure($r2,this._apply("char"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this.seq($vars.y));return this._endStructure($r1);}));return this._endStructure($r0);}})
let BSJSParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this,$vars={},$r0=this._startStructure(134);$vars.r=this._getStructureValue(this.anything());$vars.d=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._applyWithArgs("listOf",$vars.r,$vars.d));this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(143);$r1.value=this._appendStructure($r1,this._applyWithArgs("token",","));return this._endStructure($r1);},function(){var $r1=this._startStructure(147);$r1.value=this._appendStructure($r1,this._apply("empty"));return this._endStructure($r1);}));$r0.value=$vars.v;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(151);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(153);$r1.value=this._appendStructure($r1,BaseStrParser._superApplyWithArgs(this,"space"));return this._endStructure($r1);},function(){var $r1=this._startStructure(157);$r1.value=this._appendStructure($r1,this._applyWithArgs("fromTo","//","\n"));return this._endStructure($r1);},function(){var $r1=this._startStructure(161);$r1.value=this._appendStructure($r1,this._applyWithArgs("fromTo","/*","*/"));return this._endStructure($r1);}));return this._endStructure($r0);},
"nameFirst":function(){var $elf=this,$vars={},$r0=this._startStructure(165);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(167);$r1.value=this._appendStructure($r1,this._apply("letter"));return this._endStructure($r1);},function(){var $r1=this._startStructure(171);$r1.value=this._appendStructure($r1,this.exactly("$"));return this._endStructure($r1);},function(){var $r1=this._startStructure(175);$r1.value=this._appendStructure($r1,this.exactly("_"));return this._endStructure($r1);}));return this._endStructure($r0);},
"nameRest":function(){var $elf=this,$vars={},$r0=this._startStructure(179);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(181);$r1.value=this._appendStructure($r1,this._apply("nameFirst"));return this._endStructure($r1);},function(){var $r1=this._startStructure(185);$r1.value=this._appendStructure($r1,this._apply("digit"));return this._endStructure($r1);}));return this._endStructure($r0);},
"iName":function(){var $elf=this,$vars={},$r0=this._startStructure(189);$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(191);this._appendStructure($r1,this._apply("nameFirst"));$r1.value=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(198);$r2.value=this._appendStructure($r2,this._apply("nameRest"));return this._endStructure($r2);}));return this._endStructure($r1);}));return this._endStructure($r0);},
"isKeyword":function(){var $elf=this,$vars={},$r0=this._startStructure(202);$vars.x=this._getStructureValue(this.anything());$r0.value=this._pred(BSJSParser._isKeyword($vars.x));return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(207);$vars.n=this._appendStructure($r0,this._apply("iName"));this._appendStructure($r0,this._not(function(){var $r1=this._startStructure(214);$r1.value=this._appendStructure($r1,this._applyWithArgs("isKeyword",$vars.n));return this._endStructure($r1);}));$r0.value=["name",(($vars.n == "self")?"$elf":$vars.n)];return this._endStructure($r0);},
"keyword":function(){var $elf=this,$vars={},$r0=this._startStructure(218);$vars.k=this._appendStructure($r0,this._apply("iName"));this._appendStructure($r0,this._applyWithArgs("isKeyword",$vars.k));$r0.value=[$vars.k,$vars.k];return this._endStructure($r0);},
"hexDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(225);$vars.x=this._appendStructure($r0,this._apply("char"));$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));$r0.value=$vars.v;return this._endStructure($r0);},
"hexLit":function(){var $elf=this,$vars={},$r0=this._startStructure(232);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(234);$vars.n=this._appendStructure($r1,this._apply("hexLit"));$vars.d=this._appendStructure($r1,this._apply("hexDigit"));$r1.value=(($vars.n * (16)) + $vars.d);return this._endStructure($r1);},function(){var $r1=this._startStructure(242);$r1.value=this._appendStructure($r1,this._apply("hexDigit"));return this._endStructure($r1);}));return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(246);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(248);this._appendStructure($r1,this.exactly("0"));this._appendStructure($r1,this.exactly("x"));"0x";$vars.n=this._appendStructure($r1,this._apply("hexLit"));$r1.value=["number",$vars.n];return this._endStructure($r1);},function(){var $r1=this._startStructure(253);$vars.f=this._appendStructure($r1,this._consumedBy(function(){var $r2=this._startStructure(258);this._appendStructure($r2,this._many1(function(){var $r3=this._startStructure(262);$r3.value=this._appendStructure($r3,this._apply("digit"));return this._endStructure($r3);}));$r2.value=this._appendStructure($r2,this._opt(function(){var $r3=this._startStructure(269);this._appendStructure($r3,this.exactly("."));$r3.value=this._appendStructure($r3,this._many1(function(){var $r4=this._startStructure(276);$r4.value=this._appendStructure($r4,this._apply("digit"));return this._endStructure($r4);}));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["number",parseFloat($vars.f)];return this._endStructure($r1);}));return this._endStructure($r0);},
"escapeChar":function(){var $elf=this,$vars={},$r0=this._startStructure(280);$vars.s=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(285);this._appendStructure($r1,this.exactly("\\"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(292);this._appendStructure($r2,this.exactly("u"));this._appendStructure($r2,this._apply("hexDigit"));this._appendStructure($r2,this._apply("hexDigit"));this._appendStructure($r2,this._apply("hexDigit"));$r2.value=this._appendStructure($r2,this._apply("hexDigit"));return this._endStructure($r2);},function(){var $r2=this._startStructure(305);this._appendStructure($r2,this.exactly("x"));this._appendStructure($r2,this._apply("hexDigit"));$r2.value=this._appendStructure($r2,this._apply("hexDigit"));return this._endStructure($r2);},function(){var $r2=this._startStructure(314);$r2.value=this._appendStructure($r2,this._apply("char"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=unescape($vars.s);return this._endStructure($r0);},
"str":function(){var $elf=this,$vars={},$r0=this._startStructure(318);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(320);this._appendStructure($r1,this.exactly("\""));this._appendStructure($r1,this.exactly("\""));this._appendStructure($r1,this.exactly("\""));"\"\"\"";$vars.cs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(325);this._appendStructure($r2,this._not(function(){var $r3=this._startStructure(329);this._appendStructure($r3,this.exactly("\""));this._appendStructure($r3,this.exactly("\""));this._appendStructure($r3,this.exactly("\""));$r3.value="\"\"\"";return this._endStructure($r3);}));$r2.value=this._appendStructure($r2,this._apply("char"));return this._endStructure($r2);}));this._appendStructure($r1,this.exactly("\""));this._appendStructure($r1,this.exactly("\""));this._appendStructure($r1,this.exactly("\""));"\"\"\"";$r1.value=["string",$vars.cs.join("")];return this._endStructure($r1);},function(){var $r1=this._startStructure(334);this._appendStructure($r1,this.exactly("\'"));$vars.cs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(341);$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(345);$r3.value=this._appendStructure($r3,this._apply("escapeChar"));return this._endStructure($r3);},function(){var $r3=this._startStructure(349);this._appendStructure($r3,this._not(function(){var $r4=this._startStructure(353);$r4.value=this._appendStructure($r4,this.exactly("\'"));return this._endStructure($r4);}));$r3.value=this._appendStructure($r3,this._apply("char"));return this._endStructure($r3);}));return this._endStructure($r2);}));this._appendStructure($r1,this.exactly("\'"));$r1.value=["string",$vars.cs.join("")];return this._endStructure($r1);},function(){var $r1=this._startStructure(362);this._appendStructure($r1,this.exactly("\""));$vars.cs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(369);$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(373);$r3.value=this._appendStructure($r3,this._apply("escapeChar"));return this._endStructure($r3);},function(){var $r3=this._startStructure(377);this._appendStructure($r3,this._not(function(){var $r4=this._startStructure(381);$r4.value=this._appendStructure($r4,this.exactly("\""));return this._endStructure($r4);}));$r3.value=this._appendStructure($r3,this._apply("char"));return this._endStructure($r3);}));return this._endStructure($r2);}));this._appendStructure($r1,this.exactly("\""));$r1.value=["string",$vars.cs.join("")];return this._endStructure($r1);},function(){var $r1=this._startStructure(390);this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(394);$r2.value=this._appendStructure($r2,this.exactly("#"));return this._endStructure($r2);},function(){var $r2=this._startStructure(398);$r2.value=this._appendStructure($r2,this.exactly("`"));return this._endStructure($r2);}));$vars.n=this._appendStructure($r1,this._apply("iName"));$r1.value=["string",$vars.n];return this._endStructure($r1);}));return this._endStructure($r0);},
"special":function(){var $elf=this,$vars={},$r0=this._startStructure(405);$vars.s=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(410);$r1.value=this._appendStructure($r1,this.exactly("("));return this._endStructure($r1);},function(){var $r1=this._startStructure(414);$r1.value=this._appendStructure($r1,this.exactly(")"));return this._endStructure($r1);},function(){var $r1=this._startStructure(418);$r1.value=this._appendStructure($r1,this.exactly("{"));return this._endStructure($r1);},function(){var $r1=this._startStructure(422);$r1.value=this._appendStructure($r1,this.exactly("}"));return this._endStructure($r1);},function(){var $r1=this._startStructure(426);$r1.value=this._appendStructure($r1,this.exactly("["));return this._endStructure($r1);},function(){var $r1=this._startStructure(430);$r1.value=this._appendStructure($r1,this.exactly("]"));return this._endStructure($r1);},function(){var $r1=this._startStructure(434);$r1.value=this._appendStructure($r1,this.exactly(","));return this._endStructure($r1);},function(){var $r1=this._startStructure(438);$r1.value=this._appendStructure($r1,this.exactly(";"));return this._endStructure($r1);},function(){var $r1=this._startStructure(442);$r1.value=this._appendStructure($r1,this.exactly("?"));return this._endStructure($r1);},function(){var $r1=this._startStructure(446);$r1.value=this._appendStructure($r1,this.exactly(":"));return this._endStructure($r1);},function(){var $r1=this._startStructure(450);this._appendStructure($r1,this.exactly("!"));this._appendStructure($r1,this.exactly("="));this._appendStructure($r1,this.exactly("="));$r1.value="!==";return this._endStructure($r1);},function(){var $r1=this._startStructure(452);this._appendStructure($r1,this.exactly("!"));this._appendStructure($r1,this.exactly("="));$r1.value="!=";return this._endStructure($r1);},function(){var $r1=this._startStructure(454);this._appendStructure($r1,this.exactly("="));this._appendStructure($r1,this.exactly("="));this._appendStructure($r1,this.exactly("="));$r1.value="===";return this._endStructure($r1);},function(){var $r1=this._startStructure(456);this._appendStructure($r1,this.exactly("="));this._appendStructure($r1,this.exactly("="));$r1.value="==";return this._endStructure($r1);},function(){var $r1=this._startStructure(458);this._appendStructure($r1,this.exactly("="));$r1.value="=";return this._endStructure($r1);},function(){var $r1=this._startStructure(460);this._appendStructure($r1,this.exactly(">"));this._appendStructure($r1,this.exactly("="));$r1.value=">=";return this._endStructure($r1);},function(){var $r1=this._startStructure(462);$r1.value=this._appendStructure($r1,this.exactly(">"));return this._endStructure($r1);},function(){var $r1=this._startStructure(466);this._appendStructure($r1,this.exactly("<"));this._appendStructure($r1,this.exactly("="));$r1.value="<=";return this._endStructure($r1);},function(){var $r1=this._startStructure(468);$r1.value=this._appendStructure($r1,this.exactly("<"));return this._endStructure($r1);},function(){var $r1=this._startStructure(472);this._appendStructure($r1,this.exactly("+"));this._appendStructure($r1,this.exactly("+"));$r1.value="++";return this._endStructure($r1);},function(){var $r1=this._startStructure(474);this._appendStructure($r1,this.exactly("+"));this._appendStructure($r1,this.exactly("="));$r1.value="+=";return this._endStructure($r1);},function(){var $r1=this._startStructure(476);$r1.value=this._appendStructure($r1,this.exactly("+"));return this._endStructure($r1);},function(){var $r1=this._startStructure(480);this._appendStructure($r1,this.exactly("-"));this._appendStructure($r1,this.exactly("-"));$r1.value="--";return this._endStructure($r1);},function(){var $r1=this._startStructure(482);this._appendStructure($r1,this.exactly("-"));this._appendStructure($r1,this.exactly("="));$r1.value="-=";return this._endStructure($r1);},function(){var $r1=this._startStructure(484);$r1.value=this._appendStructure($r1,this.exactly("-"));return this._endStructure($r1);},function(){var $r1=this._startStructure(488);this._appendStructure($r1,this.exactly("*"));this._appendStructure($r1,this.exactly("="));$r1.value="*=";return this._endStructure($r1);},function(){var $r1=this._startStructure(490);$r1.value=this._appendStructure($r1,this.exactly("*"));return this._endStructure($r1);},function(){var $r1=this._startStructure(494);this._appendStructure($r1,this.exactly("/"));this._appendStructure($r1,this.exactly("="));$r1.value="/=";return this._endStructure($r1);},function(){var $r1=this._startStructure(496);$r1.value=this._appendStructure($r1,this.exactly("/"));return this._endStructure($r1);},function(){var $r1=this._startStructure(500);this._appendStructure($r1,this.exactly("%"));this._appendStructure($r1,this.exactly("="));$r1.value="%=";return this._endStructure($r1);},function(){var $r1=this._startStructure(502);$r1.value=this._appendStructure($r1,this.exactly("%"));return this._endStructure($r1);},function(){var $r1=this._startStructure(506);this._appendStructure($r1,this.exactly("&"));this._appendStructure($r1,this.exactly("&"));this._appendStructure($r1,this.exactly("="));$r1.value="&&=";return this._endStructure($r1);},function(){var $r1=this._startStructure(508);this._appendStructure($r1,this.exactly("&"));this._appendStructure($r1,this.exactly("&"));$r1.value="&&";return this._endStructure($r1);},function(){var $r1=this._startStructure(510);this._appendStructure($r1,this.exactly("|"));this._appendStructure($r1,this.exactly("|"));this._appendStructure($r1,this.exactly("="));$r1.value="||=";return this._endStructure($r1);},function(){var $r1=this._startStructure(512);this._appendStructure($r1,this.exactly("|"));this._appendStructure($r1,this.exactly("|"));$r1.value="||";return this._endStructure($r1);},function(){var $r1=this._startStructure(514);$r1.value=this._appendStructure($r1,this.exactly("."));return this._endStructure($r1);},function(){var $r1=this._startStructure(518);$r1.value=this._appendStructure($r1,this.exactly("!"));return this._endStructure($r1);}));$r0.value=[$vars.s,$vars.s];return this._endStructure($r0);},
"tok":function(){var $elf=this,$vars={},$r0=this._startStructure(522);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(529);$r1.value=this._appendStructure($r1,this._apply("name"));return this._endStructure($r1);},function(){var $r1=this._startStructure(533);$r1.value=this._appendStructure($r1,this._apply("keyword"));return this._endStructure($r1);},function(){var $r1=this._startStructure(537);$r1.value=this._appendStructure($r1,this._apply("number"));return this._endStructure($r1);},function(){var $r1=this._startStructure(541);$r1.value=this._appendStructure($r1,this._apply("str"));return this._endStructure($r1);},function(){var $r1=this._startStructure(545);$r1.value=this._appendStructure($r1,this._apply("special"));return this._endStructure($r1);}));return this._endStructure($r0);},
"toks":function(){var $elf=this,$vars={},$r0=this._startStructure(549);$vars.ts=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(554);$r1.value=this._appendStructure($r1,this._apply("token"));return this._endStructure($r1);}));this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.end());$r0.value=$vars.ts;return this._endStructure($r0);},
"token":function(){var $elf=this,$vars={},$r0=this._startStructure(562);$vars.tt=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r0,this._apply("tok"));this._pred(($vars.t[(0)] == $vars.tt));$r0.value=$vars.t[(1)];return this._endStructure($r0);},
"spacesNoNl":function(){var $elf=this,$vars={},$r0=this._startStructure(569);$r0.value=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(571);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(575);$r2.value=this._appendStructure($r2,this.exactly("\n"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("space"));return this._endStructure($r1);}));return this._endStructure($r0);},
"expr":function(){var $elf=this,$vars={},$r0=this._startStructure(582);$vars.e=this._appendStructure($r0,this._apply("orExpr"));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(590);this._appendStructure($r1,this._applyWithArgs("token","?"));$vars.t=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",":"));$vars.f=this._appendStructure($r1,this._apply("expr"));$r1.value=["condExpr",$vars.e,$vars.t,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(602);this._appendStructure($r1,this._applyWithArgs("token","="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["set",$vars.e,$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(609);this._appendStructure($r1,this._applyWithArgs("token","+="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"+",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(616);this._appendStructure($r1,this._applyWithArgs("token","-="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"-",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(623);this._appendStructure($r1,this._applyWithArgs("token","*="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"*",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(630);this._appendStructure($r1,this._applyWithArgs("token","/="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"/",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(637);this._appendStructure($r1,this._applyWithArgs("token","%="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"%",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(644);this._appendStructure($r1,this._applyWithArgs("token","&&="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"&&",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(651);this._appendStructure($r1,this._applyWithArgs("token","||="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"||",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(658);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.e;return this._endStructure($r1);}));return this._endStructure($r0);},
"orExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(662);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(664);$vars.x=this._appendStructure($r1,this._apply("orExpr"));this._appendStructure($r1,this._applyWithArgs("token","||"));$vars.y=this._appendStructure($r1,this._apply("andExpr"));$r1.value=["binop","||",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(674);$r1.value=this._appendStructure($r1,this._apply("andExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"andExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(678);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(680);$vars.x=this._appendStructure($r1,this._apply("andExpr"));this._appendStructure($r1,this._applyWithArgs("token","&&"));$vars.y=this._appendStructure($r1,this._apply("eqExpr"));$r1.value=["binop","&&",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(690);$r1.value=this._appendStructure($r1,this._apply("eqExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"eqExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(694);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(696);$vars.x=this._appendStructure($r1,this._apply("eqExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(704);this._appendStructure($r2,this._applyWithArgs("token","=="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","==",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(711);this._appendStructure($r2,this._applyWithArgs("token","!="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","!=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(718);this._appendStructure($r2,this._applyWithArgs("token","==="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","===",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(725);this._appendStructure($r2,this._applyWithArgs("token","!=="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","!==",$vars.x,$vars.y];return this._endStructure($r2);}));return this._endStructure($r1);},function(){var $r1=this._startStructure(732);$r1.value=this._appendStructure($r1,this._apply("relExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"relExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(736);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(738);$vars.x=this._appendStructure($r1,this._apply("relExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(746);this._appendStructure($r2,this._applyWithArgs("token",">"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop",">",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(753);this._appendStructure($r2,this._applyWithArgs("token",">="));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop",">=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(760);this._appendStructure($r2,this._applyWithArgs("token","<"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","<",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(767);this._appendStructure($r2,this._applyWithArgs("token","<="));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","<=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(774);this._appendStructure($r2,this._applyWithArgs("token","instanceof"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","instanceof",$vars.x,$vars.y];return this._endStructure($r2);}));return this._endStructure($r1);},function(){var $r1=this._startStructure(781);$r1.value=this._appendStructure($r1,this._apply("addExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"addExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(785);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(787);$vars.x=this._appendStructure($r1,this._apply("addExpr"));this._appendStructure($r1,this._applyWithArgs("token","+"));$vars.y=this._appendStructure($r1,this._apply("mulExpr"));$r1.value=["binop","+",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(797);$vars.x=this._appendStructure($r1,this._apply("addExpr"));this._appendStructure($r1,this._applyWithArgs("token","-"));$vars.y=this._appendStructure($r1,this._apply("mulExpr"));$r1.value=["binop","-",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(807);$r1.value=this._appendStructure($r1,this._apply("mulExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"mulExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(811);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(813);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","*"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","*",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(823);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","/"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","/",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(833);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","%"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","%",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(843);$r1.value=this._appendStructure($r1,this._apply("unary"));return this._endStructure($r1);}));return this._endStructure($r0);},
"unary":function(){var $elf=this,$vars={},$r0=this._startStructure(847);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(849);this._appendStructure($r1,this._applyWithArgs("token","-"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["unop","-",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(856);this._appendStructure($r1,this._applyWithArgs("token","+"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["unop","+",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(863);this._appendStructure($r1,this._applyWithArgs("token","++"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["preop","++",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(870);this._appendStructure($r1,this._applyWithArgs("token","--"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["preop","--",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(877);this._appendStructure($r1,this._applyWithArgs("token","!"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","!",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(884);this._appendStructure($r1,this._applyWithArgs("token","void"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","void",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(891);this._appendStructure($r1,this._applyWithArgs("token","delete"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","delete",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(898);this._appendStructure($r1,this._applyWithArgs("token","typeof"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","typeof",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(905);$r1.value=this._appendStructure($r1,this._apply("postfix"));return this._endStructure($r1);}));return this._endStructure($r0);},
"postfix":function(){var $elf=this,$vars={},$r0=this._startStructure(909);$vars.p=this._appendStructure($r0,this._apply("primExpr"));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(917);this._appendStructure($r1,this._apply("spacesNoNl"));this._appendStructure($r1,this._applyWithArgs("token","++"));$r1.value=["postop","++",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(923);this._appendStructure($r1,this._apply("spacesNoNl"));this._appendStructure($r1,this._applyWithArgs("token","--"));$r1.value=["postop","--",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(929);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.p;return this._endStructure($r1);}));return this._endStructure($r0);},
"primExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(933);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(935);$vars.p=this._appendStructure($r1,this._apply("primExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(943);this._appendStructure($r2,this._applyWithArgs("token","["));$vars.i=this._appendStructure($r2,this._apply("expr"));this._appendStructure($r2,this._applyWithArgs("token","]"));$r2.value=["getp",$vars.i,$vars.p];return this._endStructure($r2);},function(){var $r2=this._startStructure(952);this._appendStructure($r2,this._applyWithArgs("token","."));$vars.m=this._appendStructure($r2,this._applyWithArgs("token","name"));this._appendStructure($r2,this._applyWithArgs("token","("));$vars.as=this._appendStructure($r2,this._applyWithArgs("listOf","expr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=["send",$vars.m,$vars.p].concat($vars.as);return this._endStructure($r2);},function(){var $r2=this._startStructure(966);this._appendStructure($r2,this._applyWithArgs("token","."));$vars.f=this._appendStructure($r2,this._applyWithArgs("token","name"));$r2.value=["getp",["string",$vars.f],$vars.p];return this._endStructure($r2);},function(){var $r2=this._startStructure(973);this._appendStructure($r2,this._applyWithArgs("token","("));$vars.as=this._appendStructure($r2,this._applyWithArgs("listOf","expr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=["call",$vars.p].concat($vars.as);return this._endStructure($r2);}));return this._endStructure($r1);},function(){var $r1=this._startStructure(982);$r1.value=this._appendStructure($r1,this._apply("primExprHd"));return this._endStructure($r1);}));return this._endStructure($r0);},
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(986);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(988);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.e;return this._endStructure($r1);},function(){var $r1=this._startStructure(997);this._appendStructure($r1,this._applyWithArgs("token","this"));$r1.value=["this"];return this._endStructure($r1);},function(){var $r1=this._startStructure(1001);$vars.n=this._appendStructure($r1,this._applyWithArgs("token","name"));$r1.value=["get",$vars.n];return this._endStructure($r1);},function(){var $r1=this._startStructure(1006);$vars.n=this._appendStructure($r1,this._applyWithArgs("token","number"));$r1.value=["number",$vars.n];return this._endStructure($r1);},function(){var $r1=this._startStructure(1011);$vars.s=this._appendStructure($r1,this._applyWithArgs("token","string"));$r1.value=["string",$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(1016);this._appendStructure($r1,this._applyWithArgs("token","function"));$r1.value=this._appendStructure($r1,this._apply("funcRest"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1023);this._appendStructure($r1,this._applyWithArgs("token","new"));$vars.e=this._appendStructure($r1,this._apply("primExpr"));$r1.value=["new",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(1030);this._appendStructure($r1,this._applyWithArgs("token","["));$vars.es=this._appendStructure($r1,this._applyWithArgs("enum","expr",","));this._appendStructure($r1,this._applyWithArgs("token","]"));$r1.value=["arr"].concat($vars.es);return this._endStructure($r1);},function(){var $r1=this._startStructure(1039);$r1.value=this._appendStructure($r1,this._apply("json"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1043);$r1.value=this._appendStructure($r1,this._apply("re"));return this._endStructure($r1);}));return this._endStructure($r0);},
"json":function(){var $elf=this,$vars={},$r0=this._startStructure(1047);this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.bs=this._appendStructure($r0,this._applyWithArgs("enum","jsonBinding",","));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["json"].concat($vars.bs);return this._endStructure($r0);},
"jsonBinding":function(){var $elf=this,$vars={},$r0=this._startStructure(1056);$vars.n=this._appendStructure($r0,this._apply("jsonPropName"));this._appendStructure($r0,this._applyWithArgs("token",":"));$vars.v=this._appendStructure($r0,this._apply("expr"));$r0.value=["binding",$vars.n,$vars.v];return this._endStructure($r0);},
"jsonPropName":function(){var $elf=this,$vars={},$r0=this._startStructure(1066);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1068);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","name"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1072);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","number"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1076);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","string"));return this._endStructure($r1);}));return this._endStructure($r0);},
"re":function(){var $elf=this,$vars={},$r0=this._startStructure(1080);this._appendStructure($r0,this._apply("spaces"));$vars.x=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(1087);this._appendStructure($r1,this.exactly("/"));this._appendStructure($r1,this._apply("reBody"));this._appendStructure($r1,this.exactly("/"));$r1.value=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(1098);$r2.value=this._appendStructure($r2,this._apply("reFlag"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=["regExpr",$vars.x];return this._endStructure($r0);},
"reBody":function(){var $elf=this,$vars={},$r0=this._startStructure(1102);this._appendStructure($r0,this._apply("re1stChar"));$r0.value=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1109);$r1.value=this._appendStructure($r1,this._apply("reChar"));return this._endStructure($r1);}));return this._endStructure($r0);},
"re1stChar":function(){var $elf=this,$vars={},$r0=this._startStructure(1113);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1115);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(1119);$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(1123);$r3.value=this._appendStructure($r3,this.exactly("*"));return this._endStructure($r3);},function(){var $r3=this._startStructure(1127);$r3.value=this._appendStructure($r3,this.exactly("\\"));return this._endStructure($r3);},function(){var $r3=this._startStructure(1131);$r3.value=this._appendStructure($r3,this.exactly("/"));return this._endStructure($r3);},function(){var $r3=this._startStructure(1135);$r3.value=this._appendStructure($r3,this.exactly("["));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("reNonTerm"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1142);$r1.value=this._appendStructure($r1,this._apply("escapeChar"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1146);$r1.value=this._appendStructure($r1,this._apply("reClass"));return this._endStructure($r1);}));return this._endStructure($r0);},
"reChar":function(){var $elf=this,$vars={},$r0=this._startStructure(1150);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1152);$r1.value=this._appendStructure($r1,this._apply("re1stChar"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1156);$r1.value=this._appendStructure($r1,this.exactly("*"));return this._endStructure($r1);}));return this._endStructure($r0);},
"reNonTerm":function(){var $elf=this,$vars={},$r0=this._startStructure(1160);this._appendStructure($r0,this._not(function(){var $r1=this._startStructure(1164);$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1168);$r2.value=this._appendStructure($r2,this.exactly("\n"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1172);$r2.value=this._appendStructure($r2,this.exactly("\r"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=this._appendStructure($r0,this._apply("char"));return this._endStructure($r0);},
"reClass":function(){var $elf=this,$vars={},$r0=this._startStructure(1179);this._appendStructure($r0,this.exactly("["));this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1185);$r1.value=this._appendStructure($r1,this._apply("reClassChar"));return this._endStructure($r1);}));$r0.value=this._appendStructure($r0,this.exactly("]"));return this._endStructure($r0);},
"reClassChar":function(){var $elf=this,$vars={},$r0=this._startStructure(1192);this._appendStructure($r0,this._not(function(){var $r1=this._startStructure(1196);$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1200);$r2.value=this._appendStructure($r2,this.exactly("["));return this._endStructure($r2);},function(){var $r2=this._startStructure(1204);$r2.value=this._appendStructure($r2,this.exactly("]"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=this._appendStructure($r0,this._apply("reChar"));return this._endStructure($r0);},
"reFlag":function(){var $elf=this,$vars={},$r0=this._startStructure(1211);$r0.value=this._appendStructure($r0,this._apply("nameFirst"));return this._endStructure($r0);},
"formal":function(){var $elf=this,$vars={},$r0=this._startStructure(1213);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._applyWithArgs("token","name"));return this._endStructure($r0);},
"funcRest":function(){var $elf=this,$vars={},$r0=this._startStructure(1220);this._appendStructure($r0,this._applyWithArgs("token","("));$vars.fs=this._appendStructure($r0,this._applyWithArgs("listOf","formal",","));this._appendStructure($r0,this._applyWithArgs("token",")"));this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.body=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["func",$vars.fs,$vars.body];return this._endStructure($r0);},
"sc":function(){var $elf=this,$vars={},$r0=this._startStructure(1236);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1238);this._appendStructure($r1,this._apply("spacesNoNl"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1245);$r2.value=this._appendStructure($r2,this.exactly("\n"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1249);$r2.value=this._appendStructure($r2,this._lookahead(function(){var $r3=this._startStructure(1253);$r3.value=this._appendStructure($r3,this.exactly("}"));return this._endStructure($r3);}));return this._endStructure($r2);},function(){var $r2=this._startStructure(1257);$r2.value=this._appendStructure($r2,this.end());return this._endStructure($r2);}));return this._endStructure($r1);},function(){var $r1=this._startStructure(1261);$r1.value=this._appendStructure($r1,this._applyWithArgs("token",";"));return this._endStructure($r1);}));return this._endStructure($r0);},
"varBinder":function(){var $elf=this,$vars={},$r0=this._startStructure(1265);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1267);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","var"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1271);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","let"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1275);$r1.value=this._appendStructure($r1,this._applyWithArgs("token","const"));return this._endStructure($r1);}));return this._endStructure($r0);},
"varBinding":function(){var $elf=this,$vars={},$r0=this._startStructure(1279);$vars.n=this._appendStructure($r0,this._applyWithArgs("token","name"));$vars.v=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1287);this._appendStructure($r1,this._applyWithArgs("token","="));$r1.value=this._appendStructure($r1,this._apply("expr"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1294);this._appendStructure($r1,this._apply("empty"));$r1.value=["get","undefined"];return this._endStructure($r1);}));$r0.value=["assignVar",$vars.n,$vars.v];return this._endStructure($r0);},
"block":function(){var $elf=this,$vars={},$r0=this._startStructure(1298);this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.ss=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["begin",$vars.ss];return this._endStructure($r0);},
"stmt":function(){var $elf=this,$vars={},$r0=this._startStructure(1307);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1309);$r1.value=this._appendStructure($r1,this._apply("block"));return this._endStructure($r1);},function(){var $r1=this._startStructure(1313);$vars.decl=this._appendStructure($r1,this._apply("varBinder"));$vars.bs=this._appendStructure($r1,this._applyWithArgs("listOf","varBinding",","));this._appendStructure($r1,this._apply("sc"));$r1.value=["beginVars",$vars.decl].concat($vars.bs);return this._endStructure($r1);},function(){var $r1=this._startStructure(1323);this._appendStructure($r1,this._applyWithArgs("token","if"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.t=this._appendStructure($r1,this._apply("stmt"));$vars.f=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1340);this._appendStructure($r2,this._applyWithArgs("token","else"));$r2.value=this._appendStructure($r2,this._apply("stmt"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1347);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));$r1.value=["if",$vars.c,$vars.t,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(1351);this._appendStructure($r1,this._applyWithArgs("token","while"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["while",$vars.c,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(1365);this._appendStructure($r1,this._applyWithArgs("token","do"));$vars.s=this._appendStructure($r1,this._apply("stmt"));this._appendStructure($r1,this._applyWithArgs("token","while"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));this._appendStructure($r1,this._apply("sc"));$r1.value=["doWhile",$vars.s,$vars.c];return this._endStructure($r1);},function(){var $r1=this._startStructure(1383);this._appendStructure($r1,this._applyWithArgs("token","for"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.i=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1392);$vars.decl=this._appendStructure($r2,this._apply("varBinder"));$vars.bs=this._appendStructure($r2,this._applyWithArgs("listOf","varBinding",","));$r2.value=["beginVars",$vars.decl].concat($vars.bs);return this._endStructure($r2);},function(){var $r2=this._startStructure(1400);$r2.value=this._appendStructure($r2,this._apply("expr"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1404);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",";"));$vars.c=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1413);$r2.value=this._appendStructure($r2,this._apply("expr"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1417);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","true"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",";"));$vars.u=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1426);$r2.value=this._appendStructure($r2,this._apply("expr"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1430);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["for",$vars.i,$vars.c,$vars.u,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(1439);this._appendStructure($r1,this._applyWithArgs("token","for"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.v=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1448);$vars.decl=this._appendStructure($r2,this._apply("varBinder"));$vars.n=this._appendStructure($r2,this._applyWithArgs("token","name"));$r2.value=["beginVars",$vars.decl,["noAssignVar",$vars.n]];return this._endStructure($r2);},function(){var $r2=this._startStructure(1456);$r2.value=this._appendStructure($r2,this._apply("expr"));return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token","in"));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["forIn",$vars.v,$vars.e,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(1470);this._appendStructure($r1,this._applyWithArgs("token","switch"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.cs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(1486);$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(1490);this._appendStructure($r3,this._applyWithArgs("token","case"));$vars.c=this._appendStructure($r3,this._apply("expr"));this._appendStructure($r3,this._applyWithArgs("token",":"));$vars.cs=this._appendStructure($r3,this._apply("srcElems"));$r3.value=["case",$vars.c,["begin",$vars.cs]];return this._endStructure($r3);},function(){var $r3=this._startStructure(1502);this._appendStructure($r3,this._applyWithArgs("token","default"));this._appendStructure($r3,this._applyWithArgs("token",":"));$vars.cs=this._appendStructure($r3,this._apply("srcElems"));$r3.value=["default",["begin",$vars.cs]];return this._endStructure($r3);}));return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=["switch",$vars.e].concat($vars.cs);return this._endStructure($r1);},function(){var $r1=this._startStructure(1513);this._appendStructure($r1,this._applyWithArgs("token","break"));this._appendStructure($r1,this._apply("sc"));$r1.value=["break"];return this._endStructure($r1);},function(){var $r1=this._startStructure(1519);this._appendStructure($r1,this._applyWithArgs("token","continue"));this._appendStructure($r1,this._apply("sc"));$r1.value=["continue"];return this._endStructure($r1);},function(){var $r1=this._startStructure(1525);this._appendStructure($r1,this._applyWithArgs("token","throw"));this._appendStructure($r1,this._apply("spacesNoNl"));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));$r1.value=["throw",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(1536);this._appendStructure($r1,this._applyWithArgs("token","try"));$vars.t=this._appendStructure($r1,this._apply("block"));this._appendStructure($r1,this._applyWithArgs("token","catch"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._applyWithArgs("token","name"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.c=this._appendStructure($r1,this._apply("block"));$vars.f=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1558);this._appendStructure($r2,this._applyWithArgs("token","finally"));$r2.value=this._appendStructure($r2,this._apply("block"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1565);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));$r1.value=["try",$vars.t,$vars.e,$vars.c,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(1569);this._appendStructure($r1,this._applyWithArgs("token","return"));$vars.e=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1576);$r2.value=this._appendStructure($r2,this._apply("expr"));return this._endStructure($r2);},function(){var $r2=this._startStructure(1580);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._apply("sc"));$r1.value=["return",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(1586);this._appendStructure($r1,this._applyWithArgs("token","with"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["with",$vars.x,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(1600);$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));$r1.value=$vars.e;return this._endStructure($r1);},function(){var $r1=this._startStructure(1607);this._appendStructure($r1,this._applyWithArgs("token",";"));$r1.value=["get","undefined"];return this._endStructure($r1);}));return this._endStructure($r0);},
"srcElem":function(){var $elf=this,$vars={},$r0=this._startStructure(1611);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1613);this._appendStructure($r1,this._applyWithArgs("token","function"));$vars.n=this._appendStructure($r1,this._applyWithArgs("token","name"));$vars.f=this._appendStructure($r1,this._apply("funcRest"));$r1.value=["assignVar",$vars.n,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(1623);$r1.value=this._appendStructure($r1,this._apply("stmt"));return this._endStructure($r1);}));return this._endStructure($r0);},
"srcElems":function(){var $elf=this,$vars={},$r0=this._startStructure(1627);$vars.ss=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1632);$r1.value=this._appendStructure($r1,this._apply("srcElem"));return this._endStructure($r1);}));$r0.value=["beginTop"].concat($vars.ss);return this._endStructure($r0);},
"topLevel":function(){var $elf=this,$vars={},$r0=this._startStructure(1636);$vars.r=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.end());$r0.value=$vars.r;return this._endStructure($r0);}});(BSJSParser["hexDigits"]="0123456789abcdef");(BSJSParser["keywords"]=({}));(keywords=["break","case","catch","continue","default","delete","do","else","finally","for","function","if","in","instanceof","new","return","switch","this","throw","try","typeof","var","void","while","with","ometa","let","const"]);for(var idx=(0);(idx < keywords["length"]);idx++){(BSJSParser["keywords"][keywords[idx]]=true);}(BSJSParser["_isKeyword"]=(function (k){return this["keywords"].hasOwnProperty(k);}));let BSJSTranslator=objectThatDelegatesTo(OMeta,{
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(1645);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(1649);$vars.t=this._getStructureValue(this.anything());$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"curlyTrans":function(){var $elf=this,$vars={},$r0=this._startStructure(1657);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1659);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(1663);this._appendStructure($r2,this.exactly("begin"));$r2.value=($vars.r=this._appendStructure($r2,this._apply("curlyTrans")));return this._endStructure($r2);}));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(1672);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(1676);this._appendStructure($r2,this.exactly("begin"));$r2.value=($vars.rs=this._appendStructure($r2,this._many(function(){var $r3=this._startStructure(1685);$r3.value=this._appendStructure($r3,this._apply("trans"));return this._endStructure($r3);})));return this._endStructure($r2);}));$r1.value=(("{" + $vars.rs.join(";")) + ";}");return this._endStructure($r1);},function(){var $r1=this._startStructure(1689);$vars.r=this._appendStructure($r1,this._apply("trans"));$r1.value=(("{" + $vars.r) + ";}");return this._endStructure($r1);}));return this._endStructure($r0);},
"this":function(){var $elf=this,$vars={},$r0=this._startStructure(1694);$r0.value="this";return this._endStructure($r0);},
"break":function(){var $elf=this,$vars={},$r0=this._startStructure(1697);$r0.value="break";return this._endStructure($r0);},
"continue":function(){var $elf=this,$vars={},$r0=this._startStructure(1700);$r0.value="continue";return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(1703);$vars.n=this._getStructureValue(this.anything());$r0.value=(("(" + $vars.n) + ")");return this._endStructure($r0);},
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(1706);$vars.s=this._getStructureValue(this.anything());$r0.value=$vars.s.toProgramString();return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(1709);$vars.s=this._getStructureValue(this.anything());$r0.value=$vars.s;return this._endStructure($r0);},
"regExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(1712);$vars.x=this._getStructureValue(this.anything());$r0.value=$vars.x;return this._endStructure($r0);},
"arr":function(){var $elf=this,$vars={},$r0=this._startStructure(1715);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1720);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=(("[" + $vars.xs.join(",")) + "]");return this._endStructure($r0);},
"unop":function(){var $elf=this,$vars={},$r0=this._startStructure(1724);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("(" + $vars.op) + " ") + $vars.x) + ")");return this._endStructure($r0);},
"getp":function(){var $elf=this,$vars={},$r0=this._startStructure(1730);$vars.fd=this._appendStructure($r0,this._apply("trans"));$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=((($vars.x + "[") + $vars.fd) + "]");return this._endStructure($r0);},
"get":function(){var $elf=this,$vars={},$r0=this._startStructure(1738);$vars.x=this._getStructureValue(this.anything());$r0.value=$vars.x;return this._endStructure($r0);},
"set":function(){var $elf=this,$vars={},$r0=this._startStructure(1741);$vars.lhs=this._appendStructure($r0,this._apply("trans"));$vars.rhs=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("(" + $vars.lhs) + "=") + $vars.rhs) + ")");return this._endStructure($r0);},
"mset":function(){var $elf=this,$vars={},$r0=this._startStructure(1749);$vars.lhs=this._appendStructure($r0,this._apply("trans"));$vars.op=this._getStructureValue(this.anything());$vars.rhs=this._appendStructure($r0,this._apply("trans"));$r0.value=((((("(" + $vars.lhs) + $vars.op) + "=") + $vars.rhs) + ")");return this._endStructure($r0);},
"binop":function(){var $elf=this,$vars={},$r0=this._startStructure(1758);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=(((((("(" + $vars.x) + " ") + $vars.op) + " ") + $vars.y) + ")");return this._endStructure($r0);},
"preop":function(){var $elf=this,$vars={},$r0=this._startStructure(1767);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=($vars.op + $vars.x);return this._endStructure($r0);},
"postop":function(){var $elf=this,$vars={},$r0=this._startStructure(1773);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=($vars.x + $vars.op);return this._endStructure($r0);},
"return":function(){var $elf=this,$vars={},$r0=this._startStructure(1779);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("return " + $vars.x);return this._endStructure($r0);},
"with":function(){var $elf=this,$vars={},$r0=this._startStructure(1784);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.s=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((("with(" + $vars.x) + ")") + $vars.s);return this._endStructure($r0);},
"if":function(){var $elf=this,$vars={},$r0=this._startStructure(1792);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.t=this._appendStructure($r0,this._apply("curlyTrans"));$vars.e=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((("if(" + $vars.cond) + ")") + $vars.t) + "else") + $vars.e);return this._endStructure($r0);},
"condExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(1803);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.t=this._appendStructure($r0,this._apply("trans"));$vars.e=this._appendStructure($r0,this._apply("trans"));$r0.value=(((((("(" + $vars.cond) + "?") + $vars.t) + ":") + $vars.e) + ")");return this._endStructure($r0);},
"while":function(){var $elf=this,$vars={},$r0=this._startStructure(1814);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((("while(" + $vars.cond) + ")") + $vars.body);return this._endStructure($r0);},
"doWhile":function(){var $elf=this,$vars={},$r0=this._startStructure(1822);$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$vars.cond=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("do" + $vars.body) + "while(") + $vars.cond) + ")");return this._endStructure($r0);},
"for":function(){var $elf=this,$vars={},$r0=this._startStructure(1830);$vars.init=this._appendStructure($r0,this._apply("trans"));$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.upd=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((((("for(" + $vars.init) + ";") + $vars.cond) + ";") + $vars.upd) + ")") + $vars.body);return this._endStructure($r0);},
"forIn":function(){var $elf=this,$vars={},$r0=this._startStructure(1844);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.arr=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((("for(" + $vars.x) + " in ") + $vars.arr) + ")") + $vars.body);return this._endStructure($r0);},
"beginTop":function(){var $elf=this,$vars={},$r0=this._startStructure(1855);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1860);$vars.x=this._appendStructure($r1,this._apply("trans"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(1868);this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(1872);$r3.value=this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));return this._endStructure($r3);},function(){var $r3=this._startStructure(1875);$r3.value=this._appendStructure($r3,this.end());return this._endStructure($r3);}));$r2.value=$vars.x;return this._endStructure($r2);},function(){var $r2=this._startStructure(1879);this._appendStructure($r2,this._apply("empty"));$r2.value=($vars.x + ";");return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=$vars.xs.join("");return this._endStructure($r0);},
"begin":function(){var $elf=this,$vars={},$r0=this._startStructure(1883);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1885);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());$r1.value=$vars.x;return this._endStructure($r1);},function(){var $r1=this._startStructure(1892);$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(1897);$vars.x=this._appendStructure($r2,this._apply("trans"));$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(1905);this._appendStructure($r3,this._or(function(){var $r4=this._startStructure(1909);$r4.value=this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));return this._endStructure($r4);},function(){var $r4=this._startStructure(1912);$r4.value=this._appendStructure($r4,this.end());return this._endStructure($r4);}));$r3.value=$vars.x;return this._endStructure($r3);},function(){var $r3=this._startStructure(1916);this._appendStructure($r3,this._apply("empty"));$r3.value=($vars.x + ";");return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=(("{" + $vars.xs.join("")) + "}");return this._endStructure($r1);}));return this._endStructure($r0);},
"beginVars":function(){var $elf=this,$vars={},$r0=this._startStructure(1920);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(1922);$vars.decl=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());$r1.value=(($vars.decl + " ") + $vars.x);return this._endStructure($r1);},function(){var $r1=this._startStructure(1930);$vars.decl=this._getStructureValue(this.anything());$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(1936);$r2.value=($vars.x=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=(($vars.decl + " ") + $vars.xs.join(","));return this._endStructure($r1);}));return this._endStructure($r0);},
"func":function(){var $elf=this,$vars={},$r0=this._startStructure(1942);$vars.args=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=(((("(function (" + $vars.args.join(",")) + ")") + $vars.body) + ")");return this._endStructure($r0);},
"call":function(){var $elf=this,$vars={},$r0=this._startStructure(1948);$vars.fn=this._appendStructure($r0,this._apply("trans"));$vars.args=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1956);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=((($vars.fn + "(") + $vars.args.join(",")) + ")");return this._endStructure($r0);},
"send":function(){var $elf=this,$vars={},$r0=this._startStructure(1960);$vars.msg=this._getStructureValue(this.anything());$vars.recv=this._appendStructure($r0,this._apply("trans"));$vars.args=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(1969);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=((((($vars.recv + ".") + $vars.msg) + "(") + $vars.args.join(",")) + ")");return this._endStructure($r0);},
"new":function(){var $elf=this,$vars={},$r0=this._startStructure(1973);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("new " + $vars.x);return this._endStructure($r0);},
"assignVar":function(){var $elf=this,$vars={},$r0=this._startStructure(1978);$vars.name=this._getStructureValue(this.anything());$vars.val=this._appendStructure($r0,this._apply("trans"));$r0.value=(($vars.name + "=") + $vars.val);return this._endStructure($r0);},
"noAssignVar":function(){var $elf=this,$vars={},$r0=this._startStructure(1984);$vars.name=this._getStructureValue(this.anything());$r0.value=$vars.name;return this._endStructure($r0);},
"throw":function(){var $elf=this,$vars={},$r0=this._startStructure(1987);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("throw " + $vars.x);return this._endStructure($r0);},
"try":function(){var $elf=this,$vars={},$r0=this._startStructure(1992);$vars.x=this._appendStructure($r0,this._apply("curlyTrans"));$vars.name=this._getStructureValue(this.anything());$vars.c=this._appendStructure($r0,this._apply("curlyTrans"));$vars.f=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((((("try " + $vars.x) + "catch(") + $vars.name) + ")") + $vars.c) + "finally") + $vars.f);return this._endStructure($r0);},
"json":function(){var $elf=this,$vars={},$r0=this._startStructure(2004);$vars.props=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2009);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=(("({" + $vars.props.join(",")) + "})");return this._endStructure($r0);},
"binding":function(){var $elf=this,$vars={},$r0=this._startStructure(2013);$vars.name=this._getStructureValue(this.anything());$vars.val=this._appendStructure($r0,this._apply("trans"));$r0.value=(($vars.name.toProgramString() + ": ") + $vars.val);return this._endStructure($r0);},
"switch":function(){var $elf=this,$vars={},$r0=this._startStructure(2019);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.cases=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2027);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=(((("switch(" + $vars.x) + "){") + $vars.cases.join(";")) + "}");return this._endStructure($r0);},
"case":function(){var $elf=this,$vars={},$r0=this._startStructure(2031);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=((("case " + $vars.x) + ": ") + $vars.y);return this._endStructure($r0);},
"default":function(){var $elf=this,$vars={},$r0=this._startStructure(2039);$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=("default: " + $vars.y);return this._endStructure($r0);}});let copyObject=(function (obj){let ret=({});for(let i in obj){(ret[i]=obj[i]);}return ret;});let jsAtLocation=(function (location,locals,expr){return [location,"Js",locals,expr];});let jsValue=(function (type,value){return jsAtLocation(null,({}),[type,value]);});let jsCode=(function (locals,expr){return jsAtLocation(null,copyObject(locals),expr);})
let BSSemActionParser=objectThatDelegatesTo(BSJSParser,{
"jsOmetaKeyword":function(){var $elf=this,$vars={},$r0=this._startStructure(2044);$vars.k=this._getStructureValue(this.anything());this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.exactly("@"));$vars.n=this._appendStructure($r0,this._apply("iName"));this._pred(($vars.k == $vars.n));$r0.value=$vars.k;return this._endStructure($r0);},
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(2055);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2057);this._appendStructure($r1,this._applyWithArgs("jsOmetaKeyword","location"));$r1.value=["Location"];return this._endStructure($r1);},function(){var $r1=this._startStructure(2061);$r1.value=this._appendStructure($r1,BSJSParser._superApplyWithArgs(this,"primExprHd"));return this._endStructure($r1);}));return this._endStructure($r0);},
"curlySemAction":function(){var $elf=this,$vars={},$r0=this._startStructure(2065);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2067);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.r=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(2078);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.ss=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(2085);$vars.s=this._appendStructure($r2,this._apply("srcElem"));this._appendStructure($r2,this._lookahead(function(){var $r3=this._startStructure(2092);$r3.value=this._appendStructure($r3,this._apply("srcElem"));return this._endStructure($r3);}));$r2.value=$vars.s;return this._endStructure($r2);}));$vars.s=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2099);$vars.r=this._appendStructure($r2,this._apply("expr"));this._appendStructure($r2,this._apply("sc"));$r2.value=["return",$vars.r];return this._endStructure($r2);},function(){var $r2=this._startStructure(2106);$r2.value=this._appendStructure($r2,this._apply("srcElem"));return this._endStructure($r2);}));$vars.ss.push($vars.s);this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=["send","call",["func",[],["begin"].concat($vars.ss)],["this"]];return this._endStructure($r1);}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure(2112);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2114);$r1.value=this._appendStructure($r1,this._apply("curlySemAction"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2118);$vars.r=this._appendStructure($r1,this._apply("primExpr"));this._appendStructure($r1,this._apply("spaces"));$r1.value=$vars.r;return this._endStructure($r1);}));return this._endStructure($r0);}});let BSOMetaParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this,$vars={},$r0=this._startStructure(2125);$vars.r=this._getStructureValue(this.anything());$vars.d=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._applyWithArgs("listOf",$vars.r,$vars.d));this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2134);$r1.value=this._appendStructure($r1,this._applyWithArgs("token",","));return this._endStructure($r1);},function(){var $r1=this._startStructure(2138);$r1.value=this._appendStructure($r1,this._apply("empty"));return this._endStructure($r1);}));$r0.value=$vars.v;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(2142);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2144);$r1.value=this._appendStructure($r1,BaseStrParser._superApplyWithArgs(this,"space"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2148);$r1.value=this._appendStructure($r1,this._applyWithArgs("fromTo","//","\n"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2152);$r1.value=this._appendStructure($r1,this._applyWithArgs("fromTo","/*","*/"));return this._endStructure($r1);}));return this._endStructure($r0);},
"nameFirst":function(){var $elf=this,$vars={},$r0=this._startStructure(2156);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2158);$r1.value=this._appendStructure($r1,this.exactly("_"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2162);$r1.value=this._appendStructure($r1,this.exactly("$"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2166);$r1.value=this._appendStructure($r1,this._apply("letter"));return this._endStructure($r1);}));return this._endStructure($r0);},
"nameRest":function(){var $elf=this,$vars={},$r0=this._startStructure(2170);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2172);$r1.value=this._appendStructure($r1,this._apply("nameFirst"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2176);$r1.value=this._appendStructure($r1,this._apply("digit"));return this._endStructure($r1);}));return this._endStructure($r0);},
"tsName":function(){var $elf=this,$vars={},$r0=this._startStructure(2180);$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(2182);this._appendStructure($r1,this._apply("nameFirst"));$r1.value=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(2189);$r2.value=this._appendStructure($r2,this._apply("nameRest"));return this._endStructure($r2);}));return this._endStructure($r1);}));return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(2193);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._apply("tsName"));return this._endStructure($r0);},
"hexDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(2200);$vars.x=this._appendStructure($r0,this._apply("char"));$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));$r0.value=$vars.v;return this._endStructure($r0);},
"eChar":function(){var $elf=this,$vars={},$r0=this._startStructure(2207);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2209);$vars.s=this._appendStructure($r1,this._consumedBy(function(){var $r2=this._startStructure(2214);this._appendStructure($r2,this.exactly("\\"));$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(2221);this._appendStructure($r3,this.exactly("u"));this._appendStructure($r3,this._apply("hexDigit"));this._appendStructure($r3,this._apply("hexDigit"));this._appendStructure($r3,this._apply("hexDigit"));$r3.value=this._appendStructure($r3,this._apply("hexDigit"));return this._endStructure($r3);},function(){var $r3=this._startStructure(2234);this._appendStructure($r3,this.exactly("x"));this._appendStructure($r3,this._apply("hexDigit"));$r3.value=this._appendStructure($r3,this._apply("hexDigit"));return this._endStructure($r3);},function(){var $r3=this._startStructure(2243);$r3.value=this._appendStructure($r3,this._apply("char"));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=unescape($vars.s);return this._endStructure($r1);},function(){var $r1=this._startStructure(2247);$r1.value=this._appendStructure($r1,this._apply("char"));return this._endStructure($r1);}));return this._endStructure($r0);},
"tsString":function(){var $elf=this,$vars={},$r0=this._startStructure(2251);this._appendStructure($r0,this.exactly("\'"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2258);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(2262);$r2.value=this._appendStructure($r2,this.exactly("\'"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));$r0.value=$vars.xs.join("");return this._endStructure($r0);},
"characters":function(){var $elf=this,$vars={},$r0=this._startStructure(2271);this._appendStructure($r0,this.exactly("`"));this._appendStructure($r0,this.exactly("`"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2280);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(2284);this._appendStructure($r2,this.exactly("\'"));$r2.value=this._appendStructure($r2,this.exactly("\'"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));this._appendStructure($r0,this.exactly("\'"));$r0.value=[this._extractLocation($r0),"App","seq",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"sCharacters":function(){var $elf=this,$vars={},$r0=this._startStructure(2298);this._appendStructure($r0,this.exactly("\""));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2305);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(2309);$r2.value=this._appendStructure($r2,this.exactly("\""));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\""));$r0.value=[this._extractLocation($r0),"App","token",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(2318);$vars.xs=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2323);this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2327);$r2.value=this._appendStructure($r2,this.exactly("#"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2331);$r2.value=this._appendStructure($r2,this.exactly("`"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("tsName"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2338);$r1.value=this._appendStructure($r1,this._apply("tsString"));return this._endStructure($r1);}));$r0.value=[this._extractLocation($r0),"App","exactly",jsValue("string",$vars.xs)];return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(2342);$vars.n=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(2347);this._appendStructure($r1,this._opt(function(){var $r2=this._startStructure(2351);$r2.value=this._appendStructure($r2,this.exactly("-"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2358);$r2.value=this._appendStructure($r2,this._apply("digit"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=[this._extractLocation($r0),"App","exactly",jsValue("number",$vars.n)];return this._endStructure($r0);},
"keyword":function(){var $elf=this,$vars={},$r0=this._startStructure(2362);$vars.xs=this._getStructureValue(this.anything());this._appendStructure($r0,this._applyWithArgs("token",$vars.xs));this._appendStructure($r0,this._not(function(){var $r1=this._startStructure(2369);$r1.value=this._appendStructure($r1,this._apply("letterOrDigit"));return this._endStructure($r1);}));$r0.value=$vars.xs;return this._endStructure($r0);},
"args":function(){var $elf=this,$vars={},$r0=this._startStructure(2373);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2375);this._appendStructure($r1,this.exactly("("));$vars.xs=this._appendStructure($r1,this._applyWithArgs("listOf","hostExpr",","));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.xs;return this._endStructure($r1);},function(){var $r1=this._startStructure(2384);this._appendStructure($r1,this._apply("empty"));$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"application":function(){var $elf=this,$vars={},$r0=this._startStructure(2388);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2390);this._appendStructure($r1,this._applyWithArgs("token","^"));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=[this._extractLocation($r1),"App","super",jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(2400);$vars.grm=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token","."));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=[this._extractLocation($r1),"App","foreign",jsCode(this["locals"],["get",$vars.grm]),jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(2413);$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=[this._extractLocation($r1),"App",$vars.rule].concat($vars.as);return this._endStructure($r1);}));return this._endStructure($r0);},
"hostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(2421);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"expr"));$r0.value=jsCode(this["locals"],$vars.r);return this._endStructure($r0);},
"curlyHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(2426);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"curlySemAction"));$r0.value=jsCode(this["locals"],$vars.r);return this._endStructure($r0);},
"primHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(2431);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"semAction"));$r0.value=jsCode(this["locals"],$vars.r);return this._endStructure($r0);},
"atomicHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(2436);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2438);$r1.value=this._appendStructure($r1,this._apply("curlyHostExpr"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2442);$r1.value=this._appendStructure($r1,this._apply("primHostExpr"));return this._endStructure($r1);}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure(2446);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2448);$r1.value=($vars.x=this._appendStructure($r1,this._apply("curlyHostExpr")));return this._endStructure($r1);},function(){var $r1=this._startStructure(2454);this._appendStructure($r1,this._applyWithArgs("token","!"));$r1.value=($vars.x=this._appendStructure($r1,this._apply("atomicHostExpr")));return this._endStructure($r1);}));return this._endStructure($r0);},
"arrSemAction":function(){var $elf=this,$vars={},$r0=this._startStructure(2463);this._appendStructure($r0,this._applyWithArgs("token","->"));$r0.value=($vars.x=this._appendStructure($r0,this._apply("atomicHostExpr")));return this._endStructure($r0);},
"semPred":function(){var $elf=this,$vars={},$r0=this._startStructure(2472);this._appendStructure($r0,this._applyWithArgs("token","?"));$vars.x=this._appendStructure($r0,this._apply("atomicHostExpr"));$r0.value=[this._extractLocation($r0),"Pred",$vars.x];return this._endStructure($r0);},
"expr":function(){var $elf=this,$vars={},$r0=this._startStructure(2479);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2481);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2489);this._appendStructure($r2,this._applyWithArgs("token","|"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"Or",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(2496);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2504);this._appendStructure($r2,this._applyWithArgs("token","||"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"XOr",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(2511);$r1.value=this._appendStructure($r1,this._applyWithArgs("expr5",false));return this._endStructure($r1);}));return this._endStructure($r0);},
"expr5":function(){var $elf=this,$vars={},$r0=this._startStructure(2515);$vars.ne=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2521);$vars.x=this._appendStructure($r1,this._apply("interleavePart"));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2529);this._appendStructure($r2,this._applyWithArgs("token","&&"));$r2.value=this._appendStructure($r2,this._apply("interleavePart"));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"Interleave",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(2536);$r1.value=this._appendStructure($r1,this._applyWithArgs("expr4",$vars.ne));return this._endStructure($r1);}));return this._endStructure($r0);},
"interleavePart":function(){var $elf=this,$vars={},$r0=this._startStructure(2540);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2542);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=["1",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(2551);$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));$r1.value=this._appendStructure($r1,this._applyWithArgs("modedIPart",$vars.part));return this._endStructure($r1);}));return this._endStructure($r0);},
"modedIPart":function(){var $elf=this,$vars={},$r0=this._startStructure(2559);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2561);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(2565);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(2572);this._appendStructure($r3,this.exactly("Many"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["*",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(2579);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(2583);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(2590);this._appendStructure($r3,this.exactly("Many1"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["+",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(2597);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(2601);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(2608);this._appendStructure($r3,this.exactly("Opt"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["?",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(2615);$vars.part=this._getStructureValue(this.anything());$r1.value=["1",$vars.part];return this._endStructure($r1);}));return this._endStructure($r0);},
"expr4":function(){var $elf=this,$vars={},$r0=this._startStructure(2618);$vars.ne=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2624);$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(2629);$r2.value=this._appendStructure($r2,this._apply("expr3"));return this._endStructure($r2);}));$vars.act=this._appendStructure($r1,this._apply("arrSemAction"));$r1.value=[this._extractLocation($r1),"And"].concat($vars.xs).concat([$vars.act]);return this._endStructure($r1);},function(){var $r1=this._startStructure(2636);this._pred($vars.ne);$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2642);$r2.value=this._appendStructure($r2,this._apply("expr3"));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"And"].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(2646);this._pred(($vars.ne == false));$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(2652);$r2.value=this._appendStructure($r2,this._apply("expr3"));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"And"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"optIter":function(){var $elf=this,$vars={},$r0=this._startStructure(2656);$vars.x=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2662);this._appendStructure($r1,this.exactly("*"));$r1.value=[this._extractLocation($r1),"Many",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2666);this._appendStructure($r1,this.exactly("+"));$r1.value=[this._extractLocation($r1),"Many1",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2670);this._appendStructure($r1,this.exactly("?"));$r1.value=[this._extractLocation($r1),"Opt",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2674);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"optBind":function(){var $elf=this,$vars={},$r0=this._startStructure(2678);$vars.x=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2684);this._appendStructure($r1,this.exactly(":"));$vars.n=this._appendStructure($r1,this._apply("name"));$r1.value=(function (){(this["locals"][$vars.n]=true);return [this._extractLocation($r1),"Set",$vars.n,$vars.x];}).call(this);return this._endStructure($r1);},function(){var $r1=this._startStructure(2691);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"expr3":function(){var $elf=this,$vars={},$r0=this._startStructure(2695);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2697);this._appendStructure($r1,this._applyWithArgs("token",":"));$vars.n=this._appendStructure($r1,this._apply("name"));$r1.value=(function (){(this["locals"][$vars.n]=true);return [this._extractLocation($r1),"Set",$vars.n,[null,"PopArg"]];}).call(this);return this._endStructure($r1);},function(){var $r1=this._startStructure(2704);$vars.e=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2709);$vars.x=this._appendStructure($r2,this._apply("expr2"));$r2.value=this._appendStructure($r2,this._applyWithArgs("optIter",$vars.x));return this._endStructure($r2);},function(){var $r2=this._startStructure(2717);$r2.value=this._appendStructure($r2,this._apply("semAction"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._applyWithArgs("optBind",$vars.e));return this._endStructure($r1);},function(){var $r1=this._startStructure(2724);$r1.value=this._appendStructure($r1,this._apply("semPred"));return this._endStructure($r1);}));return this._endStructure($r0);},
"expr2":function(){var $elf=this,$vars={},$r0=this._startStructure(2728);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2730);this._appendStructure($r1,this._applyWithArgs("token","~"));$vars.x=this._appendStructure($r1,this._apply("expr2"));$r1.value=[this._extractLocation($r1),"Not",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2737);this._appendStructure($r1,this._applyWithArgs("token","&"));$vars.x=this._appendStructure($r1,this._apply("expr1"));$r1.value=[this._extractLocation($r1),"Lookahead",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2744);$r1.value=this._appendStructure($r1,this._apply("expr1"));return this._endStructure($r1);}));return this._endStructure($r0);},
"expr1":function(){var $elf=this,$vars={},$r0=this._startStructure(2748);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2750);$r1.value=this._appendStructure($r1,this._apply("application"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2754);$vars.x=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2759);$r2.value=this._appendStructure($r2,this._applyWithArgs("keyword","undefined"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2763);$r2.value=this._appendStructure($r2,this._applyWithArgs("keyword","nil"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2767);$r2.value=this._appendStructure($r2,this._applyWithArgs("keyword","true"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2771);$r2.value=this._appendStructure($r2,this._applyWithArgs("keyword","false"));return this._endStructure($r2);}));$r1.value=[this._extractLocation($r1),"App","exactly",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2775);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2782);$r2.value=this._appendStructure($r2,this._apply("characters"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2786);$r2.value=this._appendStructure($r2,this._apply("sCharacters"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2790);$r2.value=this._appendStructure($r2,this._apply("string"));return this._endStructure($r2);},function(){var $r2=this._startStructure(2794);$r2.value=this._appendStructure($r2,this._apply("number"));return this._endStructure($r2);}));return this._endStructure($r1);},function(){var $r1=this._startStructure(2798);this._appendStructure($r1,this._applyWithArgs("token","["));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token","]"));$r1.value=[this._extractLocation($r1),"Form",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2807);this._appendStructure($r1,this._applyWithArgs("token","<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=[this._extractLocation($r1),"ConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2816);this._appendStructure($r1,this._applyWithArgs("token","@<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=[this._extractLocation($r1),"IdxConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(2825);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"ruleName":function(){var $elf=this,$vars={},$r0=this._startStructure(2834);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2836);$r1.value=this._appendStructure($r1,this._apply("name"));return this._endStructure($r1);},function(){var $r1=this._startStructure(2840);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._apply("tsString"));return this._endStructure($r1);}));return this._endStructure($r0);},
"rule":function(){var $elf=this,$vars={},$r0=this._startStructure(2847);this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(2851);$r1.value=($vars.n=this._appendStructure($r1,this._apply("ruleName")));return this._endStructure($r1);}));(this["locals"]=({}));$vars.x=this._appendStructure($r0,this._applyWithArgs("rulePart",$vars.n));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2863);this._appendStructure($r1,this._applyWithArgs("token",","));$r1.value=this._appendStructure($r1,this._applyWithArgs("rulePart",$vars.n));return this._endStructure($r1);}));$r0.value=[this._extractLocation($r0),"Rule",$vars.n,[this._extractLocation($r0),"Or",$vars.x].concat($vars.xs)];return this._endStructure($r0);},
"rulePart":function(){var $elf=this,$vars={},$r0=this._startStructure(2870);$vars.rn=this._getStructureValue(this.anything());$vars.n=this._appendStructure($r0,this._apply("ruleName"));this._pred(($vars.n == $vars.rn));$vars.b1=this._appendStructure($r0,this._applyWithArgs("expr4",false));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2883);this._appendStructure($r1,this._applyWithArgs("token","="));$vars.b2=this._appendStructure($r1,this._apply("expr"));$r1.value=[this._extractLocation($r1),"And",$vars.b1,$vars.b2];return this._endStructure($r1);},function(){var $r1=this._startStructure(2890);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.b1;return this._endStructure($r1);}));return this._endStructure($r0);},
"grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(2894);this._appendStructure($r0,this._applyWithArgs("keyword","ometa"));$vars.sn=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2901);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.sni=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.sni;return this._endStructure($r1);},function(){var $r1=this._startStructure(2910);this._appendStructure($r1,this._apply("empty"));$r1.value="OMeta";return this._endStructure($r1);}));this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.rs=this._appendStructure($r0,this._applyWithArgs("enum","rule",","));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaOptimizer,"optimizeGrammar",["Grammar",$vars.sn].concat($vars.rs)));return this._endStructure($r0);}});(BSOMetaParser["hexDigits"]="0123456789abcdef");let BSSemActionTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(2924);$r0.value=["this._extractLocation($r",this["_storeVal"],")"].join("");return this._endStructure($r0);},
"get":function(){var $elf=this,$vars={},$r0=this._startStructure(2927);$vars.n=this._getStructureValue(this.anything());$r0.value=this._renameVariable($vars.n);return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(2930);$vars.n=this._getStructureValue(this.anything());$r0.value=this._renameVariable($vars.n);return this._endStructure($r0);},
"jstrans":function(){var $elf=this,$vars={},$r0=this._startStructure(2933);$vars.storeVal=this._getStructureValue(this.anything());$vars.toRename=this._getStructureValue(this.anything());(function (){(this["_storeVal"]=$vars.storeVal);return (this["_toRename"]=$vars.toRename);}).call(this);$r0.value=this._appendStructure($r0,this._apply("trans"));return this._endStructure($r0);}});(BSSemActionTranslator["_renameVariable"]=(function (name){if(((name != "$elf") && this["_toRename"][name])){return ("$vars." + name);}else{undefined;}return name;}));let BSOMetaTranslator=objectThatDelegatesTo(OMeta,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(2940);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(2942);this._appendStructure($r1,this.exactly("super"));$vars.args=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(2949);$r2.value=this._appendStructure($r2,this._apply("transFn"));return this._endStructure($r2);}));$r1.value=[this["sName"],"._superApplyWithArgs(this,",$vars.args.join(","),")"].join("");return this._endStructure($r1);},function(){var $r1=this._startStructure(2953);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(2959);$r2.value=this._appendStructure($r2,this._apply("transFn"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(2966);this._pred(this._optimizedCall($vars.rule,$vars.args));$r2.value=["this.",this["_callables"][$vars.rule]["name"],"(",$vars.args.join(","),")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(2969);this._pred(($vars.args["length"] < (1)));$r2.value=["this._apply(\"",$vars.rule,"\")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(2972);$r2.value=["this._applyWithArgs(\"",$vars.rule,"\",",$vars.args.join(","),")"].join("");return this._endStructure($r2);}));return this._endStructure($r1);}));return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(2975);$vars.expr=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._pred(",$vars.expr,")"].join("");return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(2980);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2985);$r1.value=this._appendStructure($r1,this._apply("transFn"));return this._endStructure($r1);}));$r0.value=["this._or(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(2989);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(2994);$r1.value=this._appendStructure($r1,this._apply("transFn"));return this._endStructure($r1);}));$vars.xs.unshift(this["rName"].toProgramString());$r0.value=["this._xor(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(2998);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3000);$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(3005);$r2.value=this._appendStructure($r2,this._apply("transFn"));return this._endStructure($r2);}));$r1.value=$vars.xs.join(";");return this._endStructure($r1);},function(){var $r1=this._startStructure(3009);$r1.value="undefined";return this._endStructure($r1);}));return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(3012);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._opt(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(3017);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(3022);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many1(",$vars.x,")"].join("");return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(3027);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$vars.",$vars.n,"=",$vars.v].join("");return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(3033);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._not(",$vars.x,")"].join("");return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(3038);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._lookahead(",$vars.x,")"].join("");return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(3043);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._form(",$vars.x,")"].join("");return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3048);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._consumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3053);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._idxConsumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(3058);this["_storeVar"]++;$vars.cases=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3063);$r1.value=this._appendStructure($r1,this._apply("jtCase"));return this._endStructure($r1);}));this["_storeVar"]--;$r0.value=this.jumpTableCode($vars.cases);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(3067);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3072);$r1.value=this._appendStructure($r1,this._apply("intPart"));return this._endStructure($r1);}));$r0.value=["this._interleave(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"Function":function(){var $elf=this,$vars={},$r0=this._startStructure(3076);this["_storeVar"]++;$vars.x=this._appendStructure($r0,this._apply("transFn"));this["_storeVar"]--;$r0.value=["function(){",$vars.x,";}"].join("");return this._endStructure($r0);},
"FunctionStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(3081);this["_storeVar"]++;$vars.xs=this._appendStructure($r0,this._many1(function(){var $r1=this._startStructure(3086);$r1.value=this._appendStructure($r1,this._apply("transFn"));return this._endStructure($r1);}));this["_storeVar"]--;$r0.value=["function(){var $r",(this["_storeVar"] + (1)),"=this._startStructure(",this.getLocationId(),");",$vars.xs.join(";"),";return this._endStructure($r",(this["_storeVar"] + (1)),");}"].join("");return this._endStructure($r0);},
"ReturnStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(3090);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$r",this["_storeVar"],".value=",$vars.x].join("");return this._endStructure($r0);},
"Return":function(){var $elf=this,$vars={},$r0=this._startStructure(3095);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["return ",$vars.x].join("");return this._endStructure($r0);},
"Parenthesis":function(){var $elf=this,$vars={},$r0=this._startStructure(3100);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["(",$vars.x,")"].join("");return this._endStructure($r0);},
"Store":function(){var $elf=this,$vars={},$r0=this._startStructure(3105);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._appendStructure($r",this["_storeVar"],",",$vars.x,")"].join("");return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(3110);$vars.locals=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._applyWithArgs("transJs",$vars.locals));return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(3116);$r0.value="this._getStructureValue(this.anything())";return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(3119);$vars.name=this._getStructureValue(this.anything());(function (){(this["rName"]=$vars.name);return (this["_storeVar"]=(0));}).call(this);$vars.body=this._appendStructure($r0,this._apply("trans"));$r0.value=["\n\"",$vars.name,"\":function(){var $elf=this,","$vars={},","$r0=this._startStructure(",this.getLocationId(),");",$vars.body,";return this._endStructure($r0);}"].join("");return this._endStructure($r0);},
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(3125);$vars.sName=this._getStructureValue(this.anything());(function (){(this["sName"]=$vars.sName);return (this["_locations"]=[]);}).call(this);$vars.rules=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3131);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=["objectThatDelegatesTo(",$vars.sName,",{",$vars.rules.join(","),"})"].join("");return this._endStructure($r0);},
"intPart":function(){var $elf=this,$vars={},$r0=this._startStructure(3135);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3139);$vars.mode=this._getStructureValue(this.anything());$r1.value=($vars.part=this._appendStructure($r1,this._apply("transFn")));return this._endStructure($r1);}));$r0.value=(($vars.mode.toProgramString() + ",") + $vars.part);return this._endStructure($r0);},
"jtCase":function(){var $elf=this,$vars={},$r0=this._startStructure(3147);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3151);$vars.x=this._getStructureValue(this.anything());$r1.value=($vars.e=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));$r0.value=[$vars.x.toProgramString(),$vars.e];return this._endStructure($r0);},
"transJs":function(){var $elf=this,$vars={},$r0=this._startStructure(3159);$vars.locals=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionTranslator,"jstrans",this["_storeVar"],$vars.locals));return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(3165);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3169);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._getStructureValue(this.anything());this.pushLocation($vars.loc);$vars.ans=this._appendStructure($r1,this._apply($vars.t));$r1.value=this.popLocation();return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"transFn":function(){var $elf=this,$vars={},$r0=this._startStructure(3176);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=$vars.x;return this._endStructure($r0);}});(BSOMetaTranslator["_callables"]=({"anything": ({"name": "anything","nbArgs": (0)}),"apply": ({"name": "_apply","nbArgs": (1)}),"end": ({"name": "end","nbArgs": (0)}),"exactly": ({"name": "exactly","nbArgs": (1)}),"seq": ({"name": "seq","nbArgs": (1)})}));(BSOMetaTranslator["_optimizedCall"]=(function (rule,args){let c=this["_callables"][rule];return (c && (c["nbArgs"] == args["length"]));}));(BSOMetaTranslator["jumpTableCode"]=(function (cases){var buf=new StringBuffer();buf.nextPutAll((("(function(){var $r" + (this["_storeVar"] + (1))) + "=this._startStructure(-1);"));buf.nextPutAll((("switch(this._appendStructure($r" + (this["_storeVar"] + (1))) + ",this._apply(\'anything\'))){"));for(var i=(0);(i < cases["length"]);(i+=(1))){buf.nextPutAll((((("case " + cases[i][(0)]) + ":") + cases[i][(1)]) + ";break;"));}buf.nextPutAll((("default: throw fail}return this._endStructure($r" + (this["_storeVar"] + (1))) + ");}).call(this)"));return buf.contents();}));(BSOMetaTranslator["pushLocation"]=(function (location){if((location != null)){let locationId=createSourceMapId();addToSourseMap(locationId,location["start"],location["stop"]);this["_locations"].push(locationId);}else{this["_locations"].push(this["_locations"][(this["_locations"]["length"] - (1))]);};}));(BSOMetaTranslator["popLocation"]=(function (){this["_locations"].pop();}));(BSOMetaTranslator["getLocationId"]=(function (){return this["_locations"][(this["_locations"]["length"] - (1))];}))
let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(3181);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3183);$vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSOMetaParser,"grammar"));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(3188);$r1.value=this._appendStructure($r1,BSJSParser._superApplyWithArgs(this,"primExprHd"));return this._endStructure($r1);}));return this._endStructure($r0);}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(3192);$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaTranslator,"Grammar"));return this._endStructure($r0);}})
let BSNullOptimization=objectThatDelegatesTo(OMeta,{
"setHelped":function(){var $elf=this,$vars={},$r0=this._startStructure(3194);$r0.value=(this["_didSomething"]=true);return this._endStructure($r0);},
"helped":function(){var $elf=this,$vars={},$r0=this._startStructure(3197);$r0.value=this._pred(this["_didSomething"]);return this._endStructure($r0);},
"pushLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(3200);$vars.loc=this._getStructureValue(this.anything());$r0.value=this["_locations"].push($vars.loc);return this._endStructure($r0);},
"popLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(3203);$r0.value=this["_locations"].pop();return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(3206);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3210);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc));$vars.ans=this._appendStructure($r1,this._apply($vars.t));$r1.value=this._appendStructure($r1,this._apply("popLocation"));return this._endStructure($r1);}));$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(3223);$vars.x=this._appendStructure($r0,this._apply("trans"));this._appendStructure($r0,this._apply("helped"));$r0.value=$vars.x;return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(3230);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3236);$r1.value=this._appendStructure($r1,this.anything());return this._endStructure($r1);}));$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(3240);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(3243);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3248);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(3252);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3257);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(3261);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3266);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=["And"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(3270);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(3275);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(3280);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(3285);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("trans"));$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(3291);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(3296);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(3301);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3306);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3311);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(3316);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3321);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3325);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}));$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(3333);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3338);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3342);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}));$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(3350);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(3354);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(3357);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(3360);$vars.name=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._apply("trans"));$r0.value=["Rule",$vars.name,$vars.body];return this._endStructure($r0);}});(BSNullOptimization["initialize"]=(function (){(this["_didSomething"]=false);(this["_locations"]=[]);}));(BSNullOptimization["location"]=(function (){return this["_locations"][(this["_locations"]["length"] - (1))];}));let BSAssociativeOptimization=objectThatDelegatesTo(BSNullOptimization,{
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(3366);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3368);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(3377);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","And"));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(3382);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3384);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(3393);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","Or"));$r1.value=["Or"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(3398);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3400);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(3409);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","XOr"));$r1.value=["XOr"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"transInside":function(){var $elf=this,$vars={},$r0=this._startStructure(3414);$vars.t=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3420);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3424);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly($vars.t));$r2.value=($vars.xs=this._appendStructure($r2,this._applyWithArgs("transInside",$vars.t)));return this._endStructure($r2);}));$vars.ys=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t));this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.xs.concat($vars.ys);return this._endStructure($r1);},function(){var $r1=this._startStructure(3439);$vars.x=this._appendStructure($r1,this._apply("trans"));$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t));$r1.value=[$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(3447);$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);}});let BSSeqInliner=objectThatDelegatesTo(BSNullOptimization,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(3450);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3452);this._appendStructure($r1,this.exactly("seq"));this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3458);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("Js"));$vars.locals=this._getStructureValue(this.anything());$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(3467);this._appendStructure($r3,this.exactly("string"));$r3.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));this._appendStructure($r1,this.end());$vars.cs=this._appendStructure($r1,this._applyWithArgs("seqString",$vars.s));this._appendStructure($r1,this._apply("setHelped"));$r1.value=["And"].concat($vars.cs).concat([jsValue("string",$vars.s)]);return this._endStructure($r1);},function(){var $r1=this._startStructure(3481);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(3487);$r2.value=this._appendStructure($r2,this.anything());return this._endStructure($r2);}));$r1.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r1);}));return this._endStructure($r0);},
"inlineChar":function(){var $elf=this,$vars={},$r0=this._startStructure(3491);$vars.c=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaParser,"eChar"));$r0.value=[null,"App","exactly",jsValue("string",$vars.c)];return this._endStructure($r0);},
"seqString":function(){var $elf=this,$vars={},$r0=this._startStructure(3496);this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(3500);$vars.s=this._getStructureValue(this.anything());$r1.value=this._pred(((typeof $vars.s) === "string"));return this._endStructure($r1);}));this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3507);$r1.value=($vars.cs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(3513);$r2.value=this._appendStructure($r2,this._apply("inlineChar"));return this._endStructure($r2);})));return this._endStructure($r1);}));$r0.value=$vars.cs;return this._endStructure($r0);}});let JumpTable=(function (choiceOp,choice){(this["choiceOp"]=choiceOp);(this["choices"]=({}));this.add(choice);});(JumpTable["prototype"]["add"]=(function (choice){var c=choice[(0)],t=choice[(1)];if(this["choices"][c]){if((this["choices"][c][(0)] == this["choiceOp"])){this["choices"][c].push(t);}else{(this["choices"][c]=[this["choiceOp"],this["choices"][c],t]);};}else{(this["choices"][c]=t);};}));(JumpTable["prototype"]["toTree"]=(function (){var r=["JumpTable"],choiceKeys=ownPropertyNames(this["choices"]);for(var i=(0);(i < choiceKeys["length"]);(i+=(1))){r.push([choiceKeys[i],this["choices"][choiceKeys[i]]]);}return r;}));let BSJumpTableOptimization=objectThatDelegatesTo(BSNullOptimization,{
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(3517);$vars.cs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3522);$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(3526);$r2.value=this._appendStructure($r2,this._applyWithArgs("jtChoices","Or"));return this._endStructure($r2);},function(){var $r2=this._startStructure(3530);$r2.value=this._appendStructure($r2,this._apply("trans"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=["Or"].concat($vars.cs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(3534);$vars.cs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3539);$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(3543);$r2.value=this._appendStructure($r2,this._applyWithArgs("jtChoices","XOr"));return this._endStructure($r2);},function(){var $r2=this._startStructure(3547);$r2.value=this._appendStructure($r2,this._apply("trans"));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=["XOr"].concat($vars.cs);return this._endStructure($r0);},
"quotedString":function(){var $elf=this,$vars={},$r0=this._startStructure(3551);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3555);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r1,this.exactly("Js"));$r1.value=this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3563);this._appendStructure($r2,this.exactly("string"));$r2.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=$vars.s;return this._endStructure($r0);},
"jtChoice":function(){var $elf=this,$vars={},$r0=this._startStructure(3570);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3572);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3576);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"));this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(3583);$vars.l1=this._getStructureValue(this.anything());this._appendStructure($r3,this.exactly("App"));this._appendStructure($r3,this.exactly("exactly"));$r3.value=($vars.x=this._appendStructure($r3,this._apply("quotedString")));return this._endStructure($r3);}));$r2.value=($vars.rest=this._appendStructure($r2,this._many(function(){var $r3=this._startStructure(3600);$r3.value=this._appendStructure($r3,this.anything());return this._endStructure($r3);})));return this._endStructure($r2);}));$r1.value=[$vars.x,[$vars.l,"And"].concat($vars.rest)];return this._endStructure($r1);},function(){var $r1=this._startStructure(3604);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3608);$vars.l1=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("App"));this._appendStructure($r2,this.exactly("exactly"));$r2.value=($vars.x=this._appendStructure($r2,this._apply("quotedString")));return this._endStructure($r2);}));$r1.value=[$vars.x,jsValue("string",$vars.x)];return this._endStructure($r1);}));return this._endStructure($r0);},
"jtChoices":function(){var $elf=this,$vars={},$r0=this._startStructure(3620);$vars.op=this._getStructureValue(this.anything());$vars.c=this._appendStructure($r0,this._apply("jtChoice"));$vars.jt=new JumpTable($vars.op,$vars.c);this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3629);$vars.c=this._appendStructure($r1,this._apply("jtChoice"));$r1.value=$vars.jt.add($vars.c);return this._endStructure($r1);}));this._appendStructure($r0,this._apply("setHelped"));$r0.value=$vars.jt.toTree();return this._endStructure($r0);}});let BSFunctionOptimization=objectThatDelegatesTo(GenericMatcher,{
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(3636);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=$vars.x;return this._endStructure($r0);},
"pushLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(3641);$vars.loc=this._getStructureValue(this.anything());$r0.value=this["_locations"].push($vars.loc);return this._endStructure($r0);},
"popLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(3644);$r0.value=this["_locations"].pop();return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(3647);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3651);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc));$vars.ans=this._appendStructure($r1,this._apply($vars.t));$r1.value=this._appendStructure($r1,this._apply("popLocation"));return this._endStructure($r1);}));$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"andReturn":function(){var $elf=this,$vars={},$r0=this._startStructure(3664);$vars.l=this._getStructureValue(this.anything());$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3670);$r1.value=this._appendStructure($r1,this._applyWithArgs("notLast","storeSomething"));return this._endStructure($r1);}));$vars.y=this._appendStructure($r0,this._apply("storeSomethingThatReturns"));$r0.value=[$vars.l,"And"].concat($vars.xs.concat([$vars.y]));return this._endStructure($r0);},
"somethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(3677);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3679);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3683);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"));$r2.value=($vars.ans=this._appendStructure($r2,this._applyWithArgs("andReturn",$vars.l)));return this._endStructure($r2);}));$r1.value=$vars.ans;return this._endStructure($r1);},function(){var $r1=this._startStructure(3693);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3697);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this.end());return this._endStructure($r2);}));$r1.value=[$vars.l,"ReturnStructure",[$vars.l,"And"]];return this._endStructure($r1);},function(){var $r1=this._startStructure(3705);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3709);$vars.l=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r2,this._apply("generatesStructure"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply($vars.t)));return this._endStructure($r2);}));$r1.value=[$vars.l,"ReturnStructure",[$vars.l,"Store",[$vars.l].concat($vars.ans)]];return this._endStructure($r1);},function(){var $r1=this._startStructure(3720);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3724);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("Set"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply("Set")));return this._endStructure($r2);}));$r1.value=[$vars.l,"ReturnStructure",[$vars.l,"Parenthesis",[$vars.l].concat($vars.ans)]];return this._endStructure($r1);},function(){var $r1=this._startStructure(3734);$vars.x=this._appendStructure($r1,this._apply("trans"));$r1.value=[$vars.l,"ReturnStructure",$vars.x];return this._endStructure($r1);}));return this._endStructure($r0);},
"generatesStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(3739);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3741);$r1.value=this._appendStructure($r1,this.exactly("Or"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3745);$r1.value=this._appendStructure($r1,this.exactly("XOr"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3749);$r1.value=this._appendStructure($r1,this.exactly("Opt"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3753);$r1.value=this._appendStructure($r1,this.exactly("Many"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3757);$r1.value=this._appendStructure($r1,this.exactly("Many1"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3761);$r1.value=this._appendStructure($r1,this.exactly("Not"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3765);$r1.value=this._appendStructure($r1,this.exactly("Lookahead"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3769);$r1.value=this._appendStructure($r1,this.exactly("Form"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3773);$r1.value=this._appendStructure($r1,this.exactly("ConsBy"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3777);$r1.value=this._appendStructure($r1,this.exactly("IdxConsBy"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3781);$r1.value=this._appendStructure($r1,this.exactly("App"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3785);$r1.value=this._appendStructure($r1,this.exactly("JumpTable"));return this._endStructure($r1);},function(){var $r1=this._startStructure(3789);$r1.value=this._appendStructure($r1,this.exactly("Interleave"));return this._endStructure($r1);}));return this._endStructure($r0);},
"somethingThatCanPass":function(){var $elf=this,$vars={},$r0=this._startStructure(3793);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3797);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r1,this._apply("generatesStructure"));this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc));$vars.ans=this._appendStructure($r1,this._apply($vars.t));$r1.value=this._appendStructure($r1,this._apply("popLocation"));return this._endStructure($r1);}));$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"storeSomething":function(){var $elf=this,$vars={},$r0=this._startStructure(3812);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3814);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3818);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r2,this._apply("generatesStructure"));this._pred((this[$vars.t] != undefined));this._appendStructure($r2,this._applyWithArgs("pushLocation",$vars.loc));$vars.ans=this._appendStructure($r2,this._apply($vars.t));$r2.value=this._appendStructure($r2,this._apply("popLocation"));return this._endStructure($r2);}));$r1.value=[$vars.loc,"Store",[$vars.loc].concat($vars.ans)];return this._endStructure($r1);},function(){var $r1=this._startStructure(3833);$r1.value=($vars.x=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));return this._endStructure($r0);},
"storeSomethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(3839);$r0.value=($vars.x=this._appendStructure($r0,this._apply("somethingThatReturns")));return this._endStructure($r0);},
"functioned":function(){var $elf=this,$vars={},$r0=this._startStructure(3845);$vars.x=this._appendStructure($r0,this._apply("storeSomethingThatReturns"));$r0.value=[$vars.x[(0)],"FunctionStructure",$vars.x];return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(3850);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3855);$r1.value=this._appendStructure($r1,this._apply("functioned"));return this._endStructure($r1);}));$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(3859);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3864);$r1.value=this._appendStructure($r1,this._apply("functioned"));return this._endStructure($r1);}));$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(3868);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(3873);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(3878);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(3883);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(3888);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(3893);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3898);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(3903);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(3908);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3914);$r1.value=this._appendStructure($r1,this._apply("trans"));return this._endStructure($r1);}));$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(3918);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3923);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3927);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("somethingThatReturns")));return this._endStructure($r2);}));$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}));$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(3935);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(3940);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(3944);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("functioned")));return this._endStructure($r2);}));$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}));$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(3952);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(3955);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("storeSomething"));$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(3961);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(3965);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(3968);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(3971);$vars.name=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(3977);$vars.b=this._appendStructure($r1,this._apply("somethingThatCanPass"));$r1.value=[null,"ReturnStructure",[null,"Store",$vars.b]];return this._endStructure($r1);},function(){var $r1=this._startStructure(3982);$r1.value=this._appendStructure($r1,this._apply("somethingThatReturns"));return this._endStructure($r1);}));$r0.value=["Rule",$vars.name,$vars.body];return this._endStructure($r0);}});(BSFunctionOptimization["initialize"]=(function (){(this["_locations"]=[]);}));(BSFunctionOptimization["location"]=(function (){return this["_locations"][(this["_locations"]["length"] - (1))];}));let BSOMetaOptimizer=objectThatDelegatesTo(OMeta,{
"optimizeGrammar":function(){var $elf=this,$vars={},$r0=this._startStructure(3986);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(3990);this._appendStructure($r1,this.exactly("Grammar"));$vars.sn=this._getStructureValue(this.anything());$r1.value=($vars.rs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(4000);$r2.value=this._appendStructure($r2,this._apply("optimizeRule"));return this._endStructure($r2);})));return this._endStructure($r1);}));$r0.value=["Grammar",$vars.sn].concat($vars.rs);return this._endStructure($r0);},
"optimizeRule":function(){var $elf=this,$vars={},$r0=this._startStructure(4004);$vars.r=this._getStructureValue(this.anything());this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(4009);$r1.value=($vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSSeqInliner,"optimize",$vars.r)));return this._endStructure($r1);},function(){var $r1=this._startStructure(4015);$r1.value=this._appendStructure($r1,this._apply("empty"));return this._endStructure($r1);}));this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(4021);$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(4025);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSAssociativeOptimization,"optimize",$vars.r)));return this._endStructure($r2);},function(){var $r2=this._startStructure(4031);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSJumpTableOptimization,"optimize",$vars.r)));return this._endStructure($r2);}));return this._endStructure($r1);}));$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSFunctionOptimization,"optimize",$vars.r));$r0.value=$vars.r;return this._endStructure($r0);}})
