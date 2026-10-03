'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Fresh Plumage', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Skarmory', ability: 'Fresh Plumage', moves: ['bravebird', 'dualwingbeat', 'bodypress', 'splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 1');
		battle.randomizer = x => x;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, foe, id, extra = {}) {
		const m = battle.dex.getActiveMove(id);
		Object.assign(m, { accuracy: true, willCrit: false, basePower: 10 }, extra);
		battle.actions.runMove(m, p, p.getLocOf(foe));
		return m;
	}
	it('keeps full Natural Cure switch healing once, no healthy heal, and field cure without healing', () => {
		const [p] = setup();
		p.hp = 1;
		p.setStatus('par');
		battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, '');
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 3));
		const hp = p.hp;
		battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, hp);
		p.setStatus('par');
		battle.field.changeTerrain('bewitchedwoodsterrain', p);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(p.status, '');
		assert.equal(p.hp, hp);
	});
	it('boosts the entire multihit move once and resets only on reentry', () => {
		const [p, foe] = setup(), damage = [];
		battle.onEvent('DamagingHit', battle.format, n => damage.push(n));
		hit(p, foe, 'dualwingbeat', { multihit: 2 });
		assert.equal(damage.length, 2);
		assert.equal(damage[0], damage[1]);
		assert(p.m.approvedSignatures.freshPlumageUsed);
		const m = battle.dex.getActiveMove('bravebird');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, m, 100), 100);
		p.setAbility('No Ability');
		p.setAbility('Fresh Plumage');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, m, 100), 100);
		battle.actions.switchIn(p.side.pokemon[1], 0);
		battle.actions.switchIn(p, 0);
		assert.equal(battle.runEvent('ModifyDamage', p, foe, m, 100), 120);
	});
	for (const mode of ['miss', 'protect', 'immune']) it('does not consume on ' + mode, () => {
		const [p, foe] = setup();
		if (mode === 'protect') foe.addVolatile('protect');
		if (mode === 'immune') foe.setAbility('Wonder Guard');
		hit(p, foe, 'bravebird', mode === 'miss' ? { accuracy: 0 } : {});
		assert(!p.m.approvedSignatures?.freshPlumageUsed);
	});
	it('consumes on Substitute, preserves recoil, and does not boost Body Press', () => {
		const [p, foe] = setup();
		const press = battle.dex.getActiveMove('bodypress');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, press, 100), 100);
		foe.addVolatile('substitute');
		const hp = p.hp;
		hit(p, foe, 'bravebird');
		assert(p.hp < hp);
		assert(p.m.approvedSignatures.freshPlumageUsed);
		assert.deepEqual(battle.dex.species.get('skarmory').abilities, { 0: 'Fresh Plumage', 1: 'Sturdy', H: 'Weak Armor' });
	});
});
