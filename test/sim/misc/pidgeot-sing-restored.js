'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator, Teams } = require('../../../dist/sim');

describe('Pidgeot Sing restoration', () => {
	for (const format of ['gen9nofieldsinglesgame', 'gen9nofielddoublesbattle', 'gen9freeforall4pmistyfieldadrienn']) {
		for (const [species, item] of [
			['Raichu', ''], ['Raichu-Alola', ''], ['Raichu', 'Raichunite X'], ['Raichu', 'Raichunite Y'],
			['Raichu-Mega-X', 'Raichunite X'], ['Raichu-Mega-Y', 'Raichunite Y'],
		]) {
			it(`${format}: rejects pasted/packed ${species} Sing with ${item || 'no stone'}`, () => {
				const text = [
					`Pidgeot (${species})${item ? ` @ ${item}` : ''}`,
					`Ability: ${Dex.species.get(species).abilities[0]}`, '- Sing', '',
					'Mew', 'Ability: Natural Cure', '- Protect',
				].join('\n');
				const team = Teams.unpack(Teams.pack(Teams.import(text)));
				const errors = new TeamValidator(format).validateTeam(team);
				assert(errors?.some(error => /can't learn Sing/.test(error)), JSON.stringify(errors));
			});
		}
		it(`${format}: keeps ordinary Raichu moves and Pikachu Sing legal`, () => {
			const team = [{ species: 'Raichu', ability: Dex.species.get('Raichu').abilities[0], moves: ['Thunderbolt'] },
				{ species: 'Pikachu', ability: Dex.species.get('Pikachu').abilities[0], moves: ['Sing'] }];
			assert.equal(new TeamValidator(format).validateTeam(team), null);
		});
		for (const item of ['', 'Pidgeotite']) {
			it(`${format}: permits Sing ${item ? 'with Mega Evolution' : 'without a stone'}`, () => {
				const team = [{ species: 'Pidgeot', ability: 'Updraft', item, moves: ['Sing'] },
					{ species: 'Mew', ability: 'Natural Cure', moves: ['Protect'] }];
				assert.equal(new TeamValidator(format).validateTeam(team), null);
			});
		}
	}
	it('accepts a pasted Mega Pidgeot set', () => {
		const team = Teams.import('Pidgeot-Mega @ Pidgeotite\nAbility: Storm Sovereign\n- Sing');
		assert.equal(new TeamValidator('gen9nofieldsinglesgame').validateTeam(team), null);
	});
	it('retains Raichu exclusions and adds no sleep/No Guard clause', () => {
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const id of ['raichu', 'raichualola', 'raichumegax', 'raichumegay']) {
			assert(validator.checkCanLearn(Dex.moves.get('Sing'), Dex.species.get(id)), id);
		}
		assert(!Dex.formats.all().some(format => format.ruleset.includes('No Guard Sleep Clause')));
	});
});
