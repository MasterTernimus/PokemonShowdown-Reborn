'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Life Dew on water fields', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const terrain of ['watersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain']) {
		for (const fullHP of [false, true]) {
			it(`gives Aqua Ring to its user and ally on ${terrain}${fullHP ? ' at full HP' : ''}`, () => {
				battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
					[
						{ species: 'Vaporeon', ability: 'No Ability', moves: ['lifedew'] },
						{ species: 'Lapras', ability: 'No Ability', moves: ['splash'] },
					],
					[
						{ species: 'Vaporeon', ability: 'No Ability', moves: ['splash'] },
						{ species: 'Lapras', ability: 'No Ability', moves: ['splash'] },
					],
				]);
				battle.makeChoices('team 12', 'team 12');
				const [user, ally] = battle.p1.active;
				battle.field.changeTerrain(terrain, user);
				if (!fullHP) {
					user.hp -= 50;
					ally.hp -= 50;
				}
				battle.makeChoices('move lifedew, move splash', 'move splash, move splash');
				assert(user.volatiles.aquaring, `${terrain} did not give the user Aqua Ring`);
				assert(ally.volatiles.aquaring, `${terrain} did not give the ally Aqua Ring`);
			});
		}
	}
	it('keeps ordinary healing without giving Aqua Ring on other fields', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[
				{ species: 'Vaporeon', ability: 'No Ability', moves: ['lifedew'] },
				{ species: 'Lapras', ability: 'No Ability', moves: ['splash'] },
			],
			[
				{ species: 'Vaporeon', ability: 'No Ability', moves: ['splash'] },
				{ species: 'Lapras', ability: 'No Ability', moves: ['splash'] },
			],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [user, ally] = battle.p1.active;
		user.hp -= 100;
		ally.hp -= 100;
		battle.makeChoices('move lifedew, move splash', 'move splash, move splash');
		assert(user.hp > user.maxhp - 100);
		assert(ally.hp > ally.maxhp - 100);
		assert(!user.volatiles.aquaring);
		assert(!ally.volatiles.aquaring);
	});
});
