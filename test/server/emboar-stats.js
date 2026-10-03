const assert = require('assert').strict;
const { Dex } = require('../../dist/sim/dex');
describe('Approved base Emboar stats', () => {
	it('redistributes both bases and preserves both Megas', () => {
		for (const id of ['emboar', 'emboaralt']) {
			const s = Dex.species.get(id);
			assert.deepEqual(s.baseStats, { "hp": 110, "atk": 123, "def": 75, "spa": 80, "spd": 75, "spe": 65 });
			assert.equal(s.bst, 528);
			assert.deepEqual(s.abilities, { 0: 'Gluttony', 1: 'Thick Fat', H: 'Brute Force' });
		}
		for (const id of ['emboarmega', 'emboarmegaalt']) {
			const s = Dex.species.get(id);
			assert.deepEqual(s.baseStats, { hp: 110, atk: 150, def: 93, spa: 85, spd: 115, spe: 75 });
			assert.equal(s.bst, 628);
			assert.deepEqual(s.abilities, { 0: 'Burning Ego' });
		}
	});
});
