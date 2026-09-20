'use strict';

const assert = require('assert').strict;
const { makeUser } = require('../users-utils');
const { Teams } = require('../../dist/sim');

describe('1v2 Multi battle room', function () {
	let users = [];
	let room;
	afterEach(() => {
		room?.destroy();
		for (const user of users) {
			user.disconnectAll();
			user.destroy();
		}
		room = null;
		users = [];
	});

	it('runs both solo choices against two human teammates', async function () {
		const [solo, opponent, teammate] = ['SoloTrainer', 'FirstOpponent', 'SecondOpponent'].map(name => makeUser(name));
		users = [solo, opponent, teammate];
		const privateMessages = [];
		const originalSendTo = solo.sendTo;
		solo.sendTo = function (roomid, message) {
			privateMessages.push(message);
			return originalSendTo.call(this, roomid, message);
		};
		const packedTeam = Teams.pack(['Mew', 'Pikachu', 'Eevee', 'Snorlax', 'Blissey', 'Ditto']
			.map(species => ({ species, moves: ['tackle', 'splash'] })));
		room = Rooms.createBattle({
			format: 'gen9multi1v2watersurface',
			players: [{ user: solo, team: packedTeam }, { user: opponent, team: packedTeam }],
			delayedStart: 'multi',
		});
		const battle = room.battle;
		assert.equal(battle.soloMulti, true);
		assert.deepEqual(battle.players.map(p => p.name), [solo.name, opponent.name, solo.name, 'Player 4']);
		assert.deepEqual(battle.players.map(p => p.hasTeam), [true, true, true, false]);
		assert.equal(battle.joinGame(teammate, 'p3', { team: packedTeam }), false);
		battle.p4.invite = teammate.id;
		assert.equal(battle.joinGame(teammate, 'p4', { team: packedTeam }), true);
		assert.equal(battle.started, true);
		assert.equal(battle.playerTable[solo.id], battle.p1);
		assert.equal(battle.playerTable[teammate.id], battle.p4);
		assert.equal(battle.p3.getUser(), null);
		const waitFor = async condition => {
			for (let i = 0; i < 100; i++) {
				if (condition()) return;
				await new Promise(resolve => setTimeout(resolve, 20));
			}
			assert.fail('The battle did not advance to the expected request');
		};
		await waitFor(() => battle.p3.request.request && battle.p4.request.request);
		assert(JSON.parse(battle.p3.request.request).teamPreview);
		assert(privateMessages.some(message => message.includes('|uhtml|solomulti-') && message.includes('Your second Pokémon')));
		battle.chooseSolo(teammate, `team 1,2,3|${battle.p3.request.rqid}`);
		assert.equal(battle.p3.request.choice, '', 'only the solo participant can choose for p3');
		for (const player of [battle.p1, battle.p2, battle.p4]) {
			battle.choose(player.getUser(), `team 1,2,3|${player.request.rqid}`);
		}
		battle.chooseSolo(solo, `team 1,2,3|${battle.p3.request.rqid}`);
		await waitFor(() => battle.turn === 1 && !!JSON.parse(battle.p3.request.request).active);
		assert.equal(battle.p3.request.isWait, false);
		for (const player of [battle.p1, battle.p2, battle.p4]) {
			battle.choose(player.getUser(), `move ${player === battle.p2 || player === battle.p4 ? 2 : '1 +1'}|${player.request.rqid}`);
		}
		battle.chooseSolo(solo, `move 1 +2|${battle.p3.request.rqid}`);
		await waitFor(() => battle.turn === 2);
		assert.equal(battle.started, true);
		assert.equal(battle.forfeit(solo), true);
		await waitFor(() => battle.ended);
		assert.equal(battle.p3.eliminated, true, 'forfeiting the solo player also eliminates its second slot');
	});
});
