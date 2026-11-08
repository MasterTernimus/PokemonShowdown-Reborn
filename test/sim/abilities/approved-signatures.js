'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim/dex');

describe('Approved signature batch', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });
	function start(ability, foeAbility = 'No Ability', species = 'Mew', item = '') {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [
			[{ species, ability, item, moves: ['splash', 'tackle', 'protect', 'recover'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle', 'protect'] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		battle.randomizer = damage => damage;
		battle.randomChance = (n, d) => n >= d;
		return [battle.p1.active[0], battle.p2.active[0]];
	}
	function use(source, target, id = 'tackle', extra = {}) {
		const move = battle.dex.getActiveMove(id);
		if (!source.moveSlots.some(slot => slot.id === move.id)) {
			source.moveSlots.push({ move: move.name, id: move.id, pp: 20, maxpp: 20, target: move.target,
				disabled: false, disabledSource: '', used: false });
		}
		Object.assign(move, { accuracy: true, willCrit: false }, extra);
		battle.runEvent('ModifyPriority', source, target, move, move.priority);
		battle.actions.runMove(move, source, source.getLocOf(target));
		return move;
	}
	function screens(target) {
		for (const id of ['reflect', 'lightscreen', 'auroraveil']) target.side.addSideCondition(id, target);
	}
	it('keeps the approved base slots and Magcargo stats scoped', () => {
		assert.deepEqual(Dex.species.get('magcargo').baseStats, { hp: 95, atk: 50, def: 145, spa: 115, spd: 105, spe: 30 });
		assert.equal(Dex.species.get('magcargo').bst, 540);
		assert.deepEqual(Dex.species.get('kleavor').abilities, { 0: 'Flint Fracture', 1: 'Sheer Force', H: 'Sharpness' });
		assert.deepEqual(Dex.species.get('grafaiai').abilities, { 0: 'Unburden', 1: 'Toxic Signature', H: 'Sticky Hold' });
		assert.deepEqual(Dex.species.get('klefki').abilities, { 0: 'Adhesive Armor', 1: 'Master Key', H: 'Magician' });
		assert.deepEqual(Dex.species.get('chimecho').abilities,
			{ 0: 'Temple Chime', 1: 'Restorative Chime', H: 'Dissonant Chime' });
		assert.equal(Dex.species.get('glaliemega').abilities[0], 'Freezer Burn');
	});
	it('Scrapbreaker removes screens through Substitute without grounding its holder', () => {
		const [source, target] = start('Scrapbreaker');
		target.setType('Flying'); screens(target); target.addVolatile('substitute');
		use(source, target, 'gigatonhammer', { basePower: 10 });
		assert(!target.side.sideConditions.reflect && !target.side.sideConditions.lightscreen);
		assert(!target.volatiles.smackdown);
	});
	it('Scrapbreaker grounds HP hits and preserves Protect, accuracy and Hammer cooldown', () => {
		const [source, target] = start('Scrapbreaker');
		target.setType('Flying'); screens(target); target.addVolatile('protect');
		use(source, target, 'gigatonhammer', { basePower: 10 });
		assert(target.side.sideConditions.reflect);
		target.removeVolatile('protect'); source.lastMove = null;
		use(source, target, 'gigatonhammer', { basePower: 10, accuracy: 0 });
		assert(target.side.sideConditions.reflect);
		source.lastMove = null;
		use(source, target, 'gigatonhammer', { basePower: 10 });
		assert(target.volatiles.smackdown); assert(!target.side.sideConditions.reflect);
		assert.equal(Dex.moves.get('gigatonhammer').flags.cantusetwice, 1);
	});
	it('Flint Fracture breaks only physical screens and refreshes two residual ticks', () => {
		const [source, target] = start('Flint Fracture'); screens(target);
		use(source, target, 'slash', { basePower: 10 });
		assert(target.side.sideConditions.lightscreen); assert(!target.side.sideConditions.reflect);
		const hp = target.hp, tick = Math.floor(target.maxhp / 16);
		battle.fieldEvent('Residual'); assert.equal(target.hp, hp - tick);
		battle.turn++;
		use(source, target, 'slash', { basePower: 10 });
		const refreshed = target.hp;
		battle.fieldEvent('Residual'); battle.turn++; battle.fieldEvent('Residual');
		assert.equal(target.hp, refreshed - tick * 2); assert(!target.volatiles.flintfracture);
	});
	it('Toxic Signature includes Unnerve and never adds a second poison layer', () => {
		const [source, target] = start('Toxic Signature');
		assert(source.hasAbility('unnerve'));
		assert.equal(battle.runEvent('TryEatItem', target, null, null, Dex.items.get('sitrusberry')), false);
		use(source, target, 'poisonsting', { multihit: 3, basePower: 1 });
		assert.equal(target.side.sideConditions.toxicspikes.layers, 1);
		target.side.removeSideCondition('toxicspikes'); target.addVolatile('substitute');
		use(source, target, 'poisonsting', { basePower: 1 });
		assert(!target.side.sideConditions.toxicspikes);
	});
	it('Toxic Signature ignores poisoned-target stages but not base accuracy', () => {
		const [source, target] = start('Toxic Signature'); target.setStatus('psn');
		source.boosts.accuracy = -6; target.boosts.evasion = 6;
		const rolls = [];
		battle.randomChance = (n, d) => { if (d === 100) rolls.push(n); return false; };
		const hp = target.hp;
		use(source, target, 'tackle', { accuracy: 80 });
		assert(rolls.includes(80)); assert.equal(target.hp, hp);
	});
	it('Wicked Weave charges only successful status moves, consumes once and expires', () => {
		const [source, target] = start('Wicked Weave');
		use(source, source, 'recover'); assert(!source.volatiles.wickedweave);
		use(source, source, 'swordsdance'); assert(source.volatiles.wickedweave);
		use(source, target, 'tackle', { basePower: 1, multihit: 3 });
		assert.equal(target.boosts.spe, -1); assert(!source.volatiles.wickedweave);
		use(source, source, 'swordsdance');
		battle.fieldEvent('Residual'); assert(source.volatiles.wickedweave);
		battle.turn++; battle.fieldEvent('Residual'); assert(!source.volatiles.wickedweave);
	});
	for (const ability of ['Vault Keeper', 'Wicked Weave']) {
		it(`${ability} retains Prankster and its Dark-target protection`, () => {
			const [source, target] = start(ability); target.setType('Dark');
			const move = battle.dex.getActiveMove('thunderwave');
			assert.equal(battle.runEvent('ModifyPriority', source, target, move, 0), 1);
			use(source, target, 'thunderwave'); assert.equal(target.status, '');
		});
	}
	it('Klefki preserves its item through selected Adhesive Armor but permits screen removal', () => {
		const [keeper, attacker] = start('Adhesive Armor', 'No Ability', 'Klefki'); screens(keeper); keeper.setItem('leftovers');
		use(attacker, keeper, 'brickbreak', { basePower: 1 });
		assert(!keeper.side.sideConditions.reflect);
		use(attacker, keeper, 'knockoff', { basePower: 1 }); assert.equal(keeper.item, 'leftovers');
		attacker.setAbility('Mold Breaker');
		use(attacker, keeper, 'brickbreak', { basePower: 1 }); assert(!keeper.side.sideConditions.reflect);
	});
	it('Vault Keeper does not prevent screen expiration or Infiltrator damage bypass', () => {
		const [keeper, attacker] = start('Vault Keeper', 'Infiltrator'); screens(keeper);
		keeper.side.sideConditions.reflect.duration = 1;
		battle.fieldEvent('Residual'); assert(!keeper.side.sideConditions.reflect);
		const move = battle.dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', attacker, keeper, move, move);
		assert(move.infiltrates);
	});
	it('Master Key bypasses Substitute and target ability without priority or Protect bypass', () => {
		const [source, target] = start('Master Key', 'Limber'); target.addVolatile('substitute');
		const move = battle.dex.getActiveMove('thunderwave');
		assert.equal(battle.runEvent('ModifyPriority', source, target, move, 0), 0);
		use(source, target, 'thunderwave'); assert.equal(target.status, 'par');
		target.cureStatus(); target.addVolatile('protect');
		use(source, target, 'thunderwave'); assert.equal(target.status, '');
	});
	for (const [types, multiplier] of [[['Normal'], 1], [['Ground'], 0.5], [['Water', 'Ground'], 1], [['Ground', 'Dragon'], 0.25]]) {
		it(`Grounding Tail preserves Electric type factors against ${types}`, () => {
			const [source, target] = start('Grounding Tail'); target.setType(types);
			const move = battle.dex.getActiveMove('thunderbolt');
			battle.runEvent('ModifyMove', source, target, move, move);
			assert(target.runImmunity(move));
			assert.equal(2 ** target.runEffectiveness(move), multiplier);
		});
	}
	it('Grounding Tail retains absorption abilities and removes Electric move recoil only', () => {
		const [source, target] = start('Grounding Tail', 'Volt Absorb'); target.setType('Ground');
		const hp = source.hp;
		use(source, target, 'wildcharge'); assert.equal(target.hp, target.maxhp); assert.equal(source.hp, hp);
		target.setAbility('No Ability'); use(source, target, 'wildcharge');
		assert(target.hp < target.maxhp); assert.equal(source.hp, hp);
		const ground = battle.dex.getActiveMove('earthquake'); source.setType('Electric');
		assert.equal(source.runEffectiveness(ground), 1);
	});
	it('Frozen Feast drains only already-slowed bite targets and lowers Speed once after multi-hit Ice', () => {
		const [source, target] = start('Frozen Feast'); source.hp -= 100;
		const before = source.hp;
		use(source, target, 'icefang', { basePower: 10, multihit: 3, secondaries: undefined });
		assert.equal(source.hp, before); assert.equal(target.boosts.spe, -1);
		const hp = target.hp;
		use(source, target, 'bite', { basePower: 10, secondaries: undefined });
		assert.equal(source.hp, before + Math.round((hp - target.hp) / 4));
	});
	it('Frozen Feast does not double a successful move Speed drop or drain Substitute damage', () => {
		const [source, target] = start('Frozen Feast');
		use(source, target, 'icywind', { basePower: 10 }); assert.equal(target.boosts.spe, -1);
		target.addVolatile('substitute'); source.hp -= 100; const hp = source.hp;
		use(source, target, 'bite', { basePower: 1 }); assert.equal(source.hp, hp);
	});
	it('Frozen Feast drain respects Liquid Ooze and Heal Block', () => {
		const [source, target] = start('Frozen Feast', 'Liquid Ooze'); target.boosts.spe = -1;
		source.hp -= 100; const hp = source.hp;
		use(source, target, 'bite', { basePower: 10 }); assert(source.hp < hp);
		target.setAbility('No Ability'); source.addVolatile('healblock'); const blocked = source.hp;
		use(source, target, 'bite', { basePower: 10 }); assert.equal(source.hp, blocked);
	});
	it('Cinder Scales retains Flame Body and Swarm; Shield Dust is native only', () => {
		const [source, target] = start('Cinder Scales');
		for (const id of ['flamebody', 'swarm']) assert(source.hasAbility(id));
		battle.field.setTerrain('coldeclipseterrain', source);
		battle.singleEvent('Start', source.getAbility(), source.abilityState, source);
		assert.equal(source.boosts.def, 0); assert.equal(source.boosts.spd, 0);
		battle.field.setTerrain('infernaleclipseterrain', source);
		battle.singleEvent('Start', source.getAbility(), source.abilityState, source);
		assert.equal(source.boosts.def, 1); assert.equal(source.boosts.spd, 1);
		const secondary = [{ chance: 100, status: 'par' }];
		assert.deepEqual(battle.runEvent('ModifySecondaries', source, target, battle.dex.getActiveMove('tackle'), secondary), secondary);
        source.formeChange('Volcarona', null, true); source.setAbility('Cinder Scales');
        assert.deepEqual(source.getPassives(), ['shielddust']);
        assert.deepEqual(battle.runEvent('ModifySecondaries', source, target, battle.dex.getActiveMove('tackle'), secondary), []);
	});
	it('Spore Shroud reduces contact attacks rather than all physical damage', () => {
		const [source, target] = start('Spore Shroud');
		assert(source.hasAbility('effectspore'));
		for (const [id, expected] of [['tackle', 75], ['earthquake', 100]]) {
			assert.equal(battle.runEvent('ModifyDamage', target, source, battle.dex.getActiveMove(id), 100), expected);
		}
	});
	it('Primeval Hunt uses ordinary critical rolls and respects Battle Armor', () => {
		const [source, target] = start('Primeval Hunt'); const crits = [];
		battle.onEvent('DamagingHit', battle.format, (damage, defender, attacker, move) => crits.push(defender.getMoveHitData(move).crit));
		use(source, target, 'rockblast', { basePower: 1, willCrit: undefined });
		assert.deepEqual(crits, [false, false, false, false, false]);
		crits.length = 0; target.setAbility('Battle Armor');
		use(source, target, 'rockblast', { basePower: 1, willCrit: undefined });
		assert(crits.every(crit => !crit));
		assert(source.hasAbility('steadfast'));
		assert(!source.hasAbility('owntempo'));
		assert(!source.hasAbility('battlearmor'));
	});
	it('Rimebreaker clears only Rocks and one Spikes layer once per turn', () => {
		const [source, target] = start('Rimebreaker');
		for (const id of ['stealthrock', 'spikes', 'spikes', 'spikes', 'toxicspikes', 'stickyweb']) source.side.addSideCondition(id, target);
		use(source, target, 'tackle', { basePower: 1, multihit: 3 });
		assert(!source.side.sideConditions.stealthrock); assert.equal(source.side.sideConditions.spikes.layers, 2);
		assert(source.side.sideConditions.toxicspikes && source.side.sideConditions.stickyweb);
		use(source, target, 'icebeam', { basePower: 1 }); assert.equal(source.side.sideConditions.spikes.layers, 2);
		battle.turn++; use(source, target, 'icebeam', { basePower: 1 }); assert.equal(source.side.sideConditions.spikes.layers, 1);
	});
	it('Pressure Kiln stores opposing HP damage, caps, consumes on Fire HP hit and respects Substitute', () => {
		const [source, target] = start('Pressure Kiln');
		const hp = source.hp; use(target, source, 'tackle');
		const stored = Math.floor((hp - source.hp) / 2); assert.equal(source.m.approvedSignatures.pressure, stored);
		target.addVolatile('substitute'); use(source, target, 'ember', { basePower: 1 });
		assert.equal(source.m.approvedSignatures.pressure, stored);
		target.removeVolatile('substitute'); const before = source.hp; use(source, target, 'ember', { basePower: 1 });
		assert.equal(source.hp, before + stored); assert.equal(source.m.approvedSignatures.pressure, 0);
	});
	it('Evaporate preserves Dry Skin and grants a single special veil after Water absorption', () => {
		const [source, target] = start('Evaporate'); source.hp -= 100;
		use(target, source, 'watergun'); assert(source.m.approvedSignatures.steamVeil);
		const hp = source.hp;
		use(target, source, 'nightshade'); assert.equal(hp - source.hp, 75);
		assert(!source.m.approvedSignatures.steamVeil);
		use(target, source, 'watergun'); assert(!source.m.approvedSignatures.steamVeil);
		assert(source.hasAbility('dryskin'));
	});
	it('Evaporate ends ordinary rain but never Primordial Sea', () => {
		const [source] = start('Evaporate'); battle.field.setWeather('raindance', source);
		battle.singleEvent('Start', source.getAbility(), source.abilityState, source);
		assert.equal(battle.field.weather, ''); assert(source.m.approvedSignatures.steamVeil);
		battle.field.setWeather('primordialsea', source);
		battle.singleEvent('Start', source.getAbility(), source.abilityState, source);
		assert.equal(battle.field.weather, 'primordialsea');
	});
	it('Shattercrust takes normal physical damage and sets only Rocks', () => {
		const [source, target] = start('Shattercrust'); const damages = [];
		battle.onEvent('DamagingHit', battle.format, damage => damages.push(damage));
		use(target, source, 'tackle', { basePower: 10, multihit: 3 });
		assert.equal(damages[0], damages[1]); assert.equal(damages[1], damages[2]);
		assert(target.side.sideConditions.stealthrock); assert(!target.side.sideConditions.spikes);
	});
	it('Shattercrust retains Crumbling Shell water-field exclusions', () => {
		const [source, target] = start('Shattercrust'); battle.field.setTerrain('underwaterterrain', source);
		use(target, source, 'tackle', { basePower: 1 }); assert(!target.side.sideConditions.stealthrock);
		assert(!target.side.sideConditions.spikes); // Underwater also prevents ordinary Spikes placement.
	});
	it('Restorative Chime no longer cures healing recipients', () => {
		const [source] = start('Restorative Chime'); source.setStatus('par');
		use(source, source, 'recover'); assert.equal(source.status, 'par');
		source.hp -= 50; use(source, source, 'recover'); assert.equal(source.status, 'par'); source.cureStatus();
		source.setStatus('brn');
		source.hp -= 50;
		use(source, source, 'recover');
		assert.equal(source.status, 'brn');
	});
	it('Restorative Chime Wish no longer cures its eventual recipient', () => {
		const [source] = start('Restorative Chime');
		use(source, source, 'wish'); assert(!source.m.approvedSignatures.restorativeUsed);
		const recipient = source.side.pokemon[1]; recipient.hp -= 100; recipient.setStatus('brn');
		battle.actions.switchIn(recipient, 0);
		battle.fieldEvent('Residual'); battle.turn++; battle.fieldEvent('Residual');
		assert.equal(recipient.status, 'brn'); assert(!source.m.approvedSignatures.restorativeUsed);
	});
	it('Restorative Chime heals successful sound moves once per turn, not blocked sounds', () => {
		const [source, target] = start('Restorative Chime', 'Soundproof'); source.hp -= 100; const hp = source.hp;
		use(source, target, 'hypervoice', { basePower: 1 }); assert.equal(source.hp, hp);
		target.setAbility('No Ability'); use(source, target, 'hypervoice', { basePower: 1 });
		assert.equal(source.hp, hp + Math.floor(source.maxhp / 8)); const healed = source.hp;
		use(source, target, 'hypervoice', { basePower: 1 }); assert.equal(source.hp, healed);
	});
	it('Dissonant Chime blocks enemy sound and repeatedly removes positive boosts', () => {
		const [source, target] = start('Dissonant Chime'); const hp = source.hp;
		use(target, source, 'hypervoice'); assert.equal(source.hp, hp);
		use(source, target, 'hypervoice', { basePower: 1 }); assert(!source.m.approvedSignatures?.dissonantUsed);
		target.boosts.atk = 2; target.boosts.spe = -1; target.addVolatile('substitute');
		use(source, target, 'hypervoice', { basePower: 1 });
		assert.equal(target.boosts.atk, 0); assert.equal(target.boosts.spe, -1);
		target.boosts.def = 2; use(source, target, 'hypervoice', {basePower: 1}); assert.equal(target.boosts.def, 0);
	});
	it('Grave Hunger drains Ghost HP damage, steals actual prevented healing and caps combined gain', () => {
		const [source, target] = start('Grave Hunger'); source.hp -= 150;
		const hp = source.hp, targetHP = target.hp;
		use(source, target, 'shadowball', { basePower: 10 });
		assert.equal(source.hp - hp, Math.round((targetHP - target.hp) / 4));
		target.hp -= 100; const missing = target.maxhp - target.hp;
		const result = battle.heal(100, target, target, battle.dex.moves.get('recover'));
		assert.equal(result, Math.min(50, missing));
		assert.equal(source.hp - hp, Math.floor(source.maxhp / 8));
		const capped = source.hp;
		battle.heal(40, target, target, battle.dex.moves.get('recover')); assert.equal(source.hp, capped);
	});
	it('Grave Hunger does not heal on Substitute, doubles no existing drain, and respects Liquid Ooze', () => {
		const [source, target] = start('Grave Hunger', 'Liquid Ooze'); source.hp -= 100; const hp = source.hp;
		target.addVolatile('substitute'); use(source, target, 'shadowball', { basePower: 1 }); assert.equal(source.hp, hp);
		target.removeVolatile('substitute'); use(source, target, 'shadowball', { basePower: 10 }); assert(source.hp < hp);
		target.setAbility('No Ability'); const before = source.hp, targetHP = target.hp;
		use(source, target, 'shadowball', { basePower: 10, drain: [1, 2] });
		assert.equal(source.hp - before, Math.round((targetHP - target.hp) / 2));
	});
	it('Grave Hunger leaves bench and Regenerator healing alone and ends on ability loss', () => {
		const [source, target] = start('Grave Hunger'); target.hp -= 100;
		assert.equal(battle.heal(40, target, target, battle.dex.abilities.get('regenerator')), 40);
		source.setAbility('No Ability'); assert.equal(battle.heal(40, target, target, battle.dex.moves.get('recover')), 40);
	});
	it('Dusk Ego retains the legacy ID and only the approved components', () => {
		const [source] = start('Dusk Ego');
		assert.equal(source.ability, 'duskdrive'); assert.equal(Dex.abilities.get('Dusk Drive').name, 'Dusk Ego');
		for (const id of ['keeneye', 'ultraego']) assert(source.hasAbility(id));
		for (const id of ['battlefervor', 'precision', 'opportunist']) assert(!source.hasAbility(id));
	});
	it('Dusk Ego boosts once per multi-hit attack and retains Keen Eye without Precision or berry blocking', () => {
		const [source, target] = start('Dusk Ego');
		assert.notEqual(battle.runEvent('TryEatItem', target, null, null, Dex.items.get('sitrusberry')), false);
		use(target, source, 'tackle', { basePower: 1, multihit: 3 });
		assert.equal(source.boosts.atk, 1); assert.equal(source.boosts.spa, 1);
		battle.boost({ accuracy: -1 }, source, target); assert.equal(source.boosts.accuracy, 0);
		const move = battle.dex.getActiveMove('airslash'); battle.runEvent('ModifyMove', source, target, move, move);
		assert.equal(move.accuracy, 95); assert.equal(move.ignoreEvasion, true); assert.equal(move.ignoreAbility, true);
		battle.boost({ def: 2 }, target, target); battle.fieldEvent('Residual'); assert.equal(source.boosts.def, 0);
	});
	it('Twilight Instinct retains Ultra Instinct attack timing and copies opposing boosts', () => {
		const [source, target] = start('Twilight Instinct');
		assert(source.hasAbility('ultrainstinct')); assert(source.hasAbility('opportunist'));
		const move = battle.dex.getActiveMove('tackle');
		battle.queue.willMove = pokemon => pokemon === target ? { choice: 'move' } : null;
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 130);
		battle.boost({ def: 2 }, target, target); battle.fieldEvent('Residual'); assert.equal(source.boosts.def, 2);
		assert.equal(battle.runEvent('ModifyPriority', source, target, move, 0), 0);
	});
	it('Twilight Instinct does not retain the retired first-hit priority budget', () => {
		const [source, target] = start('Twilight Instinct');
		use(target, source, 'tackle', { basePower: 1 });
		battle.turn++;
		assert.equal(battle.runEvent('ModifyPriority', source, target, battle.dex.getActiveMove('tackle'), 0), 0);
		source.setAbility('No Ability'); source.setAbility('Twilight Instinct');
		assert.equal(battle.runEvent('ModifyPriority', source, target, battle.dex.getActiveMove('tackle'), 0), 0);
		battle.actions.switchIn(source.side.pokemon[1], 0); battle.actions.switchIn(source, 0);
		assert.equal(battle.runEvent('ModifyPriority', source, target, battle.dex.getActiveMove('tackle'), 0), 0);
	});
	it('Twilight Instinct protects the whole first attack each turn without refreshing on ability replacement', () => {
		const [source, target] = start('Twilight Instinct');
		source.hp = source.maxhp = 10000;
		const damages = [];
		battle.onEvent('DamagingHit', battle.format, (damage, defender) => {
			if (defender === source) damages.push(damage);
		});
		use(target, source, 'tackle', { basePower: 30, multihit: 3 });
		source.setAbility('No Ability'); source.setAbility('Twilight Instinct');
		use(target, source, 'tackle', { basePower: 30 });
		assert.equal(damages.length, 4);
		assert.equal(damages[0], damages[1]); assert.equal(damages[1], damages[2]);
		assert(Math.abs(damages[0] / damages[3] - 0.7) < 0.05);
		battle.turn++;
		use(target, source, 'tackle', { basePower: 30 });
		assert.equal(damages[4], damages[0]);
	});
	it('Atrocity has neither Levitate nor Tough Claws and preserves the 654 BST', () => {
		const [source, target] = start('Atrocity', 'No Ability', 'Charizard-Mega-X');
		for (const id of ['charizardmegax', 'charizardmegaxalt']) {
			assert.deepEqual(Dex.species.get(id).baseStats, { hp: 78, atk: 130, def: 110, spa: 125, spd: 106, spe: 105 });
			assert.equal(Dex.species.get(id).bst, 654);
		}
		assert(!source.hasAbility('levitate')); assert(!source.hasAbility('toughclaws')); assert(source.isGrounded());
		assert(source.runImmunity('Ground'));
		const contact = battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('tackle'), 100);
		const noncontact = battle.runEvent('BasePower', source, target, battle.dex.getActiveMove('swift'), 100);
		assert.equal(contact, noncontact);
		source.addVolatile('magnetrise'); assert(!source.isGrounded());
	});
	it('Double Shock uses existing punch consumers and retains its Electric loss', () => {
		const [source, target] = start('Iron Fist'); source.setType('Electric');
		const move = battle.dex.getActiveMove('doubleshock');
		assert.deepEqual(move.flags, { contact: 1, protect: 1, mirror: 1, punch: 1 });
		assert.equal(move.basePower, 120); assert.equal(move.accuracy, 100);
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 140);
		source.setAbility('Masons Fist');
		const punchPower = battle.runEvent('BasePower', source, target, move, 100);
		const withoutPunch = battle.dex.getActiveMove('doubleshock');
		delete withoutPunch.flags.punch;
		assert(punchPower > battle.runEvent('BasePower', source, target, withoutPunch, 100));
		source.setAbility('No Ability'); source.setItem('Punching Glove');
		assert.equal(battle.runEvent('BasePower', source, target, move, 100), 140);
		battle.runEvent('ModifyMove', source, target, move, move); assert(!move.flags.contact);
		use(source, target, 'doubleshock', { basePower: 1 }); assert(!source.hasType('Electric'));
	});
	it('Dusk Ego field suppression disables Ultra Ego while keeping Keen Eye', () => {
		const [source, target] = start('Dusk Ego');
		battle.field.setTerrain('holyterrain', source);
		use(target, source, 'tackle', { basePower: 1 }); assert.equal(source.boosts.atk, 0); assert.equal(source.boosts.spa, 0);
		let move = battle.dex.getActiveMove('airslash'); battle.runEvent('ModifyMove', source, target, move, move);
		assert(!move.ignoreAbility); assert.equal(move.ignoreEvasion, true);
		source.addVolatile('gastroacid'); assert.equal(source.ignoringAbility(), true);
		move = battle.dex.getActiveMove('airslash'); battle.runEvent('ModifyMove', source, target, move, move);
		assert(!move.ignoreEvasion); assert(!move.ignoreAbility);
	});
	it('HP-triggered signatures ignore ally, residual and Substitute-only damage', () => {
		const [source, target] = start('Pressure Kiln'); source.addVolatile('substitute');
		use(target, source, 'tackle', { basePower: 1 }); assert(!source.m.approvedSignatures.pressure);
		source.removeVolatile('substitute'); battle.damage(20, source, source, battle.dex.conditions.get('brn'));
		assert(!source.m.approvedSignatures.pressure);
		battle.singleEvent('DamagingHit', source.getAbility(), source.abilityState, source, source,
			battle.dex.getActiveMove('tackle'), 20);
		assert(!source.m.approvedSignatures.pressure);
	});
	it('Restorative Chime excludes Rest and blocked healing without consuming its cure', () => {
		const [source] = start('Restorative Chime'); source.hp -= 100;
		use(source, source, 'rest'); assert.equal(source.status, 'slp');
		assert(!source.m.approvedSignatures.restorativeUsed);
		source.cureStatus();
		source.setStatus('brn');
		source.hp -= 100;
		source.addVolatile('healblock');
		use(source, source, 'recover'); assert.equal(source.status, 'brn');
		assert(!source.m.approvedSignatures.restorativeUsed);
	});
	it('Grave Hunger reduction persists at full HP and its Big Root gains stay within the combined cap', () => {
		const [source, target] = start('Grave Hunger'); target.hp -= 100;
		assert.equal(battle.heal(60, target, target, battle.dex.moves.get('recover')), 30);
		source.hp -= 150; source.setItem('Big Root'); target.hp = target.maxhp;
		const hp = source.hp; use(source, target, 'shadowball', { basePower: 120, multihit: 2 });
		assert(source.hp - hp <= Math.floor(source.maxhp / 8));
	});
});
