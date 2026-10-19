'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(species='Mew',ability='No Ability',moves=['splash','tackle','withdraw','skullbash'])=>({species,ability,moves});
function setup(species,ability,mode='doubles'){battle=common.createBattle({gameType:mode},[[mon(species,ability),mon(),mon()],[mon(),mon(),mon()]]);battle.field.terrain='';for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=2000;return[battle.p1.active[0],battle.p2.active[0]];}
const hit=(p,q,id,extra={})=>battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,{target:q});
describe('Pearl/Abyssal and Hydraulic approved abilities',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('keeps Swift Swim and passives with exact approved slot replacements',()=>{assert.deepEqual(Dex.species.get('gorebyss').abilities,{0:'Swift Swim',1:'Pearl Siphon',H:'Pearl Tide'});assert.deepEqual(Dex.species.get('huntail').abilities,{0:'Swift Swim',1:'Abyssal Fang',H:'Abyssal Current'});assert.deepEqual(Dex.species.get('gorebyss').passives,['pixilate']);});
 it('Pearl Siphon heals actual opposing HP damage after the attack and obeys per-turn cap',()=>{
  const[p,q]=setup('Gorebyss','Pearl Siphon');p.hp=500;hit(p,q,'tackle',{damage:800});assert.equal(p.hp,600);hit(p,q,'tackle',{damage:800});assert.equal(p.hp,700);q.hp=2000;hit(p,q,'tackle',{damage:800});assert.equal(p.hp,750);p.setAbility('No Ability');p.setAbility('Pearl Siphon');hit(p,q,'tackle',{damage:800});assert.equal(p.hp,750);
 });
 it('Pearl Siphon excludes existing drain, ally and Substitute-only damage and respects Heal Block',()=>{
  const[p,q]=setup('Gorebyss','Pearl Siphon');p.hp=500;hit(p,q,'gigadrain',{damage:80});assert.equal(p.hp,540);q.addVolatile('substitute');hit(p,q,'tackle',{damage:80});assert.equal(p.hp,540);hit(p,p.side.active[1],'tackle',{damage:80});assert.equal(p.hp,540);q.removeVolatile('substitute');p.addVolatile('healblock',q);hit(p,q,'tackle',{damage:80});assert.equal(p.hp,540);
 });
 it('Pearl Tide heals only self and the lowest-percentage adjacent ally once per turn',()=>{
  const[p,q]=setup('Gorebyss','Pearl Tide'),ally=p.side.active[1];p.hp=500;ally.hp=250;hit(p,q,'watergun',{damage:80});assert.equal(p.hp,625);assert.equal(ally.hp,375);hit(p,q,'watergun',{damage:80});assert.equal(p.hp,625);assert.equal(ally.hp,375);
 });
 it('Abyssal Fang retains Strong Jaw and lowers SpD only once after all hits',()=>{
  const[p,q]=setup('Huntail','Abyssal Fang');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('crunch'),100),150);hit(p,q,'crunch',{multihit:3,secondaries:[]});assert.equal(q.boosts.spd,-1);hit(p,q,'crunch',{secondaries:[]});assert.equal(q.boosts.spd,-1);
 });
 it('Abyssal Current retains Water Absorb and respects stat-drop protection',()=>{
  const[p,q]=setup('Huntail','Abyssal Current');p.hp=500;hit(q,p,'watergun');assert.equal(p.hp,1000);q.setAbility('Clear Body');hit(p,q,'darkpulse',{secondaries:[]});assert.equal(q.boosts.atk,0);q.setAbility('No Ability');hit(p,q,'darkpulse',{secondaries:[]});assert.equal(q.boosts.atk,0);
 });
 it('Hydraulic retains Stamina without building Special Defense',()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor');p.hp=500;hit(q,p,'tackle',{damage:10});assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,0);hit(q,p,'tackle',{damage:10});assert.equal(p.boosts.spd,0);hit(q,p,'tackle',{damage:10,multihit:4});assert.equal(p.boosts.spd,0);assert(p.hp>500);
 });
 it('Withdraw and ability changes do not create the removed counter or charge',()=>{const[p,q]=setup('Blastoise','Hydraulic Armor','singles');battle.makeChoices('move withdraw','move splash');assert.equal(p.abilityState.hydraulicCharge,undefined);hit(q,p,'tackle',{damage:10});assert.equal(p.boosts.spd,0);p.setAbility('No Ability');p.setAbility('Hydraulic Armor');assert.equal(p.abilityState.hydraulicCharge,undefined);assert.equal(p.abilityState.hydraulicHits,undefined);});
 it('Skull Bash preparation grants normal boosts but no charge or Hydro Pump',()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor','singles');battle.makeChoices('move skullbash','move splash');assert(!p.abilityState.hydraulicCharge);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert(!battle.log.some(x=>x.includes('|move|')&&x.includes('|Hydro Pump|')));
  battle.makeChoices('move skullbash','move splash');assert.equal(battle.log.filter(x=>x.includes('|move|')&&x.includes('|Hydro Pump|')).length,1);
 });
 it('Power Herb grants no charge and fires one free Hydro Pump immediately',()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor');p.setItem('Power Herb');const pp=p.moveSlots.map(x=>x.pp);hit(p,q,'skullbash');assert(!p.abilityState.hydraulicCharge);assert(!p.volatiles.twoturnmove);assert.equal(p.item,'');assert.equal(battle.log.filter(x=>x.includes('|move|')&&x.includes('|Hydro Pump|')).length,1);assert.deepEqual(p.moveSlots.map(x=>x.pp),pp);
 });
 it('returning Skull Bash strike never grants preparation charge',()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor','singles');battle.makeChoices('move skullbash','move splash');assert(!p.abilityState.hydraulicCharge);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);hit(q,p,'tackle',{damage:10});assert(!p.abilityState.hydraulicCharge);battle.makeChoices('move skullbash','move splash');assert(!p.abilityState.hydraulicCharge);assert.equal(battle.log.filter(x=>x.includes('|move|')&&x.includes('|Hydro Pump|')).length,1);
 });
 it('Skull Bash preparation does not grant Hydraulic charge to other abilities',()=>{
  const[p,q]=setup('Blastoise','No Ability');p.setItem('Power Herb');hit(p,q,'skullbash');assert(!p.abilityState.hydraulicCharge);
 });
 for(const kind of ['substitute','immunity','KO'])it('Skull Bash no follow-up on '+kind,()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor');p.setItem('Power Herb');if(kind==='substitute')q.addVolatile('substitute');if(kind==='immunity')q.setType('Ghost');if(kind==='KO')q.hp=1;hit(p,q,'skullbash');assert(!battle.log.some(x=>x.includes('|move|')&&x.includes('|Hydro Pump|')));
 });
 it('Hydraulic still uses higher boosted Defense for Water Pulse and retains Torrent',()=>{
  const[p,q]=setup('Blastoise','Hydraulic Armor');p.boosts.def=6;p.hp=100;const move=Dex.getActiveMove('waterpulse');battle.runEvent('ModifyMove',p,q,move,move);assert.equal(move.overrideOffensiveStat,'def');assert(p.getPassives().includes('torrent'));
 });
});
