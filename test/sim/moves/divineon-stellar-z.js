'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

describe('Divineon Stellar and Z-Move bonus exemption', () => {
	let battle;
	afterEach(() => battle?.destroy());
	for (const stellar of [false, true]) {
		for (const z of [false, true]) {
			for (const category of ['Physical', 'Special']) {
				it(`preserves ordinary damage: Stellar=${stellar}, Z=${z}, ${category}`, () => {
					battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
						[{species: 'Mew', ability: 'No Ability', moves: ['tackle']}],
						[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
					]);
					battle.makeChoices();
					battle.randomizer = damage => damage;
					const p = battle.p1.active[0], q = battle.p2.active[0];
					if (stellar) p.terastallized = 'Stellar';
					const move = () => Object.assign(Dex.getActiveMove('tackle'), {
						basePower: 100, category, willCrit: false, isZ: z ? 'normaliumz' : false,
					});
					q.setType('Normal');
					const ordinary = battle.actions.getDamage(p, q, move());
					q.species = Dex.species.get('divineon');
					q.setType('???');
					assert.equal(battle.actions.getDamage(p, q, move()), ordinary);
					// The exception belongs to the current form, even without Ascendance.
					q.species = Dex.species.get('mew');
					assert.equal(battle.actions.getDamage(p, q, move()),
						stellar || z ? battle.modify(ordinary, 1.5) : ordinary);
				});
			}
		}
	}
});
