'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');
const {ReadableAbilitySummaries} = require('../../dist/data/ability-readability');
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
});
