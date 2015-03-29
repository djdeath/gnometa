// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let BSNullOptimization=objectThatDelegatesTo(OMeta,{
"setHelped":function(){var $elf=this, $vars={};return (this["_didSomething"]=true);},
"helped":function(){var $elf=this, $vars={};return this._pred(this["_didSomething"]);},
"trans":function(){var $elf=this, $vars={};this._form(function(){$vars.t=this._apply("anything");this._pred((this[$vars.t] != undefined));return ($vars.ans=this._applyWithArgs("apply",$vars.t));});return $vars.ans;},
"optimize":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");this._apply("helped");return $vars.x;},
"App":function(){var $elf=this, $vars={};$vars.rule=this._apply("anything");$vars.args=this._many(function(){return this._apply("anything");});return ["App",$vars.rule].concat($vars.args);},
"Act":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return ["Act",$vars.expr];},
"Pred":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return ["Pred",$vars.expr];},
"Or":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("trans");});return ["Or"].concat($vars.xs);},
"XOr":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("trans");});return ["XOr"].concat($vars.xs);},
"And":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("trans");});return ["And"].concat($vars.xs);},
"Opt":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Opt",$vars.x];},
"Many":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Many",$vars.x];},
"Many1":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Many1",$vars.x];},
"Set":function(){var $elf=this, $vars={};$vars.n=this._apply("anything");$vars.v=this._apply("trans");return ["Set",$vars.n,$vars.v];},
"Not":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Not",$vars.x];},
"Lookahead":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Lookahead",$vars.x];},
"Form":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["Form",$vars.x];},
"ConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["ConsBy",$vars.x];},
"IdxConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return ["IdxConsBy",$vars.x];},
"JumpTable":function(){var $elf=this, $vars={};$vars.ces=this._many(function(){this._form(function(){$vars.c=this._apply("anything");return ($vars.e=this._apply("trans"));});return [$vars.c,$vars.e];});return ["JumpTable"].concat($vars.ces);},
"Interleave":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){this._form(function(){$vars.m=this._apply("anything");return ($vars.p=this._apply("trans"));});return [$vars.m,$vars.p];});return ["Interleave"].concat($vars.xs);},
"Rule":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");$vars.body=this._apply("trans");return ["Rule",$vars.name,$vars.body];}});(BSNullOptimization["initialize"]=(function (){(this["_didSomething"]=false);}));let BSAssociativeOptimization=objectThatDelegatesTo(BSNullOptimization,{
"And":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("trans");this._apply("end");this._apply("setHelped");return $vars.x;},function(){$vars.xs=this._applyWithArgs("transInside","And");return ["And"].concat($vars.xs);});},
"Or":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("trans");this._apply("end");this._apply("setHelped");return $vars.x;},function(){$vars.xs=this._applyWithArgs("transInside","Or");return ["Or"].concat($vars.xs);});},
"XOr":function(){var $elf=this, $vars={};return this._or(function(){$vars.x=this._apply("trans");this._apply("end");this._apply("setHelped");return $vars.x;},function(){$vars.xs=this._applyWithArgs("transInside","XOr");return ["XOr"].concat($vars.xs);});},
"transInside":function(){var $elf=this, $vars={};$vars.t=this._apply("anything");return this._or(function(){this._form(function(){this._applyWithArgs("exactly",$vars.t);return ($vars.xs=this._applyWithArgs("transInside",$vars.t));});$vars.ys=this._applyWithArgs("transInside",$vars.t);this._apply("setHelped");return $vars.xs.concat($vars.ys);},function(){$vars.x=this._apply("trans");$vars.xs=this._applyWithArgs("transInside",$vars.t);return [$vars.x].concat($vars.xs);},function(){return [];});}});let BSSeqInliner=objectThatDelegatesTo(BSNullOptimization,{
"App":function(){var $elf=this, $vars={};return this._or(function(){return (function(){switch(this._apply('anything')){case "seq":$vars.s=this._apply("anything");this._apply("end");$vars.cs=this._applyWithArgs("seqString",$vars.s);this._apply("setHelped");return ["And"].concat($vars.cs).concat([["Act",$vars.s]]);default: throw fail}}).call(this);},function(){$vars.rule=this._apply("anything");$vars.args=this._many(function(){return this._apply("anything");});return ["App",$vars.rule].concat($vars.args);});},
"inlineChar":function(){var $elf=this, $vars={};$vars.c=this._applyWithArgs("foreign",BSOMetaParser,'eChar');this._not(function(){return this._apply("end");});return ["App","exactly",$vars.c.toProgramString()];},
"seqString":function(){var $elf=this, $vars={};this._lookahead(function(){$vars.s=this._apply("anything");return this._pred(((typeof $vars.s) === "string"));});return this._or(function(){this._form(function(){this._applyWithArgs("exactly","\"");$vars.cs=this._many(function(){return this._apply("inlineChar");});return this._applyWithArgs("exactly","\"");});return $vars.cs;},function(){this._form(function(){this._applyWithArgs("exactly","\'");$vars.cs=this._many(function(){return this._apply("inlineChar");});return this._applyWithArgs("exactly","\'");});return $vars.cs;});}});let JumpTable=(function (choiceOp,choice){(this["choiceOp"]=choiceOp);(this["choices"]=({}));this.add(choice);});(JumpTable["prototype"]["add"]=(function (choice){var c=choice[(0)],t=choice[(1)];if(this["choices"][c]){if((this["choices"][c][(0)] == this["choiceOp"])){this["choices"][c].push(t);}else{(this["choices"][c]=[this["choiceOp"],this["choices"][c],t]);};}else{(this["choices"][c]=t);};}));(JumpTable["prototype"]["toTree"]=(function (){var r=["JumpTable"],choiceKeys=ownPropertyNames(this["choices"]);for(var i=(0);(i < choiceKeys["length"]);(i+=(1))){r.push([choiceKeys[i],this["choices"][choiceKeys[i]]]);}return r;}));let BSJumpTableOptimization=objectThatDelegatesTo(BSNullOptimization,{
"Or":function(){var $elf=this, $vars={};$vars.cs=this._many(function(){return this._or(function(){return this._applyWithArgs("jtChoices","Or");},function(){return this._apply("trans");});});return ["Or"].concat($vars.cs);},
"XOr":function(){var $elf=this, $vars={};$vars.cs=this._many(function(){return this._or(function(){return this._applyWithArgs("jtChoices","XOr");},function(){return this._apply("trans");});});return ["XOr"].concat($vars.cs);},
"quotedString":function(){var $elf=this, $vars={};this._lookahead(function(){return this._apply("string");});this._form(function(){return (function(){switch(this._apply('anything')){case "\"":$vars.cs=this._many(function(){$vars.c=this._applyWithArgs("foreign",BSOMetaParser,'eChar');this._not(function(){return this._apply("end");});return $vars.c;});return this._applyWithArgs("exactly","\"");case "\'":$vars.cs=this._many(function(){$vars.c=this._applyWithArgs("foreign",BSOMetaParser,'eChar');this._not(function(){return this._apply("end");});return $vars.c;});return this._applyWithArgs("exactly","\'");default: throw fail}}).call(this);});return $vars.cs.join("");},
"jtChoice":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){this._applyWithArgs("exactly","And");this._form(function(){this._applyWithArgs("exactly","App");this._applyWithArgs("exactly","exactly");return ($vars.x=this._apply("quotedString"));});return ($vars.rest=this._many(function(){return this._apply("anything");}));});return [$vars.x,["And"].concat($vars.rest)];},function(){this._form(function(){this._applyWithArgs("exactly","App");this._applyWithArgs("exactly","exactly");return ($vars.x=this._apply("quotedString"));});return [$vars.x,["Act",$vars.x.toProgramString()]];});},
"jtChoices":function(){var $elf=this, $vars={};$vars.op=this._apply("anything");$vars.c=this._apply("jtChoice");$vars.jt=new JumpTable($vars.op,$vars.c);this._many(function(){$vars.c=this._apply("jtChoice");return $vars.jt.add($vars.c);});this._apply("setHelped");return $vars.jt.toTree();}});let BSFunctionOptimization=objectThatDelegatesTo(OMeta,{
"optimize":function(){var $elf=this, $vars={};$vars.x=this._apply("trans");return $vars.x;},
"trans":function(){var $elf=this, $vars={};this._form(function(){$vars.t=this._apply("anything");this._pred((this[$vars.t] != undefined));return ($vars.ans=this._applyWithArgs("apply",$vars.t));});return $vars.ans;},
"somethingThatReturns":function(){var $elf=this, $vars={};return this._or(function(){this._form(function(){this._applyWithArgs("exactly","And");return ($vars.ans=this._applyWithArgs("apply","AndReturn"));});return $vars.ans;},function(){this._form(function(){this._applyWithArgs("exactly","Set");return ($vars.ans=this._applyWithArgs("apply","Set"));});return ["Return",["Parenthesis",$vars.ans]];},function(){$vars.x=this._apply("trans");return ["Return",$vars.x];});},
"functioned":function(){var $elf=this, $vars={};$vars.x=this._apply("somethingThatReturns");return ["Function",$vars.x];},
"AndReturn":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._applyWithArgs("notLast","trans");});$vars.y=this._apply("somethingThatReturns");return ["And"].concat($vars.xs.concat([$vars.y]));},
"And":function(){var $elf=this, $vars={};return ["And"];},
"Or":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("functioned");});return ["Or"].concat($vars.xs);},
"XOr":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){return this._apply("functioned");});return ["XOr"].concat($vars.xs);},
"Opt":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Opt",$vars.x];},
"Many":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Many",$vars.x];},
"Many1":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Many1",$vars.x];},
"Not":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Not",$vars.x];},
"Lookahead":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Lookahead",$vars.x];},
"Form":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["Form",$vars.x];},
"ConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["ConsBy",$vars.x];},
"IdxConsBy":function(){var $elf=this, $vars={};$vars.x=this._apply("functioned");return ["IdxConsBy",$vars.x];},
"App":function(){var $elf=this, $vars={};$vars.rule=this._apply("anything");$vars.args=this._many(function(){return this._apply("anything");});return ["App",$vars.rule].concat($vars.args);},
"Act":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return ["Act",$vars.expr];},
"Pred":function(){var $elf=this, $vars={};$vars.expr=this._apply("anything");return ["Pred",$vars.expr];},
"Set":function(){var $elf=this, $vars={};$vars.n=this._apply("anything");$vars.v=this._apply("trans");return ["Set",$vars.n,$vars.v];},
"JumpTable":function(){var $elf=this, $vars={};$vars.ces=this._many(function(){this._form(function(){$vars.c=this._apply("anything");return ($vars.e=this._apply("somethingThatReturns"));});return [$vars.c,$vars.e];});return ["JumpTable"].concat($vars.ces);},
"Interleave":function(){var $elf=this, $vars={};$vars.xs=this._many(function(){this._form(function(){$vars.m=this._apply("anything");return ($vars.p=this._apply("functioned"));});return [$vars.m,$vars.p];});return ["Interleave"].concat($vars.xs);},
"Rule":function(){var $elf=this, $vars={};$vars.name=this._apply("anything");$vars.body=this._apply("somethingThatReturns");return ["Rule",$vars.name,$vars.body];}});let BSOMetaOptimizer=objectThatDelegatesTo(OMeta,{
"optimizeGrammar":function(){var $elf=this, $vars={};this._form(function(){this._applyWithArgs("exactly","Grammar");$vars.sn=this._apply("anything");return ($vars.rs=this._many(function(){return this._apply("optimizeRule");}));});return ["Grammar",$vars.sn].concat($vars.rs);},
"optimizeRule":function(){var $elf=this, $vars={};$vars.r=this._apply("anything");this._or(function(){return ($vars.r=this._applyWithArgs("foreign",BSSeqInliner,'optimize',$vars.r));},function(){return this._apply("empty");});this._many(function(){return this._or(function(){return ($vars.r=this._applyWithArgs("foreign",BSAssociativeOptimization,'optimize',$vars.r));},function(){return ($vars.r=this._applyWithArgs("foreign",BSJumpTableOptimization,'optimize',$vars.r));});});$vars.r=this._applyWithArgs("foreign",BSFunctionOptimization,'optimize',$vars.r);return $vars.r;}})
