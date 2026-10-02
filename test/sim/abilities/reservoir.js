'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Poliwrath Reservoir', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(item = '', ability = 'Reservoir') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame@@@!teampreview'}, [[
			{species: 'Poliwrath', ability, item, moves: ['splash']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash', 'surf', 'explosion', 'flamethrower']}]]);
		return battle.getAllActive();
	}
	it('is unique, exposes all components and is legal with the mixed spread', () => {
		const [p] = setup();
		assert.deepEqual(p.species.abilities, {0: 'Reservoir', 1: 'Knuckle Tide', H: 'Crosscurrent'});
		assert.equal(p.species.bst, 560);
		assert.equal(p.species.baseStats.atk, 100);
		assert.equal(p.species.baseStats.spa, 95);
		for (const a of ['waterabsorb', 'gluttony', 'damp']) assert(p.hasAbility(a), a);
		assert.deepEqual(Dex.abilities.all().filter(a => a.num === 11233).map(a => a.id), ['reservoir']);
		assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([
			{species: 'Poliwrath', ability: 'Reservoir', moves: ['surf', 'drainpunch']},
		]), null);
	});
	it('absorbs Water attacks for 1/4 HP, with Heal Block preventing only recovery', () => {
		const [p] = setup(); p.hp = 100;
		battle.makeChoices('move splash', 'move surf');
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp / 4));
		p.addVolatile('healblock'); const hp = p.hp;
		battle.makeChoices('move splash', 'move surf'); assert.equal(p.hp, hp);
	});
	it('retains grounded Water Surface healing', () => {
		const [p] = setup(); battle.field.setTerrain('watersurfaceterrain', p); p.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp / 16));
	});
	it('consumes a pinch berry at half HP after taking damage', () => {
		const [p, foe] = setup('Liechi Berry');
		battle.damage(Math.ceil(p.maxhp / 2), p, foe, battle.dex.getActiveMove('tackle'));
		battle.eachEvent('Update');
		assert.equal(p.item, ''); assert.equal(p.boosts.atk, 1);
	});
	it('blocks explosions without the attacker fainting', () => {
		const [p, foe] = setup();
		battle.makeChoices('move splash', 'move explosion');
		assert.equal(p.hp, p.maxhp); assert.equal(foe.hp, foe.maxhp);
	});
	it('retains Damp Fire mitigation and Aftermath protection', () => {
		const [p, foe] = setup();
		for (const [event, id] of [['ModifyAtk', 'firepunch'], ['ModifySpA', 'flamethrower']]) {
			assert.equal(battle.runEvent(event, foe, p, battle.dex.getActiveMove(id), 100), 50);
		}
		const hp = foe.hp;
		battle.damage(50, foe, p, battle.dex.abilities.get('aftermath')); assert.equal(foe.hp, hp);
	});
	it('blocks ignition moves on Corrosive Mist', () => {
		const [p] = setup(); battle.field.setTerrain('corrosivemistterrain', p);
		const hp = p.hp;
		battle.actions.runMove('heatwave', battle.p2.active[0], 1);
		assert.equal(p.hp, hp); assert.equal(battle.field.terrain, 'corrosivemistterrain');
	});
	it('loses absorption, early berries and explosion protection when suppressed', () => {
		const [p] = setup('Liechi Berry'); p.addVolatile('gastroacid');
		p.hp = Math.floor(p.maxhp / 2); battle.eachEvent('Update'); assert.equal(p.item, 'liechiberry');
		p.hp = p.maxhp; battle.makeChoices('move splash', 'move surf'); assert(p.hp < p.maxhp);
		battle.makeChoices('move splash', 'move explosion'); assert.equal(battle.p2.active[0].hp, 0);
	});
});
