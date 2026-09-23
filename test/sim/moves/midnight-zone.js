'use strict';
const assert = require('../../assert');
const common = require('../../common');
let battle;
function start(ability = 'noability', species = 'Mew', foeAbility = 'noability', item = '', moves = ['splash', 'dive', 'darkpulse', 'flash']) {
	battle = common.createBattle({formatid: 'gen9midnightzone'}, [[
		{species, ability, item, moves},
	], [{species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle', 'thunder', 'fissure']}]]);
	battle.makeChoices('team 1', 'team 1');
	return battle.p1.active[0];
}
describe('Midnight Zone', () => {
	for (const id of ['psychic', 'aurasphere', 'dragonpulse', 'sludgebomb', 'energyball', 'hypervoice', 'airslash', 'bugbuzz', 'ancientpower']) {
		it(`does not apply the physical pressure penalty to ${id}`, () => {
			const p = start();
			const foe = battle.p2.active[0];
			const move = battle.dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, foe, move, move);
			assert.equal(move.category, 'Special');
			assert.equal(battle.runEvent('BasePower', p, foe, move, 100, true), 100);
		});
	}
	for (const [type, ability, exempt] of [['Water', 'noability', true], ['Psychic', 'noability', false], ['Psychic', 'swiftswim', true], ['Psychic', 'schooling', true], ['Psychic', 'steelworker', true]]) {
		it(`checks attacker type and ability for physical damage: ${type}/${ability}`, () => {
			const p = start(ability); p.setType(type);
			for (const [id, boost] of [['tackle', 1], ['waterfall', 1.5]]) {
				const move = battle.dex.getActiveMove(id);
				assert.equal(battle.runEvent('BasePower', p, battle.p2.active[0], move, 100, true), battle.modify(100, boost * (exempt ? 1 : 0.33)));
			}
		});
	}
	it('halves Doom Desire power', () => {
		const p = start();
		assert.equal(battle.runEvent('BasePower', p, battle.p2.active[0], battle.dex.getActiveMove('doomdesire'), 100, true), 50);
	});
	afterEach(() => battle?.destroy());
	it('starts with the correct field and blocks weather and generated fields', () => {
		const p = start();
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
		assert.equal(battle.field.setWeather('raindance', p), false);
		assert.equal(battle.field.setTerrain('grassyterrain', p), false);
		assert.equal(battle.field.changeTerrain('grassyterrain', p), false);
		assert.equal(battle.field.clearTerrain(), false);
		assert(battle.log.some(l => l.includes('The water pressure is crushing...')));
	});
	for (const [type, fraction] of [['Normal', 0.1], ['Steel', 0.25], ['Ice', 0.25], ['Fire', 0.25], ['Rock', 0.25]]) {
		it(`deals fixed ${fraction * 100}% pressure damage to ${type}`, () => {
			const p = start(); p.setType(type);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.maxhp - p.hp, Math.floor(p.baseMaxhp * fraction));
		});
	}
	for (const ability of ['waterveil', 'dryskin', 'stormdrain', 'steelworker', 'schooling', 'seviischooling', 'magicguard']) {
		it(`${ability} prevents pressure damage`, () => {
			const p = start(ability);
			battle.makeChoices('move splash', 'move splash');
			assert.equal(p.hp, p.maxhp);
		});
	}
	it('Ghost types avoid pressure damage without receiving Water healing', () => {
		const p = start(); p.setType(['Ghost', 'Steel']); p.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 100);
	});
	it('Sevii Schooling counts as Schooling without granting school-only components to solo forms', () => {
		const p = start('seviischooling');
		assert(p.hasAbility('schooling'));
		assert(p.hasAbility(['schooling', 'hydrabond']));
		assert(!p.hasAbility('hydrabond'));
		const move = battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('BasePower', p, battle.p2.active[0], move, 100, true), 100);
	});
	it('Water heals 1/16 and Dry Skin adds 1/10 exactly once', () => {
		const p = start('dryskin'); p.setType('Water'); p.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp / 16) + Math.floor(p.baseMaxhp / 10));
	});
	it('Water Absorb heals but does not prevent pressure', () => {
		const p = start('waterabsorb'); p.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 100);
		assert(battle.log.some(l => l.includes('The water pressure hurt')));
		assert(battle.log.some(l => l.includes('The intense water pressure healed')));
	});
	for (const [ability, modifier] of [['noability', 0.25], ['schooling', 1], ['seviischooling', 1], ['steelworker', 1], ['swiftswim', 2], ['propellertail', 0.5]]) {
		it(`${ability} has the correct speed multiplier`, () => {
			const p = start(ability);
			assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 100 * modifier);
		});
	}
	it('converts Ground and Dragon Darts to Water, and applies stacked boosts', () => {
		const p = start(); const foe = battle.p2.active[0];
		for (const [id, type, multiplier] of [['earthpower', 'Water', 1.8], ['dragondarts', 'Water', 0.99], ['waterpulse', 'Water', 2.25], ['thunderbolt', 'Electric', 1.2], ['tackle', 'Normal', 0.33]]) {
			const move = battle.dex.getActiveMove(id);
			battle.runEvent('ModifyMove', p, foe, move, move);
			assert.equal(move.type, type);
			assert.equal(battle.runEvent('BasePower', p, foe, move, 100, true), battle.modify(100, multiplier), id);
		}
	});
	it('keeps special Dark STAB type but uses Water effectiveness', () => {
		const p = start(); const foe = battle.p2.active[0]; foe.setType('Fire');
		const move = battle.dex.getActiveMove('darkpulse');
		battle.runEvent('ModifyMove', p, foe, move, move);
		assert.equal(move.type, 'Dark');
		assert.equal(foe.runEffectiveness(move), 1);
	});
	it('Serene Grace doubles the darkness secondary chance and Contrary reverses it', () => {
		const p = start('serenegrace', 'Mew', 'contrary'); const foe = battle.p2.active[0];
		const move = battle.dex.getActiveMove('darkpulse');
		battle.runEvent('ModifyMove', p, foe, move, move);
		const secondary = move.secondaries.find(s => s.onHit);
		assert.equal(secondary.chance, 60);
		secondary.onHit.call(battle, foe, p);
		assert.equal(foe.boosts.spa, 1);
	});
	it('Dive attacks immediately without surfacing', () => {
		start(); battle.makeChoices('move dive', 'move splash');
		assert(!battle.p1.active[0].volatiles.twoturnmove);
		assert(battle.log.some(l => l.startsWith('|-damage|p2a:')));
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
	});
	it('Flash surfaces to Underwater and Dark Pulse returns to Midnight Zone', () => {
		start(); battle.makeChoices('move flash', 'move splash');
		assert.equal(battle.field.terrain, 'underwaterterrain');
		battle.makeChoices('move darkpulse', 'move splash');
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
	});
	it('Pressure costs three PP total', () => {
		start('pressure'); const foe = battle.p2.active[0];
		const pp = foe.moveSlots[1].pp;
		battle.makeChoices('move splash', 'move tackle');
		assert.equal(pp - foe.moveSlots[1].pp, 3);
	});
	it('Elemental Seed grants SpA and Aqua Ring with doubled healing', () => {
		const p = start('magicguard', 'Mew', 'noability', 'elementalseed');
		assert.equal(p.item, ''); assert.equal(p.boosts.spa, 1); assert(p.volatiles.aquaring);
		p.hp = 100;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp / 8));
	});
	for (const ability of ['watercompaction', 'steamengine']) {
		it(`${ability} turns its holder Water on entry`, () => {
			assert.deepEqual(start(ability).getTypes(), ['Water']);
		});
	}
	for (const move of ['flamethrower', 'sunnyday', 'raindance', 'sandstorm', 'hail', 'snowscape', 'defog', 'spikes', 'stealthrock', 'stickyweb', 'tarshot', 'toxicspikes', 'stoneaxe', 'ceaselessedge']) {
		it(`${move} fails`, () => {
			const p = start('magicguard', 'Mew', 'magicguard', '', [move]);
			const foe = battle.p2.active[0];
			battle.makeChoices('move 1', 'move splash');
			assert.equal(foe.hp, foe.maxhp);
			assert.equal(battle.field.weather, '');
			assert.equal(battle.field.terrain, 'midnightzoneterrain');
			assert.equal(Object.keys(foe.side.sideConditions).length, 0);
			assert.equal(Object.keys(p.side.sideConditions).length, 0);
			assert(battle.log.some(l => /doused instantly|too deep|But it failed|sank into the trenches/.test(l)));
		});
	}
	for (const move of ['dazzlinggleam', 'lightthatburnsthesky', 'bounce', 'fly']) {
		it(`${move} rises to Underwater`, () => {
			start('magicguard', 'Mew', 'magicguard', '', [move]);
			battle.makeChoices('move 1', 'move splash');
			assert.equal(battle.field.terrain, 'underwaterterrain');
		});
	}
	for (const move of ['darkvoid', 'gravity', 'blackholeeclipse', 'nightdaze']) {
		it(`${move} descends from Underwater`, () => {
			const p = start('magicguard', 'Mew', 'magicguard', '', [move]);
			battle.field.changeTerrain('underwaterterrain', p);
			battle.makeChoices('move 1', 'move splash');
			assert.equal(battle.field.terrain, 'midnightzoneterrain');
		});
	}
	it('Pressure descends on entry, and Gravity from Water Surface only descends one level', () => {
		const p = start('noability', 'Mew', 'noability', '', ['gravity']);
		battle.field.changeTerrain('underwaterterrain', p);
		battle.field.changeTerrain('watersurfaceterrain', p);
		battle.makeChoices('move gravity', 'move splash');
		assert.equal(battle.field.terrain, 'underwaterterrain');
		p.setAbility('pressure');
		assert.equal(battle.field.terrain, 'midnightzoneterrain');
	});
	it('Illuminate guarantees OHKO accuracy', () => {
		start('noability', 'Mew', 'illuminate');
		const attacker = battle.p2.active[0];
		const move = battle.dex.getActiveMove('fissure');
		battle.randomChance = () => { throw new Error('Illuminate must bypass the accuracy roll'); };
		assert.deepEqual(battle.actions.hitStepAccuracy([battle.p1.active[0]], attacker, move), [true]);
	});
	it('Hydration cures status, Schooling is forced, and Palafin transforms', () => {
		const p = start('hydration'); p.setStatus('par');
		battle.makeChoices('move splash', 'move splash');
		assert.equal(p.status, '');
		battle.destroy();
		const fish = start('schooling', 'Wishiwashi'); fish.hp = 1;
		battle.makeChoices('move splash', 'move splash');
		assert.equal(fish.species.id, 'wishiwashischool');
		battle.destroy();
		assert.equal(start('zerotohero', 'Palafin').species.id, 'palafinhero');
	});
	it('Mimicry and Camouflage become Water, and Nature Power calls Anchor Shot', () => {
		assert.deepEqual(start('mimicry').getTypes(), ['Water']);
		battle.destroy();
		const p = start('magicguard', 'Mew', 'magicguard', '', ['camouflage', 'naturepower']);
		battle.makeChoices('move camouflage', 'move splash');
		assert.deepEqual(p.getTypes(), ['Water']);
		battle.makeChoices('move naturepower', 'move splash');
		assert(battle.log.some(l => l.includes('|Anchor Shot|')));
	});
	it('Whirlpool traps for 1/6 HP and Secret Power uses Dark Void animation', () => {
		const p = start('magicguard', 'Mew', 'noability', '', ['whirlpool', 'secretpower']);
		battle.makeChoices('move whirlpool', 'move splash');
		assert.equal(battle.p2.active[0].volatiles.partiallytrapped.boundDivisor, 6);
		battle.makeChoices('move secretpower', 'move splash');
		assert(battle.log.some(l => l.includes('[anim]Dark Void')));
	});
	it('Fortress Shell absorbs Electric attacks and raises both attacking stats', () => {
		const p = start('fortressshell');
		battle.makeChoices('move splash', 'move thunder');
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1);
		assert(!battle.log.some(l => l.startsWith('|-damage|p1a:') && l.includes('[from] move')));
	});
	it('Torrent boosts Water attacks even at full HP without boosting other types', () => {
		const p = start('torrent'); const foe = battle.p2.active[0];
		const water = battle.dex.getActiveMove('surf'); const normal = battle.dex.getActiveMove('swift');
		assert.equal(battle.runEvent('ModifySpA', p, foe, water, 100), 150);
		assert.equal(battle.runEvent('ModifySpA', p, foe, normal, 100), 100);
	});
	it('removes existing weather on entry', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Mew', ability: 'noability', moves: ['splash']},
		], [{species: 'Mew', ability: 'noability', moves: ['splash']}]]);
		battle.makeChoices('team 1', 'team 1');
		const p = battle.p1.active[0];
		battle.field.setWeather('raindance', p);
		assert.equal(battle.field.weather, 'raindance');
		battle.field.changeTerrain('midnightzoneterrain', p);
		assert.equal(battle.field.weather, '');
	});
	it('Fortress Shell redirects an Electric attack aimed at its partner', () => {
		battle = common.createBattle({formatid: 'gen9doublesmidnightzone'}, [[
			{species: 'Mew', ability: 'fortressshell', moves: ['splash']},
			{species: 'Mew', ability: 'magicguard', moves: ['splash']},
		], [
			{species: 'Mew', ability: 'noability', moves: ['thunderbolt']},
			{species: 'Mew', ability: 'noability', moves: ['splash']},
		]]);
		battle.makeChoices('team 12', 'team 12');
		battle.makeChoices('move splash, move splash', 'move thunderbolt 2, move splash');
		assert.equal(battle.p1.active[0].boosts.spa, 1);
		assert.equal(battle.p1.active[1].hp, battle.p1.active[1].maxhp);
	});
});
