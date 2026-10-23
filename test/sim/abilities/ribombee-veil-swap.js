'use strict';
const assert = require('assert').strict, { Dex, Teams, TeamValidator, Battle } = require('../../../dist/sim');
describe('Ribombee veil swap and move removal', () => {
	it('preserves other slots and Cutiefly', () => {
		const s = Dex.species.get('ribombee');
		assert.deepEqual(s.abilities, { 0: 'Shield Dust', 1: 'Aroma Veil', H: 'Friend Guard' });
		assert.deepEqual(s.passives, ['sweetveil']);
		assert.equal(Dex.species.get('cutiefly').abilities.H, 'Sweet Veil');
	});
	for (const move of ['Hydro Pump', 'Fake Out'])it('rejects imported ' + move, () => {
		const team = Teams.import('Ribombee\nAbility: Aroma Veil\n- ' + move);
		const errors = TeamValidator.get('gen9nofieldsinglesgame@@@Obtainable Moves').validateTeam(team);
		assert(errors?.some(x => x.includes(move)), JSON.stringify(errors));
		assert(!Dex.species.getLearnsetData('ribombee').learnset[Dex.toID(move)]);
	});
	it('accepts ordinary legal moves', () => { const team = Teams.import('Ribombee\nAbility: Aroma Veil\n- Encore\n- Bug Buzz\n- Moonblast'); assert.equal(TeamValidator.get('gen9nofieldsinglesgame@@@Obtainable Moves').validateTeam(team), null); });
	it('Sweet Veil passive prevents sleep while Aroma Veil is selected', () => {
		const b = new Battle({ formatid: 'gen9nofieldsinglesgame', p1: { team: [{ species: 'Ribombee', ability: 'Aroma Veil', moves: ['moonblast'] }] }, p2: { team: [{ species: 'Mew', ability: 'No Ability', moves: ['spore'] }] } });
		try {
			if (b.requestState === 'teampreview')b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0], q = b.p2.active[0];
			assert(!p.trySetStatus('slp', q));
			p.addVolatile('gastroacid');
			assert(!p.trySetStatus('slp', q));
		} finally {
			b.destroy();
		}
	});
});
