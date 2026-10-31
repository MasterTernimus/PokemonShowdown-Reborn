'use strict';

const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');

function loadSource(relative, replacements = {}, globals = {}, source) {
	const filename = path.join(root, relative);
	const module = { exports: {} };
	const context = {
		module, exports: module.exports, __dirname: path.join(root, 'dist', path.dirname(relative)),
		require: name => name in replacements ? replacements[name] : require(require.resolve(name, { paths: [path.dirname(filename)] })),
		process, Buffer, console, URL, AbortController, setTimeout, clearTimeout, setInterval, clearInterval,
		toID: s => String(s?.id || s).toLowerCase().replace(/[^a-z0-9]/g, ''),
		Config: {}, Monitor: { warn() {}, crashlog() {} }, Chat: { ErrorMessage: Error }, ...globals,
	};
	context.global = context;
	vm.runInNewContext(ts.transpileModule(source ?? fs.readFileSync(filename, 'utf8'), {
		compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
	}).outputText, context, { filename });
	return module.exports;
}

function trackerHarness(saved) {
	let now = 1000, next = 0, response = JSON.stringify({ toplist: [] }), stored;
	const timers = new Map(), intervals = new Map(), html = [], warnings = [];
	const room = {
		roomid: 'test', settings: { isPrivate: true }, toString() { return this.roomid; },
		add: message => { html.push(message); return { update() {} }; },
	};
	class Clock extends Date { static now() { return now; } }
	const mod = loadSource('server/chat-plugins/laddertours.ts', {
		'../../lib': {
			FS: () => ({ readIfExistsSync: () => JSON.stringify(saved || {}), writeUpdate: callback => { stored = JSON.parse(callback()); } }),
			Utils: {}, Net: () => ({ get: async () => { if (response instanceof Error) throw response; return response; } }),
		},
		'./username-prefixes': { prefixManager: {} },
	}, {
		Date: Clock, Rooms: { search: () => room }, Monitor: { warn: value => warnings.push(value) },
		setTimeout: (callback, delay) => { timers.set(++next, { callback, delay }); return next; }, clearTimeout: id => timers.delete(id),
		setInterval: callback => { intervals.set(++next, callback); return next; }, clearInterval: id => intervals.delete(id),
	});
	const tracker = mod.trackers.test || new mod.LadderTracker(room, {
		format: 'gen9ou', prefix: 'lt', rating: 1000, deadline: new Date(now + 60000).toISOString(),
	});
	mod.trackers.test = tracker;
	const context = {
		requireRoom: () => room, checkCan() {}, sendReply() {}, modlog() {},
		errorReply(message) { throw new Error(message); },
	};
	return {
		mod, tracker, timers, intervals, html, warnings, get stored() { return stored; },
		setResponse: value => { response = value; }, advance: ms => { now += ms; },
		command: (name, target = '') => mod.commands.laddertrack[name === 'override' ? '' : name]
			.call(context, target, room, { name: 'Staff' }, {}, name),
		battleCreated: id => mod.handlers.onBattleCreate({
			roomid: `battle-gen9ou-${id}`, format: 'gen9ou', rated: 1600,
			p1: { name: 'ltAlice' }, p2: { name: 'ltBob' },
		}, []),
	};
}

