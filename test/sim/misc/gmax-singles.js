'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('G-Max field Singles option', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('allows Gigantamaxing in a field Singles format', function () {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Charizard', gigantamax: true, moves: ['flamethrower']},
		], [
			{species: 'Blastoise', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move flamethrower dynamax', 'move splash');

		assert(battle.p1.active[0].volatiles.dynamax);
		assert.species(battle.p1.active[0], 'Charizard-Gmax');
	});

	it('keeps ordinary no-field Singles unable to Gigantamax', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Charizard', gigantamax: true, moves: ['flamethrower']},
		], [
			{species: 'Blastoise', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move flamethrower dynamax', 'move splash');

		assert.false(battle.p1.active[0].volatiles.dynamax);
		assert.species(battle.p1.active[0], 'Charizard');
	});
});
