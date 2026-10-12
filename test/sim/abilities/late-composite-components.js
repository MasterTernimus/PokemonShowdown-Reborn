'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(ability, other = 'No Ability') {
 const mon = a => ({species: 'Mew', ability: a, moves: ['splash', 'hypnosis', 'tackle', 'solarbeam']});
 battle = common.createBattle({gameType: 'singles'}, [[mon(ability)], [mon(other)]]);
 if (battle.requestState === 'teampreview') battle.makeChoices();
 battle.field.terrain = '';
 return [battle.p1.active[0], battle.p2.active[0]];
}
function modify(p, q, id) { const m = Dex.getActiveMove(id); battle.runEvent('ModifyMove', p, q, m, m); return m; }
describe('Late composite components preserve full local behavior', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 it('Heat Coil inherits Long Reach contact, accuracy, crit and mountain power', () => {
  const [p, q] = setup('Heat Coil');
  assert.equal(p.boosts.accuracy, 1);
  let move = modify(p, q, 'tackle');
  assert(!move.flags.contact);
  assert(move.ignoreEvasion);
  battle.boost({accuracy: -1}, p, q, Dex.getActiveMove('sandattack'));
  assert.equal(p.boosts.accuracy, 1);
  battle.field.terrain = 'rockyterrain';
  assert.equal(modify(p, q, 'tackle').accuracy, 90);
  battle.field.terrain = 'mountainterrain';
  assert.equal(battle.runEvent('BasePower', p, q, move, 1000), 1500);
  assert.equal(battle.runEvent('ModifyCritRatio', p, q, move, 0), 1);
 });
 it('Heat Coil Long Reach stops through suppression', () => {
  const [p, q] = setup('Heat Coil'); p.addVolatile('gastroacid', q);
  assert(modify(p, q, 'tackle').flags.contact);
 });
 for (const ability of ['Inversion', 'No Ability']) it(ability + ' Hypnosis accuracy is scoped', () => {
  const [p, q] = setup(ability);
  const move = modify(p, q, 'hypnosis');
  assert.equal(move.accuracy, ability === 'Inversion' ? true : 60);
  assert.equal(!!move.infiltrates, ability === 'Inversion');
  assert.equal(Dex.moves.get('hypnosis').accuracy, 60);
 });
 it('Inversion Hypnosis crosses Substitute but still respects Insomnia', () => {
  const [p, q] = setup('Inversion'); q.addVolatile('substitute');
  battle.actions.useMove('hypnosis', p, {target: q}); assert.equal(q.status, 'slp');
  q.cureStatus(); q.setAbility('Insomnia');
  battle.actions.useMove('hypnosis', p, {target: q}); assert.equal(q.status, '');
 });
 it('Inversion suppression restores ordinary Hypnosis and Substitute behavior', () => {
  const [p, q] = setup('Inversion'); p.addVolatile('gastroacid', q);
  assert.equal(modify(p, q, 'hypnosis').accuracy, 60);
  q.addVolatile('substitute'); battle.actions.useMove('hypnosis', p, {target: q}); assert.equal(q.status, '');
 });
 it('Iron Mountain blocks opponent Attack drops without blocking self drops', () => {
  const [p, q] = setup('Iron Mountain');
  battle.boost({atk: -1}, p, q, Dex.getActiveMove('growl')); assert.equal(p.boosts.atk, 0);
  battle.boost({atk: -1}, p, p, Dex.getActiveMove('superpower')); assert.equal(p.boosts.atk, -1);
 });
 it('opposing Mold Breaker bypasses Iron Mountain Hyper Cutter', () => {
  const [p, q] = setup('Iron Mountain', 'Mold Breaker');
  battle.actions.useMove('growl', q, {target: p});
  assert.equal(p.boosts.atk, -1);
 });
 it('Iron Mountain does not gain Mold Breaker and retains its once-turn defense/heal', () => {
  const [p, q] = setup('Iron Mountain', 'Water Absorb');
  assert(!modify(p, q, 'watergun').ignoreAbility);
  const hp = q.hp; battle.actions.useMove('watergun', p, {target: q}); assert.equal(q.hp, hp);
  p.hp = p.maxhp = p.baseMaxhp = 1600; p.hp = 1000;
  const hit = () => battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), {damage: 100, willCrit: false}), q, {target: p});
  hit(); assert.equal(p.boosts.def, 1); assert.equal(p.hp, 1000);
  hit(); assert.equal(p.boosts.def, 1); assert.equal(p.hp, 900);
 });
 for (const ability of ['Serene Grace', 'No Ability']) it(ability + ' actual Solar Beam charge behavior', () => {
  const [p, q] = setup(ability); const hp = q.hp;
  battle.actions.useMove('solarbeam', p, {target: q});
  assert.equal(q.hp < hp, ability === 'Serene Grace');
  assert.equal(!!p.volatiles.twoturnmove, ability !== 'Serene Grace');
 });
});
