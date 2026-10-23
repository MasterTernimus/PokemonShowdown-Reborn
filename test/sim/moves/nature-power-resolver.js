'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { Terrains } = require('../../../dist/data/terrains');
const { Auras } = require('../../../dist/data/auras');
const { resolveNaturePowerMove } = require('../../../dist/data/nature-power');
const { validateScenario, buildCalculatorBattle } = require('../../../dist/sim/custom-calculator');
const { FieldMoveMappings } = require('../../../dist/data/public-field-guide-shared');
describe('Shared Nature Power resolver', () => {
	for (const field of ['', ...Object.keys(Terrains)]) it('matches battle callback and checked mapping: ' + (field || 'neutral'), () => {
		for (const aura of [null, ...Object.values(Auras)]) {
			let called, options; const source = {}, target = {};
			const ctx = { field: { getTerrain: () => ({ id: field }), isAura: id => aura?.id === id, getAura: () => aura }, actions: { useMove: (m, p, o) => {
				called = m;
				options = o;
				assert.equal(p, source);
			} } };
			Dex.moves.get('naturepower').onTryHit.call(ctx, target, source);
			assert.equal(called, resolveNaturePowerMove(field, aura));
			const expected = aura?.id === 'frozenaura' ? 'icebeam' : FieldMoveMappings[field] ? Dex.toID(FieldMoveMappings[field].nature) : ({ crystalcavernterrain: 'powergem', newworldterrain: 'spacialrend' }[field] || 'triattack');
			assert.equal(called, expected); assert.equal(options.target, called === 'growth' ? source : target);
		}
	});
	for (const field of ['', ...Object.keys(Terrains)]) it('executes selected child through battle: ' + (field || 'neutral'), () => {
		const { battle: b, mons: [p, q] } = buildCalculatorBattle(validateScenario({ format: 'gen9nofieldsinglesgame', field, move: 'Nature Power', samples: 8, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) }), 0);
		try {
			const expected = resolveNaturePowerMove(b.field.getTerrain().id, null);
			const calls = [];
			const original = b.actions.useMove;
			b.actions.useMove = function (m, ...args) {
				calls.push(typeof m === 'string' ? m : m.id);
				return original.call(this, m, ...args);
			};
			b.actions.useMove('naturepower', p, { target: q });
			assert(calls.includes(expected), JSON.stringify({ field, expected, calls }));
		} finally {
			b.destroy();
		}
	});
	it('retains missing-stage and unknown-field fallbacks and ignores other aura mappings', () => { for (const id of ['flowergarden2', 'flowergarden3', 'flowergarden4', 'unknown'])assert.equal(resolveNaturePowerMove(id), 'triattack'); assert.equal(resolveNaturePowerMove('burningterrain', { id: 'electricaura', naturePowerMove: 'thunderbolt' }), 'flamethrower'); });
});
