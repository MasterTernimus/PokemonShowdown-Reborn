'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

// Compare the same combatants before/after boosts so roster rebalances do not
// change what this test proves about Unaware.
function baselineDamage(attacker, defender, move) {
	battle.randomizer = damage => damage;
	battle.onEvent('CriticalHit', battle.format, () => false);
	return battle.actions.getDamage(attacker, defender, move);
}

describe('Unaware', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should ignore attack stage changes when Pokemon with it are attacked`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', moves: ['softboiled']},
		], [
			{species: 'Wynaut', moves: ['bellydrum', 'wickedblow']},
		]]);

		const baseline = baselineDamage(battle.p2.active[0], battle.p1.active[0], 'wickedblow');
		battle.makeChoices('auto', 'move bellydrum');
		battle.makeChoices('auto', 'move wickedblow');
		const clef = battle.p1.active[0];
		const damage = clef.maxhp - clef.hp;
		assert.equal(damage, baseline);
	});

	it(`should not ignore attack stage changes when Pokemon with it attack`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', moves: ['moonblast', 'nastyplot']},
		], [
			{species: 'Registeel', ability: 'shellarmor', moves: ['sleeptalk']},
		]]);

		const baseline = baselineDamage(battle.p1.active[0], battle.p2.active[0], 'moonblast');
		battle.makeChoices('move nastyplot', 'auto');
		battle.makeChoices('move moonblast', 'auto');
		const regi = battle.p2.active[0];
		const damage = regi.maxhp - regi.hp;
		assert.bounded(damage / baseline, [1.9, 2.1]);
	});

	it(`should ignore defense stage changes when Pokemon with it attack`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', item: 'laggingtail', moves: ['moonblast']},
		], [
			{species: 'Registeel', ability: 'shellarmor', moves: ['amnesia']},
		]]);

		const baseline = baselineDamage(battle.p1.active[0], battle.p2.active[0], 'moonblast');
		battle.makeChoices();
		const regi = battle.p2.active[0];
		const damage = regi.maxhp - regi.hp;
		assert.equal(damage, baseline);
	});

	it(`should not ignore defense stage changes when Pokemon with it are attacked`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', moves: ['luckychant', 'irondefense']},
		], [
			{species: 'Registeel', moves: ['sleeptalk', 'payday']},
		]]);

		battle.makeChoices(); // Apply Lucky Chant's custom damage reduction before measuring.
		const baseline = baselineDamage(battle.p2.active[0], battle.p1.active[0], 'payday');
		battle.makeChoices('move irondefense', 'move payday');
		const clef = battle.p1.active[0];
		const damage = clef.maxhp - clef.hp;
		assert.bounded(damage / baseline, [0.45, 0.55]);
	});

	it(`should be suppressed by Mold Breaker`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', moves: ['softboiled']},
		], [
			{species: 'Wynaut', ability: 'moldbreaker', moves: ['bellydrum', 'wickedblow']},
		]]);

		const baseline = baselineDamage(battle.p2.active[0], battle.p1.active[0], 'wickedblow');
		battle.makeChoices('auto', 'move bellydrum');
		battle.makeChoices('auto', 'move wickedblow');
		const clef = battle.p1.active[0];
		const damage = clef.maxhp - clef.hp;
		assert.bounded(damage / baseline, [3.5, 4.1]);
	});

	it(`should only apply to targets with Unaware in battles with multiple Pokemon`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'manaphy', moves: ['tailglow', 'surf']},
			{species: 'slowbro', ability: 'unaware', moves: ['sleeptalk']},
		], [
			{species: 'clobbopus', ability: 'sturdy', moves: ['sleeptalk']},
			{species: 'clobbopus', ability: 'sturdy', moves: ['sleeptalk']},
		]]);
		battle.makeChoices('move tailglow, auto', 'auto');
		battle.makeChoices('move surf, auto', 'auto');
		assert.equal(battle.p2.active[0].hp, 1);
		assert.equal(battle.p2.active[1].hp, 1);
	});

	it(`should ignore attack stage changes when Pokemon with it are attacked with Foul Play`, function () {
		battle = common.createBattle([[
			{species: 'Clefable', ability: 'unaware', moves: ['bellydrum']},
		], [
			{species: 'Wynaut', ability: 'superluck', moves: ['focusenergy', 'foulplay']},
		]]);

		const baseline = baselineDamage(battle.p2.active[0], battle.p1.active[0], 'foulplay');
		battle.makeChoices();
		const hpBefore = battle.p1.active[0].hp;
		battle.makeChoices('auto', 'move foulplay');

		const clef = battle.p1.active[0];
		const damage = hpBefore - clef.hp;
		assert.equal(damage, baseline);
	});
});
