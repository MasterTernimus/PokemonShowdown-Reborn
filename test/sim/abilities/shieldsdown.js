'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Shields Down', function () {
	afterEach(function () {
		battle?.destroy();
	});

	it(`should be immune to status until below 50%`, function () {
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Minior', ability: 'shieldsdown', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['glare', 'superfang']},
		]]);
		const minior = battle.p1.active[0];
		battle.makeChoices();
		assert.false(minior.status);
		battle.makeChoices('auto', 'move superfang');
		battle.makeChoices();
		assert.false(minior.status);
		battle.makeChoices('auto', 'move superfang');
		battle.makeChoices();
		assert.equal(minior.status, 'par');
	});

	it(`should be immune to status until below 50% in all formes`, function () {
		battle = common.createBattle({formatid: 'gen9customgame'}, [[
			{species: 'Minior-Blue', ability: 'shieldsdown', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noguard', moves: ['glare', 'superfang']},
		]]);
		const minior = battle.p1.active[0];
		battle.makeChoices();
		assert.false(minior.status);
		battle.makeChoices('auto', 'move superfang');
		battle.makeChoices();
		assert.false(minior.status);
		battle.makeChoices('auto', 'move superfang');
		battle.makeChoices();
		assert.equal(minior.status, 'par');
	});

	it(`keeps Crumbling Shell without removed Shell Armor or Self Repair`, () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Minior', ability: 'shieldsdown', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const minior = battle.p1.active[0];
		const mew = battle.p2.active[0];
		assert(minior.hasAbilityOrPassive('crumblingshell'));
		for (const component of ['shellarmor', 'selfrepair']) assert(!minior.hasAbilityOrPassive(component));
		assert.equal(battle.runEvent('ModifyDamage', mew, minior, battle.dex.moves.get('tackle'), 100), 100);
		minior.hp = Math.floor(minior.maxhp / 2);
		const before = minior.hp;
		battle.fieldEvent('Residual');
		assert.equal(minior.hp, before, 'Removed Self Repair must not heal');
		battle.runEvent('DamagingHit', minior, mew, battle.dex.getActiveMove('tackle'), 1);
		assert(mew.side.sideConditions['stealthrock'], 'Crumbling Shell should set Stealth Rock after a physical hit');
	});
});
