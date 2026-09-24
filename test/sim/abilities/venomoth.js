'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Venomoth', () => {
	it('has 520 BST, Psychic Surge, and Expanding Force', () => {
		const species = Dex.species.get('Venomoth');
		assert.deepEqual(species.baseStats, {hp: 70, atk: 65, def: 75, spa: 115, spd: 90, spe: 105});
		assert.equal(Object.values(species.baseStats).reduce((sum, stat) => sum + stat, 0), 520);
		assert.equal(species.abilities.H, 'Psychic Surge');
		assert(!Object.values(species.abilities).includes('Shield Dust'));
		assert.deepEqual(Learnsets.venomoth.learnset.expandingforce, ['9M']);
	});

	it('sets Psychic Terrain with its new ability', () => {
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Venomoth', ability: 'Psychic Surge', moves: ['expandingforce']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.field.terrain, 'psychicterrain');
		} finally {
			battle.destroy();
		}
	});
});
