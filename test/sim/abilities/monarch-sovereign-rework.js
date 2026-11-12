'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Monarch names and Sovereign chip replacements', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability, doubles = false) {
		const mon = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
			[[{ ...mon, ability }, mon, mon], [mon, mon, mon]]);
		battle.makeChoices('team 123', 'team 123');
		for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 1600;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(p, q, id, extra = {}) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, damage: 100 }, extra);
		battle.actions.useMove(move, p, { target: q });
		battle.clearActiveMove();
		return move;
	}
	for (const [old, name, id] of [
		['Pollen Bloom', 'Verdant Monarch', 'pollenbloom'],
		['Water Barrage', 'Tidal Monarch', 'waterbarrage'],
		['Unbound Blaze', 'Blazing Monarch', 'unboundblaze'],
	]) it(name + ' preserves old names and canonical mechanics', () => {
		assert.equal(Dex.abilities.get(old), Dex.abilities.get(name));
		assert.equal(Dex.abilities.get(name).id, id);
		assert.equal(Dex.abilities.get(old).name, name);
		const [p, q] = setup(name);
		assert(p.hasAbility(old));
		assert(p.hasAbility(name));
		assert.equal(battle.runEvent('ModifyAccuracy', q, p, Dex.getActiveMove('hypnosis'), 60), 66);
	});
	it('adds Tough Claws only to contact damage on Atrocity', () => {
		const [p, q] = setup('Atrocity');
		assert(AbilityComponents.atrocity.includes('toughclaws'));
		assert(p.hasAbility('toughclaws'));
		for (const contact of [false, true]) {
			const m = Object.assign(Dex.getActiveMove('tackle'), { type: 'Water', flags: contact ? { contact: 1 } : {} });
			assert.equal(battle.runEvent('BasePower', p, q, m, 100), contact ? 130 : 100);
		}
	});
	it('adds Fire Ward to Infernal Dominion while retaining its existing protection', () => {
		const [p, q] = setup('Infernal Dominion');
		assert(p.hasAbility('fireward'));
		for (const [field, expected] of [['', 130], ['coldeclipseterrain', 130], ['dragonsdenterrain', 150]]) {
			battle.field.terrain = field;
			for (const stat of ['ModifyDef', 'ModifySpD']) assert.equal(battle.runEvent(stat, p, q, Dex.getActiveMove('tackle'), 100), expected);
		}
	});
	for (const ability of ['Rain Sovereign', 'Sand Sovereign', 'Frost Sovereign']) it(ability + ' no longer chips foes', () => {
		const [p, q] = setup(ability);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert.equal(q.hp, 1600);
	});
	it('Rain heals the lowest-percent ally once per turn, retaining matching STAB', () => {
		const [p, q] = setup('Rain Sovereign', true), ally = battle.p1.active[1];
		ally.hp = 400;
		for (const id of ['watergun', 'thunderbolt', 'airslash']) hit(p, q, id);
		assert.equal(ally.hp, 500);
		assert.equal(p.hp, 1600);
		battle.turn++;
		hit(p, q, 'watergun');
		assert.equal(ally.hp, 600);
	});
	it('Rain heals itself in singles but not from Substitute or ally hits', () => {
		const [p, q] = setup('Rain Sovereign');
		p.hp = 800;
		q.addVolatile('substitute');
		hit(p, q, 'watergun');
		assert.equal(p.hp, 800);
		q.removeVolatile('substitute');
		hit(p, q, 'watergun');
		assert.equal(p.hp, 900);
	});
	for (const id of ['rockslide', 'darkpulse']) it(id + ' breaks both screens only after opposing HP damage', () => {
		const [p, q] = setup('Sand Sovereign');
		q.side.addSideCondition('reflect', q);
		q.side.addSideCondition('lightscreen', q);
		q.addVolatile('protect');
		hit(p, q, id);
		assert(q.side.sideConditions.reflect && q.side.sideConditions.lightscreen);
		q.removeVolatile('protect');
		hit(p, q, id);
		assert(!q.side.sideConditions.reflect && !q.side.sideConditions.lightscreen);
	});
	it('Frost lowers both spread targets once per entry, without resetting on ability restart', () => {
		const [p, q] = setup('Frost Sovereign', true), other = battle.p2.active[1];
		hit(p, q, 'blizzard');
		assert.equal(q.boosts.spe, -1);
		assert.equal(other.boosts.spe, -1);
		p.setAbility('No Ability'); p.setAbility('Frost Sovereign');
		hit(p, q, 'blizzard');
		assert.equal(q.boosts.spe, -1);
		battle.makeChoices('switch 3, move 1', 'move 1, move 1');
		battle.makeChoices('switch 3, move 1', 'move 1, move 1');
		hit(p, q, 'blizzard');
		assert.equal(q.boosts.spe, -2);
	});
	it('Frost retains Ice Body recovery and respects stat-drop protection', () => {
		const [p, q] = setup('Frost Sovereign');
		p.hp = 800;
		battle.singleEvent('Weather', p.getAbility(), p.abilityState, p, null, Dex.conditions.get('hail'));
		assert.equal(p.hp, 900);
		q.setAbility('Clear Body');
		hit(p, q, 'icebeam');
		assert.equal(q.boosts.spe, 0);
	});
});
