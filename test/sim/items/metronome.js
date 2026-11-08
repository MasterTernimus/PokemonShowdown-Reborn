'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Metronome (item)', function () {
	afterEach(function () {
		battle?.destroy();
		battle = null;
	});

	// Compare identical deterministic battles so custom stats/passives cannot stale damage ranges.
	function sample(item, move, choices, sun = false) {
		battle?.destroy();
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'No Ability', item, moves: [move, 'splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'protect'] }]]);
		battle.makeChoices('team 1', 'team 1');
		battle.randomizer = damage => damage;
		battle.randomChance = (n, d) => n >= d;
		const p = battle.p1.active[0], q = battle.p2.active[0];
		for (const mon of [p, q]) mon.hp = mon.maxhp = mon.baseMaxhp = 5000;
		if (sun) battle.field.setWeather('sunnyday', p);
		return choices.map(([own, foe, clearSun]) => {
			if (clearSun) battle.field.clearWeather();
			const hp = q.hp;
			battle.makeChoices('move ' + own, 'move ' + foe);
			return hp - q.hp;
		});
	}
	function compare(move, choices, factors, sun = false) {
		const baseline = sample('', move, choices, sun);
		const held = sample('Metronome', move, choices, sun);
		for (let i = 0; i < factors.length; i++) {
			if (!factors[i]) {
				assert.equal(baseline[i], 0);
				assert.equal(held[i], 0);
				continue;
			}
			assert(baseline[i] > 0);
			assert(Math.abs(held[i] - baseline[i] * factors[i]) <= 1,
				'Turn ' + (i + 1) + ': ' + held[i] + ' vs baseline ' + baseline[i] + ' × ' + factors[i]);
		}
	}
	it('increases consecutive successful attacks, up to its double-damage cap', () => {
		compare('psystrike', Array.from({ length: 7 }, () => ['psystrike', 'splash']), [1, 1.2, 1.4, 1.6, 1.8, 2, 2]);
	});
	it('resets after switching moves', () => {
		compare('psystrike', [['psystrike', 'splash'], ['splash', 'splash'], ['psystrike', 'splash']], [1, 0, 1]);
	});
	it('resets after Protect blocks an attack', () => {
		compare('psystrike', [['psystrike', 'splash'], ['psystrike', 'protect'], ['psystrike', 'splash']], [1, 0, 1]);
	});
	it('starts a charged attack at the first boost and advances on the next attack', () => {
		compare('dig', Array.from({ length: 4 }, () => ['dig', 'splash']), [0, 1.2, 0, 1.4]);
	});
	it('does not add a charge boost when sun skips Solar Beam charging', () => {
		compare('solarbeam', [['solarbeam', 'splash'], ['solarbeam', 'splash', true], ['solarbeam', 'splash']], [1, 0, 1.2], true);
	});

	it.skip(`should use called moves to determine the Metronome multiplier`, function () {
		battle = common.createBattle([[
			{species: 'goomy', item: 'metronome', moves: ['copycat', 'surf']},
		], [
			{species: 'clefable', evs: {hp: 252}, ability: 'shellarmor', moves: ['softboiled', 'surf']},
		]]);
		battle.makeChoices('move copycat', 'move surf');
		const clefable = battle.p2.active[0];
		let damage = clefable.maxhp - clefable.hp;
		assert.bounded(damage, [45, 53], `Surf should not be Metronome boosted`);

		const hpAfterOneAttack = clefable.hp;
		battle.makeChoices('move copycat', 'move surf');
		damage = hpAfterOneAttack - clefable.hp;
		assert.bounded(damage, [54, 64], `Surf should be Metronome 1 boosted`);

		battle.makeChoices('move surf', 'move softboiled');
		damage = clefable.maxhp - clefable.hp;
		assert.bounded(damage, [63, 74], `Surf should be Metronome 2 boosted`);
	});
});
