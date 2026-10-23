'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { createRequire } = require('module');
const root = path.resolve(__dirname, '../..');
const algorithm = 'sha256-json-canonical-runtime-files-v1';
function load(name, sandbox, overrides = {}) {
	const file = path.join(root, 'dist/server', name + '.js');
	const nativeRequire = createRequire(file);
	const entry = { exports: {} };
	const loadDependency = id => id in overrides ? overrides[id] : nativeRequire(id);
	const wrapper = '(function(require,module,exports){' + fs.readFileSync(file, 'utf8') + '\n})';
	vm.runInNewContext(wrapper, sandbox, { filename: file })(loadDependency, entry, entry.exports);
	return entry.exports;
}
describe('Pending verified battles', () => {
	let guard, ladders, users, identity, clock, created, sandbox, nonce, lockdown;
	function user(id) {
		const entry = { id, name: id, named: true, connected: true, games: new Set(), inRooms: new Set(),
			battleSettings: { team: '', hidden: true, inviteOnly: true }, settings: {}, messages: [],
			send(message) { this.messages.push(message); }, popup(message) { this.messages.push(message); } };
		users.set(id, entry);
		return entry;
	}
	function connection(entry) { return { user: entry, send() {}, popup() {}, ip: '127.0.0.1' }; }
	function verify(c) {
		const request = { schemaVersion: 1, requestId: (++nonce).toString(16).padStart(32, '0'), roomId: '',
			algorithm, mechanicsSHA256: identity.mechanicsSHA256 };
		assert(guard.battleEngineQuery(c, JSON.stringify(request), true).commandGateEnforced);
	}
	function ready(entry, intent) {
		const result = new ladders.BattleReady(entry.id, 'gen9test', { ...entry.battleSettings }, 1000);
		result.engineGuardIntent = intent;
		return result;
	}
	function pending(c, command = 'challenge') {
		verify(c);
		let result;
		guard.runBattleEngineCommand({ connection: c, user: c.user, room: null, cmd: command, target: 'gen9test' }, () => {
			result = guard.pendingBattleEngineIntent(guard.currentBattleEngineIntent());
		});
		assert(result);
		return result;
	}
	beforeEach(() => {
		clock = 1000;
		nonce = 0;
		lockdown = false;
		created = [];
		users = new Map();
		identity = { algorithm, mechanicsSHA256: 'a'.repeat(64), generation: 'worker-one' };
		sandbox = { Date: class extends Date {static now() { return clock; }}, Config: { noipchecks: true },
			toID: text => String(text).toLowerCase().replace(/[^a-z0-9]+/g, ''), setInterval() { return 0; },
			Users: { get: id => users.get(id) }, Chat: { nicknamefilter: text => text },
			Punishments: { isBattleBanned: () => false }, Monitor: { countConcurrentBattle: () => false, countPrepBattle: () => false },
			Dex: { gen: 9, formats: { validate: id => id, get: () => ({ playerCount: 2 }) } },
			Rooms: { global: { lockdown: false }, get() {}, createBattle(options) {
				created.push(options);
				for (const player of options.players) ladders.cancelSearches(player.user);
				return { options };
			} }, TeamValidatorAsync: { get: () => ({ validateTeam: async () => '1' }) } };
		guard = load('battle-engine-guard', sandbox, { './battle-engine-snapshot': { ENGINE_ALGORITHM: algorithm } });
		guard.configureBattleEngineGuard({ pool: () => ({ identity }), room: () => ({ identity: null }), lockdown: () => lockdown });
		class Store {constructor(format) { this.formatid = format; }}
		ladders = load('ladders', sandbox, { './battle-engine-guard': guard, './ladders-local': { LadderStore: Store },
			'./ladders-challenges': { ...require(root + '/dist/server/ladders-challenges'), challenges: { remove: () => true } } }).Ladders;
		sandbox.Ladders = ladders;
	});
	it('allows human challenge acceptance after fifteen seconds without renewing the command lease', async () => {
		const leaf = user('leaf'), human = user('human'), c = connection(leaf);
		const outgoing = ready(leaf, pending(c));
		clock += 16000;
		let ran = false;
		guard.runBattleEngineCommand({ connection: c, user: leaf, room: null, cmd: 'challenge', target: 'human' }, () => { ran = true; });
		assert(!ran, 'the original command permit must still expire');
		// That rejected new command invalidates the session; use a separately created pending challenge for acceptance.
		verify(c);
		const outgoingAgain = await guard.runBattleEngineCommand({
			connection: c, user: leaf, room: null, cmd: 'challenge', target: 'human',
		}, () => ladders('gen9test').prepBattle(c, 'challenge'));
		assert.equal(outgoingAgain.settings.hidden, true);
		assert.equal(leaf.battleSettings.hidden, false);
		clock += 16000;
		ladders.Ladder.prototype.prepBattle = async () => ready(human);
		await ladders.acceptChallenge(connection(human), { format: 'gen9test', ready: outgoingAgain, official: false });
		assert.equal(created.length, 1);
		assert.throws(() => guard.assertBattleEngineIntent(outgoing.engineGuardIntent));
	});
	it('matches an unchanged queued binding after fifteen seconds', () => {
		const leaf = user('leaf'), human = user('human');
		const queue = new Map([[leaf.id, ready(leaf, pending(connection(leaf), 'search'))], [human.id, ready(human)]]);
		ladders.searches.set('gen9test', { playerCount: 2, searches: queue });
		clock += 16000;
		assert.doesNotThrow(() => ladders.Ladder.periodicMatch());
		assert.equal(created.length, 1); assert.equal(queue.size, 0);
	});
	it('rejects invalid pending bindings while preserving unaffected queue entries', () => {
		const leaf = user('leaf'), human = user('human'), other = user('other');
		const stale = ready(leaf, pending(connection(leaf), 'search'));
		const unaffected = ready(human);
		const queue = new Map([[leaf.id, stale], [human.id, unaffected]]);
		ladders.searches.set('gen9test', { playerCount: 2, searches: queue });
		identity = { ...identity, generation: 'worker-two' };
		assert.doesNotThrow(() => ladders.match([stale, unaffected]));
		assert(!queue.has(leaf.id)); assert.equal(queue.get(human.id), unaffected); assert.equal(created.length, 0);
		assert(human.messages.every(line => !line.includes('verified engine changed')));
		ladders.searches.set('gen9test', { playerCount: 2, searches: new Map([[leaf.id, stale], [human.id, unaffected]]) });
		assert.doesNotThrow(() => ladders.Ladder.periodicMatch());
		assert.equal(ladders.searches.get('gen9test').searches.get(human.id), unaffected);
		ladders('gen9test').addSearch(ready(other), other);
		assert.equal(created.length, 1);
	});
	it('invalidates pending bindings on disconnect, mismatch, replacement and lockdown', () => {
		const c = connection(user('leaf'));
		let intent = pending(c);
		guard.disconnectBattleEngineGuard(c);
		assert.throws(() => guard.assertBattleEngineIntent(intent));
		intent = pending(c); identity = { ...identity, mechanicsSHA256: 'b'.repeat(64) };
		assert.throws(() => guard.assertBattleEngineIntent(intent));
		intent = pending(c); guard.invalidateBattleEngineGuards();
		assert.throws(() => guard.assertBattleEngineIntent(intent));
		intent = pending(c); lockdown = true;
		assert.throws(() => guard.assertBattleEngineIntent(intent));
	});
	it('allows search cancellation after invalidation without a new permit', () => {
		const leaf = user('leaf'), c = connection(leaf);
		const queue = new Map([[leaf.id, ready(leaf, pending(c, 'search'))]]);
		ladders.searches.set('gen9test', { playerCount: 2, searches: queue });
		guard.invalidateBattleEngineGuards();
		guard.runBattleEngineCommand({ connection: c, user: leaf, room: null, cmd: 'search', target: '' }, () => {
			ladders.cancelSearches(leaf);
		});
		assert.equal(queue.size, 0);
	});
	it('retains privacy preferences when asynchronous final validation fails', async () => {
		const leaf = user('leaf'), c = connection(leaf);
		let resolveValidation;
		sandbox.TeamValidatorAsync.get = () => ({ validateTeam: () => new Promise(resolve => { resolveValidation = resolve; }) });
		verify(c);
		const preparing = guard.runBattleEngineCommand({ connection: c, user: leaf, room: null, cmd: 'challenge', target: 'human' },
			() => ladders('gen9test').prepBattle(c, 'challenge'));
		guard.invalidateBattleEngineGuards(); resolveValidation('1');
		await assert.rejects(preparing, /identity/);
		assert.equal(leaf.battleSettings.hidden, true); assert.equal(leaf.battleSettings.inviteOnly, true);
	});
});
