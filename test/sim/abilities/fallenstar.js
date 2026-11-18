'use strict';

const assert = require('node:assert/strict');
const common = require('../../common');

describe('Fallen Star', () => {
	const foe = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
	const arrows = ['bulletseed', 'razorleaf', 'thousandarrows'];
	const archer = { species: 'Decidueye', ability: 'Fallen Star', moves: arrows };
	let battle;
	afterEach(() => battle.destroy());

	function setupFFA() {
		battle = common.createBattle({ gameType: 'freeforall' }, [[archer], [foe], [foe], [foe]]);
		battle.randomizer = damage => damage;
		battle.randomChance = (numerator, denominator) => numerator >= denominator || denominator === 100;
		return battle.p1.active[0];
	}

	for (const move of arrows) {
		for (const side of ['p2', 'p3', 'p4']) {
			it(`${move} keeps its two-hit damage split on the chosen ${side} foe`, () => {
				const user = setupFFA();
				const target = battle[side].active[0];
				target.hp = target.maxhp = target.baseMaxhp = 5000;
				const damage = [];
				const original = target.damage;
				target.damage = function (amount, source, effect) {
					const dealt = original.call(this, amount, source, effect);
					if (source === user && effect?.id === move) damage.push(dealt);
					return dealt;
				};
				assert.equal(user.getMoves().find(slot => slot.id === move).target, 'adjacentFoe');
				battle.makeChoices(`move ${move} ${user.getLocOf(target)}`, 'move splash', 'move splash', 'move splash');
				assert.equal(damage.length, 2);
				assert(damage[0] > 0);
				if (move === 'thousandarrows') {
					assert.equal(damage[1], damage[0]);
				} else {
					// Proficient boosts Grass attacks, so Dual Wield scales their second hit to 15%.
					assert(damage[1] > 0 && damage[1] <= Math.ceil(damage[0] * 0.15));
				}
				for (const other of user.foes()) {
					if (other !== target) assert.equal(other.hp, other.maxhp);
				}
			});
		}
	}

	it('ends a KO on the selected FFA foe without retargeting or healing its user', () => {
		const user = setupFFA();
		user.hp = Math.floor(user.maxhp / 2);
		const hp = user.hp;
		const chosen = battle.p3.active[0];
		chosen.hp = 1;
		battle.makeChoices(`move razorleaf ${user.getLocOf(chosen)}`, 'move splash', 'move splash', 'move splash');
		assert(chosen.fainted);
		assert.equal(user.hp, hp);
		for (const side of [battle.p2, battle.p4]) assert.equal(side.active[0].hp, side.active[0].maxhp);
	});

	it('uses the stronger defense after its own arrow hit, for that turn only', () => {
		battle = common.createBattle({}, [[archer], [foe]]);
		const user = battle.p1.active[0];
		const target = battle.p2.active[0];
		const tackle = battle.dex.getActiveMove('tackle');
		const incoming = () => battle.runEvent('ModifyDamage', target, user, tackle, 1000);
		assert.equal(incoming(), 1000);
		user.hp = Math.floor(user.maxhp / 2);
		const hp = user.hp;
		assert.equal(incoming(), 800);
		target.addVolatile('protect');
		battle.actions.useMove('thousandarrows', user, { target });
		assert.equal(incoming(), 800);
		target.removeVolatile('protect');
		battle.actions.useMove('thousandarrows', user, { target });
		assert.equal(user.hp, hp);
		assert.equal(incoming(), 750);
		battle.turn++;
		assert.equal(incoming(), 800);
	});
});
