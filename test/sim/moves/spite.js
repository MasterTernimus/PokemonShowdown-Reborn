'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Spite', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should fail on Z-moves`, function () {
		battle = common.gen(7).createBattle([[
			{species: 'Gengar', item: 'ghostiumz', moves: ['shadowball']},
		], [
			{species: 'Snorlax', moves: ['spite']},
		]]);

		battle.makeChoices('move shadowball zmove', 'move spite');
		const gengar = battle.p1.active[0];
		assert.equal(gengar.getMoveData(Dex.moves.get('shadowball')).pp, 23);
	});

	// Eerie Spell and G-Max Depletion should also behave this way
	it(`should succeed on Max Moves, and announce the base move that PP was deducted from`, function () {
		battle = common.createBattle({ formatid: 'gen9factoryfield' }, [[
			{ species: 'Gengar', moves: ['shadowball'], gigantamax: true },
		], [
			{species: 'Snorlax', moves: ['spite']},
		]]);

		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move shadowball dynamax', 'move spite');
		const gengar = battle.p1.active[0];
		assert(gengar.volatiles.dynamax);
		assert.equal(gengar.lastMove.id, 'gmaxterror');
		const slot = gengar.getMoveData(Dex.moves.get('shadowball'));
		assert.equal(slot.maxpp, 8, 'the G-Max signature uses its own PP cap');
		assert.equal(slot.pp, slot.maxpp - 1 - 4);

		const log = battle.getDebugLog();
		assert(log.includes('|-activate|p1a: Gengar|move: Spite|Shadow Ball|4'));
		const shadowBallIndex = log.indexOf('Shadow Ball');
		assert.notEqual(shadowBallIndex, -1, 'Shadow Ball should have been revealed when Spite deducted PP.');
	});
});
