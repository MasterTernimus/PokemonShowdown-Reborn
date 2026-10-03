import { FS } from '../../lib';

const FILE = 'config/username-colors.json';
export function parseColor(value: string): string {
	if (value === 'reset') return '';
	if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error('Choose a six-digit hex color or reset.');
	return value.toLowerCase();
}

export function parseNickname(value: unknown): string {
	if (typeof value !== 'string' || /[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/u.test(value)) {
		throw new Error('Display nickname must be plain text without control characters.');
	}
	const nickname = value.trim().normalize('NFC');
	if ([...nickname].length > 24) throw new Error('Display nickname must be 24 characters or fewer.');
	return nickname;
}

export class UsernameColorStore {
	colors: { [id: string]: string } = Object.create(null);
	nicknames: { [id: string]: string } = Object.create(null);
	lastWrite = new Map<string, number>();
	private save: (data: string) => void;
	constructor(raw: string, save: (data: string) => void) {
		this.save = save;
		const parsed = JSON.parse(raw || '{}');
		for (const [id, entry] of Object.entries(parsed)) {
			const value = typeof entry === 'string' ? entry : (entry as { color?: unknown })?.color;
			if (/^[a-z0-9]{1,18}$/.test(id) && entry && typeof entry === 'object') {
				try {
					const nickname = parseNickname((entry as { nickname?: unknown }).nickname || '');
					if (nickname) this.nicknames[id] = nickname;
				} catch {}
			}
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
		this.persist();
		return color;
	}
	private persist() {
		const data: { [id: string]: string | { color: string, nickname: string } } = Object.create(null);
		for (const id of new Set([...Object.keys(this.colors), ...Object.keys(this.nicknames)])) {
			data[id] = this.nicknames[id] ? { color: this.colors[id] || '', nickname: this.nicknames[id] } : this.colors[id];
		}
		this.save(JSON.stringify(data));
	}
	setNickname(user: { id: string, registered: boolean }, value: unknown, now = Date.now()) {
		if (!user.registered || !/^[a-z0-9]{1,18}$/.test(user.id)) throw new Error('Sign in to save a display nickname.');
		const nickname = parseNickname(value);
		if (now - (this.lastWrite.get(user.id) ?? -Infinity) < 3000)
			throw new Error('Please wait three seconds between appearance changes.');
		for (const [id, time] of this.lastWrite) if (now - time > 60000) this.lastWrite.delete(id);
		this.lastWrite.set(user.id, now);
		if (nickname) this.nicknames[user.id] = nickname;
		else delete this.nicknames[user.id];
		this.persist();
		return nickname;
	}
}

export const colorStore = new UsernameColorStore(FS(FILE).readIfExistsSync(), data => FS(FILE).writeUpdate(() => data));
const watchers = new WeakMap<Connection, Set<string>>();
const lastWatch = new WeakMap<Connection, number>();
function visibleColor(id: string) {
	const user = Users.getExact(id);
	return user?.registered ? colorStore.colors[id] || '' : '';
}
function visibleNickname(id: string) {
	return Users.getExact(id)?.registered ? colorStore.nicknames[id] || '' : '';
}
function send(connection: Connection, colors: { [id: string]: string }, error?: string) {
	const user = connection.user;
	connection.send(`|queryresponse|usernamecolor|${JSON.stringify({ colors, nicknames: Object.fromEntries(Object.keys(colors).map(id => [id, visibleNickname(id)])), error, own: {
		userid: user.id, registered: user.registered, color: visibleColor(user.id), nickname: visibleNickname(user.id),
	} })}`);
}
function broadcast(id: string) {
	for (const user of Users.users.values()) for (const connection of user.connections) {
		if (user.id === id || watchers.get(connection)?.has(id)) send(connection, { [id]: visibleColor(id) });
	}
}
export const commands: Chat.ChatCommands = {
	displaynickname(target, room, user, connection) {
		try {
			if (target.length > 500) throw new Error('Display nickname is too long.');
			// The authenticated user supplies identity; the payload contains only the label.
			const value = target === 'reset' ? '' : JSON.parse(target);
			colorStore.setNickname(user, value);
			send(connection, { [user.id]: visibleColor(user.id) });
			broadcast(user.id);
		} catch (error) {
			send(connection, {}, (error as Error).message);
		}
	},
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
