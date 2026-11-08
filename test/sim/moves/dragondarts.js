'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;
let hits;
function createBattle(...args) {
	const result = common.createBattle(...args);
	hits = new Map();
	// Count actual hits: local Stamina only raises Defense once per turn and ignores allies.
	result.onEvent('DamagingHit', result.format, (damage, target, source, move) => {
		if (damage > 0 && move.id === 'dragondarts') hits.set(target, (hits.get(target) || 0) + 1);
	});
	return result;
}
function assertHits(target, expected) {
	assert.equal(hits.get(target) || 0, expected, target.name + ' Dragon Darts hit count');
}

describe('Dragon Darts', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should hit twice in singles`, function () {
		battle = createBattle([[
			{species: "Ninjask", moves: ['dragondarts']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices();
		assertHits(battle.p2.active[0], 2);
	});

	it(`should use the user's higher attacking stat`, function () {
		let categories = [];
		battle = createBattle({ formatid: 'gen9nofieldsinglesgame@@@!teampreview' }, [[
			{species: "Dragapult", evs: {atk: 0, spa: 252}, moves: ['dragondarts']},
		], [
			{species: "Mew", moves: ['splash']},
		]]);
		battle.onEvent('ModifyMove', battle.format, function (move, pokemon) {
			if (move.id === 'dragondarts' && pokemon.species.id === 'dragapult') categories.push(move.category);
		});
		battle.makeChoices('move dragondarts', 'move splash');
		assert.deepEqual(categories, ['Special']);

		battle.destroy();
		categories = [];
		battle = createBattle({ formatid: 'gen9nofieldsinglesgame@@@!teampreview' }, [[
			{species: "Dragapult", evs: {atk: 252, spa: 0}, moves: ['dragondarts']},
		], [
			{species: "Mew", moves: ['splash']},
		]]);
		battle.onEvent('ModifyMove', battle.format, function (move, pokemon) {
			if (move.id === 'dragondarts' && pokemon.species.id === 'dragapult') categories.push(move.category);
		});
		battle.makeChoices('move dragondarts', 'move splash');
		assert.deepEqual(categories, ['Physical']);
	});

	it(`should hit each foe once in doubles`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", moves: ['dragondarts']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['splash']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices();
		assertHits(battle.p1.active[1], 0);
		assertHits(battle.p2.active[0], 1);
		assertHits(battle.p2.active[1], 1);
	});

	it(`should hit the other foe twice if it misses against one`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", item: 'blunderpolicy', moves: ['dragondarts']},
			{species: "Wynaut", ability: 'stamina', moves: ['splash']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['splash']},
			{species: "Shaymin", ability: 'stamina', moves: ['splash']},
		]]);

		const ninjask = battle.p1.active[0];
		const wynaut = battle.p1.active[1];
		const mew = battle.p2.active[0];
		const shaymin = battle.p2.active[1];

		// Modding accuracy so Dragon Darts always misses Mew
		battle.onEvent('Accuracy', battle.format, function (accuracy, target, source, move) {
			return target.species.id !== 'mew';
		});

		battle.makeChoices();
		assert.false(battle.log.includes('|-miss|p1a: Ninjask|p2a: Mew'));
		assert.statStage(ninjask, 'spe', 2);
		assertHits(wynaut, 0);
		assertHits(mew, 0);
		assertHits(shaymin, 2);
	});

	it(`should hit its selected ally before the local slow Ally Switch pivot`, () => {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", ability: 'stamina', moves: ['dragondarts']},
			{species: "Mew", ability: 'stamina', moves: ['allyswitch']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['splash']},
			{species: "Shaymin", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices('move dragondarts -2, move allyswitch', 'move splash, move splash');
		assertHits(battle.p1.active[0], 0);
		assertHits(battle.p1.active[1], 2);
		assertHits(battle.p2.active[0], 0);
		assertHits(battle.p2.active[1], 0);
	});

	it(`should hit both targets even if one faints`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", moves: ['dragondarts']},
			{species: "Mew", moves: ['splash']},
		], [
			{species: "Shedinja", moves: ['splash']},
			{species: "Shedinja", moves: ['splash']},
		]]);
		battle.makeChoices();
		battle.getDebugLog();
		assert.equal(battle.p2.active[0].hp, 0);
		assert.equal(battle.p2.active[1].hp, 0);
	});

	it(`should hit the ally twice in doubles`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", moves: ['dragondarts']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['splash']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices('move dragondarts -2, move splash', 'move splash, move splash');
		assertHits(battle.p1.active[1], 2);
		assertHits(battle.p2.active[0], 0);
		assertHits(battle.p2.active[1], 0);
	});

	it(`should smart-target the foe that's not Protecting in Doubles`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", moves: ['dragondarts']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['protect']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices();
		assertHits(battle.p1.active[1], 0);
		assertHits(battle.p2.active[0], 0);
		assertHits(battle.p2.active[1], 2);
	});

	it(`should be able to be redirected`, function () {
		battle = createBattle({ gameType: 'doubles' }, [[
			{species: "Ninjask", moves: ['dragondarts']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		], [
			{species: "Mew", ability: 'stamina', moves: ['ragepowder']},
			{species: "Mew", ability: 'stamina', moves: ['splash']},
		]]);
		battle.makeChoices();
		assertHits(battle.p1.active[1], 0);
		assertHits(battle.p2.active[0], 2);
		assertHits(battle.p2.active[1], 0);
	});

	it('should hit one target twice if the other is protected by an ability', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", ability: "Clear Body", moves: ["dragondarts"]},
			{species: "Grimmsnarl", ability: "Prankster", moves: ["electrify"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Stamina", moves: ["sleeptalk"]},
			{species: "Emolga", ability: "Motor Drive", moves: ["sleeptalk"]},
		]});
		battle.makeChoices('move dragondarts 2, move electrify -1', 'move sleeptalk, move sleeptalk');

		assert.notEqual(battle.p2.active[0].hp, battle.p2.active[0].maxhp);
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
		assertHits(battle.p2.active[0], 2);
		// Dragon Darts activates the absorption effect despite hitting Arcanine twice
		assert.statStage(battle.p2.active[1], 'spe', 1);
	});

	it('should hit one target twice if the other is immunue', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", ability: "Clear Body", moves: ["dragondarts"]},
			{species: "Ludicolo", ability: "Dancer", moves: ["sleeptalk"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Stamina", moves: ["sleeptalk"]},
			{species: "Clefairy", ability: "Ripen", moves: ["sleeptalk"]},
		]});
		battle.makeChoices('move dragondarts 2, move sleeptalk', 'move sleeptalk, move sleeptalk');

		assertHits(battle.p2.active[0], 2);
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
	});

	it('should hit one target twice if the other is semi-invulnerable', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", item: "Lagging Tail", ability: "Clear Body", moves: ["dragondarts"]},
			{species: "Ludicolo", ability: "Dancer", moves: ["sleeptalk"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Stamina", moves: ["sleeptalk"]},
			{species: "Golurk", ability: "Ripen", moves: ["phantomforce"]},
		]});
		battle.makeChoices('move dragondarts 2, move sleeptalk', 'move sleeptalk, move phantomforce 1');

		assertHits(battle.p2.active[0], 2);
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
	});

	it('should hit one target twice if the other is fainted', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", ability: "Clear Body", moves: ["dragondarts"]},
			{species: "Ludicolo", ability: "Dancer", moves: ["sleeptalk"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Stamina", moves: ["sleeptalk"]},
			{species: "Snom", ability: "Ripen", moves: ["sleeptalk"]},
		]});

		battle.p2.active[1].faint();
		battle.makeChoices('move dragondarts 2, move sleeptalk', 'move sleeptalk, move sleeptalk');

		assertHits(battle.p2.active[0], 2);
		assert.equal(battle.p2.active[1].hp, 0);
	});

	it('should hit one target twice if the other is Dark type and Dragon Darts is Prankster boosted', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", ability: "Clear Body", moves: ["sleeptalk", "dragondarts"]},
			{species: "Liepard", ability: "Prankster", moves: ["assist"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Stamina", moves: ["sleeptalk"]},
			{species: "Spiritomb", ability: "Infiltrator", moves: ["sleeptalk"]},
		]});

		battle.makeChoices();

		assertHits(battle.p2.active[0], 2);
		assert.equal(battle.p2.active[1].hp, battle.p2.active[1].maxhp);
	});

	it('should fail if both targets are fainted', function () {
		battle = createBattle({ gameType: 'doubles' });
		battle.setPlayer('p1', {team: [
			{species: "Dragapult", ability: "Clear Body", moves: ["dragondarts"]},
			{species: "Ludicolo", ability: "Dancer", moves: ["celebrate"]},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Arcanine", ability: "Flash Fire", moves: ["celebrate"]},
			{species: "Arcanine", ability: "Flash Fire", moves: ["celebrate"]},
			{species: "Arcanine", ability: "Flash Fire", moves: ["celebrate"]},
		]});

		battle.p2.active[0].faint();
		battle.p2.active[1].faint();
		battle.makeChoices('move dragondarts 1, move celebrate', 'move celebrate, move celebrate');

		assert(battle.log.includes(`|-fail|p1a: Dragapult`));
	});
});
