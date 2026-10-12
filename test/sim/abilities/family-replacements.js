'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
const mon = (species = 'Mew', ability = 'No Ability') => ({species, ability, moves: ['tackle', 'splash', 'protect', 'waterpulse']});
function setup(species = 'Kangaskhan-Mega', ability = 'Family Guardian') {
 battle = common.createBattle({gameType: 'doubles'}, [[mon(species, ability), mon(), mon()], [mon(), mon()]]);
 if (battle.requestState === 'teampreview') battle.makeChoices();
 battle.field.terrain = '';
 for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 1000;
 battle.randomizer = n => n;
 return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
}
function hit(source, target, extra = {}) {
 battle.actions.runMove(Object.assign(Dex.getActiveMove('tackle'), {accuracy: true, willCrit: false, secondaries: null, damage: 100}, extra), source, source.getLocOf(target));
}
describe('Approved family replacements', () => {
 afterEach(() => {battle?.destroy(); battle = null;});
 it('changes only the approved selected slots and passives', () => {
  for (const [id, ability, passive] of [['slowbrogalar', 'Shellder Artillery', 'quickdraw'], ['sinistcha', 'Tea Ceremony', 'hospitality'], ['sinistchamasterpiece', 'Tea Ceremony', 'hospitality'], ['kangaskhanmega', 'Family Guardian', 'parentalbond']]) {
   const species = Dex.species.get(id); assert.equal(species.abilities[0], ability); assert.deepEqual(species.passives, [passive]);
  }
  assert.deepEqual(Dex.species.get('slowbrogalar').abilities, {0: 'Shellder Artillery', 1: 'Caustic Chamber', H: 'Regenerator'});
  for (const id of ['sinistcha', 'sinistchamasterpiece']) assert.deepEqual(Dex.species.get(id).abilities, {0: 'Tea Ceremony', 1: 'Second Brew', H: 'Heatproof'});
  assert.notEqual(Dex.species.get('kangaskhan').abilities[0], 'Family Guardian');
 });
 for (const self of [false, true]) it('rescues surviving ' + (self ? 'self' : 'adjacent ally') + ' after all hits once per entry', () => {
  const [p, a, q] = setup(), target = self ? p : a; target.hp = 650;
  const during = []; hit(q, target, {multihit: 3, onAfterHit() {during.push(target.hp);}});
  assert.deepEqual(during, [550, 450, 350]); assert.equal(target.hp, 600); assert(p.m.familyGuardianUsed);
  p.setAbility('No Ability'); p.setAbility('Family Guardian'); target.hp = 550; hit(q, target); assert.equal(target.hp, 450);
 });
 for (const kind of ['friendly', 'residual', 'substitute', 'faint', 'alreadyLow', 'suppressed']) it('excludes ' + kind, () => {
  const [p, a, q] = setup(); a.hp = kind === 'alreadyLow' ? 400 : 550;
  if (kind === 'substitute') {a.addVolatile('substitute'); a.volatiles.substitute.hp = 999;}
  if (kind === 'suppressed') p.addVolatile('gastroacid', q);
  if (kind === 'residual') battle.damage(100, a, q, Dex.conditions.get('psn'));
  else hit(kind === 'friendly' ? p : q, a, {damage: kind === 'faint' ? 600 : 100});
  assert(!p.m.familyGuardianUsed);
 });
 it('Heal Block prevents rescue without spending its shared budget', () => {
  const [p, a, q] = setup(); a.hp = 550; a.addVolatile('healblock', q); hit(q, a);
  assert.equal(a.hp, 450); assert(!p.m.familyGuardianUsed);
  a.removeVolatile('healblock'); p.hp = 550; hit(q, p); assert.equal(p.hp, 700); assert(p.m.familyGuardianUsed);
 });
 it('genuine switching refreshes the rescue budget', () => {
  const [p, a, q] = setup(); a.hp = 550; hit(q, a); assert(p.m.familyGuardianUsed);
  battle.actions.switchIn(battle.p1.pokemon[2], 0); battle.actions.switchIn(p, 0);
  assert(!p.m.familyGuardianUsed); a.hp = 550; hit(q, a); assert.equal(a.hp, 700);
 });
 it('does not treat other Free-for-All players as allies', () => {
  battle = common.createBattle({formatid: 'gen9freeforall4pfactoryfield'}, [[mon('Kangaskhan-Mega', 'Family Guardian')], [mon()], [mon()], [mon()]]);
  if (battle.requestState === 'teampreview') battle.makeChoices();
  battle.field.terrain = '';
  const [p, a, q] = battle.sides.map(side => side.active[0]);
  for (const side of battle.sides) {const pokemon = side.active[0]; pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 1000;}
  assert.equal(battle.runEvent('ModifyDamage', q, a, Dex.getActiveMove('tackle'), 100), 100);
  a.hp = 550; hit(q, a); assert.equal(a.hp, 450); assert(!p.m.familyGuardianUsed);
  p.hp = 550; hit(q, p); assert.equal(p.hp, 700); assert(p.m.familyGuardianUsed);
 });
 it('keeps full Friend Guard and Healer without protecting the holder', () => {
  const [p, a, q] = setup(); const move = Dex.getActiveMove('tackle');
  assert.equal(battle.runEvent('ModifyDamage', q, a, move, 100), 75);
  assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), 100);
  a.setStatus('psn', q); battle.randomChance = () => true;
  battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(a.status, '');
 });
 it('preserves the Parental Bond passive under suppression with exactly two 80% hits', () => {
  const [p, a, q] = setup(); p.addVolatile('gastroacid', q); const damages = [];
  battle.onEvent('ModifyDamage', battle.format, -9, (damage, source) => {if (source === p) damages.push(damage);});
  hit(p, q, {damage: undefined}); assert.equal(damages.length, 2); assert(Math.abs(damages[1] - damages[0] * 0.8) <= 2);
 });
 it('does not double the passive when selected Parental Bond is copied onto it', () => {
  const [p, a, q] = setup(); p.setAbility('Parental Bond'); let hits = 0;
  hit(p, q, {onAfterHit() {hits++;}}); assert.equal(hits, 2);
 });
 it('Transform acquires the target form Parental Bond passive', () => {
  const [p, a, q] = setup(); assert(q.transformInto(p));
  assert.deepEqual(q.getPassives(), ['parentalbond']); assert.equal(q.ability, 'familyguardian');
  let hits = 0; hit(q, a, {onAfterHit() {hits++;}}); assert.equal(hits, 2);
 });
 it('copying Family Guardian alone does not grant Parental Bond', () => {
  const [p, a, q] = setup(); q.setAbility('Family Guardian');
  assert(!q.getPassives().includes('parentalbond')); assert(!q.hasAbility('parentalbond'));
  let hits = 0; hit(q, a, {onAfterHit() {hits++;}}); assert.equal(hits, 1);
 });
 it('retains Parental Bond exclusions and Ghost immunity', () => {
  const [p, a, q] = setup(); q.setType('Ghost'); hit(p, q); assert.equal(q.hp, 1000); q.setType('Normal');
  let hits = 0; hit(p, q, {flags: {noparentalbond: 1}, onAfterHit() {hits++;}}); assert.equal(hits, 1);
 });
 it('Shellder Artillery keeps pulse and bullet bonuses and Oblivious', () => {
  const [p, a, q] = setup('Slowbro-Galar', 'Shellder Artillery');
  for (const id of ['waterpulse', 'sludgebomb']) assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(id), 100), 150);
  assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
  battle.actions.useMove('taunt', q, {target: p}); assert(!p.volatiles.taunt);
  p.addVolatile('gastroacid', q); assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('waterpulse'), 100), 100);
  battle.randomChance = () => true; assert.equal(battle.runEvent('FractionalPriority', p, q, Dex.getActiveMove('waterpulse'), 0), 0.1);
 });
 for (const species of ['Sinistcha', 'Sinistcha-Masterpiece']) it(species + ' has item protection, ally Aroma Veil and independent Hospitality', () => {
  const [p, a, q] = setup(species, 'Tea Ceremony'); p.setItem('Leftovers');
  battle.actions.useMove('knockoff', q, {target: p}); assert.equal(p.item, 'leftovers');
  battle.actions.useMove('taunt', q, {target: a}); assert(!a.volatiles.taunt);
  p.addVolatile('gastroacid', q); a.hp = 500;
  const {passiveEffect, passiveState} = require('../../../dist/sim/species-passives');
  battle.singleEvent('SwitchIn', passiveEffect(battle, 'hospitality'), passiveState(p, 'hospitality'), p);
  assert.equal(a.hp, 750);
 });
});
