'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Approved Cryogonal, Torkoal, and Furret changes', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function singles(species, ability) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species, ability, moves: ['splash', 'uturn', 'thunderpunch']},
		], [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('Purifying Frost cures active allies and starts five-turn Safeguard on the first Ice move', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Cryogonal', ability: 'Purifying Frost', moves: ['icywind']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const holder = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foe = battle.p2.active[0];
		assert.deepEqual(holder.species.baseStats, {hp: 80, atk: 50, def: 65, spa: 100, spd: 135, spe: 105});
		holder.setStatus('brn');
		ally.setStatus('par');
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(holder.status, '');
		assert.equal(ally.status, '');
		const ice = battle.dex.getActiveMove('icywind');
		battle.actions.useMove(ice, holder, {target: foe});
		assert.equal(holder.side.sideConditions.safeguard.duration, 5);
		holder.side.sideConditions.safeguard.duration = 2;
		battle.actions.useMove(ice, holder, {target: foe});
		assert.equal(holder.side.sideConditions.safeguard.duration, 2);
	});

	it('Smoldering Shroud blocks stat drops and grants Sp. Atk once per switch-in', () => {
		const [holder, foe] = singles('Torkoal', 'Smoldering Shroud');
		assert.deepEqual(holder.species.abilities, {0: 'Drought', 1: 'Smoldering Shroud', H: 'Solid Rock'});
		assert(holder.hasAbility('whitesmoke'));
		const snarl = battle.dex.getActiveMove('snarl');
		battle.boost({spa: -1}, holder, foe, snarl);
		assert.equal(holder.boosts.spa, 1);
		battle.boost({spa: -1}, holder, foe, snarl);
		assert.equal(holder.boosts.spa, 1);
	});

	it('Spring Fur doubles Defense and raises Attack after one survived foe physical hit', () => {
		const [holder, foe] = singles('Furret', 'Spring Fur');
		assert.deepEqual(holder.species.baseStats, {hp: 95, atk: 115, def: 80, spa: 45, spd: 80, spe: 115});
		assert.deepEqual(holder.species.abilities, {0: 'Spring Fur', 1: 'Simple', H: 'Variety Rush'});
		assert(holder.hasAbility('furcoat'));
		assert.equal(battle.runEvent('ModifyDef', holder, null, null, 100), 200);
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert.equal(holder.boosts.atk, 1);
	});

	it('Variety Rush boosts a connected U-turn and spends Bug only after the move', () => {
		const [holder, foe] = singles('Furret', 'Variety Rush');
		const pivot = battle.dex.getActiveMove('uturn');
		assert.equal(battle.runEvent('BasePower', holder, foe, pivot, 100), 140);
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, pivot, 10);
		assert.equal(battle.runEvent('BasePower', holder, foe, pivot, 100), 140);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, pivot);
		assert.equal(battle.runEvent('BasePower', holder, foe, pivot, 100), 100);
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('thunderpunch'), 100), 140);
	});
});
