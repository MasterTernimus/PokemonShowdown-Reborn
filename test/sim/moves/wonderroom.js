'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Wonder Room', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('swaps raw defenses while retaining the original defensive stages and modifiers', function () {
		battle = common.createBattle([[{species: 'Mew', ability: 'No Ability', moves: ['growl']}], [{species: 'Mew', ability: 'No Ability', moves: ['growl'] }]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		q.storedStats.def = 100; q.storedStats.spd = 300;
		battle.randomizer = damage => damage;
		const damage = () => battle.actions.getDamage(p, q, {...battle.dex.getActiveMove('brickbreak'), willCrit: false});
		const ordinary = damage();
		battle.field.addPseudoWeather('wonderroom', p);
		const swapped = damage(); assert(swapped < ordinary);
		q.boosts.def = 1; const boosted = damage(); assert(boosted < swapped);
		q.boosts.spd = 3; assert.equal(damage(), boosted);
		q.setItem('assaultvest'); assert.equal(damage(), boosted);
		battle.field.removePseudoWeather('wonderroom');
		[q.storedStats.def, q.storedStats.spd] = [q.storedStats.spd, q.storedStats.def];
		assert.equal(damage(), boosted, 'Physical damage must match the manually swapped raw Defense with its own boosts');
	});

	it('uses Sp. Def stages for Body Press under Wonder Room', function () {
		battle = common.createBattle([[{species: 'Mew', ability: 'No Ability', moves: ['bodypress']}], [{species: 'Mew', ability: 'No Ability', moves: ['growl']}]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		p.storedStats.def = 100; p.storedStats.spd = 300;
		battle.randomizer = damage => damage;
		battle.field.addPseudoWeather('wonderroom', p);
		const damage = () => {
			const move = battle.dex.getActiveMove('bodypress'); move.willCrit = false;
			battle.runEvent('ModifyMove', p, q, move, move);
			assert.equal(move.overrideOffensiveStat, 'spd');
			return battle.actions.getDamage(p, q, move);
		};
		const ordinary = damage(); p.boosts.spd = 2; const boosted = damage();
		assert(boosted > ordinary * 1.8);
		p.boosts.def = 6; assert.equal(damage(), boosted);
	});

	it(`should be ignored by Download when determining raw stats, but not stat stage changes`, function () {
		battle = common.createBattle([[
			{species: 'Wynaut', moves: ['wonderroom']},
			{species: 'Porygon', ability: 'download', moves: ['sleeptalk']},
		], [
			{species: 'Venusaur', moves: ['sleeptalk', 'amnesia']},
		]]);

		battle.makeChoices();
		battle.makeChoices('switch porygon', 'auto');
		const porygon = battle.p1.active[0];
		assert.statStage(porygon, 'atk', 1); // Download is ignoring Wonder Room, so it's comparing raw Def vs. Sp. Def
		battle.makeChoices('switch wynaut', 'move amnesia');
		battle.makeChoices('switch porygon', 'auto');
		assert.statStage(porygon, 'spa', 1); // Wonder Room is applying the +2 Sp. Def to Venusaur's Def
	});
});
