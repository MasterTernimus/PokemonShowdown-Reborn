'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {PRNG} = require('../../../dist/sim/prng');

describe('Type cleanup runtime regressions', () => {
	it('canonicalizes an imported ability alias and preserves its components after switching', () => {
		const battle = common.createBattle([[
			{species: 'Mew', ability: 'Wildfire Core', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		try {
			const pokemon = battle.p1.active[0];
			assert.equal(pokemon.baseAbility, 'unboundblaze');
			assert(pokemon.hasAbility('proficient'));
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(pokemon.ability, 'unboundblaze');
			assert(pokemon.hasAbility('proficient'));
		} finally {
			battle.destroy();
		}
	});

	it('delegates constant ability results and leaves absent callbacks absent', () => {
		assert.equal(Dex.abilities.getHandler('battlearmor', 'onCriticalHit').call({}), false);
		assert.equal(Dex.abilities.getHandler('noability', 'onTryHit'), undefined);
		assert.equal(Dex.abilities.getHandler('sturdy', 'onDamage'), Dex.abilities.get('sturdy').onDamage);
	});

	it('keeps seeded random generators reproducible after an explicit reset', () => {
		const constructors = [
			require('../../../dist/data/random-teams').RandomTeams,
			require('../../../dist/data/mods/gen7/random-teams').RandomGen7Teams,
			require('../../../dist/data/mods/gen7/random-doubles-teams').RandomGen7DoublesTeams,
		];
		for (const Constructor of constructors) {
			const prng = new PRNG('1,2,3,4');
			const generator = new Constructor('gen9nofieldsinglesgame', prng);
			assert.equal(generator.prng, prng);
			const first = Array.from({length: 10}, () => generator.random(10000));
			generator.setSeed('1,2,3,4');
			assert.deepEqual(Array.from({length: 10}, () => generator.random(10000)), first);
		}
	});

	it('inherits complete data for cosmetic Arcanine and Sandslash forms', () => {
		for (const name of ['Arcanine', 'Sandslash']) {
			const base = Dex.species.get(name), alt = Dex.species.get(`${name}-Alt`);
			assert(alt.exists);
			assert.deepEqual(alt.baseStats, base.baseStats);
			assert.deepEqual(alt.types, base.types);
			assert(alt.abilities[0]);
		}
	});

	it('tracks Neutralization targets separately and does not repeat a drop on the same target', () => {
		const battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Quagsire', ability: 'Neutralization', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1, 2', 'team 1, 2');
			const source = battle.p1.active[0];
			const move = battle.dex.getActiveMove('tackle');
			const [first, second] = battle.p2.active;
			for (const target of [first, second, first]) {
				battle.singleEvent('SourceHit', source.getAbility(), source.abilityState, target, source, move);
			}
			assert.equal(first.boosts.atk, -1);
			assert.equal(second.boosts.atk, -1);
		} finally {
			battle.destroy();
		}
	});
});
