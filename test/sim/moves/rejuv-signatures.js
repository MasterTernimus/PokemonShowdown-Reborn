'use strict';
const assert = require('assert').strict, { Battle, Dex } = require('../../../dist/sim');
function setup(item = '', ability = 'No Ability') {
	const b = new Battle({ formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4], p1: { name: 'A', team: [{ species: 'Mew', ability, item, moves: ['scentedgeyser', 'splinteredweb'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }] }, p2: { name: 'B', team: [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }] } });
	if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
	return b;
}
describe('Approved Rejuv signatures', () => {
	for (const [item, power] of [['', 80], ['laxincense', 80], ['pureincense', 100], ['rockincense', 100], ['roseincense', 100], ['oddincense', 100], ['seaincense', 100], ['waveincense', 100], ['fullincense', 150]])it('Scented power ' + (item || 'none'), () => {
		const b = setup(item);
		try {
			const m = Dex.getActiveMove('scentedgeyser');
			m.onModifyMove.call(b, m, b.p1.active[0]);
			assert.equal(m.basePower, power);
			assert.equal(m.type, 'Normal');
		} finally {
			b.destroy();
		}
	});
	for (const item of ['waveincense', 'fullincense'])it(item + ' drops SpA once after damage', () => {
		const b = setup(item);
		try {
			b.actions.runMove('scentedgeyser', b.p1.active[0], b.p1.active[0].getLocOf(b.p2.active[0]));
			assert.equal(b.p1.active[0].boosts.spa, -2);
		} finally {
			b.destroy();
		}
	});
	for (const high of [false, true])it('Luck chooses once per execution; high=' + high, () => {
		const b = setup('luckincense');
		try {
			let calls = 0;
			b.randomChance = () => {
				calls++;
				return high;
			};
			const m = Dex.getActiveMove('scentedgeyser');
			m.onModifyMove.call(b, m, b.p1.active[0]);
			m.onModifyMove.call(b, m, b.p1.active[0]);
			assert.equal(calls, 1);
			assert.equal(m.basePower, high ? 160 : 100);
		} finally {
			b.destroy();
		}
	});
	for (const [side, armor, expected] of [['target', 'No Ability', true], ['user', 'No Ability', false], ['none', 'No Ability', false], ['target', 'Battle Armor', false], ['target', 'Shell Armor', false]])it('Splintered crit ' + side + ' ' + armor, () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setAbility(armor);
			if (side !== 'none')(side === 'target' ? q : p).side.addSideCondition('stealthrock', p);
			const original = b.randomChance.bind(b);
			b.randomChance = (n, d) => d === 24 ? false : original(n, d);
			b.actions.useMove('splinteredweb', p, q);
			assert.equal(b.log.some(x => x.startsWith('|-crit|')), expected);
		} finally {
			b.destroy();
		}
	});
	for (const count of [0, 20, 100])it('Rage Fist retains ' + count + ' across repeated switches', () => {
		const b = setup();
		try {
			const p = b.p1.active[0];
			p.m.rageFistBonus = count;
			for (let i = 0;
				i < 2;
				i++) {
				b.makeChoices('switch 2', 'move 1');
				b.makeChoices('switch 2', 'move 1');
				assert.equal(p.m.rageFistBonus, count);
			}
		} finally {
			b.destroy();
		}
	});
});

