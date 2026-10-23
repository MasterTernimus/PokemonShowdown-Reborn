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
	it('registers a requested test even when the module is absent', () => {
		const calls = [];
		const register = (title, callback) => calls.push({ title, callback });
		register.skip = () => { throw new Error('Missing modules must not be skipped'); };
		const common = load(register), callback = () => {};
		common.itGen(2, 'mechanics contract', callback);
		assert.equal(calls.length, 1);
		assert.equal(calls[0].title, 'mechanics contract [Gen 2]');
		assert.equal(calls[0].callback, callback);
	});
	it('preserves failures from the original test callback', () => {
		const expected = new Error('Missing historical data');
		const register = (title, callback) => callback();
		register.skip = () => {};
		const common = load(register);
		assert.throws(() => common.itGen(2, 'broken data', () => { throw expected; }), error => error === expected);
	});
	it('does not skip or relabel an entire requested generation suite', () => {
		const calls = [];
		const register = (title, callback) => { calls.push(title); callback(); };
		register.skip = () => { throw new Error('Missing suites must not be skipped'); };
		const common = load(register);
		let ran = false;
		common.describeGen(4, 'historical suite', () => { ran = true; });
		assert.equal(ran, true);
		assert.equal(calls[0], 'historical suite [Gen 4]');
	});
});
