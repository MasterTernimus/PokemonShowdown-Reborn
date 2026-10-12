/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species, ability, item = '') {
	const set = (species = 'Mew', ability = 'No Ability', item = '') => ({ species, ability, item, moves: ['reflect', 'splash', 'watergun', 'tackle', 'airslash', 'lightscreen'] });
	battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' },
		[[set(species, ability, item), set(), set()], [set(), set(), set()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
}
function hit(p, q, id) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null });
	battle.actions.runMove(move, p, p.getLocOf(q));
}
function cycle() {
	battle.makeChoices('switch 3, move 2', 'move 2, move 2');
	battle.makeChoices('switch 3, move 2', 'move 2, move 2');
}
describe('Approved per-entry budgets and base Victreebel follow-up', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Dream Sickness', 'Void Voice']) it(ability + ' shares its rescue budget across replacement, restart and genuine reentry', () => {
		const [p, ally, foe] = setup('Gardevoir', ability); ally.hp = 100;
		const rescue = () => battle.runEvent('Damage', ally, foe, Dex.getActiveMove('tackle'), 100);
		assert.equal(rescue(), 99); assert.equal(p.hp, 3000); assert.equal(rescue(), 100);
		p.setAbility('No Ability'); p.setAbility(ability); assert.equal(rescue(), 100);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(rescue(), 100);
		p.setAbility(ability === 'Dream Sickness' ? 'Void Voice' : 'Dream Sickness'); assert.equal(rescue(), 100);
		cycle(); ally.hp = 100; p.hp = 4000; assert.equal(rescue(), 99);
	});
	it('actual Gardevoir Mega Evolution cannot buy a second rescue', () => {
		const [p, ally, foe] = setup('Gardevoir', 'Dream Sickness', 'Gardevoirite'); ally.hp = 100;
		const rescue = () => battle.runEvent('Damage', ally, foe, Dex.getActiveMove('tackle'), 100);
		assert.equal(rescue(), 99); assert(battle.actions.runMegaEvo(p)); assert.equal(p.species.id, 'gardevoirmega');
		const afterMegaHP = p.hp;
		assert.equal(p.ability, 'voidvoice'); assert.equal(rescue(), 100); assert.equal(p.hp, afterMegaHP);
	});
	it('suppressed rescue does not spend the shared allowance and Telepathy remains', () => {
		const [p, ally, foe] = setup('Gardevoir', 'Dream Sickness'); ally.hp = 100; p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('Damage', ally, foe, Dex.getActiveMove('tackle'), 100), 100); assert(!p.m.dreamRescueUsed);
		p.removeVolatile('gastroacid'); assert.equal(battle.runEvent('Damage', ally, foe, Dex.getActiveMove('tackle'), 100), 99);
		const hp = p.hp; hit(ally, p, 'tackle'); assert.equal(p.hp, hp);
	});
	for (const turns of [0, 1, 4, 8]) it('Slipstream retains at least max(existing ' + turns + ', 3) Tailwind turns', () => {
		const [p, , foe] = setup('Yanmega', 'Slipstream');
		if (turns) { p.side.addSideCondition('tailwind', p, Dex.moves.get('tailwind')); p.side.sideConditions.tailwind.duration = turns; }
		hit(p, foe, 'airslash'); assert.equal(p.side.sideConditions.tailwind.duration, Math.max(turns, 3));
		p.side.removeSideCondition('tailwind'); p.setAbility('No Ability'); p.setAbility('Slipstream');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); hit(p, foe, 'airslash'); assert(!p.side.sideConditions.tailwind);
		cycle(); hit(p, foe, 'airslash'); assert.equal(p.side.sideConditions.tailwind.duration, 3);
		assert.deepEqual(p.getPassives(), ['levitate']);
	});
	for (const [species, ability, kind] of [['Mr. Mime', 'Mimecraft', 'screen'], ['Cloyster', 'Pearl Current', 'water'], ['Carnivine', 'Apex Flytrap', 'trap']]) {
		it(ability + ' retains its spent allowance through replacement and resets only on reentry', () => {
			const [p, ally, foe] = setup(species, ability); ally.hp = 100;
			const trigger = () => {
				if (kind === 'screen') { p.side.removeSideCondition('reflect'); hit(p, p, 'reflect'); }
				if (kind === 'water') { p.hp = 1000; hit(foe, p, 'watergun'); assert(p.hp > 1000); }
				if (kind === 'trap') { foe.removeVolatile('apexflytraptrapped'); hit(foe, p, 'tackle'); }
			};
			trigger(); assert(kind === 'trap' ? foe.volatiles.apexflytraptrapped : ally.hp === 600);
			p.setAbility('No Ability'); p.setAbility(ability); battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			trigger(); assert(kind === 'trap' ? !foe.volatiles.apexflytraptrapped : ally.hp === 600);
			cycle(); ally.hp = 100; trigger(); assert(kind === 'trap' ? foe.volatiles.apexflytraptrapped : ally.hp === 600);
		});
	}
	it('Mimecraft keeps its per-move screen eligibility and suppressed moves spend nothing', () => {
		const [p, ally] = setup('Mew', 'Mimecraft'); ally.hp = 100; p.addVolatile('gastroacid');
		hit(p, p, 'reflect'); assert.equal(ally.hp, 100); assert(!p.m.mimecraftUsed);
		p.removeVolatile('gastroacid'); hit(p, p, 'reflect'); assert.equal(ally.hp, 100);
		hit(p, p, 'lightscreen'); assert.equal(ally.hp, 600);
	});
	it('Apex Flytrap spends only a successful trap', () => {
		const [p, , foe] = setup('Carnivine', 'Apex Flytrap'); foe.addVolatile('apexflytraptrapped', p);
		hit(foe, p, 'tackle'); assert(!p.m.apexFlytrapUsed); foe.removeVolatile('apexflytraptrapped');
		hit(foe, p, 'tackle'); assert(p.m.apexFlytrapUsed);
	});
	it('Baited Bloom initializes Gluttony, enhances Leftovers and heals one third on actual switch-out', () => {
		const [p] = setup('Victreebel', 'Baited Bloom', 'Leftovers'); p.hp = 1000;
		assert(p.abilityState.gluttony); assert(p.hasAbility('gluttony')); assert(p.hasAbility('regenerator'));
		assert(!p.hasAbility('stickyhold')); assert(p.hasAbilityOrPassive('stickyhold'));
		battle.singleEvent('Residual', p.getItem(), p.itemState, p); assert.equal(p.hp, 1500);
		battle.makeChoices('switch 3, move 2', 'move 2, move 2'); assert.equal(p.hp, 2833);
		assert.deepEqual(Dex.species.get('victreebelmega').passives, ['digestivesap']);
	});
	it('Baited Bloom uses pinch Berries at half HP without a first-Berry stat reward', () => {
		const [p] = setup('Victreebel', 'Baited Bloom', 'Figy Berry'); p.hp = 1999;
		battle.runEvent('Update', p); assert.equal(p.item, ''); assert(p.hp > 1999);
		assert.equal(p.boosts.spa, 0); assert.equal(p.boosts.atk, 0);
	});
	it('suppression disables Baited Bloom regeneration but keeps Sticky Hold passive', () => {
		const [p] = setup('Victreebel', 'Baited Bloom'); p.hp = 1000; p.addVolatile('gastroacid');
		battle.makeChoices('switch 3, move 2', 'move 2, move 2'); assert.equal(p.hp, 1000);
		assert.deepEqual(p.getPassives(), ['stickyhold']);
	});
});
