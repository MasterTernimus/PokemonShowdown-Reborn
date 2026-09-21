'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

function start(species = 'Typhlosion', moves = ['splash', 'flamethrower', 'thunderbolt'], foeSpecies = 'Mew') {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species, item: 'Typhlosionite', moves },
	], [
		{ species: foeSpecies, moves: ['splash'] },
	]]);
	battle.makeChoices('team 1', 'team 1');
	assert.equal(battle.p1.active[0].canMegaEvo, 'Typhlosion-Mega');
	battle.makeChoices('move splash mega', 'move splash');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Typhlosionite and Plasma Eruption', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('sets both base forms to 545 BST and Mega Typhlosion to 645 BST', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const stats = Dex.species.get(name).baseStats;
			assert.equal(Object.values(stats).reduce((sum, stat) => sum + stat, 0), 545, name);
		}
		assert.deepEqual(Dex.species.get('Typhlosion').baseStats,
			{ hp: 83, atk: 95, def: 85, spa: 112, spd: 70, spe: 100 });
		assert.deepEqual(Dex.species.get('Typhlosion-Alt').baseStats,
			Dex.species.get('Typhlosion').baseStats);
		assert.deepEqual(Dex.species.get('Typhlosion-Hisui').baseStats,
			{ hp: 83, atk: 95, def: 80, spa: 127, spd: 65, spe: 95 });
		const mega = Dex.species.get('Typhlosion-Mega');
		assert.deepEqual(mega.types, ['Fire', 'Electric']);
		assert.deepEqual(mega.baseStats, { hp: 83, atk: 138, def: 85, spa: 139, spd: 70, spe: 130 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 645);
		assert.equal(mega.abilities[0], 'Plasma Eruption');
		assert.equal(mega.requiredItem, 'Typhlosionite');
		for (const name of ['Typhlosion', 'Typhlosion-Alt', 'Typhlosion-Hisui']) {
			const [holder] = start(name);
			assert.equal(holder.species.id, 'typhlosionmega');
			assert.equal(holder.ability, 'plasmaeruption');
			battle.destroy();
			battle = null;
		}
	});

	it('gives both forms the requested Electric moves', () => {
		for (const name of ['Typhlosion', 'Typhlosion-Hisui']) {
			const learnset = Dex.species.getLearnsetData(name.toLowerCase().replace(/[^a-z0-9]/g, '')).learnset;
			for (const move of ['thunderbolt', 'doubleshock', 'thunder', 'risingvoltage',
				'chargebeam', 'electroball', 'shockwave', 'thunderfang']) {
				assert(learnset[move]?.length, `${name} is missing ${move}`);
			}
		}
	});

	it('swaps Fire and Electric at 50% without turning an attack into an immunity', () => {
		const [holder, foe] = start();
		const ability = holder.getAbility();
		assert(holder.hasAbility('proficient'));
		assert(holder.hasAbility('static'));
		assert(holder.hasAbility('flamebody'));
		assert(!holder.hasAbility('blazingmane'));
		const previousChance = battle.randomChance;
		battle.randomChance = () => true;
		const fireMove = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', ability, holder.abilityState, fireMove, holder, foe);
		assert.equal(fireMove.type, 'Electric');
		const electricMove = battle.dex.getActiveMove('thunderbolt');
		battle.singleEvent('ModifyMove', ability, holder.abilityState, electricMove, holder, foe);
		assert.equal(electricMove.type, 'Fire');
		battle.randomChance = () => false;
		const unchanged = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', ability, holder.abilityState, unchanged, holder, foe);
		assert.equal(unchanged.type, 'Fire');
		battle.randomChance = () => true;
		foe.setType('Ground');
		const blocked = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', ability, holder.abilityState, blocked, holder, foe);
		assert.equal(blocked.type, 'Fire');
		foe.setType('Water');
		foe.setAbility('Volt Absorb', null, null, true);
		const absorbed = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', ability, holder.abilityState, absorbed, holder, foe);
		assert.equal(absorbed.type, 'Fire');
		battle.randomChance = previousChance;
	});

	it('keeps Proficient without Blazing Mane power, extra hits, or priority', () => {
		const [holder, foe] = start();
		const electricMove = battle.dex.getActiveMove('thunderbolt');
		assert.equal(battle.runEvent('BasePower', holder, foe, electricMove, 100), 130);
		assert.equal(battle.runEvent('BasePower', holder, foe, battle.dex.getActiveMove('shadowball'), 100), 100);
		battle.singleEvent('PrepareHit', holder.getAbility(), holder.abilityState, holder, foe, electricMove);
		assert.equal(electricMove.multihit, undefined);
		holder.hp = Math.floor(holder.maxhp / 2);
		assert.equal(battle.runEvent('ModifyPriority', holder, foe, electricMove, 0), 0);
		battle.destroy();
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Typhlosion', ability: 'Blazing Mane', moves: ['splash', 'thunderbolt'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const ordinary = battle.p1.active[0];
		const ordinaryFoe = battle.p2.active[0];
		assert.equal(battle.runEvent('BasePower', ordinary, ordinaryFoe,
			battle.dex.getActiveMove('thunderbolt'), 100), 100);
	});

	it('applies Static and Flame Body independently when hit by contact', () => {
		const [holder, foe] = start();
		const contactMove = battle.dex.getActiveMove('tackle');
		battle.randomChance = () => true;
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, contactMove, 10);
		assert.equal(foe.status, 'par');
		foe.clearStatus();
		let attempt = 0;
		battle.randomChance = () => ++attempt === 2;
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, contactMove, 10);
		assert.equal(attempt, 2);
		assert.equal(foe.status, 'brn');
	});

	it('forces Fire into Electric after Burn Up and Electric into Fire after Double Shock', () => {
		let [holder, foe] = start('Typhlosion', ['splash', 'burnup', 'flamethrower'], 'Blissey');
		battle.makeChoices('move burnup', 'move splash');
		assert.equal(holder.hasType('Fire'), false);
		assert.equal(holder.hasType('Electric'), true);
		const fireMove = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, fireMove, holder, foe);
		assert.equal(fireMove.type, 'Electric');
		assert(battle.log.some(line => line.includes('Plasma Eruption turned Fire into Electricity')));
		foe.setType('Ground');
		const immuneFireMove = battle.dex.getActiveMove('flamethrower');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, immuneFireMove, holder, foe);
		assert.equal(immuneFireMove.type, 'Fire');
		battle.destroy();
		battle = null;
		[holder, foe] = start('Typhlosion-Hisui', ['splash', 'doubleshock', 'thunderbolt']);
		battle.makeChoices('move doubleshock', 'move splash');
		assert.equal(holder.hasType('Electric'), false);
		assert.equal(holder.hasType('Fire'), true);
		const electricMove = battle.dex.getActiveMove('thunderbolt');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, electricMove, holder, foe);
		assert.equal(electricMove.type, 'Fire');
	});
});
