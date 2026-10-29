'use strict';

const assert = require('assert').strict;

describe('Public official battle metadata', () => {
	let originalRooms;
	let query;
	const format = 'gen9doublesrockyfield';
	function battle(id, changes = {}) {
		return {
			roomid: `battle-${format}-${id}`, type: 'battle', format, active: true,
			official: true, settings: {}, rated: 0,
			battle: { started: true, ended: false, p1: { id: 'alice', name: 'Alice' }, p2: { id: 'bob', name: 'Bob' } },
			...changes,
		};
	}
	function install(...rooms) {
		Rooms.rooms = new Map(rooms.map(room => [room.roomid, room]));
	}
	before(() => {
		query = require('../../dist/server/chat-commands/core').crqHandlers.roomlist;
	});
	beforeEach(() => { originalRooms = Rooms.rooms; });
	afterEach(() => { Rooms.rooms = originalRooms; });

	it('exposes explicit official status only for listed public battles', () => {
		const official = battle(1), practice = battle(2, { official: false });
		const tournament = battle(3, { official: false, tour: {} });
		install(official, practice, tournament,
			battle(4, { settings: { isPrivate: true } }),
			battle(5, { settings: { isPrivate: 'hidden' } }),
			battle(6, { settings: { isPrivate: 'voice' } }),
			battle(7, { active: false }), battle(8, { type: 'chat' }));
		const response = query(',,,fresh_1', {}, true);
		assert.equal(response.officialLiveVersion, 1);
		assert.equal(response.requestId, 'fresh_1');
		assert.deepEqual(Object.keys(response.rooms), [tournament.roomid, practice.roomid, official.roomid]);
		assert.deepEqual(response.rooms[official.roomid], {
			official: true, active: true, visibility: 'public', format, p1: 'Alice', p2: 'Bob',
		});
		assert.equal(response.rooms[practice.roomid].official, false);
		assert.equal(response.rooms[tournament.roomid].official, false);
		assert.equal(response.rooms[tournament.roomid].minElo, 'tour');
		assert.equal(JSON.stringify(response).includes('settings'), false);
		assert.equal(JSON.stringify(response).includes('hidden'), false);
	});

	it('does not label ended or not-yet-started battles as ongoing even if active is stale', () => {
		const ended = battle(1), waiting = battle(2), notOfficial = battle(3, { official: 'true' });
		ended.battle.ended = true;
		waiting.battle.started = false;
		install(ended, waiting, notOfficial);
		const response = query(',,,fresh_2', {}, true);
		assert.equal(response.rooms[ended.roomid].active, false);
		assert.equal(response.rooms[waiting.roomid].active, false);
		assert.equal(response.rooms[notOfficial.roomid].official, false);
	});

	it('preserves legacy filters, limits and replies without a nonce', () => {
		install(battle(1), battle(2, { rated: 1200 }), battle(3, { format: 'gen9ou', rated: 1300 }));
		const legacy = query(`${format},1100,ali`, {}, true);
		assert.deepEqual(Object.keys(legacy.rooms), [`battle-${format}-2`]);
		assert.equal(legacy.rooms[`battle-${format}-2`].minElo, 1200);
		assert.equal(legacy.requestId, undefined);
		const fresh = query(`${format},1100,ali,new-id`, {}, true);
		assert.deepEqual(fresh.rooms, legacy.rooms);
		assert.equal(fresh.requestId, 'new-id');
		install(...Array.from({ length: 105 }, (_, i) => battle(i)));
		assert.equal(Object.keys(query('', {}, true).rooms).length, 100);
	});

	it('returns no list for untrusted requests and rejects malformed correlation IDs', () => {
		install(battle(1));
		assert.equal(query(',,,request', {}, false), false);
		for (const nonce of ['a'.repeat(65), 'two words', 'bad|token', '<script>']) {
			assert.equal(query(`,,,${nonce}`, {}, true), null);
		}
		const first = query(',,,request-1', {}, true), second = query(',,,request-2', {}, true);
		assert.equal(first.requestId, 'request-1');
		assert.equal(second.requestId, 'request-2');
	});
});
