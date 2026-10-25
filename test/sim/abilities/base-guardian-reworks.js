'use strict';
const assert=require('assert').strict,common=require('../../common');
let battle;
function start(species,ability){
 battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[
 {species,ability,moves:['tackle','splash','fly','protect']},
 {species:'Mew',ability:'No Ability',moves:['splash']}
 ],[{species:'Mew',ability:'No Ability',moves:['tackle','doublehit','earthquake','gravity']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 12','team 12');
 for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=4000;
 battle.randomizer=n=>n;battle.randomChance=(n,d)=>n>=d;
 return [battle.p1.active[0],battle.p1.active[1],battle.p2.active[0]];
}
describe('Base guardian reworks and unchanged non-base holders',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Knight’s Guard earns one nonstacking ally guard from opposing HP damage',()=>{
  const [p,ally,foe]=start('Gallade',"Knight's Guard");
  assert(!ally.volatiles.knightsguardearned);
  battle.actions.useMove('tackle',p,{target:foe});assert(ally.volatiles.knightsguardearned);
  const state=ally.volatiles.knightsguardearned;
  battle.actions.useMove('tackle',p,{target:foe});assert.equal(ally.volatiles.knightsguardearned,state);
  const m=battle.dex.getActiveMove('doublehit');
  assert.equal(battle.runEvent('ModifyDamage',foe,ally,m,100),75);
  assert.equal(battle.runEvent('ModifyDamage',foe,ally,m,100),75);
  battle.runEvent('AfterMove',foe,ally,m);assert(!ally.volatiles.knightsguardearned);
 });
 it('does not earn a guard through Substitute or ally damage',()=>{
  const [p,ally,foe]=start('Gallade',"Knight's Guard");foe.addVolatile('substitute');foe.volatiles.substitute.hp=1000;
  battle.actions.useMove('tackle',p,{target:foe});assert(!ally.volatiles.knightsguardearned);
  battle.actions.useMove('tackle',p,{target:ally});assert(!ally.volatiles.knightsguardearned);
 });
 it('earned guard expires after the following turn',()=>{
  const [p,ally,foe]=start('Gallade',"Knight's Guard");battle.actions.useMove('tackle',p,{target:foe});
  battle.makeChoices('move protect, move splash','move tackle 1, move splash');assert(ally.volatiles.knightsguardearned);
  battle.makeChoices('move protect, move splash','move tackle 1, move splash');assert(!ally.volatiles.knightsguardearned);
 });
 it('Dream Sickness rescues a lethal multihit for one cost and spends a battle budget',()=>{
  const [p,ally,foe]=start('Gardevoir','Dream Sickness');ally.hp=1;
  const before=p.hp;const m=battle.dex.getActiveMove('doublehit');m.accuracy=true;
  battle.actions.useMove(m,foe,{target:ally});assert.equal(ally.hp,1);
  assert.equal(p.hp,before-1000);assert(p.m.dreamSicknessRescueSpent);
  battle.actions.useMove('tackle',foe,{target:ally});assert.equal(ally.hp,0);
 });
 it('requires enough holder HP and does not restore the rescue at entry',()=>{
  const [p,ally,foe]=start('Gardevoir','Dream Sickness');p.hp=1000;ally.hp=1;
  battle.actions.useMove('tackle',foe,{target:ally});assert.equal(ally.hp,0);assert(!p.m.dreamSicknessRescueSpent);
  p.m.dreamSicknessRescueSpent=true;
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert(p.m.dreamSicknessRescueSpent);
 });
 it('Dream Sickness has Insomnia and Sworn Duty but no residual healing or Telepathy',()=>{
  const [p,ally]=start('Gardevoir','Dream Sickness');assert(!p.setStatus('slp'));
  assert(!p.hasAbility('telepathy'));assert(p.hasAbility('insomnia'));assert(p.hasAbility('swornduty'));
  p.hp=ally.hp=2000;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);
  assert.equal(p.hp,2000);assert.equal(ally.hp,2000);
 });
 it('Void Veil ignores Gravity without ignoring other grounding or suppression',()=>{
  const [p,ally,foe]=start('Gardevoir','Void Veil');battle.field.addPseudoWeather('gravity',foe);
  assert.equal(p.isGrounded(),null);assert(!p.getMoves().find(m=>m.id==='fly').disabled);
  p.addVolatile('smackdown');assert.equal(p.isGrounded(),true);p.removeVolatile('smackdown');
  p.setItem('ironball');assert.equal(p.isGrounded(),true);p.clearItem();
  p.addVolatile('gastroacid');assert.equal(p.isGrounded(),true);battle.runEvent('DisableMove',p);assert(p.getMoves().find(m=>m.id==='fly').disabled);
 });
 it('Void Veil retains Telepathy and permits sleep and indirect damage',()=>{
  const [p,ally]=start('Gardevoir','Void Veil');assert(p.hasAbility('telepathy'));assert(!p.hasAbility('insomnia'));assert(!p.hasAbility('magicguard'));
  assert(p.setStatus('slp'));p.clearStatus();const hp=p.hp;
  battle.actions.useMove('tackle',ally,{target:p});assert.equal(p.hp,hp);
  battle.damage(100,p,p,battle.dex.conditions.get('brn'));assert.equal(p.hp,hp-100);
 });
 it('preserves Gardevoir-Void’s original selected ability behavior',()=>{
  const [p,ally]=start('Gardevoir-Void','Dream Sickness');assert(p.hasAbility('telepathy'));
  p.hp=ally.hp=2000;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,2250);assert.equal(ally.hp,2250);
 });
 it('preserves Mega Gardevoir’s Void Voice behavior',()=>{
  const [p,ally]=start('Gardevoir-Mega','Void Voice');p.hp=ally.hp=2000;
  battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,2250);assert.equal(ally.hp,2250);
 });
});
