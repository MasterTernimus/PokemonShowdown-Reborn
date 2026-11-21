'use strict';
const assert = require('assert').strict;
const { Dex, TeamValidator } = require('../../../dist/sim');

describe('Seed Flare exclusivity and Dragon Energy removals', () => {
	it('keeps direct Seed Flare sources only on Shaymin', () => {
		const recipients = Object.entries(Dex.data.Learnsets).filter(([, entry]) => entry.learnset?.seedflare).map(([id]) => id);
		assert.deepEqual(recipients, ['shaymin']);
		assert(Dex.moves.get('seedflare').flags.nosketch);
	});
	for (const format of ['gen9doublesrockyfield', 'gen9dragonsden', 'gen9nofieldsinglesgame']) {
		it(format + ' permits both Shaymin forms and rejects removed recipients, including Sketch', () => {
			const validator = TeamValidator.get(format);
			for (const id of ['shaymin', 'shayminsky']) assert.equal(validator.checkCanLearn(Dex.moves.get('seedflare'), Dex.species.get(id)), null, id);
			for (const id of ['venusaur', 'venusaurmega', 'venusaurgmax', 'bellossom', 'roserade', 'cherrim', 'lilligant', 'lilliganthisui', 'smeargle']) {
				assert(validator.checkCanLearn(Dex.moves.get('seedflare'), Dex.species.get(id)), id);
				assert(validator.validateTeam([{ species: id, moves: ['Seed Flare'] }, { species: 'Mew', moves: ['Protect'] }])?.some(e => e.includes('Seed Flare')), id);
			}
		});
		it(format + ' blocks Dragon Energy on the removed species and Gmax forms', () => {
			const validator = TeamValidator.get(format);
			for (const id of ['kingdra', 'flapple', 'flapplegmax', 'appletun', 'appletungmax']) {
				assert(validator.checkCanLearn(Dex.moves.get('dragonenergy'), Dex.species.get(id)), id);
				assert(validator.validateTeam([{ species: id, moves: ['Dragon Energy'] }, { species: 'Mew', moves: ['Protect'] }])?.some(e => e.includes('Dragon Energy')), id);
			}
			assert.equal(validator.checkCanLearn(Dex.moves.get('dragonenergy'), Dex.species.get('regidrago')), null);
		});
	}
});
