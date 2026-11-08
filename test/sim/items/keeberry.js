'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Kee Berry', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should activate after a multi-hit physical move`, function () {
		battle = common.createBattle([[
			{species: "Wynaut", moves: ['doubleironbash']},
		], [
			{species: "Alakazam", item: 'keeberry', ability: 'shellarmor', moves: ['sleeptalk']},
		]]);

		const alakazam = battle.p2.active[0];
		const stagesDuringHits = [];
		battle.onEvent('DamagingHit', battle.format, -99, (damage, target) => {
			if (target === alakazam) stagesDuringHits.push(target.boosts.def);
		});
		battle.makeChoices();
		assert.deepEqual(stagesDuringHits, [0, 0], 'Neither hit should use the post-move Defense boost');
		assert.statStage(alakazam, 'def', 1);
		assert.false.holdsItem(alakazam);
	});
});
