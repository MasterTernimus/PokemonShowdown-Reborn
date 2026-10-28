'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponentExclusions } = require('../../../dist/data/passive-ability-cleanup');
const before = require('./passive-overlap-before.json');
const replacements = require('./approved-passive-replacements.json');
const selected = (id, slot, name) => id === 'dustox' && slot === '0' ? 'Night Forager' : id === 'butterfree' && slot === '0' ? 'Gentle Scales' : id === 'grimer' && slot === '1' ? 'Poison Point' : replacements.find(r => r.id === id && r.slot === slot)?.after || name;
let battle;
function setup(species, ability) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species, ability, moves: ['splash', 'tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] },
	], [{ species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle'] }]]);
	battle.makeChoices('team 12', 'team 1');
	battle.field.terrain = ''; battle.randomizer = x => x;
	for (const side of battle.sides) for (const p of side.active) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Passive and selected component separation', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('preserves every existing species passive and selected slot without widening distribution', () => {
		const { SpeciesPassives } = require('../../../dist/data/species-passives');
		// This historical cohort is covered below; later approved species additions
		// must not be mistaken for an unintended widening of this old snapshot.
		assert(before.every(row => Object.hasOwn(SpeciesPassives, row.id === 'empoleonmega' ? 'empoleonmegay' : row.id)));
		for (const row of before) {
			const s = Dex.species.get(row.id);
 if (row.id === 'empoleonmega') {assert.equal(s.id, 'empoleonmegay');assert.deepEqual(s.passives,['proficient']);assert.deepEqual(s.abilities,{0:"Emperor's Resolve"});continue;}
			const { StarterPassives } = require('../../../dist/data/starter-passives');
			assert.deepEqual(s.passives, require('./passive-approval-overlays').current(row.id, (row.id === 'quaquaval' ? ['torrent'] : StarterPassives[row.id]) || (row.id === 'butterfree' ? ['shielddust'] : ['grimer', 'muk'].includes(row.id) ? ['liquidooze'] : row.passives)), row.id);
			for (const slot of row.slots) assert.equal(s.abilities[slot.slot], require('./passive-approval-overlays').abilities(s.id, { [slot.slot]: selected(row.id, slot.slot, slot.name) })[slot.slot], row.id);
		}
	});
	for (const row of before) for (const slot of row.slots.filter(s => s.overlap.length)) {
		it(row.id + ' slot ' + slot.slot + ' separates components from actual form passives', () => {
			const [p] = setup(row.id, row.id === 'gliscor' ? 'Venom Pincer' : selected(row.id, slot.slot, slot.name));
			for (const component of slot.overlap) {
                if (row.id.endsWith('gmax') && component === 'proficient' && require('../../../dist/data/starter-passives').StarterPassives[row.id]) {
                    assert.deepEqual(p.getPassives(), require('../../../dist/data/starter-passives').StarterPassives[row.id]);
                    assert(!p.hasAbilityOrPassive('proficient')); continue;
                }
				if (row.id === 'gliscor') {
					assert(p.getPassives().includes('poisonheal'));
					assert(p.hasAbility('poisontouch'));
					assert(!p.hasAbility('hypercutter'));
					continue;
				}
				if (['kingler', 'fearow', 'pinsir', 'masquerain', 'swalot', 'vespiquen', 'vileplume'].includes(row.id)) {
					assert.deepEqual(p.getPassives(), [{ kingler: 'titanpincer', fearow: 'lancepoint', pinsir: 'lockinggrip', masquerain: 'prismskimmer', swalot: 'accumulation', vespiquen: 'royalhive', vileplume: 'effectspore' }[row.id]]);
					assert(!p.hasAbilityOrPassive(component));
					continue;
				}
				if (row.id === 'dustox') {
					assert.deepEqual(p.getPassives(), ['rivalry']);
					assert.equal(p.ability, 'nightforager');
					assert(!p.hasAbilityOrPassive(component));
					continue;
				}
				assert(p.getPassives().includes(component));
				assert.equal(p.hasAbility(component), false, row.id + '/' + slot.id + '/' + component);
			}
		});
	}
	for (const [ability, components] of Object.entries(AbilityComponentExclusions)) {
		it(ability + ' does not carry the removed component when copied onto a non-passive species', () => {
			const [p, t] = setup('Mew', ability);
			for (const component of components) {
				assert(!p.hasAbility(component), component);
				if (component === 'proficient') {
					p.setType('Psychic');
					const sameType = battle.runEvent('BasePower', p, t, Dex.getActiveMove('psychic'), 100);
					p.setType('Dark');
					const otherType = battle.runEvent('BasePower', p, t, Dex.getActiveMove('psychic'), 100);
					assert.equal(sameType, otherType, ability + ' actual callbacks cannot retain same-type Proficient');
					let multiplier = 1;
					Dex.abilities.get('proficient').onBasePower.call({ effect: p.getAbility(), effectState: p.abilityState,
						chainModify(value) { multiplier *= value; } }, 100, p, t, Dex.moves.get('psychic'));
					assert.equal(multiplier, 1);
				}
				if (component === 'hypercutter') { battle.boost({ atk: -1 }, p, t); assert.equal(p.boosts.atk, -1); }
				if (component === 'keeneye') { battle.boost({ accuracy: -1 }, p, t); assert.equal(p.boosts.accuracy, -1); }
				if (component === 'sweetveil') { assert(p.setStatus('slp', t)); }
				if (component === 'shielddust') {
					const effects = [{ chance: 100, status: 'par' }];
					assert.deepEqual(battle.runEvent('ModifySecondaries', p, t, Dex.moves.get('tackle'), effects), effects);
				}
				if (component === 'levitate') assert.equal(p.isGrounded(), true);
			}
		});
	}
	for (const [species, ability, component] of [
		['Gligar', 'Venom Heal', 'hypercutter'], ['Gligar-Alt', 'Venom Heal', 'hypercutter'],
		['Gliscor-Alt', 'Venom Pincer', 'poisontouch'], ['Tentacruel-Reborn', 'Venom Veil', 'liquidooze'],
		['Magneton', 'Elevate', 'levitate'], ['Magnezone', 'Elevate', 'levitate'], ['Rabsca', 'Elevate', 'levitate'],
		['Bronzong', 'Elevate', 'levitate'], ['Bronzong-Rejuv', 'Elevate', 'levitate'],
	]) it(species + ' keeps the shared ' + ability + ' component', () => {
		const [p, t] = setup(species, ability);
		if (['Tentacruel-Reborn'].includes(species)) {
			assert(p.getPassives().includes(component)); assert(!p.hasAbility(component));
		} else { assert(!p.getPassives().includes(component)); assert(p.hasAbility(component)); }
		if (component === 'hypercutter') { battle.boost({ atk: -1 }, p, t); assert.equal(p.boosts.atk, 0); }
		if (component === 'levitate') {
			assert.equal(p.isGrounded(), null);
			battle.field.addPseudoWeather('gravity', t);
			assert.equal(p.isGrounded(), true);
		}
		if (component === 'liquidooze') {
			t.hp = 2000;
			battle.actions.useMove('gigadrain', t, { target: p });
			assert(t.hp < 2000);
		}
	});
	for (const [ability, shieldDust] of [['Night Forager', false], ['Toxic Cocoon', true]]) {
		it('Dustox separates Rivalry passive from selected ' + ability + ' Shield Dust', () => {
			const [p, t] = setup('Dustox', ability);
			assert.deepEqual(p.getPassives(), ['rivalry']);
			assert.equal(p.hasAbility('shielddust'), shieldDust);
			const effects = [{chance:100, status:'par'}];
			assert.deepEqual(battle.runEvent('ModifySecondaries', p, t, Dex.moves.get('tackle'), effects), shieldDust ? [] : effects);
		});
	}
	it('Masquerain keeps Prism Skimmer while active Overcoat is suppressed', () => {
		const [p, t] = setup('Masquerain', 'Scale Shelter');
		assert(!p.getAbility().onModifySecondaries); assert(p.hasAbility('overcoat'));
		p.addVolatile('gastroacid', t);
		assert.deepEqual(p.getPassives(), ['prismskimmer']);
		assert.deepEqual(battle.runEvent('ModifySecondaries', p, t, Dex.moves.get('tackle'), [{ chance: 100, status: 'par' }]), [{ chance: 100, status: 'par' }]);
		assert(!p.hasAbility('overcoat'));
	});
	it('removes Proficient from the selected base packages but keeps standalone Proficient', () => {
		for (const [species, ability] of [['Venusaur', 'Pollen Bloom'], ['Charizard', 'Unbound Blaze'], ['Mew', 'Proficient']]) {
			const [p, t] = setup(species, ability);
			assert(!p.getPassives().includes('proficient')); assert.equal(p.hasAbility('proficient'), ability === 'Proficient');
			assert.equal(battle.runEvent('BasePower', p, t, { ...Dex.moves.get('tackle'), type: p.getTypes()[0] }, 100), ability === 'Proficient' ? 130 : 100);
			battle.destroy(); battle = null;
		}
	});
	it('shared-component exclusions follow Transform, form changes and copied disguise passives under Illusion', () => {
		const [p, t] = setup('Gliscor', 'Venom Pincer');
		assert(p.hasAbility('poisontouch'));
		assert(!p.hasAbility('hypercutter'));
		assert(p.getPassives().includes('poisonheal'));
		p.m.perfectIllusion = true;
		p.illusion = battle.p1.pokemon[1];
		assert(!p.getPassives().includes('poisonheal'));
		p.illusion = null;
		delete p.m.perfectIllusion;
		p.formeChange('Gligar');
		assert(p.hasAbility('poisontouch'));
		assert(!p.hasAbility('hypercutter'));
		t.formeChange('Gliscor'); t.setAbility('Venom Pincer'); p.transformInto(t);
		assert(p.getPassives().includes('poisonheal')); assert(p.hasAbility('poisontouch')); assert(!p.hasAbility('hypercutter'));
	});
	it('retains unrelated KO, hail and field effects after separating Levitate', () => {
		for (const [species, ability] of [['Chimecho', 'Temple Chime'], ['Eelektross', 'Elevate']]) {
			const [p, t] = setup(species, ability); p.setItem('Iron Ball');
			battle.runEvent('AfterFaint', t, p, Dex.moves.get('tackle'), 1);
			assert(Object.values(p.boosts).some(n => n > 0)); battle.destroy(); battle = null;
		}
		const [p, t] = setup('Lunatone', 'Lunar Idol');
		assert.equal(battle.runEvent('Immunity', p, t, null, 'hail'), false);
		battle.field.setWeather('hail', p); assert.equal(battle.runEvent('ModifySpA', p, t, Dex.moves.get('icebeam'), 100), 150);
	});
});
