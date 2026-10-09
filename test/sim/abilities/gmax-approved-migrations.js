/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { GmaxPassiveSelections: grants } = require('../../../dist/data/gmax-passive-data');
let battle;
function setup(species, ability = Dex.species.get(species).abilities[0], doubles = false) {
	const set = (species, ability) => ({ species, ability, moves: ['splash', 'waterfall', 'shadowball', 'protect'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' },
		[[set(species, ability), set('Mew', 'No Ability')], [set('Mew', 'No Ability'), set('Mew', 'No Ability')]]);
	battle.makeChoices('team 12', 'team 12');
	const p = battle.p1.active[0], q = battle.p2.active[0];
	if (p.species.id !== Dex.species.get(species).id) p.formeChange(species, null, true);
	p.setAbility(ability); battle.field.terrain = ''; battle.field.weather = ''; battle.field.auraField = '';
	for (const side of battle.sides) for (const m of side.pokemon) m.hp = m.maxhp = m.baseMaxhp = 4000;
	return [p, q];
}
function attack(p, q, move, props = {}) {
	const m = { ...Dex.getActiveMove(move), ...props };
	battle.actions.useMove(m, p, { target: q });
	battle.runEvent('AfterMove', p, q, m);
	battle.faintMessages();
	return m;
}
describe('Approved Gmax migrations and selected redesigns', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('changes exactly 25 passive records, five selected slots and one Gmax typing', () => {
		let changed = 0;
		const slots = { kinglergmax: { 0: 'Crushing Depths' }, gengargmax: { 0: 'Afterlife Gate' }, meowthgmax: { 0: 'Technician', H: 'Unnerve' }, machampgmax: { 0: 'Raging Fists' }, machampgmaxalt: { 0: 'Raging Fists' } };
		for (const old of require('./gmax-selection-species-before.json')) {
			const s = Dex.species.get(old.id);
			assert.deepEqual(s.passives, grants[old.id] ? [grants[old.id]] : old.passives, old.id);
			assert.deepEqual(s.abilities, slots[old.id] || old.abilities, old.id);
			assert.deepEqual(s.types, old.id === 'kinglergmax' ? ['Water', 'Steel'] : old.types, old.id);
			if (grants[old.id]) changed++;
		}
		assert.equal(changed, 25);
	});
	for (const [species, passive] of Object.entries(grants)) it(species + ' retains its full passive under suppression and active ability replacement', () => {
		const [p, q] = setup(species);
		assert.deepEqual(p.getPassives(), [passive]);
		p.setAbility('Run Away'); p.addVolatile('gastroacid');
		assert(p.hasAbilityOrPassive(passive));
		q.setAbility('Neutralizing Gas'); assert(p.hasAbilityOrPassive(passive));
		p.removeVolatile('gastroacid'); assert(p.hasAbilityOrPassive(passive));
	});
	for (const [species, passive] of Object.entries(grants)) it(species + ' calculator damage agrees with one copy of its passive', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Bite', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: Dex.species.get(species).name, ability: 'No Ability' };
		const plain = calculateScenario(input); input.actors[0].ability = Dex.abilities.get(passive).name;
		assert.deepEqual(calculateScenario(input).results, plain.results);
	});
	it('Crushing Depths drops Defense only after all Water hits, once per Pokemon turn', () => {
		const [p, q] = setup('Kingler-Gmax');
		attack(p, q, 'waterfall', { multihit: 3, secondaries: null });
		assert.equal(q.boosts.def, -1);
		p.setAbility('No Ability'); p.setAbility('Crushing Depths');
		attack(p, q, 'waterfall', { secondaries: null }); assert.equal(q.boosts.def, -1);
		battle.turn++; attack(p, q, 'waterfall', { secondaries: null }); assert.equal(q.boosts.def, -2);
	});
	it('Crushing Depths excludes special Water, physical coverage and Substitute-only damage', () => {
		const [p, q] = setup('Kingler-Gmax');
		attack(p, q, 'surf'); attack(p, q, 'tackle'); assert.equal(q.boosts.def, 0);
		q.addVolatile('substitute'); q.volatiles.substitute.hp = 3000;
		attack(p, q, 'waterfall'); assert.equal(q.boosts.def, 0);
	});
	it('Crushing Depths obeys stat protection and reflection', () => {
		const [p, q] = setup('Kingler-Gmax'); q.setAbility('Clear Body');
		attack(p, q, 'waterfall', { secondaries: null }); assert.equal(q.boosts.def, 0);
		battle.turn++; q.setAbility('Mirror Armor'); attack(p, q, 'waterfall', { secondaries: null });
		assert.equal(q.boosts.def, 0); assert.equal(p.boosts.def, -1);
	});
	it('Crushing Depths boosts only physical Steel against already-negative Defense', () => {
		const [p, q] = setup('Kingler-Gmax');
		const power = move => battle.runEvent('ModifyDamage', p, q, Dex.getActiveMove(move), 100);
		assert.equal(power('ironhead'), 100); q.boosts.def = -1;
		assert.equal(power('ironhead'), 130); assert.equal(power('flashcannon'), 100); assert.equal(power('waterfall'), 100);
	});
	it('Afterlife Gate applies one owned ability Curse without an HP cost after special Ghost/Poison damage', () => {
		const [p, q] = setup('Gengar-Gmax');
		attack(p, q, 'shadowball', { multihit: 3, secondaries: null });
		assert(q.volatiles.curse); assert.equal(q.volatiles.curse.source, p);
		assert.equal(q.volatiles.curse.sourceEffect.id, 'afterlifegate'); assert.equal(p.hp, 4000);
		const hp = q.hp; battle.singleEvent('Residual', Dex.conditions.get('curse'), q.volatiles.curse, q);
		assert.equal(hp - q.hp, 500);
		q.removeVolatile('curse'); p.setAbility('No Ability'); p.setAbility('Afterlife Gate');
		attack(p, q, 'sludgebomb', { secondaries: null }); assert(!q.volatiles.curse);
		battle.turn++; attack(p, q, 'sludgebomb', { secondaries: null }); assert(q.volatiles.curse);
	});
	it('Afterlife Gate excludes physical Ghost, special coverage and Substitute-only damage', () => {
		const [p, q] = setup('Gengar-Gmax');
		attack(p, q, 'shadowclaw'); attack(p, q, 'surf'); assert(!q.volatiles.curse);
		q.addVolatile('substitute'); q.volatiles.substitute.hp = 3000; attack(p, q, 'shadowball'); assert(!q.volatiles.curse);
	});
	it('Afterlife Gate never overwrites another Curse', () => {
		const [p, q] = setup('Gengar-Gmax'); q.addVolatile('curse', p, Dex.abilities.get('cursedbody'));
		attack(p, q, 'shadowball'); assert.equal(q.volatiles.curse.sourceEffect.id, 'cursedbody');
	});
	it('Afterlife Gate heals on its own attack knockout, at most once per turn', () => {
		const [p, q] = setup('Gengar-Gmax', 'Afterlife Gate', true); p.hp = 1000; q.hp = 1;
		attack(p, q, 'surf'); assert.equal(p.hp, 1500);
		const other = battle.p2.active[1]; other.hp = 1; attack(p, other, 'shadowball'); assert.equal(p.hp, 1500);
	});
	it('Afterlife Gate heals only for its owned Curse knockout', () => {
		const [p, q] = setup('Gengar-Gmax'); p.hp = 1000;
		attack(p, q, 'shadowball', { secondaries: null }); q.hp = 100;
		battle.singleEvent('Residual', Dex.conditions.get('curse'), q.volatiles.curse, q); battle.faintMessages();
		assert.equal(p.hp, 1500);
	});
	for (const effect of ['cursedbody', 'curse']) it('Afterlife Gate does not claim ' + effect + ' Curse knockouts', () => {
		const [p, q] = setup('Gengar-Gmax'); p.hp = 1000;
		q.addVolatile('curse', p, effect === 'curse' ? Dex.moves.get(effect) : Dex.abilities.get(effect)); q.hp = 100;
		battle.singleEvent('Residual', Dex.conditions.get('curse'), q.volatiles.curse, q); battle.faintMessages(); assert.equal(p.hp, 1000);
	});
	it('Afterlife Gate retains full local Shadow Shield at low HP without raw stat inflation', () => {
		const [p, q] = setup('Gengar-Gmax'); p.hp = 1000;
		for (const [mod, expected] of [[0, 80], [1, 60]]) {
			const move = Dex.getActiveMove('surf'); p.getMoveHitData(move).typeMod = mod;
			assert.equal(battle.runEvent('ModifyDamage', q, p, move, 100), expected);
		}
		assert.equal(battle.runEvent('ModifyDef', p, q, Dex.getActiveMove('tackle'), 100), 100);
		battle.field.terrain = 'coldeclipseterrain'; assert.equal(battle.runEvent('Immunity', p, null, null, 'hail'), false);
		assert(!p.hasAbility('shadowtag')); assert(!p.hasAbility('soulstrike'));
	});
	it('Cursed Body faint Curse does not revive its fainted Afterlife Gate owner', () => {
		const [p, q] = setup('Gengar-Gmax'); p.hp = 1;
		attack(q, p, 'shadowball'); assert(p.fainted); assert(q.volatiles.curse);
		assert.equal(q.volatiles.curse.sourceEffect.id, 'cursedbody');
		q.hp = 1; battle.singleEvent('Residual', Dex.conditions.get('curse'), q.volatiles.curse, q); battle.faintMessages(); assert.equal(p.hp, 0);
	});
	it('native Volt Absorb heals once and the excluded Aevian shared user keeps it', () => {
		for (const species of ['Toxtricity-Gmax', 'Toxtricity-Aevian-Gmax']) {
			const [p, q] = setup(species); p.hp = 1000;
			attack(q, p, 'thunderbolt'); assert.equal(p.hp, 2000, species);
			battle.field.terrain = 'electricterrain'; battle.runEvent('Residual', p); assert.equal(p.hp, 2250, species);
			battle.destroy(); battle = null;
		}
	});
	it('Cold Eclipse Flame Body entry is exactly +1 Def/SpD for both native composites', () => {
		for (const species of ['Coalossal-Gmax', 'Centiskorch-Gmax']) {
			const [p] = setup('Mew'); battle.field.terrain = 'coldeclipseterrain';
			p.formeChange(species, null, true); assert.equal(p.boosts.def, 1, species); assert.equal(p.boosts.spd, 1, species);
			battle.destroy(); battle = null;
		}
	});
	it('Corviknight gains one Sworn Duty ally heal, retaining Pressure stat drops', () => {
		const [p, q] = setup('Mew', 'No Ability', true), ally = battle.p1.active[1]; ally.hp = 1000;
		p.formeChange('Corviknight-Gmax', null, true); assert.equal(ally.hp, 2000); assert.equal(q.boosts.def, -1);
	});
	it('Strong Jaw is a single modifier with War Ship or the same selected ability', () => {
		const [p, q] = setup('Drednaw-Gmax');
		for (const ability of ['War Ship', 'Strong Jaw', 'No Ability']) {
			p.setAbility(ability); assert.equal(battle.runEvent('BasePower', p, q, Dex.getActiveMove('bite'), 100), 150);
		}
	});
	it('native Phantom Barrage Levitate persists through suppression and grounding still works', () => {
		const [p] = setup('Dragapult-Gmax'); p.addVolatile('gastroacid'); assert.equal(p.isGrounded(), null);
		p.addVolatile('smackdown'); assert.equal(p.isGrounded(), true);
	});
	it('native Self-Sufficient heals once and Wicked Snare adds only one priority stage', () => {
		const [p, q] = setup('Dipplin-Gmax'); p.hp = 1000; battle.runEvent('Residual', p); assert.equal(p.hp, 1250);
		p.formeChange('Grimmsnarl-Gmax', null, true);
		assert.equal(battle.runEvent('ModifyPriority', p, q, Dex.getActiveMove('splash'), 0), 1);
	});
	it('real calculator Gmax transformation acquires the new passive and selected ability', () => {
		const { buildCalculatorBattle, validateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9factoryfield', move: 'Waterfall', actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		input.actors[0] = { species: 'Kingler', gimmick: 'gmax' };
		const result = buildCalculatorBattle(validateScenario(input), 0); battle = result.battle;
		const p = battle.p1.active[0]; assert.equal(p.species.id, 'kinglergmax'); assert.equal(p.ability, 'crushingdepths');
		assert.deepEqual(p.getPassives(), ['swiftswim']); assert.deepEqual(p.types, ['Water', 'Steel']);
	});
	it('normal queued turns finish Crushing Depths and Afterlife Gate without synthetic completion', () => {
		for (const [species, choice, volatile] of [['Kingler-Gmax', 'move 2', false], ['Gengar-Gmax', 'move 3', true]]) {
			const [p, q] = setup(species); battle.makeChoices(choice, 'move 1');
			if (volatile) assert(q.volatiles.curse); else assert.equal(q.boosts.def, -1);
			assert(p.hp > 0); battle.destroy(); battle = null;
		}
	});
	it('Transform takes the Gmax passive and later form changes replace it', () => {
		const [p, q] = setup('Drednaw-Gmax'); q.transformInto(p);
		assert.deepEqual(q.getPassives(), ['strongjaw']); q.formeChange('Kingler-Gmax', null, true);
		assert.deepEqual(q.getPassives(), ['swiftswim']);
	});
	it('Friend Guard and Heavy Metal retain exactly one passive multiplier', () => {
		const [p, q] = setup('Alcremie-Gmax', 'Sweet Sanctuary', true), ally = battle.p1.active[1];
		assert.equal(battle.runEvent('ModifyDamage', q, ally, Dex.getActiveMove('tackle'), 100), 75);
		p.formeChange('Copperajah-Gmax', null, true);
		assert.equal(battle.runEvent('Damage', p, q, Dex.getActiveMove('tackle'), 100), 50);
		assert.equal(battle.runEvent('ModifyWeight', p, null, null, 100), 200);
	});
	it('Frisk entry rolls once per opposing held item', () => {
		const [p, q] = setup('Mew'); q.setItem('Leftovers'); let rolls = 0;
		battle.randomChance = () => { rolls++; return false; };
		p.formeChange('Orbeetle-Gmax', null, true); assert.equal(rolls, 1);
	});
	it('misses, protection and immunity cannot trigger either redesign', () => {
		for (const [species, move] of [['Kingler-Gmax', 'waterfall'], ['Gengar-Gmax', 'shadowball']]) {
			const [p, q] = setup(species);
			attack(p, q, move, { accuracy: 0 }); q.addVolatile('protect'); attack(p, q, move); q.removeVolatile('protect');
			q.setAbility(move === 'waterfall' ? 'Water Absorb' : 'No Ability'); if (move === 'shadowball') q.setType('Normal');
			attack(p, q, move); assert.equal(q.boosts.def, 0); assert(!q.volatiles.curse);
			battle.destroy(); battle = null;
		}
	});
	it('spread attacks affect only one surviving opposing target per turn', () => {
		for (const [species, move] of [['Kingler-Gmax', 'waterfall'], ['Gengar-Gmax', 'shadowball']]) {
			const [p, q] = setup(species, undefined, true);
			attack(p, q, move, { target: 'allAdjacentFoes', secondaries: null });
			const affected = battle.p2.active.filter(t => move === 'waterfall' ? t.boosts.def === -1 : t.volatiles.curse);
			assert.equal(affected.length, 1); battle.destroy(); battle = null;
		}
	});
});
