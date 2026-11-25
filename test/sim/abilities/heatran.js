'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Heatran ability rework', () => {
	let battle;

	function start(ability, species = 'Heatran', formatid = 'gen9nofieldsinglesgame') {
		battle = common.createBattle({ formatid }, [
			[{ species, ability, item: 'Heatranite', moves: ['splash', 'shoreup'] }],
			[{ species: 'Seel', ability: 'No Ability', moves: ['tackle', 'splash', 'ember', 'watergun'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	function power(holder, target, move) {
		return battle.runEvent('BasePower', holder, target, battle.dex.getActiveMove(move), 100);
	}

	afterEach(() => battle.destroy());

	for (const ability of ['White Smoke', 'Unnerve', 'Furnace Hide']) {
		it('absorbs Fire with ' + ability + ' selected', () => {
			const [holder] = start(ability);
			battle.makeChoices('move splash', 'move ember');
			assert.equal(holder.hp, holder.maxhp);
			assert(holder.volatiles.flashfire);
		});
	}

	it('uses Flame Body and boosts only Fire attacks against a burned foe', () => {
		const [holder, foe] = start('Furnace Hide');
		assert.equal(power(holder, foe, 'flamethrower'), 100);
		battle.randomChance = () => true;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foe.status, 'brn');
		assert.equal(power(holder, foe, 'flamethrower'), 120);
		assert.equal(power(holder, foe, 'flashcannon'), 100);
	});

	for (const [field, stages] of [['infernaleclipse', 1], ['coldeclipse', 0]]) {
		it('applies the Flame Body entry effect on ' + field, () => {
			const [holder] = start('Furnace Hide', 'Heatran', 'gen9' + field + 'field');
			assert.equal(holder.boosts.def, stages);
			assert.equal(holder.boosts.spd, stages);
		});
	}

	it('rolls for contact burns once even when the holder also has passive Flame Body', () => {
		const [holder, foe] = start('Furnace Hide', 'Magmar');
		for (const [terrain, expected] of [['volcanicterrain', [6]], ['coldeclipseterrain', []]]) {
			battle.field.setTerrain(terrain, holder);
			const rolls = [];
			battle.randomChance = (numerator, denominator) => {
				if (denominator === 10) rolls.push(numerator);
				return false;
			};
			battle.runEvent('DamagingHit', holder, foe, battle.dex.getActiveMove('tackle'), 1);
			assert.deepEqual(rolls, expected);
		}
	});

	it('gains Water Compaction on Mega Evolution and powers Steel while Defense is raised', () => {
		const [holder, foe] = start('Furnace Hide');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(holder.ability, 'steamforge');
		assert(holder.hasAbility('magmaarmor'));
		assert.deepEqual(holder.getPassives(), ['watercompaction']);
		assert.equal(power(holder, foe, 'flashcannon'), 100);
		for (const [event, move] of [
			['SourceModifyAtk', 'waterfall'], ['SourceModifyAtk', 'icepunch'],
			['SourceModifySpA', 'watergun'], ['SourceModifySpA', 'icebeam'],
		]) {
			assert.equal(battle.runEvent(event, holder, foe, battle.dex.getActiveMove(move), 100), 50);
		}
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, battle.dex.getActiveMove('watergun'), 100), 50);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, battle.dex.getActiveMove('icebeam'), 100), 100);
		battle.makeChoices('move splash', 'move watergun');
		assert.equal(holder.boosts.def, 2);
		assert.equal(power(holder, foe, 'flashcannon'), 120);
		assert.equal(power(holder, foe, 'flamethrower'), 100);
		holder.clearBoosts();
		assert.equal(power(holder, foe, 'flashcannon'), 100);
	});

	for (const [field, fireImmunity] of [
		['dragonsdenterrain', true], ['volcanicterrain', false], ['infernaleclipseterrain', true],
	]) {
		it('activates Magma Armor on Mega Evolution in ' + field, () => {
			const [holder, foe] = start('Unnerve');
			battle.field.changeTerrain(field, holder);
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(holder.boosts.def, 1);
			assert.equal(holder.boosts.spd, 1);
			assert.equal(power(holder, foe, 'flashcannon'), 120);
			const before = holder.hp;
			battle.actions.useMove('ember', foe, { target: holder });
			assert.equal(holder.hp === before, fireImmunity);
		});
	}

	it('prevents freezing and uses Magma Armor’s existing Cold Eclipse exception', () => {
		const [holder] = start('Unnerve');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(holder.setStatus('frz'), false);
		battle.field.changeTerrain('coldeclipseterrain', holder);
		assert(holder.setStatus('frz'));
		battle.singleEvent('Update', holder.getAbility(), holder.abilityState, holder);
		assert.equal(holder.status, '');
	});

	it('uses a single Magma Armor entry boost if the holder also has it as a passive', () => {
		const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
		const [holder] = start('Unnerve');
		battle.makeChoices('move splash mega', 'move splash');
		holder.getPassives = () => ['magmaarmor'];
		battle.field.changeTerrain('dragonsdenterrain', holder);
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		battle.singleEvent('SwitchIn', passiveEffect(battle, 'magmaarmor'), passiveState(holder, 'magmaarmor'), holder);
		assert.equal(holder.boosts.def, 1);
		assert.equal(holder.boosts.spd, 1);
	});

	it('lets Mold Breaker bypass its Magma Armor while Water Compaction still works', () => {
		const [holder, foe] = start('Unnerve');
		battle.field.changeTerrain('dragonsdenterrain', holder);
		battle.makeChoices('move splash mega', 'move splash');
		foe.setAbility('Mold Breaker');
		const before = holder.hp;
		battle.actions.useMove('ember', foe, { target: holder });
		assert(holder.hp < before);
		battle.actions.useMove('watergun', foe, { target: holder });
		assert.equal(holder.boosts.def, 3);
	});

	it('applies Water Compaction only once if it is also acquired as the Mega’s ability', () => {
		const [holder, foe] = start('White Smoke');
		battle.field.setTerrain('mistyterrain', holder);
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(holder.boosts.def, 2);
		holder.setAbility('Water Compaction');
		assert.equal(holder.boosts.def, 2);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, battle.dex.getActiveMove('watergun'), 100), 50);
		battle.makeChoices('move splash', 'move watergun');
		assert.equal(holder.boosts.def, 4);
	});

	it('recognizes passive Water Compaction when Shore Up heals on Water Surface', () => {
		const [holder] = start('Unnerve');
		battle.makeChoices('move splash mega', 'move splash');
		battle.field.setTerrain('watersurfaceterrain', holder);
		holder.hp = Math.floor(holder.maxhp / 2);
		battle.makeChoices('move shoreup', 'move splash');
		assert.equal(holder.boosts.def, 4); // Two from Shore Up and two at the end of the turn.
	});
});
