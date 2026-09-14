'use strict';

const assert = require('./../assert');
const common = require('./../common');

describe('Toxtricity-Aevian-Gmax', function () {
	it('uses Fire moves for G-Max Flare Shock and inflicts burn or poison', function () {
		const battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
			{species: 'Toxtricity-Aevian', ability: 'galvanize', gigantamax: true, moves: ['flamethrower', 'sludgebomb']},
		], [
			{species: 'Lugia', ability: 'noability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const toxtricity = battle.p1.active[0];
		assert.equal(toxtricity.canDynamax, 'toxtricityaeviangmax');
		assert.equal(battle.actions.getMaxMove(battle.dex.moves.get('flamethrower'), toxtricity).id, 'gmaxflareshock');
		assert.notEqual(battle.actions.getMaxMove(battle.dex.moves.get('sludgebomb'), toxtricity).id, 'gmaxflareshock');

		battle.makeChoices('move flamethrower dynamax', 'move splash');
		assert.equal(toxtricity.species.id, 'toxtricityaeviangmax');
		assert.equal(toxtricity.ability, 'riotamp');
		assert.false(toxtricity.hasAbility('proficient'));
		assert(['brn', 'psn'].includes(battle.p2.active[0].status));
	});

	it('defines the requested forms, stats, and Riot Amp composition', function () {
		const dex = common.gen(9).dex;
		assert.deepEqual(dex.species.get('Toxtricity-Aevian').baseStats,
			{hp: 75, atk: 75, def: 70, spa: 115, spd: 70, spe: 97});
		const gmax = dex.species.get('Toxtricity-Aevian-Gmax');
		assert.deepEqual(gmax.types, ['Fire', 'Poison']);
		assert.deepEqual(gmax.baseStats, {hp: 128, atk: 75, def: 70, spa: 115, spd: 70, spe: 97});
		assert.equal(gmax.abilities[0], 'Riot Amp');
		assert(!dex.abilities.get('riotamp').desc.includes('Proficient'));
	});
});
