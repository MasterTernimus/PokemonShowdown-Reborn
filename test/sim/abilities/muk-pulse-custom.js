'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const {Dex} = require('./../../../dist/sim');

let battle;

describe('Muk-Pulse custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should keep Muk and Muk-Pulse mechanically identical', () => {
		const muk = Dex.species.get('Muk');
		const pulse = Dex.species.get('Muk-Pulse');
		assert.deepEqual(muk.baseStats, {hp: 105, atk: 105, def: 75, spa: 98, spd: 157, spe: 30});
		assert.deepEqual(pulse.baseStats, muk.baseStats);
		assert.deepEqual(muk.abilities, {0: 'Toxic Mess', 1: 'Adaptive Waste', H: 'Accumulation'});
		assert.deepEqual(pulse.abilities, muk.abilities);
		assert.equal(Object.values(muk.baseStats).reduce((sum, stat) => sum + stat, 0), 570);
		assert.legalTeam([{
			species: 'Muk-Pulse', ability: 'Toxic Mess', moves: ['sludgebomb'], nature: 'Serious',
		}], 'gen9fairytalefield');
	});

	it('should apply every Toxic Mess component', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Muk-Pulse', ability: 'Toxic Mess', moves: ['tackle']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const muk = battle.p1.active[0];
		const target = battle.p2.active[0];
		assert(muk.hasAbility('stench'));
		assert(muk.hasAbility('poisontouch'));
		assert(muk.hasAbility('gluttony'));
		assert.equal(muk.abilityState.gluttony, true);
		battle.random = () => 0;
		battle.makeChoices('move tackle', 'move splash');
		assert.equal(target.status, 'psn');
	});

	it('should use Protean and Regenerator through Adaptive Waste', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Muk-Pulse', ability: 'Adaptive Waste', moves: ['watergun']},
			{species: 'Chansey', moves: ['splash']},
		], [
			{species: 'Mew', moves: ['splash']},
		]]);
		battle.makeChoices('team 12', 'team 1');
		const muk = battle.p1.active[0];
		assert(muk.hasAbility('protean'));
		assert(muk.hasAbility('regenerator'));
		battle.makeChoices('move watergun', 'move splash');
		assert.deepEqual(muk.getTypes(), ['Water']);
		muk.damage(Math.floor(muk.maxhp / 2));
		const hpBeforeSwitch = muk.hp;
		battle.makeChoices('switch 2', 'move splash');
		assert(muk.hp > hpBeforeSwitch);
	});
});
