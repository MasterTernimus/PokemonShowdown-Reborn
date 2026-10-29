import type { AbilityDataTable } from '../sim/dex-abilities';
import type { ConditionDataTable } from '../sim/dex-conditions';
import { composeSelectedAbility } from './selected-mega-simplifications';

export const LoreComponents: { [id: string]: string[] } = {
	dunecaller: ['sandstream'], miragedrift: ['overcoat'], dunehunter: ['innerfocus'],
	breakingnews: ['forewarn'], blackwateranchor: ['steelworker'], blackwatervenom: [],
	rememberedstep: [], rememberedflame: ['flashfire', 'download'], stormmemory: [], jetstreamballet: ['windrider'],
};

export const LoreDescriptions: Record<string, { name: string, shortDesc: string, desc: string }> = {
	dunecaller: { name: 'Dune Caller',
		shortDesc: 'Summons sand; sound attacks lower foes\' Speed during sand.',
		desc: 'Summons sand for 5 turns on entry, or 8 with Smooth Rock. During effective sand, damaging sound hits lower each foe\'s Speed by 1 stage, once per target per turn.' },
	miragedrift: { name: 'Mirage Drift',
		shortDesc: 'Overcoat; sand heals 1/8 HP and boosts Ground. Special Ground ignores its Sp. Atk drops.',
		desc: 'Overcoat. During effective sand, heals 1/8 max HP each turn and Ground attacks gain 30% power. Special Ground attacks ignore the user\'s negative Sp. Atk stages on any field.' },
	dunehunter: { name: 'Dune Hunter',
		shortDesc: 'Inner Focus; Ground/Dark hit slowed foes harder. Sand reduces damage before it moves.',
		desc: 'Inner Focus. Ground and Dark attacks gain 30% power against foes with negative Speed stages. During effective sand, takes 25% less attack damage before acting that turn.' },
	breakingnews: { name: 'Breaking News',
		shortDesc: 'Forewarn; exposes status users: bypass their defensive boosts; Psychic/Fairy gains 25%.',
		desc: 'Forewarn: scans each foe on entry and every opposing switch-in, reveals a strongest attack and removes Illusion. Takes 20% less move damage, or 25% less from the latest warned attack; these reductions do not stack. Successful reveals on Psychic Terrain grant +2 Sp. Atk. Successful opposing status moves expose their user through the following turn. The reporter and adjacent allies ignore exposed foes\' positive defensive stages; the reporter\'s Psychic/Fairy attacks also gain 25% power. An exposed foe switching out clears its mark; leaving ends that reporter\'s marks.' },
	blackwateranchor: { name: 'Blackwater Anchor',
		shortDesc: 'Steelworker; Grass/Steel hits slow foes. Anchor Shot drains; water fields share poisoned-foe drain.',
		desc: 'Full Steelworker, including Steel STAB, its attacking-stat boost, resistances, Poison immunity and field effects. Grass/Steel hits lower each foe\'s Speed by 1, once per turn. Anchor Shot tethers one trapped foe, draining 1/16 max HP per turn and healing the user by actual damage dealt. On Water Surface or Underwater, draining a poisoned tethered foe also heals adjacent allies by that amount. Either participant leaving ends the tether; escape, suppression, damage immunity and healing restrictions apply.' },
	blackwatervenom: { name: 'Blackwater Venom',
		shortDesc: 'Poison hits poison slowed foes; Dragon gains 25% vs poison. Ignores water-field Speed penalties.',
		desc: 'Damaging Poison hits poison foes with negative Speed stages, respecting status protections. Dragon attacks gain 25% power against poisoned or badly poisoned foes. Ignores the Speed penalties of Water Surface and Underwater.' },
	rememberedstep: { name: 'Remembered Step',
		shortDesc: 'Quick Attack becomes special Psychic damage and gains 50% power behind Reflect.',
		desc: 'Quick Attack becomes a special Psychic attack, retaining its normal power and priority. It gains 50% power while Reflect protects the user\'s side. Priority-blocking effects apply normally.' },
	rememberedflame: { name: 'Remembered Flame',
		shortDesc: 'Flash Fire + Download; landing Extreme Speed strengthens the next Fire attack by 30%.',
		desc: 'Flash Fire + Download. After Extreme Speed damages a foe, the next damaging Fire move gains 30% power. The charge lasts through the following turn, cannot stack, and is consumed on attempting the Fire attack, even on a miss or block. Switching or losing the ability clears the charge.' },
	stormmemory: { name: 'Storm Memory',
		shortDesc: 'First super-effective attack: 25% less damage; surviving empowers a draining Electric attack.',
		desc: 'Once per entry, the first super-effective opposing attack that deals HP damage is weakened by 25% for the whole attack. Surviving stores one Storm Charge: the next damaging Electric move gains 50% power and heals the user for 25% of actual damage dealt to foes. Attempting that Electric attack consumes the charge, even on a miss or block. Switching or losing the ability clears the charge; ability changes do not refresh the guard.' },
	jetstreamballet: { name: 'Jetstream Ballet',
		shortDesc: 'Wind Rider; Tailwind boosts physical Water attacks by 20% and removes contact.',
		desc: 'Full Wind Rider: absorbs wind moves for +1 Attack, gains +1 Attack on entering or starting Tailwind, and gains +1 Attack/Sp. Atk each turn in Strong Winds. During its side\'s Tailwind, physical Water attacks gain 20% power and do not make contact.' },
};

