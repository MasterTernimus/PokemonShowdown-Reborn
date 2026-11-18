'use strict';

const assert = require('node:assert/strict');
const { calculateScenario } = require('../../dist/sim/custom-calculator');

describe('Black Testament calculator type', () => {
	function calculate(species, overrides = {}, scenario = {}) {
		const mew = { species: 'Mew', ability: 'No Ability' };
		return calculateScenario({
			format: 'gen9nofieldsinglesgame', samples: 8, seed: 42, move: 'Black Testament',
			actors: [{ species, ability: 'No Ability', ...overrides }, mew, mew, mew], ...scenario,
		}, false);
	}

	for (const [species, type] of [['Seviper', 'Poison'], ['Chandelure', 'Fire'], ['Honchkrow', 'Flying']]) {
		it(`reports ${species}'s actual ${type} attack`, () => {
			assert.equal(calculate(species).moveType, type);
		});
	}

	it('reflects a type-changing ability and leaves powered replacements unlabelled', () => {
		assert.equal(calculate('Seviper', { ability: 'Normalize' }).moveType, 'Normal');
		assert.equal(calculate('Seviper', { item: 'Normalium Z' }, { attackMode: 'z' }).moveType, undefined);
		assert.equal(calculate('Seviper', {}, { move: 'Tackle' }).moveType, undefined);
	});

	it('omits the type when sleep prevents every execution', () => {
		const result = calculate('Seviper', { status: 'slp' });
		assert.equal(result.results[1].damagingSamples, 0);
		assert.equal(result.moveType, undefined);
	});
});
