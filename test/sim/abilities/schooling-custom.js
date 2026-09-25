'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

let battle;

describe('Schooling custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the requested data, stats, and moves', () => {
		assert.deepEqual(Dex.species.get('Wishiwashi-School').baseStats, {
			hp: 80, atk: 135, def: 130, spa: 135, spd: 130, spe: 60,
		});
		assert.equal(Dex.species.get('Wishiwashi').baseStats.hp, 80);
		assert.deepEqual(Dex.species.get('Wishiwashi-Sevii').types, ['Ghost']);
		assert.deepEqual(Dex.species.get('Wishiwashi-Sevii').baseStats, Dex.species.get('Wishiwashi').baseStats);
		assert.deepEqual(Dex.species.get('Wishiwashi-Sevii-Schooling').types, ['Ghost', 'Dragon']);
		assert.deepEqual(Dex.species.get('Wishiwashi-Sevii-Schooling').baseStats, Dex.species.get('Wishiwashi-School').baseStats);
		assert.equal(Dex.species.get('Beartic').abilities['0'], 'Raging Beast');
		const learnset = Dex.species.getLearnsetData('wishiwashi').learnset;
		for (const move of [
			'acidarmor', 'amnesia', 'bulkup', 'bodypress', 'calmmind', 'flashcannon', 'haze', 'heavyslam',
			'icespinner', 'iciclecrash', 'psychic', 'skullbash', 'waterspout', 'wideguard', 'earthquake',
			'tripledive', 'wavecrash', 'dive', 'bounce', 'ironhead', 'icefang', 'psychicfangs', 'strength',
		]) {
			assert(learnset[move], `Wishiwashi should learn ${move}`);
		}
		for (const move of [
			'astonish', 'destinybond', 'dragondance', 'dracometeor', 'dragonbreath', 'dragonhammer',
			'dragonpulse', 'foulplay', 'hex', 'hiddenpower', 'mysticalfire', 'nastyplot', 'outrage',
			'phantomforce', 'poltergeist', 'shadowball', 'shadowsneak', 'taunt', 'thunder',
			'thunderbolt', 'trickroom', 'willowisp',
		]) {
			assert(learnset[move], `Wishiwashi should learn ${move}`);
		}
	});

	it('should retain normal HP-based form changes', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		assert.species(wishiwashi, 'Wishiwashi-School');
		wishiwashi.hp = Math.floor(wishiwashi.maxhp / 4);
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi');
		wishiwashi.hp = wishiwashi.maxhp;
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi-School');
	});

	it('should force School Form by water terrain and respect grounded status', () => {
		for (const terrain of ['underwaterterrain', 'watersurfaceterrain', 'murkwatersurfaceterrain']) {
			battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
				{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
			], [{ species: 'Mew', moves: ['splash'] }]]);
			battle.makeChoices('team 1', 'team 1');
			const wishiwashi = battle.p1.active[0];
			wishiwashi.hp = Math.floor(wishiwashi.maxhp / 4);
			battle.field.changeTerrain(terrain, wishiwashi);
			battle.makeChoices('move splash', 'move splash');
			assert.species(wishiwashi, 'Wishiwashi-School', terrain);
			battle.destroy();
		}

		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
		], [{ species: 'Mew', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const airborneWishiwashi = battle.p1.active[0];
		airborneWishiwashi.hp = Math.floor(airborneWishiwashi.maxhp / 4);
		battle.field.changeTerrain('watersurfaceterrain', airborneWishiwashi);
		airborneWishiwashi.addVolatile('magnetrise');
		battle.makeChoices('move splash', 'move splash');
		assert.species(airborneWishiwashi, 'Wishiwashi');
	});

	it('should apply Hydra Bond and Mold Breaker without inheriting unrelated abilities in School Form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['raindance', 'tackle', 'earthquake'] },
		], [
			{ species: 'Eelektross', ability: 'Levitate', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		const eelektross = battle.p2.active[0];
		battle.makeChoices('move raindance', 'move splash');
		assert(!wishiwashi.hasAbility('swiftswim'));
		assert(!wishiwashi.hasAbility('filter'), 'Schooling must not grant Filter');
		assert(wishiwashi.hasAbility('moldbreaker'));
		battle.makeChoices('move tackle', 'move splash');
		assert(battle.log.some(line => line.startsWith('|-hitcount|') && line.endsWith('|3')));
		const hpBeforeEarthquake = eelektross.hp;
		battle.makeChoices('move earthquake', 'move splash');
		assert(eelektross.hp < hpBeforeEarthquake, 'Mold Breaker should bypass Levitate for Earthquake');
	});

	it('should change Sevii Schooling into the Ghost/Dragon school and back to Ghost solo', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Sevii Schooling', moves: ['earthquake', 'splash'] },
		], [{ species: 'Eelektross', ability: 'Levitate', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		const target = battle.p2.active[0];
		assert.species(wishiwashi, 'Wishiwashi-Sevii-Schooling');
		assert.deepEqual(wishiwashi.getTypes(), ['Ghost', 'Dragon']);
		assert(wishiwashi.hasAbility('moldbreaker'));
		assert(!wishiwashi.hasAbility('filter'), 'Sevii Schooling must not grant Filter');
		const hpBefore = target.hp;
		battle.makeChoices('move earthquake', 'move splash');
		assert(target.hp < hpBefore, 'Sevii Schooling should bypass Levitate');
		wishiwashi.hp = Math.floor(wishiwashi.maxhp / 4);
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi-Sevii');
		assert.deepEqual(wishiwashi.getTypes(), ['Ghost']);
		assert(!wishiwashi.hasAbility('moldbreaker'));
		wishiwashi.hp = wishiwashi.maxhp;
		battle.makeChoices('move splash', 'move splash');
		assert.species(wishiwashi, 'Wishiwashi-Sevii-Schooling');
	});

	it('should let Sevii Schooling Dive through Dry Skin in Murkwater', () => {
		battle = common.createBattle({ formatid: 'gen9doubleswatersurface' }, [[
			{ species: 'Wishiwashi', ability: 'Sevii Schooling', moves: ['dive'] },
			{ species: 'Magikarp', moves: ['splash'] },
		], [
			{ species: 'Toxicroak-Deso', ability: 'Dry Skin', moves: ['splash'] },
			{ species: 'Magikarp', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		const wishiwashi = battle.p1.active[0];
		const toxicroak = battle.p2.active[0];
		assert.equal(toxicroak.ability, 'dryskin');
		battle.field.changeTerrain('murkwatersurfaceterrain', wishiwashi);
		assert.species(wishiwashi, 'Wishiwashi-Sevii-Schooling');
		battle.makeChoices('move dive +1, move splash', 'move splash, move splash');
		const hpBefore = toxicroak.hp;
		battle.makeChoices('move dive +1, move splash', 'move splash, move splash');
		assert(toxicroak.hp < hpBefore, 'Sevii Schooling Mold Breaker should bypass Dry Skin');
		assert(!battle.log.some(line => line.includes('absorbed some of the water')), 'Dry Skin should not absorb Dive');
	});

	it('should let Ability Shield preserve Dry Skin against Sevii Schooling', () => {
		battle = common.createBattle({ formatid: 'gen9doubleswatersurface' }, [[
			{ species: 'Wishiwashi', ability: 'Sevii Schooling', moves: ['dive'] },
			{ species: 'Magikarp', moves: ['splash'] },
		], [
			{ species: 'Toxicroak-Deso', ability: 'Dry Skin', item: 'Ability Shield', moves: ['splash'] },
			{ species: 'Magikarp', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		const wishiwashi = battle.p1.active[0];
		battle.field.changeTerrain('murkwatersurfaceterrain', wishiwashi);
		battle.makeChoices('move dive +1, move splash', 'move splash, move splash');
		battle.makeChoices('move dive +1, move splash', 'move splash, move splash');
		assert(battle.log.some(line => line.includes('absorbed some of the water')));
	});

	it('should apply Self Repair while in School Form', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Wishiwashi', ability: 'Schooling', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		const wishiwashi = battle.p1.active[0];
		wishiwashi.hp -= 100;
		const damagedHP = wishiwashi.hp;
		battle.makeChoices('move splash', 'move splash');
		assert(wishiwashi.hp > damagedHP, 'Self Repair should restore HP at the end of the turn');
	});
});
