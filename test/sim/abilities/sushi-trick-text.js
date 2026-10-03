'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Sushi Trick approved wording', () => {
	let battle;
	afterEach(() => battle?.destroy());
	it('keeps exact descriptions, Hospitality identity, healing, confusion cure and the existing message', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Tatsugiri', ability: 'Sushi Trick', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		const [p, ally] = battle.p1.active;
		const ability = p.getAbility();
		assert.equal(ability.desc, "On entry, restores 1/4 of each adjacent ally's maximum HP and cures its confusion.");
		assert.equal(ability.shortDesc, 'On entry, heals adjacent allies by 1/4 max HP and cures confusion.');
		assert(p.hasAbility('hospitality'));
		ally.hp = 1; ally.addVolatile('confusion');
		const from = battle.log.length;
		battle.singleEvent('Start', ability, p.abilityState, p);
		assert.equal(ally.hp, 1 + Math.floor(ally.baseMaxhp / 4));
		assert(!ally.volatiles.confusion);
		assert(battle.log.slice(from).includes(`|-message|${p.name} served ${ally.name} a colorful sushi surprise! Fresh flavors restored its spirits!`));
	});
});
