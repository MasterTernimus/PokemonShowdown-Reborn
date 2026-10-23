'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Poison Tail status payoff', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });
	function setup(ability = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability, moves: ['poisontail'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const status of ['', 'psn', 'tox', 'brn', 'par', 'slp', 'frz']) {
		it(`has correct power against ${status || 'no status'}`, () => {
			const [p, q] = setup();
			if (status) assert(q.setStatus(status));
			const move = Dex.getActiveMove('poisontail');
			assert.equal(move.basePowerCallback.call(battle, p, q, move), status ? 120 : 60);
		});
	}
	it('does not count confusion or retain the old poison/critical effects', () => {
		const [p, q] = setup();
		assert(q.addVolatile('confusion'));
		const move = Dex.getActiveMove('poisontail');
		assert.equal(move.basePowerCallback.call(battle, p, q, move), 60);
		assert.equal(move.accuracy, 100);
		assert.equal(move.pp, 15);
		assert.equal(move.critRatio, 1);
		assert(!move.secondaries?.length);
		for (const flag of ['tail', 'slicing', 'contact', 'protect', 'mirror', 'metronome']) assert(move.flags[flag]);
	});
	for (const ability of ['Sharpness', 'Whiplash']) {
		it(`retains ${ability} interaction for both power levels`, () => {
			const [p, q] = setup(ability);
			const move = Dex.getActiveMove('poisontail');
			assert.equal(battle.runEvent('BasePower', p, q, move, 60), 90);
			assert.equal(battle.runEvent('BasePower', p, q, move, 120), 180);
		});
	}
});
