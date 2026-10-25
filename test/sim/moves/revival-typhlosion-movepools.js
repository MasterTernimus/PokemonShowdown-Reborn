'use strict';
const assert = require('assert').strict;
const { Dex, Teams, TeamValidator } = require('../../../dist/sim');
const removed = ['Charge Beam', 'Double Shock', 'Electro Ball', 'Rising Voltage', 'Shock Wave', 'Thunder', 'Thunderbolt', 'Thunder Fang'];
const strict = 'gen9doublesrockyfield@@@Obtainable Moves';
const partner = '\n\nPikachu\nAbility: Static\n- Protect';
describe('Revival support and Typhlosion coverage boundaries', () => {
	for (const species of ['Roserade', 'Meowstic', 'Meowstic-F']) {
		it(species + ' can legally select Revival Blessing', () => {
			const ability = Dex.species.get(species).abilities[0];
			assert.equal(TeamValidator.get(strict).validateTeam(Teams.import(species + '\nAbility: ' + ability + '\n- Revival Blessing' + partner)), null);
		});
	}
	for (const species of ['Typhlosion', 'Typhlosion-Hisui']) {
		for (const move of removed) it(species + ' rejects the added ' + move, () => {
			const errors = TeamValidator.get(strict).validateTeam(Teams.import(species + '\nAbility: Blazing Mane\n- ' + move + partner));
			assert(errors?.some(e => e.includes(move)), JSON.stringify(errors));
		});
	}
	for (const id of ['typhlosion', 'typhlosionalt', 'typhlosionhisui', 'typhlosionmega']) {
		it(id + ' preserves legacy Electric coverage without inherited added attacks', () => {
			const entries = Dex.species.getFullLearnset(id);
			for (const move of removed) assert(!entries.some(e => e.learnset[Dex.toID(move)]), id + ': ' + move);
			for (const move of ['thunderpunch', 'wildcharge']) assert(entries.some(e => e.learnset[move]), id + ': ' + move);
		});
	}
	it('keeps pre-evolutions and Aevian Roserade outside the new grant', () => {
		for (const id of ['roselia', 'budew', 'espurr', 'roseradeaevian']) assert(!Dex.species.getFullLearnset(id).some(e => e.learnset.revivalblessing), id);
		for (const id of ['cyndaquil', 'quilava']) assert(Dex.species.getFullLearnset(id).some(e => e.learnset.wildcharge), id);
	});
	it('lets the matching Megas inherit Revival Blessing', () => {
		for (const id of ['roserademega', 'meowsticmmega', 'meowsticfmega']) assert(Dex.species.getFullLearnset(id).some(e => e.learnset.revivalblessing), id);
	});
	it('preserves permissive format rules rather than introducing move bans', () => assert(!Dex.formats.getRuleTable(Dex.formats.get('gen9doublesrockyfield')).has('obtainablemoves')));
});
