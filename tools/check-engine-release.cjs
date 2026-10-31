'use strict';

// Exercise the final compiled snapshot and the same framing used by guarded workers.
// File parity alone cannot prove that the server accepts a packaged engine.
const assert = require('assert').strict;
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const tick = () => new Promise(resolve => setImmediate(resolve));

async function verifyEngineRelease(pinFile = path.join(root, 'config/battle-engine-identity.json')) {
	const {captureEngineSnapshot} = require('../dist/server/battle-engine-snapshot');
	const {BattleEngineStreamControl} = require('../dist/server/battle-engine-stream');
	const {Teams} = require('../dist/sim/teams');
	const pin = JSON.parse(fs.readFileSync(pinFile, 'utf8'));
	const snapshot = captureEngineSnapshot(root, pinFile);
	assert.equal(snapshot.identity.mechanicsSHA256, pin.mechanicsSHA256);
	const options = {formatid: 'gen9nofieldsinglesgame', seed: [1, 2, 3, 4]};
	snapshot.validateStart(options);
	const output = [], requests = new Map(), submitted = new Set();
	let battle, unavailable = false;
	const control = new BattleEngineStreamControl(snapshot, value => {
		output.push(value);
		const lines = value.split('\n');
		if (lines[0] === 'sideupdate' && lines[2]?.startsWith('|request|')) {
			requests.set(lines[1], JSON.parse(lines[2].slice(9)));
		}
	}, value => { battle = value; }, () => { unavailable = true; });
	try {
		assert(control.handle('>engineguard ' + JSON.stringify({
			identity: snapshot.identity,
			command: '>start ' + JSON.stringify(options),
		})));
		for (const [slot, species] of [['p1', 'Pikachu'], ['p2', 'Bulbasaur']]) {
			const team = Teams.pack([{species, ability: 'No Ability', moves: ['Protect']}]);
			assert(control.handle('>player ' + slot + ' ' + JSON.stringify({name: slot, team})));
		}
		await tick();
		for (let round = 0; round < 4 && !(battle?.turn >= 2); round++) {
			for (const [slot, request] of requests) {
				if (!request || request.wait || submitted.has(request.engineRequestToken)) continue;
				assert(request.engineRequestToken, 'Guarded requests must carry a command token');
				submitted.add(request.engineRequestToken);
				assert(control.handle('>engineguard ' + JSON.stringify({
					identity: snapshot.identity, slot, requestToken: request.engineRequestToken,
					command: '>' + slot + (request.teamPreview ? ' team 1' : ' move 1'),
				})));
			}
			await tick();
		}
		snapshot.assertValid();
		assert(!unavailable, 'Guarded worker invalidated its snapshot');
		assert(!output.some(value => /Guarded engine unavailable|\|error\|/.test(value)), output.join('\n'));
		assert(battle?.turn >= 2, 'Final engine must complete a guarded battle turn');
		return {accepted: true, mechanicsSHA256: snapshot.identity.mechanicsSHA256, guardedTurnCompleted: true};
	} finally {
		control.destroy();
	}
}

if (require.main === module) {
	verifyEngineRelease(process.argv[2]).then(result => console.log(JSON.stringify(result)), error => {
		console.error(error.message);
		process.exitCode = 1;
	});
}
module.exports = {verifyEngineRelease};
