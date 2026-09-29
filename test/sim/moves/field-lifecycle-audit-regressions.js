'use strict';

const assert = require('assert').strict;
const common = require('../../common');
let battle;

function setup(format = 'gen9nofieldsinglesgame', item = '', moves = ['grassyterrain', 'heatwave', 'tailwind', 'recover']) {
	battle = common.createBattle({ formatid: format }, [
		[{ species: 'Mew', level: 50, ability: 'Synchronize', item, moves }],
		[{ species: 'Blissey', ability: 'Natural Cure', moves: ['softboiled'] }],
	]);
	battle.makeChoices('team 1', 'team 1');
}

function turn(move = 'recover') {
	battle.makeChoices(`move ${move}`, 'move softboiled');
}

describe('Field lifecycle audit regressions', () => {
	afterEach(() => { battle?.destroy(); battle = null; });

	it('keeps restored Wasteland usable after Teraform Zero without replaying entry effects', () => {
		battle = common.createBattle({ formatid: 'gen9wastelandfield' }, [
			[{ species: 'Terapagos-Terastal', ability: 'Tera Shell', teraType: 'Stellar', moves: ['protect', 'rest'] }],
			[{ species: 'Blissey', ability: 'Natural Cure', moves: ['softboiled', 'spikes'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		const [active, underlying] = battle.field.terrainStack;
		for (const hazard of ['toxicspikes', 'spikes', 'stickyweb', 'stealthrock']) {
			assert.deepEqual(underlying[hazard], []);
			assert.notEqual(underlying[hazard], active[hazard]);
		}
		battle.makeChoices('move protect terastallize', 'move softboiled');
		assert.equal(battle.turn, 2);
		assert.equal(battle.field.terrainState, underlying);
		battle.makeChoices('move rest', 'move spikes');
		assert(battle.log.some(line => line.startsWith('|-damage|p1a:') && line.includes('[from] Wasteland Terrain')));
	});

	for (const item of ['', 'amplifieldrock']) {
		for (const transform of [false, true]) {
			it(`expires ${item ? 'eight' : 'five'}-turn Grassy Terrain after ${transform ? 'two transformations' : 'normal use'}`, () => {
				setup('gen9nofieldsinglesgame', item);
				const duration = item ? 8 : 5;
				for (let elapsed = 1; elapsed <= duration; elapsed++) {
					turn(elapsed === 1 ? 'grassyterrain' : transform && elapsed === 2 ? 'heatwave' :
						transform && elapsed === 3 ? 'tailwind' : 'recover');
					if (elapsed < duration) assert.notEqual(battle.field.terrain, '');
				}
				assert.equal(battle.field.terrain, '');
				assert.equal(battle.field.terrainStack.length, 0);
			});
		}
	}

	it('preserves an explicit duration extension through expiry of transformed fields', () => {
		setup();
		turn('grassyterrain'); turn('heatwave'); turn('tailwind');
		battle.field.setTerrainDuration(battle.field.terrainState.duration + 3);
		for (let elapsed = 4; elapsed <= 8; elapsed++) {
			turn();
			assert.equal(battle.field.terrain, elapsed < 8 ? 'grassyterrain' : '');
		}
	});

	it('counts a transformation during residual processing only once that turn', () => {
		setup('gen9nofieldsinglesgame', '', ['grassyterrain', 'heatwave', 'raindance', 'recover']);
		turn('grassyterrain'); turn('heatwave'); turn('raindance');
		assert.equal(battle.field.terrain, 'grassyterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		turn(); turn();
		assert.equal(battle.field.terrain, '');
	});

	it('ages the underlying field correctly when an overlay is removed during a move', () => {
		setup('gen9nofieldsinglesgame', '', ['grassyterrain', 'snowscape', 'steelroller', 'recover']);
		turn('grassyterrain'); turn('snowscape');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		turn('steelroller');
		assert.equal(battle.field.terrain, 'grassyterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		turn(); turn();
		assert.equal(battle.field.terrain, '');
	});

	it('ages the underlying field correctly when its overlay expires at turn end', () => {
		setup('gen9nofieldsinglesgame', 'amplifieldrock', ['grassyterrain', 'snowscape', 'recover']);
		turn('grassyterrain'); turn('snowscape');
		for (let elapsed = 3; elapsed <= 6; elapsed++) turn();
		assert.equal(battle.field.terrain, 'grassyterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		turn(); turn();
		assert.equal(battle.field.terrain, '');
	});

	it('does not spend permanent base-field duration while it is active or covered', () => {
		setup('gen9rockyfield', '', ['snowscape', 'steelroller', 'recover']);
		const base = battle.field.terrainState;
		const duration = base.duration;
		turn(); turn('snowscape'); turn('steelroller');
		turn();
		assert.equal(battle.field.terrainState, base);
		assert.equal(base.duration, duration);
		assert.equal(base.permanent, true);
	});

	for (const [species, ability] of [
		['Groudon-Primal', 'Desolate Land'], ['Kyogre-Primal', 'Primordial Sea'], ['Rayquaza-Mega', 'Delta Stream'],
	]) {
		it(`respects ${ability} when restoring Cold Eclipse after Genesis Supernova`, () => {
			battle = common.createBattle({ formatid: 'gen9coldeclipsefield' }, [
				[{ species: 'Mew', ability: 'Synchronize', item: 'mewniumz', moves: ['psychic', 'recover'] }],
				[
					{ species: 'Blissey', ability: 'Natural Cure', moves: ['softboiled'] },
					{ species, ability, moves: ['protect'] },
				],
			]);
			battle.makeChoices('team 1', 'team 12');
			turn('psychic zmove');
			battle.makeChoices('move recover', 'switch 2');
			for (let elapsed = 3; elapsed <= 5; elapsed++) battle.makeChoices('move recover', 'move protect');
			assert.equal(battle.field.weather, battle.dex.toID(ability));
			assert.equal(battle.field.terrain, ability === 'Desolate Land' ? '' : 'coldeclipseterrain');
			if (ability !== 'Desolate Land') {
				battle.makeChoices('move recover', 'switch 2');
				assert.equal(battle.field.weather, 'hail');
			}
		});
	}

	it('restores Cold Eclipse and its hail normally when no strong weather prevents it', () => {
		setup('gen9coldeclipsefield', 'mewniumz', ['psychic', 'recover']);
		const base = battle.field.terrainState;
		turn('psychic zmove');
		for (let elapsed = 2; elapsed <= 5; elapsed++) turn();
		assert.equal(battle.field.terrainState, base);
		assert.equal(battle.field.weather, 'hail');
	});
});
