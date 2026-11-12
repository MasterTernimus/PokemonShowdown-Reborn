'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../dist/sim');
const display = require('../../dist/data/ability-display');
const { getAbilityMechanicsHTML } = require('../../dist/server/ability-lookup');

describe('Global display-only ability cleanup', () => {
	it('removes redundant nested component labels without altering identity', () => {
		let count = 0;
		for (const ability of Dex.abilities.all()) {
			count++;
			const parts = display.getAbilityDisplayComponents(ability.id);
			assert.equal(parts.length, new Set(parts).size, ability.id);
			assert(!parts.includes('proficient'), ability.id);
			for (const part of parts) for (const other of parts) {
				if (part !== other) assert(!display.getAbilityDisplayClosure(other).has(part), ability.id + ': ' + part);
			}
			assert(ability.desc && ability.shortDesc, ability.id);
		}
		assert(count >= 948);
	});
	it('Atrocity exposes Unbound Blaze and Fire Ward without removed components', () => {
		assert.deepEqual(display.getAbilityDisplayComponents('atrocity').map(id => Dex.abilities.get(id).name), ['Blazing Monarch', 'Fire Ward']);
		const ability = Dex.abilities.get('atrocity');
		assert.equal(ability.desc, 'Blazing Monarch + Fire Ward. All moves have 1.1x accuracy.');
		const { AbilityComponents } = require('../../dist/data/ability-components');
		assert.deepEqual(AbilityComponents.atrocity, ['unboundblaze', 'fireward']);
		assert.deepEqual(AbilityComponents.unboundblaze, []);
		const html = getAbilityMechanicsHTML(ability, Dex);
		for (const name of ['Blazing Monarch', 'Fire Ward']) assert(html.includes('/dt ' + name + ', gen9'));
		for (const name of ['Proficient', 'Dragonize', 'Magma Armor']) assert(!html.includes('/dt ' + name + ','));
	});
	it('calculator labels match the canonical server display lists', () => {
		const meta = require('../../dist/sim/custom-calculator').calculatorMetadata();
		for (const [id, names] of Object.entries(meta.abilityComponents)) {
			assert.deepEqual(names, display.getAbilityDisplayComponents(id).map(part => Dex.abilities.get(part).name), id);
		}
	});
});
