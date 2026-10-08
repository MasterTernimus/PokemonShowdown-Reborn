'use strict';

const assert = require('assert').strict;
const common = require('../../common');

let battle;
function start(foeAbility = 'No Ability') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'},
		[[{species: 'Mew', ability: 'Shadow Current', moves: ['earthquake', 'watergun', 'tackle']}],
			[{species: 'Mew', ability: foeAbility, moves: ['splash']}]]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Shadow Current Mold Breaker component', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	for (const [ability, move] of [['Levitate', 'earthquake'], ['Water Absorb', 'watergun'], ['Sturdy', 'tackle']]) {
		it(`bypasses ${ability} with ${move}`, () => {
			const [user, target] = start(ability);
			if (ability === 'Sturdy') target.hp = target.maxhp = target.baseMaxhp = 1;
			battle.actions.useMove(move, user, {target});
			assert(target.hp < target.maxhp);
			if (ability === 'Sturdy') assert.equal(target.hp, 0);
		});
	}

	it('exposes Mold Breaker while retaining its other components', () => {
		const [user, target] = start();
		assert.equal(battle.log.filter(line => line.startsWith('|-ability|') && line.endsWith('|Shadow Current')).length, 1);
		for (const component of ['moldbreaker', 'protean', 'technician', 'infiltrator', 'anticipation']) {
			assert(user.hasAbility(component), `Shadow Current should include ${component}`);
		}
		const move = battle.dex.getActiveMove('watergun');
		battle.singleEvent('ModifyMove', user.getAbility(), user.abilityState, move, user, target);
		assert(move.ignoreAbility);
		assert.match(user.getAbility().desc, /bypassable opposing Abilities/);
		assert(require('../../../dist/data/ability-display').getAbilityDisplayComponents(user.ability).includes('moldbreaker'));
		assert(require('../../../dist/sim/custom-calculator').calculatorMetadata().abilityComponents.shadowcurrent.includes('Mold Breaker'));
	});

	it('still respects Protect', () => {
		const [user, target] = start();
		target.addVolatile('protect', target);
		battle.actions.useMove('watergun', user, {target});
		assert.equal(target.hp, target.maxhp);
	});
});
