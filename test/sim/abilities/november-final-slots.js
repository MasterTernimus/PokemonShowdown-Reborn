'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('November final ability slots', () => {
	let battle; afterEach(() => battle?.destroy());
	function setup(species, ability) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('keeps Tyranitar Sand Stream and replaces only regular ability choices', () => {
		assert.deepEqual(Dex.species.get('tyranitar').abilities, { 0: 'Earth Eater', 1: 'Battle Armor', H: 'Dread Presence' });
		assert.deepEqual(Dex.species.get('tyranitar').passives, ['sandstream']);
		assert.equal(Dex.species.get('tyranitarmega').abilities[0], 'Sand Sovereign');
	});
	it('Dread Presence has global Dark Aura power and prevents opposing Berries', () => {
		const [p, q] = setup('Tyranitar', 'Dread Presence');
		assert(p.hasAbility('darkaura')); assert(p.hasAbility('unnerve'));
		const power = (source, target) => battle.runEvent('BasePower', source, target, Dex.getActiveMove('darkpulse'), 100);
		assert.equal(power(p, q), 133); assert.equal(power(q, p), 133);
		q.hp = 1; assert.equal(power(p, q), 133, 'no old extra low-HP multiplier');
		q.setItem('Sitrus Berry'); assert(!q.eatItem()); assert.equal(q.item, 'sitrusberry');
	});
	it('Sylveon replaces Fairy Aura with Aroma Veil and preserves Pixilate', () => {
		assert.deepEqual(Dex.species.get('sylveon').abilities, { 0: 'Competitive', 1: 'Soothing Presence', H: 'Aroma Veil' });
		assert.deepEqual(Dex.species.get('sylveon').passives, ['pixilate']);
		const [p, q] = setup('Sylveon', 'Aroma Veil'); assert(!p.addVolatile('taunt', q, Dex.moves.get('taunt')));
	});
});
