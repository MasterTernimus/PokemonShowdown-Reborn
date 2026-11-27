import type { Signature } from './stone-signatures';

function damagesFoe(target: Pokemon, source: Pokemon, move: ActiveMove) {
	return !target.isAlly(source) && (target.getMoveHitData(move).damage || 0) > 0;
}
function poisoned(target: Pokemon) {
	return target.status === 'psn' || target.status === 'tox';
}
function rain(user: Pokemon) {
	return ['raindance', 'primordialsea'].includes(user.effectiveWeather());
}
function firstThisEntry(user: Pokemon, key: string) {
	if (user.m[key] === user.m.ultraRivalryEntryToken) return false;
	user.m[key] = user.m.ultraRivalryEntryToken;
	return true;
}
function shortTrap(target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (!source.isActive || target.getVolatile('trapped')) return;
	if (target.addVolatile('trapped', source, move, 'trapper')) target.volatiles.trapped.duration = 2;
}
function hitState(target: Pokemon, move: ActiveMove) {
	return target.getMoveHitData(move) as { previouslyPoisoned?: boolean, sewn?: boolean, hoodDrop?: boolean };
}
function markPoison(target: Pokemon, source: Pokemon, move: ActiveMove) {
	hitState(target, move).previouslyPoisoned = poisoned(target);
}

const psiScalpel: Signature = {
	base: 'psyshock', name: 'Psi Scalpel', num: 33210,
	desc: '95 power. Targets Defense. Ignores positive Defense stages at a slot awaiting Future Sight.',
	changes: { basePower: 95, onPrepareHit(target, source, move) {
		if (target.side.slotConditions[target.position].futuremove?.move === 'futuresight') move.ignorePositiveDefensive = true;
	} },
};

