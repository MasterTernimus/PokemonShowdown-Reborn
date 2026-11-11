'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Lumineon Storm Drain passive swap', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const species of ['Lumineon', 'Lumineon-Alt']) {
		it(species + ' has selectable Swift Swim and redirects Water even with its ability suppressed', () => {
			const data = Dex.species.get(species);
			assert.deepEqual(data.abilities, { 0: 'Protean', 1: 'Swift Swim', H: 'Drizzle' });
			assert.deepEqual(data.passives, ['stormdrain']);
			const spare = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'watergun'] };
			battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
				{ species, ability: 'Swift Swim', moves: ['splash'] }, spare,
			], [spare, spare]]);
			battle.makeChoices('team 12', 'team 12');
			const [p, ally] = battle.p1.active, q = battle.p2.active[0];
			battle.field.setWeather('raindance');
			assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200);
			p.addVolatile('gastroacid', q);
			assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 100);
			battle.makeChoices('move splash, move splash', 'move watergun 2, move splash');
			assert.equal(p.hp, p.maxhp); assert.equal(ally.hp, ally.maxhp);
			assert.equal(p.boosts.spa, 1);
		});
	}
	it('does not change Rift and Chi Two packages', () => {
		for (const id of ['lumineonrift', 'chitwo']) {
			assert.deepEqual(Dex.species.get(id).abilities, { 0: 'Rift of Ruin' });
			assert.deepEqual(Dex.species.get(id).passives, []);
		}
	});
});
