'use strict';
const assert = require('assert').strict;
const common = require('../../common');

let battle;
function start(ability, options = {}) {
	battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
		{ species: options.species || 'Emboar', ability, item: options.item, moves: options.moves || ['flareblitz', 'splash'] },
	], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash', 'icebeam'] }]]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}

describe('Emboar abilities and Mega Evolution', () => {
	afterEach(() => battle?.destroy());

	it('has the expected base and Mega ability slots', () => {
		const [emboar] = start('Gluttony');
		assert.deepEqual(emboar.species.abilities, { 0: 'Gluttony', 1: 'Violent Rush', H: 'Brute Force' });
		assert.equal(battle.dex.species.get('Emboar-Mega').abilities[0], 'Burning Ego');
	});

	it('Gluttony eats a pinch berry at half HP', () => {
		const [emboar] = start('Gluttony', { item: 'Aguav Berry' });
		emboar.hp = Math.floor(emboar.maxhp / 2);
		battle.singleEvent('Update', emboar.getItem(), emboar.itemState, emboar);
		assert.equal(emboar.item, '', 'Aguav Berry should be consumed at half HP');
		assert(emboar.hp > emboar.maxhp / 2);
	});

	it('Violent Rush boosts Attack and Speed only on the first active turn', () => {
		const [emboar] = start('Violent Rush');
		const attack = emboar.getStat('atk');
		const speed = emboar.getStat('spe');
		emboar.activeTurns = 2;
		assert(attack > emboar.getStat('atk'));
		assert(speed > emboar.getStat('spe'));
	});

	it('Brute Force boosts recoil moves and prevents their recoil', () => {
		const [emboar, foe] = start('Brute Force');
		const flareBlitz = battle.dex.getActiveMove('flareblitz');
		const tackle = battle.dex.getActiveMove('tackle');
		assert(battle.runEvent('BasePower', emboar, foe, flareBlitz, 100) >
			battle.runEvent('BasePower', emboar, foe, tackle, 100));
		battle.makeChoices('move flareblitz', 'move splash');
		assert.equal(emboar.hp, emboar.maxhp, 'Brute Force should block Flare Blitz recoil');
	});

	it('Emboarite makes regular Emboar into Burning Ego Mega Emboar', () => {
		const [emboar, foe] = start('Gluttony', { item: 'Emboarite' });
		assert.equal(emboar.canMegaEvo, 'Emboar-Mega');
		battle.makeChoices('move flareblitz mega', 'move splash');
		assert.equal(emboar.species.name, 'Emboar-Mega');
		assert.equal(emboar.ability, 'burningego');
		for (const component of ['ultraego', 'magmaarmor', 'proficient']) assert(emboar.hasAbility(component));
		const fireMove = battle.dex.getActiveMove('firepunch');
		const neutralMove = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', emboar, foe, fireMove, 100), 130,
			'Proficient should strengthen a same-type move once');
		assert.equal(battle.runEvent('BasePower', emboar, foe, neutralMove, 100), 100);
		battle.singleEvent('ModifyMove', emboar.getAbility(), emboar.abilityState, fireMove, emboar, foe);
		assert.equal(fireMove.ignoreAbility, true, 'Ultra Ego should bypass abilities');
	});

	it('Emboarite keeps Reborn Emboar on its own Mega route', () => {
		const [emboar] = start('Gluttony', { species: 'Emboar-Reborn', item: 'Emboarite' });
		assert.equal(emboar.canMegaEvo, 'Emboar-Mega-Reborn');
		battle.makeChoices('move flareblitz mega', 'move splash');
		assert.equal(emboar.species.name, 'Emboar-Mega-Reborn');
		assert.equal(emboar.ability, 'burningego');
	});

	it('Burning Ego applies Ultra Ego hit recovery, attack boosts, and Magma Armor', () => {
		const [emboar, foe] = start('Gluttony', { item: 'Emboarite' });
		battle.makeChoices('move splash mega', 'move splash');
		emboar.hp = Math.floor(emboar.maxhp * 0.75);
		const before = emboar.hp;
		battle.singleEvent('DamagingHit', emboar.getAbility(), emboar.abilityState, emboar, foe, battle.dex.getActiveMove('tackle'), 40);
		assert.equal(emboar.boosts.atk, 1);
		assert.equal(emboar.boosts.spa, 1);
		assert(emboar.hp > before, 'Ultra Ego should heal when hit');
		assert.equal(battle.runEvent('Immunity', emboar, null, null, 'frz'), false,
			'Magma Armor should prevent freezing');
		assert.equal(battle.runEvent('SourceModifyAtk', emboar, foe, battle.dex.getActiveMove('waterfall'), 100), 50,
			'Magma Armor should halve incoming physical Water attacks');
		assert.equal(battle.runEvent('SourceModifySpA', emboar, foe, battle.dex.getActiveMove('icebeam'), 100), 50,
			'Magma Armor should halve incoming special Ice attacks');
	});
});
