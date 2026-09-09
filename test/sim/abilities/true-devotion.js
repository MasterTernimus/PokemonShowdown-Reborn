'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
describe('True Devotion', function () {
	afterEach(() => battle?.destroy());
	it('uses Protean on successive moves, Technician, and False Devotion effects', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Roserade-Mega', ability: 'True Devotion', moves: ['watergun', 'thundershock', 'growth']},
			{species: 'Mew', moves: ['splash']},
		], [{species: 'Blissey', ability: 'noability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const rose = battle.p1.active[0], foe = battle.p2.active[0];
		assert.equal(battle.dex.abilities.get('blinddevotion').exists, false);
		assert.deepEqual(rose.species.baseStats, {hp:75, atk:65, def:85, spa:150, spd:135, spe:130});
		assert.equal(battle.runEvent('BasePower', rose, foe, battle.dex.getActiveMove('watergun'), 40), 60);
		assert.equal(battle.runEvent('ModifyPriority', rose, foe, battle.dex.getActiveMove('growth'), 0), 1);
		const move = battle.dex.getActiveMove('thundershock');
		battle.singleEvent('ModifyMove', rose.getAbility(), rose.abilityState, move, rose);
		assert.equal(move.secondaries[0].chance, 20);
		battle.makeChoices('move watergun', 'move splash');
		assert.deepEqual(rose.getTypes(), ['Water']);
		battle.makeChoices('move thundershock', 'move splash');
		assert.deepEqual(rose.getTypes(), ['Electric']);
		battle.directDamage(100, rose);
		rose.setStatus('par');
		const hp = rose.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(rose.status, '');
		assert(rose.hp > hp);
		assert(battle.dex.species.get('Zangoose').exists);
		assert(battle.dex.species.getLearnsetData('zangoose').learnset.extremespeed);
	});
});
