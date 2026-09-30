'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Apex Flytrap and approved roster adjustments', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function start() {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Carnivine', ability: 'Apex Flytrap', moves: ['splash']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash', 'tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('uses the approved stats and ability slots', () => {
		const [holder] = start();
		assert.deepEqual(holder.species.baseStats, {hp: 80, atk: 115, def: 85, spa: 90, spd: 80, spe: 70});
		assert.deepEqual(holder.species.abilities, {0: 'Apex Flytrap', 1: 'Dry Skin', H: 'Regenerator'});
		const toad = battle.dex.species.get('Seismitoad');
		assert.deepEqual(toad.baseStats, {hp: 105, atk: 110, def: 90, spa: 95, spd: 90, spe: 75});
		assert.deepEqual(toad.abilities, {0: 'Swift Swim', 1: 'Mire Chorus', H: 'Marsh Conduit'});
	});

	it('is airborne and traps a contact attacker once per switch-in', () => {
		const [holder, foe] = start();
		assert.equal(holder.hasAbility('levitate'), true);
		assert.equal(holder.isGrounded(), null);
		assert.equal(holder.runImmunity('Ground'), false);
		const tackle = battle.dex.getActiveMove('tackle');
		assert.equal(foe.isActive, true);
		assert.equal(tackle.flags.contact, 1);
		assert.equal(foe.isAlly(holder), false);
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert(foe.volatiles.apexflytraptrapped);
		assert.equal(holder.abilityState.trapUsed, true);
		foe.removeVolatile('apexflytraptrapped');
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert.equal(foe.volatiles.apexflytraptrapped, undefined);
	});

	it('does not trap attackers using noncontact moves', () => {
		const [holder, foe] = start();
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState,
			holder, foe, battle.dex.getActiveMove('watergun'), 10);
		assert.equal(foe.volatiles.apexflytraptrapped, undefined);
	});

	it('holds the attacker through the following turn, then lets it leave', () => {
		const [holder, foe] = start();
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState,
			holder, foe, battle.dex.getActiveMove('tackle'), 10);
		battle.runEvent('TrapPokemon', foe);
		assert.equal(foe.trapped, true);
		battle.makeChoices('move splash', 'move splash');
		assert(foe.volatiles.apexflytraptrapped);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(foe.volatiles.apexflytraptrapped, undefined);
	});
});
