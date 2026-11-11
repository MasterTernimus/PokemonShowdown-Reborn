'use strict';
const assert = require('assert').strict;
const { publicFieldGuide } = require('../../dist/server/field-guide');
const { conciseFieldNotes } = require('../../dist/data/field-guide-presentation');

describe('Concise Field Notes', () => {
	const guide = publicFieldGuide();
	it('shows the current Relentless Hunt power for each field tier', () => {
		for (const [id, power] of [['dragonsdenterrain', 2], ['fairytaleterrain', 2],
			['rockyterrain', 1.5], ['coldeclipseterrain', 1.5], ['forestterrain', 1.3]]) {
			const row = guide.entries.find(e => e.id === id).referenceDetails.abilities.find(a => a.id === 'relentlesshunt');
			assert(row, id);
			assert(JSON.stringify(row).includes(`${power}×`), id);
		}
	});
	it('separates shared field rules and describes clearing accurately', () => {
		assert(guide.sharedRules.length);
		assert(guide.sharedRules.some(line => line.includes('do not undo natural transitions')));
		assert(!guide.sharedRules.some(line => line.startsWith('Clearing removes the current field layer')));
	});
	it('lists special conditions separately from the destination tables', () => {
		for (const entry of guide.entries.filter(e => e.kind === 'field')) {
			assert(Array.isArray(entry.transitions.notes), entry.id);
			assert.equal(new Set(entry.transitions.notes).size, entry.transitions.notes.length, entry.id);
		}
		const den = guide.entries.find(e => e.id === 'dragonsdenterrain');
		assert(!den.transitions.notes.some(line => line.startsWith('To Volcanic')));
		assert(den.transitions.notes.some(line => line.includes('clearing moves cannot end it early')));
	});
	it('lists Power Drill once instead of repeating its composite on the same field', () => {
		for (const id of ['rockyterrain', 'caveterrain', 'volcanicterrain', 'mountainterrain', 'snowymountainterrain']) {
			const rows = guide.entries.find(e => e.id === id).referenceDetails.abilities;
			assert.equal(rows.filter(row => row.id === 'powerdrill').length, 1, id);
			assert(!rows.some(row => row.id === 'hyperdrill'), id);
		}
	});
	it('preserves numbers and important field conditions while dropping ordinary-effect reminders', () => {
		assert.deepEqual(conciseFieldNotes(['On entry: +1 Sp. Atk. At half HP: 1.5x power.',
			'Its ordinary critical-hit prevention and damage reduction remain.']),
		['On entry: +1 Sp. Atk.', 'At half HP: 1.5× power.']);
	});
	it('does not expose old source-edit notes in any field message', () => {
		for (const entry of guide.entries) {
			assert(!(entry.sections['Battle messages'] || []).some(line => /misspelled|older prose/.test(line)), entry.id);
		}
	});
});
