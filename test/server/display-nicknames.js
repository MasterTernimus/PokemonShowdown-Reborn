'use strict';
const assert = require('assert').strict;
const plugin = require('../../dist/server/chat-plugins/username-colors');
describe('Account display nicknames', () => {
	it('migrates colors and persists independent nickname/color resets', () => {
		let saved;
		const store = new plugin.UsernameColorStore('{"alice":"#112233"}', text => { saved = text; });
		const user = { id: 'alice', registered: true };
		store.setNickname(user, '  Sky Pilot  ', 10000);
		let restored = new plugin.UsernameColorStore(saved, () => {});
		assert.equal(restored.nicknames.alice, 'Sky Pilot'); assert.equal(restored.colors.alice, '#112233');
		store.set(user, 'reset', 13000);
		restored = new plugin.UsernameColorStore(saved, () => {});
		assert.equal(restored.nicknames.alice, 'Sky Pilot'); assert.equal(restored.colors.alice, undefined);
		store.setNickname(user, '', 16000); assert.deepEqual(JSON.parse(saved), {});
	});
	it('rejects control characters, overlong names, guests and non-string targeting payloads', () => {
		const store = new plugin.UsernameColorStore('', () => {}), user = { id: 'alice', registered: true };
		for (const name of ['a\nb', 'a\u202Eb', 'a\0b', 'a\u200Bb', 'a'.repeat(25), { userid: 'bob', nickname: 'taken' }]) {
			assert.throws(() => store.setNickname(user, name));
		}
		assert.throws(() => store.setNickname({ id: 'alice', registered: false }, 'Guest'), /Sign in/);
		store.setNickname(user, '<img src=x>', 10000); assert.equal(store.nicknames.alice, '<img src=x>');
		assert.throws(() => store.setNickname(user, 'too soon', 10001), /three seconds/);
		assert.equal(store.nicknames.bob, undefined);
	});
	it('broadcasts to two own sessions and observers, keeps duplicate labels account-scoped, restores reconnect and hides guests', () => {
		const oldUsers = global.Users, oldColors = plugin.colorStore.colors, oldNames = plugin.colorStore.nicknames;
		const make = id => ({ id, registered: true, connections: [] });
		const session = user => {
			const c = { user, messages: [], send(text) {
				this.messages.push(JSON.parse(text.split('|').slice(3).join('|')));
			} };
			user.connections.push(c);
			return c;
		};
		const alice = make('nickalice'), bob = make('nickbob'), a = session(alice), a2 = session(alice), b = session(bob);
		const users = new Map([[alice.id, alice], [bob.id, bob]]);
		global.Users = { users, getExact: id => users.get(id) };
		plugin.colorStore.colors = Object.create(null); plugin.colorStore.nicknames = Object.create(null);
		const command = (c, name, value) => plugin.commands[name].call({}, value, null, c.user, c);
		try {
			command(b, 'usernamecolor', 'watch nickalice');
			command(a, 'displaynickname', JSON.stringify('Same Name'));
			assert.equal(a2.messages.at(-1).nicknames.nickalice, 'Same Name');
			assert.equal(b.messages.at(-1).nicknames.nickalice, 'Same Name');
			command(b, 'displaynickname', JSON.stringify('Same Name'));
			assert.equal(plugin.colorStore.nicknames.nickbob, 'Same Name');
			assert.equal(alice.id, 'nickalice'); assert.equal(bob.id, 'nickbob');
			command(a, 'displaynickname', '{"userid":"nickbob","nickname":"Hijacked"}');
			assert(a.messages.at(-1).error); assert.equal(plugin.colorStore.nicknames.nickbob, 'Same Name');
			const reconnect = session(bob); command(reconnect, 'usernamecolor', 'watch nickalice');
			assert.equal(reconnect.messages.at(-1).nicknames.nickalice, 'Same Name');
			alice.registered = false; plugin.loginfilter(alice);
			assert.equal(b.messages.at(-1).nicknames.nickalice, '');
			alice.registered = true; plugin.loginfilter(alice);
			assert.equal(b.messages.at(-1).nicknames.nickalice, 'Same Name');
			plugin.colorStore.lastWrite.delete(alice.id); command(a, 'displaynickname', 'reset');
			assert.equal(a2.messages.at(-1).nicknames.nickalice, '');
		} finally {
			global.Users = oldUsers;
			plugin.colorStore.colors = oldColors;
			plugin.colorStore.nicknames = oldNames;
			plugin.colorStore.lastWrite.delete(alice.id);
			plugin.colorStore.lastWrite.delete(bob.id);
		}
	});
});
