'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Nose Formation', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should trigger Elevate when a Mini-Nose knocks out a target', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Probopass', ability: 'noseformation', moves: ['falseswipe']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const probopass = battle.p1.active[0];
		battle.p2.active[0].sethp(1);

		battle.makeChoices('move falseswipe', 'move splash');
		assert.statStage(probopass, probopass.getBestStat(true, true), 1);
	});
});
