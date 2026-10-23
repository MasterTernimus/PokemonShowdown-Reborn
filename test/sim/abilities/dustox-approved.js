'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim');
const {AbilityComponents}=require('../../../dist/data/ability-components');
let battle;
function setup(ability='Night Forager',doubles=false,species='Mew') {
 const mon=(s='Mew',a='No Ability')=>({species:s,ability:a,moves:['splash','watergun','tackle','sludgebomb']});
 battle=common.createBattle({gameType:doubles?'doubles':'singles'},[[mon(species,ability),mon(),mon()],[mon(),mon(),mon()]]);
 battle.field.terrain='';battle.randomizer=n=>n;
 for(const side of battle.sides)for(const p of side.pokemon){p.hp=p.maxhp=p.baseMaxhp=1000;if(p.species.id==='mew')p.getPassives=()=>[];}
 return [battle.p1.active[0],battle.p2.active[0],battle.p1.active[1],battle.p2.active[1]];
}
function hit(p,q,id='sludgebomb',extra={}) {
 battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false,noDamageVariance:true,secondaries:null},extra),p,{target:q});
 return battle.activeMove;
}
describe('Dustox Night Forager',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('changes only Dustox selected slot, retaining its stats, Unaware and Rivalry passive',()=>{
  const [p]=setup('Night Forager',false,'Dustox');
  assert.deepEqual(p.species.abilities,{0:'Night Forager',1:'Unaware',H:'Toxic Cocoon'});
  assert.deepEqual(p.getPassives(),['rivalry']);
  assert.deepEqual(p.species.baseStats,{hp:90,atk:50,def:90,spa:80,spd:130,spe:90});
  assert.equal(Dex.abilities.get('compoundeyes').num,14);
  assert(Dex.abilities.get('compoundeyes').onSourceModifyAccuracy);
 });
 for(const id of ['sludgebomb','bugbuzz'])it('heals current maximum HP / 8 once per turn: '+id,()=>{
  const [p,q]=setup();p.maxhp=1003;p.baseMaxhp=2000;p.hp=500;
  hit(p,q,id,{damage:20});assert.equal(p.hp,625);
  hit(p,q,id,{damage:20});assert.equal(p.hp,625);
  battle.turn++;hit(p,q,id,{damage:20});assert.equal(p.hp,750);
 });
 for(const mode of ['multihit','spread'])it('does not multiply healing by '+mode,()=>{
  const [p,q]=setup('Night Forager',mode==='spread');p.hp=500;
  hit(p,q,'sludgebomb',{damage:20,...(mode==='spread'?{target:'allAdjacentFoes'}:{multihit:3})});
  assert.equal(p.hp,625);
  assert.equal(battle.log.filter(x=>x.startsWith('|-heal|p1a:')&&x.includes('Night Forager')).length,2);
 });
 for(const mode of ['substitute','miss','immunity','protect','status','ally','residual','other-type'])it('does not activate for '+mode,()=>{
  const [p,q,ally]=setup('Night Forager',mode==='ally');p.hp=500;
  if(mode==='substitute'){q.addVolatile('substitute');q.volatiles.substitute.hp=500;}
  if(mode==='immunity')q.setType('Steel');
  if(mode==='protect')q.addVolatile('protect');
  if(mode==='residual')battle.damage(20,q,p,Dex.conditions.get('psn'));
  else hit(p,mode==='ally'?ally:q,mode==='status'?'toxic':mode==='other-type'?'tackle':'sludgebomb',{...(mode==='status'?{}:{damage:20}),...(mode==='miss'?{accuracy:0}:{})});
  assert.equal(p.hp,500);
  assert.equal(p.m.nightForagerTurn,undefined);
 });
 for(const mode of ['full HP','Heal Block'])it('spends its activation even when healing is prevented: '+mode,()=>{
  const [p,q]=setup();if(mode==='Heal Block'){p.hp=500;p.addVolatile('healblock',q);}
  hit(p,q,'sludgebomb',{damage:20});assert.equal(p.m.nightForagerTurn,battle.turn);
  p.removeVolatile('healblock');p.hp=500;
  hit(p,q,'bugbuzz',{damage:20});assert.equal(p.hp,500);
 });
 it('respects suppression and does not spend the turn while suppressed',()=>{
  const [p,q]=setup();p.hp=500;p.addVolatile('gastroacid',q);
  hit(p,q,'sludgebomb',{damage:20});assert.equal(p.hp,500);assert.equal(p.m.nightForagerTurn,undefined);
  p.removeVolatile('gastroacid');hit(p,q,'sludgebomb',{damage:20});assert.equal(p.hp,625);
 });
 it('shares one turn activation between selected and duplicate passive callbacks',()=>{
  const [p,q]=setup();p.getPassives=()=>['nightforager'];p.hp=500;
  hit(p,q,'sludgebomb',{damage:20,multihit:3});assert.equal(p.hp,625);
 });
});

