'use strict'; const assert = require('assert').strict, { Dex } = require('../../../dist/sim'), c = require('../../../dist/sim/custom-calculator');
function run(format, move, ability, seed = 0, opts = {}) {
	const s = c.validateScenario({ format, field: '', move, actors: [{ species: 'Mew', ability, item: opts.item || '' }, { species: 'Blissey', ability: opts.foe || 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Blissey', ability: 'No Ability' }] });
	const { battle: b, mons } = c.buildCalculatorBattle(s, seed);
	try {
		for (const m of mons)m.hp = m.maxhp = m.baseMaxhp = 10000;
		if (opts.userHP)mons[0].hp = opts.userHP;
		if (opts.targetHP)mons[1].hp = opts.targetHP;
		if (opts.otherTargetHP)mons[3].hp = opts.otherTargetHP;
		if (opts.otherAbility)mons[3].setAbility(opts.otherAbility);
		if (opts.otherProtect)mons[3].addVolatile('protect');
		if (opts.sub)mons[1].addVolatile('substitute');
		if (opts.suppressed)mons[0].addVolatile('gastroacid');
		const hp = mons.map(m => m.hp), hits = [];
		const original = b.spreadDamage;
		b.spreadDamage = function (ds, targets, source, effect, ...rest) {
			const r = original.call(this, ds, targets, source, effect, ...rest);
			if (effect?.effectType === 'Move')r.forEach((d, i) => {
				if (d > 0)hits.push([effect.hit, mons.indexOf(targets[i]), d]);
			});
			return r;
		};
		const m = Dex.getActiveMove(move);
		if (opts.count)m.multihit = opts.count;
		if (opts.alwaysHit)m.accuracy = true;
		if (opts.laterMiss) {
			let rolls = 0;
			m.accuracy = 90;
			const chance = b.randomChance.bind(b);
			b.randomChance = (n, d) => d === 100 ? ++rolls === 1 : chance(n, d);
		}m.willCrit = false;
		b.actions.runMove(m, mons[0], mons[0].getLocOf(mons[1]));
		return { hits, loss: mons.map((m, i) => hp[i] - m.hp), userHP: mons[0].hp };
	} finally {
		b.destroy();
	}
}
describe('Hydra Bond singles and doubles multihit contracts', () => {
	for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) for (const move of ['doublehit', 'tripleaxel', 'triplekick', 'populationbomb', 'dragondarts'])it(format + ' preserves native ' + move + ' hit counts, accuracy and damage', () => { for (let seed = 0; seed < 8; seed++)assert.deepEqual(run(format, move, 'Hydra Bond', seed), run(format, move, 'No Ability', seed)); });
	for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle'])it(format + ' retains the Gilded Helix exception and ordinary three-head attack', () => {
		assert.equal(run(format, 'gildedhelix', 'Hydra Bond', 0, { alwaysHit: true }).hits.length, 3);
		const r = run(format, 'tackle', 'Hydra Bond', 0, { alwaysHit: true });
		assert.equal(r.hits.length, 3);
		assert(r.hits[1][2] < r.hits[0][2] * 0.4);
		assert(r.hits[2][2] < r.hits[0][2] * 0.4);
	});
	for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle'])it(format + ' preserves Loaded Dice, contact and Substitute handling', () => { for (const opts of [{ item: 'Loaded Dice' }, { foe: 'Rough Skin' }, { sub: true }])assert.deepEqual(run(format, 'bulletseed', 'Hydra Bond', 0, opts), run(format, 'bulletseed', 'No Ability', 0, { ...opts, count: 5 })); assert.deepEqual(run(format, 'doublehit', 'Hydra Bond', 0, { foe: 'Rough Skin', alwaysHit: true }), run(format, 'doublehit', 'No Ability', 0, { foe: 'Rough Skin', alwaysHit: true })); });
	for (const ability of ['No Ability', 'Hydra Bond'])it('stops split-target Dragon Darts after Innards Out faints ' + ability, () => {
		const r = run('gen9nofielddoublesbattle', 'dragondarts', ability, 0, { userHP: 1, targetHP: 1, foe: 'Innards Out', alwaysHit: true });
		assert.equal(r.userHP, 0);
		assert.equal(r.loss[3], 0);
		assert.equal(r.hits.length, 1);
	});
	it('stops singles after contact recoil faints the user', () => { assert.equal(run('gen9nofieldsinglesgame', 'doublehit', 'Hydra Bond', 0, { userHP: 1, foe: 'Rough Skin', alwaysHit: true }).hits.length, 1); });
	it('retains doubles spillover to the other opponent without hitting the ally', () => {
		const r = run('gen9nofielddoublesbattle', 'tackle', 'Hydra Bond', 0, { targetHP: 1, alwaysHit: true });
		assert.equal(r.hits.length, 3);
		assert.deepEqual(r.hits.map(h => h[1]), [1, 3, 3]);
		assert.equal(r.loss[2], 0);
	});
	it('preserves FFA continuation and three native Double Hit strikes per foe', () => {
		const format = c.calculatorFormats().find(f => f.gameType === 'freeforall').id, r = run(format, 'doublehit', 'Hydra Bond', 0, { userHP: 1, foe: 'Rough Skin', alwaysHit: true });
		assert.equal(r.userHP, 0);
		assert.equal(r.hits.length, 9);
		for (const i of [1, 2, 3])assert.equal(r.hits.filter(h => h[1] === i).length, 3);
	});
	it('does not convert ordinary doubles spread moves into extra hits', () => { assert.deepEqual(run('gen9nofielddoublesbattle', 'surf', 'Hydra Bond'), run('gen9nofielddoublesbattle', 'surf', 'No Ability')); });
});

for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle'])describe('Hydra native maximum count ' + format, () => {
	for (const move of ['bulletseed', 'rockblast', 'iciclespear', 'scaleshot'])it(move + ' uses exactly five native-power hits', () => {
		for (let seed = 0;
			seed < 5;
			seed++) {
			const r = run(format, move, 'Hydra Bond', seed, { alwaysHit: true });
			assert.equal(r.hits.length, 5);
			assert.deepEqual(r, run(format, move, 'No Ability', seed, { alwaysHit: true, count: 5 }));
		}
	});
	for (const move of ['tripleaxel', 'triplekick', 'populationbomb'])it(move + ' keeps subsequent accuracy checks', () => { assert.equal(run(format, move, 'Hydra Bond', 0, { laterMiss: true }).hits.length, 1); });
	it('Skill Link alone adds its existing 1.5x power multiplier', () => {
		const h = run(format, 'bulletseed', 'Hydra Bond', 0, { alwaysHit: true }), s = run(format, 'bulletseed', 'Skill Link', 0, { alwaysHit: true });
		assert.equal(s.hits.length, 5);
		assert(s.loss[1] > h.loss[1] * 1.4);
	});
	it('stops a native sequence when contact retaliation faints user', () => { assert.equal(run(format, 'tailslap', 'Hydra Bond', 0, { userHP: 1, foe: 'Rough Skin', alwaysHit: true }).hits.length, 1); });
});
describe('Hydra native KO chaining', () => {
	it('sends only the remaining native hits to the opposing active partner', () => {
		const r = run('gen9nofielddoublesbattle', 'bulletseed', 'Hydra Bond', 0, { targetHP: 1, alwaysHit: true });
		assert.deepEqual(r.hits.map(h => h[1]), [1, 3, 3, 3, 3]);
		assert.deepEqual(r.hits.map(h => h[0]), [1, 2, 3, 4, 5]);
		assert.equal(r.loss[2], 0);
		assert.deepEqual(r, run('gen9nofielddoublesbattle', 'bulletseed', 'No Ability', 0, { targetHP: 1, alwaysHit: true, count: 5 }));
	});
	it('stops after both active opponents faint', () => { assert.equal(run('gen9nofielddoublesbattle', 'bulletseed', 'Hydra Bond', 0, { targetHP: 1, otherTargetHP: 1, alwaysHit: true }).hits.length, 2); });
	for (const opts of [{ otherAbility: 'Sap Sipper' }, { otherProtect: true }])it('does not chain into immunity or protection ' + JSON.stringify(opts), () => { assert.equal(run('gen9nofielddoublesbattle', 'bulletseed', 'Hydra Bond', 0, { ...opts, targetHP: 1, alwaysHit: true }).hits.length, 1); });
	it('does not attack an incoming bench replacement in singles', () => { assert.equal(run('gen9nofieldsinglesgame', 'bulletseed', 'Hydra Bond', 0, { targetHP: 1, alwaysHit: true }).hits.length, 1); });
	for (const move of ['tripleaxel', 'triplekick'])it(move + ' preserves escalation and count across a KO', () => {
		const r = run('gen9nofielddoublesbattle', move, 'Hydra Bond', 0, { targetHP: 1, alwaysHit: true });
		assert.deepEqual(r.hits.map(h => h[0]), [1, 2, 3]);
		assert(r.hits[2][2] > r.hits[1][2]);
	});
	it('Population Bomb keeps ten hits and spends remaining hits on the partner', () => {
		const r = run('gen9nofielddoublesbattle', 'populationbomb', 'Hydra Bond', 0, { targetHP: 1, alwaysHit: true });
		assert.equal(r.hits.length, 10);
		assert.equal(r.hits.filter(h => h[1] === 3).length, 9);
	});
});

