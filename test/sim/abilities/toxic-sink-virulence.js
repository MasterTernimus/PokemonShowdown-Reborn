'use strict';
const assert = require('assert').strict, common = require('../../common'); const { Dex } = require('../../../dist/sim');
describe('Poison-only Toxic Sink and Virulence', () => {
	let b;
	afterEach(() => {
		b?.destroy();
		b = null;
	});
	function setup(ability, species = 'Mew', item = '') {
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, item, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['sludgebomb', 'poisongas', 'tackle'] }]]);
		b.makeChoices('team 1', 'team 1');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const ability of ['Toxic Sink', 'Virulence']) {
		it(ability + ' absorbs damaging and status Poison moves once for SpA only', () => {
			const [p, q] = setup(ability), hp = p.hp;
			for (const move of ['sludgebomb', 'poisongas'])b.actions.useMove(move, q, { target: p });
			assert.equal(p.hp, hp);
			assert.equal(p.status, '');
			assert.equal(p.boosts.spa, 2);
			assert.equal(p.boosts.atk, 0);
		});
		it(ability + ' respects suppression, copying and ability loss', () => {
			const [p, q] = setup(ability);
			p.addVolatile('gastroacid');
			const hp = p.hp;
			b.actions.useMove('sludgebomb', q, { target: p });
			assert(p.hp < hp);
			assert.equal(p.boosts.spa, 0);
			p.removeVolatile('gastroacid');
			q.setAbility(ability);
			b.actions.useMove('sludgebomb', p, { target: q });
			assert.equal(q.boosts.spa, 1);
			q.setAbility('No Ability');
			const qhp = q.hp;
			b.actions.useMove('sludgebomb', p, { target: q });
			assert(q.hp < qhp);
		});
		it(ability + ' is bypassed by Mold Breaker unless Ability Shield protects it', () => {
			const [p, q] = setup(ability);
			q.setAbility('Mold Breaker');
			let hp = p.hp;
			b.actions.runMove('sludgebomb', q, 1);
			assert(p.hp < hp);
			assert.equal(p.boosts.spa, 0);
			p.setItem('Ability Shield');
			hp = p.hp;
			b.actions.runMove('sludgebomb', q, 1);
			assert.equal(p.hp, hp);
			assert.equal(p.boosts.spa, 1);
		});
		it(ability + ' redirects single-target Poison but not a spread move', () => {
			b = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[{ species: 'Mew', ability, moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['sludgebomb', 'sludgewave'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
			b.makeChoices('team 12', 'team 12');
			const [p, ally] = b.p1.active, q = b.p2.active[0], hp = ally.hp;
			b.actions.runMove('sludgebomb', q, 2);
			assert.equal(ally.hp, hp);
			assert.equal(p.boosts.spa, 1);
			b.actions.runMove('sludgewave', q, 1);
			assert(ally.hp < hp);
			assert.equal(p.boosts.spa, 2);
			assert.equal(p.boosts.atk, 0);
		});
	}
	for (const ability of ['Toxic Sink', 'Virulence']) it(ability + ' calculator absorbs Poison damage', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const result = calculateScenario({ format: 'gen9nofieldsinglesgame', move: 'Sludge Bomb', samples: 8, seed: 42, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability }, ...Array.from({ length: 2 }, () => ({ species: 'Mew', ability: 'No Ability' }))] });
		assert.equal(result.results[1].minNetLoss, 0); assert.equal(result.results[1].maxNetLoss, 0);
	});
	it('standalone Toxic Sink has no Effect Spore, healing amplification or ally cure callbacks', () => {
		const a = Dex.abilities.get('Toxic Sink');
		for (const key of ['onDamagingHit', 'onAnyTryHeal', 'onResidual'])assert.equal(a[key], undefined);
		const [p] = setup('Toxic Sink');
		assert(!p.hasAbility('effectspore'));
		assert(!p.hasAbility('invigorate'));
	});
	it('Vileplume keeps its selectable slots and receives Effect Spore independently', () => {
		const s = Dex.species.get('Vileplume');
		assert.deepEqual(s.abilities, { 0: 'Pollen Engine', 1: 'Storm Drain', H: 'Toxic Sink' });
		assert.deepEqual(s.passives, ['effectspore']);
		const [p, q] = setup('Toxic Sink', 'Vileplume');
		p.addVolatile('gastroacid');
		assert(p.hasAbilityOrPassive('effectspore'));
		b.randomChance = () => true;
		b.random = () => 0;
		b.actions.useMove('tackle', q, { target: p });
		assert(q.status);
	});
	it('Virulence retains its old handlers and adds only Poison absorption/redirection', () => {
		const a = Dex.abilities.get('Virulence');
		for (const key of ['onStart', 'onAnyModifyBoost', 'onImmunity', 'onSourceModifyAtk', 'onSourceModifySpA', 'onBasePower', 'onAnyTryHeal', 'onResidual'])assert.equal(typeof a[key], 'function', key);
		const [p, q] = setup('Virulence');
		assert(p.hasAbility('toxicsink'));
		assert(!p.hasAbility('effectspore'));
		assert.equal(b.runEvent('SourceModifyAtk', p, q, Dex.moves.get('firepunch'), 100), 50);
	});
});
