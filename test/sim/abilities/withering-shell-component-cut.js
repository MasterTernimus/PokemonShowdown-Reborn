'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {AbilityComponents} = require('../../../dist/data/ability-components');
let battle;
function start(ability) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species: 'Mew', ability, moves: ['splash']},
	], [{species: 'Mew', ability: 'No Ability', moves: ['tackle', 'splash']}]]);
	battle.makeChoices('team 1', 'team 1');
	battle.randomChance = () => true;
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Withering Shell component cut', () => {
	afterEach(() => {battle?.destroy(); battle = null;});
	it('retains physical-hit hazards without disabling the attacker', () => {
		const [p, q] = start('Withering Shell');
		battle.makeChoices('move splash', 'move tackle');
		assert(q.side.sideConditions.stealthrock);
		assert(!q.volatiles.disable);
		assert.deepEqual(AbilityComponents.witheringshell, ['crumblingshell', 'raindish', 'stickyhold']);
	});
	it('keeps rain recovery', () => {
		const [p] = start('Withering Shell');
		battle.field.setWeather('raindance', p);
		p.hp = Math.floor(p.maxhp / 2);
		const before = p.hp;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, before + Math.floor(p.maxhp / 16));
	});
	for (const ability of ['Withering Shell', 'Cursed Body']) it(ability + ' preserves component ownership of the fainting curse', () => {
		const [p, q] = start(ability);
		p.hp = 1;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(!!q.volatiles.curse, ability === 'Cursed Body');
	});
});
