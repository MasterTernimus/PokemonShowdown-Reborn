'use strict';
const assert = require('assert').strict, { Dex } = require('../../dist/sim');
const { CurrentAbilityDescriptionCleanup: clean } = require('../../dist/data/current-ability-description-cleanup');
describe('Current ability description cleanup', () => {
	for (const [id, text] of Object.entries(clean))it(id + ' uses reviewed current-effect descriptions', () => {
		const a = Dex.abilities.get(id);
		assert.equal(a.desc, text.desc);
		assert.equal(a.shortDesc, text.shortDesc);
		assert(!/no longer|no lethal-hit survival|Keen Eye is removed|Guts and Battle Armor are removed/.test(a.desc + ' ' + a.shortDesc));
	});
	it('preserves necessary current exceptions', () => {
		assert.match(Dex.abilities.get('voidwrath').desc, /ending confusion/);
		assert.match(Dex.abilities.get('battlebond').desc, /Cannot be suppressed or swapped/);
	});
});
