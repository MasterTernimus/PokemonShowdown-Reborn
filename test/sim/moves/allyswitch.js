'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
describe('Reborn Ally Switch', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const gen of ['gen7', 'gen8', 'gen9']) it(`${gen} describes the slow bench switch`, () => {
		const move = Dex.mod(gen).moves.get('allyswitch');
		assert.equal(move.priority, -6);
		assert.equal(move.selfSwitch, true);
		assert.match(move.desc, /switches out for a chosen teammate/);
		assert.match(move.shortDesc, /Priority -6/);
		assert.doesNotMatch(move.desc, /swaps positions|triples|1\/X/);
	});
	it('takes the opponent attack before requesting a replacement', () => {
		battle = common.createBattle([
			[{ species: 'Mew', ability: 'No Ability', moves: ['allyswitch'] },
				{ species: 'Chansey', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['seismictoss'] }],
		]);
		const user = battle.p1.active[0];
		battle.makeChoices();
		assert(user.hp < user.maxhp);
		assert.equal(battle.requestState, 'switch');
		battle.makeChoices('switch 2', '');
		assert.equal(battle.p1.active[0].species.id, 'chansey');
	});
	it('fails without a replacement', () => {
		battle = common.createBattle([
			[{ species: 'Mew', ability: 'No Ability', moves: ['allyswitch'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices();
		assert.equal(battle.requestState, 'move');
		assert(battle.log.some(line => line.startsWith('|-fail|p1a:')));
	});
});
