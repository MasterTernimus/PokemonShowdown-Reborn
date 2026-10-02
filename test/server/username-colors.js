'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const os = require('os');
const path = require('path');
global.Config = {...global.Config, nofswriting: true};
const plugin = require('../../dist/server/chat-plugins/username-colors');
describe('Account username colors', () => {
	it('persists canonical own-account colors and reset across store reloads', () => {
		const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'username-colors-'));
		const file = path.join(dir, 'colors.json');
		try {
			const store = new plugin.UsernameColorStore('', text => fs.writeFileSync(file, text));
			store.set({id: 'alice', registered: true}, '#12ABef', 10000);
			const restored = new plugin.UsernameColorStore(fs.readFileSync(file, 'utf8'), () => {});
			assert.equal(restored.colors.alice, '#12abef');
			store.set({id: 'alice', registered: true}, 'reset', 13000);
			assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), {});
		} finally { assert(path.resolve(dir).startsWith(path.resolve(os.tmpdir()) + path.sep)); fs.rmSync(dir, {recursive: true}); }
	});
	it('rejects guests, target-account arguments, malformed colors and rapid changes', () => {
		const store = new plugin.UsernameColorStore('', () => {});
		assert.throws(() => store.set({id: 'alice', registered: false}, '#112233'), /Sign in/);
		for (const value of ['bob,#112233', '#123', 'red', '#112233;display:none', '#112233\n|html|x', 'reset bob']) {
			assert.throws(() => store.set({id: 'alice', registered: true}, value), /six-digit/);
		}
		store.set({id: 'alice', registered: true}, '#112233', 10000);
		assert.throws(() => store.set({id: 'alice', registered: true}, '#223344', 10001), /three seconds/);
		assert.equal(store.colors.bob, undefined);
	});
	it('distributes only subscribed colors, restores reconnects, hides colors from unauthenticated names, and accepts old clients', () => {
		const previousUsers = global.Users;
		const previous = plugin.colorStore.colors;
		const make = (id, registered = true) => {
			const user = {id, registered, connections: []};
			const connection = {user, messages: [], send(text) { this.messages.push(JSON.parse(text.split('|').slice(3).join('|'))); }};
			user.connections.push(connection);
			return {user, connection};
		};
		const alice = make('coloralice'), bob = make('colorbob'), old = make('oldclient');
		const users = new Map([alice, bob, old].map(x => [x.user.id, x.user]));
		global.Users = {users, getExact: id => users.get(id)};
		plugin.colorStore.colors = Object.create(null);
		const command = (session, value) => plugin.commands.usernamecolor.call({}, value, null, session.user, session.connection);
		try {
			command(bob, 'watch coloralice');
			command(alice, '#123456');
			assert.equal(bob.connection.messages.at(-1).colors.coloralice, '#123456');
			assert.equal(old.connection.messages.length, 0);
			const reconnect = make('colorbob'); users.set('colorbob', reconnect.user);
			command(reconnect, 'watch coloralice');
			assert.equal(reconnect.connection.messages.at(-1).colors.coloralice, '#123456');
			command(alice, 'colorbob,#abcdef');
			assert(alice.connection.messages.at(-1).error);
			assert.equal(plugin.colorStore.colors.colorbob, undefined);
			alice.user.registered = false;
			plugin.loginfilter(alice.user);
			assert.equal(reconnect.connection.messages.at(-1).colors.coloralice, '');
			alice.user.registered = true; plugin.loginfilter(alice.user);
			assert.equal(reconnect.connection.messages.at(-1).colors.coloralice, '#123456');
			plugin.colorStore.lastWrite.delete('coloralice'); command(alice, 'reset');
			assert.equal(reconnect.connection.messages.at(-1).colors.coloralice, '');
		} finally { global.Users = previousUsers; plugin.colorStore.colors = previous; }
	});
});
