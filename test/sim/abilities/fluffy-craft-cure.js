'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');
describe('Legacy Fluffy Craft alias uses the approved Silken Salvo package', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Cinccino', ability: 'Fluffy Craft', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]); battle.makeChoices('team 12', 'team 1'); return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('does not retain the retired Natural Cure switch effect', () => {
		const [p] = setup();
		p.hp = 1;
		p.setStatus('par');
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, 'par'); assert.equal(p.hp, 1);
		battle.makeChoices('switch 2', 'move splash'); const hp = p.hp;
		battle.makeChoices('switch 2', 'move splash'); assert.equal(p.hp, hp);
	});
	it('does not gain a switch cure or healing through suppression', () => {
		const [p] = setup();
		p.hp = 100;
		p.setStatus('par');
		p.addVolatile('gastroacid');
		battle.makeChoices('switch 2', 'move splash'); assert.equal(p.status, 'par'); assert.equal(p.hp, 100);
	});
	it('retains Fluffy protection without the retired Technician boost', () => {
		const [p, foe] = setup();
		for (const [id, expected] of [['tackle', 50], ['flamethrower', 200], ['firepunch', 100]]) {
			const m = battle.dex.getActiveMove(id); assert.equal(battle.runEvent('ModifyDamage', foe, p, m, 100), expected);
		}
		const m = battle.dex.getActiveMove('tackle'); assert.equal(battle.runEvent('BasePower', p, foe, m, 60), 60);
		assert.equal(battle.runEvent('BasePower', p, foe, m, 80), 80); battle.field.changeTerrain('factoryterrain', p);
		assert.equal(battle.runEvent('BasePower', p, foe, m, 80), 80);
	});
	it('does not inherit Natural Cure field recovery on Bewitched Woods', () => {
		const [p] = setup();
		p.hp = 100;
		p.setStatus('par');
		battle.field.changeTerrain('bewitchedwoodsterrain', p);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(p.status, 'par'); assert.equal(p.hp, 100);
	});
	it('updates both existing Cinccino users while leaving Black Fang and Great Marsh callbacks intact', () => {
		for (const species of ['cinccino', 'cinccinodeso']) assert.equal(Dex.species.get(species).abilities.H, 'Silken Salvo');
		assert.equal(Dex.abilities.get('Fluffy Craft').id, 'silkensalvo');
		assert(Dex.abilities.get('Black Fang').onSourceAfterFaint); assert(!Dex.abilities.get('Black Fang').onSwitchOut);
		assert(Dex.abilities.get('Great Marsh').onModifySTAB); assert(!Dex.abilities.get('Great Marsh').onAfterMove);
	});
});
