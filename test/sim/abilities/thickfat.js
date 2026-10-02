'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Thick Fat', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should halve damage from Fire- or Ice-type attacks`, function () {
		battle = common.createBattle([[
			{species: 'Miltank', ability: 'thickfat', item: 'lumberry', moves: ['splash', 'recover']},
		], [
			{species: 'Wynaut', moves: ['icebeam', 'flamethrower']},
		]]);
		const miltank = battle.p1.active[0];
		battle.randomizer = damage => damage;
		battle.onEvent('CriticalHit', battle.format, () => false);
		miltank.setAbility('No Ability');
		const baseline = battle.actions.getDamage(battle.p2.active[0], miltank, 'icebeam');
		miltank.setAbility('Thick Fat');
		const damageRange = [Math.floor(baseline * 0.45), Math.ceil(baseline * 0.55)];
		battle.makeChoices('move splash', 'move icebeam');
		assert.bounded(miltank.maxhp - miltank.hp, damageRange);
		battle.makeChoices('move recover', 'move flamethrower');
		assert.bounded(miltank.maxhp - miltank.hp, damageRange);
	});

	common.itGen(3, `should halve damage from Fire- or Ice-type attacks in past generations, even when holding a type-boosting item`, function () {
		battle = common.gen(3).createBattle([[
			{species: 'Miltank', ability: 'thickfat', moves: ['recover']},
		], [
			{species: 'Wynaut', item: 'nevermeltice', moves: ['icebeam']},
		]]);
		const miltank = battle.p1.active[0];
		battle.makeChoices();
		assert.bounded(miltank.maxhp - miltank.hp, [18, 22]);
	});

	it(`should be suppressed by Mold Breaker`, function () {
		battle = common.createBattle([[
			{species: 'Miltank', ability: 'thickfat', item: 'lumberry', moves: ['splash', 'recover']},
		], [
			{species: 'Wynaut', ability: 'moldbreaker', moves: ['icebeam', 'flamethrower']},
		]]);
		const miltank = battle.p1.active[0];
		battle.randomizer = damage => damage;
		battle.onEvent('CriticalHit', battle.format, () => false);
		miltank.setAbility('No Ability');
		const baseline = battle.actions.getDamage(battle.p2.active[0], miltank, 'icebeam');
		miltank.setAbility('Thick Fat');
		const damageRange = [baseline, baseline];
		battle.makeChoices('move splash', 'move icebeam');
		assert.bounded(miltank.maxhp - miltank.hp, damageRange);
		battle.makeChoices('move recover', 'move flamethrower');
		assert.bounded(miltank.maxhp - miltank.hp, damageRange);
	});
});
