'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const source = fs.readFileSync(path.resolve(__dirname, '../../tools/build-utils.js'), 'utf8');
const jsonFile = path.join('data', 'nested', 'sets.json');
const configFile = 'config/config-example.js';
const lf = '{\n  "label": "Pokémon",\n  "escaped": "a\\r\\nb",\n  "values": [1, true, null]\n}\n';
function copy(input, changed = null) {
	const files = new Map([[jsonFile, input], [configFile, '// configuration example\r\nmodule.exports = {};\r\n']]);
	const outputs = new Map();
	const exports = {};
	const directory = name => ({ name, isDirectory: () => true, isSymbolicLink: () => false });
	const file = name => ({ name, isDirectory: () => false, isSymbolicLink: () => false });
	const mockFS = {
		existsSync: name => name === 'data',
		readdirSync: name => name === 'data' ? [directory('nested')] : [file('sets.json')],
		mkdirSync() {},
		readFileSync: name => files.get(name),
		writeFileSync: (name, value) => outputs.set(name, value),
		copyFileSync: (from, to) => outputs.set(to, files.get(from)),
	};
	const mockRequire = name => {
		if (name === 'fs') return mockFS;
		if (name === 'path') return path;
		if (name === 'esbuild') return { buildSync() { assert.fail('No TypeScript fixture inputs'); } };
		if (name === 'child_process') return {};
		if (name === './build-cache') return { run(inputs, force, compile) { compile('stage', changed); } };
		throw new Error('Unexpected dependency: ' + name);
	};
	mockRequire.resolve = name => name;
	vm.runInNewContext(source, { exports, require: mockRequire, console: { log() {} }, Date });
	exports.transpile();
	return { files, outputs };
}
describe('Deterministic data JSON build copies', () => {
	it('produces identical LF bytes from LF and CRLF checkouts', () => {
		const a = copy(lf), b = copy(lf.replace(/\n/g, '\r\n'));
		assert.equal(a.outputs.get(path.join('stage', jsonFile)), lf);
		assert.equal(b.outputs.get(path.join('stage', jsonFile)), lf);
	});
	it('preserves parsed JSON values, Unicode, and escaped carriage returns', () => {
		const input = lf.replace(/\n/g, '\r\n');
		assert.deepEqual(JSON.parse(copy(input).outputs.get(path.join('stage', jsonFile))), JSON.parse(input));
	});
	it('does not rewrite source bytes or configuration example bytes', () => {
		const input = lf.replace(/\n/g, '\r\n');
		const result = copy(input);
		assert.equal(result.files.get(jsonFile), input);
		assert.equal(result.outputs.get(path.join('stage', configFile)), result.files.get(configFile));
		assert(result.outputs.get(path.join('stage', configFile)).includes('\r\n'));
	});
	it('normalizes an incremental JSON copy without copying unchanged configuration', () => {
		const result = copy(lf.replace(/\n/g, '\r\n'), [jsonFile]);
		assert.equal(result.outputs.get(path.join('stage', jsonFile)), lf);
		assert.equal(result.outputs.size, 1);
	});
});
