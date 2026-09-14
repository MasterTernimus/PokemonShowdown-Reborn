'use strict';

const assert = require('../../assert');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Arcanine-Aevian', function () {
	it('should have its requested profile and learnset', function () {
		const species = Dex.species.get('Arcanine-Aevian');
		assert.deepEqual(species.types, ['Electric', 'Flying']);
		assert.deepEqual(species.baseStats, {hp: 100, atk: 120, def: 75, spa: 100, spd: 75, spe: 130});
		assert.deepEqual(species.abilities, {0: 'Intimidate', 1: 'Storm Power', H: 'Lightning Rod'});

		const learnset = Learnsets.arcanineaevian.learnset;
		for (const move of ['aerialace', 'bravebird', 'extremespeed', 'hurricane', 'risingvoltage', 'thunderbolt', 'uturn', 'voltswitch', 'zapcannon']) {
			assert(learnset[move], `${move} should be in Arcanine-Aevian's learnset`);
		}
	});
});
