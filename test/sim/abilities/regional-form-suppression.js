'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const forms = [
	['Unfezant', 'Aevian Wing'], ['Musharna', 'Aevian Dream'], ['Donphan', 'Aevian Frost'],
	['Drapion', 'Aevian Toxin'], ['Breloom', 'Aevian Spark'], ['Sigilyph', 'Aevian Grief'],
	['Veluza', 'Aevian Rocket'], ['Turtonator', 'Aevian Glacier'], ['Druddigon', 'Aevian Bolt'],
	['Bronzong', 'Reflector'],
];
describe('Suppressed ability-driven Rejuv forms', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function start(species, ability, item = '', gasFirst = false) {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species, ability, item, moves: ['splash']},
			{species: 'Snorlax', ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'No Ability', moves: ['splash', 'gastroacid']},
			{species: 'Weezing', ability: 'Neutralizing Gas', moves: ['splash']},
		]]);
		battle.makeChoices('team 12', gasFirst ? 'team 21' : 'team 12');
		return battle.p1.active[0];
	}
	for (const [species, ability] of forms) {
		it(`${species}: Gastro Acid reverts stats/types and locks the form until switching`, () => {
			const p = start(species, ability);
			assert.equal(p.species.name, species + '-Rejuv');
			battle.random = () => 0;
			battle.makeChoices('move splash', 'move gastroacid');
			assert(p.volatiles.gastroacid);
			assert.equal(p.species.name, species);
			assert.deepEqual(p.getTypes(), battle.dex.species.get(species).types);
			assert.equal(p.storedStats.atk, battle.spreadModify(p.species.baseStats, p.set).atk);
			p.removeVolatile('gastroacid');
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(p.species.name, species);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(p.species.name, species + '-Rejuv');
			assert(!p.m.regionalFormSuppressed);
		});
		it(`${species}: Neutralizing Gas ending does not restore the form before a switch`, () => {
			const p = start(species, ability);
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(p.species.name, species);
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(p.species.name, species);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(p.species.name, species + '-Rejuv');
		});
		it(`${species}: entering under Gas stays normal after Gas leaves`, () => {
			const p = start(species, ability, '', true);
			assert.equal(p.species.name, species);
			if (species === 'Bronzong') {
				assert(battle.log.some(line => line.startsWith('|-formechange|p1a: Bronzong|Bronzong|')));
			}
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(p.species.name, species);
		});
	}
	it('Ability Shield prevents suppression and preserves the regional form', () => {
		const p = start('Unfezant', 'Aevian Wing', 'Ability Shield');
		battle.makeChoices('move splash', 'move gastroacid');
		assert(!p.volatiles.gastroacid);
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(p.species.name, 'Unfezant-Rejuv');
		assert(!p.m.regionalFormSuppressed);
	});
	for (const ability of ['Parasitism', 'Complete Parasitism']) {
		it(`${ability} retains its existing suppression immunity`, () => {
			const p = start('Parasect', ability);
			battle.makeChoices('move splash', 'move gastroacid');
			assert(!p.volatiles.gastroacid);
			battle.makeChoices('move splash', 'switch 2');
			assert.equal(p.species.name, 'Parasect-Rejuv');
			assert(!p.m.regionalFormSuppressed);
		});
	}
	it('an ordinary Aevian form is not reverted by suppression', () => {
		const p = start('Gyarados-Aevian', 'Intimidate');
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(p.species.name, 'Gyarados-Aevian');
		assert(!p.m.regionalFormSuppressed);
	});
	it('losing Ability Shield under active Gas triggers reversion on the battle update', () => {
		const p = start('Druddigon', 'Aevian Bolt', 'Ability Shield');
		battle.makeChoices('move splash', 'switch 2');
		assert.equal(p.species.name, 'Druddigon-Rejuv');
		p.takeItem();
		battle.eachEvent('Update');
		assert.equal(p.species.name, 'Druddigon');
		assert(p.m.regionalFormSuppressed);
	});
	it('Mold Breaker bypass alone does not revert a regional form', () => {
		const p = start('Druddigon', 'Aevian Bolt');
		battle.p2.active[0].setAbility('Mold Breaker');
		battle.actions.useMove('thunderbolt', battle.p2.active[0], p);
		assert.equal(p.species.name, 'Druddigon-Rejuv');
		assert(!p.m.regionalFormSuppressed);
	});
	for (const hp of [1, 2, 20, 60, 61, 200, 381]) {
		it(`Donphan at ${hp} HP cannot gain HP from suppression and switching`, () => {
			const p = start('Donphan', 'Aevian Frost');
			p.hp = hp;
			battle.makeChoices('move splash', 'move gastroacid');
			assert.equal(p.maxhp, 321);
			assert.equal(p.hp, Math.max(1, Math.floor(hp * 321 / 381)));
			battle.makeChoices('switch 2', 'move splash');
			assert.equal(p.maxhp, 381);
			assert(p.hp <= hp, `${hp} HP became ${p.hp} HP`);
			assert(p.hp > 0);
		});
	}
});
