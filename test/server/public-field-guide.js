'use strict'; const assert = require('assert').strict, { publicFieldGuide } = require('../../dist/server/field-guide'), { calculatorMetadata } = require('../../dist/sim/custom-calculator');
describe('Public Field Guide', () => {
	it('covers every registered field and every separate aura', () => {
		const g = publicFieldGuide(), m = calculatorMetadata();
		for (const f of m.fields.filter(f => f.id))assert(g.entries.some(e => e.kind === 'field' && e.id === f.id));
		for (const a of m.auras)assert(g.entries.some(e => e.kind === 'aura' && e.id === a.id));
		assert.equal(g.entries.length, 61);
	});
	it('reviews every field without claiming exhaustive coverage', () => {
		const g = publicFieldGuide();
		assert.equal(g.coverage.reviewedFields, 50);
		assert.equal(g.coverage.exhaustive, false);
		for (const e of g.entries.filter(e => e.kind === 'field')) {
			assert(Object.keys(e.sections).length >= 3, e.id);
			assert.match(e.review, /Source-reviewed/);
			assert.equal(e.legacyNotes.length, 0);
		} const n = g.entries.find(e => e.id === 'newworldterrain');
		assert(!JSON.stringify(n.sections).match(/Void Crossing|voidcrossing/));
	});
	it('groups fields by seed family and keeps rooms separate', () => {
		const g = publicFieldGuide();
		for (const e of g.entries)assert(['Rooms & Gravity', 'Elemental', 'Magical', 'Synthetic', 'Telluric'].includes(e.group), e.id);
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
		assert.equal(JSON.parse(output.split('|').slice(3).join('|')).entries.length, 61);
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

describe('Eclipse guide sections', () => {
	const entry = id => publicFieldGuide().entries.find(e => e.id === id);
	for (const id of ['coldeclipseterrain', 'rifteclipseterrain', 'infernaleclipseterrain']) {
		it('separates effects, transitions and timer rules for ' + id, () => {
			const sections = entry(id).sections;
			for (const name of ['Boosts and general effects', 'Weather, rooms and Gravity', 'Transitions', 'Moves', 'Abilities', 'Seeds and other effects', 'Shared rules and limitations']) {
				assert(sections[name].length, name);
			}
			assert.match(sections['Shared rules and limitations'].join(' '), /remaining turns/);
			assert.match(sections['Shared rules and limitations'].join(' '), /at most one field change/);
		});
	}
	for (const [id, ability, moves] of [
		['frozenaura', 'Bad Seeds', ['Blizzard', 'Glaciate', 'Sheer Cold']],
		['ashenaura', 'Ashen Seeds', ['Infernal Parade', 'Eruption']],
	]) {
		it('documents all development moves and both timer routes for ' + id, () => {
			const sections = entry(id).sections, development = sections.Transitions;
			assert(development[0].includes(ability));
			for (const move of moves) assert(development[0].includes(move), move);
			assert.match(development[1], /remaining turns/);
			assert.match(development[2], /any user/);
			assert.match(development[2], /FIELD timer, not the aura timer/);
			assert.match(development.join(' '), /blocked conversions leave the aura intact/);
			assert.match(sections.Duration.join(' '), /5 turns, or 8 with Amplifield Rock/);
		});
	}
	it('keeps full-field seed effects separate from auras and documents shared move hooks', () => {
		for (const id of ['frozenaura', 'ashenaura']) {
			assert.match(entry(id).sections['Boosts and general effects'].join(' '), /does not grant the full Eclipse field/);
			assert.match(entry(id).sections.Moves.join(' '), /animation; this does not turn it into that move/);
		}
		assert.match(entry('frozenaura').sections.Moves.join(' '), /Dragon Rage deals 140/);
		assert.match(entry('coldeclipseterrain').sections.Moves.join(' '), /Dragon Rage deals 140/);
		assert.match(entry('infernaleclipseterrain').sections.Abilities.join(' '), /Ashen Seeds halves damage/);
	});
	it('puts room and Gravity Eclipse rules in visible sections, not review metadata alone', () => {
		for (const id of ['trickroom', 'wonderroom', 'magicroom', 'gravity']) {
			const notes = entry(id).sections['Eclipse interactions'].join(' ');
			assert.match(notes, /remain active, but their timers pause/);
			assert.match(notes, /Rift Eclipse gives new uses 8 turns/);
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

 describe('Rooms and Gravity reference', () => {
  it('lists all four effects separately from fields and auras', () => {
   const guide=publicFieldGuide(), rooms=guide.entries.filter(e=>e.kind==='effect');
   assert.equal(guide.coverage.rooms,4);
   assert.deepEqual(rooms.map(e=>e.id),['trickroom','wonderroom','magicroom','gravity']);
   for(const e of rooms){assert.equal(e.group,'Rooms & Gravity');assert(e.summary);assert(e.sections.Duration.length);assert(e.review.includes('Cold Eclipse'));}
  });
  it('keeps the impact list synchronized with the battle move flags', () => {
   const {Dex}=require('../../dist/sim');const gravity=publicFieldGuide().entries.find(e=>e.id==='gravity');
   for(const move of Dex.moves.all().filter(m=>m.flags.gravityboost))assert(gravity.sections['Impact moves'][0].includes(move.name));
  });
  it('documents current Trick Room exceptions and Magic Room walls', () => {
   const entries=publicFieldGuide().entries;
   assert(entries.find(e=>e.id==='trickroom').sections.Duration.join(' ').includes('Amplifield Rock does not extend'));
   const magic=JSON.stringify(entries.find(e=>e.id==='magicroom').sections);assert(magic.includes('Arenite Wall'));assert(magic.includes('Atlantis Wall'));
  });
 });
