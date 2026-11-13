'use strict';
const assert=require('assert').strict;
const {Dex,TeamValidator}=require('../../../dist/sim');
const before=require('./thematic-selected-slots.json');
describe('Approved Levitate selected-slot replacements',()=>{
	for (const [id, old] of Object.entries(before))it(id + ' validates the reviewed selected slots separately from Levitate', () => {
		const species = Dex.species.get(id);
		const rotom = ['rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow'].includes(id);
		const expectedAbilities = rotom ? (id === 'rotomfan' ? { 0: 'Eject', 1: 'Windy Surge', H: 'Air Lock' } : { ...old.abilities, 0: 'Eject' }) : { ...old.abilities, [old.slot]: old.replacement };
		if (id === 'claydol') expectedAbilities[0] = 'Misaligned Stars';
		assert.deepEqual(species.abilities, expectedAbilities);
  assert.deepEqual(species.baseStats,old.baseStats);assert.deepEqual(species.types,old.types);assert.deepEqual(species.passives,['levitate']);
  const validator=new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities');
		const set = { species: species.name, ability: id === 'claydol' ? 'Misaligned Stars' : rotom ? 'Eject' : old.replacement, moves: ['tackle'], nature: 'Serious', evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 } };
  const errors=validator.validateSet(set);assert(!errors?.length,JSON.stringify(errors));
  const invalid=validator.validateSet({...set,ability:'Levitate'});assert(invalid?.some(x=>/can't have Levitate/.test(x)),JSON.stringify(invalid));
  const metadata=require('../../../dist/sim/custom-calculator').calculatorMetadata().species.find(s=>s.name===species.name);assert.deepEqual(metadata.abilities,species.abilities);assert.deepEqual(metadata.passives,['levitate']);
 });
 it('preserves useful existing selected slots and excluded earlier stages',()=>{
  for(const id of ['eelektross','weezing','weezinggalar'])assert(Object.values(Dex.species.get(id).abilities).includes('Elevate'),id);
  for(const[id,ability]of [['chimecho','Temple Chime'],['mismagius','Void Crossing'],['solrock','Solar Idol'],['lunatone','Lunar Idol']])assert(Object.values(Dex.species.get(id).abilities).includes(ability),id);
		assert.deepEqual(Dex.species.get('hydreigon').abilities, { 0: 'Dark Aura', 1: 'Strings of Ruin', H: 'False Liberation' }); assert.deepEqual(Dex.species.get('hydreigon').passives, ['hydraflight']);
		assert.deepEqual(Dex.species.get('dusclops').passives, ['unnerve']);
		for (const id of ['chingling', 'vibrava'])assert.deepEqual(Dex.species.get(id).passives, []);
 });
});
