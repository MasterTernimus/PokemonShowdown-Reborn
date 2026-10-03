'use strict';
const assert = require('../assert'), { Dex } = require('../../dist/sim/dex');
describe('Dragon Dive learnsets', () => {
	for (const species of ['Dragonair', 'Dragonite'])it(`${species} has current-generation Dive and validates`, () => {
		assert(Dex.species.getLearnsetData(toID(species)).learnset.dive.includes('9M'));
		assert.legalTeam([{ species, ability: Dex.species.get(species).abilities[0], moves: ['dive'], nature: 'Serious' }], 'gen9nofieldsinglesgame');
	});
	it('preserves Dragonite historical sources and does not teach Dratini', () => {
		assert.deepEqual(Dex.species.getLearnsetData('dragonite').learnset.dive, ['9M', '8M', '6M', '5M', '4T', '3M']); assert(!Dex.species.getLearnsetData('dratini').learnset.dive);
	});
});
