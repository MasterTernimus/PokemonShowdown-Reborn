'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Alakazam alternate Mega Evolution', () => {
	for (const species of ['Alakazam', 'Alakazam-Alt']) {
		it(`preserves the form for ${species}`, () => {
			const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species, item: 'Alakazite', ability: 'Insomnia', moves: ['splash']}],
				[{species: 'Mew', ability: 'Pressure', moves: ['splash']}],
			]);
			try {
				battle.makeChoices('team 1', 'team 1');
				const mon = battle.p1.active[0];
				const expected = species === 'Alakazam' ? 'Alakazam-Mega' : 'Alakazam-Mega-Alt';
				assert.equal(mon.canMegaEvo, expected);
				battle.makeChoices('move splash mega', 'move splash');
				assert.equal(mon.species.name, expected);
				assert.deepEqual(mon.types, ['Psychic', 'Dark']);
				assert.equal(mon.ability, 'perfectforesight');
				assert(!mon.canMegaEvo);
			} finally { battle.destroy(); }
		});
	}
	it('does not offer the alternate Mega with the wrong stone', () => {
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Alakazam-Alt', item: 'Leftovers', ability: 'Insomnia', moves: ['splash']}],
			[{species: 'Mew', ability: 'Pressure', moves: ['splash']}],
		]);
		try { battle.makeChoices('team 1', 'team 1'); assert(!battle.p1.active[0].canMegaEvo); }
		finally { battle.destroy(); }
	});
});
