'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Togekiss-Alde cosmetic profile', () => {
	it('inherits Togekiss mechanics and is legal with its base learnset', () => {
		const base = Dex.species.get('Togekiss'), skin = Dex.species.get('Togekiss-Alde');
		assert(skin.exists && skin.isCosmeticForme);
		assert.equal(skin.baseSpecies, 'Togekiss');
		for (const key of ['baseStats', 'types', 'abilities', 'bst', 'weightkg', 'genderRatio']) {
			assert.deepEqual(skin[key], base[key], key);
		}
		for (const ability of Object.values(base.abilities)) {
			const team = [{species: 'Togekiss-Alde', ability, moves: ['airslash', 'roost', 'aurasphere', 'dazzlinggleam']}];
			assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateTeam(team), null);
			assert.equal(team[0].species, 'Togekiss-Alde');
		}
	});
	for (const shiny of [false, true]) {
		it(`retains the cosmetic form in battle with shiny=${shiny}`, () => {
			const battle = common.createBattle([[
				{species: 'Togekiss-Alde', ability: 'Guiding Omen', shiny, moves: ['splash']},
			], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
			try {
				const pokemon = battle.p1.active[0];
				assert.equal(pokemon.species.name, 'Togekiss-Alde');
				assert(pokemon.details.includes('Togekiss-Alde'));
				assert.equal(pokemon.set.shiny, shiny);
				battle.makeChoices();
			} finally { battle.destroy(); }
		});
	}
});
