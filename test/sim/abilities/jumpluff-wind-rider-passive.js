'use strict';
const assert = require('assert').strict, { Dex } = require('../../../dist/sim'), { SpeciesPassives, ThematicPassiveIds } = require('../../../dist/data/species-passives');
describe('Jumpluff Wind Rider passive', () => {
	it('changes only Jumpluff passive and preserves selected slot order', () => {
		assert.deepEqual(SpeciesPassives.jumpluff, ['windrider']);
		assert(ThematicPassiveIds.has('windrider'));
		assert.deepEqual(Dex.species.get('jumpluff').abilities, { 0: 'Chlorophyll', 1: 'Infiltrator', H: 'Windy Surge' });
		assert(!SpeciesPassives.hoppip?.includes('windrider'));
		assert(!SpeciesPassives.skiploom?.includes('windrider'));
	});
});

const common = require('../../common');
describe('Jumpluff selected and innate behavior', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	for (const ability of ['Chlorophyll', 'Infiltrator', 'Windy Surge'])it('supports selected ' + ability + ' with Wind Rider passive', () => {
		b = common.createBattle({}, [[{ species: 'Jumpluff', ability, moves: ['acrobatics', 'tailwind'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = b.p1.active[0], q = b.p2.active[0];
		assert(p.hasAbilityOrPassive('windrider'));
		assert.equal(p.ability, ability.toLowerCase().replace(/[^a-z]/g, ''));
		if (ability === 'Windy Surge') {
			assert.equal(p.side.sideConditions.tailwind.duration, 2);
			assert.equal(p.boosts.atk, 1);
		} if (ability === 'Infiltrator') {
			const m = Dex.getActiveMove('acrobatics');
			b.runEvent('ModifyMove', p, q, m, m);
			assert.equal(m.infiltrates, true);
		}
	});
	it('calculator resolves both the selected option and new passive', () => {
		const c = require('../../../dist/sim/custom-calculator'), r = c.calculateScenario({ format: 'gen9nofieldsinglesgame', move: 'Acrobatics', samples: 8, seed: 1, actors: [{ species: 'Jumpluff', ability: 'Infiltrator' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] });
		assert.equal(r.resolved.actors[0].ability, 'Infiltrator');
		assert.deepEqual(r.resolved.actors[0].passives, ['windrider']);
	});
});
