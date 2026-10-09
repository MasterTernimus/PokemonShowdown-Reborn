'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Smack Down against airborne passives', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const [species, ability] of [['Mismagius-Mega', 'No Ability'], ['Eelektross-Mega', 'No Ability'],
		['Mew', 'Elevate'], ['Mew', 'Levitate'], ['Flygon-Mega', 'No Ability']]) {
		it(`grounds ${species} with ${ability}, allowing subsequent Ground attacks`, () => {
			battle = common.createBattle({}, [[{species: 'Mew', ability: 'No Ability', moves: ['smackdown', 'earthquake']}],
				[{species, ability, moves: ['splash']}]]);
			const p = battle.p1.active[0], q = battle.p2.active[0];
			if (q.species.name !== species) q.formeChange(species, null, true);
			q.setAbility(ability);
			q.hp = q.maxhp = 10000;
			assert.equal(q.isGrounded(), null);
			battle.actions.useMove('smackdown', p, {target: q});
			assert(q.volatiles.smackdown);
			assert.equal(q.isGrounded(), true);
			const hp = q.hp;
			battle.actions.useMove('earthquake', p, {target: q});
			assert(q.hp < hp);
		});
	}
});
