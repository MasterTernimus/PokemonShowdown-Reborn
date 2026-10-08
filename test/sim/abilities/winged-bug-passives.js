'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { WingedBugPassiveForms, SpeciesPassives } = require('../../../dist/data/species-passives');
const traits = id => id === 'butterfree' ? ['shielddust'] : ['levitate'];
let battle;
function setup(id, ability = Dex.species.get(id).abilities[0], foe = 'No Ability') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: id, ability, moves: ['splash'], item: '' }, { species: 'Chansey', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Chansey', ability: foe, moves: ['splash'] }]]);
	battle.makeChoices('team 12', 'team 1'); battle.field.terrain = '';
	battle.randomChance = (numerator, denominator) => numerator >= denominator;
	for (const side of battle.sides) for (const p of side.active) p.hp = p.maxhp = p.baseMaxhp = 10000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function attack(name, source, target, secondary = false) {
	const m = Dex.getActiveMove(name); m.basePower = 1; m.accuracy = true;
	if (secondary) m.secondaries = [{ chance: 100, status: 'par' }];
	battle.actions.useMove(m, source, { target }); battle.clearActiveMove();
}
describe('Exact five winged bug passive forms', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('adds only four holders and extends base Butterfree without changing stats, types or moves; applies only approved support slots', () => {
		assert.deepEqual(WingedBugPassiveForms, ['beedrill', 'beedrillmega', 'butterfree', 'butterfreemega', 'butterfreegmax']);
		assert.equal(Object.keys(SpeciesPassives).length, 700);
		for (const old of require('./winged-bug-before.json')) {
			const s = Dex.species.get(old.id); assert.deepEqual(s.passives, traits(old.id));
			const expectedAbilities = { ...old.abilities };
			if (old.id === 'butterfree') expectedAbilities[0] = 'Gentle Scales';
			if (old.id === 'beedrill') expectedAbilities[0] = 'Hive Courier';
			assert.deepEqual(s.abilities, expectedAbilities);
			for (const k of ['types', 'baseStats', 'weightkg']) assert.deepEqual(s[k], old[k], old.id + k);
			assert.deepEqual(Dex.species.getLearnsetData(old.id).learnset, old.learnset);
		}
		for (const id of ['weedle', 'kakuna', 'caterpie', 'metapod']) assert.deepEqual(Dex.species.get(id).passives, []);
		assert.deepEqual(Dex.species.get('butterfree').abilities, { '0': 'Gentle Scales', '1': 'Tinted Lens', H: 'Magic Guard' });
	});
	for (const id of WingedBugPassiveForms) {
        const pair = traits(id);
		it(id + ' keeps both passives through suppression and active ability replacement', () => {
			const [p, t] = setup(id);
			for (const state of ['normal', 'gastroacid', 'meridianseal', 'gas', 'replacement']) {
				if (state === 'gas') t.setAbility('Neutralizing Gas');
				else if (state === 'replacement') {
					t.setAbility('No Ability');
					p.setAbility('Pressure');
				} else if (state !== 'normal') {
					p.addVolatile(state);
				}
				assert.deepEqual(p.getPassives(), pair); assert(!p.isGrounded());
				attack('thunderbolt', t, p, true); assert.equal(p.status, id === 'butterfree' || (state === 'normal' && p.hasAbility('shielddust')) ? '' : 'par');p.cureStatus();
				if (state === 'gastroacid' || state === 'meridianseal') p.removeVolatile(state);
			}
			t.setAbility('Pressure'); battle.actions.useMove('skillswap', p, { target: t });
			assert.deepEqual(p.getPassives(), pair); assert.deepEqual(t.getPassives(), []);
		});
		it(id + ' honors every grounding override without a hardcoded immunity', () => {
			const [p, t] = setup(id);
			for (const ground of ['gravity', 'smackdown', 'ironball', 'ingrain']) {
				if (ground === 'gravity') battle.field.addPseudoWeather('gravity', t);
				else if (ground === 'ironball') p.setItem('Iron Ball'); else p.addVolatile(ground, t);
				assert.equal(p.isGrounded(), true, ground); const hp = p.hp;
				attack('earthquake', t, p); assert(p.hp < hp, ground);
				if (ground === 'gravity') battle.field.removePseudoWeather('gravity');
				else if (ground === 'ironball') p.clearItem(); else p.removeVolatile(ground);
				assert(!p.isGrounded());
			}
			const hp = p.hp; attack('thousandarrows', t, p);
			assert(p.hp < hp); assert(p.volatiles.smackdown);
		});
		for (const shield of [false, true]) it(id + ' attack-scoped bypass with Ability Shield = ' + shield, () => {
			const [p, t] = setup(id, 'Pressure', 'Mold Breaker'); p.addVolatile('gastroacid');
			if (shield) p.setItem('Ability Shield');
			// Ground typing is separate from Levitate: remove Flying only for this isolation test.
			p.setType('Bug'); const hp = p.hp; attack('earthquake', t, p);
			assert.equal(p.hp < hp, id === 'butterfree' || !shield); attack('thunderbolt', t, p, true); assert.equal(p.status, id === 'butterfree' && shield ? '' : 'par');
			assert.equal(!!p.isGrounded(), id === 'butterfree');
		});
		it(id + ' copies actual passives with Transform and keeps Illusion private', () => {
			const [p, t] = setup(id); assert(t.transformInto(p)); assert.deepEqual(t.getPassives(), pair);
			t.formeChange('Chansey', null, true); assert.deepEqual(t.getPassives(), []);
			p.illusion = battle.p1.pokemon[1]; const start = battle.log.length;
			p.runImmunity('Ground', true); assert(!battle.log.slice(start).join('\n').includes('Levitate'));
			assert.deepEqual(p.getPassives(), []);
		});
	}
	for (const id of ['spiralevolution', 'toxicevolution', 'mythicscale']) it(id + ' restores selected Shield Dust without copying passive Levitate', () => {
		const a = Dex.abilities.get(id); assert(!a.onImmunity); assert(a.onModifySecondaries);
		const [p, t] = setup('Mew', a.name); assert.equal(p.isGrounded(), true);
		assert(p.hasAbility('shielddust'));assert(!p.hasAbility('levitate'));
		const hp = p.hp; attack('earthquake', t, p); assert(p.hp < hp);
		attack('thunderbolt', t, p, true); assert.equal(p.status, '');
	});
	for (const [species, item, gimmick, expected] of [
		['Beedrill', 'Beedrillite', 'mega', 'beedrillmega'],
		['Butterfree', 'Dawn Stone', 'mega', 'butterfreemega'],
		['Butterfree', '', 'gmax', 'butterfreegmax'],
	]) it(species + ' real ' + gimmick + ' transition retains the approved calculator passive', () => {
		const { buildCalculatorBattle, validateScenario } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9factoryfield', move: 'Tackle', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Chansey', ability: 'No Ability' })) };
		input.actors[0] = { species, item, gimmick, ability: Dex.species.get(species).abilities[0] };
		const calc = buildCalculatorBattle(validateScenario(input), 0).battle;
		try {
			assert.equal(calc.p1.active[0].species.id, expected);
			assert.deepEqual(calc.p1.active[0].getPassives(), traits(expected));
		} finally {
			calc.destroy();
		}
	});
	for (const id of WingedBugPassiveForms) it(id + ' calculator blocks Ground damage without doubling selected Levitate', () => {
		const { calculateScenario, calculatorMetadata } = require('../../../dist/sim/custom-calculator');
		const input = { format: 'gen9nofieldsinglesgame', move: 'Earth Power', samples: 8, seed: 42,
			actors: Array.from({ length: 4 }, () => ({ species: 'Chansey', ability: 'No Ability' })) };
		input.actors[1] = { species: Dex.species.get(id).name, ability: 'No Ability' };
		const plain = calculateScenario(input); assert.equal(plain.results[1].max, 0);
		input.actors[1].ability = 'Levitate'; assert.deepEqual(calculateScenario(input).results, plain.results);
		assert.deepEqual(calculatorMetadata().species.find(s => Dex.species.get(s.name).id === id).passives, traits(id));
	});
});
