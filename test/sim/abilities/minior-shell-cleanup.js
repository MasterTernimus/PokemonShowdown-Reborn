'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
describe('Minior Shields Down cleanup', () => {
	let b;
	afterEach(() => { b?.destroy(); b = null; });
	function setup(species = 'Minior') {
		const m = { species: 'Mew', ability: 'No Ability', moves: ['tackle', 'splash', 'surf'] };
		b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ ...m, species, ability: 'Light Metal' }, m], [m, m],
		]);
		b.makeChoices('team 12', 'team 12');
		return [b.p1.active[0], b.p2.active[0]];
	}
	for (const id of ['minior', 'miniororange', 'minioryellow', 'miniorgreen', 'miniorblue', 'miniorindigo', 'miniorviolet']) {
		it(`${id} retains core identity, threshold changes and Shields Down passive`, () => {
			const [p, q] = setup(id);
			assert.equal(p.species.id, 'miniormeteor');
			assert.deepEqual(p.getPassives(), ['shieldsdown']);
			assert(!p.trySetStatus('par', q));
			assert(!p.addVolatile('yawn', q));
			p.hp = Math.floor(p.maxhp / 2);
			b.singleEvent('Residual', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p);
			assert.equal(p.species.id, id);
			assert(p.trySetStatus('par', q));
			b.boost({ atk: -1 }, p, q);
			assert.equal(p.boosts.atk, -1);
			p.hp = p.maxhp;
			b.singleEvent('Residual', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p);
			assert.equal(p.species.id, 'miniormeteor');
		});
	}
	it('removes armor and repair without changing shared abilities', () => {
		const [p, q] = setup();
		for (const id of ['shellarmor', 'selfrepair', 'naturalcure', 'selfsufficient']) assert(!p.hasAbilityOrPassive(id), id);
		for (const hook of ['onCriticalHit', 'onSourceModifyDamage', 'onAfterEachBoost', 'onCheckShow', 'onSwitchOut', 'onImmunity']) {
			assert.equal(Dex.abilities.get('shieldsdown')[hook], undefined, hook);
		}
		assert.equal(b.runEvent('SourceModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
		assert.notEqual(b.runEvent('CriticalHit', p, q, Dex.getActiveMove('tackle')), false);
		p.hp = 10;
		b.singleEvent('Residual', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p);
		assert.equal(p.hp, 10);
		p.setStatus('brn');
		b.singleEvent('SwitchOut', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p);
		assert.equal(p.status, 'brn');
		assert.equal(p.hp, 10);
		assert.equal(Dex.abilities.get('shellarmor').onCriticalHit, false);
		assert(Dex.abilities.get('selfrepair').onResidual);
	});
	it('a real physical hit sets rocks without requiring contact or survival', () => {
		const [p, q] = setup();
		p.hp = 1;
		b.actions.useMove('rockthrow', q, { target: p });
		assert.equal(p.hp, 0);
		assert(b.p2.sideConditions.stealthrock);
	});
	it('retains physical-hit rocks in both forms, ally redirection and four field exclusions', () => {
		const [p, q] = setup();
		for (const core of [false, true]) {
			if (core) p.formeChange('Minior');
			b.singleEvent('DamagingHit', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p, q, Dex.getActiveMove('tackle'), 1);
			assert(b.p2.sideConditions.stealthrock);
			b.p2.removeSideCondition('stealthrock');
			b.singleEvent('DamagingHit', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p, p, Dex.getActiveMove('tackle'), 1);
			assert(b.p2.sideConditions.stealthrock);
			b.p2.removeSideCondition('stealthrock');
		}
		for (const field of ['watersurfaceterrain', 'underwaterterrain', 'murkwatersurfaceterrain', 'swampterrain']) {
			b.field.terrain = field;
			b.singleEvent('DamagingHit', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p, q, Dex.getActiveMove('tackle'), 1);
			assert(!b.p2.sideConditions.stealthrock, field);
		}
		b.field.terrain = '';
		b.singleEvent('DamagingHit', passiveEffect(b, 'shieldsdown'), passiveState(p, 'shieldsdown'), p, q, Dex.getActiveMove('surf'), 1);
		assert(!b.p2.sideConditions.stealthrock);
	});
});
