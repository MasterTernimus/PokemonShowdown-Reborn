'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { ExhaustiveRunner } = require('../../../dist/sim/tools/exhaustive-runner');

describe('ExhaustiveRunner (slow)', () => {
	// Upstream custom-game IDs are not registered in this fork. Exercise the actual
	// singles/doubles rules and report unavailable upstream formats explicitly.
	for (const format of [...ExhaustiveRunner.FORMATS, 'gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) {
		const available = Dex.formats.get(format).exists;
		(available ? it : it.skip)(`${format}${available ? '' : ' [format unavailable]'}`, async function () {
			this.timeout(0);
			assert.equal(await new ExhaustiveRunner({ prng: [1, 2, 3, 4], format }).run(), 0);
		});
	}
});
