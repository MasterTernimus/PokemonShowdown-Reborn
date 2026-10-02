'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Approved PULSE forms and Drapion abilities', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(species, ability, moves = ['splash'], foe = {species: 'Mew', ability: 'No Ability', moves: ['splash']}) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species, ability, item: 'Anomaly Core', moves},
		], [foe]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	for (const [base, form, ability, stats, types] of [
		['Avalugg', 'Avalugg-Pulse', 'Pulse Blockade', [105, 145, 210, 44, 140, 10], ['Ice']],
		['Avalugg-Hisui', 'Avalugg-Pulse', 'Pulse Blockade', [105, 145, 210, 44, 140, 10], ['Ice']],
		['Magnezone', 'Magnezone-Pulse', 'Pulse Triad', [100, 70, 145, 175, 120, 60], ['Electric', 'Steel']],
		['Mr. Mime', 'Mr. Mime-Pulse', 'Pulse Bulwark', [85, 45, 110, 100, 140, 90], ['Ghost', 'Dark']],
	]) {
		it(`Anomaly Core transforms ${base} into ${form} with approved stats`, () => {
			const [pokemon] = start(base, 'No Ability');
			assert.equal(battle.dex.items.get('anomalycore').megaStone[base], form);
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(pokemon.species.name, form);
			assert.equal(pokemon.ability, battle.dex.toID(ability));
			assert.deepEqual(pokemon.species.types, types);
			assert.deepEqual(Object.values(pokemon.species.baseStats), stats);
			assert.equal(pokemon.species.bst, stats.reduce((a, b) => a + b));
		});
	}

	it('Pulse Blockade creates finite Snowy Mountain and blocks replacement but not auras', () => {
		const [avalugg] = start('Avalugg', 'Own Tempo');
		battle.field.setTerrain('factoryterrain', avalugg);
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(battle.field.terrain, 'snowymountainterrain');
		assert(battle.field.terrainState.duration > 0 && battle.field.terrainState.duration <= 5);
		assert(!avalugg.hasAbility('solidrock'));
		assert.equal(battle.field.setTerrain('electricterrain', avalugg, battle.dex.moves.get('electricterrain'), false, true), false);
		assert.equal(battle.field.changeTerrain('icyterrain', avalugg), false);
		assert.equal(battle.field.terrain, 'snowymountainterrain');
		assert(battle.field.setTerrain('electricterrain', avalugg, battle.dex.moves.get('electricterrain')));
		assert.equal(battle.field.auraField, 'electricterrain');
		battle.field.setTerrainDuration(1);
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.terrain, 'factoryterrain');
		assert.equal(battle.field.setTerrain('holyterrain', avalugg), false);
		avalugg.addVolatile('gastroacid');
		assert(battle.field.setTerrain('holyterrain', avalugg));
	});

	it('Pulse Triad keeps Hydra Bond, Levitate and Clear Body', () => {
		const [magnezone, foe] = start('Magnezone', 'No Ability');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(battle.field.terrain, 'factoryterrain');
		assert(battle.field.terrainState.duration <= 5);
		for (const component of ['hydrabond', 'levitate', 'clearbody']) assert(magnezone.hasAbility(component));
		assert.equal(magnezone.isGrounded(), null);
		battle.boost({atk: -1}, magnezone, foe, battle.dex.moves.get('growl'));
		assert.equal(magnezone.boosts.atk, 0);
		const move = battle.dex.getActiveMove('tackle');
		battle.dex.abilities.get('pulsetriad').onModifyMove.call(battle, move, magnezone, foe);
		assert.equal(move.multihit, 3);
	});

	it('Nightmare Pulse sets Haunted Field without Infiltrator', () => {
		const [hypno] = start('Hypno', 'No Ability');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(battle.field.terrain, 'hauntedterrain');
		assert(battle.field.terrainState.duration <= 5);
		for (const component of ['pendulumswing', 'cursedbody', 'baddreams']) assert(hypno.hasAbility(component));
		assert(!hypno.hasAbility('infiltrator'));
		const move = battle.dex.getActiveMove('shadowball');
		battle.dex.abilities.get('nightmarepulse').onModifyMove.call(battle, move, hypno);
		assert(!move.infiltrates);
	});

	it('Drapion has its new ordinary abilities and preserves Aevian Toxin', () => {
		const [drapion] = start('Drapion', 'Serrated Pincers', ['nightslash']);
		assert.deepEqual(drapion.species.abilities,
			{0: 'Serrated Pincers', 1: 'Debilitating Venom', H: 'Strong Jaw', S: 'Aevian Toxin'});
		const move = battle.dex.getActiveMove('nightslash');
		assert(move.flags['contact'] && move.flags['slicing']);
		battle.dex.abilities.get('serratedpincers').onModifyMove.call(battle, move, drapion);
		assert(!move.flags['contact']);
		assert.equal(battle.runEvent('BasePower', drapion, battle.p2.active[0], move, 100), 130);
	});

	it('Debilitating Venom poisons Steel but cannot damage it with Poison attacks', () => {
		const [drapion, steel] = start('Drapion', 'Debilitating Venom', ['toxic', 'gunkshot'],
			{species: 'Registeel', ability: 'No Ability', moves: ['splash']});
		battle.makeChoices('move toxic', 'move splash');
		assert.equal(steel.status, 'tox');
		const hp = steel.hp;
		const attack = battle.dex.getActiveMove('gunkshot');
		attack.accuracy = true;
		battle.actions.runMove(attack, drapion, drapion.getLocOf(steel));
		assert.equal(steel.hp, hp);
		assert.equal(steel.boosts.atk, 0);
	});

	it('Debilitating Venom lowers a poisoned foe once per target per turn', () => {
		const [drapion, foe] = start('Drapion', 'Debilitating Venom', ['sludgebomb']);
		foe.setStatus('psn', drapion);
		const move = battle.dex.getActiveMove('sludgebomb');
		Object.assign(move, {damage: 10, accuracy: true, willCrit: false, secondaries: undefined, multihit: 3});
		battle.actions.runMove(move, drapion, drapion.getLocOf(foe));
		assert.equal(foe.boosts.atk, -1);
		battle.actions.runMove(move, drapion, drapion.getLocOf(foe));
		assert.equal(foe.boosts.atk, -1);
	});

	it('Pulse Bulwark gives screens priority and keeps transitions finite', () => {
		const [mime] = start('Mr. Mime', 'No Ability', ['reflect', 'discharge']);
		battle.makeChoices('move reflect mega', 'move splash');
		assert.equal(battle.field.terrain, 'shortcircuitterrain');
		assert(battle.field.terrainState.duration <= 5);
		assert(mime.side.getSideCondition('reflect'));
		assert.equal(battle.dex.abilities.get('pulsebulwark').onModifyPriority.call(
			battle, 0, mime, battle.p2.active[0], battle.dex.getActiveMove('reflect')), 1);
		battle.field.changeTerrain('factoryterrain', mime);
		battle.makeChoices('move discharge', 'move splash');
		assert.equal(battle.field.terrain, 'shortcircuitterrain');
		assert(battle.field.terrainState.duration < 9999);
		assert(battle.dex.species.getLearnsetData('mrmime').learnset.darkpulse.includes('9M'));
	});

	it('Pulse Bulwark cures only active major statuses on its first new screen per entry', () => {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Mr. Mime-Pulse', item: 'Anomaly Core', ability: 'Pulse Bulwark', moves: ['reflect', 'lightscreen', 'splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2, 3', 'team 1, 2');
		const mime = battle.p1.active[0], ally = battle.p1.active[1], bench = battle.p1.pokemon[2];
		mime.hp -= 40;
		const hp = mime.hp;
		mime.setStatus('brn');
		ally.setStatus('par');
		bench.setStatus('brn');
		mime.addVolatile('confusion');
		assert(mime.side.addSideCondition('reflect', mime, battle.dex.moves.get('reflect')));
		assert.equal(mime.status, '');
		assert.equal(ally.status, '');
		assert.equal(bench.status, 'brn');
		assert(mime.volatiles.confusion);
		assert.equal(mime.hp, hp);
		assert.equal(mime.m.pulseBulwarkScreenCuredEntry, true);
		mime.side.removeSideCondition('reflect');
		mime.setStatus('brn');
		ally.setStatus('par');
		mime.setAbility('No Ability');
		mime.setAbility('Pulse Bulwark');
		assert(mime.side.addSideCondition('lightscreen', mime, battle.dex.moves.get('lightscreen')));
		assert.equal(mime.status, 'brn');
		assert.equal(ally.status, 'par');
		assert.equal(mime.m.pulseBulwarkScreenCuredEntry, true);
		mime.side.removeSideCondition('lightscreen');
		mime.removeVolatile('confusion');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], mime);
		assert(!mime.m.pulseBulwarkScreenCuredEntry);
		assert(mime.side.addSideCondition('reflect', mime, battle.dex.moves.get('reflect')));
		assert.equal(mime.status, '');
	});
});


describe('Pulse Blockade field duration protocol', () => {
 let battle;
 afterEach(() => battle?.destroy());
 it('announces exact creation and re-entry refresh durations', () => {
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
   {species: 'Avalugg', ability: 'Own Tempo', item: 'Anomaly Core', moves: ['splash']},
   {species: 'Mew', ability: 'No Ability', moves: ['splash']},
  ], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
  battle.makeChoices('team 1,2', 'team 1');
  battle.makeChoices('move splash mega', 'move splash');
  const announcement = '|-fieldstart|Snowy Mountain Terrain|[turns] 5|[silent]';
  assert(battle.log.includes(announcement));
  battle.makeChoices('switch 2', 'move splash');
  const before = battle.log.length;
  battle.makeChoices('switch 2', 'move splash');
  assert.equal(battle.field.terrainState.duration, 4);
  assert(battle.log.slice(before).includes(announcement));
  battle.field.setTerrainDuration(9999);
  assert(battle.log.includes('|-fieldstart|Snowy Mountain Terrain|[turns] 0|[silent]'));
 });
});
