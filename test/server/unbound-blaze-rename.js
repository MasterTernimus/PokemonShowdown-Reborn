'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim/dex');
const {getAbilityDisplayComponents} = require('../../dist/data/ability-display');
const {getAbilityMechanicsHTML} = require('../../dist/server/ability-lookup');
describe('Unbound Blaze rename', function () {
 this.timeout(10000);
 it('resolves the new name and legacy name to one canonical ability', () => {
  const ability = Dex.abilities.get('Unbound Blaze');
  assert(ability.exists);
  assert.equal(ability.id, 'unboundblaze');
  assert.equal(ability.name, 'Unbound Blaze');
  assert.equal(Dex.abilities.get('Wildfire Core'), ability);
  assert.equal(Dex.abilities.get('wildfirecore'), ability);
  assert.equal(ability.num, 10139);
 });
 it('assigns the visible new name to both base Charizard variants', () => {
  const holders = Dex.species.all().filter(s => Object.values(s.abilities).includes('Unbound Blaze'));
  assert(holders.some(s => s.id === 'charizard'));
  assert.equal(holders.length, 2);
  assert(!Dex.species.all().some(s => Object.values(s.abilities).includes('Wildfire Core')));
 });
 it('shows the new component in all three nested Charizard packages', () => {
  for (const id of ['atrocity', 'sunsovereign', 'burningcrown']) {
   const ability = Dex.abilities.get(id);
   assert(getAbilityDisplayComponents(id).includes('unboundblaze'), id);
   assert(!ability.shortDesc.includes('Unbound Blaze'), id);
   assert(!ability.desc.includes('Wildfire Core'), id);
   assert(getAbilityMechanicsHTML(ability, Dex).includes('/dt Unbound Blaze, gen9'), id);
  }
 });
});
