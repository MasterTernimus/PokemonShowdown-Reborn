import {adaptiveIgnoresAbility} from '../sim/adaptive-cycle';
import { AbilityComponents } from './ability-components';
import type { AbilityData, AbilityDataTable } from '../sim/dex-abilities';

function includesNaturalCure(id: string, seen = new Set<string>()): boolean {
	if (id === 'naturalcure') return true;
	if (seen.has(id)) return false;
	seen.add(id);
	return (AbilityComponents[id] || []).some(part => includesNaturalCure(part, seen));
}

interface EntryBudget {
	freshPlumageUsed?: boolean;
	freshPlumageMove?: ActiveMove;
	railGranted?: boolean;
	railCharge?: boolean;
	steamGranted?: boolean;
	steamVeil?: boolean;
	shellBroken?: boolean;
	twilightGuardUsed?: boolean;
	twilightTurn?: number;
	pressure?: number;
	restorativeUsed?: boolean;
	dissonantUsed?: boolean;
}
function budget(pokemon: Pokemon): EntryBudget {
	pokemon.m.approvedSignatures ||= {};
	return pokemon.m.approvedSignatures;
}
function foeHit(damage: number, target: Pokemon, source: Pokemon) {
	return damage > 0 && !target.isAlly(source);
}
function grantSteam(pokemon: Pokemon) {
	const state = budget(pokemon);
	if (state.steamGranted) return;
	state.steamGranted = true;
	state.steamVeil = true;
}
function breakScreens(move: ActiveMove, screens: string[]) {
	const original = move.onTryHit;
	move.onTryHit = function (target, source, activeMove) {
		const result = typeof original === 'function' ? original.call(this, target, source, activeMove) : original;
		if (result === false || result === null) return result;
		for (const screen of screens) target.side.removeSideCondition(screen);
		return result;
	};
}

export function cureRestorativeStatus(target: Pokemon, entry: EntryBudget) {
	if (!entry.restorativeUsed && target.status && target.cureStatus()) entry.restorativeUsed = true;
}

function graveHeal(battle: Battle, holder: Pokemon, amount: number, source: Pokemon, drain = false) {
	if (!holder.hp || !holder.isActive || !holder.hasAbility('gravehunger')) return;
	if (holder.m.graveHungerTurn !== battle.turn) {
		holder.m.graveHungerTurn = battle.turn;
		holder.m.graveHungerHealed = 0;
	}
	const remaining = Math.floor(holder.maxhp / 8) - holder.m.graveHungerHealed;
	if (remaining <= 0) return;
	holder.m.graveHungerHealing = remaining;
	try {
		const healed = battle.heal(Math.min(amount, remaining), holder, source,
			drain ? 'drain' : battle.dex.abilities.get('gravehunger'));
		if (typeof healed === 'number' && healed > 0) holder.m.graveHungerHealed += healed;
	} finally {
		delete holder.m.graveHungerHealing;
	}
}

/** Runs after ordinary healing blockers, while the recipient is still active. */
export function reduceGraveHungerHealing(battle: Battle, amount: number, target: Pokemon, effect: Effect | null) {
	if (effect?.id === 'regenerator' || target.m.graveHungerHealing !== undefined) return amount;
	for (const foe of target.foes()) {
		if (!foe.hp || !foe.isActive || adaptiveIgnoresAbility(target, foe) || !foe.hasAbility('gravehunger')) continue;
		const reduced = Math.floor(amount / 2);
		const prevented = Math.min(amount, target.maxhp - target.hp) - Math.min(reduced, target.maxhp - target.hp);
		amount = reduced;
		if (prevented > 0) graveHeal(battle, foe, prevented, target);
	}
	return amount;
}

