'use strict';
const assert = require('assert').strict;
const { Dex } = require('../../../dist/sim');
const { ExhaustiveRunner } = require('../../../dist/sim/tools/exhaustive-runner');
const { RandomPlayerAI } = require('../../../dist/sim/tools/random-player-ai');
const { Runner } = require('../../../dist/sim/tools/runner');
const common = require('../../common');

describe('Simulation runner choices', () => {
	it('targets the Rift moves offered on the transformation turn', () => {
		const partner = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
		const lumineon = {
			species: 'Lumineon', item: 'Anomaly Core',
			moves: ['splash', 'rest', 'protect', 'falsesurrender'],
		};
		const battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[lumineon, partner], [partner, partner],
		]);
		try {
			battle.makeChoices('team 12', 'team 12');
			battle.p1.active[0].canTerastallize = null;
			let choice;
			const ai = new RandomPlayerAI({ write(text) { choice = text; } }, { mega: 1, seed: [1, 2, 3, 4] });
			ai.chooseMove = (active, moves) => moves[moves.length - 1].choice;
			ai.receiveRequest(battle.getRequests('move')[0]);
			assert.equal(choice, 'move 4 mega, move 1');
			battle.makeChoices(choice, 'move 1, move 1');
			assert.equal(battle.p1.active[0].species.id, 'lumineonrift');
			assert.equal(battle.p1.active[0].boosts.spa, 1);
		} finally {
			battle.destroy();
		}
	});

	it('rejects failed player choices instead of waiting for another turn', async () => {
		class InvalidPlayer extends RandomPlayerAI {
			receiveRequest() { this.choose('badchoice'); }
		}
		const team = [{ species: 'Mew', moves: ['psychic'] }];
		const game = new Runner({
			format: 'gen9nofieldsinglesgame', prng: [1, 2, 3, 4],
			p1options: { team, createAI: (stream, options) => new InvalidPlayer(stream, options) },
			p2options: { team },
		});
		await assert.rejects(game.run(), /Invalid choice/);
	});
});

describe('ExhaustiveRunner (slow)', () => {
	// Upstream custom-game IDs are not registered in this fork. Exercise the actual
	// singles/doubles rules and report unavailable upstream formats explicitly.
	for (const format of [...ExhaustiveRunner.FORMATS, 'gen9nofieldsinglesgame', 'gen9nofielddoublesbattle']) {
		const available = Dex.formats.get(format).exists;
		(available ? it : it.skip)(`${format}${available ? '' : ' [format unavailable]'}`, async function () {
			this.timeout(0);
			assert.equal(await new ExhaustiveRunner({ prng: [1, 2, 3, 4], format }).run(), 0);
		});
	}
});
