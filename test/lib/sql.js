"use strict";
const {SQL} = require('../../dist/lib/sql');
const assert = require('../assert').strict;
const common = require('../common');

const database = SQL('test-sql', module, {file: `:memory:`});

(common.hasModule('better-sqlite3') ? describe : describe.skip)(`SQLite worker wrapper`, () => {
	// prepare statements and set up table
	let select, insert;
	before(async () => {
		await database.exec(`CREATE TABLE IF NOT EXISTS test (col TEXT, col2 TEXT)`);
		select = await database.prepare(`SELECT * FROM test`);
		insert = await database.prepare(`INSERT INTO test (col, col2) VALUES (?, ?)`);
	});
	it(`should require a cached statement only when explicitly requested`, async () => {
		const query = 'SELECT col FROM test WHERE col = ?';
		await assert.rejects(database.get(query, ['uncached'], true), /Missing cached statement/);
		await database.prepare(query);
		assert.equal(await database.get(query, ['uncached'], true), undefined);
	});
	it(`should automatically prepare uncached statements by default`, async () => {
		const query = 'SELECT col2 FROM test WHERE col2 = ?';
		assert.equal(await database.get(query, ['automatic']), undefined);
		assert.equal(await database.get(query, ['automatic'], true), undefined);
	});
	it(`should support both statement strings and corresponding statement classes`, async () => {
		await database.run(`INSERT INTO test (col, col2) VALUES (?, ?)`, ['a', 'b']);
		await database.run(insert, ['a', 'b']);
	});
	it(`should support both inline and object params`, async () => {
		const num = await database.prepare(`INSERT INTO test (col, col2) VALUES($col, $col2)`);
		await database.run(insert, ['a', 'b']);
		await database.run(num, {col: 'a', col2: 'b'});
	});
	it(`should retrieve one line from Database.get`, async () => {
		const result = await database.get(select);
		assert(!!result, 1);
	});
});
