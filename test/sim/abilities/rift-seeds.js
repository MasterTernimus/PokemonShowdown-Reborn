'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {adaptiveMemory} = require('../../../dist/sim/adaptive-cycle');
let battle;

function setup(field = 'rockyterrain', item = '', ability = 'riftherald') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability: 'noability', item, moves: ['riftopening', 'splash', 'trickroom', 'darkpulse']}],
		[{species: 'Mew', ability: 'noability', moves: ['splash', 'tackle', 'riftopening']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	if (field) battle.field.startTerrain(field);
	const p = battle.p1.active[0], q = battle.p2.active[0];
	for (const pokemon of [p, q]) pokemon.hp = pokemon.maxhp = pokemon.baseMaxhp = 10000;
	battle.randomizer = n => n;
	const weather = battle.field.weather;
	if (ability) p.setAbility(ability);
	return [p, q, weather];
}
function use(pokemon, id) {
	battle.actions.runMove(Dex.getActiveMove(id), pokemon);
}

describe('Rift Herald and Rift Aura', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('resolves the older Rift Seeds name to the released Rift Herald identity', () => {
		assert.equal(Dex.abilities.get('Rift Seeds').id, 'riftherald');
		assert.equal(Dex.abilities.get('Rift Herald').name, 'Rift Herald');
		assert(!Dex.abilities.all().some(ability => ability.id === 'riftseeds'));
	});
	for (const field of ['', 'rockyterrain', 'icyterrain', 'volcanicterrain', 'coldeclipseterrain', 'infernaleclipseterrain']) {
		for (const [item, turns] of [['', 5], ['amplifieldrock', 8]]) {
			it(`uses Seed entry rules over ${field || 'no field'} with ${item || 'no item'}`, () => {
				const [, , weather] = setup(field, item);
				assert.equal(battle.field.terrain, field || 'rifteclipseterrain');
				assert.equal(battle.field.auraField, field ? 'riftaura' : '');
				assert.equal(field ? battle.field.auraTurns : battle.field.terrainState.duration, turns);
				assert.equal(battle.field.weather, weather);
			});
		}
	}
	for (const field of ['dragonsdenterrain', 'newworldterrain', 'underwaterterrain', 'midnightzoneterrain', 'flowergarden1']) {
		it(`respects Aura restrictions on ${field}`, () => {
			setup(field);
			assert.equal(battle.field.terrain, field);
			assert.equal(battle.field.auraField, '');
		});
	}
	it('does not refresh an existing Aura or change its source on entry', () => {
		const [p, q] = setup('rockyterrain', '', '');
		battle.field.setAura('riftaura', 2, q, Dex.moves.get('splash'));
		const state = battle.field.auraState;
		p.setAbility('riftherald');
		assert.equal(battle.field.auraState, state);
		assert.equal(battle.field.auraState.source, q);
		assert.equal(battle.field.auraTurns, 2);
		assert.equal(battle.field.terrain, 'rockyterrain');
	});
	it('does not refresh or overlay an existing full Rift Eclipse', () => {
		const [p] = setup('rifteclipseterrain', '', '');
		battle.field.setTerrainDuration(2);
		p.setAbility('riftherald');
		assert.equal(battle.field.terrainState.duration, 2);
		assert.equal(battle.field.auraField, '');
	});
	for (const field of ['rockyterrain', 'coldeclipseterrain', 'infernaleclipseterrain']) {
		it(`develops the Aura over ${field} using its remaining turns`, () => {
			const [p] = setup(field, 'amplifieldrock');
			battle.field.auraTurns = 3;
			use(p, 'riftopening');
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
			assert.equal(battle.field.auraField, '');
			assert.equal(battle.field.terrainState.duration, 3);
			assert.equal(battle.log.filter(line => line.includes('developed the Rift Aura')).length, 1);
		});
	}
	it('develops an existing Aura over no field rather than refreshing it on entry', () => {
		const [p] = setup('', 'amplifieldrock', '');
		battle.field.setAura('riftaura', 2, p, Dex.moves.get('splash'));
		p.setAbility('riftherald');
		assert.equal(battle.field.terrain, '');
		use(p, 'riftopening');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.terrainState.duration, 2);
	});
	for (const lock of ['neutralization', 'pulseblockade', 'badseeds', 'ashenseeds']) {
		it(`keeps the Aura and its clock when development is blocked by ${lock}`, () => {
			const field = lock === 'badseeds' ? 'coldeclipseterrain' : lock === 'ashenseeds' ? 'infernaleclipseterrain' : 'rockyterrain';
			const [p, q] = setup(field);
			q.setAbility(lock);
			const previousField = battle.field.terrain;
			const state = battle.field.auraState;
			battle.field.auraTurns = 3;
			use(p, 'riftopening');
			assert.equal(battle.field.terrain, previousField);
			assert.equal(battle.field.auraField, 'riftaura');
			assert.equal(battle.field.auraState, state);
			assert.equal(battle.field.auraTurns, 3);
		});
	}
	it('can create an Aura through Neutralization but cannot develop it', () => {
		const [p, q] = setup('rockyterrain', '', '');
		q.setAbility('neutralization');
		p.setAbility('riftherald');
		assert.equal(battle.field.auraField, 'riftaura');
		use(p, 'riftopening');
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraField, 'riftaura');
	});
	it('does not create an Aura through Pulse Blockade', () => {
		const [p, q] = setup('rockyterrain', '', '');
		q.setAbility('pulseblockade');
		p.setAbility('riftherald');
		assert.equal(battle.field.auraField, '');
	});
	for (const field of ['', 'rockyterrain']) {
		it(`does not set a field or Aura while suppressed over ${field || 'no field'}`, () => {
			const [p, q] = setup(field, '', '');
			p.addVolatile('gastroacid', q);
			p.setAbility('riftherald');
			assert.equal(p.ability, 'riftherald');
			assert.equal(battle.field.terrain, field);
			assert.equal(battle.field.auraField, '');
		});
	}
	it('does not bypass Chessboard promotion restrictions with Rift Opening', () => {
		const [p] = setup('chessboardterrain');
		const state = battle.field.auraState;
		use(p, 'riftopening');
		assert.equal(battle.field.terrain, 'chessboardterrain');
		assert.equal(battle.field.auraState, state);
		assert.equal(battle.field.auraTurns, 5);
	});
	it('does not automatically promote through a second setter or ordinary Gravity', () => {
		const [p, q] = setup();
		battle.field.auraTurns = 3;
		q.setAbility('riftherald');
		assert.equal(battle.field.promoteAura(p, Dex.moves.get('gravity')), false);
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraTurns, 3);
	});
	it('lets a Pokémon without Rift Herald create and develop Rift Aura with Rift Opening', () => {
		const [p] = setup('rockyterrain', '', '');
		use(p, 'riftopening');
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraField, 'riftaura');
		battle.field.auraTurns = 3;
		use(p, 'riftopening');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.terrainState.duration, 3);
	});
	it('boosts Dark and Ghost attacks and weakens Fairy attacks for both sides', () => {
		const [p, q] = setup();
		for (const [source, target] of [[p, q], [q, p]]) {
			for (const [move, expected] of [['darkpulse', 1.3], ['shadowball', 1.2], ['moonblast', 0.75], ['tackle', 1]]) {
				assert.equal(battle.field.auraPowerMultiplier(source, target, Dex.getActiveMove(move)), expected, move);
				assert.equal(battle.runEvent('BasePower', source, target, Dex.getActiveMove(move), 100), 100 * expected, move);
			}
		}
	});
	it('does not stack the full Rift field’s matching type boosts and stronger Fairy penalty', () => {
		const [p, q] = setup('rifteclipseterrain');
		battle.field.setAura('riftaura', 3, p, Dex.moves.get('splash'));
		for (const [move, power] of [['darkpulse', 150], ['shadowball', 120], ['moonblast', 50]]) {
			assert.equal(battle.field.auraPowerMultiplier(p, q, Dex.getActiveMove(move)), 1);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(move), 100), power, move);
		}
	});
	for (const field of ['rifteclipseterrain', 'infernaleclipseterrain']) {
		it(`halves Fairy power on ${field} without requiring an Aura`, () => {
			const [p, q] = setup(field, '', '');
			assert.equal(battle.field.auraField, '');
			for (const [source, target] of [[p, q], [q, p]]) {
				assert.equal(battle.runEvent('BasePower', source, target, Dex.getActiveMove('moonblast'), 400), 200);
			}
		});
		for (const adapted of ['none', 'source', 'target']) {
			it(`combines Fairy penalties on ${field} with ${adapted} adapted to the base field`, () => {
				const [p, q] = setup(field, '', '');
				battle.field.setAura('riftaura', 3, p, Dex.moves.get('splash'));
				if (adapted !== 'none') {
					const pokemon = adapted === 'source' ? p : q;
					pokemon.setAbility('adaptivecycle');
					adaptiveMemory(pokemon).fields[field] = {stage: 3, turn: battle.turn};
				}
				// Only the source's adaptation removes the base-field penalty. The independent Aura remains.
				assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('moonblast'), 400), adapted === 'source' ? 300 : 200);
			});
		}
	}
	it('applies the Aura Fairy penalty to Infernal Spirit Break while retaining its Dark subtype bonus', () => {
		const [p, q] = setup('infernaleclipseterrain');
		for (const [source, target] of [[p, q], [q, p]]) {
			const move = Dex.getActiveMove('spiritbreak');
			battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, move, source, target);
			assert.deepEqual(move.types, ['Fairy', 'Dark']);
			assert.equal(battle.field.auraPowerMultiplier(source, target, move), 0.75);
			assert.equal(battle.runEvent('BasePower', source, target, move, 400), 450);
		}
	});
	for (const [field, move] of [['bewitchedwoodsterrain', 'darkpulse'], ['hauntedterrain', 'shadowball'], ['starlightarenaterrain', 'darkpulse']]) {
		it(`shares the matching base-field bonus on ${field}`, () => {
			const [p, q] = setup(field);
			assert.equal(battle.field.auraPowerMultiplier(p, q, Dex.getActiveMove(move)), 1);
		});
	}
	it('applies its Dark bonus when weather disables Starlight’s bonus', () => {
		const [p, q] = setup('starlightarenaterrain');
		battle.field.setWeather('raindance', p, Dex.moves.get('raindance'));
		assert.equal(battle.field.auraPowerMultiplier(p, q, Dex.getActiveMove('darkpulse')), 1.3);
	});
	it('does not give full-field defenses, sleep damage, or extended Rooms', () => {
		const [p, q] = setup('rockyterrain', '', '');
		p.setType('Ghost');
		const def = p.getStat('def'), spd = p.getStat('spd');
		p.setAbility('riftherald');
		assert.equal(p.getStat('def'), def);
		assert.equal(p.getStat('spd'), spd);
		q.setStatus('slp');
		const hp = q.hp;
		battle.runEvent('Residual', q);
		assert.equal(q.hp, hp);
		use(p, 'trickroom');
		assert.equal(battle.field.pseudoWeather.trickroom.duration, 5);
	});
	it('expires without changing the underlying field or weather', () => {
		const [p] = setup();
		battle.field.setWeather('sandstorm', p, Dex.moves.get('sandstorm'));
		battle.field.auraTurns = 1;
		battle.field.tickAura();
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.weather, 'sandstorm');
	});
});
