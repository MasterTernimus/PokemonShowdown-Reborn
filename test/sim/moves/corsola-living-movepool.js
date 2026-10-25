'use strict';
const assert = require('assert').strict;
const { Dex, Teams, TeamValidator } = require('../../../dist/sim');
const removed = ['Hex', 'Night Shade', 'Will-O-Wisp', 'Trick Room', 'Shadow Ball'];
const strictFormat = 'gen9doublesrockyfield@@@Obtainable Moves';
const partner = '\n\nPikachu\nAbility: Static\n- Thunderbolt';

describe('Living Corsola movepool boundaries', () => {
	for (const id of ['corsola', 'corsolaalt', 'corsolareborn']) {
		it(id + ' omits removed moves from every inherited search pool', () => {
			for (const entry of Dex.species.getFullLearnset(id)) {
				for (const move of removed) assert(!entry.learnset[Dex.toID(move)], id + ': ' + move);
			}
		});
	}
	for (const move of removed) {
		it('strict Rocky validation rejects imported regular Corsola ' + move, () => {
			const team = Teams.import('Corsola\nAbility: Natural Cure\n- ' + move + partner);
			const errors = TeamValidator.get(strictFormat).validateTeam(team);
			assert(errors?.some(error => error.includes(move)), JSON.stringify(errors));
		});
	}
	it('retains living coral Water/Rock and longstanding support choices', () => {
		const team = Teams.import('Corsola\nAbility: Natural Cure\n- Surf\n- Ancient Power\n- Confuse Ray\n- Curse' + partner);
		assert.equal(TeamValidator.get(strictFormat).validateTeam(team), null);
	});
	for (const id of ['corsolagalar', 'cursola']) {
		it(id + ' retains its legitimate Ghost coverage and status moves', () => {
			const learnsets = Dex.species.getFullLearnset(id);
			for (const move of removed.filter(move => move !== 'Trick Room')) {
				assert(learnsets.some(entry => entry.learnset[Dex.toID(move)]), id + ': ' + move);
			}
		});
	}
	it('does not silently change permissive Rocky format rules', () => {
		assert(!Dex.formats.getRuleTable(Dex.formats.get('gen9doublesrockyfield')).has('obtainablemoves'));
		assert.equal(TeamValidator.get('gen9doublesrockyfield').validateTeam(Teams.import('Corsola\nAbility: Natural Cure\n- Hex' + partner)), null);
	});
});