describe('Hydra maximum-count engine integration', () => {
	it('suppression restores native variable counts', () => { for (let seed = 0; seed < 8; seed++)assert.deepEqual(run('gen9nofieldsinglesgame', 'bulletseed', 'Hydra Bond', seed, { suppressed: true }), run('gen9nofieldsinglesgame', 'bulletseed', 'No Ability', seed)); });
	it('FFA retains its original variable range rather than maximizing it', () => {
		const format = c.calculatorFormats().find(f => f.gameType === 'freeforall').id, scenario = c.validateScenario({ format, move: 'bulletseed', actors: [{ species: 'Mew', ability: 'Hydra Bond' }, ...Array.from({ length: 3 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }), { battle: b, mons } = c.buildCalculatorBattle(scenario, 0);
		try {
			const m = Dex.getActiveMove('bulletseed');
			b.runEvent('ModifyMove', mons[0], mons[1], m, m);
			assert.deepEqual(m.multihit, [3, 5]);
			assert.equal(m.multihitType, 'hydrabond');
		} finally {
			b.destroy();
		}
	});
	for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) for (const move of ['bulletseed', 'tripleaxel', 'populationbomb', 'dragondarts'])it('calculator per-target parity ' + format + ' ' + move, () => {
		const input = { format, move, samples: 8, seed: 11, actors: [{ species: 'Mew', ability: 'Hydra Bond' }, { species: 'Mew', ability: 'No Ability', hpPercent: 1 }, ...Array.from({ length: 2 }, () => ({ species: 'Mew', ability: 'No Ability' }))] }, scenario = c.validateScenario(input), damage = [];
		for (let i = 0;
			i < 8;
			i++) {
			const { battle: b, mons } = c.buildCalculatorBattle(scenario, i);
			try {
				const before = mons.map(m => m.hp);
				b.actions.runMove(move, mons[0], mons[0].getLocOf(mons[1]));
				damage.push(mons.map((m, j) => before[j] - m.hp));
			} finally {
				b.destroy();
			}
		} const result = c.calculateScenario(input);
		for (let j = 0;
			j < result.results.length;
			j++) {
			assert.equal(result.results[j].minNetLoss, Math.min(...damage.map(x => x[j])));
			assert.equal(result.results[j].maxNetLoss, Math.max(...damage.map(x => x[j])));
		}
	});
});
