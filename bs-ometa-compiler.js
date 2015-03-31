// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let Locals=objectThatDelegatesTo(OMeta,{
"trans":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){$vars.t=this._apply("anything");this._pred(($vars.t == "name"));return ($vars.n=this._apply("anything"));});return [$vars.t,this._renameVariable($vars.n)];},function(){this._form(function(){$vars.t=this._apply("anything");this._pred(($vars.t == "get"));return ($vars.n=this._apply("anything"));});return [$vars.t,this._renameVariable($vars.n)];},function(){this._form(function(){$vars.t=this._apply("anything");return ($vars.ts=this._many(function(){$vars.e=this._lookahead(function(){return this._apply("anything");});return this._or(function(){this._pred(((((typeof $vars.e) != "string") && ($vars.e["length"] != undefined)) && ($vars.e["length"] > (0))));return this._apply("trans");},function(){return this._apply("anything");});}));});return [$vars.t].concat($vars.ts);});},
"rename":function(){var $elf=this, $vars={};this._form(function(){$vars.allowed=this._apply("anything");(this["_allowed"]=$vars.allowed);return ($vars.result=this._apply("trans"));});return $vars.result;}});(Locals["_renameVariable"]=(function (name){if(((name != "$elf") && this["_allowed"][name])){return ("$vars." + name);}else{undefined;}return name;}));let BSSemActionParser=objectThatDelegatesTo(BSJSParser,{
"curlySemAction":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","{");$vars.r=this._apply("expr");this._apply("sc");this._applyWithArgs("token","}");return $vars.r;},function(){this._applyWithArgs("token","{");$vars.ss=this._many(function(){$vars.s=this._apply("srcElem");this._lookahead(function(){return this._apply("srcElem");});return $vars.s;});$vars.s=this._or(function(){$vars.r=this._apply("expr");this._apply("sc");return ["return",$vars.r];},function(){return this._apply("srcElem");});$vars.ss.push($vars.s);this._applyWithArgs("token","}");return ["send","call",["func",[],["begin"].concat($vars.ss)],["this"]];});},
"semAction":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("curlySemAction");},function(){$vars.r=this._apply("primExpr");this._apply("spaces");return $vars.r;});}});let BSOMetaParser=objectThatDelegatesTo(BaseStrParser,{
"enum":function(){var $elf=this, $vars={};$vars.r=this._apply("anything");$vars.d=this._apply("anything");$vars.v=this._applyWithArgs("listOf",$vars.r,$vars.d);this._or(function(){return this._applyWithArgs("token",",");},function(){return this._apply("empty");});return $vars.v;},
"space":function(){var $elf=this, $vars={};return this._or(function(){return BaseStrParser._superApplyWithArgs(this,'space');},function(){return this._applyWithArgs("fromTo","//","\n");},function(){return this._applyWithArgs("fromTo","/*","*/");});},
"nameFirst":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "_":return "_";case "$":return "$";default: throw fail}}).call(this);},function(){return this._apply("letter");});},
"nameRest":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("nameFirst");},function(){return this._apply("digit");});},
"tsName":function(){var $elf=this, $vars={};return this._consumedBy(function(){this._apply("nameFirst");return this._many(function(){return this._apply("nameRest");});});},
"name":function(){var $elf=this, $vars={};this._apply("spaces");return this._apply("tsName");},
"hexDigit":function(){var $elf=this, $vars={};$vars.x=this._apply("char");$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));return $vars.v;},
"eChar":function(){var $elf=this, $vars={};return this._or(function(){$vars.s=this._consumedBy(function(){this._applyWithArgs("exactly","\\");return this._or(function(){return (function(){switch(this._apply('anything')){case "u":this._apply("hexDigit");this._apply("hexDigit");this._apply("hexDigit");return this._apply("hexDigit");case "x":this._apply("hexDigit");return this._apply("hexDigit");default: throw fail}}).call(this);},function(){return this._apply("char");});});return unescape($vars.s);},function(){return this._apply("char");});},
"tsString":function(){var $elf=this, $vars={};this._applyWithArgs("exactly","\'");$vars.xs=this._many(function(){this._not(function(){return this._applyWithArgs("exactly","\'");});return this._apply("eChar");});this._applyWithArgs("exactly","\'");return $vars.xs.join("");},
"characters":function(){var $elf=this, $vars={};this._applyWithArgs("exactly","`");this._applyWithArgs("exactly","`");$vars.xs=this._many(function(){this._not(function(){this._applyWithArgs("exactly","\'");return this._applyWithArgs("exactly","\'");});return this._apply("eChar");});this._applyWithArgs("exactly","\'");this._applyWithArgs("exactly","\'");return ["App","seq",$vars.xs.join("").toProgramString()];},
"sCharacters":function(){var $elf=this, $vars={};this._applyWithArgs("exactly","\"");$vars.xs=this._many(function(){this._not(function(){return this._applyWithArgs("exactly","\"");});return this._apply("eChar");});this._applyWithArgs("exactly","\"");return ["App","token",$vars.xs.join("").toProgramString()];},
"string":function(){var $elf=this, $vars={};$vars.xs=this._or(function(){(function(){switch(this._apply('anything')){case "#":return "#";case "`":return "`";default: throw fail}}).call(this);return this._apply("tsName");},function(){return this._apply("tsString");});return ["App","exactly",$vars.xs.toProgramString()];},
"number":function(){var $elf=this, $vars={};$vars.n=this._consumedBy(function(){this._opt(function(){return this._applyWithArgs("exactly","-");});return this._many1(function(){return this._apply("digit");});});return ["App","exactly",$vars.n];},
"keyword":function(){var $elf=this, $vars={};$vars.xs=this._apply("anything");this._applyWithArgs("token",$vars.xs);this._not(function(){return this._apply("letterOrDigit");});return $vars.xs;},
"args":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "(":$vars.xs=this._applyWithArgs("listOf","hostExpr",",");this._applyWithArgs("token",")");return $vars.xs;default: throw fail}}).call(this);},function(){this._apply("empty");return [];});},
"application":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","^");$vars.rule=this._apply("name");$vars.as=this._apply("args");return ["App","super",(("\'" + $vars.rule) + "\'")].concat($vars.as);},function(){$vars.grm=this._apply("name");this._applyWithArgs("token",".");$vars.rule=this._apply("name");$vars.as=this._apply("args");return ["App","foreign",$vars.grm,(("\'" + $vars.rule) + "\'")].concat($vars.as);},function(){$vars.rule=this._apply("name");$vars.as=this._apply("args");return ["App",$vars.rule].concat($vars.as);});},
"localsVars":function(){var $elf=this, $vars={};$vars.s=this._apply("anything");return this._applyWithArgs("foreign",Locals,'rename',[this["locals"],$vars.s]);},
"hostExpr":function(){var $elf=this, $vars={};$vars.r=this._applyWithArgs("foreign",BSSemActionParser,'expr');$vars.rr=this._applyWithArgs("localsVars",$vars.r);return this._applyWithArgs("foreign",BSJSTranslator,'trans',$vars.rr);},
"curlyHostExpr":function(){var $elf=this, $vars={};$vars.r=this._applyWithArgs("foreign",BSSemActionParser,'curlySemAction');$vars.rr=this._applyWithArgs("localsVars",$vars.r);return this._applyWithArgs("foreign",BSJSTranslator,'trans',$vars.rr);},
"primHostExpr":function(){var $elf=this, $vars={};$vars.r=this._applyWithArgs("foreign",BSSemActionParser,'semAction');$vars.rr=this._applyWithArgs("localsVars",$vars.r);return this._applyWithArgs("foreign",BSJSTranslator,'trans',$vars.rr);},
"atomicHostExpr":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("curlyHostExpr");},function(){return this._apply("primHostExpr");});},
"semAction":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("curlyHostExpr");return ["Act",$vars.x];},function(){this._applyWithArgs("token","!");$vars.x=this._apply("atomicHostExpr");return ["Act",$vars.x];});},
"arrSemAction":function(){var $elf=this, $vars={};this._applyWithArgs("token","->");$vars.x=this._apply("atomicHostExpr");return ["Act",$vars.x];},
"semPred":function(){var $elf=this, $vars={};this._applyWithArgs("token","?");$vars.x=this._apply("atomicHostExpr");return ["Pred",$vars.x];},
"expr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._applyWithArgs("expr5",true);$vars.xs=this._many1(function(){this._applyWithArgs("token","|");return this._applyWithArgs("expr5",true);});return ["Or",$vars.x].concat($vars.xs);},function(){$vars.x=this._applyWithArgs("expr5",true);$vars.xs=this._many1(function(){this._applyWithArgs("token","||");return this._applyWithArgs("expr5",true);});return ["XOr",$vars.x].concat($vars.xs);},function(){return this._applyWithArgs("expr5",false);});},
"expr5":function(){var $elf=this, $vars={};$vars.ne=this._apply("anything");return this._or(function(){$vars.x=this._apply("interleavePart");$vars.xs=this._many1(function(){this._applyWithArgs("token","&&");return this._apply("interleavePart");});return ["Interleave",$vars.x].concat($vars.xs);},function(){return this._applyWithArgs("expr4",$vars.ne);});},
"interleavePart":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","(");$vars.part=this._applyWithArgs("expr4",true);this._applyWithArgs("token",")");return ["1",$vars.part];},function(){$vars.part=this._applyWithArgs("expr4",true);return this._applyWithArgs("modedIPart",$vars.part);});},
"modedIPart":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){this._applyWithArgs("exactly","And");return this._form(function(){this._applyWithArgs("exactly","Many");return ($vars.part=this._apply("anything"));});});return ["*",$vars.part];},function(){this._form(function(){this._applyWithArgs("exactly","And");return this._form(function(){this._applyWithArgs("exactly","Many1");return ($vars.part=this._apply("anything"));});});return ["+",$vars.part];},function(){this._form(function(){this._applyWithArgs("exactly","And");return this._form(function(){this._applyWithArgs("exactly","Opt");return ($vars.part=this._apply("anything"));});});return ["?",$vars.part];},function(){$vars.part=this._apply("anything");return ["1",$vars.part];});},
"expr4":function(){var $elf=this, $vars={};$vars.ne=this._apply("anything");return this._or(function(){$vars.xs=this._many(function(){return this._apply("expr3");});$vars.act=this._apply("arrSemAction");return ["And"].concat($vars.xs).concat([$vars.act]);},function(){this._pred($vars.ne);$vars.xs=this._many1(function(){return this._apply("expr3");});return ["And"].concat($vars.xs);},function(){this._pred(($vars.ne == false));$vars.xs=this._many(function(){return this._apply("expr3");});return ["And"].concat($vars.xs);});},
"optIter":function(){var $elf=this, $vars={};$vars.x=this._apply("anything");return this._or(function(){return (function(){switch(this._apply('anything')){case "*":return ["Many",$vars.x];case "+":return ["Many1",$vars.x];case "?":return ["Opt",$vars.x];default: throw fail}}).call(this);},function(){this._apply("empty");return $vars.x;});},
"optBind":function(){var $elf=this, $vars={};$vars.x=this._apply("anything");return this._or(function(){return (function(){switch(this._apply('anything')){case ":":$vars.n=this._apply("name");return (function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,$vars.x];}).call(this);default: throw fail}}).call(this);},function(){this._apply("empty");return $vars.x;});},
"expr3":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token",":");$vars.n=this._apply("name");return (function (){(this["locals"][$vars.n]=true);return ["Set",$vars.n,["App","anything"]];}).call(this);},function(){$vars.e=this._or(function(){$vars.x=this._apply("expr2");return this._applyWithArgs("optIter",$vars.x);},function(){return this._apply("semAction");});return this._applyWithArgs("optBind",$vars.e);},function(){return this._apply("semPred");});},
"expr2":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","~");$vars.x=this._apply("expr2");return ["Not",$vars.x];},function(){this._applyWithArgs("token","&");$vars.x=this._apply("expr1");return ["Lookahead",$vars.x];},function(){return this._apply("expr1");});},
"expr1":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("application");},function(){$vars.x=this._or(function(){return this._applyWithArgs("keyword","undefined");},function(){return this._applyWithArgs("keyword","nil");},function(){return this._applyWithArgs("keyword","true");},function(){return this._applyWithArgs("keyword","false");});return ["App","exactly",$vars.x];},function(){this._apply("spaces");return this._or(function(){return this._apply("characters");},function(){return this._apply("sCharacters");},function(){return this._apply("string");},function(){return this._apply("number");});},function(){this._applyWithArgs("token","[");$vars.x=this._apply("expr");this._applyWithArgs("token","]");return ["Form",$vars.x];},function(){this._applyWithArgs("token","<");$vars.x=this._apply("expr");this._applyWithArgs("token",">");return ["ConsBy",$vars.x];},function(){this._applyWithArgs("token","@<");$vars.x=this._apply("expr");this._applyWithArgs("token",">");return ["IdxConsBy",$vars.x];},function(){this._applyWithArgs("token","(");$vars.x=this._apply("expr");this._applyWithArgs("token",")");return $vars.x;});},
"ruleName":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("name");},function(){this._apply("spaces");return this._apply("tsString");});},
"rule":function(){var $elf=this, $vars={};this._lookahead(function(){return ($vars.n=this._apply("ruleName"));});(this["locals"]=({}));$vars.x=this._applyWithArgs("rulePart",$vars.n);$vars.xs=this._many(function(){this._applyWithArgs("token",",");return this._applyWithArgs("rulePart",$vars.n);});return ["Rule",$vars.n,["Or",$vars.x].concat($vars.xs)];},
"rulePart":function(){var $elf=this, $vars={};$vars.rn=this._apply("anything");$vars.n=this._apply("ruleName");this._pred(($vars.n == $vars.rn));$vars.b1=this._applyWithArgs("expr4",false);return this._or(function(){this._applyWithArgs("token","=");$vars.b2=this._apply("expr");return ["And",$vars.b1,$vars.b2];},function(){this._apply("empty");return $vars.b1;});},
"grammar":function(){var $elf=this, $vars={};this._applyWithArgs("keyword","ometa");$vars.sn=this._or(function(){this._applyWithArgs("token","(");$vars.sni=this._apply("name");this._applyWithArgs("token",")");return $vars.sni;},function(){this._apply("empty");return "OMeta";});this._applyWithArgs("token","{");$vars.rs=this._applyWithArgs("enum","rule",",");this._applyWithArgs("token","}");return this._applyWithArgs("foreign",BSOMetaOptimizer,'optimizeGrammar',["Grammar",$vars.sn].concat($vars.rs));}});(BSOMetaParser["hexDigits"]="0123456789abcdef");let BSOMetaTranslator=objectThatDelegatesTo(OMeta,{
"App":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "super":$vars.args=this._many1(function(){return this._apply("anything");});return [this["sName"],"._superApplyWithArgs(this,",$vars.args.join(","),")"].join("");default: throw fail}}).call(this);},function(){$vars.rule=this._apply("anything");$vars.args=this._many1(function(){return this._apply("anything");});return ["this._applyWithArgs(\"",$vars.rule,"\",",$vars.args.join(","),")"].join("");},function(){$vars.rule=this._apply("anything");return ["this._apply(\"",$vars.rule,"\")"].join("");});},
"Act":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return $vars.expr;},
"Pred":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return ["this._pred(",$vars.expr,")"].join("");},
"Or":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("transFn");});return ["this._or(",$vars.xs.join(","),")"].join("");},
"XOr":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("transFn");});$vars.xs.unshift(this["rName"].toProgramString());return ["this._xor(",$vars.xs.join(","),")"].join("");},
"And":function(){var $elf=this, $vars={};return this._or(function(){$vars.xs=this._many(function(){return this._apply("transFn");});return $vars.xs.join(";");},function(){return "undefined";});},
"Opt":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._opt(",$vars.x,")"].join("");},
"Many":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._many(",$vars.x,")"].join("");},
"Many1":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._many1(",$vars.x,")"].join("");},
"Set":function(){var $elf=this, $vars={};$vars.n=this._apply("anything");$vars.v=this._apply("trans");return ["$vars.",$vars.n,"=",$vars.v].join("");},
"Not":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._not(",$vars.x,")"].join("");},
"Lookahead":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._lookahead(",$vars.x,")"].join("");},
"Form":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._form(",$vars.x,")"].join("");},
"ConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._consumedBy(",$vars.x,")"].join("");},
"IdxConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["this._idxConsumedBy(",$vars.x,")"].join("");},
"JumpTable":function(){var $elf=this, $vars={};$vars.cases=this._many(function(){return this._apply("jtCase");});return this.jumpTableCode($vars.cases);},
"Interleave":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("intPart");});return ["this._interleave(",$vars.xs.join(","),")"].join("");},
"Function":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("transFn");});return ["function(){",$vars.xs.join(";"),";}"].join("");},
"Return":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["return ",$vars.x].join("");},
"Parenthesis":function(){var $elf=this, $vars={};$vars.x=this._apply("transFn");return ["(",$vars.x,")"].join("");},
"Rule":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");(this["rName"]=$vars.name);$vars.body=this._apply("trans");return ["\n\"",$vars.name,"\":function(){var $elf=this, $vars={};",$vars.body,";}"].join("");},
"Grammar":function(){var $elf=this, $vars={};$vars.sName=this._apply("anything");(this["sName"]=$vars.sName);$vars.rules=this._many(function(){return this._apply("trans");});return ["objectThatDelegatesTo(",$vars.sName,",{",$vars.rules.join(","),"})"].join("");},
"intPart":function(){var $elf=this, $vars={};this._form(function(){$vars.mode=this._apply("anything");return ($vars.part=this._apply("transFn"));});return (($vars.mode.toProgramString() + ",") + $vars.part);},
"jtCase":function(){var $elf=this, $vars={};this._form(function(){$vars.x=this._apply("anything");return ($vars.e=this._apply("trans"));});return [$vars.x.toProgramString(),$vars.e];},
"locals":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){return ($vars.vs=this._many1(function(){return this._apply("string");}));});return ["var ",$vars.vs.join(","),";"].join("");},function(){this._form(function(){return ;});return "";});},
"trans":function(){var $elf=this, $vars={};this._form(function(){$vars.t=this._apply("anything");return ($vars.ans=this._applyWithArgs("apply",$vars.t));});return $vars.ans;},
"transFn":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return $vars.x;}});(BSOMetaTranslator["jumpTableCode"]=(function (cases){var buf=new StringBuffer();buf.nextPutAll("(function(){switch(this._apply(\'anything\')){");for(var i=(0);(i < cases["length"]);(i+=(1))){buf.nextPutAll((((("case " + cases[i][(0)]) + ":") + cases[i][(1)]) + ";"));}buf.nextPutAll("default: throw fail}}).call(this)");return buf.contents();}))
