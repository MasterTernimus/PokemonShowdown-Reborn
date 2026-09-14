'use strict';

const assert = require('./../assert');
const common = require('./../common');

describe('Lapras-Aevian-Gmax', function () {
	it('uses Psychic moves for G-Max Echo Resonance and sets Aurora Veil', function () {
		const battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Lapras-Aevian', ability: 'protectiveward', gigantamax: true, moves: ['psychic', 'tackle']},
		], [
			{species: 'Blissey', ability: 'noability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const lapras = battle.p1.active[0];
		const maxMove = battle.actions.getMaxMove(battle.dex.moves.get('psychic'), lapras);
		assert.equal(lapras.canDynamax, 'laprasaeviangmax');
		assert.equal(maxMove.id, 'gmaxechoresonance');

		battle.makeChoices('move psychic dynamax', 'move splash');
		assert.equal(lapras.species.id, 'laprasaeviangmax');
		assert.equal(lapras.ability, 'crystalresonance');
		assert(lapras.side.getSideCondition('auroraveil'));
	});

	it('defines the requested form, stats, typing, and composite Ability', function () {
		const dex = common.gen(9).dex;
		const species = dex.species.get('Lapras-Aevian-Gmax');
		assert.deepEqual(species.types, ['Rock', 'Psychic']);
		assert.deepEqual(species.baseStats, {hp: 200, atk: 110, def: 90, spa: 95, spd: 105, spe: 60});
		assert.equal(species.abilities[0], 'Crystal Resonance');
		assert.equal(dex.abilities.get('crystalresonance').name, 'Crystal Resonance');
	});
});
