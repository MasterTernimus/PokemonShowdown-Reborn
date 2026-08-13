'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Signature move owner bonuses', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should only let Palkia make Spacial Rend bypass Protect', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Garchomp', ability: 'roughskin', moves: ['spacialrend']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['protect']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move spacialrend', 'move protect');
		assert.fullHP(battle.p2.active[0]);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Palkia', ability: 'pressure', moves: ['spacialrend']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['protect']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move spacialrend', 'move protect');
		assert(battle.p2.active[0].hp < battle.p2.active[0].maxhp);
	});

	it('should only let Dialga queue Roar of Time delayed damage', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Garchomp', ability: 'roughskin', moves: ['roaroftime']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move roaroftime', 'move splash');
		assert.false(battle.p2.slotConditions[0]?.futuremove);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dialga', ability: 'pressure', moves: ['roaroftime']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move roaroftime', 'move splash');
		assert(battle.p2.slotConditions[0]?.futuremove);
	});

	it('should only grant Shadow Force Guard to Giratina', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Golurk', ability: 'ironfist', item: 'powerherb', moves: ['shadowforce']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move shadowforce', 'move splash');
		assert.false(battle.p1.active[0].volatiles.shadowforceguard);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Giratina', ability: 'pressure', item: 'powerherb', moves: ['shadowforce']},
		], [
			{species: 'Shuckle', ability: 'sturdy', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move shadowforce', 'move splash');
		assert(battle.p1.active[0].volatiles.shadowforceguard);
	});
});
