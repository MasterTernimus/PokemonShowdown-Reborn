'use strict';

const assert = require('../../assert');
const common = require('../../common');

describe('Lucky Chant custom effect', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('lasts five turns at +3 priority, blocks enemy critical hits, and reduces incoming damage by 10%', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Clefable', ability: 'Magic Guard', moves: ['luckychant', 'tackle']},
		], [
			{species: 'Eevee', ability: 'Run Away', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const move = battle.dex.moves.get('luckychant');
		assert.equal(move.priority, 3);
		battle.p1.addSideCondition('luckychant', battle.p1.active[0], move);
		assert.equal(battle.p1.sideConditions.luckychant.duration, 5);
		const clefable = battle.p1.active[0];
		const eevee = battle.p2.active[0];
		const tackle = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', eevee, clefable, tackle, 100), 90);
		assert.equal(battle.runEvent('CriticalHit', clefable, eevee, tackle), false);
		assert.equal(battle.runEvent('ModifyDamage', clefable, eevee, tackle, 100), 100,
			'Lucky Chant must not reduce its own side’s outgoing damage');
		assert.equal(move.condition.onModifyCritRatio, undefined,
			'Lucky Chant must not boost its own side’s critical-hit rate');
	});
});
