'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Vigoroth and Restless Drive', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(ability, doubles = false) {
		const spare = { species: 'Mew', ability: 'No Ability', moves: ['watergun', 'splash', 'protect'] };
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[{ species: 'Vigoroth', ability, moves: ['tackle', 'splash', 'protect', 'doublehit'] }, spare],
			[spare, spare],
		]);
		battle.makeChoices('team 12', 'team 12');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Tough Claws', 'Scrappy', 'Restless Drive']) {
		it('keeps modded Vital Spirit with ' + ability, () => {
			const [vigoroth, foe] = start(ability);
			assert.deepEqual(vigoroth.species.abilities, { 0: 'Tough Claws', 1: 'Scrappy', H: 'Restless Drive' });
			assert.deepEqual(vigoroth.getPassives(), ['vitalspirit']);
			assert(!vigoroth.trySetStatus('slp', foe));
			assert(!vigoroth.addVolatile('yawn', foe));
			for (const event of ['ModifyAtk', 'ModifySpA']) {
				assert.equal(battle.runEvent(event, vigoroth, foe, Dex.getActiveMove('drainpunch'), 100), 130);
			}
		});
	}
	it('rewards a later hit once per entry and resets on switching', () => {
		const [vigoroth] = start('Restless Drive');
		battle.makeChoices('move protect', 'move watergun');
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(vigoroth.boosts.spe, 0);
		battle.makeChoices('move splash', 'move watergun');
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(vigoroth.boosts.spe, 0);
		battle.makeChoices('move tackle', 'move watergun');
		assert.equal(vigoroth.boosts.spe, 1);
		vigoroth.clearBoosts();
		battle.makeChoices('move tackle', 'move watergun');
		assert.equal(vigoroth.boosts.spe, 0);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('move tackle', 'move watergun');
		assert.equal(vigoroth.boosts.spe, 1);
	});
	it('distinguishes opposing hits, allies, residual damage and Substitute', () => {
		const [user, foe] = start('Restless Drive', true);
		const ally = battle.p1.active[1];
		const hit = (from, to, id = 'watergun') => battle.actions.runMove(id, from, from.getLocOf(to), { externalMove: true });
		hit(ally, user);
		battle.damage(5, user, foe, Dex.conditions.get('brn'));
		user.addVolatile('substitute');
		user.volatiles.substitute.hp = 1000;
		hit(foe, user);
		hit(user, foe);
		assert.equal(user.boosts.spe, 0);
		user.removeVolatile('substitute');
		hit(foe, user);
		hit(user, ally);
		foe.addVolatile('protect');
		hit(user, foe);
		assert.equal(user.boosts.spe, 0);
		foe.removeVolatile('protect');
		foe.addVolatile('substitute');
		hit(user, foe);
		assert.equal(user.boosts.spe, 1);
	});
});
