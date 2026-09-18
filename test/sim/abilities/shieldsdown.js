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

	it(`includes Shell Armor, Self Repair, and Crumbling Shell`, function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Minior', ability: 'shieldsdown', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const minior = battle.p1.active[0];
		const mew = battle.p2.active[0];
		for (const component of ['shellarmor', 'selfrepair', 'crumblingshell']) assert(minior.hasAbility(component));
		assert.equal(battle.runEvent('SourceModifyDamage', minior, mew, battle.dex.moves.get('tackle'), 100), 80);
		minior.hp = Math.floor(minior.maxhp / 2);
		const before = minior.hp;
		battle.singleEvent('Residual', minior.getAbility(), minior.abilityState, minior);
		assert(minior.hp > before, 'Self Repair should restore HP');
		battle.singleEvent('DamagingHit', minior.getAbility(), minior.abilityState,
			minior, mew, battle.dex.getActiveMove('tackle'), 1);
		assert(mew.side.sideConditions['stealthrock'], 'Crumbling Shell should set Stealth Rock after a physical hit');
	});
});
