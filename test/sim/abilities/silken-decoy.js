'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Silken Decoy', function () {
	afterEach(() => battle?.destroy());

	it('Mega Ariados starts with a cocoon and blocks the rest of a multi-hit move', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Ariados', ability: 'Neutralization', item: 'Aridiate', moves: ['Splash']},
		], [
			{species: 'Cloyster', moves: ['Icicle Spear']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const ariados = battle.p1.active[0];

		assert.false.hurts(ariados, () => battle.makeChoices('move splash mega', 'move iciclespear'));
		assert.species(ariados, 'Ariados-Mega');
		assert.equal(ariados.ability, 'silkendecoy');
		assert.false(ariados.abilityState.silkenDecoyCocoon);
		assert(battle.log.some(line => line.includes("Silken Decoy spun a protective cocoon")));
		assert(battle.log.some(line => line.includes("protective cocoon blocked the hit")));
	});
});
