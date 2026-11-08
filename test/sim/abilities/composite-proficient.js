'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
const composites = require('./starter-proficient-ids.json');
// Later starter reworks moved the generic boost to species passives. These
// five selected abilities retain an explicit Proficient component.
const retained = new Set(['verdanthospitality', 'mightyjaw', 'terragift', 'burningrage', 'fallenstar']);
function setup(ability) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: ['psychic', 'splash']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Starter composites after the Proficient/passive split', () => {
	afterEach(() => { battle?.destroy(); });
	for (const ability of composites) {
		it(`${ability} ${retained.has(ability) ? 'retains one' : 'does not add a'} selected-ability Proficient modifier`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('psychic');
			const sameType = battle.runEvent('BasePower', user, foe, move, 100);
			user.setType('Dark');
			const otherType = battle.runEvent('BasePower', user, foe, move, 100);
			assert(Math.abs(sameType - otherType * (retained.has(ability) ? 1.3 : 1)) <= 1, `${sameType} vs ${otherType}`);
			assert.equal(user.hasAbility('proficient'), retained.has(ability));
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
	for (const ability of ['Perfect Striker']) {
		it(`preserves the kick boost in ${ability}`, () => {
			const [user, foe] = setup(ability);
			assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('highjumpkick'), 100), 140);
		});
	}
	it('Blazing Tempo no longer includes Striker', () => {
		const [user, foe] = setup('Blazing Tempo');
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('highjumpkick'), 100), 100);
	});
	for (const ability of ['Verdant Drake', 'Fortress Shell']) {
		it(`${ability} no longer adds Dual Wield`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('waterpulse');
			battle.singleEvent('ModifyMove', user.getAbility(), user.abilityState, move, user, foe);
			assert.equal(move.multihit, undefined);
		});
	}
	for (const ability of ['Water Barrage']) {
		it(`preserves reduced Dual Wield hits in ${ability}`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('waterpulse');
			battle.singleEvent('ModifyMove', user.getAbility(), user.abilityState, move, user, foe);
			assert.equal(move.multihit, 2);
			assert.equal(battle.runEvent('BasePower', user, foe, move, 100), 60);
		});
	}
});
