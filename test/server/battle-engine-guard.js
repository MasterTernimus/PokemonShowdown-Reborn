'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const vm = require('vm');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const algorithm = 'sha256-json-canonical-runtime-files-v1';
function freshGuard() {
	const entry = { exports: {} };
	const file = path.join(root, 'dist/server/battle-engine-guard.js');
	const load = id => id === './battle-engine-snapshot' ? { ENGINE_ALGORITHM: algorithm } : require(id);
	const wrapper = '(function(require,module,exports){' + fs.readFileSync(file, 'utf8') + '\n})';
	vm.runInNewContext(wrapper, {}, { filename: file })(load, entry, entry.exports);
	return entry.exports;
}
describe('Connection battle-engine guard', () => {
	let guard, identity, scope, connection, context, nonce;
	function query(roomId = '') {
		const request = { schemaVersion: 1, requestId: (++nonce).toString(16).padStart(32, '0'), roomId,
			algorithm, mechanicsSHA256: identity.mechanicsSHA256 };
		return guard.battleEngineQuery(connection, JSON.stringify(request), true);
	}
	function run(cmd, target = '') {
		let ran = false;
		guard.runBattleEngineCommand({ ...context, cmd, target }, () => { ran = true; });
		return ran;
	}
	beforeEach(() => {
		guard = freshGuard(); nonce = 0;
		identity = { algorithm, mechanicsSHA256: 'a'.repeat(64), generation: 'worker-one' };
		scope = { identity, rqid: 1, requestToken: 'request-one', slot: 'p1' };
		const user = { named: true };
		connection = { user, send() {} };
		context = { connection, user, room: { roomid: 'battle-test-1' } };
		guard.configureBattleEngineGuard({ pool: () => ({ identity }), room: () => scope, lockdown: () => false });
	});
	it('preserves human commands until valid opt-in and retains failed opt-in', () => {
		guard.battleEngineQuery(connection, '{', true);
		assert(run('choose'));
		const request = { schemaVersion: 1, requestId: '0'.repeat(32), roomId: '', algorithm,
			mechanicsSHA256: 'b'.repeat(64) };
		assert(guard.battleEngineQuery(connection, JSON.stringify(request), true).error);
		assert(!run('challenge'));
	});
	it('checks current room requests and single-use permits', () => {
		assert(query('battle-test-1').commandGateEnforced);
		scope = { ...scope, rqid: 2 };
		assert(!run('choose'));
		query('battle-test-1'); assert(run('move')); assert(!run('choose'));
	});
	it('invalidates leases on malformed checks, generation change and disconnect', () => {
		query('battle-test-1'); guard.battleEngineQuery(connection, '{', true); assert(!run('choose'));
		query('battle-test-1'); guard.invalidateBattleEngineGuards(); assert(!run('choose'));
		query('battle-test-1'); guard.disconnectBattleEngineGuard(connection); assert(!run('choose'));
		assert(!run('challenge'));
	});
	it('gates every timer enable spelling and normalized variant while allowing timer off', () => {
		query();
		for (const value of ['on', 'start', 'true', 'yes', '1', 'enable', 'allow']) {
			for (const target of [value, value.toUpperCase(), ' ' + value + ' ', value.split('').join('-'),
				value.split('').join(' ')]) assert(!run('timer', target), target);
		}
		assert(run('timer', 'off'));
		query('battle-test-1'); assert(run('timer', 'en able'));
	});
	it('does not disclose unauthorized room identities and bounds request rates', () => {
		scope = { identity: null };
		assert(query('battle-test-1').error); assert(!run('choose'));
		let reply;
		for (let i = 0; i < 21; i++) reply = query();
		assert(reply.error); assert(!run('search', 'gen9test'));
	});
});
