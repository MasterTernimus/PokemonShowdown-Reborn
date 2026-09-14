'use strict';

const assert = require('../../assert');
const {Dex} = require('../../../dist/sim');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Roserade-Aevian', function () {
	it('should have its requested profile and categorized learnset', function () {
		const species = Dex.species.get('Roserade-Aevian');
		assert.deepEqual(species.types, ['Ground', 'Fighting']);
		assert.deepEqual(species.baseStats, {hp: 75, atk: 60, def: 75, spa: 125, spd: 115, spe: 90});
		assert.deepEqual(species.abilities, {0: 'Dry Skin', 1: 'Technician', H: 'False Devotion'});

		const learnset = Learnsets.roseradeaevian.learnset;
		assert(learnset.rockthrow.includes('9L1'));
		assert(learnset.earthpower.includes('9E'));
		assert(learnset.earthpower.includes('9M'));
		assert(learnset.closecombat.includes('9L1'));
		assert(learnset.closecombat.includes('9M'));
		assert(learnset.weatherball.includes('9E'));
		assert(learnset.weatherball.includes('9M'));
	});
});
