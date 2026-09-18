'use strict';

const assert = require('../../assert');
const common = require('../../common');
let battle;

describe('Profile ability field regressions', function () {
	afterEach(() => battle?.destroy());
	for (const ability of ['protectiveward', 'riptideclaws']) {
		it(`${ability} retains the Shell Armor entry bonus`, function () {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Mew', ability, moves: ['splash']},
			], [{species: 'Mew', ability: 'noability', moves: ['splash']}]]);
			battle.makeChoices('team 1', 'team 1');
			const pokemon = battle.p1.active[0];
			battle.field.setTerrain('fairytaleterrain', pokemon);
			pokemon.boosts.def = 0;
			battle.singleEvent('Start', pokemon.getAbility(), pokemon.abilityState, pokemon);
			assert.equal(pokemon.boosts.def, 1);
		});
	}
	it('Riptide Claws bypasses Levitate during attacks', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Kingler', ability: 'riptideclaws', moves: ['earthquake']},
		], [{species: 'Rotom', ability: 'levitate', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const target = battle.p2.active[0];
		battle.makeChoices('move earthquake', 'move splash');
		assert(target.hp < target.maxhp, 'Mold Breaker should bypass Ground immunity');
	});
});
