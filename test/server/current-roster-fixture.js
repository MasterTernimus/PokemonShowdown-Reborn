'use strict';

const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const approved = require('../sim/abilities/current-roster-approved.json');
const expected = require('../sim/abilities/passive-approval-overlays');

describe('Current reviewed roster fixture', () => {
	for (const [id, slots] of Object.entries(approved.slots)) {
		it(id + ' has its reviewed ability slots', () => {
			for (const [slot, name] of Object.entries(slots)) assert.equal(Dex.species.get(id).abilities[slot], name);
		});
	}
	for (const [id, slots] of Object.entries(approved.exactSlots)) {
		it(id + ' has exactly the reviewed choices', () => assert.deepEqual(Dex.species.get(id).abilities, slots));
	}
	for (const [id, passives] of Object.entries(approved.passives)) {
		it(id + ' has its reviewed passive', () => assert.deepEqual(Dex.species.get(id).passives, passives));
	}
	it('keeps the reviewed stat adjustment', () => {
		for (const [id, stats] of Object.entries(approved.stats)) assert.deepEqual(Dex.species.get(id).baseStats, stats);
	});
	it('does not let one assertion mutate the shared reviewed fixture', () => {
		const before = structuredClone(approved);
		expected.current('garchomp', []).push('invalid');
		expected.abilities('cherrim', {}).H = 'Invalid';
		expected.passives({}).garchomp.push('invalid');
		expected.stats('azumarill', {}).hp = 0;
		assert.deepEqual(approved, before);
	});
});
