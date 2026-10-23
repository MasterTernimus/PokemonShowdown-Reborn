'use strict'; const assert = require('assert').strict, { publicFieldGuide } = require('../../dist/server/field-guide'), { calculatorMetadata } = require('../../dist/sim/custom-calculator');
describe('Public Field Guide', () => {
	it('covers every registered field and every separate aura', () => {
		const g = publicFieldGuide(), m = calculatorMetadata();
		for (const f of m.fields.filter(f => f.id))assert(g.entries.some(e => e.kind === 'field' && e.id === f.id));
		for (const a of m.auras)assert(g.entries.some(e => e.kind === 'aura' && e.id === a.id));
		assert.equal(g.entries.length, 54);
	});
	it('reviews every field without claiming exhaustive coverage', () => {
		const g = publicFieldGuide();
		assert.equal(g.coverage.reviewedFields, 48);
		assert.equal(g.coverage.exhaustive, false);
		for (const e of g.entries.filter(e => e.kind === 'field')) {
			assert(Object.keys(e.sections).length >= 3, e.id);
			assert.match(e.review, /Source-reviewed/);
			assert.equal(e.legacyNotes.length, 0);
		} const n = g.entries.find(e => e.id === 'newworldterrain');
		assert(!JSON.stringify(n.sections).match(/Void Crossing|voidcrossing/));
	});
	it('groups every entry into the four seed families and keeps garden stages together', () => {
		const g = publicFieldGuide();
		for (const e of g.entries)assert(['Elemental', 'Magical', 'Synthetic', 'Telluric'].includes(e.group), e.id);
		for (let i = 1;
			i <= 5;
			i++)assert.equal(g.entries.find(e => e.id === 'flowergarden' + i).group, 'Synthetic');
		assert.match(g.entries.find(e => e.id === 'burningterrain').groupingNote, /both Elemental and Telluric/);
	});
	it('serves anonymous users without checking rank or room permission', () => {
		const cmd = require('../../dist/server/chat-plugins/public-field-guide').commands.fieldguide;
		let output;
		cmd.call({}, '', null, {}, { send: s => (output = s) });
		assert(output.startsWith('|queryresponse|fieldguide|'));
		assert.equal(JSON.parse(output.split('|').slice(3).join('|')).entries.length, 54);
	});
});

describe('Field Guide reference explanations', () => {
	it('explains every indexed Icy Terrain reference with checked field-specific effects', () => {
		const e = publicFieldGuide().entries.find(e => e.id === 'icyterrain');
		let count = 0;
		for (const kind of ['abilities', 'moves', 'items']) for (const row of e.referenceDetails[kind]) {
			count++;
			assert(row.reviewed, row.name);
			assert(row.fieldEffects.length, row.name);
		}assert.equal(count, 27);
	});
	it('distinguishes pending details from checked effects', () => {
		for (const e of publicFieldGuide().entries) for (const rows of Object.values(e.referenceDetails || {})) for (const row of rows) {
			assert.equal(row.reviewed, !!row.fieldEffects.length);
			assert(row.name);
		}
	});
});

describe('Field message trigger explanations', () => {
	it('pairs checked Haunted and Icy messages with causes and blocked-transition caveats', () => {
		const g = publicFieldGuide();
		for (const id of ['hauntedterrain', 'icyterrain']) {
			const notes = g.entries.find(e => e.id === id).sections['Battle messages'];
			assert(notes.every(n => n.includes(' — ') || n.startsWith('Restoration messages')));
			assert(notes.some(n => n.includes('lock')));
		}assert(g.entries.find(e => e.id === 'icyterrain').sections['Battle messages'].some(n => n.includes('second accumulated Scald')));
	});
	it('has checked explanations for all indexed references and listed message triggers', () => {
		const g = publicFieldGuide();
		for (const e of g.entries) {
			for (const rows of Object.values(e.referenceDetails || {})) for (const row of rows) {
				assert(row.reviewed, e.id + '/' + row.id);
				assert(row.fieldEffects.length);
			} for (const n of e.sections['Battle messages'] || [])assert(!n.startsWith('Trigger review pending'), e.id);
		}
	});
});
