'use strict';
const assert = require('../../assert');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
describe('Klefki passive Prankster and Adhesive Armor', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(ability = 'Adhesive Armor') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Klefki', ability, item: 'Leftovers', moves: ['splash', 'tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', item: 'Sitrus Berry', moves: ['roar', 'trick'] }],
		]);
		battle.makeChoices('team 12', 'team 1');
		return battle.p1.active[0];
	}
	it('has exactly the requested passive and preserves the other selectable slots', () => {
		assert.deepEqual(Dex.species.get('Klefki').passives, ['prankster']);
		assert.deepEqual(Dex.species.get('Klefki').abilities, { 0: 'Adhesive Armor', 1: 'Master Key', H: 'Magician' });
	});
	for (const ability of ['Adhesive Armor', 'Master Key', 'Magician']) it(ability + ' receives one status-priority boost and no damaging-move boost', () => {
		const p = start(ability), foe = battle.p2.active[0];
		assert.equal(battle.runEvent('ModifyPriority', p, foe, Dex.getActiveMove('splash'), 0), 1);
		assert.equal(battle.runEvent('ModifyPriority', p, foe, Dex.getActiveMove('tackle'), 0), 0);
	});
	it('Adhesive Armor protects the held item and prevents Roar without adding priority twice', () => {
		const p = start(), foe = battle.p2.active[0];
		battle.makeChoices('move splash', 'move trick');
		assert.equal(foe.item, 'sitrusberry');
		assert.equal(p.item, 'leftovers');
		battle.makeChoices('move splash', 'move roar');
		assert.equal(battle.p1.active[0], p);
		assert.equal(p.ability, 'adhesivearmor');
	});
});
