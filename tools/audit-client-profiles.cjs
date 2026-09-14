'use strict';
const path = require('path');
const {Dex: serverDex} = require('../dist/sim/dex');
const root = path.resolve(process.argv[2], 'play.pokemonshowdown.com');
global.window = global;
global.Config = {};
global.Pokemon = class {};
global.BattlePokedex = require(path.join(root, 'data/pokedex.js')).BattlePokedex;
global.BattleAbilities = require(path.join(root, 'data/abilities.js')).BattleAbilities;
global.BattleMovedex = require(path.join(root, 'data/moves.js')).BattleMovedex;
global.BattlePokemonSprites = {};
global.BattlePokemonSpritesBW = {};
global.BattleTeambuilderTable = require(path.join(root, 'data/teambuilder-tables.js')).BattleTeambuilderTable;
require(path.join(root, 'js/battle-dex-data.js'));
require(path.join(root, 'js/battle-dex.js'));
const mismatches = [];
const excluded = [];
let compared = 0;
const filter = process.argv[3] && new Set(process.argv[3].split(','));
for (const species of serverDex.species.all()) {
	// This retired skin is deliberately removed by the client's REMOVED_SPECIES_IDS.
	if (species.id === 'luxraydeso') {excluded.push(species.id); continue;}
	if (filter && !filter.has(species.id)) continue;
	const client = global.Dex.species.get(species.name);
	if (!client.exists) {mismatches.push({id: species.id, field: 'missingClient'}); continue;}
	compared++;
	for (const field of ['baseStats', 'types', 'abilities']) {
		const normalize = value => field === 'abilities' ? Object.fromEntries(Object.entries(value).map(([slot, name]) =>
			[slot, name?.toLowerCase().replace(/[^a-z0-9]/g, '')])) : value;
		if (JSON.stringify(normalize(species[field])) !== JSON.stringify(normalize(client[field]))) {
			mismatches.push({id: species.id, field, server: species[field], client: client[field]});
		}
	}
}
console.log(JSON.stringify({compared, excluded, mismatches}, null, 2));
process.exitCode = mismatches.length ? 1 : 0;
