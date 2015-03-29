// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let BSJSParser=objectThatDelegatesTo(OMeta,{
"enum":function(){var $elf=this, $vars={};$vars.r=this._apply("anything");$vars.d=this._apply("anything");$vars.v=this._applyWithArgs("listOf",$vars.r,$vars.d);this._or(function(){return this._applyWithArgs("token",",");},function(){return this._apply("empty");});return $vars.v;},
"space":function(){var $elf=this, $vars={};return this._or(function(){return OMeta._superApplyWithArgs(this,'space');},function(){return this._applyWithArgs("fromTo","//","\n");},function(){return this._applyWithArgs("fromTo","/*","*/");});},
"nameFirst":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("letter");},function(){return (function(){switch(this._apply('anything')){case "$":return "$";case "_":return "_";default: throw fail}}).call(this);});},
"nameRest":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("nameFirst");},function(){return this._apply("digit");});},
"iName":function(){var $elf=this, $vars={};return this._consumedBy(function(){this._apply("nameFirst");return this._many(function(){return this._apply("nameRest");});});},
"isKeyword":function(){var $elf=this, $vars={};$vars.x=this._apply("anything");return this._pred(BSJSParser._isKeyword($vars.x));},
"name":function(){var $elf=this, $vars={};$vars.n=this._apply("iName");this._not(function(){return this._applyWithArgs("isKeyword",$vars.n);});return ["name",(($vars.n == "self")?"$elf":$vars.n)];},
"keyword":function(){var $elf=this, $vars={};$vars.k=this._apply("iName");this._applyWithArgs("isKeyword",$vars.k);return [$vars.k,$vars.k];},
"hexDigit":function(){var $elf=this, $vars={};$vars.x=this._apply("char");$vars.v=this["hexDigits"].indexOf($vars.x.toLowerCase());this._pred(($vars.v >= (0)));return $vars.v;},
"hexLit":function(){var $elf=this, $vars={};return this._or(function(){$vars.n=this._apply("hexLit");$vars.d=this._apply("hexDigit");return (($vars.n * (16)) + $vars.d);},function(){return this._apply("hexDigit");});},
"number":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "0":this._applyWithArgs("exactly","x");"0x";$vars.n=this._apply("hexLit");return ["number",$vars.n];default: throw fail}}).call(this);},function(){$vars.f=this._consumedBy(function(){this._many1(function(){return this._apply("digit");});return this._opt(function(){this._applyWithArgs("exactly",".");return this._many1(function(){return this._apply("digit");});});});return ["number",parseFloat($vars.f)];});},
"escapeChar":function(){var $elf=this, $vars={};$vars.s=this._consumedBy(function(){this._applyWithArgs("exactly","\\");return this._or(function(){return (function(){switch(this._apply('anything')){case "u":this._apply("hexDigit");this._apply("hexDigit");this._apply("hexDigit");return this._apply("hexDigit");case "x":this._apply("hexDigit");return this._apply("hexDigit");default: throw fail}}).call(this);},function(){return this._apply("char");});});return unescape($vars.s);},
"str":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "\"":return this._or(function(){return (function(){switch(this._apply('anything')){case "\"":this._applyWithArgs("exactly","\"");"\"\"\"";$vars.cs=this._many(function(){this._not(function(){this._applyWithArgs("exactly","\"");this._applyWithArgs("exactly","\"");this._applyWithArgs("exactly","\"");return "\"\"\"";});return this._apply("char");});this._applyWithArgs("exactly","\"");this._applyWithArgs("exactly","\"");this._applyWithArgs("exactly","\"");"\"\"\"";return ["string",$vars.cs.join("")];default: throw fail}}).call(this);},function(){$vars.cs=this._many(function(){return this._or(function(){return this._apply("escapeChar");},function(){this._not(function(){return this._applyWithArgs("exactly","\"");});return this._apply("char");});});this._applyWithArgs("exactly","\"");return ["string",$vars.cs.join("")];});case "\'":$vars.cs=this._many(function(){return this._or(function(){return this._apply("escapeChar");},function(){this._not(function(){return this._applyWithArgs("exactly","\'");});return this._apply("char");});});this._applyWithArgs("exactly","\'");return ["string",$vars.cs.join("")];default: throw fail}}).call(this);},function(){(function(){switch(this._apply('anything')){case "#":return "#";case "`":return "`";default: throw fail}}).call(this);$vars.n=this._apply("iName");return ["string",$vars.n];});},
"special":function(){var $elf=this, $vars={};$vars.s=(function(){switch(this._apply('anything')){case "(":return "(";case ")":return ")";case "{":return "{";case "}":return "}";case "[":return "[";case "]":return "]";case ",":return ",";case ";":return ";";case "?":return "?";case ":":return ":";case "!":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "!==";default: throw fail}}).call(this);},function(){return "!=";});default: throw fail}}).call(this);},function(){return "!";});case "=":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "===";default: throw fail}}).call(this);},function(){return "==";});default: throw fail}}).call(this);},function(){return "=";});case ">":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return ">=";default: throw fail}}).call(this);},function(){return ">";});case "<":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "<=";default: throw fail}}).call(this);},function(){return "<";});case "+":return this._or(function(){return (function(){switch(this._apply('anything')){case "+":return "++";case "=":return "+=";default: throw fail}}).call(this);},function(){return "+";});case "-":return this._or(function(){return (function(){switch(this._apply('anything')){case "-":return "--";case "=":return "-=";default: throw fail}}).call(this);},function(){return "-";});case "*":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "*=";default: throw fail}}).call(this);},function(){return "*";});case "/":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "/=";default: throw fail}}).call(this);},function(){return "/";});case "%":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "%=";default: throw fail}}).call(this);},function(){return "%";});case "&":return (function(){switch(this._apply('anything')){case "&":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "&&=";default: throw fail}}).call(this);},function(){return "&&";});default: throw fail}}).call(this);case "|":return (function(){switch(this._apply('anything')){case "|":return this._or(function(){return (function(){switch(this._apply('anything')){case "=":return "||=";default: throw fail}}).call(this);},function(){return "||";});default: throw fail}}).call(this);case ".":return ".";default: throw fail}}).call(this);return [$vars.s,$vars.s];},
"tok":function(){var $elf=this, $vars={};this._apply("spaces");return this._or(function(){return this._apply("name");},function(){return this._apply("keyword");},function(){return this._apply("number");},function(){return this._apply("str");},function(){return this._apply("special");});},
"toks":function(){var $elf=this, $vars={};$vars.ts=this._many(function(){return this._apply("token");});this._apply("spaces");this._apply("end");return $vars.ts;},
"token":function(){var $elf=this, $vars={};$vars.tt=this._apply("anything");$vars.t=this._apply("tok");this._pred(($vars.t[(0)] == $vars.tt));return $vars.t[(1)];},
"spacesNoNl":function(){var $elf=this, $vars={};return this._many(function(){this._not(function(){return this._applyWithArgs("exactly","\n");});return this._apply("space");});},
"expr":function(){var $elf=this, $vars={};$vars.e=this._apply("orExpr");return this._or(function(){this._applyWithArgs("token","?");$vars.t=this._apply("expr");this._applyWithArgs("token",":");$vars.f=this._apply("expr");return ["condExpr",$vars.e,$vars.t,$vars.f];},function(){this._applyWithArgs("token","=");$vars.rhs=this._apply("expr");return ["set",$vars.e,$vars.rhs];},function(){this._applyWithArgs("token","+=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"+",$vars.rhs];},function(){this._applyWithArgs("token","-=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"-",$vars.rhs];},function(){this._applyWithArgs("token","*=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"*",$vars.rhs];},function(){this._applyWithArgs("token","/=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"/",$vars.rhs];},function(){this._applyWithArgs("token","%=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"%",$vars.rhs];},function(){this._applyWithArgs("token","&&=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"&&",$vars.rhs];},function(){this._applyWithArgs("token","||=");$vars.rhs=this._apply("expr");return ["mset",$vars.e,"||",$vars.rhs];},function(){this._apply("empty");return $vars.e;});},
"orExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("orExpr");this._applyWithArgs("token","||");$vars.y=this._apply("andExpr");return ["binop","||",$vars.x,$vars.y];},function(){return this._apply("andExpr");});},
"andExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("andExpr");this._applyWithArgs("token","&&");$vars.y=this._apply("eqExpr");return ["binop","&&",$vars.x,$vars.y];},function(){return this._apply("eqExpr");});},
"eqExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("eqExpr");return this._or(function(){this._applyWithArgs("token","==");$vars.y=this._apply("relExpr");return ["binop","==",$vars.x,$vars.y];},function(){this._applyWithArgs("token","!=");$vars.y=this._apply("relExpr");return ["binop","!=",$vars.x,$vars.y];},function(){this._applyWithArgs("token","===");$vars.y=this._apply("relExpr");return ["binop","===",$vars.x,$vars.y];},function(){this._applyWithArgs("token","!==");$vars.y=this._apply("relExpr");return ["binop","!==",$vars.x,$vars.y];});},function(){return this._apply("relExpr");});},
"relExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("relExpr");return this._or(function(){this._applyWithArgs("token",">");$vars.y=this._apply("addExpr");return ["binop",">",$vars.x,$vars.y];},function(){this._applyWithArgs("token",">=");$vars.y=this._apply("addExpr");return ["binop",">=",$vars.x,$vars.y];},function(){this._applyWithArgs("token","<");$vars.y=this._apply("addExpr");return ["binop","<",$vars.x,$vars.y];},function(){this._applyWithArgs("token","<=");$vars.y=this._apply("addExpr");return ["binop","<=",$vars.x,$vars.y];},function(){this._applyWithArgs("token","instanceof");$vars.y=this._apply("addExpr");return ["binop","instanceof",$vars.x,$vars.y];});},function(){return this._apply("addExpr");});},
"addExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("addExpr");this._applyWithArgs("token","+");$vars.y=this._apply("mulExpr");return ["binop","+",$vars.x,$vars.y];},function(){$vars.x=this._apply("addExpr");this._applyWithArgs("token","-");$vars.y=this._apply("mulExpr");return ["binop","-",$vars.x,$vars.y];},function(){return this._apply("mulExpr");});},
"mulExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("mulExpr");this._applyWithArgs("token","*");$vars.y=this._apply("unary");return ["binop","*",$vars.x,$vars.y];},function(){$vars.x=this._apply("mulExpr");this._applyWithArgs("token","/");$vars.y=this._apply("unary");return ["binop","/",$vars.x,$vars.y];},function(){$vars.x=this._apply("mulExpr");this._applyWithArgs("token","%");$vars.y=this._apply("unary");return ["binop","%",$vars.x,$vars.y];},function(){return this._apply("unary");});},
"unary":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","-");$vars.p=this._apply("postfix");return ["unop","-",$vars.p];},function(){this._applyWithArgs("token","+");$vars.p=this._apply("postfix");return ["unop","+",$vars.p];},function(){this._applyWithArgs("token","++");$vars.p=this._apply("postfix");return ["preop","++",$vars.p];},function(){this._applyWithArgs("token","--");$vars.p=this._apply("postfix");return ["preop","--",$vars.p];},function(){this._applyWithArgs("token","!");$vars.p=this._apply("unary");return ["unop","!",$vars.p];},function(){this._applyWithArgs("token","void");$vars.p=this._apply("unary");return ["unop","void",$vars.p];},function(){this._applyWithArgs("token","delete");$vars.p=this._apply("unary");return ["unop","delete",$vars.p];},function(){this._applyWithArgs("token","typeof");$vars.p=this._apply("unary");return ["unop","typeof",$vars.p];},function(){return this._apply("postfix");});},
"postfix":function(){var $elf=this, $vars={};$vars.p=this._apply("primExpr");return this._or(function(){this._apply("spacesNoNl");this._applyWithArgs("token","++");return ["postop","++",$vars.p];},function(){this._apply("spacesNoNl");this._applyWithArgs("token","--");return ["postop","--",$vars.p];},function(){this._apply("empty");return $vars.p;});},
"primExpr":function(){var $elf=this, $vars={};return this._or(function(){$vars.p=this._apply("primExpr");return this._or(function(){this._applyWithArgs("token","[");$vars.i=this._apply("expr");this._applyWithArgs("token","]");return ["getp",$vars.i,$vars.p];},function(){this._applyWithArgs("token",".");$vars.m=this._applyWithArgs("token","name");this._applyWithArgs("token","(");$vars.as=this._applyWithArgs("listOf","expr",",");this._applyWithArgs("token",")");return ["send",$vars.m,$vars.p].concat($vars.as);},function(){this._applyWithArgs("token",".");$vars.f=this._applyWithArgs("token","name");return ["getp",["string",$vars.f],$vars.p];},function(){this._applyWithArgs("token","(");$vars.as=this._applyWithArgs("listOf","expr",",");this._applyWithArgs("token",")");return ["call",$vars.p].concat($vars.as);});},function(){return this._apply("primExprHd");});},
"primExprHd":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","(");$vars.e=this._apply("expr");this._applyWithArgs("token",")");return $vars.e;},function(){this._applyWithArgs("token","this");return ["this"];},function(){$vars.n=this._applyWithArgs("token","name");return ["get",$vars.n];},function(){$vars.n=this._applyWithArgs("token","number");return ["number",$vars.n];},function(){$vars.s=this._applyWithArgs("token","string");return ["string",$vars.s];},function(){this._applyWithArgs("token","function");return this._apply("funcRest");},function(){this._applyWithArgs("token","new");$vars.e=this._apply("primExpr");return ["new",$vars.e];},function(){this._applyWithArgs("token","[");$vars.es=this._applyWithArgs("enum","expr",",");this._applyWithArgs("token","]");return ["arr"].concat($vars.es);},function(){return this._apply("json");},function(){return this._apply("re");});},
"json":function(){var $elf=this, $vars={};this._applyWithArgs("token","{");$vars.bs=this._applyWithArgs("enum","jsonBinding",",");this._applyWithArgs("token","}");return ["json"].concat($vars.bs);},
"jsonBinding":function(){var $elf=this, $vars={};$vars.n=this._apply("jsonPropName");this._applyWithArgs("token",":");$vars.v=this._apply("expr");return ["binding",$vars.n,$vars.v];},
"jsonPropName":function(){var $elf=this, $vars={};return this._or(function(){return this._applyWithArgs("token","name");},function(){return this._applyWithArgs("token","number");},function(){return this._applyWithArgs("token","string");});},
"re":function(){var $elf=this, $vars={};this._apply("spaces");$vars.x=this._consumedBy(function(){this._applyWithArgs("exactly","/");this._apply("reBody");this._applyWithArgs("exactly","/");return this._many(function(){return this._apply("reFlag");});});return ["regExpr",$vars.x];},
"reBody":function(){var $elf=this, $vars={};this._apply("re1stChar");return this._many(function(){return this._apply("reChar");});},
"re1stChar":function(){var $elf=this, $vars={};return this._or(function(){this._not(function(){return (function(){switch(this._apply('anything')){case "*":return "*";case "\\":return "\\";case "/":return "/";case "[":return "[";default: throw fail}}).call(this);});return this._apply("reNonTerm");},function(){return this._apply("escapeChar");},function(){return this._apply("reClass");});},
"reChar":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("re1stChar");},function(){return (function(){switch(this._apply('anything')){case "*":return "*";default: throw fail}}).call(this);});},
"reNonTerm":function(){var $elf=this, $vars={};this._not(function(){return (function(){switch(this._apply('anything')){case "\n":return "\n";case "\r":return "\r";default: throw fail}}).call(this);});return this._apply("char");},
"reClass":function(){var $elf=this, $vars={};this._applyWithArgs("exactly","[");this._many(function(){return this._apply("reClassChar");});return this._applyWithArgs("exactly","]");},
"reClassChar":function(){var $elf=this, $vars={};this._not(function(){return (function(){switch(this._apply('anything')){case "[":return "[";case "]":return "]";default: throw fail}}).call(this);});return this._apply("reChar");},
"reFlag":function(){var $elf=this, $vars={};return this._apply("nameFirst");},
"formal":function(){var $elf=this, $vars={};this._apply("spaces");return this._applyWithArgs("token","name");},
"funcRest":function(){var $elf=this, $vars={};this._applyWithArgs("token","(");$vars.fs=this._applyWithArgs("listOf","formal",",");this._applyWithArgs("token",")");this._applyWithArgs("token","{");$vars.body=this._apply("srcElems");this._applyWithArgs("token","}");return ["func",$vars.fs,$vars.body];},
"sc":function(){var $elf=this, $vars={};return this._or(function(){this._apply("spacesNoNl");return this._or(function(){return (function(){switch(this._apply('anything')){case "\n":return "\n";default: throw fail}}).call(this);},function(){return this._lookahead(function(){return this._applyWithArgs("exactly","}");});},function(){return this._apply("end");});},function(){return this._applyWithArgs("token",";");});},
"varBinding":function(){var $elf=this, $vars={};$vars.n=this._applyWithArgs("token","name");$vars.v=this._or(function(){this._applyWithArgs("token","=");return this._apply("expr");},function(){this._apply("empty");return ["get","undefined"];});return ["assignVar",$vars.n,$vars.v];},
"block":function(){var $elf=this, $vars={};this._applyWithArgs("token","{");$vars.ss=this._apply("srcElems");this._applyWithArgs("token","}");return ["begin",$vars.ss];},
"stmt":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("block");},function(){$vars.decl=this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");});$vars.bs=this._applyWithArgs("listOf","varBinding",",");this._apply("sc");return ["beginVars",$vars.decl].concat($vars.bs);},function(){this._applyWithArgs("token","if");this._applyWithArgs("token","(");$vars.c=this._apply("expr");this._applyWithArgs("token",")");$vars.t=this._apply("stmt");$vars.f=this._or(function(){this._applyWithArgs("token","else");return this._apply("stmt");},function(){this._apply("empty");return ["get","undefined"];});return ["if",$vars.c,$vars.t,$vars.f];},function(){this._applyWithArgs("token","while");this._applyWithArgs("token","(");$vars.c=this._apply("expr");this._applyWithArgs("token",")");$vars.s=this._apply("stmt");return ["while",$vars.c,$vars.s];},function(){this._applyWithArgs("token","do");$vars.s=this._apply("stmt");this._applyWithArgs("token","while");this._applyWithArgs("token","(");$vars.c=this._apply("expr");this._applyWithArgs("token",")");this._apply("sc");return ["doWhile",$vars.s,$vars.c];},function(){this._applyWithArgs("token","for");this._applyWithArgs("token","(");$vars.i=this._or(function(){$vars.decl=this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");});$vars.bs=this._applyWithArgs("listOf","varBinding",",");return ["beginVars",$vars.decl].concat($vars.bs);},function(){return this._apply("expr");},function(){this._apply("empty");return ["get","undefined"];});this._applyWithArgs("token",";");$vars.c=this._or(function(){return this._apply("expr");},function(){this._apply("empty");return ["get","true"];});this._applyWithArgs("token",";");$vars.u=this._or(function(){return this._apply("expr");},function(){this._apply("empty");return ["get","undefined"];});this._applyWithArgs("token",")");$vars.s=this._apply("stmt");return ["for",$vars.i,$vars.c,$vars.u,$vars.s];},function(){this._applyWithArgs("token","for");this._applyWithArgs("token","(");$vars.v=this._or(function(){$vars.decl=this._or(function(){return this._applyWithArgs("token","var");},function(){return this._applyWithArgs("token","let");},function(){return this._applyWithArgs("token","const");});$vars.n=this._applyWithArgs("token","name");return ["beginVars",$vars.decl,["noAssignVar",$vars.n]];},function(){return this._apply("expr");});this._applyWithArgs("token","in");$vars.e=this._apply("expr");this._applyWithArgs("token",")");$vars.s=this._apply("stmt");return ["forIn",$vars.v,$vars.e,$vars.s];},function(){this._applyWithArgs("token","switch");this._applyWithArgs("token","(");$vars.e=this._apply("expr");this._applyWithArgs("token",")");this._applyWithArgs("token","{");$vars.cs=this._many(function(){return this._or(function(){this._applyWithArgs("token","case");$vars.c=this._apply("expr");this._applyWithArgs("token",":");$vars.cs=this._apply("srcElems");return ["case",$vars.c,["begin",$vars.cs]];},function(){this._applyWithArgs("token","default");this._applyWithArgs("token",":");$vars.cs=this._apply("srcElems");return ["default",["begin",$vars.cs]];});});this._applyWithArgs("token","}");return ["switch",$vars.e].concat($vars.cs);},function(){this._applyWithArgs("token","break");this._apply("sc");return ["break"];},function(){this._applyWithArgs("token","continue");this._apply("sc");return ["continue"];},function(){this._applyWithArgs("token","throw");this._apply("spacesNoNl");$vars.e=this._apply("expr");this._apply("sc");return ["throw",$vars.e];},function(){this._applyWithArgs("token","try");$vars.t=this._apply("block");this._applyWithArgs("token","catch");this._applyWithArgs("token","(");$vars.e=this._applyWithArgs("token","name");this._applyWithArgs("token",")");$vars.c=this._apply("block");$vars.f=this._or(function(){this._applyWithArgs("token","finally");return this._apply("block");},function(){this._apply("empty");return ["get","undefined"];});return ["try",$vars.t,$vars.e,$vars.c,$vars.f];},function(){this._applyWithArgs("token","return");$vars.e=this._or(function(){return this._apply("expr");},function(){this._apply("empty");return ["get","undefined"];});this._apply("sc");return ["return",$vars.e];},function(){this._applyWithArgs("token","with");this._applyWithArgs("token","(");$vars.x=this._apply("expr");this._applyWithArgs("token",")");$vars.s=this._apply("stmt");return ["with",$vars.x,$vars.s];},function(){$vars.e=this._apply("expr");this._apply("sc");return $vars.e;},function(){this._applyWithArgs("token",";");return ["get","undefined"];});},
"srcElem":function(){var $elf=this, $vars={};return this._or(function(){this._applyWithArgs("token","function");$vars.n=this._applyWithArgs("token","name");$vars.f=this._apply("funcRest");return ["assignVar",$vars.n,$vars.f];},function(){return this._apply("stmt");});},
"srcElems":function(){var $elf=this, $vars={};$vars.ss=this._many(function(){return this._apply("srcElem");});return ["beginTop"].concat($vars.ss);},
"topLevel":function(){var $elf=this, $vars={};$vars.r=this._apply("srcElems");this._apply("spaces");this._apply("end");return $vars.r;}});(BSJSParser["hexDigits"]="0123456789abcdef");(BSJSParser["keywords"]=({}));(keywords=["break","case","catch","continue","default","delete","do","else","finally","for","function","if","in","instanceof","new","return","switch","this","throw","try","typeof","var","void","while","with","ometa","let","const"]);for(var idx=(0);(idx < keywords["length"]);idx++){(BSJSParser["keywords"][keywords[idx]]=true);}(BSJSParser["_isKeyword"]=(function (k){return this["keywords"].hasOwnProperty(k);}));let BSJSTranslator=objectThatDelegatesTo(OMeta,{
"trans":function(){var $elf=this, $vars={};this._form(function(){$vars.t=this._apply("anything");return ($vars.ans=this._applyWithArgs("apply",$vars.t));});return $vars.ans;},
"curlyTrans":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){this._applyWithArgs("exactly","begin");return ($vars.r=this._apply("curlyTrans"));});return $vars.r;},function(){this._form(function(){this._applyWithArgs("exactly","begin");return ($vars.rs=this._many(function(){return this._apply("trans");}));});return (("{" + $vars.rs.join(";")) + ";}");},function(){$vars.r=this._apply("trans");return (("{" + $vars.r) + ";}");});},
"this":function(){var $elf=this, $vars={};return "this";},
"break":function(){var $elf=this, $vars={};return "break";},
"continue":function(){var $elf=this, $vars={};return "continue";},
"number":function(){var $elf=this, $vars={};$vars.n=this._apply("anything");return (("(" + $vars.n) + ")");},
"string":function(){var $elf=this, $vars={};$vars.s=this._apply("anything");return $vars.s.toProgramString();},
"name":function(){var $elf=this, $vars={};$vars.s=this._apply("anything");return $vars.s;},
"regExpr":function(){var $elf=this, $vars={};$vars.x=this._apply("anything");return $vars.x;},
"arr":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("trans");});return (("[" + $vars.xs.join(",")) + "]");},
"unop":function(){var $elf=this, $vars={};$vars.op=this._apply("anything");$vars.x=this._apply("trans");return (((("(" + $vars.op) + " ") + $vars.x) + ")");},
"getp":function(){var $elf=this, $vars={};$vars.fd=this._apply("trans");$vars.x=this._apply("trans");return ((($vars.x + "[") + $vars.fd) + "]");},
"get":function(){var $elf=this, $vars={};$vars.x=this._apply("anything");return $vars.x;},
"set":function(){var $elf=this, $vars={};$vars.lhs=this._apply("trans");$vars.rhs=this._apply("trans");return (((("(" + $vars.lhs) + "=") + $vars.rhs) + ")");},
"mset":function(){var $elf=this, $vars={};$vars.lhs=this._apply("trans");$vars.op=this._apply("anything");$vars.rhs=this._apply("trans");return ((((("(" + $vars.lhs) + $vars.op) + "=") + $vars.rhs) + ")");},
"binop":function(){var $elf=this, $vars={};$vars.op=this._apply("anything");$vars.x=this._apply("trans");$vars.y=this._apply("trans");return (((((("(" + $vars.x) + " ") + $vars.op) + " ") + $vars.y) + ")");},
"preop":function(){var $elf=this, $vars={};$vars.op=this._apply("anything");$vars.x=this._apply("trans");return ($vars.op + $vars.x);},
"postop":function(){var $elf=this, $vars={};$vars.op=this._apply("anything");$vars.x=this._apply("trans");return ($vars.x + $vars.op);},
"return":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ("return " + $vars.x);},
"with":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");$vars.s=this._apply("curlyTrans");return ((("with(" + $vars.x) + ")") + $vars.s);},
"if":function(){var $elf=this, $vars={};$vars.cond=this._apply("trans");$vars.t=this._apply("curlyTrans");$vars.e=this._apply("curlyTrans");return ((((("if(" + $vars.cond) + ")") + $vars.t) + "else") + $vars.e);},
"condExpr":function(){var $elf=this, $vars={};$vars.cond=this._apply("trans");$vars.t=this._apply("trans");$vars.e=this._apply("trans");return (((((("(" + $vars.cond) + "?") + $vars.t) + ":") + $vars.e) + ")");},
"while":function(){var $elf=this, $vars={};$vars.cond=this._apply("trans");$vars.body=this._apply("curlyTrans");return ((("while(" + $vars.cond) + ")") + $vars.body);},
"doWhile":function(){var $elf=this, $vars={};$vars.body=this._apply("curlyTrans");$vars.cond=this._apply("trans");return (((("do" + $vars.body) + "while(") + $vars.cond) + ")");},
"for":function(){var $elf=this, $vars={};$vars.init=this._apply("trans");$vars.cond=this._apply("trans");$vars.upd=this._apply("trans");$vars.body=this._apply("curlyTrans");return ((((((("for(" + $vars.init) + ";") + $vars.cond) + ";") + $vars.upd) + ")") + $vars.body);},
"forIn":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");$vars.arr=this._apply("trans");$vars.body=this._apply("curlyTrans");return ((((("for(" + $vars.x) + " in ") + $vars.arr) + ")") + $vars.body);},
"beginTop":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){$vars.x=this._apply("trans");return this._or(function(){this._or(function(){return this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));},function(){return this._apply("end");});return $vars.x;},function(){this._apply("empty");return ($vars.x + ";");});});return $vars.xs.join("");},
"begin":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("trans");this._apply("end");return $vars.x;},function(){$vars.xs=this._many(function(){$vars.x=this._apply("trans");return this._or(function(){this._or(function(){return this._pred(($vars.x[($vars.x["length"] - (1))] == "}"));},function(){return this._apply("end");});return $vars.x;},function(){this._apply("empty");return ($vars.x + ";");});});return (("{" + $vars.xs.join("")) + "}");});},
"beginVars":function(){var $elf=this, $vars={};return this._or(function(){$vars.decl=this._apply("anything");$vars.x=this._apply("trans");this._apply("end");return (($vars.decl + " ") + $vars.x);},function(){$vars.decl=this._apply("anything");$vars.xs=this._many(function(){return ($vars.x=this._apply("trans"));});return (($vars.decl + " ") + $vars.xs.join(","));});},
"func":function(){var $elf=this, $vars={};$vars.args=this._apply("anything");$vars.body=this._apply("curlyTrans");return (((("(function (" + $vars.args.join(",")) + ")") + $vars.body) + ")");},
"call":function(){var $elf=this, $vars={};$vars.fn=this._apply("trans");$vars.args=this._many(function(){return this._apply("trans");});return ((($vars.fn + "(") + $vars.args.join(",")) + ")");},
"send":function(){var $elf=this, $vars={};$vars.msg=this._apply("anything");$vars.recv=this._apply("trans");$vars.args=this._many(function(){return this._apply("trans");});return ((((($vars.recv + ".") + $vars.msg) + "(") + $vars.args.join(",")) + ")");},
"new":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ("new " + $vars.x);},
"assignVar":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");$vars.val=this._apply("trans");return (($vars.name + "=") + $vars.val);},
"noAssignVar":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");return $vars.name;},
"throw":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ("throw " + $vars.x);},
"try":function(){var $elf=this, $vars={};$vars.x=this._apply("curlyTrans");$vars.name=this._apply("anything");$vars.c=this._apply("curlyTrans");$vars.f=this._apply("curlyTrans");return ((((((("try " + $vars.x) + "catch(") + $vars.name) + ")") + $vars.c) + "finally") + $vars.f);},
"json":function(){var $elf=this, $vars={};$vars.props=this._many(function(){return this._apply("trans");});return (("({" + $vars.props.join(",")) + "})");},
"binding":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");$vars.val=this._apply("trans");return (($vars.name.toProgramString() + ": ") + $vars.val);},
"switch":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");$vars.cases=this._many(function(){return this._apply("trans");});return (((("switch(" + $vars.x) + "){") + $vars.cases.join(";")) + "}");},
"case":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");$vars.y=this._apply("trans");return ((("case " + $vars.x) + ": ") + $vars.y);},
"default":function(){var $elf=this, $vars={};$vars.y=this._apply("trans");return ("default: " + $vars.y);}})
