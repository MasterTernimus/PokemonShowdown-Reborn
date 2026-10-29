'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const { EventEmitter } = require('events');
const { createHmac } = require('crypto');
const root = path.resolve(__dirname, '../..');
const splitFirst = (s, separator) => {
	const i = s.indexOf(separator);
	return i < 0 ? [s, ''] : [s.slice(0, i), s.slice(i + separator.length)];
};
function load(file, replacements = {}, globals = {}) {
	const filename = path.join(root, 'dist', file);
	const context = {
		module: { exports: {} }, exports: {}, __dirname: path.dirname(filename), __filename: filename,
		require: name => name in replacements ? replacements[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })),
		process, Buffer, console, setTimeout, clearTimeout, setInterval, clearInterval, AbortController, URL,
		toID: s => String(s?.id || s).toLowerCase().replace(/[^a-z0-9]/g, ''),
		Config: {}, Monitor: { crashlog() {}, warn() {} }, ...globals,
	};
	context.global = context;
	vm.runInNewContext(fs.readFileSync(filename, 'utf8'), context, { filename });
	return context.module.exports;
}
const tick = () => new Promise(resolve => { setImmediate(resolve); });

describe('Audit server lifecycle regressions', () => {
	it('chunks 30-day deadlines, cancels/reschedules and never spins nextTick', async () => {
		let now = 1000;
		const timers = new Map();
		let next = 0;
		class Clock extends Date { static now() { return now; } }
		const { LadderTracker } = load('server/chat-plugins/laddertours.js', {
			'../../lib': { FS: () => ({ readIfExistsSync: () => '{}' }), Utils: {} }, './username-prefixes': { prefixManager: {} },
		}, { Date: Clock, Chat: { ErrorMessage: Error }, setTimeout: (cb, delay) => { timers.set(++next, { cb, delay }); return next; }, clearTimeout: id => timers.delete(id) });
		const tracker = new LadderTracker({ roomid: 'test' }, { format: 'gen9ou', prefix: 'lt', deadline: new Date(now + 30 * 86400000).toISOString() });
		assert.equal(timers.size, 1);
		assert.equal([...timers.values()][0].delay, 0x7fffffff);
		await tracker.captureFinalLeaderboard();
		assert.equal(timers.size, 1);
		tracker.setDeadline(new Date(now + 100).toISOString(), false);
		assert.equal([...timers.values()][0].delay, 100);
		let finish;
		tracker.getLeaderboard = () => new Promise(resolve => { finish = resolve; });
		let published = 0;
		tracker.addHTML = () => published++;
		now += 100;
		const capture = tracker.captureFinalLeaderboard();
		tracker.stop();
		finish([]);
		await capture;
		assert.equal(published, 0);
		assert.equal(timers.size, 0);
	});
	it('allows cutoff qualification below rating and rejects wrong formats/unrated games', () => {
		const { LadderTracker } = load('server/chat-plugins/laddertours.js', {
			'../../lib': { FS: () => ({ readIfExistsSync: () => '{}' }), Utils: {} }, './username-prefixes': { prefixManager: {} },
		});
		const tracker = new LadderTracker({}, { format: 'gen9ou', prefix: 'lt', rating: 1800, cutoff: 10 });
		tracker.leaderboard.lookup.set('lta', { rank: 1 });
		tracker.leaderboard.lookup.set('ltb', { rank: 5 });
		const battle = { format: 'gen9ou', rated: 1200, p1: { name: 'lta' }, p2: { name: 'ltb' } };
		assert.equal(tracker.tracking(battle, 1200), true);
		assert.equal(tracker.tracking({ ...battle, rated: 0 }, 1200), false);
		assert.equal(tracker.tracking({ ...battle, format: 'gen9uu' }, 1900), false);
		assert.equal(!!tracker.tracking({ ...battle, p2: { name: 'other' } }, 1200), false);
	});
	it('serializes atomic ladder saves across stores and retries read failures', async () => {
		const pending = [], written = [];
		let reads = 0, failRead = false;
		const { LadderStore } = load('server/ladders-local.js', { '../lib': { Utils: { escapeHTML: x => x }, FS: () => ({
			readIfExists: async () => { reads++; if (failRead) throw new Error('EACCES'); return 'header\n1500\tPlayer\t1\t0\t0\t0\n'; },
			safeWrite: data => new Promise(resolve => { written.push(data); pending.push(resolve); }),
		}) } });
		const a = new LadderStore('test'), b = new LadderStore('test');
		assert.equal((await Promise.all([a.getLadder(), b.getLadder()]))[0], b.ladder);
		assert.equal(reads, 1);
		const first = a.save();
		await tick();
		b.ladder[0][1] = 1600;
		const second = b.save();
		await tick();
		assert.equal(written.length, 1);
		assert.equal(a.saving, true);
		pending.shift()(); await first; await tick();
		assert.equal(written.length, 2);
		assert.match(written[1], /1600/);
		pending.shift()(); await second;
		failRead = true;
		const c = new LadderStore('broken');
		await assert.rejects(c.getLadder(), /EACCES/);
		assert.equal(LadderStore.ladderCaches.has('broken'), false);
		failRead = false;
		assert.equal((await c.getLadder()).length, 1);
	});
	it('caps Top 100 matching ladder rows while preserving global ranks', async () => {
		const { LadderStore } = load('server/ladders-local.js', { '../lib': { Utils: { escapeHTML: x => x } } }, { Dex: { formats: { get: () => ({ name: 'Test' }) } } });
		const store = new LadderStore('test');
		store.getLadder = async () => Array.from({ length: 1000 }, (_, i) => [`${i % 2 ? 'yes' : 'no'}${i}`, 1000, `Player${i}`, 0, 0, 0, '']);
		const [, html] = await store.getTop('yes');
		assert.equal((html.match(/<tr><td>/g) || []).length, 100);
		assert.match(html, /<td>200<\/td>/);
		assert(html.endsWith('</table>'));
	});
	it('frames fragmented and coalesced Artemis records and preserves pending malformed replies', () => {
		class Stream {}
		const { ArtemisStream } = load('server/artemis/local.js', { '../../lib': {
			Streams: { ObjectReadWriteStream: Stream }, Utils: { splitFirst },
			ProcessManager: { StreamProcessManager: class { constructor() { this.isParentProcess = true; } } },
		}, '../config-loader': {}, '../../sim/dex-data': { toID: x => x } });
		const stream = Object.create(ArtemisStream.prototype);
		stream.buffer = ''; stream.tasks = new Map([['0', null], ['1', null], ['2', null]]);
		const results = [];
		stream.push = x => results.push(x);
		stream.receive('0|{"tox');
		assert.equal(results.length, 0);
		stream.receive('icity":"0.1"}\n1|{"toxicity":"0.2"}\n2|broken\n');
		assert.equal(results.length, 2);
		assert.deepEqual(results.map(r => JSON.parse(r.split('\n')[1]).toxicity), ['0.1', '0.2']);
		assert.equal(stream.tasks.has('2'), true);
		stream.receive('2|{"toxicity":"0.3"}\n');
		assert.equal(stream.tasks.size, 0);
	});
	it('deduplicates cached calculator metadata and invalidates after build changes', async () => {
		let revision = 1, forks = 0;
		const children = [];
		const { queryCalculator } = load('server/custom-calculator.js', {
			'child_process': { fork: () => {
				forks++;
				const child = new EventEmitter();
				child.kill = () => {};
				child.send = () => {};
				children.push(child);
				return child;
			} },
			'fs': { readdirSync: () => [{ name: 'a.js', isDirectory: () => false }], statSync: () => ({ size: 1, mtimeMs: revision, ctimeMs: revision }) },
			'./battle-engine-guard': { battleEngineGeneration: () => 'test' },
		});
		const one = queryCalculator(''), two = queryCalculator('');
		assert.equal(forks, 1);
		children[0].emit('message', { version: { engine: 'one' }, species: [] });
		assert.equal(await one, await two);
		await queryCalculator('');
		assert.equal(forks, 1);
		revision++;
		const next = queryCalculator('');
		const calcA = queryCalculator('{}'), calcB = queryCalculator('{}');
		assert.equal(forks, 4);
		assert.match((await queryCalculator('{}')).error, /busy/);
		children.slice(1).forEach(child => child.emit('message', { version: { engine: 'two' } }));
		await Promise.all([next, calcA, calcB]);
	});
	it('settles classifier requests on timeout and destroy', async () => {
		const timers = new Map();
		let index = 0;
		const { LocalClassifier } = load('server/artemis/local.js', {
			'../../lib': { Streams: { ObjectReadWriteStream: class {} }, Utils: { splitFirst },
				ProcessManager: { StreamProcessManager: class { constructor() { this.isParentProcess = true; } } } },
			'../config-loader': {}, '../../sim/dex-data': { toID: x => x },
		}, { setTimeout: cb => { timers.set(++index, cb); return index; }, clearTimeout: id => timers.delete(id) });
		const classifier = Object.create(LocalClassifier.prototype);
		classifier.requests = new Map(); classifier.lastTask = 0;
		classifier.stream = { write() {}, destroy() {} };
		const first = classifier.classify('test');
		[...timers.values()][0]();
		assert.equal(await first, null);
		assert.equal(classifier.requests.size, 0);
		const second = classifier.classify('pending');
		classifier.destroy();
		assert.equal(await second, null);
		assert.equal(classifier.requests.size, 0);
		assert.equal(timers.size, 0);
	});
	it('keeps common-message normalization narrow and includes the last password character', () => {
		const { isCommon } = load('server/artemis/remote.js', {
			'../../lib': { ProcessManager: { QueryProcessManager: class { constructor() { this.isParentProcess = true; } } } },
			'../config-loader': {}, '../../sim/dex-data': {},
		});
		assert.equal(isCommon('gg!'), true);
		assert.equal(isCommon('gl hf'), true);
		assert.equal(isCommon('gg! insult'), false);
		const actual = require('../../dist/lib/database');
		const { Replays } = load('server/replays.js', {
			'../lib/database': actual, crypto: { randomInt: (min, max) => max - 1 },
		});
		assert.equal(Replays.generatePassword(2), 'zz');
	});
	it('upserts replay and indexes in one transaction and rolls back index failure', async () => {
		const calls = [];
		let failIndex = false;
		const saved = { id: 'battle-test-1', password: 'existing', private: 1, players: 'A,B' };
		const connection = { release: () => calls.push('release'), query: async (sql, values) => {
			calls.push(sql);
			if (sql.startsWith('INSERT INTO replays ')) return { rows: [saved] };
			if (failIndex && sql.startsWith('INSERT INTO replayplayers')) throw new Error('index failed');
			return { rows: [] };
		} };
		const actual = require('../../dist/lib/database');
		class DB {
			constructor() { this.connection = { connect: async () => connection }; }
			getTable() { return {}; }
			_resolveSQL(statement) { return actual.PGDatabase.prototype._resolveSQL.call({ escapeId: s => '"' + s + '"' }, statement); }
		}
		const { Replays } = load('server/replays.js', { '../lib/database': { ...actual, PGDatabase: DB } }, { Config: { replaysdb: {} } });
		const replay = { id: saved.id, format: 'Gen 9 OU', players: ['A', 'B'], log: 'final', inputlog: null, uploadtime: 1, rating: 1200, private: 1 };
		assert.equal(await Replays.add(replay), saved.id + '-existingpw');
		assert.equal(calls[0], 'BEGIN');
		assert.match(calls[1], /ON CONFLICT \(id\) DO UPDATE/);
		assert.equal(calls.at(-2), 'COMMIT');
		failIndex = true; calls.length = 0;
		await assert.rejects(Replays.add(replay), /index failed/);
		assert.equal(calls.at(-2), 'ROLLBACK');
		assert.equal(calls.at(-1), 'release');
	});
});

