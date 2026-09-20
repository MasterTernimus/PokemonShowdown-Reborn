'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Divine Mockery', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('replaces Hydra Breaker on Mega Barbaracle and retains the old alias', () => {
		assert.equal(Dex.species.get('Barbaracle-Mega').abilities[0], 'Divine Mockery');
		assert.equal(Dex.abilities.get('Hydra Breaker').id, 'divinemockery');
	});

	it('combines Hydra Bond, Mold Breaker, Sniper, and Water Bubble', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Barbaracle', item: 'Barbaracite', moves: ['splash', 'waterfall'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const holder = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(holder.species.id, 'barbaraclemega');
		assert.equal(holder.ability, 'divinemockery');
		assert.equal(holder.boosts.accuracy, 1);
		for (const component of ['hydrabond', 'moldbreaker', 'sniper', 'waterbubble']) {
			assert(holder.hasAbility(component), `Missing ${component}`);
		}
		const waterMove = battle.dex.getActiveMove('waterfall');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, waterMove, holder, foe);
		assert.equal(waterMove.multihit, 3);
		assert.equal(waterMove.multihitType, 'hydrabond');
		assert.equal(waterMove.ignoreAbility, true);
		assert.equal(waterMove.forceSTAB, true);
		assert.equal(battle.runEvent('ModifyAtk', holder, foe, waterMove, 100), 200);
		assert.equal(battle.runEvent('ModifySpA', holder, foe, waterMove, 100), 200);
		const fireMove = battle.dex.getActiveMove('flamethrower');
		assert.equal(battle.runEvent('SourceModifySpA', holder, foe, fireMove, 100), 50);
		assert.equal(battle.runEvent('SourceModifyAtk', holder, foe, fireMove, 100), 50);
		assert.equal(holder.setStatus('brn'), false);
		foe.getMoveHitData(waterMove).crit = true;
		assert.equal(battle.runEvent('ModifyDamage', holder, foe, waterMove, 100), 225);
	});
});
