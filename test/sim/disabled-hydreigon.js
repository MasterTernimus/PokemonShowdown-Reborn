'use strict';
const assert = require('assert').strict;
const {Dex} = require('../../dist/sim');

describe('Disabled Mega Hydreigon X', () => {
	it('removes the form and Mega Stone from the active dex', () => {
		assert.equal(Dex.species.get('Hydreigon-Mega-X').exists, false);
		assert.equal(Dex.items.get('Hydreigonite').exists, false);
		assert.equal(Dex.species.get('Hydreigon').exists, true);
		assert.deepEqual(Dex.species.get('Hydreigon').otherFormes, []);
	});
});
