'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Signature ability interaction boundaries', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function setup(ability, attackerAbility = 'No Ability', gameType = 'singles') {
		battle = common.createBattle({ formatid: gameType === 'doubles' ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[{ species: 'Mew', ability, moves: ['splash', 'tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: attackerAbility, moves: ['splash', 'tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		if (battle.requestState === 'teampreview') battle.makeChoices('team 12', 'team 12');
		battle.randomChance = () => true;
		battle.randomizer = amount => amount;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function attack(source, target, id, overrides = {}) {
		const move = battle.dex.getActiveMove(id);
		if (!source.moveSlots.some(slot => slot.id === move.id)) {
			source.moveSlots.push({ move: move.name, id: move.id, pp: 20, maxpp: 20, target: move.target,
				disabled: false, disabledSource: '', used: false });
		}
		Object.assign(move, { accuracy: true, willCrit: false, basePower: 1 }, overrides);
		battle.actions.runMove(move, source, source.getLocOf(target));
	}
	it('Cinder Scales keeps Flame Body under Mold Breaker while Shield Dust can be bypassed', () => {
		const [holder, attacker] = setup('Cinder Scales', 'Mold Breaker');
		attack(attacker, holder, 'bodyslam');
		assert.equal(attacker.status, 'brn'); assert.equal(holder.status, 'par');
	});
	it('Cinder Scales blocks secondaries normally and preserves Swarm pinch power', () => {
		const [holder, attacker] = setup('Cinder Scales');
		attack(attacker, holder, 'bodyslam'); assert.equal(holder.status, '');
		holder.hp = Math.floor(holder.maxhp / 3);
		const move = battle.dex.getActiveMove('bugbuzz');
		assert.equal(battle.runEvent('ModifySpA', holder, attacker, move, 100), 150);
	});
	it('Vault Keeper protects an ally target on its side and Defog still clears hazards', () => {
		const [keeper, attacker] = setup('Vault Keeper', 'No Ability', 'doubles');
		const ally = keeper.side.active[1];
		keeper.side.addSideCondition('reflect', keeper); keeper.side.addSideCondition('spikes', attacker);
		attack(attacker, ally, 'brickbreak'); assert(keeper.side.sideConditions.reflect);
		attack(attacker, ally, 'defog'); assert(keeper.side.sideConditions.reflect);
		assert(!keeper.side.sideConditions.spikes);
		keeper.addVolatile('gastroacid'); attack(attacker, ally, 'brickbreak');
		assert(!keeper.side.sideConditions.reflect);
	});
	it('Pressure Kiln caps at quarter HP and clears only on actual switching', () => {
		const [holder, attacker] = setup('Pressure Kiln');
		for (let i = 0; i < 3; i++) {
			holder.hp = holder.maxhp; attack(attacker, holder, 'seismictoss');
		}
		assert.equal(holder.m.approvedSignatures.pressure, Math.floor(holder.maxhp / 4));
		holder.setAbility('No Ability'); holder.setAbility('Pressure Kiln');
		assert.equal(holder.m.approvedSignatures.pressure, Math.floor(holder.maxhp / 4));
		battle.actions.switchIn(holder.side.pokemon[1], 0); battle.actions.switchIn(holder, 0);
		assert(!holder.m.approvedSignatures.pressure);
	});
	it('Shattercrust never adds its bonus Spikes after a fatal first hit', () => {
		const [holder, attacker] = setup('Shattercrust'); holder.hp = 1;
		attack(attacker, holder, 'seismictoss');
		assert.equal(holder.hp, 0); assert(!attacker.side.sideConditions.spikes);
	});
	it('Twilight can earn another charge after an earlier one expired while suppressed', () => {
		const [holder, attacker] = setup('Twilight Instinct');
		holder.m.approvedSignatures.twilightTurn = battle.turn;
		holder.addVolatile('gastroacid'); battle.turn += 2; holder.removeVolatile('gastroacid');
		battle.queue.willMove = () => ({ choice: 'move' });
		attack(attacker, holder, 'tackle');
		assert.equal(holder.m.approvedSignatures.twilightTurn, battle.turn + 1);
	});
	it('Dissonant Chime blocks opposing Perish Song but not its own song', () => {
		const [holder, attacker] = setup('Dissonant Chime');
		attack(attacker, holder, 'perishsong'); assert(!holder.volatiles.perishsong);
		attack(holder, attacker, 'perishsong'); assert(holder.volatiles.perishsong);
	});
	it('Restorative Chime heals and cures the actual Heal Pulse recipient', () => {
		const [holder] = setup('Restorative Chime', 'No Ability', 'doubles');
		const ally = holder.side.active[1]; ally.hp -= 100; ally.setStatus('brn');
		attack(holder, ally, 'healpulse');
		assert.equal(ally.status, ''); assert(holder.m.approvedSignatures.restorativeUsed);
	});
	it('Restorative Chime adds no self-heal after Healing Wish self-KO', () => {
		const [holder] = setup('Restorative Chime'); holder.hp -= 100;
		attack(holder, holder, 'healingwish'); assert.equal(holder.hp, 0);
	});
	it('Grave Hunger retains Bad Dreams and drops its healing aura when suppressed', () => {
		const [holder, target] = setup('Grave Hunger'); target.setStatus('slp');
		const hp = target.hp; battle.fieldEvent('Residual');
		assert.equal(hp - target.hp, Math.floor(target.maxhp / 8));
		holder.addVolatile('gastroacid'); target.hp -= 100;
		assert.equal(battle.heal(40, target, target, battle.dex.moves.get('recover')), 40);
	});
	it('Primeval Hunt never promotes an interrupted earlier hit to a critical hit', () => {
		const [holder, target] = setup('Primeval Hunt');
		battle.randomChance = (n, d) => n >= d;
		const crits = [];
		battle.onEvent('DamagingHit', battle.format, (damage, defender, source, move) => {
			crits.push(defender.getMoveHitData(move).crit);
			if (crits.length === 2) source.faint();
		});
		attack(holder, target, 'rockblast', { willCrit: undefined });
		assert.deepEqual(crits, [false, false]);
	});
});
