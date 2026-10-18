'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Siege Launcher Free-for-All power', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(mode) {
		battle = common.createBattle({}, [
			[{species: 'Mew', ability: 'Siege Launcher', moves: ['metalclaw']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.gameType = mode;
		for (const pokemon of battle.getAllActive()) pokemon.getPassives = () => [];
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const mode of ['singles', 'doubles', 'freeforall']) {
		for (const move of ['metalclaw', 'aurasphere', 'psychocut']) {
			it(`${mode}: both ${move} hits retain independent boosts`, () => {
				const [source, target] = setup(mode);
				const activeMove = Dex.getActiveMove(move);
				battle.runEvent('ModifyMove', source, target, activeMove, activeMove);
				assert.equal(activeMove.multihit, 2);
				assert.equal(activeMove.multihitType, 'dualwield');
				const boost = activeMove.flags.pulse || activeMove.flags.bullet ? 1.5 : 1;
				const expected = 100 * (mode === 'freeforall' ? 1 : 0.6) * boost;
				for (const hit of [1, 2]) {
					activeMove.hit = hit;
					assert.equal(battle.runEvent('BasePower', source, target, activeMove, 100), expected);
				}
			});
		}
	}
	it('does not turn native multihit attacks into full-power pairs', () => {
		const [source, target] = setup('freeforall');
		const move = Dex.getActiveMove('bulletseed');
		battle.runEvent('ModifyMove', source, target, move, move);
		assert.deepEqual(move.multihit, [2, 5]);
		assert(!move.multihitType);
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 150);
	});
});
