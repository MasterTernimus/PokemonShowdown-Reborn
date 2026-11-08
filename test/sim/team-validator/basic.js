'use strict';

const assert = require('../../assert');
const Teams = require('../../../dist/sim/teams').Teams;
const common = require('../../common');
const { Format } = require('../../../dist/sim/dex-formats');
// Individual migration fixtures explicitly unban reviewed modern ability IDs;
// their slot legality, move sources and IV rules remain enforced.
function validationFormat(gen, options = {}) {
	return new Format({ name: 'Validator regression Gen ' + gen, effectType: 'Format', mod: 'gen' + gen,
		ruleset: options.unrestricted ? ['-Nonexistent'] : ['Obtainable'],
		customRules: options.customRules || [], banlist: options.banlist || [] });
}

describe('Team Validator', function () {
	it('should have valid formats to work with', function () {
		Dex.includeFormats();
		for (const format in Dex.formatsCache) {
			try {
				Dex.formats.getRuleTable(Dex.formats.get(format));
			} catch (e) {
				e.message = `${format}: ${e.message}`;
				throw e;
			}
		}
	});
	common.itGen(7, 'should reject non-existent Pokemon', () => {
		const team = [
			{species: 'nonexistentPokemon', moves: ['thunderbolt'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(7, 'should reject non-existent items', () => {
		const team = [
			{species: 'pikachu', moves: ['thunderbolt'], ability: 'static', item: 'nonexistentItem', evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(7, 'should reject non-existent abilities', () => {
		const team = [
			{species: 'pikachu', moves: ['thunderbolt'], ability: 'nonexistentAbility', evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(7, 'should reject non-existent moves', () => {
		const team = [
			{species: 'pikachu', ability: 'static', moves: ['nonexistentMove'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(2, 'should validate Gen 2 IVs', () => {
		let team = Teams.unpack('|raikou|||hiddenpowerwater||||14,28,26,,,|||');
		assert.legalTeam(team, 'gen2ou');

		team = Teams.unpack('|raikou|||hiddenpowerfire||||14,28,26,,,|||');
		assert.false.legalTeam(team, 'gen2ou');

		team = Teams.unpack('|raikou|||hiddenpowerwater||||16,28,26,,,|||');
		assert.false.legalTeam(team, 'gen2ou');

		team = Teams.unpack('|raikou|||thunderbolt||||,,,28,30,|||');
		assert.false.legalTeam(team, 'gen2ou');
	});

	common.itGen(2, 'should validate Gen 2 EVs', () => {
		let team = Teams.unpack('|gengar|||thunderbolt||,,,200,200,|||||');
		assert.legalTeam(team, 'gen2ou');

		team = Teams.unpack('|gengar|||thunderbolt||,,,248,252,|||||');
		assert.false.legalTeam(team, 'gen2ou');
	});

	common.itGen(7, 'keeps Hidden Power unavailable on ordinary Gen 7 species', () => {
		let team = [
			{species: 'yveltal', ability: 'darkaura', moves: ['hiddenpowerfighting'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));

		team = [
			{species: 'latiasmega', ability: 'levitate', item: 'latiasite', moves: ['hiddenpowerfighting'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));
	});

	common.itGen(8, `should enforce the 3 perfect IV minimum on legendaries with Gen 6+ origin`, () => {
		const team = [
			{species: 'xerneas', ability: 'fairyaura', moves: ['snore'], ivs: {hp: 0, atk: 0, def: 0, spa: 0}, evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(8));

		assert.legalTeam(team, validationFormat(8, { "unrestricted": true }));
	});

	common.itGen(7, 'should reject non-existent natures', () => {
		const team = [
			{species: 'pikachu', ability: 'static', moves: ['thunderbolt'], nature: 'nonexistentNature', evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(7, 'should reject invalid happiness values', () => {
		const team = [
			{species: 'pikachu', ability: 'static', moves: ['thunderbolt'], happiness: 'invalidHappinessValue', evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "unrestricted": true }));
	});

	common.itGen(8, 'should validate EVs', () => {
		const team = [
			{species: 'pikachu', ability: 'static', moves: ['thunderbolt'], evs: {hp: 252, atk: 252, def: 252}},
		];
		assert.false.legalTeam(team, validationFormat(8));
	});

	common.itGen(7, 'should accept legal movesets', () => {
		let team = [
			{species: 'pikachu', ability: 'static', moves: ['agility', 'protect', 'thunder', 'thunderbolt'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));

		team = [
			{species: 'meowstic', ability: 'prankster', moves: ['trick', 'magiccoat'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));
	});

	common.itGen(7, 'should reject illegal movesets', () => {
		const team = [
			{species: 'pikachu', ability: 'static', moves: ['blastburn', 'frenzyplant', 'hydrocannon', 'dragonascent'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));
	});

	common.itGen(7, 'should reject banned Pokemon', () => {
		let team = [
			{species: 'arceus', ability: 'multitype', item: 'dragoniumz', moves: ['judgment'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "banlist": ["Arceus"] }));

		team = [
			{species: 'rayquazamega', ability: 'deltastream', moves: ['dragonascent'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { banlist: ['Rayquaza-Mega'] }));

		team = [
			{species: 'mimikyutotem', ability: 'disguise', moves: ['shadowsneak'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7, { "customRules": ["-mimikyu"] }));

		// bans should override past unbans
		team = [
			{species: 'torkoal', ability: 'drought', moves: ['bodyslam'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7, { "customRules": ["-drought", "+drought"] }));
		assert.false.legalTeam(team, validationFormat(7, { "customRules": ["-drought", "+drought", "-drought"] }));
	});

	common.itGen(4, 'should validate Sketch', () => {
		// Spore is a Gen 5 event move
		// Sketch itself should still be valid
		const team = [
			{species: 'smeargle', ability: 'owntempo', moves: ['bellydrum', 'spore', 'sketch'], evs: {hp: 1}},
		];
		assert.legalTeam(team, 'gen4ou');
	});

	common.itGen(7, 'should accept both ability types for Mega Evolutions', () => {
		// base forme ability
		let team = [
			{species: 'gyaradosmega', item: 'gyaradosite', ability: 'intimidate', moves: ['dragondance', 'crunch', 'waterfall', 'icefang'], evs: {hp: 1}},
			{species: 'kyogreprimal', item: 'blueorb', ability: 'drizzle', moves: ['originpulse'], evs: {hp: 1}},
			{species: 'rayquazamega', item: 'leftovers', ability: 'airlock', moves: ['dragonascent'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7, { customRules: ['+Unleashed Ego'] }));

		// mega forme ability
		team = [
			{ species: 'gyaradosmega', item: 'gyaradosite', ability: 'unleashedego', moves: ['dragondance', 'crunch', 'waterfall', 'icefang'], evs: { hp: 1 } },
			{species: 'kyogreprimal', item: 'blueorb', ability: 'primordialsea', moves: ['originpulse'], evs: {hp: 1}},
			{species: 'rayquazamega', item: 'leftovers', ability: 'deltastream', moves: ['dragonascent'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7, { customRules: ['+Unleashed Ego'] }));
	});

	common.itGen(1, 'should reject newer Pokemon in older gens', () => {
		const team = [
			{species: 'pichu', ability: 'static', moves: ['thunderbolt']},
		];
		assert.false.legalTeam(team, 'gen1ou');
	});

	common.itGen(8, 'should reject exclusive G-Max moves added directly to a Pokemon\'s moveset', () => {
		const team = [
			{species: 'charizard', ability: 'blaze', moves: ['gmaxwildfire'], evs: {hp: 1}, gigantamax: true},
		];
		assert.false.legalTeam(team, validationFormat(8));
		assert.false.legalTeam(team, validationFormat(8, { unrestricted: true }));
	});

	common.itGen(8, 'should reject Gmax Pokemon from formats with Dynamax Clause', () => {
		const team = [
			{species: 'gengar-gmax', ability: 'cursedbody', moves: ['shadowball'], evs: {hp: 1}},
			{species: 'gengar', ability: 'cursedbody', moves: ['shadowball'], evs: {hp: 1}, gigantamax: true},
		];
		assert.false.legalTeam(team, validationFormat(8, { "unrestricted": true, "customRules": ["dynamaxclause"] }));
	});

	common.itGen(8, `should not allow duplicate moves on the same set, except in hackmons`, () => {
		const team = [
			{species: 'corsola', ability: 'hustle', moves: ['snore', 'snore'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(8));

		assert.legalTeam(team, validationFormat(8, { "unrestricted": true }));
	});

	// Checking these transfers dereferences the omitted Gen 2 source dex.
	common.itGen(2, 'should accept VC moves only with Hidden ability and correct IVs', () => {
		let team = [
			{ species: 'machamp', ability: 'perfectform', moves: ['fissure'], evs: { hp: 1 } },
		];
		assert.legalTeam(team, validationFormat(7, { customRules: ['+Perfect Form', '+Brute Force', '+Bull Rush', '+Fourthhold Guard'] }));
		team = [
			{ species: 'tauros', ability: 'bruteforce', moves: ['bodyslam'], evs: { hp: 1 } },
		];
		assert.legalTeam(team, validationFormat(7, { customRules: ['+Perfect Form', '+Brute Force', '+Bull Rush', '+Fourthhold Guard'] }));
		team = [
			{ species: 'tauros', ability: 'bullrush', ivs: { hp: 31, atk: 31, def: 30, spa: 30, spd: 30, spe: 30 }, moves: ['bodyslam'], evs: { hp: 1 } },
			{ species: 'suicune', ability: 'waterveil', moves: ['scald'], evs: { hp: 1 } },
		];
		assert.legalTeam(team, validationFormat(7, { customRules: ['+Perfect Form', '+Brute Force', '+Bull Rush', '+Fourthhold Guard'] }));

		team = [
			{ species: 'machamp', ability: 'fourthholdguard', moves: ['fissure'], evs: { hp: 1 } },
		];
		assert.false.legalTeam(team, validationFormat(7, { customRules: ['+Perfect Form', '+Brute Force', '+Bull Rush', '+Fourthhold Guard'] }));
		team = [
			{ species: 'tauros', ability: 'bruteforce', ivs: { hp: 31, atk: 31, def: 30, spa: 30, spd: 30, spe: 30 }, moves: ['bodyslam'], evs: { hp: 1 } },
		];
		assert.false.legalTeam(team, validationFormat(7, { customRules: ['+Perfect Form', '+Brute Force', '+Bull Rush', '+Fourthhold Guard'] }));

		team = [
			{species: 'koffing', ability: 'levitate', moves: ['zapcannon'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(8));

		team = [
			{ species: 'weezing-galar', ability: 'neutralizinggas', moves: ['zapcannon'], evs: { hp: 1 } },
		];
		assert.legalTeam(team, validationFormat(8));
	});
});