describe('Durable official report delivery', () => {
	const { OfficialReportOutbox } = require('../../dist/server/official-report-outbox');
	let directory;
	const boxes = [];
	function create(options) {
		const outbox = new OfficialReportOutbox(options);
		boxes.push(outbox);
		return outbox;
	}
	beforeEach(() => { directory = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-report-test-')); });
	afterEach(() => {
		for (const box of boxes) box.stop();
		boxes.length = 0;
		assert.equal(path.dirname(path.resolve(directory)), path.resolve(os.tmpdir()));
		assert(path.basename(directory).startsWith('showdown-report-test-'));
		fs.rmSync(directory, { recursive: true, force: true });
	});
	const payload = { roomid: 'battle-test-1', official: true, p1: 'A', p2: 'B' };
	it('persists before delivery, signs exact bytes, recovers after restart and lost acknowledgement', async () => {
		let calls = 0;
		const sender = async (url, options) => {
			calls++;
			assert.equal(options.headers['x-leaf-signature'], createHmac('sha256', 'test-secret').update(options.headers['x-leaf-timestamp'] + '.' + options.body).digest('hex'));
			if (calls === 1) throw new Error('lost acknowledgement');
			return { ok: true, json: async () => ({ ok: true }) };
		};
		let outbox = create({ directory, secret: 'test-secret', mode: 'authenticated', fetch: sender });
		await outbox.enqueue(payload); outbox.stop();
		const file = path.join(directory, payload.roomid + '.json');
		assert.equal(calls, 0);
		await outbox.drain();
		const queued = JSON.parse(fs.readFileSync(file));
		assert.equal(queued.attempts, 1);
		assert.equal(JSON.parse(queued.body).roomid, payload.roomid);
		queued.nextAttempt = 0; fs.writeFileSync(file, JSON.stringify(queued));
		outbox = create({ directory, secret: 'test-secret', fetch: sender });
		await outbox.drain();
		assert.equal(fs.existsSync(file), false);
	});
	it('retains permanent rejection for review and never sends unsigned in required mode', async () => {
		let calls = 0;
		let outbox = create({ directory, mode: 'authenticated', fetch: async () => { calls++; return { ok: false, status: 401 }; } });
		await outbox.enqueue(payload); outbox.stop();
		await assert.rejects(outbox.drain(), /secret is missing/);
		assert.equal(calls, 0);
		outbox = create({ directory, secret: 'secret', fetch: async () => { calls++; return { ok: false, status: 401 }; } });
		await outbox.drain(); await outbox.drain();
		assert.equal(calls, 1);
		assert.match(JSON.parse(fs.readFileSync(path.join(directory, payload.roomid + '.json'))).blocked, /401/);
	});
	it('times out and retains reports without a positive acknowledgement', async () => {
		const outbox = create({ directory, timeoutMs: 5, fetch: async (url, options) => new Promise((resolve, reject) => {
			options.signal.addEventListener('abort', () => reject(new Error('aborted')));
		}) });
		await outbox.enqueue(payload); outbox.stop();
		await outbox.drain();
		assert.equal(JSON.parse(fs.readFileSync(path.join(directory, payload.roomid + '.json'))).attempts, 1);
	});
});
