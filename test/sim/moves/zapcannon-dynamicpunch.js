'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Zap Cannon and Dynamic Punch', () => {
	let battle;
	afterEach(() => battle.destroy());

	for (const move of ['zapcannon', 'dynamicpunch']) {
		for (const [hit, roll] of [[true, 49], [true, 50], [false, 0]]) {
			it(`${move}, accuracy ${hit ? 'hit' : 'miss'} and secondary roll ${roll}`, () => {
				battle = common.createBattle({}, [
					[{ species: 'Mew', ability: 'No Ability', moves: [move] }],
					[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
				]);
				const user = battle.p1.active[0];
				const target = battle.p2.active[0];
				const randomChance = battle.randomChance.bind(battle);
				const random = battle.random.bind(battle);
				const rolls = [];
				battle.randomChance = (numerator, denominator) => {
					if (numerator !== 50 || denominator !== 100) return randomChance(numerator, denominator);
					rolls.push('accuracy');
					return hit;
				};
				battle.random = (min, max) => {
					if (min !== 100 || max !== undefined) return random(min, max);
					rolls.push('secondary');
					return roll;
				};
				battle.actions.useMove(move, user, { target });
				assert.deepEqual(rolls, hit ? ['accuracy', 'secondary'] : ['accuracy']);
				assert.equal(target.hp < target.maxhp, hit);
				const hasEffect = move === 'zapcannon' ? target.status === 'par' : !!target.volatiles.confusion;
				assert.equal(hasEffect, hit && roll < 50);
			});
		}
	}
});
