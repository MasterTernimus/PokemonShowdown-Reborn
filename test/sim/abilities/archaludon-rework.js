'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Archaludon approved rework', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Rail Sight', doubles = false) {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[{ species: 'Archaludon', ability, moves: ['thunderbolt', 'electroshot', 'splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['tackle', 'splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		battle.randomChance = () => false;
		battle.randomizer = x => x;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, t, id = 'tackle', extra = {}) {
		const move = battle.dex.getActiveMove(id);
		if (!p.moveSlots.some(slot => slot.id === id)) p.moveSlots.push({ move: move.name, id, pp: 10, maxpp: 10, target: move.target, disabled: false, disabledSource: '', used: false });
		Object.assign(move, { basePower: 1, accuracy: true, willCrit: false, secondaries: undefined }, extra);
		battle.actions.runMove(move, p, p.getLocOf(t));
	}
	it('Anchor Bridge inherits Sturdy and the full local Solid Rock reductions without Light Screen', () => {
		const [p, t] = setup('Anchor Bridge');
		for (const id of ['tackle', 'earthquake']) {
			const m = battle.dex.getActiveMove(id); m.willCrit = false; p.setAbility('No Ability');
			const normal = battle.actions.getDamage(t, p, m); p.setAbility('Anchor Bridge');
			const reduced = battle.actions.getDamage(t, p, m), ratio = id === 'earthquake' ? 0.6 : 0.8;
			assert(Math.abs(reduced - normal * ratio) <= 2);
		}
		hit(t, p, 'tackle', { damage: 10000 }); assert.equal(p.hp, 1); assert(!p.side.sideConditions.lightscreen);
		p.hp = p.maxhp; hit(t, p, 'fissure', { ohko: true }); assert.equal(p.hp, p.maxhp);
	});
	it('waits for the whole opposing move and grants only one charge each entry', () => {
		const [p, t] = setup(), during = [];
		battle.onEvent('DamagingHit', battle.format, () => during.push(p.m.approvedSignatures.railCharge));
		hit(t, p, 'tackle', { multihit: 3 }); assert(during.every(v => !v));
		assert(p.m.approvedSignatures.railCharge);
		const m = battle.dex.getActiveMove('thunderbolt'); assert.equal(battle.runEvent('BasePower', p, t, m, 100), 150);
		hit(p, t, 'thunderbolt'); assert(!p.m.approvedSignatures.railCharge);
		hit(t, p); assert(!p.m.approvedSignatures.railCharge);
		battle.actions.switchIn(p.side.pokemon[1], 0); battle.actions.switchIn(p, 0);
		hit(t, p); assert(p.m.approvedSignatures.railCharge);
	});
	for (const mode of ['miss', 'protect', 'immune']) it('consumes an executed Electric attack on ' + mode, () => {
		const [p, t] = setup(); hit(t, p);
		if (mode === 'protect') t.addVolatile('protect'); if (mode === 'immune') t.setType('Ground');
		hit(p, t, 'thunderbolt', mode === 'miss' ? { accuracy: 0 } : {}); assert(!p.m.approvedSignatures.railCharge);
	});
	it('preserves Electro Shot charging and its normal single SpA boost', () => {
		const [p, t] = setup(); hit(t, p); hit(p, t, 'electroshot');
		assert(p.volatiles.electroshot); assert(p.m.approvedSignatures.railCharge); assert.equal(p.boosts.spa, 1);
		battle.turn++;
		hit(p, t, 'electroshot');
		assert(!p.volatiles.electroshot);
		assert(!p.m.approvedSignatures.railCharge);
		assert.equal(p.boosts.spa, 1);
	});
	it('does not grant from Substitute-only, residual, ally/self damage or a fatal whole move', () => {
		const [p, t] = setup();
		p.addVolatile('substitute');
		hit(t, p);
		assert(!p.m.approvedSignatures.railCharge);
		p.removeVolatile('substitute'); battle.damage(1, p, t, battle.dex.conditions.get('psn')); assert(!p.m.approvedSignatures.railCharge);
		hit(p, p); assert(!p.m.approvedSignatures.railCharge);
		p.hp = 2;
		hit(t, p, 'tackle', { damage: 1, multihit: 3 });
		assert.equal(p.hp, 0);
		assert(!p.m.approvedSignatures.railCharge);
	});
	it('suppression prevents the bonus but does not reset the entry budget', () => {
		const [p, t] = setup(); hit(t, p); p.addVolatile('gastroacid');
		const m = battle.dex.getActiveMove('thunderbolt'); assert.equal(battle.runEvent('BasePower', p, t, m, 100), 100);
		p.removeVolatile('gastroacid'); assert.equal(battle.runEvent('BasePower', p, t, m, 100), 150);
		p.setAbility('No Ability'); p.setAbility('Rail Sight'); assert(p.m.approvedSignatures.railCharge);
		hit(p, t, 'thunderbolt'); hit(t, p); assert(!p.m.approvedSignatures.railCharge);
	});
	it('retains full Stalwart field activation and bypasses redirection without ignoring screens', () => {
		const [p, t] = setup(); battle.field.changeTerrain('newworldterrain', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.spa, 1);
		const m = battle.dex.getActiveMove('thunderbolt'); battle.runEvent('ModifyMove', p, t, m, m);
		assert(m.tracksTarget); assert(!m.ignoreScreens);
	});
	it('ally HP damage and interrupted Electric turns neither grant nor consume a charge', () => {
		const [p, t] = setup('Rail Sight', true); hit(battle.p1.active[1], p); assert(!p.m.approvedSignatures.railCharge);
		hit(t, p); assert(p.m.approvedSignatures.railCharge); p.addVolatile('flinch');
		hit(p, t, 'thunderbolt'); assert(p.m.approvedSignatures.railCharge);
	});
	it('Anchor Bridge respects suppression', () => {
		const [p, t] = setup('Anchor Bridge');
		p.addVolatile('gastroacid');
		hit(t, p, 'tackle', { damage: 10000 });
		assert.equal(p.hp, 0);
	});
	it('Mold Breaker bypasses Anchor Bridge Sturdy', () => {
		const [p, t] = setup('Anchor Bridge');
		t.setAbility('Mold Breaker');
		hit(t, p, 'tackle', { damage: 10000 });
		assert.equal(p.hp, 0);
	});
});
