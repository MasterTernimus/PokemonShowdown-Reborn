'use strict';

const assert = require('../../assert');
const common = require('../../common');
let battle;
const rooms = ['trickroom', 'magicroom', 'wonderroom'];

function start(terrain) {
	battle = common.createBattle({formatid: 'gen9customgame'}, [
		[{species: 'Mew', ability: 'noability', moves: ['splash', 'flash', 'darkpulse']}],
		[{species: 'Mew', ability: 'noability', moves: ['splash']}],
	]);
	const source = battle.p1.active[0];
	assert(battle.field.setTerrain(terrain, source));
	for (const side of battle.sides) assert(side.addSideCondition('tailwind', source));
	for (const room of rooms) assert(battle.field.addPseudoWeather(room, source));
	assert(battle.p1.addSideCondition('reflect', source));
	return source;
}

function checkEffects(present) {
	for (const side of battle.sides) assert.equal(!!side.getSideCondition('tailwind'), present);
	for (const room of rooms) assert.equal(!!battle.field.getPseudoWeather(room), present);
	assert(battle.p1.getSideCondition('reflect'), 'Unrelated effects must remain');
	if (!present) {
		for (const name of ['Trick Room', 'Magic Room', 'Wonder Room']) {
			assert(battle.log.some(line => line.includes(`|-fieldend|move: ${name}`)), name);
		}
		assert.equal(battle.log.filter(line => line.includes('|-sideend|') && line.includes('Tailwind')).length, 2);
	}
}

describe('Water field transition room cleanup', () => {
	afterEach(() => battle?.destroy());
	for (const [from, to] of [
		['watersurfaceterrain', 'underwaterterrain'],
		['murkwatersurfaceterrain', 'underwaterterrain'],
		['underwaterterrain', 'watersurfaceterrain'],
		['underwaterterrain', 'murkwatersurfaceterrain'],
		['underwaterterrain', 'midnightzoneterrain'],
		['midnightzoneterrain', 'underwaterterrain'],
		['watersurfaceterrain', 'icyterrain'],
	]) {
		it(`clears Tailwind and rooms on ${from} -> ${to}`, () => {
			const source = start(from);
			assert(battle.field.changeTerrain(to, source));
			checkEffects(false);
		});
	}
	for (const terrain of ['watersurfaceterrain', 'murkwatersurfaceterrain']) {
		it(`clears effects when a generated field replaces ${terrain}`, () => {
			const source = start(terrain);
			assert(battle.field.setFieldOrAura('grassyterrain', 5, source, battle.dex.moves.get('bloomdoom'), true));
			assert.equal(battle.field.terrain, 'grassyterrain');
			checkEffects(false);
		});
		it(`preserves effects when an Aura is created over ${terrain}`, () => {
			const source = start(terrain);
			assert(battle.field.setTerrain('grassyterrain', source));
			assert.equal(battle.field.terrain, terrain);
			assert.equal(battle.field.auraField, 'grassyterrain');
			checkEffects(true);
		});
		it(`clears effects when ${terrain} expires`, () => {
			start(terrain);
			assert(battle.field.clearTerrain());
			checkEffects(false);
		});
	}
	it('preserves effects on rejected transitions and clearing', () => {
		const source = start('midnightzoneterrain');
		assert.equal(battle.field.changeTerrain('grassyterrain', source), false);
		assert.equal(battle.field.setTerrain('grassyterrain', source), false);
		assert.equal(battle.field.clearTerrain(), false);
		checkEffects(true);
	});
	for (const [from, move, to] of [
		['midnightzoneterrain', 'flash', 'underwaterterrain'],
		['underwaterterrain', 'darkpulse', 'midnightzoneterrain'],
	]) {
		it(`clears effects during a turn using ${move}`, () => {
			start(from);
			battle.makeChoices(`move ${move}`, 'move splash');
			assert.equal(battle.field.terrain, to);
			checkEffects(false);
		});
	}
	it('preserves effects when the field does not change', () => {
		const source = start('watersurfaceterrain');
		assert.equal(battle.field.changeTerrain('watersurfaceterrain', source), false);
		assert.equal(battle.field.setTerrain('watersurfaceterrain', source), false);
		checkEffects(true);
	});
	it('preserves effects when leaving an unrelated field', () => {
		const source = start('grassyterrain');
		assert(battle.field.changeTerrain('watersurfaceterrain', source));
		checkEffects(true);
	});
	for (const [from, to] of [
		['watersurfaceterrain', 'underwaterterrain'],
		['underwaterterrain', 'midnightzoneterrain'],
		['midnightzoneterrain', 'underwaterterrain'],
	]) {
		it(`removes all existing hazards on ${from} -> ${to} permanently`, () => {
			const source = start(from);
			const hazards = ['spikes', 'toxicspikes', 'stealthrock', 'stickyweb'];
			for (const side of battle.sides) {
				for (const hazard of hazards) assert(side.addSideCondition(hazard, source));
			}
			assert(battle.field.changeTerrain(to, source));
			for (const side of battle.sides) {
				for (const hazard of hazards) {
					assert.equal(!!side.getSideCondition(hazard), false);
					assert(battle.log.some(line => line.startsWith(`|-sideend|${side.id}:`) &&
						line.includes(battle.dex.conditions.get(hazard).name)));
				}
			}
			assert(battle.field.changeTerrain(from, source));
			for (const side of battle.sides) {
				for (const hazard of hazards) assert.equal(!!side.getSideCondition(hazard), false);
			}
			checkEffects(false);
		});
	}
});