describe('Audit result durability regressions', () => {
	it('retains a paused deadline across save, reload and resume', () => {
		const h = trackerHarness();
		const deadline = h.tracker.config.deadline;
		h.tracker.start(); h.tracker.stop(); h.mod.LadderTracker.save();
		assert.equal(h.stored.test.deadline, deadline);
		assert.equal(h.stored.test.paused, true);
		assert.equal(h.timers.size, 0);
		assert.equal(h.intervals.size, 0);
		const reloaded = trackerHarness(h.stored);
		assert.equal(reloaded.timers.size, 0);
		assert.equal(reloaded.intervals.size, 0);
		reloaded.tracker.start();
		assert.equal(reloaded.tracker.config.deadline, deadline);
		assert.equal(reloaded.tracker.config.paused, false);
		assert.equal(reloaded.timers.size, 1);
		assert.equal(reloaded.intervals.size, 1);
	});
	for (const [label, failure] of [
		['HTTP failure', new Error('HTTP 503')], ['invalid JSON', '<html>unavailable</html>'],
		['missing toplist', '{}'], ['invalid row', JSON.stringify({ toplist: [{ userid: 'ltone', username: 'One', elo: null }] })],
	]) {
		it(`keeps final results pending after ${label} and accepts a genuinely empty recovery`, async () => {
			const h = trackerHarness();
			const deadline = h.tracker.config.deadline;
			h.tracker.start(); h.advance(60000); h.setResponse(failure);
			await h.tracker.captureFinalLeaderboard();
			h.mod.LadderTracker.save();
			assert.equal(h.stored.test.deadline, deadline);
			assert.equal(h.html.some(line => line.includes('Final Leaderboard -')), false);
			assert.equal(h.html.filter(line => line.includes('temporarily unavailable')).length, 1);
			assert.equal(h.timers.size, 1);
			assert.equal([...h.timers.values()][0].delay, 60000);
			await h.tracker.captureFinalLeaderboard();
			assert.equal(h.html.length, 1, 'retries should not flood the room');
			h.setResponse(JSON.stringify({ toplist: [] }));
			await h.tracker.captureFinalLeaderboard();
			assert.equal(h.html.filter(line => line.includes('Final Leaderboard -')).length, 1);
			assert.equal(h.stored.test.deadline, undefined);
			assert.equal(h.timers.size, 0);
			assert.equal(h.intervals.size, 0);
		});
	}
	it('preserves the last valid lookup on failed refresh and normalizes numeric API fields', async () => {
		const h = trackerHarness();
		h.setResponse(JSON.stringify({ toplist: [{ userid: 'ltone', username: 'LT One', elo: '1500', gxe: '65.5', rpr: '1600', rprd: '55' }] }));
		const rows = await h.tracker.getLeaderboard();
		assert.equal(rows[0].gxe, 65.5);
		h.setResponse(new Error('timeout'));
		await assert.rejects(h.tracker.getLeaderboard(), /Failed to fetch/);
		assert.equal(h.tracker.leaderboard.lookup.get('ltone').elo, 1500);
	});
	it('cancels pending final retries and in-flight responses when paused', async () => {
		const h = trackerHarness();
		h.tracker.start(); h.advance(60000);
		let finish;
		h.tracker.getLeaderboard = () => new Promise(resolve => { finish = resolve; });
		const pending = h.tracker.captureFinalLeaderboard();
		h.tracker.stop(); finish([]); await pending;
		assert.equal(h.html.length, 0);
		assert.equal(h.timers.size, 0);
		assert(h.tracker.config.deadline);
	});
	it('stops the previous tracker when the override command installs a replacement', async () => {
		const h = trackerHarness();
		h.tracker.start();
		h.command('override', 'rating=1000, prefix=new, format=gen9ou, deadline=1970-01-01T01:00:00Z');
		assert.notEqual(h.mod.trackers.test, h.tracker);
		assert.equal(h.mod.trackers.test.prefix, 'new');
		assert.equal(h.tracker.config.paused, true);
		assert.equal(h.timers.size, 1);
		assert.equal(h.intervals.size, 1);
		h.advance(60000);
		await h.tracker.captureFinalLeaderboard();
		assert.equal(h.html.length, 0);
		assert.equal(h.stored.test.prefix, 'new');
		assert.equal(h.stored.test.paused, false);
	});
	it('keeps the running tracker when replacement configuration is invalid', () => {
		const h = trackerHarness();
		h.tracker.start();
		const deadline = h.tracker.config.deadline;
		assert.throws(() => h.command('override', 'rating=1000, prefix=new, format=gen9ou, deadline=invalid'), /Invalid date/);
		assert.equal(h.mod.trackers.test, h.tracker);
		assert.equal(h.tracker.config.paused, false);
		assert.equal(h.tracker.config.deadline, deadline);
		assert.equal(h.timers.size, 1);
		assert.equal(h.intervals.size, 1);
	});
	for (const fails of [false, true]) {
		it(`invalidates an overridden tracker's in-flight final ${fails ? 'failure' : 'success'}`, async () => {
			const h = trackerHarness();
			h.tracker.start(); h.advance(60000);
			let resolve, reject;
			h.tracker.getLeaderboard = () => new Promise((res, rej) => { resolve = res; reject = rej; });
			const pending = h.tracker.captureFinalLeaderboard();
			h.command('override', 'rating=1000, prefix=new, format=gen9ou, deadline=1970-01-01T01:00:00Z');
			if (fails) reject(new Error('Old request failed')); else resolve([]);
			await pending;
			assert.equal(h.html.length, 0);
			assert.equal(h.warnings.length, 0);
			assert.equal(h.timers.size, 1);
			assert.equal(h.intervals.size, 1);
			assert.equal(h.stored.test.prefix, 'new');
			assert.equal(h.stored.test.paused, false);
		});
	}
	it('invalidates an overridden tracker\'s in-flight polling response', async () => {
		const h = trackerHarness();
		h.tracker.start();
		let finish, changes = 0;
		h.tracker.getLeaderboard = () => new Promise(resolve => { finish = resolve; });
		h.tracker.trackChanges = () => { changes++; };
		const pending = [...h.intervals.values()][0]();
		h.command('override', 'rating=1000, prefix=new, format=gen9ou');
		finish([]); await pending;
		assert.equal(changes, 0);
		assert.equal(h.tracker.leaderboard.current, undefined);
		assert.equal(h.timers.size, 0);
		assert.equal(h.intervals.size, 1);
	});
	it('pauses battle announcements through the command and restores them on explicit resume', () => {
		const h = trackerHarness();
		h.command('start'); h.battleCreated(1);
		assert.equal(h.html.filter(line => line.includes('Battle started')).length, 1);
		h.command('pause'); h.battleCreated(2);
		assert.equal(h.html.filter(line => line.includes('Battle started')).length, 1);
		assert.equal(h.timers.size, 0);
		assert.equal(h.intervals.size, 0);
		h.command('start'); h.battleCreated(2);
		assert.equal(h.html.filter(line => line.includes('Battle started')).length, 2);
	});
	it('stops battle announcements after finalization until explicitly resumed', async () => {
		const h = trackerHarness();
		h.command('start'); h.advance(60000);
		await h.tracker.captureFinalLeaderboard();
		assert.equal(h.html.filter(line => line.includes('Final Leaderboard -')).length, 1);
		assert.equal(h.stored.test.paused, true);
		assert.equal(h.stored.test.deadline, undefined);
		h.battleCreated(1);
		assert.equal(h.html.filter(line => line.includes('Battle started')).length, 0);
		h.command('start'); h.battleCreated(1);
		assert.equal(h.html.filter(line => line.includes('Battle started')).length, 1);
		assert.equal(h.timers.size, 0);
		assert.equal(h.intervals.size, 1);
	});
	for (const unexpected of [false, true]) {
		it(`logs ranked completion despite ${unexpected ? 'an unexpected rating rejection' : 'a failed local ladder read'}`, async () => {
			const messages = [], logs = [], errors = [];
			let writes = 0;
			const { LadderStore } = loadSource('server/ladders-local.ts', { '../lib': {
				Utils: {}, FS: () => ({ readIfExists: async () => { throw new Error('EACCES ladder file'); }, safeWrite: async () => { writes++; } }),
			} }, { Ladders: { disabled: false } });
			const store = new LadderStore('test');
			const source = fs.readFileSync(path.join(root, 'server/room-battle.ts'), 'utf8');
			const begin = source.indexOf('\tasync updateLadder('), end = source.indexOf('\n\tasync logBattle(', begin);
			assert(begin > 0 && end > begin);
			const { BattleProbe } = loadSource('server/room-battle.ts', {}, {
				Ladders: () => unexpected ? { updateRating: async () => { throw new Error('Unexpected rejection'); } } : store,
				Users: { get: () => null }, Chat: { runHandlers() {} }, Monitor: { crashlog: error => errors.push(error) },
			}, `export class BattleProbe { ${source.slice(begin, end)} }`);
			const room = {
				rated: 1200, battle: {},
				addRaw(message) { messages.push(message); return this; },
				add(message) { messages.push(message); }, update() {},
			};
			const battle = Object.assign(new BattleProbe(), { room, p1: { name: 'A' }, p2: { name: 'B' }, ladder: 'test', logBattle: async (...args) => logs.push(args) });
			await battle.updateLadder(1, 'a');
			assert.equal(logs.length, 1);
			assert.deepEqual(logs[0], [1, null, null]);
			assert.equal(writes, 0);
			assert.equal(LadderStore.ladderCaches.has('test'), false);
			assert(messages.some(message => /rating/i.test(message)));
			assert.equal(errors.length, Number(unexpected));
		});
	}
});

