'use strict';
const assert = require('assert').strict;
const common = require('../../common');
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
		for (const id of ['drought', 'supremeoverlord', 'unnerve', 'flamebody']) assert(p.hasAbility(id));
		const components = require('../../../dist/data/ability-components').AbilityComponents.royalsun;
		assert.deepEqual(components, ['drought', 'supremeoverlord', 'unnerve', 'flamebody']);
	});
	it('keeps the uncapped local power scaling and all fallen thresholds, without repeated stat boosts', () => {
		const [p, foe] = start();
		const move = battle.dex.getActiveMove('tackle');
		for (const n of [0, 1, 2, 4, 5, 6]) {
			p.side.totalFainted = n;
			assert.equal(battle.runEvent('BasePower', p, foe, move, 100), 100 + 10 * n);
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
	it('blocks berries and all four field seeds and releases the block on end', () => {
		const [p, foe] = start();
		foe.hp = 1;
		assert.equal(foe.eatItem(), false);
		for (const id of ['elementalseed', 'telluricseed', 'magicalseed', 'syntheticseed']) {
			assert.equal(battle.runEvent('UseItem', foe, null, null, battle.dex.items.get(id)), false);
		}
		battle.singleEvent('End', p.getAbility(), p.abilityState, p);
		assert(foe.eatItem());
	});
	it('runs combined Cold Eclipse entry callbacks once per entry, suppressing contact burns', () => {
		const [p, foe] = start();
		battle.singleEvent('End', p.getAbility(), p.abilityState, p);
		battle.field.changeTerrain('coldeclipseterrain', p);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, 1);
		assert.equal(p.boosts.spd, 1);
		assert.equal(foe.boosts.spe, -1);
		let rolls = 0;
		battle.randomChance = () => { rolls++; return true; };
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(rolls, 0);
		assert.equal(foe.status, '');
	});
	it('uses one 30% contact roll normally, one 60% roll on Volcanic, and none on noncontact', () => {
		const [p, foe] = start();
		const rolls = [];
		battle.randomChance = (a, b) => { rolls.push([a, b]); return true; };
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(foe.status, 'brn');
		assert.deepEqual(rolls, [[3, 10]]);
		foe.cureStatus();
		battle.field.changeTerrain('volcanicterrain', p);
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'), 10);
		assert.equal(foe.status, 'brn');
		assert.deepEqual(rolls, [[3, 10], [6, 10]]);
		battle.singleEvent('DamagingHit', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('psychic'), 10);
		assert.equal(rolls.length, 2);
	});
});
