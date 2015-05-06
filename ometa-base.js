// This file was generated using Gnometa
// https://github.com/djdeath/gnometa
let GenericMatcher=objectThatDelegatesTo(OMeta,{
"notLast":function(){var $elf=this,$vars={},$r0=this._startStructure(0);$vars.rule=this._getStructureValue(this.anything());$vars.r=this._appendStructure($r0,this._apply($vars.rule));this._appendStructure($r0,this._lookahead(function(){return this._forwardStructure(this._apply($vars.rule),8);}));$r0.value=$vars.r;return this._endStructure($r0);}});let BaseStrParser=objectThatDelegatesTo(OMeta,{
"string":function(){var $elf=this,$vars={},$r0=this._startStructure(10);$vars.r=this._appendStructure($r0,this.anything());this._pred(((typeof $vars.r) === "string"));$r0.value=$vars.r;return this._endStructure($r0);},
"char":function(){var $elf=this,$vars={},$r0=this._startStructure(16);$vars.r=this._appendStructure($r0,this.anything());this._pred((((typeof $vars.r) === "string") && ($vars.r["length"] == (1))));$r0.value=$vars.r;return this._endStructure($r0);},
"space":function(){var $elf=this,$vars={},$r0=this._startStructure(22);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred(($vars.r.charCodeAt((0)) <= (32)));$r0.value=$vars.r;return this._endStructure($r0);},
"spaces":function(){var $elf=this,$vars={},$r0=this._startStructure(28);$r0.value=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("space"),30);}));return this._endStructure($r0);},
"digit":function(){var $elf=this,$vars={},$r0=this._startStructure(32);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "0") && ($vars.r <= "9")));$r0.value=$vars.r;return this._endStructure($r0);},
"lower":function(){var $elf=this,$vars={},$r0=this._startStructure(38);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "a") && ($vars.r <= "z")));$r0.value=$vars.r;return this._endStructure($r0);},
"upper":function(){var $elf=this,$vars={},$r0=this._startStructure(44);$vars.r=this._appendStructure($r0,this._apply("char"));this._pred((($vars.r >= "A") && ($vars.r <= "Z")));$r0.value=$vars.r;return this._endStructure($r0);},
"letter":function(){var $elf=this,$vars={},$r0=this._startStructure(50);$r0.value=this._appendStructure($r0,this._or(function(){return this._forwardStructure(this._apply("lower"),52);},function(){return this._forwardStructure(this._apply("upper"),54);}));return this._endStructure($r0);},
"letterOrDigit":function(){var $elf=this,$vars={},$r0=this._startStructure(56);$r0.value=this._appendStructure($r0,this._or(function(){return this._forwardStructure(this._apply("letter"),58);},function(){return this._forwardStructure(this._apply("digit"),60);}));return this._endStructure($r0);},
"token":function(){var $elf=this,$vars={},$r0=this._startStructure(62);$vars.tok=this._getStructureValue(this.anything());this._appendStructure($r0,this._apply("spaces"));$r0.value=this._appendStructure($r0,this.seq($vars.tok));return this._endStructure($r0);},
"listOf":function(){var $elf=this,$vars={},$r0=this._startStructure(70);$vars.rule=this._getStructureValue(this.anything());$vars.delim=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(77);$vars.f=this._appendStructure($r1,this._apply($vars.rule));$vars.rs=this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(85);this._appendStructure($r2,this._applyWithArgs("token",$vars.delim));$r2.value=this._appendStructure($r2,this._apply($vars.rule));return this._endStructure($r2);}));$r1.value=[$vars.f].concat($vars.rs);return this._endStructure($r1);},function(){var $r1=this._startStructure(92);$r1.value=[];return this._endStructure($r1);}));return this._endStructure($r0);},
"fromTo":function(){var $elf=this,$vars={},$r0=this._startStructure(95);$vars.x=this._getStructureValue(this.anything());$vars.y=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._consumedBy(function(){var $r1=this._startStructure(102);this._appendStructure($r1,this.seq($vars.x));this._appendStructure($r1,this._many(function(){var $r2=this._startStructure(108);this._appendStructure($r2,this._not(function(){return this._forwardStructure(this.seq($vars.y),112);}));$r2.value=this._appendStructure($r2,this._apply("char"));return this._endStructure($r2);}));$r1.value=this._appendStructure($r1,this.seq($vars.y));return this._endStructure($r1);}));return this._endStructure($r0);}})

