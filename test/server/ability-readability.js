'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {ReadableAbilitySummaries, PlainLanguageAbilityDescriptions, PlainLanguagePassiveDescriptions} = require('../../dist/data/ability-readability');
const {AbilityDescriptionOverrides} = require('../../dist/data/ability-descriptions');
const {AbilityDisplaySummaries} = require('../../dist/data/ability-display-summaries');
const {AbilitiesText} = require('../../dist/data/text/abilities');
const {SignaturePassiveDescriptions} = require('../../dist/data/signature-passive-data');
describe('Readable ability summaries', () => {
	it('keeps every current ability summary concise, complete and free of placeholder prose', () => {
		for (const ability of Dex.abilities.all()) {
			assert(ability.shortDesc && ability.shortDesc.length <= 100, `${ability.id}: ${ability.shortDesc}`);
			assert(!/Combines the listed|\.\.\.$/.test(ability.shortDesc), ability.id);
			assert(ability.desc, ability.id);
		}
	});
	it('publishes every reviewed summary without losing the detailed rules', () => {
		for (const [id, shortDesc] of Object.entries(ReadableAbilitySummaries)) {
			assert.equal(Dex.abilities.get(id).shortDesc, shortDesc);
			assert(Dex.abilities.get(id).desc.length > shortDesc.length, id);
		}
		assert.match(Dex.abilities.get('exaltedaether').desc, /12.5%.*25%.*Defensive screens apply normally/);
		assert.match(Dex.abilities.get('forewarn').desc, /OHKO moves receive no/);
	});
	it('keeps battle, reference and exported descriptions consistent', () => {
		for (const [id, text] of Object.entries(PlainLanguageAbilityDescriptions)) {
			for (const published of [Dex.abilities.get(id), AbilityDescriptionOverrides[id], AbilitiesText[id]]) {
				assert.equal(published.desc, text.desc, id);
				assert.equal(published.shortDesc, text.shortDesc, id);
			}
			assert.equal(AbilityDisplaySummaries[id], text.shortDesc, id);
		}
		for (const [id, text] of Object.entries(PlainLanguagePassiveDescriptions)) {
			assert.deepEqual(SignaturePassiveDescriptions[id], text, id);
			assert(text.shortDesc.length <= 100, id);
		}
	});
	it('explains grounding and Torment without adding selectable components to species passives', () => {
		const undertow = SignaturePassiveDescriptions.undertow;
		assert.match(undertow.shortDesc, /Smack Down/);
		assert.match(undertow.desc, /damage a foe directly/);
		assert.match(undertow.desc, /Substitute and Water immunities/);
		assert(!/Water Absorb/.test(undertow.desc));
		assert.match(Dex.abilities.get('undertow').desc, /Water Absorb/);
		assert(!/50% power/.test(SignaturePassiveDescriptions.lockjaw.desc));
		assert.match(Dex.abilities.get('lockjaw').desc, /50% power/);
		assert(!/Thick Fat/.test(SignaturePassiveDescriptions.palmmastery.desc));
		for (const id of ['lockinggrip', 'lockjaw', 'disorientingmind', 'falseliberation']) {
			assert.match(Dex.abilities.get(id).desc, /same move twice in a row/, id);
		}
	});
});
