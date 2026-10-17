const assert = require('assert').strict, common = require('../../common');
describe('Multiple stored Foresight attacks', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [ability, delay] of [['Grandmaster', 2], ['Perfect Foresight', 1]]) {
		for (const departure of ['stay', 'switch', 'faint']) it(ability + ' retains independent same-slot snapshots and serial releases after owner ' + departure, () => {
			const reserve = {species: 'Mew', ability: 'No Ability', moves: ['splash']};
			battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [
				[{species: 'Alakazam', ability, moves: ['psychic']}, {...reserve}], [reserve, {...reserve}],
			]);
			battle.makeChoices('team 12', 'team 12');
			const p = battle.p1.active[0], q = battle.p2.active[0];
			p.hp = p.maxhp = p.baseMaxhp = q.hp = q.maxhp = q.baseMaxhp = 10000;
			for (const boost of [0, 1, 2]) {
				p.boosts.spa = boost; battle.clearActiveMove();
				const move = battle.dex.getActiveMove('psychic');
				Object.assign(move, {accuracy: true, basePower: 10, willCrit: false, secondaries: undefined, multihit: 3});
				battle.actions.useMove(move, p, {target: q});
			}
			const state = battle.field.pseudoWeather.foresightmemory, entries = state.entries;
			assert.equal(entries.length, 3);
			assert.deepEqual(entries.map(e => e.boost), [0, 1, 2]);
			assert(entries.every(e => e.turn === 1 + delay && e.slot === q.getSlot()));
			if (departure === 'switch') { p.switchFlag = true; battle.actions.switchIn(p.side.pokemon[1], p.position); }
			if (departure === 'faint') { p.faint(); battle.faintMessages(); }
			for (let i = 0; i < 3; i++) {
				battle.turn = 1 + delay + i; const before = battle.log.length;
				battle.singleEvent('FieldResidual', battle.dex.conditions.get('foresightmemory'), state, battle.field);
				assert.equal(battle.log.slice(before).filter(l => l.includes('attack arrived')).length, 1);
				assert.equal(entries.length, 2 - i);
				assert(entries.every(e => e.turn === battle.turn + 1));
			}
		});
	}
});
