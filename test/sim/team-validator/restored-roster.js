'use strict';
const assert = require('../../assert');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');
describe('Selectable roster legality labels', () => {
	it('all selectable Aevian profiles validate with every ability slot', () => {
		for (const species of Dex.species.all().filter(s => s.name.includes('Aevian') && !s.battleOnly && !s.requiredItem && !s.isMega && !s.forme.includes('Gmax'))) {
			assert.notEqual(species.tier, 'Illegal', species.name);
			for (const ability of Object.values(species.abilities)) {
				for (const format of ['gen9nofieldsinglesgame', 'gen9watersurface', 'gen9doubleswatersurface']) {
					assert.equal(TeamValidator.get(format).validateTeam([
						{species: species.name, ability, moves: ['protect']},
						{species: 'Mew', ability: 'Synchronize', moves: ['protect']},
					]), null, `${species.name}: ${ability} in ${format}`);
				}
			}
		}
	});
	it('cosmetic aliases retain normal ability slots', () => {
		for (const name of ['Burmy-Sandy', 'Burmy-Trash']) {
			assert.deepEqual(Dex.species.get(name).abilities, Dex.species.get('Burmy').abilities);
		}
	});
	for (const name of ['Musharna', 'Ampharos-Aevian', 'Kommo-o-Aevian', 'Toxtricity-Aevian', 'Lapras-Aevian', 'Charizard-Alt', 'Alakazam', 'Machamp', 'Starmie']) {
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
