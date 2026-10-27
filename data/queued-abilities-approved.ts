import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const QueuedAbilityDescriptions = {
	seasonalstride: {shortDesc: 'Normal moves become its primary type at 1.2x; kicks 1.4x; sun Speed 2x; weather changes season.', desc: "Normal attacks become the current primary type with the 1.2x conversion boost; kicking moves have 1.4x power. Speed doubles only in sun. At turn end, rain selects Spring, sun Summer, sand Autumn and hail/snow Winter; no weather has the current form. The originally selected ability slot maps to the new season. External replacement abilities remain until ordinary restoration; genuine entry restores the selected slot for the current season. Transform does not cycle seasons."},
	sheddecoy: {shortDesc: 'After entry effects, pays 1/4 max HP to create a Substitute.', desc: 'After a genuine entry finishes hazards, items, abilities and field effects, pays floor(max HP/4) to create an ordinary Substitute if HP exceeds that cost and no Substitute exists. No cost if creation fails. Does not trigger on ability restarts or regain; respects Pulse/Rift Substitute restrictions. The direct HP cost cannot be prevented by Magic Guard; berries work normally.'},
	varietyrush: {shortDesc: 'First successful opposing attack of each non-Normal type per entry has 1.4x power.', desc: 'Each non-Normal type gets 1.4x power for its first successful attack against an opponent each genuine entry, across the whole move. Substitute damage counts. Misses, protection and immunity preserve the use; ally damage is not boosted. Ability restarts do not reset spent types.'},
	springfur: {shortDesc: 'Fur Coat; once per entry, a foe breaking its Substitute grants +1 Attack after the move.', desc: 'Full Fur Coat. Once per genuine entry, after an opposing damaging move breaks its Substitute and the whole attack finishes, the living user attempts +1 Attack. Consumed even if blocked or capped. Self-removal, Tidy Up and bypassing the Substitute do not qualify; ability restarts do not reset it.'},
	magneticcommand: {shortDesc: 'Full local Frisk + Stalwart.', desc: "Full local Frisk and Stalwart, including their entry effects and targeting behavior."},
	noseformation: {"shortDesc":"Elevate; successful opposing attacks trigger three 30 BP Special Mini-Noses.","desc":"Elevate grants airborne status, subject to grounding, and one highest-stat increase per move KO, using nature-adjusted stats while ignoring stages and other stat modifiers. After a successful opposing attack, fires one trio of 30 BP Special Mini-Noses, choosing Steel, Electric or Rock and retargeting living foes when needed. Each is a normal attack respecting protection, Substitute and immunity. No ally triggers or recursive trios."},
	magneticbulwark: {"shortDesc":"Full local Filter; once per entry, Magnetic Flux boosts self and adjacent allies without Plus/Minus.","desc":"Full local Filter reduces attack damage to 0.8x, or 0.6x when super effective. Once per genuine switch-in, its Magnetic Flux can raise its own and adjacent allies Defense and Special Defense by 1 regardless of Plus or Minus, using the normal move action and boost restrictions. This use is spent only if at least one stat boost succeeds. Later uses follow ordinary local Magnetic Flux rules, including field effects. Ability restarts, loss and regain do not reset the use."},
	plushwhiplash: {shortDesc: 'Whiplash + Technician + Fluffy.', desc: 'Full local Whiplash, Technician and Fluffy: entry raises accuracy, tail attacks gain 1.5x power, Technician checks calculated power before the tail boost, contact damage is halved and Fire damage doubled.'},
	silkensalvo: {shortDesc: 'Fluffy; eligible single-hit attacks hit 2–5 times at 40% power per hit.', desc: 'Full Fluffy. Eligible single-target, single-hit attacks become 2–5 hits at 40% calculated power each, rounded to nearest with ties down before modifiers. Hit distribution is 2, 2, 3, 3, 4, 5; Loaded Dice gives 5 hits for converted attacks only. One initial accuracy check, separate critical rolls and drain each hit; move secondaries run only on the first two hits. Fury Cutter and Stacking Shot advance their shared chain once per move. Native multi-hit moves are unchanged. Fixed-damage, OHKO, charge, recharge, self-KO, delayed, Z/Max moves and Fling, Endeavor, Beat Up, Rollout, Ice Ball and Uproar are excluded. Does not include Technician, Skill Link or Natural Cure.'},
	abyssalclaws: {shortDesc: 'Tough Claws; Water STAB; halves Fire, Water, Ice and Steel damage.', desc: 'Full local Tough Claws boosts contact moves once. Water attacks receive ordinary 1.5x STAB without adding Water typing or stacking another STAB bonus if already Water-type. Incoming Fire, Water, Ice and Steel attacks receive one extra resistance factor. Does not add Water weaknesses or lower Speed.'},
	antlioninstinct: {shortDesc: 'Sheer Force; Bug STAB; one extra Grass, Ground and Fighting resistance.', desc: 'Full local Sheer Force. Bug attacks receive ordinary 1.5x STAB, without stacking extra STAB if already Bug-type. Incoming Grass, Ground and Fighting attacks receive one extra resistance factor, once regardless of defensive typing. No Bug typing or weaknesses are added.'},
	burrowambush: {shortDesc: 'Earth Eater; after a direct foe KO, retreats once the replacement settles.', desc: 'Full Earth Eater. A direct opposing attack KO arms a retreat. Once a living opposing replacement has completed entry effects and any entry faint chain, the user must choose a legal benched replacement. One retreat per KO batch. No retreat after a battle-winning KO, without a legal bench, or from ally, indirect, delayed, recoil, hazard or Destiny Bond KOs. Fainting, departure, ability loss or suppression cancels the pending retreat. Other pending switches are preserved.'},
	leviathanwake: {shortDesc: 'Takes 0.8x attack damage; slams have 1.5x power and trigger one free Surf.', desc: "Incoming attack damage is multiplied by 0.8; raw Defense and Special Defense are unchanged. Body Slam and Heavy Slam have 1.5x power. After either ordinary slam successfully damages an opponent or its Substitute, the living active user uses one free normal Surf after the entire slam resolves. Surf costs no PP and has normal targeting, including hitting allies. No trigger on a miss, protection, immunity, or Z/Max versions."},
	ringmaster: {shortDesc: 'Tough Claws; first Dark attempt +1 priority; Dark HP hits Taunt; switch clears hazards and boosts replacement.', desc: 'Full Tough Claws once. The first damaging Dark move attempted each genuine entry gains +1 priority; misses and protection spend it, but pre-action flinch or paralysis do not. Ability restarts do not reset it. Each successful Dark attack dealing opposing HP damage attempts two-turn Taunt on surviving foes, with ordinary Taunt immunity and reapplication rules. A committed living switch-out, including pivots and forced switches, clears own-side hazards before entry and gives the exact replacement +1 in its highest non-HP stat after entry and Baton Pass transfer. Suppression at departure prevents this benefit; fainting is not a switch-out.'},
};

