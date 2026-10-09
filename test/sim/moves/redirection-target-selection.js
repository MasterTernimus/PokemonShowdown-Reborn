'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Redirection move target selection', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const move of ['ragepowder', 'followme']) {
		for (const choice of ['move 1', 'move 1 1', 'move 1 -2', 'move 1 zmove', 'move 1 zmove 1']) {
			it(`${move} accepts ${choice} in doubles and redirects to its user`, () => {
				battle = common.createBattle({gameType: 'doubles'}, [[
					{species: 'Amoonguss', ability: 'No Ability', item: move === 'ragepowder' ? 'Buginium Z' : 'Normalium Z', moves: [move]},
					{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
				], [
					{species: 'Snorlax', ability: 'No Ability', moves: ['tackle']},
					{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
				]]);
				const request = battle.p1.activeRequest.active[0];
				assert.equal(request.moves[0].target, 'self');
				assert.equal(request.canZMove[0].target, 'self');
				const [user, ally] = battle.p1.active;
				battle.makeChoices(`${choice}, move 1`, 'move 1 2, move 1');
				assert(user.hp < user.maxhp);
				assert.equal(ally.hp, ally.maxhp);
				assert(battle.log.some(line => line.includes(`|-singleturn|p1a: Amoonguss|move: ${move === 'ragepowder' ? 'Rage Powder' : 'Follow Me'}`)));
			});
		}
		it(`${move} preserves selected-opponent redirection in Free-for-All`, () => {
			battle = common.createBattle({gameType: 'freeforall'}, [
				[{species: 'Amoonguss', ability: 'No Ability', moves: [move]}],
				[{species: 'Snorlax', ability: 'No Ability', moves: ['tackle']}],
				[{species: 'Blissey', ability: 'No Ability', moves: ['splash']}],
				[{species: 'Snorlax', ability: 'No Ability', moves: ['tackle']}],
			]);
			if (battle.turn === 0) battle.makeChoices();
			const [user, selected, victim, other] = battle.sides.map(side => side.active[0]);
			assert.equal(user.getMoveRequestData().moves[0].target, 'normal');
			battle.makeChoices(`move 1 ${user.getLocOf(selected)}`, `move 1 ${selected.getLocOf(victim)}`,
				'move 1', `move 1 ${other.getLocOf(victim)}`);
			assert(user.hp < user.maxhp);
			assert(victim.hp < victim.maxhp);
			assert(battle.log.includes(`|move|${selected}|Tackle|${user}`));
			assert(battle.log.includes(`|move|${other}|Tackle|${victim}`));
		});
	}
});
