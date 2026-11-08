'use strict';
const assert = require('assert').strict;
const common = require('../common');
const { Dex } = require('../../dist/sim');

describe('Banette form metadata', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	it('keeps the two Mega branches under Banette without linking Muk', () => {
		assert.deepEqual(Dex.species.get('Banette').otherFormes, ['Banette-Mega', 'Banette-Mega-Z']);
		for (const name of ['Banette-Mega', 'Banette-Mega-Z']) {
			const species = Dex.species.get(name);
			assert.equal(species.baseSpecies, 'Banette');
			assert(!species.otherFormes?.some(form => form.startsWith('Muk')));
			assert(!species.formeOrder?.some(form => form.startsWith('Muk')));
		}
		assert(Dex.species.get('Muk-Alola').otherFormes.includes('Muk-Pulse'));
	});
	for (const [choice, name] of [['mega', 'Banette-Mega'], ['megax', 'Banette-Mega-Z']]) {
		it(`preserves the ${name} battle choice`, () => {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
				[{ species: 'Banette', ability: 'Cursed Keepsake', item: 'Banettite', moves: ['protect'] }],
				[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			]);
			if (battle.requestState === 'teampreview') battle.makeChoices('team 1', 'team 1');
			battle.makeChoices('move 1 ' + choice, 'move splash');
			assert.equal(battle.p1.active[0].species.name, name);
		});
	}
});
