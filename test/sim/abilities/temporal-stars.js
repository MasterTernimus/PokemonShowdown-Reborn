'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

describe('Temporal Shift and Mega Mismagius', () => {
	let battle;
	const spare = { species: 'Snorlax', ability: 'No Ability', moves: ['splash'] };
	function start(mega, evs = {}) {
		const set = mega ?
			{ species: 'Mismagius', ability: 'Void Veil', item: 'Dusk Stone' } :
			{ species: 'Mismagius', ability: 'Temporal Shift' };
		const foe = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'soak', 'watergun'] };
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ ...set, evs, nature: 'Serious', moves: ['splash', 'shadowball'] }, spare],
			[foe, spare],
		]);
		battle.makeChoices('team 12', 'team 12');
		if (mega) {
			battle.makeChoices('move splash mega', 'move splash');
			assert.equal(battle.p1.active[0].species.id, 'mismagiusmega');
		}
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	afterEach(() => battle.destroy());

	for (const mega of [false, true]) {
		it((mega ? 'Void Craft' : 'Temporal Shift') + ' remembers blocked moves and cushions a multihit attack on re-entry', () => {
			const [user, foe] = start(mega);
			assert(user.hasAbility('anticipation'));
			assert(user.hasAbility('misalignedstars'));
			user.maxhp = user.baseMaxhp = 800;
			user.hp = 75;
			const attack = () => {
				const move = Object.assign(Dex.getActiveMove('watergun'), { damage: 5, multihit: 3 });
				battle.actions.runMove(move, foe, foe.getLocOf(user), { externalMove: true });
			};
			const soak = () => battle.actions.runMove('soak', foe, foe.getLocOf(user), { externalMove: true });
			attack();
			soak();
			assert.equal(user.hp, 60);
			assert(user.hasType('Water'));
			attack();
			soak();
			assert.equal(user.hp, 60 + 2 * 266);
			assert.equal(battle.log.filter(line => line.includes('The stars were bad for that outcome')).length, 2);
			attack();
			assert.equal(user.hp, 60 + 2 * 266 - 15);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			const returned = user.hp;
			attack();
			assert.equal(user.hp, returned - 3 * battle.modify(5, 0.5) + 200);
		});
	}

	for (const stat of ['spa', 'spd', 'spe']) {
		it('raises ' + stat + ' when it is Mega Mismagius’s highest stat on a move KO', () => {
			const [user, foe] = start(true, { [stat]: 252 });
			assert.deepEqual(user.getPassives(), ['elevate']);
			assert.equal(user.boosts[stat], 0);
			user.boosts.def = 6;
			foe.hp = 1;
			battle.makeChoices('move shadowball', 'move splash');
			assert(foe.fainted);
			assert.equal(user.boosts[stat], 1);
			assert.equal(user.boosts.def, 6);
		});
	}
});
