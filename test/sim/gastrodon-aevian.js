'use strict';

const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Standalone Aevian Gastrodon profiles', () => {
	it('keeps regular Gastrodon separate and gives West and East 500 BST', () => {
		const regular = Dex.species.get('Gastrodon');
		assert.deepEqual(regular.types, ['Water', 'Ground']);
		assert(!regular.cosmeticFormes.includes('Gastrodon-Aevian'));
		assert(!regular.cosmeticFormes.includes('Gastrodon-East-Aevian'));
		for (const [name, hidden] of [
			['Gastrodon-Aevian', 'Poison Heal'],
			['Gastrodon-East-Aevian', 'Flare Boost'],
		]) {
			const species = Dex.species.get(name);
			assert(species.exists && species.standalone);
			assert.equal(species.baseSpecies, name);
			assert.equal(species.isCosmeticForme, undefined);
			assert.deepEqual(species.types, ['Ground', 'Fairy']);
			assert.deepEqual(species.baseStats, {hp: 118, atk: 83, def: 77, spa: 92, spd: 91, spe: 39});
			assert.equal(species.bst, 500);
			assert.deepEqual(species.abilities, {'0': 'Storm Drain', '1': 'Liquid Ooze', H: hidden});
		}
	});

	it('gives both profiles the same 67 moves without inheriting the regular water learnset', () => {
		const west = Dex.data.Learnsets.gastrodonaevian.learnset;
		const east = Dex.data.Learnsets.gastrodoneastaevian.learnset;
		assert.equal(Object.keys(west).length, 67);
		assert.deepEqual(east, west);
		for (const name of ['Gastrodon-Aevian', 'Gastrodon-East-Aevian']) {
			assert.equal(Dex.species.getFullLearnset(Dex.species.get(name).id).length, 1);
		}
		for (const id of ['arenitewall', 'strangesteam', 'hiddenpower', 'fairywind', 'earthpower']) {
			assert.deepEqual(west[id], ['9M']);
		}
		for (const id of Object.keys(west)) assert(Dex.moves.get(id).exists, id);
		assert(!west.surf);
	});

	it('validates each ability slot and the requested Hidden Power exception', () => {
		const validator = TeamValidator.get('gen9nofieldsinglesgame');
		for (const name of ['Gastrodon-Aevian', 'Gastrodon-East-Aevian']) {
			for (const ability of Object.values(Dex.species.get(name).abilities)) {
				assert.equal(validator.validateTeam([
					{species: name, ability, moves: ['Arenite Wall', 'Hidden Power', 'Strange Steam', 'Earth Power']},
					{species: 'Mew', moves: ['Splash']},
				]), null, `${name}: ${ability}`);
			}
		}
		assert(validator.validateTeam([
			{species: 'Gastrodon', moves: ['Hidden Power']},
			{species: 'Mew', moves: ['Splash']},
		]).some(error => error.includes('Hidden Power is unavailable')));
	});
});
