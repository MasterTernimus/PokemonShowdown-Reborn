'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');

describe('Soul Siphon metadata and Wonder Guard immunity bypass', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('assigns Soul Siphon a unique custom number and generation', () => {
		const ability = Dex.abilities.get('Soul Siphon');
		assert.equal(ability.num, 11232);
		assert.equal(ability.gen, 9);
		assert.deepEqual(Dex.abilities.all().filter(a => a.num === ability.num).map(a => a.id), ['soulsiphon']);
	});

	for (const [species, move, shouldDamage] of [
		['Regieleki', 'thousandarrows', true],
		['Regieleki', 'earthquake', false],
		['Mew', 'thousandarrows', false],
		['Tangrowth', 'thousandarrows', false],
		['Tropius', 'thousandarrows', false],
	]) {
		it(`${move} ${shouldDamage ? 'hits' : 'does not bypass Wonder Guard on'} ${species} holding Air Balloon`, () => {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame@@@!teampreview'}, [[
				{species: 'Zygarde', ability: 'No Ability', moves: [move]},
			], [{species, ability: 'Wonder Guard', item: 'Air Balloon', moves: ['splash']}]]);
			const target = battle.p2.active[0];
			battle.makeChoices(`move ${move}`, 'move splash');
			assert.equal(target.hp < target.maxhp, shouldDamage);
			assert.equal(target.item === '', shouldDamage, 'only a successful damaging hit pops the Balloon');
		});
	}
});