describe('Signature immunity and event form', () => {
	for (const [item, type, hit] of [['pureincense', 'Ghost', true], ['', 'Ghost', false], ['oddincense', 'Dark', false], ['seaincense', 'Dark', true]])it(item + ' against ' + type, () => {
		const b = setup(item);
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setType(type);
			const hp = q.hp;
			b.actions.runMove('scentedgeyser', p, p.getLocOf(q));
			assert.equal(q.hp < hp, hit);
		} finally {
			b.destroy();
		}
	});
	it('item suppression returns to base power', () => {
		const b = setup('fullincense');
		try {
			b.field.addPseudoWeather('magicroom', b.p1.active[0]);
			const m = Dex.getActiveMove('scentedgeyser');
			m.onModifyMove.call(b, m, b.p1.active[0]);
			assert.equal(m.basePower, 80);
		} finally {
			b.destroy();
		}
	});
	it('Aevian Web transforms with approved stats and typing', () => {
		const b = new Battle({ formatid: 'gen9nofieldsinglesgame', p1: { team: [{ species: 'Galvantula', ability: 'Aevian Web', moves: ['splinteredweb'] }] }, p2: { team: [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }] } });
		try {
			if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0];
			assert.equal(p.species.id, 'galvantularejuv');
			assert.deepEqual(p.getTypes(), ['Bug', 'Rock']);
			assert.deepEqual(p.species.baseStats, { hp: 70, atk: 127, def: 60, spa: 47, spd: 60, spe: 108 });
			assert.equal(p.species.bst, Dex.species.get('galvantula').bst);
		} finally {
			b.destroy();
		}
	});
});

describe('Signature calculator parity', () => {
	for (const [move, item] of [['Scented Geyser', 'Luck Incense'], ['Scented Geyser', 'Wave Incense'], ['Splintered Web', '']])it(move + ' ' + item, () => {
		const c = require('../../../dist/sim/custom-calculator'), input = { format: 'gen9nofieldsinglesgame', move, samples: 8, seed: 42, actors: [{ species: 'Mew', ability: 'No Ability', item }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = c.validateScenario(input), damage = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons } = c.buildCalculatorBattle(scenario, i);
			try {
				const hp = mons[1].hp;
				b.actions.runMove(scenario.move, mons[0], mons[0].getLocOf(mons[1]));
				damage.push(hp - mons[1].hp);
			} finally {
				b.destroy();
			}
		} const result = c.calculateScenario(input);
		assert.equal(result.results[1].minNetLoss, Math.min(...damage));
		assert.equal(result.results[1].maxNetLoss, Math.max(...damage));
		if (item === 'Luck Incense')assert.deepEqual(result.powerDistribution, [{ power: 100, probability: 0.6 }, { power: 160, probability: 0.4 }]);
	});
});

describe('Signature execution boundaries', () => {
	for (const protection of ['protect', 'immune', 'miss']) for (const item of ['waveincense', 'fullincense'])it(item + ' no self drop on ' + protection, () => {
		const b = setup(item);
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			if (protection === 'protect')q.addVolatile('protect', q);
			if (protection === 'immune')q.setType('Ghost');
			if (protection === 'miss')p.boosts.accuracy = -6;
			const roll = b.randomChance.bind(b);
			if (protection === 'miss')b.randomChance = (n, d) => d === 100 ? false : roll(n, d);
			b.actions.runMove('scentedgeyser', p, p.getLocOf(q));
			assert.equal(p.boosts.spa, 0);
		} finally {
			b.destroy();
		}
	});
	it('checks removed rocks at execution', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.side.addSideCondition('stealthrock', p);
			q.side.removeSideCondition('stealthrock');
			const m = Dex.getActiveMove('splinteredweb');
			m.critRatio = 0;
			b.actions.runMove(m, p, p.getLocOf(q));
			assert(!b.log.some(x => x.startsWith('|-crit|')));
		} finally {
			b.destroy();
		}
	});
	it('uses normal STAB with added Rock effectiveness', () => {
		const b = setup('rockincense');
		try {
			const p = b.p1.active[0], q = b.p2.active[0], m = Dex.getActiveMove('scentedgeyser');
			m.onModifyMove.call(b, m, p);
			assert.equal(m.type, 'Normal');
			assert.equal(m.types, undefined);
			assert.equal(m.onEffectiveness.call(b, 0, q, 'Flying', m), 1);
			assert.equal(m.onEffectiveness.call(b, -1, q, 'Steel', m), -2);
		} finally {
			b.destroy();
		}
	});
	it('Pure reverses Ghost immunity even alongside Mind Eye', () => {
		const b = setup('pureincense', 'mindseye');
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setType(['Ghost', 'Steel']);
			b.actions.runMove('scentedgeyser', p, p.getLocOf(q));
			assert(q.hp < q.maxhp);
			assert(!b.log.some(x => x.startsWith('|-immune|')));
		} finally {
			b.destroy();
		}
	});
});


