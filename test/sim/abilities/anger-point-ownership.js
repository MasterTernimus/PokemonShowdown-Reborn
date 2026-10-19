'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Anger Point holder ownership', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Intimidate') {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Krookodile', ability, moves: ['protect']},
			{species: 'Camerupt', ability: 'Anger Point', moves: ['protect']},
			{species: 'Chansey', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'Synchronize', moves: ['pound']},
			{species: 'Snorlax', ability: 'Thick Fat', moves: ['tackle']},
		]]);
		battle.makeChoices('team 123', 'team 12');
		return [...battle.p1.active, ...battle.p2.active];
	}
	function hit(source, target, crit = false) {
		const move = Object.assign(battle.dex.getActiveMove(source.moveSlots[0].id), {basePower: 10, accuracy: true, willCrit: crit});
		battle.actions.runMove(move, source, source.getLocOf(target));
	}
	it('gives each holder its own first-hit boost regardless of attacker', () => {
		const [krook, camel, first, second] = setup();
		hit(first, krook); hit(first, camel); hit(second, krook);
		assert.equal(krook.boosts.atk, 1);
		assert.equal(camel.boosts.atk, 1);
		assert.equal(first.abilityState.angerpoint, undefined);
	});
	it('does not duplicate selected and passive Anger Point', () => {
		const [krook, , first, second] = setup('Anger Point');
		hit(first, krook); hit(second, krook);
		assert.equal(krook.boosts.atk, 1);
	});
	it('renews the holder use on switching without depending on the attacker switching', () => {
		const [krook, , first] = setup();
		hit(first, krook);
		battle.makeChoices('switch 3, move protect', 'move pound 2, move tackle 2');
		battle.makeChoices('switch 3, move protect', 'move pound 2, move tackle 2');
		assert.equal(krook.boosts.atk, 0);
		hit(first, krook);
		assert.equal(krook.boosts.atk, 1);
	});
	it('still maximizes Attack on a later critical hit', () => {
		const [krook, , first] = setup();
		hit(first, krook); hit(first, krook, true);
		assert.equal(krook.boosts.atk, 6);
	});
});
