'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Assurance', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should double its base power if the target already took damage this turn`, function () {
		battle = common.createBattle([[
			{species: 'Sneasel', ability: 'sturdy', moves: ['assurance']},
		], [
			{species: 'Regieleki', ability: 'shellarmor', moves: ['wildcharge']},
		]]);
		const regi = battle.p2.active[0];
		const powers = [];
		battle.onEvent('BasePower', battle.format, (power, source, target, move) => {
			if (move.id === 'assurance') powers.push(power);
		});
		regi.boostBy({atk: 6});
		battle.makeChoices();
		assert.deepEqual(powers, [120]);
		assert(battle.log.some(line => line.includes('[from] Recoil')));
	});

	it(`should double the power against damaged Pokemon, not damaged slots`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: 'bulbasaur', level: 1, moves: ['sleeptalk']},
			{species: 'landorus', moves: ['sleeptalk']},
		], [
			{species: 'alakazam', moves: ['psychic']},
			{species: 'pawniard', moves: ['assurance']},
		]]);
		battle.makeChoices('auto', 'move psychic 1, move assurance 1');
		const landorus = battle.p1.active[1];
		const damage = landorus.maxhp - landorus.hp;
		assert.bounded(damage, [63, 75]); // 60 BP; if it was 120 BP, it would be 124-147 damage
	});

	it(`should not double its base power if the target lost HP due to Pain Split`, function () {
		battle = common.createBattle([[
			{species: 'Greedent', moves: ['assurance']},
		], [
			{species: 'Wailord', moves: ['painsplit']},
		]]);
		const powers = [];
		battle.onEvent('BasePower', battle.format, (power, source, target, move) => {
			if (move.id === 'assurance') powers.push(power);
		});
		battle.makeChoices();
		assert.deepEqual(powers, [60]);
		assert(battle.log.some(line => line.includes('|-sethp|')));
	});
});
