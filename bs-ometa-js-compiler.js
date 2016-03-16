// This file was generated using Gnometa
// https://github.com/djdeath/gnometa
let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(1, true);this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(4);$vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSOMetaParser,"grammar"),7);$r1.value=$vars.r.value;return this._endStructure($r1);},function(){return this._forwardStructure(BSJSParser._superApplyWithArgs(this,"primExprHd"),12);}),2);return this._endStructure($r0);}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"OMetaGrammar":function(){var $elf=this,$vars={},$r0=this._startStructure(15, true);$vars.sn=this.anything();$vars.rules=this.anything();$vars.o=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaOptimizer,"optimizeGrammar",["Grammar",$vars.sn.value].concat($vars.rules.value)),20);this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaTranslator,"trans",[({})].concat($vars.o.value)),24);return this._endStructure($r0);}})

