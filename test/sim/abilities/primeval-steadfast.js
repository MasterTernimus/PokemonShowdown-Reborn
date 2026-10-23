'use strict'; const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Primeval Hunt approved Steadfast replacement', () => {
	let b, p, q;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup(species = 'Mew') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: 'Primeval Hunt', moves: ['tackle'] }], [{ species: 'Aerodactyl', ability: 'No Ability', moves: ['fakeout', 'splash'] }]]);
		b.makeChoices('team 1', 'team 1');
		p = b.p1.active[0];
		q = b.p2.active[0];
	}
	it('retains Armaldo choices and Relic Armor passive', () => {
		const s = Dex.species.get('armaldo');
		assert.equal(s.abilities.H, 'Primeval Hunt');
		assert.deepEqual(s.passives, ['relicarmor']);
	});
	it('retains maximum hits, one accuracy check and one 1.5x boost', () => {
		setup();
		const m = Dex.getActiveMove('bulletseed');
		m.multiaccuracy = true;
		b.runEvent('ModifyMove', p, q, m, m);
		assert.equal(m.multihit, 5);
		assert(!m.multiaccuracy);
		assert.equal(b.runEvent('BasePower', p, q, m, 100), 150);
	});
	it('allows confusion and Intimidate Attack drops', () => {
		setup();
		assert(p.addVolatile('confusion', q));
		b.boost({ atk: -1 }, p, q, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, -1);
	});
	it('raises Speed from a flinch but still loses its action', () => {
		setup();
		const hp = q.hp;
		b.makeChoices('move tackle', 'move fakeout');
		assert.equal(p.boosts.spe, 1);
		assert.equal(q.hp, hp);
	});
	it('retains Electric Terrain entry Speed', () => {
		setup();
		b.field.terrain = 'electricterrain';
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 1);
	});
	it('retains Ashen Beach accuracy and Unnerve counterplay', () => {
		setup();
		b.field.terrain = 'ashenbeachterrain';
		const m = Dex.getActiveMove('tackle');
		assert.equal(b.runEvent('Accuracy', q, p, m, 50), true);
		q.setAbility('Unnerve');
		assert.equal(b.runEvent('Accuracy', q, p, m, 50), 50);
	});
	it('retains Rocky flinch-chip immunity', () => {
		setup();
		b.field.terrain = 'rockyterrain';
		const hp = p.hp;
		b.runEvent('Flinch', p);
		assert.equal(p.hp, hp);
		assert.equal(p.boosts.spe, 1);
	});
	it('suppression disables selected Steadfast and Skill Link', () => {
		setup();
		p.addVolatile('gastroacid');
		b.runEvent('Flinch', p);
		assert.equal(p.boosts.spe, 0);
		const m = Dex.getActiveMove('bulletseed');
		b.runEvent('ModifyMove', p, q, m, m);
		assert.deepEqual(m.multihit, [2, 5]);
		assert.equal(b.runEvent('BasePower', p, q, m, 100), 100);
	});
	it('does not double a shared Steadfast passive', () => {
		setup('Scyther');
		b.field.terrain = 'electricterrain';
		b.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.spe, 0);
		b.singleEvent('Start', Dex.abilities.get('steadfast'), { target: p, speciesPassive: 'steadfast' }, p);
		assert.equal(p.boosts.spe, 1);
	});
	it('publishes the new composite without Own Tempo claims', () => {
		const a = Dex.abilities.get('primevalhunt');
		assert.equal(a.shortDesc, 'Skill Link + Steadfast.');
		assert(!a.onTryBoost);
		assert(!a.onTryAddVolatile);
	});
});
