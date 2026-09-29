'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Evil Santa Present', function () {
	it('hits each adjacent ally and foe once, with separate extra damage attributed to Evil Santa', function () {
		const battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Delibird', ability: 'Evil Santa', moves: ['present']},
			{species: 'Snorlax', moves: ['splash']},
		], [
			{species: 'Magneton', ability: 'Sturdy', moves: ['splash']},
			{species: 'Lanturn', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1,2', 'team 1,2');
			battle.sample = effects => effects[0]; // Select the 1/8-HP extra effect for each target.
			const delibird = battle.p1.active[0];
			const targets = [battle.p1.active[1], ...battle.p2.active];
			battle.makeChoices('move present 1, move splash', 'move splash, move splash');
			assert.equal(delibird.hp, delibird.maxhp);
			for (const target of targets) assert(target.hp < target.maxhp);
			const present = battle.log.filter(line => line.startsWith('|move|p1a: Delibird|Present|'));
			assert.equal(present.length, 1);
			assert(present[0].includes('[spread] p1b,p2a,p2b'));
			for (const slot of ['p1b: Snorlax', 'p2a: Magneton', 'p2b: Lanturn']) {
				assert(battle.log.some(line => line.startsWith(`|-damage|${slot}|`) && line.includes('[from] ability: Evil Santa')));
			}
		} finally {
			battle.destroy();
		}
	});
	it('rolls its extra effect once even when the target already has that status', function () {
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Delibird', ability: 'Evil Santa', moves: ['present']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1', 'team 1');
			const target = battle.p2.active[0];
			target.setStatus('tox');
			let rolls = 0;
			battle.sample = () => { rolls++; return 'toxic'; };
			battle.makeChoices('move present', 'move splash');
			assert.equal(rolls, 1);
			assert.equal(target.status, 'tox');
			assert(!target.volatiles.confusion && !target.volatiles.curse);
		} finally {
			battle.destroy();
		}
	});
});
