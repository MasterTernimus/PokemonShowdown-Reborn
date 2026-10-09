'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { predatorUltraMatch } = require('../../../dist/sim/predator');
let battle;
function setup(species = 'Mew', ability = 'Predator', targetAbility = 'Ultra Instinct', doubles = false) {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'roar', 'uturn'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon('Mew', targetAbility), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	battle.field.terrain = '';
	for (const side of battle.sides) for (const m of side.pokemon) m.hp = m.maxhp = m.baseMaxhp = 1200;
	q.newlySwitched = false;
	battle.randomizer = n => n;
	return [p, q];
}
function damage(p, q, id = 'tackle') {
	const move = Object.assign(Dex.getActiveMove(id), { willCrit: false });
	battle.setActiveMove(move, p, q);
	const result = battle.actions.getDamage(p, q, move);
	battle.clearActiveMove();
	return result;
}
describe('Final approved Predator Aura Precision and Entrenched designs', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('changes only Lucario Z selected ability and Haxorus passive in the roster', () => {
		for (const old of require('./final-three-mega-before.json')) {
			const now = Dex.species.get(old.id);
			assert.deepEqual(now.abilities, require('./passive-approval-overlays').abilities(old.id, {...old.abilities}), old.id);
			assert.deepEqual(now.passives, require('./passive-approval-overlays').current(old.id, old.passives), old.id);
		}
	});
	for (const ability of ['Ultra Ego', 'Ultra Instinct', 'Burning Ego', 'Perfect Ego', 'Primal Ego', 'Unleashed Ego']) it('Predator matches active ' + ability + ' once without copying it', () => {
		const [p, q] = setup('Staraptor-Mega', 'Predator', ability);
		q.newlySwitched = true;
		assert(predatorUltraMatch(battle, p, q));
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 200);
		battle.field.terrain = 'mountainterrain';
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 200);
		assert(!p.hasAbility('ultraego'));
		assert(!p.hasAbility('ultrainstinct'));
		assert.deepEqual(p.getPassives(), ['contrary']);
	});
	for (const category of ['Physical', 'Special']) it('ignores only positive ' + category + ' defensive stages', () => {
		const [p, q] = setup();
		const stat = category === 'Physical' ? 'def' : 'spd', move = category === 'Physical' ? 'tackle' : 'swift';
		const base = damage(p, q, move);
		q.boosts[stat] = 4;
		assert.equal(damage(p, q, move), base);
		q.boosts[stat] = -2;
		assert(damage(p, q, move) > base * 1.8);
		q.boosts[stat] = 0;
		p.boosts[category === 'Physical' ? 'atk' : 'spa'] = -2;
		assert(damage(p, q, move) < base * 0.6, 'does not grant Unaware or ignore own offensive drops');
	});
	it('does not expand defensive-stage bypass to ordinary authority targets', () => {
		const [p, q] = setup('Mew', 'Predator', 'Royal Decree');
		const base = damage(p, q);
		q.boosts.def = 4;
		assert(damage(p, q) < base * 0.5);
	});
	it('preserves recursive component exclusions and ordinary ability suppression', () => {
		const [p, q] = setup('Mew', 'Predator', 'Burning Ego');
		const original = q.getAbilityComponentExclusions;
		q.getAbilityComponentExclusions = () => ['ultraego'];
		assert(!predatorUltraMatch(battle, p, q));
		q.getAbilityComponentExclusions = original;
		q.addVolatile('gastroacid');
		assert(!predatorUltraMatch(battle, p, q));
		q.removeVolatile('gastroacid');
		p.addVolatile('gastroacid');
		assert(!predatorUltraMatch(battle, p, q));
	});
	for (const field of ['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']) it(field + ' disables the anti-Ultra matchup while retaining ordinary Predator power', () => {
		const [p, q] = setup();
		battle.field.terrain = field;
		assert(!predatorUltraMatch(battle, p, q));
		q.newlySwitched = false;
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 100);
		q.newlySwitched = true;
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
	});
	it('bypasses Ultra Instinct reduction in ordinary and boosted fields, but not other defenses', () => {
		const [p, q] = setup();
		p.moveThisTurnResult = undefined;
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('tackle'), 100), 100);
		battle.field.terrain = 'ashenbeachterrain';
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('tackle'), 100), 100);
		p.setAbility('No Ability');
		assert.equal(battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('tackle'), 100), 50);
	});
	for (const ability of ['Ultra Ego', 'Burning Ego', 'Perfect Ego', 'Primal Ego', 'Unleashed Ego']) it('preserves unrelated defenses after removing Ultra damage bonuses inside ' + ability, () => {
		const [p, q] = setup('Mew', 'Predator', ability, true);
		battle.p1.active[1].setAbility('Royal Decree');
		const move = Dex.getActiveMove('tackle');
		const bypassed = battle.runEvent('ModifyDamage', p, q, move, 100);
		p.setAbility('No Ability');
		const original = battle.runEvent('ModifyDamage', p, q, move, 100);
		assert.equal(bypassed, original, ability);
		p.setAbility('Predator');
		if (ability === 'Unleashed Ego') {
			const priority = battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove('quickattack'), 100);
			assert(priority < bypassed, 'retains Raging Storm priority protection');
		}
	});
	it('keeps per-target results separate for a shared spread move', () => {
		const [p, q] = setup('Mew', 'Predator', 'Ultra Instinct', true), other = battle.p2.active[1];
		other.newlySwitched = false;
		const move = Dex.getActiveMove('earthquake');
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 200);
		assert.equal(battle.runEvent('BasePower', p, other, move, 100), 100);
		assert(!move.ignoreAbility && !move.ignoreDefensive && !move.ignorePositiveDefensive);
	});
	it('retains Protect, Substitute, screens and type immunities against Ultra targets', () => {
		const [p, q] = setup();
		const hit = () => {
			battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), { accuracy: true, willCrit: false }), p, { target: q });
			battle.clearActiveMove();
		};
		q.addVolatile('protect');
		hit();
		assert.equal(q.hp, 1200);
		q.removeVolatile('protect');
		q.addVolatile('substitute');
		hit();
		assert.equal(q.hp, 1200);
		q.removeVolatile('substitute');
		q.setType('Ghost');
		hit();
		assert.equal(q.hp, 1200);
		q.setType('Normal');
		const base = damage(p, q);
		q.side.addSideCondition('reflect', q);
		assert(damage(p, q) < base * 0.7);
	});
	it('keeps Ultra Ego post-hit stat reactions and healing', () => {
		const [p, q] = setup('Mew', 'Predator', 'Ultra Ego');
		q.hp = 800;
		battle.actions.useMove(Object.assign(Dex.getActiveMove('tackle'), { damage: 120, accuracy: true }), p, { target: q });
		assert.equal(q.hp, 755);
		assert.equal(q.boosts.atk, 1);
		assert.equal(q.boosts.spa, 1);
	});
	it('Aura Precision is only Shield Dust and standard local Technician with no extra hits or Inner Focus', () => {
		const [p, q] = setup('Lucario-Mega-Z', 'Aura Precision', 'No Ability');
		assert.deepEqual(p.getPassives(), ['auraguard']);
		assert(p.hasAbility('shielddust') && p.hasAbility('technician'));
		assert(!p.hasAbility('dualwield') && !p.hasAbility('innerfocus'));
		const move = Dex.getActiveMove('aurasphere');
		battle.runEvent('ModifyMove', p, q, move, move);
		assert(!move.multihit);
		for (const [field, bp, expected] of [['', 60, 90], ['', 61, 61], ['factoryterrain', 80, 120], ['factoryterrain', 81, 81]]) {
			battle.field.terrain = field;
			assert.equal(battle.runEvent('BasePower', p, q, move, bp), expected);
		}
		battle.field.terrain = '';
		const secondary = [{ chance: 100, status: 'par' }, { chance: 100, self: { boosts: { atk: 1 } } }];
		assert.deepEqual(battle.runEvent('ModifySecondaries', p, q, move, secondary), [secondary[1]]);
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('BasePower', p, q, move, 60), 60);
		assert.deepEqual(battle.runEvent('ModifySecondaries', p, q, move, secondary), secondary);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 50);
	});
	it('copied Aura Precision works on a nonrecipient without granting Aura Guard', () => {
		const [p, q] = setup('Mew', 'Aura Precision', 'No Ability');
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 40), 60);
		assert.equal(battle.runEvent('ModifyDamage', q, p, Dex.getActiveMove('tackle'), 100), 100);
	});
	it('Haxorus retains full Raging Overlord while Entrenched blocks hostile phazing and permits voluntary switching', () => {
		const [p, q] = setup('Haxorus-Mega', 'Raging Overlord', 'No Ability');
		assert.deepEqual(p.getPassives(), ['entrenched']);
		assert(p.hasAbility('battlearmor') && p.hasAbility('ragingstorm') && p.hasAbility('supremeoverlord'));
		assert.equal(battle.runEvent('DragOut', p, q, Dex.moves.get('roar')), null);
		assert.equal(battle.runEvent('DragOut', p, q, Dex.items.get('redcard')), null);
		assert.notEqual(battle.runEvent('DragOut', p, p, Dex.moves.get('roar')), null);
		p.setAbility('No Ability');
		p.addVolatile('gastroacid');
		assert.equal(battle.runEvent('DragOut', p, q, Dex.moves.get('roar')), null);
		battle.makeChoices('switch 2', 'move splash');
		assert.notEqual(battle.p1.active[0], p);
	});
});
describe('Final design calculator and voluntary pivot checks', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('Haxorus can pivot voluntarily with U-turn', () => {
		const [p] = setup('Haxorus-Mega', 'Raging Overlord', 'No Ability');
		battle.makeChoices('move uturn', 'move splash');
		assert.equal(battle.requestState, 'switch');
		battle.makeChoices('switch 2');
		assert.notEqual(battle.p1.active[0], p);
	});
	it('calculator uses Predator target-specific positive-stage bypass and preserves negative stages', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Wing Attack', samples: 8, seed: 123,
			actors: [{ species: 'Staraptor-Mega', ability: 'Predator' }, { species: 'Mew', ability: 'Ultra Instinct', boosts: { def: 0 } },
				{ species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const base = calculateScenario(input).results[1];
		input.actors[1].boosts.def = 6;
		const positive = calculateScenario(input).results[1];
		assert.equal(positive.min, base.min);
		assert.equal(positive.max, base.max);
		input.actors[1].boosts.def = -2;
		assert(calculateScenario(input).results[1].max > base.max);
	});
});
