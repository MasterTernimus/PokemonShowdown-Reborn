'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { TeamValidator } = require('../../../dist/sim');
const { adaptiveMemory } = require('../../../dist/sim/adaptive-cycle');
let battle;

function validate(format, teams) {
	for (const team of teams) {
		assert.equal(TeamValidator.get(format).validateTeam(JSON.parse(JSON.stringify(team))), null);
	}
}

function setupPower(field = 'coldeclipseterrain', aura = 'frozenaura') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
		[{ species: 'Mew', ability: 'No Ability', moves: ['Protect'] }],
		[{ species: 'Mew', ability: 'No Ability', moves: ['Protect'] }],
	]);
	battle.makeChoices('team 1', 'team 1');
	if (field) battle.field.startTerrain(field);
	if (aura) battle.field.setAura(aura, 5, battle.p1.active[0]);
}

function power(id, source = battle.p1.active[0], target = battle.p2.active[0]) {
	const move = battle.dex.getActiveMove(id);
	battle.singleEvent('ModifyType', move, null, source, target, move, move);
	battle.singleEvent('ModifyMove', move, null, source, target, move, move);
	battle.runEvent('ModifyMove', source, target, move, move);
	return { move, power: battle.runEvent('BasePower', source, target, move, 100, true) };
}

