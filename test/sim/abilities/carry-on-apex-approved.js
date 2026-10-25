'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
let battle;
function start(ability='Carry On'){
 battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[
 {species:'Lucario',ability,moves:['splash']},
 {species:'Mew',ability:'Huge Power',moves:['splash','healingwish']},
 {species:'Mew',ability:'No Ability',moves:['splash']},
 {species:'Mew',ability:'No Ability',moves:['splash']},
 ],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 battle.makeChoices('team 1234','team 12');return battle.p1.active;
}
describe('Carry On and Apex Predator approved packages',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('uses only base Lucario assignments; Mega passives remain unchanged',()=>{
  assert.deepEqual(Dex.species.get('lucario').abilities,{0:'Carry On'});
  assert.deepEqual(Dex.species.get('lucario').passives,['mindseye']);
  assert.deepEqual(Dex.species.get('lucariomega').passives,['adaptability']);
 });
 it('adds an ally ability without replacing Carry On and only once',()=>{
  const [p,q]=start();const raw=p.getStat('atk',false,true);
  q.faint();battle.faintMessages();
  assert.equal(p.ability,'carryon');assert.equal(p.m.carryOnAbility,'hugepower');assert(p.hasAbility('hugepower'));
  assert.equal(p.getStat('atk'),raw*2);
  const next=battle.p1.pokemon[2];next.setAbility('speedboost');
  battle.singleEvent('AllyFaint',p.getAbility(),p.abilityState,next);
  assert.equal(p.m.carryOnAbility,'hugepower');assert(!p.hasAbility('speedboost'));
  assert(!p.addVolatile('flinch'));
 });
 it('retains inheritance through switching and suppression without replenishing budget',()=>{
  const [p,q]=start();battle.makeChoices('move splash, move healingwish','move splash, move splash');
  p.addVolatile('gastroacid');assert(!p.hasAbility('hugepower'));p.removeVolatile('gastroacid');assert(p.hasAbility('hugepower'));
  battle.makeChoices('switch 3','');
  battle.makeChoices('switch 4, move splash','move splash, move splash');
  battle.makeChoices('switch 4, move splash','move splash, move splash');
  assert.equal(p.m.carryOnAbility,'hugepower');assert(p.m.carryOnSpent);assert(p.hasAbility('hugepower'));
 });
 it('rejects ineligible inheritance without spending the budget',()=>{
  const [p,q]=start();q.setAbility('receiver');
  battle.singleEvent('AllyFaint',p.getAbility(),p.abilityState,q);
  assert(!p.m.carryOnSpent);assert(!p.m.carryOnAbility);
 });
 it('Apex Predator has contact power without Relic Armor or Dragonize',()=>{
  const [p,q]=start('Apex Predator');const move=battle.dex.getActiveMove('tackle');
  assert.equal(battle.runEvent('BasePower',p,q,move,100),130);
  assert(!p.hasAbility('relicarmor'));assert(!p.hasAbility('dragonize'));assert(p.hasAbility('windrider'));
  battle.actions.useMove('gust',battle.p2.active[0],{target:p});assert.equal(p.boosts.atk,1);
 });
 it('does not copy ally passives or act through Mega ability replacement',()=>{
  const [p,q]=start();q.getPassives=()=>['speedboost'];q.faint();battle.faintMessages();
  assert(!p.hasAbility('speedboost'));assert.equal(p.m.carryOnAbility,'hugepower');
  p.setItem('lucarionite');p.canMegaEvo=battle.actions.canMegaEvo(p);
  assert(battle.actions.runMegaEvo(p));
  assert.notEqual(p.ability,'carryon');assert(!p.hasAbility('hugepower'));assert(p.m.carryOnSpent);
 });
 it('does not double the Healer component when it inherits Healer',()=>{
  const [p,q]=start();q.setAbility('healer');
  battle.singleEvent('AllyFaint',p.getAbility(),p.abilityState,q);
  q.setStatus('par');let checks=0;battle.randomChance=()=>{checks++;return false;};
  for(const h of battle.findPokemonEventHandlers(p,'onResidual')) if(h.effect.effectType==='Ability') {
   battle.singleEvent('Residual',h.effect,h.state,p);
  }
  assert.equal(checks,1);assert.equal(q.status,'par');
 });

});
