'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Ultra Ego successful pinch consumption', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const ability of ['Ultra Ego', 'Burning Ego', 'Primal Ego', 'Perfect Ego'])it(ability + ' retains blocked pinch recovery for the next eligible hit window', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability, moves: ['tackle'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]); battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0], foe = battle.p2.active[0], move = battle.dex.getActiveMove('tackle');
		battle.field.changeTerrain('ashenbeachterrain', p); p.hp = 1;
		assert(p.addVolatile('healblock', foe));
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, move, 10);
		assert.equal(p.hp, 1);
		assert.equal(p.abilityState.ultraEgoPinch, false, 'blocked healing must not spend the pinch recovery');
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1);
		p.removeVolatile('healblock');
		// Preserve the existing window reset: the holder completes its own damaging move.
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, move);
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, move, 10);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 4));
		assert.equal(p.abilityState.ultraEgoPinch, true);
		p.hp = 1;
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, move);
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, move, 10);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 16), 'successful pinch is spent; normal hit recovery remains');
	});
});
