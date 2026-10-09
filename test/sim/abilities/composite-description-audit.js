'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Composite callback duplication audit', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability, moves: ['tackle'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['tackle'] }],
		]); battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Verdant Drake', 'Pollen Bloom', 'Toxic Bloom', 'Ancient Bloom']) it(ability + ' retains Proficient only when it remains part of the selected package', () => {
		const [p, foe] = setup(ability); p.setType('Normal');
		const m = battle.dex.getActiveMove('tackle'); assert.equal(battle.runEvent('BasePower', p, foe, m, 100), 100);
	});
	for (const ability of ['Pollen Bloom', 'Toxic Bloom', 'Ancient Bloom']) it(ability + ' applies inherited Thick Fat once', () => {
		const [p, foe] = setup(ability);
		for (const [id, event] of [['firepunch', 'ModifyAtk'], ['flamethrower', 'ModifySpA']]) {
			const m = battle.dex.getActiveMove(id); assert.equal(battle.runEvent(event, foe, p, m, 100), 50);
		}
	});
	it('Verdant Drake runs one Regenerator recovery', () => {
		const [p] = setup('Verdant Drake'); p.hp = 1;
		battle.singleEvent('SwitchOut', p.getAbility(), p.abilityState, p);
		assert.equal(p.hp, 1 + Math.floor(p.baseMaxhp / 3));
	});
});
