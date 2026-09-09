'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
describe('Mega Sharpedo Y and Apex Armor', function () {
	afterEach(() => battle?.destroy());
	it('offers both Sharpedonite evolutions and evolves into Y with Fairy Tale boosts', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sharpedo', item: 'Sharpedonite', ability: 'Speed Boost', moves: ['splash']},
		], [{species: 'Mew', ability: 'noability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const shark = battle.p1.active[0];
		assert.equal(shark.canMegaEvo, 'Sharpedo-Mega');
		assert.equal(shark.canMegaEvoY, 'Sharpedo-Mega-Y');
		battle.field.setTerrain('fairytaleterrain', shark);
		battle.makeChoices('move splash megay', 'move splash');
		assert.equal(shark.species.name, 'Sharpedo-Mega-Y');
		assert.deepEqual(shark.species.baseStats, {hp: 70, atk: 40, def: 125, spa: 150, spd: 125, spe: 90});
		assert.deepEqual(shark.getTypes(), ['Water', 'Steel']);
		assert.statStage(shark, 'def', 1);
		assert.statStage(shark, 'spd', 1);
		assert.statStage(shark, 'spa', 1);
	});
	it('blocks projectiles, punishes contact, and marks moves to ignore redirection', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Sharpedo-Mega-Y', ability: 'Apex Armor', moves: ['splash']},
		], [{species: 'Mew', ability: 'noability', moves: ['aurasphere', 'tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		const shark = battle.p1.active[0], foe = battle.p2.active[0];
		const hp = shark.hp;
		battle.makeChoices('move splash', 'move aurasphere');
		assert.equal(shark.hp, hp);
		const foeHP = foe.hp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(foeHP - foe.hp, Math.floor(foe.baseMaxhp / 8));
		const move = battle.dex.getActiveMove('surf');
		battle.singleEvent('ModifyMove', shark.getAbility(), shark.abilityState, move, shark);
		assert.equal(move.tracksTarget, true);
		assert(shark.hasAbility('stalwart'));
	});
});
