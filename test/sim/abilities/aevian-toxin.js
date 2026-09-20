'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

function start(foe = { species: 'Mew', ability: 'No Ability', moves: ['splash'] }) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: 'Drapion', ability: 'Aevian Toxin', moves: ['crunch', 'poisonfang', 'splash'] },
	], [foe]]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Aevian Toxin Drapion-Rejuv', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('transforms Drapion on entry with the requested data and only one ability slot', () => {
		const [drapion] = start();
		assert.equal(Dex.species.get('Drapion').abilities.S, 'Aevian Toxin');
		assert.equal(Dex.species.get('Drapion-Aevian').exists, false);
		assert.equal(drapion.species.id, 'drapionrejuv', battle.log.join('\n'));
		assert.equal(drapion.ability, 'aeviantoxin');
		assert.deepEqual(drapion.species.abilities, { 0: 'Aevian Toxin' });
		assert.deepEqual(drapion.species.types, ['Poison', 'Ice']);
		assert.deepEqual(drapion.species.baseStats, { hp: 80, atk: 125, def: 110, spa: 60, spd: 80, spe: 95 });
		assert.equal(Object.values(drapion.species.baseStats).reduce((sum, stat) => sum + stat, 0), 550);
		for (const component of ['strongjaw', 'layeredcoat', 'merciless']) {
			assert(drapion.hasAbility(component), `missing ${component}`);
		}
		for (const donphanComponent of ['icebody', 'guts', 'filter']) {
			assert(!drapion.hasAbility(donphanComponent), `unexpected Donphan effect: ${donphanComponent}`);
		}
	});

	it('combines Strong Jaw, Layered Coat, and Merciless in battle', () => {
		const [drapion, foe] = start();
		assert.equal(battle.runEvent('BasePower', drapion, foe, battle.dex.getActiveMove('crunch'), 100), 150);
		assert.equal(battle.runEvent('BasePower', drapion, foe, battle.dex.getActiveMove('poisonjab'), 100), 100);
		assert.equal(battle.runEvent('ModifyDef', drapion, null, null, 100), 200);
		assert.equal(battle.runEvent('Immunity', drapion, null, null, 'sandstorm'), false);
		foe.setStatus('psn');
		battle.makeChoices('move crunch', 'move splash');
		assert(battle.log.some(line => line.includes('|-crit|')), battle.log.join('\n'));
	});

	it('keeps Donphan-Rejuv and its existing Aevian Frost effects intact', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Donphan', ability: 'Aevian Frost', moves: ['splash'] },
		], [{ species: 'Mew', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const donphan = battle.p1.active[0];
		assert.equal(donphan.species.id, 'donphanrejuv');
		for (const component of ['icebody', 'guts', 'filter']) assert(donphan.hasAbility(component));
		assert(!donphan.hasAbility('strongjaw'));
	});
});
