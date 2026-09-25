'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Sceptile and Verdant Drake', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('uses the Grass/Dragon profile and has no Electric moves throughout its evolution line', () => {
		const sceptile = Dex.species.get('Sceptile');
		assert.deepEqual(sceptile.types, ['Grass', 'Dragon']);
		assert.deepEqual(sceptile.abilities, {'0': 'Regenerator', '1': 'Dual Wield', H: 'Unburden'});
		const mega = Dex.species.get('Sceptile-Mega');
		assert.deepEqual(mega.types, ['Grass', 'Dragon']);
		assert.equal(mega.abilities[0], 'Verdant Drake');
		for (const species of ['Treecko', 'Grovyle', 'Sceptile', 'Sceptile-Mega']) {
			const electricMoves = Dex.species.getFullLearnset(species)
				.flatMap(data => Object.keys(data.learnset))
				.filter(move => Dex.moves.get(move).type === 'Electric');
			assert.deepEqual(electricMoves, [], `${species} should not learn Electric moves`);
		}
	});

	it('gives Mega Sceptile Lightning Rod without changing its base ability', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sceptile', item: 'Sceptilite', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash', 'thunderbolt']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const sceptile = battle.p1.active[0];
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(sceptile.ability, 'verdantdrake');
		for (const component of ['proficient', 'dualwield', 'regenerator', 'lightningrod']) {
			assert(sceptile.hasAbility(component), component);
		}
		const hp = sceptile.hp;
		battle.makeChoices('move splash', 'move thunderbolt');
		assert.equal(sceptile.hp, hp);
		assert.equal(sceptile.boosts.atk, 1);
		assert.equal(sceptile.boosts.spa, 1);
	});
});
