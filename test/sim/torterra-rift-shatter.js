'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');

describe('Torterra-Rift-Shatter', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function startRift() {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Anomaly Core', moves: ['splash', 'protect']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		return battle.p1.active[0];
	}

	it('has the requested stats, type, ability, and total', () => {
		const shatter = Dex.species.get('Torterra-Rift-Shatter');
		assert.deepEqual(shatter.types, ['Grass', 'Fire']);
		assert.deepEqual(shatter.baseStats, {hp: 180, atk: 120, def: 100, spa: 40, spd: 100, spe: 50});
		assert.equal(shatter.bst, 590);
		assert.equal(shatter.abilities[0], 'Desert Rift');
		assert.equal(Dex.species.get('Torterrea-Rift-Shatter').id, shatter.id);
	});

	it('revives once from the faint queue with a full reset and new field and moves', () => {
		const torterra = startRift();
		torterra.setStatus('brn');
		battle.boost({atk: 2, def: -1}, torterra);
		torterra.addVolatile('confusion');
		const pokemonLeft = torterra.side.pokemonLeft;
		torterra.faint(battle.p2.active[0], battle.dex.moves.get('tackle'));
		battle.faintMessages();
		assert.equal(torterra.species.id, 'torterrariftshatter');
		assert.equal(torterra.hp, torterra.maxhp);
		assert.equal(torterra.status, '');
		assert.deepEqual(Object.values(torterra.boosts), [0, 0, 0, 0, 0, 0, 0]);
		assert.deepEqual(Object.keys(torterra.volatiles), []);
		assert.equal(torterra.fainted, false);
		assert.equal(torterra.faintQueued, false);
		assert.equal(torterra.isActive, true);
		assert.equal(torterra.side.pokemonLeft, pokemonLeft);
		assert.equal(torterra.side.totalFainted, 0);
		assert.deepEqual(torterra.moveSlots.map(slot => slot.id), ['heatcrash', 'heavyslam', 'earthquake', 'stoneedge']);
		assert.equal(battle.field.terrain, 'desertterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		assert.equal(battle.field.weather, 'sandstorm');
		assert(torterra.hasAbility(['sandforce', 'sandstream', 'heavymetal']));
		assert.equal(torterra.getWeight(), 6200);
		assert.equal(battle.runEvent('Damage', torterra, battle.p2.active[0],
			battle.dex.getActiveMove('tackle'), 100), 50);
		assert.match(battle.log.join('\n'), /Rift shattered and revived it/);
		assert.match(battle.log.join('\n'), /\|-curestatus\|p1a: Torterra\|brn\|/);
		assert.match(battle.log.join('\n'), /\|-end\|p1a: Torterra\|confusion\|\[silent\]/);
		assert(!battle.log.some(line => line.startsWith('|faint|p1a: Torterra')));
	});

	it('triggers from lethal battle damage and persists when switched out', () => {
		const torterra = startRift();
		battle.damage(torterra.hp, torterra, battle.p2.active[0], battle.dex.getActiveMove('tackle'));
		battle.faintMessages();
		assert.equal(torterra.species.id, 'torterrariftshatter');
		assert.equal(torterra.baseSpecies.id, 'torterrariftshatter');
		torterra.clearVolatile();
		assert.equal(torterra.species.id, 'torterrariftshatter');
		assert.equal(torterra.getAbility().id, 'desertrift');
	});

	it('does not revive a second time', () => {
		const torterra = startRift();
		torterra.faint();
		battle.faintMessages();
		torterra.faint();
		battle.faintMessages();
		assert.equal(torterra.fainted, true);
		assert.equal(torterra.side.pokemonLeft, 0);
	});
});
