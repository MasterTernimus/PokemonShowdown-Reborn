'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function setup(move = 'splash', ability = 'No Ability', targetAbility = 'No Ability') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability, moves: [move, 'splash'], evs: {spe: 252}}],
		[{species: 'Mew', ability: targetAbility, moves: ['splash', 'protect']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	battle.field.startTerrain('rockyterrain');
	return [battle.p1.active[0], battle.p2.active[0]];
}
describe('Rocky Field mechanics', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('marks Splintered Stormshards terrain temporary and uses its configured four-turn duration', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
			[{species: 'Lycanroc', ability: 'No Ability', item: 'lycaniumz', moves: ['stoneedge', 'splash']}],
			[{species: 'Blissey', ability: 'Sturdy', moves: ['splash']}],
		]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move 1 zmove', 'move 1');
		assert.equal(battle.field.terrain, 'rockyterrain');
		assert.equal(battle.field.terrainState.duration, 3);
		assert.equal(battle.field.terrainState.zMoveTerrain, true);
		for (let i = 0; i < 3; i++) battle.makeChoices('move 2', 'move 1');
		assert.notEqual(battle.field.terrain, 'rockyterrain');
	});
	for (const [move, multiplier] of [['powergem', 1.5], ['rocksmash', 2], ['earthquake', 1.5], ['strength', 1.5], ['accelerock', 2.25], ['tackle', 1]]) {
		it(`${move} receives its ${multiplier}x field multiplier`, () => {
			const [source, target] = setup();
			const active = battle.dex.getActiveMove(move);
			const power = battle.runEvent('BasePower', source, target, active, 100);
			assert.equal(power, 100 * multiplier);
		});
	}
	for (const move of ['bulldoze', 'earthquake', 'magnitude', 'rockclimb', 'strength']) {
		it(`adds Rock typing to ${move}`, () => {
			setup(); const active = battle.dex.getActiveMove(move);
			battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, active);
			assert.deepEqual(active.types, [active.type, 'Rock']);
		});
	}
	it('boosts Rock Polish to three Speed stages', () => {
		const [source] = setup('rockpolish'); battle.makeChoices();
		assert.equal(source.boosts.spe, 3);
	});
	for (const defense of [false, true]) {
		it(`blocks bullet moves with ${defense ? 'positive Defense' : 'Substitute'} and does not reflect damage`, () => {
			const [source, target] = setup('aurasphere');
			if (defense) target.boosts.def = 1;
			else target.addVolatile('substitute', target);
			const hp = target.hp, sub = target.volatiles.substitute?.hp;
			battle.makeChoices();
			assert.equal(target.hp, hp); assert.equal(target.volatiles.substitute?.hp, sub);
			assert.equal(source.hp, source.maxhp);
		});
	}
	it('prevents flinching when Defense is positive', () => {
		const [source, target] = setup(); target.boosts.def = 1;
		assert(!target.addVolatile('flinch', source));
	});
	for (const ability of ['No Ability', 'Sturdy', 'Steadfast', 'Magic Guard']) {
		it(`handles flinch collision damage for ${ability}`, () => {
			const [source, target] = setup('splash', 'No Ability', ability);
			target.addVolatile('flinch', source);
			battle.makeChoices();
			assert.equal(target.maxhp - target.hp, ability === 'No Ability' ? Math.floor(target.baseMaxhp / 4) : 0);
		});
	}
	for (const [types, fraction] of [[['Psychic'], 1 / 8], [['Fire'], 1 / 2], [['Fire', 'Flying'], 2], [['Fighting'], 1 / 32], [['Fighting', 'Steel'], 1 / 128]]) {
		it(`applies Rocky Stealth Rock effectiveness for ${types.join('/')}`, () => {
			const [source, target] = setup(); target.setType(types);
			target.side.addSideCondition('stealthrock', source);
			battle.singleEvent('SwitchIn', battle.dex.conditions.get('stealthrock'), target.side.sideConditions.stealthrock, target);
			assert.equal(target.maxhp - target.hp, Math.min(target.maxhp, Math.floor(target.maxhp * fraction)));
		});
	}
	it('Telluric Seed grants Defense and deals a quarter-HP neutral Rock hit', () => {
		const [source] = setup(); source.setItem('telluricseed');
		assert.equal(source.item, ''); assert.equal(source.boosts.def, 1);
		assert.equal(source.maxhp - source.hp, Math.floor(source.maxhp / 4));
	});
	it('allows Arenite Wall without sandstorm and gives it eight turns', () => {
		setup('arenitewall'); battle.makeChoices();
		assert.equal(battle.p1.sideConditions.arenitewall.duration, 7);
	});
	it('Nature Power selects Rock Smash', () => {
		setup('naturepower'); battle.makeChoices();
		assert(battle.log.some(line => line.startsWith('|move|p1a: Mew|Rock Smash|')));
	});
});
