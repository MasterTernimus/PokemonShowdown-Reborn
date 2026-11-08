'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

// Isolate the residual condition from Furnace Engine's separate Fire chip.
function residualSetup(type = 'Normal', item = '') {
	battle = common.gen(8).createBattle([[
		{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Mew', ability: 'No Ability', item, moves: ['splash'] }]]);
	const source = battle.p1.active[0], target = battle.p2.active[0];
	target.setType(type); target.hp = target.maxhp = target.baseMaxhp = 1200;
	assert(target.side.addSideCondition('gmaxvolcalith', source, battle.dex.moves.get('gmaxvolcalith')));
	return target;
}

describe('G-Max Volcalith', function () {
	afterEach(function () {
		battle.destroy();
	});

	it('a real G-Max attack starts Volcalith without attributing other chip to its Rock immunity', () => {
		battle = common.gen(8).createBattle({ gameType: 'doubles' }, [[
			{ species: 'Coalossal', ability: 'No Ability', moves: ['rockthrow'], gigantamax: true }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Boldore', ability: 'No Ability', moves: ['splash'] }]]);
		for (const p of battle.p2.active)p.hp = p.maxhp = p.baseMaxhp = 5000;
		battle.makeChoices('move rockthrow 1 dynamax, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0].species.id, 'coalossalgmax'); assert(battle.p2.sideConditions.gmaxvolcalith);
		assert(battle.log.some(line => line.includes('|-damage|p2a:') && line.includes('G-Max Volcalith')));
		assert(!battle.log.some(line => line.includes('|-damage|p2b:') && line.includes('G-Max Volcalith')));
	});
	it(`should not damage Rock-types`, () => {
		const target = residualSetup('Rock');
		battle.makeChoices();
		assert.fullHP(target);
		assert(target.side.sideConditions.gmaxvolcalith);
	});

	it(`should deal damage for four turns, including the fourth turn`, function () {
		const target = residualSetup();
		for (let turn = 1; turn <= 4; turn++) {
			battle.makeChoices();
			assert.equal(target.hp, 1200 - 200 * turn);
		}
		assert(!target.side.sideConditions.gmaxvolcalith); battle.makeChoices(); assert.equal(target.hp, 400);
	});

	it.skip(`should deal damage alongside Sea of Fire or G-Max Wildfire in the order those field effects were set`, function () {
		battle = common.gen(8).createBattle({gameType: 'doubles'}, [[
			{species: 'Coalossal', item: 'Eject Button', moves: ['rockthrow', 'sleeptalk'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk', 'grasspledge']},
			{species: 'Wynaut', moves: ['sleeptalk', 'firepledge']},
		], [
			{species: 'Blissey', moves: ['sleeptalk']},
			{species: 'Chansey', moves: ['sleeptalk']},
		]]);

		// Set up Volcalith first, then Sea of Fire
		battle.makeChoices('move rockthrow 1 dynamax, move grasspledge -1', 'auto');
		battle.makeChoices('switch 3');
		battle.makeChoices('move firepledge 1, move grasspledge 1', 'auto');

		const log = battle.getDebugLog();
		const pledgeDamageIndex = log.lastIndexOf('|[from] Fire Pledge');
		const volcalithDamageIndex = log.lastIndexOf('|[from] G-Max Volcalith');
		assert(volcalithDamageIndex < pledgeDamageIndex, 'G-Max Volcalith should damage before Sea of Fire, because Volcalith was set up first.');
	});

	it(`should damage Pokemon in order of Speed`, function () {
		battle = common.gen(8).createBattle({gameType: 'doubles'}, [[
			{species: 'Coalossal', moves: ['sleeptalk', 'rockthrow'], gigantamax: true},
			{species: 'Wynaut', moves: ['sleeptalk']},
		], [
			{species: 'Coalossal', moves: ['sleeptalk', 'rockthrow'], gigantamax: true},
			{species: 'Mewtwo', moves: ['sleeptalk', 'trickroom']},
		]]);

		battle.makeChoices('move rockthrow 1 dynamax, move sleeptalk', 'move rockthrow 1 dynamax, move sleeptalk');
		battle.makeChoices('auto', 'move sleeptalk, move trickroom');

		const log = battle.getDebugLog();
		const mewtwoDamagedIndex = log.indexOf('|-damage|p1b: Wynaut');
		const wynautDamagedIndex = log.indexOf('|-damage|p2b: Mewtwo');
		assert(wynautDamagedIndex < mewtwoDamagedIndex, 'Mewtwo should be damaged before Wynaut in normal circumstances.');

		const mewtwoDamagedTRIndex = log.lastIndexOf('|-damage|p1b: Wynaut');
		const wynautDamagedTRIndex = log.lastIndexOf('|-damage|p2b: Mewtwo');
		assert(mewtwoDamagedTRIndex < wynautDamagedTRIndex, 'Wynaut should be damaged before Mewtwo in Trick Room.');
	});

	it(`should deal damage before Black Sludge recovery/damage`, function () {
		const target = residualSetup('Poison', 'Black Sludge'); battle.makeChoices(); assert.equal(target.hp, 1075);
		const damage = battle.log.findIndex(line => line.includes('|-damage|p2a:') && line.includes('G-Max Volcalith'));
		const heal = battle.log.findIndex(line => line.includes('|-heal|p2a:') && line.includes('Black Sludge')); assert(damage >= 0 && heal > damage);
	});

	it(`should deal damage before Grassy Terrain recovery`, function () {
		const target = residualSetup();
		battle.field.setTerrain('grassyterrain', target);
		battle.makeChoices();
		assert.equal(target.hp, 1075);
		const damage = battle.log.findIndex(line => line.includes('|-damage|p2a:') && line.includes('G-Max Volcalith'));
		const heal = battle.log.findIndex(line => line.includes('|-heal|p2a:') && line.includes('Grassy Terrain')); assert(damage >= 0 && heal > damage);
	});
});
