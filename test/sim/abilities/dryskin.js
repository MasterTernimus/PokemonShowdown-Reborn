'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Dry Skin', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should take 1/8 max HP every turn that Sunny Day is active', function () {
		battle = common.createBattle([[
			{species: 'Toxicroak', ability: 'dryskin', moves: ['bulkup']},
		], [
			{species: 'Ninetales', ability: 'flashfire', moves: ['sunnyday']},
		]]);
		const dryMon = battle.p1.active[0];
		assert.hurtsBy(dryMon, Math.floor(dryMon.maxhp / 8), () => battle.makeChoices('move bulkup', 'move sunnyday'));
	});

	it('should heal 1/8 max HP every turn that Rain Dance is active', function () {
		battle = common.createBattle([[
			{species: 'Toxicroak', ability: 'dryskin', moves: ['substitute']},
		], [
			{species: 'Politoed', ability: 'damp', moves: ['encore', 'raindance']},
		]]);
		const dryMon = battle.p1.active[0];
		battle.makeChoices('move substitute', 'move encore');
		assert.hurtsBy(dryMon, -Math.floor(dryMon.maxhp / 8), () => battle.makeChoices('move substitute', 'move raindance'));
	});

	it('should grant immunity to Water-type moves and heal 1/4 max HP', function () {
		battle = common.createBattle([[
			{species: 'Toxicroak', ability: 'dryskin', moves: ['substitute']},
		], [
			{species: 'Politoed', ability: 'damp', moves: ['watergun']},
		]]);
		battle.makeChoices('move substitute', 'move watergun');
		assert.fullHP(battle.p1.active[0]);
	});

	it('should cause the user to take 1.25x damage from Fire-type attacks', function () {
		battle = common.createBattle([[
			{species: 'Toxicroak', ability: 'dryskin', moves: ['bulkup']},
		], [
			{species: 'Haxorus', ability: 'unnerve', moves: ['incinerate']},
		]]);
		battle.randomizer = damage => damage;
		battle.onEvent('CriticalHit', battle.format, () => false);
		const defender = battle.p1.active[0];
		defender.setAbility('No Ability');
		const unboosted = battle.actions.getDamage(battle.p2.active[0], defender, 'incinerate');
		defender.setAbility('Dry Skin');
		battle.makeChoices('move bulkup', 'move incinerate');
		const damage = battle.p1.active[0].maxhp - battle.p1.active[0].hp;
		assert.bounded(damage / unboosted, [1.2, 1.3]);
	});

	it('should be suppressed by Mold Breaker', function () {
		battle = common.createBattle([[
			{species: 'Toxicroak', ability: 'dryskin', moves: ['bulkup']},
		], [
			{species: 'Haxorus', ability: 'moldbreaker', moves: ['incinerate', 'surf']},
		]]);
		battle.randomizer = damage => damage;
		battle.onEvent('CriticalHit', battle.format, () => false);
		const defender = battle.p1.active[0];
		defender.setAbility('No Ability');
		const unboosted = battle.actions.getDamage(battle.p2.active[0], defender, 'incinerate');
		defender.setAbility('Dry Skin');
		battle.makeChoices('move bulkup', 'move incinerate');
		const target = battle.p1.active[0];
		const damage = target.maxhp - target.hp;
		assert.equal(damage, unboosted);
		assert.hurts(target, () => battle.makeChoices('move bulkup', 'move surf'));
	});
});
