'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Co-Star on Ashen Beach', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const gameType of ['singles', 'doubles']) {
		it(`does nothing without an active ally in ${gameType}`, () => {
			const mon = { species: 'Mew', ability: 'Co-Star', moves: ['splash'] };
			const team = gameType === 'doubles' ? [mon, mon] : [mon];
			battle = common.createBattle({ gameType }, [team, team.map(p => ({ ...p, ability: 'No Ability' }))]);
			const pokemon = battle.p1.active[0];
			if (gameType === 'doubles') { battle.p1.active[1].faint(); battle.faintMessages(); }
			battle.field.setTerrain('ashenbeachterrain', pokemon);
			assert.equal(pokemon.allies().length, 0);
			assert.doesNotThrow(() => battle.singleEvent('Start', battle.dex.abilities.get('costar'), pokemon.abilityState, pokemon));
			assert(!pokemon.volatiles.helpinghand);
		});
	}
	it('still helps both partners and copies ally boosts', () => {
		const mon = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		battle = common.createBattle({ gameType: 'doubles' }, [[mon, mon], [mon, mon]]);
		const [pokemon, ally] = battle.p1.active;
		battle.field.setTerrain('ashenbeachterrain', pokemon);
		ally.boosts.spa = 2;
		pokemon.setAbility('costar');
		assert.equal(pokemon.boosts.spa, 2);
		assert(pokemon.volatiles.helpinghand);
		assert(ally.volatiles.helpinghand);
	});
});