function markSlam(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (skipPassiveComponent(this, source, 'leviathanwake')) return;
	if (damage > 0 && !target.isAlly(source) && !move.isZ && !move.isMax && ['bodyslam', 'heavyslam'].includes(move.id)) {
		(move as any).leviathanWakeSource = source;
	}
}

function markVariety(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (damage > 0 && !target.isAlly(source) && move.type !== 'Normal') (move as any).varietyConnected = true;
}
function markNoses(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (!skipPassiveComponent(this, source, 'noseformation') && damage > 0 && !target.isAlly(source) && !move.noseFormationActivated) (move as any).noseSource = source;
}

export function resetQueuedEntry(pokemon: Pokemon) {
	delete pokemon.m.buriedTrioSpent;
	delete pokemon.m.elasticBellySpent;
	pokemon.m.feedbackEntry = (pokemon.m.feedbackEntry || 0) + 1;
	delete pokemon.m.accumulationState;
	delete pokemon.m.imperialprincessSpent;
 delete pokemon.m.blademasterySpent;
	delete pokemon.m.desertvigilSpent;
	delete pokemon.m.varietySpent;
	delete pokemon.m.springFurSpent;
	if (pokemon.baseSpecies.num === 586 && !pokemon.transformed && pokemon.m.seasonalSlot === undefined) {
		const selected = pokemon.battle.dex.species.get(pokemon.set.species);
		pokemon.m.seasonalSlot = Object.keys(selected.abilities).find(slot => pokemon.battle.dex.abilities.get(selected.abilities[slot as keyof typeof selected.abilities]).id === pokemon.baseAbility) || null;
	}
}
export function shedDecoyEntry(battle: Battle, pokemon: Pokemon) {
	const cost = Math.floor(pokemon.maxhp / 4);
	if (!pokemon.hp || !pokemon.isActive || !pokemon.hasAbilityOrPassive('sheddecoy') || pokemon.isPulseOrRift() ||
		!cost || pokemon.hp <= cost || pokemon.volatiles.substitute) return;
	if (!pokemon.addVolatile('substitute', pokemon, battle.dex.abilities.get('sheddecoy'))) return;
	battle.directDamage(cost, pokemon, pokemon, battle.dex.abilities.get('sheddecoy'));
	battle.runEvent('Update', pokemon);
}