describe('Dustox Toxic Cocoon',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('halves every hit of the first Special HP attack, then spends the guard',()=>{
  const [p,q]=setup('Toxic Cocoon');const seen=[];const runEvent=battle.runEvent;
  battle.runEvent=function(event,...args){if(event==='DamagingHit'){const i=(Array.isArray(args[0])?args[0]:[args[0]]).indexOf(p);if(i>=0)seen.push(Array.isArray(args[3])?args[3][i]:args[3]);}return runEvent.call(this,event,...args);};
  hit(q,p,'watergun',{multihit:3});assert.equal(seen.length,3);assert(seen.every(x=>x===seen[0]));
  const guarded=1000-p.hp;assert(p.m.toxicCocoon.specialUsed);
  const before=p.hp;hit(q,p,'watergun',{multihit:3});
  assert(Math.abs((before-p.hp)-guarded*2)<=3);
 });
 it('Substitute-only damage preserves the guard; a mixed attack protects all HP hits',()=>{
  const [p,q]=setup('Toxic Cocoon');p.addVolatile('substitute');p.volatiles.substitute.hp=1000;
  hit(q,p,'watergun',{multihit:3});assert.equal(p.hp,1000);assert(!p.m.toxicCocoon.specialUsed);
  p.volatiles.substitute.hp=1;
  const seen=[];const runEvent=battle.runEvent;
  battle.runEvent=function(event,...args){if(event==='DamagingHit'){const i=(Array.isArray(args[0])?args[0]:[args[0]]).indexOf(p);if(i>=0)seen.push(Array.isArray(args[3])?args[3][i]:args[3]);}return runEvent.call(this,event,...args);};
  hit(q,p,'watergun',{multihit:3});assert.equal(seen.length,2);assert.equal(seen[0],seen[1]);assert(p.m.toxicCocoon.specialUsed);
 });
 for(const mode of ['miss','protect','ally','Physical'])it('does not spend Special guard on '+mode,()=>{
  const [p,q,ally]=setup('Toxic Cocoon',mode==='ally');
  if(mode==='protect')p.addVolatile('protect');
  hit(mode==='ally'?ally:q,p,mode==='Physical'?'tackle':'watergun',{...(mode==='miss'?{accuracy:0}:{})});
  assert(!p.m.toxicCocoon.specialUsed);
 });
 it('copies full local Shield Dust and retains attacker self-secondary effects',()=>{
  const [p,q]=setup('Toxic Cocoon');
  hit(q,p,'watergun',{secondaries:[{chance:100,status:'brn'},{chance:100,self:{boosts:{atk:1}}}]});
  assert.equal(p.status,'');assert.equal(q.boosts.atk,1);
  assert.deepEqual(AbilityComponents.toxiccocoon,['shielddust']);
  q.setAbility('Mold Breaker');
  hit(q,p,'watergun',{secondaries:[{chance:100,status:'brn'}]});assert.equal(p.status,'brn');
 });
 it('keeps contact poisoning independent and spends an immune attacker attempt',()=>{
  const [p,q]=setup('Toxic Cocoon');q.setAbility('Immunity');
  hit(q,p,'tackle',{damage:20});assert.equal(q.status,'');assert(p.m.toxicCocoon.poisonUsed);assert(!p.m.toxicCocoon.specialUsed);
  q.setAbility('No Ability');hit(q,p,'tackle',{damage:20});assert.equal(q.status,'');
 });
 it('poisons only the first opposing contact HP attacker and preserves it on Substitute',()=>{
  const [p,q]=setup('Toxic Cocoon');p.addVolatile('substitute');p.volatiles.substitute.hp=1000;
  hit(q,p,'tackle',{damage:20});assert.equal(q.status,'');assert(!p.m.toxicCocoon.poisonUsed);
  p.removeVolatile('substitute');hit(q,p,'tackle',{damage:20});assert.equal(q.status,'psn');assert(p.m.toxicCocoon.poisonUsed);
  q.cureStatus();hit(q,p,'tackle',{damage:20});assert.equal(q.status,'');
 });
 it('does not rearm on suppression ending, restart or reacquisition',()=>{
  const [p,q]=setup('Toxic Cocoon');hit(q,p,'watergun');assert(p.m.toxicCocoon.specialUsed);
  p.addVolatile('gastroacid',q);p.removeVolatile('gastroacid');
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
  assert(p.m.toxicCocoon.specialUsed);
  p.setAbility('No Ability');p.setAbility('Toxic Cocoon');assert(p.m.toxicCocoon.specialUsed);
  const before=p.hp;hit(q,p,'watergun');const full=before-p.hp;
  assert(full>0);assert(p.m.toxicCocoon.specialUsed);
 });
 it('respects suppression of guard, poison and Shield Dust',()=>{
  const [p,q]=setup('Toxic Cocoon');p.addVolatile('gastroacid',q);
  hit(q,p,'watergun',{flags:{contact:1,protect:1},secondaries:[{chance:100,status:'brn'}]});
  assert.equal(p.status,'brn');assert.equal(q.status,'');assert(!p.m.toxicCocoon.specialUsed);assert(!p.m.toxicCocoon.poisonUsed);
 });
 it('rearms on actual reentry under Gas, including Gas ending on that entry turn',()=>{
  const [p,q]=setup('Toxic Cocoon');hit(q,p,'watergun');const entry=p.previouslySwitchedIn;
  q.setAbility('Neutralizing Gas');battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');
  assert.equal(p.previouslySwitchedIn,entry+1);q.setAbility('No Ability');
  assert(!p.m.toxicCocoon.specialUsed);assert(!p.m.toxicCocoon.poisonUsed);
  hit(q,p,'watergun',{multihit:3});assert(p.m.toxicCocoon.specialUsed);
 });
});
