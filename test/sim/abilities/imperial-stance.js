'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function start(species = 'Mew') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species, ability: 'No Ability', moves: ['tackle', 'kingsshield']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return battle.p1.active[0];
}
describe('Imperial Mandate and Stance Change field modes', () => {
	afterEach(() => battle?.destroy());
	it('uses defensive mode at exactly 50% and removes it immediately below', () => {
		const mon = start(); battle.field.startTerrain('fairytaleterrain');
		mon.maxhp = 400; mon.hp = 200; mon.setAbility('imperialmandate');
		assert.equal(mon.boosts.def, 1); assert.equal(mon.boosts.spd, 1);
		mon.hp = 199; battle.eachEvent('Update');
		assert.equal(mon.boosts.def, 0); assert.equal(mon.boosts.spd, 0);
	});
	it('G-Max Aegislash gains the field defense stages on ability activation', () => {
		battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [
			[{species: 'Aegislash', ability: 'No Ability', gigantamax: true, moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1'); battle.field.startTerrain('fairytaleterrain');
		battle.makeChoices('move splash dynamax', 'move splash');
		const mon = battle.p1.active[0];
		assert.equal(mon.ability, 'imperialmandate');
		assert.equal(mon.boosts.def, 1); assert.equal(mon.boosts.spd, 1);
	});
	for (const boosted of [false, true]) {
		for (const low of [false, true]) {
			it(`checks power, Speed and damage reduction: boosted=${boosted}, low=${low}`, () => {
				const mon = start(), foe = battle.p2.active[0];
				battle.field.startTerrain(boosted ? 'fairytaleterrain' : 'rockyterrain');
				mon.hp = low ? Math.floor(mon.maxhp / 2) : mon.maxhp;
				const speed = mon.getStat('spe'); mon.setAbility('imperialmandate');
				assert.equal(mon.getStat('spe'), speed * (low ? 2 : 1));
				for (const id of ['tackle', 'swift']) {
					const move = battle.dex.getActiveMove(id);
					assert.equal(battle.runEvent('BasePower', mon, foe, move, 100), boosted ? (low ? 150 : 100) : (low ? 120 : 240));
					assert.equal(battle.runEvent('ModifyDamage', foe, mon, move, 100), boosted ? 100 : 80);
				}
			});
		}
	}
	for (const field of ['fairytaleterrain', 'chessboardterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain']) {
		it(`${field}: tracks defense mode through HP and field changes without stacking`, () => {
			const mon = start(); battle.field.startTerrain(field); mon.setAbility('imperialmandate');
			assert.equal(mon.boosts.def, 1); assert.equal(mon.boosts.spd, 1);
			battle.eachEvent('Update'); battle.eachEvent('TerrainChange');
			assert.equal(mon.boosts.def, 1);
			mon.hp = Math.floor(mon.maxhp / 2); battle.eachEvent('Update');
			assert.equal(mon.boosts.def, 0); assert.equal(mon.boosts.spd, 0);
			battle.eachEvent('Update'); assert.equal(mon.boosts.def, 0);
			battle.field.startTerrain('rockyterrain'); battle.eachEvent('TerrainChange'); battle.field.changeTerrain(field, mon);
			assert.equal(mon.boosts.def, 0); assert.equal(mon.boosts.spd, 0);
			mon.hp = mon.maxhp; battle.eachEvent('Update');
			assert.equal(mon.boosts.def, 1); assert.equal(mon.boosts.spd, 1);
			battle.field.startTerrain('rockyterrain'); battle.eachEvent('TerrainChange');
			assert.equal(mon.boosts.def, 0); assert.equal(mon.boosts.spd, 0);
		});
	}
	for (const field of ['fairytaleterrain', 'chessboardterrain']) {
		it(`${field}: Stance Change swaps both offensive and defensive stats`, () => {
			const mon = start('Aegislash'); battle.field.startTerrain(field); mon.setAbility('stancechange', null, null, true);
			assert.equal(mon.boosts.def, 1); assert.equal(mon.boosts.spd, 1);
			battle.makeChoices('move 1', 'move 1');
			assert.equal(mon.species.name, 'Aegislash-Blade');
			for (const stat of ['atk', 'spa']) assert.equal(mon.boosts[stat], 1);
			for (const stat of ['def', 'spd']) assert.equal(mon.boosts[stat], 0);
			battle.makeChoices('move 2', 'move 1');
			assert.equal(mon.species.name, 'Aegislash');
			for (const stat of ['atk', 'spa']) assert.equal(mon.boosts[stat], 0);
			for (const stat of ['def', 'spd']) assert.equal(mon.boosts[stat], 1);
		});
	}
});
