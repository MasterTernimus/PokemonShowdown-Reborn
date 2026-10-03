'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {AbilityComponents} = require('../../../dist/data/ability-components');
describe('October audit follow-up', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 function setup(ability) {
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
   [{species: 'Venusaur', ability, moves: ['icebeam', 'splash']}],
   [{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
  ]);
  battle.makeChoices('team 1', 'team 1');
  return battle.p1.active[0];
 }
 it('recognizes nested Thick Fat without doubling Proficient and respects suppression', () => {
  const p = setup('Toxic Bloom'), foe = battle.p2.active[0];
  const stats = {def: p.getStat('def'), spd: p.getStat('spd'), spe: p.getStat('spe')};
  assert(p.hasAbility('thickfat')); assert(p.hasAbility('proficient'));
  assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('razorleaf'), 100), 130);
  battle.field.setTerrain('coldeclipseterrain', p);
  assert.equal(p.getStat('def'), Math.floor(stats.def * 1.5));
  assert.equal(p.getStat('spd'), Math.floor(stats.spd * 1.5));
  assert.equal(p.getStat('spe'), stats.spe);
  p.addVolatile('gastroacid');
  assert(!p.hasAbility('thickfat')); assert.equal(p.getStat('def'), stats.def);
  assert.equal(p.getStat('spe'), Math.floor(stats.spe * 0.75));
 });
 it('terminates a component cycle and does not invent missing identities', () => {
  const p = setup('Toxic Bloom'), prior = AbilityComponents.selfsufficient;
  try {
   AbilityComponents.selfsufficient = ['toxicbloom'];
   assert(p.hasAbility('thickfat')); assert(!p.hasAbility('levitate'));
  } finally {
   if (prior === undefined) delete AbilityComponents.selfsufficient;
   else AbilityComponents.selfsufficient = prior;
  }
 });
 for (const layers of [1, 3]) it('publishes correct hazard removals for ' + layers + ' Spikes layers', () => {
  const p = setup('Rimebreaker');
  p.side.addSideCondition('stealthrock', battle.p2.active[0]);
  for (let i = 0; i < layers; i++) p.side.addSideCondition('spikes', battle.p2.active[0]);
  const start = battle.log.length;
  battle.makeChoices('move icebeam', 'move splash');
  const log = battle.log.slice(start);
  assert(!p.side.sideConditions.stealthrock);
  assert.equal(p.side.sideConditions.spikes?.layers || 0, layers - 1);
  assert.equal(log.filter(x => x.includes('|-sideend|p1:') && x.includes('Stealth Rock')).length, 1);
  assert.equal(log.filter(x => x.includes('|-sideend|p1:') && x.includes('Spikes')).length, 1);
  assert.equal(log.filter(x => x.includes('|-sidestart|p1:') && x.includes('Spikes')).length, layers - 1);
 });
 it('gives corrected abilities unique numeric IDs and current-generation metadata', () => {
  for (const id of ['nightmarepulse', 'solartrap', 'soulcremation']) {
   const ability = Dex.abilities.get(id);
   assert.equal(ability.gen, 9);
   assert.deepEqual(Dex.abilities.all().filter(a => a.num === ability.num).map(a => a.id), [id]);
  }
 });
});
