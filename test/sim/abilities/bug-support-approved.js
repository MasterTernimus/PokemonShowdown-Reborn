'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability, mode = 'doubles') {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'uturn', 'pollenpuff', 'toxic'] });
	const teams = [[mon(species, ability), mon(), mon('Blissey')], [mon(), mon('Chansey'), mon('Mew')]];
	if (mode === 'ffa') teams.push([mon(), mon('Blissey')], [mon(), mon('Blissey')]);
	battle = common.createBattle({ formatid: mode === 'ffa' ? 'gen9freeforall4pmistyfieldadrienn' : mode === 'singles' ? 'gen9nofieldsinglesgame' : 'gen9nofielddoublesbattle' }, teams);
	battle.makeChoices(...teams.map(t => 'team ' + t.map((p, i) => i + 1).join('')));
	battle.field.terrain = '';
	battle.randomizer = d => d;
	battle.randomChance = (n, d) => n >= d;
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 8000;
	return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
}
function use(id, source, target, extra = {}) {
	const move = Dex.getActiveMove(id); Object.assign(move, { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(move, source, { target });
	battle.clearActiveMove(); return move;
}
function pivot(mode = 'doubles') {
	battle.makeChoices(...battle.sides.map((s, i) => i ? (mode === 'doubles' ? 'move splash, move splash' : 'move splash') : (mode === 'doubles' ? 'move uturn 1, move splash' : 'move uturn')));
	assert.equal(battle.requestState, 'switch');
	battle.makeChoices('switch 3');
	return battle.p1.active[0];
}
describe('Approved Beedrill and Butterfree support changes', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('uses only the approved two base slots and keeps Magic Guard hidden', () => {
		assert.deepEqual(Dex.species.get('butterfree').abilities, { '0': 'Gentle Scales', '1': 'Tinted Lens', H: 'Magic Guard' });
		assert.deepEqual(Dex.species.get('beedrill').abilities, { '0': 'Hive Courier', '1': 'Dual Wield', H: 'Sniper' });
		for (const [name, id] of [['Gentle Scales', 'butterfree'], ['Hive Courier', 'beedrill']]) assert.deepEqual(Dex.species.all().filter(s => Object.values(s.abilities).includes(name)).map(s => s.id), [id]);
	});
	it('Gentle Scales retains Compound Eyes accuracy and Mirror Arena entry bonuses', () => {
		const [p, t] = setup('Butterfree', 'Gentle Scales');
		assert(p.hasAbility('compoundeyes'));
		const m = Dex.getActiveMove('sleeppowder');
		assert.equal(battle.runEvent('ModifyAccuracy', t, p, m, 75), 98);
		battle.field.terrain = 'mirrorarenaterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
	});
	for (const status of ['brn', 'par', 'psn', 'tox', 'slp', 'frz']) it('Gentle Scales cures healed ally ' + status + ' once per turn', () => {
		const [p, t, ally] = setup('Butterfree', 'Gentle Scales');
		ally.hp = 2000;
		ally.setStatus(status, ally);
		use('pollenpuff', p, ally);
		assert.equal(ally.hp, 6000);
		assert.equal(ally.status, '');
		assert(p.volatiles.gentlescalesspent);
		ally.setStatus('par', ally);
		ally.hp = 2000;
		use('pollenpuff', p, ally);
		assert.equal(ally.hp, 6000);
		assert.equal(ally.status, 'par');
		p.setAbility('Pressure');
		p.setAbility('Gentle Scales');
		ally.hp = 2000;
		use('pollenpuff', p, ally);
		assert.equal(ally.status, 'par');
		battle.fieldEvent('Residual');
		ally.hp = 2000;
		use('pollenpuff', p, ally);
		assert.equal(ally.status, '');
	});
	for (const reason of ['full', 'healblock', 'protect', 'suppression', 'foe', 'othermove']) it('Gentle Scales rejects ' + reason, () => {
		const [p, t, ally] = setup('Butterfree', 'Gentle Scales');
		const target = reason === 'foe' ? t : ally;
		target.hp = reason === 'full' ? 8000 : 2000;
		target.setStatus('par', target);
		if (reason === 'healblock' || reason === 'protect') target.addVolatile(reason, target);
		if (reason === 'suppression') p.addVolatile('gastroacid');
		use(reason === 'othermove' ? 'healpulse' : 'pollenpuff', p, target);
		assert.equal(target.status, 'par');
		assert(!p.volatiles.gentlescalesspent);
	});
	it('Toxic damage healing shares the poison cap across hits, foes and ability changes', () => {
		const [p, t] = setup('Butterfree-Mega', 'Toxic Evolution');
		p.hp = 4000;
		t.setStatus('psn', t);
		use('waterpulse', p, t);
		assert.equal(p.hp, 5000);
		assert(p.volatiles.toxicevolutionhealed);
		use('toxic', p, battle.p2.active[1]);
		assert.equal(p.hp, 5000);
		p.setAbility('Pressure');
		p.setAbility('Toxic Evolution');
		use('tackle', p, t);
		assert.equal(p.hp, 5000);
		battle.fieldEvent('Residual');
		p.hp = 4000;
		use('tackle', p, t);
		assert.equal(p.hp, 5000);
	});
	it('Toxic existing infliction and retaliation healing spend the same damage-heal cap', () => {
		const [p, t] = setup('Butterfree-Mega', 'Toxic Evolution');
		p.hp = 4000;
		use('toxic', p, t);
		assert.equal(p.hp, 5000);
		use('tackle', p, t);
		assert.equal(p.hp, 5000);
		battle.fieldEvent('Residual');
		p.hp = 4000;
		t.cureStatus();
		battle.randomChance = () => true;
		const hp = p.hp;
		use('tackle', t, p, { damage: 100 });
		assert.equal(p.hp, hp + 900);
		const healed = p.hp;
		use('tackle', p, t);
		assert.equal(p.hp, healed);
	});
	for (const reason of ['healthy', 'ally', 'protect', 'substitute', 'zero', 'status', 'suppression', 'healblock']) it('Toxic damage healing rejects ' + reason, () => {
		const [p, t, ally] = setup('Butterfree-Mega', 'Toxic Evolution');
		p.hp = 4000;
		const target = reason === 'ally' ? ally : t; if (reason !== 'healthy') target.setStatus('psn', target);
		if (reason === 'protect' || reason === 'substitute') target.addVolatile(reason, target);
		if (reason === 'suppression') p.addVolatile('gastroacid'); if (reason === 'healblock') p.addVolatile('healblock');
		if (reason === 'zero') battle.onEvent('Damage', battle.format, (damage, victim) => victim === target ? 0 : damage);
		use(reason === 'status' ? 'growl' : 'tackle', p, target, reason === 'zero' ? { damage: 0 } : {});
		assert.equal(p.hp, 4000);
	});
	it('Mythic activation first clears only negative defenses then applies the existing distinct boosts', () => {
		const [p, t, ally] = setup('Butterfree-Gmax', 'Mythic Scale');
		Object.assign(p.boosts, { def: -3, spd: -2, atk: -2 }); Object.assign(ally.boosts, { def: -4, spd: -1, spe: -2 });
		t.boosts.def = -3;
		use('sleeppowder', p, t);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 0);
		assert.equal(p.boosts.atk, -2);
		assert.equal(ally.boosts.def, 0);
		assert.equal(ally.boosts.spd, 1);
		assert.equal(ally.boosts.spe, -2);
		assert.equal(t.boosts.def, -3);
		p.boosts.def = -2;
		ally.boosts.spd = -2;
		t.cureStatus();
		use('gmaxbefuddle', p, t, { basePower: 1 });
		assert.equal(p.boosts.def, -2);
		assert.equal(ally.boosts.spd, -2);
	});
	it('Mythic preserves positive defenses and never cleanses on failed or indirect activation', () => {
		const [p, t, ally] = setup('Butterfree-Gmax', 'Mythic Scale');
		p.boosts.def = 2;
		p.boosts.spd = 3;
		ally.boosts.def = -2;
		ally.boosts.spd = 2;
		use('sleeppowder', p, t, { sourceEffect: 'sleeptalk' });
		assert.equal(ally.boosts.def, -2);
		t.cureStatus();
		use('sleeppowder', p, t);
		assert.equal(p.boosts.def, 3);
		assert.equal(p.boosts.spd, 3);
		assert.equal(ally.boosts.def, 0);
		assert.equal(ally.boosts.spd, 3);
	});
	for (const mode of ['singles', 'doubles', 'ffa']) it('Hive Courier confirms a ' + mode + ' pivot, clears hazards before entry and guards only actual allies', () => {
		const [p, t, ally] = setup('Beedrill', 'Hive Courier', mode);
		for (const h of ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge']) p.side.addSideCondition(h, t);
		const incoming = pivot(mode);
		assert.equal(incoming.species.id, 'blissey');
		assert.equal(incoming.hp, 8000);
		assert.equal(incoming.status, '');
		assert.equal(incoming.boosts.spe, 0);
		for (const h of ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'gmaxsteelsurge']) assert(!p.side.sideConditions[h]);
		assert(incoming.volatiles.hivecourierguard); if (ally) assert(ally.volatiles.hivecourierguard);
		for (const foe of incoming.foes()) assert(!foe.volatiles.hivecourierguard);
	});
	it('Hive guard works with no hazards and reduces every hit of exactly one move by 25%', () => {
		setup('Beedrill', 'Hive Courier');
		const incoming = pivot(), foe = battle.p2.active[0];
		const hp = incoming.hp;
		use('doublekick', foe, incoming, { damage: 100, multihit: 3 });
		assert.equal(hp - incoming.hp, 225);
		assert(!incoming.volatiles.hivecourierguard);
		const after = incoming.hp;
		use('doublekick', foe, incoming, { damage: 100, multihit: 3 });
		assert.equal(after - incoming.hp, 300);
	});
	it('Hive guard does not stack or refresh, expires next turn, and clears on switching', () => {
		const [p] = setup('Beedrill', 'Hive Courier');
		const incoming = pivot();
		const state = incoming.volatiles.hivecourierguard;
		assert(!incoming.addVolatile('hivecourierguard', p));
		assert.equal(incoming.volatiles.hivecourierguard, state);
		assert.equal(state.duration, 1);
		battle.makeChoices('move splash, move splash', 'move splash, move splash');
		assert(!incoming.volatiles.hivecourierguard);
		incoming.addVolatile('hivecourierguard', p);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert(!incoming.volatiles.hivecourierguard);
	});
	for (const reason of ['protect', 'substitute', 'zero', 'nonbug', 'nonpivot', 'suppression', 'forced', 'failedswitch']) it('Hive Courier does not reward ' + reason, () => {
		const [p, t] = setup('Beedrill', 'Hive Courier');
		p.side.addSideCondition('stealthrock', t);
		if (reason === 'protect' || reason === 'substitute') t.addVolatile(reason, t);
		if (reason === 'suppression') p.addVolatile('gastroacid');
		if (reason === 'zero') battle.onEvent('Damage', battle.format, (damage, victim) => victim === t ? 0 : damage);
		const move = use(reason === 'nonbug' ? 'voltswitch' : reason === 'nonpivot' ? 'tackle' : 'uturn', p, t, reason === 'zero' ? { damage: 0 } : {});
		if (reason === 'failedswitch') battle.onEvent('SwitchOut', battle.format, () => false);
		const incoming = battle.p1.pokemon[2];
		battle.actions.switchIn(incoming, 0, reason === 'forced' ? null : move, reason === 'forced');
		assert(p.side.sideConditions.stealthrock);
		assert(!incoming.volatiles.hivecourierguard);
		assert(!battle.p1.active[1].volatiles.hivecourierguard);
	});
	it('Gentle Scales does not spend its cure on a healthy ally and retains non-cure effects while no slot is shared', () => {
		const [p, t, ally] = setup('Butterfree', 'Gentle Scales');
		ally.hp = 2000;
		use('pollenpuff', p, ally);
		assert(!p.volatiles.gentlescalesspent);
		ally.hp = 2000;
		ally.setStatus('brn', ally);
		use('pollenpuff', p, ally);
		assert.equal(ally.status, '');
	});
	it('Mythic FFA activation clears only its holder defenses, leaving all opponents unchanged', () => {
		const [p, t] = setup('Butterfree-Gmax', 'Mythic Scale', 'ffa');
		p.boosts.def = -2;
		p.boosts.spd = -2;
		for (const foe of p.foes()) { foe.boosts.def = -3; foe.boosts.spd = -3; }
		use('sleeppowder', p, t);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 0);
		for (const foe of p.foes()) {
			assert.equal(foe.boosts.def, -3);
			assert.equal(foe.boosts.spd, -3);
		}
	});
	for (const reason of ['miss', 'immunity', 'ally']) it('Hive Courier rejects a ' + reason + ' pivot', () => {
		const [p, t, ally] = setup('Beedrill', 'Hive Courier');
		p.side.addSideCondition('stealthrock', t);
		if (reason === 'immunity') {
			t.setType('Fire');
			t.setAbility('Wonder Guard');
		}
		const move = use('uturn', p, reason === 'ally' ? ally : t, reason === 'miss' ? { accuracy: 0 } : {});
		const incoming = battle.p1.pokemon[2];
		battle.actions.switchIn(incoming, 0, move);
		assert(p.side.sideConditions.stealthrock);
		assert(!incoming.volatiles.hivecourierguard);
		assert(!ally.volatiles.hivecourierguard);
	});
	it('Hive Courier does not hand off after an Eject Button cancels its own pivot', () => {
		const [p, t] = setup('Beedrill', 'Hive Courier');
		t.setItem('Eject Button');
		p.side.addSideCondition('stealthrock', t);
		battle.makeChoices('move uturn 1, move splash', 'move splash, move splash');
		assert.equal(battle.requestState, 'switch');
		assert(!p.switchFlag);
		battle.makeChoices('', 'switch 3');
		assert.equal(battle.p1.active[0], p);
		assert(p.side.sideConditions.stealthrock);
		assert(!battle.p1.active[1].volatiles.hivecourierguard);
	});
	it('Hive Courier grants a fresh handoff after a real re-entry', () => {
		const [p] = setup('Beedrill', 'Hive Courier'); pivot();
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], p);
		const incoming = pivot();
		assert(incoming.volatiles.hivecourierguard);
		assert.equal(battle.log.filter(l => l.includes('|-activate|') && l.includes('Hive Courier')).length, 2);
	});
	it('Hive guard survives status moves and residual damage, then protects the next real attack', () => {
		const [p, t, ally] = setup('Beedrill', 'Hive Courier'); pivot();
		use('growl', t, ally);
		assert(ally.volatiles.hivecourierguard);
		battle.damage(100, ally, t, Dex.conditions.get('brn'));
		assert(ally.volatiles.hivecourierguard);
		const hp = ally.hp;
		use('tackle', t, ally, { damage: 100 });
		assert.equal(hp - ally.hp, 75);
		assert(!ally.volatiles.hivecourierguard);
	});
});
