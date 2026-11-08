'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
describe('Royal Sun full components', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Pyroar-Mega', ability: 'Royal Sun', item, moves: ['tackle'] }],
			[{ species: 'Mew', ability: 'No Ability', item: 'Sitrus Berry', moves: ['tackle'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	it('preserves sun duration and exposes each component once', () => {
		const [p] = start('Heat Rock');
		assert.equal(battle.field.weather, 'sunnyday');
		assert.equal(battle.field.weatherState.duration, 8);
		for (const id of ['supremeoverlord', 'drought']) assert(p.hasAbility(id));
		const components = require('../../../dist/data/ability-components').AbilityComponents.royalsun;
		assert.deepEqual(components, ['supremeoverlord', 'drought']);
		assert.deepEqual(p.getPassives(), ['flamebody']);
		assert(!p.hasAbility('unnerve')); assert(!p.hasAbility('flamebody'));
	});
	it('keeps the capped local power scaling and all fallen thresholds, without repeated stat boosts', () => {
		const [p, foe] = start();
		const move = battle.dex.getActiveMove('tackle');
		for (const n of [0, 1, 2, 4, 5, 6]) {
			p.side.totalFainted = n;
			assert.equal(battle.runEvent('BasePower', p, foe, move, 100), 100 + 10 * Math.min(5, n));
		}
		p.side.totalFainted = 2;
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, foe);
		assert(move.infiltrates);
		p.side.totalFainted = 4;
		assert(!p.addVolatile('flinch', foe));
		p.side.totalFainted = 5;
		const hp = p.hp;
		battle.damage(10, p, p, battle.dex.conditions.get('brn'));
		assert.equal(p.hp, hp);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.atk, 1);
		assert.equal(p.boosts.spa, 1);
	});
	it('allows berries and field seeds after removing Unnerve', () => {
		const [p, foe] = start();
		foe.hp = 1;
		assert.equal(foe.eatItem(), true);
		for (const id of ['elementalseed', 'telluricseed', 'magicalseed', 'syntheticseed']) {
			assert.notEqual(battle.runEvent('UseItem', foe, null, null, battle.dex.items.get(id)), false);
		}
		battle.singleEvent('End', p.getAbility(), p.abilityState, p);
		foe.setItem('Sitrus Berry'); assert(foe.eatItem());
	});
	it('keeps Flame Body entry boosts on Infernal Eclipse and suppresses burns on Cold Eclipse', () => {
		const [p, foe] = start();
		battle.singleEvent('End', p.getAbility(), p.abilityState, p);
		battle.field.changeTerrain('coldeclipseterrain', p);
		battle.singleEvent('SwitchIn', passiveEffect(battle, 'flamebody'), passiveState(p, 'flamebody'), p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, 0);
		assert.equal(p.boosts.spd, 0);
		assert.equal(foe.boosts.spe, 0);
		let rolls = 0;
		battle.randomChance = () => { rolls++; return true; };
		battle.runEvent('DamagingHit', p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(rolls, 0);
		assert.equal(foe.status, '');
		battle.field.changeTerrain('infernaleclipseterrain', p);
		battle.singleEvent('SwitchIn', passiveEffect(battle, 'flamebody'), passiveState(p, 'flamebody'), p);
		assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1);
	});
	it('uses one 30% contact roll normally, one 60% roll on Volcanic, and none on noncontact', () => {
		const [p, foe] = start();
		const rolls = [];
		battle.randomChance = (a, b) => { rolls.push([a, b]); return true; };
		battle.runEvent('DamagingHit', p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(foe.status, 'brn');
		assert.deepEqual(rolls, [[3, 10]]);
		foe.cureStatus();
		battle.field.changeTerrain('volcanicterrain', p);
		battle.runEvent('DamagingHit', p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(foe.status, 'brn');
		assert.deepEqual(rolls, [[3, 10], [6, 10]]);
		battle.runEvent('DamagingHit', p, foe, battle.dex.getActiveMove('psychic'), 10);
		assert.equal(rolls.length, 2);
	});
});