describe('Eclipse audit regressions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	for (const move of ['Mud Barrage', 'Mud-Slap']) {
		it(`converts ${move} to Ice on Snowy Field and hits a Flying opponent`, () => {
			const format = 'gen9snowyfield';
			const teams = [
				[{ species: 'Alakazam', ability: 'Aevian Discipline', moves: [move] }],
				[{ species: 'Pidgeot', ability: 'Keen Eye', moves: ['Work Up'] }],
			];
			validate(format, teams);
			battle = common.createBattle({ formatid: format }, teams);
			battle.makeChoices('team 1', 'team 1');
			const result = power(move);
			assert.equal(result.move.id, 'mudbarrage');
			assert.equal(result.move.type, 'Ice');
			assert.deepEqual(result.move.types, ['Ice']);
			assert.equal(result.power, 150);
			battle.makeChoices('move 1', 'move workup');
			const target = battle.p2.active[0];
			assert(target.hp < target.maxhp);
			assert(!battle.log.some(line => line.startsWith('|-immune|p2a: Pidgeot')));
		});
	}

	it('opposing Magical Seeds establish one Trick Room without cancelling it', () => {
		const format = 'gen9doublesrifteclipsefield';
		const teams = [
			[{ species: 'Hatterene', ability: 'Magic Bounce', item: 'Magical Seed', moves: ['Protect'] },
				{ species: 'Blissey', ability: 'Natural Cure', moves: ['Protect'] }],
			[{ species: 'Bronzong', ability: 'Levitate', item: 'Magical Seed', moves: ['Protect'] },
				{ species: 'Mew', ability: 'Synchronize', moves: ['Protect'] }],
		];
		validate(format, teams);
		battle = common.createBattle({ formatid: format }, teams);
		battle.makeChoices('team 12', 'team 12');
		for (const side of battle.sides) {
			assert.equal(side.active[0].item, '');
			assert.equal(side.active[0].boosts.def, 1);
		}
		assert.equal(battle.field.pseudoWeather.trickroom.duration, 8);
		assert.equal(battle.log.filter(line => line.startsWith('|-fieldstart|move: Trick Room') &&
			!line.includes('[silent]')).length, 1);
		assert(!battle.log.some(line => line.startsWith('|-fieldend|move: Trick Room')));
	});

	it('a later seed preserves the existing room and timer, and Trick Room still toggles it off', () => {
		const format = 'gen9rifteclipsefield';
		const teams = [
			[{ species: 'Hatterene', ability: 'Magic Bounce', item: 'Magical Seed', moves: ['Protect', 'Trick Room'] }],
			[{ species: 'Blissey', ability: 'Natural Cure', moves: ['Protect'] },
				{ species: 'Bronzong', ability: 'Levitate', item: 'Magical Seed', moves: ['Protect'] }],
		];
		validate(format, teams);
		battle = common.createBattle({ formatid: format }, teams);
		battle.makeChoices('team 1', 'team 12');
		const room = battle.field.pseudoWeather.trickroom;
		assert.equal(room.duration, 8);
		battle.makeChoices('move protect', 'move protect');
		assert.equal(room.duration, 7);
		battle.makeChoices('move protect', 'switch 2');
		assert.equal(battle.p2.active[0].item, '');
		assert.equal(battle.p2.active[0].boosts.def, 1);
		assert.equal(battle.field.pseudoWeather.trickroom, room);
		assert.equal(room.duration, 6);
		battle.makeChoices('move trickroom', 'move protect');
		assert.equal(battle.field.getPseudoWeather('trickroom'), null);
	});

	it('keeps the Ice overlap capped after the legal Bad Seeds, Rift Herald and Glaciate sequence', () => {
		const format = 'gen9rockyfield';
		const teams = [
			[{ species: 'Weavile', ability: 'Bad Seeds', moves: ['Protect'] },
				{ species: 'Bronzong', ability: 'Rift Herald', moves: ['Protect', 'Ancient Power'] }],
			[{ species: 'Kyurem', ability: 'Pressure', moves: ['Glaciate', 'Ancient Power'] },
				{ species: 'Blissey', ability: 'Natural Cure', moves: ['Protect'] }],
		];
		validate(format, teams);
		battle = common.createBattle({ formatid: format }, teams);
		battle.makeChoices('team 12', 'team 12');
		assert.equal(battle.field.auraField, 'frozenaura');
		battle.makeChoices('switch 2', 'move glaciate');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		assert.equal(battle.field.auraField, 'frozenaura');
		assert.equal(battle.field.auraTurns, 4);
		const result = power('ancientpower', battle.p2.active[0], battle.p1.active[0]);
		assert.deepEqual(result.move.types, ['Rock', 'Ice']);
		assert.equal(result.power, 150);
	});

	for (const move of ['ancientpower', 'ironhead', 'earthpower', 'surf', 'freezedry']) {
		it(`shares the Cold Eclipse and Frozen Aura type bonus for ${move}`, () => {
			setupPower();
			const result = power(move);
			assert((result.move.types || [result.move.type]).includes('Ice'));
			assert.equal(result.power, 150);
		});
	}

	it('retains the separate field-only and Aura-only bonuses', () => {
		setupPower('coldeclipseterrain', '');
		assert.equal(power('ancientpower').power, 120);
		battle.field.clearTerrain();
		battle.field.setAura('frozenaura', 5, battle.p1.active[0]);
		assert.equal(power('freezedry').power, 130);
		assert.equal(power('ancientpower').power, 100);
	});

	it('preserves named move bonuses without duplicating shared ones', () => {
		setupPower();
		assert.equal(power('icebeam').power, 180);
		assert.equal(power('stompingtantrum').power, 225);
		assert.equal(power('chillingwater').power, 300);
	});

	it('keeps Frozen Aura independent when the target has adapted to Cold Eclipse', () => {
		setupPower();
		const target = battle.p2.active[0];
		target.setAbility('adaptivecycle');
		adaptiveMemory(target).fields.coldeclipseterrain = { stage: 3, turn: battle.turn };
		assert.equal(power('ancientpower').power, 130);
		assert.equal(power('freezedry').power, 130);
	});

	it('preserves the existing added-Fire overlap with Infernal Eclipse and Ashen Aura', () => {
		setupPower('infernaleclipseterrain', 'ashenaura');
		const result = power('ancientpower');
		assert.deepEqual(result.move.types, ['Rock', 'Fire']);
		assert.equal(result.power, 150);
	});
});
