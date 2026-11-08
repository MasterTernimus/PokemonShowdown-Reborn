'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

function recordRageFistPower() {
	const powers = [];
	battle.onEvent('BasePower', battle.format, (power, source, target, move) => {
		if (move.id === 'ragefist') powers.push([source.name, power]);
	});
	return powers;
}

describe('Rage Fist', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should increase BP by 20 each time the user is hit`, () => {
		battle = common.createBattle([[
			{species: 'Primeape', moves: ['ragefist']},
		], [
			{species: 'Umbreon', ability: 'shellarmor', moves: ['tackle']},
		]]);
		const powers = recordRageFistPower();
		battle.makeChoices();
		assert.deepEqual(powers, [['Primeape', 50]]);

		battle.makeChoices();
		assert.deepEqual(powers, [['Primeape', 50], ['Primeape', 70]]);
	});

	it(`should not increase BP after being hit by status moves`, function () {
		battle = common.createBattle([[
			{species: 'Primeape', moves: ['ragefist']},
		], [
			{species: 'Umbreon', ability: 'shellarmor', moves: ['taunt']},
		]]);
		const powers = recordRageFistPower();

		battle.makeChoices();
		assert.deepEqual(powers, [['Primeape', 50]]);

		battle.makeChoices();
		assert.deepEqual(powers, [['Primeape', 50], ['Primeape', 50]]);
	});

	it(`should increase BP after each hit of multi-hit moves`, function () {
		battle = common.createBattle([[
			{species: 'Primeape', ability: 'noguard', moves: ['sleeptalk', 'ragefist']},
		], [
			{species: 'Umbreon', ability: 'shellarmor', moves: ['doublehit', 'sleeptalk']},
		]]);
		const powers = recordRageFistPower();

		battle.makeChoices();
		battle.makeChoices('move ragefist', 'move sleeptalk');
		assert.equal(battle.p1.active[0].timesAttacked, 2);
		assert.deepEqual(powers, [['Primeape', 90]]);
	});

	it(`should use user's own number of times hit when called by another move`, function () {
		battle = common.createBattle([[
			{species: 'Primeape', moves: ['ragefist']},
		], [
			{species: 'Umbreon', ability: 'shellarmor', moves: ['copycat']},
		]]);
		const powers = recordRageFistPower();

		battle.makeChoices();
		assert.deepEqual(powers, [['Primeape', 50], ['Umbreon', 70]]);
	});

	it(`should not increase BP when the user's Substitute is damaged or broken`, function () {
		battle = common.createBattle([[
			{species: 'Primeape', moves: ['substitute', 'ragefist']},
		], [
			{species: 'Umbreon', ability: 'shellarmor', moves: ['dragonrage', 'sleeptalk']},
		]]);

		battle.makeChoices();
		battle.makeChoices();

		const primeape = battle.p1.active[0];
		assert.equal(primeape.timesAttacked, 0);
	});

	it(`should not increase BP when healed by an ally's Pollen Puff`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Wynaut', moves: ['pollenpuff']},
			{species: 'Annihilape', moves: ['sleeptalk', 'bellydrum']},
		], [
			{species: 'Wobbuffet', moves: ['sleeptalk']},
			{species: 'Lucario', moves: ['sleeptalk']},
		]]);

		const annihilape = battle.p1.active[1];
		battle.makeChoices('move pollenpuff -2, move sleeptalk', 'auto');
		assert.equal(annihilape.timesAttacked, 0, `timesAttacked should not have incremented after a full HP Pollen Puff`);

		battle.makeChoices('move pollenpuff -2, move bellydrum', 'auto');
		assert.equal(annihilape.timesAttacked, 0, `timesAttacked should not have incremented after a not-full HP Pollen Puff`);
	});

	it(`should increase BP when hit by Dragon Darts`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'Primeape', moves: ['sleeptalk', 'ragefist']},
			{species: 'Wynaut', moves: ['sleeptalk', 'allyswitch']},
		], [
			{species: 'Dreepy', moves: ['dragondarts']},
			{species: 'Pichu', moves: ['sleeptalk']},
		]]);

		battle.makeChoices('auto', 'move dragondarts 1, move sleeptalk');
		const primeape = battle.p1.active[1];
		assert.equal(primeape.timesAttacked, 1, `timesAttacked should have been increased by Dragon Darts targeting the left slot`);

		battle.makeChoices('move sleeptalk, move allyswitch', 'move dragondarts 1, move sleeptalk');
		assert.equal(primeape.timesAttacked, 2, `timesAttacked should have been increased by Dragon Darts targeting the right slot`);
	});
});
