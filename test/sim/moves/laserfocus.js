'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Laser Focus', () => {
	let battle;
	afterEach(() => battle.destroy());

	function setup(ability = 'No Ability', doubles = false) {
		const user = { species: 'Mew', ability, moves: ['laserfocus', 'pound', 'doublekick', 'swift'] };
		const foe = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'protect'] };
		const ally = { species: 'Oranguru', ability: 'No Ability', moves: ['instruct', 'splash'] };
		battle = common.createBattle({ gameType: doubles ? 'doubles' : 'singles' }, [
			[user, ally], doubles ? [foe, { ...foe }] : [foe],
		]);
		const randomChance = battle.randomChance.bind(battle);
		battle.randomChance = (n, d) => d === 24 && n === 1 ? false : randomChance(n, d);
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	function criticalHits() {
		return battle.log.filter(line => line.startsWith('|-crit|')).length;
	}

	it('spends Download on one attack even when Instruct repeats it on the same turn', () => {
		const [user] = setup('Download', true);
		assert(user.volatiles.laserfocus);
		battle.makeChoices('move pound 1, move instruct -1', 'move splash, move splash');
		assert.equal(battle.log.filter(line => line.includes('|Pound|')).length, 2);
		assert.equal(criticalHits(), 1);
		assert(!user.volatiles.laserfocus);
	});

	it('covers every hit of a multihit move and every target of a spread move', () => {
		const [user] = setup('No Ability', true);
		for (const move of ['doublekick 1', 'swift']) {
			battle.makeChoices('move laserfocus, move splash', 'move splash, move splash');
			assert(user.volatiles.laserfocus);
			const before = criticalHits();
			battle.makeChoices('move ' + move + ', move splash', 'move splash, move splash');
			assert.equal(criticalHits() - before, 2);
			assert(!user.volatiles.laserfocus);
		}
	});

	it('retains focus on a miss or Protect, then spends it even against critical-hit immunity', () => {
		const [user, foe] = setup('Download');
		const miss = battle.dex.getActiveMove('pound');
		miss.accuracy = 0;
		battle.actions.useMove(miss, user, { target: foe });
		assert(user.volatiles.laserfocus);
		battle.makeChoices('move pound', 'move protect');
		assert(user.volatiles.laserfocus);
		foe.setAbility('Battle Armor');
		battle.makeChoices('move pound', 'move splash');
		assert(!user.volatiles.laserfocus);
		assert.equal(criticalHits(), 0);
	});

	it('expires unused and Download cannot grant a second charge on re-entry', () => {
		const [user] = setup('Download');
		battle.actions.useMove('splash', user);
		assert(user.volatiles.laserfocus);
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert(!user.volatiles.laserfocus);
		battle.makeChoices('move laserfocus', 'move splash');
		battle.actions.useMove('splash', user);
		battle.fieldEvent('Residual');
		assert(!user.volatiles.laserfocus);
	});
});
