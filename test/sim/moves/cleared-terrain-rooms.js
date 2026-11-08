'use strict';

const assert = require('../../assert');
const common = require('../../common');
let battle;

describe('Room moves after clearing the last terrain', () => {
	afterEach(() => battle?.destroy());
	for (const first of ['magicroom', 'trickroom']) {
		it(`allows ${first} and still opens Rift Eclipse after both rooms`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: 'Mew', ability: 'noability', moves: ['magicroom', 'trickroom'] }],
				[{ species: 'Blissey', ability: 'noability', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1', 'team 1');
			battle.field.startTerrain('rockyterrain');
			assert.equal(battle.field.terrain, 'rockyterrain');
			assert(battle.field.clearTerrain());
			assert.equal(battle.field.terrain, '');
			assert.equal(battle.field.terrainState.terrainChanges.size, 0);
			battle.makeChoices(`move ${first}`, 'move splash');
			assert(battle.field.getPseudoWeather(first));
			assert.equal(battle.field.terrain, '');
			const second = first === 'magicroom' ? 'trickroom' : 'magicroom';
			battle.makeChoices(`move ${second}`, 'move splash');
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
		});
	}
});
