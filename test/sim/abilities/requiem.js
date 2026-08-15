'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Requiem', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should mark each foe with Perish Song only on its first direct damaging interaction', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash', 'shadowpunch']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['bite', 'crunch']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];

		battle.makeChoices('move splash', 'move crunch');
		assert(foe.volatiles.perishsong);
		assert.false(foe.volatiles.curse);

		battle.makeChoices('move splash', 'move bite');
		assert(foe.volatiles.perishsong);
		assert.false(foe.volatiles.curse);
	});

	it('should mark a foe when Dusknoir damages it', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['shadowpunch']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];

		battle.makeChoices('move shadowpunch', 'move splash');
		assert(foe.volatiles.requiem);
		assert(foe.volatiles.perishsong);
	});

	it('should clear its mark when the marked foe switches out', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['bite']},
			{species: 'Celebi', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1, 2');
		const markedFoe = battle.p2.active[0];

		battle.makeChoices('move splash', 'move bite');
		assert(markedFoe.volatiles.requiem);
		battle.makeChoices('move splash', 'switch 2');
		assert.false(markedFoe.volatiles.requiem);
	});

	it('should restore 1/4 max HP when an opposing Pokemon faints', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['shadowpunch']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const dusknoir = battle.p1.active[0];
		const foe = battle.p2.active[0];
		dusknoir.sethp(Math.floor(dusknoir.maxhp / 2));
		const hpBefore = dusknoir.hp;
		foe.sethp(1);

		battle.makeChoices('move shadowpunch', 'move splash');
		assert.equal(dusknoir.hp, hpBefore + Math.floor(dusknoir.baseMaxhp / 4));
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

describe("Reaper's Grip", function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should expose and apply both Iron Fist and Pressure', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'reapersgrip', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const dusknoir = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert(dusknoir.hasAbility('ironfist'));
		assert(dusknoir.hasAbility('pressure'));
		assert.statStage(foe, 'def', -1);
		assert.statStage(foe, 'spd', -1);

		const ppBefore = foe.moveSlots[0].pp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.moveSlots[0].pp, ppBefore - 2);
	});
});
