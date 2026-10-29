'use strict';
const assert = require('assert').strict;
const {Dex, TeamValidator, Teams} = require('../../../dist/sim');
const common = require('../../common');

const holders = [
	['Arboliva-Aevian', 'Bad Seeds', 'blizzard', []],
	['Froslass', 'Bad Seeds', 'blizzard', ['levitate']],
	['Glalie', 'Bad Seeds', 'blizzard', ['levitate']],
	['Weavile', 'Bad Seeds', 'blizzard', ['infiltrator']],
	['Typhlosion-Hisui', 'Ashen Seeds', 'eruption', ['blaze']],
	['Ninetales', 'Ashen Seeds', 'eruption', ['cursedbody']],
	['Camerupt', 'Ashen Seeds', 'eruption', ['soundproof']],
	['Torkoal', 'Ashen Seeds', 'eruption', ['whitesmoke']],
	['Hoopa', 'Rift Herald', 'riftopening', []],
	['Bronzong', 'Rift Herald', 'riftopening', ['clearbody']],
	['Mismagius', 'Rift Herald', 'riftopening', ['levitate']],
];
const validator = new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities');

describe('Eclipse Special Event ability distribution', () => {
	for (const [name, ability, move, passives] of holders) {
		it(`${name} exports and validates its event selection with an available setup move`, () => {
			const species = Dex.species.get(name);
			assert.equal(species.abilities.S, ability);
			assert.deepEqual(species.passives, passives);
			assert.equal(validator.checkCanLearn(Dex.moves.get(move), species, undefined, {level: 100}), null);
			const [set] = Teams.import(Teams.export([{
				species: name, ability, moves: [move], nature: 'Hardy', evs: {hp: 1}, level: 100,
			}]));
			assert.equal(set.ability, ability);
			assert.equal(validator.validateSet(set), null);
		});
		it(`${name}'s selected event ability creates its field without replacing its passive`, () => {
			const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: name, ability, moves: [move]}],
				[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			]);
			try {
				battle.makeChoices('team 1', 'team 1');
				assert.equal(battle.p1.active[0].ability, Dex.toID(ability));
				assert.deepEqual(battle.p1.active[0].getPassives(), passives);
				assert.equal(battle.field.terrain, {
					'Bad Seeds': 'coldeclipseterrain', 'Ashen Seeds': 'infernaleclipseterrain',
					'Rift Herald': 'rifteclipseterrain',
				}[ability]);
			} finally {
				battle.destroy();
			}
		});
	}

	it('retains Arboliva-Aevian ordinary choices after exchanging its two slots', () => {
		assert.deepEqual(Dex.species.get('arbolivaaevian').abilities, {
			0: 'Harvest', 1: 'Arena Trap', H: "Winter's Malice", S: 'Bad Seeds',
		});
	});

	it('does not assign the event abilities to independently defined related forms', () => {
		for (const name of ['Froslass-Mega', 'Froslass-Aevian', 'Glalie-Mega', 'Weavile-Mega',
			'Typhlosion', 'Ninetales-Alola', 'Ninetales-Reborn', 'Camerupt-Mega', 'Camerupt-Pulse',
			'Hoopa-Unbound', 'Bronzong-Mega', 'Mismagius-Mega']) {
			assert(!Object.values(Dex.species.get(name).abilities).some(a =>
				['Bad Seeds', 'Ashen Seeds', 'Rift Herald'].includes(a)), name);
		}
	});

	it('makes the two approved moves learnable without granting them to pre-evolutions or Alolan Ninetales', () => {
		for (const [name, move] of [['Weavile', 'sheercold'], ['Weavile-Mega', 'sheercold'], ['Ninetales', 'eruption']]) {
			assert.equal(validator.checkCanLearn(Dex.moves.get(move), Dex.species.get(name), undefined, {level: 100}), null);
		}
		for (const [name, move] of [['Sneasel', 'sheercold'], ['Vulpix', 'eruption'], ['Ninetales-Alola', 'eruption']]) {
			assert(validator.checkCanLearn(Dex.moves.get(move), Dex.species.get(name), undefined, {level: 100}), name);
		}
	});
});
