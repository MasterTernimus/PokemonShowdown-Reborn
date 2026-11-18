'use strict';
const assert = require('node:assert/strict');
const common = require('../../common');

describe('Forretress plating and passive', () => {
	let battle;
	afterEach(() => battle?.destroy());

	function start(foeAbility = 'Pressure') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Forretress', ability: 'Ballast Plating', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: foeAbility, moves: ['tackle'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	for (const [ability, terrain, divisor] of [
		['Pressure', '', 4], ['Pressure', 'corrosivemistterrain', 2], ['Damp', '', 0],
	]) {
		it('resolves contact KO with ' + ability + ' on ' + (terrain || 'neutral field'), () => {
			const [holder, foe] = start(ability);
			if (terrain) battle.field.setTerrain(terrain, holder);
			holder.hp = 1;
			const hp = foe.hp;
			battle.actions.useMove('tackle', foe, { target: holder });
			assert.equal(holder.hp, 0);
			assert.equal(foe.hp, hp - (divisor ? Math.floor(foe.baseMaxhp / divisor) : 0));
		});
	}

	it('blocks critical hits and boosts the three specified attacks', () => {
		const [holder, foe] = start();
		assert.equal(battle.runEvent('CriticalHit', holder, foe, battle.dex.getActiveMove('tackle')), false);
		for (const id of ['bodypress', 'heavyslam', 'gyroball', 'ironhead']) {
			const move = battle.dex.getActiveMove(id);
			const power = battle.runEvent('BasePower', holder, foe, move, 100);
			holder.setAbility('Heatproof');
			const control = battle.runEvent('BasePower', holder, foe, move, 100);
			assert.equal(power, id === 'ironhead' ? control : Math.round(control * 1.2), id);
			holder.setAbility('Ballast Plating');
		}
	});
});
