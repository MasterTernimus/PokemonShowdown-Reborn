'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Flower Gift', function () {
	afterEach(function () {
		battle.destroy();
	});

	it(`should boost allies' Attack and Special Defense stats`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: "Cherrim", ability: 'flowergift', moves: ['healbell']},
			{species: "Snorlax", ability: 'immunity', moves: ['healbell']},
		], [
			{species: "Blissey", ability: 'serenegrace', moves: ['healbell']},
			{species: "Blissey", ability: 'serenegrace', moves: ['healbell']},
		]]);

		// The custom Sunshine form also changes Cherrim's base stats.
		const cherrim = battle.p1.active[0];
		const baseAtk = battle.p1.active[1].getStat('atk');
		const baseSpd = battle.p1.active[1].getStat('spd');

		// Set the weather to sun and re-check
		battle.field.setWeather('sunnyday', 'debug');
		assert.equal(battle.p1.active[0].getStat('atk'), battle.modify(cherrim.storedStats.atk, 1.5));
		assert.equal(battle.p1.active[0].getStat('spd'), battle.modify(cherrim.storedStats.spd, 1.5));
		assert.equal(battle.p1.active[1].getStat('atk'), battle.modify(baseAtk, 1.5));
		assert.equal(battle.p1.active[1].getStat('spd'), battle.modify(baseSpd, 1.5));
	});

	it(`should still work if Cherrim transforms into something with Flower Gift without originally having it`, function () {
		battle = common.createBattle({gameType: 'doubles'}, [[
			{species: "Cherrim", ability: 'serenegrace', moves: ['transform']},
			{species: "Snorlax", ability: 'immunity', moves: ['healbell']},
		], [
			{species: "Blissey", ability: 'flowergift', moves: ['healbell']},
			{species: "Blissey", ability: 'flowergift', moves: ['healbell']},
		]]);

		battle.makeChoices('move transform 1, move healbell', 'move healbell, move healbell');
		// The custom Sunshine form also changes Cherrim's base stats.
		const cherrim = battle.p1.active[0];
		const baseAtk = battle.p1.active[1].getStat('atk');
		const baseSpd = battle.p1.active[1].getStat('spd');

		// Set the weather to sun and re-check
		battle.field.setWeather('sunnyday', 'debug');
		assert.equal(battle.p1.active[0].getStat('atk'), battle.modify(cherrim.storedStats.atk, 1.5));
		assert.equal(battle.p1.active[0].getStat('spd'), battle.modify(cherrim.storedStats.spd, 1.5));
		assert.equal(battle.p1.active[1].getStat('atk'), battle.modify(baseAtk, 1.5));
		assert.equal(battle.p1.active[1].getStat('spd'), battle.modify(baseSpd, 1.5));
	});

	it(`should not trigger if Max Flare KOs the Pokemon`, () => {
		battle = common.createBattle({ formatid: 'gen9factoryfield' }, [[
			{ species: 'Cherrim', level: 1, ability: 'flowergift', moves: ['sleeptalk'] },
		], [
			{ species: 'Snorlax', ability: 'No Ability', gigantamax: true, moves: ['blastburn'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const attacker = battle.p2.active[0];
		attacker.addVolatile('dynamax');
		// Reborn G-Max only converts signature-type moves. Exercise the retained
		// Max Flare effect directly rather than requesting unsupported Dynamax.
		const flare = battle.actions.getActiveMaxMove(battle.dex.getActiveMove('blastburn'), attacker);
		battle.actions.useMove(flare, attacker, { target: battle.p1.active[0] });
		assert.equal(battle.p1.active[0].hp, 0);
		assert(battle.log.some(line => line.includes('|Max Flare|')));
		assert(battle.log.every(line => !line.startsWith('|-formechange|p1')));
	});
});
