'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');

describe('Kingler Water/Steel refinement', () => {
 let battle;
 afterEach(() => { battle?.destroy(); });
 function setup() {
  battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
   [{species: 'Kingler', ability: 'Titan Pincer', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
   [{species: 'Mew', ability: 'No Ability', moves: ['splash']}, {species: 'Mew', ability: 'No Ability', moves: ['splash']}],
  ]);
  battle.makeChoices('team 1, 2', 'team 1, 2');
  return battle.p1.active[0];
 }
 function modified(id, source) {
  const move = battle.dex.getActiveMove(id);
  return battle.runEvent('ModifyMove', source, battle.p2.active[0], move, move);
 }
 it('assigns defensive and offensive alternatives without changing Gmax', () => {
  const kingler = Dex.species.get('Kingler');
  assert.deepEqual(kingler.types, ['Water', 'Steel']);
  assert.deepEqual(kingler.abilities, {0: 'Shell Armor', 1: 'Titan Pincer', H: 'Shellcracker'});
  assert.deepEqual(Dex.species.get('Kingler-Gmax').types, ['Water', 'Bug']);
  assert.equal(Dex.species.get('Kingler-Gmax').abilities[0], 'Tidal Dominion');
 });
 it('uses stronger Defense for Crabhammer and physical Steel but not special Steel or other attacks', () => {
  const p = setup(); p.storedStats.def = 500; p.storedStats.atk = 100;
  for (const id of ['crabhammer', 'ironhead', 'metalclaw']) assert.equal(modified(id, p).overrideOffensiveStat, 'def');
  for (const id of ['flashcannon', 'waterfall', 'bodyslam']) assert.notEqual(modified(id, p).overrideOffensiveStat, 'def');
 });
 it('retains Attack when higher or tied, and considers current defensive stages', () => {
  const p = setup(); p.storedStats.def = 100; p.storedStats.atk = 200;
  for (const id of ['crabhammer', 'ironhead']) assert.notEqual(modified(id, p).overrideOffensiveStat, 'def');
  p.storedStats.def = 200;
  assert.notEqual(modified('ironhead', p).overrideOffensiveStat, 'def');
  p.boosts.def = 1;
  assert.equal(modified('ironhead', p).overrideOffensiveStat, 'def');
 });
 it('retains Hyper Cutter protection against opposing Attack drops', () => {
  const p = setup();
  battle.boost({atk: -1}, p, battle.p2.active[0], battle.dex.abilities.get('intimidate'));
  assert.equal(p.boosts.atk, 0);
  battle.boost({atk: -1}, p, p, battle.dex.moves.get('superpower'));
  assert.equal(p.boosts.atk, -1);
 });
});
