'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Abyss Lure', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('absorbs Electric- and Water-type moves while boosting both offenses', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Lanturn', ability: 'abysslure', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['thunderbolt', 'surf']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const lure = battle.p1.active[0];
		battle.directDamage(100, lure);
		const damagedHP = lure.hp;

		battle.makeChoices('move splash', 'move thunderbolt');
		assert(lure.hp > damagedHP, 'Electric Absorb should heal the user');
		assert.statStage(lure, 'atk', 1);
		assert.statStage(lure, 'spa', 1);

		battle.directDamage(100, lure);
		const secondDamagedHP = lure.hp;
		battle.makeChoices('move splash', 'move surf');
		assert(lure.hp > secondDamagedHP, 'Water Absorb should heal the user');
		assert.statStage(lure, 'atk', 2);
		assert.statStage(lure, 'spa', 2);
	});
});
