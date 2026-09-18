'use strict';

const assert = require('../../assert');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Chandelure-Aevian', function () {
	it('has the requested regional profile', function () {
		const species = Dex.species.get('Chandelure-Aevian');
		assert.deepEqual(species.types, ['Ghost', 'Electric']);
		assert.deepEqual(species.baseStats, {hp: 85, atk: 50, def: 90, spa: 145, spd: 90, spe: 80});
		assert.deepEqual(species.abilities, {0: 'Illuminate', 1: 'Levitate', H: 'Magic Guard'});
	});

	it('uses only its regional learnset', function () {
		const learnset = Learnsets.chandelureaevian.learnset;
		for (const move of ['allyswitch', 'discharge', 'nuzzle', 'risingvoltage', 'spikes', 'voltswitch', 'zapcannon']) {
			assert(learnset[move], `${move} should be in Chandelure-Aevian's learnset`);
		}
		for (const move of ['flamethrower', 'energyball', 'inferno', 'trickortreat']) {
			assert(!learnset[move], `${move} should not be inherited from Chandelure`);
		}
	});
});
