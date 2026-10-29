'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

const fields = [
	['Rift Eclipse', 'rifteclipseterrain', 'Magical Seed'],
	['Infernal Eclipse', 'infernaleclipseterrain', 'Elemental Seed'],
	['Snowy Field', 'snowyterrain', 'Elemental Seed'],
];
const modes = [
	['', 'singles', 2], ['Doubles ', 'doubles', 2],
	['Free-For-All 3P ', 'freeforall', 3], ['Free-For-All 4P ', 'freeforall', 4],
	['Multi ', 'multi', 4], ['Multi 1v2 ', 'multi', 4],
];

function formatName(fieldName, prefix) {
	const suffix = (prefix === '' || prefix === 'Doubles ') && !fieldName.endsWith('Field') ? ' Field' : '';
	return `[Gen 9] ${prefix}${fieldName}${suffix}`;
}

function startBattle(name, players, item = '') {
	const teams = Array.from({ length: players }, (_, player) => Array.from({ length: 6 }, (_, slot) =>
		({ species: 'Mew', ability: 'No Ability', moves: ['splash'], item: player === 0 && slot === 0 ? item : '' })));
	const battle = common.createBattle({ formatid: Dex.toID(name) }, teams);
	battle.makeChoices(...Array(players).fill('team 123456'));
	return battle;
}

describe('Eclipse and Snowy selectable formats', () => {
	for (const [fieldName, terrain] of fields) {
		for (const [prefix, gameType, players] of modes) {
			const name = formatName(fieldName, prefix);
			it(`${name} is visible and selects the intended field`, () => {
				const format = Dex.formats.get(name);
				assert(format.exists, name);
				assert.equal(format.terrain, terrain);
				assert.equal(format.gameType, gameType);
				assert.equal(format.challengeShow, true);
				assert.equal(format.searchShow, prefix !== 'Multi 1v2 ');
				assert.equal(Dex.formats.all().filter(f => f.id === format.id).length, 1);
				// Multi 1v2 uses the server's separate asymmetric-player setup.
				if (prefix === 'Multi 1v2 ') return;
				const battle = startBattle(name, players);
				try {
					assert.equal(battle.field.terrain, terrain);
					assert.equal(battle.field.terrainState.permanent, true);
					assert.equal(battle.sides.length, players);
				} finally {
					battle.destroy();
				}
			});
		}
	}

	for (const [fieldName, terrain, item] of fields) {
		for (const [prefix, players] of [['', 2], ['Doubles ', 2], ['Free-For-All 3P ', 3], ['Free-For-All 4P ', 4]]) {
			it(`${item} activates when starting ${formatName(fieldName, prefix)}`, () => {
				const battle = startBattle(formatName(fieldName, prefix), players, item);
				try {
					const pokemon = battle.p1.active[0];
					assert.equal(pokemon.item, '');
					assert.equal(battle.field.terrain, terrain);
					if (terrain === 'rifteclipseterrain') {
						assert.equal(pokemon.boosts.def, 1);
						assert.equal(battle.field.pseudoWeather.trickroom.duration, 8);
					} else if (terrain === 'infernaleclipseterrain') {
						assert.equal(pokemon.boosts.atk, 1);
						assert.equal(pokemon.boosts.spa, 1);
						assert.equal(pokemon.volatiles.partiallytrapped.duration, 4);
					} else {
						assert.equal(pokemon.boosts.spd, 1);
						assert(pokemon.side.sideConditions.safeguard);
						assert(pokemon.side.slotConditions[pokemon.position].wish);
					}
				} finally {
					battle.destroy();
				}
			});
		}
	}
});
