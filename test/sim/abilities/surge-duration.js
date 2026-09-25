'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Surge field and aura duration', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function activate(ability, item, baseField) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Mew', ability: 'No Ability', item, moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		if (baseField) battle.field.startTerrain(baseField);
		battle.p1.active[0].setAbility(ability);
	}

	for (const [ability, terrain] of [
		['electricsurge', 'electricterrain'],
		['grassysurge', 'grassyterrain'],
		['mistysurge', 'mistyterrain'],
		['psychicsurge', 'psychicterrain'],
	]) {
		for (const item of ['', 'amplifieldrock']) {
			const duration = item ? 8 : 5;
			for (const baseField of ['', 'rockyterrain']) {
				it(`${ability} creates a ${duration}-turn ${baseField ? 'Aura' : 'terrain'}`, () => {
					activate(ability, item, baseField);
					assert.equal(battle.field.terrain, baseField || terrain);
					assert.equal(battle.field.auraField, baseField ? terrain : '');
					assert.equal(baseField ? battle.field.auraTurns : battle.field.terrainState.duration, duration);
				});
			}
		}
	}

	for (const item of ['', 'amplifieldrock']) {
		const duration = item ? 8 : 5;
		it(`Forest Surge gives Forest and Grassy Aura ${duration} turns`, () => {
			activate('forestsurge', item, '');
			assert.equal(battle.field.terrain, 'forestterrain');
			assert.equal(battle.field.terrainState.duration, duration);
			assert.equal(battle.field.auraField, 'grassyterrain');
			assert.equal(battle.field.auraTurns, duration);
		});
	}

	it('Moon Veil inherits the eight-turn Misty Aura from Misty Surge', () => {
		activate('moonveil', 'amplifieldrock', 'rockyterrain');
		assert.equal(battle.field.auraField, 'mistyterrain');
		assert.equal(battle.field.auraTurns, 8);
	});

	it('a five-turn Surge Aura expires after five full turns', () => {
		activate('electricsurge', '', 'rockyterrain');
		for (let turn = 1; turn <= 5; turn++) {
			battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.field.auraTurns, Math.max(0, 5 - turn));
		}
		assert.equal(battle.field.auraField, '');
		assert.equal(battle.field.terrain, 'rockyterrain');
	});
});
