'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
function setup(ability='No Ability') {
 const mon=(ability)=>({species:'Mew',ability,moves:['waterpulse','tackle','protect','splash']});
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon('Heavy Artillery'),mon('No Ability')],[mon(ability),mon('No Ability')]]);
 battle.makeChoices('team 12','team 12');battle.randomizer=x=>x;for(const p of battle.getAllActive()){p.hp=p.maxhp=p.baseMaxhp=10000;p.getPassives=()=>[];}
 return [battle.p1.active[0],battle.p2.active[0]];
}
function fire(p,q,id='waterpulse',extra={}){const move=Object.assign(battle.dex.getActiveMove(id),{accuracy:true,secondaries:null},extra);battle.actions.useMove(move,p,{target:q});battle.runEvent('AfterMove',p,q,battle.activeMove);}
function reload(p){battle.turn++;battle.singleEvent('Residual',battle.dex.conditions.get('artilleryreload'),p.volatiles.artilleryreload,p);}
describe('Heavy Artillery fire and reload',()=>{
 afterEach(()=>battle?.destroy());
 it('retains doubled power, caps its own drops and breaks all five barriers on an HP hit',()=>{
  const[p,q]=setup();for(const id of ['reflect','lightscreen','auroraveil','atlantiswall','arenitewall'])q.side.addSideCondition(id,q);
  assert.equal(battle.runEvent('BasePower',p,q,battle.dex.getActiveMove('waterpulse'),100),200);
  fire(p,q);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
  for(const id of ['reflect','lightscreen','auroraveil','atlantiswall','arenitewall'])assert(!q.side.sideConditions[id]);
  fire(p,q);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
  battle.singleEvent('Residual',battle.dex.conditions.get('artilleryreload'),p.volatiles.artilleryreload,p);assert.equal(p.boosts.def,-1);
  reload(p);assert.equal(p.boosts.def,0);assert.equal(p.boosts.spd,0);
 });
 it('reload restores only its own loss, preserving later enemy defense drops',()=>{
  const[p,q]=setup();fire(p,q);battle.boost({def:-2,spd:-2},p,q);assert.equal(p.boosts.def,-3);reload(p);assert.equal(p.boosts.def,-2);assert.equal(p.boosts.spd,-2);
 });
 for(const mode of ['clear','set','boost'])it('cannot manufacture recovery after '+mode+' removed its loss',()=>{
  const[p,q]=setup();fire(p,q);
  if(mode==='clear')p.clearBoosts();else if(mode==='set')p.setBoost({def:0,spd:0});else battle.boost({def:1,spd:1},p,q);
  battle.boost({def:-1,spd:-1},p,q);reload(p);assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
 });
 for(const defense of ['protect','substitute','immune','miss'])it('no drops or screen breaking on '+defense,()=>{
  const[p,q]=setup(defense==='immune'?'Water Absorb':'No Ability');q.side.addSideCondition('lightscreen',q);
  if(['protect','substitute'].includes(defense))q.addVolatile(defense,q);
  fire(p,q,'waterpulse',defense==='miss'?{accuracy:0}:{});assert.equal(p.boosts.def,0);assert(q.side.sideConditions.lightscreen);
 });
 it('a normal non-artillery turn reloads at turn end',()=>{
  const[p,q]=setup();battle.makeChoices('move waterpulse','move splash');assert.equal(p.boosts.def,-1);
  battle.makeChoices('move protect','move splash');assert.equal(p.boosts.def,0);assert.equal(p.boosts.spd,0);
 });
 it('multi-hit attacks spend one penalty and cannot exceed the cap',()=>{
  const[p,q]=setup();fire(p,q,'bulletseed',{multihit:5});assert.equal(p.boosts.def,-1);assert.equal(p.boosts.spd,-1);
 });
});
