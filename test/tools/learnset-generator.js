'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

describe('Modern learnset generator', () => {
	let directory;
	beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'reborn-event-test-')); });
	afterEach(() => {
		for (const name of ['input.ts', 'output.ts']) {
			const file = path.join(directory, name);
			if (fs.existsSync(file)) fs.unlinkSync(file);
		}
		fs.rmdirSync(directory);
	});
	function generate(data) {
		const input = path.join(directory, 'input.ts'), output = path.join(directory, 'output.ts');
		fs.writeFileSync(input, 'export const Learnsets = ' + JSON.stringify(data) + ';');
		return spawnSync(process.execPath, [path.resolve(__dirname, '../../tools/generate-gen8-gen9-natdex-learnsets.js'), input, output],
			{ encoding: 'utf8', timeout: 10000, windowsHide: true });
	}
	it('rebases event indices after removing old-generation events', () => {
		const result = generate({ mew: { learnset: { splash: ['3S0'], celebrate: ['8S1', '9S2', '9M'] }, eventData: [
			{ generation: 3, level: 5, moves: ['splash'] },
			{ generation: 8, level: 10, moves: ['celebrate'] },
			{ generation: 9, level: 20, moves: ['celebrate'] },
		] } });
		assert.equal(result.status, 0, result.stderr);
		const output = fs.readFileSync(path.join(directory, 'output.ts'), 'utf8');
		const data = JSON.parse(output.slice(output.indexOf(' = ') + 3).trim().replace(/;$/, ''));
		assert.deepEqual(data.mew.learnset, { celebrate: ['8S0', '9S1', '9M'] });
		assert.deepEqual(data.mew.eventData.map(event => event.generation), [8, 9]);
	});
	it('rejects an event source without its event record', () => {
		const result = generate({ mew: { learnset: { celebrate: ['9S4'] } } });
		assert.notEqual(result.status, 0);
		assert.match(result.stderr, /Missing event for mew.celebrate: 9S4/);
		assert.equal(fs.existsSync(path.join(directory, 'output.ts')), false);
	});
});
