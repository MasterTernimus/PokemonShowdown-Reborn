'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Clangorous Soulblaze', () => {
	const kommo = { species: 'Kommo-o', ability: 'No Ability', item: 'Kommonium Z', moves: ['clangingscales'] };
	const teammate = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'protect'] };
	let battle;
	afterEach(() => battle.destroy());

	function checkTarget(user, target) {
		for (const active of battle.getAllActive()) {
			assert.equal(active.hp < active.maxhp, active === target);
		}
		for (const stat of ['atk', 'def', 'spa', 'spd', 'spe']) assert.equal(user.boosts[stat], 1);
		return target.maxhp - target.hp;
	}

	function doublesDamage(protect) {
		battle = common.createBattle({ gameType: 'doubles' }, [[kommo, teammate], [teammate, teammate]]);
		battle.randomizer = damage => damage;
		const user = battle.p1.active[0];
		const target = battle.p2.active[1];
		assert.deepEqual(user.getMoveRequestData().canZMove, [{ move: 'Clangorous Soulblaze', target: 'adjacentFoe' }]);
		assert.equal(battle.validTarget(battle.p1.active[1], user, 'adjacentFoe'), false);
		battle.makeChoices('move clangingscales 2 zmove, move splash', 'move splash, move ' + (protect ? 'protect' : 'splash'));
		return checkTarget(user, target);
	}

	it('damages only the chosen doubles foe, grants all five boosts and preserves Protect chip', () => {
		const full = doublesDamage(false);
		battle.destroy();
		const guarded = doublesDamage(true);
		assert(guarded > 0 && guarded < full);
	});

	for (const side of ['p2', 'p3', 'p4']) {
		it(`can select ${side} as the sole FFA target and grants all five boosts once`, () => {
			battle = common.createBattle({ gameType: 'freeforall' }, [[kommo], [teammate], [teammate], [teammate]]);
			const user = battle.p1.active[0];
			const target = battle[side].active[0];
			assert.equal(user.getMoveRequestData().canZMove[0].target, 'adjacentFoe');
			battle.makeChoices(`move clangingscales ${user.getLocOf(target)} zmove`, 'move splash', 'move splash', 'move splash');
			checkTarget(user, target);
		});
	}
});
