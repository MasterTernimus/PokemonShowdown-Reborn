'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Requiem', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should disable the damaging move instead of applying a Perish Song mark', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash', 'shadowpunch']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['bite', 'crunch']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];

		battle.makeChoices('move splash', 'move crunch');
		assert.false(foe.volatiles.perishsong);
		assert.false(foe.volatiles.curse);

		battle.makeChoices('move splash', 'move bite');
		assert.false(foe.volatiles.perishsong);
		assert.false(foe.volatiles.curse);
	});

	it('should not apply a mark when Dusknoir damages a foe', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['shadowpunch']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const foe = battle.p2.active[0];

		battle.makeChoices('move shadowpunch', 'move splash');
		assert.false(foe.volatiles.requiem);
		assert.false(foe.volatiles.perishsong);
	});

	it('should clear the inflicted Disable when the foe switches out', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'requiem', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['bite']},
			{species: 'Celebi', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1, 2');
		const markedFoe = battle.p2.active[0];
		battle.randomChance = (n, d) => n >= d || (n === 3 && d === 10);

		battle.makeChoices('move splash', 'move bite');
		assert(markedFoe.volatiles.disable);
		assert.false(markedFoe.volatiles.requiem);
		battle.makeChoices('move splash', 'switch 2');
		assert.false(markedFoe.volatiles.requiem);
	});

	it('should not heal when an opposing Pokemon faints', () => {
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
		assert.equal(dusknoir.hp, hpBefore);
	});

	it('should not create a field or curse active Pokemon when it faints', () => {
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

		assert.equal(battle.field.terrain, '');
		assert.false(battle.p2.active[0].volatiles.curse);
	});
});

describe("Reaper's Grip", function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should omit removed Iron Fist and Pressure effects', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Dusknoir', ability: 'reapersgrip', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const dusknoir = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert(!dusknoir.hasAbility('ironfist'));
		assert(dusknoir.hasAbility('selfsufficient'));
		assert(!dusknoir.hasAbility('pressure'));
		assert.statStage(foe, 'def', 0);
		assert.statStage(foe, 'spd', 0);

		const ppBefore = foe.moveSlots[0].pp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.moveSlots[0].pp, ppBefore - 1);
	});
});
