'use strict';
const assert = require('assert').strict;
const { Teams } = require('../../dist/sim/teams');
const { previewForms, validateSavedTeams } = require('../../dist/server/chat-plugins/team-tools');
describe('Server-authoritative team tools', () => {
	const set = { species: 'Charizard', item: 'Charizardite X', ability: 'Blaze', moves: ['flamethrower'], evs: { atk: 252 } };
	it('returns both actual Charizard branches without changing the input', () => {
		const packed = Teams.pack([set]);
		const result = previewForms('gen9nofieldsinglesgame', packed);
		assert.deepEqual(result.options.map(x => x.name), ['Charizard-Mega-X', 'Charizard-Mega-Y']);
		assert.equal(result.options[0].baseStats.atk, 130);
		assert.equal(Teams.pack([set]), packed);
	});
	it('uses custom G-Max eligibility and selected format rules', () => {
		const packed = Teams.pack([{ species: 'Grimmsnarl-Azzy', moves: ['spiritbreak'] }]);
		assert(previewForms('gen9nofielddoublesbattle', packed).options.some(x => x.id === 'grimmsnarlgmaxazzy'));
		assert.equal(previewForms('gen9nofieldsinglesgame', packed).options.length, 0);
		assert.equal(previewForms('gen9nofielddoublesbattle', Teams.pack([{ species: 'Mew', moves: ['tackle'] }])).options.length, 0);
	});
	it('invalidates held item branches and handles custom regional alternatives', () => {
		assert.equal(previewForms('gen9nofieldsinglesgame', Teams.pack([{ ...set, item: 'Leftovers' }])).options.length, 0);
		const result = previewForms('gen9nofieldsinglesgame', Teams.pack([{ species: 'Charizard-Alt', item: 'Charizardite X', moves: ['flamethrower'] }]));
		assert.deepEqual(result.options.map(x => x.id), ['charizardmegaxalt']);
	});
	it('never falls back to a permissive format or returns green for missing data', () => {
		const results = validateSavedTeams([{ name: 'Missing format', team: Teams.pack([set]) }, { name: 'Missing roster', format: 'gen9nofieldsinglesgame' }, { name: 'Unknown', format: 'inventedformat', team: Teams.pack([set]) }]);
		assert(results.every(x => x.status === 'not checked'));
		assert.throws(() => previewForms('', Teams.pack([set])), /format/);
	});
	it('validates twelve independent teams and rejects a thirteenth', () => {
		const input = Array.from({length: 12}, (_, index) => ({name: 'Team ' + index,
			format: 'gen9nofieldsinglesgame', team: Teams.pack([set])}));
		const result = validateSavedTeams(input);
		assert.equal(result.length, 12);
		assert(result.every(entry => entry.matchup.startsWith('Not checked')));
		assert.throws(() => validateSavedTeams([...input, input[0]]), /1–12/);
	});
	it('uses the real validator and preserves packed team inputs', () => {
		const team = { name: 'Illegal move', format: 'gen9nofieldsinglesgame', team: Teams.pack([{ ...set, moves: ['notarealmove'] }]) };
		const before = JSON.stringify(team), result = validateSavedTeams([team])[0];
		assert.equal(result.status, 'invalid');
		assert(result.problems.length);
		assert(result.suggestions.length);
		assert(result.matchup.startsWith('Not checked'));
		assert.equal(JSON.stringify(team), before);
	});
});
