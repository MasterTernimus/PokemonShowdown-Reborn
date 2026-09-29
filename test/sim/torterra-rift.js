'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Torterra-Rift and Mountain Rift', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('uses the requested stats, typing, and Anomaly Core', () => {
		const rift = Dex.species.get('Torterra-Rift');
		assert.deepEqual(rift.types, ['Ground', 'Ice']);
		assert.deepEqual(rift.baseStats, {hp: 150, atk: 80, def: 100, spa: 70, spd: 110, spe: 40});
		assert.equal(rift.bst, 550);
		assert.equal(rift.abilities[0], 'Mountain Rift');
		assert.equal(Dex.items.get('Anomaly Core').megaStone.Torterra, rift.name);
		assert(Dex.species.getLearnsetData('torterra').learnset.mountaingale.includes('9M'));
		assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([
			{species: 'Torterra', item: 'Anomaly Core', moves: ['Earthquake', 'Sand Tomb', 'Mountain Gale', 'Stone Edge']},
			{species: 'Mew', moves: ['Splash']},
		]), null);
	});

	it('locks all four moves and creates a five-turn Mountain on Rift Evolution', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Anomaly Core', moves: ['splash', 'protect']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Torterra-Rift');
		battle.makeChoices('move splash mega', 'move splash');
		const torterra = battle.p1.active[0];
		assert.equal(torterra.species.id, 'torterrarift');
		assert.deepEqual(torterra.getTypes(), ['Ground', 'Ice']);
		assert.deepEqual(torterra.moveSlots.map(slot => slot.id), ['earthquake', 'sandtomb', 'mountaingale', 'stoneedge']);
		assert(torterra.hasAbility('shellarmor'));
		assert(torterra.hasAbility('selfsufficient'));
		assert.equal(torterra.getAbility().onCriticalHit, false);
		assert.equal(battle.runEvent('SourceModifyDamage', torterra, battle.p2.active[0],
			battle.dex.getActiveMove('tackle'), 100), 80);
		assert.equal(battle.field.terrain, 'mountainterrain');
		assert.equal(battle.field.terrainState.duration, 4);
		assert.match(battle.log.join('\n'), /created Mountain Field for 5 turns/);
		assert.match(battle.log.join('\n'), /\|move\|p1a: Torterra\|Earthquake\|/,
			'the selected first slot uses Earthquake on the Rift Evolution turn');
		assert(!battle.log.some(line => line.startsWith('|cant|p1a: Torterra|nopp|')));
	});

	it('at half HP starts Gravity and resets Mountain to five turns once', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Anomaly Core', moves: ['splash', 'protect', 'rockslide', 'earthquake']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const torterra = battle.p1.active[0];
		battle.field.setTerrainDuration(1);
		torterra.hp = Math.floor(torterra.maxhp / 2) + 1;
		battle.runEvent('Update', torterra);
		assert.equal(battle.field.getPseudoWeather('gravity'), null);
		torterra.hp--;
		battle.runEvent('Update', torterra);
		assert(battle.field.getPseudoWeather('gravity'));
		assert.equal(battle.field.terrain, 'mountainterrain');
		assert.equal(battle.field.terrainState.duration, 5);
		assert.match(battle.log.join('\n'), /Mountain Rift reacted at half HP/);
		assert.match(battle.log.join('\n'), /refreshed Mountain Field for 5 turns/);
		const triggers = battle.log.filter(line => line.includes('reacted at half HP')).length;
		battle.runEvent('Update', torterra);
		assert.equal(battle.log.filter(line => line.includes('reacted at half HP')).length, triggers);
	});

	it('responds to actual damage and heals through Self Sufficient', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Torterra', item: 'Anomaly Core', moves: ['splash', 'protect']},
		], [{species: 'Mew', moves: ['tackle', 'splash', 'swordsdance']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const torterra = battle.p1.active[0];
		torterra.hp = Math.floor(torterra.maxhp / 2) + 1;
		battle.makeChoices('move 2', 'move tackle');
		assert(battle.field.getPseudoWeather('gravity'), 'Gravity starts after a real hit');
		assert.equal(battle.field.terrain, 'mountainterrain');
		assert.equal(battle.log.filter(line => line.includes('reacted at half HP')).length, 1);
		const hpAfterHit = torterra.hp;
		battle.makeChoices('move 2', 'move swordsdance');
		assert(torterra.hp > hpAfterHit, 'Self Sufficient heals at the end of the turn');
	});
});
