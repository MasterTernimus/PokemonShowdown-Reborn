'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
function setup(moves = ['splash'], enemyMoves = ['splash'], extra = {}, enemy = {}) {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
		[{species: 'Mew', ability: 'noability', moves, ...extra}],
		[{species: 'Blissey', ability: 'noability', moves: enemyMoves, ...enemy}],
	]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
function field(id, duration = 8) {
	assert(battle.field.setFieldOrAura(id, duration, battle.p1.active[0], battle.dex.moves.get('splash'), true));
}
describe('Eclipse field rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const id of ['coldeclipseterrain', 'infernaleclipseterrain']) {
		for (const [ability, defMod, spdMod] of [['icescales', 2, 1], ['prismarmor', 4 / 3, 4 / 3]]) {
			it(`${ability} retains its defensive bonus on ${id}`, () => {
				const [p] = setup(['splash'], ['splash'], {ability});
				const def = p.getStat('def'), spd = p.getStat('spd'); field(id);
				assert(Math.abs(p.getStat('def') - def * defMod) <= 1);
				assert(Math.abs(p.getStat('spd') - spd * spdMod) <= 1);
			});
		}
		it(`doubles Dragon attack power on ${id}`, () => {
			const [p, q] = setup(); field(id);
			assert.equal(battle.runEvent('BasePower', p, q, battle.dex.getActiveMove('dragonpulse'), 100), 200);
		});
	}
	it('stacks Ice/Ghost typing with Ice Scales once, without the old duplicate field multiplier', () => {
		const [p] = setup(['splash'], ['splash'], {ability: 'icescales'}); p.setType(['Ice', 'Ghost']);
		const def = p.getStat('def'), spd = p.getStat('spd'); field('coldeclipseterrain');
		assert(Math.abs(p.getStat('def') - def * 2.88) <= 2);
		assert(Math.abs(p.getStat('spd') - spd * 1.44) <= 1);
	});
	for (const [item, duration] of [['', 5], ['amplifieldrock', 8]]) {
		it(`Rift Herald creates the field on entry for ${duration} turns and does not refresh it`, () => {
			const [p] = setup(['splash'], ['splash'], {ability: 'riftherald', item});
			assert.equal(battle.field.terrain, 'rifteclipseterrain');
			assert.equal(battle.field.terrainState.duration, duration);
			battle.makeChoices('move splash', 'move splash');
			battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
			assert.equal(battle.field.terrainState.duration, duration - 1);
		});
	}
	it('Rift Herald respects the Bad Seeds field lock', () => {
		const [p] = setup(['splash'], ['splash'], {ability: 'riftherald'}, {ability: 'badseeds'});
		battle.field.clearAura(); field('coldeclipseterrain');
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
	});
	it('creates Rift Eclipse with its dedicated move and preserves the timer through heat/cooling', () => {
		setup(['riftopening', 'heatwave', 'eruption', 'glaciate']);
		battle.makeChoices('move riftopening', 'move splash');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 4);
		battle.makeChoices('move eruption', 'move splash');
		assert.equal(battle.field.terrain, 'infernaleclipseterrain');
		assert.equal(battle.field.terrainState.duration, 3);
		assert.equal(battle.field.terrainStack.length, 1);
		battle.makeChoices('move glaciate', 'move splash');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.duration, 2);
		battle.makeChoices('move glaciate', 'move splash');
		assert.equal(battle.field.terrain, 'coldeclipseterrain');
		assert.equal(battle.field.terrainState.duration, 1);
	});
	it('uses Amplifield Rock for Rift Opening', () => {
		setup(['riftopening'], ['splash'], {item: 'amplifieldrock'});
		battle.makeChoices('move riftopening', 'move splash');
		assert.equal(battle.field.terrainState.duration, 7);
	});
	it('creates a rift by establishing both rooms, not by toggling one off', () => {
		setup(['trickroom', 'magicroom', 'splash']);
		battle.makeChoices('move trickroom', 'move splash');
		battle.makeChoices('move trickroom', 'move splash');
		assert.equal(battle.field.terrain, '');
		battle.makeChoices('move magicroom', 'move splash');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
	});
	it('cancels opposing heating and freezing progress', () => {
		setup(['heatwave', 'blizzard']); field('rifteclipseterrain');
		battle.makeChoices('move heatwave', 'move splash');
		assert.equal(battle.field.terrainState.terrainChanges.get('eclipseTemperature'), 1);
		battle.makeChoices('move blizzard', 'move splash');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
		assert.equal(battle.field.terrainState.terrainChanges.get('eclipseTemperature'), 0);
	});
	it('does not heat through Protect', () => {
		setup(['eruption'], ['protect']); field('rifteclipseterrain');
		battle.makeChoices('move eruption', 'move protect');
		assert.equal(battle.field.terrain, 'rifteclipseterrain');
	});
	for (const [start, result] of [['coldeclipseterrain', 'icyterrain'], ['infernaleclipseterrain', 'volcanicterrain']]) {
		it(`Purify makes ${result} permanent without requiring a status target`, () => {
			setup(['purify', 'splash']); field(start, 2);
			battle.makeChoices('move purify', 'move splash');
			assert.equal(battle.field.terrain, result);
			assert(battle.field.terrainState.permanent);
			for (let i = 0; i < 4; i++) battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.field.terrain, result);
		});
		for (const removal of ['icespinner', 'steelroller']) {
			it(`${removal} removes permanent purified ${result}`, () => {
				setup(['purify', removal]); field(start);
				battle.makeChoices('move purify', 'move splash');
				battle.makeChoices(`move ${removal}`, 'move splash');
				assert.equal(battle.field.terrain, '');
			});
		}
	}
	it('purified ice melts to permanent Cave instead of resurrecting an eclipse', () => {
		setup(['purify', 'heatwave']); field('coldeclipseterrain');
		battle.makeChoices('move purify', 'move splash');
		battle.makeChoices('move heatwave', 'move splash');
		assert.equal(battle.field.terrain, 'caveterrain');
		assert(battle.field.terrainState.permanent);
		assert(!battle.field.terrainStack.some(s => s.id.includes('eclipse')));
	});
	it('purified volcanic field retains its normal Cave transitions', () => {
		setup(['purify', 'surf']); field('infernaleclipseterrain');
		battle.makeChoices('move purify', 'move splash');
		battle.makeChoices('move surf', 'move splash');
		battle.makeChoices('move surf', 'move splash');
		assert.equal(battle.field.terrain, 'caveterrain');
		assert(battle.field.terrainState.permanent);
	});
	it('cancels Rift Eclipse back to its underlying field', () => {
		setup(['purify']); field('caveterrain'); field('rifteclipseterrain');
		battle.makeChoices('move purify', 'move splash');
		assert.equal(battle.field.terrain, 'caveterrain');
	});
	it('pauses existing rooms and gravity, then resumes their countdown', () => {
		const [p] = setup(['celebrate'], ['celebrate']);
		for (const id of ['trickroom', 'magicroom', 'wonderroom', 'gravity']) battle.field.addPseudoWeather(id, p);
		const before = Object.fromEntries(['trickroom', 'magicroom', 'wonderroom', 'gravity'].map(k => [k, battle.field.pseudoWeather[k].duration]));
		field('coldeclipseterrain');
		battle.makeChoices('move celebrate', 'move celebrate');
		for (const id of Object.keys(before)) assert.equal(battle.field.pseudoWeather[id].duration, before[id]);
		battle.field.changeTerrain('rifteclipseterrain', p);
		battle.makeChoices('move celebrate', 'move celebrate');
		for (const id of Object.keys(before)) assert.equal(battle.field.pseudoWeather[id].duration, before[id] - 1);
	});
	it('blocks new rooms in Cold Eclipse and extends new rooms in Rift Eclipse', () => {
		const [p] = setup(); field('coldeclipseterrain');
		assert.equal(battle.field.addPseudoWeather('trickroom', p), false);
		battle.field.changeTerrain('rifteclipseterrain', p);
		assert(battle.field.addPseudoWeather('trickroom', p));
		assert.equal(battle.field.pseudoWeather.trickroom.duration, 8);
	});
	for (const weather of ['raindance', 'sandstorm', 'sunnyday']) {
		it(`Cold Eclipse leaves ${weather} intact`, () => {
			const [p] = setup(); field('coldeclipseterrain'); battle.field.setWeather(weather, p);
			battle.makeChoices('move splash', 'move splash');
			battle.makeChoices('move splash', 'move splash');
			assert.equal(battle.field.terrain, 'coldeclipseterrain');
			assert.equal(battle.field.weather, weather);
		});
	}
	it('Snowscape creates five-turn Snowy Field without an Aura or hail, and rain becomes hail there', () => {
		const [p] = setup(['snowscape', 'splash']);
		battle.makeChoices('move snowscape', 'move splash');
		assert.equal(battle.field.terrain, 'snowyterrain'); assert.equal(battle.field.terrainState.duration, 4);
		assert.equal(battle.field.auraField, ''); assert.equal(battle.field.weather, '');
		battle.field.setWeather('raindance', p);
		battle.makeChoices('move splash', 'move splash'); assert.equal(battle.field.weather, 'hail');
	});
	it('Frozen Aura cannot promote through Gravity, hail or attacks without its seed holder', () => {
		const [p] = setup(['blizzard', 'gravity', 'celebrate'], ['celebrate']);
		battle.field.setAura('frozenaura', 8, p, battle.dex.abilities.get('badseeds'));
		battle.field.setWeather('hail', p);
		battle.makeChoices('move gravity', 'move celebrate');
		battle.makeChoices('move blizzard', 'move celebrate');
		battle.makeChoices('move blizzard', 'move celebrate');
		assert.equal(battle.field.terrain, ''); assert.equal(battle.field.auraTurns, 5);
	});
	it('Cold Eclipse seed gives +2 Speed and Torment without changing typing', () => {
		const [p] = setup(['splash'], ['splash'], {item: 'elementalseed'});
		field('coldeclipseterrain');
		assert.equal(p.item, ''); assert.equal(p.boosts.spe, 2); assert(p.volatiles.torment);
		assert.deepEqual(p.getTypes(), ['Psychic']);
	});
	it('Bad Seeds prevents purification and thawing while permitting expiry', () => {
		const [p] = setup(['purify', 'heatwave', 'splash']); field('coldeclipseterrain', 3);
		p.setAbility('badseeds');
		battle.makeChoices('move purify', 'move splash'); assert.equal(battle.field.terrain, 'coldeclipseterrain');
		battle.makeChoices('move heatwave', 'move splash'); assert.equal(battle.field.terrain, 'coldeclipseterrain');
		battle.makeChoices('move splash', 'move splash'); assert.equal(battle.field.terrain, '');
	});
	it('Infernal Eclipse supports the existing Light of Ruin starlight escape', () => {
		setup(['lightofruin']); field('infernaleclipseterrain');
		battle.makeChoices('move lightofruin', 'move splash');
		assert.equal(battle.field.terrain, 'starlightarenaterrain'); assert(battle.field.terrainState.permanent);
	});
	for (const [types, multiplier] of [[['Ice'], 1.2], [['Ghost'], 1.2], [['Ice', 'Ghost'], 1.44], [['Fire'], 0.8], [['Ghost', 'Fire'], 0.96], [['Dragon'], 1], [['Steel'], 1]]) {
		it(`Cold Eclipse defense depends only on ${types.join('/')} typing`, () => {
			const [p] = setup(); p.setType(types); const def = p.getStat('def'), spd = p.getStat('spd');
			field('coldeclipseterrain');
			assert(Math.abs(p.getStat('def') - def * multiplier) <= 1);
			assert(Math.abs(p.getStat('spd') - spd * multiplier) <= 1);
		});
	}
	for (const ability of ['fullmetalbody', 'turboblaze', 'thickfat']) {
		it(`${ability} no longer grants additional Cold Eclipse defenses`, () => {
			const [p] = setup(['splash'], ['splash'], {ability}); const def = p.getStat('def'), spd = p.getStat('spd');
			field('coldeclipseterrain'); assert.equal(p.getStat('def'), def); assert.equal(p.getStat('spd'), spd);
		});
	}
	it('retains Ice subtyping and the Dragon resistance while removing the wind multiplier', () => {
		const [p, target] = setup(); field('coldeclipseterrain'); target.setType('Dragon');
		const move = battle.dex.getActiveMove('earthquake');
		battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, move, p, target);
		assert.deepEqual(move.types, ['Ground', 'Ice']);
		assert.equal(battle.field.getTerrain().onEffectiveness.call(battle, 1, target, 'Dragon', battle.dex.getActiveMove('icebeam')), -1);
		const wind = battle.dex.getActiveMove('gust');
		assert.equal(battle.runEvent('BasePower', p, target, wind, 100), 100);
	});
	it('Snowy Field changes listed attacks to pure Ice and supports its seed and Veil', () => {
		const [p, target] = setup(['auroraveil'], ['splash'], {item: 'elementalseed'}); field('snowyterrain');
		assert.equal(p.boosts.spd, 1); assert(p.side.sideConditions.safeguard); assert(p.side.slotConditions[0].wish);
		const move = battle.dex.getActiveMove('ironhead');
		battle.singleEvent('ModifyMove', battle.field.getTerrain(), battle.field.terrainState, move, p, target);
		assert.equal(move.type, 'Ice'); assert.deepEqual(move.types, ['Ice']);
		battle.makeChoices('move auroraveil', 'move splash'); assert(p.side.sideConditions.auroraveil);
	});
	it('Grassy Field transforms after two Powder Snows', () => {
		setup(['powdersnow']); field('grassyterrain');
		battle.makeChoices('move powdersnow', 'move splash'); assert.equal(battle.field.terrain, 'grassyterrain');
		battle.makeChoices('move powdersnow', 'move splash'); assert.equal(battle.field.terrain, 'snowyterrain');
	});
	it('Infernal Hex doubles only once and its seed applies the four-turn trap', () => {
		const [p, target] = setup(['splash'], ['splash'], {item: 'elementalseed'}); field('infernaleclipseterrain');
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1); assert.equal(p.volatiles.partiallytrapped.duration, 4);
		const hex = battle.dex.getActiveMove('hex');
		assert.equal(hex.basePowerCallback.call(battle, p, target, hex), 130);
		target.setStatus('brn'); assert.equal(hex.basePowerCallback.call(battle, p, target, hex), 130);
	});
	it('Rift Magical Seed grants Defense and eight-turn Trick Room', () => {
		const [p] = setup(['splash'], ['splash'], {item: 'magicalseed'}); field('rifteclipseterrain');
		assert.equal(p.boosts.def, 1); assert.equal(p.item, ''); assert.equal(battle.field.pseudoWeather.trickroom.duration, 8);
	});
});
