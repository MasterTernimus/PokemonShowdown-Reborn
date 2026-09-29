'use strict';

const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Skeledirge-Aevian', () => {
	it('uses its own stats, abilities, and requested learnset', () => {
		const species = Dex.species.get('Skeledirge-Aevian');
		assert(species.exists && species.standalone);
		assert.deepEqual(species.types, ['Fairy', 'Poison']);
		assert.deepEqual(species.baseStats, {hp: 90, atk: 50, def: 110, spa: 100, spd: 105, spe: 77});
		assert.equal(species.bst, 532);
		assert.deepEqual(species.abilities, {'0': 'Unaware', '1': 'Misty Surge', H: 'Flash Fire'});
		const learnset = Dex.species.getLearnsetData(species.id).learnset;
		assert.equal(Object.keys(learnset).length, 38);
		assert.deepEqual(learnset.flamethrower, ['9L1', '9M']);
		assert.deepEqual(learnset.venoshock, ['9L25', '9M']);
		assert.deepEqual(learnset.torchsong, ['9L70']);
		assert.deepEqual(learnset.fly, ['9M']);
		assert.equal(learnset.terablast, undefined);
		assert.equal(Dex.species.getFullLearnset(species.id).length, 1);
		for (const move of Object.keys(learnset)) assert(Dex.moves.get(move).exists, move);
	});

	it('allows all ability slots and representative moves in a team', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const ability of Object.values(Dex.species.get('Skeledirge-Aevian').abilities)) {
			assert.equal(validator.validateTeam([
				{species: 'Skeledirge-Aevian', ability, moves: ['Torch Song', 'Strange Steam', 'Toxic Spikes', 'Fly']},
				{species: 'Mew', moves: ['Splash']},
			]), null, ability);
		}
	});
});
