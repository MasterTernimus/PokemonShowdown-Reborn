'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('Banette composites retain full Frisk', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability) {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Banette', ability, moves: ['curse'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Zoroark', ability: 'Illusion', item: 'Leftovers', moves: ['splash'] }, { species: 'Zoroark', ability: 'Illusion', item: 'Sitrus Berry', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 123');
		return battle.p1.active[0];
	}
	for (const id of ['cursedkeepsake', 'curseddoll', 'cursedmarionette', 'cursedarmament']) {
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
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.deepEqual(rolls, [[3, 10], [3, 10]]);
			assert(foes.every(foe => !foe.illusion));
			assert.equal(foes[0].volatiles.embargo.duration, 5);
			assert(!foes[1].volatiles.embargo);
			const logs = battle.log.slice(from);
			assert.equal(logs.filter(line => line.includes('[from] ability: Frisk')).length, 2);
			assert(logs.filter(line => line.includes('[from] ability: Frisk')).every(line => line.includes(`[of] ${p}`)));
			assert.equal(p.ability, id);
			assert.equal(AbilityComponents[id].filter(x => x === 'frisk').length, 1);
			assert(p.hasAbility('frisk'));
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
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(rolls, 0);
			assert(p.foes().every(foe => !foe.illusion));
			assert(!battle.log.slice(from).some(line => line.startsWith('|-item|')));
		});
	}
	it('applies to every existing user without changing shared-user species data', () => {
		const p = setup('cursedkeepsake');
		for (const id of ['cursedkeepsake', 'curseddoll', 'cursedmarionette', 'cursedarmament']) {
			const users = battle.dex.species.all().filter(s => Object.values(s.abilities).some(a => battle.dex.toID(a) === id));
			assert(users.length, id);
			for (const species of users) assert.equal(typeof battle.dex.abilities.get(Object.values(species.abilities).find(a => battle.dex.toID(a) === id)).onStart, 'function');
		}
		const foe = p.foes()[0];
		foe.addVolatile('curse', p);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, battle.dex.getActiveMove('tackle'), 100), 80);
	});
});
