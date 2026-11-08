'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe("Choice Items", function () {
	afterEach(function () {
		battle.destroy();
	});

	it("should suspend Choice lock throughout persistent G-Max", () => {
		battle = common.createBattle({ formatid: 'gen9factoryfield' }, [[
			{ species: 'charizard', gigantamax: true, moves: ['sleeptalk', 'splash'], item: 'choicescarf' },
		], [
			{species: 'wynaut', moves: ['sleeptalk']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move 1', 'auto');
		assert.throws(() => battle.choose('p1', 'move 2'), 'Choice lock applies before G-Max');
		battle.makeChoices('move 1 dynamax', 'auto');
		assert(battle.p1.active[0].volatiles.dynamax);
		battle.makeChoices();
		battle.makeChoices('move 2', 'auto');
		assert(battle.p1.active[0].volatiles.dynamax, 'G-Max does not expire after three turns');
		battle.makeChoices('move 2', 'auto');
		battle.makeChoices('move 1', 'auto');
	});
});
