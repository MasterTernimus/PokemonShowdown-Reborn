'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Venom Ignition and Corrosive Burn', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Corrosive Burn') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species: 'Salazzle', ability, moves: ['flamethrower', 'toxic', 'splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const ability of ['Venom Ignition', 'Corrosive Burn']) {
		it(ability + ' checks poison at each Fire hit without adding or consuming status', () => {
			const [p, foe] = setup(ability);
			const fire = battle.dex.getActiveMove('flamethrower');
			for (const [status, expected] of [['', 100], ['psn', 120], ['tox', 120], ['brn', 100], ['par', 100]]) {
				foe.status = status;
				assert.equal(battle.runEvent('ModifyDamage', p, foe, fire, 100), expected);
				assert.equal(foe.status, status);
			}
			foe.status = 'psn';
			assert.equal(battle.runEvent('ModifyDamage', p, foe, battle.dex.getActiveMove('sludgebomb'), 100), 100);
			assert.equal(battle.runEvent('ModifyDamage', p, foe, battle.dex.getActiveMove('willowisp'), 100), 100);
			const during = [];
			battle.onEvent('DamagingHit', battle.format, damage => { during.push(damage); foe.cureStatus(); });
			battle.randomizer = x => x;
			Object.assign(fire, { multihit: 2, willCrit: false, accuracy: true, secondaries: undefined, basePower: 20 });
			const hp = foe.hp;
			battle.actions.runMove(fire, p, p.getLocOf(foe));
			assert.equal(during.length, 2);
			assert(during[0] > during[1]);
			assert.equal(foe.status, '');
			assert.equal(hp - foe.hp, during[0] + during[1]);
			p.addVolatile('gastroacid');
			foe.status = 'psn';
			assert.equal(battle.runEvent('ModifyDamage', p, foe, fire, 100), 100);
		});
	}
	it('retains every Corrosion and Oblivious hook and drops old components', () => {
		const [p, foe] = setup();
		const a = p.getAbility();
		for (const id of ['corrosion', 'oblivious', 'venomignition']) {
			const part = battle.dex.abilities.get(id);
			assert(p.hasAbility(id));
			for (const key of Object.keys(part)) if (key.startsWith('on')) assert.equal(a[key], part[key], id + ':' + key);
		}
		for (const id of ['merciless', 'regenerator']) assert(!p.hasAbility(id));
		assert(!a.onSwitchOut);
		assert(!a.onModifyCritRatio);
		for (const id of ['attract', 'captivate', 'taunt']) {
			assert.equal(battle.singleEvent('TryHit', a, p.abilityState, p, foe, battle.dex.getActiveMove(id)), null);
		}
		battle.boost({ atk: -1 }, p, foe, battle.dex.abilities.get('intimidate'));
		assert.equal(p.boosts.atk, 0);
		p.volatiles.taunt = { id: 'taunt', target: p };
		battle.singleEvent('Update', a, p.abilityState, p);
		assert(!p.volatiles.taunt);
		foe.setType('Steel');
		assert(foe.trySetStatus('tox', p, battle.dex.getActiveMove('toxic')));
		assert.equal(foe.boosts.def, -1);
		assert.equal(foe.boosts.spd, -1);
		const poison = battle.dex.getActiveMove('sludgebomb');
		battle.runEvent('ModifyMove', p, foe, poison, poison);
		assert(poison.ignoreImmunity.Poison);
	});
	it('changes only base Salazzle Dragonize slot', () => {
		setup();
		assert.deepEqual(battle.dex.species.get('salazzle').abilities, { 0: 'Corrosion', 1: 'Venom Ignition', H: 'Aroma Veil' });
		assert.deepEqual(battle.dex.species.get('salazzletotem').abilities, { 0: 'Corrosion' });
		assert.deepEqual(battle.dex.species.get('salazzlemega').abilities, { 0: 'Corrosive Burn' });
	});
	it('applies the approved four Araquanid reductions once, leaving Totem unchanged', () => {
		setup();
		const a = battle.dex.species.get('araquanid');
		assert.deepEqual(a.baseStats, { hp: 88, atk: 80, def: 92, spa: 50, spd: 147, spe: 43 });
		assert.equal(a.bst, 500);
		assert.deepEqual(battle.dex.species.get('araquanidtotem').baseStats, { hp: 68, atk: 70, def: 92, spa: 50, spd: 132, spe: 42 });
	});
});
