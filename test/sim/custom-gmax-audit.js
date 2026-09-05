'use strict';

const assert = require('./../assert');
const common = require('./../common');

const TEST_MOVES_BY_TYPE = {
	Normal: 'tackle', Fire: 'ember', Water: 'watergun', Bug: 'strugglebug', Electric: 'thundershock',
	Steel: 'metalclaw', Dark: 'bite', Ghost: 'lick', Fighting: 'brickbreak', Dragon: 'dragonclaw',
	Rock: 'rockthrow', Ground: 'mudslap', Poison: 'poisonsting', Flying: 'gust', Fairy: 'disarmingvoice',
	Psychic: 'confusion', Grass: 'leafage', Ice: 'powdersnow',
};

describe('Custom G-Max and NatDex audit', function () {
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

	it('adds Nature Power to NatDex-legal learnsets only', function () {
		const dex = common.gen(9).dex;
		const entries = Object.entries(dex.data.Learnsets).filter(([id, data]) =>
			data.learnset && dex.species.get(id).exists
		);
		const natDexEntries = entries.filter(([id]) => dex.species.get(id).natDexTier !== 'Illegal');
		const missing = natDexEntries.filter(([, data]) => !(data.learnset.naturepower || []).length).map(([id]) => id);
		const nonNatDexEntries = entries.filter(([id]) => dex.species.get(id).natDexTier === 'Illegal');
		const stillMissingOutsideNatDex = nonNatDexEntries.filter(([, data]) => !data.learnset.naturepower).map(([id]) => id);
		assert(natDexEntries.length >= 900, `Expected the NatDex roster to contain at least 900 learnset entries, got ${natDexEntries.length}`);
		assert(stillMissingOutsideNatDex.length > 0, 'Expected at least one non-NatDex entry to remain without Nature Power');
		assert.deepEqual(missing, []);
	});
});
