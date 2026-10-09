'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Holy Cow, Mega Victreebel, and Masquerain revisions', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(team, foe = {species: 'Mew', ability: 'No Ability', moves: ['splash']}) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [team[0], [foe]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('keeps Masquerain ordinary slots and gives its hidden slot Storm Drain', () => {
		const [masquerain] = start([[{species: 'Masquerain', ability: 'Storm Drain', moves: ['splash']}]]);
		assert.deepEqual(masquerain.species.abilities,
			{0: 'Frightful Wings', 1: 'Scale Shelter', H: 'Storm Drain'});
		assert(masquerain.hasAbility('stormdrain'));
	});

	it('Mega Victreebel drains Poison damage with the shared turn cap', () => {
		const [victreebel, foe] = start([[{species: 'Victreebel-Mega', ability: 'Solar Trap', moves: ['sludgebomb']}]]);
		victreebel.hp = 50;
		const move = battle.dex.getActiveMove('sludgebomb');
		Object.assign(move, {damage: 60, accuracy: true, willCrit: false, secondaries: undefined, multihit: 3});
		battle.actions.runMove(move, victreebel, victreebel.getLocOf(foe));
		assert.equal(victreebel.hp, 50);
	});

	it('Mega Victreebel punishes an opponent trying to drain it', () => {
		const [victreebel, foe] = start(
			[[{species: 'Victreebel-Mega', ability: 'Solar Trap', moves: ['splash']}]],
			{species: 'Mew', ability: 'No Ability', moves: ['gigadrain']}
		);
		foe.hp = 100;
		const move = battle.dex.getActiveMove('gigadrain');
		Object.assign(move, {damage: 60, accuracy: true, willCrit: false});
		battle.actions.runMove(move, foe, foe.getLocOf(victreebel));
		assert(foe.hp < 100);
	});

	it('Holy Cow sets Holy Field for five turns on its first entry', () => {
		const [miltank] = start([[{species: 'Miltank', ability: 'Holy Cow', moves: ['milkdrink', 'splash']}]]);
		assert.deepEqual(miltank.species.abilities,
			{0: 'Thick Fat', 1: 'Scrappy', H: 'Sap Sipper', S: 'Holy Cow'});
		assert.equal(battle.field.terrain, 'holyterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		battle.field.setTerrainDuration(2);
		miltank.m.holyCowFieldAttempted = false;
		battle.dex.abilities.get('holycow').onStart.call(battle, miltank);
		assert.equal(battle.field.terrainState.duration, 2);
		assert.equal(miltank.m.holyCowFieldAttempted, true);
	});

	it('Holy Cow cannot replace a protected field, and its attempt is spent', () => {
		const [miltank] = start([[{species: 'Miltank', ability: 'Holy Cow', moves: ['splash']}]]);
		battle.field.setTerrain('chessboardterrain', miltank);
		miltank.m.holyCowFieldAttempted = false;
		battle.dex.abilities.get('holycow').onStart.call(battle, miltank);
		assert.equal(battle.field.terrain, 'chessboardterrain');
		assert.equal(miltank.m.holyCowFieldAttempted, true);
		battle.field.clearTerrain();
		battle.field.setTerrain('factoryterrain', miltank);
		battle.dex.abilities.get('holycow').onStart.call(battle, miltank);
		assert.equal(battle.field.terrain, 'factoryterrain');
	});

	it('Milk Drink cures status only after restoring HP, once per entry', () => {
		const [miltank, foe] = start([[
			{species: 'Miltank', ability: 'Holy Cow', moves: ['milkdrink', 'splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		miltank.hp = miltank.maxhp - 70;
		miltank.setStatus('brn', foe);
		battle.makeChoices('move milkdrink', 'move splash');
		assert(miltank.hp > miltank.maxhp - 70);
		assert.equal(miltank.status, '');
		miltank.setAbility('No Ability');
		miltank.setAbility('Holy Cow');
		miltank.hp -= 70;
		miltank.setStatus('brn', foe);
		battle.makeChoices('move milkdrink', 'move splash');
		assert.equal(miltank.status, 'brn');
		battle.field.setTerrain('factoryterrain', miltank);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.field.terrain, 'factoryterrain');
		miltank.hp -= 70;
		battle.makeChoices('move milkdrink', 'move splash');
		assert.equal(miltank.status, '');
	});

	it('Milk Drink at full HP does not consume the status cure', () => {
		const [miltank, foe] = start([[{species: 'Miltank', ability: 'Holy Cow', moves: ['milkdrink', 'splash']}]]);
		miltank.setStatus('par', foe);
		battle.makeChoices('move milkdrink', 'move splash');
		assert.equal(miltank.status, 'par');
		assert(!miltank.m.holyCowMilkCuredEntry);
	});
});
