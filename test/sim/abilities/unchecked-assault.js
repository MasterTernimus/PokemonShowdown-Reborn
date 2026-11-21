'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Unchecked Assault', () => {
	afterEach(() => {
		if (battle?.p1) battle.destroy();
		battle = null;
	});

	it('includes Limber and blocks paralysis and opposing Speed drops', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Mew', ability: 'uncheckedassault', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['thunderwave', 'scaryface'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const attacker = battle.p1.active[0];

		assert(attacker.hasAbility('limber'));
		battle.makeChoices('move splash', 'move thunderwave');
		assert.equal(attacker.status, '');

		battle.makeChoices('move splash', 'move scaryface');
		assert.statStage(attacker, 'spe', 0);
	});

	it('replaces Persian\'s Unnerve slot with Gilded Grace', () => {
		assert.equal(common.dex.species.get('persian').abilities.H, 'Gilded Grace');
	});
});
