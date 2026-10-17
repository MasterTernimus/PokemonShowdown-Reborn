'use strict';
const assert = require('assert').strict, common = require('../../common');
describe('Rocky Field local Bulletproof coverage', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(field = true, ability = 'No Ability') {
		battle = common.createBattle({formatid: field ? 'gen9rockyfield' : 'gen9nofieldsinglesgame'}, [
			[{species: 'Blastoise', ability: 'Hydraulic Armor', moves: ['withdraw', 'protect', 'skullbash', 'splash']}],
			[{species: 'Mew', ability, moves: ['watergun', 'splash']}],
		]);
		battle.makeChoices(); battle.randomChance = (n, d) => n >= d; battle.randomizer = n => n;
		const p = battle.p1.active[0], q = battle.p2.active[0];
		q.hp = q.maxhp = q.baseMaxhp = 4000;
		return [p, q];
	}
	function hit(p, q, id, extra = {}) {
		battle.clearActiveMove(); const m = battle.dex.getActiveMove(id);
		Object.assign(m, {accuracy: true, willCrit: false}, extra);
		battle.actions.useMove(m, p, {target:q}); battle.runEvent('AfterMove',p,q,battle.activeMove);
	}
	for (const id of ['waterpulse', 'aurasphere', 'shadowball', 'hydropump', 'surf']) {
		it('Rocky raised Defense matches local Bulletproof for ' + id, () => {
			const results = [];
			for (const field of [true, false]) {
				const [p, q] = setup(field, field ? 'No Ability' : 'Bulletproof');
				if (field) q.boosts.def = 1;
				const hp = q.hp; hit(p, q, id); results.push(q.hp < hp);
				battle.destroy(); battle = null;
			}
			assert.equal(results[0], results[1]);
			assert.equal(results[0], ['hydropump', 'surf'].includes(id));
		});
	}
	for (const trigger of ['withdraw', 'protect']) for (const defense of [0, 1]) {
		it(trigger + ' Water Pulse obeys Rocky Defense stage ' + defense, () => {
			const [p, q] = setup(); q.boosts.def = defense; const hp = q.hp;
			battle.makeChoices('move ' + trigger, 'move watergun');
			assert(battle.log.some(l => l.includes('|Water Pulse|')));
			assert.equal(q.hp < hp, defense === 0);
		});
	}
	it('Substitute also rebounds pulses before damaging the substitute', () => {
		const [p, q] = setup(); q.addVolatile('substitute'); const hp = q.volatiles.substitute.hp;
		battle.makeChoices('move withdraw', 'move splash');
		assert.equal(q.volatiles.substitute.hp, hp);
		assert(battle.log.some(l => l.includes('rebounded')));
	});
	it('Skull Bash Hydro Pump remains ordinary and is not incorrectly classified as a bullet or pulse', () => {
		const [p, q] = setup(); q.boosts.def = 1; p.setItem('Power Herb');
		battle.randomChance = () => true;
		battle.makeChoices('move skullbash', 'move splash');
		assert(battle.log.some(l => l.includes('|Hydro Pump|')));
		assert.equal(battle.log.filter(l => l.startsWith('|-damage|p2')).length, 4);
	});
	for (const protection of ['protect', 'waterabsorb']) it('free Water Pulse respects ' + protection, () => {
		const [p, q] = setup(true, protection === 'waterabsorb' ? 'Water Absorb' : 'No Ability');
		const hp = q.hp;
		if (protection === 'protect') q.addVolatile('protect');
		hit(p, p, 'withdraw'); assert.equal(q.hp, hp);
	});
});
