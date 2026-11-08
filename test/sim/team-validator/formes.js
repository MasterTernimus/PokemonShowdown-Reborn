'use strict';

const assert = require('../../assert');
const common = require('../../common');
const { Format } = require('../../../dist/sim/dex-formats');
// Keep event and forme legality independent of unavailable upstream ladders.
function validationFormat(gen) {
	return new Format({ name: 'Event/forme validation Gen ' + gen, effectType: 'Format', mod: 'gen' + gen, ruleset: ['Obtainable'] });
}

let team;

describe('Team Validator', function () {
	it("should validate Necrozma formes correctly", function () {
		team = [
			{species: 'necrozmadawnwings', ability: 'prismarmor', shiny: true, moves: ['moongeistbeam', 'metalclaw'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));
	});

	it('should reject Ultra Necrozma where ambiguous', function () {
		team = [
			{species: 'necrozmaultra', ability: 'neuroforce', moves: ['confusion'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));
	});

	common.itGen(3, 'should handle Deoxys formes in Gen 3', () => {
		team = [
			{species: 'deoxys', ability: 'pressure', moves: ['wrap'], evs: {hp: 1}},
			{species: 'deoxys', ability: 'pressure', moves: ['wrap'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, 'gen3ubers');
		assert.legalTeam(team, 'gen3ubers@@@!speciesclause');

		team = [
			{species: 'deoxysattack', ability: 'pressure', moves: ['wrap'], evs: {hp: 1}},
			{species: 'deoxysdefense', ability: 'pressure', moves: ['wrap'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, 'gen3ubers@@@!speciesclause');
		assert.legalTeam(team, 'gen3ubers@@@!speciesclause,+nonexistent');
	});

	it('should correctly validate USUM Rockruff', function () {
		team = [
			{species: 'rockruff', ability: 'owntempo', moves: ['happyhour'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));
		team = [
			{species: 'rockruff', level: 9, ability: 'owntempo', moves: ['happyhour'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));
		team = [
			{species: 'rockruff', level: 9, ability: 'owntempo', moves: ['tackle'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));
		team = [
			{species: 'rockruff', level: 9, ability: 'steadfast', moves: ['happyhour'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));

		team = [
			{ species: 'lycanrocdusk', ability: 'scrappy', moves: ['happyhour'], evs: { hp: 1 } },
		];
		assert.legalTeam(team, validationFormat(7));
		team = [
			{species: 'lycanroc', ability: 'steadfast', moves: ['happyhour'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));
	});

	it('should reject Pokemon that cannot obtain moves in a particular forme', function () {
		team = [
			{ species: 'toxtricity', ability: 'punkrock', moves: ['magneticflux', 'venoshock'], evs: { hp: 1 } },
			{ species: 'toxtricity-low-key', ability: 'punkrock', moves: ['venoshock', 'shiftgear'], evs: { hp: 1 } },
		];
		// This fork explicitly restores the shared regular Toxtricity movepool.
		assert.legalTeam(team, validationFormat(9));

		team = [
			{species: 'rotom-wash', ability: 'levitate', moves: ['overheat'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(8));

		team = [
			{species: 'kyurem-black', ability: 'teravolt', moves: ['glaciate'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(8));

		// Scary Face is a TM in Gen 8, so use Gen 7 to test
		team = [
			{species: 'kyurem-white', ability: 'turboblaze', moves: ['scaryface'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(7));

		// Hoopa's Hyperspace moves are form-specific in Generation 9
		team = [
			{species: 'hoopa-confined', ability: 'magician', moves: ['hyperspacefury'], evs: {hp: 1}},
			{species: 'hoopa-unbound', ability: 'magician', moves: ['hyperspacehole'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, validationFormat(9));

		team = [
			{species: 'hoopa-confined', ability: 'magician', moves: ['hyperspacefury'], evs: {hp: 1}},
			{species: 'hoopa-unbound', ability: 'magician', moves: ['hyperspacehole'], evs: {hp: 1}},
		];
		assert.legalTeam(team, validationFormat(7));
	});

	// Zamazenta is unreleased currently
	it.skip('should tier Zacian and Zamazenta formes seperately', () => {
		team = [
			{species: 'zamazenta-crowned', ability: 'dauntlessshield', item: 'rustedshield', moves: ['howl'], evs: {hp: 1}},
		];
		assert.legalTeam(team, 'gen9almostanyability');

		team = [
			{species: 'zamazenta', ability: 'dauntlessshield', item: 'lifeorb', moves: ['howl'], evs: {hp: 1}},
		];
		assert.false.legalTeam(team, 'gen9almostanyability');
	});

	common.itGen(2, 'should validate Unown formes in Gen 2 based on DVs', () => {
		team = [
			{species: 'unowng', moves: ['hiddenpower'], ivs: {hp: 12, atk: 20, def: 18, spa: 28, spd: 28, spe: 2}},
		];
		assert.legalTeam(team, 'gen2ou');

		team = [
			{species: 'unown', moves: ['hiddenpower'], ivs: {hp: 0, atk: 4, def: 4, spa: 4, spd: 4, spe: 4}},
		];
		assert.false.legalTeam(team, 'gen2ou');
	});
});
