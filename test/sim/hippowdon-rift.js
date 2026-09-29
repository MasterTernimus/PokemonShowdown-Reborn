'use strict';

const assert = require('assert').strict;
const common = require('../common');
const {Dex} = require('../../dist/sim');
const {TeamValidator} = require('../../dist/sim/team-validator');

describe('Hippowdon-Rift and Rift Eater', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	it('has the requested Anomaly Core form and a legal Sludge Wave', () => {
		const rift = Dex.species.get('Hippowdon-Rift');
		assert.deepEqual(rift.types, ['Ground', 'Poison']);
		assert.deepEqual(rift.baseStats, {hp: 118, atk: 135, def: 150, spa: 120, spd: 100, spe: 27});
		assert.equal(rift.bst, 650);
		assert.equal(rift.abilities[0], 'Rift Eater');
		assert.equal(Dex.items.get('Anomaly Core').megaStone.Hippowdon, rift.name);
		assert.equal(Dex.species.get('Hippodown-Rift').name, rift.name);
		assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([
			{species: 'Hippowdon', item: 'Anomaly Core', moves: ['Earthquake', 'Slack Off', 'Protect', 'Sludge Wave']},
			{species: 'Mew', moves: ['Splash']},
		]), null);
	});

	it('sets sand and enforces Sludge Wave in the fourth slot on Rift Evolution', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Hippowdon', ability: 'Ruin Jaw', item: 'Anomaly Core', moves: ['splash', 'earthquake', 'slackoff', 'protect']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Hippowdon-Rift');
		battle.makeChoices('move splash mega', 'move splash');
		const hippo = battle.p1.active[0];
		assert.equal(hippo.species.id, 'hippowdonrift');
		assert.deepEqual(hippo.getTypes(), ['Ground', 'Poison']);
		assert.equal(hippo.moveSlots[3].id, 'sludgewave');
		assert.equal(hippo.baseMoveSlots[3].id, 'sludgewave');
		assert(hippo.hasAbility('accumulation'));
		assert(hippo.hasAbility('sandstream'));
		assert(battle.field.isWeather('sandstorm'));
		assert(hippo.volatiles.stockpile, 'Accumulation stockpiles at turn end');
	});

	it('at half HP announces the transformation and refreshes missing sand', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Hippowdon', item: 'Anomaly Core', moves: ['splash', 'earthquake', 'slackoff']},
		], [{species: 'Mew', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const hippo = battle.p1.active[0];
		assert.equal(hippo.moveSlots[3].id, 'sludgewave');
		battle.field.clearWeather();
		hippo.hp = Math.floor(hippo.maxhp / 2) + 1;
		battle.runEvent('Update', hippo);
		assert.deepEqual(hippo.getTypes(), ['Ground', 'Poison']);
		hippo.hp--;
		battle.runEvent('Update', hippo);
		assert.deepEqual(hippo.getTypes(), ['Ground', 'Fire']);
		assert.equal(battle.field.terrain, 'desertterrain');
		assert(battle.field.isWeather('sandstorm'));
		assert.equal(hippo.moveSlots[3].id, 'heatwave');
		assert.equal(hippo.baseMoveSlots[3].id, 'heatwave');
		assert.match(battle.log.join('\n'), /changed from Ground\/Poison to Ground\/Fire/);
		assert.match(battle.log.join('\n'), /fourth move changed from Sludge Wave to Heat Wave/);
		assert.match(battle.log.join('\n'), /summoned a new sandstorm/);
		const announcements = battle.log.filter(line => line.includes('awakened at half HP'));
		battle.runEvent('Update', hippo);
		assert.equal(battle.log.filter(line => line.includes('awakened at half HP')).length, announcements.length);
	});

	it('changes during battle damage and retains its Fire type after switching back', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Hippowdon', item: 'Anomaly Core', moves: ['splash', 'earthquake', 'slackoff', 'sludgewave']},
			{species: 'Pikachu', moves: ['splash']},
		], [{species: 'Mew', moves: ['tackle', 'splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const hippo = battle.p1.active[0];
		hippo.hp = Math.floor(hippo.maxhp / 2) + 1;
		battle.makeChoices('move splash', 'move tackle');
		assert.deepEqual(hippo.getTypes(), ['Ground', 'Fire']);
		assert.equal(hippo.moveSlots[3].id, 'heatwave');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(battle.p1.active[0], hippo);
		assert.deepEqual(hippo.getTypes(), ['Ground', 'Fire']);
		assert.equal(hippo.moveSlots[3].id, 'heatwave');
	});
});
