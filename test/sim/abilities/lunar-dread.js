'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');

describe('Dishearten and Lunar Dread', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function make(ability = 'Dishearten', foeAbility = 'No Ability', doubles = false, item = '') {
		const team = [
			{ species: 'Ursaluna-Bloodmoon', ability, moves: ['splash', 'rest', 'tackle', 'earthpower'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		];
		const foes = [
			{ species: 'Mew', ability: foeAbility, item, moves: ['splash', 'tackle', 'spore', 'yawn'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		];
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [team, foes]);
		battle.makeChoices('team 1, 2, 3', 'team 1, 2, 3');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function hit(id, source, target) {
		const move = battle.dex.getActiveMove(id); move.accuracy = true;
		battle.actions.useMove(move, source, { target });
		battle.runEvent('AfterMove', source, target, battle.activeMove);
	}
	it('registers a unique standalone ability and leaves Bloodmoon slots and stats intact', () => {
		const ability = Dex.abilities.get('dishearten');
		assert(ability.exists && ability.desc.includes('Sp. Atk'));
		assert.equal(Dex.abilities.all().filter(a => a.num === ability.num).length, 1);
		assert.deepEqual(Dex.species.get('ursalunabloodmoon').abilities, { 0: "Mind's Eye", 1: 'Lunar Dread', H: 'Shadow Shield' });
		assert.deepEqual(Dex.species.get('ursalunabloodmoon').baseStats, { hp: 133, atk: 40, def: 130, spa: 135, spd: 110, spe: 52 });
	});
	it('lowers only opposing Sp. Atk in singles, once per entry', () => {
		const [holder, foe] = make();
		assert.equal(foe.boosts.spa, -1); assert.equal(foe.boosts.atk, 0);
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(foe.boosts.spa, -1);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(foe.boosts.spa, -2);
	});
	it('lowers both opponents in doubles and leaves allies alone', () => {
		const [holder] = make('Dishearten', 'No Ability', true);
		for (const foe of battle.p2.active) assert.equal(foe.boosts.spa, -1);
		for (const ally of battle.p1.active) assert.equal(ally.boosts.spa, 0);
		assert(!holder.hasAbility('intimidate'));
	});
	it('respects Substitute on entry', () => {
		const [holder, foe] = make();
		foe.clearBoosts(); foe.addVolatile('substitute', foe);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(foe.boosts.spa, 0);
		assert.equal(holder.isActive, true);
	});
	for (const [ability, expectedSpa, expectedAtk] of [
		['Clear Body', 0, 0], ['White Smoke', 0, 0], ['Full Metal Body', 0, 0],
		['Mirror Armor', 0, 0], ['Contrary', 1, 0], ['Competitive', 1, 0], ['Defiant', -1, 2],
		['Guard Dog', -1, 0], ['Rattled', -1, 0], ['Inner Focus', -1, 0],
	]) {
		it(`uses ordinary stat-drop handling for ${ability}`, () => {
			const [holder, foe] = make('Dishearten', ability);
			assert.equal(foe.boosts.spa, expectedSpa);
			assert.equal(foe.boosts.atk, expectedAtk);
			assert.equal(foe.boosts.spe, 0);
			if (ability === 'Mirror Armor') assert.equal(holder.boosts.spa, -1);
		});
	}
	it('respects Clear Amulet', () => {
		const [, foe] = make('Dishearten', 'No Ability', false, 'Clear Amulet');
		assert.equal(foe.boosts.spa, 0);
	});
	it('does not activate while Neutralizing Gas suppresses it, then activates when gas leaves', () => {
		const [holder, foe] = make('Dishearten', 'Neutralizing Gas');
		assert.equal(foe.boosts.spa, 0);
		battle.makeChoices('move splash', 'switch 2');
		// The engine resumes entry abilities before the gas user finishes switching out.
		assert(holder.abilityState.disheartenActivated);
		assert.equal(battle.p2.active[0].boosts.spa, 0);
	});
	it('Lunar Dread combines entry drops, Insomnia and Pressure without legacy effects', () => {
		const [holder, foe] = make('Lunar Dread');
		assert.equal(foe.boosts.spa, -1); assert.equal(foe.boosts.def, -1); assert.equal(foe.boosts.spd, -1);
		for (const component of ['dishearten', 'insomnia', 'pressure']) assert(holder.hasAbility(component));
		for (const removed of ['intimidate', 'magicguard', 'unaware']) assert(!holder.hasAbility(removed));
		hit('tackle', holder, foe);
		assert(!foe.volatiles.lunardread);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, battle.dex.getActiveMove('tackle'), 100), 100);
		assert.equal(battle.runEvent('ModifyCritRatio', holder, foe, battle.dex.getActiveMove('earthpower'), 1), 1);
	});
	it('Lunar Dread deducts extra PP from opponents targeting it', () => {
		const [, foe] = make('Lunar Dread');
		const slot = foe.moveSlots.find(m => m.id === 'tackle'); const pp = slot.pp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(slot.pp, pp - 2);
	});
	it('Lunar Dread prevents sleep, Rest and Yawn', () => {
		const [holder, foe] = make('Lunar Dread');
		hit('spore', foe, holder); assert.equal(holder.status, '');
		hit('yawn', foe, holder); assert(!holder.volatiles.yawn);
		holder.hp -= 20; hit('rest', holder, holder); assert.equal(holder.status, '');
	});
	it('Lunar Dread cures existing sleep and keeps local Insomnia power', () => {
		const [holder, foe] = make('No Ability');
		holder.setStatus('slp'); holder.setAbility('Lunar Dread'); battle.eachEvent('Update');
		assert.equal(holder.status, '');
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('shadowball'), 100), 130);
	});
	it('Lunar Dread sleep immunity and PP effects are suppressed by Gastro Acid', () => {
		const [holder, foe] = make('Lunar Dread');
		hit('gastroacid', foe, holder);
		assert(holder.ignoringAbility());
		const slot = foe.moveSlots.find(m => m.id === 'tackle'); const pp = slot.pp;
		battle.makeChoices('move splash', 'move tackle'); assert.equal(slot.pp, pp - 1);
		hit('spore', foe, holder); assert.equal(holder.status, 'slp');
	});
	it('Lunar Dread retains Pressure field behavior', () => {
		const [holder, foe] = make('No Ability');
		battle.field.setTerrain('underwaterterrain', holder); holder.setAbility('Lunar Dread');
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
		assert.equal(battle.runEvent('DeductPP', holder, foe), 2);
	});
});
