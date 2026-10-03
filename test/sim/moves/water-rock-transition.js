'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
describe('Water surface rock cleanup', () => {
	afterEach(() => battle?.destroy());
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Tentacruel', ability: 'No Ability', moves: ['shoreup', 'sludgewave', 'splash'] }],
			[{ species: 'Tentacruel', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.field.changeTerrain('underwaterterrain', battle.p1.active[0]);
		for (const side of battle.sides) {
			assert(side.addSideCondition('stealthrock', battle.p1.active[0]));
			assert(side.sideConditions.stealthrock);
		}
	}
	for (const field of ['watersurfaceterrain', 'murkwatersurfaceterrain']) {
		it('clears both sides on manual transition to ' + field, () => {
			setup();
			battle.field.changeTerrain(field, battle.p1.active[0]);
			for (const side of battle.sides) assert(!side.sideConditions.stealthrock);
			assert.equal(battle.log.filter(line => line.includes('|-sideend|') && line.includes('Stealth Rock')).length, 2);
			assert.equal(battle.log.filter(line => line.includes('pointed stones sank')).length, 2);
		});
	}
	it('clears both sides when Shore Up naturally resurfaces', () => {
		setup(); battle.makeChoices('move shoreup', 'move splash');
		assert.equal(battle.field.terrain, 'watersurfaceterrain');
		for (const side of battle.sides) assert(!side.sideConditions.stealthrock);
	});
	it('clears both sides when Sludge Wave naturally creates Murkwater', () => {
		setup(); battle.makeChoices('move sludgewave', 'move splash');
		battle.makeChoices('move sludgewave', 'move splash');
		assert.equal(battle.field.terrain, 'murkwatersurfaceterrain');
		for (const side of battle.sides) assert(!side.sideConditions.stealthrock);
	});
	it('preserves rocks and hazard layers on unrelated destinations', () => {
		setup(); battle.field.changeTerrain('forestterrain', battle.p1.active[0]);
		for (const side of battle.sides) {
			assert(side.sideConditions.stealthrock);
			for (let i = 0; i < 3; i++) side.addSideCondition('spikes', battle.p1.active[0]);
			for (let i = 0; i < 2; i++) side.addSideCondition('toxicspikes', battle.p1.active[0]);
			side.addSideCondition('stickyweb', battle.p1.active[0]);
		}
		battle.field.changeTerrain('grassyterrain', battle.p1.active[0]);
		for (const side of battle.sides) {
			assert(side.sideConditions.stealthrock);
			assert.equal(side.sideConditions.spikes.layers, 3);
			assert.equal(side.sideConditions.toxicspikes.layers, 2);
			assert(side.sideConditions.stickyweb);
		}
		battle.field.changeTerrain('watersurfaceterrain', battle.p1.active[0]);
		for (const side of battle.sides) {
			assert(!side.sideConditions.stealthrock);
			assert(!side.sideConditions.spikes);
			assert(!side.sideConditions.toxicspikes);
			assert(side.sideConditions.stickyweb);
		}
	});
});
