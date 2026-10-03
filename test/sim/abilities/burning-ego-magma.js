'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Burning Ego Magma Armor replacement', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Emboar-Mega', ability: 'Burning Ego', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]); battle.makeChoices('team 1', 'team 1'); return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('has Magma Armor instead of Thick Fat, with Water/Ice reduction and no Fire reduction or hail immunity', () => {
		const [p, foe] = start(); assert(p.hasAbility('magmaarmor')); assert(!p.hasAbility('thickfat'));
		for (const [id, n] of [['watergun', 50], ['icebeam', 50], ['ember', 100]])assert.equal(battle.runEvent('SourceModifySpA', p, foe, battle.dex.getActiveMove(id), 100), n);
		for (const [id, n] of [['waterfall', 50], ['icepunch', 50], ['firepunch', 100]])assert.equal(battle.runEvent('SourceModifyAtk', p, foe, battle.dex.getActiveMove(id), 100), n);
		assert.notEqual(battle.runEvent('Immunity', p, null, null, 'hail'), false);
	});
	for (const [field, n] of [['dragonsdenterrain', 1], ['volcanicterrain', 1], ['coldeclipseterrain', 2]])it(field + ' retains each component entry boost once', () => {
		const [p] = start(); battle.field.changeTerrain(field, p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, n); assert.equal(p.boosts.spd, n);
	});
	it('blocks Fire in Dragon Den and uses Magma Armor freeze immunity and update cure', () => {
		const [p, foe] = start(); battle.field.changeTerrain('dragonsdenterrain', p);
		const move = battle.dex.getActiveMove('ember'); const hp = p.hp;
		battle.actions.useMove(move, foe, { target: p }); assert.equal(p.hp, hp);
		battle.field.clearTerrain(); assert.equal(p.setStatus('frz'), false);
		battle.field.changeTerrain('coldeclipseterrain', p); assert(p.setStatus('frz'));
		battle.singleEvent('Update', p.getAbility(), p.abilityState, p); assert.equal(p.status, '');
	});
	it('loses Thick Fat-only Cold Eclipse benefits but preserves Fire-type defense benefit', () => {
		const [p] = start(); battle.field.changeTerrain('coldeclipseterrain', p);
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 75);
		assert.equal(battle.runEvent('ModifyDef', p, null, null, 100), 150);
		p.setType('Normal'); assert.equal(battle.runEvent('ModifyDef', p, null, null, 100), 100);
	});
	it('retains one Flame Body roll, Ultra Ego hit healing/boosts and Proficient', () => {
		const [p, foe] = start(); p.hp = 100; const rolls = [];
		battle.randomChance = (a, b) => { rolls.push([a, b]); return true; };
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.deepEqual(rolls, [[3, 10]]); assert.equal(foe.status, 'brn');
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1); assert(p.hp > 100);
		assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('firepunch'), 100), 130);
	});
});
