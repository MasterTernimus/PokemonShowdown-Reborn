'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ts = require('typescript');
const Utils = require('../../dist/lib/utils');
const { LockdownDrain, unfinishedBattleRooms } = require('../../dist/server/lockdown-drain');

class Clock {
	now = 0;
	serial = 0;
	tasks = new Map();
	setTimeout = (callback, delay) => {
		const token = { id: ++this.serial, unref() {} };
		this.tasks.set(token, { callback, at: this.now + delay });
		return token;
	};
	clearTimeout = token => { this.tasks.delete(token); };
	advance(ms) {
		const end = this.now + ms;
		let steps = 0;
		while (true) {
			const next = [...this.tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
			if (!next) break;
			assert(++steps < 1000, 'fake clock loop');
			this.now = next[1].at;
			this.tasks.delete(next[0]);
			next[1].callback();
		}
		this.now = end;
	}
}
function fixture() {
	const clock = new Clock();
	const state = { lockdown: true, slowLockdown: false, auto: undefined, updating: false };
	const rooms = new Map();
	const notices = [];
	let exits = 0;
	const drain = new LockdownDrain({
		enabled: () => state.lockdown === true && !state.slowLockdown && state.auto !== false,
		drained: () => unfinishedBattleRooms(rooms.values()).length === 0,
		updating: () => state.updating,
		notify: value => notices.push(value), exit: () => exits++,
	}, clock);
	return { clock, state, rooms, notices, drain, exits: () => exits };
}
function room(roomid, extra = {}) {
	return { roomid, title: roomid, settings: {}, rated: 0, addRaw() { return this; }, update() {}, ...extra };
}
function commandHarness(f = fixture()) {
	const config = {};
	Object.defineProperty(config, 'autolockdown', { get: () => f.state.auto, set: value => { f.state.auto = value; } });
	const global = {
		get lockdown() { return f.state.lockdown; }, set lockdown(value) { f.state.lockdown = value; },
		get slowLockdown() { return f.state.slowLockdown; },
		cancelAutomaticKill: () => f.drain.cancel(), automaticKillRequest: () => f.drain.request(),
		getUnfinishedBattleRooms: () => unfinishedBattleRooms(f.rooms.values()),
	};
	const commandModule = { exports: {} };
	const code = fs.readFileSync(path.resolve(__dirname, '../../dist/server/chat-commands/admin.js'), 'utf8');
	vm.runInNewContext(code, { exports: commandModule.exports, module: commandModule, require: id => id === '../../lib' ? { Utils } : require(id),
		Rooms: { global, rooms: f.rooms }, Config: config, Chat: { ErrorMessage: Error }, Users: { users: new Map() } });
	const replies = [];
	const context = { checkCan(permission) { assert.equal(permission, 'lockdown'); }, meansYes: s => s === 'on',
		meansNo: s => s === 'off', privateGlobalModAction() {}, stafflog() {}, sendReply: s => replies.push(s),
		sendReplyBox: s => replies.push(s), parse() {} };
	return { f, commands: commandModule.exports.commands, context, replies };
}
function globalHarness() {
	// Evaluate the actual compiled class declaration, without executing its I/O-heavy constructor/imports.
	const code = fs.readFileSync(path.resolve(__dirname, '../../dist/server/rooms.js'), 'utf8');
	const ast = ts.createSourceFile('rooms.js', code, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
	const declaration = ast.statements.find(node => ts.isClassDeclaration(node) && node.name?.text === 'GlobalRoomState');
	assert(declaration, 'compiled GlobalRoomState declaration');
	const exported = {};
	const rooms = new Map();
	const config = {};
	const calls = [];
	vm.runInNewContext(declaration.getText(ast) + ';exports.State = GlobalRoomState;', {
		exports: exported, Rooms: { rooms, get: id => rooms.get(id) }, Users: { users: new Map() },
		Config: config, import_lib: { Utils }, import_lockdown_drain: { LockdownDrain, unfinishedBattleRooms },
		import_battle_engine_guard: { invalidateBattleEngineGuards: () => calls.push('identity') },
	});
	const state = Object.create(exported.State.prototype);
	Object.assign(state, { lockdown: false, slowLockdown: false, lockdownDrain: {
		cancel: () => calls.push('cancel'), request: () => calls.push('request'),
	}, writeNumRooms() {} });
	return { state, calls, config, rooms };
}

describe('Lockdown authoritative drain and cancellable automatic exit', () => {
	it('includes disconnected and unrated unfinished battles while ignoring ended battles and unrelated games', () => {
		const rooms = [room('battle-disconnected', { battle: { ended: false, active: false, rated: 0 } }),
			room('battle-rated', { battle: { ended: false, active: true, rated: 1000 } }),
			room('battle-ended', { battle: { ended: true } }), room('chat', { game: { gameid: 'chess', ended: false } })];
		assert.deepEqual(unfinishedBattleRooms(rooms).map(r => r.roomid), ['battle-disconnected', 'battle-rated']);
	});
	it('includes best-of parents between games, independent of alias availability, without duplicate rows', () => {
		const game = { gameid: 'bestof', ended: false };
		const rooms = [room('set-parent', { bestOf: game, game }), room('set-fallback', { game }),
			room('child-ended', { battle: { ended: true } }), room('set-ended', { bestOf: { ended: true } })];
		assert.deepEqual(unfinishedBattleRooms(rooms).map(r => r.roomid), ['set-parent', 'set-fallback']);
	});
	it('normal drained lockdown exits once after a full ten-second warning, with default preference', () => {
		const f = fixture(); f.drain.request(); f.drain.request();
		assert.deepEqual(f.notices, ['warning']); assert.equal(f.clock.tasks.size, 1);
		f.clock.advance(9999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1);
		assert.equal(f.exits(), 1);
		f.drain.request(); f.clock.advance(10000); assert.equal(f.exits(), 1);
	});
	for (const mode of [false, 'pre', 'ddos']) it('does not arm an exit for lockdown state ' + mode, () => {
		const f = fixture();
		f.state.lockdown = mode;
		f.drain.request();
		f.clock.advance(60000);
		assert.equal(f.exits(), 0); assert.equal(f.clock.tasks.size, 0);
	});
	it('slow lockdown stays manual even after an old warning was already queued', () => {
		const f = fixture(); f.drain.request(); const obsolete = [...f.clock.tasks.values()][0].callback;
		f.clock.advance(9000);
		f.drain.cancel();
		f.state.slowLockdown = true;
		f.drain.request();
		obsolete();
		f.clock.advance(30000); assert.equal(f.exits(), 0); assert.equal(f.clock.tasks.size, 0);
	});
	it('disconnected unrated battles prevent exit until their authoritative ended flag changes', () => {
		const f = fixture(); const battle = { ended: false, active: false, rated: 0 };
		f.rooms.set('battle-unrated', room('battle-unrated', { battle })); f.drain.request(); f.clock.advance(15000);
		assert.equal(f.exits(), 0); assert.deepEqual(f.notices, []);
		battle.ended = true; f.clock.advance(1000); assert.deepEqual(f.notices, ['warning']);
		f.clock.advance(9999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1);
		assert.equal(f.exits(), 1);
	});
	it('observes last-child then best-of-parent completion without another battle callback', () => {
		const f = fixture(); const parent = { gameid: 'bestof', ended: false };
		f.rooms.set('set', room('set', { bestOf: parent, game: parent }));
		f.rooms.set('child', room('child', { battle: { ended: true } }));
		f.drain.request();
		f.clock.advance(10000);
		assert.equal(f.exits(), 0);
		assert.equal(f.notices.length, 0);
		parent.ended = true; f.clock.advance(1000); assert.deepEqual(f.notices, ['warning']);
		f.clock.advance(10000); assert.equal(f.exits(), 1);
	});
	it('observes destroyed unfinished rooms without a lifecycle callback', () => {
		const f = fixture(); f.rooms.set('battle', room('battle', { battle: { ended: false } }));
		f.drain.request();
		f.rooms.delete('battle');
		f.clock.advance(10999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1); assert.equal(f.exits(), 1);
	});
	it('revalidates a newly unfinished child/parent at expiry and grants a fresh full countdown after drain', () => {
		const f = fixture(); f.drain.request(); f.clock.advance(5000);
		f.rooms.set('set', room('set', { bestOf: { ended: false } }));
		f.rooms.set('child', room('child', { battle: { ended: false } }));
		f.clock.advance(5000); assert.equal(f.exits(), 0); assert.deepEqual(f.notices, ['warning', 'canceled']);
		f.rooms.clear();
		f.clock.advance(10999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1);
		assert.equal(f.exits(), 1);
	});
	it('a request that observes new work during grace cancels the old deadline even if work ends before it', () => {
		const f = fixture(); f.drain.request(); f.clock.advance(5000);
		f.rooms.set('child', room('child', { battle: { ended: false } })); f.drain.request();
		assert.deepEqual(f.notices, ['warning', 'canceled']); f.clock.advance(2000);
		f.rooms.clear();
		f.drain.request();
		f.clock.advance(3000);
		assert.equal(f.exits(), 0);
		f.clock.advance(7999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1);
		assert.equal(f.exits(), 1);
	});
	it('does not count stale active-player totals as authority once all records ended', () => {
		const f = fixture(); f.state.battleCount = 99;
		f.rooms.set('battle', room('battle', { battle: { ended: true, active: true } }));
		f.drain.request(); f.clock.advance(10000); assert.equal(f.exits(), 1);
	});
	it('checks update lock before arming and again at the final callback', () => {
		const f = fixture();
		f.state.updating = true;
		f.drain.request();
		f.clock.advance(5000);
		assert.equal(f.notices.length, 0); f.state.updating = false; f.clock.advance(1000);
		assert.deepEqual(f.notices, ['warning']); f.state.updating = true; f.clock.advance(10000);
		assert.equal(f.exits(), 0);
		f.state.updating = false;
		f.clock.advance(10999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1); assert.equal(f.exits(), 1);
	});
	it('a canceled session callback cannot kill early or clear a newer session timer', () => {
		const f = fixture(); f.drain.request(); const old = [...f.clock.tasks.values()][0].callback;
		f.clock.advance(9000);
		f.drain.cancel();
		f.drain.request();
		old();
		assert.equal(f.clock.tasks.size, 1); f.clock.advance(9999); assert.equal(f.exits(), 0);
		f.clock.advance(1); assert.equal(f.exits(), 1);
	});
	it('direct preference disable is rechecked at expiry', () => {
		const f = fixture();
		f.drain.request();
		f.state.auto = false;
		f.clock.advance(10000);
		assert.equal(f.exits(), 0); assert.equal(f.clock.tasks.size, 0);
	});
	it('actual configuration off/on commands invalidate old callbacks and restart the full grace period', () => {
		const { f, commands, context } = commandHarness(); f.state.auto = true; f.drain.request();
		const old = [...f.clock.tasks.values()][0].callback; f.clock.advance(9000);
		commands.autolockdownkill.call(context, 'off', null, { name: 'Staff' });
		commands.autolockdownkill.call(context, 'on', null, { name: 'Staff' }); old();
		f.clock.advance(9999);
		assert.equal(f.exits(), 0);
		f.clock.advance(1);
		assert.equal(f.exits(), 1);
	});
	it('configuration on during slow lockdown preserves manual mode and explains it', () => {
		const { f, commands, context, replies } = commandHarness(); f.state.auto = false; f.state.slowLockdown = true;
		commands.autolockdownkill.call(context, 'on', null, { name: 'Staff' });
		assert.equal(f.state.auto, true); assert.equal(f.state.slowLockdown, true);
		assert(replies.some(s => s.includes('remains manual'))); f.clock.advance(30000); assert.equal(f.exits(), 0);
		assert.throws(() => commands.autolockdownkill.call(context, 'on', null, { name: 'Staff' }), /remains manual/);
	});
	it('actual end/pre commands invalidate a queued callback before later normal restart', () => {
		for (const cmd of ['endlockdown', 'prelockdown']) {
			const { f, commands, context } = commandHarness(); f.drain.request();
			const old = [...f.clock.tasks.values()][0].callback; f.clock.advance(9000);
			commands[cmd].call(context, '', null, { name: 'Staff' });
			f.state.lockdown = true;
			f.drain.request();
			old();
			f.clock.advance(9999);
			assert.equal(f.exits(), 0);
			f.clock.advance(1); assert.equal(f.exits(), 1);
		}
	});
	it('actual GlobalRoomState start wiring resets mode, invalidates timers and requests drain even when already empty', () => {
		const { state, calls, config } = globalHarness(); state.startLockdown(null, true);
		assert.equal(state.lockdown, true); assert.equal(state.slowLockdown, true);
		assert.deepEqual(calls, ['identity', 'cancel', 'request']); assert.equal(config.autolockdown, true);
		calls.length = 0; state.startLockdown(); assert.equal(state.slowLockdown, false);
		assert.deepEqual(calls, ['identity', 'cancel', 'request']);
	});
	it('remainingbattles shares the authoritative inventory, labels records and escapes private HTML and attributes', () => {
		const { f, commands, context, replies } = commandHarness();
		f.rooms.set('private', room('battle-x" onclick="alert(1)', { title: '<img src=x onerror=alert(1)>', settings: { isPrivate: true }, battle: { ended: false } }));
		f.rooms.set('set', room('set', { bestOf: { ended: false } }));
		f.rooms.set('rated', room('battle-rated', { battle: { ended: false, rated: 1000 } }));
		f.rooms.set('ended', room('ended', { battle: { ended: true } }));
		commands.remainingbattles.call(context); const html = replies[0];
		assert(html.includes('<b>3</b>'));
		assert(html.endsWith('battle-rated</a> (Battle)')); assert(html.includes('(Unrated)')); assert(html.includes('(Private)'));
		assert(html.includes('(Best-of match)')); assert(html.includes('&lt;img')); assert(!html.includes('<img'));
		assert(html.includes('href="/battle-x&quot;')); assert(!html.includes('href="battle-x" onclick'));
	});
	it('remainingbattles checks staff authorization before reading any private inventory', () => {
		const { commands, context, replies } = commandHarness(); context.checkCan = () => { throw new Error('denied'); };
		assert.throws(() => commands.remainingbattles.call(context), /denied/); assert.equal(replies.length, 0);
	});
	it('remainingbattles still requires a lockdown and collapses long inventories', () => {
		const { f, commands, context, replies } = commandHarness(); f.state.lockdown = false;
		assert.throws(() => commands.remainingbattles.call(context), /not under lockdown/); f.state.lockdown = true;
		for (let i = 0; i < 11; i++) f.rooms.set(String(i), room('battle-' + i, { battle: { ended: false } }));
		commands.remainingbattles.call(context); assert(replies[0].includes('<details>')); assert(replies[0].endsWith('</details>'));
	});
});