describe('Official queue storage migration', () => {
	let temporary;
	const boxes = [];
	beforeEach(() => { temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'showdown-queue-migration-')); });
	afterEach(() => {
		for (const box of boxes) box.stop();
		boxes.length = 0;
		assert.equal(path.dirname(path.resolve(temporary)), path.resolve(os.tmpdir()));
		assert(path.basename(temporary).startsWith('showdown-queue-migration-'));
		fs.rmSync(temporary, { recursive: true, force: true });
	});
	function create(options, replacements) {
		const { OfficialReportOutbox } = loadSource('server/official-report-outbox.ts', replacements);
		const box = new OfficialReportOutbox(options);
		boxes.push(box);
		return box;
	}
	it('uses the configured persistent directory and keeps the default path unchanged', () => {
		const custom = loadSource('server/official-report-outbox.ts', {}, { Config: { logsdir: temporary } }).officialReports;
		assert.equal(custom.options.directory, path.join(temporary, 'official-report-outbox'));
		const standard = loadSource('server/official-report-outbox.ts').officialReports;
		assert.equal(standard.options.directory, path.join(root, 'logs/official-report-outbox'));
	});
	it('migrates existing reports before new enqueues and resumes delivery after restart', async () => {
		const legacyDirectory = path.join(temporary, 'old'), directory = path.join(temporary, 'persistent');
		fs.mkdirSync(legacyDirectory);
		const body = JSON.stringify({ roomid: 'battle-test-1', p1: 'Original' });
		const record = { body, attempts: 3, nextAttempt: Date.now() + 3600000 };
		fs.writeFileSync(path.join(legacyDirectory, 'battle-test-1.json'), JSON.stringify(record));
		let box = create({ directory, legacyDirectory });
		await box.enqueue({ roomid: 'battle-test-1', p1: 'Duplicate must not replace the original' }); box.stop();
		const target = path.join(directory, 'battle-test-1.json');
		assert.equal(fs.existsSync(path.join(legacyDirectory, 'battle-test-1.json')), false);
		assert.deepEqual(JSON.parse(fs.readFileSync(target)), record);
		record.nextAttempt = 0; fs.writeFileSync(target, JSON.stringify(record));
		const delivered = [];
		box = create({ directory, legacyDirectory, fetch: async (url, options) => { delivered.push(options.body); return { ok: true, json: async () => ({ ok: true }) }; } });
		await box.drain();
		assert.deepEqual(delivered, [body]);
		assert.equal(fs.existsSync(target), false);
	});
	it('resumes an interrupted identical copy without overwriting conflicting records', async () => {
		const legacyDirectory = path.join(temporary, 'old'), directory = path.join(temporary, 'persistent');
		fs.mkdirSync(legacyDirectory); fs.mkdirSync(directory);
		const record = { body: JSON.stringify({ roomid: 'battle-test-1' }), attempts: 1, nextAttempt: 0, blocked: 'HTTP 401' };
		for (const dir of [legacyDirectory, directory]) fs.writeFileSync(path.join(dir, 'battle-test-1.json'), JSON.stringify(record));
		fs.writeFileSync(path.join(legacyDirectory, 'battle-test-2.json'), JSON.stringify({ ...record, attempts: 2 }));
		fs.writeFileSync(path.join(directory, 'battle-test-2.json'), JSON.stringify(record));
		const warnings = [];
		const box = create({ directory, legacyDirectory, warn: message => warnings.push(message) });
		await box.drain();
		assert.equal(fs.existsSync(path.join(legacyDirectory, 'battle-test-1.json')), false);
		assert.equal(JSON.parse(fs.readFileSync(path.join(legacyDirectory, 'battle-test-2.json'))).attempts, 2);
		assert.equal(JSON.parse(fs.readFileSync(path.join(directory, 'battle-test-2.json'))).attempts, 1);
		assert(warnings.some(message => /conflicting legacy queue file/.test(message)));
	});
	it('never exposes an interrupted copy as a final queue record and retries from the retained source', async () => {
		const legacyDirectory = path.join(temporary, 'old'), directory = path.join(temporary, 'persistent');
		fs.mkdirSync(legacyDirectory);
		const name = 'battle-test-1.json';
		const body = JSON.stringify({ roomid: 'battle-test-1', p1: 'Original complete result' });
		const record = JSON.stringify({ body, attempts: 2, nextAttempt: 0 });
		fs.writeFileSync(path.join(legacyDirectory, name), record);
		const interrupted = create({ directory, legacyDirectory }, { fs: { ...fs, promises: {
			...fs.promises,
			copyFile: async (source, target) => {
				assert.equal(path.dirname(target), directory);
				assert(target.endsWith('.tmp'));
				await fs.promises.writeFile(target, '{"body":');
				throw new Error('Interrupted copy');
			},
		} } });
		await assert.rejects(interrupted.drain(), /Interrupted copy/);
		assert.equal(fs.existsSync(path.join(directory, name)), false);
		assert.equal(fs.readFileSync(path.join(legacyDirectory, name), 'utf8'), record);
		// A process crash can leave a partial temporary file; the next run ignores it.
		fs.writeFileSync(path.join(directory, name + '.interrupted.tmp'), '{"body":');
		const delivered = [];
		const restarted = create({ directory, legacyDirectory, fetch: async (url, options) => {
			delivered.push(options.body);
			return { ok: true, json: async () => ({ ok: true }) };
		} });
		await restarted.drain();
		assert.deepEqual(delivered, [body]);
		assert.equal(fs.existsSync(path.join(legacyDirectory, name)), false);
		assert.equal(fs.existsSync(path.join(directory, name)), false);
	});
});
