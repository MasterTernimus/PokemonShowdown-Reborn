'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { AbilityComponents } = require('../../../dist/data/ability-components');

describe('Convergence, Misaligned Stars and Frame Perfect', () => {
	let battle;
	const mon = (ability = 'No Ability', species = 'Mew', item = '') => ({ species, ability, item,
		moves: ['tackle', 'watergun', 'splash', 'protect'] });
	function start(ability, doubles = false, species = 'Mew', item = '') {
		battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [
			[mon(ability, species, item), mon(), mon()], [mon(), mon(), mon()],
		]);
		battle.makeChoices('team 123', 'team 123');
		battle.randomizer = damage => damage;
		for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 10000;
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1], battle.p2.active[1]];
	}
	function hit(source, target, id = 'tackle', extra = {}) {
		const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null }, extra);
		const hp = target.hp;
		battle.actions.runMove(move, source, source.getLocOf(target), { externalMove: true });
		return hp - target.hp;
	}
	function charged(p) { p.m.convergence = { entry: p.m.ultraRivalryEntryToken, Physical: true, Special: true }; }
	function prepare(p, id) {
		const move = Dex.getActiveMove(id);
		battle.runEvent('ModifyMove', p, battle.p2.active[0], move, move);
		return move;
	}
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Convergence', 'Frame Perfect', 'Hot Streak']) it(ability + ' ignores indirect ability damage', () => {
		const [p, foe] = start(ability); let rolls = 0;
		battle.randomChance = () => { rolls++; return true; };
		battle.damage(10, foe, p, Dex.abilities.get('roughskin'));
		assert(!p.m.convergence); assert(!p.m.framePerfect?.hits?.length);
		assert(!p.volatiles.jackpot); assert.equal(rolls, 0);
	});
	it('publishes only the approved slots and passives', () => {
		for (const [id, slot, ability] of [['lucario', 1, 'Convergence'], ['metagross', 0, 'Convergence'],
			['bronzong', 'H', 'Misaligned Stars'], ['bronzong', 'S', 'Reflector'], ['claydol', 0, 'Misaligned Stars'],
			['dusknoir', 1, 'Misaligned Stars'], ['mienshao', 0, 'Frame Perfect'], ['ninjask', 1, 'Frame Perfect']]) {
			assert.equal(Dex.species.get(id).abilities[slot], ability, id);
		}
		assert.deepEqual(Dex.species.get('metagross').passives, ['clearbody']);
		assert.deepEqual(Dex.species.get('accelgor').passives, ['frameperfect']);
		assert.deepEqual(Dex.species.get('accelgor').abilities, { 0: 'Silk Shuriken', 1: 'Hidden Scroll', H: 'Unburden' });
		assert(Dex.abilities.get('riftherald').exists);
	});
	for (const order of [['tackle', 'watergun'], ['watergun', 'tackle']]) it('charges in order ' + order.join('/'), () => {
		const [p, foe] = start('Convergence');
		hit(p, foe, order[0]); hit(p, foe, order[1]);
		assert(p.m.convergence.Physical); assert(p.m.convergence.Special);
		const move = prepare(p, 'tackle'); assert(move.convergenceAttack); assert(move.ignoreScreens);
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 120);
		assert(!p.m.convergence.Physical && !p.m.convergence.Special);
	});
	for (const result of ['miss', 'protect', 'immune']) it('spends charges on ' + result + ' and cannot recharge itself', () => {
		const [p, foe] = start('Convergence'); charged(p);
		if (result === 'protect') foe.addVolatile('protect');
		if (result === 'immune') foe.setType('Ghost');
		assert.equal(hit(p, foe, 'tackle', result === 'miss' ? { accuracy: 0 } : {}), 0);
		assert(!p.m.convergence.Physical && !p.m.convergence.Special);
	});
	it('keeps weaknesses while removing individual type resistances', () => {
		const [p, foe] = start('Convergence'); charged(p);
		const move = prepare(p, 'flamethrower');
		foe.setType(['Grass', 'Dragon']); assert.equal(foe.runEffectiveness(move), 1);
		foe.setType(['Grass', 'Steel']); assert.equal(foe.runEffectiveness(move), 2);
		foe.setType(['Water', 'Dragon']); assert.equal(foe.runEffectiveness(move), 0);
	});
	it('bypasses actual screens and grants one charge for a multihit spread move', () => {
		const [p, foe] = start('Convergence', true);
		const normal = hit(p, foe);
		foe.side.addSideCondition('reflect', foe);
		charged(p); const powered = hit(p, foe);
		assert(Math.abs(powered - normal * 1.2) <= 2);
		assert(!p.m.convergence.Physical && !p.m.convergence.Special);
		hit(p, foe, 'tackle', { multihit: 3, target: 'allAdjacentFoes' });
		assert(p.m.convergence.Physical); assert(!p.m.convergence.Special);
	});
	for (const ability of ['Insight', 'Cold Logic']) it('composes Convergence once in ' + ability, () => {
		const [p, foe] = start(ability); charged(p);
		const move = prepare(p, 'watergun');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 120);
		assert(p.hasAbility('keeneye'));
		assert(p.hasAbility('convergence'));
		if (ability === 'Insight') {
			assert(p.hasAbility('innerfocus')); assert(!p.hasAbility('telepathy'));
		} else {
			assert(p.hasAbility('forewarn')); assert(p.hasAbility('aftermath'));
		}
	});
	it('preserves Keen Eye accuracy protection and Mirror Arena entry effects', () => {
		const [p, foe] = start('Convergence');
		battle.boost({ accuracy: -1 }, p, foe, Dex.moves.get('sandattack')); assert.equal(p.boosts.accuracy, 0);
		assert(prepare(p, 'tackle').ignoreEvasion);
		battle.field.terrain = 'mirrorarenaterrain';
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.accuracy, 1); assert(p.volatiles.laserfocus);
	});
	it('records a whole multihit attack, blocks its next use once, then takes it normally', () => {
		const [p, foe] = start('Misaligned Stars');
		assert.equal(hit(foe, p, 'tackle', { damage: 10, multihit: 3 }), 30);
		assert.equal(hit(foe, p, 'tackle', { damage: 10, multihit: 3 }), 0);
		assert.equal(hit(foe, p, 'tackle', { damage: 10 }), 10);
		assert.equal(battle.log.filter(l => l.includes('The stars were bad for that outcome')).length, 1);
	});
	it('records by move rather than attacker and does not block other moves', () => {
		const [p, foe, , other] = start('Misaligned Stars', true);
		hit(foe, p, 'tackle', { damage: 10 });
		assert.equal(hit(other, p, 'watergun', { damage: 10 }), 10);
		assert.equal(hit(other, p, 'tackle', { damage: 10 }), 0);
		assert.equal(hit(foe, p, 'watergun', { damage: 10 }), 10);
	});
	it('allows the first move to KO and does not record misses or fully protected attacks', () => {
		const [p, foe] = start('Misaligned Stars');
		hit(foe, p, 'tackle', { accuracy: 0 }); assert(!p.m.misalignedStars?.recorded);
		p.addVolatile('protect'); hit(foe, p); p.removeVolatile('protect');
		assert(!p.m.misalignedStars?.recorded);
		p.hp = 1; hit(foe, p, 'tackle', { damage: 10 }); assert.equal(p.hp, 0);
	});
	it('retains the modded Anticipation warning effect', () => {
		const [p, foe] = start('Misaligned Stars');
		p.setType('Fire'); foe.moveSlots[0] = { ...foe.moveSlots[0], id: 'watergun', move: 'Water Gun' };
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert(p.volatiles.warnedmoves); assert(p.hasAbility('anticipation'));
	});
	it('applies momentum only after the entire multihit move and caps at ten', () => {
		const [p, foe] = start('Frame Perfect');
		const first = hit(p, foe, 'tackle', { multihit: 5 });
		assert.equal(p.m.framePerfect.momentum, 5);
		const second = hit(p, foe, 'tackle', { multihit: 5 });
		assert(second > first * 1.12 && second < first * 1.18);
		assert.equal(p.m.framePerfect.momentum, 10);
		hit(p, foe); assert.equal(p.m.framePerfect.momentum, 10);
		assert.equal(battle.runEvent('ModifyDamage', foe, p, Dex.getActiveMove('tackle'), 100), 90);
	});
	it('counts one momentum per spread hit and maintains a partly blocked spread move', () => {
		const [p, foe, , other] = start('Frame Perfect', true);
		hit(p, foe, 'tackle', { multihit: 3, target: 'allAdjacentFoes' }); assert.equal(p.m.framePerfect.momentum, 3);
		other.addVolatile('protect');
		hit(p, foe, 'tackle', { target: 'allAdjacentFoes' }); assert.equal(p.m.framePerfect.momentum, 4);
	});
	it('starts a new sequence before a different attack and clears on status, miss or block', () => {
		const [p, foe] = start('Frame Perfect');
		hit(p, foe, 'tackle', { multihit: 5 }); hit(p, foe, 'watergun'); assert.equal(p.m.framePerfect.momentum, 1);
		hit(p, foe, 'splash'); assert.equal(p.m.framePerfect.momentum, 0);
		hit(p, foe); hit(p, foe, 'tackle', { accuracy: 0 }); assert.equal(p.m.framePerfect.momentum, 0);
		hit(p, foe); foe.addVolatile('protect'); hit(p, foe);
		assert.equal(p.m.framePerfect.momentum, 0);
	});
	it('clears when unable to act while retaining Inner Focus', () => {
		const [p, foe] = start('Frame Perfect'); hit(p, foe);
		assert(!p.addVolatile('flinch', foe));
		battle.boost({ atk: -1 }, p, foe, Dex.abilities.get('intimidate')); assert.equal(p.boosts.atk, 0);
		p.setStatus('slp'); hit(p, foe); assert.equal(p.m.framePerfect.momentum, 0);
	});
	it('defers Speed changes until next turn and stacks normally with Metronome', () => {
		const [p, foe] = start('Frame Perfect', false, 'Mew', 'Metronome');
		const speed = p.getStat('spe'); hit(p, foe, 'tackle', { multihit: 5 });
		assert.equal(p.getStat('spe'), speed);
		battle.turn++; assert(Math.abs(p.getStat('spe') - speed * 1.25) <= 1);
		p.moveLastTurnResult = true;
		const first = foe.hp; hit(p, foe); const boosted = first - foe.hp;
		assert.equal(p.volatiles.metronome.numConsecutive, 1);
		assert(boosted > 0); assert.equal(p.m.framePerfect.momentum, 6);
		const move = prepare(p, 'tackle');
		assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 142);
	});
	for (const ability of ['Convergence', 'Misaligned Stars', 'Frame Perfect']) it('clears ' + ability + ' on switching', () => {
		const [p, foe] = start(ability); hit(p, foe); hit(foe, p);
		battle.makeChoices('switch 2', 'move splash');
		assert(!p.m.convergence); assert(!p.m.misalignedStars); assert(!p.m.framePerfect);
	});
	it('runs passive Frame Perfect once even when it is also selected', () => {
		const [p, foe] = start('Frame Perfect', false, 'Accelgor');
		hit(p, foe, 'tackle', { multihit: 3 }); assert.equal(p.m.framePerfect.momentum, 3);
		const move = prepare(p, 'tackle'); assert.equal(battle.runEvent('ModifyDamage', p, foe, move, 100), 109);
		assert.deepEqual(AbilityComponents.frameperfect, ['innerfocus']);
	});
	it('preserves recorded protection through battle serialization', () => {
		const [p, foe] = start('Misaligned Stars'); hit(foe, p);
		const { State } = require('../../../dist/sim/state');
		const saved = JSON.stringify(State.serializeBattle(battle));
		battle.destroy(); battle = State.deserializeBattle(saved);
		assert.equal(hit(battle.p2.active[0], battle.p1.active[0]), 0);
	});
	it('clears Frame Perfect on a no-PP attempt or a failed before-move callback', () => {
		const [p, foe] = start('Frame Perfect'); hit(p, foe);
		p.moveSlots[0].pp = 0;
		battle.actions.runMove('tackle', p, 1);
		assert.equal(p.m.framePerfect.momentum, 0);
		hit(p, foe); hit(p, foe, 'tackle', { beforeMoveCallback() { return true; } });
		assert.equal(p.m.framePerfect.momentum, 0);
	});
	it('preserves Convergence charges when unable to act and Insight keeps its existing defensive-stage read', () => {
		const [p, foe] = start('Insight'); charged(p);
		p.setStatus('slp'); hit(p, foe); assert(p.m.convergence.Physical && p.m.convergence.Special);
		p.cureStatus(); p.m.convergence.Physical = p.m.convergence.Special = false;
		hit(p, foe, 'tackle'); assert.equal(p.abilityState.auraReads[foe.m.ultraRivalryEntryToken], 'Physical');
		assert(!p.hasAbility('telepathy'));
	});
});
