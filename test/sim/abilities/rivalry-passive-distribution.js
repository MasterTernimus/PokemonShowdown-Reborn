'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../../dist/sim');
const { SpeciesPassives } = require('../../../dist/data/species-passives');
const selected = {
 luxray: {0: 'Strong Jaw', 1: 'Galvanize', H: 'Intimidate'},
 beautifly: {0: 'Windy Surge', 1: 'Pastel Sanctuary', H: 'Gale Bloom'},
 dustox: {0: 'Night Forager', 1: 'Unaware', H: 'Toxic Cocoon'},
 pyroar: {0: 'Fire Mane', 1: 'Royal Decree', H: 'Pridecall'},
 unfezant: {0: 'Unova Wing', 1: 'Aevian Wing'},
 unfezantrejuv: {0: 'Unova Wing', 1: 'Aevian Wing'},
 haxorus: {0: 'Sharpness', 1: 'Raging Storm', H: 'Supreme Overlord'},
};

describe('Approved Rivalry passive replacements', () => {
 it('Beautifly redistributes 25 Special Attack into 10 Attack and 15 Defense, preserving BST', () => {
  const species = Dex.species.get('beautifly');
  assert.deepEqual(species.baseStats, {hp:80, atk:50, def:85, spa:125, spd:75, spe:115});
  assert.equal(species.bst, 530);
 });
 for (const [id, abilities] of Object.entries(selected)) {
  it(id + ' has exactly Rivalry without changing selected abilities', () => {
   assert.deepEqual(SpeciesPassives[id], ['rivalry']);
   assert.deepEqual(Dex.species.get(id).passives, ['rivalry']);
   assert.deepEqual(Dex.species.get(id).abilities, abilities);
  });
  it(id + ' supplies Rivalry as an active species passive', () => {
   const b = new Battle({formatid: 'gen9nofieldsinglesgame', p1: {name: 'A', team: [{species: id, ability: abilities[0], moves: ['splash']}]}, p2: {name: 'B', team: [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]}});
   try {
    if (b.requestState === 'teampreview') b.makeChoices('team 1', 'team 1');
    assert.deepEqual(b.p1.active[0].getPassives(), ['rivalry']);
   } finally {b.destroy();}
  });
 }
 for (const species of ['Pyroar', 'Unfezant', 'Unfezant-Rejuv']) for (const gender of ['M', 'F']) {
  it(species + ' ' + gender + ' uses the same passive through gender artwork', () => {
   const abilities = selected[Dex.toID(species)];
   const regional = species === 'Unfezant-Rejuv';
   const b = new Battle({formatid: 'gen9nofieldsinglesgame', p1: {name: 'A', team: [{species: regional ? 'Unfezant' : species, gender, ability: regional ? 'Aevian Wing' : abilities[0], moves: ['splash']}]}, p2: {name: 'B', team: [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]}});
   try {
    if (b.requestState === 'teampreview') b.makeChoices('team 1', 'team 1');
    assert.equal(b.p1.active[0].gender, gender);
    assert.equal(b.p1.active[0].species.id, Dex.toID(species));
    if (regional) {
     assert.equal(b.p1.active[0].ability, 'aevianwing');
     assert.equal(b.p1.active[0].species.requiredAbility, 'Aevian Wing');
    }
    assert.deepEqual(b.p1.active[0].getPassives(), ['rivalry']);
   } finally {b.destroy();}
  });
 }
 it('Mega Haxorus retains Twin Fang and its selected ability', () => {
  const mega = Dex.species.get('haxorusmega');
  assert.deepEqual(mega.passives, ['twinfang']);
  assert.deepEqual(mega.abilities, {0: 'Raging Overlord'});
  assert(!mega.passives.includes('rivalry'));
 });
 it('retains existing users and excludes distinct battle forms and pre-evolutions', () => {
  assert.deepEqual(Dex.species.all().filter(s => s.passives.includes('rivalry')).map(s => s.id).sort(), ['beautifly', 'braviary', 'braviaryhisui', 'delcatty', 'dustox', 'haxorus', 'luxray', 'mandibuzz', 'mightyena', 'mightyenadeso', 'mightyenagrim', 'nidoking', 'nidoqueen', 'pyroar', 'scrafty', 'unfezant', 'unfezantrejuv']);
  for (const id of ['shinx', 'luxio', 'wurmple', 'silcoon', 'litleo', 'pidove', 'tranquill', 'luxraymega', 'pyroarmega']) assert(!Dex.species.get(id).passives.includes('rivalry'), id);
 });
});
