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

		assert.statStage(battle.p2.active[0], 'atk', -2);
		assert.statStage(battle.p2.active[0], 'spe', -1);
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
