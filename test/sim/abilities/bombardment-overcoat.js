'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Bombardment Overcoat addition', () => {
	let b;
	afterEach(() => b?.destroy());
	function setup() {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability: 'Bombardment', moves: ['tackle', 'aurasphere'] }], [{ species: 'Mew', ability: 'Effect Spore', moves: ['spore', 'splash'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}it('adds full Overcoat while retaining nested Stalwart once', () => {
		const [p] = setup();
		assert(p.hasAbility('overcoat'));
		assert(p.hasAbility('stalwart'));
		assert(p.hasAbility('megalauncher'));
		assert(p.hasAbility('waterbarrage'));
		for (const type of ['sandstorm', 'hail', 'powder'])assert.equal(b.runEvent('Immunity', p, null, null, type), false);
		b.field.changeTerrain('newworldterrain', p);
		p.boosts.spa = 0;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spa, 1);
	});
	it('blocks powders and Effect Spore; suppression disables Overcoat', () => {
		const [p, q] = setup();
		b.randomChance = () => true;
		b.random = () => 15;
		b.actions.useMove('spore', q, { target: p });
		assert.equal(p.status, '');
		b.actions.useMove('tackle', p, { target: q });
		assert.equal(p.status, '');
		p.addVolatile('gastroacid');
		assert(!p.hasAbility('overcoat'));
		b.actions.useMove('spore', q, { target: p });
		assert.equal(p.status, 'slp');
	});
	it('does not add Overcoat to Water Barrage itself', () => {
		const [p] = setup();
		p.setAbility('Water Barrage');
		assert(p.hasAbility('stalwart'));
		assert(!p.hasAbility('overcoat'));
		assert.deepEqual(Dex.species.get('blastoisemega').passives, ['proficient']);
	});
});
