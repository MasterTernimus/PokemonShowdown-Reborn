'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Neutralization rooms', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('should prevent Trick Room, Magic Room, and Wonder Room from starting', function () {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Quagsire', ability: 'neutralization', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'synchronize', moves: ['trickroom', 'magicroom', 'wonderroom'] },
		]]);
		battle.makeChoices('team 1', 'team 1');

		for (const [move, room] of [
			['trickroom', 'trickroom'],
			['magicroom', 'magicroom'],
			['wonderroom', 'wonderroom'],
		]) {
			battle.makeChoices('move splash', `move ${move}`);
			assert.false(battle.field.getPseudoWeather(room));
		}
	});

	it('should end active rooms when Neutralization enters battle', function () {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Magikarp', ability: 'swiftswim', moves: ['splash'] },
			{ species: 'Quagsire', ability: 'neutralization', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'synchronize', moves: ['trickroom', 'splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1');
		battle.makeChoices('move splash', 'move trickroom');
		assert(battle.field.getPseudoWeather('trickroom'));

		battle.makeChoices('switch 2', 'move splash');
		assert.false(battle.field.getPseudoWeather('trickroom'));
	});

	it('should activate only once per target for a multi-hit move', function () {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Quagsire', ability: 'neutralization', moves: ['pinmissile'] },
		], [
			{ species: 'Mew', ability: 'synchronize', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move pinmissile', 'move splash');

		assert.statStage(battle.p2.active[0], 'atk', -1);
		assert.statStage(battle.p2.active[0], 'spa', 0);
		assert.statStage(battle.p2.active[0], 'spe', 0);
	});

	it('lowers only the higher special offense by one stage', function () {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Quagsire', ability: 'neutralization', moves: ['tackle'] },
		], [
			{ species: 'Mew', nature: 'Modest', evs: { spa: 252 }, moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move tackle', 'move splash');
		const target = battle.p2.active[0];
		assert.statStage(target, 'atk', 0);
		assert.statStage(target, 'spa', -1);
		assert.statStage(target, 'spe', 0);
	});

	it('allows Auras to form and persist while still blocking base field changes', function () {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Quagsire', ability: 'neutralization', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['electricterrain', 'splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.field.startTerrain('factoryterrain');
		battle.makeChoices('move splash', 'move electricterrain');
		assert.equal(battle.field.terrain, 'factoryterrain');
		assert.equal(battle.field.auraField, 'electricterrain');
		for (const aura of ['electricterrain', 'grassyterrain', 'mistyterrain', 'rainbowterrain', 'psychicterrain']) {
			assert(battle.field.setAura(aura, 5, battle.p2.active[0]));
			assert.equal(battle.field.auraField, aura);
		}
		assert.false(battle.field.setTerrain('desertterrain', battle.p2.active[0]));
		battle.makeChoices('move splash', 'move splash');
		assert.equal(battle.field.auraField, 'psychicterrain');
	});

	it('should not activate when a chaining multi-hit move becomes a spread hit', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Quagsire', ability: 'neutralization', moves: ['dragondarts']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'synchronize', moves: ['splash']},
			{species: 'Celebi', ability: 'naturalcure', moves: ['splash']},
		]]);
		battle.makeChoices();

		for (const target of battle.p2.active) {
			assert.statStage(target, 'atk', 0);
			assert.statStage(target, 'spe', 0);
		}
	});
});
