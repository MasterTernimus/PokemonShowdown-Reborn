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
			battle.random = () => 0; // Select the 1/8-HP extra effect for each target.
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
});
