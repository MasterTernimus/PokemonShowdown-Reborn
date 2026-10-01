'use strict';
const assert = require('assert').strict;
const { queryCalculator } = require('../../dist/server/custom-calculator');
describe('Calculator isolation and admission', function () {
	this.timeout(20000);
	it('bounds payloads before spawning', async () => {
		assert.match((await queryCalculator('x'.repeat(16001))).error, /16 KB/);
	});
	it('limits concurrent workers and reports compiled engine identity', async () => {
		const first = queryCalculator('');
		const second = queryCalculator('');
		assert.match((await queryCalculator('')).error, /busy/);
		const [a, b] = await Promise.all([first, second]);
		assert.match(a.version.engine, /^[a-f0-9]{16}$/);
		assert.equal(a.version.engine, b.version.engine);
		assert(a.formats.length);
	});
	it('contains malformed input and allows subsequent requests', async () => {
		assert((await queryCalculator('{')).error);
		assert.match((await queryCalculator('{"format":"evil"}')).error, /Unsupported calculator format/);
		assert((await queryCalculator('')).version);
	});
});
