'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;

function chip(maxhp, typeMultiplier = 1) {
	return Math.max(1, Math.floor(maxhp * typeMultiplier / 16));
}

describe('Ability chip type effectiveness by game type', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it('scales Wildfire Core against weaknesses and resistances in Free-for-All only', function () {
		battle = common.createBattle({formatid: 'gen9freeforall4pfactoryfield'}, [
			[{species: 'Charizard', ability: 'wildfirecore', moves: ['tailwind']}],
			[{species: 'Scizor', moves: ['splash']}],
			[{species: 'Swampert', moves: ['splash']}],
			[{species: 'Arcanine', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const [scizor, swampert, arcanine] = battle.sides.slice(1).map(side => side.active[0]);
		const before = [scizor.hp, swampert.hp, arcanine.hp];
		battle.makeChoices('move tailwind', 'move splash', 'move splash', 'move splash');
		assert.equal(before[0] - scizor.hp, chip(scizor.maxhp, 4));
		assert.equal(before[1] - swampert.hp, chip(swampert.maxhp, 0.5));
		assert.equal(arcanine.hp, before[2]);
	});

	it('keeps Wildfire Core fixed in singles and doubles', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Charizard', ability: 'wildfirecore', moves: ['tailwind']}],
			[{species: 'Scizor', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		let target = battle.p2.active[0];
		let before = target.hp;
		battle.makeChoices('move tailwind', 'move splash');
		assert.equal(before - target.hp, chip(target.maxhp));
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[
				{species: 'Charizard', ability: 'wildfirecore', moves: ['tailwind']},
				{species: 'Mew', moves: ['splash']},
			],
			[
				{species: 'Scizor', moves: ['splash']},
				{species: 'Swampert', moves: ['splash']},
			],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const [scizor, swampert] = battle.p2.active;
		before = [scizor.hp, swampert.hp];
		battle.makeChoices('move tailwind, move splash', 'move splash, move splash');
		assert.equal(before[0] - scizor.hp, chip(scizor.maxhp));
		assert.equal(before[1] - swampert.hp, chip(swampert.maxhp));
	});

	it('scales Pollen Bloom and heals its user for the damage dealt in Free-for-All', function () {
		battle = common.createBattle({formatid: 'gen9freeforall4pfactoryfield'}, [
			[{species: 'Venusaur', ability: 'pollenbloom', moves: ['splash']}],
			[{species: 'Swampert', moves: ['splash']}],
			[{species: 'Charizard', moves: ['splash']}],
			[{species: 'Leafeon', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const source = battle.p1.active[0];
		const [swampert, charizard, leafeon] = battle.sides.slice(1).map(side => side.active[0]);
		source.hp -= 150;
		const before = source.hp;
		const targetHp = [swampert.hp, charizard.hp, leafeon.hp];
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(targetHp[0] - swampert.hp, chip(swampert.maxhp, 4));
		assert.equal(targetHp[1] - charizard.hp, chip(charizard.maxhp, 0.25));
		assert.equal(leafeon.hp, targetHp[2]);
		assert.equal(source.hp - before, chip(swampert.maxhp, 4) + chip(charizard.maxhp, 0.25));
	});

	it('keeps Pollen Bloom fixed against a Grass-weak target in singles', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Venusaur', ability: 'pollenbloom', moves: ['splash']}],
			[{species: 'Swampert', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const source = battle.p1.active[0];
		const target = battle.p2.active[0];
		source.hp -= 60;
		const before = [source.hp, target.hp];
		battle.makeChoices('move splash', 'move splash');
		assert.equal(before[1] - target.hp, chip(target.maxhp));
		assert.equal(source.hp - before[0], chip(target.maxhp));
	});

	it('scales Water Barrage by its cycling stage in Free-for-All and preserves immunity', function () {
		battle = common.createBattle({formatid: 'gen9freeforall4pfactoryfield'}, [
			[{species: 'Blastoise', ability: 'waterbarrage', moves: ['splash']}],
			[{species: 'Arcanine', moves: ['splash']}],
			[{species: 'Dragonite', moves: ['splash']}],
			[{species: 'Jolteon', ability: 'waterabsorb', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const [arcanine, dragonite, jolteon] = battle.sides.slice(1).map(side => side.active[0]);
		const before = [arcanine.hp, dragonite.hp, jolteon.hp];
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(before[0] - arcanine.hp, chip(arcanine.maxhp, 2));
		assert.equal(before[1] - dragonite.hp, chip(dragonite.maxhp, 0.5));
		assert.equal(jolteon.hp, before[2]);
		const secondBefore = [arcanine.hp, dragonite.hp];
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(secondBefore[0] - arcanine.hp, chip(arcanine.maxhp, 4));
		assert.equal(secondBefore[1] - dragonite.hp, chip(dragonite.maxhp));
	});
});
