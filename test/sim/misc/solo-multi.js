'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

describe('1v2 Multi battle', () => {
	let battle;
	afterEach(() => battle?.destroy());

	it('offers a three-person challenge format on every Multi field', () => {
		for (const terrain of ['watersurface', 'midnightzone', 'newworld']) {
			const format = Dex.formats.get(`gen9multi1v2${terrain}`);
			assert(format.exists, terrain);
			assert.equal(format.gameType, 'multi');
			assert.equal(format.playerCount, 4, 'The simulator uses two linked slots for the solo participant');
			assert.equal(Dex.formats.getRuleTable(format).pickedTeamSize, 3);
		}
	});

	it('lets both solo slots attack independently against the two teammates', () => {
		battle = common.createBattle({ formatid: 'gen9multi1v2watersurface' }, [
			[{ species: 'Mew', moves: ['tackle', 'splash'] }, { species: 'Ditto', moves: ['transform'] }, { species: 'Eevee', moves: ['tackle'] }],
			[{ species: 'Snorlax', moves: ['splash'] }, { species: 'Eevee', moves: ['splash'] }, { species: 'Ditto', moves: ['transform'] }],
			[{ species: 'Pikachu', moves: ['tackle', 'splash'] }, { species: 'Eevee', moves: ['tackle'] }, { species: 'Ditto', moves: ['transform'] }],
			[{ species: 'Blissey', moves: ['splash'] }, { species: 'Eevee', moves: ['splash'] }, { species: 'Ditto', moves: ['transform'] }],
		]);
		battle.makeChoices('team 1,2,3', 'team 1,2,3', 'team 1,2,3', 'team 1,2,3');
		assert.equal(battle.p1.allySide, battle.p3);
		assert.equal(battle.p2.allySide, battle.p4);
		const p2hp = battle.p2.active[0].hp;
		const p4hp = battle.p4.active[0].hp;
		battle.makeChoices('move tackle +1', 'move splash', 'move tackle +2', 'move splash');
		assert(battle.p2.active[0].hp < p2hp, 'the solo first slot attacks p2');
		assert(battle.p4.active[0].hp < p4hp, 'the solo second slot attacks p4');
	});

	it('moves surviving reserves between the solo slots before either slot empties', () => {
		for (const slot of ['p1', 'p3']) {
			battle = common.createBattle({ formatid: 'gen9multi1v2watersurface' }, [
				[{ species: 'Mew', moves: ['splash'] }, { species: 'Eevee', moves: ['splash'] }, { species: 'Pikachu', moves: ['splash'] }],
				[{ species: 'Snorlax', moves: ['splash'] }],
				[{ species: 'Ditto', moves: ['transform'] }, { species: 'Blissey', moves: ['splash'] }, { species: 'Chansey', moves: ['splash'] }],
				[{ species: 'Slowpoke', moves: ['splash'] }],
			]);
			battle.makeChoices('team 1,2,3', 'team 1', 'team 1,2,3', 'team 1');
			const receiver = battle[slot];
			const donor = receiver.allySide;
			const borrowed = donor.pokemon[1];
			receiver.pokemon[1].faint();
			battle.faintMessages();
			receiver.pokemon[2].faint();
			battle.faintMessages();
			assert(receiver.pokemon.includes(borrowed), `${slot} should receive its partner's living reserve`);
			assert.equal(borrowed.side, receiver);
			assert.equal(receiver.pokemonLeft, 2);
			assert.equal(donor.pokemonLeft, 2);
			// Both original reserves are gone; the surviving active slot can still be replaced.
			receiver.active[0].faint();
			battle.faintMessages();
			assert.equal(receiver.pokemonLeft, 1);
			assert(receiver.pokemon.some(pokemon => !pokemon.fainted && pokemon !== receiver.active[0]));
			borrowed.faint();
			battle.faintMessages();
			assert.equal(receiver.pokemonLeft, 1, 'another reserve should move over before the slot can be eliminated');
			assert(!battle.ended);
			battle.checkFainted();
			battle.makeRequest('switch');
			assert(receiver.activeRequest.forceSwitch[0]);
			const replacement = receiver.pokemon.findIndex((pokemon, i) => i > 0 && !pokemon.fainted) + 1;
			const choices = slot === 'p1' ? [`switch ${replacement}`, '', '', ''] : ['', '', `switch ${replacement}`, ''];
			battle.makeChoices(...choices);
			assert(receiver.active[0] && !receiver.active[0].fainted, 'the shared reserve fills the empty slot');
			battle.destroy();
			battle = null;
		}
	});
});