type LoreMove = ActiveMove & {
	rememberedFlameUser?: Pokemon,
	stormChargeUser?: Pokemon,
	stormDamage?: Map<Pokemon, number>,
	stormGuards?: Set<Pokemon>,
	stormSurvivors?: Set<Pokemon>,
};

function slowFoe(battle: Battle, damage: number, target: Pokemon, source: Pokemon) {
	if (damage <= 0 || !target.hp || source.isAlly(target)) return;
	source.addVolatile('loreslowmemory', source);
	const memory: Map<Pokemon, number> = source.volatiles.loreslowmemory.targets ||= new Map();
	if (memory.get(target) === battle.turn) return;
	memory.set(target, battle.turn);
	battle.boost({ spe: -1 }, target, source, battle.effect);
}

function exposedTo(battle: Battle, target: Pokemon, reporter: Pokemon) {
	return reporter.hp && reporter.isActive && !target.isAlly(reporter) &&
		(target.volatiles.gossipexposed?.reporters?.get(reporter) ?? -1) >= battle.turn;
}

function clearReports(this: Battle, reporter: Pokemon) {
	for (const foe of this.getAllActive()) {
		const reports: Map<Pokemon, number> | undefined = foe.volatiles.gossipexposed?.reporters;
		if (reports?.delete(reporter) && !reports.size) foe.removeVolatile('gossipexposed');
	}
}

export const LoreConditions: ConditionDataTable = {
	loreslowmemory: { name: 'Lore slow memory', noCopy: true },
	gossipexposed: {
		name: 'Gossip Exposed', duration: 2, noCopy: true,
		onStart(target, source) {
			this.effectState.reporters = new Map([[source, this.turn + 1]]);
			this.add('-start', target, 'Exposed');
		},
		onRestart(target, source) {
			this.effectState.duration = 2;
			this.effectState.reporters.set(source, this.turn + 1);
		},
		onEnd(target) { this.add('-end', target, 'Exposed'); },
	},
	rememberedflamecharge: {
		name: 'Remembered Flame Charge', duration: 2, noCopy: true,
		onStart(pokemon) { this.add('-start', pokemon, 'Remembered Flame'); },
		onRestart() { this.effectState.duration = 2; },
		onEnd(pokemon) { this.add('-end', pokemon, 'Remembered Flame'); },
	},
	stormmemoryspent: { name: 'Storm Memory spent', noCopy: true },
	stormcharge: {
		name: 'Storm Charge', noCopy: true,
		onStart(pokemon) { this.add('-start', pokemon, 'Storm Charge'); },
		onEnd(pokemon) { this.add('-end', pokemon, 'Storm Charge'); },
	},
};

