'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(format = 'gen9nofieldsinglesgame', set = {}) {
	battle = common.createBattle({formatid: format}, [
		[{species: 'Mew', ability: 'No Ability', moves: ['celebrate'], ...set}],
		[{species: 'Mew', ability: 'No Ability', moves: ['celebrate']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	for (const pokemon of battle.getAllActive()) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 10000;
	return battle.p1.active[0];
}
function reportedRooms() {
	const upkeep = battle.log.filter(line => line.startsWith('|upkeep')).slice(-1)[0];
	return upkeep.includes('[roomturns] ') ? JSON.parse(upkeep.split('[roomturns] ')[1]) : {};
}

describe('Field audit regressions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const room of ['trickroom', 'magicroom', 'wonderroom', 'gravity']) {
		it(`publishes ${room} remaining turns across Cold Eclipse expiry and resumption`, () => {
			const pokemon = setup();
			assert(battle.field.addPseudoWeather(room, pokemon));
			const duration = battle.field.pseudoWeather[room].duration;
			assert(battle.field.setFieldOrAura('coldeclipseterrain', 1, pokemon, Dex.moves.get('celebrate'), true));
			battle.makeChoices();
			assert.equal(battle.field.terrain, '');
			assert.equal(battle.field.pseudoWeather[room].duration, duration);
			assert.equal(reportedRooms()[room], duration);
			const expiry = battle.log.findIndex(line => line === '|-fieldend|Cold Eclipse Terrain');
			assert(expiry < battle.log.findIndex((line, i) => i > expiry && line.startsWith('|upkeep')));
			for (let turns = duration - 1; turns >= 0; turns--) {
				battle.makeChoices();
				assert.equal(battle.field.pseudoWeather[room]?.duration, turns || undefined);
				assert.equal(reportedRooms()[room], turns || undefined);
			}
		});
	}
	for (const stage of [3, 4, 5]) for (const [move, item] of [['surf', 'Waterium Z'], ['sparklingaria', 'Primarium Z']]) {
		it(`${item} extinguishes a Stage ${stage} garden with its actual Z-Move`, () => {
			const pokemon = setup('gen9flowergarden', {species: 'Primarina', moves: [move], item});
			battle.field.changeTerrain(`flowergarden${stage}`, pokemon, null, true);
			battle.field.changeTerrain('burningterrain', pokemon, null, true);
			const start = battle.log.length;
			battle.makeChoices('move 1 zmove', 'move celebrate');
			assert.equal(battle.field.terrain, `flowergarden${stage}`);
			assert(battle.p2.active[0].hp < 10000);
			assert(!battle.log.slice(start).some(line => line.includes('[from] Burning Terrain')));
			assert(battle.log.slice(start).some(line => line.includes(item === 'Primarium Z' ? '|Oceanic Operetta|' : '|Hydro Vortex|')));
		});
	}
	for (const ability of ['magmaarmor', 'unboundblaze', 'blazingtempo', 'burningspirit', 'steamengine', 'furnaceengine', 'burningego']) {
		for (const [field, expected] of [['coldeclipseterrain', 0], ['infernaleclipseterrain', 1]]) {
			it(`${ability} grants its Magma Armor entry defenses on ${field} correctly`, () => {
				const pokemon = setup();
				battle.field.startTerrain(field);
				pokemon.setAbility(ability);
				const stages = expected * (ability === 'burningego' ? 2 : 1);
				assert.equal(pokemon.boosts.def, stages);
				assert.equal(pokemon.boosts.spd, stages);
			});
		}
	}
	for (const id of ['magmaarmor', 'unboundblaze', 'burningspirit', 'blazingtempo', 'hisuianresolve', 'sunsovereign', 'burningcrown', 'calderacore', 'burningego']) {
		it(`${id} describes Infernal entry defenses and Fire immunity without changing Cold freeze rules`, () => {
			const description = Dex.abilities.get(id).desc;
			assert.match(description, /Dragon(?:'s)? Den and Infernal Eclipse block Fire moves/);
			assert.match(description, /Volcanic (?:or|and) Infernal Eclipse entry/);
			assert.doesNotMatch(description, /Volcanic (?:or|and) Cold Eclipse entry/);
			assert.match(description, /(?:freezing|freeze) outside Cold Eclipse/);
		});
	}
});
