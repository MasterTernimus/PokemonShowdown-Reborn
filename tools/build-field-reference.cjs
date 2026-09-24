'use strict';
// Regenerate after exporting/building the client field rules.
const fs = require('fs');
const path = require('path');
const root = path.resolve(process.argv[2] || '');
const serverDex = require('../dist/sim').Dex;
global.window = global;
for (const [file, key] of [['moves', 'BattleMovedex'], ['pokedex', 'BattlePokedex'], ['abilities', 'BattleAbilities']]) {
	global[key] = require(path.join(root, 'play.pokemonshowdown.com/data', file + '.js'))[key];
}
global.BattlePokemonSprites = {};
global.BattlePokemonSpritesBW = {};
for (const file of ['battle-dex-data', 'battle-dex', 'battle-scene-stub', 'battle-text-parser', 'battle', 'battle-field-rules', 'battle-field-tooltips']) {
	require(path.join(root, 'play.pokemonshowdown.com/js', file + '.js'));
}
const result = {};
for (const field of global.BattleFieldRules) result[field.id] = {name: field.name, moves: {}};
for (const move of serverDex.moves.all()) {
	for (const note of global.BattleFieldTooltips.allNotes(move)) {
		const field = global.BattleFieldRules.find(f => note.startsWith(f.name + ': '));
		if (!field) continue;
		const text = note.slice(field.name.length + 2);
		(result[field.id].moves[text] ||= []).push(move.name);
	}
}
fs.writeFileSync(path.join(__dirname, '../data/field-reference.json'), JSON.stringify(result, null, 2) + '\n');
console.log(`Generated move-effect reference for ${Object.keys(result).length} fields.`);
