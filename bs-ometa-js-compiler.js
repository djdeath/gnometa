// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,$vars={},$r0=this._startStructure("primExprHd");$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(null);$vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSOMetaParser,"grammar"));$r1.value=$vars.r;return this._endStructure($r1);},function(){return BSJSParser._superApplyWithArgs(this,"primExprHd");}));return this._endStructure($r0);}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Grammar":function(){var $elf=this,$vars={},$r0=this._startStructure("Grammar");$r0.value=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaTranslator,"Grammar"));return this._endStructure($r0);}})
