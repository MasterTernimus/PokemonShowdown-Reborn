'use strict';
const assert = require('assert').strict;
const { makeUser } = require('../users-utils');
const { Ladders } = require('../../dist/server/ladders');
let commands;

describe('Challenge option protocol', () => {
	let p1, p2, prep, create, created, popup;
	const format = 'gen9nofieldsinglesgame';
	before(() => { commands = require('../../dist/server/chat-commands/core').commands; });
	beforeEach(() => {
		p1 = makeUser('OptionAlice', '192.168.0.11'); p2 = makeUser('OptionBob', '192.168.0.12');
		Users.users.set(p1.id, p1); Users.users.set(p2.id, p2);
		prep = Ladders.Ladder.prototype.prepBattle; create = Rooms.createBattle; created = null;
		popup = [];
		Ladders.Ladder.prototype.prepBattle = async function (connection, type) { return new Ladders.BattleReady(connection.user.id, this.formatid, {}, 0, type); };
		Rooms.createBattle = options => { created = options; return options; };
	});
	afterEach(() => {
		Ladders.Ladder.prototype.prepBattle = prep; Rooms.createBattle = create;
		for (const user of [p1, p2]) {
			Ladders.challenges.clearFor(user.id); user.resetName();
			user.disconnectAll(); user.destroy();
		}
	});
	const connection = user => ({ user, popup: message => popup.push(message) });
	it('shows settings, freezes a snapshot, and carries the accepted challenge options', async () => {
		const options = { weather: 'raindance', gimmicks: 1 };
		assert(await Ladders(format).makeChallenge(connection(p1), p2, false, options));
		options.gimmicks = 2;
		const challenge = Ladders.challenges.search(p1.id, p2.id);
		assert.match(Ladders.challenges.getUpdate(challenge), /Starting weather: Rain/);
		assert.match(Ladders.challenges.getUpdate(challenge), /per trainer: 1 shared uses/);
		await Ladders.acceptChallenge(connection(p2), challenge);
		assert.deepEqual(created.challengeOptions, { weather: 'raindance', gimmicks: 1 });
		assert.equal(Ladders.challenges.search(p1.id, p2.id), null);
	});
	it('does not silently accept a reciprocal challenge with different settings', async () => {
		await Ladders(format).makeChallenge(connection(p1), p2, false, { gimmicks: 1 });
		assert.equal(await Ladders(format).makeChallenge(connection(p2), p1, false, { gimmicks: 2 }), false);
		assert.equal(created, null);
		const old = Ladders.challenges.search(p1.id, p2.id);
		assert.equal(old.ready.challengeOptions.gimmicks, 1);
		assert(Ladders.challenges.remove(old)); p1.lastChallenge = 0;
		await Ladders(format).makeChallenge(connection(p1), p2, false, { gimmicks: 0 });
		assert.equal(Ladders.challenges.search(p1.id, p2.id).ready.challengeOptions.gimmicks, 0);
	});
	it('rejects invalid options before team preparation', async () => {
		let prepared = false; Ladders.Ladder.prototype.prepBattle = async () => { prepared = true; };
		assert.equal(await Ladders(format).makeChallenge(connection(p1), p2, false, { gimmicks: 9 }), false);
		assert.equal(prepared, false); assert.equal(created, null); assert.match(popup[0], /0, 1, or 2/);
	});
	it('rejects random-field weather before creating an offer', async () => {
		let prepared = false;
		Ladders.Ladder.prototype.prepBattle = async () => { prepared = true; };
		assert.equal(await Ladders('gen9randomfield').makeChallenge(connection(p1), p2, false,
			{ weather: 'raindance' }), false);
		assert.equal(prepared, false);
		assert.equal(Ladders.challenges.search(p1.id, p2.id), null);
		assert.match(popup[0], /random field/);
	});
	it('parses explicit settings without losing comma-separated custom rules', async () => {
		const command = commands.challenge;
		const ctx = { splitUser: () => ({ targetUser: p2, targetUsername: p2.name, rest: format + '@@@-Pikachu, -Raichu, false, weather=hail;gimmicks=1' }), popupReply: message => popup.push(message) };
		await command.call(ctx, '', null, p1, connection(p1));
		const challenge = Ladders.challenges.search(p1.id, p2.id);
		assert.equal(challenge.format, format + '@@@-Pikachu, -Raichu');
		assert.deepEqual(challenge.ready.challengeOptions, { weather: 'hail', gimmicks: 1 });
	});
	it('rejects duplicate and malicious command settings', async () => {
		for (const text of ['gimmicks=1;gimmicks=2', 'gimmicks=3', 'weather=rain|html', 'other=true', 'gimmicks=1=2']) {
			const ctx = { splitUser: () => ({ targetUser: p2, targetUsername: p2.name, rest: format + ', false, ' + text }), popupReply: message => popup.push(message) };
			await commands.challenge.call(ctx, '', null, p1, connection(p1));
			assert.equal(Ladders.challenges.search(p1.id, p2.id), null);
		}
	});
	it('reports challenge control availability using authoritative validation', () => {
		const query = require('../../dist/server/chat-commands/core').crqHandlers.challengeoptions;
		assert.deepEqual(query(format, p1, true), { format, weather: '', gimmicks: '' });
		assert.match(query('gen9randomfield', p1, true).weather, /random field/);
		assert.equal(query('gen9randomfield', p1, true).gimmicks, '');
		assert.match(query('notarealformat', p1, true).weather, /supported format/);
		assert.equal(query(format, p1, false), null);
		for (const f of Dex.formats.all()) {
			if (f.name.includes('Multi 1v2')) assert.match(query(f.id, p1, true).gimmicks, /not supported/);
		}
	});
});
