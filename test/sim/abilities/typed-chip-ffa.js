'use strict';

const assert = require('../../assert');
const common = require('../../common');

let battle;

describe('Removed starter chip across battle types', () => {
	afterEach(function () {
		battle?.destroy();
	});

	it('Unbound Blaze does not chip any matchup in Free-for-All', () => {
		battle = common.createBattle({formatid: 'gen9freeforall4pfactoryfield'}, [
			[{species: 'Charizard', ability: 'unboundblaze', moves: ['tailwind']}],
			[{species: 'Scizor', moves: ['splash']}],
			[{species: 'Swampert', moves: ['splash']}],
			[{species: 'Arcanine', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		const [scizor, swampert, arcanine] = battle.sides.slice(1).map(side => side.active[0]);
		const before = [scizor.hp, swampert.hp, arcanine.hp];
		battle.makeChoices('move tailwind', 'move splash', 'move splash', 'move splash');
		assert.equal(before[0] - scizor.hp, 0);
		assert.equal(before[1] - swampert.hp, 0);
		assert.equal(arcanine.hp, before[2]);
	});

	it('Unbound Blaze does not chip in singles or doubles', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Charizard', ability: 'unboundblaze', moves: ['tailwind']}],
			[{species: 'Scizor', moves: ['splash']}],
		]);
		if (battle.turn === 0) battle.makeChoices();
		let target = battle.p2.active[0];
		let before = target.hp;
		battle.makeChoices('move tailwind', 'move splash');
		assert.equal(before - target.hp, 0);
		battle.destroy();

		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [
			[
				{species: 'Charizard', ability: 'unboundblaze', moves: ['tailwind']},
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
		assert.equal(before[0] - scizor.hp, 0);
		assert.equal(before[1] - swampert.hp, 0);
	});

	it('Pollen Bloom neither chips nor drains in Free-for-All', () => {
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
		assert.equal(targetHp[0] - swampert.hp, 0);
		assert.equal(targetHp[1] - charizard.hp, 0);
		assert.equal(leafeon.hp, targetHp[2]);
		assert.equal(source.hp - before, 0);
	});

	it('Pollen Bloom does not drain a Grass-weak target in singles', () => {
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
		assert.equal(before[1] - target.hp, 0);
		assert.equal(source.hp - before[0], 0);
	});

	it('Water Barrage does not chip on consecutive turns in Free-for-All', () => {
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
		assert.equal(before[0] - arcanine.hp, 0);
		assert.equal(before[1] - dragonite.hp, 0);
		assert.equal(jolteon.hp, before[2]);
		const secondBefore = [arcanine.hp, dragonite.hp];
		battle.makeChoices('move splash', 'move splash', 'move splash', 'move splash');
		assert.equal(secondBefore[0] - arcanine.hp, 0);
		assert.equal(secondBefore[1] - dragonite.hp, 0);
	});
});
