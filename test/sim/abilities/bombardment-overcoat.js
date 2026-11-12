'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Bombardment Shell Armor replacement', () => {
	let b;
	afterEach(() => b?.destroy());
	function setup() {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability: 'Bombardment', moves: ['tackle', 'aurasphere'] }], [{ species: 'Mew', ability: 'Effect Spore', moves: ['spore', 'splash'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}it('adds Shell Armor while retaining nested Stalwart once', () => {
		const [p] = setup();
		assert(p.hasAbility('shellarmor')); assert(!p.hasAbility('overcoat')); assert(!p.hasAbility('bulletproof'));
		assert(p.hasAbility('stalwart'));
		assert(p.hasAbility('megalauncher'));
		assert(p.hasAbility('waterbarrage'));
		assert.equal(b.runEvent('CriticalHit', p, null, Dex.getActiveMove('tackle')), false);
		b.field.changeTerrain('newworldterrain', p);
		p.boosts.spa = 0;
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spa, 1);
	});
	it('allows powder; suppression disables critical-hit protection', () => {
		const [p, q] = setup(); b.actions.useMove('spore', q, { target: p }); assert.equal(p.status, 'slp');
		p.addVolatile('gastroacid'); assert(!p.hasAbility('shellarmor'));
		assert.notEqual(b.runEvent('CriticalHit', p, q, Dex.getActiveMove('tackle')), false);
	});
	it('does not add Shell Armor to Tidal Monarch itself', () => {
		const [p] = setup();
		p.setAbility('Water Barrage');
		assert(p.hasAbility('stalwart'));
		assert(!p.hasAbility('overcoat'));
		assert.deepEqual(Dex.species.get('blastoisemega').passives, ['proficient']);
	});
});
