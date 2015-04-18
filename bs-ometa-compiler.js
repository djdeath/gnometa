// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let Locals=objectThatDelegatesTo(OMeta,{
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure("trans");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);$vars.t=this._appendStructure($r2,this.anything());this._pred(($vars.t == "name"));$r2.value=($vars.n=this._appendStructure($r2,this.anything()));return this._endStructure($r2);}));$r1.value=[$vars.t,this._renameVariable($vars.n)];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);$vars.t=this._appendStructure($r2,this.anything());this._pred(($vars.t == "get"));$r2.value=($vars.n=this._appendStructure($r2,this.anything()));return this._endStructure($r2);}));$r1.value=[$vars.t,this._renameVariable($vars.n)];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);$vars.t=this._appendStructure($r2,this.anything());$r2.value=($vars.ts=this._appendStructure($r2,this._many(function(){var $r3=this._startStructure(null);$vars.e=this._appendStructure($r3,this._lookahead(function(){return this.anything();}));$r3.value=this._appendStructure($r3,this._or(function(){var $r4=this._startStructure(null);this._pred(((((typeof $vars.e) != "string") && ($vars.e["length"] != undefined)) && ($vars.e["length"] > (0))));$r4.value=this._appendStructure($r4,this._apply("trans"));return this._endStructure($r4);},function(){return this.anything();}));return this._endStructure($r3);})));return this._endStructure($r2);}));$r1.value=[$vars.t].concat($vars.ts);return this._endStructure($r1);}));return this._endStructure($r0);},
"rename":function(){var $elf=this,$vars={},$r0=this._startStructure("rename");this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(null);$vars.allowed=this._appendStructure($r1,this.anything());(this["_allowed"]=$vars.allowed);$r1.value=($vars.result=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));$r0.value=$vars.result;return this._endStructure($r0);}});(Locals["_renameVariable"]=(function (name){if(((name != "$elf") && this["_allowed"][name])){return ("$vars." + name);}else{undefined;}return name;}));let BSSemActionParser=objectThatDelegatesTo(BSJSParser,{
"curlySemAction":function(){var $elf=this,$vars={},$r0=this._startStructure("curlySemAction");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.r=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._apply("sc"));this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=$vars.r;return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","{"));$vars.ss=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(null);$vars.s=this._appendStructure($r2,this._apply("srcElem"));this._appendStructure($r2,this._lookahead(function(){return this._apply("srcElem");}));$r2.value=$vars.s;return this._endStructure($r2);}));$vars.s=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(null);$vars.r=this._appendStructure($r2,this._apply("expr"));this._appendStructure($r2,this._apply("sc"));$r2.value=["return",$vars.r];return this._endStructure($r2);},function(){return this._apply("srcElem");}));$vars.ss.push($vars.s);this._appendStructure($r1,this._applyWithArgs("token","}"));$r1.value=["send","call",["func",[],["begin"].concat($vars.ss)],["this"]];return this._endStructure($r1);}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure("semAction");$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("curlySemAction");},function(){var $r1=this._startStructure(null);$vars.r=this._appendStructure($r1,this._apply("primExpr"));this._appendStructure($r1,this._apply("spaces"));$r1.value=$vars.r;return this._endStructure($r1);}));return this._endStructure($r0);}});let BSSemActionTranslator=objectThatDelegatesTo(BSJSTranslator,{});let jsValue=(function (type,value){return ["Js",[type,value]];});let BSOMetaParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this,$vars={},$r0=this._startStructure("enum");$vars.r=this._appendStructure($r0,this.anything());$vars.d=this._appendStructure($r0,this.anything());$vars.v=this._appendStructure($r0,this._applyWithArgs("listOf",$vars.r,$vars.d));this._appendStructure($r0,this._or(function(){return this._applyWithArgs("token",",");},function(){return this._apply("empty");}));$r0.value=$vars.v;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure("space");$r0.value=this._appendStructure($r0,this._or(function(){return BaseStrParser._superApplyWithArgs(this,"space");},function(){return this._applyWithArgs("fromTo","//","\n");},function(){return this._applyWithArgs("fromTo","/*","*/");}));return this._endStructure($r0);},
"nameFirst":function(){var $elf=this,$vars={},$r0=this._startStructure("nameFirst");$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case "_":$r2.value="_";break;case "$":$r2.value="$";break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){return this._apply("letter");}));return this._endStructure($r0);},
"nameRest":function(){var $elf=this,$vars={},$r0=this._startStructure("nameRest");$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("nameFirst");},function(){return this._apply("digit");}));return this._endStructure($r0);},
"tsName":function(){var $elf=this,$vars={},$r0=this._startStructure("tsName");$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("nameFirst"));$r1.value=this._appendStructure($r1,this._many(function(){return this._apply("nameRest");}));return this._endStructure($r1);}));return this._endStructure($r0);},
"name":function(){var $elf=this,$vars={},$r0=this._startStructure("name");this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this._apply("tsName"));return this._endStructure($r0);},
"hexDigit":function(){var $elf=this,$vars={},$r0=this._startStructure("hexDigit");$vars.x=this._appendStructure($r0,this._apply("char"));$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));$r0.value=$vars.v;return this._endStructure($r0);},
"eChar":function(){var $elf=this,$vars={},$r0=this._startStructure("eChar");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.s=this._appendStructure($r1,this._consumedBy(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this.exactly("\\"));$r2.value=this._appendStructure($r2,this._or(function(){return (function(){var $r4=this._startStructure(null);switch(this._appendStructure($r4,this._apply('anything'))){case "u":this._appendStructure($r4,this._apply("hexDigit"));this._appendStructure($r4,this._apply("hexDigit"));this._appendStructure($r4,this._apply("hexDigit"));$r4.value=this._appendStructure($r4,this._apply("hexDigit"));break;case "x":this._appendStructure($r4,this._apply("hexDigit"));$r4.value=this._appendStructure($r4,this._apply("hexDigit"));break;default: throw fail}return this._endStructure($r4);}).call(this);},function(){return this._apply("char");}));return this._endStructure($r2);}));$r1.value=unescape($vars.s);return this._endStructure($r1);},function(){return this._apply("char");}));return this._endStructure($r0);},
"tsString":function(){var $elf=this,$vars={},$r0=this._startStructure("tsString");this._appendStructure($r0,this.exactly("\'"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._not(function(){return this.exactly("\'");}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));$r0.value=$vars.xs.join("");return this._endStructure($r0);},
"characters":function(){var $elf=this,$vars={},$r0=this._startStructure("characters");this._appendStructure($r0,this.exactly("`"));this._appendStructure($r0,this.exactly("`"));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._not(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this.exactly("\'"));$r2.value=this._appendStructure($r2,this.exactly("\'"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\'"));this._appendStructure($r0,this.exactly("\'"));$r0.value=["App","seq",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"sCharacters":function(){var $elf=this,$vars={},$r0=this._startStructure("sCharacters");this._appendStructure($r0,this.exactly("\""));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._not(function(){return this.exactly("\"");}));$r1.value=this._appendStructure($r1,this._apply("eChar"));return this._endStructure($r1);}));this._appendStructure($r0,this.exactly("\""));$r0.value=["App","token",jsValue("string",$vars.xs.join(""))];return this._endStructure($r0);},
"string":function(){var $elf=this,$vars={},$r0=this._startStructure("string");$vars.xs=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,(function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case "#":$r2.value="#";break;case "`":$r2.value="`";break;default: throw fail}return this._endStructure($r2);}).call(this));$r1.value=this._appendStructure($r1,this._apply("tsName"));return this._endStructure($r1);},function(){return this._apply("tsString");}));$r0.value=["App","exactly",jsValue("string",$vars.xs)];return this._endStructure($r0);},
"number":function(){var $elf=this,$vars={},$r0=this._startStructure("number");$vars.n=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._opt(function(){return this.exactly("-");}));$r1.value=this._appendStructure($r1,this._many1(function(){return this._apply("digit");}));return this._endStructure($r1);}));$r0.value=["App","exactly",jsValue("number",$vars.n)];return this._endStructure($r0);},
"keyword":function(){var $elf=this,$vars={},$r0=this._startStructure("keyword");$vars.xs=this._appendStructure($r0,this.anything());this._appendStructure($r0,this._applyWithArgs("token",$vars.xs));this._appendStructure($r0,this._not(function(){return this._apply("letterOrDigit");}));$r0.value=$vars.xs;return this._endStructure($r0);},
"args":function(){var $elf=this,$vars={},$r0=this._startStructure("args");$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case "(":$vars.xs=this._appendStructure($r2,this._applyWithArgs("listOf","hostExpr",","));this._appendStructure($r2,this._applyWithArgs("token",")"));$r2.value=$vars.xs;break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("empty"));$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"application":function(){var $elf=this,$vars={},$r0=this._startStructure("application");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","^"));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App","super",jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.grm=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token","."));$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App","foreign",jsValue("get",$vars.grm),jsValue("string",$vars.rule)].concat($vars.as);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.rule=this._appendStructure($r1,this._apply("name"));$vars.as=this._appendStructure($r1,this._apply("args"));$r1.value=["App",$vars.rule].concat($vars.as);return this._endStructure($r1);}));return this._endStructure($r0);},
"localsVars":function(){var $elf=this,$vars={},$r0=this._startStructure("localsVars");$vars.s=this._appendStructure($r0,this.anything());$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",Locals,"rename",[this["locals"],$vars.s]));return this._endStructure($r0);},
"hostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure("hostExpr");$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"expr"));$vars.rr=this._appendStructure($r0,this._applyWithArgs("localsVars",$vars.r));$r0.value=["Js",$vars.rr];return this._endStructure($r0);},
"curlyHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure("curlyHostExpr");$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"curlySemAction"));$vars.rr=this._appendStructure($r0,this._applyWithArgs("localsVars",$vars.r));$r0.value=["Js",$vars.rr];return this._endStructure($r0);},
"primHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure("primHostExpr");$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionParser,"semAction"));$vars.rr=this._appendStructure($r0,this._applyWithArgs("localsVars",$vars.r));$r0.value=["Js",$vars.rr];return this._endStructure($r0);},
"atomicHostExpr":function(){var $elf=this,$vars={},$r0=this._startStructure("atomicHostExpr");$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("curlyHostExpr");},function(){return this._apply("primHostExpr");}));return this._endStructure($r0);},
"semAction":function(){var $elf=this,$vars={},$r0=this._startStructure("semAction");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$r1.value=($vars.x=this._appendStructure($r1,this._apply("curlyHostExpr")));return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","!"));$r1.value=($vars.x=this._appendStructure($r1,this._apply("atomicHostExpr")));return this._endStructure($r1);}));return this._endStructure($r0);},
"arrSemAction":function(){var $elf=this,$vars={},$r0=this._startStructure("arrSemAction");this._appendStructure($r0,this._applyWithArgs("token","->"));$r0.value=($vars.x=this._appendStructure($r0,this._apply("atomicHostExpr")));return this._endStructure($r0);},
"semPred":function(){var $elf=this,$vars={},$r0=this._startStructure("semPred");this._appendStructure($r0,this._applyWithArgs("token","?"));$vars.x=this._appendStructure($r0,this._apply("atomicHostExpr"));$r0.value=["Pred",$vars.x];return this._endStructure($r0);},
"expr":function(){var $elf=this,$vars={},$r0=this._startStructure("expr");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this._applyWithArgs("token","|"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=["Or",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.x=this._appendStructure($r1,this._applyWithArgs("expr5",true));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this._applyWithArgs("token","||"));$r2.value=this._appendStructure($r2,this._applyWithArgs("expr5",true));return this._endStructure($r2);}));$r1.value=["XOr",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){return this._applyWithArgs("expr5",false);}));return this._endStructure($r0);},
"expr5":function(){var $elf=this,$vars={},$r0=this._startStructure("expr5");$vars.ne=this._appendStructure($r0,this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.x=this._appendStructure($r1,this._apply("interleavePart"));$vars.xs=this._appendStructure($r1,this._many1(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this._applyWithArgs("token","&&"));$r2.value=this._appendStructure($r2,this._apply("interleavePart"));return this._endStructure($r2);}));$r1.value=["Interleave",$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){return this._applyWithArgs("expr4",$vars.ne);}));return this._endStructure($r0);},
"interleavePart":function(){var $elf=this,$vars={},$r0=this._startStructure("interleavePart");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=["1",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.part=this._appendStructure($r1,this._applyWithArgs("expr4",true));$r1.value=this._appendStructure($r1,this._applyWithArgs("modedIPart",$vars.part));return this._endStructure($r1);}));return this._endStructure($r0);},
"modedIPart":function(){var $elf=this,$vars={},$r0=this._startStructure("modedIPart");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(null);this._appendStructure($r3,this.exactly("Many"));$r3.value=($vars.part=this._appendStructure($r3,this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["*",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(null);this._appendStructure($r3,this.exactly("Many1"));$r3.value=($vars.part=this._appendStructure($r3,this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["+",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(null);this._appendStructure($r2,this.exactly("And"));$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(null);this._appendStructure($r3,this.exactly("Opt"));$r3.value=($vars.part=this._appendStructure($r3,this.anything()));return this._endStructure($r3);}));return this._endStructure($r2);}));$r1.value=["?",$vars.part];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.part=this._appendStructure($r1,this.anything());$r1.value=["1",$vars.part];return this._endStructure($r1);}));return this._endStructure($r0);},
"expr4":function(){var $elf=this,$vars={},$r0=this._startStructure("expr4");$vars.ne=this._appendStructure($r0,this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.xs=this._appendStructure($r1,this._many(function(){return this._apply("expr3");}));$vars.act=this._appendStructure($r1,this._apply("arrSemAction"));$r1.value=["And"].concat($vars.xs).concat([$vars.act]);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._pred($vars.ne);$vars.xs=this._appendStructure($r1,this._many1(function(){return this._apply("expr3");}));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._pred(($vars.ne == false));$vars.xs=this._appendStructure($r1,this._many(function(){return this._apply("expr3");}));$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);}));return this._endStructure($r0);},
"optIter":function(){var $elf=this,$vars={},$r0=this._startStructure("optIter");$vars.x=this._appendStructure($r0,this.anything());$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case "*":$r2.value=["Many",$vars.x];break;case "+":$r2.value=["Many1",$vars.x];break;case "?":$r2.value=["Opt",$vars.x];break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"optBind":function(){var $elf=this,$vars={},$r0=this._startStructure("optBind");$vars.x=this._appendStructure($r0,this.anything());$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case ":":$vars.n=this._appendStructure($r2,this._apply("name"));$r2.value=(function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,$vars.x];}).call(this);break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"expr3":function(){var $elf=this,$vars={},$r0=this._startStructure("expr3");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token",":"));$vars.n=this._appendStructure($r1,this._apply("name"));$r1.value=(function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,["App","anything"]];}).call(this);return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$vars.e=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(null);$vars.x=this._appendStructure($r2,this._apply("expr2"));$r2.value=this._appendStructure($r2,this._applyWithArgs("optIter",$vars.x));return this._endStructure($r2);},function(){return this._apply("semAction");}));$r1.value=this._appendStructure($r1,this._applyWithArgs("optBind",$vars.e));return this._endStructure($r1);},function(){return this._apply("semPred");}));return this._endStructure($r0);},
"expr2":function(){var $elf=this,$vars={},$r0=this._startStructure("expr2");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","~"));$vars.x=this._appendStructure($r1,this._apply("expr2"));$r1.value=["Not",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","&"));$vars.x=this._appendStructure($r1,this._apply("expr1"));$r1.value=["Lookahead",$vars.x];return this._endStructure($r1);},function(){return this._apply("expr1");}));return this._endStructure($r0);},
"expr1":function(){var $elf=this,$vars={},$r0=this._startStructure("expr1");$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("application");},function(){var $r1=this._startStructure(null);$vars.x=this._appendStructure($r1,this._or(function(){return this._applyWithArgs("keyword","undefined");},function(){return this._applyWithArgs("keyword","nil");},function(){return this._applyWithArgs("keyword","true");},function(){return this._applyWithArgs("keyword","false");}));$r1.value=["App","exactly",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._or(function(){return this._apply("characters");},function(){return this._apply("sCharacters");},function(){return this._apply("string");},function(){return this._apply("number");}));return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","["));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token","]"));$r1.value=["Form",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=["ConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","@<"));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",">"));$r1.value=["IdxConsBy",$vars.x];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.x=this._appendStructure($r1,this._apply("expr"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.x;return this._endStructure($r1);}));return this._endStructure($r0);},
"ruleName":function(){var $elf=this,$vars={},$r0=this._startStructure("ruleName");$r0.value=this._appendStructure($r0,this._or(function(){return this._apply("name");},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("spaces"));$r1.value=this._appendStructure($r1,this._apply("tsString"));return this._endStructure($r1);}));return this._endStructure($r0);},
"rule":function(){var $elf=this,$vars={},$r0=this._startStructure("rule");this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(null);$r1.value=($vars.n=this._appendStructure($r1,this._apply("ruleName")));return this._endStructure($r1);}));(this["locals"]=({}));$vars.x=this._appendStructure($r0,this._applyWithArgs("rulePart",$vars.n));$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token",","));$r1.value=this._appendStructure($r1,this._applyWithArgs("rulePart",$vars.n));return this._endStructure($r1);}));$r0.value=["Rule",$vars.n,["Or",$vars.x].concat($vars.xs)];return this._endStructure($r0);},
"rulePart":function(){var $elf=this,$vars={},$r0=this._startStructure("rulePart");$vars.rn=this._appendStructure($r0,this.anything());$vars.n=this._appendStructure($r0,this._apply("ruleName"));this._pred(($vars.n == $vars.rn));$vars.b1=this._appendStructure($r0,this._applyWithArgs("expr4",false));$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","="));$vars.b2=this._appendStructure($r1,this._apply("expr"));$r1.value=["And",$vars.b1,$vars.b2];return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("empty"));$r1.value=$vars.b1;return this._endStructure($r1);}));return this._endStructure($r0);},
"grammar":function(){var $elf=this,$vars={},$r0=this._startStructure("grammar");this._appendStructure($r0,this._applyWithArgs("keyword","ometa"));$vars.sn=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._applyWithArgs("token","("));$vars.sni=this._appendStructure($r1,this._apply("name"));this._appendStructure($r1,this._applyWithArgs("token",")"));$r1.value=$vars.sni;return this._endStructure($r1);},function(){var $r1=this._startStructure(null);this._appendStructure($r1,this._apply("empty"));$r1.value="OMeta";return this._endStructure($r1);}));this._appendStructure($r0,this._applyWithArgs("token","{"));$vars.rs=this._appendStructure($r0,this._applyWithArgs("enum","rule",","));this._appendStructure($r0,this._applyWithArgs("token","}"));$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaOptimizer,"optimizeGrammar",["Grammar",$vars.sn].concat($vars.rs)));return this._endStructure($r0);}});(BSOMetaParser["hexDigits"]="0123456789abcdef");let BSOMetaTranslator=objectThatDelegatesTo(OMeta,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure("App");$r0.value=this._appendStructure($r0,this._or(function(){return (function(){var $r2=this._startStructure(null);switch(this._appendStructure($r2,this._apply('anything'))){case "super":$vars.args=this._appendStructure($r2,this._many1(function(){return this._apply("transFn");}));$r2.value=[this["sName"],"._superApplyWithArgs(this,",$vars.args.join(","),")"].join("");break;default: throw fail}return this._endStructure($r2);}).call(this);},function(){var $r1=this._startStructure(null);$vars.rule=this._appendStructure($r1,this.anything());$vars.args=this._appendStructure($r1,this._many(function(){return this._apply("transFn");}));$r1.value=this._appendStructure($r1,this._or(function(){var $r2=this._startStructure(null);this._pred(this._optimizedCall($vars.rule,$vars.args));$r2.value=["this.",this["_callables"][$vars.rule]["name"],"(",$vars.args.join(","),")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(null);this._pred(($vars.args["length"] < (1)));$r2.value=["this._apply(\"",$vars.rule,"\")"].join("");return this._endStructure($r2);},function(){var $r2=this._startStructure(null);$r2.value=["this._applyWithArgs(\"",$vars.rule,"\",",$vars.args.join(","),")"].join("");return this._endStructure($r2);}));return this._endStructure($r1);}));return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure("Pred");$vars.expr=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._pred(",$vars.expr,")"].join("");return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure("Or");$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("transFn");}));$r0.value=["this._or(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure("XOr");$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("transFn");}));$vars.xs.unshift(this["rName"].toProgramString());$r0.value=["this._xor(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure("And");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.xs=this._appendStructure($r1,this._many1(function(){return this._apply("transFn");}));$r1.value=$vars.xs.join(";");return this._endStructure($r1);},function(){var $r1=this._startStructure(null);$r1.value="undefined";return this._endStructure($r1);}));return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure("Opt");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._opt(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure("Many");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many(",$vars.x,")"].join("");return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure("Many1");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._many1(",$vars.x,")"].join("");return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure("Set");$vars.n=this._appendStructure($r0,this.anything());$vars.v=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$vars.",$vars.n,"=",$vars.v].join("");return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure("Not");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._not(",$vars.x,")"].join("");return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure("Lookahead");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._lookahead(",$vars.x,")"].join("");return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure("Form");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._form(",$vars.x,")"].join("");return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure("ConsBy");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._consumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure("IdxConsBy");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._idxConsumedBy(",$vars.x,")"].join("");return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure("JumpTable");this["_storeVar"]++;$vars.cases=this._appendStructure($r0,this._many(function(){return this._apply("jtCase");}));this["_storeVar"]--;$r0.value=this.jumpTableCode($vars.cases);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure("Interleave");$vars.xs=this._appendStructure($r0,this._many(function(){return this._apply("intPart");}));$r0.value=["this._interleave(",$vars.xs.join(","),")"].join("");return this._endStructure($r0);},
"Function":function(){var $elf=this,$vars={},$r0=this._startStructure("Function");this["_storeVar"]++;$vars.x=this._appendStructure($r0,this._apply("transFn"));this["_storeVar"]--;$r0.value=["function(){",$vars.x,";}"].join("");return this._endStructure($r0);},
"FunctionStructure":function(){var $elf=this,$vars={},$r0=this._startStructure("FunctionStructure");this["_storeVar"]++;$vars.xs=this._appendStructure($r0,this._many1(function(){return this._apply("transFn");}));this["_storeVar"]--;$r0.value=["function(){var $r",(this["_storeVar"] + (1)),"=this._startStructure(null);",$vars.xs.join(";"),";return this._endStructure($r",(this["_storeVar"] + (1)),");}"].join("");return this._endStructure($r0);},
"ReturnStructure":function(){var $elf=this,$vars={},$r0=this._startStructure("ReturnStructure");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["$r",this["_storeVar"],".value=",$vars.x].join("");return this._endStructure($r0);},
"Return":function(){var $elf=this,$vars={},$r0=this._startStructure("Return");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["return ",$vars.x].join("");return this._endStructure($r0);},
"Parenthesis":function(){var $elf=this,$vars={},$r0=this._startStructure("Parenthesis");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["(",$vars.x,")"].join("");return this._endStructure($r0);},
"Store":function(){var $elf=this,$vars={},$r0=this._startStructure("Store");$vars.x=this._appendStructure($r0,this._apply("transFn"));$r0.value=["this._appendStructure($r",this["_storeVar"],",",$vars.x,")"].join("");return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure("Js");$r0.value=this._appendStructure($r0,this._apply("transJs"));return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure("Rule");$vars.name=this._appendStructure($r0,this.anything());(function (){(this["rName"]=$vars.name);return (this["_storeVar"]=(0));}).call(this);$vars.body=this._appendStructure($r0,this._apply("trans"));$r0.value=["\n\"",$vars.name,"\":function(){var $elf=this,","$vars={},","$r0=this._startStructure(\"",$vars.name,"\");",$vars.body,";return this._endStructure($r0);}"].join("");return this._endStructure($r0);},
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure("Grammar");$vars.sName=this._appendStructure($r0,this.anything());(this["sName"]=$vars.sName);$vars.rules=this._appendStructure($r0,this._many(function(){return this._apply("trans");}));$r0.value=["objectThatDelegatesTo(",$vars.sName,",{",$vars.rules.join(","),"})"].join("");return this._endStructure($r0);},
"intPart":function(){var $elf=this,$vars={},$r0=this._startStructure("intPart");this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(null);$vars.mode=this._appendStructure($r1,this.anything());$r1.value=($vars.part=this._appendStructure($r1,this._apply("transFn")));return this._endStructure($r1);}));$r0.value=(($vars.mode.toProgramString() + ",") + $vars.part);return this._endStructure($r0);},
"jtCase":function(){var $elf=this,$vars={},$r0=this._startStructure("jtCase");this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(null);$vars.x=this._appendStructure($r1,this.anything());$r1.value=($vars.e=this._appendStructure($r1,this._apply("trans")));return this._endStructure($r1);}));$r0.value=[$vars.x.toProgramString(),$vars.e];return this._endStructure($r0);},
"transJs":function(){var $elf=this,$vars={},$r0=this._startStructure("transJs");$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSSemActionTranslator,"trans"));return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure("trans");this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(null);$vars.t=this._appendStructure($r1,this.anything());$r1.value=($vars.ans=this._appendStructure($r1,this._apply($vars.t)));return this._endStructure($r1);}));$r0.value=$vars.ans;return this._endStructure($r0);},
"transFn":function(){var $elf=this,$vars={},$r0=this._startStructure("transFn");$vars.x=this._appendStructure($r0,this._apply("trans"));$r0.value=$vars.x;return this._endStructure($r0);}});(BSOMetaTranslator["_callables"]=({"anything": ({"name": "anything","nbArgs": (0)}),"apply": ({"name": "_apply","nbArgs": (1)}),"end": ({"name": "end","nbArgs": (0)}),"exactly": ({"name": "exactly","nbArgs": (1)}),"seq": ({"name": "seq","nbArgs": (1)})}));(BSOMetaTranslator["_optimizedCall"]=(function (rule,args){let c=this["_callables"][rule];return (c && (c["nbArgs"] == args["length"]));}));(BSOMetaTranslator["jumpTableCode"]=(function (cases){var buf=new StringBuffer();buf.nextPutAll((("(function(){var $r" + (this["_storeVar"] + (1))) + "=this._startStructure(null);"));buf.nextPutAll((("switch(this._appendStructure($r" + (this["_storeVar"] + (1))) + ",this._apply(\'anything\'))){"));for(var i=(0);(i < cases["length"]);(i+=(1))){buf.nextPutAll((((("case " + cases[i][(0)]) + ":") + cases[i][(1)]) + ";break;"));}buf.nextPutAll((("default: throw fail}return this._endStructure($r" + (this["_storeVar"] + (1))) + ");}).call(this)"));return buf.contents();}))
