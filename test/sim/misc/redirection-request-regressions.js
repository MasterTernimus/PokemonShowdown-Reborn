'use strict';

const assert = require('../../assert');
const common = require('../../common');

describe('Redirection move requests', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const move of ['followme', 'ragepowder']) {
		for (const gameType of ['doubles', 'multi']) {
			it(`${move} accepts a self-targeting request in ${gameType}`, () => {
				const user = {species: 'Mew', ability: 'No Ability', moves: [move]};
				const idle = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
				const teams = gameType === 'doubles' ? [[user, idle], [idle, idle]] : [[user], [idle], [idle], [idle]];
				battle = common.createBattle({gameType}, teams);
				assert.equal(battle.p1.active[0].getMoves()[0].target, 'self');
				if (gameType === 'doubles') battle.makeChoices(`move ${move}, move splash`, 'move splash, move splash');
				else battle.makeChoices(`move ${move}`, 'move splash', 'move splash', 'move splash');
				assert(battle.log.some(line => line.startsWith('|-singleturn|p1a: Mew|')));
			});
		}
		it(`${move} retains selected-opponent redirection in free-for-all`, () => {
			battle = common.createBattle({gameType: 'freeforall'}, [
				[{species: 'Mew', ability: 'No Ability', moves: [move]}],
				...Array.from({length: 3}, () => [{species: 'Mew', ability: 'No Ability', moves: ['tackle', 'splash']}]),
			]);
			const user = battle.p1.active[0];
			assert.equal(user.getMoves()[0].target, 'normal');
			const selected = user.getAtLoc(1);
			const other = battle.getAllActive().find(pokemon => pokemon !== user && pokemon !== selected);
			const choices = battle.sides.map(side => {
				const pokemon = side.active[0];
				if (pokemon === user) return `move ${move} 1`;
				if (pokemon === selected) return `move tackle ${pokemon.getLocOf(other)}`;
				return 'move splash';
			});
			battle.makeChoices(...choices);
			assert.false.fullHP(user);
			assert.fullHP(other);
			assert.equal(user.lastMoveTargetLoc, 1);
		});
	}
});
