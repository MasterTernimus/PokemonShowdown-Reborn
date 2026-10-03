'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Transfixing Gaze', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(doubles = false) {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[{ species: 'Espathra', ability: 'Transfixing Gaze', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', moves: ['uturn', 'partingshot', 'teleport', 'batonpass'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', doubles ? 'team 123' : 'team 123');
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	for (const id of ['uturn', 'voltswitch', 'flipturn', 'partingshot', 'teleport', 'batonpass', 'shedtail']) {
		it('blocks only the self-switch of ' + id, () => {
			const [holder, foe] = setup();
			const move = battle.dex.getActiveMove(id);
			Object.assign(move, { accuracy: true, willCrit: false, basePower: move.category === 'Status' ? 0 : 1 });
			if (!foe.moveSlots.some(s => s.id === id)) foe.moveSlots.push({ id, move: move.name, pp: 10, maxpp: 10, target: move.target, disabled: false, used: false });
			const hp = holder.hp;
			battle.actions.runMove(move, foe, move.target === 'self' ? 0 : foe.getLocOf(holder));
			assert(!foe.switchFlag);
			if (move.category !== 'Status') assert(holder.hp < hp);
			if (id === 'partingshot') assert.equal(holder.boosts.atk, -1);
		});
	}
	for (const mode of ['fainted', 'suppressed', 'left']) it('allows the pivot when the holder has ' + mode, () => {
		const [holder, foe] = setup();
		if (mode === 'fainted') holder.hp = 1;
		if (mode === 'suppressed') holder.addVolatile('gastroacid');
		if (mode === 'left') battle.actions.switchIn(holder.side.pokemon[1], 0);
		const move = battle.dex.getActiveMove('uturn');
		Object.assign(move, { damage: 1, accuracy: true, willCrit: false });
		battle.actions.runMove(move, foe, foe.getLocOf(battle.p1.active[0]));
		assert.equal(foe.switchFlag, 'uturn');
	});
	it('covers doubles foes and generic custom self-switch moves but allows allies/items', () => {
		const [holder, foe] = setup(true), move = battle.dex.getActiveMove('uturn');
		move.id = 'custompivot';
		foe.switchFlag = move.id;
		battle.runEvent('AfterMove', foe, holder, move);
		assert(!foe.switchFlag);
		const ally = battle.p1.active[1];
		ally.switchFlag = move.id;
		battle.runEvent('AfterMove', ally, foe, move);
		assert.equal(ally.switchFlag, move.id);
		foe.switchFlag = true;
		battle.runEvent('AfterMove', foe, holder, move);
		assert.equal(foe.switchFlag, true);
		assert(!foe.trapped);
	});
	it('keeps full Frisk once and the other Espathra slots', () => {
		const [holder] = setup();
		assert.equal(holder.getAbility().onStart, battle.dex.abilities.get('frisk').onStart);
		assert.deepEqual(battle.dex.species.get('espathra').abilities, { 0: 'Opportunist', 1: 'Transfixing Gaze', H: 'Speed Boost' });
	});
});
