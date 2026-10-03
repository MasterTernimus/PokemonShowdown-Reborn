'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Territorial approved rework', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function make(foeAbility = 'No Ability', item = '') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Ursaluna', ability: 'Territorial', moves: ['splash', 'substitute', 'earthquake'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: foeAbility, item, moves: ['splash', 'tackle', 'bulletseed', 'roar'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2, 3', 'team 1, 2, 3');
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
	}
	function hit(id, source, target, finish = true) {
		const move = battle.dex.getActiveMove(id);
		move.accuracy = true;
		battle.actions.useMove(move, source, { target });
		const active = battle.activeMove;
		if (finish) battle.runEvent('AfterMove', source, target, active);
		return active;
	}
	it('uses actual Stamina and raises Defense immediately between hits while healing every hit', () => {
		const [holder, foe] = make();
		assert.equal(holder.getAbility().onDamagingHit, battle.dex.abilities.get('stamina').onDamagingHit);
		assert.equal(holder.getAbility().onAnyAfterMove, undefined);
		holder.hp = 200;
		const heals = [], heal = battle.heal;
		battle.heal = function (...args) {
			if (this.effect.id === 'territorial') heals.push(holder.boosts.def);
			return heal.apply(this, args);
		};
		const move = battle.dex.getActiveMove('bulletseed');
		Object.assign(move, { damage: 20, multihit: 5, accuracy: true });
		battle.actions.useMove(move, foe, { target: holder });
		assert.deepEqual(heals, [1, 1, 1, 1, 1]);
		assert.equal(holder.hp, 200 - 100 + 5 * Math.floor(holder.baseMaxhp / 16));
		assert.equal(holder.m.territorialDefenseTurn, undefined);
	});
	it('accepts special hits, heals successive attacks and resets its boost next turn', () => {
		const [holder, foe, , other] = make();
		holder.hp = 200;
		hit('watergun', foe, holder);
		assert.equal(holder.boosts.def, 1);
		const before = holder.hp, move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, other, move, 1);
		assert.equal(holder.boosts.def, 1);
		assert.equal(holder.hp, before + Math.floor(holder.baseMaxhp / 16));
		battle.turn++;
		hit('tackle', foe, holder);
		assert.equal(holder.boosts.def, 2);
	});
	it('ignores allied, self, residual and Substitute-only hits', () => {
		const [holder, foe, ally] = make();
		hit('tackle', ally, holder);
		battle.damage(10, holder, foe, battle.dex.conditions.get('brn'));
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, holder, battle.dex.getActiveMove('tackle'), 1);
		assert.equal(holder.boosts.def, 0);
		holder.addVolatile('substitute', holder);
		const hp = holder.hp;
		hit('tackle', foe, holder);
		assert.equal(holder.hp, hp);
		assert.equal(holder.boosts.def, 0);
	});
	it('uses Stamina ability-state counters across ability replacement and reentry', () => {
		const [holder, foe] = make();
		const hitOnce = () => battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, battle.dex.getActiveMove('tackle'), 1);
		holder.hp = 1; hitOnce(); hitOnce();
		assert.equal(holder.boosts.def, 1);
		holder.setAbility('No Ability'); holder.setAbility('Territorial'); hitOnce();
		assert.equal(holder.boosts.def, 2);
		battle.actions.switchIn(holder.side.pokemon[2], 0);
		battle.actions.switchIn(holder, 0); hitOnce();
		assert.equal(holder.boosts.def, 1);
	});
	it('triggers if later hits break through Substitute and reach HP', () => {
		const [holder, foe] = make('Skill Link');
		holder.addVolatile('substitute', holder);
		holder.volatiles.substitute.hp = 1;
		const before = holder.hp;
		hit('bulletseed', foe, holder);
		assert(holder.hp > 0);
		assert.notEqual(holder.hp, before);
		assert.equal(holder.boosts.def, 1);
	});
	it('still triggers against Sheer Force moves', () => {
		const [holder, foe] = make('Sheer Force');
		hit('bite', foe, holder);
		assert.equal(holder.boosts.def, 1);
	});
	it('blocks berries until the holder leaves', () => {
		const [holder, foe] = make('No Ability', 'Sitrus Berry');
		foe.hp = Math.floor(foe.maxhp / 3);
		battle.runEvent('Update');
		assert.equal(foe.item, 'sitrusberry');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(holder.isActive, false);
		assert.equal(foe.item, '');
	});
	it('reverses Intimidate without giving the holder Intimidate itself', () => {
		const [holder, foe] = make('Intimidate');
		assert.equal(holder.boosts.atk, 1);
		assert.equal(foe.boosts.atk, 0);
	});
	for (const move of ['roar', 'whirlwind', 'dragontail', 'circlethrow']) {
		it(`blocks opposing ${move}`, () => {
			const [holder, foe] = make();
			hit(move, foe, holder);
			assert(!holder.forceSwitchFlag);
			assert.equal(battle.p1.active[0], holder);
			assert(battle.log.some(line => line.includes('ability: Territorial')));
		});
	}
	it('blocks Red Card and allows ordinary switching', () => {
		const [holder, foe] = make('No Ability', 'Red Card');
		hit('tackle', holder, foe);
		assert.equal(battle.p1.active[0], holder);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(holder.isActive, false);
	});
	it('is bypassed by Mold Breaker for forced switching', () => {
		const [holder, foe] = make('Mold Breaker');
		hit('roar', foe, holder);
		assert(holder.forceSwitchFlag || battle.p1.active[0] !== holder);
	});
	it('works during actual turn resolution', () => {
		const [holder] = make();
		battle.makeChoices('move splash, move splash', 'move tackle 1, move splash');
		assert.equal(holder.boosts.def, 1);
		battle.makeChoices('move splash, move splash', 'move tackle 1, move splash');
		assert.equal(holder.boosts.def, 2);
	});
	it('keeps full components and assigns existing Raging Beast only to ordinary Ursaluna', () => {
		const [p] = make();
		for (const id of ['unnerve', 'stamina', 'guarddog']) assert(p.hasAbility(id));
		assert.deepEqual(battle.dex.species.get('ursaluna').abilities, { 0: 'Raging Beast', 1: 'Bulletproof', H: 'Territorial' });
		assert.deepEqual(battle.dex.species.get('ursalunabloodmoon').abilities, { 0: "Mind's Eye", 1: 'Lunar Dread', H: 'Shadow Shield' });
		p.setAbility('Raging Beast');
		assert(p.hasAbility('guts')); assert(p.hasAbility('moldbreaker'));
		p.setStatus('brn');
		assert.equal(battle.runEvent('ModifyAtk', p, battle.p2.active[0], battle.dex.getActiveMove('tackle'), 100), 150);
	});
});
