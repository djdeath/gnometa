let BSOMetaJSParser=objectThatDelegatesTo(BSJSParser,{
"primExprHd":function(){var $elf=this,_fromIdx=this.input.idx,r;return this._or((function(){return (function(){r=this._applyWithArgs("foreign",BSOMetaParser,'grammar');return r;}).call(this);}),(function(){return BSJSParser._superApplyWithArgs(this,'primExprHd');}));}});let BSOMetaJSTranslator=objectThatDelegatesTo(BSJSTranslator,{
"Grammar":function(){var $elf=this,_fromIdx=this.input.idx;return this._applyWithArgs("foreign",BSOMetaTranslator,'Grammar');}})
