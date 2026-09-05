'use strict';

const assert = require('./../assert');
const common = require('./../common');
const {Gen8Gen9NatDexLearnsets} = require('../../dist/data/natdex-gen8-gen9-learnsets');

const TEST_MOVES_BY_TYPE = {
	Normal: 'tackle', Fire: 'ember', Water: 'watergun', Bug: 'strugglebug', Electric: 'thundershock',
	Steel: 'metalclaw', Dark: 'bite', Ghost: 'lick', Fighting: 'brickbreak', Dragon: 'dragonclaw',
	Rock: 'rockthrow', Ground: 'mudslap', Poison: 'poisonsting', Flying: 'gust', Fairy: 'disarmingvoice',
	Psychic: 'confusion', Grass: 'leafage', Ice: 'powdersnow',
};

describe('Custom G-Max audit', function () {
	it('resolves every G-Max-capable species and form', function () {
		const dex = common.gen(9).dex;
		const eligible = dex.species.all().filter(species =>
			species.exists && !species.forme.includes('Gmax') && species.canGigantamax
		);
		const failures = [];

		for (const species of eligible) {
			let battle;
			try {
				const gmaxMove = dex.moves.get(species.canGigantamax);
				const baseMove = gmaxMove.id === 'gmaxcuddle' ? 'tackle' : TEST_MOVES_BY_TYPE[gmaxMove.type] || 'tackle';
				battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
					{species: species.id, ability: 'noability', gigantamax: true, moves: [baseMove]},
				], [
					{species: 'Magikarp', moves: ['splash']},
				]]);
				battle.makeChoices('team 1', 'team 1');
				const pokemon = battle.p1.active[0];
				const gmax = battle.dex.species.get(pokemon.canDynamax || '');
				const activeMaxMove = battle.actions.getMaxMove(battle.dex.moves.get(baseMove), pokemon);
				if (
					!pokemon.canDynamax || !gmax.exists || !gmax.forme.includes('Gmax') ||
					!gmaxMove.exists || gmaxMove.isNonstandard !== 'Gigantamax' || !gmax.abilities[0] ||
					!activeMaxMove || activeMaxMove.id !== gmaxMove.id
				) {
					failures.push(`${species.id} -> ${pokemon.canDynamax} / ${pokemon.canGigantamax}`);
					continue;
				}
				const expectedGmax = pokemon.canDynamax;
				battle.makeChoices(`move ${baseMove} dynamax`, 'move splash');
				if (battle.p1.active[0].species.id !== expectedGmax) {
					failures.push(`${species.id} transformed to ${battle.p1.active[0].species.id}, expected ${expectedGmax}`);
				}
			} finally {
				battle?.destroy();
			}
		}

		assert(eligible.length >= 59, `Expected the custom G-Max set to contain at least 59 entries, got ${eligible.length}`);
		assert.deepEqual(failures, []);
	});

	it('scopes Nature Power to NatDex sources and Grass final evolutions', function () {
		const dex = common.gen(9).dex;
		const expected = new Set(Object.entries(Gen8Gen9NatDexLearnsets)
			.filter(([, data]) => data.learnset?.naturepower)
			.map(([id]) => id));
		for (const species of dex.species.all()) {
			const forme = species.forme.toLowerCase();
			const baseSpecies = species.baseSpecies === species.name ? null : dex.species.get(species.baseSpecies);
			const hasLearnsetSource = dex.species.getLearnsetData(species.id).learnset ||
				(baseSpecies?.types.includes('Grass') && !baseSpecies.evos.length);
			if (hasLearnsetSource && species.types.includes('Grass') && !species.evos.length &&
				!forme.includes('mega') && !forme.includes('gmax')) {
				expected.add(species.id);
			}
		}
		const missing = [...expected].filter(id => !dex.species.getMovePool(id, true).has('naturepower'));
		assert(expected.size >= 100, `Expected the scoped Nature Power set to contain at least 100 entries, got ${expected.size}`);
		assert.deepEqual(missing, []);
		assert(!dex.data.Learnsets.flox.learnset.naturepower, 'Nature Power should not be added to unrelated entries');
	});

});
