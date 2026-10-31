'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
let battle;
function setup(ability = 'Sturdy') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Golem-Alola', ability, moves: ['tackle', 'thunderpunch', 'weatherball']}],
		[{species: 'Mew', ability: 'No Ability', moves: ['boomburst']}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
function preview(source, target, id) {
	const move = Dex.getActiveMove(id);
	battle.runEvent('ModifyType', source, target, move, move);
	return {type: move.type, power: battle.runEvent('BasePower', source, target, move, 100)};
}

describe('Alolan Golem Galvanize passive', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('replaces Soundproof only on Alolan Golem with Rock Head in its vacated selectable slot', () => {
		const [golem] = setup();
		assert.deepEqual(golem.getPassives(), ['galvanize']);
		assert.deepEqual(golem.species.abilities, {0: 'Siege Magnet', 1: 'Sturdy', H: 'Rock Head'});
		assert.deepEqual(Dex.species.get('golem').passives, ['solidrock']);
		for (const id of ['geodudealola', 'graveleralola']) assert.deepEqual(Dex.species.get(id).passives, []);
	});
	for (const ability of ['Sturdy', 'Siege Magnet', 'Galvanize']) {
		it(`converts Normal attacks with exactly one boost alongside ${ability}`, () => {
			const [golem, foe] = setup(ability);
			assert.deepEqual(preview(golem, foe, 'tackle'), {type: 'Electric', power: 120});
			assert.deepEqual(preview(golem, foe, 'thunderpunch'), {type: 'Electric', power: 100});
			assert.deepEqual(preview(golem, foe, 'weatherball'), {type: 'Normal', power: 100});
		});
	}
	for (const [field, power] of [['electricterrain', 150], ['factoryterrain', 150], ['shortcircuitterrain', 200]]) {
		it(`retains Galvanize's conversion bonus on ${field}`, () => {
			const [golem, foe] = setup();
			// Isolate the passive's conversion modifier from each field's separate attack bonuses.
			battle.field.isTerrain = ids => (Array.isArray(ids) ? ids : [ids]).includes(field);
			assert.deepEqual(preview(golem, foe, 'tackle'), {type: 'Electric', power});
		});
	}
	it('retains the species passive when the selected ability is suppressed or replaced', () => {
		const [golem, foe] = setup('Galvanize');
		golem.addVolatile('gastroacid', foe);
		assert.deepEqual(preview(golem, foe, 'tackle'), {type: 'Electric', power: 120});
		golem.removeVolatile('gastroacid');
		golem.setAbility('No Ability');
		assert.deepEqual(preview(golem, foe, 'tackle'), {type: 'Electric', power: 120});
	});
	it('no longer blocks opposing sound moves with Soundproof', () => {
		const [golem, foe] = setup();
		const hp = golem.hp;
		battle.actions.runMove('boomburst', foe, foe.getLocOf(golem));
		assert(golem.hp < hp);
	});
	it('applies Electric immunity to a Normal attack converted by the passive in battle', () => {
		const [golem, foe] = setup();
		foe.setType('Ground');
		const hp = foe.hp;
		battle.actions.runMove('tackle', golem, golem.getLocOf(foe));
		assert.equal(foe.hp, hp);
		assert(battle.log.some(line => line.startsWith('|-immune|p2a: Mew')));
	});
});
