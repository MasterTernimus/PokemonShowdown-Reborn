'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Second Wind chance', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function start(ability = 'Second Wind') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability, moves: ['splash']},
		], [{species: 'Mew', moves: ['tackle']}]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('rolls 50% on the first lethal move, then cannot activate again', () => {
		const [holder, foe] = start();
		let rolls = 0;
		battle.randomChance = (numerator, denominator) => {
			assert.equal(numerator, 1);
			assert.equal(denominator, 2);
			rolls++;
			return true;
		};
		const hit = () => battle.runEvent('Damage', holder, foe, battle.dex.getActiveMove('tackle'), holder.hp);
		assert.equal(hit(), holder.hp - 1);
		assert.equal(hit(), holder.hp);
		assert.equal(rolls, 1);
	});

	it('uses up the only roll even when survival fails', () => {
		const [holder, foe] = start('Aura Instinct');
		let rolls = 0;
		battle.randomChance = () => { rolls++; return false; };
		const hit = () => battle.runEvent('Damage', holder, foe, battle.dex.getActiveMove('tackle'), holder.hp);
		assert.equal(hit(), holder.hp);
		assert.equal(hit(), holder.hp);
		assert.equal(rolls, 1);
	});

	it('does not spend its roll on residual damage', () => {
		const [holder, foe] = start();
		let rolls = 0;
		battle.randomChance = () => { rolls++; return true; };
		assert.equal(battle.runEvent('Damage', holder, foe, battle.dex.conditions.get('brn'), holder.hp), holder.hp);
		assert.equal(rolls, 0);
		assert.equal(battle.runEvent('Damage', holder, foe, battle.dex.getActiveMove('tackle'), holder.hp), holder.hp - 1);
		assert.equal(rolls, 1);
	});
});
