'use strict';
const assert = require('assert').strict;
const { Battle } = require('../../../dist/sim');

describe('Underwater independent Electric accuracy', () => {
	function run(seed, field, ability = 'Water Barrage', defender = 'Mew', defenderAbility = 'Synchronize', protect = false) {
		const battle = new Battle({ formatid: 'gen9doubleswatersurface', seed: [seed, 7, 11, 19], strictChoices: true,
			p1: { name: 'Leaf', team: [
				{ species: 'Blastoise', ability, moves: ['zapcannon', 'splash'] },
				{ species: 'Mew', ability: 'Synchronize', moves: ['splash'] },
			] },
			p2: { name: 'Opponent', team: [
				{ species: defender, ability: defenderAbility, moves: ['protect', 'splash'] },
				{ species: 'Mew', ability: 'Synchronize', moves: ['splash'] },
			] },
		});
		try {
			battle.makeChoices('team 12', 'team 12');
			if (field !== 'watersurfaceterrain') battle.field.changeTerrain(field);
			const before = battle.p2.active[0].hp;
			battle.makeChoices('move 1 1, move 1', `move ${protect ? 1 : 2}, move 1`);
			return { log: [...battle.log], lost: before - battle.p2.active[0].hp };
		} finally { battle.destroy(); }
	}
	for (const ability of ['Water Barrage', 'Fortress Shell', 'Dual Wield']) {
		it(`guarantees both numeric hit checks for ${ability} Underwater`, () => {
			for (let seed = 1; seed <= 24; seed++) {
				const result = run(seed, 'underwaterterrain', ability);
				assert(!result.log.some(line => line.startsWith('|-miss|p1a: Blastoise')), `seed ${seed}`);
				assert(result.lost > 0);
			}
		});
	}
	it('keeps independent misses possible on Water Surface', () => {
		assert(Array.from({ length: 24 }, (_, i) => run(i + 1, 'watersurfaceterrain')).some(r =>
			r.log.some(line => line.startsWith('|-miss|p1a: Blastoise'))));
	});
	it('keeps Protect and Ground immunity intact Underwater', () => {
		const protectedTarget = run(3, 'underwaterterrain', 'Bulletproof', 'Mew', 'Synchronize', true);
		assert.equal(protectedTarget.lost, 0);
		const ground = run(3, 'underwaterterrain', 'Bulletproof', 'Gastrodon', 'Storm Drain');
		assert.equal(ground.lost, 0);
	});
});
