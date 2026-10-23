'use strict';
const assert = require('assert').strict, { Dex, TeamValidator } = require('../../../dist/sim');
describe('Scyther requested chain moves', () => {
	for (const move of ['furycutter', 'stackingshot'])it(move + ' is legal for Scyther', () => { assert.equal(new TeamValidator('gen9nofieldsinglesgame').checkCanLearn(Dex.moves.get(move), Dex.species.get('scyther')), null); assert(Dex.species.getLearnsetData('scyther').learnset[move].some(s => s.startsWith('9'))); });
	it('uses the approved abilities and passive', () => { assert.deepEqual(Dex.species.get('scyther').abilities, { 0: 'Technician', 1: 'Sharpness', H: 'Swarm' }); assert.deepEqual(Dex.species.get('scyther').passives, ['steadfast']); });
});
