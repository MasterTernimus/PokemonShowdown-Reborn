'use strict';
const assert = require('assert').strict, common = require('../../common'), { Dex } = require('../../../dist/sim');
const { AevianMinorPassives } = require('../../../dist/data/aevian-minor-passives');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('Aevian passive additions and approved stats', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});
	it('fills all empty slots with one approved passive and preserves existing passives', () => {
		const preserved = { froslassaevian: 'levitate', froslassaevianmega: 'hydration', volcaronaaevian: 'shielddust', laprasaevian: 'relicarmor', miloticaevian: 'marvelscale', toxtricityaevian: 'feedback', toxtricityaeviangmax: 'feedback', skeledirgeaevian: 'blaze' };
		for (const species of Dex.species.all().filter(s => s.name.includes('Aevian'))) {
			const expected = preserved[species.id] || AevianMinorPassives[species.id];
			assert(expected, species.id); assert.deepEqual(species.passives, [expected], species.id);
			assert(Dex.abilities.get(expected).exists);
			for (const ability of Object.values(species.abilities))assert(!(AbilityComponents[Dex.abilities.get(ability).id] || []).includes(expected), `${species.id}: duplicated ${expected}`);
		}
	});
	it('applies only the approved Aevian Glalie/Froslass stat spreads', () => {
		const expected = { glalieaevian: [110, 110, 105, 50, 85, 40], glalieaevianmega: [110, 135, 105, 90, 85, 80], froslassaevian: [70, 70, 70, 110, 70, 110], froslassaevianmega: [70, 80, 80, 140, 100, 130] };
		for (const [id, stats] of Object.entries(expected)) {
			const species = Dex.species.get(id); assert.deepEqual(Object.values(species.baseStats), stats, id);
			assert.equal(stats.reduce((a, b) => a + b), id === 'glalieaevianmega' ? 605 : id.endsWith('mega') ? 600 : 500, id);
			assert.deepEqual(species.types, id.startsWith('glalie') ? ['Grass', 'Rock'] : ['Grass', 'Water']);
		}
		assert.deepEqual(Object.values(Dex.species.get('glalie').baseStats), [80, 80, 85, 80, 85, 90]);
		assert.deepEqual(Object.values(Dex.species.get('froslassmega').baseStats), [70, 80, 80, 140, 100, 130]);
	});
	for (const [species, ability] of [['Glimmora-Aevian', 'Filter'], ['Glimmora-Aevian-Mega', 'Adaptive Core']])it(species + ' heals exactly once through Self Repair even when its ability is suppressed', () => {
		const mon = (species, ability) => ({ species, ability, moves: ['splash'] });
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon('Mew', 'No Ability')], [mon('Mew', 'No Ability')]]);
		battle.makeChoices('team 12', 'team 1'); const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.deepEqual(p.getPassives(), ['selfrepair']); p.baseMaxhp = p.maxhp = 4000; p.hp = 2000;
		battle.makeChoices('move splash', 'move splash'); assert.equal(p.hp, 2250);
		p.addVolatile('gastroacid', q); battle.makeChoices('move splash', 'move splash'); assert.equal(p.hp, 2500);
		p.setStatus('par', q);
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(p.status, '');
		assert.equal(p.hp, 3000);
	});
	it('removes Self Repair from Adaptive Core but keeps Download and Defragment', () => {
		assert.deepEqual(AbilityComponents.adaptivecore, ['download', 'defragment']);
		const a = Dex.abilities.get('adaptivecore'); for (const hook of ['onResidual', 'onSwitchOut', 'onCheckShow', 'onImmunity'])assert(!a[hook], hook);
		assert(a.onStart); assert(a.onModifyMove); assert(a.onModifyMove);
	});
	for (const [species, ability] of [['Glalie-Aevian', 'No Ability'], ['Glalie-Aevian-Mega', 'Moss Armor']]) it(species + ' uses passive Levitate independently of Moss Armor suppression', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['earthquake'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.deepEqual(p.getPassives(), ['levitate']); assert(!p.hasAbility('levitate')); assert(p.hasAbilityOrPassive('levitate'));
		assert.deepEqual(AbilityComponents.mossarmor, ['stamina', 'naturalcure']);
		p.addVolatile('gastroacid', q); const hp = p.hp;
		battle.actions.useMove('earthquake', q, { target: p }); assert.equal(p.hp, hp);
		q.setAbility('Mold Breaker'); battle.actions.useMove('earthquake', q, { target: p }); assert(p.hp < hp);
	});

	for (const [species, ability] of [['Golisopod-Aevian', 'Skill Link'], ['Golisopod-Aevian-Mega', 'Desert Shell']]) it(species + ' applies Heatproof once, including under suppression', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability, moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.deepEqual(p.getPassives(), ['heatproof']); assert.deepEqual(AbilityComponents.desertshell, ['skilllink', 'sandstream']);
		if (ability === 'Desert Shell')assert.equal(battle.field.weather, 'sandstorm');
		for (const suppressed of [false, true]) {
			if (suppressed)p.addVolatile('gastroacid', q);
			assert.equal(battle.runEvent('ModifyAtk', q, p, Dex.getActiveMove('firepunch'), 100), 50);
			assert.equal(battle.runEvent('ModifySpA', q, p, Dex.getActiveMove('flamethrower'), 100), 50);
			assert.equal(battle.runEvent('ModifySpA', q, p, Dex.getActiveMove('surf'), 100), 100);
			assert.equal(battle.runEvent('Damage', p, q, Dex.conditions.get('brn'), 100), 50);
		}
		const a = Dex.abilities.get('desertshell');
		assert(a.onStart);
		assert(a.onModifyMove);
		assert(a.onBasePower);
		for (const hook of ['onSourceModifyAtk', 'onSourceModifySpA', 'onDamage'])assert(!a[hook]);
	});
});
