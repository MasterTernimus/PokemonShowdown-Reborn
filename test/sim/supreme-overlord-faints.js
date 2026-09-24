'use strict';

const assert = require('../assert');
const common = require('../common');

describe('Supreme Overlord faint tracking', function () {
	let battle;
	afterEach(() => battle?.destroy());

	it('does not refresh when an opponent faints, but updates for a fallen ally', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Kingambit', ability: 'supremeoverlord', moves: ['splash']},
			{species: 'Eevee', ability: 'runaway', moves: ['splash']},
			{species: 'Eevee', ability: 'runaway', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const kingambit = battle.p1.active[0];
		assert.equal(kingambit.abilityState.fallen, 0);
		const activations = () => battle.log.filter(line => line.includes('ability: Supreme Overlord')).length;
		const initialActivations = activations();

		battle.p2.active[0].faint(kingambit);
		battle.faintMessages();
		assert.equal(kingambit.abilityState.fallen, 0);
		assert.equal(activations(), initialActivations);
		assert.equal(kingambit.side.totalFainted, 0);

		battle.p1.active[1].faint();
		battle.faintMessages();
		assert.equal(kingambit.abilityState.fallen, 1);
		assert.equal(activations(), initialActivations + 1);
		assert.equal(kingambit.side.totalFainted, 1);

		battle.p2.active[1].faint(kingambit);
		battle.faintMessages();
		assert.equal(kingambit.abilityState.fallen, 1);
		assert.equal(activations(), initialActivations + 1);
	});

	it('grants Infiltrator at two, flinch immunity at four, and no lethal-hit survival', function () {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Kingambit', ability: 'supremeoverlord', moves: ['splash']},
			{species: 'Eevee', ability: 'runaway', moves: ['splash']},
		], [
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
			{species: 'Magikarp', ability: 'swiftswim', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		const kingambit = battle.p1.active[0];
		const foe = battle.p2.active[0];
		const ability = kingambit.getAbility();
		const flinch = battle.dex.conditions.get('flinch');
		kingambit.side.totalFainted = 1;
		const before = battle.dex.getActiveMove('slash');
		battle.singleEvent('ModifyMove', ability, kingambit.abilityState, before, kingambit, foe);
		assert.false(!!before.infiltrates);
		kingambit.side.totalFainted = 2;
		const after = battle.dex.getActiveMove('slash');
		battle.singleEvent('ModifyMove', ability, kingambit.abilityState, after, kingambit, foe);
		assert.equal(after.infiltrates, true);
		assert(battle.singleEvent('TryAddVolatile', ability, kingambit.abilityState,
			kingambit, foe, null, flinch) !== null);
		kingambit.side.totalFainted = 3;
		const lethalDamage = kingambit.hp + 100;
		assert.equal(battle.singleEvent('Damage', ability, kingambit.abilityState,
			kingambit, foe, battle.dex.moves.get('tackle'), lethalDamage), lethalDamage);
		kingambit.side.totalFainted = 4;
		assert.equal(battle.singleEvent('TryAddVolatile', ability, kingambit.abilityState,
			kingambit, foe, null, flinch), null);
	});
});
