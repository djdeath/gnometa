// This file was generated using Gnometa
// https://github.com/djdeath/gnometa

let BaseStrParser=objectThatDelegatesTo(OMeta,{
"string":function(){var $elf=this, $vars={};$vars.r=this._apply("anything");this._pred(((typeof $vars.r) === "string"));return $vars.r;},
"char":function(){var $elf=this, $vars={};$vars.r=this._apply("anything");this._pred((((typeof $vars.r) === "string") && ($vars.r["length"] == (1))));return $vars.r;},
"space":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred(($vars.r.charCodeAt((0)) <= (32)));return $vars.r;},
"spaces":function(){var $elf=this, $vars={};return this._many(function(){return this._apply("space");});},
"digit":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "0") && ($vars.r <= "9")));return $vars.r;},
"lower":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "a") && ($vars.r <= "z")));return $vars.r;},
"upper":function(){var $elf=this, $vars={};$vars.r=this._apply("char");this._pred((($vars.r >= "A") && ($vars.r <= "Z")));return $vars.r;},
"letter":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("lower");},function(){return this._apply("upper");});},
"letterOrDigit":function(){var $elf=this, $vars={};return this._or(function(){return this._apply("letter");},function(){return this._apply("digit");});}})
