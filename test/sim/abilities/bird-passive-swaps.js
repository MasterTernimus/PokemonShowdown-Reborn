'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
describe('Corviknight and Mega Dragonite passive swaps', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function setup(species) {
  battle = common.createBattle({}, [[{species, ability: 'No Ability', moves: ['splash']}], [{species: 'Mew', ability: 'No Ability', moves: ['tackle']}]]);
  if (battle.requestState === 'teampreview') battle.makeChoices();
  battle.field.terrain = '';
  return [battle.p1.active[0], battle.p2.active[0]];
 }
 it('Corviknight reflects opposing drops and applies Mirror Armor damage reduction', () => {
  const [p, q] = setup('Corviknight');
  assert.deepEqual(p.getPassives(), ['mirrorarmor']);
  battle.boost({atk: -1}, p, q, Dex.abilities.get('intimidate'));
  assert.equal(p.boosts.atk, 0); assert.equal(q.boosts.atk, -1);
  assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 80);
 });
 it('Mega Dragonite halves damage at full HP only', () => {
  const [p, q] = setup('Dragonite-Mega');
  assert.deepEqual(p.getPassives(), ['multiscale']);
  assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 50);
  p.hp--;
  assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
 });
 it('preserves the later approved Dragonite passive and G-Max Corviknight passive', () => {
  assert.deepEqual(Dex.species.get('dragonite').passives, ['championscommand']);
  assert.deepEqual(Dex.species.get('corviknightgmax').passives, ['swornduty']);
 });
});
