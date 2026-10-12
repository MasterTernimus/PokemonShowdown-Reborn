'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup() {
 const mon = {species:'Mew',ability:'No Ability',moves:['nostraswish','splash']};
 battle=common.createBattle({},[[mon],[mon]]);
 if(battle.requestState==='teampreview') battle.makeChoices();
 battle.field.terrain='';battle.randomizer=n=>n;
 const [p,q]=[battle.p1.active[0],battle.p2.active[0]];
 for(const x of [p,q]) x.hp=x.maxhp=x.baseMaxhp=10000;
 return [p,q];
}
describe('Nostras Wish approved field interactions',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [field,weather,factor] of [['holyterrain','',1.5],['starlightarenaterrain','',2],['starlightarenaterrain','raindance',1],['newworldterrain','',4]]) {
  it(field+' '+weather+' applies total '+factor+' to the actual delayed attack',()=>{
   const[p,q]=setup();battle.actions.useMove('nostraswish',p,{target:q});
   const slot=q.side.slotConditions[0].futuremove;slot.moveData.willCrit=false;
   const expected=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(slot.moveData),{basePower:140*factor}));
   battle.field.terrain=field;battle.field.weather=weather;
   const hp=q.hp;battle.turn=slot.endingTurn+1;
   battle.singleEvent('Residual',Dex.conditions.get('futuremove'),slot,q);
   assert.equal(hp-q.hp,expected);
  });
 }
 for(const field of ['', 'holyterrain','starlightarenaterrain','newworldterrain']) for(const type of ['Steel','Steel/Dragon','Steel/Fire']) {
  it('Steel typing at impact: '+field+' '+type,()=>{
   const[p,q]=setup();q.setType(type.split('/'));
   battle.field.terrain=field ? '' : 'starlightarenaterrain';
   battle.actions.useMove('nostraswish',p,{target:q});
   const slot=q.side.slotConditions[0].futuremove;slot.moveData.willCrit=false;
   battle.field.terrain=field;
   const boosted=['starlightarenaterrain','newworldterrain'].includes(field);
   const expected=battle.actions.getDamage(p,q,Object.assign(Dex.getActiveMove(slot.moveData),{onEffectiveness:boosted?function(mod,target,t){if(t==='Steel')return 1;}:undefined}));
   const hp=q.hp;battle.turn=slot.endingTurn+1;battle.singleEvent('Residual',Dex.conditions.get('futuremove'),slot,q);
   assert.equal(hp-q.hp,expected);
  });
 }
 it('Steel override respects effective-terrain suppression',()=>{
  const[p,q]=setup();battle.field.terrain='starlightarenaterrain';
  const run=battle.runEvent;battle.runEvent=function(event,...args){return event==='TryTerrain'?false:run.call(this,event,...args);};
  assert.equal(Dex.moves.get('nostraswish').onEffectiveness.call(battle,-1,q,'Steel'),undefined);
 });
 it('Starlight weather disables the power boost but retains its Steel override',()=>{
  const[p,q]=setup();q.setType('Steel');battle.field.terrain='starlightarenaterrain';battle.field.weather='raindance';
  assert.equal(Dex.moves.get('nostraswish').onEffectiveness.call(battle,-1,q,'Steel'),1);
  q.setAbility('Cloud Nine');
  const m=Dex.getActiveMove('nostraswish');m.willCrit=false;
  const rainy=battle.actions.getDamage(p,q,m);battle.field.weather='';const clear=battle.actions.getDamage(p,q,Dex.getActiveMove(m));
  assert(clear>rainy*1.9,'raw weather gate remains even under Cloud Nine');
 });
});
