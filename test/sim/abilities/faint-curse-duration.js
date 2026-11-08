'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Fainting ability Curse duration', () => {
	let battle; afterEach(() => battle?.destroy());
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 12');
		const p = battle.p1.active[0], q = battle.p2.active[0];
		q.baseMaxhp = q.maxhp = q.hp = 800;
		return [p, q];
	}
	function tick(q) { battle.singleEvent('Residual', battle.dex.conditions.get('curse'), q.volatiles.curse, q); }
	for (const id of ['cursedbody', 'mourningsnow'])it(id + ' faint effect ends after two 1/8 ticks', () => {
		const [p, q] = setup(); p.setAbility(id); battle.singleEvent('Faint', p.getAbility(), p.abilityState, p);
		assert(q.volatiles.curse);
		tick(q);
		assert.equal(q.hp, 700);
		assert(q.volatiles.curse);
		tick(q); assert.equal(q.hp, 600); assert(!q.volatiles.curse);
		assert(battle.log.some(line => line.includes('|-end|') && line.includes('|Curse')));
	});
	for (const id of ['curse', 'cursedkeepsake'])it(id + ' retains its existing damage and indefinite duration', () => {
		const [p, q] = setup(); q.addVolatile('curse', p, id === 'curse' ? battle.dex.moves.get(id) : battle.dex.abilities.get(id));
		for (let i = 0; i < 3; i++)tick(q);
		assert.equal(q.hp, id === 'curse' ? 200 : 500); assert(q.volatiles.curse);
	});
	it('does not replace or shorten an existing move Curse', () => {
		const [p, q] = setup(); q.addVolatile('curse', p, battle.dex.moves.get('curse'));
		assert.equal(q.addVolatile('curse', p, battle.dex.abilities.get('cursedbody')), false);
		for (let i = 0; i < 3; i++)tick(q); assert.equal(q.hp, 200); assert(q.volatiles.curse);
	});
	it('expires on the second actual end of turn, not before its damage', () => {
		const [p, q] = setup(); q.addVolatile('curse', p, battle.dex.abilities.get('cursedbody'));
		battle.makeChoices('move splash', 'move splash'); assert.equal(q.hp, 700); assert(q.volatiles.curse);
		battle.makeChoices('move splash', 'move splash'); assert.equal(q.hp, 600); assert(!q.volatiles.curse);
		battle.makeChoices('move splash', 'move splash'); assert.equal(q.hp, 600);
	});
	it('still clears on switching', () => {
		const [p, q] = setup();
		q.addVolatile('curse', p, battle.dex.abilities.get('cursedbody'));
		battle.makeChoices('move splash', 'switch 2');
		assert(!q.volatiles.curse);
	});
});
