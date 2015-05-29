// This file was generated using Gnometa
// https://github.com/djdeath/gnometa
let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure(1, true);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(4);$vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSOMetaParser,"grammar"),7);$r1.value=$vars.r;return this._endStructure($r1);},function(){return this._forwardStructure(BSJSParser._superApplyWithArgs(this,"primExprHd"),11);}),2);return this._endStructure($r0);}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"OMetaGrammar":function(){var $elf=this,$vars={},$r0=this._startStructure(14, true);$vars.sn=this._getStructureValue(this.anything());$vars.rules=this._getStructureValue(this.anything());$vars.o=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaOptimizer,"optimizeGrammar",["Grammar",$vars.sn].concat($vars.rules)),19);$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaTranslator,"trans",[({})].concat($vars.o)),23);return this._endStructure($r0);}})

