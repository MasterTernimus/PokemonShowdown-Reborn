'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim/dex');
const { AbilityComponents } = require('../../dist/data/ability-components');
const { getAbilityDisplayComponents, getAbilitySelectorSummary } = require('../../dist/data/ability-display');
const { getAbilityMechanicsHTML } = require('../../dist/server/ability-lookup');
const { calculatorMetadata } = require('../../dist/sim/custom-calculator');
describe('Canonical composite descriptions', () => {
	const nameOf = id => Dex.abilities.get(id).name;
	it('renders the exact Verdant Drake row without repeated component lists', () => {
		const a = Dex.abilities.get('verdantdrake');
		assert(a.shortDesc.length < 160);
		assert.doesNotMatch(a.shortDesc, /Proficient \+/);
		for (const value of ['1.3x', 'Prevents and cures paralysis', '+1 Attack and Sp. Atk']) assert(a.desc.includes(value));
		assert(getAbilityMechanicsHTML(a, Dex).includes('1.3x power'));
	});
	it('canonicalizes legacy aliases and overlapping nested component paths for display only', () => {
		try {
			AbilityComponents.displaytestfixture = ['shadowguard', 'voidcraft', 'shadowshield'];
			assert.deepEqual(getAbilityDisplayComponents('displaytestfixture'), ['voidcraft']);
			assert.equal(getAbilitySelectorSummary('displaytestfixture', 'Shadow Guard + Voidcraft + Shadow Shield; custom rider.', nameOf), 'Custom rider.');
			AbilityComponents.displaytestfixture = ['pollenbloom', 'thickfat', 'proficient', 'selfsufficient'];
			assert.deepEqual(getAbilityDisplayComponents('displaytestfixture'), ['pollenbloom', 'selfsufficient']);
			assert.equal(getAbilitySelectorSummary('displaytestfixture', 'Pollen Bloom + Thick Fat + Proficient + Self Sufficient; Poison heals 25%.', nameOf), 'Poison heals 25%.');
			assert(AbilityComponents.displaytestfixture.includes('thickfat'));
		} finally { delete AbilityComponents.displaytestfixture; }
		assert.deepEqual(getAbilityDisplayComponents('shadowguard'), getAbilityDisplayComponents('voidcraft'));
	});
	it('collapses Layered Coat children without removing explanatory prose or identity', () => {
		const a = Dex.abilities.get('aeviantoxin');
		assert.equal(a.shortDesc, 'Combines the listed abilities.');
		assert.match(a.desc, /Defense.*doubled|Doubles Defense/i);
		assert.match(a.desc, /powder/);
		assert.deepEqual(getAbilityDisplayComponents(a.id), ['strongjaw', 'layeredcoat', 'merciless']);
		assert(AbilityComponents.aeviantoxin.includes('furcoat'));
		assert(AbilityComponents.aeviantoxin.includes('overcoat'));
		assert.equal(getAbilitySelectorSummary(a.id, 'Strong Jaw + Layered Coat + Fur Coat + Overcoat + Merciless; doubles Defense.', nameOf), a.shortDesc);
	});
	it('preserves distinct mechanics clauses and is idempotent', () => {
		for (const a of Dex.abilities.all()) assert.equal(getAbilitySelectorSummary(a.id, a.shortDesc, nameOf), a.shortDesc, a.id);
		const text = 'Sturdy. When Sturdy saves it, creates Spikes; damage reduction applies separately.';
		assert.equal(getAbilitySelectorSummary('stonewall', text, nameOf), Dex.abilities.get('stonewall').shortDesc);
	});
	it('keeps calculator component labels aligned with expanded lookup', () => {
		const meta = calculatorMetadata();
		for (const id of ['verdantdrake', 'toxicbloom', 'pollenbloom', 'voidcraft', 'shadowbond']) {
			assert.deepEqual(meta.abilityComponents[id], getAbilityDisplayComponents(id).map(nameOf));
			assert.equal(new Set(meta.abilityComponents[id]).size, meta.abilityComponents[id].length);
			for (const name of meta.abilityComponents[id]) assert(getAbilityMechanicsHTML(Dex.abilities.get(id), Dex).includes(name));
		}
	});
});
