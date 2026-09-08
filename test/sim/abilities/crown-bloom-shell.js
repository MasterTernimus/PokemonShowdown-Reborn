'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
describe('Crown, Bloom, and Shell updates', function () {
	afterEach(() => battle?.destroy());
	function setup(ability, foeAbility = 'noability') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability, moves: ['psychic', 'splash']},
		], [
			{species: 'Mew', ability: foeAbility, moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		return battle.p1.active[0];
	}
	it('blocks hostile stat drops, allows self drops, and bypasses Wonder Guard', function () {
		const holder = setup('burningcrown', 'wonderguard');
		const foe = battle.p2.active[0];
		battle.boost({atk: -1}, holder, foe, battle.dex.moves.get('growl'));
		assert.statStage(holder, 'atk', 0);
		battle.boost({atk: -1}, holder, holder, battle.dex.moves.get('superpower'));
		assert.statStage(holder, 'atk', -1);
		const hp = foe.hp;
		battle.makeChoices('move psychic', 'move splash');
		assert(foe.hp < hp);
		assert(!battle.log.some(line => line.includes('|-immune|')));
		assert.equal(holder.getAbility().onAnyFaint, undefined);
		assert(holder.hasAbility('moldbreaker'));
	});
	for (const ability of ['ancientbloom', 'pollenbloom', 'thickfat']) {
		it(`${ability} applies exactly one Thick Fat reduction`, function () {
			const holder = setup(ability);
			for (const [event, move] of [['ModifyAtk', 'firepunch'], ['ModifyAtk', 'icepunch'], ['ModifySpA', 'flamethrower'], ['ModifySpA', 'icebeam']]) {
				assert.equal(battle.runEvent(event, battle.p2.active[0], holder, battle.dex.getActiveMove(move), 100), 50);
			}
		});
	}
	for (const terrain of ['electricterrain', 'murkwatersurfaceterrain']) {
		it(`absorbs Electric moves on ${terrain}`, function () {
			const holder = setup('fortressshell');
			battle.field.setTerrain(terrain, holder);
			const hp = holder.hp;
			const result = battle.runEvent('TryHit', holder, battle.p2.active[0], battle.dex.getActiveMove('thunderbolt'));
			assert.equal(result, null);
			assert.equal(holder.hp, hp);
			assert.statStage(holder, 'atk', 1);
			assert.statStage(holder, 'spa', 1);
		});
	}
});
