'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Illusion copying Trace', () => {
	let battle;
	afterEach(() => battle?.destroy());

	it('copies Trace, traces a foe, and restores Illusion when the disguise breaks', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame', preview: false }, [[
			{ species: 'Zoroark', ability: 'Illusion', moves: ['splash'] },
			{ species: 'Ralts', ability: 'Trace', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'Intimidate', moves: ['tackle'] },
		]]);
		if (battle.requestState === 'teampreview') battle.makeChoices();
		const zoroark = battle.p1.active[0];
		assert.equal(zoroark.illusion, battle.p1.pokemon[1]);
		assert.equal(zoroark.ability, 'intimidate', battle.log.join('\n'));
		assert(zoroark.volatiles['illusioncopy']);

		battle.makeChoices('move splash', 'move tackle');
		assert.equal(zoroark.illusion, null);
		assert.equal(zoroark.ability, 'illusion');
		assert(!zoroark.volatiles['illusioncopy']);
	});
});
