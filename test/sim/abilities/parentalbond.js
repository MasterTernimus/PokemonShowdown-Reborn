'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;
let damages;
function referenceDamage(choice) {
	const control = common.createBattle([[
		{species: 'Kangaskhan', ability: 'toughclaws', item: 'electriumz', moves: ['thunderpunch', 'doublekick']},
	], [{species: 'Aggron', ability: 'battlearmor', moves: ['rest']}]]);
	try {
		control.randomizer = damage => damage;
		const hits = [];
		control.onEvent('ModifyDamage', control.format, -9, damage => { hits.push(damage); });
		control.makeChoices(choice, 'move rest');
		return hits;
	} finally {
		control.destroy();
	}
}

describe('Parental Bond', function () {
	beforeEach(function () {
		battle = common.createBattle([[
			{species: 'Kangaskhan', ability: 'parentalbond', item: 'electriumz', moves: ['thunderpunch', 'doublekick']},
		], [
			{species: 'Aggron', ability: 'battlearmor', moves: ['rest']},
		]]);

		battle.randomizer = damage => damage;
		damages = [];
		battle.onEvent('ModifyDamage', battle.format, -9, function (damage, attacker, defender, move) {
			damages.push(damage);
		});
	});

	afterEach(function () {
		battle.destroy();
	});

	it(`should cause single-hit attacks to strike twice, with the second hit dealing the custom 0.8x damage`, function () {
		battle.makeChoices('move thunderpunch', 'move rest');
		assert.equal(damages.length, 2);
		const [first] = referenceDamage('move thunderpunch');
		assert.equal(damages[0], first);
		assert(Math.abs(damages[1] - first * 0.8) <= 2);
	});

	it(`should not have any effect on moves with multiple hits`, function () {
		battle.makeChoices('move doublekick', 'move rest');
		assert.deepEqual(damages, referenceDamage('move doublekick'));
	});

	it(`should not have any effect Z-Moves`, function () {
		battle.makeChoices('move thunderpunch zmove', 'move rest');
		assert.equal(damages.length, 1);
		assert.deepEqual(damages, referenceDamage('move thunderpunch zmove'));
	});
});

common.describeGen(6, 'Parental Bond [Gen 6]', function () {
	beforeEach(function () {
		battle = common.gen(6).createBattle([[
			{species: 'Kangaskhan', ability: 'parentalbond', item: 'electriumz', moves: ['thunderpunch', 'doublekick']},
		], [
			{species: 'Aggron', ability: 'battlearmor', moves: ['rest']},
		]]);

		damages = [];
		battle.onEvent('ModifyDamage', battle.format, -9, function (damage, attacker, defender, move) {
			damages.push(damage);
		});
	});

	afterEach(function () {
		battle.destroy();
	});

	it(`should cause single-hit attacks to strike twice, with the second hit dealing 0.5x damage`, function () {
		battle.makeChoices('move thunderpunch', 'move rest');
		assert.bounded(damages[0], [31, 37]);
		assert.bounded(damages[1], [15, 18]);
	});

	it(`should not have any effect on moves with multiple hits`, function () {
		battle.makeChoices('move doublekick', 'move rest');
		assert.bounded(damages[0], [52, 64]);
		assert.bounded(damages[1], [52, 64]);
	});
});
