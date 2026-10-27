import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const FairyEclipseDescriptions = {
	trickperformer: {name: 'Trick Performer', shortDesc: 'Technician + Prankster; Mimecraft screens total +1 priority.', desc: 'Full local Technician and Prankster. Reflect and Light Screen receive a total of +1 priority when Mimecraft is also present.'},
	taptempo: {name: 'Tap Tempo', shortDesc: 'Own Tempo; damaging Ice/Psychic attacks have one 30% Speed-drop roll.', desc: 'Full local Own Tempo. After an Ice- or Psychic-type attack damages an opponent, attempts to lower that opponent\'s Speed by one stage with 30% probability, once per whole move. Does not trigger on allies or Substitute-only damage.'},
	prismskimmer: {name: 'Prism Skimmer', shortDesc: 'Water STAB/resistances; Laser Focus on entry and after opposing attack damage.', desc: "Water attacks receive ordinary 1.5x STAB without stacking extra STAB when already Water. Incoming Fire, Water, Ice and Steel attack damage is halved, without adding Water typing or weaknesses. Gains ordinary two-turn Laser Focus on genuine entry and once after surviving opposing attack HP damage; no ally, residual or Substitute-only triggers."},
	constrictingcoils: {name: 'Constricting Coils', shortDesc: 'Attacks bind foes; bound foes deal 0.8x damage; drains own binding damage.', desc: 'After an attack deals opposing HP damage, applies ordinary Wrap binding once to each surviving opponent. Existing binding is not refreshed. Incoming attacks from bound foes deal 0.8x damage. Heals actual residual binding HP damage caused by this living active holder; Heal Block and Liquid Ooze apply.'},
	astralconcord: {name: 'Astral Concord', shortDesc: 'Full local Forewarn + Competitive.', desc: "Has all local Forewarn warning, Illusion reveal, damage protection and Psychic Terrain effects. Competitive raises Special Attack by two stages when an opponent lowers a stat."},
	cellularconcord: {name: 'Cellular Concord', shortDesc: 'Full Natural Cure + Analytic.', desc: "Cures major status on switching out and, when curing status, heals 1/8 base max HP unless Withering Shell applies. Cures status at turn end on Bewitched Woods. Moves gain the local Analytic power boost when no other active Pokemon has a move remaining in the action queue."},
	fairyring: {name: 'Fairy Ring', shortDesc: 'Sp. Def 1.3x; draining healing 1.3x; drains statused foes; entry Spotlights an ally.', desc: "Special Defense is multiplied by 1.3. Recovery from draining moves, Strength Sap, Leech Seed, Ingrain and Aqua Ring is multiplied by 1.3, stacking once with Big Root. Each turn, each major-statused opposing Pokemon loses 1/16 max HP and this Pokemon drains the actual HP lost with its recovery bonus. Magic Guard prevents the residual loss; Liquid Ooze reverses draining recovery. Heal Block prevents recovery, not opposing residual damage. On genuine entry, applies ordinary Spotlight to one living adjacent ally until the end of the turn; does not repeat Illuminate's Spotlight."},
	guidingglow: {name: 'Guiding Glow', shortDesc: 'Full Illuminate + Sweet Veil.', desc: "Full local Illuminate reveals opposing Illusion, ignores evasion and prevents opposing accuracy drops, retaining Mirror Arena and Starlight entry effects. Full Sweet Veil prevents sleep and Yawn on the holder and allies, including Rest, without curing sleep. Its Starlight ally Spotlight does not duplicate Fairy Ring."},
	rainlitgrowth: {name: 'Rainlit Growth', shortDesc: 'Rain Dish; Grass moves have 1.3x power in effective rain.', desc: 'Full local Rain Dish restores 1/16 base max HP during effective rain or heavy rain. Grass moves have 1.3x power during effective rain or heavy rain; weather suppression disables these rain benefits.'},
	eclipsevision: {name: 'Eclipse Vision', shortDesc: 'SpA 1.3x; opening Psychic/Dark type; moves switch type; Psychic heals, Dark drains.', desc: 'Special Attack is multiplied by 1.3. Its first move slot sets its opening type if Psychic or Dark, and later Psychic- or Dark-type moves change it to that type. Psychic typing restores 1/8 base max HP at turn end; Dark typing restores HP equal to 1/4 damage dealt. Species-passive effects remain separate from the selected ability and do not double when copied into that slot.'},
	shadowtag: {name: 'Shadow Tag', shortDesc: 'Traps foes; takes 0.8x damage from attacks.', desc: 'Prevents adjacent opposing Pokemon from choosing to switch out, except Ghost types, Shed Shell holders and other Shadow Tag users. Takes 0.8x incoming attack damage. On Haunted Field, reveals opposing held items on entry. Cannot be suppressed. Other trapping and pivot rules remain unchanged.'},
};

