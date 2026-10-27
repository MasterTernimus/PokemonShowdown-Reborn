'use strict';
const assert = require('assert').strict, { Battle, Dex } = require('../../../dist/sim');
function setup() {
	const b = new Battle({ formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4], p1: { name: 'A', team: [{ species: 'Poliwrath', ability: 'Aevian Ascendance', moves: ['tackle', 'splash'] }] }, p2: { name: 'B', team: [{ species: 'Mew', ability: 'No Ability', moves: ['watergun', 'splash'] }] } });
	if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
	return b;
}describe('Poliwrath Rejuv event', () => {
	it('preserves ordinary kits and applies the approved two-form typing', () => {
		const p = Dex.species.get('poliwrath');
		assert.deepEqual(p.abilities, { 0: 'Reservoir', 1: 'Knuckle Tide', H: 'Crosscurrent', S: 'Aevian Ascendance' });
		assert.deepEqual(p.types, ['Water', 'Fighting']);
		assert.deepEqual(Dex.species.get('politoed').types, ['Water']);
		for (const id of ['politoedrejuv', 'poliwrathrejuv'])assert.deepEqual(Dex.species.get(id).types, ['Normal', 'Dragon']);
		const r = Dex.species.get('poliwrathrejuv');
		assert.deepEqual(r.baseStats, { hp: 100, atk: 55, def: 100, spa: 160, spd: 90, spe: 55 });
		assert.equal(r.bst, p.bst);
	});
	it('transforms on entry with its event ability and form-specific passive convention', () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			assert.equal(p.species.id, 'poliwrathrejuv');
			assert.equal(p.ability, 'aevianascendance');
			assert.deepEqual(p.getPassives(), ['innerfocus']);
		} finally {
			b.destroy();
		}
	});
	it('suppresses weather effects until the active ability is suppressed', () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			b.field.setWeather('raindance', p);
			assert.equal(p.effectiveWeather(), '');
			p.addVolatile('gastroacid');
			assert.equal(p.effectiveWeather(), 'raindance');
		} finally {
			b.destroy();
		}
	});
	it('retains Mind Eye Ghost bypass and extra STAB without restoring removed hit healing', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setType('Ghost');
			p.hp -= 100;
			const hp = p.hp, targethp = q.hp;
			b.actions.useMove('tackle', p, q);
			assert(q.hp < targethp);
			assert.equal(p.hp, hp);
			assert.equal(b.runEvent('ModifySTAB', p, q, Dex.getActiveMove('moonblast'), 1), 1.5);
		} finally {
			b.destroy();
		}
	});
	it('retains one Water Absorb heal without restoring removed Self Sufficient recovery', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			p.hp -= 150;
			let hp = p.hp;
			b.actions.useMove('watergun', q, p);
			assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 4));
			hp = p.hp;
			b.makeChoices('move 2', 'move 2');
			assert.equal(p.hp, hp, 'No passive turn healing outside an eligible Water Absorb field');
			b.field.setTerrain('underwaterterrain', p);
			hp = p.hp;
			b.makeChoices('move 2', 'move 2');
			assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 16));
			assert(!p.hasAbilityOrPassive('selfsufficient'));
		} finally {
			b.destroy();
		}
	});
	for (const [field, airborne, expectedHeals] of [
		['watersurfaceterrain', false, 1],
		['watersurfaceterrain', true, 0],
		['underwaterterrain', true, 1],
	]) it(`Water Absorb heals ${expectedHeals} time per turn on ${field}, airborne=${airborne}`, () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			p.hp = 1;
			if (airborne) p.setItem('Air Balloon');
			b.field.setTerrain(field, p);
			for (let turn = 0; turn < 2; turn++) {
				const hp = p.hp;
				b.makeChoices('move 2', 'move 2');
				assert.equal(p.hp - hp, expectedHeals * Math.floor(p.baseMaxhp / 16));
			}
		} finally {
			b.destroy();
		}
	});
	it('retains Cold Eclipse Mind Eye power and Rainbow Cloud Nine boosts', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			b.field.setTerrain('coldeclipseterrain', p);
			assert.equal(b.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
			b.field.setTerrain('rainbowterrain', p);
			b.makeChoices('move 2', 'move 2');
			assert.equal(Object.values(p.boosts).reduce((a, n) => a + n, 0), 1);
			assert.equal(p.boosts.evasion, 0);
		} finally {
			b.destroy();
		}
	});
});

describe('Aevian Ascendance regional suppression and calculator', () => {
	it('reverts on actual suppression and stays reverted until switching', () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			p.addVolatile('gastroacid');
			b.makeChoices('move 2', 'move 2');
			assert.equal(p.species.id, 'poliwrath');
			assert.deepEqual(p.getTypes(), ['Water', 'Fighting']);
			p.removeVolatile('gastroacid');
			b.makeChoices('move 2', 'move 2');
			assert.equal(p.species.id, 'poliwrath');
		} finally {
			b.destroy();
		}
	});
	it('matches direct transformed damage for all eight calculator samples', () => {
		const c = require('../../../dist/sim/custom-calculator'), input = { format: 'gen9nofieldsinglesgame', move: 'Hyper Voice', samples: 8, seed: 42, actors: [{ species: 'Poliwrath', ability: 'Aevian Ascendance' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = c.validateScenario(input), damage = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons } = c.buildCalculatorBattle(scenario, i);
			try {
				assert.equal(mons[0].species.id, 'poliwrathrejuv');
				const hp = mons[1].hp;
				b.actions.runMove(scenario.move, mons[0], mons[0].getLocOf(mons[1]));
				damage.push(hp - mons[1].hp);
			} finally {
				b.destroy();
			}
		} const result = c.calculateScenario(input).results[1];
		assert.equal(result.minNetLoss, Math.min(...damage));
		assert.equal(result.maxNetLoss, Math.max(...damage));
	});
});
