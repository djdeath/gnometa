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
    var gi = objectThatDelegatesTo(g, {input: makeOMInputStreamProxy(this.input)}),
        ans = gi._apply(r);
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
"notLast":function(){var $elf=this,$vars={},$r0=this._startStructure(0);$vars.rule=this._getStructureValue(this.anything());$vars.r=this._appendStructure($r0,this._apply($vars.rule));this._appendStructure($r0,this._lookahead(function(){return this._apply($vars.rule);}));$r0.value=$vars.r;return this._endStructure($r0);}});let BaseStrParser=objectThatDelegatesTo(OMeta,{
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(1);$vars.r=this._appendStructure($r0,this.anything());this._pred(((typeof $vars.r) === "string"));$r0.value=$vars.r;return this._endStructure($r0);},
"char":function(){var $elf=this,$vars={},$r0=this._startStructure(2);$vars.r=this._appendStructure($r0,this.anything());this._pred((((typeof $vars.r) === "string") && ($vars.r["length"] == (1))));$r0.value=$vars.r;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(3);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred(($vars.r.charCodeAt((0)) <= (32)));$r0.value=$vars.r;return this._endStructure($r0);},
"spaces":function(){var $elf=this,$vars={},$r0=this._startStructure(4);$r0.value=this._appendStructure($r0,this._many(function(){return this._apply("space");}));return this._endStructure($r0);},
"digit":function(){var $elf=this,$vars={},$r0=this._startStructure(5);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "0") && ($vars.r <= "9")));$r0.value=$vars.r;return this._endStructure($r0);},
"lower":function(){var $elf=this,$vars={},$r0=this._startStructure(6);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "a") && ($vars.r <= "z")));$r0.value=$vars.r;return this._endStructure($r0);},
"upper":function(){var $elf=this,$vars={},$r0=this._startStructure(7);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "A") && ($vars.r <= "Z")));$r0.value=$vars.r;return this._endStructure($r0);},
"letter":function(){var $elf=this,$vars={},$r0=this._startStructure(8);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("lower");},function(){return this._apply("upper");}));return this._endStructure($r0);},
"letterOrDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(9);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("letter");},function(){return this._apply("digit");}));return this._endStructure($r0);},
"token":function(){var $elf=this,$vars={},$r0=this._startStructure(10);$vars.tok=this._getStructureValue(this.anything());this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this.seq($vars.tok));return this._endStructure($r0);},
"listOf":function(){var $elf=this,$vars={},$r0=this._startStructure(11);$vars.rule=this._getStructureValue(this.anything());$vars.delim=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.f=this._appendStructure($r1,this._apply($vars.rule));$vars.rs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token",$vars.delim));$r2.value=this._appendStructure($r2,this._apply($vars.rule));return this._endStructure($r2);}));$r1.value=[$vars.f].concat($vars.rs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"fromTo":function(){var $elf=this,$vars={},$r0=this._startStructure(12);$vars.x=this._getStructureValue(this.anything());$vars.y=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this.seq($vars.x));this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._not(function(){return this.seq($vars.y);}));$r2.value=this._appendStructure($r2,this._apply("char"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this.seq($vars.y));return this._endStructure($r1);}));return this._endStructure($r0);}})
let BSJSParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this,$vars={},$r0=this._startStructure(13);$vars.r=this._getStructureValue(this.anything());$vars.d=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._applyWithArgs("listOf",$vars.r,$vars.d));this._appendStructure($r0,this._or(function(){return this._applyWithArgs("token",",");},function(){return this._apply("empty");}));$r0.value=$vars.v;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(14);$r0.value=this._appendStructure($r0,this._or(function(){return BaseStrParser._superApplyWithArgs(this,"space");},function(){return this._applyWithArgs("fromTo","//","\n");},function(){return this._applyWithArgs("fromTo","/*","*/");}));return this._endStructure($r0);},
"nameFirst":function(){var $elf=this,$vars={},$r0=this._startStructure(15);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("letter");},function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "$":$r2.value="$";break;case "_":$r2.value="_";break;default: throw fail}return this._endStructure($r2);}).call(this);}));return this._endStructure($r0);},
"nameRest":function(){var $elf=this,$vars={},$r0=this._startStructure(16);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("nameFirst");},function(){return this._apply("digit");}));return this._endStructure($r0);},
"iName":function(){var $elf=this,$vars={},$r0=this._startStructure(17);$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("nameFirst"));$r1.value=this._appendStructure($r1,this._many(function(){return this._apply("nameRest");}));return this._endStructure($r1);}));return this._endStructure($r0);},
"isKeyword":function(){var $elf=this,$vars={},$r0=this._startStructure(18);$vars.x=this._getStructureValue(this.anything());$r0.value=this._pred(BSJSParser._isKeyword($vars.x));return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(19);$vars.n=this._appendStructure($r0,this._apply("iName"));this._appendStructure($r0,this._not(function(){return this._applyWithArgs("isKeyword",$vars.n);}));$r0.value=["name",(($vars.n == "self")?"$elf":$vars.n)];return this._endStructure($r0);},
"keyword":function(){var $elf=this,$vars={},$r0=this._startStructure(20);$vars.k=this._appendStructure($r0,this._apply("iName"));this._appendStructure($r0,this._applyWithArgs("isKeyword",$vars.k));$r0.value=[$vars.k,$vars.k];return this._endStructure($r0);},
"hexDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(21);$vars.x=this._appendStructure($r0,this._apply("char"));$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));$r0.value=$vars.v;return this._endStructure($r0);},
"hexLit":function(){var $elf=this,$vars={},$r0=this._startStructure(22);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.n=this._appendStructure($r1,this._apply("hexLit"));$vars.d=this._appendStructure($r1,this._apply("hexDigit"));$r1.value=(($vars.n * (16)) + $vars.d);return this._endStructure($r1);},function(){return this._apply("hexDigit");}));return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(23);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "0":this._appendStructure($r2,this.exactly("x"));"0x";$vars.n=this._appendStructure($r2,this._apply("hexLit"));$r2.value=["number",$vars.n];break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);$vars.f=this._appendStructure($r1,this._consumedBy(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._many1(function(){return this._apply("digit");}));$r2.value=this._appendStructure($r2,this._opt(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("."));$r3.value=this._appendStructure($r3,this._many1(function(){return this._apply("digit");}));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["number",parseFloat($vars.f)];return this._endStructure($r1);}));return this._endStructure($r0);},
"escapeChar":function(){var $elf=this,$vars={},$r0=this._startStructure(24);$vars.s=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this.exactly("\\"));$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "u":this._appendStructure($r3,this._apply("hexDigit"));this._appendStructure($r3,this._apply("hexDigit"));this._appendStructure($r3,this._apply("hexDigit"));$r3.value=this._appendStructure($r3,this._apply("hexDigit"));break;case "x":this._appendStructure($r3,this._apply("hexDigit"));$r3.value=this._appendStructure($r3,this._apply("hexDigit"));break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){return this._apply("char");}));return this._endStructure($r1);}));$r0.value=unescape($vars.s);return this._endStructure($r0);},
"str":function(){var $elf=this,$vars={},$r0=this._startStructure(25);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "\"":$r2.value=this._appendStructure($r2,this._or(function(){return (function(){var $r4=this._startStructure(-1);switch(this._appendStructure($r4,this._apply('anything'))){case "\"":this._appendStructure($r4,this.exactly("\""));"\"\"\"";$vars.cs=this._appendStructure($r4,this._many(function(){var $r5=this._startStructure(-1);this._appendStructure($r5,this._not(function(){var $r6=this._startStructure(-1);this._appendStructure($r6,this.exactly("\""));this._appendStructure($r6,this.exactly("\""));this._appendStructure($r6,this.exactly("\""));$r6.value="\"\"\"";return this._endStructure($r6);}));$r5.value=this._appendStructure($r5,this._apply("char"));return this._endStructure($r5);}));this._appendStructure($r4,this.exactly("\""));this._appendStructure($r4,this.exactly("\""));this._appendStructure($r4,this.exactly("\""));"\"\"\"";$r4.value=["string",$vars.cs.join("")];break;default: throw fail}return this._endStructure($r4);}).call(this);},function(){var $r3=this._startStructure(-1);$vars.cs=this._appendStructure($r3,this._many(function(){return this._or(function(){return this._apply("escapeChar");},function(){var $r5=this._startStructure(-1);this._appendStructure($r5,this._not(function(){return this.exactly("\"");}));$r5.value=this._appendStructure($r5,this._apply("char"));return this._endStructure($r5);});}));this._appendStructure($r3,this.exactly("\""));$r3.value=["string",$vars.cs.join("")];return this._endStructure($r3);}));break;case "\'":$vars.cs=this._appendStructure($r2,this._many(function(){return this._or(function(){return this._apply("escapeChar");},function(){var $r4=this._startStructure(-1);this._appendStructure($r4,this._not(function(){return this.exactly("\'");}));$r4.value=this._appendStructure($r4,this._apply("char"));return this._endStructure($r4);});}));this._appendStructure($r2,this.exactly("\'"));$r2.value=["string",$vars.cs.join("")];break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,(function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "#":$r2.value="#";break;case "`":$r2.value="`";break;default: throw fail}return this._endStructure($r2);}).call(this));$vars.n=this._appendStructure($r1,this._apply("iName"));$r1.value=["string",$vars.n];return this._endStructure($r1);}));return this._endStructure($r0);},
"special":function(){var $elf=this,$vars={},$r0=this._startStructure(26);$vars.s=this._appendStructure($r0,(function(){var $r1=this._startStructure(-1);switch(this._appendStructure($r1,this._apply('anything'))){case "(":$r1.value="(";break;case ")":$r1.value=")";break;case "{":$r1.value="{";break;case "}":$r1.value="}";break;case "[":$r1.value="[";break;case "]":$r1.value="]";break;case ",":$r1.value=",";break;case ";":$r1.value=";";break;case "?":$r1.value="?";break;case ":":$r1.value=":";break;case "!":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value=this._appendStructure($r3,this._or(function(){return (function(){var $r5=this._startStructure(-1);switch(this._appendStructure($r5,this._apply('anything'))){case "=":$r5.value="!==";break;default: throw fail}return this._endStructure($r5);}).call(this);},function(){var $r4=this._startStructure(-1);$r4.value="!=";return this._endStructure($r4);}));break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="!";return this._endStructure($r2);}));break;case "=":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value=this._appendStructure($r3,this._or(function(){return (function(){var $r5=this._startStructure(-1);switch(this._appendStructure($r5,this._apply('anything'))){case "=":$r5.value="===";break;default: throw fail}return this._endStructure($r5);}).call(this);},function(){var $r4=this._startStructure(-1);$r4.value="==";return this._endStructure($r4);}));break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="=";return this._endStructure($r2);}));break;case ">":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value=">=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value=">";return this._endStructure($r2);}));break;case "<":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value="<=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="<";return this._endStructure($r2);}));break;case "+":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "+":$r3.value="++";break;case "=":$r3.value="+=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="+";return this._endStructure($r2);}));break;case "-":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "-":$r3.value="--";break;case "=":$r3.value="-=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="-";return this._endStructure($r2);}));break;case "*":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value="*=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="*";return this._endStructure($r2);}));break;case "/":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value="/=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="/";return this._endStructure($r2);}));break;case "%":$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "=":$r3.value="%=";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){var $r2=this._startStructure(-1);$r2.value="%";return this._endStructure($r2);}));break;case "&":$r1.value=this._appendStructure($r1,(function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "&":$r2.value=this._appendStructure($r2,this._or(function(){return (function(){var $r4=this._startStructure(-1);switch(this._appendStructure($r4,this._apply('anything'))){case "=":$r4.value="&&=";break;default: throw fail}return this._endStructure($r4);}).call(this);},function(){var $r3=this._startStructure(-1);$r3.value="&&";return this._endStructure($r3);}));break;default: throw fail}return this._endStructure($r2);}).call(this));break;case "|":$r1.value=this._appendStructure($r1,(function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "|":$r2.value=this._appendStructure($r2,this._or(function(){return (function(){var $r4=this._startStructure(-1);switch(this._appendStructure($r4,this._apply('anything'))){case "=":$r4.value="||=";break;default: throw fail}return this._endStructure($r4);}).call(this);},function(){var $r3=this._startStructure(-1);$r3.value="||";return this._endStructure($r3);}));break;default: throw fail}return this._endStructure($r2);}).call(this));break;case ".":$r1.value=".";break;default: throw fail}return this._endStructure($r1);}).call(this));$r0.value=[$vars.s,$vars.s];return this._endStructure($r0);},
"tok":function(){var $elf=this,$vars={},$r0=this._startStructure(27);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("name");},function(){return this._apply("keyword");},function(){return this._apply("number");},function(){return this._apply("str");},function(){return this._apply("special");}));return this._endStructure($r0);},
"toks":function(){var $elf=this,$vars={},$r0=this._startStructure(28);$vars.ts=this._appendStructure($r0,this._many(function(){return this._apply("token");}));this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.end());$r0.value=$vars.ts;return this._endStructure($r0);},
"token":function(){var $elf=this,$vars={},$r0=this._startStructure(29);$vars.tt=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r0,this._apply("tok"));this._pred(($vars.t[(0)] == $vars.tt));$r0.value=$vars.t[(1)];return this._endStructure($r0);},
"spacesNoNl":function(){var $elf=this,$vars={},$r0=this._startStructure(30);$r0.value=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._not(function(){return this.exactly("\n");}));$r1.value=this._appendStructure($r1,this._apply("space"));return this._endStructure($r1);}));return this._endStructure($r0);},
"expr":function(){var $elf=this,$vars={},$r0=this._startStructure(31);$vars.e=this._appendStructure($r0,this._apply("orExpr"));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","?"));$vars.t=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",":"));$vars.f=this._appendStructure($r1,this._apply("expr"));$r1.value=["condExpr",$vars.e,$vars.t,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["set",$vars.e,$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","+="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"+",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","-="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"-",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","*="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"*",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","/="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"/",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","%="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"%",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","&&="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"&&",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","||="));$vars.rhs=this._appendStructure($r1,this._apply("expr"));$r1.value=["mset",$vars.e,"||",$vars.rhs];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.e;return this._endStructure($r1);}));return this._endStructure($r0);},
"orExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(32);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("orExpr"));this._appendStructure($r1,this._applyWithArgs("token","||"));$vars.y=this._appendStructure($r1,this._apply("andExpr"));$r1.value=["binop","||",$vars.x,$vars.y];return this._endStructure($r1);},function(){return this._apply("andExpr");}));return this._endStructure($r0);},
"andExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(33);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("andExpr"));this._appendStructure($r1,this._applyWithArgs("token","&&"));$vars.y=this._appendStructure($r1,this._apply("eqExpr"));$r1.value=["binop","&&",$vars.x,$vars.y];return this._endStructure($r1);},function(){return this._apply("eqExpr");}));return this._endStructure($r0);},
"eqExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(34);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("eqExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","=="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","==",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","!="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","!=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","==="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","===",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","!=="));$vars.y=this._appendStructure($r2,this._apply("relExpr"));$r2.value=["binop","!==",$vars.x,$vars.y];return this._endStructure($r2);}));return this._endStructure($r1);},function(){return this._apply("relExpr");}));return this._endStructure($r0);},
"relExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(35);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("relExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token",">"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop",">",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token",">="));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop",">=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","<"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","<",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","<="));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","<=",$vars.x,$vars.y];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","instanceof"));$vars.y=this._appendStructure($r2,this._apply("addExpr"));$r2.value=["binop","instanceof",$vars.x,$vars.y];return this._endStructure($r2);}));return this._endStructure($r1);},function(){return this._apply("addExpr");}));return this._endStructure($r0);},
"addExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(36);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("addExpr"));this._appendStructure($r1,this._applyWithArgs("token","+"));$vars.y=this._appendStructure($r1,this._apply("mulExpr"));$r1.value=["binop","+",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("addExpr"));this._appendStructure($r1,this._applyWithArgs("token","-"));$vars.y=this._appendStructure($r1,this._apply("mulExpr"));$r1.value=["binop","-",$vars.x,$vars.y];return this._endStructure($r1);},function(){return this._apply("mulExpr");}));return this._endStructure($r0);},
"mulExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(37);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","*"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","*",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","/"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","/",$vars.x,$vars.y];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("mulExpr"));this._appendStructure($r1,this._applyWithArgs("token","%"));$vars.y=this._appendStructure($r1,this._apply("unary"));$r1.value=["binop","%",$vars.x,$vars.y];return this._endStructure($r1);},function(){return this._apply("unary");}));return this._endStructure($r0);},
"unary":function(){var $elf=this,$vars={},$r0=this._startStructure(38);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","-"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["unop","-",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","+"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["unop","+",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","++"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["preop","++",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","--"));$vars.p=this._appendStructure($r1,this._apply("postfix"));$r1.value=["preop","--",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","!"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","!",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","void"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","void",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","delete"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","delete",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","typeof"));$vars.p=this._appendStructure($r1,this._apply("unary"));$r1.value=["unop","typeof",$vars.p];return this._endStructure($r1);},function(){return this._apply("postfix");}));return this._endStructure($r0);},
"postfix":function(){var $elf=this,$vars={},$r0=this._startStructure(39);$vars.p=this._appendStructure($r0,this._apply("primExpr"));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("spacesNoNl"));this._appendStructure($r1,this._applyWithArgs("token","++"));$r1.value=["postop","++",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("spacesNoNl"));this._appendStructure($r1,this._applyWithArgs("token","--"));$r1.value=["postop","--",$vars.p];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.p;return this._endStructure($r1);}));return this._endStructure($r0);},
"primExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(40);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.p=this._appendStructure($r1,this._apply("primExpr"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","["));$vars.i=this._appendStructure($r2,this._apply("expr"));this._appendStructure($r2,this._applyWithArgs("token","]"));$r2.value=["getp",$vars.i,$vars.p];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","."));$vars.m=this._appendStructure($r2,this._applyWithArgs("token","name"));this._appendStructure($r2,this._applyWithArgs("token","("));$vars.as=this._appendStructure($r2,this._applyWithArgs("listOf","expr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=["send",$vars.m,$vars.p].concat($vars.as);return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","."));$vars.f=this._appendStructure($r2,this._applyWithArgs("token","name"));$r2.value=["getp",["string",$vars.f],$vars.p];return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","("));$vars.as=this._appendStructure($r2,this._applyWithArgs("listOf","expr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=["call",$vars.p].concat($vars.as);return this._endStructure($r2);}));return this._endStructure($r1);},function(){return this._apply("primExprHd");}));return this._endStructure($r0);},
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(41);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.e;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","this"));$r1.value=["this"];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.n=this._appendStructure($r1,this._applyWithArgs("token","name"));$r1.value=["get",$vars.n];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.n=this._appendStructure($r1,this._applyWithArgs("token","number"));$r1.value=["number",$vars.n];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.s=this._appendStructure($r1,this._applyWithArgs("token","string"));$r1.value=["string",$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","function"));$r1.value=this._appendStructure($r1,this._apply("funcRest"));return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","new"));$vars.e=this._appendStructure($r1,this._apply("primExpr"));$r1.value=["new",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","["));$vars.es=this._appendStructure($r1,this._applyWithArgs("enum","expr",","));this._appendStructure($r1,this._applyWithArgs("token","]"));$r1.value=["arr"].concat($vars.es);return this._endStructure($r1);},function(){return this._apply("json");},function(){return this._apply("re");}));return this._endStructure($r0);},
"json":function(){var $elf=this,$vars={},$r0=this._startStructure(42);this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.bs=this._appendStructure($r0,this._applyWithArgs("enum","jsonBinding",","));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["json"].concat($vars.bs);return this._endStructure($r0);},
"jsonBinding":function(){var $elf=this,$vars={},$r0=this._startStructure(43);$vars.n=this._appendStructure($r0,this._apply("jsonPropName"));this._appendStructure($r0,this._applyWithArgs("token",":"));$vars.v=this._appendStructure($r0,this._apply("expr"));$r0.value=["binding",$vars.n,$vars.v];return this._endStructure($r0);},
"jsonPropName":function(){var $elf=this,$vars={},$r0=this._startStructure(44);$r0.value=this._appendStructure($r0,this._or(function(){return this._applyWithArgs("token","name");},function(){return this._applyWithArgs("token","number");},function(){return this._applyWithArgs("token","string");}));return this._endStructure($r0);},
"re":function(){var $elf=this,$vars={},$r0=this._startStructure(45);this._appendStructure($r0,this._apply("spaces"));$vars.x=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this.exactly("/"));this._appendStructure($r1,this._apply("reBody"));this._appendStructure($r1,this.exactly("/"));$r1.value=this._appendStructure($r1,this._many(function(){return this._apply("reFlag");}));return this._endStructure($r1);}));$r0.value=["regExpr",$vars.x];return this._endStructure($r0);},
"reBody":function(){var $elf=this,$vars={},$r0=this._startStructure(46);this._appendStructure($r0,this._apply("re1stChar"));$r0.value=this._appendStructure($r0,this._many(function(){return this._apply("reChar");}));return this._endStructure($r0);},
"re1stChar":function(){var $elf=this,$vars={},$r0=this._startStructure(47);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._not(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "*":$r3.value="*";break;case "\\":$r3.value="\\";break;case "/":$r3.value="/";break;case "[":$r3.value="[";break;default: throw fail}return this._endStructure($r3);}).call(this);}));$r1.value=this._appendStructure($r1,this._apply("reNonTerm"));return this._endStructure($r1);},function(){return this._apply("escapeChar");},function(){return this._apply("reClass");}));return this._endStructure($r0);},
"reChar":function(){var $elf=this,$vars={},$r0=this._startStructure(48);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("re1stChar");},function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "*":$r2.value="*";break;default: throw fail}return this._endStructure($r2);}).call(this);}));return this._endStructure($r0);},
"reNonTerm":function(){var $elf=this,$vars={},$r0=this._startStructure(49);this._appendStructure($r0,this._not(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "\n":$r2.value="\n";break;case "\r":$r2.value="\r";break;default: throw fail}return this._endStructure($r2);}).call(this);}));$r0.value=this._appendStructure($r0,this._apply("char"));return this._endStructure($r0);},
"reClass":function(){var $elf=this,$vars={},$r0=this._startStructure(50);this._appendStructure($r0,this.exactly("["));this._appendStructure($r0,this._many(function(){return this._apply("reClassChar");}));$r0.value=this._appendStructure($r0,this.exactly("]"));return this._endStructure($r0);},
"reClassChar":function(){var $elf=this,$vars={},$r0=this._startStructure(51);this._appendStructure($r0,this._not(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "[":$r2.value="[";break;case "]":$r2.value="]";break;default: throw fail}return this._endStructure($r2);}).call(this);}));$r0.value=this._appendStructure($r0,this._apply("reChar"));return this._endStructure($r0);},
"reFlag":function(){var $elf=this,$vars={},$r0=this._startStructure(52);$r0.value=this._appendStructure($r0,this._apply("nameFirst"));return this._endStructure($r0);},
"formal":function(){var $elf=this,$vars={},$r0=this._startStructure(53);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._applyWithArgs("token","name"));return this._endStructure($r0);},
"funcRest":function(){var $elf=this,$vars={},$r0=this._startStructure(54);this._appendStructure($r0,this._applyWithArgs("token","("));$vars.fs=this._appendStructure($r0,this._applyWithArgs("listOf","formal",","));this._appendStructure($r0,this._applyWithArgs("token",")"));this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.body=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["func",$vars.fs,$vars.body];return this._endStructure($r0);},
"sc":function(){var $elf=this,$vars={},$r0=this._startStructure(55);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("spacesNoNl"));$r1.value=this._appendStructure($r1,this._or(function(){return (function(){var $r3=this._startStructure(-1);switch(this._appendStructure($r3,this._apply('anything'))){case "\n":$r3.value="\n";break;default: throw fail}return this._endStructure($r3);}).call(this);},function(){return this._lookahead(function(){return this.exactly("}");});},function(){return this.end();}));return this._endStructure($r1);},function(){return this._applyWithArgs("token",";");}));return this._endStructure($r0);},
"varBinding":function(){var $elf=this,$vars={},$r0=this._startStructure(56);$vars.n=this._appendStructure($r0,this._applyWithArgs("token","name"));$vars.v=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","="));$r1.value=this._appendStructure($r1,this._apply("expr"));return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=["get","undefined"];return this._endStructure($r1);}));$r0.value=["assignVar",$vars.n,$vars.v];return this._endStructure($r0);},
"block":function(){var $elf=this,$vars={},$r0=this._startStructure(57);this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.ss=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=["begin",$vars.ss];return this._endStructure($r0);},
"stmt":function(){var $elf=this,$vars={},$r0=this._startStructure(58);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("block");},function(){var $r1=this._startStructure(-1);$vars.decl=this._appendStructure($r1,this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");}));$vars.bs=this._appendStructure($r1,this._applyWithArgs("listOf","varBinding",","));this._appendStructure($r1,this._apply("sc"));$r1.value=["beginVars",$vars.decl].concat($vars.bs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","if"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.t=this._appendStructure($r1,this._apply("stmt"));$vars.f=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","else"));$r2.value=this._appendStructure($r2,this._apply("stmt"));return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));$r1.value=["if",$vars.c,$vars.t,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","while"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["while",$vars.c,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","do"));$vars.s=this._appendStructure($r1,this._apply("stmt"));this._appendStructure($r1,this._applyWithArgs("token","while"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.c=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));this._appendStructure($r1,this._apply("sc"));$r1.value=["doWhile",$vars.s,$vars.c];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","for"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.i=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);$vars.decl=this._appendStructure($r2,this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");}));$vars.bs=this._appendStructure($r2,this._applyWithArgs("listOf","varBinding",","));$r2.value=["beginVars",$vars.decl].concat($vars.bs);return this._endStructure($r2);},function(){return this._apply("expr");},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",";"));$vars.c=this._appendStructure($r1,this._or(function(){return this._apply("expr");},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","true"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",";"));$vars.u=this._appendStructure($r1,this._or(function(){return this._apply("expr");},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["for",$vars.i,$vars.c,$vars.u,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","for"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.v=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);$vars.decl=this._appendStructure($r2,this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");}));$vars.n=this._appendStructure($r2,this._applyWithArgs("token","name"));$r2.value=["beginVars",$vars.decl,["noAssignVar",$vars.n]];return this._endStructure($r2);},function(){return this._apply("expr");}));this._appendStructure($r1,this._applyWithArgs("token","in"));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["forIn",$vars.v,$vars.e,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","switch"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.cs=this._appendStructure($r1,this._many(function(){return this._or(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this._applyWithArgs("token","case"));$vars.c=this._appendStructure($r3,this._apply("expr"));this._appendStructure($r3,this._applyWithArgs("token",":"));$vars.cs=this._appendStructure($r3,this._apply("srcElems"));$r3.value=["case",$vars.c,["begin",$vars.cs]];return this._endStructure($r3);},function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this._applyWithArgs("token","default"));this._appendStructure($r3,this._applyWithArgs("token",":"));$vars.cs=this._appendStructure($r3,this._apply("srcElems"));$r3.value=["default",["begin",$vars.cs]];return this._endStructure($r3);});}));this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=["switch",$vars.e].concat($vars.cs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","break"));this._appendStructure($r1,this._apply("sc"));$r1.value=["break"];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","continue"));this._appendStructure($r1,this._apply("sc"));$r1.value=["continue"];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","throw"));this._appendStructure($r1,this._apply("spacesNoNl"));$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));$r1.value=["throw",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","try"));$vars.t=this._appendStructure($r1,this._apply("block"));this._appendStructure($r1,this._applyWithArgs("token","catch"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.e=this._appendStructure($r1,this._applyWithArgs("token","name"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.c=this._appendStructure($r1,this._apply("block"));$vars.f=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","finally"));$r2.value=this._appendStructure($r2,this._apply("block"));return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));$r1.value=["try",$vars.t,$vars.e,$vars.c,$vars.f];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","return"));$vars.e=this._appendStructure($r1,this._or(function(){return this._apply("expr");},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=["get","undefined"];return this._endStructure($r2);}));this._appendStructure($r1,this._apply("sc"));$r1.value=["return",$vars.e];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","with"));this._appendStructure($r1,this._applyWithArgs("token","("));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$vars.s=this._appendStructure($r1,this._apply("stmt"));$r1.value=["with",$vars.x,$vars.s];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.e=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));$r1.value=$vars.e;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token",";"));$r1.value=["get","undefined"];return this._endStructure($r1);}));return this._endStructure($r0);},
"srcElem":function(){var $elf=this,$vars={},$r0=this._startStructure(59);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","function"));$vars.n=this._appendStructure($r1,this._applyWithArgs("token","name"));$vars.f=this._appendStructure($r1,this._apply("funcRest"));$r1.value=["assignVar",$vars.n,$vars.f];return this._endStructure($r1);},function(){return this._apply("stmt");}));return this._endStructure($r0);},
"srcElems":function(){var $elf=this,$vars={},$r0=this._startStructure(60);$vars.ss=this._appendStructure($r0,this._many(function(){return this._apply("srcElem");}));$r0.value=["beginTop"].concat($vars.ss);return this._endStructure($r0);},
"topLevel":function(){var $elf=this,$vars={},$r0=this._startStructure(61);$vars.r=this._appendStructure($r0,this._apply("srcElems"));this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.end());$r0.value=$vars.r;return this._endStructure($r0);}});(BSJSParser["hexDigits"]="0123456789abcdef");(BSJSParser["keywords"]=({}));(keywords=["break","case","catch","continue","default","delete","do","else","finally","for","function","if","in","instanceof","new","return","switch","this","throw","try","typeof","var","void","while","with","ometa","let","const"]);for(var idx=(0);(idx < keywords["length"]);idx++){(BSJSParser["keywords"][keywords[idx]]=true);}(BSJSParser["_isKeyword"]=(function (k){return this["keywords"].hasOwnProperty(k);}));let BSJSTranslator=objectThatDelegatesTo(OMeta,{
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(62);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.t=this._getStructureValue(this.anything());$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"curlyTrans":function(){var $elf=this,$vars={},$r0=this._startStructure(63);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("begin"));$r2.value=($vars.r=this._appendStructure($r2,this._apply("curlyTrans")));return this._endStructure($r2);}));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("begin"));$r2.value=($vars.rs=this._appendStructure($r2,this._many(function(){return this._apply("trans");})));return this._endStructure($r2);}));$r1.value=(("{" + $vars.rs.join(";")) + ";}");return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.r=this._appendStructure($r1,this._apply("trans"));$r1.value=(("{" + $vars.r) + ";}");return this._endStructure($r1);}));return this._endStructure($r0);},
"this":function(){var $elf=this,$vars={},$r0=this._startStructure(64);$r0.value="this";return this._endStructure($r0);},
"break":function(){var $elf=this,$vars={},$r0=this._startStructure(65);$r0.value="break";return this._endStructure($r0);},
"continue":function(){var $elf=this,$vars={},$r0=this._startStructure(66);$r0.value="continue";return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(67);$vars.n=this._getStructureValue(this.anything());$r0.value=(("(" + $vars.n) + ")");return this._endStructure($r0);},
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(68);$vars.s=this._getStructureValue(this.anything());$r0.value=$vars.s.toProgramString();return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(69);$vars.s=this._getStructureValue(this.anything());$r0.value=$vars.s;return this._endStructure($r0);},
"regExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(70);$vars.x=this._getStructureValue(this.anything());$r0.value=$vars.x;return this._endStructure($r0);},
"arr":function(){var $elf=this,$vars={},$r0=this._startStructure(71);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=(("[" + $vars.xs.join(",")) + "]");return this._endStructure($r0);},
"unop":function(){var $elf=this,$vars={},$r0=this._startStructure(72);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("(" + $vars.op) + " ") + $vars.x) + ")");return this._endStructure($r0);},
"getp":function(){var $elf=this,$vars={},$r0=this._startStructure(73);$vars.fd=this._appendStructure($r0,this._apply("trans"));$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=((($vars.x + "[") + $vars.fd) + "]");return this._endStructure($r0);},
"get":function(){var $elf=this,$vars={},$r0=this._startStructure(74);$vars.x=this._getStructureValue(this.anything());$r0.value=$vars.x;return this._endStructure($r0);},
"set":function(){var $elf=this,$vars={},$r0=this._startStructure(75);$vars.lhs=this._appendStructure($r0,this._apply("trans"));$vars.rhs=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("(" + $vars.lhs) + "=") + $vars.rhs) + ")");return this._endStructure($r0);},
"mset":function(){var $elf=this,$vars={},$r0=this._startStructure(76);$vars.lhs=this._appendStructure($r0,this._apply("trans"));$vars.op=this._getStructureValue(this.anything());$vars.rhs=this._appendStructure($r0,this._apply("trans"));$r0.value=((((("(" + $vars.lhs) + $vars.op) + "=") + $vars.rhs) + ")");return this._endStructure($r0);},
"binop":function(){var $elf=this,$vars={},$r0=this._startStructure(77);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=(((((("(" + $vars.x) + " ") + $vars.op) + " ") + $vars.y) + ")");return this._endStructure($r0);},
"preop":function(){var $elf=this,$vars={},$r0=this._startStructure(78);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=($vars.op + $vars.x);return this._endStructure($r0);},
"postop":function(){var $elf=this,$vars={},$r0=this._startStructure(79);$vars.op=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=($vars.x + $vars.op);return this._endStructure($r0);},
"return":function(){var $elf=this,$vars={},$r0=this._startStructure(80);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("return " + $vars.x);return this._endStructure($r0);},
"with":function(){var $elf=this,$vars={},$r0=this._startStructure(81);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.s=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((("with(" + $vars.x) + ")") + $vars.s);return this._endStructure($r0);},
"if":function(){var $elf=this,$vars={},$r0=this._startStructure(82);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.t=this._appendStructure($r0,this._apply("curlyTrans"));$vars.e=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((("if(" + $vars.cond) + ")") + $vars.t) + "else") + $vars.e);return this._endStructure($r0);},
"condExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(83);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.t=this._appendStructure($r0,this._apply("trans"));$vars.e=this._appendStructure($r0,this._apply("trans"));$r0.value=(((((("(" + $vars.cond) + "?") + $vars.t) + ":") + $vars.e) + ")");return this._endStructure($r0);},
"while":function(){var $elf=this,$vars={},$r0=this._startStructure(84);$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((("while(" + $vars.cond) + ")") + $vars.body);return this._endStructure($r0);},
"doWhile":function(){var $elf=this,$vars={},$r0=this._startStructure(85);$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$vars.cond=this._appendStructure($r0,this._apply("trans"));$r0.value=(((("do" + $vars.body) + "while(") + $vars.cond) + ")");return this._endStructure($r0);},
"for":function(){var $elf=this,$vars={},$r0=this._startStructure(86);$vars.init=this._appendStructure($r0,this._apply("trans"));$vars.cond=this._appendStructure($r0,this._apply("trans"));$vars.upd=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((((("for(" + $vars.init) + ";") + $vars.cond) + ";") + $vars.upd) + ")") + $vars.body);return this._endStructure($r0);},
"forIn":function(){var $elf=this,$vars={},$r0=this._startStructure(87);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.arr=this._appendStructure($r0,this._apply("trans"));$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((("for(" + $vars.x) + " in ") + $vars.arr) + ")") + $vars.body);return this._endStructure($r0);},
"beginTop":function(){var $elf=this,$vars={},$r0=this._startStructure(88);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(-1);$r3.value=this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));return this._endStructure($r3);},function(){return this.end();}));$r2.value=$vars.x;return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._apply("empty"));$r2.value=($vars.x + ";");return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=$vars.xs.join("");return this._endStructure($r0);},
"begin":function(){var $elf=this,$vars={},$r0=this._startStructure(89);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());$r1.value=$vars.x;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(-1);$vars.x=this._appendStructure($r2,this._apply("trans"));$r2.value=this._appendStructure($r2,this._or(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this._or(function(){var $r4=this._startStructure(-1);$r4.value=this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));return this._endStructure($r4);},function(){return this.end();}));$r3.value=$vars.x;return this._endStructure($r3);},function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this._apply("empty"));$r3.value=($vars.x + ";");return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=(("{" + $vars.xs.join("")) + "}");return this._endStructure($r1);}));return this._endStructure($r0);},
"beginVars":function(){var $elf=this,$vars={},$r0=this._startStructure(90);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.decl=this._getStructureValue(this.anything());$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());$r1.value=(($vars.decl + " ") + $vars.x);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.decl=this._getStructureValue(this.anything());$vars.xs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(-1);$r2.value=($vars.x=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=(($vars.decl + " ") + $vars.xs.join(","));return this._endStructure($r1);}));return this._endStructure($r0);},
"func":function(){var $elf=this,$vars={},$r0=this._startStructure(91);$vars.args=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=(((("(function (" + $vars.args.join(",")) + ")") + $vars.body) + ")");return this._endStructure($r0);},
"call":function(){var $elf=this,$vars={},$r0=this._startStructure(92);$vars.fn=this._appendStructure($r0,this._apply("trans"));$vars.args=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=((($vars.fn + "(") + $vars.args.join(",")) + ")");return this._endStructure($r0);},
"send":function(){var $elf=this,$vars={},$r0=this._startStructure(93);$vars.msg=this._getStructureValue(this.anything());$vars.recv=this._appendStructure($r0,this._apply("trans"));$vars.args=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=((((($vars.recv + ".") + $vars.msg) + "(") + $vars.args.join(",")) + ")");return this._endStructure($r0);},
"new":function(){var $elf=this,$vars={},$r0=this._startStructure(94);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("new " + $vars.x);return this._endStructure($r0);},
"assignVar":function(){var $elf=this,$vars={},$r0=this._startStructure(95);$vars.name=this._getStructureValue(this.anything());$vars.val=this._appendStructure($r0,this._apply("trans"));$r0.value=(($vars.name + "=") + $vars.val);return this._endStructure($r0);},
"noAssignVar":function(){var $elf=this,$vars={},$r0=this._startStructure(96);$vars.name=this._getStructureValue(this.anything());$r0.value=$vars.name;return this._endStructure($r0);},
"throw":function(){var $elf=this,$vars={},$r0=this._startStructure(97);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=("throw " + $vars.x);return this._endStructure($r0);},
"try":function(){var $elf=this,$vars={},$r0=this._startStructure(98);$vars.x=this._appendStructure($r0,this._apply("curlyTrans"));$vars.name=this._getStructureValue(this.anything());$vars.c=this._appendStructure($r0,this._apply("curlyTrans"));$vars.f=this._appendStructure($r0,this._apply("curlyTrans"));$r0.value=((((((("try " + $vars.x) + "catch(") + $vars.name) + ")") + $vars.c) + "finally") + $vars.f);return this._endStructure($r0);},
"json":function(){var $elf=this,$vars={},$r0=this._startStructure(99);$vars.props=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=(("({" + $vars.props.join(",")) + "})");return this._endStructure($r0);},
"binding":function(){var $elf=this,$vars={},$r0=this._startStructure(100);$vars.name=this._getStructureValue(this.anything());$vars.val=this._appendStructure($r0,this._apply("trans"));$r0.value=(($vars.name.toProgramString() + ": ") + $vars.val);return this._endStructure($r0);},
"switch":function(){var $elf=this,$vars={},$r0=this._startStructure(101);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.cases=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=(((("switch(" + $vars.x) + "){") + $vars.cases.join(";")) + "}");return this._endStructure($r0);},
"case":function(){var $elf=this,$vars={},$r0=this._startStructure(102);$vars.x=this._appendStructure($r0,this._apply("trans"));$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=((("case " + $vars.x) + ": ") + $vars.y);return this._endStructure($r0);},
"default":function(){var $elf=this,$vars={},$r0=this._startStructure(103);$vars.y=this._appendStructure($r0,this._apply("trans"));$r0.value=("default: " + $vars.y);return this._endStructure($r0);}});let copyObject=(function (obj){let ret=({});for(let i in obj){(ret[i]=obj[i]);}return ret;});let jsValue=(function (type,value){return ["Js",({}),[type,value]];});let jsCode=(function (locals,expr){return ["Js",copyObject(locals),expr];})
let BSSemActionParser=objectThatDelegatesTo(BSJSParser,{
"jsOmetaKeyword":function(){var $elf=this,$vars={},$r0=this._startStructure(104);$vars.k=this._getStructureValue(this.anything());this._appendStructure($r0,this._apply("spaces"));this._appendStructure($r0,this.exactly("@"));$vars.n=this._appendStructure($r0,this._apply("iName"));this._pred(($vars.k == $vars.n));$r0.value=$vars.k;return this._endStructure($r0);},
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(105);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("jsOmetaKeyword","location"));$r1.value=["Location"];return this._endStructure($r1);},function(){return BSJSParser._superApplyWithArgs(this,"primExprHd");}));return this._endStructure($r0);},
"curlySemAction":function(){var $elf=this,$vars={},$r0=this._startStructure(106);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.r=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.ss=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(-1);$vars.s=this._appendStructure($r2,this._apply("srcElem"));this._appendStructure($r2,this._lookahead(function(){return this._apply("srcElem");}));$r2.value=$vars.s;return this._endStructure($r2);}));$vars.s=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);$vars.r=this._appendStructure($r2,this._apply("expr"));this._appendStructure($r2,this._apply("sc"));$r2.value=["return",$vars.r];return this._endStructure($r2);},function(){return this._apply("srcElem");}));$vars.ss.push($vars.s);this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=["send","call",["func",[],["begin"].concat($vars.ss)],["this"]];return this._endStructure($r1);}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure(107);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("curlySemAction");},function(){var $r1=this._startStructure(-1);$vars.r=this._appendStructure($r1,this._apply("primExpr"));this._appendStructure($r1,this._apply("spaces"));$r1.value=$vars.r;return this._endStructure($r1);}));return this._endStructure($r0);}});let BSOMetaParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this,$vars={},$r0=this._startStructure(108);$vars.r=this._getStructureValue(this.anything());$vars.d=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._applyWithArgs("listOf",$vars.r,$vars.d));this._appendStructure($r0,this._or(function(){return this._applyWithArgs("token",",");},function(){return this._apply("empty");}));$r0.value=$vars.v;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(109);$r0.value=this._appendStructure($r0,this._or(function(){return BaseStrParser._superApplyWithArgs(this,"space");},function(){return this._applyWithArgs("fromTo","//","\n");},function(){return this._applyWithArgs("fromTo","/*","*/");}));return this._endStructure($r0);},
"nameFirst":function(){var $elf=this,$vars={},$r0=this._startStructure(110);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "_":$r2.value="_";break;case "$":$r2.value="$";break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){return this._apply("letter");}));return this._endStructure($r0);},
"nameRest":function(){var $elf=this,$vars={},$r0=this._startStructure(111);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("nameFirst");},function(){return this._apply("digit");}));return this._endStructure($r0);},
"tsName":function(){var $elf=this,$vars={},$r0=this._startStructure(112);$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("nameFirst"));$r1.value=this._appendStructure($r1,this._many(function(){return this._apply("nameRest");}));return this._endStructure($r1);}));return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(113);this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._apply("tsName"));return this._endStructure($r0);},
"hexDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(114);$vars.x=this._appendStructure($r0,this._apply("char"));$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));$r0.value=$vars.v;return this._endStructure($r0);},
"eChar":function(){var $elf=this,$vars={},$r0=this._startStructure(115);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.s=this._appendStructure($r1,this._consumedBy(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("\\"));$r2.value=this._appendStructure($r2,this._or(function(){return (function(){var $r4=this._startStructure(-1);switch(this._appendStructure($r4,this._apply('anything'))){case "u":this._appendStructure($r4,this._apply("hexDigit"));this._appendStructure($r4,this._apply("hexDigit"));this._appendStructure($r4,this._apply("hexDigit"));$r4.value=this._appendStructure($r4,this._apply("hexDigit"));break;case "x":this._appendStructure($r4,this._apply("hexDigit"));$r4.value=this._appendStructure($r4,this._apply("hexDigit"));break;default: throw fail}return this._endStructure($r4);}).call(this);},function(){return this._apply("char");}));return this._endStructure($r2);}));$r1.value=unescape($vars.s);return this._endStructure($r1);},function(){return this._apply("char");}));return this._endStructure($r0);},
"tsString":function(){var $elf=this,$vars={},$r0=this._startStructure(116);this._appendStructure($r0,this.exactly("\'"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._not(function(){return this.exactly("\'");}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));$r0.value=$vars.xs.join("");return this._endStructure($r0);},
"characters":function(){var $elf=this,$vars={},$r0=this._startStructure(117);this._appendStructure($r0,this.exactly("`"));this._appendStructure($r0,this.exactly("`"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("\'"));$r2.value=this._appendStructure($r2,this.exactly("\'"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));this._appendStructure($r0,this.exactly("\'"));$r0.value=["App","seq",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"sCharacters":function(){var $elf=this,$vars={},$r0=this._startStructure(118);this._appendStructure($r0,this.exactly("\""));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._not(function(){return this.exactly("\"");}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\""));$r0.value=["App","token",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(119);$vars.xs=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,(function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "#":$r2.value="#";break;case "`":$r2.value="`";break;default: throw fail}return this._endStructure($r2);}).call(this));$r1.value=this._appendStructure($r1,this._apply("tsName"));return this._endStructure($r1);},function(){return this._apply("tsString");}));$r0.value=["App","exactly",jsValue("string",$vars.xs)];return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure(120);$vars.n=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._opt(function(){return this.exactly("-");}));$r1.value=this._appendStructure($r1,this._many1(function(){return this._apply("digit");}));return this._endStructure($r1);}));$r0.value=["App","exactly",jsValue("number",$vars.n)];return this._endStructure($r0);},
"keyword":function(){var $elf=this,$vars={},$r0=this._startStructure(121);$vars.xs=this._getStructureValue(this.anything());this._appendStructure($r0,this._applyWithArgs("token",$vars.xs));this._appendStructure($r0,this._not(function(){return this._apply("letterOrDigit");}));$r0.value=$vars.xs;return this._endStructure($r0);},
"args":function(){var $elf=this,$vars={},$r0=this._startStructure(122);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "(":$vars.xs=this._appendStructure($r2,this._applyWithArgs("listOf","hostExpr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=$vars.xs;break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"application":function(){var $elf=this,$vars={},$r0=this._startStructure(123);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","^"));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App","super",jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.grm=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token","."));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App","foreign",jsCode(this["locals"],["get",$vars.grm]),jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App",$vars.rule].concat($vars.as);return this._endStructure($r1);}));return this._endStructure($r0);},
"hostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(124);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"expr"));$r0.value=jsCode(copyObject(this["locals"]),$vars.r);return this._endStructure($r0);},
"curlyHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(125);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"curlySemAction"));$r0.value=jsCode(copyObject(this["locals"]),$vars.r);return this._endStructure($r0);},
"primHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(126);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"semAction"));$r0.value=jsCode(copyObject(this["locals"]),$vars.r);return this._endStructure($r0);},
"atomicHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure(127);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("curlyHostExpr");},function(){return this._apply("primHostExpr");}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure(128);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$r1.value=($vars.x=this._appendStructure($r1,this._apply("curlyHostExpr")));return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","!"));$r1.value=($vars.x=this._appendStructure($r1,this._apply("atomicHostExpr")));return this._endStructure($r1);}));return this._endStructure($r0);},
"arrSemAction":function(){var $elf=this,$vars={},$r0=this._startStructure(129);this._appendStructure($r0,this._applyWithArgs("token","->"));$r0.value=($vars.x=this._appendStructure($r0,this._apply("atomicHostExpr")));return this._endStructure($r0);},
"semPred":function(){var $elf=this,$vars={},$r0=this._startStructure(130);this._appendStructure($r0,this._applyWithArgs("token","?"));$vars.x=this._appendStructure($r0,this._apply("atomicHostExpr"));$r0.value=["Pred",$vars.x];return this._endStructure($r0);},
"expr":function(){var $elf=this,$vars={},$r0=this._startStructure(131);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","|"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=["Or",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","||"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=["XOr",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){return this._applyWithArgs("expr5",false);}));return this._endStructure($r0);},
"expr5":function(){var $elf=this,$vars={},$r0=this._startStructure(132);$vars.ne=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("interleavePart"));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this._applyWithArgs("token","&&"));$r2.value=this._appendStructure($r2,this._apply("interleavePart"));return this._endStructure($r2);}));$r1.value=["Interleave",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){return this._applyWithArgs("expr4",$vars.ne);}));return this._endStructure($r0);},
"interleavePart":function(){var $elf=this,$vars={},$r0=this._startStructure(133);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=["1",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));$r1.value=this._appendStructure($r1,this._applyWithArgs("modedIPart",$vars.part));return this._endStructure($r1);}));return this._endStructure($r0);},
"modedIPart":function(){var $elf=this,$vars={},$r0=this._startStructure(134);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("Many"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["*",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("Many1"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["+",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("Opt"));$r3.value=($vars.part=this._getStructureValue(this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["?",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.part=this._getStructureValue(this.anything());$r1.value=["1",$vars.part];return this._endStructure($r1);}));return this._endStructure($r0);},
"expr4":function(){var $elf=this,$vars={},$r0=this._startStructure(135);$vars.ne=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._many(function(){return this._apply("expr3");}));$vars.act=this._appendStructure($r1,this._apply("arrSemAction"));$r1.value=["And"].concat($vars.xs).concat([$vars.act]);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._pred($vars.ne);$vars.xs=this._appendStructure($r1,this._many1(function(){return this._apply("expr3");}));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._pred(($vars.ne == false));$vars.xs=this._appendStructure($r1,this._many(function(){return this._apply("expr3");}));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"optIter":function(){var $elf=this,$vars={},$r0=this._startStructure(136);$vars.x=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "*":$r2.value=["Many",$vars.x];break;case "+":$r2.value=["Many1",$vars.x];break;case "?":$r2.value=["Opt",$vars.x];break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"optBind":function(){var $elf=this,$vars={},$r0=this._startStructure(137);$vars.x=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case ":":$vars.n=this._appendStructure($r2,this._apply("name"));$r2.value=(function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,$vars.x];}).call(this);break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"expr3":function(){var $elf=this,$vars={},$r0=this._startStructure(138);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token",":"));$vars.n=this._appendStructure($r1,this._apply("name"));$r1.value=(function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,["PopArg"]];}).call(this);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.e=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);$vars.x=this._appendStructure($r2,this._apply("expr2"));$r2.value=this._appendStructure($r2,this._applyWithArgs("optIter",$vars.x));return this._endStructure($r2);},function(){return this._apply("semAction");}));$r1.value=this._appendStructure($r1,this._applyWithArgs("optBind",$vars.e));return this._endStructure($r1);},function(){return this._apply("semPred");}));return this._endStructure($r0);},
"expr2":function(){var $elf=this,$vars={},$r0=this._startStructure(139);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","~"));$vars.x=this._appendStructure($r1,this._apply("expr2"));$r1.value=["Not",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","&"));$vars.x=this._appendStructure($r1,this._apply("expr1"));$r1.value=["Lookahead",$vars.x];return this._endStructure($r1);},function(){return this._apply("expr1");}));return this._endStructure($r0);},
"expr1":function(){var $elf=this,$vars={},$r0=this._startStructure(140);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("application");},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._or(function(){return this._applyWithArgs("keyword","undefined");},function(){return this._applyWithArgs("keyword","nil");},function(){return this._applyWithArgs("keyword","true");},function(){return this._applyWithArgs("keyword","false");}));$r1.value=["App","exactly",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._or(function(){return this._apply("characters");},function(){return this._apply("sCharacters");},function(){return this._apply("string");},function(){return this._apply("number");}));return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","["));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token","]"));$r1.value=["Form",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=["ConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","@<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=["IdxConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"ruleName":function(){var $elf=this,$vars={},$r0=this._startStructure(141);$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("name");},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._apply("tsString"));return this._endStructure($r1);}));return this._endStructure($r0);},
"rule":function(){var $elf=this,$vars={},$r0=this._startStructure(142);this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(-1);$r1.value=($vars.n=this._appendStructure($r1,this._apply("ruleName")));return this._endStructure($r1);}));(this["locals"]=({}));$vars.x=this._appendStructure($r0,this._applyWithArgs("rulePart",$vars.n));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token",","));$r1.value=this._appendStructure($r1,this._applyWithArgs("rulePart",$vars.n));return this._endStructure($r1);}));$r0.value=["Rule",$vars.n,$r0,["Or",$vars.x].concat($vars.xs)];return this._endStructure($r0);},
"rulePart":function(){var $elf=this,$vars={},$r0=this._startStructure(143);$vars.rn=this._getStructureValue(this.anything());$vars.n=this._appendStructure($r0,this._apply("ruleName"));this._pred(($vars.n == $vars.rn));$vars.b1=this._appendStructure($r0,this._applyWithArgs("expr4",false));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","="));$vars.b2=this._appendStructure($r1,this._apply("expr"));$r1.value=["And",$vars.b1,$vars.b2];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.b1;return this._endStructure($r1);}));return this._endStructure($r0);},
"grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(144);this._appendStructure($r0,this._applyWithArgs("keyword","ometa"));$vars.sn=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.sni=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.sni;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._apply("empty"));$r1.value="OMeta";return this._endStructure($r1);}));this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.rs=this._appendStructure($r0,this._applyWithArgs("enum","rule",","));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaOptimizer,"optimizeGrammar",["Grammar",$vars.sn].concat($vars.rs)));return this._endStructure($r0);}});(BSOMetaParser["hexDigits"]="0123456789abcdef");let BSSemActionTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(145);$r0.value=["$r",this["_storeVal"]].join("");return this._endStructure($r0);},
"get":function(){var $elf=this,$vars={},$r0=this._startStructure(146);$vars.n=this._getStructureValue(this.anything());$r0.value=this._renameVariable($vars.n);return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure(147);$vars.n=this._getStructureValue(this.anything());$r0.value=this._renameVariable($vars.n);return this._endStructure($r0);},
"jstrans":function(){var $elf=this,$vars={},$r0=this._startStructure(148);$vars.storeVal=this._getStructureValue(this.anything());$vars.toRename=this._getStructureValue(this.anything());(function (){(this["_storeVal"]=$vars.storeVal);return (this["_toRename"]=$vars.toRename);}).call(this);$r0.value=this._appendStructure($r0,this._apply("trans"));return this._endStructure($r0);}});(BSSemActionTranslator["_renameVariable"]=(function (name){if(((name != "$elf") && this["_toRename"][name])){return ("$vars." + name);}else{undefined;}return name;}));let BSOMetaTranslator=objectThatDelegatesTo(OMeta,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(149);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "super":$vars.args=this._appendStructure($r2,this._many1(function(){return this._apply("transFn");}));$r2.value=[this["sName"],"._superApplyWithArgs(this,",$vars.args.join(","),")"].join("");break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r1,this._many(function(){return this._apply("transFn");}));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(-1);this._pred(this._optimizedCall($vars.rule,$vars.args));$r2.value=["this.",this["_callables"][$vars.rule]["name"],"(",$vars.args.join(","),")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);this._pred(($vars.args["length"] < (1)));$r2.value=["this._apply(\"",$vars.rule,"\")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);$r2.value=["this._applyWithArgs(\"",$vars.rule,"\",",$vars.args.join(","),")"].join("");return this._endStructure($r2);}));return this._endStructure($r1);}));return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(150);$vars.expr=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._pred(",$vars.expr,")"].join("");return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(151);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("transFn");}));$r0.value=["this._or(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(152);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("transFn");}));$vars.xs.unshift(this["rName"].toProgramString());$r0.value=["this._xor(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(153);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._many1(function(){return this._apply("transFn");}));$r1.value=$vars.xs.join(";");return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$r1.value="undefined";return this._endStructure($r1);}));return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(154);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._opt(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(155);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(156);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many1(",$vars.x,")"].join("");return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(157);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$vars.",$vars.n,"=",$vars.v].join("");return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(158);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._not(",$vars.x,")"].join("");return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(159);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._lookahead(",$vars.x,")"].join("");return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(160);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._form(",$vars.x,")"].join("");return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(161);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._consumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(162);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._idxConsumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(163);this["_storeVar"]++;$vars.cases=this._appendStructure($r0,this._many(function(){return this._apply("jtCase");}));this["_storeVar"]--;$r0.value=this.jumpTableCode($vars.cases);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(164);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("intPart");}));$r0.value=["this._interleave(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"Function":function(){var $elf=this,$vars={},$r0=this._startStructure(165);this["_storeVar"]++;$vars.x=this._appendStructure($r0,this._apply("transFn"));this["_storeVar"]--;$r0.value=["function(){",$vars.x,";}"].join("");return this._endStructure($r0);},
"FunctionStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(166);this["_storeVar"]++;$vars.xs=this._appendStructure($r0,this._many1(function(){return this._apply("transFn");}));this["_storeVar"]--;$r0.value=["function(){var $r",(this["_storeVar"] + (1)),"=this._startStructure(-1);",$vars.xs.join(";"),";return this._endStructure($r",(this["_storeVar"] + (1)),");}"].join("");return this._endStructure($r0);},
"ReturnStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(167);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$r",this["_storeVar"],".value=",$vars.x].join("");return this._endStructure($r0);},
"Return":function(){var $elf=this,$vars={},$r0=this._startStructure(168);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["return ",$vars.x].join("");return this._endStructure($r0);},
"Parenthesis":function(){var $elf=this,$vars={},$r0=this._startStructure(169);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["(",$vars.x,")"].join("");return this._endStructure($r0);},
"Store":function(){var $elf=this,$vars={},$r0=this._startStructure(170);$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._appendStructure($r",this["_storeVar"],",",$vars.x,")"].join("");return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(171);$vars.locals=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._applyWithArgs("transJs",$vars.locals));return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(172);$r0.value="this._getStructureValue(this.anything())";return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(173);$vars.name=this._getStructureValue(this.anything());(function (){(this["rName"]=$vars.name);return (this["_storeVar"]=(0));}).call(this);$vars.location=this._getStructureValue(this.anything());$vars.loc=createSourceMapId();addToSourseMap($vars.loc,$vars.location["start"]["idx"],$vars.location["stop"]["idx"]);$vars.body=this._appendStructure($r0,this._apply("trans"));$r0.value=["\n\"",$vars.name,"\":function(){var $elf=this,","$vars={},","$r0=this._startStructure(",$vars.loc,");",$vars.body,";return this._endStructure($r0);}"].join("");return this._endStructure($r0);},
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(174);$vars.sName=this._getStructureValue(this.anything());(this["sName"]=$vars.sName);$vars.rules=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["objectThatDelegatesTo(",$vars.sName,",{",$vars.rules.join(","),"})"].join("");return this._endStructure($r0);},
"intPart":function(){var $elf=this,$vars={},$r0=this._startStructure(175);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.mode=this._getStructureValue(this.anything());$r1.value=($vars.part=this._appendStructure($r1,this._apply("transFn")));return this._endStructure($r1);}));$r0.value=(($vars.mode.toProgramString() + ",") + $vars.part);return this._endStructure($r0);},
"jtCase":function(){var $elf=this,$vars={},$r0=this._startStructure(176);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.x=this._getStructureValue(this.anything());$r1.value=($vars.e=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));$r0.value=[$vars.x.toProgramString(),$vars.e];return this._endStructure($r0);},
"transJs":function(){var $elf=this,$vars={},$r0=this._startStructure(177);$vars.locals=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionTranslator,"jstrans",this["_storeVar"],$vars.locals));return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(178);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.t=this._getStructureValue(this.anything());$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"transFn":function(){var $elf=this,$vars={},$r0=this._startStructure(179);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=$vars.x;return this._endStructure($r0);}});(BSOMetaTranslator["_callables"]=({"anything": ({"name": "anything","nbArgs": (0)}),"apply": ({"name": "_apply","nbArgs": (1)}),"end": ({"name": "end","nbArgs": (0)}),"exactly": ({"name": "exactly","nbArgs": (1)}),"seq": ({"name": "seq","nbArgs": (1)})}));(BSOMetaTranslator["_optimizedCall"]=(function (rule,args){let c=this["_callables"][rule];return (c && (c["nbArgs"] == args["length"]));}));(BSOMetaTranslator["jumpTableCode"]=(function (cases){var buf=new StringBuffer();buf.nextPutAll((("(function(){var $r" + (this["_storeVar"] + (1))) + "=this._startStructure(-1);"));buf.nextPutAll((("switch(this._appendStructure($r" + (this["_storeVar"] + (1))) + ",this._apply(\'anything\'))){"));for(var i=(0);(i < cases["length"]);(i+=(1))){buf.nextPutAll((((("case " + cases[i][(0)]) + ":") + cases[i][(1)]) + ";break;"));}buf.nextPutAll((("default: throw fail}return this._endStructure($r" + (this["_storeVar"] + (1))) + ");}).call(this)"));return buf.contents();}))
let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(180);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSOMetaParser,"grammar"));$r1.value=$vars.r;return this._endStructure($r1);},function(){return BSJSParser._superApplyWithArgs(this,"primExprHd");}));return this._endStructure($r0);}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure(181);$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaTranslator,"Grammar"));return this._endStructure($r0);}})
let BSNullOptimization=objectThatDelegatesTo(OMeta,{
"setHelped":function(){var $elf=this,$vars={},$r0=this._startStructure(182);$r0.value=(this["_didSomething"]=true);return this._endStructure($r0);},
"helped":function(){var $elf=this,$vars={},$r0=this._startStructure(183);$r0.value=this._pred(this["_didSomething"]);return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(184);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(185);$vars.x=this._appendStructure($r0,this._apply("trans"));this._appendStructure($r0,this._apply("helped"));$r0.value=$vars.x;return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(186);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){return this.anything();}));$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(187);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(188);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(189);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(190);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["And"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(191);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(192);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(193);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(194);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("trans"));$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(195);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(196);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(197);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(198);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(199);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(200);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}));$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(201);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("trans")));return this._endStructure($r2);}));$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}));$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(202);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(203);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(204);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(205);$vars.name=this._getStructureValue(this.anything());$vars.location=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._apply("trans"));$r0.value=["Rule",$vars.name,$vars.location,$vars.body];return this._endStructure($r0);}});(BSNullOptimization["initialize"]=(function (){(this["_didSomething"]=false);}));let BSAssociativeOptimization=objectThatDelegatesTo(BSNullOptimization,{
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(206);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","And"));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(207);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","Or"));$r1.value=["Or"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(208);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));this._appendStructure($r1,this.end());this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.x;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","XOr"));$r1.value=["XOr"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"transInside":function(){var $elf=this,$vars={},$r0=this._startStructure(209);$vars.t=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly($vars.t));$r2.value=($vars.xs=this._appendStructure($r2,this._applyWithArgs("transInside",$vars.t)));return this._endStructure($r2);}));$vars.ys=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t));this._appendStructure($r1,this._apply("setHelped"));$r1.value=$vars.xs.concat($vars.ys);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t));$r1.value=[$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);}});let BSSeqInliner=objectThatDelegatesTo(BSNullOptimization,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(210);$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(-1);switch(this._appendStructure($r2,this._apply('anything'))){case "seq":this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("Js"));$vars.locals=this._getStructureValue(this.anything());$r3.value=this._appendStructure($r3,this._form(function(){var $r4=this._startStructure(-1);this._appendStructure($r4,this.exactly("string"));$r4.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r4);}));return this._endStructure($r3);}));this._appendStructure($r2,this.end());$vars.cs=this._appendStructure($r2,this._applyWithArgs("seqString",$vars.s));this._appendStructure($r2,this._apply("setHelped"));$r2.value=["And"].concat($vars.cs).concat([jsValue("string",$vars.s)]);break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(-1);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r1,this._many(function(){return this.anything();}));$r1.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r1);}));return this._endStructure($r0);},
"inlineChar":function(){var $elf=this,$vars={},$r0=this._startStructure(211);$vars.c=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaParser,"eChar"));$r0.value=["App","exactly",jsValue("string",$vars.c)];return this._endStructure($r0);},
"seqString":function(){var $elf=this,$vars={},$r0=this._startStructure(212);this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(-1);$vars.s=this._getStructureValue(this.anything());$r1.value=this._pred(((typeof $vars.s) === "string"));return this._endStructure($r1);}));this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$r1.value=($vars.cs=this._appendStructure($r1,this._many(function(){return this._apply("inlineChar");})));return this._endStructure($r1);}));$r0.value=$vars.cs;return this._endStructure($r0);}});let JumpTable=(function (choiceOp,choice){(this["choiceOp"]=choiceOp);(this["choices"]=({}));this.add(choice);});(JumpTable["prototype"]["add"]=(function (choice){var c=choice[(0)],t=choice[(1)];if(this["choices"][c]){if((this["choices"][c][(0)] == this["choiceOp"])){this["choices"][c].push(t);}else{(this["choices"][c]=[this["choiceOp"],this["choices"][c],t]);};}else{(this["choices"][c]=t);};}));(JumpTable["prototype"]["toTree"]=(function (){var r=["JumpTable"],choiceKeys=ownPropertyNames(this["choices"]);for(var i=(0);(i < choiceKeys["length"]);(i+=(1))){r.push([choiceKeys[i],this["choices"][choiceKeys[i]]]);}return r;}));let BSJumpTableOptimization=objectThatDelegatesTo(BSNullOptimization,{
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(213);$vars.cs=this._appendStructure($r0,this._many(function(){return this._or(function(){return this._applyWithArgs("jtChoices","Or");},function(){return this._apply("trans");});}));$r0.value=["Or"].concat($vars.cs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(214);$vars.cs=this._appendStructure($r0,this._many(function(){return this._or(function(){return this._applyWithArgs("jtChoices","XOr");},function(){return this._apply("trans");});}));$r0.value=["XOr"].concat($vars.cs);return this._endStructure($r0);},
"quotedString":function(){var $elf=this,$vars={},$r0=this._startStructure(215);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this.exactly("Js"));$vars.l=this._getStructureValue(this.anything());$r1.value=this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("string"));$r2.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r2);}));return this._endStructure($r1);}));$r0.value=$vars.s;return this._endStructure($r0);},
"jtChoice":function(){var $elf=this,$vars={},$r0=this._startStructure(216);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(-1);this._appendStructure($r3,this.exactly("App"));this._appendStructure($r3,this.exactly("exactly"));$r3.value=($vars.x=this._appendStructure($r3,this._apply("quotedString")));return this._endStructure($r3);}));$r2.value=($vars.rest=this._appendStructure($r2,this._many(function(){return this.anything();})));return this._endStructure($r2);}));$r1.value=[$vars.x,["And"].concat($vars.rest)];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("App"));this._appendStructure($r2,this.exactly("exactly"));$r2.value=($vars.x=this._appendStructure($r2,this._apply("quotedString")));return this._endStructure($r2);}));$r1.value=[$vars.x,jsValue("string",$vars.x)];return this._endStructure($r1);}));return this._endStructure($r0);},
"jtChoices":function(){var $elf=this,$vars={},$r0=this._startStructure(217);$vars.op=this._getStructureValue(this.anything());$vars.c=this._appendStructure($r0,this._apply("jtChoice"));$vars.jt=new JumpTable($vars.op,$vars.c);this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);$vars.c=this._appendStructure($r1,this._apply("jtChoice"));$r1.value=$vars.jt.add($vars.c);return this._endStructure($r1);}));this._appendStructure($r0,this._apply("setHelped"));$r0.value=$vars.jt.toTree();return this._endStructure($r0);}});let BSFunctionOptimization=objectThatDelegatesTo(GenericMatcher,{
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(218);$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=$vars.x;return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(219);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"somethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(220);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply("AndReturn")));return this._endStructure($r2);}));$r1.value=$vars.ans;return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this.end());return this._endStructure($r2);}));$r1.value=["ReturnStructure",["And"]];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.t=this._appendStructure($r2,this._apply("generatesStructure"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply($vars.t)));return this._endStructure($r2);}));$r1.value=["ReturnStructure",["Store",$vars.ans]];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);this._appendStructure($r2,this.exactly("Set"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply("Set")));return this._endStructure($r2);}));$r1.value=["ReturnStructure",["Parenthesis",$vars.ans]];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("trans"));$r1.value=["ReturnStructure",$vars.x];return this._endStructure($r1);}));return this._endStructure($r0);},
"generatesStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(221);$r0.value=this._appendStructure($r0,(function(){var $r1=this._startStructure(-1);switch(this._appendStructure($r1,this._apply('anything'))){case "Or":$r1.value="Or";break;case "XOr":$r1.value="XOr";break;case "Opt":$r1.value="Opt";break;case "Many":$r1.value="Many";break;case "Many1":$r1.value="Many1";break;case "Not":$r1.value="Not";break;case "Lookahead":$r1.value="Lookahead";break;case "Form":$r1.value="Form";break;case "ConsBy":$r1.value="ConsBy";break;case "IdxConsBy":$r1.value="IdxConsBy";break;case "App":$r1.value="App";break;case "JumpTable":$r1.value="JumpTable";break;case "Interleave":$r1.value="Interleave";break;default: throw fail}return this._endStructure($r1);}).call(this));return this._endStructure($r0);},
"somethingThatCanPass":function(){var $elf=this,$vars={},$r0=this._startStructure(222);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);$vars.t=this._appendStructure($r1,this._apply("generatesStructure"));$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"storeSomething":function(){var $elf=this,$vars={},$r0=this._startStructure(223);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.t=this._appendStructure($r2,this._apply("generatesStructure"));$r2.value=($vars.ans=this._appendStructure($r2,this._apply($vars.t)));return this._endStructure($r2);}));$r1.value=["Store",$vars.ans];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$r1.value=($vars.x=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));return this._endStructure($r0);},
"storeSomethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(224);$r0.value=($vars.x=this._appendStructure($r0,this._apply("somethingThatReturns")));return this._endStructure($r0);},
"functioned":function(){var $elf=this,$vars={},$r0=this._startStructure(225);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("somethingThatCanPass"));$r1.value=["Function",["Return",$vars.x]];return this._endStructure($r1);},function(){var $r1=this._startStructure(-1);$vars.x=this._appendStructure($r1,this._apply("storeSomethingThatReturns"));$r1.value=["FunctionStructure",$vars.x];return this._endStructure($r1);}));return this._endStructure($r0);},
"AndReturn":function(){var $elf=this,$vars={},$r0=this._startStructure(226);$vars.xs=this._appendStructure($r0,this._many(function(){return this._applyWithArgs("notLast","storeSomething");}));$vars.y=this._appendStructure($r0,this._apply("storeSomethingThatReturns"));$r0.value=["And"].concat($vars.xs.concat([$vars.y]));return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(227);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("functioned");}));$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(228);$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("functioned");}));$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(229);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(230);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(231);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(232);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(233);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(234);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(235);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(236);$vars.x=this._appendStructure($r0,this._apply("functioned"));$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(237);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(238);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("somethingThatReturns")));return this._endStructure($r2);}));$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}));$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(239);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(-1);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("functioned")));return this._endStructure($r2);}));$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}));$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(240);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(241);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("storeSomething"));$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(242);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(243);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(244);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(245);$vars.name=this._getStructureValue(this.anything());$vars.location=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$vars.b=this._appendStructure($r1,this._apply("somethingThatCanPass"));$r1.value=["ReturnStructure",["Store",$vars.b]];return this._endStructure($r1);},function(){return this._apply("somethingThatReturns");}));$r0.value=["Rule",$vars.name,$vars.location,$vars.body];return this._endStructure($r0);}});let BSOMetaOptimizer=objectThatDelegatesTo(OMeta,{
"optimizeGrammar":function(){var $elf=this,$vars={},$r0=this._startStructure(246);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(-1);this._appendStructure($r1,this.exactly("Grammar"));$vars.sn=this._getStructureValue(this.anything());$r1.value=($vars.rs=this._appendStructure($r1,this._many(function(){return this._apply("optimizeRule");})));return this._endStructure($r1);}));$r0.value=["Grammar",$vars.sn].concat($vars.rs);return this._endStructure($r0);},
"optimizeRule":function(){var $elf=this,$vars={},$r0=this._startStructure(247);$vars.r=this._getStructureValue(this.anything());this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(-1);$r1.value=($vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSSeqInliner,"optimize",$vars.r)));return this._endStructure($r1);},function(){return this._apply("empty");}));this._appendStructure($r0,this._many(function(){return this._or(function(){var $r2=this._startStructure(-1);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSAssociativeOptimization,"optimize",$vars.r)));return this._endStructure($r2);},function(){var $r2=this._startStructure(-1);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSJumpTableOptimization,"optimize",$vars.r)));return this._endStructure($r2);});}));$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSFunctionOptimization,"optimize",$vars.r));$r0.value=$vars.r;return this._endStructure($r0);}})
