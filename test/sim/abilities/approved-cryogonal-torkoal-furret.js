'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Approved Cryogonal, Torkoal, and Furret changes', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function singles(species, ability) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species, ability, moves: ['splash', 'uturn', 'thunderpunch'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('Purifying Frost protects itself from status and starts three-turn Safeguard on the first Ice move', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Cryogonal', ability: 'Purifying Frost', moves: ['icywind'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const holder = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foe = battle.p2.active[0];
		assert.deepEqual(holder.species.baseStats, { hp: 80, atk: 50, def: 65, spa: 100, spd: 135, spe: 105 });
		holder.setStatus('brn');
		ally.setStatus('par');
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(holder.status, '');
		assert.equal(ally.status, 'par');
		const ice = battle.dex.getActiveMove('icywind');
		battle.actions.useMove(ice, holder, { target: foe });
		assert.equal(holder.side.sideConditions.safeguard.duration, 3);
		holder.side.sideConditions.safeguard.duration = 2;
		battle.actions.useMove(ice, holder, { target: foe });
		assert.equal(holder.side.sideConditions.safeguard.duration, 2);
	});

	it('Purifying Frost blocks major status and Yawn; suppression restores vulnerability', () => {
		const [holder, foe] = singles('Mew', 'Purifying Frost');
		for (const status of ['brn', 'psn', 'tox', 'par', 'slp', 'frz']) {
			assert(!holder.setStatus(status, foe)); assert.equal(holder.status, '');
		}
		assert(!holder.addVolatile('yawn', foe));
		holder.addVolatile('gastroacid'); assert(holder.setStatus('brn', foe));
	});
	for (const category of ['Physical', 'Special']) it('Purifying Frost halves ' + category + ' Fire attacks without reducing Ghost', () => {
		const [holder, foe] = singles('Mew', 'Purifying Frost'); battle.randomizer = n => n;
		const move = { ...battle.dex.getActiveMove('ember'), category, willCrit: false };
		const frost = battle.actions.getDamage(foe, holder, move);
		holder.addVolatile('gastroacid'); const normal = battle.actions.getDamage(foe, holder, move);
		assert(Math.abs(normal - frost * 2) <= 3);
		move.type = 'Ghost'; const ghost = battle.actions.getDamage(foe, holder, move);
		holder.removeVolatile('gastroacid'); assert.equal(battle.actions.getDamage(foe, holder, move), ghost);
	});
	it('Purifying Frost preserves a longer existing Safeguard', () => {
		const [holder, foe] = singles('Mew', 'Purifying Frost');
		holder.side.addSideCondition('safeguard', holder); holder.side.sideConditions.safeguard.duration = 5;
		battle.actions.useMove('icebeam', holder, { target: foe });
		assert.equal(holder.side.sideConditions.safeguard.duration, 5);
	});
	it('Smoldering Shroud blocks stat drops and grants Sp. Atk once per switch-in', () => {
		const [holder, foe] = singles('Torkoal', 'Smoldering Shroud');
		assert.deepEqual(holder.species.abilities, { 0: 'Drought', 1: 'Smoldering Shroud', H: 'Solid Rock', S: 'Ashen Seeds' });
		assert.deepEqual(holder.getPassives(), ['whitesmoke']);
		assert(holder.hasAbilityOrPassive('whitesmoke'));
		const snarl = battle.dex.getActiveMove('snarl');
		battle.boost({ spa: -1 }, holder, foe, snarl);
		assert.equal(holder.boosts.spa, 1);
		battle.boost({ spa: -1 }, holder, foe, snarl);
		assert.equal(holder.boosts.spa, 1);
	});

	it('Spring Fur doubles Defense and rewards a broken Substitute once per entry', () => {
		const [holder, foe] = singles('Furret', 'Spring Fur');
		assert.deepEqual(holder.species.baseStats, { hp: 95, atk: 115, def: 80, spa: 45, spd: 80, spe: 115 });
		assert.deepEqual(holder.species.abilities, { 0: 'Spring Fur', 1: 'Simple', H: 'Variety Rush' });
		assert(holder.hasAbility('furcoat'));
		assert.equal(battle.runEvent('ModifyDef', holder, null, null, 100), 200);
		const tackle = battle.dex.getActiveMove('tackle');
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert.equal(holder.boosts.atk, 0);
		for (let i = 0; i < 2; i++) {
			holder.addVolatile('substitute');
			holder.volatiles.substitute.hp = 1;
			const move = battle.dex.getActiveMove('tackle');
			Object.assign(move, { accuracy: true, willCrit: false });
			battle.actions.useMove(move, foe, { target: holder });
			assert(!holder.volatiles.substitute);
			assert.equal(holder.boosts.atk, 1);
		}
		assert.equal(holder.boosts.atk, 1);
	});

	it('Variety Rush boosts a connected U-turn and spends Bug only after the move', () => {
		const [holder, foe] = singles('Furret', 'Variety Rush');
		const pivot = battle.dex.getActiveMove('uturn');
		assert.equal(battle.runEvent('BasePower', holder, foe, pivot, 100), 140);
		const during = [];
		Object.assign(pivot, { accuracy: true, willCrit: false, basePower: 1, onAfterHit() {
			during.push(!!holder.m.varietySpent?.Bug);
		} });
		battle.actions.useMove(pivot, holder, { target: foe });
		assert.deepEqual(during, [false]);
		assert.equal(holder.m.varietySpent.Bug, true);
		assert.equal(battle.runEvent('BasePower', holder, foe, pivot, 100), 100);
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('thunderpunch'), 100), 140);
	});
});
