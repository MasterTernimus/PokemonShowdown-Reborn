'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function start(ability = 'Defragment') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: 'Porygon-Z', ability, moves: ['recover', 'zapcannon', 'hypnosis', 'splash'] },
		{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash', 'protect'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 12', 'team 12');
	battle.randomChance = (n, d) => n >= d;
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Porygon-Z and Defragment rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('moves ten Sp. Atk into HP and replaces only Error Handler', () => {
		const p = Dex.species.get('porygonz');
		assert.deepEqual(p.baseStats, { hp: 95, atk: 80, def: 80, spa: 140, spd: 85, spe: 90 });
		assert.equal(p.bst, 570);
		assert.deepEqual(p.abilities, { 0: 'Defragment', 1: 'Adaptability', H: 'Memory Leak' });
		assert.deepEqual(p.passives, ['download']);
	});
});
