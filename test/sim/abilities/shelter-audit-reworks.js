/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(species = 'Masquerain', ability = 'Scale Shelter', doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['quiverdance', 'splash', 'tackle', 'instruct'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[set(species, ability), set()], [set(), set()]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	p.setAbility(ability); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const mon of side.pokemon) mon.hp = mon.maxhp = mon.baseMaxhp = 4000;
	return [p, q];
}
function hit(p, q, id = 'tackle', props = {}, sourceEffect) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null }, props);
	battle.actions.useMove(move, p, { target: q, sourceEffect });
	battle.runEvent('AfterMove', p, q, move); return move;
}
describe('Approved Shelter, Rough Scale and audit fixes', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('Includes lists retained full components separately from passives and custom priority', () => {
		const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');
		assert.deepEqual(getAbilityDisplayComponents('roughscale', ['roughskin'], 'druddigon'), ['toughclaws']);
		assert.deepEqual(getAbilityDisplayComponents('astralwatcher', ['frisk'], 'orbeetlegmax'), []);
		assert.deepEqual(getAbilityDisplayComponents('baitedbloom', ['stickyhold'], 'victreebel'), ['gluttony', 'regenerator']);
	});
	it('grants one ward on a successful queued Quiver Dance, without evasion', () => {
		const [p] = setup(); battle.makeChoices('move 1', 'move 2');
		assert(p.volatiles.scaleshelterward); assert(p.volatiles.scaleshelterspent); assert.equal(p.boosts.evasion, 0);
		assert.deepEqual(p.getPassives(), ['prismskimmer']); assert(p.hasAbility('overcoat'));
	});
	it('reduces every hit of a whole opposing attack, then expires', () => {
		const [p, q] = setup(); hit(p, p, 'quiverdance');
		const hp = p.hp, during = [];
		hit(q, p, 'tackle', { damage: 100, multihit: 3, onAfterHit() { during.push(p.hp); } });
		assert.deepEqual(during, [hp - 80, hp - 160, hp - 240]); assert(!p.volatiles.scaleshelterward);
		hit(q, p, 'tackle', { damage: 100 }); assert.equal(p.hp, hp - 340);
		p.setAbility('No Ability'); p.setAbility('Scale Shelter'); hit(p, p, 'quiverdance'); assert(!p.volatiles.scaleshelterward);
	});
	for (const kind of ['miss', 'protect', 'immune', 'substitute', 'zero', 'ally']) it('ward is preserved by ' + kind, () => {
		const [p, q] = setup('Masquerain', 'Scale Shelter', true); hit(p, p, 'quiverdance');
		if (kind === 'protect') p.addVolatile('protect');
		if (kind === 'immune') p.setType('Ghost');
		if (kind === 'substitute') { p.addVolatile('substitute'); p.volatiles.substitute.hp = 3000; }
		const hp = p.hp;
		if (kind === 'zero') battle.damage(0, p, q, Dex.getActiveMove('tackle'));
		else hit(kind === 'ally' ? battle.p1.active[1] : q, p, 'tackle', { damage: 100, accuracy: kind === 'miss' ? 0 : true });
		assert(p.volatiles.scaleshelterward); assert.equal(p.hp, hp - (kind === 'ally' ? 100 : 0));
	});
	it('failed maxed Quiver Dance does not use its allowance', () => {
		const [p] = setup(); p.boosts.spa = p.boosts.spd = p.boosts.spe = 6; hit(p, p, 'quiverdance');
		assert(!p.volatiles.scaleshelterspent); p.boosts.spe = 5; hit(p, p, 'quiverdance'); assert(p.volatiles.scaleshelterward);
	});
	for (const caller of ['sleeptalk', 'copycat', 'metronome', 'dancer', 'instruct']) it('does not grant a ward to Quiver Dance called by ' + caller, () => {
		const [p] = setup(); hit(p, p, 'quiverdance', { sourceEffect: caller });
		assert(!p.volatiles.scaleshelterspent); assert.equal(p.boosts.spa, 1);
	});
	it('actual Instruct queues a called dance without granting a ward', () => {
		const [p, q] = setup(); p.setAbility('No Ability'); battle.makeChoices('move 1', 'move 2'); p.setAbility('Scale Shelter');
		q.storedStats.spe = 2000; p.storedStats.spe = 1;
		battle.makeChoices('move 2', 'move 4'); assert(!p.volatiles.scaleshelterspent);
		assert.equal(p.boosts.spa, 2);
	});
	it('switching resets the ward allowance and drops an unused ward', () => {
		const [p] = setup(); hit(p, p, 'quiverdance'); battle.makeChoices('switch 2', 'move 2');
		assert(!p.volatiles.scaleshelterward); battle.makeChoices('switch 2', 'move 2');
		hit(p, p, 'quiverdance'); assert(p.volatiles.scaleshelterward);
	});
	it('a ward is not copied by Transform', () => {
		const [p, q] = setup(); hit(p, p, 'quiverdance'); q.transformInto(p); assert(!q.volatiles.scaleshelterward);
	});
	it('blocked Quiver Dance boosts do not grant a ward', () => {
		const [p] = setup();
		battle.onEvent('TryBoost', battle.format, boost => { for (const stat of Object.keys(boost)) delete boost[stat]; });
		hit(p, p, 'quiverdance'); assert(!p.volatiles.scaleshelterspent);
	});
	it('Rough Scale raises Defense only after the entire resisted move, once per entry', () => {
		const [p, q] = setup('Druddigon', 'Rough Scale'); const during = [];
		hit(q, p, 'ember', { multihit: 3, onAfterHit() { during.push(p.boosts.def); } });
		assert.deepEqual(during, [0, 0, 0]); assert.equal(p.boosts.def, 1);
		p.setAbility('No Ability'); p.setAbility('Rough Scale'); hit(q, p, 'ember'); assert.equal(p.boosts.def, 1);
		assert.deepEqual(p.getPassives(), ['roughskin']);
		assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100), 130);
	});
	for (const kind of ['neutral', 'super', 'substitute', 'miss', 'protect', 'ally', 'zero']) it('Rough Scale does not activate on ' + kind, () => {
		const [p, q] = setup('Druddigon', 'Rough Scale', true);
		p.setType('Dragon');
		if (kind === 'substitute') { p.addVolatile('substitute'); p.volatiles.substitute.hp = 3000; }
		if (kind === 'protect') p.addVolatile('protect');
		if (kind === 'zero') battle.damage(0, p, q, Dex.getActiveMove('ember'));
		else hit(kind === 'ally' ? battle.p1.active[1] : q, p, kind === 'neutral' ? 'tackle' : kind === 'super' ? 'icebeam' : 'ember',
			{ accuracy: kind === 'miss' ? 0 : true });
		assert.equal(p.boosts.def, 0); assert(!p.volatiles.roughscalespent);
	});
	it('Rough Scale uses normal max-stage rules', () => {
		const [p, q] = setup('Druddigon', 'Rough Scale'); p.boosts.def = 6; hit(q, p, 'ember');
		assert.equal(p.boosts.def, 6); assert(p.volatiles.roughscalespent);
	});
	it('Rough Scale obeys boost prevention and spends the entry allowance once', () => {
		const [p, q] = setup('Druddigon', 'Rough Scale');
		battle.onEvent('TryBoost', battle.format, boost => { delete boost.def; });
		hit(q, p, 'ember'); assert.equal(p.boosts.def, 0); assert(p.volatiles.roughscalespent);
	});
	it('Rough Scale resets on real reentry and cannot boost a fainted holder', () => {
		const [p, q] = setup('Druddigon', 'Rough Scale'); hit(q, p, 'ember'); assert.equal(p.boosts.def, 1);
		battle.makeChoices('switch 2', 'move 2'); battle.makeChoices('switch 2', 'move 2');
		hit(q, p, 'ember'); assert.equal(p.boosts.def, 1);
		p.removeVolatile('roughscalespent'); p.hp = 1; p.boosts.def = 0;
		hit(q, p, 'ember'); assert.equal(p.hp, 0); assert.equal(p.boosts.def, 0);
	});
	it('fixed damage without resistance metadata does not activate Rough Scale', () => {
		const [p, q] = setup('Druddigon', 'Rough Scale');
		hit(q, p, 'seismictoss'); assert.equal(p.boosts.def, 0); assert(!p.volatiles.roughscalespent);
	});
	it('Phantom Barrage Clear Body is bypassed by Mold Breaker, unless Ability Shield protects it', () => {
		const [p, q] = setup('Dragapult-Gmax', 'Phantom Barrage'); q.setAbility('Mold Breaker');
		hit(q, p, 'growl'); assert.equal(p.boosts.atk, -1);
		p.setItem('Ability Shield'); hit(q, p, 'growl'); assert.equal(p.boosts.atk, -1);
	});
	for (const ability of ['Solar Trap', 'Digestive Sap', 'No Ability']) it('Mega Victreebel drains exactly once with selected ' + ability, () => {
		const [p, q] = setup('Victreebel-Mega', ability); p.hp = 1000;
		hit(p, q, 'sludgebomb', { damage: 300 }); assert.equal(p.hp, 1100);
		hit(p, q, 'sludgebomb', { damage: 300, multihit: 5 }); assert.equal(p.hp, 1500);
		assert.deepEqual(p.getPassives(), ['digestivesap']);
	});
	it('Digestive Sap stays passive under suppression and Transform; base also has Digestive Sap', () => {
		const [p, q] = setup('Victreebel-Mega', 'Solar Trap'); p.addVolatile('gastroacid'); p.hp = 1000;
		hit(p, q, 'sludgebomb', { damage: 300 }); assert.equal(p.hp, 1100);
		q.transformInto(p); assert.deepEqual(q.getPassives(), ['digestivesap']);
		assert.deepEqual(Dex.species.get('victreebel').passives, ['digestivesap']);
		assert(!Dex.abilities.get('solartrap').onAnyAfterDamageApplied); assert(!p.hasAbilityOrPassive('innardsout'));
	});
	for (const kind of ['healblock', 'ooze', 'substitute', 'nativeDrain', 'delayed']) it('Digestive Sap respects ' + kind, () => {
		const [p, q] = setup('Victreebel-Mega', 'No Ability'); p.hp = 1000;
		if (kind === 'healblock') p.addVolatile('healblock');
		if (kind === 'ooze') q.setAbility('Liquid Ooze');
		if (kind === 'substitute') { q.addVolatile('substitute'); q.volatiles.substitute.hp = 3000; }
		hit(p, q, 'sludgebomb', { damage: 300, ...(kind === 'nativeDrain' ? { drain: [1, 2] } : {}), ...(kind === 'delayed' ? { flags: { futuremove: 1 } } : {}) });
		assert.equal(p.hp, kind === 'ooze' ? 900 : kind === 'nativeDrain' ? 1150 : 1000);
	});
	it('Phantom Barrage blocks opposing and allied drops once, permits self drops and respects suppression', () => {
		const [p, q] = setup('Dragapult-Gmax', 'Phantom Barrage', true);
		battle.boost({ atk: -1, def: -1 }, p, q, Dex.moves.get('growl')); assert.equal(p.boosts.atk, 0); assert.equal(p.boosts.def, 0);
		battle.boost({ atk: -1 }, p, battle.p1.active[1], Dex.moves.get('growl')); assert.equal(p.boosts.atk, 0);
		battle.boost({ atk: -1 }, p, p, Dex.moves.get('superpower')); assert.equal(p.boosts.atk, -1);
		p.addVolatile('gastroacid'); battle.boost({ atk: -1 }, p, q, Dex.moves.get('growl')); assert.equal(p.boosts.atk, -2);
		assert.deepEqual(p.getPassives(), ['levitate']);
	});
	it('Astral Watcher has custom priority without Defragment or Prankster move tagging', () => {
		const [p, q] = setup('Orbeetle-Gmax', 'Astral Watcher'); const move = Dex.getActiveMove('toxic');
		assert(!p.hasAbility('defragment')); assert(!Dex.abilities.get('astralwatcher').onModifyMove);
		assert.equal(battle.runEvent('ModifyPriority', p, q, move, 0), 1);
		battle.runEvent('ModifyMove', p, q, move, move); assert(!move.pranksterBoosted);
		assert.deepEqual(p.getPassives(), ['frisk']);
	});
	it('calculator uses Digestive Sap once and does not assume an unearned Scale Shelter ward', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Sludge Bomb', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Victreebel-Mega', ability: 'No Ability', hpPercent: 30 };
		const single = calculateScenario(input); input.actors[0].ability = 'Digestive Sap';
		assert.deepEqual(calculateScenario(input).results, single.results);
		input.move = 'Tackle'; input.actors[0] = { species: 'Mew', ability: 'No Ability' };
		input.actors[2] = { species: 'Masquerain', ability: 'Scale Shelter' };
		const fresh = calculateScenario(input); input.actors[2].ability = 'No Ability';
		assert.deepEqual(calculateScenario(input).results, fresh.results);
		assert.deepEqual(calculatorMetadata().species.find(s => s.name === 'Victreebel-Mega').passives, ['digestivesap']);
	});
});
