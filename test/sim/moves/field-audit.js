'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');

const fields = [...Object.keys(Dex.data.Terrains), 'electricterrain', 'grassyterrain', 'mistyterrain', 'psychicterrain'];
const moves = ['tackle', 'flamethrower', 'surf', 'thunderbolt', 'energyball', 'icebeam', 'aurasphere',
	'sludgebomb', 'earthquake', 'airslash', 'psychic', 'bugbuzz', 'powergem', 'shadowball', 'dragonpulse',
	'darkpulse', 'flashcannon', 'moonblast', 'rocksmash', 'rockclimb', 'strength', 'accelerock', 'rockpolish',
	'fakeout', 'substitute', 'protect', 'toxic', 'willowisp', 'thunderwave', 'hypnosis', 'confuseray',
	'leechseed', 'spikes', 'toxicspikes', 'stealthrock', 'stickyweb', 'reflect', 'lightscreen', 'safeguard',
	'tailwind', 'trickroom', 'magicroom', 'wonderroom', 'gravity', 'raindance', 'sunnyday', 'sandstorm',
	'snowscape', 'secretpower', 'naturepower', 'camouflage', 'purify', 'tidyup', 'scald', 'heatwave',
	'gust', 'defog', 'dive', 'dig', 'fly', 'recover', 'haze'];

describe('All-field move and condition smoke audit', () => {
	for (const field of fields) for (const move of moves) {
		it(`${field}: ${move} executes two turns without invalid state`, () => {
			const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Mew', ability: 'No Ability', moves: [move, 'splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			try {
				battle.makeChoices('team 1', 'team 1');
				battle.field.startTerrain(field);
				for (let turn = 0; turn < 2 && !battle.ended; turn++) {
					battle.makeChoices(turn && move === 'fakeout' ? 'move 2' : 'move 1', 'move 1');
					for (const pokemon of battle.getAllPokemon()) {
						assert(Number.isFinite(pokemon.hp) && pokemon.hp >= 0 && pokemon.hp <= pokemon.maxhp);
						for (const stage of Object.values(pokemon.boosts)) assert(Number.isInteger(stage) && stage >= -6 && stage <= 6);
					}
					assert(!battle.field.terrain || battle.dex.conditions.get(battle.field.terrain).exists);
					assert(!battle.log.some(line => /\bNaN\b|\bundefined\b/.test(line)), battle.log.slice(-12).join('\n'));
				}
			} finally { battle.destroy(); }
		});
	}
	for (const field of fields) for (const item of ['elementalseed', 'magicalseed', 'syntheticseed', 'telluricseed']) {
		it(`${field}: ${item} activation and residual effects remain valid`, () => {
			const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Mew', ability: 'No Ability', item, moves: ['splash']}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			try {
				battle.makeChoices('team 1', 'team 1'); battle.field.startTerrain(field);
				for (let turn = 0; turn < 2 && !battle.ended; turn++) battle.makeChoices();
				for (const pokemon of battle.getAllPokemon()) assert(Number.isFinite(pokemon.hp) && pokemon.hp >= 0 && pokemon.hp <= pokemon.maxhp);
				assert(!battle.log.some(line => /\bNaN\b|\bundefined\b/.test(line)), battle.log.slice(-12).join('\n'));
			} finally { battle.destroy(); }
		});
	}
});
