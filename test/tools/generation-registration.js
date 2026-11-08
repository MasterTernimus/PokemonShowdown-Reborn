'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');

describe('Historical generation test registration', () => {
	function load(register) {
		const commonFile = path.resolve(__dirname, '../common.js');
		const module = { exports: {} };
		const sandbox = { require: createRequire(commonFile), module, exports: module.exports, __dirname: path.dirname(commonFile), it: register, describe: register };
		vm.runInNewContext(fs.readFileSync(commonFile, 'utf8'), sandbox, { filename: commonFile });
		module.exports.hasGeneration = () => false;
		return module.exports;
	}
	it('explicitly skips a requested test when generation data is absent', () => {
		const calls = [];
		const register = (title, callback) => calls.push({ title, callback });
		register.skip = register;
		const common = load(register), callback = () => {};
		common.itGen(2, 'mechanics contract', callback);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].title, 'mechanics contract [Gen 2; data unavailable]');
		assert.equal(calls[0].callback, callback);
	});
	it('preserves failures from the original test callback', () => {
		const expected = new Error('Missing historical data');
		const register = (title, callback) => callback();
		register.skip = () => {};
		const common = load(register);
		common.hasGeneration = () => true;
		assert.throws(() => common.itGen(2, 'broken data', () => { throw expected; }), error => error === expected);
	});
	it('records an unavailable suite without executing its data-dependent setup', () => {
		const calls = [];
		const register = (title, callback) => { calls.push(title); callback(); };
		register.skip = title => calls.push(title);
		const common = load(register);
		let ran = false;
		common.describeGen(4, 'historical suite', () => { ran = true; });
		assert.equal(ran, false);
		assert.equal(calls[0], 'historical suite [Gen 4]');
		assert.equal(calls[1], 'Generation data unavailable');
	});
});
