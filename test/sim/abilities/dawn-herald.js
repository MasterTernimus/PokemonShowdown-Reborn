'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { calculatorMetadata } = require('../../../dist/sim/custom-calculator');
describe('Dawn Herald', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(item = '', foeAbility = 'No Ability') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Volcarona', ability: 'Dawn Herald', item, moves: ['splash'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: foeAbility, moves: ['tackle', 'splash'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	for (const [item, duration] of [['', 5], ['Heat Rock', 8]]) it('summons sun once for ' + duration + ' turns', () => {
		setup(item);
		assert.equal(battle.field.weather, 'sunnyday');
		assert.equal(battle.field.weatherState.duration, duration);
		assert.equal(battle.log.filter(x => x.startsWith('|-weather|SunnyDay')).length, 1);
		for (let i = 0; i < duration; i++) battle.makeChoices('move splash, move splash', 'move splash, move splash');
		assert.equal(battle.field.weather, '');
	});
	it('reduces ally damage once without protecting itself', () => {
		const [holder, ally, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 75);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 100), 100);
		assert.equal(battle.runEvent('ModifyDamage', holder, ally, move, 100), 75);
	});
	it('obeys suppression, Mold Breaker and move-based bypass', () => {
		const [holder, ally, foe] = setup();
		const move = battle.dex.getActiveMove('tackle');
		holder.addVolatile('gastroacid');
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 100);
		battle.field.clearWeather();
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(battle.field.weather, '');
		holder.removeVolatile('gastroacid');
		foe.setAbility('Mold Breaker');
		battle.runEvent('ModifyMove', foe, ally, move, move);
		battle.setActiveMove(move, foe, ally);
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 100);
		foe.setAbility('No Ability');
		move.ignoreAbility = true;
		battle.setActiveMove(move, foe, ally);
		assert.equal(battle.runEvent('ModifyDamage', foe, ally, move, 100), 100);
		battle.clearActiveMove();
	});
	it('does not override primal weather and respects weather suppression', () => {
		const [holder, ally, foe] = setup();
		foe.setAbility('Primordial Sea');
		battle.field.setWeather('primordialsea', foe);
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(battle.field.weather, 'primordialsea');
		battle.field.clearWeather();
		foe.setAbility('Cloud Nine');
		battle.singleEvent('Start', holder.getAbility(), holder.abilityState, holder);
		assert.equal(battle.field.weather, 'sunnyday');
		assert.equal(battle.field.effectiveWeather(), '');
	});
	it('uses exactly the two full components and Volcarona final slots', () => {
		setup();
		const a = battle.dex.abilities.get('dawnherald');
		assert.equal(a.onStart, battle.dex.abilities.get('drought').onStart);
		assert.equal(a.onAnyModifyDamage, battle.dex.abilities.get('friendguard').onAnyModifyDamage);
		assert.deepEqual(calculatorMetadata().abilityComponents.dawnherald, ['Drought', 'Friend Guard']);
		assert.deepEqual(battle.dex.species.get('volcarona').abilities, { 0: 'Cinder Scales', 1: 'Overcoat', H: 'Dawn Herald' });
		assert(!a.onModifySpA);
	});
});
