'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Echo Fiend revised power', () => {
	let battle; afterEach(() => battle?.destroy());
	for (const [species, ability] of [['Chatot', 'Echo Fiend'], ['Noivern-Mega', 'Echo Sense']])it(ability + ' uses 1.2x normally and preserves field bonuses', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['hypervoice'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', p, q, battle.dex.getActiveMove('hypervoice'), 100), 120);
		for (const [terrain, power] of [['', 120], ['mountainterrain', 150], ['snowymountainterrain', 150], ['caveterrain', 150], ['volcanicterrain', 150], ['crystalcavernterrain', 150]]) {
			battle.field.terrain = terrain; const m = battle.dex.getActiveMove('hypervoice');
			const context = { field: battle.field, dex: battle.dex, chainModify: n => n };
			assert.equal(p.getAbility().onBasePower.call(context, 100, p, q, m), power / 100, terrain);
		}
		battle.field.terrain = ''; assert.equal(p.getAbility().onBasePower.call({ field: battle.field, dex: battle.dex, chainModify: n => n }, 100, p, q, battle.dex.getActiveMove('tackle')), undefined);
	});
});
