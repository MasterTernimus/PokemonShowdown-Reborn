'use strict';

const assert = require('./../assert');
const {Dex} = require('../../dist/sim/dex');

Dex.includeData();

describe('Machamp-Gmax Raging Fists', function () {
	it('uses Raging Fists as its primary ability', function () {
		const machamp = Dex.species.get('Machamp-Gmax');
		assert.equal(machamp.abilities[0], 'Raging Fists');
	});

	it('describes Hydra Bond, Ghost bypass and damaging-only accuracy', function () {
		const ability = Dex.abilities.get('Raging Fists');
		assert(ability.desc.includes('damaging moves cannot miss'));
		assert(ability.desc.includes('Status moves retain their normal accuracy'));
		assert.equal(ability.shortDesc, 'Hydra Bond; Normal/Fighting hits Ghosts; damaging moves cannot miss.');
		assert(!ability.desc.includes('Skill Link'));
		assert(!ability.shortDesc.includes('Skill Link'));
	});
});
