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
function power(p, q, move = 'tackle') { return battle.runEvent('BasePower', p, q, Dex.getActiveMove(move), 100); }
describe('Approved Ultra Instinct and Inferno Ascendant rework', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	for (const [ability, field, remaining] of [
		['Ultra Instinct', '', 16], ['Ultra Instinct', 'newworldterrain', 22],
		['Inferno Ascendant', '', 16], ['Ultra Instinct', 'holyterrain', 1],
	]) {
		it(ability + ' settles damage before Focus Sash on ' + (field || 'neutral ground'), () => {
			const [holder, foe] = setup(ability, field);
			holder.hp = holder.maxhp = holder.baseMaxhp = 100;
			holder.setItem('focussash');
			hit(foe, holder, { damage: 120 });
			assert.equal(holder.hp, remaining);
			assert.equal(holder.item, remaining === 1 ? '' : 'focussash');
		});
	}
	it('leaves exactly 1 HP when a single guarded hit is still lethal', () => {
		const [holder, foe] = setup();
		holder.hp = holder.maxhp = holder.baseMaxhp = 100;
		holder.setItem('focussash');
		hit(foe, holder, { damage: 200 });
		assert.equal(holder.hp, 1);
		assert.equal(holder.item, '');
	});
	it('lets a later hit knock the holder out after Focus Sash saves it once', () => {
		const [holder, foe] = setup();
		holder.hp = holder.maxhp = holder.baseMaxhp = 100;
		holder.setItem('focussash');
		hit(foe, holder, { damage: 200, multihit: 2 });
		assert.equal(holder.hp, 0);
		assert.equal(holder.item, '');
	});
	it('applies the guard before Endure and never spends Focus Sash below full HP', () => {
		const [holder, foe] = setup();
		holder.hp = 80;
		holder.maxhp = holder.baseMaxhp = 100;
		holder.setItem('focussash');
		holder.addVolatile('endure', holder);
		hit(foe, holder, { damage: 200 });
		assert.equal(holder.hp, 1);
		assert.equal(holder.item, 'focussash');
	});
	describe('Dusk Lycanroc contact power', () => {
		it('uses one 1.3x boost per target, even when only one doubles foe is still queued', () => {
			const [dusk, pending] = setup('Twilight Instinct', '', true, 'Lycanroc-Dusk');
			const moved = battle.p2.active[1];
			assert.deepEqual(dusk.getPassives(), ['toughclaws']);
			battle.queue.addChoice({ choice: 'move', pokemon: pending, moveid: 'splash' });
			assert.equal(power(dusk, pending), 130, 'contact with both conditions previously reached 169');
			assert.equal(power(dusk, moved), 130, 'contact after the foe moved uses Tough Claws');
			assert.equal(power(dusk, pending, 'watergun'), 130, 'timing applies to noncontact');
			assert.equal(power(dusk, moved, 'watergun'), 100, 'neither bonus applies');

			const incoming = battle.p2.pokemon[2];
			battle.actions.switchIn(incoming, moved.position);
			assert.equal(incoming.m.enteredBattleTurn, battle.turn);
			assert.equal(power(dusk, incoming), 130);
			assert.equal(power(dusk, incoming, 'watergun'), 130);
		});
		it('keeps Tough Claws when Battle Bond, the field or suppression prevents the timing boost', () => {
			const [dusk, foe] = setup('Twilight Instinct', '', false, 'Lycanroc-Dusk');
			battle.queue.addChoice({ choice: 'move', pokemon: foe, moveid: 'splash' });
			foe.setAbility('Battle Bond', null, null, true);
			assert(foe.hasAbility('battlebond'));
			assert.equal(power(dusk, foe), 130);
			assert.equal(power(dusk, foe, 'watergun'), 100);
			foe.setAbility('No Ability', null, null, true);
			battle.field.setTerrain('hauntedterrain', dusk);
			assert.equal(power(dusk, foe), 130);
			assert.equal(power(dusk, foe, 'watergun'), 100);
			battle.field.clearTerrain();
			dusk.addVolatile('gastroacid', foe);
			assert(!dusk.hasAbility('ultrainstinct'));
			assert.equal(power(dusk, foe), 130);
			assert.equal(power(dusk, foe, 'watergun'), 100);
		});
		it('allows other contact and timing power combinations to stack', () => {
			const [dusk, foe] = setup('Strong Jaw', '', false, 'Lycanroc-Dusk');
			assert.equal(power(dusk, foe, 'crunch'), 195, 'Strong Jaw and Tough Claws');
			dusk.formeChange('Excadrill', null, true);
			dusk.setAbility('Ultra Instinct');
			assert.deepEqual(dusk.getPassives(), ['toughclaws']);
			battle.queue.addChoice({ choice: 'move', pokemon: foe, moveid: 'splash' });
			assert.equal(power(dusk, foe), 169, 'the same two boosts on another species');
		});
	});
	for (const ability of ['Ultra Instinct', 'Inferno Ascendant']) it(ability + ' announces a rivalry once per actual encounter', () => {
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

	for (const instinct of ['Ultra Instinct', 'Inferno Ascendant']) {
		for (const ego of ['Ultra Ego', 'Burning Ego', 'Perfect Ego', 'Unleashed Ego', 'Terra Ascendant']) {
			it(instinct + ' and ' + ego + ' inherit the rivalry without doubling retaliation', () => {
				const [p, q] = setup(instinct); q.setAbility(ego, null, null, true);
				hit(q, p, { multihit: 3 }); assert.equal(p.hp, 3820);
				hit(q, p); assert.equal(p.hp, 3720);
				hit(p, q); assert.equal(q.boosts.atk, 0); assert.equal(q.boosts.spa, 0);
				hit(p, q); battle.fieldEvent('Residual');
				assert.equal(q.boosts.atk, 1); assert.equal(q.boosts.spa, 1);
			});
		}
	}
	for (const category of ['Physical', 'Special']) it(category + ' rivalry ignores stages only for the appropriate matchup and guard', () => {
		const [p, q] = setup(); q.setAbility('Ultra Ego');
		const stat = category === 'Physical' ? 'atk' : 'spa';
		const damage = () => { p.hp = 4000; hit(q, p, { damage: undefined, category }); return 4000 - p.hp; };
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
		hit(q, p, { damage: undefined }); const boosted = 2000 - p.volatiles.substitute.hp;
		assert.equal(p.m.ultraInstinctGuardTurn, undefined); p.removeVolatile('substitute');
		hit(q, p, { damage: undefined }); assert(boosted > (4000 - p.hp) * 4);
	});

	it('Predator bypasses the first reduction without reserving it for a later attack', () => {
		const [p, q] = setup(); q.setAbility('Predator'); hit(q, p); assert.equal(p.hp, 3900);
		q.setAbility('No Ability'); hit(q, p); assert.equal(p.hp, 3800);
	});
	for (const species of ['Hitmonlee', 'Infernape', 'Sawk', 'Lycanroc']) it(species + ' receives Ultra Instinct through its assigned slot', () => {
		const ability = species === 'Lycanroc' ? 'Daybreak Rush' : 'Ultra Instinct';
		const [p, q] = setup(ability, '', false, species);
		assert(Object.values(p.species.abilities).includes(ability));
		assert(p.hasAbilityOrPassive('ultrainstinct'));
		hit(q, p); assert.equal(p.hp, 3930); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2250);
	});
	it('only true switching stamps this-turn entry, including foes who already acted', () => {
		const [p, q] = setup(); battle.queue.willMove = () => null; q.newlySwitched = true; assert.equal(power(p, q), 100);
		const replacement = battle.p2.pokemon[1]; battle.actions.switchIn(replacement, 0); assert.equal(replacement.m.enteredBattleTurn, battle.turn); assert.equal(power(p, replacement), 130);
		replacement.newlySwitched = false; replacement.moveThisTurnResult = true; assert.equal(power(p, replacement), 130); battle.turn++; assert.equal(power(p, replacement), 100);
	});
	it('Mega Evolution and copying do not restore an already spent defensive or healing allowance', () => {
		const [p, q] = setup('Ultra Instinct', '', false, 'Infernape'); hit(q, p); p.hp = 2000; hit(p, q); assert.equal(p.hp, 2250);
		p.formeChange('Infernape-Mega', null, true); p.hp = 2250; p.maxhp = p.baseMaxhp = 4000; p.setAbility('Inferno Ascendant'); hit(q, p); assert.equal(p.hp, 2150); hit(p, q); assert.equal(p.hp, 2150);
	});
	for (const ability of ['Ultra Instinct', 'Inferno Ascendant', 'Twilight Instinct', 'Aura Precision', 'Insight']) it(ability + ' respects Levitate and retains Inner Focus', () => {
		const [p, q] = setup(ability);
		assert(!p.hasAbility('moldbreaker'));
		q.setAbility('Levitate');
		battle.actions.useMove('earthquake', p, { target: q });
		assert.equal(q.hp, q.maxhp);
		q.setAbility('No Ability');
		battle.actions.useMove('earthquake', p, { target: q });
		assert(q.hp < q.maxhp);
		assert(!p.addVolatile('flinch', q)); q.setAbility('Intimidate'); assert.equal(p.boosts.atk, 0);
		battle.field.terrain = 'newworldterrain'; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.accuracy, 0); assert.equal(p.boosts.evasion, 0);
	});
	for (const ability of ['Ultra Instinct', 'Inferno Ascendant']) it(ability + ' blocks only opponents’ accuracy drops', () => {
		const [p, q] = setup(ability, '', true);
		q.setAbility('Ultra Ego');
		battle.actions.useMove('sandattack', q, { target: p });
		assert.equal(p.boosts.accuracy, 0);
		battle.boost({ accuracy: -1, def: -1 }, p, q);
		assert.equal(p.boosts.accuracy, 0);
		assert.equal(p.boosts.def, -1);
		battle.boost({ accuracy: -1 }, p, p);
		battle.boost({ accuracy: -1 }, p, battle.p1.active[1]);
		assert.equal(p.boosts.accuracy, -2);
		battle.boost({ accuracy: 1 }, p, q);
		assert.equal(p.boosts.accuracy, -1);
	});
	it('preserves passive Levitate against Ultra Ego only while the holder has active Ultra Instinct', () => {
		const [p, q] = setup('Twilight Instinct', '', false, 'Weezing');
		assert(p.getPassives().includes('levitate'));
		q.setAbility('Ultra Ego');
		battle.actions.useMove('earthquake', q, { target: p });
		assert.equal(p.hp, p.maxhp);
		p.setAbility('No Ability');
		battle.actions.useMove('earthquake', q, { target: p });
		assert(p.hp < p.maxhp);
	});
	for (const item of ['', 'Ability Shield']) it('Inferno Ascendant protects Magma Armor from bypass with ' + (item || 'no item'), () => {
		const [p, q] = setup('Inferno Ascendant'); p.setItem(item); q.setAbility('Mold Breaker'); const move = Dex.getActiveMove('watergun'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
		assert.equal(battle.runEvent('ModifySpA', q, p, move, 100), 50);
		battle.clearActiveMove(); hit(q, p); assert.equal(p.hp, 3930); // Ultra Instinct itself is not a breakable component.
	});
	for (const ability of ['Ultra Instinct', 'Aura Precision', 'Inferno Ascendant', 'Twilight Instinct', 'Insight']) {
		for (const attacker of ['Mold Breaker', 'Teravolt', 'Turboblaze', 'Ultra Ego', 'Burning Ego']) {
			it(ability + ' protects components and passives against ' + attacker, () => {
				const [p, q] = setup(ability); q.setAbility(attacker);
				const move = Dex.getActiveMove('tackle');
				battle.runEvent('ModifyMove', q, p, move, move);
				assert.equal(move.ignoreAbility, true);
				battle.setActiveMove(move, q, p);
				assert.equal(battle.suppressingAbility(p), false);
				assert.equal(battle.suppressingAbility(p, Dex.abilities.get('shielddust')), false);
				assert.equal(battle.suppressingAbility(p, Dex.abilities.get('magmaarmor')), false);
				battle.clearActiveMove();
			});
		}
	}
	it('Aura Precision blocks guaranteed secondary effects through Mold Breaker', () => {
		const [p, q] = setup('Aura Precision'); q.setAbility('Mold Breaker');
		hit(q, p, { secondary: { chance: 100, status: 'par' } });
		assert.equal(p.status, ''); assert.equal(p.hp, 3930);
	});
	it('ordinary Magma Armor remains bypassable without Ultra Instinct', () => {
		const [p, q] = setup('Magma Armor'); q.setAbility('Mold Breaker');
		const move = Dex.getActiveMove('watergun'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
		assert.equal(battle.runEvent('ModifySpA', q, p, move, 100), 100);
	});
	it('Gastro Acid still disables Ultra Instinct bypass protection', () => {
		const [p, q] = setup('Aura Precision'); p.addVolatile('gastroacid');
		const move = Dex.getActiveMove('tackle'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
		assert.equal(!!battle.suppressingAbility(p, Dex.abilities.get('shielddust')), true);
	});
	it('Neutralizing Gas still disables Ultra Instinct bypass protection', () => {
		const [p, q] = setup('Aura Precision'); q.setAbility('Neutralizing Gas');
		const move = Dex.getActiveMove('tackle'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
		assert.equal(!!battle.suppressingAbility(p, Dex.abilities.get('shielddust')), true);
	});
	for (const field of ['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']) {
		it(field + ' still disables Ultra Instinct bypass protection', () => {
			const [p, q] = setup('Aura Precision', field);
			const move = Dex.getActiveMove('tackle'); move.ignoreAbility = true; battle.setActiveMove(move, q, p);
			assert.equal(!!battle.suppressingAbility(p, Dex.abilities.get('shielddust')), true);
		});
	}
	it('Inferno Ascendant preserves Magma Armor freeze cure and Dragon Den Fire immunity', () => {
		const [p, q] = setup('Inferno Ascendant'); assert.equal(p.trySetStatus('frz', q), false); p.status = 'frz'; battle.singleEvent('Update', p.getAbility(), p.abilityState, p); assert.equal(p.status, '');
		battle.field.terrain = 'dragonsdenterrain'; hit(q, p, { type: 'Fire' }); assert.equal(p.hp, 4000);
	});
	it('calculator executes the revised defensive reduction and whole-move recovery', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const scenario = { format: 'gen9nofieldsinglesgame', move: 'Tackle', samples: 16, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
		const plain = calculateScenario(scenario).results[1]; scenario.actors[1].ability = 'Ultra Instinct'; const guarded = calculateScenario(scenario).results[1];
		for (const key of ['min', 'max']) assert(Math.abs(guarded[key] - plain[key] * 0.70) <= 2, key);
	});
	it('preserves callbacks outside the later approved Ego hit rework', () => {
		const before = require('../../../artifacts/ultra-instinct-before.json');
		for (const id of ['ultraego', 'burningego', 'opportunist']) {
			// The terrain check now comes from a shared module; its coverage stays the same.
			const current = Object.fromEntries(Object.entries(Dex.abilities.get(id))
				.filter(([, value]) => typeof value === 'function')
				.map(([key, fn]) => [key, fn.toString()
					.replaceAll('(0, import_ultra_rivalry.isUltraSuppressedTerrain)', 'isUltraSuppressedTerrain')]));
			const expected = { ...before.abilities[id].callbacks };
			if (id === 'ultraego') {
				expected.onModifyMove = expected.onModifyMove.replace('move.ignoreAbility = true;', 'move.ultraAbilityBypass = true;\n      move.ignoreAbility = true;');
			}
			if (id !== 'opportunist') {
				for (const hook of ['onDamagingHit', 'onSourceDamagingHit', 'boostedField']) {
					delete current[hook];
					delete expected[hook];
				}
			}
			assert.deepEqual(current, expected, id);
		}
	});
	for (const ability of ['Ultra Ego', 'Burning Ego']) it(ability + ' boosts on alternate qualifying turns, including multihit attacks', () => {
		const [p, q] = setup(ability);
		for (const stage of [1, 1, 2, 2]) {
			hit(q, p, { multihit: 3 });
			battle.fieldEvent('Residual');
			battle.turn++;
			assert.equal(p.boosts.atk, stage);
			assert.equal(p.boosts.spa, stage);
		}
	});
	for (const ability of ['Ultra Instinct', 'Inferno Ascendant']) {
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
			battle.boost({ accuracy: -1 }, p, q, Dex.moves.get('sandattack')); assert.equal(p.boosts.accuracy, -1);
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
	it('moves Opportunist to base Infernape and removes it from the Mega', () => {
		assert.equal(Dex.species.get('Infernape').abilities[0], 'Opportunist');
		const [p, q] = setup('Inferno Ascendant');
		battle.boost({ atk: 1, def: 1, spa: 1, spd: 1, spe: 1, accuracy: 1, evasion: 1 }, q, q);
		battle.runEvent('AfterMove', q, p, Dex.getActiveMove('splash'));
		for (const value of Object.values(p.boosts)) assert.equal(value, 0);
		p.setAbility('Opportunist');
		battle.boost({ atk: 1, accuracy: 1 }, q, q);
		battle.runEvent('AfterMove', q, p, Dex.getActiveMove('splash'));
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.accuracy, 1);
	});
	it('Mega Infernape gains only the revised package and keeps Proficient separate', () => {
		const [p, q] = setup('Inferno Ascendant', '', false, 'Infernape-Mega'); assert.deepEqual(p.getPassives(), ['proficient']); for (const id of ['ultrainstinct', 'innerfocus', 'magmaarmor'])assert(p.hasAbility(id), id);
		for (const id of ['moldbreaker', 'opportunist', 'selfsufficient', 'proficient', 'flamebody', 'ironfist', 'battlefervor', 'perfectego'])assert(!p.hasAbility(id), id);
		p.hp = 2000; battle.singleEvent('Residual', p.getAbility(), p.abilityState, p); assert.equal(p.hp, 2000); const move = Dex.getActiveMove('flamethrower'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 130);
	});
	it('Inferno Ascendant keeps Magma Armor field entry without copying queued boosts at Mega events', () => {
		const [p, q] = setup('Inferno Ascendant', 'infernaleclipseterrain'); p.boosts.def = p.boosts.spd = 0; battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spd, 1); assert.equal(p.boosts.accuracy, 0);
		battle.boost({ atk: 2, accuracy: 1 }, q, q); battle.runEvent('AfterMega', q); assert.equal(p.boosts.atk, 0); assert.equal(p.boosts.accuracy, 0); battle.runEvent('AfterMega', q); assert.equal(p.boosts.atk, 0);
	});
});
