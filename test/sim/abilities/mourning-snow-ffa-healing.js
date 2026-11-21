'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Mourning Snow Free-for-All faint healing', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const gameType of ['singles', 'doubles', 'freeforall']) {
		for (const [cause, amount] of [['tackle', 50], ['icebeam', 100], ['hail', 100], ['snow', 100], ['curse', 100]]) {
			it(`${gameType}: ${cause} faint has the correct healing`, () => {
				const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash'] });
				const teams = [[mon('Froslass-Mega', 'Mourning Snow'), mon()], [mon(), mon()]];
				if (gameType === 'freeforall') teams.push([mon()], [mon()]);
				battle = common.createBattle({ gameType }, teams);
				battle.field.clearWeather();
				const holder = battle.p1.active[0], target = battle.p2.active[0];
				holder.hp = 100;
				holder.maxhp = holder.baseMaxhp = 400;
				const effect = ['tackle', 'icebeam'].includes(cause) ? battle.dex.getActiveMove(cause) : battle.dex.conditions.get(cause);
				target.faint(holder, effect);
				battle.faintMessages();
				assert.equal(holder.hp, 100 + (gameType === 'freeforall' ? amount : 0));
			});
		}
	}
});
