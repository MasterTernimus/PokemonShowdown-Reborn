'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Requiem', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should progress each directly interacting foe from Perish Song to 1/8 Curse', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['bite', 'crunch']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];

		battle.makeChoices('move splash', 'move crunch');
		assert(foe.volatiles.perishsong);
		assert.false(foe.volatiles.curse);

		battle.makeChoices('move splash', 'move bite');
		assert(foe.volatiles.curse);
		assert.equal(foe.volatiles.curse.sourceEffect.id, 'requiem');
	});

	it('should create Haunted Field without cursing active Pokemon when it faints', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		], [
			{species: 'Mewtwo', ability: 'pressure', moves: ['shadowball']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1');
		const dusknoir = battle.p1.active[0];
		dusknoir.sethp(1);
		battle.makeChoices('move splash', 'move shadowball');

		assert.equal(battle.field.terrain, 'hauntedterrain');
		assert.false(battle.p2.active[0].volatiles.curse);
	});
});
