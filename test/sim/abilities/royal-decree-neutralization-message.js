'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

describe('Royal Decree and Neutralization messages', function () {
	const royalUsers = [
		{species: 'Tsareena', ability: 'Empress'},
		{species: 'Nidoking', ability: 'Royal Decree'},
		{species: 'Pyroar-Mega', ability: 'Royal Sun', item: 'Pyroarite'},
	];

	for (const royalUser of royalUsers) {
		it(`explains why ${royalUser.ability}'s entry reset failed`, function () {
			const battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
				{species: 'Mew', moves: ['splash']},
				{species: 'Magikarp', moves: ['splash']},
				{...royalUser, moves: ['splash']},
			], [
				{species: 'Cofagrigus', ability: 'Neutralization', moves: ['splash']},
				{species: 'Magikarp', moves: ['splash']},
			]]);
			try {
				battle.makeChoices('team 1,2,3', 'team 1,2');
				const mew = battle.p1.active[0];
				mew.boosts.atk = 2;
				battle.makeChoices('move splash, switch 3', 'move splash, move splash');
				assert.statStage(mew, 'atk', 2);
				const messages = battle.log.filter(line => line.startsWith('|-message|') && line.includes('Neutralization') && line.includes('Royal Decree'));
				assert.equal(messages.length, 1);
				assert(messages[0].includes('stat boosts and screens were not cleared'));
			} finally {
				battle.destroy();
			}
		});
	}

	it('announces when Neutralization starts suppressing an active Empress', function () {
		const battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Tsareena', ability: 'Empress', moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		], [
			{species: 'Cofagrigus', ability: 'Mummy', moves: ['splash']},
			{species: 'Magikarp', moves: ['splash']},
			{species: 'Cofagrigus', ability: 'Neutralization', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1,2', 'team 1,2,3');
			battle.makeChoices('move splash, move splash', 'switch 3, move splash');
			const messages = battle.log.filter(line => line.startsWith('|-message|') && line.includes('Neutralization is suppressing Tsareena\'s Royal Decree'));
			assert.equal(messages.length, 1);
		} finally {
			battle.destroy();
		}
	});

	it('does not duplicate the message when both abilities enter together', function () {
		const battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species: 'Tsareena', ability: 'Empress', moves: ['splash']},
			{species: 'Mew', moves: ['splash']},
		], [
			{species: 'Cofagrigus', ability: 'Neutralization', moves: ['splash']},
			{species: 'Magikarp', moves: ['splash']},
		]]);
		try {
			battle.makeChoices('team 1,2', 'team 1,2');
			const messages = battle.log.filter(line => line.startsWith('|-message|') && line.includes('Neutralization') && line.includes('Royal Decree'));
			assert.equal(messages.length, 1);
		} finally {
			battle.destroy();
		}
	});
});