describe('Scented Geyser immunity overrides', () => {
	for (const [item, field, suppressed, hit, typeMod] of [
		['', '', false, false, 0],
		['ringtarget', '', false, true, 0],
		['ringtarget', '', true, false, 0],
		['', 'inverseterrain', false, true, 1],
		['ringtarget', 'inverseterrain', false, true, 1],
	]) it(`Odd Incense versus Dark: ${item}/${field}/suppressed=${suppressed}`, () => {
		const b = setup('oddincense');
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setType('Dark');
			q.setItem(item);
			if (suppressed) q.addVolatile('embargo', p);
			if (field) b.field.setTerrain(field, p);
			const m = Dex.getActiveMove('scentedgeyser');
			m.willCrit = false;
			m.noDamageVariance = true;
			m.onModifyMove.call(b, m, p);
			assert.equal(q.runEffectiveness(m), typeMod);
			const hp = q.hp;
			b.actions.runMove(m, p, p.getLocOf(q));
			assert.equal(q.hp < hp, hit);
		} finally {
			b.destroy();
		}
	});
	for (const [item, types, expected] of [
		['rockincense', ['Ghost', 'Flying'], 0],
		['roseincense', ['Ghost', 'Water'], 0],
		['oddincense', ['Ghost', 'Dark'], 2],
		['waveincense', ['Ghost', 'Ground'], 0],
	]) it(`inverts both components independently: ${item}/${types.join('/')}`, () => {
		const b = setup(item);
		try {
			const p = b.p1.active[0], q = b.p2.active[0], m = Dex.getActiveMove('scentedgeyser');
			q.setType(types);
			b.field.setTerrain('inverseterrain', p);
			m.onModifyMove.call(b, m, p);
			assert.equal(q.runEffectiveness(m), expected);
			const hp = q.hp;
			b.actions.runMove(m, p, p.getLocOf(q));
			assert(q.hp < hp);
		} finally {
			b.destroy();
		}
	});
	for (const field of ['', 'inverseterrain']) it('suppressed incense has no extra effectiveness on ' + field, () => {
		const b = setup('oddincense');
		try {
			const p = b.p1.active[0], q = b.p2.active[0], m = Dex.getActiveMove('scentedgeyser');
			p.addVolatile('embargo', q);
			q.setType('Dark');
			if (field) b.field.setTerrain(field, p);
			m.onModifyMove.call(b, m, p);
			assert.equal(m.basePower, 80);
			assert.equal(m.scentedExtraType, undefined);
			assert.equal(q.runEffectiveness(m), 0);
			const hp = q.hp;
			b.actions.runMove(m, p, p.getLocOf(q));
			assert(q.hp < hp);
		} finally {
			b.destroy();
		}
	});
	it('keeps only the primary type eligible for STAB', () => {
		const damage = {};
		for (const type of ['Grass', 'Psychic', 'Normal']) {
			const b = setup('oddincense');
			try {
				const p = b.p1.active[0], q = b.p2.active[0], m = Dex.getActiveMove('scentedgeyser');
				p.setType(type);
				m.willCrit = false;
				m.noDamageVariance = true;
				const hp = q.hp;
				b.actions.runMove(m, p, p.getLocOf(q));
				damage[type] = hp - q.hp;
			} finally {
				b.destroy();
			}
		}
		assert.equal(damage.Psychic, damage.Grass);
		assert(damage.Normal > damage.Grass);
	});
	it('preserves ordinary Inverse Terrain immunity conversion', () => {
		const b = setup();
		try {
			const p = b.p1.active[0], q = b.p2.active[0];
			q.setType('Ghost');
			b.field.setTerrain('inverseterrain', p);
			assert.equal(q.runEffectiveness(Dex.getActiveMove('tackle')), 1);
		} finally {
			b.destroy();
		}
	});
});
