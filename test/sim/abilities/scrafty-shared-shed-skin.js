'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
	battle.makeChoices('team 1', 'team 1');
	const p = battle.p1.active[0];
	p.hp = 100;
	p.maxhp = p.baseMaxhp = 400;
	return p;
}
describe('Scrafty uses shared Shed Skin recovery', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	for (const [species, ability] of [['Scrafty', 'Shed Skin'], ['Scrafty-Mega', 'Street Tyrant'], ['Scrafty-Mega', 'No Ability'], ['Mew', 'Shed Skin']])it(species + '/' + ability + ' heals one quarter once without changing distribution', () => {
		const p = setup(species, ability);
		p.status = 'par';
		p.boosts.def = -2;
		battle.randomChance = () => true;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 200);
		assert.equal(p.status, '');
		assert.equal(p.boosts.def, 0);
		if (species === 'Scrafty')assert.deepEqual(p.getPassives(), ['rivalry']);
		if (species === 'Scrafty-Mega')assert.deepEqual(p.getPassives(), ['shedskin']);
	});
	for (const species of ['Scrafty', 'Scrafty-Mega'])it(species + ' retains guaranteed Dragon Den changes with shared quarter healing', () => {
		const p = setup(species, species === 'Scrafty' ? 'Shed Skin' : 'Street Tyrant');
		p.status = 'par';
		battle.field.terrain = 'dragonsdenterrain';
		battle.randomChance = () => {
			throw Error('Dragon Den must not roll');
		};
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 200);
		assert.equal(p.status, '');
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.def, -1);
		assert.equal(p.boosts.spd, -1);
	});
	it('retains the one-half chance and fails without healing or curing', () => {
		const p = setup('Scrafty', 'Shed Skin');
		p.status = 'par';
		battle.randomChance = (n, d) => {
			assert.deepEqual([n, d], [1, 2]);
			return false;
		};
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 100);
		assert.equal(p.status, 'par');
	});
	it('retains ineligibility above half HP and never heals a fainted holder', () => {
		const p = setup('Scrafty', 'Shed Skin');
		p.hp = 300;
		battle.randomChance = () => {
			throw Error('No eligible condition');
		};
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 300);
		p.hp = 0;
		battle.singleEvent('Residual', Dex.abilities.get('shedskin'), p.abilityState, p);
		assert.equal(p.hp, 0);
	});
	it('uses the same recovery for a Perfect Illusion copying Mega Scrafty', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species: 'Zoroark', ability: 'Perfect Illusion', moves: ['splash'] }, { species: 'Scrafty-Mega', ability: 'Street Tyrant', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 12', 'team 1');
		const p = battle.p1.active[0];
		assert(p.illusion);
		assert.deepEqual(p.getPassives(), ['shedskin']);
		p.hp = 100;
		p.maxhp = p.baseMaxhp = 400;
		battle.randomChance = () => true;
		battle.runEvent('Residual', p);
		assert.equal(p.hp, 200);
	});
});