export function installFairyEclipse(abilities: AbilityDataTable) {
	abilities.trickperformer = {...abilities.technician, ...abilities.prankster, name: 'Trick Performer', num: 11475, rating: 4,
		onModifyPriority(priority, pokemon, target, move) {
			if (pokemon.hasAbilityOrPassive('mimecraft') && ['reflect','lightscreen'].includes(move.id)) { move.pranksterBoosted = true; return; }
			return abilities.prankster.onModifyPriority!.call(this, priority, pokemon, target, move);
		},
	};
	abilities.taptempo = {...abilities.owntempo, name: 'Tap Tempo', num: 11476, rating: 4,
		onSourceDamagingHit(damage, target, source, move) {
			if (damage > 0 && !target.isAlly(source) && ['Ice','Psychic'].includes(move.type)) ((move as any).tapTempoTargets ||= new Set()).add(target);
		},
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (source !== this.effectState.target) return;
			const targets = (move as any).tapTempoTargets; delete (move as any).tapTempoTargets;
			const foe = [...(targets || [])].find((p: Pokemon) => p.hp);
			if (foe && this.randomChance(3, 10)) this.boost({spe: -1}, foe, source, this.effect);
		},
	};
	abilities.prismskimmer = {name: 'Prism Skimmer', num: 11477, rating: 4, flags: {},
		onModifySTAB(stab, source, target, move) { if (move.type === 'Water') return Math.max(stab, 1.5); },
		onSourceModifyDamage(damage, source, target, move) { if (['Fire','Water','Ice','Steel'].includes(move.type)) return this.chainModify(0.5); },
		onSwitchIn(pokemon) { pokemon.addVolatile('laserfocus', pokemon, this.effect); },
		onDamagingHit(damage, target, source, move) { if (damage > 0 && !source.isAlly(target)) ((move as any).prismSkimmerTargets ||= new Set()).add(target); },
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			const holder = this.effectState.target as Pokemon;
			if (holder.hp && holder.isActive && (move as any).prismSkimmerTargets?.delete(holder)) holder.addVolatile('laserfocus', holder, this.effect);
		},
	};
	abilities.constrictingcoils = {name: 'Constricting Coils', num: 11478, rating: 4, flags: {},
		onSourceModifyDamage(damage, source) { if (source.volatiles.partiallytrapped) return this.chainModify(0.8); },
		onSourceDamagingHit(damage, target, source, move) { if (damage > 0 && !target.isAlly(source)) ((move as any).coilsTargets ||= new Set()).add(target); },
		onAnyAfterAttackResolved(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
			if (source !== this.effectState.target) return;
			const targets = (move as any).coilsTargets; delete (move as any).coilsTargets;
			for (const foe of targets || []) if (foe.hp && !foe.volatiles.partiallytrapped) foe.addVolatile('partiallytrapped', source, this.dex.moves.get('wrap'));
		},
	};
	abilities.astralconcord = {...abilities.forewarn, ...abilities.competitive, name: 'Astral Concord', num: 11473, rating: 4};
	abilities.cellularconcord = {...abilities.naturalcure, ...abilities.analytic, name: 'Cellular Concord', num: 11474, rating: 4};
	abilities.fairyring = {
		name: 'Fairy Ring', num: 11470, rating: 4, flags: {},
		onModifySpDPriority: 5,
		onModifySpD(spd, pokemon) { if (!skipPassiveComponent(this, pokemon, 'fairyring')) return this.chainModify(1.3); },
		onTryHeal(damage, target, source, effect) {
			if (!skipPassiveComponent(this, target, 'fairyring') && ['drain','strengthsap','leechseed','ingrain','aquaring'].includes(effect.id)) return this.chainModify(1.3);
		},
		onSwitchIn(pokemon) {
			if (skipPassiveComponent(this, pokemon, 'fairyring')) return;
			const ally = pokemon.adjacentAllies().find(p => p.hp && p.isActive);
			if (ally && !ally.volatiles.spotlight) ally.addVolatile('spotlight', pokemon, this.effect);
		},
		onResidualOrder: 26,
		onResidual(pokemon) {
			if (skipPassiveComponent(this, pokemon, 'fairyring') || !pokemon.hp) return;
			for (const foe of pokemon.foes()) {
				if (!pokemon.hp || !pokemon.isActive) break;
				if (!foe.hp || !foe.status) continue;
				const lost = this.damage(foe.maxhp / 16, foe, pokemon, this.effect);
				if (!pokemon.hp || !pokemon.isActive) break;
				if (typeof lost === 'number' && lost > 0) this.heal(lost, pokemon, foe, 'drain');
			}
		},
	};
	abilities.guidingglow = {...abilities.illuminate, ...abilities.sweetveil, name: 'Guiding Glow', num: 11471, rating: 4};
	abilities.rainlitgrowth = {...abilities.raindish, name: 'Rainlit Growth', num: 11472, rating: 3,
		onBasePower(power, source, target, move) {
			if (move.type === 'Grass' && ['raindance','primordialsea'].includes(source.effectiveWeather())) return this.chainModify(1.3);
		},
	};
	for (const id of ['eclipsevision', 'adaptivecell', 'prismskimmer', 'constrictingcoils'] as const) {
	for (const key of Object.keys(abilities[id])) {
		const callback = (abilities[id] as any)[key];
		if (!key.startsWith('on') || typeof callback !== 'function') continue;
		(abilities[id] as any)[key] = function (this: Battle, ...args: any[]) {
			if (skipPassiveComponent(this, this.effectState.target, id)) return;
			return callback.apply(this, args);
		};
	}
	}
}
