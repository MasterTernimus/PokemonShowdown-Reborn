const assert = require('node:assert/strict');
const common = require('../test/common');

const expected = {
	watersurfaceterrain: 'underwaterterrain',
	underwaterterrain: 'midnightzoneterrain',
	corrosivemistterrain: 'corrosiveterrain',
	newworldterrain: 'newworldterrain',
};

for (const [terrain, result] of Object.entries(expected)) {
	for (const gravityAlreadyActive of [false, true]) {
		for (const trigger of ['lunarorbit', 'gmaxgravitas']) {
			const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species: 'Clefable', ability: 'lunarorbit', moves: ['splash']},
			], [
				{species: 'Mew', moves: ['splash']},
			]]);
			try {
				battle.makeChoices('team 1', 'team 1');
				const pokemon = battle.p1.active[0];
				battle.field.removePseudoWeather('gravity');
				if (gravityAlreadyActive) battle.field.addPseudoWeather('gravity', pokemon);
				assert(battle.field.setTerrain(terrain, pokemon));
				if (trigger === 'lunarorbit') {
					battle.dex.abilities.get('lunarorbit').onStart.call(battle, pokemon);
				} else {
					const move = battle.dex.moves.get('gmaxgravitas');
					move.self.onHit.call(battle, pokemon, pokemon, move);
				}
				assert.equal(battle.field.terrain, result, `${trigger} on ${terrain}, Gravity active: ${gravityAlreadyActive}`);
				assert(battle.field.getPseudoWeather('gravity'));
			} finally {
				battle.destroy();
			}
		}
	}
}

const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
	{species: 'Clefable', ability: 'lunarorbit', moves: ['splash']},
], [
	{species: 'Mew', moves: ['splash']},
]]);
try {
	battle.makeChoices('team 1', 'team 1');
	const pokemon = battle.p1.active[0];
	assert(pokemon.hasAbility('magicguard'));
	assert.equal(battle.dex.abilities.get('lunarorbit').onDamage.call(battle, 10, pokemon, null,
		{effectType: 'Status', name: 'Poison'}), false);
	for (const species of ['qwilfish', 'whiscash', 'relicanth']) {
		assert(battle.dex.data.Learnsets[species].learnset.fishiousrend, species);
	}
	assert(!battle.dex.data.Learnsets.seaking.learnset.fishiousrend);
} finally {
	battle.destroy();
}

const megaBattle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
	{species: 'Clefable', ability: 'magicguard', item: 'Clefablite', moves: ['splash']},
], [
	{species: 'Mew', ability: 'noability', moves: ['tackle']},
]]);
try {
	megaBattle.makeChoices('team 1', 'team 1');
	assert(megaBattle.field.setTerrain('watersurfaceterrain', megaBattle.p1.active[0]));
	megaBattle.makeChoices('move 1 mega', 'move 1');
	assert.equal(megaBattle.p1.active[0].species.name, 'Clefable-Mega');
	assert.equal(megaBattle.field.terrain, 'underwaterterrain');
} finally {
	megaBattle.destroy();
}

const gmaxBattle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
	{species: 'Orbeetle', ability: 'magicbounce', gigantamax: true, moves: ['psychic']},
], [
	{species: 'Blissey', ability: 'noability', moves: ['tackle']},
]]);
try {
	gmaxBattle.makeChoices('team 1', 'team 1');
	const pokemon = gmaxBattle.p1.active[0];
	gmaxBattle.field.addPseudoWeather('gravity', pokemon);
	assert(gmaxBattle.field.setTerrain('underwaterterrain', pokemon));
	gmaxBattle.makeChoices('move 1 dynamax', 'move 1');
	assert(gmaxBattle.log.some(line => line.includes('G-Max Gravitas')));
	assert.equal(gmaxBattle.field.terrain, 'midnightzoneterrain');
} finally {
	gmaxBattle.destroy();
}
console.log('PASS: Lunar Orbit Magic Guard, Gravity field transitions, and Fishious Rend learnsets.');
