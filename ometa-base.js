// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let GenericMatcher=objectThatDelegatesTo(OMeta,{
"notLast":function(){var $elf=this, $vars={};$vars.rule=this.anything();$vars.r=this._apply($vars.rule);this._lookahead(function(){return this._apply($vars.rule);});return $vars.r;}});let BaseStrParser=objectThatDelegatesTo(OMeta,{
"string":function(){var $elf=this, $vars={};$vars.r=this.anything();this._pred(((typeof $vars.r) === "string"));return $vars.r;},
"char":function(){var $elf=this, $vars={};$vars.r=this.anything();this._pred((((typeof $vars.r) === "string") && ($vars.r["length"] == (1))));return $vars.r;},
"space":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred(($vars.r.charCodeAt((0)) <= (32)));return $vars.r;},
"spaces":function(){var $elf=this, $vars={};return this._many(function(){return this._apply("space");});},
"digit":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "0") && ($vars.r <= "9")));return $vars.r;},
"lower":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "a") && ($vars.r <= "z")));return $vars.r;},
"upper":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "A") && ($vars.r <= "Z")));return $vars.r;},
"letter":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("lower");},function(){return this._apply("upper");});},
"letterOrDigit":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("letter");},function(){return this._apply("digit");});},
"token":function(){var $elf=this, $vars={};$vars.tok=this.anything();this._apply("spaces");return this.seq($vars.tok);},
"listOf":function(){var $elf=this, $vars={};$vars.rule=this.anything();$vars.delim=this.anything();return this._or(function(){$vars.f=this._apply($vars.rule);$vars.rs=this._many(function(){this._applyWithArgs("token",$vars.delim);return this._apply($vars.rule);});return [$vars.f].concat($vars.rs);},function(){return [];});},
"fromTo":function(){var $elf=this, $vars={};$vars.x=this.anything();$vars.y=this.anything();return this._consumedBy(function(){this.seq($vars.x);this._many(function(){this._not(function(){return this.seq($vars.y);});return this._apply("char");});return this.seq($vars.y);});}})
