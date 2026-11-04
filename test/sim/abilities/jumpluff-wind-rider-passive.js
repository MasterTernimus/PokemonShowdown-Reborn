'use strict';
const assert = require('assert').strict, { Dex } = require('../../../dist/sim'), { SpeciesPassives, ThematicPassiveIds } = require('../../../dist/data/species-passives');
describe('Jumpluff Cotton Down passive', () => {
	it('changes only Jumpluff passive and preserves selected slot order', () => {
		assert.deepEqual(SpeciesPassives.jumpluff, ['cottondown']);
		assert(ThematicPassiveIds.has('cottondown'));
		assert.deepEqual(Dex.species.get('jumpluff').abilities, { 0: 'Chlorophyll', 1: 'Wind Rider', H: 'Windy Surge' });
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
	for (const ability of ['Chlorophyll', 'Wind Rider', 'Windy Surge'])it('supports selected ' + ability + ' with Cotton Down passive', () => {
		b = common.createBattle({}, [[{ species: 'Jumpluff', ability, moves: ['acrobatics', 'tailwind'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = b.p1.active[0], q = b.p2.active[0];
		assert.equal(p.hasAbilityOrPassive('windrider'), ability === 'Wind Rider');
		assert(p.hasAbilityOrPassive('cottondown'));
		assert.equal(p.ability, ability.toLowerCase().replace(/[^a-z]/g, ''));
		if (ability === 'Windy Surge') {
			assert.equal(p.side.sideConditions.tailwind.duration, 2);
			assert.equal(p.boosts.atk, 0);
			}
		b.actions.useMove('tackle', q, {target: p});
		assert.equal(q.boosts.spe, -1);
		if (ability === 'Wind Rider') {
			const hp = p.hp;
			b.actions.useMove(Object.assign(Dex.getActiveMove('gust'), {accuracy: true}), q, {target: p});
			assert.equal(p.hp, hp);
			assert.equal(p.boosts.atk, 1);
		}
	});
	it('calculator resolves both the selected option and new passive', () => {
		const c = require('../../../dist/sim/custom-calculator'), r = c.calculateScenario({ format: 'gen9nofieldsinglesgame', move: 'Acrobatics', samples: 8, seed: 1, actors: [{ species: 'Jumpluff', ability: 'Wind Rider' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] });
		assert.equal(r.resolved.actors[0].ability, 'Wind Rider');
		assert.deepEqual(r.resolved.actors[0].passives, ['cottondown']);
	});
});
