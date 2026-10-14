/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex } = require('../../../dist/sim');
let battle;
function setup(ability = 'Ultra Instinct', field = '', doubles = false, species = 'Mew') {
	const mon = (s = 'Mew', a = 'No Ability') => ({ species: s, ability: a, moves: ['splash', 'tackle', 'watergun', 'icebeam'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[mon(species, ability), mon(), mon()], [mon(), mon(), mon()]]); battle.makeChoices('team 123', 'team 123');
	const p = battle.p1.active[0], q = battle.p2.active[0]; if (p.species.id !== Dex.species.get(species).id)p.formeChange(species, null, true); p.setAbility(ability);
	battle.field.terrain = field; for (const side of battle.sides) for (const m of side.pokemon) { m.hp = m.maxhp = m.baseMaxhp = 4000; delete m.m.enteredBattleTurn; }
	battle.randomChance = (n, d) => n >= d; battle.randomizer = n => n; return [p, q];
}
function hit(p, q, extra = {}) { const m = Object.assign(Dex.getActiveMove('tackle'), { accuracy: true, willCrit: false, damage: 100 }, extra); battle.actions.useMove(m, p, { target: q }); battle.clearActiveMove(); return m; }
function power(p, q) { return battle.runEvent('BasePower', p, q, Dex.getActiveMove('tackle'), 100); }
describe('Approved Ultra Instinct and Burning Spirit rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const ability of ['Ultra Instinct', 'Burning Spirit']) it(ability + ' announces a rivalry once per actual encounter', () => {
		const [p, q] = setup(ability); q.setAbility('Burning Ego');
		const messages = () => battle.log.filter(line => line.startsWith('|-message|') && /Ego flares|Instinct sharpens/.test(line));
		const update = () => battle.eachEvent('Update');
		const before = messages().length; update(); assert.equal(messages().length, before + 2);
		update(); battle.turn++; update(); p.setAbility('No Ability'); p.setAbility(ability); update();
		assert.equal(messages().length, before + 2);
		p.addVolatile('gastroacid'); update(); p.removeVolatile('gastroacid'); update();
		assert.equal(messages().length, before + 2);
		battle.actions.switchIn(battle.p2.pokemon[1], 0); battle.actions.switchIn(q, 0); q.setAbility('Burning Ego'); update();
		assert.equal(messages().length, before + 4);
		battle.actions.switchIn(battle.p1.pokemon[1], 0); battle.actions.switchIn(p, 0); update();
		assert.equal(messages().length, before + 6);
	});
	it('rivalry announcements wait for an effective opposing matchup', () => {
		const [p, q] = setup('Ultra Instinct', 'holyterrain', true); q.setAbility('Ultra Ego');
		const messages = () => battle.log.filter(line => /Ego flares|Instinct sharpens/.test(line));
		battle.eachEvent('Update'); assert.equal(messages().length, 0);
		battle.field.terrain = ''; q.addVolatile('gastroacid'); battle.eachEvent('Update'); assert.equal(messages().length, 0);
		q.removeVolatile('gastroacid'); battle.eachEvent('Update'); assert.equal(messages().length, 2);
		battle.p1.active[1].setAbility('Ultra Ego'); battle.eachEvent('Update'); assert.equal(messages().length, 2);
	});

	for (const instinct of ['Ultra Instinct', 'Burning Spirit']) {
		for (const ego of ['Ultra Ego', 'Burning Ego', 'Perfect Ego', 'Unleashed Ego', 'Primal Ego']) {
			it(instinct + ' and ' + ego + ' inherit the rivalry without doubling retaliation', () => {
				const [p, q] = setup(instinct); q.setAbility(ego, null, null, true);
				hit(q, p, {multihit: 3}); assert.equal(p.hp, 3820);
				hit(q, p); assert.equal(p.hp, 3720);
				hit(p, q); assert.equal(q.boosts.atk, 1); assert.equal(q.boosts.spa, 1);
				hit(p, q); assert.equal(q.boosts.atk, 1); assert.equal(q.boosts.spa, 1);
			});
		}
	}
	for (const category of ['Physical', 'Special']) it(category + ' rivalry ignores stages only for the appropriate matchup and guard', () => {
		const [p, q] = setup(); q.setAbility('Ultra Ego');
		const stat = category === 'Physical' ? 'atk' : 'spa';
		const damage = () => {p.hp = 4000; hit(q, p, {damage: undefined, category}); return 4000 - p.hp;};
		const neutral = damage(); battle.turn++; q.boosts[stat] = 6;
		assert.equal(damage(), neutral); assert.equal(q.boosts[stat], 6);
		assert(damage() > neutral * 4, 'later attack uses positive stages and no guard');
		battle.turn++; q.boosts[stat] = -6; assert.equal(damage(), neutral); assert.equal(q.boosts[stat], -6);
		p.setAbility('No Ability'); const weakened = damage(); q.boosts[stat] = 0;
		assert(damage() > weakened * 3, 'penalties remain against unrelated targets');
	});
	it('the rivalry replaces favored reduction rather than stacking it', () => {
		const [p, q] = setup('Ultra Instinct', 'ashenbeachterrain'); q.setAbility('Ultra Ego');
		hit(q, p); assert.equal(p.hp, 3940);
	});
	for (const suppressed of ['source', 'target']) it('suppression of ' + suppressed + ' disables rivalry', () => {
		const [p, q] = setup(); q.setAbility('Ultra Ego'); (suppressed === 'source' ? q : p).addVolatile('gastroacid');
		hit(q, p); assert.equal(p.hp, suppressed === 'source' ? 3930 : 3900);
	});
	for (const field of ['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']) it('no rivalry on ' + field, () => {
		const [p, q] = setup('Ultra Instinct', field); q.setAbility('Ultra Ego'); hit(q, p); assert.equal(p.hp, 3900);
	});
	it('rivalry does not affect allied attacks or activate from an unrelated opposing Ego', () => {
		const [p, q] = setup('Ultra Instinct', '', true); battle.p1.active[1].setAbility('Ultra Ego');
		hit(battle.p1.active[1], p); assert.equal(p.hp, 3900);
		battle.p2.active[1].setAbility('Ultra Ego'); hit(q, p); assert.equal(p.hp, 3830);
	});
	it('Substitute retains boosted damage and does not spend the rivalry guard', () => {
		const [p, q] = setup(); q.setAbility('Ultra Ego'); q.boosts.atk = 6;
		p.addVolatile('substitute'); p.volatiles.substitute.hp = 2000;
		hit(q, p, {damage: undefined}); const boosted = 2000 - p.volatiles.substitute.hp;
		assert.equal(p.m.ultraInstinctGuardTurn, undefined); p.removeVolatile('substitute');
		hit(q, p, {damage: undefined}); assert(boosted > (4000 - p.hp) * 4);
	});

	it('Predator bypasses the first reduction without reserving it for a later attack', () => {
		const [p, q] = setup(); q.setAbility('Predator'); hit(q, p); assert.equal(p.hp, 3900);
		q.setAbility('No Ability'); hit(q, p); assert.equal(p.hp, 3800);
	});
	for (const species of ['Hitmonlee', 'Infernape', 'Sawk', 'Lycanroc']) it(species + ' keeps its selected Ultra Instinct and receives the revised effects', () => {
		const [p, q] = setup('Ultra Instinct', '', false, species); assert(Object.values(p.species.abilities).includes('Ultra Instinct'));
		hit(q, p); assert.equal(p.hp, 3930); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2250);
	});
	it('only true switching stamps this-turn entry, including foes who already acted', () => {
		const [p, q] = setup(); battle.queue.willMove = () => null; q.newlySwitched = true; assert.equal(power(p, q), 100);
		const replacement = battle.p2.pokemon[1]; battle.actions.switchIn(replacement, 0); assert.equal(replacement.m.enteredBattleTurn, battle.turn); assert.equal(power(p, replacement), 130);
		replacement.newlySwitched = false; replacement.moveThisTurnResult = true; assert.equal(power(p, replacement), 130); battle.turn++; assert.equal(power(p, replacement), 100);
	});
	it('Mega Evolution and copying do not restore an already spent defensive or healing allowance', () => {
		const [p, q] = setup('Ultra Instinct', '', false, 'Infernape'); hit(q, p); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2250);
		p.formeChange('Infernape-Mega', null, true); p.hp = 2250; p.maxhp = p.baseMaxhp = 4000; p.setAbility('Burning Spirit'); hit(q, p); assert.equal(p.hp, 2150); hit(p, q); assert.equal(p.hp, 2150);
	});
	for (const ability of ['Ultra Instinct', 'Burning Spirit']) it(ability + ' retains Mold Breaker and Inner Focus without accuracy or evasion entry boosts', () => {
		const [p, q] = setup(ability); const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyMove', p, q, move, move); assert.equal(move.ignoreAbility, true);
		assert(!p.addVolatile('flinch', q)); q.setAbility('Intimidate'); assert.equal(p.boosts.atk, 0);
		battle.field.terrain = 'newworldterrain'; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.accuracy, 0); assert.equal(p.boosts.evasion, 0);
	});
	for (const item of ['', 'Ability Shield']) it('Burning Spirit preserves component-specific Magma Armor bypass with ' + (item || 'no item'), () => {
		const [p, q] = setup('Burning Spirit'); p.setItem(item); q.setAbility('Mold Breaker'); const move = Dex.getActiveMove('watergun'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
		assert.equal(battle.runEvent('ModifySpA', q, p, move, 100), item ? 50 : 100);
		battle.clearActiveMove(); hit(q, p); assert.equal(p.hp, 3930); // Ultra Instinct itself is not a breakable component.
	});
	it('Burning Spirit preserves Magma Armor freeze cure and Dragon Den Fire immunity', () => {
		const [p, q] = setup('Burning Spirit'); assert.equal(p.trySetStatus('frz', q), false); p.status = 'frz'; battle.singleEvent('Update', p.getAbility(), p.abilityState, p); assert.equal(p.status, '');
		battle.field.terrain = 'dragonsdenterrain'; hit(q, p, { type: 'Fire' }); assert.equal(p.hp, 4000);
	});
	it('calculator executes the revised defensive reduction and whole-move recovery', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const scenario = { format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 16, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		const plain = calculateScenario(scenario).results[1]; scenario.actors[1].ability = 'Ultra Instinct'; const guarded = calculateScenario(scenario).results[1];
		for (const key of ['min', 'max']) assert(Math.abs(guarded[key] - plain[key] * 0.70) <= 2, key);
	});
	it('keeps Ultra Ego, Burning Ego, ordinary Opportunist and Magma Armor callbacks byte-identical', () => {
		const before = require('../../../artifacts/ultra-instinct-before.json'); for (const id of ['ultraego', 'burningego', 'opportunist', 'magmaarmor'])assert.deepEqual(Object.fromEntries(Object.entries(Dex.abilities.get(id)).filter(([,v]) => typeof v === 'function').map(([k, v]) => [k, v.toString()])), before.abilities[id].callbacks, id);
	});
	for (const ability of ['Ultra Instinct', 'Burning Spirit']) {
		it(ability + ' has target-specific queued/new-entry power, no screen punishment or stale newlySwitched bonus', () => {
			const [p, q] = setup(ability, '', true), other = battle.p2.active[1]; const original = battle.queue.willMove; battle.queue.willMove = target => target === q ? {} : null;
			assert.equal(power(p, q), 130); assert.equal(power(p, other), 100); battle.queue.willMove = () => null; q.newlySwitched = true; assert.equal(power(p, q), 100);
			q.m.enteredBattleTurn = battle.turn; assert.equal(power(p, q), 130); battle.turn++; assert.equal(power(p, q), 100);
			for (const screen of ['reflect', 'lightscreen', 'auroraveil']) { q.side.addSideCondition(screen, q); assert.equal(power(p, q), 100); }
			q.ability = 'battlebond'; q.abilityState = battle.initEffectState({ id: 'battlebond', target: q }); q.m.enteredBattleTurn = battle.turn; assert.equal(power(p, q), 100); battle.queue.willMove = original;
		});
		for (const [field, damage, heal] of [['', 70, 250], ['ashenbeachterrain', 65, 500], ['newworldterrain', 65, 500], ['starlightarenaterrain', 65, 500], ['coldeclipseterrain', 65, 500], ['fairytaleterrain', 70, 250]])it(ability + ' exact damage/heal limits on ' + (field || 'no field'), () => {
			const [p, q] = setup(ability, field); hit(q, p, { multihit: 3 }); assert.equal(p.hp, 4000 - 3 * damage); hit(q, p); assert.equal(p.hp, 4000 - 3 * damage - 100);
			p.hp = 2000; hit(p, q, { multihit: 3 }); assert.equal(p.hp, 2000 + heal); hit(p, q); assert.equal(p.hp, 2000 + heal);
			battle.turn++; hit(q, p); assert.equal(p.hp, 2000 + heal - damage); hit(p, q); assert.equal(p.hp, 2000 + 2 * heal - damage);
		});
		for (const field of ['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain'])it(ability + ' disables only Ultra Instinct on ' + field, () => {
			const [p, q] = setup(ability, field); q.m.enteredBattleTurn = battle.turn; assert.equal(power(p, q), 100); hit(q, p); assert.equal(p.hp, 3900); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2000);
			const move = Dex.getActiveMove('tackle'); battle.runEvent('ModifyMove', p, q, move, move); assert(!move.ignoreAbility);
		});
		it(ability + ' excludes Substitute-only and allied damage, hazards and residual damage from defensive budget', () => {
			const [p, q] = setup(ability, '', true); p.addVolatile('substitute'); p.volatiles.substitute.hp = 1000; hit(q, p); assert.equal(p.volatiles.substitute.hp, 900); assert.equal(p.m.ultraInstinctGuardTurn, undefined);
			p.removeVolatile('substitute'); hit(battle.p1.active[1], p); assert.equal(p.hp, 3900); battle.damage(100, p, q, Dex.conditions.get('spikes')); assert.equal(p.hp, 3800); assert.equal(p.m.ultraInstinctGuardTurn, undefined);
			hit(q, p); assert.equal(p.hp, 3730);
		});
		it(ability + ' starts reduction when a multi-hit move breaks Substitute and reaches HP', () => {
			const [p, q] = setup(ability); p.addVolatile('substitute'); p.volatiles.substitute.hp = 50; hit(q, p, { multihit: 3 }); assert.equal(p.hp, 3860); hit(q, p); assert.equal(p.hp, 3760);
		});
		it(ability + ' heals after all hits and only once across spread foes', () => {
			const [p, q] = setup(ability, '', true); p.hp = 2000; const samples = []; const damage = battle.damage; battle.damage = function (...args) { samples.push(p.hp); return damage.apply(this, args); };
			hit(p, q, { target: 'allAdjacentFoes', multihit: 3 }); assert.equal(p.hp, 2250); assert(samples.every(hp => hp === 2000));
		});
		it(ability + ' excludes ally/Substitute-only attacks and never revives a recoil KO', () => {
			const [p, q] = setup(ability, '', true); p.hp = 2000; hit(p, battle.p1.active[1]); assert.equal(p.hp, 2000); q.addVolatile('substitute'); q.volatiles.substitute.hp = 1000; hit(p, q); assert.equal(p.hp, 2000);
			q.removeVolatile('substitute'); p.hp = 1; hit(p, q, { recoil: [1, 1] }); assert.equal(p.hp, 0);
		});
		it(ability + ' blocks failed healing retries within a whole move but permits a later eligible move', () => {
			const [p, q] = setup(ability); p.hp = 2000; p.addVolatile('healblock'); hit(p, q, { multihit: 3 }); assert.equal(p.hp, 2000); assert.equal(p.m.ultraInstinctHealTurn, undefined);
			const attempted = p.m.ultraInstinctHealAttempt; p.removeVolatile('healblock'); battle.runEvent('AfterAttackResolved', p, q, attempted); assert.equal(p.hp, 2000); hit(p, q); assert.equal(p.hp, 2250);
		});
		it(ability + ' budgets survive ability replacement, Transform and real switching within the turn', () => {
			const [p, q] = setup(ability); hit(q, p); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2250); p.setAbility('No Ability'); p.setAbility(ability); hit(q, p); assert.equal(p.hp, 2150); hit(p, q); assert.equal(p.hp, 2150);
			p.transformInto(q); p.setAbility(ability); hit(q, p); assert.equal(p.hp, 2050); hit(p, q); assert.equal(p.hp, 2050);
			const turn = battle.turn; battle.actions.switchIn(battle.p1.pokemon[1], 0); battle.actions.switchIn(p, 0); assert.equal(battle.turn, turn); hit(q, p); assert.equal(p.hp, 1950); hit(p, q); assert.equal(p.hp, 1950);
		});
		it(ability + ' suppression disables benefits without spending the turn budgets', () => {
			const [p, q] = setup(ability); p.addVolatile('gastroacid'); hit(q, p); assert.equal(p.hp, 3900); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2000); assert.equal(p.m.ultraInstinctGuardTurn, undefined);
			p.removeVolatile('gastroacid'); hit(q, p); assert.equal(p.hp, 1930); hit(p, q); assert.equal(p.hp, 2180);
		});
	}
	it('Burning Spirit filters only copied accuracy/evasion and preserves ordinary Opportunist and copy-loop protection', () => {
		const [p, q] = setup('Burning Spirit', '', true), other = battle.p2.active[1]; other.setAbility('Opportunist');
		battle.boost({ atk: 1, def: 1, spa: 1, spd: 1, spe: 1, accuracy: 1, evasion: 1 }, q, q); battle.runEvent('AfterMove', q, p, Dex.getActiveMove('splash'));
		for (const stat of ['atk', 'def', 'spa', 'spd', 'spe'])assert.equal(p.boosts[stat], 1); assert.equal(p.boosts.accuracy, 0); assert.equal(p.boosts.evasion, 0); assert.equal(other.boosts.atk, 0);
		battle.runEvent('AfterMove', q, p, Dex.getActiveMove('splash')); assert.equal(p.boosts.atk, 1);
		p.setAbility('Opportunist'); battle.boost({ accuracy: 1, evasion: 1 }, q, q); battle.runEvent('AfterMove', q, p, Dex.getActiveMove('splash')); assert.equal(p.boosts.accuracy, 1); assert.equal(p.boosts.evasion, 1);
	});
	it('Mega Infernape gains only the revised package and keeps Proficient separate', () => {
		const [p, q] = setup('Burning Spirit', '', false, 'Infernape-Mega'); assert.deepEqual(p.getPassives(), ['proficient']); for (const id of ['ultrainstinct', 'moldbreaker', 'innerfocus', 'opportunist', 'magmaarmor'])assert(p.hasAbility(id), id);
		for (const id of ['selfsufficient', 'proficient', 'flamebody', 'ironfist', 'battlefervor', 'perfectego'])assert(!p.hasAbility(id), id);
		p.hp = 2000; battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 2000); const move = Dex.getActiveMove('flamethrower'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 130);
	});
	it('Burning Spirit keeps Magma Armor field entry and copies queued boosts once at Mega events', () => {
		const [p, q] = setup('Burning Spirit', 'coldeclipseterrain'); p.boosts.def = p.boosts.spd = 0; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1); assert.equal(p.boosts.accuracy, 0);
		battle.boost({ atk: 2, accuracy: 1 }, q, q); battle.runEvent('AfterMega', q); assert.equal(p.boosts.atk, 2); assert.equal(p.boosts.accuracy, 0); battle.runEvent('AfterMega', q); assert.equal(p.boosts.atk, 2);
	});
});
