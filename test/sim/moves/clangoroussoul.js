'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Clangorous Soul', () => {
	const stats = ['atk', 'def', 'spa', 'spd', 'spe'];
	const partner = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
	let battle;
	afterEach(() => battle.destroy());

	for (const [formatid, stages, cost] of [
		['gen9doublesdesertfield', 1, 96],
		['gen9doublesbigtoparena', 2, 145],
	]) {
		function start() {
			battle = common.createBattle({ formatid }, [
				[{ species: 'Kommo-o', ability: 'Scale Rhythm', moves: ['clangoroussoul'] }, partner],
				[partner, partner],
			]);
			battle.makeChoices('team 12', 'team 12');
			const user = battle.p1.active[0];
			assert.equal(user.maxhp, 291);
			return user;
		}

		function useSoul() {
			battle.makeChoices('move clangoroussoul, move splash', 'move splash, move splash');
		}

		it(`raises all five stats by ${stages} and pays ${cost} HP in ${formatid}`, () => {
			const user = start();
			useSoul();
			for (const stat of stats) assert.equal(user.boosts[stat], stages, stat);
			assert.equal(user.hp, user.maxhp - cost);
		});

		it(`requires enough HP to survive the cost in ${formatid}`, () => {
			const user = start();
			user.hp = cost;
			useSoul();
			assert.equal(user.hp, cost);
			for (const stat of stats) assert.equal(user.boosts[stat], 0, stat);
			user.hp = cost + 1;
			useSoul();
			assert.equal(user.hp, 1);
			for (const stat of stats) assert.equal(user.boosts[stat], stages, stat);
		});
	}
});
