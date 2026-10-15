/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species = 'Armaldo', ability = 'Grappling Claws', doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['tackle', 'hypervoice', 'airslash', 'splash'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[set(species, ability), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12'); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, id = 'tackle', extra = {}) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false }, extra);
	battle.actions.useMove(move, p, { target: q });
	battle.runEvent('AfterMove', p, q, move); return move;
}
describe('Approved Grappling Claws, Lapras and Yanmega changes', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('keeps Relic Armor and all distinct Lapras forms unchanged', () => {
		assert.deepEqual(Dex.species.get('armaldo').passives, ['relicarmor']);
		for (const [id, p] of Object.entries({ lapras: ['liquidvoice'], laprasazzy: ['hydration'], laprasgmax: ['hydration'], laprasaevian: ['relicarmor'], laprasaeviangmax: [], yanmega: ['levitate'] })) assert.deepEqual(Dex.species.get(id).passives, p, id);
	});
	it('uses full local Tough Claws on contact moves, without boosting noncontact moves', () => {
		const [p, q] = setup();
		for (const id of ['xscissor', 'leechlife', 'mightycleave', 'shadowclaw']) assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(id), 100), 130);
		for (const id of ['aquacutter', 'rockblast']) assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove(id), 100), 100);
		assert(p.hasAbility('toughclaws'));
	});
	it('obsolete Speed drop stays removed across hits, turns and ability replacement', () => {
		const [p, q] = setup(); const during = [];
		hit(p, q, 'tackle', { multihit: 3, onAfterHit(target) { during.push(target.boosts.spe); } });
		assert.deepEqual(during, [0, 0, 0]); assert.equal(q.boosts.spe, 0);
		p.setAbility('No Ability'); p.setAbility('Grappling Claws'); hit(p, q); assert.equal(q.boosts.spe, 0);
		battle.turn++; hit(p, q); assert.equal(q.boosts.spe, 0);
	});
	it('keeps the obsolete Speed drop absent during an ordinary queued turn', () => {
		const [p, q] = setup(); battle.makeChoices('move 1', 'move 4'); assert.equal(q.boosts.spe, 0);
		assert(!q.volatiles.grapplingclawslock); q.hp = 1000; assert.equal(battle.heal(100, q, q), 100);
		battle.runEvent('TrapPokemon', q); assert(!q.trapped); assert(p.hp > 0);
	});
	for (const kind of ['miss', 'protect', 'substitute', 'immune', 'special', 'noncontact', 'ally', 'ko']) it('does not activate on ' + kind, () => {
		const [p, q] = setup('Armaldo', 'Grappling Claws', true); let target = q;
		if (kind === 'protect') q.addVolatile('protect');
		if (kind === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 3500; }
		if (kind === 'immune') q.setType('Ghost');
		if (kind === 'ally') target = battle.p1.active[1];
		if (kind === 'ko') q.hp = 1;
		hit(p, target, 'tackle', { accuracy: kind === 'miss' ? 0 : true,
			category: kind === 'special' ? 'Special' : 'Physical',
			flags: kind === 'noncontact' ? { protect: 1 } : { contact: 1, protect: 1 } });
		assert.equal(target.boosts.spe, 0); assert.equal(p.m.draggingGripTurn, undefined);
	});
	it('does not lower either foe Speed after a spread move', () => {
		const [p, q] = setup('Armaldo', 'Grappling Claws', true);
		hit(p, q, 'tackle', { target: 'allAdjacentFoes', multihit: 3 });
		assert.equal(battle.p2.active.filter(t => t.boosts.spe === -1).length, 0);
	});
	for (const ability of ['Clear Body', 'Mirror Armor']) it('respects ' + ability, () => {
		const [p, q] = setup(); q.setAbility(ability); hit(p, q);
		assert.equal(q.boosts.spe, 0); assert.equal(p.boosts.spe, 0);
	});
	it('has no obsolete lock conditions', () => {
		for (const id of ['grapplingclawslock', 'grapplingclawsspent', 'grapplingclawsanchor']) assert(!Dex.data.Conditions[id]);
	});
	for (const ability of ['No Ability', 'Liquid Voice', 'Aurora Resonance', 'Protective Ward']) it('Lapras applies Liquid Voice once with selected ' + ability, () => {
		const [p, q] = setup('Lapras', ability);
		for (const field of ['', 'icyterrain']) {
			battle.field.terrain = field;
			const move = Dex.getActiveMove('hypervoice'); battle.runEvent('ModifyType', p, q, move, move);
			assert.equal(move.type, field ? 'Ice' : 'Water');
			assert.equal(battle.runEvent('BasePower', p, q, move, 100), field ? 180 : 120);
		}
	});
	it('Liquid Voice keeps full local conversion and power under suppression and through Transform', () => {
		const [p, q] = setup('Lapras', 'No Ability'); q.transformInto(p); assert.deepEqual(q.getPassives(), ['liquidvoice']);
		p.addVolatile('gastroacid'); q.setAbility('Neutralizing Gas');
		const move = Dex.getActiveMove('hypervoice'); battle.runEvent('ModifyType', p, q, move, move);
		assert.equal(move.type, 'Water'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 120);
	});
	it('Yanmega stays airborne through suppression while grounding still works', () => {
		const [p] = setup('Yanmega', 'Slipstream'); p.setType('Bug'); p.addVolatile('gastroacid');
		assert.equal(p.isGrounded(), null); p.addVolatile('smackdown'); assert.equal(p.isGrounded(), true);
		assert.equal(battle.singleEvent('Immunity', p.getAbility(), p.abilityState, p, null, 'Ground'), true);
	});
	it('Slipstream retains full Keen Eye and its original Tailwind trigger', () => {
		const [p, q] = setup('Yanmega', 'Slipstream');
		assert(p.hasAbility('keeneye')); assert(!p.hasAbility('levitate')); assert(p.hasAbilityOrPassive('levitate'));
		battle.boost({ accuracy: -1 }, p, q, Dex.moves.get('sandattack')); assert.equal(p.boosts.accuracy, 0);
		const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyMove', p, q, move, move); assert(move.ignoreEvasion);
		hit(p, q, 'airslash', { secondaries: null }); assert.equal(p.side.sideConditions.tailwind.duration, 3);
		p.side.sideConditions.tailwind.duration = 1; hit(p, q, 'airslash', { secondaries: null }); assert.equal(p.side.sideConditions.tailwind.duration, 1);
	});
	it('preserves generic copied Slipstream Levitate for nonrecipients', () => {
		const [p] = setup('Mew', 'Slipstream'); assert.equal(p.isGrounded(), null);
	});
	it('calculator damage matches single Liquid Voice and exposes both new passives', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Hyper Voice', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Lapras', ability: 'No Ability' };
		const result = calculateScenario(input); input.actors[0].ability = 'Liquid Voice';
		assert.deepEqual(calculateScenario(input).results, result.results);
		for (const [name, passive] of [['Lapras', 'liquidvoice'], ['Yanmega', 'levitate']]) assert.deepEqual(calculatorMetadata().species.find(s => s.name === name).passives, [passive]);
	});
});
