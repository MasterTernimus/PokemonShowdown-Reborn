'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Toxic', function () {
	afterEach(() => battle?.destroy());
	it('should always hit when used by a Poison-type', function () {
		battle = common.createBattle([
			[{species: "Naganadel", moves: ['toxic']}],
			[{species: "Sigilyph", ability: 'wonderskin', moves: ['sleeptalk']}],
		]);
		battle.makeChoices('move toxic', 'move sleeptalk');
		assert.equal(battle.p2.active[0].status, 'tox');
	});
});

describe('Toxic [Gen 7]', function () {
	afterEach(() => battle?.destroy());
	it('should set all moves to sure-hit until the end of the turn', function () {
		battle = common.gen(7).createBattle({gameType: 'doubles'});
		battle.setPlayer('p1', {team: [
			{species: "Nidoking", moves: ['toxic', 'horndrill']},
			{species: "Oranguru", moves: ['trickroom', 'instruct']},
		]});
		battle.setPlayer('p2', {team: [
			{species: "Dugtrio", moves: ['dig']},
			{species: "Wynaut", moves: ['splash']},
		]});
		battle.makeChoices('move toxic 1, move trickroom', 'move dig 2, move splash');
		assert.equal(battle.p2.active[0].status, 'tox');
		battle.onEvent('ModifyMove', battle.format, move => {
			if (move.id === 'horndrill') { move.accuracy = 0; move.damage = 10; }
		});
		const target = battle.p2.active[1];
		const hp = target.hp;
		battle.makeChoices('move horndrill 2, move instruct -1', 'move dig 2, move splash');
		assert.equal(target.hp, hp - 10, 'Toxic called by Instruct guarantees the later attack despite zero accuracy');
		battle.makeChoices('move horndrill 2, move trickroom', 'move dig 2, move splash');
		assert.equal(target.hp, hp - 10, 'The sure-hit effect expires before the next turn');
	});
});
