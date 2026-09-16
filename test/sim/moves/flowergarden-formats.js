'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
describe('Flower Garden format selection', () => {
	for (const [id, gameType, players] of [
		['gen9flowergarden', 'singles', 2],
		['gen9doublesflowergarden', 'doubles', 2],
		['gen9freeforall3pflowergarden', 'freeforall', 3],
		['gen9freeforall4pflowergarden', 'freeforall', 4],
		['gen9multiflowergarden', 'multi', 4],
	]) {
		it(`${id} is selectable and starts with the correct field`, () => {
			const format = Dex.formats.get(id);
			assert(format.exists);
			assert.equal(format.gameType, gameType);
			assert.notEqual(format.challengeShow, false);
			assert.notEqual(format.searchShow, false);
			const teams = Array.from({length: players}, () => Array.from({length: 6}, () =>
				({species: 'Mew', ability: 'No Ability', moves: ['splash']})));
			const battle = common.createBattle({formatid: id}, teams);
			try {
				battle.makeChoices(...Array(players).fill('team 123456'));
				assert.equal(battle.field.terrain, 'flowergarden1');
				assert(battle.field.isFlowerGardenBase());
				assert(battle.log.includes('|-fieldstart|Flower Garden 1'));
				battle.field.growFlowerGarden(battle.p1.active[0], battle.dex.moves.get('growth'));
				assert.equal(battle.field.terrain, 'flowergarden2');
			} finally { battle.destroy(); }
		});
	}
});
