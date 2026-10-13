'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim/dex');
const {TeamValidator} = require('../../../dist/sim/team-validator');

describe('Mightyena Grim artwork variant', () => {
	it('inherits the current base gameplay and keeps both artwork choices', () => {
		const base = Dex.species.get('Mightyena');
		const grim = Dex.species.get('Mightyena-Grim');
		assert(grim.exists && grim.isCosmeticForme);
		for (const key of ['baseStats', 'types', 'abilities', 'passives', 'weightkg', 'eggGroups']) {
			assert.deepEqual(grim[key], base[key], key);
		}
		assert(base.cosmeticFormes.includes('Mightyena-Grim'));
		assert(base.formeOrder.includes('Mightyena-Deso'));
	});
	it('accepts the base movepool and retains its artwork in battle', () => {
		const set = {species: 'Mightyena-Grim', ability: 'Intimidate', moves: ['Crunch', 'Protect']};
		assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam([set]), null);
		const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[set], [{species: 'Mew', ability: 'Synchronize', moves: ['Splash']}],
		]);
		try {
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].species.name, 'Mightyena-Grim');
			assert.deepEqual(battle.p1.active[0].species.passives, ['infiltrator']);
			assert(battle.log.some(line => line.includes('Mightyena-Grim')));
		} finally {
			battle.destroy();
		}
	});
});
