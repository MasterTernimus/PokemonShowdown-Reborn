'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Four approved composite removals',()=>{
 let battle;afterEach(()=>battle?.destroy());
 function setup(ability,species='Mew'){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,moves:['splash','tackle','weatherball']}],[{species:'Mew',ability:'No Ability',moves:['splash','tackle']}]]);
  battle.makeChoices('team 1','team 1');battle.randomizer=n=>n;battle.randomChance=(n,d)=>n>=d;
  return[battle.p1.active[0],battle.p2.active[0]];
 }
 it('Double Strike maximizes Tail Slap but gives only its Technician multiplier',()=>{
  const[p,t]=setup('Double Strike','Ambipom'),m=battle.dex.getActiveMove('tailslap');
  battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.multihit,5);
  assert.equal(battle.runEvent('BasePower',p,t,m,40),60);
  const punch=battle.dex.getActiveMove('machpunch');assert.equal(battle.runEvent('BasePower',p,t,punch,40),84);
  battle.field.terrain='factoryterrain';assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),70),105);
 });
 it('shared Skill Link still has its own multi-hit power bonus',()=>{
  const[p,t]=setup('Skill Link');const m=battle.dex.getActiveMove('tailslap');
  battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.multihit,5);
  assert.equal(battle.runEvent('BasePower',p,t,m,100),150);
 });
 it('True Devotion retains all other component identities and does not change typing on an off-type attack',()=>{
  const[p]=setup('True Devotion','Roserade-Mega');
  for(const a of ['falsedevotion','serenegrace','naturalrecovery','prankster','technician'])assert(p.hasAbility(a),a);
  assert(!p.hasAbility('protean'));const before=p.getTypes().slice();
  battle.makeChoices('move weatherball','move splash');assert.deepEqual(p.getTypes(),before);
 });
 it('True Devotion retains priority, secondary doubling and Technician',()=>{
  const[p,t]=setup('True Devotion','Roserade-Mega'),status=battle.dex.getActiveMove('splash');
  assert.equal(battle.runEvent('ModifyPriority',p,t,status,0),1);
  const m=battle.dex.getActiveMove('thunderbolt');m.secondaries=[{chance:10,status:'par'}];
  battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.secondaries[0].chance,20);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),40),60);
 });
 it('War Ship respects opposing offensive and defensive boosts while retaining its other components',()=>{
  const[p,t]=setup('War Ship','Drednaw-Gmax');
  for(const a of ['swiftswim','solidrock','strongjaw'])assert(p.hasAbility(a),a);assert(!p.hasAbility('unaware'));
  const m=battle.dex.getActiveMove('tackle');m.willCrit=false;
  battle.activePokemon=p;battle.activeTarget=t;
  const normal=battle.actions.getDamage(p,t,m);t.boosts.def=2;const defended=battle.actions.getDamage(p,t,m);assert(defended<normal*0.65);
  battle.activePokemon=t;battle.activeTarget=p;t.boosts.def=0;
  const incoming=battle.actions.getDamage(t,p,m);t.boosts.atk=2;const boosted=battle.actions.getDamage(t,p,m);assert(boosted>incoming*1.7);
  battle.field.setWeather('raindance',p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);
  assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('crunch'),100),150);
 });
 it('War Ship retains ordinary and super-effective Solid Rock reduction',()=>{
  const[p,t]=setup('War Ship','Drednaw-Gmax');
  for(const [mod,expected]of [[0,80],[1,60]]){const m=battle.dex.getActiveMove('tackle');p.getMoveHitData(m).typeMod=mod;assert.equal(battle.runEvent('ModifyDamage',t,p,m,100),expected);}
 });
 it('Void Voice cannot activate stale copy state but retains its three components',()=>{
  const[p,t]=setup('Void Voice','Gardevoir-Mega');
  for(const a of ['pixilate','queenlymajesty','dreamsickness'])assert(p.hasAbility(a),a);assert(!p.hasAbility('trace'));
  p.m.perfectForesightAbility='speedboost';p.m.perfectForesightAbilityState={id:'speedboost',target:p};assert(!p.hasAbility('speedboost'));
  battle.makeChoices('move splash','move splash');assert.equal(p.boosts.spe,0);
 });
});
