'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
const composites = require('./starter-proficient-ids.json');
function setup(ability) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: ['psychic', 'splash']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Proficient restored to starter signature composites', () => {
	afterEach(() => { battle?.destroy(); });
	for (const ability of composites) {
		it(`${ability} applies exactly one same-type Proficient modifier`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('psychic');
			const sameType = battle.runEvent('BasePower', user, foe, move, 100);
			user.setType('Dark');
			const otherType = battle.runEvent('BasePower', user, foe, move, 100);
			assert(Math.abs(sameType - otherType * 1.3) <= 1, `${sameType} vs ${otherType}`);
			assert.equal(user.hasAbility('proficient'), true);
			assert(!/proficient/i.test(user.getAbility().desc + ' ' + user.getAbility().shortDesc));
		});
	}
	it('preserves standalone Proficient', () => {
		const [user, foe] = setup('Proficient');
		assert(user.hasAbility('proficient'));
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('psychic'), 100), 130);
	});
	for (const ability of ['Soul Fire', 'Violent Rush', 'Invigorate', 'Protean', 'Moxie']) {
		it(`does not add Proficient to shared or ordinary ${ability}`, () => {
			const [user] = setup(ability);
			assert.equal(user.hasAbility('proficient'), false);
		});
	}
	for (const ability of ['Blazing Tempo', 'Perfect Striker']) {
		it(`preserves the kick boost in ${ability}`, () => {
			const [user, foe] = setup(ability);
			assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('highjumpkick'), 100), 140);
		});
	}
	for (const ability of ['Water Barrage', 'Verdant Drake', 'Fortress Shell']) {
		it(`preserves reduced Dual Wield hits in ${ability}`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('waterpulse');
			battle.singleEvent('ModifyMove', user.getAbility(), user.abilityState, move, user, foe);
			assert.equal(move.multihit, 2);
			assert.equal(battle.runEvent('BasePower', user, foe, move, 100), 60);
		});
	}
});
