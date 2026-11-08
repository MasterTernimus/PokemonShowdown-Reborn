'use strict';

const assert = require('assert').strict;

const {MultiRandomRunner} = require('../../../dist/sim/tools/multi-random-runner');

describe('MultiRandomRunner (slow)', async function () {
	it('should run successfully', async function () {
		this.timeout(0);
		// The runner's upstream defaults name formats this fork does not register.
		// Exercise the runner against a real Reborn format with supplied teams.
		const team = [
			{ species: 'Mew', ability: 'No Ability', moves: ['psychic', 'thunderbolt'] },
			{ species: 'Blissey', ability: 'No Ability', moves: ['seismictoss', 'flamethrower'] },
		];
		const opts = {
			totalGames: 100, prng: [1, 2, 3, 4], format: 'gen9nofieldsinglesgame',
			p1options: { team }, p2options: { team },
		};
		assert.equal(await (new MultiRandomRunner(opts).run()), 0);
	});
});
