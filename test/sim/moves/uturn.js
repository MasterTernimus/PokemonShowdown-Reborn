'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('U-turn', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('should switch the user out after a successful hit against a Substitute', function () {
		battle = common.createBattle([[
			{species: 'Beedrill', ability: 'swarm', moves: ['uturn']},
			{species: 'Kakuna', ability: 'shedskin', moves: ['harden']},
		], [
			{ species: 'Alakazam', ability: 'magicguard', evs: { spe: 252 }, nature: 'Timid', moves: ['substitute'] },
		]]);

		battle.makeChoices('move uturn', 'move substitute');
		assert(battle.log.some(line => line.includes('|-start|p2a: Alakazam|Substitute')));
		assert.equal(battle.requestState, 'switch');
	});
});