export function installLorePairs(abilities: AbilityDataTable) {
	for (const [i, [id, text]] of Object.entries(LoreDescriptions).entries()) {
		abilities[id as ID] = { ...text, num: 12011 + i, rating: 4, flags: id === 'stormmemory' ? { breakable: 1 } : {} };
		if (LoreComponents[id].length) composeSelectedAbility(abilities, id, LoreComponents[id], true);
	}
	abilities.dunecaller.onSourceDamagingHit = function (damage, target, source, move) {
		if (move.flags.sound && this.field.isWeather('sandstorm')) slowFoe(this, damage, target, source);
	};
	Object.assign(abilities.miragedrift, {
		onResidualOrder: 5, onResidualSubOrder: 1,
		onResidual(this: Battle, pokemon: Pokemon) {
			if (this.field.isWeather('sandstorm')) this.heal(pokemon.baseMaxhp / 8, pokemon);
		},
		onBasePowerPriority: 21,
		onBasePower(this: Battle, basePower: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (this.movehasType(move, 'Ground') && this.field.isWeather('sandstorm')) return this.chainModify(1.3);
		},
		onModifyMove(this: Battle, move: ActiveMove) {
			if (move.category === 'Special' && this.movehasType(move, 'Ground')) move.ignoreNegativeOffensive = true;
		},
	});
	abilities.dunehunter.onBasePowerPriority = 21;
	abilities.dunehunter.onBasePower = function (basePower, source, target, move) {
		if (!source.isAlly(target) && target.boosts.spe < 0 &&
			(this.movehasType(move, 'Ground') || this.movehasType(move, 'Dark'))) return this.chainModify(1.3);
	};
	abilities.dunehunter.onSourceModifyDamage = function (damage, source, target) {
		if (!source.isAlly(target) && target.moveThisTurnResult === undefined && this.field.isWeather('sandstorm')) {
			return this.chainModify(0.75);
		}
	};
	abilities.breakingnews.onAnyAfterMove = function (source, target, move) {
		const reporter: Pokemon = this.effectState.target;
		if (!reporter.hp || !source.hp || !source.isActive || reporter.isAlly(source) ||
			move.category !== 'Status' || source.moveThisTurnResult !== true) return;
		if (source.addVolatile('gossipexposed', reporter, this.effect)) {
			this.add('-message', `Gossip Gardevoir exposes ${source.name}'s strategy!`);
		}
	};
	abilities.breakingnews.onAnyModifyBoost = function (boosts, pokemon) {
		const reporter: Pokemon = this.effectState.target;
		const attacker = this.activePokemon;
		if (pokemon !== this.activeTarget || !attacker || !exposedTo(this, pokemon, reporter) ||
			!(attacker === reporter || (reporter.isAlly(attacker) && reporter.isAdjacent(attacker)))) return;
		if ((boosts.def || 0) > 0) boosts.def = 0;
		if ((boosts.spd || 0) > 0) boosts.spd = 0;
	};
	abilities.breakingnews.onBasePowerPriority = 21;
	abilities.breakingnews.onBasePower = function (basePower, source, target, move) {
		if (exposedTo(this, target, source) && (this.movehasType(move, 'Psychic') || this.movehasType(move, 'Fairy'))) {
			return this.chainModify(1.25);
		}
	};
	abilities.breakingnews.onSwitchOut = clearReports;
	abilities.breakingnews.onEnd = clearReports;
	abilities.blackwateranchor.onSourceDamagingHit = function (damage, target, source, move) {
		if (this.movehasType(move, 'Grass') || this.movehasType(move, 'Steel')) slowFoe(this, damage, target, source);
	};
	// Apply the added Steel resistance once, based on the incoming attack, not the holder's types.
	abilities.blackwateranchor.onEffectiveness = function (typeMod, target, type, move) {
		if (target && type === target.getTypes()[0] &&
			['Normal', 'Flying', 'Rock', 'Bug', 'Steel', 'Grass', 'Psychic', 'Ice', 'Dragon', 'Fairy'].includes(move.type)) {
			return typeMod - 1;
		}
	};
	abilities.blackwateranchor.onTryHit = function (target, source, move) {
		if (target !== source && move.category !== 'Status' && this.movehasType(move, 'Poison')) {
			this.add('-immune', target, '[from] ability: Blackwater Anchor');
			return null;
		}
	};
	abilities.blackwateranchor.onSetStatus = function (status) {
		if (status.id === 'psn' || status.id === 'tox') return false;
	};
	abilities.blackwatervenom.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && target.hp && !source.isAlly(target) && target.boosts.spe < 0 && this.movehasType(move, 'Poison')) {
			target.trySetStatus('psn', source, this.effect);
		}
	};
	abilities.blackwatervenom.onBasePowerPriority = 21;
	abilities.blackwatervenom.onBasePower = function (basePower, source, target, move) {
		if (!source.isAlly(target) && ['psn', 'tox'].includes(target.status) && this.movehasType(move, 'Dragon')) {
			return this.chainModify(1.25);
		}
	};
	abilities.rememberedstep.onModifyTypePriority = -2;
	abilities.rememberedstep.onModifyType = function (move) {
		if (move.id === 'quickattack') { move.type = 'Psychic'; delete move.types; }
	};
	abilities.rememberedstep.onModifyMove = function (move) {
		if (move.id === 'quickattack') move.category = 'Special';
	};
	abilities.rememberedstep.onBasePowerPriority = 21;
	abilities.rememberedstep.onBasePower = function (basePower, source, target, move) {
		if (move.id === 'quickattack' && source.side.sideConditions.reflect) return this.chainModify(1.5);
	};
	const flameEnd = abilities.rememberedflame.onEnd;
	abilities.rememberedflame.onEnd = function (pokemon) {
		flameEnd?.call(this, pokemon);
		pokemon.removeVolatile('rememberedflamecharge');
	};
	abilities.rememberedflame.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && move.id === 'extremespeed' && !source.isAlly(target)) source.addVolatile('rememberedflamecharge');
	};
	abilities.rememberedflame.onTryMove = function (source, target, move: LoreMove) {
		if (move.category !== 'Status' && this.movehasType(move, 'Fire') && source.volatiles.rememberedflamecharge) {
			move.rememberedFlameUser = source;
			source.removeVolatile('rememberedflamecharge');
		}
	};
	abilities.rememberedflame.onBasePowerPriority = 21;
	abilities.rememberedflame.onBasePower = function (basePower, source, target, move: LoreMove) {
		if (move.rememberedFlameUser === source) return this.chainModify(1.3);
	};
	abilities.stormmemory.onSourceModifyDamage = function (damage, source, target, move: LoreMove) {
		if (source.isAlly(target) || move.category === 'Status') return;
		if (target.volatiles.substitute && !move.flags.sound && !move.infiltrates) return;
		if (move.stormGuards?.has(target)) return this.chainModify(0.75);
		if (!target.volatiles.stormmemoryspent && target.getMoveHitData(move).typeMod > 0) {
			(move.stormGuards ||= new Set()).add(target);
			return this.chainModify(0.75);
		}
	};
	abilities.stormmemory.onDamagingHit = function (damage, target, source, move: LoreMove) {
		if (damage <= 0 || !move.stormGuards?.has(target)) return;
		target.addVolatile('stormmemoryspent');
		(move.stormSurvivors ||= new Set()).add(target);
	};
	abilities.stormmemory.onAnyAfterMove = function (source, target, move: LoreMove) {
		const holder: Pokemon = this.effectState.target;
		if (move.stormSurvivors?.delete(holder) && holder.hp && holder.isActive) holder.addVolatile('stormcharge');
	};
	abilities.stormmemory.onTryMove = function (source, target, move: LoreMove) {
		if (move.category !== 'Status' && this.movehasType(move, 'Electric') && source.volatiles.stormcharge) {
			move.stormChargeUser = source;
			source.removeVolatile('stormcharge');
		}
	};
	abilities.stormmemory.onBasePowerPriority = 21;
	abilities.stormmemory.onBasePower = function (basePower, source, target, move: LoreMove) {
		if (move.stormChargeUser === source) return this.chainModify(1.5);
	};
	abilities.stormmemory.onAnyAfterDamageApplied = function (damage, target, source, effect) {
		const move = effect as LoreMove;
		if (damage > 0 && source === this.effectState.target && move.stormChargeUser === source && !source.isAlly(target)) {
			const totals = move.stormDamage ||= new Map();
			totals.set(target, (totals.get(target) || 0) + damage);
		}
	};
	abilities.stormmemory.onAfterMove = function (source, target, move: LoreMove) {
		if (move.stormChargeUser !== source || !source.hp || !move.stormDamage) return;
		for (const [foe, damage] of move.stormDamage) this.heal(damage / 4, source, foe, 'drain');
		delete move.stormDamage;
	};
	abilities.stormmemory.onEnd = function (pokemon) { pokemon.removeVolatile('stormcharge'); };
	abilities.jetstreamballet.onModifyMove = function (move, source) {
		if (source.side.sideConditions.tailwind && move.category === 'Physical' && this.movehasType(move, 'Water')) {
			delete move.flags.contact;
		}
	};
	abilities.jetstreamballet.onBasePowerPriority = 21;
	abilities.jetstreamballet.onBasePower = function (basePower, source, target, move) {
		if (source.side.sideConditions.tailwind && move.category === 'Physical' && this.movehasType(move, 'Water')) {
			return this.chainModify(1.2);
		}
	};
}
