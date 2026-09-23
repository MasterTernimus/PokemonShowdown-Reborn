'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');

let battle;
describe('Aevian Mega Golisopod and Desert Shell', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('keeps both Golisopod lines separate with compatible Mega stones', () => {
		const standard = Dex.species.get('Golisopod');
		const aevian = Dex.species.get('Golisopod-Aevian');
		const standardMega = Dex.species.get('Golisopod-Mega');
		const aevianMega = Dex.species.get('Golisopod-Aevian-Mega');
		assert.deepEqual(standard.otherFormes, ['Golisopod-Mega']);
		assert.deepEqual(aevian.otherFormes, ['Golisopod-Aevian-Mega']);
		assert.deepEqual(standardMega.requiredItems, ['Golisopite', 'Mega Golisopite']);
		assert.equal(aevianMega.requiredItem, 'Golisopite');
		assert.deepEqual(Dex.items.get('Mega Golisopite').megaStone, {Golisopod: 'Golisopod-Mega'});
		assert.deepEqual(Dex.items.get('Golisopite').megaStone,
			{Golisopod: 'Golisopod-Mega', 'Golisopod-Aevian': 'Golisopod-Aevian-Mega'});
		assert.deepEqual(aevianMega.types, ['Bug', 'Ground']);
		assert.deepEqual(aevianMega.baseStats, {hp: 75, atk: 160, def: 155, spa: 60, spd: 140, spe: 40});
		assert.equal(aevianMega.bst, 630);
		assert.equal(aevianMega.abilities[0], 'Desert Shell');
		assert.equal(aevianMega.battleOnly, 'Golisopod-Aevian');
		assert.equal(standardMega.abilities[0], 'Aqua Shell');
	});

	for (const [species, item, expected] of [
		['Golisopod', 'Mega Golisopite', 'Golisopod-Mega'],
		['Golisopod-Aevian', 'Golisopite', 'Golisopod-Aevian-Mega'],
		['Golisopod', 'Golisopite', 'Golisopod-Mega'],
		['Golisopod-Aevian', 'Mega Golisopite', null],
	]) {
		it(`${species} with ${item} Mega Evolves only into ${expected || 'no form'}`, () => {
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
				{species, item, moves: ['splash']},
			], [{species: 'Mew', moves: ['splash']}]]);
			battle.makeChoices('team 1', 'team 1');
			assert.equal(battle.p1.active[0].canMegaEvo, expected);
			if (!expected) return;
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(battle.p1.active[0].species.name, expected);
		});
	}

	it('sets sand and combines maximum multi-hit attacks with Heatproof', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Golisopod-Aevian', item: 'Golisopite', ability: 'Skill Link', moves: ['pinmissile']},
		], [{species: 'Regirock', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move pinmissile mega', 'move splash');
		const holder = battle.p1.active[0];
		const foe = battle.p2.active[0];
		assert.equal(holder.ability, 'desertshell');
		assert(battle.field.isWeather('sandstorm'));
		for (const component of ['skilllink', 'heatproof', 'sandstream']) {
			assert(holder.hasAbility(component), `Missing ${component}`);
		}
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|5')), battle.log.join('\n'));
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('pinmissile'), 100), 150);
		assert.equal(battle.runEvent('SourceModifyAtk', holder, foe, battle.dex.getActiveMove('firepunch'), 100), 50);
		assert.equal(battle.runEvent('SourceModifySpA', holder, foe, battle.dex.getActiveMove('flamethrower'), 100), 50);
		assert.equal(battle.runEvent('Damage', holder, foe, {id: 'brn'}, 100), 50);
	});
});
