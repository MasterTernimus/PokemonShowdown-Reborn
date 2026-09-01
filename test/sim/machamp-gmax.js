'use strict';

const assert = require('./../assert');
const {Dex} = require('../../dist/sim/dex');

Dex.includeData();

describe('Machamp-Gmax Raging Fists', function () {
	it('uses Raging Fists as its hidden ability', function () {
		const machamp = Dex.species.get('Machamp-Gmax');
		assert.equal(machamp.abilities.H, 'Raging Fists');
	});

	it('describes Fighting Fiend instead of Skill Link', function () {
		const ability = Dex.abilities.get('Raging Fists');
		assert.equal(ability.desc, "This Pokemon has Hydra Bond, Fighting Fiend, and Scrappy's effects.");
		assert.equal(ability.shortDesc, 'Hydra Bond + Fighting Fiend + Scrappy.');
		assert(!ability.desc.includes('Skill Link'));
		assert(!ability.shortDesc.includes('Skill Link'));
	});
});
