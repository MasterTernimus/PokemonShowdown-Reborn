'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const { SpeciesPassives, RelicArmorPassiveForms } = require('../../../dist/data/species-passives');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');
const { calculatorMetadata, calculateScenario } = require('../../../dist/sim/custom-calculator');
let battle;
function setup(species = 'Omastar', ability = 'No Ability') {
	const mon = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'transform', 'skillswap'] });
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]);
	battle.makeChoices('team 123', 'team 123');
	battle.field.terrain = '';
	return [battle.p1.active[0], battle.p2.active[0]];
}
function mod(p, t, crit = false) {
	const m = Dex.getActiveMove('tackle');
	return battle.runEvent(crit ? 'CriticalHit' : 'ModifyDamage', crit ? p : t, crit ? null : p, m, crit ? undefined : 100);
}
describe('Exact Relic Armor species passive migration', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	const replacements = { laprasaevian: ['H', 'Telepathy'], omastar: ['H', 'Compound Eyes'], kabutops: ['H', 'Moxie'], aerodactyl: ['H', 'Opportunist'], cradily: ['1', 'Harvest'], armaldo: ['0', 'Grappling Claws'], relicanth: ['1', 'Unaware'], rampardos: ['1', 'Mold Breaker'], bastiodon: ['1', 'Stalwart'], carracosta: ['0', 'Dredger'], tyrantrum: ['1', 'Unnerve'], aurorus: ['1', 'Serene Grace'] };
	for (const [id, [slot, ability]] of Object.entries(replacements))
		it(id + ' gets exactly its settled replacement and passive', () => {
			assert.equal(Dex.species.get(id).abilities[slot], ability);
			assert.deepEqual(Dex.species.get(id).passives, ['relicarmor']);
		});
	it('adds exactly fifteen recipients without broadening form inheritance or previous passives', () => {
		const before = require('./relic-armor-before.json');
		assert.equal(RelicArmorPassiveForms.length, 15);
		assert.equal(Object.keys(SpeciesPassives).length, 820);
		const approved = {};
		for (const [passive, ids] of Object.entries(require('./regional-passives-approved.json').groups)) for (const id of ids) approved[id] = [passive];
		for (const [passive, ids] of Object.entries(require('./kanto-johto-before.json').groups)) for (const id of ids) approved[id] = [passive];
		require('./passive-approval-overlays').passives(approved);
		for (const p of Dex.species.all())
			assert.deepEqual(p.passives, require('./passive-approval-overlays').current(p.id, approved[p.id] || (RelicArmorPassiveForms.includes(p.id) ? [...(before.passives[p.id] || []), 'relicarmor'] : before.passives[p.id] || [])), p.id);
		for (const id of ['omanyte', 'kabuto', 'tirtouga', 'amaura', 'tyrunt', 'lileep', 'anorith', 'lapras', 'aerodactylzombie'])
			assert(!Dex.species.get(id).passives.includes('relicarmor'));
	});
	for (const id of RelicArmorPassiveForms)
		it(id + ' keeps 20% reduction/crit immunity through suppression and active-ability copying', () => {
			const [p, t] = setup(id);
			assert.equal(mod(p, t), 80);
			assert.equal(mod(p, t, true), false);
			p.addVolatile('gastroacid');
			assert.equal(mod(p, t), 80);
			p.removeVolatile('gastroacid');
			t.setAbility('Neutralizing Gas');
			assert.equal(mod(p, t), 80);
			t.setAbility('No Ability');
			p.setAbility('Relic Armor');
			assert.equal(mod(p, t), 80);
			assert.equal(mod(p, t, true), false);
			p.setAbility('Pressure');
			assert.deepEqual(p.getPassives(), ['relicarmor']);
		});
	for (const field of ['desertterrain', 'fairytaleterrain', 'caveterrain', 'crystalcavernterrain', 'newworldterrain', 'volcanicterrain'])
		it(field + ' retains the entry defensive boost exactly once', () => {
			const [p] = setup();
			battle.field.setTerrain(field, p);
			p.boosts.def = 0;
			p.boosts.spd = 0;
			battle.runEvent('SwitchIn', p);
			assert.equal(p.boosts.def, 1);
			assert.equal(p.boosts.spd, 1);
		});
	it('preserves Rock weakness cancellation, reactive boosts, healing and weather immunity', () => {
		const [p, t] = setup();
		assert.equal(p.runEffectiveness(Dex.getActiveMove('energyball')), 1);
		battle.boost({ atk: -1, spe: -1 }, p, t);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 1);
		p.hp = Math.floor(p.maxhp / 2);
		const hp = p.hp;
		battle.eachEvent('Residual');
		assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 16));
		assert.equal(battle.runEvent('Immunity', p, null, null, 'sandstorm'), false);
	});
	it('does not duplicate Shell/Battle Armor reduction but preserves their distinct stat responses', () => {
		const [p, t] = setup('Lapras-Aevian', 'Protective Ward');
		assert.equal(mod(p, t), 80);
		battle.boost({ atk: -1 }, p, t);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 3);
		p.formeChange('Armaldo');
		p.setAbility('Primeval Hunt');
		p.clearBoosts();
		assert.equal(mod(p, t), 80);
		battle.boost({ atk: -1 }, p, t);
		assert.equal(p.boosts.def, 3);
		assert.equal(p.boosts.spd, 1);
	});
	it('keeps the three Mega composites without migrated callbacks or Includes', () => {
		for (const id of ['apexpredator', 'tyrantdomain', 'auroradomain'])
			assert(!getAbilityDisplayComponents(id).some(x => ['relicarmor', 'selfsufficient'].includes(x)), id);
		const [p, t] = setup('Aerodactyl-Mega', 'Apex Predator');
		assert.equal(mod(p, t), 80);
		assert.equal(p.isGrounded(), false);
	});
	it('Lapras conditional Ice typing remains singular with Amethyst Glow', () => {
		const [p] = setup('Lapras-Aevian', 'Amethyst Glow');
		battle.field.setWeather('snow', p);
		assert.equal(p.getTypes().filter(t => t === 'Ice').length, 1);
		p.addVolatile('gastroacid');
		assert.equal(p.getTypes().filter(t => t === 'Ice').length, 1);
	});
	it('Transform takes target form passive; changing away removes it', () => {
		const [p, t] = setup();
		assert(t.transformInto(p));
		assert.deepEqual(t.getPassives(), ['relicarmor']);
		p.formeChange('Mew');
		assert.deepEqual(p.getPassives(), ['synchronize']);
		assert.equal(mod(p, t), 100);
	});
	it('Illusion does not disclose actual species or passive', () => {
		const [p, t] = setup('Omastar', 'Illusion');
		assert(p.illusion);
		const start = battle.log.length;
		p.hp = Math.floor(p.maxhp / 2);
		battle.boost({ atk: -1 }, p, t);
		battle.eachEvent('Residual');
		assert(!battle.log.slice(start).some(l => /Relic Armor|Omastar/.test(l)));
	});
	it('preserves original unbreakable Relic Armor behavior during Mold Breaker attacks', () => {
		const [p, t] = setup();
		t.setAbility('Mold Breaker');
		const m = Dex.getActiveMove('tackle');
		m.ignoreAbility = true;
		battle.setActiveMove(m, t, p);
		assert.equal(mod(p, t), 80);
		assert.equal(mod(p, t, true), false);
	});
	it('calculator publishes all fifteen passive rows and settled slots', () => {
		const metadata = calculatorMetadata();
		for (const id of RelicArmorPassiveForms) {
			const row = metadata.species.find(p => Dex.species.get(p.name).id === id);
			assert.deepEqual(row.passives, ['relicarmor']);
			if (replacements[id])
				assert.equal(row.abilities[replacements[id][0]], replacements[id][1]);
		}
	});
	it('calculator uses the same passive damage with redundant selected Relic Armor', () => {
		const input = { format: 'gen9nofieldsinglesgame', move: 'tackle', samples: 8, seed: 17, actors: [{ species: 'Mew', ability: 'No Ability' }, { species: 'Omastar', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }, { species: 'Mew', ability: 'No Ability' }] };
		const passive = calculateScenario(input).results;
		input.actors[1].ability = 'Relic Armor';
		assert.deepEqual(calculateScenario(input).results, passive);
	});
	for (const [species, ability] of [['Tyrantrum-Mega', 'Tyrant Domain'], ['Aurorus-Mega', 'Aurora Domain']])
		it(ability + ' keeps one armor reduction and one Self Sufficient recovery', () => {
			const [p, t] = setup(species, ability);
			p.formeChange(species);
			p.setAbility(ability);
			assert.equal(mod(p, t), 80);
			p.hp = Math.floor(p.maxhp / 2);
			const hp = p.hp;
			battle.eachEvent('Residual');
			assert.equal(p.hp - hp, Math.floor(p.baseMaxhp / 16));
		});
});
