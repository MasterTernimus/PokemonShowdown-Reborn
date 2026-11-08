'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Dual Wield and Perfect Striker balance', function () {
	it('uses ordinary pairs for Apex Cleave and boosted pairs for Sacred Edge', () => {
		for (const [ability, expected] of [['Dual Wield', [60, 60]], ['Apex Cleave', [60, 60]], ['Sacred Edge', [150, 15]]]) {
			const battle = common.createBattle({}, [[{ species: 'Mew', ability, moves: ['psychocut'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
			try {
				const p = battle.p1.active[0], q = battle.p2.active[0];
				const move = battle.dex.getActiveMove('psychocut');
				battle.runEvent('ModifyMove', p, q, move, move);
				assert.equal(move.multihit, 2);
				assert.equal(move.multihitType, 'dualwield');
				for (const hit of [1, 2]) {
					move.hit = hit;
					assert.equal(battle.runEvent('BasePower', p, q, move, 100), expected[hit - 1]);
				}
			} finally { battle.destroy(); }
		}
	});

	it('keeps Striker without the removed Proficient component', () => {
		const battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Machamp', ability: 'Perfect Striker', moves: ['lowkick']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		try {
			const attacker = battle.p1.active[0], defender = battle.p2.active[0];
			for (const [kick, expected] of [[true, 140], [false, 100]]) {
				const move = battle.dex.getActiveMove('lowkick');
				move.basePower = 100;
				move.flags = kick ? {kick: 1} : {};
				assert.equal(battle.runEvent('BasePower', attacker, defender, move, 100, true), expected);
			}
		} finally { battle.destroy(); }
	});
});
