import { FS } from '../../lib';

const FILE = 'config/username-colors.json';
export function parseColor(value: string): string {
	if (value === 'reset') return '';
	if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Choose a six-digit hex color or reset.');
	return value.toLowerCase();
}

export class UsernameColorStore {
	colors: { [id: string]: string } = Object.create(null);
	lastWrite = new Map<string, number>();
	private save: (data: string) => void;
	constructor(raw: string, save: (data: string) => void) {
		this.save = save;
		const parsed = JSON.parse(raw || '{}');
		for (const [id, value] of Object.entries(parsed)) {
			if (/^[a-z0-9]{1,18}$/.test(id) && typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value)) {
				this.colors[id] = value.toLowerCase();
			}
		}
	}
	set(user: { id: string, registered: boolean }, value: string, now = Date.now()) {
		if (!user.registered || !/^[a-z0-9]{1,18}$/.test(user.id)) {
			throw new Error('Sign in to a registered account to save a color.');
		}
		const color = parseColor(value);
		if (now - (this.lastWrite.get(user.id) ?? -Infinity) < 3000) {
			throw new Error('Please wait three seconds between color changes.');
		}
		for (const [id, time] of this.lastWrite) if (now - time > 60000) this.lastWrite.delete(id);
		this.lastWrite.set(user.id, now);
		if (color) this.colors[user.id] = color;
		else delete this.colors[user.id];
		this.save(JSON.stringify(this.colors));
		return color;
	}
}

export const colorStore = new UsernameColorStore(FS(FILE).readIfExistsSync(), data => FS(FILE).writeUpdate(() => data));
const watchers = new WeakMap<Connection, Set<string>>();
const lastWatch = new WeakMap<Connection, number>();
function visibleColor(id: string) {
	const user = Users.getExact(id);
	return user?.registered ? colorStore.colors[id] || '' : '';
}
function send(connection: Connection, colors: { [id: string]: string }, error?: string) {
	const user = connection.user;
	connection.send(`|queryresponse|usernamecolor|${JSON.stringify({ colors, error, own: {
		userid: user.id, registered: user.registered, color: visibleColor(user.id),
	} })}`);
}
function broadcast(id: string) {
	for (const user of Users.users.values()) for (const connection of user.connections) {
		if (watchers.get(connection)?.has(id)) send(connection, { [id]: visibleColor(id) });
	}
}
export const commands: Chat.ChatCommands = {
	usernamecolor(target, room, user, connection) {
		try {
			if (target.startsWith('watch ')) {
				if (target.length > 2000) throw new Error('Too many username colors requested.');
				const ids = target.slice(6).split(',');
				if (ids.length > 100 || ids.some(id => !/^[a-z0-9]{1,18}$/.test(id))) {
					throw new Error('Invalid username color request.');
				}
				const now = Date.now();
				if (now - (lastWatch.get(connection) || 0) < 100) throw new Error('Please wait before requesting more colors.');
				lastWatch.set(connection, now);
				const watched = watchers.get(connection) || new Set<string>();
				const colors: { [id: string]: string } = Object.create(null);
				for (const id of ids) {
					if (watched.size >= 2000 && !watched.has(id)) continue;
					watched.add(id);
					colors[id] = visibleColor(id);
				}
				watchers.set(connection, watched);
				return send(connection, colors);
			}
			// No target account argument is accepted: identity comes only from authentication.
			const color = colorStore.set(user, target.trim());
			send(connection, { [user.id]: color });
			broadcast(user.id);
		} catch (error) {
			send(connection, {}, (error as Error).message);
		}
	},
};
export const loginfilter: Chat.LoginFilter = user => { broadcast(user.id); };
export const handlers: Chat.Handlers = {
	onRename(user, oldID, newID) {
		setImmediate(() => { broadcast(oldID); broadcast(newID); });
	},
	onDisconnect(user) { broadcast(user.id); },
};
