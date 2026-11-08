'use strict';

const assert = require('./../assert');
const {Dex} = require('../../dist/sim/dex');

Dex.includeData();

describe('Machamp-Gmax and legacy Raging Fists', () => {
	it("uses Titan's Knuckles as its primary ability", () => {
		const machamp = Dex.species.get('Machamp-Gmax');
		assert.equal(machamp.abilities[0], "Titan's Knuckles");
	});

	it('describes Hydra Bond, Ghost bypass and damaging-only accuracy', function () {
		const ability = Dex.abilities.get('Raging Fists');
		assert(ability.desc.includes('damaging moves cannot miss'));
		assert(ability.desc.includes('Status moves retain their normal accuracy'));
		assert.equal(ability.shortDesc, 'Normal/Fighting hits Ghosts; damaging moves cannot miss.');
		assert(!ability.desc.includes('Skill Link'));
		assert(!ability.shortDesc.includes('Skill Link'));
	});
});