/** Explicitly approved October follow-ups. Shared component definitions remain untouched. */
export function applyApprovedSignatures(base: AbilityDataTable) {
	let num = 11235;
	const atrocity = base.atrocity;
	base.atrocity = {
		...atrocity,
		onImmunity: base.unboundblaze.onImmunity,
		onBasePower(power, source, target, move) {
			atrocity.onBasePower?.call(this, power, source, target, move);
			return base.toughclaws.onBasePower?.call(this, power, source, target, move);
		},
	};

	const add = (id: string, name: string, data: Partial<AbilityData>) => {
		base[id as ID] = { flags: {}, rating: 4, ...data, name, num: num++ };
	};
	add('scrapbreaker', 'Scrapbreaker', {
		...base.moldbreaker,
		onModifyMove(move) {
			move.ignoreAbility = true;
			if (move.id === 'gigatonhammer') breakScreens(move, ['reflect', 'lightscreen', 'auroraveil']);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.id === 'gigatonhammer' && foeHit(damage, target, source) && target.hp) {
				target.addVolatile('smackdown', source, move);
			}
		},
	});
	add('toxicsignature', 'Toxic Signature', {
		...base.unnerve,
		onSourceModifyAccuracy(accuracy, target, source, move) {
			const marked = move as ActiveMove & { signatureAccuracy?: boolean, signatureEvasion?: boolean };
			marked.signatureAccuracy ??= !!move.ignoreAccuracy;
			marked.signatureEvasion ??= !!move.ignoreEvasion;
			const poisoned = move.category !== 'Status' && ['psn', 'tox'].includes(target.status);
			move.ignoreAccuracy = marked.signatureAccuracy || poisoned;
			move.ignoreEvasion = marked.signatureEvasion || poisoned;
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.type === 'Poison' && foeHit(damage, target, source) && !target.side.sideConditions['toxicspikes']) {
				target.side.addSideCondition('toxicspikes', source, this.effect);
			}
		},
	});
	add('wickedweave', 'Wicked Weave', {
		...base.prankster,
		onAfterMove(source, target, move) {
			if (move.category === 'Status' && source.moveThisTurnResult === true && source.hp) {
				source.addVolatile('wickedweave', source, this.effect);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!source.volatiles['wickedweave'] || !foeHit(damage, target, source) ||
				!this.checkMoveMakesContact(move, source, target)) return;
			source.removeVolatile('wickedweave');
			if (target.hp) this.boost({ spe: -1 }, target, source, this.effect);
		},
		condition: {
			duration: 2, noCopy: true,
			onRestart() { this.effectState.duration = 2; },
		},
	});
	add('vaultkeeper', 'Vault Keeper', {
		...base.prankster,
		...base.stickyhold,
		// Side-wide screen removal is guarded in Side.removeSideCondition.
	});
	add('masterkey', 'Master Key', {
		onModifyMove(move) {
			if (move.category === 'Status' && ['normal', 'adjacentFoe', 'any'].includes(move.target)) {
				move.ignoreAbility = true;
				move.flags.bypasssub = 1;
			}
		},
	});
	base.groundingtail = {
		...base.groundingtail,
		onSourceDamagingHit: undefined,
		onModifyMove(move) {
			if (move.type !== 'Electric') return;
			move.ignoreImmunity = { ...typeof move.ignoreImmunity === 'object' ? move.ignoreImmunity : {}, Electric: true };
			move.recoil = undefined;
			const original = move.onEffectiveness;
			move.onEffectiveness = function (typeMod, target, type, activeMove) {
				if (type === 'Ground') return -1;
				return original?.call(this, typeMod, target, type, activeMove);
			};
		},
	};
	add('flintfracture', 'Flint Fracture', {
		onModifyMove(move) {
			if (move.flags.slicing) breakScreens(move, ['reflect', 'auroraveil']);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.flags.slicing && foeHit(damage, target, source) && target.hp) {
				target.addVolatile('flintfracture', source, this.effect);
			}
		},
		condition: {
			noCopy: true,
			onStart() { this.effectState.until = this.turn + 1; },
			onRestart() { this.effectState.until = this.turn + 1; },
			onResidualOrder: 9,
			onResidual(target) {
				this.damage(target.baseMaxhp / 16, target, this.effectState.source);
				if (this.turn >= this.effectState.until) target.removeVolatile('flintfracture');
			},
		},
	});
	add('frozenfeast', 'Frozen Feast', {
		...base.strongjaw,
		onModifyMove(move, source) {
			this.effectState.feastMove = move;
			this.effectState.feastSlowed = new Set(source.foes().filter(foe => foe.boosts.spe < 0));
			this.effectState.feastHit = new Set<Pokemon>();
			this.effectState.feastLowered = new Set<Pokemon>();
		},
		onAnyAfterEachBoost(boost, target, source, effect) {
			if (source === this.effectState.target && effect === this.effectState.feastMove && (boost.spe || 0) < 0) {
				this.effectState.feastLowered.add(target);
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!foeHit(damage, target, source) || move !== this.effectState.feastMove) return;
			if (move.type === 'Ice') this.effectState.feastHit.add(target);
			if (move.flags.bite && this.effectState.feastSlowed.has(target) && !move.drain) {
				this.heal(Math.round(damage / 4), source, target, 'drain');
			}
		},
		onAfterMove(source, target, move) {
			if (move !== this.effectState.feastMove) return;
			for (const foe of this.effectState.feastHit as Set<Pokemon>) {
				if (foe.hp && foe.isActive && !this.effectState.feastLowered.has(foe)) {
					this.boost({ spe: -1 }, foe, source, this.effect);
				}
			}
		},
	});
	add('cinderscales', 'Cinder Scales', {
		...base.flamebody, ...base.swarm, ...base.shielddust,
		flags: {},
		onModifySecondaries(secondaries, target, source, move) {
			if (this.suppressingAbility(target)) return;
			return base.shielddust.onModifySecondaries?.call(this, secondaries, target, source, move);
		},
	});
	add('sporeshroud', 'Spore Shroud', {
		...base.effectspore,
		onSourceModifyDamage(damage, source, target, move) {
			if (this.checkMoveMakesContact(move, source, target)) return this.chainModify(0.75);
		},
	});
	add('primevalhunt', 'Primeval Hunt', {
		...base.skilllink,
		...base.battlearmor,
		onModifyCritRatio(ratio, source, target, move) {
			if (typeof move.multihit === 'number' && move.multihit >= 3 && move.hit === move.multihit) return 4;
		},
	});
	add('rimebreaker', 'Rimebreaker', {
		...base.refrigerate,
		onSourceDamagingHit(damage, target, source, move) {
			if (move.type !== 'Ice' || !foeHit(damage, target, source) || source.m.rimebreakerTurn === this.turn) return;
			source.m.rimebreakerTurn = this.turn;
			if (source.side.removeSideCondition('stealthrock')) this.add('-sideend', source.side, 'Stealth Rock');
			const spikes = source.side.sideConditions['spikes'];
			if (!spikes) return;
			if (spikes.layers <= 1) {
				if (source.side.removeSideCondition('spikes')) this.add('-sideend', source.side, 'Spikes');
			} else {
				spikes.layers--;
				this.add('-sideend', source.side, 'Spikes');
				for (let i = 0; i < spikes.layers; i++) this.add('-sidestart', source.side, 'Spikes');
			}
		},
	});
	base.twilightinstinct = {
		name: 'Twilight Instinct', num: base.twilightinstinct.num, rating: 4, flags: { breakable: 1 },
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move' || !source || target.isAlly(source) || budget(target).twilightGuardUsed) return;
			return this.modify(damage, 0.75);
		},
		onDamagingHit(damage, target, source) {
			if (!foeHit(damage, target, source)) return;
			budget(target).twilightGuardUsed = true;
			if (this.queue.willMove(target) &&
				(budget(target).twilightTurn || 0) < this.turn) budget(target).twilightTurn = this.turn + 1;
		},
		onModifyPriority(priority, source, target, move) {
			if (budget(source).twilightTurn === this.turn && move.category !== 'Status' && move.priority === 0) {
				return priority + 1;
			}
		},
		onBeforeMovePriority: 100,
		onBeforeMove(source, target, move) {
			if (budget(source).twilightTurn === this.turn && move.category !== 'Status' && move.priority === 0) {
				delete budget(source).twilightTurn;
			}
		},
		onResidual(source) {
			if ((budget(source).twilightTurn || Infinity) <= this.turn) delete budget(source).twilightTurn;
		},
	};
	const dusk = base.duskdrive;
	base.duskdrive = {
		...base.battlefervor, ...base.precision, ...base.opportunist,
		name: dusk.name, num: dusk.num, rating: dusk.rating, flags: dusk.flags,
		// This engine does not fall back to onStart when an onAnySwitchIn hook exists.
		onSwitchIn: base.battlefervor.onStart,
		onEnd(pokemon) {
			base.battlefervor.onEnd?.call(this, pokemon);
			base.opportunist.onEnd?.call(this, pokemon);
		},
	};
	add('evaporate', 'Evaporate', {
		...base.dryskin,
		onStart(pokemon) {
			if (this.field.isWeather('raindance') && this.field.clearWeather()) grantSteam(pokemon);
		},
		onTryHit(target, source, move) {
			const hook = base.dryskin.onTryHit;
			const result = typeof hook === 'function' ? hook.call(this, target, source, move) : hook;
			if (result === null && target !== source && this.movehasType(move, 'Water')) grantSteam(target);
			return result;
		},
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move' || effect.category !== 'Special' || !budget(target).steamVeil) return;
			budget(target).steamVeil = false;
			return this.modify(damage, 0.75);
		},
	});
	add('pressurekiln', 'Pressure Kiln', {
		onDamagingHit(damage, target, source) {
			if (!foeHit(damage, target, source)) return;
			budget(target).pressure = Math.min(Math.floor(target.maxhp / 4),
				(budget(target).pressure || 0) + Math.floor(damage / 2));
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (move.type !== 'Fire' || !foeHit(damage, target, source) || !budget(source).pressure) return;
			const stored = budget(source).pressure!;
			budget(source).pressure = 0;
			this.heal(stored, source, source, this.effect);
		},
	});
	add('shattercrust', 'Shattercrust', {
		...base.crumblingshell,
		onDamage(damage, target, source, effect) {
			if (effect.effectType !== 'Move' || effect.category !== 'Physical' || !source || target.isAlly(source) ||
				budget(target).shellBroken) return;
			return this.modify(damage, 0.5);
		},
		onDamagingHit(damage, target, source, move) {
			base.crumblingshell.onDamagingHit?.call(this, damage, target, source, move);
			if (move.category !== 'Physical' || !foeHit(damage, target, source) || budget(target).shellBroken) return;
			budget(target).shellBroken = true;
			if (target.hp) source.side.addSideCondition('spikes', target, this.effect);
		},
	});
	add('restorativechime', 'Restorative Chime', {
		onSourceHeal(damage, target, source, effect) {
			if (damage > 0 && effect?.effectType === 'Move' && effect.flags.heal && effect.id !== 'rest') {
				cureRestorativeStatus(target, budget(source));
			}
		},
		onAfterMove(source, target, move) {
			if (!source.hp || !move.flags.sound || source.moveThisTurnResult !== true ||
				source.m.restorativeSoundTurn === this.turn) return;
			source.m.restorativeSoundTurn = this.turn;
			this.heal(source.baseMaxhp / 8, source, source, this.effect);
		},
	});
	add('dissonantchime', 'Dissonant Chime', {
		flags: { breakable: 1 },
		onTryHit(target, source, move) {
			if (!target.isAlly(source) && move.flags.sound) {
				this.add('-immune', target, '[from] ability: Dissonant Chime');
				return null;
			}
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!move.flags.sound || !foeHit(damage, target, source) || budget(source).dissonantUsed) return;
			let removed = false;
			for (const stat of Object.keys(target.boosts) as BoostID[]) {
				if (target.boosts[stat] <= 0) continue;
				target.boosts[stat] = 0;
				removed = true;
			}
			if (removed) {
				budget(source).dissonantUsed = true;
				this.add('-clearpositiveboost', target, source, 'ability: Dissonant Chime');
			}
		},
	});
	add('gravehunger', 'Grave Hunger', {
		...base.baddreams,
		onSourceDamagingHit(damage, target, source, move) {
			if (move.type === 'Ghost' && !move.drain && foeHit(damage, target, source)) {
				graveHeal(this, source, Math.round(damage / 4), target, true);
			}
		},
	});
	add('primevalhunger', 'Primeval Hunger', {
		...base.accumulation,
		onModifyMove(move) {
			this.effectState.hungerMove = move;
			this.effectState.hungerTargets = new Set<Pokemon>();
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (!move.drain || !foeHit(damage, target, source) || !target.hp) return;
			this.effectState.hungerTargets?.add(target);
			const previous = target.volatiles['healblock'];
			if (!previous) {
				if (target.addVolatile('healblock', source, this.effect)) target.volatiles['healblock'].duration = 2;
			} else if ((previous.duration ?? 0) < 2) {
				previous.duration = 2;
			}
		},
		onAfterMove(source, target, move) {
			if (move !== this.effectState.hungerMove) return;
			for (const foe of this.effectState.hungerTargets || []) {
				if (!foe.hp || !foe.isActive) continue;
				const stat = foe.boosts.atk > foe.boosts.spa ? 'atk' : 'spa';
				if (foe.boosts[stat] > 0) this.boost({ [stat]: -1 }, foe, source, this.effect);
			}
			this.effectState.hungerTargets = null;
		},
	});
	base.razorreach = {
		...base.longreach, ...base.sharpness,
		onBasePower(power, source, target, move) {
			base.longreach.onBasePower?.call(this, power, source, target, move);
			return base.sharpness.onBasePower?.call(this, power, source, target, move);
		},
		name: 'Razor Reach', num: 11229,
	};
	base.witheringtouch = {
		...base.poisontouch, ...base.corrosion,
		onAnyAfterDamageApplied: base.witheringtouch.onAnyAfterDamageApplied,
		name: 'Withering Touch', num: 11230,
	};
	base.anchorbridge = {
		...base.sturdy, ...base.solidrock,
		name: 'Anchor Bridge', num: base.anchorbridge.num,
	};
	base.railsight = {
		...base.stalwart,
		name: 'Rail Sight', num: base.railsight.num,
		onDamagingHit(damage, target, source, move) {
			if (foeHit(damage, target, source) && !budget(target).railGranted) this.effectState.railHitMove = move;
		},
		onAnyAfterMove(source, target, move) {
			if (this.effectState.railHitMove !== move) return;
			delete this.effectState.railHitMove;
			const holder = this.effectState.target;
			if (!holder.hp || !holder.isActive || budget(holder).railGranted) return;
			budget(holder).railGranted = true;
			budget(holder).railCharge = true;
			this.add('-activate', holder, 'ability: Rail Sight');
		},
		onBasePower(power, source, target, move) {
			if (budget(source).railCharge && this.movehasType(move, 'Electric')) return this.chainModify(1.5);
		},
		onAfterMove(pokemon, target, move) {
			if (move.category === 'Status' || !this.movehasType(move, 'Electric') ||
				(move.flags.charge && pokemon.volatiles[move.id])) return;
			budget(pokemon).railCharge = false;
		},
	};
	base.tidalvoice.onAfterMove = function (source, target, move) {
		if (move.id !== 'sparklingaria') return;
		for (const ally of source.adjacentAllies()) {
			if (ally.hp && ally.isActive) this.heal(ally.maxhp / 8, ally, source, this.effect);
		}
	};
	base.fluffycraft.onCheckShow = base.naturalcure.onCheckShow;
	base.fluffycraft.onSwitchOut = base.naturalcure.onSwitchOut;
	base.fluffycraft.onResidual = base.naturalcure.onResidual;
	base.verdantdrake.onSwitchOut = base.regenerator.onSwitchOut;
	base.greatmarsh.onResidual = base.dryskin.onResidual;
	base.greatmarsh.onBasePower = base.toxicchain.onBasePower;
	base.greatmarsh.onSourceDamagingHit = base.toxicchain.onSourceDamagingHit;

	base.dawnherald = {
		...base.drought, ...base.friendguard,
		name: 'Dawn Herald', num: num++,
	};
	base.aeviantoxin.onModifyCritRatio = base.merciless.onModifyCritRatio;

	base.venomignition = {
		onModifyDamage(damage, source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Fire') && ['psn', 'tox'].includes(target.status)) {
				return this.chainModify(1.2);
			}
		},
		flags: {}, name: 'Venom Ignition', rating: 3, num: num++,
	};
	base.corrosiveburn = {
		...base.corrosion, ...base.oblivious, ...base.venomignition,
		flags: { breakable: 1 }, name: 'Corrosive Burn', rating: 5, num: 10406,
	};
	base.transfixinggaze = {
		...base.frisk,
		onAnyAfterMove(source, target, move) {
			const holder = this.effectState.target;
			if (!holder.hp || !holder.isActive || source.isAlly(holder) ||
				!move.selfSwitch || source.switchFlag !== move.id) return;
			source.switchFlag = false;
			this.add('-activate', holder, 'ability: Transfixing Gaze');
		},
		name: 'Transfixing Gaze', num: num++,
	};

	base.freshplumage = {
		...base.naturalcure,
		onCheckShow(pokemon) {
			// This is complicated
			// For the most part, in-game, it's obvious whether or not Natural Cure activated,
			// since you can see how many of your opponent's pokemon are statused.
			// The only ambiguous situation happens in Doubles/Triples, where multiple pokemon
			// that could have Natural Cure switch out, but only some of them get cured.
			if (pokemon.side.active.length === 1) return;
			if (pokemon.showCure === true || pokemon.showCure === false) return;

			const cureList = [];
			let noCureCount = 0;
			for (const curPoke of pokemon.side.active) {
				// pokemon not statused
				if (!curPoke?.status) {
					// this.add('-message', "" + curPoke + " skipped: not statused or doesn't exist");
					continue;
				}
				if (curPoke.showCure) {
					// this.add('-message', "" + curPoke + " skipped: Natural Cure already known");
					continue;
				}
				const species = curPoke.species;
				// pokemon can't get Natural Cure
				if (!Object.values(species.abilities).some(name => includesNaturalCure(this.dex.toID(name)))) {
					// this.add('-message', "" + curPoke + " skipped: no Natural Cure");
					continue;
				}
				// pokemon's ability is known to be Natural Cure
				if (!species.abilities['1'] && !species.abilities['H']) {
					// this.add('-message', "" + curPoke + " skipped: only one ability");
					continue;
				}
				// pokemon isn't switching this turn
				if (curPoke !== pokemon && !this.queue.willSwitch(curPoke)) {
					// this.add('-message', "" + curPoke + " skipped: not switching");
					continue;
				}

				if (curPoke.hasAbility('naturalcure')) {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (and is)");
					cureList.push(curPoke);
				} else {
					// this.add('-message', "" + curPoke + " confirmed: could be Natural Cure (but isn't)");
					noCureCount++;
				}
			}

			if (!cureList.length || !noCureCount) {
				// It's possible to know what pokemon were cured
				for (const pkmn of cureList) {
					pkmn.showCure = true;
				}
			} else {
				// It's not possible to know what pokemon were cured

				// Unlike a -hint, this is real information that battlers need, so we use a -message
				this.add('-message', `(${cureList.length} of ${pokemon.side.name}'s pokemon ${cureList.length === 1 ? "was" : "were"} cured by Natural Cure.)`);

				for (const pkmn of cureList) {
					pkmn.showCure = false;
				}
			}
		},
		onResidual(pokemon) {
			if (pokemon.status) base.naturalcure.onResidual?.call(this, pokemon);
		},
		onModifyDamage(damage, source, target, move) {
			const entry = budget(source);
			if ((!entry.freshPlumageUsed || entry.freshPlumageMove === move) &&
				move.category !== 'Status' && this.movehasType(move, 'Flying')) return this.chainModify(1.2);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || budget(source).freshPlumageUsed || !this.movehasType(move, 'Flying')) return;
			budget(source).freshPlumageUsed = true;
			budget(source).freshPlumageMove = move;
		},
		onSourceAfterSubDamage(damage, target, source, move) {
			if (damage <= 0 || budget(source).freshPlumageUsed || !this.movehasType(move, 'Flying')) return;
			budget(source).freshPlumageUsed = true;
			budget(source).freshPlumageMove = move;
		},
		onAfterMove(source) { delete budget(source).freshPlumageMove; },
		name: 'Fresh Plumage', num: num++,
	};
	// Compound Eyes already supplies the same Mirror Arena entry reward as Keen Eye.
	base.silksights.onStart = base.keeneye.onStart;
	base.silksights.onTryBoost = base.keeneye.onTryBoost;
	base.silksights.onModifyMove = base.keeneye.onModifyMove;
	for (const id of ['astralward', 'doomwarning'] as const) {
		const priorStart = base[id].onStart;
		base[id].onStart = function (pokemon) {
			priorStart?.call(this, pokemon);
			base.anticipation.onStart?.call(this, pokemon);
		};
	}
	base.calculatedshot.onStart = base.frisk.onStart;
	const slipstreamStart = base.slipstream.onStart;
	base.slipstream.onStart = function (pokemon) {
		slipstreamStart?.call(this, pokemon);
		base.keeneye.onStart?.call(this, pokemon);
	};
	base.slipstream.onTryBoost = base.keeneye.onTryBoost;
	base.slipstream.onModifyMove = base.keeneye.onModifyMove;
	const nightHuntStart = base.nighthunt.onStart;
	const nightHuntModifyMove = base.nighthunt.onModifyMove;
	base.nighthunt.onStart = function (pokemon) {
		nightHuntStart?.call(this, pokemon);
		base.frisk.onStart?.call(this, pokemon);
		base.illuminate.onStart?.call(this, pokemon);
	};
	base.nighthunt.onTryBoost = base.illuminate.onTryBoost;
	base.nighthunt.onModifyMove = function (move, pokemon, target) {
		nightHuntModifyMove?.call(this, move, pokemon, target);
		base.illuminate.onModifyMove?.call(this, move, pokemon, target);
	};

	for (const id of ['silksights', 'longreach', 'razorreach', 'nighthunt'] as const) {
		base[id] = { ...base[id], flags: { ...base[id].flags, breakable: 1 } };
	}
}
