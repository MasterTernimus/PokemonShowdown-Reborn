'use strict';
const assert = require('assert').strict;
const common = require('../../common');

describe('Armor damage reductions', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability, allyAbility = 'Friend Guard') {
		const set = ability => ({species: 'Mew', ability, moves: ['splash', 'tackle', 'doubleedge']});
		battle = common.createBattle({gameType: 'doubles'}, [[set(ability), set(allyAbility)], [set('No Ability'), set('No Ability')]]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const armor of ['Solid Rock', 'Filter', 'Prism Armor', 'Terra Resolve']) {
		for (const ally of ['Friend Guard', 'Rivalry']) it(armor + ' takes only the strongest reduction with ' + ally, () => {
			const [holder, foe] = setup(armor, ally);
			const move = battle.dex.getActiveMove('tackle');
			for (const condition of ['mist', 'safeguard', 'luckychant']) holder.side.addSideCondition(condition, holder);
			const damage = () => battle.runEvent('ModifyDamage', foe, holder, move, 1000);
			assert.equal(damage(), 750);
			holder.getMoveHitData(move).typeMod = 1;
			assert.equal(damage(), 600);
			holder.side.addSideCondition('reflect', holder);
			assert(damage() < 600, 'Reflect still works');
			assert.equal(battle.runEvent('CriticalHit', holder, foe, move), false, 'Lucky Chant still prevents critical hits');
		});
	}
	for (const terrain of ['newworldterrain', 'dragonsdenterrain', 'mountainterrain', 'holyterrain',
		'hauntedterrain', 'starlightarenaterrain', 'snowymountainterrain', ...[1,2,3,4,5].map(n => 'flowergarden' + n)]) {
		it('disables just the armor damage reductions on ' + terrain, () => {
			const [holder, foe] = setup('Shell Armor', 'No Ability');
			battle.field.terrain = terrain;
			const move = battle.dex.getActiveMove('tackle');
			for (const ability of ['Shell Armor', 'Battle Armor', 'Filter', 'Solid Rock']) {
				holder.setAbility(ability);
				assert(holder.hasAbilityOrPassive(ability), ability);
				assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 1000), 1000);
				assert.equal(battle.runEvent('CriticalHit', holder, foe, move), !['Shell Armor', 'Battle Armor'].includes(ability));
			}
			holder.setAbility('Rock Head');
			battle.setActiveMove(battle.dex.getActiveMove('doubleedge'), holder, foe);
			assert(!battle.damage(8, holder, holder, 'recoil'));
			battle.field.terrain = 'rockyterrain';
			assert(holder.hasAbility('rockhead'));
			assert(!battle.damage(8, holder, holder, 'recoil'));
		});
	}
	it('uses the same reduction on every real hit, while keeping items and screens independent', () => {
		const [holder, foe] = setup('Solid Rock', 'Friend Guard');
		battle.randomizer = damage => damage;
		holder.maxhp = holder.baseMaxhp = holder.hp = 5000;
		const hit = () => {
			holder.hp = holder.maxhp;
			const move = Object.assign(battle.dex.getActiveMove('tackle'), {willCrit:false, accuracy:true, multihit:2});
			battle.actions.useMove(move, foe, {target:holder});
			return holder.maxhp - holder.hp;
		};
		const guarded = hit();
		holder.side.addSideCondition('safeguard', holder);
		holder.side.addSideCondition('mist', holder);
		holder.side.addSideCondition('luckychant', holder);
		assert.equal(hit(), guarded);
		holder.side.addSideCondition('reflect', holder);
		assert(hit() < guarded);
		holder.side.removeSideCondition('reflect');
		foe.setItem('lifeorb');
		assert(hit() > guarded);
	});
	it('keeps unrelated composite effects and restores the armor component when the field changes', () => {
		const [holder, foe] = setup('Ocean Lullaby', 'No Ability');
		const move = battle.dex.getActiveMove('tackle');
		battle.field.terrain = 'holyterrain';
		assert(holder.hasAbility('oceanlullaby'));
		assert.equal(battle.runEvent('CriticalHit', holder, foe, move), false);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, move, 100), 100);
		battle.field.terrain = 'rockyterrain';
		assert.equal(battle.runEvent('CriticalHit', holder, foe, move), false);
	});
	it('lets other reductions stack normally when Filter is inactive', () => {
		const [holder, foe] = setup('Filter', 'Rivalry');
		holder.side.addSideCondition('safeguard', holder);
		const move = battle.dex.getActiveMove('tackle');
		const damage = () => battle.runEvent('ModifyDamage', foe, holder, move, 1000);
		assert.equal(damage(), 750);
		battle.field.terrain = 'mountainterrain';
		assert.equal(damage(), 675);
		battle.field.terrain = '';
		foe.setAbility('Mold Breaker');
		move.ignoreAbility = true;
		battle.setActiveMove(move, foe, holder);
		assert.equal(damage(), 675);
	});
});
