'use strict';

const assert = require('../assert');
const common = require('../common');

describe('Milotic-Terajuma moves and Whiplash', function () {
	let battle;
	afterEach(() => battle?.destroy());

	function setup(userMoves, foeMoves = ['splash'], ability = 'whiplash') {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Milotic-Terajuma', ability, moves: userMoves},
		], [
			{species: 'Snorlax', ability: 'immunity', moves: foeMoves},
		]]);
		battle.makeChoices('team 1', 'team 1');
		return [battle.p1.active[0], battle.p2.active[0]];
	}

	it('raises Accuracy on entry and lets Tail Smash lower Defense', function () {
		const [milotic, foe] = setup(['tailsmash']);
		assert.equal(milotic.boosts.accuracy, 1);
		const move = battle.dex.moves.get('tailsmash');
		assert.equal(move.flags.contact, 1);
		assert.equal(move.flags.tailmove, 1);
		battle.makeChoices('move tailsmash', 'move splash');
		assert(foe.hp < foe.maxhp);
		assert.equal(foe.boosts.def, -1);
	});

	it('boosts Tail Smash damage with Whiplash', function () {
		let [, foe] = setup(['tailsmash']);
		battle.makeChoices('move tailsmash', 'move splash');
		const boostedDamage = foe.maxhp - foe.hp;
		battle.destroy();
		[, foe] = setup(['tailsmash'], ['splash'], 'prismscale');
		battle.makeChoices('move tailsmash', 'move splash');
		const normalDamage = foe.maxhp - foe.hp;
		assert(boostedDamage > normalDamage * 1.25);
	});

	it('doubles Deluge power only after damage from that target this turn', function () {
		const [milotic, foe] = setup(['deluge'], ['tackle']);
		const move = battle.dex.moves.get('deluge');
		assert.equal(move.priority, -4);
		assert.equal(move.flags.tailmove, undefined);
		assert.equal(move.basePowerCallback.call(battle, milotic, foe, move), 65);
		battle.makeChoices('move deluge', 'move tackle');
		assert(milotic.hp < milotic.maxhp);
		assert(foe.hp < foe.maxhp);
		const boostedDamage = foe.maxhp - foe.hp;
		const hit = milotic.attackedBy.find(entry => entry.source === foe && entry.damage > 0);
		assert(hit);
		hit.thisTurn = true;
		assert.equal(move.basePowerCallback.call(battle, milotic, foe, move), 130);
		battle.destroy();
		const [, freshFoe] = setup(['deluge']);
		battle.makeChoices('move deluge', 'move splash');
		const normalDamage = freshFoe.maxhp - freshFoe.hp;
		assert(boostedDamage > normalDamage * 1.5);
	});

	it('sets Atlantis Wall only in rain or eligible fields, on the user side', function () {
		const [milotic] = setup(['atlantiswall']);
		battle.makeChoices('move atlantiswall', 'move splash');
		assert.false(!!battle.p1.getSideCondition('atlantiswall'));
		battle.field.setWeather('raindance', milotic);
		battle.makeChoices('move atlantiswall', 'move splash');
		assert(!!battle.p1.getSideCondition('atlantiswall'));
		assert.false(!!battle.p2.getSideCondition('atlantiswall'));
	});

	it('gives Atlantis Wall eight turns in rain and five on Misty Terrain', function () {
		const [milotic] = setup(['atlantiswall']);
		const move = battle.dex.moves.get('atlantiswall');
		battle.field.setWeather('raindance', milotic);
		battle.p1.addSideCondition('atlantiswall', milotic);
		assert.equal(battle.p1.sideConditions.atlantiswall.duration, 8);
		assert.equal(move.onTry.call(battle, milotic), false);
		battle.p1.removeSideCondition('atlantiswall');
		battle.field.clearWeather();
		battle.field.setTerrain('mistyterrain', milotic);
		battle.p1.addSideCondition('atlantiswall', milotic);
		assert.equal(battle.p1.sideConditions.atlantiswall.duration, 5);
		assert.equal(move.onModifyPriority.call(battle, 0), 1);
	});

	it('allows the listed fields, but Air Lock suppresses rain-only eligibility', function () {
		for (const terrain of ['watersurfaceterrain', 'underwaterterrain', 'mistyterrain', 'murkwatersurfaceterrain', 'midnightzoneterrain']) {
			const [milotic] = setup(['atlantiswall']);
			const move = battle.dex.moves.get('atlantiswall');
			assert(battle.field.setTerrain(terrain, milotic), terrain);
			assert.equal(battle.field.terrain, terrain);
			assert.equal(move.onTry.call(battle, milotic), true, terrain);
			assert.equal(move.onModifyPriority.call(battle, 0), 1, terrain);
			battle.destroy();
		}
		const [milotic, foe] = setup(['atlantiswall']);
		const move = battle.dex.moves.get('atlantiswall');
		battle.field.setWeather('raindance', milotic);
		assert.equal(move.onTry.call(battle, milotic), true);
		foe.setAbility('airlock');
		assert.equal(foe.ability, 'airlock');
		assert.equal(battle.field.suppressingWeather(), true);
		assert.equal(move.onTry.call(battle, milotic), false);
	});

	it('halves super-effective physical and special damage', function () {
		for (const attack of ['thunderbolt', 'earthquake']) {
			let [milotic] = setup(['atlantiswall'], [attack]);
			battle.field.setWeather('raindance', milotic);
			battle.makeChoices('move atlantiswall', `move ${attack}`);
			const walledDamage = milotic.maxhp - milotic.hp;
			assert(walledDamage > 0);
			battle.destroy();
			[milotic] = setup(['splash'], [attack]);
			battle.field.setWeather('raindance', milotic);
			battle.makeChoices('move splash', `move ${attack}`);
			const normalDamage = milotic.maxhp - milotic.hp;
			assert(normalDamage > walledDamage * 1.5, `${attack}: ${normalDamage} vs ${walledDamage}`);
			battle.destroy();
			battle = undefined;
		}
	});
});
