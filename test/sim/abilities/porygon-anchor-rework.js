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
	it('preserves accuracy through self moves, spends it on a foe and refreshes on switching', () => {
		const [p, t] = start();
		battle.makeChoices('move splash', 'move splash');
		battle.makeChoices('move zapcannon', 'move splash');
		assert.equal(t.status, 'par'); t.cureStatus(); const hp = t.hp;
		battle.makeChoices('move zapcannon', 'move splash'); assert.equal(t.hp, hp);
		battle.makeChoices('switch 2', 'move splash'); battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('move zapcannon', 'move splash'); assert.equal(t.status, 'par');
	});
	it('does not bypass Protect and spends the opening attempt', () => {
		const [p, t] = start(); const hp = t.hp;
		battle.makeChoices('move zapcannon', 'move protect'); assert.equal(t.hp, hp);
		battle.makeChoices('move zapcannon', 'move splash'); assert.equal(t.hp, hp);
	});
	it('does not bypass type immunity', () => {
		const [p, t] = start(); t.setType('Ground'); const hp = t.hp;
		battle.makeChoices('move zapcannon', 'move splash'); assert.equal(t.hp, hp);
		t.setType('Normal'); battle.makeChoices('move zapcannon', 'move splash'); assert.equal(t.hp, hp);
	});
	it('also guarantees an opening status move aimed at a foe', () => {
		const [p, t] = start();
		battle.makeChoices('move hypnosis', 'move splash'); assert.equal(t.status, 'slp');
		t.cureStatus(); battle.makeChoices('move hypnosis', 'move splash'); assert.equal(t.status, '');
	});
});
