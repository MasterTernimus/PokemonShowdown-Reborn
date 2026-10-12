'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { SpeciesPassives } = require('../../../dist/data/species-passives');
const { StarterPassives, StarterFamilies, ProficientPassiveForms } = require('../../../dist/data/starter-passives');
const before = require('./passive-overlap-before.json');
const replacements = require('./approved-passive-replacements.json');
describe('Approved 38 standalone passive-slot replacements', () => {
	it('keeps exactly 839 approved nonempty passive holders, 76 family forms, and 34 Proficient forms', () => {
		const expectedPassives = require('./passive-approval-overlays').passives({...require('./latest-passives-approved.json').previousPassives});
		assert.deepEqual(SpeciesPassives, expectedPassives);
		assert.equal(Object.keys(SpeciesPassives).length, 839);
		assert.equal(Object.values(SpeciesPassives).filter(p => p.length).length, 839);
		assert.equal(Object.keys(StarterPassives).length, 76); assert.equal(ProficientPassiveForms.size, 34);
		for (const [family, ids] of Object.entries(StarterFamilies)) for (const id of ids) assert.deepEqual(Dex.species.get(id).passives, ProficientPassiveForms.has(id) ? ['proficient'] : [family]);
		assert.equal(replacements.length, 38);
	});
	for (const r of replacements) it(r.id + ' slot ' + r.slot + ': ' + r.before + ' to ' + r.after, () => {
		const old = before.find(s => s.id === r.id), current = Dex.species.get(r.id);
		const expected = Object.fromEntries(old.slots.map(s => [s.slot, s.name]));
		assert.equal(expected[r.slot], r.before); expected[r.slot] = r.after;
		if (r.id === 'butterfree') expected[0] = 'Gentle Scales';
		assert.deepEqual(current.abilities, require('./passive-approval-overlays').abilities(r.id, expected)); assert.deepEqual(current.passives, require('./passive-approval-overlays').current(r.id, r.id === 'butterfree' ? ['shielddust'] : old.passives));
	});
	it('leaves every other audited selected slot unchanged', () => {
		for (const row of before) for (const slot of row.slots) {
			if ((row.id === 'butterfree' && slot.slot === '0') || (row.id === 'grimer' && slot.slot === '1')) continue;
			if (replacements.some(r => r.id === row.id && r.slot === slot.slot)) continue;
			const expected = require('./passive-approval-overlays').abilities(row.id, Object.fromEntries(row.slots.map(s => [s.slot, s.name])));
			assert.equal(Dex.species.get(row.id).abilities[slot.slot], expected[slot.slot], row.id + '/' + slot.slot);
		}
	});
});
