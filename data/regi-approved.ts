import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';

export const LesserRegis = ['regirock', 'regice', 'registeel', 'regieleki', 'regidrago'];
export const RegiComponents = {rubblewake: [], eternalice: [], temperedalloy: ['filter'], unsealedcurrent: [], crystalfocus: [], ancientassembly: []};
export const RegiDescriptions = {
	rubblewake: {name: 'Rubblewake', shortDesc: 'Once per entry, surviving a physical hit sets Spikes on the attacker\'s side.', desc: 'Once per switch-in, after surviving a physical attack that damages its HP, sets one layer of Spikes on the attacker\'s side.'},
	eternalice: {name: 'Eternal Ice', shortDesc: 'Immune to Fire and burns; damaging moves cannot lower its stats.', desc: 'Immune to Fire moves and burns. Prevents negative stat changes caused by damaging moves, including its own moves. Status moves can still lower its stats.'},
	temperedalloy: {name: 'Tempered Alloy', shortDesc: 'Filter. Immune to damaging-move secondary effects.', desc: 'Filter. Blocks secondary effects of damaging moves that would affect it; effects on the attacker still apply.'},
	unsealedcurrent: {name: 'Unsealed Current', shortDesc: 'Once per battle, a hit crossing half HP raises Sp. Atk by 1.', desc: 'Once per battle, surviving a damaging move that takes it from above half HP to half HP or less raises its Sp. Atk by 1.'},
	crystalfocus: {name: 'Crystal Focus', shortDesc: 'Dragon attacks ignore positive defensive stages and screens.', desc: 'Its Dragon attacks ignore the target\'s positive Defense or Sp. Def stages and Reflect, Light Screen and Aurora Veil.'},
	ancientassembly: {name: 'Ancient Assembly', shortDesc: 'Allied Regis shorten Slow Start; in Primordial form, boost damage.', desc: 'Each different allied Regirock, Regice, Registeel, Regieleki or Regidrago that enters battle shortens its Slow Start by 1 turn, up to 3 turns. In Primordial form, each instead adds 10% damage, up to 30%. Each species counts once per battle.'},
};

export function recordRegiEntry(pokemon: Pokemon) {
	if (pokemon.transformed || !LesserRegis.includes(pokemon.species.id)) return;
	for (const gigas of pokemon.side.pokemon) {
		if (gigas.transformed || gigas.species.baseSpecies !== 'Regigigas') continue;
		const seen = gigas.m.ancientAssemblySpecies ||= [];
		if (seen.includes(pokemon.species.id)) continue;
		seen.push(pokemon.species.id);
		if (seen.length <= 3 && gigas.volatiles.slowstart) {
			gigas.volatiles.slowstart.duration!--;
			if (gigas.volatiles.slowstart.duration! <= 0) gigas.removeVolatile('slowstart');
		}
	}
}

export function installRegis(abilities: AbilityDataTable) {
	const a = abilities as any;
	const slowStart = a.slowstart.onStart;
	a.slowstart.onStart = function (this: Battle, pokemon: Pokemon) {
		if (skipPassiveComponent(this, pokemon, 'slowstart')) return;
		slowStart.call(this, pokemon);
		const condition = pokemon.volatiles.slowstart;
		if (condition && pokemon.species.id === 'regigigas') {
			condition.duration! -= Math.min(3, pokemon.m.ancientAssemblySpecies?.length || 0);
			if (condition.duration! <= 0) pokemon.removeVolatile('slowstart');
		}
	};
	for (const key of ['onEnd', 'onModifyDef']) {
		const callback = a.slowstart[key];
		a.slowstart[key] = function (this: Battle, ...args: any[]) {
			if (skipPassiveComponent(this, this.effectState.target, 'slowstart')) return;
			return callback.apply(this, args);
		};
	}
	for (const [key, callback] of Object.entries(a.selfrepair)) {
		if (!key.startsWith('on') || typeof callback !== 'function') continue;
		a.selfrepair[key] = function (this: Battle, ...args: any[]) {
			if (skipPassiveComponent(this, this.effectState.target, 'selfrepair')) return;
			return callback.apply(this, args);
		};
	}
	a.rubblewake = {name: 'Rubblewake', num: 11744, rating: 3, flags: {},
		onDamagingHit(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (damage <= 0 || !target.hp || target.m.rubblewakeUsed || move.category !== 'Physical') return;
			target.m.rubblewakeUsed = true;
			source.side.addSideCondition('spikes', target, this.effect);
		},
	};
	a.eternalice = {name: 'Eternal Ice', num: 11745, rating: 4, flags: {breakable: 1},
		onTryHit(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (target !== source && this.movehasType(move, 'Fire')) { this.add('-immune', target, '[from] ability: Eternal Ice'); return null; }
		},
		onSetStatus(this: Battle, status: Condition, target: Pokemon) {
			if (status.id === 'brn') { this.add('-immune', target, '[from] ability: Eternal Ice'); return false; }
		},
		onTryBoost(boosts: SparseBoostsTable, target: Pokemon, source: Pokemon, effect: Effect) {
			if (effect?.effectType !== 'Move' || (effect as ActiveMove).category === 'Status') return;
			for (const stat of Object.keys(boosts) as BoostID[]) if (boosts[stat]! < 0) delete boosts[stat];
		},
	};
	a.temperedalloy = {...a.filter, name: 'Tempered Alloy', num: 11746,
		onModifySecondaries(secondaries: NonNullable<ActiveMove['secondaries']>, target: Pokemon, source: Pokemon, move: ActiveMove) {
			if (move.category !== 'Status') return secondaries.filter(effect => !!effect.self);
		},
	};
	a.unsealedcurrent = {name: 'Unsealed Current', num: 11747, rating: 3, flags: {},
		onAfterDamageApplied(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
			if (effect.effectType !== 'Move' || !target.hp || target.m.unsealedCurrentUsed || target.hp > target.maxhp / 2 || target.hp + damage <= target.maxhp / 2) return;
			target.m.unsealedCurrentUsed = true;
			this.boost({spa: 1}, target, target, this.effect);
		},
	};
	a.crystalfocus = {name: 'Crystal Focus', num: 11748, rating: 3, flags: {},
		onModifyMove(this: Battle, move: ActiveMove) {
			if (move.category !== 'Status' && this.movehasType(move, 'Dragon')) { move.ignorePositiveDefensive = true; move.ignoreScreens = true; }
		},
	};
	a.ancientassembly = {name: 'Ancient Assembly', num: 11749, rating: 3, flags: {},
		onBasePower(this: Battle, power: number, source: Pokemon) {
			if (source.species.id === 'regigigasprimordial') return this.chainModify(1 + Math.min(3, source.m.ancientAssemblySpecies?.length || 0) / 10);
		},
	};
}

