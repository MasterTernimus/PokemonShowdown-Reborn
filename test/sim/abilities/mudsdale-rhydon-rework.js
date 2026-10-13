'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(species = 'Mudsdale', ability = 'Unyielding', foeAbility = 'No Ability') {
	const mon = (species, ability) => ({species, ability, moves: ['tackle', 'protect', 'splash', 'earthquake']});
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[mon(species, ability), mon('Mew', 'No Ability')], [mon('Mew', foeAbility), mon('Mew', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Mudsdale and Rhydon approved rework', () => {
	afterEach(() => battle?.destroy());
	it('uses exact ability slots and one passive per species', () => {
		assert.deepEqual(Dex.species.get('mudsdale').abilities, {0: 'Unyielding', 1: 'Battle Armor', H: 'Surefoot'});
		assert.deepEqual(Dex.species.get('mudsdale').passives, ['stamina']);
		assert.deepEqual(Dex.species.get('rhydon').abilities, {0: 'Brute Force', 1: 'War Path', H: 'Lightning Rod'});
		assert.deepEqual(Dex.species.get('rhydon').passives, ['powerdrill']);
		assert(!Dex.abilities.get('mudtemper').exists);
	});
	it('Unyielding blocks flinching, Intimidate and opposing forced switching at any Defense stage', () => {
		const [p, q] = setup();
		assert(p.hasAbility('innerfocus'));
		assert(!p.addVolatile('flinch', q));
		battle.boost({atk: -1}, p, q, Dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
		for (const def of [-2, 0, 2]) {p.boosts.def = def; assert.equal(battle.runEvent('DragOut', p, q, Dex.moves.get('roar')), null);}
		battle.makeChoices('switch 2', 'move splash');
		assert.notEqual(battle.p1.active[0], p);
	});
	it('Stamina heals each HP hit and raises Defense once regardless of selected ability', () => {
		const [p, q] = setup(); p.hp = 2000;
		for (let i = 0; i < 2; i++) battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), {damage: 100}), q, {target: p});
		assert.equal(p.boosts.def, 1); assert.equal(p.hp, 2300);
	});
	it('Surefoot boosts only Ground damage while Defense is positive and respects opposing Defense', () => {
		const [p, q] = setup('Mudsdale', 'Surefoot');
		for (const def of [-1, 0, 1, 6]) {
			p.boosts.def = def;
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('earthquake'), 100), def > 0 ? 130 : 100);
			assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		}
		assert(!p.hasAbility('innerfocus'));
		const move = Object.assign(Dex.getActiveMove('earthquake'), {willCrit: false});
		const plain = battle.actions.getDamage(p, q, move);
		q.boosts.def = 6; assert(battle.actions.getDamage(p, q, move) < plain);
	});
	it('Rhydon gets Power Drill with any selected ability; Lightning Rod remains selectable', () => {
		const [p, q] = setup('Rhydon', 'Lightning Rod');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('drillrun'), 100), 150);
		battle.field.setTerrain('rockyterrain', p);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('drillrun'), 100), 200);
		const move = Dex.getActiveMove('drillrun'); battle.runEvent('ModifyMove', p, q, move, move); assert(!move.flags.protect);
		const hp = p.hp; battle.actions.useMove('thunderbolt', q, {target: p}); assert.equal(p.hp, hp);
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1);
	});
});
