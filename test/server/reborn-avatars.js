'use strict';
const assert = require('assert').strict, { RebornAvatars } = require('../../dist/data/reborn-avatars');
describe('Public Reborn trainer avatars', () => {
	let Avatars; before(() => { Avatars = require('../../dist/server/chat-commands/avatars').Avatars; });
	it('registers every verified portrait for ordinary users', () => {
		assert.equal(new Set(RebornAvatars.map(x => x.id)).size, RebornAvatars.length);
		for (const row of RebornAvatars) {
			assert.equal(Avatars.canUse('ordinaryplayer', row.id), row.id);
			assert.equal(Avatars.exists(row.id), true);
			assert.match(row.sha256, /^[a-f0-9]{64}$/);
		}
	});
	it('retains standard avatars and rejects unknown IDs', () => { assert.equal(Avatars.canUse('ordinaryplayer', 'lucas'), 'lucas'); assert.equal(Avatars.canUse('ordinaryplayer', 'reborn-unverified'), null); });
});