export function installQueuedAbilities(abilities: AbilityDataTable) {
	abilities.magneticbulwark = {...abilities.filter, name: 'Magnetic Bulwark', num: 11690, rating: 4};
	abilities.seasonalstride.onResidual = function (pokemon) {
		if (pokemon.baseSpecies.num !== 586 || pokemon.transformed || !pokemon.isActive) return;
		const seasons: {[weather: string]: string} = {raindance: 'sawsbuckspring', primordialsea: 'sawsbuckspring', sunnyday: 'sawsbucksummer', desolateland: 'sawsbucksummer', sandstorm: 'sawsbuckautumn', hail: 'sawsbuckwinter', snow: 'sawsbuckwinter', snowscape: 'sawsbuckwinter'};
		const forme = seasons[pokemon.effectiveWeather()];
		if (!forme || forme === pokemon.species.id) return;
		const slot = pokemon.m.seasonalSlot as keyof typeof pokemon.species.abilities | null;
		const mapped = slot && pokemon.ability === this.dex.abilities.get(pokemon.species.abilities[slot]).id;
		if (!pokemon.formeChange(forme, this.effect, false, String(slot ?? '0'), '[msg]')) return;
		// Persist the chosen season across ordinary switching without replacing external abilities.
		pokemon.baseSpecies = pokemon.species;
		pokemon.details = pokemon.getUpdatedDetails();
		if (slot) {
			const ability = this.dex.abilities.get(pokemon.species.abilities[slot]);
			pokemon.baseAbility = ability.id;
			if (mapped && pokemon.ability !== ability.id) {
				pokemon.removeVolatile('flashfire');
				pokemon.setAbility(ability);
				this.add('-ability', pokemon, ability.name, '[from] passive: Seasonal Stride');
			}
		}
	};
	abilities.sheddecoy = {name: 'Shed Decoy', num: 11465, rating: 4, flags: {}};
	abilities.varietyrush = {
		name: 'Variety Rush', num: abilities.varietyrush.num, rating: 4, flags: {},
		onBasePower(power, source, target, move) {
			if (!target.isAlly(source) && move.category !== 'Status' && move.type !== 'Normal' && !source.m.varietySpent?.[move.type]) return this.chainModify(1.4);
		},
		onSourceDamagingHit: markVariety, onSourceAfterSubDamage: markVariety,
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (this.effectState.target !== source || !(move as any).varietyConnected) return;
			(source.m.varietySpent ||= {})[move.type] = true;
			delete (move as any).varietyConnected;
		},
	};
	abilities.springfur = {
		...abilities.furcoat, name: 'Spring Fur', num: abilities.springfur.num,
		onAfterSubDamage(damage, target, source, move) {
			if (damage > 0 && !target.volatiles.substitute && !target.isAlly(source) && !target.m.springFurSpent) {
				((move as any).springFurBroken ||= []).push(target);
			}
		},
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			const holder = this.effectState.target as Pokemon;
			if (!holder.hp || !holder.isActive || holder.m.springFurSpent || !(move as any).springFurBroken?.includes(holder)) return;
			holder.m.springFurSpent = true;
			this.boost({atk: 1}, holder, holder, this.effect);
		},
	};
	abilities.magneticcommand = {
		...abilities.stalwart, name: 'Magnetic Command', num: 11466,
		onStart(pokemon) {
			abilities.frisk.onStart!.call(this, pokemon);
			abilities.stalwart.onStart!.call(this, pokemon);
		},
	};
	abilities.noseformation = {
		...abilities.noseformation,
		onSourceDamagingHit: markNoses, onSourceAfterSubDamage: markNoses,
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (this.effectState.target !== source || (move as any).noseSource !== source || !source.hp || !source.isActive) return;
			delete (move as any).noseSource;
			const saved = {move: this.activeMove, pokemon: this.activePokemon, target: this.activeTarget, event: this.event, effect: this.effect, state: this.effectState, result: source.moveThisTurnResult};
			try {
				let foe = target;
				for (let i = 0; i < 3 && source.hp && source.isActive; i++) {
					if (!foe?.hp || !foe.isActive || foe.isAlly(source) || foe.isProtected() || foe.isSemiInvulnerable()) foe = source.foes().find(p => p.hp && !p.isProtected() && !p.isSemiInvulnerable())!;
					if (!foe) break;
					const candidates = ['Steel', 'Electric', 'Rock'].map(type => Object.assign(this.dex.getActiveMove('swift'), {name: 'Mini-Nose', type, basePower: 30, target: 'normal' as const, flags: {protect: 1}, noseFormationActivated: true, willCrit: false}));
					// Damage callbacks may consume berries or alter state. Score each candidate
					// in its own detached snapshot; only the chosen real attack can do that here.
					const snapshot = JSON.stringify(this.toJSON());
					let selected = candidates[0], score = -1;
					for (const candidate of candidates) {
						const probe = (this.constructor as typeof import('../sim/battle').Battle).fromJSON(snapshot);
						try {
							probe.randomizer = damage => damage;
							const attacker = probe.sides[source.side.n].pokemon[source.position];
							const defender = probe.sides[foe.side.n].pokemon[foe.position];
							const preview = Object.assign(probe.dex.getActiveMove('swift'), candidate);
							const hp = defender.hp;
							const substitute = defender.volatiles.substitute?.hp || 0;
							// Run the same hit path as the actual nose: TryHit absorption,
							// redirection, protection and the attacker's ability bypass all matter.
							probe.actions.useMove(preview, attacker, {target: defender, sourceEffect: probe.dex.abilities.get('noseformation')});
							const damage = Math.max(0, hp - defender.hp) + Math.max(0, substitute - (defender.volatiles.substitute?.hp || 0));
							if (damage > score) {score = damage; selected = candidate;}
						} finally {probe.destroy();}
					}
					delete (selected as ActiveMove).willCrit;
					this.actions.useMove(selected, source, {target: foe, sourceEffect: this.dex.abilities.get('noseformation')});
				}
			} finally {
				this.activeMove = saved.move; this.activePokemon = saved.pokemon; this.activeTarget = saved.target;
				this.event = saved.event; this.effect = saved.effect; this.effectState = saved.state; source.moveThisTurnResult = saved.result;
			}
		},
	};
	abilities.plushwhiplash = {
		...abilities.fluffy, name: 'Plush Whiplash', num: 11464, rating: 4,
		onStart: abilities.whiplash.onStart,
		onBasePowerPriority: 30, onBasePower: abilities.technician.onBasePower,
		onAnyBasePowerPriority: 21,
		onAnyBasePower(power, source, target, move) {
			if (this.effectState.target === source) return abilities.whiplash.onBasePower!.call(this, power, source, target, move);
		},
	};
	abilities.silkensalvo = {
		...abilities.fluffy, name: 'Silken Salvo', num: abilities.fluffycraft.num, rating: 4,
		onModifyMove(move) {
			if (move.category === 'Status' || move.multihit || move.isZ || move.isMax || move.damage || move.damageCallback || move.ohko ||
				move.flags.charge || move.flags.recharge || move.flags.futuremove || move.selfdestruct ||
				!['normal', 'any', 'adjacentFoe', 'adjacentAlly'].includes(move.target) ||
				['fling','endeavor','beatup','rollout','iceball','uproar'].includes(move.id)) return;
			(move as any).silkenSalvo = true;
			move.multihit = [2, 5];
			move.multiaccuracy = false;
		},
	};
	delete abilities.fluffycraft;
	const claws = abilities.grapplingclaws;
	abilities.abyssalclaws = {
		...abilities.toughclaws, name: 'Abyssal Claws', num: claws.num, rating: 4,
		onModifySTAB(stab, source, target, move) { if (move.type === 'Water') return Math.max(stab, 1.5); },
		onSourceModifyDamage(damage, source, target, move) {
			if (['Fire','Water','Ice','Steel'].includes(move.type)) return this.chainModify(0.5);
		},
	};
	delete abilities.grapplingclaws;
	abilities.antlioninstinct = {
		...abilities.sheerforce, name: 'Antlion Instinct', num: 11462, rating: 4,
		onModifySTAB(stab, source, target, move) { if (move.type === 'Bug') return Math.max(stab, 1.5); },
		onSourceModifyDamage(damage, source, target, move) {
			if (['Grass','Ground','Fighting'].includes(move.type)) return this.chainModify(0.5);
		},
	};
	abilities.burrowambush = {
		...abilities.eartheater, name: 'Burrow Ambush', num: 11461, rating: 4,
		onSourceDamagingHit(damage, target, source, effect) {
			if (damage <= 0 || target.hp || !source.hp || !source.isActive || target.isAlly(source) || effect?.effectType !== 'Move' ||
				effect.category === 'Status' || effect.flags.futuremove || effect !== this.activeMove || source !== this.activePokemon) return;
			const pending: {pokemon: Pokemon, side: Side, slot: number}[] = source.m.burrowAmbushPending ||= [];
			if (!pending.some(p => p.pokemon === target)) pending.push({pokemon: target, side: target.side, slot: target.position});
		},
		onEnd(pokemon) { delete pokemon.m.burrowAmbushPending; },
		onSwitchOut(pokemon) { delete pokemon.m.burrowAmbushPending; },
	};
	abilities.leviathanwake = {
		name: 'Leviathan Wake', num: 11463, rating: 4, flags: {},
		onSourceModifyDamage(damage, source, target) {
			if (!skipPassiveComponent(this, target, 'leviathanwake')) return this.chainModify(0.8);
		},
		onBasePower(power, source, target, move) {
			if (!skipPassiveComponent(this, source, 'leviathanwake') && !move.isZ && !move.isMax && ['bodyslam','heavyslam'].includes(move.id)) return this.chainModify(1.5);
		},
		onSourceDamagingHit: markSlam,
		onSourceAfterSubDamage: markSlam,
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (this.effectState.target !== source) return;
			if (!move || (move as any).leviathanWakeSource !== source) return;
			delete (move as any).leviathanWakeSource;
			if (!source.hp || !source.isActive || source.fainted) return;
			// Nested free attacks must not steal the outer move's event or damage context.
			const saved = {move: this.activeMove, pokemon: this.activePokemon, target: this.activeTarget,
				event: this.event, effect: this.effect, state: this.effectState, result: source.moveThisTurnResult};
			try { this.actions.useMove('surf', source, {sourceEffect: this.dex.abilities.get('leviathanwake')}); }
			finally {
				this.activeMove = saved.move; this.activePokemon = saved.pokemon; this.activeTarget = saved.target;
				this.event = saved.event; this.effect = saved.effect; this.effectState = saved.state; source.moveThisTurnResult = saved.result;
			}
		},
	};
	abilities.ringmaster = {
		...abilities.toughclaws, name: 'Ringmaster', num: abilities.ringmaster.num, rating: 4,
		onModifyPriority(priority, source, target, move) {
			if (!source.volatiles.ringmasterspent && move.category !== 'Status' && move.type === 'Dark') return priority + 1;
		},
		onTryMove(source, target, move) {
			if (move.category !== 'Status' && move.type === 'Dark') source.addVolatile('ringmasterspent');
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !target.hp || target.isAlly(source) || move.type !== 'Dark') return;
			const seen: Pokemon[] = (move as any).ringmasterTauntTargets ||= [];
			if (seen.includes(target)) return;
			seen.push(target);
			if (target.addVolatile('taunt', source, this.effect)) target.volatiles.taunt.duration = 2;
		},
	};
}

