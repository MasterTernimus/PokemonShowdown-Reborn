/** Connection-scoped, opt-in guard for the ordinary authenticated battle command protocol. */
import { AsyncLocalStorage } from 'async_hooks';
import { randomBytes } from 'crypto';
import { ENGINE_ALGORITHM, type EngineIdentity } from './battle-engine-snapshot';
export type GuardIdentity = EngineIdentity;
export interface GuardScope {
	identity: Readonly<GuardIdentity> | null;
	rqid?: number;
	requestToken?: string;
	slot?: string;
}
interface Lease extends GuardScope {
	expires: number;
	epoch: number;
	user: User;
	used: boolean;
}
interface Session {
	epoch: number;
	user: User;
	leases: Map<string, Lease>;
}
export interface BattleEngineIntent {
	connection: Connection;
	epoch: number;
	lease: Lease;
	scope: string;
}
const optIn = Symbol.for('showdown.battle-engine-guard.opt-in');
const sessions = new WeakMap<Connection, Session>();
const optedConnections = new Set<Connection>();
const accountQueries = new WeakMap<User, {
	start: number,
	count: number,
}>();
const dispatch = new AsyncLocalStorage<BattleEngineIntent>();
let poolScope: () => GuardScope = () => ({ identity: null });
let roomScope: (connection: Connection, room: string) => GuardScope = () => ({ identity: null });
let lockdown: () => boolean = () => typeof Rooms !== 'undefined' && !!Rooms.global.lockdown;
let generation = randomBytes(16).toString('hex');
export function configureBattleEngineGuard(providers: {
	pool: () => GuardScope,
	room: (connection: Connection, room: string) => GuardScope,
	lockdown?: () => boolean,
}) {
	poolScope = providers.pool;
	roomScope = providers.room;
	if (providers.lockdown)
		lockdown = providers.lockdown;
}
export function battleEngineGeneration() { return generation; }
export function invalidateBattleEngineGuards() {
	generation = randomBytes(16).toString('hex');
	for (const connection of optedConnections) {
		const session = sessions.get(connection);
		if (!session)
			continue;
		session.epoch++;
		session.leases.clear();
		if (connection.user)
			connection.send('|battleenginechange|' + generation);
	}
}
export function disconnectBattleEngineGuard(connection: Connection) {
	const session = sessions.get(connection);
	if (session) {
		session.epoch++;
		session.leases.clear();
	}
	optedConnections.delete(connection);
	sessions.delete(connection); // Retain opt-in on the dead object: it must never become an unguarded human fallback.
}
function scopeFor(connection: Connection, room: string) { return room ? roomScope(connection, room) : poolScope(); }
function failure(message = 'Battle engine identity is unavailable or changed. Verify again before battling.') {
	return new Error(message);
}
function verifyIntent(intent: BattleEngineIntent, consume = false): GuardScope {
	const session = sessions.get(intent.connection), lease = intent.lease;
	if (!session || !intent.connection.user || intent.connection.user !== session.user || session.user !== lease.user ||
		session.epoch !== intent.epoch || lease.epoch !== session.epoch || lease.expires < Date.now() || lockdown())
		throw failure();
	const actual = scopeFor(intent.connection, intent.scope);
	if (!actual.identity || !lease.identity || actual.identity.algorithm !== lease.identity.algorithm ||
		actual.identity.mechanicsSHA256 !== lease.identity.mechanicsSHA256 ||
		actual.identity.generation !== lease.identity.generation ||
		(intent.scope && (actual.rqid !== lease.rqid || actual.requestToken !== lease.requestToken ||
			actual.slot !== lease.slot)))
		throw failure();
	if (consume) {
		if (lease.used)
			throw failure();
		lease.used = true;
	}
	return actual;
}
/** Keep only the accepted pending battle binding; the connection's command lease remains short and single-use. */
export function pendingBattleEngineIntent(intent: BattleEngineIntent | undefined) {
	if (!intent) return undefined;
	verifyIntent(intent);
	if (intent.scope || !intent.lease.used) throw failure();
	return Object.freeze({ ...intent, lease: Object.freeze({ ...intent.lease, expires: Infinity }) });
}
export function currentBattleEngineIntent() { return dispatch.getStore(); }
export function assertBattleEngineIntent(intent: BattleEngineIntent | undefined) {
	if (intent)
		verifyIntent(intent);
}
export function getBattleEngineExpected(intent: BattleEngineIntent | undefined) {
	if (!intent)
		return undefined;
	verifyIntent(intent);
	return intent.lease.identity!;
}
export function battleEngineQuery(connection: Connection, text: string, trustable: boolean) {
	let request: any;
	const invalid = () => {
		const prior = sessions.get(connection); if (prior) {
			prior.epoch++;
			prior.leases.clear();
		} return { error: 'Invalid engine identity request' };
	};
	// Invalid input cannot opt an ordinary human connection into guarded mode.
	if (!trustable || !connection.user?.named || text.length > 1024)
		return invalid();
	try {
		request = JSON.parse(text);
	} catch {
		return invalid();
	}
	if (request?.schemaVersion !== 1 || !/^[a-f0-9]{32}$/.test(request.requestId) ||
		typeof request.roomId !== 'string' || request.roomId.length > 120 ||
		(request.roomId && !/^battle-[a-z0-9-]+$/.test(request.roomId)) ||
		request.algorithm !== ENGINE_ALGORITHM || !/^[a-f0-9]{64}$/.test(request.mechanicsSHA256))
		return invalid();
	const reply = { schemaVersion: 1, requestId: request.requestId, roomId: request.roomId, algorithm: ENGINE_ALGORITHM };
	let session = sessions.get(connection);
	if (!session || session.user !== connection.user) {
		session = { epoch: 0, user: connection.user, leases: new Map() };
		sessions.set(connection, session);
		(connection as any)[optIn] = true;
		optedConnections.add(connection);
	}
	const reject = (error: string) => {
		session.epoch++;
		session.leases.clear();
		return { ...reply, error };
	};
	// A syntactically valid opt-in persists even if this verification fails.
	session.leases.delete(request.roomId);
	const now = Date.now();
	for (const [scope, lease] of session.leases)
		if (lease.expires < now)
			session.leases.delete(scope);
	let rate = accountQueries.get(connection.user);
	if (!rate || now - rate.start >= 1000) {
		rate = { start: now, count: 0 };
		accountQueries.set(connection.user, rate);
	}
	if (++rate.count > 20 || session.leases.size >= 128)
		return reject('Engine identity request limit');
	if (lockdown())
		return reject('Battles are unavailable during restart');
	const actual = scopeFor(connection, request.roomId);
	if (!actual.identity || actual.identity.algorithm !== request.algorithm ||
		actual.identity.mechanicsSHA256 !== request.mechanicsSHA256) {
		return reject('Engine identity does not match or is unavailable');
	}
	const lease: Lease = { ...actual, expires: now + 15000, epoch: session.epoch, user: connection.user, used: false };
	session.leases.set(request.roomId, lease);
	return {
		...reply, mechanicsSHA256: actual.identity.mechanicsSHA256,
		generation: actual.identity.generation, commandGateEnforced: true,
	};
}
const globalCommands = new Set(['challenge', 'chall', 'accept', 'search']);
const roomCommands = new Set([
	'choose',
	'guess',
	'move',
	'mv',
	'attack',
	'switch',
	'sw',
	'team',
	'default',
	'undo',
	'solochoice',
]);
export function runBattleEngineCommand(context: {
	connection: Connection,
	user: User,
	room: Room | null,
	cmd: string,
	target: string,
}, action: () => any): any {
	if (context.cmd === 'hotpatch' && context.user.can?.('console'))
		invalidateBattleEngineGuards();
	if (context.cmd === 'search' && !context.target) return action();
	const session = sessions.get(context.connection);
	if (!session && !(context.connection as any)[optIn])
		return action();
	let scope: string;
	if (globalCommands.has(context.cmd))
		scope = '';
	else if (roomCommands.has(context.cmd) ||
		(context.cmd === 'timer' && ['on', 'start', 'true', 'yes', '1', 'enable', 'allow']
			.includes(context.target.toLowerCase().replace(/[^a-z0-9]+/g, ''))))
		scope = context.room?.roomid || '';
	else
		return action();
	if (!session) {
		context.connection.send('|error|Battle engine verification is required after reload.');
		return false;
	}
	const existing = dispatch.getStore();
	if (existing?.connection === context.connection) {
		verifyIntent(existing);
		return action();
	}
	const lease = session.leases.get(scope);
	if (!lease || session.user !== context.user) {
		context.connection.send('|error|Battle engine verification is required before this battle command.');
		return false;
	}
	const intent = { connection: context.connection, epoch: session.epoch, lease, scope };
	try {
		verifyIntent(intent, true);
	} catch {
		session.epoch++;
		session.leases.clear();
		context.connection.send('|battleenginechange|' + generation);
		context.connection.send('|error|Battle engine verification expired or changed; command rejected.');
		return false;
	}
	return dispatch.run(intent, action);
}