export const MegaSignaturesNov26A: Record<string, Signature> = {
	absolmega: {
		base: 'darkpulse', name: 'Omen Pulse', num: 32970,
		desc: '95 power. Reveals the held item of a damaged foe. After Doom Warning reflects a move, the next Omen Pulse this entry has 115 power. Has a 20% chance to flinch.',
		changes: { basePower: 95,
			onModifyMove(move, source) {
				if (source.m.omenPulseCharge && source.m.omenPulseCharge === source.m.ultraRivalryEntryToken) move.basePower = 115;
			},
			onTryMove(source) { delete source.m.omenPulseCharge; },
			onAfterHit(target, source, move) {
				if (target.item && damagesFoe(target, source, move)) {
					this.add('-item', target, target.getItem().name, '[from] move: Omen Pulse', `[of] ${source}`);
				}
			},
		},
	},
	alakazammega: psiScalpel,
	alakazammegaalt: psiScalpel,
	arbokmegax: {
		base: 'crunch', name: 'Vice Fang', num: 33211,
		desc: '95 power. Damaging a poisoned foe traps it through the following turn. Keeps Crunch’s Defense-drop chance.',
		changes: { basePower: 95, onAfterHit(target, source, move) {
			if (damagesFoe(target, source, move) && poisoned(target)) shortTrap(target, source, move);
		} },
	},
	arbokmegay: {
		base: 'sludgebomb', name: 'Hood Flare', num: 33212,
		desc: '95-power Poison bullet. A damaging hit on an already poisoned foe lowers Sp. Def one stage, once per use. Has a 30% chance to poison.',
		changes: { basePower: 95, onPrepareHit: markPoison, onAfterHit(target, source, move) {
			const state = hitState(target, move);
			if (!damagesFoe(target, source, move) || !state.previouslyPoisoned || state.hoodDrop) return;
			state.hoodDrop = true;
			this.boost({ spd: -1 }, target, source, move);
		} },
	},
	ariadosmega: {
		base: 'crosspoison', name: 'Cross Stitch', num: 33213,
		desc: '100 power. On a damaging hit, lowers Speed by one stage or, if the foe is already slower, traps it through the following turn. Keeps Cross Poison’s critical-hit, poison and Defense effects.',
		changes: { basePower: 100, onAfterHit(target, source, move) {
			const state = hitState(target, move);
			if (!damagesFoe(target, source, move) || state.sewn) return;
			state.sewn = true;
			if (target.getStat('spe') < source.getStat('spe')) shortTrap(target, source, move);
			else this.boost({ spe: -1 }, target, source, move);
		} },
	},
	barbaraclemega: {
		base: 'razorshell', name: 'Keel Cutter', num: 33214,
		desc: '90 power. Ignores positive defensive stages when the foe has raised Defense. Retains Razor Shell’s Defense-drop chance.',
		changes: { basePower: 90, onPrepareHit(target, source, move) {
			if (target.boosts.def > 0) move.ignorePositiveDefensive = true;
		} },
	},
	bronzongmega: {
		base: 'extrasensory', name: 'Storm Toll', num: 33215,
		desc: '95-power Psychic sound move that hits through Substitute. In rain, the first damaging use per entry lowers the foe’s Sp. Def. Can flinch.',
		changes: { basePower: 95, flags: { sound: 1, bypasssub: 1, protect: 1, mirror: 1, metronome: 1 },
			onAfterHit(target, source, move) {
				if (damagesFoe(target, source, move) && rain(source) && firstThisEntry(source, 'stormTollEntry')) {
					this.boost({ spd: -1 }, target, source, move);
				}
			},
		},
	},
	butterfreemega: {
		base: 'bugbuzz', name: 'Spore Chorus', num: 33216,
		desc: '100-power Bug sound attack. Has independent chances to lower Sp. Def (10%) and poison (20%).',
		changes: { basePower: 100, secondaries: [{ chance: 10, boosts: { spd: -1 } }, { chance: 20, status: 'psn' }] },
	},
	chandeluremega: {
		base: 'shadowball', name: 'Vigil Flame', num: 33217,
		desc: '100-power Ghost bullet. Against a burned foe, has 120 power and heals 1/8 max HP after dealing damage, once per turn. Keeps Shadow Ball’s Sp. Def-drop chance.',
		changes: { basePower: 100, basePowerCallback(source, target) { return target.status === 'brn' ? 120 : 100; },
			onAfterHit(target, source, move) {
				if (!damagesFoe(target, source, move) || target.status !== 'brn' || source.m.vigilFlameTurn === this.turn) return;
				source.m.vigilFlameTurn = this.turn;
				this.heal(source.baseMaxhp / 8, source, source, move);
			},
		},
	},
	chimechomegay: {
		base: 'ominouswind', name: 'Passing Bell', num: 33218,
		desc: '85-power Ghost sound attack. Has 105 power against a foe with a disabled move. Hits through Substitute and retains Ominous Wind’s 10% chance to raise all five stats.',
		changes: { basePower: 85, flags: { sound: 1, bypasssub: 1, protect: 1, mirror: 1, metronome: 1 },
			basePowerCallback(source, target) {
				return target.volatiles.disable || target.moveSlots.some(slot => slot.disabled) ? 105 : 85;
			},
		},
	},
	cinderacemega: {
		base: 'pyroball', name: 'Volley Shot', num: 33219,
		desc: '125-power Fire kick and bullet. Shatters the foe’s Reflect before damage on a successful hit. Keeps Pyro Ball’s burn and thaw effects.',
		changes: { basePower: 125, onTryHit(target, source) {
			if (!source.isAlly(target)) target.side.removeSideCondition('reflect');
		} },
	},
	claydolmega: {
		base: 'earthpower', name: 'Axis Break', num: 33220,
		desc: '100 power. Ignores positive defensive stages in Wonder Room. Has a 10% chance to lower Sp. Def.',
		changes: { basePower: 100, onModifyMove(move) {
			if (this.field.pseudoWeather.wonderroom) move.ignorePositiveDefensive = true;
		} },
	},
	clefablemega: {
		base: 'moonblast', name: 'Moon Cradle', num: 33221,
		desc: '105 power. Under Gravity, dealing damage heals the active adjacent ally with the lowest HP percentage by 1/12 of that ally’s maximum HP, or the user when alone, once per turn. Can lower Sp. Atk.',
		changes: { basePower: 105, onAfterHit(target, source, move) {
			if (!this.field.pseudoWeather.gravity || !damagesFoe(target, source, move) ||
				source.m.moonCradleTurn === this.turn) return;
			source.m.moonCradleTurn = this.turn;
			const allies = source.adjacentAllies().filter(p => p.hp);
			const recipient = allies.sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0] || source;
			this.heal(recipient.baseMaxhp / 12, recipient, source, move);
		} },
	},
	crabominablemega: {
		base: 'icehammer', name: 'Pack Ice Punch', num: 33222,
		desc: '115-power Ice punch. Against a foe that has already moved this turn, has 125 power and breaks Reflect and Aurora Veil before damage. Lowers the user’s Speed.',
		changes: { basePower: 115,
			basePowerCallback(source, target) { return target.moveThisTurn ? 125 : 115; },
			onTryHit(target, source) {
				if (!target.moveThisTurn || source.isAlly(target)) return;
				target.side.removeSideCondition('reflect');
				target.side.removeSideCondition('auroraveil');
			},
		},
	},
	darkraimega: {
		base: 'darkpulse', name: 'Night Terror', num: 33223,
		desc: '90 power, or 110 against a sleeping or drowsy foe. Retains Dark Pulse’s flinch chance.',
		changes: { basePower: 90, basePowerCallback(source, target) {
			return target.status === 'slp' || target.volatiles.yawn ? 110 : 90;
		} },
	},
	dianciemega: {
		base: 'diamondstorm', name: 'Prism Volley', num: 33224,
		desc: '105 power, 100% accuracy. After Diamond Storm raises Defense, clears the user’s Sp. Def drops once per entry.',
		changes: { basePower: 105, accuracy: 100,
			onTryMove(source, target, move: ActiveMove & { prismStartDef?: number }) { move.prismStartDef = source.boosts.def; },
			onAfterMoveSecondarySelf(source, target, move: ActiveMove & { prismStartDef?: number }) {
				if (move.prismStartDef === undefined || source.boosts.def <= move.prismStartDef || source.boosts.spd >= 0 ||
					!firstThisEntry(source, 'prismVolleyEntry')) return;
				source.setBoost({ spd: 0 });
				this.add('-setboost', source, 'spd', 0, '[from] move: Prism Volley');
			},
		},
	},
	dragalgemega: {
		base: 'sludgebomb', name: 'Bilge Bomb', num: 33225,
		desc: '100 power. The first damaging hit on an already poisoned foe per entry prevents its healing for two turns. Can poison.',
		changes: { basePower: 100, onPrepareHit: markPoison, onAfterHit(target, source, move) {
			if (damagesFoe(target, source, move) && hitState(target, move).previouslyPoisoned &&
				firstThisEntry(source, 'bilgeBombEntry') &&
				target.addVolatile('healblock', source, move)) target.volatiles.healblock.duration = 2;
		} },
	},
	drampamega: {
		base: 'dragonpulse', name: 'Monsoon Pulse', num: 33226,
		desc: '100 power. In rain, the first damaging hit per entry lowers the foe’s Speed one stage. Can lower Sp. Def.',
		changes: { basePower: 100, onAfterHit(target, source, move) {
			if (damagesFoe(target, source, move) && rain(source) && firstThisEntry(source, 'monsoonPulseEntry')) {
				this.boost({ spe: -1 }, target, source, move);
			}
		} },
	},
	dusknoirmega: {
		base: 'shadowpunch', name: 'Grave Grasp', num: 33227,
		desc: '95-power Ghost punch that never misses. Has 115 power against a foe whose move the user blocked with Misaligned Stars this turn.',
		changes: { basePower: 95, basePowerCallback(source, target) {
			return target.m.starsBlockedBy === source && target.m.starsBlockedTurn === this.turn ? 115 : 95;
		} },
	},
	eelektrossmega: {
		base: 'wildcharge', name: 'Dynamo Crash', num: 33228,
		desc: '125-power Electric charge with recoil of 1/8 damage dealt. Damaging a foe on Electric Terrain or Electric Aura clears the user’s Speed drops.',
		changes: { basePower: 125, recoil: [1, 8], onAfterHit(target, source, move) {
			if (source.boosts.spe >= 0 || !damagesFoe(target, source, move) ||
				!(this.field.isTerrain('electricterrain') || this.field.isAura('electricterrain'))) return;
			source.setBoost({ spe: 0 });
			this.add('-setboost', source, 'spe', 0, '[from] move: Dynamo Crash');
		} },
	},
	falinksmega: {
		base: 'closecombat', name: 'Rank Break', num: 33229,
		desc: '125 power. Once per entry, shatters the foe’s Reflect before damage on a successful hit. Lowers Defense and Sp. Def.',
		changes: { basePower: 125, onTryHit(target, source) {
			if (!source.isAlly(target) && target.side.sideConditions.reflect && firstThisEntry(source, 'rankBreakEntry')) {
				target.side.removeSideCondition('reflect');
			}
		} },
	},
};
