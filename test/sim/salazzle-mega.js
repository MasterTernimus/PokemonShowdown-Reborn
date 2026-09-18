'use strict';
const assert = require('./../assert');
const common = require('./../common');
let battle;

describe('Salazzle-Mega', function () {
	afterEach(() => battle?.destroy());

	it('defines Salazzle-Mega and Salazzite correctly', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
		const base = battle.dex.species.get('Salazzle');
		const mega = battle.dex.species.get('Salazzle-Mega');
		assert(base.otherFormes.includes('Salazzle-Mega'));
		assert.deepEqual(mega.types, ['Poison', 'Fire']);
		assert.deepEqual(mega.baseStats, {hp: 68, atk: 64, def: 70, spa: 148, spd: 150, spe: 80});
		assert.equal(mega.bst, 580);
		assert.equal(mega.abilities[0], 'Corrosive Burn');
		assert.equal(mega.requiredItem, 'Salazzite');
		assert.equal(mega.battleOnly, 'Salazzle');
		assert.equal(battle.dex.items.get('Salazzite').megaStone.Salazzle, 'Salazzle-Mega');
	});

	it('Mega Evolves and applies every Corrosive Burn component', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Salazzle', item: 'Salazzite', moves: ['toxic', 'sludgebomb']},
		], [{species: 'Skarmory', ability: 'No Ability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move toxic mega', 'move splash');
		const salazzle = battle.p1.active[0];
		const skarmory = battle.p2.active[0];
		assert.species(salazzle, 'Salazzle-Mega');
		assert.equal(salazzle.ability, 'corrosiveburn');
		for (const component of ['merciless', 'regenerator', 'corrosion']) assert(salazzle.hasAbility(component));
		assert.equal(skarmory.status, 'tox', 'Corrosion should poison Steel types');
		assert(battle.runEvent('ModifyCritRatio', salazzle, skarmory, battle.dex.moves.get('sludgebomb'), 0) >= 5,
			'Merciless should force a critical hit against poisoned targets');
		salazzle.hp = Math.floor(salazzle.maxhp / 2);
		const before = salazzle.hp;
		battle.singleEvent('SwitchOut', salazzle.getAbility(), salazzle.abilityState, salazzle);
		assert.equal(salazzle.hp, Math.min(salazzle.maxhp, before + Math.floor(salazzle.baseMaxhp / 3)));
	});
});
