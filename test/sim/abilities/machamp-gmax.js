'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Machamp G-Max ability', () => {
	for (const species of ['Machamp', 'Machamp-Alt']) {
		for (const ability of ['Grit and Glory', 'Fourthhold Guard', 'Perfect Form']) {
			it(`${species} gains Titan's Knuckles from ${ability}`, () => {
				const battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [
					[{species, ability, gigantamax: true, moves: ['splash']}],
					[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
				]);
				try {
					battle.makeChoices('team 1', 'team 1');
					battle.makeChoices('move splash dynamax', 'move splash');
					const mon = battle.p1.active[0];
					assert.equal(mon.species.name, species === 'Machamp' ? 'Machamp-Gmax' : 'Machamp-Gmax-Alt');
					assert.equal(mon.ability, 'titansknuckles');
					assert.equal(mon.baseAbility, 'titansknuckles');
				} finally { battle.destroy(); }
			});
		}
	}
});
