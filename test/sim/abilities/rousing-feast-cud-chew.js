'use strict';
const assert = require('assert').strict;
const {Battle, Dex} = require('../../../dist/sim');

describe('Rousing Feast full local Cud Chew', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function setup(ability = 'Rousing Feast', species = 'Mew', foeAbility = 'No Ability') {
  const mon = {species:'Mew',ability:'No Ability',moves:['splash','bugbite','pluck','fling']};
  battle = new Battle({formatid:'gen9nofieldsinglesgame',p1:{team:[{...mon,species,ability},mon]},p2:{team:[{...mon,ability:foeAbility},mon]}});
  if (battle.requestState==='teampreview') battle.makeChoices('team 12','team 12');
  for (const side of battle.sides) for (const p of side.pokemon) p.hp=p.maxhp=p.baseMaxhp=4000;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function turn() { battle.makeChoices('move splash','move splash'); }
 function consume(p, item = 'sitrusberry') { p.setItem(item); p.hp=1000; turn(); }
 it('retains Gluttony and exposes Cud Chew without changing the native primitive', () => {
  const [p]=setup(); assert(p.hasAbility('gluttony'));assert(p.hasAbility('cudchew'));
  const a=p.getAbility(),c=Dex.abilities.get('cudchew');
  assert.equal(a.onResidual,c.onResidual);assert.equal(a.onResidualOrder,28);assert.equal(a.onResidualSubOrder,2);
 });
 it('re-eats at the end of the next turn once and clears new negative stages too', () => {
  const [p]=setup(); p.boosts.atk=-2;p.boosts.spe=-2;p.boosts.def=-2;
  consume(p);assert.equal(p.hp,2000);assert.equal(p.abilityState.counter,1);
  assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert.equal(p.boosts.def,-2);
  p.boosts.atk=-1;p.boosts.spe=-1;turn();assert.equal(p.hp,3000);
  assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert.equal(p.boosts.def,-2);
  assert(!p.abilityState.berry);assert.equal(p.abilityState.counter,undefined);
  turn();turn();assert.equal(p.hp,3000);
 });
 it('preserves positive stages and other stats during both consumptions', () => {
  const [p]=setup();p.boosts.atk=2;p.boosts.spe=3;p.boosts.spa=-2;
  consume(p);turn();assert.equal(p.boosts.atk,2);assert.equal(p.boosts.spe,3);assert.equal(p.boosts.spa,-2);
 });
 it('retains the Gluttony half-HP threshold and works with a separate native Gluttony passive', () => {
  const [p]=setup('Rousing Feast','Snorlax');assert(p.getPassives().includes('gluttony'));
  p.setItem('figyberry');p.hp=1600;p.boosts.atk=-2;p.boosts.spe=-2;turn();
  assert.equal(p.item,'');assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);
  const hp=p.hp;turn();assert(p.hp>hp);const after=p.hp;turn();assert.equal(p.hp,after);
 });
 it('initial Unnerve prevents consumption, clearing and scheduling', () => {
  const [p]=setup('Rousing Feast','Mew','Unnerve');p.setItem('sitrusberry');p.hp=1000;p.boosts.atk=-2;turn();
  assert.equal(p.item,'sitrusberry');assert.equal(p.hp,1000);assert.equal(p.boosts.atk,-2);assert(!p.abilityState.berry);
 });
 it('native Cud Chew repeats an already eaten Berry even if an opponent later has Unnerve', () => {
  const [p,q]=setup();consume(p);q.setAbility('Unnerve');turn();assert.equal(p.hp,3000);assert(!p.abilityState.berry);
 });
 it('pauses a pending repeat under suppression and resumes without duplicating it', () => {
  const [p]=setup();consume(p);p.addVolatile('gastroacid');turn();turn();
  assert.equal(p.hp,2000);assert.equal(p.abilityState.counter,1);
  p.removeVolatile('gastroacid');turn();assert.equal(p.hp,3000);turn();assert.equal(p.hp,3000);
 });
 it('does not schedule or clear stages from consumption while suppressed', () => {
  const [p]=setup();p.addVolatile('gastroacid');p.boosts.atk=-2;consume(p);
  assert.equal(p.hp,2000);assert.equal(p.boosts.atk,-2);assert(!p.abilityState.berry);
 });
 it('losing and reacquiring the selected ability does not transfer pending berry state', () => {
  const [p]=setup();consume(p);p.setAbility('No Ability');p.setAbility('Rousing Feast');turn();turn();
  assert.equal(p.hp,2000);assert(!p.abilityState.berry);
 });
 it('switching out and back cancels the pending repeat', () => {
  const [p]=setup();consume(p);battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');turn();
  assert.equal(p.hp,2000);assert(!p.abilityState.berry);
 });
 it('a fainted holder cannot repeat its pending Berry', () => {
  const [p,q]=setup();consume(p);p.hp=1;
  battle.actions.useMove(Object.assign(Dex.getActiveMove('watergun'),{accuracy:true,willCrit:false}),q,{target:p});
  assert.equal(p.hp,0);const count=battle.log.filter(l=>l.includes('ability: Cud Chew')).length;
  battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);
  assert.equal(p.hp,0);assert.equal(battle.log.filter(l=>l.includes('ability: Cud Chew')).length,count);
 });
 for (const move of ['bugbite','pluck']) it(move+' Berry clears negative stages but never schedules Cud Chew', () => {
  const [p,q]=setup();p.hp=1000;p.boosts.atk=-2;p.boosts.spe=-2;q.setItem('sitrusberry');
  battle.actions.useMove(Object.assign(Dex.getActiveMove(move),{accuracy:true,willCrit:false}),p,{target:q});
  assert.equal(p.hp,2000);assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert(!p.abilityState.berry);
  turn();turn();assert.equal(p.hp,2000);
 });
 it('uses the existing local Fling Cud Chew source interface once', () => {
  const [p,q]=setup();p.hp=1000;p.setItem('sitrusberry');
  battle.actions.useMove(Object.assign(Dex.getActiveMove('fling'),{accuracy:true,willCrit:false}),p,{target:q});
  assert.equal(p.item,'');assert.equal(p.abilityState.berry.id,'sitrusberry');
  turn();assert.equal(p.hp,2000);assert(!p.abilityState.berry);turn();assert.equal(p.hp,2000);
 });
 it('stores only the latest eligible Berry and never loops from its own repeat', () => {
  const [p]=setup();p.hp=1000;p.setItem('sitrusberry');assert(p.eatItem());
  p.setItem('oranberry');assert(p.eatItem());assert.equal(p.abilityState.berry.id,'oranberry');const hp=p.hp;
  turn();assert.equal(p.hp,hp+10);assert(!p.abilityState.berry);turn();assert.equal(p.hp,hp+10);
 });
 it('consumption during residuals waits until the following turn, matching native timing', () => {
  const [p]=setup();p.hp=1000;p.setItem('sitrusberry');assert(!battle.queue.peek());assert(p.eatItem());
  assert.equal(p.abilityState.counter,1);turn();assert.equal(p.hp,3000);assert(!p.abilityState.berry);
 });
});
