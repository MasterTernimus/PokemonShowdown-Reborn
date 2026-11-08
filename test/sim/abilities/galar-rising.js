'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
describe('Galar Rising and Grand abilities', () => {
	let battle; afterEach(() => battle?.destroy());
	function setup(ability, item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability, item, moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.hp = p.maxhp = p.baseMaxhp = q.hp = q.maxhp = q.baseMaxhp = 10000;
		return [p, q];
	}
	function hit(p, q, id) {
		const m = Dex.getActiveMove(id);
		m.accuracy = true;
		m.willCrit = false;
		m.basePower = 10;
		battle.actions.useMove(m, p, { target: q });
	}
	it('assigns the approved slots and retains starter passives', () => {
		for (const [id, slots, passive] of [['cinderace', ['Defiant', 'Rising Striker', 'Libero'], 'blaze'], ['rillaboom', ['Primal Rhythm', 'Rising Rhythm', 'Grassy Surge'], 'overgrow'], ['inteleon', ['Infiltrator', 'Rising Marksman', 'Calculated Shot'], 'torrent'], ['cinderacegmax', ['Grand Striker'], 'blaze'], ['rillaboomgmax', ['Grand Rhythm'], 'overgrow'], ['inteleongmax', ['Grand Marksman'], 'torrent']]) {
			assert.deepEqual(Object.values(Dex.species.get(id).abilities), slots);
			assert.deepEqual(Dex.species.get(id).passives, [passive]);
		}
	});
	for (const [base, grand, move, role] of [['Rising Striker', 'Grand Striker', 'ember', 'striker'], ['Rising Rhythm', 'Grand Rhythm', 'vinewhip', 'rhythm'], ['Rising Marksman', 'Grand Marksman', 'watergun', 'marksman']]) {
		it(base + ' triggers once and shares its use with the Grand form until switching', () => {
			const [p, q] = setup(base);
			hit(p, q, move);
			assert(p.volatiles.risingmomentum[role]);
			const boosts = { ...p.boosts };
			assert.equal(role === 'striker' ? p.boosts.spe : role === 'rhythm' ? p.boosts.def : battle.runEvent('ModifyCritRatio', p, q, Dex.getActiveMove('tackle'), 1), role === 'marksman' ? 2 : 1);
			hit(p, q, move);
			assert.deepEqual(p.boosts, boosts);
			p.setAbility(grand);
			hit(p, q, move);
			assert.deepEqual(p.boosts, boosts);
			battle.makeChoices('switch 2', 'move splash');
			assert(!p.volatiles.risingmomentum);
			battle.makeChoices('switch 2', 'move splash');
			hit(p, q, move);
			assert(p.volatiles.risingmomentum[role]);
		});
		it(base + ' ignores protection, substitutes, allies, wrong types and suppression', () => {
			const [p, q] = setup(base);
			q.addVolatile('protect');
			hit(p, q, move);
			assert(!p.volatiles.risingmomentum);
			q.removeVolatile('protect');
			q.addVolatile('substitute');
			hit(p, q, move);
			assert(!p.volatiles.risingmomentum);
			q.removeVolatile('substitute');
			hit(p, p, move);
			assert(!p.volatiles.risingmomentum);
			hit(p, q, 'tackle');
			assert(!p.volatiles.risingmomentum);
			p.addVolatile('gastroacid', q);
			hit(p, q, move);
			assert(!p.volatiles.risingmomentum);
		});
	}
	for (const [species, base, grand, move] of [['Cinderace', 'Rising Striker', 'Grand Striker', 'ember'], ['Rillaboom', 'Rising Rhythm', 'Grand Rhythm', 'vinewhip'], ['Inteleon', 'Rising Marksman', 'Grand Marksman', 'watergun']])it(species + ' keeps its spent activation through an actual Gmax form change', () => {
		const [p, q] = setup(base);
		p.formeChange(species, null, true);
		p.setAbility(base);
		hit(p, q, move);
		const state = p.volatiles.risingmomentum, boosts = { ...p.boosts };
		assert(p.formeChange(species + '-Gmax', null, true));
		assert.equal(p.ability, battle.dex.abilities.get(grand).id);
		assert.equal(p.volatiles.risingmomentum, state);
		hit(p, q, move);
		assert.deepEqual(p.boosts, boosts);
	});
	it('Grand Striker keeps Defiant and boosts G-Max Fireball exactly once without Libero', () => {
		const [p, q] = setup('Grand Striker');
		battle.boost({ atk: -1 }, p, q);
		assert.equal(p.boosts.atk, 1);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('gmaxfireball'), 100), 140);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('blazekick'), 100), 140);
		const m = Dex.getActiveMove('blazekick');
		battle.runEvent('ModifyMove', p, q, m, m);
		assert.equal(m.accuracy, 90);
		assert(!p.hasAbility('libero'));
	});
	for (const item of ['', 'Amplifield Rock'])it('Grand Rhythm preserves Forest and Grassy Aura with ' + item, () => {
		setup('Grand Rhythm', item);
		assert.equal(battle.field.terrain, 'forestterrain');
		assert.equal(battle.field.auraField, 'grassyterrain');
		assert.equal(battle.field.auraTurns, item ? 8 : 5);
		assert.equal(battle.field.auraState.sourceEffect.id, 'grandrhythm');
	});
	it('Calculated Shot keeps Frisk and Water properties without Sniper', () => {
		const [p, q] = setup('Calculated Shot');
		assert.equal(p.boosts.accuracy, 0);
		assert(!p.hasAbility('sniper'));
		assert(p.hasAbility('frisk'));
		const m = Dex.getActiveMove('watergun');
		battle.runEvent('ModifyMove', p, q, m, m);
		assert(m.noDamageVariance);
		assert.equal(m.critRatio, 2);
		q.getMoveHitData(m).crit = true;
		assert.equal(battle.runEvent('ModifyDamage', p, q, m, 100), 100);
	});
	it('Grand Marksman keeps boosted independent hits without perfect accuracy or the old timing crit bonus', () => {
		const [p, q] = setup('Grand Marksman');
		const m = Dex.getActiveMove('waterpulse');
		battle.runEvent('ModifyMove', p, q, m, m);
		assert.equal(m.multihitType, 'dualwield');
		assert.equal(battle.runEvent('ModifyCritRatio', p, q, m, 1), 1);
		const powers = [1, 2].map(hit => {
			m.hit = hit;
			return battle.runEvent('BasePower', p, q, m, 100);
		});
		assert.deepEqual(powers, [180, 15]);
		const pulse = Dex.getActiveMove('originpulse');
		battle.runEvent('ModifyMove', p, q, pulse, pulse);
		assert.notEqual(pulse.dualWieldAccuracy || pulse.accuracy, true);
	});
});
