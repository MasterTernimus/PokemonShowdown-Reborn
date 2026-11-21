'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../../dist/sim');

const removals = {
	shoreup: ['hippowdon', 'hippowdonrift', 'nidoking', 'nidoqueen', 'rhyperior', 'rhydon'],
	saltcure: ['corsola', 'corsolareborn', 'bastiodon'],
};
describe('Approved Shore Up and Salt Cure removals', () => {
	for (const [moveid, ids] of Object.entries(removals)) {
		for (const id of ids) {
			it(`${id} has no direct ${moveid} source`, () => assert(!Dex.data.Learnsets[id]?.learnset?.[moveid]));
			for (const format of ['gen9dragonsden', 'gen9doublesrockyfield', 'gen9nofieldsinglesgame']) {
				it(`${format} rejects ${moveid} for ${id}, including pasted teams`, () => {
					const validator = TeamValidator.get(format), move = Dex.moves.get(moveid);
					assert(validator.checkCanLearn(move, Dex.species.get(id)));
					const problems = validator.validateTeam([{ species: id, moves: [move.name] }, { species: 'Mew', moves: ['Protect'] }]);
					assert(problems?.some(problem => problem.includes(move.name)), JSON.stringify(problems));
				});
			}
		}
	}
	it('preserves other recipients and remaining moves', () => {
		const validator = TeamValidator.get('gen9dragonsden');
		for (const [id, move] of [['palossand', 'shoreup'], ['sandygast', 'shoreup'], ['garganacl', 'saltcure'],
			['hippowdon', 'slackoff'], ['rhydon', 'earthquake'], ['bastiodon', 'protect']]) {
			assert.equal(validator.checkCanLearn(Dex.moves.get(move), Dex.species.get(id)), null, id + '/' + move);
		}
	});
});
