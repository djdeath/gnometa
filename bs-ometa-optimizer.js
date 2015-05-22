// This file was generated using Gnometa
// https://github.com/djdeath/gnometa
let mergeLocation=(function (loc1,loc2){return ({"start": Math.min(loc1["start"],loc2["start"]),"stop": Math.max(loc1["stop"],loc2["stop"])});});let BSNullOptimization=objectThatDelegatesTo(OMeta,{
"setHelped":function(){var $elf=this,$vars={},$r0=this._startStructure(0);$r0.value=(this["_didSomething"]=true);return this._endStructure($r0);},
"helped":function(){var $elf=this,$vars={},$r0=this._startStructure(2);$r0.value=this._pred(this["_didSomething"]);return this._endStructure($r0);},
"pushLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(5);$vars.loc=this._getStructureValue(this.anything());$r0.value=this["_locations"].push($vars.loc);return this._endStructure($r0);},
"popLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(9);$r0.value=this["_locations"].pop();return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(11);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(15);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc),21);$vars.ans=this._appendStructure($r1,this._apply($vars.t),25);$r1.value=this._appendStructure($r1,this._apply("popLocation"),28);return this._endStructure($r1);}),13);$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(31);$vars.x=this._appendStructure($r0,this._apply("trans"),34);this._appendStructure($r0,this._apply("helped"),36);$r0.value=$vars.x;return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(39);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this.anything(),45);}),43);$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(48);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(52);$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("trans"),57);}),55);$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(60);$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("trans"),65);}),63);$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(68);$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("trans"),73);}),71);$r0.value=["And"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(76);$vars.x=this._appendStructure($r0,this._apply("trans"),79);$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(82);$vars.x=this._appendStructure($r0,this._apply("trans"),85);$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(88);$vars.x=this._appendStructure($r0,this._apply("trans"),91);$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(94);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("trans"),98);$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(101);$vars.x=this._appendStructure($r0,this._apply("trans"),104);$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(107);$vars.x=this._appendStructure($r0,this._apply("trans"),110);$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(113);$vars.x=this._appendStructure($r0,this._apply("trans"),116);$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(119);$vars.x=this._appendStructure($r0,this._apply("trans"),122);$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(125);$vars.x=this._appendStructure($r0,this._apply("trans"),128);$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(131);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(136);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(140);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("trans"),145));return this._endStructure($r2);}),138);$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}),134);$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(149);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(154);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(158);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("trans"),163));return this._endStructure($r2);}),156);$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}),152);$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(167);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(172);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(174);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(176);$vars.name=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._apply("trans"),180);$r0.value=["Rule",$vars.name,$vars.body];return this._endStructure($r0);}});(BSNullOptimization["initialize"]=(function (){(this["_didSomething"]=false);(this["_locations"]=[]);}));(BSNullOptimization["location"]=(function (){return this["_locations"][(this["_locations"]["length"] - (1))];}));let BSAssociativeOptimization=objectThatDelegatesTo(BSNullOptimization,{
"And":function(){var $elf=this,$vars={},$r0=this._startStructure(183);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(186);$vars.x=this._appendStructure($r1,this._apply("trans"),189);this._appendStructure($r1,this.end(),191);this._appendStructure($r1,this._apply("setHelped"),193);$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(196);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","And"),199);$r1.value=["And"].concat($vars.xs);return this._endStructure($r1);}),184);return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(203);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(206);$vars.x=this._appendStructure($r1,this._apply("trans"),209);this._appendStructure($r1,this.end(),211);this._appendStructure($r1,this._apply("setHelped"),213);$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(216);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","Or"),219);$r1.value=["Or"].concat($vars.xs);return this._endStructure($r1);}),204);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(223);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(226);$vars.x=this._appendStructure($r1,this._apply("trans"),229);this._appendStructure($r1,this.end(),231);this._appendStructure($r1,this._apply("setHelped"),233);$r1.value=$vars.x.slice((1));return this._endStructure($r1);},function(){var $r1=this._startStructure(236);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside","XOr"),239);$r1.value=["XOr"].concat($vars.xs);return this._endStructure($r1);}),224);return this._endStructure($r0);},
"transInside":function(){var $elf=this,$vars={},$r0=this._startStructure(243);$vars.t=this._getStructureValue(this.anything());$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(248);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(252);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly($vars.t),255);$r2.value=($vars.xs=this._appendStructure($r2,this._applyWithArgs("transInside",$vars.t),260));return this._endStructure($r2);}),250);$vars.ys=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t),264);this._appendStructure($r1,this._apply("setHelped"),267);$r1.value=$vars.xs.concat($vars.ys);return this._endStructure($r1);},function(){var $r1=this._startStructure(270);$vars.x=this._appendStructure($r1,this._apply("trans"),273);$vars.xs=this._appendStructure($r1,this._applyWithArgs("transInside",$vars.t),276);$r1.value=[$vars.x].concat($vars.xs);return this._endStructure($r1);},function(){var $r1=this._startStructure(247);$r1.value=[];return this._endStructure($r1);}),246);return this._endStructure($r0);}});let BSSeqInliner=objectThatDelegatesTo(BSNullOptimization,{
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(281);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(284);this._appendStructure($r1,this.exactly("seq"),286);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(290);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("Js"),293);$vars.locals=this._getStructureValue(this.anything());$r2.value=this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(298);this._appendStructure($r3,this.exactly("string"),300);$r3.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r3);}),296);return this._endStructure($r2);}),288);this._appendStructure($r1,this.end(),304);$vars.cs=this._appendStructure($r1,this._applyWithArgs("seqString",$vars.s),307);this._appendStructure($r1,this._apply("setHelped"),310);$r1.value=["And"].concat($vars.cs).concat([jsValue("string",$vars.s)]);return this._endStructure($r1);},function(){var $r1=this._startStructure(313);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r1,this._many(function(){return this._forwardStructure(this.anything(),319);}),317);$r1.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r1);}),282);return this._endStructure($r0);},
"inlineChar":function(){var $elf=this,$vars={},$r0=this._startStructure(322);$vars.c=this._appendStructure($r0,this._applyWithArgs("foreign",BSOMetaParser,"eChar"),325);$r0.value=[null,"App","exactly",jsValue("string",$vars.c)];return this._endStructure($r0);},
"seqString":function(){var $elf=this,$vars={},$r0=this._startStructure(329);this._appendStructure($r0,this._lookahead(function(){var $r1=this._startStructure(333);$vars.s=this._getStructureValue(this.anything());$r1.value=this._pred(((typeof $vars.s) === "string"));return this._endStructure($r1);}),331);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(339);$r1.value=($vars.cs=this._appendStructure($r1,this._many(function(){return this._forwardStructure(this._apply("inlineChar"),344);}),342));return this._endStructure($r1);}),338);$r0.value=$vars.cs;return this._endStructure($r0);}});let JumpTable=(function (choiceOp,choice){(this["choiceOp"]=choiceOp);(this["choices"]=({}));this.add(choice);});(JumpTable["prototype"]["add"]=(function (choice){var c=choice[(0)],t=choice[(1)];if(this["choices"][c]){if((this["choices"][c][(0)] == this["choiceOp"])){this["choices"][c].push(t);}else{(this["choices"][c]=[this["choiceOp"],this["choices"][c],t]);};}else{(this["choices"][c]=t);};}));(JumpTable["prototype"]["toTree"]=(function (){var r=["JumpTable"],choiceKeys=ownPropertyNames(this["choices"]);for(var i=(0);(i < choiceKeys["length"]);(i+=(1))){r.push([choiceKeys[i],this["choices"][choiceKeys[i]]]);}return r;}));let BSJumpTableOptimization=objectThatDelegatesTo(BSNullOptimization,{
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(347);$vars.cs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._or(function(){return this._forwardStructure(this._applyWithArgs("jtChoices","Or"),354);},function(){return this._forwardStructure(this._apply("trans"),357);}),352);}),350);$r0.value=["Or"].concat($vars.cs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(360);$vars.cs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._or(function(){return this._forwardStructure(this._applyWithArgs("jtChoices","XOr"),367);},function(){return this._forwardStructure(this._apply("trans"),370);}),365);}),363);$r0.value=["XOr"].concat($vars.cs);return this._endStructure($r0);},
"quotedString":function(){var $elf=this,$vars={},$r0=this._startStructure(373);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(377);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r1,this.exactly("Js"),380);$r1.value=this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(384);this._appendStructure($r2,this.exactly("string"),386);$r2.value=($vars.s=this._getStructureValue(this.anything()));return this._endStructure($r2);}),382);return this._endStructure($r1);}),375);$r0.value=$vars.s;return this._endStructure($r0);},
"jtChoice":function(){var $elf=this,$vars={},$r0=this._startStructure(391);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(394);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(398);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"),401);this._appendStructure($r2,this._form(function(){var $r3=this._startStructure(405);$vars.l1=this._getStructureValue(this.anything());this._appendStructure($r3,this.exactly("App"),408);this._appendStructure($r3,this.exactly("exactly"),410);$r3.value=($vars.x=this._appendStructure($r3,this._apply("quotedString"),414));return this._endStructure($r3);}),403);$r2.value=($vars.rest=this._appendStructure($r2,this._many(function(){return this._forwardStructure(this.anything(),420);}),418));return this._endStructure($r2);}),396);$r1.value=[$vars.x,[$vars.l,"And"].concat($vars.rest)];return this._endStructure($r1);},function(){var $r1=this._startStructure(423);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(427);$vars.l1=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("App"),430);this._appendStructure($r2,this.exactly("exactly"),432);$r2.value=($vars.x=this._appendStructure($r2,this._apply("quotedString"),436));return this._endStructure($r2);}),425);$r1.value=[$vars.x,jsValue("string",$vars.x)];return this._endStructure($r1);}),392);return this._endStructure($r0);},
"jtChoices":function(){var $elf=this,$vars={},$r0=this._startStructure(439);$vars.op=this._getStructureValue(this.anything());$vars.c=this._appendStructure($r0,this._apply("jtChoice"),443);$vars.jt=new JumpTable($vars.op,$vars.c);this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(449);$vars.c=this._appendStructure($r1,this._apply("jtChoice"),452);$r1.value=$vars.jt.add($vars.c);return this._endStructure($r1);}),447);this._appendStructure($r0,this._apply("setHelped"),455);$r0.value=$vars.jt.toTree();return this._endStructure($r0);}});let BSFunctionOptimization=objectThatDelegatesTo(GenericMatcher,{
"optimize":function(){var $elf=this,$vars={},$r0=this._startStructure(458);$vars.x=this._appendStructure($r0,this._apply("trans"),461);$r0.value=$vars.x;return this._endStructure($r0);},
"pushLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(464);$vars.loc=this._getStructureValue(this.anything());$r0.value=this["_locations"].push($vars.loc);return this._endStructure($r0);},
"popLocation":function(){var $elf=this,$vars={},$r0=this._startStructure(468);$r0.value=this["_locations"].pop();return this._endStructure($r0);},
"trans":function(){var $elf=this,$vars={},$r0=this._startStructure(470);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(474);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._getStructureValue(this.anything());this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc),480);$vars.ans=this._appendStructure($r1,this._apply($vars.t),484);$r1.value=this._appendStructure($r1,this._apply("popLocation"),487);return this._endStructure($r1);}),472);$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"andReturn":function(){var $elf=this,$vars={},$r0=this._startStructure(490);$vars.l=this._getStructureValue(this.anything());$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._applyWithArgs("notLast","storeSomething"),496);}),494);$vars.y=this._appendStructure($r0,this._apply("storeSomethingThatReturns"),500);$r0.value=[$vars.l,"And"].concat($vars.xs.concat([$vars.y]));return this._endStructure($r0);},
"somethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(503);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(506);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(510);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"),513);$r2.value=($vars.ans=this._appendStructure($r2,this._applyWithArgs("andReturn",$vars.l),518));return this._endStructure($r2);}),508);$r1.value=$vars.ans;return this._endStructure($r1);},function(){var $r1=this._startStructure(522);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(526);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("And"),529);$r2.value=this._appendStructure($r2,this.end(),532);return this._endStructure($r2);}),524);$r1.value=[null,"ReturnStructure",[$vars.l,"And"]];return this._endStructure($r1);},function(){var $r1=this._startStructure(535);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(539);$vars.l=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r2,this._apply("generatesStructure"),543);$r2.value=($vars.ans=this._appendStructure($r2,this._apply($vars.t),547));return this._endStructure($r2);}),537);$r1.value=[null,"ReturnStructure",[$vars.l,"Store",[$vars.l].concat($vars.ans)]];return this._endStructure($r1);},function(){var $r1=this._startStructure(551);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(555);$vars.l=this._getStructureValue(this.anything());this._appendStructure($r2,this.exactly("Set"),558);$r2.value=($vars.ans=this._appendStructure($r2,this._apply("Set"),563));return this._endStructure($r2);}),553);$r1.value=[null,"ReturnStructure",[$vars.l,"Parenthesis",[$vars.l].concat($vars.ans)]];return this._endStructure($r1);},function(){var $r1=this._startStructure(567);$vars.x=this._appendStructure($r1,this._apply("trans"),570);$r1.value=[null,"ReturnStructure",$vars.x];return this._endStructure($r1);}),504);return this._endStructure($r0);},
"generatesStructure":function(){var $elf=this,$vars={},$r0=this._startStructure(573);$r0.value=this._appendStructure($r0,this._or(function(){return this._forwardStructure(this.exactly("Or"),576);},function(){return this._forwardStructure(this.exactly("XOr"),578);},function(){return this._forwardStructure(this.exactly("Opt"),580);},function(){return this._forwardStructure(this.exactly("Many"),582);},function(){return this._forwardStructure(this.exactly("Many1"),584);},function(){return this._forwardStructure(this.exactly("Not"),586);},function(){return this._forwardStructure(this.exactly("Lookahead"),588);},function(){return this._forwardStructure(this.exactly("Form"),590);},function(){return this._forwardStructure(this.exactly("ConsBy"),592);},function(){return this._forwardStructure(this.exactly("IdxConsBy"),594);},function(){return this._forwardStructure(this.exactly("App"),596);},function(){return this._forwardStructure(this.exactly("JumpTable"),598);},function(){return this._forwardStructure(this.exactly("Interleave"),600);}),574);return this._endStructure($r0);},
"somethingThatCanPass":function(){var $elf=this,$vars={},$r0=this._startStructure(602);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(606);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r1,this._apply("generatesStructure"),610);this._pred((this[$vars.t] != undefined));this._appendStructure($r1,this._applyWithArgs("pushLocation",$vars.loc),614);$vars.ans=this._appendStructure($r1,this._apply($vars.t),618);$r1.value=this._appendStructure($r1,this._apply("popLocation"),621);return this._endStructure($r1);}),604);$r0.value=[$vars.loc].concat($vars.ans);return this._endStructure($r0);},
"storeSomething":function(){var $elf=this,$vars={},$r0=this._startStructure(624);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(627);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(631);$vars.loc=this._getStructureValue(this.anything());$vars.t=this._appendStructure($r2,this._apply("generatesStructure"),635);this._pred((this[$vars.t] != undefined));this._appendStructure($r2,this._applyWithArgs("pushLocation",$vars.loc),639);$vars.ans=this._appendStructure($r2,this._apply($vars.t),643);$r2.value=this._appendStructure($r2,this._apply("popLocation"),646);return this._endStructure($r2);}),629);$r1.value=[$vars.loc,"Store",[$vars.loc].concat($vars.ans)];return this._endStructure($r1);},function(){var $r1=this._startStructure(626);$r1.value=($vars.x=this._appendStructure($r1,this._apply("trans"),651));return this._endStructure($r1);}),625);return this._endStructure($r0);},
"storeSomethingThatReturns":function(){var $elf=this,$vars={},$r0=this._startStructure(653);$r0.value=($vars.x=this._appendStructure($r0,this._apply("somethingThatReturns"),656));return this._endStructure($r0);},
"functioned":function(){var $elf=this,$vars={},$r0=this._startStructure(658);$r0.value=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(661);$vars.x=this._appendStructure($r1,this._apply("somethingThatCanPass"),664);$r1.value=[$vars.x[(0)],"Function",[null,"Return",$vars.x]];return this._endStructure($r1);},function(){var $r1=this._startStructure(667);$vars.x=this._appendStructure($r1,this._apply("storeSomethingThatReturns"),670);$r1.value=[$vars.x[(0)],"FunctionStructure",$vars.x];return this._endStructure($r1);}),659);return this._endStructure($r0);},
"Or":function(){var $elf=this,$vars={},$r0=this._startStructure(673);$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("functioned"),678);}),676);$r0.value=["Or"].concat($vars.xs);return this._endStructure($r0);},
"XOr":function(){var $elf=this,$vars={},$r0=this._startStructure(681);$vars.xs=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("functioned"),686);}),684);$r0.value=["XOr"].concat($vars.xs);return this._endStructure($r0);},
"Opt":function(){var $elf=this,$vars={},$r0=this._startStructure(689);$vars.x=this._appendStructure($r0,this._apply("functioned"),692);$r0.value=["Opt",$vars.x];return this._endStructure($r0);},
"Many":function(){var $elf=this,$vars={},$r0=this._startStructure(695);$vars.x=this._appendStructure($r0,this._apply("functioned"),698);$r0.value=["Many",$vars.x];return this._endStructure($r0);},
"Many1":function(){var $elf=this,$vars={},$r0=this._startStructure(701);$vars.x=this._appendStructure($r0,this._apply("functioned"),704);$r0.value=["Many1",$vars.x];return this._endStructure($r0);},
"Not":function(){var $elf=this,$vars={},$r0=this._startStructure(707);$vars.x=this._appendStructure($r0,this._apply("functioned"),710);$r0.value=["Not",$vars.x];return this._endStructure($r0);},
"Lookahead":function(){var $elf=this,$vars={},$r0=this._startStructure(713);$vars.x=this._appendStructure($r0,this._apply("functioned"),716);$r0.value=["Lookahead",$vars.x];return this._endStructure($r0);},
"Form":function(){var $elf=this,$vars={},$r0=this._startStructure(719);$vars.x=this._appendStructure($r0,this._apply("functioned"),722);$r0.value=["Form",$vars.x];return this._endStructure($r0);},
"ConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(725);$vars.x=this._appendStructure($r0,this._apply("functioned"),728);$r0.value=["ConsBy",$vars.x];return this._endStructure($r0);},
"IdxConsBy":function(){var $elf=this,$vars={},$r0=this._startStructure(731);$vars.x=this._appendStructure($r0,this._apply("functioned"),734);$r0.value=["IdxConsBy",$vars.x];return this._endStructure($r0);},
"App":function(){var $elf=this,$vars={},$r0=this._startStructure(737);$vars.rule=this._getStructureValue(this.anything());$vars.args=this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._apply("trans"),743);}),741);$r0.value=["App",$vars.rule].concat($vars.args);return this._endStructure($r0);},
"JumpTable":function(){var $elf=this,$vars={},$r0=this._startStructure(746);$vars.ces=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(751);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(755);$vars.c=this._getStructureValue(this.anything());$r2.value=($vars.e=this._appendStructure($r2,this._apply("somethingThatReturns"),760));return this._endStructure($r2);}),753);$r1.value=[$vars.c,$vars.e];return this._endStructure($r1);}),749);$r0.value=["JumpTable"].concat($vars.ces);return this._endStructure($r0);},
"Interleave":function(){var $elf=this,$vars={},$r0=this._startStructure(764);$vars.xs=this._appendStructure($r0,this._many(function(){var $r1=this._startStructure(769);this._appendStructure($r1,this._form(function(){var $r2=this._startStructure(773);$vars.m=this._getStructureValue(this.anything());$r2.value=($vars.p=this._appendStructure($r2,this._apply("functioned"),778));return this._endStructure($r2);}),771);$r1.value=[$vars.m,$vars.p];return this._endStructure($r1);}),767);$r0.value=["Interleave"].concat($vars.xs);return this._endStructure($r0);},
"Pred":function(){var $elf=this,$vars={},$r0=this._startStructure(782);$vars.expr=this._getStructureValue(this.anything());$r0.value=["Pred",$vars.expr];return this._endStructure($r0);},
"Set":function(){var $elf=this,$vars={},$r0=this._startStructure(786);$vars.n=this._getStructureValue(this.anything());$vars.v=this._appendStructure($r0,this._apply("storeSomething"),790);$r0.value=["Set",$vars.n,$vars.v];return this._endStructure($r0);},
"Js":function(){var $elf=this,$vars={},$r0=this._startStructure(793);$vars.locals=this._getStructureValue(this.anything());$vars.code=this._getStructureValue(this.anything());$r0.value=["Js",$vars.locals,$vars.code];return this._endStructure($r0);},
"Location":function(){var $elf=this,$vars={},$r0=this._startStructure(798);$r0.value=["Location"];return this._endStructure($r0);},
"PopArg":function(){var $elf=this,$vars={},$r0=this._startStructure(800);$r0.value=["PopArg"];return this._endStructure($r0);},
"Rule":function(){var $elf=this,$vars={},$r0=this._startStructure(802);$vars.name=this._getStructureValue(this.anything());$vars.body=this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(808);$vars.b=this._appendStructure($r1,this._apply("somethingThatCanPass"),811);$r1.value=[null,"ReturnStructure",[$vars.b[(0)],"Store",$vars.b]];return this._endStructure($r1);},function(){return this._forwardStructure(this._apply("somethingThatReturns"),814);}),806);$r0.value=["Rule",$vars.name,$vars.body];return this._endStructure($r0);}});(BSFunctionOptimization["initialize"]=(function (){(this["_locations"]=[]);}));(BSFunctionOptimization["location"]=(function (){return this["_locations"][(this["_locations"]["length"] - (1))];}));let BSOMetaOptimizer=objectThatDelegatesTo(OMeta,{
"optimizeGrammar":function(){var $elf=this,$vars={},$r0=this._startStructure(817);this._appendStructure($r0,this._form(function(){var $r1=this._startStructure(821);this._appendStructure($r1,this.exactly("Grammar"),823);$vars.sn=this._getStructureValue(this.anything());$r1.value=($vars.rs=this._appendStructure($r1,this._many(function(){return this._forwardStructure(this._apply("optimizeRule"),830);}),828));return this._endStructure($r1);}),819);$r0.value=["Grammar",$vars.sn].concat($vars.rs);return this._endStructure($r0);},
"optimizeRule":function(){var $elf=this,$vars={},$r0=this._startStructure(833);$vars.r=this._getStructureValue(this.anything());this._appendStructure($r0,this._or(function(){var $r1=this._startStructure(837);$r1.value=($vars.r=this._appendStructure($r1,this._applyWithArgs("foreign",BSSeqInliner,"optimize",$vars.r),840));return this._endStructure($r1);},function(){return this._forwardStructure(this._apply("empty"),844);}),836);this._appendStructure($r0,this._many(function(){return this._forwardStructure(this._or(function(){var $r2=this._startStructure(849);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSAssociativeOptimization,"optimize",$vars.r),852));return this._endStructure($r2);},function(){var $r2=this._startStructure(849);$r2.value=($vars.r=this._appendStructure($r2,this._applyWithArgs("foreign",BSJumpTableOptimization,"optimize",$vars.r),858));return this._endStructure($r2);}),848);}),846);$vars.r=this._appendStructure($r0,this._applyWithArgs("foreign",BSFunctionOptimization,"optimize",$vars.r),863);$r0.value=$vars.r;return this._endStructure($r0);}})

