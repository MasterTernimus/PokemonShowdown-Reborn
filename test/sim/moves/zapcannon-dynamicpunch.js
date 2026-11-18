'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Zap Cannon and Dynamic Punch', () => {
	let battle;
	afterEach(() => battle.destroy());

	function attack(move, options = {}) {
		const {
			ability = 'No Ability', species = 'Mew', foeSpecies = 'Mew', foeAbility = 'No Ability',
			hit = true, roll = 99, lockOn, suppressed, protect, terrain,
		} = options;
		battle = common.createBattle({}, [
			[{ species, ability, moves: [move, 'lockon'] }],
			[{ species: foeSpecies, ability: foeAbility, moves: ['protect'] }],
		]);
		const user = battle.p1.active[0];
		const target = battle.p2.active[0];
		if (terrain) battle.field.setTerrain(terrain, user);
		if (lockOn) battle.actions.useMove('lockon', user, { target });
		if (suppressed) user.addVolatile('gastroacid', target);
		if (protect) target.addVolatile('protect');
		const randomChance = battle.randomChance.bind(battle);
		const random = battle.random.bind(battle);
		let accuracyChecks = 0;
		battle.randomChance = (numerator, denominator) => {
			const expectedAccuracy = terrain === 'shortcircuitterrain' && move === 'zapcannon' ? 80 : 50;
			if (numerator !== expectedAccuracy || denominator !== 100) return randomChance(numerator, denominator);
			accuracyChecks++;
			return hit;
		};
		battle.random = (min, max) => min === 100 && max === undefined ? roll : random(min, max);
		battle.actions.useMove(move, user, { target });
		return {
			damaged: target.hp < target.maxhp,
			affected: move === 'zapcannon' ? target.status === 'par' : !!target.volatiles.confusion,
			accuracyChecks,
		};
	}

	for (const move of ['zapcannon', 'dynamicpunch']) {
		it(`${move} checks 50% accuracy and applies its effect on a normal hit`, () => {
			assert.deepEqual(attack(move), { damaged: true, affected: true, accuracyChecks: 1 });
		});

		it(`${move} leaves HP and status intact when its ordinary accuracy roll misses`, () => {
			assert.deepEqual(attack(move, { hit: false }), { damaged: false, affected: false, accuracyChecks: 1 });
		});

		for (const [ability, species] of [['No Guard', 'Mew'], ['Guts', 'Machamp'], ['Storm Sovereign', 'Mew']]) {
			for (const roll of [49, 50]) {
				it(`${species} with ${ability} always lands ${move} with secondary roll ${roll}`, () => {
					assert.deepEqual(attack(move, { ability, species, hit: false, roll }), {
						damaged: true, affected: roll < 50, accuracyChecks: 0,
					});
				});
			}
		}

		it(`${move} keeps its usual effect with only the opponent's No Guard`, () => {
			assert.deepEqual(attack(move, { foeAbility: 'No Guard', hit: false }), {
				damaged: true, affected: true, accuracyChecks: 0,
			});
		});

		it(`${move} keeps its usual effect after the user uses Lock-On`, () => {
			assert.deepEqual(attack(move, { lockOn: true, hit: false }), {
				damaged: true, affected: true, accuracyChecks: 0,
			});
		});

		it(`${move} uses the regular rolls when No Guard is suppressed`, () => {
			assert.deepEqual(attack(move, { ability: 'No Guard', suppressed: true }), {
				damaged: true, affected: true, accuracyChecks: 1,
			});
		});

		it(`${move} with Precision uses the usual secondary chance against a neutral or resistant target`, () => {
			assert.deepEqual(attack(move, { ability: 'Precision' }), { damaged: true, affected: true, accuracyChecks: 1 });
		});

		it(`${move} with Precision on a super-effective hit uses the reduced chance`, () => {
			const foeSpecies = move === 'zapcannon' ? 'Poliwhirl' : 'Snorlax';
			assert.deepEqual(attack(move, { ability: 'Precision', foeSpecies, hit: false }), {
				damaged: true, affected: false, accuracyChecks: 0,
			});
		});

		it(`${move} respects Protect with No Guard`, () => {
			assert.deepEqual(attack(move, { ability: 'No Guard', protect: true, roll: 0 }), {
				damaged: false, affected: false, accuracyChecks: 0,
			});
		});

		it(`${move} respects type immunity with No Guard`, () => {
			const foeSpecies = move === 'zapcannon' ? 'Marowak' : 'Gengar';
			assert.deepEqual(attack(move, { ability: 'No Guard', foeSpecies, roll: 0 }), {
				damaged: false, affected: false, accuracyChecks: 0,
			});
		});

		it(`${move} still deals damage to a target immune to its secondary effect`, () => {
			const foe = move === 'zapcannon' ? { foeSpecies: 'Raichu' } : { foeAbility: 'Own Tempo' };
			assert.deepEqual(attack(move, foe), { damaged: true, affected: false, accuracyChecks: 1 });
		});

		it(`${move} with Dual Wield rolls accuracy and keeps the normal effect on a hit`, () => {
			assert.deepEqual(attack(move, { ability: 'Dual Wield' }), {
				damaged: true, affected: true, accuracyChecks: move === 'zapcannon' ? 2 : 1,
			});
		});

		it(`${move} with Illuminate on Midnight Zone uses the sure-hit chance`, () => {
			assert.deepEqual(attack(move, { ability: 'Illuminate', terrain: 'midnightzoneterrain', hit: false }), {
				damaged: true, affected: false, accuracyChecks: 0,
			});
		});
	}

	it('keeps Zap Cannon at 80% accuracy and guaranteed paralysis on Short-Circuit Terrain', () => {
		assert.deepEqual(attack('zapcannon', { terrain: 'shortcircuitterrain' }), {
			damaged: true, affected: true, accuracyChecks: 1,
		});
	});
});
