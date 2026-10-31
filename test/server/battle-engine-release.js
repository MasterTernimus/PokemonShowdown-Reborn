'use strict';
const assert = require('assert').strict;
const fs = require('fs');
const os = require('os');
const path = require('path');
const root = path.resolve(__dirname, '../..');
const { verifyEngineRelease } = require('../../tools/check-engine-release.cjs');

describe('Final packaged engine acceptance', function () {
	this.timeout(15000);
	it('accepts the final manifest and completes a real guarded battle turn', async () => {
		const result = await verifyEngineRelease();
		assert(result.accepted && result.guardedTurnCompleted);
		assert.equal(result.mechanicsSHA256, require('../../config/battle-engine-identity.json').mechanicsSHA256);
	});
	it('rejects changed display exclusions even when mechanics hashes still match', async () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'engine-acceptance-'));
		try {
			const pin = JSON.parse(fs.readFileSync(path.join(root, 'config/battle-engine-identity.json'), 'utf8'));
			const entry = pin.excludedNonmechanics.find(file => file.file === 'dist/data/ability-descriptions.js');
			entry.sha256 = '0'.repeat(64);
			const file = path.join(directory, 'identity.json');
			fs.writeFileSync(file, JSON.stringify(pin));
			await assert.rejects(verifyEngineRelease(file), /Unreviewed display exclusion/);
		} finally {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	});
});
