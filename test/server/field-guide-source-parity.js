'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim');
const { FieldMoveMappings } = require('../../dist/data/public-field-guide-shared');
const { validateScenario, buildCalculatorBattle } = require('../../dist/sim/custom-calculator');
const { publicFieldGuide } = require('../../dist/server/field-guide');
describe('Field Guide checked source facts', () => {
	for (const [id, row] of Object.entries(FieldMoveMappings)) it('matches shared move/type callbacks on ' + id, () => {
		let type, called;
		const mon = { species: { num: 0 }, getTypes: () => ['Test'], setType: t => { type = t; return true; } };
		const ctx = { field: { terrain: id, isTerrain: t => Array.isArray(t) ? t.includes(id) : t === id, getTerrain: () => ({ id }), getAura: () => null, isAura: () => false, flowerGardenStage: () => /^flowergarden[1-5]$/.test(id) ? Number(id.slice(-1)) : 0 }, add() {}, hint() {}, boost() {}, actions: { useMove: m => { called = m; } } };
		Dex.moves.get('camouflage').onHit.call(ctx, mon); assert.equal(type, row.camouflage, 'Camouflage');
		Dex.abilities.get('mimicry').onTerrainChange.call(ctx, mon); assert.equal(type, row.mimicry, 'Mimicry');
		const move = {}; Dex.moves.get('terrainpulse').onModifyType.call(ctx, move, mon); assert.equal(move.type, row.pulse, 'Terrain Pulse');
		Dex.moves.get('naturepower').onTryHit.call(ctx, mon, mon); assert.equal(Dex.moves.get(called).name, row.nature, 'Nature Power');
	});
	function setup(field) { return buildCalculatorBattle(validateScenario({ format: 'gen9nofieldsinglesgame', field, move: 'Splash', samples: 8, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) }), 0); }
	function after(b, p, q, id) {
		p.moveThisTurnResult = true;
		const move = Dex.getActiveMove(id), condition = b.field.getTerrain();
		condition.onAfterMove.call(b, p, q, move);
	}
	it('checks bright and dark crystal break thresholds against real shared field rules', () => {
		for (const [field, firstBreak] of [['crystalcavernterrain', true], ['darkcrystalcavernterrain', false]]) {
			const { battle: b, mons: [p, q] } = setup(field);
			try {
				after(b, p, q, 'tectonicrage');
				assert.equal(b.field.terrain, firstBreak ? 'caveterrain' : field);
				if (!firstBreak) {
					after(b, p, q, 'earthquake');
					assert.equal(b.field.terrain, 'caveterrain');
				}
			} finally {
				b.destroy();
			}
		}
	});
	it('checks Dragon Den cooling and the separate instant Volcanic transition', () => {
		for (const moves of [['surf', 'sparklingaria'], ['glaciate']]) {
			const { battle: b, mons: [p, q] } = setup('dragonsdenterrain');
			try {
				for (const m of moves)after(b, p, q, m);
				assert.equal(b.field.terrain, moves.length === 1 ? 'volcanicterrain' : 'caveterrain');
			} finally {
				b.destroy();
			}
		}
	});
	it('does not advertise the blocked Bewitched Forest exit as working', () => {
		const { battle: b, mons: [p, q] } = setup('bewitchedwoodsterrain');
		try {
			after(b, p, q, 'dazzlinggleam');
			assert.equal(b.field.terrain, 'bewitchedwoodsterrain');
			const g = publicFieldGuide().entries.find(e => e.id === 'bewitchedwoodsterrain');
			assert.match(g.sections.Transitions.join(' '), /currently blocks/);
		} finally {
			b.destroy();
		}
	});
	it('checks the two successful Cold Eclipse heat uses', () => {
		const { battle: b, mons: [p, q] } = setup('');
		try {
			b.field.setTerrain('coldeclipseterrain', p, Dex.moves.get('snowscape'));
			after(b, p, q, 'heatwave');
			assert.equal(b.field.terrain, 'coldeclipseterrain');
			after(b, p, q, 'heatwave');
			assert.notEqual(b.field.terrain, 'coldeclipseterrain');
		} finally {
			b.destroy();
		}
	});
	it('preserves exact four-group navigation and explicit non-exhaustive coverage', () => {
		const g = publicFieldGuide();
		assert.equal(g.coverage.reviewedFields, g.coverage.fields);
		assert.equal(g.coverage.exhaustive, false);
		for (const e of g.entries.filter(e => e.kind === 'field'))assert(e.sections['Shared rules and limitations'].length);
	});
});
