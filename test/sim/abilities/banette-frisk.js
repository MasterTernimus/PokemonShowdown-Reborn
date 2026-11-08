'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { passiveEffect, passiveState } = require('../../../dist/sim/species-passives');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('Banette Frisk follows its species passive', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability) {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: ability === 'cursedarmament' ? 'Banette-Mega-Z' : ability === 'cursedmarionette' ? 'Banette-Mega' : 'Banette', ability, moves: ['curse'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Zoroark', ability: 'Illusion', item: 'Leftovers', moves: ['splash'] }, { species: 'Zoroark', ability: 'Illusion', item: 'Sitrus Berry', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 123');
		return battle.p1.active[0];
	}
	function enterPassive(p) {
		const id = p.getPassives()[0];
		battle.singleEvent('SwitchIn', passiveEffect(battle, id), passiveState(p, id), p);
	}
	for (const id of ['cursedkeepsake', 'curseddoll', 'cursedarmament']) {
		it(id + ' reveals both items with independent rolls once, preserving the composite identity', () => {
			const p = setup(id), foes = p.foes(), rolls = [];
			for (const foe of foes) {
				foe.removeVolatile('embargo');
				foe.illusion = foe.side.pokemon[2];
			}
			battle.randomChance = (a, b) => {
				rolls.push([a, b]);
				return rolls.length === 1;
			};
			const from = battle.log.length;
			enterPassive(p);
			assert.deepEqual(rolls, [[3, 10], [3, 10]]);
			assert(foes.every(foe => !foe.illusion));
			assert.equal(foes[0].volatiles.embargo.duration, 5);
			assert(!foes[1].volatiles.embargo);
			const logs = battle.log.slice(from);
			const source = id === 'cursedarmament' ? '[from] passive: Frisk' : '[from] ability: Frisk';
			assert.equal(logs.filter(line => line.includes(source)).length, 2);
			assert(logs.filter(line => line.includes(source)).every(line => line.includes(`[of] ${p}`)));
			assert(!logs.some(line => line.startsWith('|-ability|') && line.includes('|Frisk')));
			assert.equal(p.ability, id);
			assert(!(AbilityComponents[id] || []).includes('frisk'));
			assert(!p.hasAbility('frisk'));
			assert(p.hasAbilityOrPassive('frisk'));
		});
		it(id + ' breaks itemless Illusions without an Embargo roll or item reveal', () => {
			const p = setup(id);
			for (const foe of p.foes()) {
				foe.item = '';
				foe.illusion = foe.side.pokemon[2];
			}
			let rolls = 0;
			battle.randomChance = () => {
				rolls++;
				return true;
			};
			const from = battle.log.length;
			enterPassive(p);
			assert.equal(rolls, 0);
			assert(p.foes().every(foe => !foe.illusion));
			assert(!battle.log.slice(from).some(line => line.startsWith('|-item|')));
		});
	}
	it('does not put Frisk back into selected composites', () => {
		const p = setup('cursedkeepsake');
		for (const id of ['cursedkeepsake', 'curseddoll', 'cursedmarionette', 'cursedarmament']) {
			const users = battle.dex.species.all().filter(s => Object.values(s.abilities).some(a => battle.dex.toID(a) === id));
			assert(users.length, id);
			assert(!(AbilityComponents[id] || []).includes('frisk'), id);
		}
		const foe = p.foes()[0];
		foe.addVolatile('curse', p);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 100), 80);
	});
	it('ordinary Mega Banette uses Prankster rather than Frisk', () => {
		const p = setup('cursedmarionette');
		assert.deepEqual(p.getPassives(), ['prankster']);
		assert(!p.hasAbilityOrPassive('frisk'));
		assert(p.foes().every(foe => foe.illusion));
	});
});
