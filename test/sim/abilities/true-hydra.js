'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const {ENABLE_MEGA_HYDREIGON_X} = require('../../../dist/data/disabled-custom-content');

let battle;
describe('Mega Hydreigon X and True Hydra', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('registers the stone, form, stats, and move access', () => {
		const mega = Dex.species.get('Hydreigon-Mega-X');
		if (!ENABLE_MEGA_HYDREIGON_X) {
			assert(!mega.exists);
			assert(!Dex.items.get('Hydreigonite').exists);
			assert(!Dex.species.get('Hydreigon').otherFormes?.includes('Hydreigon-Mega-X'));
			return;
		}
		assert.deepEqual(mega.types, ['Dark', 'Dragon']);
		assert.deepEqual(mega.baseStats, {hp: 92, atk: 155, def: 115, spa: 135, spd: 115, spe: 88});
		assert.equal(mega.bst, 700);
		assert.equal(mega.abilities[0], 'True Hydra');
		assert.equal(mega.requiredItem, 'Hydreigonite');
		assert.deepEqual(Dex.species.get('Hydreigon').otherFormes, ['Hydreigon-Mega-X']);
		assert.equal(Dex.items.get('Hydreigonite').megaStone.Hydreigon, 'Hydreigon-Mega-X');
		const learnset = Dex.species.getLearnsetData('hydreigon').learnset;
		for (const move of ['dualchop', 'coil', 'skullbash']) assert(learnset[move]?.length, move);
	});

	it('Mega Evolves and uses Hydra Bond while retaining all four components', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Hydreigon', item: 'Hydreigonite', moves: ['dragonclaw', 'splash']},
		], [{species: 'Aggron', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		if (!ENABLE_MEGA_HYDREIGON_X) {
			assert.equal(battle.p1.active[0].canMegaEvo, null);
			battle.p1.active[0].setAbility('True Hydra');
		} else assert.equal(battle.p1.active[0].canMegaEvo, 'Hydreigon-Mega-X');
		battle.makeChoices(ENABLE_MEGA_HYDREIGON_X ? 'move dragonclaw mega' : 'move dragonclaw', 'move splash');
		const hydreigon = battle.p1.active[0];
		assert.equal(hydreigon.species.id, ENABLE_MEGA_HYDREIGON_X ? 'hydreigonmegax' : 'hydreigon');
		assert.equal(hydreigon.ability, 'truehydra');
		for (const component of ['hydrabond', 'regenerator', 'shedskin', 'selfsufficient']) {
			assert(hydreigon.hasAbility(component), component);
		}
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')), battle.log.join('\n'));
	});

	it('heals each turn, sheds status, and restores HP on switching out', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Hydreigon', item: 'Hydreigonite', moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		], [{species: 'Blissey', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		if (ENABLE_MEGA_HYDREIGON_X) battle.makeChoices('move splash mega', 'move splash');
		else battle.p1.active[0].setAbility('True Hydra');
		assert.equal(battle.p1.active[0].ability, 'truehydra');
		const hydreigon = battle.p1.active[0];
		hydreigon.hp = Math.floor(hydreigon.maxhp / 2);
		const priorHP = hydreigon.hp;
		hydreigon.setStatus('par');
		battle.randomChance = () => true;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(hydreigon.status, '');
		assert(hydreigon.hp > priorHP, 'Residual healing did not occur');
		const beforeSwitch = hydreigon.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert.equal(hydreigon.hp, Math.min(hydreigon.maxhp, beforeSwitch + Math.floor(hydreigon.baseMaxhp / 3)));
	});
});
