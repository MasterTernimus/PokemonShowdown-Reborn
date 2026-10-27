'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(ability, format = 'gen9nofielddoublesbattle') {
	const mon = ability => ({species: 'Mew', ability, moves: ['splash', 'tackle', 'swordsdance', 'toxic']});
	const teams = [[mon(ability), mon('No Ability')], [mon('No Ability'), mon('No Ability')]];
	if (format.includes('freeforall')) teams.push([mon('No Ability')], [mon('No Ability')]);
	battle = common.createBattle({formatid: format}, teams);
	battle.makeChoices(...teams.map(team => `team ${team.map((_, i) => i + 1).join('')}`));
	battle.field.terrain = '';
	// Isolate these selected abilities from Mew's native Synchronize passive.
	for (const pokemon of battle.getAllActive()) pokemon.getPassives = () => [];
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Approved support ability buffs', () => {
	afterEach(() => battle?.destroy());
	it('Moon Veil no longer grants Friend Guard or reduces ordinary ally damage', () => {
		const [holder, foe] = setup('Moon Veil'), ally = holder.allies()[0];
		const move = battle.dex.getActiveMove('tackle');
		assert(!holder.hasAbility('friendguard'));
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', holder, foe, move, 100), 100);
		holder.addVolatile('gastroacid', foe);
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 100);
	});
	it('Moon Veil does not protect Free-for-All opponents', () => {
		const [holder, foe] = setup('Moon Veil', 'gen9freeforall4pmistyfieldadrienn');
		assert.equal(battle.runEvent('ModifyDamage', holder, foe, battle.dex.getActiveMove('tackle'), 100), 100);
	});
	it('Gem Eye prevents residual damage without reflecting status moves', () => {
		const [holder, foe] = setup('Gem Eye');
		assert(holder.hasAbility('magicguard'));
		const hp = holder.hp;
		battle.damage(50, holder, holder, battle.dex.conditions.get('brn'));
		assert.equal(holder.hp, hp);
		battle.actions.useMove('toxic', foe, {target: holder});
		assert.equal(holder.status, 'tox'); assert.equal(foe.status, '');
		holder.cureStatus();
		foe.cureStatus();
		battle.actions.useMove('toxic', foe, {target: holder});
		assert.equal(holder.status, 'tox');
		holder.addVolatile('gastroacid', foe);
		battle.damage(50, holder, holder, battle.dex.conditions.get('brn'));
		assert.equal(holder.hp, hp - 50);
	});
	it('Last Laugh boosts completed-action foes, not Torment alone, and respects suppression', () => {
		const [holder, foe] = setup('Last Laugh'), ally = holder.allies()[0];
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 100);
		foe.addVolatile('torment', holder);
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 100);
		foe.m.lastCompletedActionTurn = battle.turn;
		foe.m.lastCompletedActionEntry = foe.previouslySwitchedIn;
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 130);
		ally.addVolatile('torment', foe);
		assert.equal(battle.runEvent('BasePower', holder, ally, move, 100), 100);
		holder.addVolatile('gastroacid', foe);
		assert.equal(battle.runEvent('BasePower', holder, foe, move, 100), 100);
	});
	it('Mirror Greed copies opposing boosts once, ignores ally boosts, and keeps its other components', () => {
		const [holder, foe] = setup('Mirror Greed'), ally = holder.allies()[0];
		assert(holder.hasAbility('opportunist')); assert(holder.hasAbility('analytic'));
		battle.makeChoices('move splash, move swordsdance', 'move swordsdance, move splash');
		assert.equal(holder.boosts.atk, 2); assert.equal(foe.boosts.atk, 2);
		assert.equal(ally.boosts.atk, 2);
		holder.addVolatile('gastroacid', foe);
		battle.makeChoices('move splash, move splash', 'move swordsdance, move splash');
		assert.equal(holder.boosts.atk, 2);
	});
});
