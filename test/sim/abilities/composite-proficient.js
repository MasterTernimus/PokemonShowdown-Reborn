'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
const composites = ['Pollen Bloom', 'Ancient Bloom', 'Toxic Bloom', 'Water Barrage', 'Fortress Shell',
	'Siege Launcher', 'Wildfire Core', 'Sun Sovereign', 'Atrocity', 'Burning Crown', 'Verdant Drake',
	'Wrath Shield', 'Shadow Current', 'Astral Witchcraft', 'Blazing Tempo', 'Raging Current', 'Perfect Striker'];
function setup(ability) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: ['psychic', 'splash']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Proficient removed from composite abilities', () => {
	afterEach(() => { battle?.destroy(); });
	for (const ability of composites) {
		it(`${ability} has no extra same-type modifier or Proficient component`, () => {
			const [user, foe] = setup(ability);
			const move = battle.dex.getActiveMove('psychic');
			const sameType = battle.runEvent('BasePower', user, foe, move, 100);
			move.type = 'Dark';
			const otherType = battle.runEvent('BasePower', user, foe, move, 100);
			assert.equal(sameType, otherType);
			assert.equal(sameType, ability === 'Atrocity' ? 130 : 100);
			assert.equal(user.hasAbility('proficient'), false);
		});
	}
	it('preserves standalone Proficient', () => {
		const [user, foe] = setup('Proficient');
		assert(user.hasAbility('proficient'));
		assert.equal(battle.runEvent('BasePower', user, foe, battle.dex.getActiveMove('psychic'), 100), 130);
	});
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