const hazards = ['spikes','toxicspikes','stealthrock','stickyweb','gmaxsteelsurge','steelsurge','rocknroll','dragonrend'];
/** Called only after a living switch is committed, including forced switches. */
export function ringmasterSwitch(battle: Battle, outgoing: Pokemon, incoming: Pokemon) {
	if (!outgoing.hp || !outgoing.hasAbility('ringmaster')) return;
	for (const id of hazards) outgoing.side.removeSideCondition(id);
	incoming.m.ringmasterHandoff = {side: outgoing.side, slot: outgoing.position};
}
/** Consume even if entry effects KO the exact replacement; never leak to a later entrant. */
export function ringmasterEntry(battle: Battle, incoming: Pokemon) {
	const handoff = incoming.m.ringmasterHandoff;
	delete incoming.m.ringmasterHandoff;
	if (!handoff || !incoming.hp || !incoming.isActive || incoming.side !== handoff.side || incoming.position !== handoff.slot) return;
	battle.boost({[incoming.getBestStat(true, true)]: 1}, incoming, incoming, battle.dex.abilities.get('ringmaster'));
}
/** Run after entry/faint processing, before switch requests, without touching other flags. */
export function resolveBurrowAmbush(battle: Battle) {
	for (const source of battle.getAllActive()) {
		const pending: {pokemon: Pokemon, side: Side, slot: number}[] = source.m.burrowAmbushPending;
		if (!pending) continue;
		if (!source.hp || !source.isActive || !source.hasAbility('burrowambush')) { delete source.m.burrowAmbushPending; continue; }
		if (battle.queue.list.some(action => action.choice === 'runSwitch') || battle.getAllActive().some(p => !p.hp)) continue;
		const settled = pending.some(defeated => { const p = defeated.side.active[defeated.slot]; return p && p !== defeated.pokemon && p.hp && p.isStarted; });
		if (!settled) continue;
		delete source.m.burrowAmbushPending;
		if (!battle.ended && battle.canSwitch(source.side) && !source.switchFlag && !source.forceSwitchFlag) {
			source.switchFlag = true;
			battle.add('-activate', source, 'ability: Burrow Ambush');
		}
	}
}
