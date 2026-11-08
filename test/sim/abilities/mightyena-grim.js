'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Mightyena Grim artwork variant', () => {
	it('inherits the current base gameplay and keeps both artwork choices', () => {
		const base = Dex.species.get('Mightyena');
		const grim = Dex.species.get('Mightyena-Grim');
		assert(grim.exists && !grim.isCosmeticForme); // Explicit record supports its own Mega-Grim route.
		for (const key of ['baseStats', 'types', 'abilities', 'passives', 'weightkg', 'eggGroups']) {
			assert.deepEqual(grim[key], base[key], key);
		}
		assert(base.cosmeticFormes.includes('Mightyena-Grim'));
		assert(base.formeOrder.includes('Mightyena-Deso'));
	});

	it('retains internal learnset data but rejects new teams and battles', () => {
		const set = {species: 'Mightyena-Grim', ability: 'Intimidate', moves: ['Crunch', 'Protect']};
		assert.deepEqual(Dex.species.getLearnsetData('mightyenagrim').learnset, Dex.species.getLearnsetData('mightyena').learnset);
		assert(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([set]).some(error => error.includes('Mightyena-Grim is disabled')));
		assert.throws(() => common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[set], [{ species: 'Mew', ability: 'No Ability', moves: ['Splash'] }],
		]), /Mightyena-Grim is disabled/);
	});
});
