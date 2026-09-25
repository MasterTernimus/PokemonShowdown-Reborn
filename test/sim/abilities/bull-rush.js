'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Bull Rush on Tauros forms', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });

	it('gives each form Bull Rush and its requested replacement ability', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		for (const [species, hidden] of [
			['Tauros', 'Ultra Ego'],
			['Tauros-Paldea-Combat', 'Guts'],
			['Tauros-Paldea-Blaze', 'Flame Body'],
			['Tauros-Paldea-Aqua', 'Thick Fat'],
		]) {
			assert.deepEqual(battle.dex.species.get(species).abilities,
				{0: 'Bull Rush', 1: 'Gluttony', H: hidden});
		}
	});

	it('raises Attack and Speed only on the first active turn', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Tauros', ability: 'Bull Rush', moves: ['tackle']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const tauros = battle.p1.active[0];
		const firstTurnAttack = tauros.getStat('atk');
		const firstTurnSpeed = tauros.getStat('spe');
		tauros.activeTurns = 2;
		assert(firstTurnAttack > tauros.getStat('atk'));
		assert(firstTurnSpeed > tauros.getStat('spe'));
	});
});
