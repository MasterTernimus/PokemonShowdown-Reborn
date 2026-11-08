'use strict';
const assert = require('assert').strict;
const testAssert = require('../assert');
describe('Negative test assertions', () => {
	it('accepts an ordinary failed assertion', () => {
		testAssert.false.equal(1, 2);
	});
	it('does not swallow a broken assertion input', () => {
		assert.throws(() => testAssert.false.statStage(null, 'atk', 1), TypeError);
	});
	it('does not mistake an unavailable format for team rejection', () => {
		assert.throws(() => testAssert.false.legalTeam(
			[{ species: 'Mew', ability: 'Synchronize', moves: ['splash'] }],
			'nonexistent-test-format'
		), /should be a 'Format'/);
	});
	it('still accepts actual validator rejection on a supported format', () => {
		testAssert.false.legalTeam(
			[{ species: 'nonexistentPokemon', moves: ['splash'] }], 'gen9nofieldsinglesgame'
		);
	});
});
