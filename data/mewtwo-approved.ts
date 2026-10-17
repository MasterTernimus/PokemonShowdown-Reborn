import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const MewtwoComponents = {
	absolutepressure: ['pressure', 'innerfocus', 'insomnia', 'moldbreaker'],
	perfectedgenome: ['adaptability', 'unnerve'],
	mindmirror: ['opportunist'],
	unboundwill: ['magicbounce', 'clearbody'],
	psycheforce: ['toughclaws', 'ironfist'],
	psychedominion: ['psychicsurge', 'dishearten'],
};

export const MewtwoDescriptions = {
	absolutepressure: {
		name: 'Absolute Pressure',
		shortDesc: "Pressure + Inner Focus + Insomnia + Mold Breaker; 1/3-HP shield; once-battle Mega return.",
		desc: "Pressure + Inner Focus + Insomnia + Mold Breaker, including their entry effects and Insomnia’s 1.3x Dark/Ghost power. Entry and Mega Evolution refill an attack shield equal to 1/3 max HP; excess damage reaches HP. Status and indirect damage bypass the shield. Once per battle, a would-be faint as Mega Mewtwo instead restores base Mewtwo at half max HP with its original ability and a fresh shield. Its Mega use stays spent.",
	},
	perfectedgenome: {name: 'Perfected Genome', shortDesc: 'Adaptability + Unnerve.', desc: 'Adaptability + Unnerve.'},
	mindmirror: {
		name: 'Mind Mirror', shortDesc: "Opportunist; entry copies each stat’s highest positive opposing stage.",
		desc: "Opportunist. On entry, copies the highest positive opposing stage in each stat, keeping its own higher stages.",
	},
	unboundwill: {
		name: 'Unbound Will', shortDesc: "Magic Bounce + Clear Body; blocks Taunt, Encore, Disable and Torment.",
		desc: "Magic Bounce + Clear Body. Immune to Taunt, Encore, Disable and Torment, including unreflectable effects.",
	},
	psycheforce: {
		name: 'Psyche Force', shortDesc: "Tough Claws + Iron Fist; contact attacks heal 1/3 of opposing HP damage.",
		desc: "Tough Claws + Iron Fist (1.4x punching power). Contact attacks heal 1/3 of opposing HP damage, stacking with move draining.",
	},
	psychedominion: {
		name: 'Psyche Dominion', shortDesc: "Psychic Surge + Dishearten; Psychic attacks use the lower defense.",
		desc: "Psychic Surge + Dishearten: entry lowers adjacent foes’ Sp. Atk by 1, respecting Substitute and stat-drop protection. Psychic attacks use the target’s lower effective Defense or Sp. Def, retaining their category and offensive stat.",
	},
};

export function refillMewtwoShield(battle: Battle, pokemon: Pokemon) {
	pokemon.m.absolutePressureShield = Math.floor(pokemon.maxhp / 3);
	battle.add('-message', `${pokemon.name}'s Absolute Pressure shield has ${pokemon.m.absolutePressureShield} HP!`);
}

export function installMewtwo(abilities: AbilityDataTable) {
	const a = abilities as any;
	// These primitives may also be selected/copied while their passive is present.
	for (const id of ['pressure', 'innerfocus', 'insomnia', 'moldbreaker']) {
		for (const [key, callback] of Object.entries(a[id])) {
			if (!key.startsWith('on') || typeof callback !== 'function') continue;
			a[id][key] = function (this: Battle, ...args: any[]) {
				if (skipPassiveComponent(this, this.effectState.target, id)) return;
				if (this.effectState.speciesPassive === 'absolutepressure' && a[id].flags.breakable &&
					this.suppressingAbility(this.effectState.target, a[id])) return;
				return callback.apply(this, args);
			};
		}
	}
	a.absolutepressure = {
		...a.pressure, ...a.innerfocus, ...a.insomnia, ...a.moldbreaker,
		name: 'Absolute Pressure', num: 11726, rating: 5, flags: {},
		onStart: undefined,
		onSwitchIn(this: Battle, pokemon: Pokemon) {
			a.pressure.onStart.call(this, pokemon);
			a.moldbreaker.onStart.call(this, pokemon);
			refillMewtwoShield(this, pokemon);
		},
		onTryAddVolatile(this: Battle, status: Condition, pokemon: Pokemon) {
            const focus = a.innerfocus.onTryAddVolatile.call(this, status, pokemon);
            if (focus !== undefined) return focus;
            return a.insomnia.onTryAddVolatile.call(this, status, pokemon);
        },
		onAfterMega(this: Battle, pokemon: Pokemon) { refillMewtwoShield(this, pokemon); },
		onDamagePriority: 100,
		onDamage(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
			if (effect?.effectType !== 'Move' || source === target || damage <= 0) return;
			const shield = target.m.absolutePressureShield || 0;
			if (!shield) return;
			const absorbed = Math.min(shield, damage);
			target.m.absolutePressureShield = shield - absorbed;
			this.add('-message', `${target.name}'s Absolute Pressure shield absorbed ${absorbed} damage (${shield - absorbed} HP left).`);
			return damage - absorbed;
		},
	};
	for (const [key, callback] of Object.entries(a.absolutepressure)) {
		if (!key.startsWith('on') || typeof callback !== 'function') continue;
		a.absolutepressure[key] = function (this: Battle, ...args: any[]) {
			if (skipPassiveComponent(this, this.effectState.target, 'absolutepressure')) return;
			return callback.apply(this, args);
		};
	}
	a.perfectedgenome = {...a.adaptability, ...a.unnerve, name: 'Perfected Genome', num: 11727, rating: 4};
	a.mindmirror = {
		...a.opportunist, name: 'Mind Mirror', num: 11728, rating: 4,
		onSwitchIn(this: Battle, pokemon: Pokemon) {
			const boosts: SparseBoostsTable = {};
			for (const stat of Object.keys(pokemon.boosts) as BoostID[]) {
				const highest = Math.max(0, ...pokemon.foes().map(foe => foe.boosts[stat]));
				if (highest > 0 && highest > pokemon.boosts[stat]) boosts[stat] = highest - pokemon.boosts[stat];
			}
			pokemon.m.copyingOpportunistBoosts = true;
			try { this.boost(boosts, pokemon, pokemon, this.effect); }
			finally { delete pokemon.m.copyingOpportunistBoosts; }
		},
	};
	a.unboundwill = {
		...a.magicbounce, ...a.clearbody, name: 'Unbound Will', num: 11729, rating: 4,
		onTryAddVolatile(this: Battle, status: Condition, target: Pokemon) {
			if (!['taunt', 'encore', 'disable', 'torment'].includes(status.id)) return;
			this.add('-immune', target, '[from] ability: Unbound Will');
			return null;
		},
	};
	a.psycheforce = {
		...a.toughclaws, ...a.ironfist, name: 'Psyche Force', num: 11730, rating: 5,
		onBasePower(this: Battle, power: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
			a.toughclaws.onBasePower.call(this, power, source, target, move);
			a.ironfist.onBasePower.call(this, power, source, target, move);
		},
		onSourceAfterDamageApplied(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (damage > 0 && move.effectType === 'Move' && move.category !== 'Status' && move.flags.contact && !source.isAlly(target)) {
				this.heal(damage / 3, source, source, this.effect);
			}
		},
	};
	a.psychedominion = {
		...a.psychicsurge, ...a.dishearten, name: 'Psyche Dominion', num: 11731, rating: 5,
		onStart(this: Battle, pokemon: Pokemon) {
			a.psychicsurge.onStart.call(this, pokemon);
			a.dishearten.onStart.call(this, pokemon);
		},
	};
}
