'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {AbilityComponents} = require('../../dist/data/ability-components');
const {AbilitiesText} = require('../../dist/data/text/abilities');
const {SignaturePassiveComponents} = require('../../dist/data/signature-passive-data');

const retired = ['voltagevolley', 'soaringspirit', 'backwash', 'plasmaeruption', 'soultag'];
describe('Individually verified unused ability retirement', () => {
	it('removes definitions, text and component catalog rows', () => {
		for (const id of retired) {
			assert(!Dex.abilities.get(id).exists, id);
			assert(!Object.hasOwn(Dex.data.Abilities, id), id);
			assert(!Object.hasOwn(AbilitiesText, id), id);
			assert(!Object.hasOwn(AbilityComponents, id), id);
		}
	});
	it('has no current species, passive or component pointing to a retired ability', () => {
		for (const s of Dex.species.all()) {
			for (const name of [...Object.values(s.abilities), ...(s.passives || [])]) {
				assert(!retired.includes(Dex.toID(name)), `${s.id}: ${name}`);
			}
		}
		for (const table of [AbilityComponents, SignaturePassiveComponents]) {
			for (const [id, components] of Object.entries(table)) {
				for (const component of components) assert(!retired.includes(component), `${id}: ${component}`);
			}
		}
	});
	it('preserves the current dragon kits and engine dependencies', () => {
		assert.equal(Dex.species.get('salamence').abilities.H, 'Rightful Exalt');
		assert.equal(Dex.species.get('salamencemega').abilities[0], 'Exalted Aether');
		assert.deepEqual(Dex.species.get('hydreigon').passives, ['hydraflight']);
		assert.deepEqual(Dex.species.get('hydreigonmega').passives, ['abyssalrebirth']);
		for (const id of ['precision', 'sovereignarsenal', 'meridianseal', 'dreadwings', 'auraconvergence', 'crescentrend']) {
			assert(Dex.abilities.get(id).exists, id);
		}
	});
});
