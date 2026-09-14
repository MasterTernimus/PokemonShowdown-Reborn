'use strict';
const assert = require('../../assert');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');
describe('Selectable roster legality labels', () => {
	for (const name of ['Musharna', 'Ampharos-Aevian', 'Charizard-Alt', 'Alakazam', 'Machamp', 'Starmie']) {
		it(`${name} is selectable and validates in custom singles and doubles`, () => {
			const species = Dex.species.get(name);
			assert.notEqual(species.tier, 'Illegal');
			for (const format of ['gen9nofieldsinglesgame', 'gen9watersurface', 'gen9doubleswatersurface']) {
				assert.equal(TeamValidator.get(format).validateTeam([
					{species: name, ability: species.abilities[0], moves: ['protect']},
					{species: 'Mew', ability: 'Synchronize', moves: ['protect']},
				]), null);
			}
		});
	}
	it('preserves explicitly unavailable profiles and transformation-only labels', () => {
		for (const name of ['Gourgeist', 'Gourgeist-Large', 'Lapras-Aevian-Gmax', 'Donphan-Rejuv']) {
			assert.equal(Dex.species.get(name).tier, 'Illegal');
		}
	});
});
