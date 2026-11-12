'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {AbilityComponents} = require('../../../dist/data/ability-components');
const {getAbilityDisplayComponents} = require('../../../dist/data/ability-display');

describe('Atrocity with Tough Claws', () => {
	let battle;
	afterEach(() => battle?.destroy());
	it('retains its other components and boosts contact power once', () => {
		assert.deepEqual(AbilityComponents.atrocity, ['unboundblaze', 'fireward', 'toughclaws']);
		assert.deepEqual(getAbilityDisplayComponents('atrocity'), ['unboundblaze', 'fireward', 'toughclaws']);
		assert(/Tough Claws|Contact moves have/.test(Dex.abilities.get('atrocity').desc));
		battle = common.createBattle({}, [[{species: 'Mew', ability: 'Atrocity', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}]]);
		const p = battle.p1.active[0], q = battle.p2.active[0];
		assert(p.hasAbility('toughclaws'));
		for (const contact of [false, true]) {
			const move = Dex.getActiveMove('tackle');
			move.type = 'Water'; move.flags = contact ? {contact: 1} : {};
			assert.equal(battle.runEvent('BasePower', p, q, move, 100), contact ? 130 : 100);
		}
	});
});
