import type { AbilityDataTable } from '../sim/dex-abilities';
import { predatorUltraMatch } from '../sim/predator';

const favored = ['ashenbeachterrain', 'newworldterrain', 'starlightarenaterrain', 'coldeclipseterrain'];
function disabled(battle: Battle) {
	return battle.field.isTerrain(['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']);
}
function opposingMove(source: Pokemon | undefined, target: Pokemon, effect: Effect | undefined) {
	return !!source && !source.isAlly(target) && effect?.effectType === 'Move' &&
		(effect).category !== 'Status';
}
function moveToken(battle: Battle, source: Pokemon, move: ActiveMove) {
	return battle.activePokemon === source && battle.activeMove?.id === move.id ? battle.activeMove : move;
}

/** Per-Pokemon turn budgets are never stored in replaceable ability or Transform state. */
export function installUltraInstinctRework(abilities: AbilityDataTable) {
	const table = abilities as any;
	const instinct = table.ultrainstinct;
	instinct.onStart = function (this: Battle, pokemon: Pokemon) {
		if (!disabled(this)) this.add('-ability', pokemon, 'Ultra Instinct');
	};
	instinct.onBasePower = function (this: Battle, power: number, source: Pokemon, target: Pokemon) {
		if (disabled(this) || !target || source.isAlly(target) || target.hasAbility('battlebond')) return;
		if (this.queue.willMove(target) || target.m.enteredBattleTurn === this.turn) return this.chainModify(1.3);
	};
	delete instinct.onSourceModifyDamage;
	instinct.onDamagePriority = -15;
	instinct.onDamage = function (this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: ActiveMove) {
		if (disabled(this) || !opposingMove(source, target, effect) || predatorUltraMatch(this, source, target)) return;
		const token = moveToken(this, source, effect);
		if (target.m.ultraInstinctGuardTurn === this.turn && target.m.ultraInstinctGuardMove !== token) return;
		return this.chainModify(this.field.isTerrain(favored) ? 0.65 : 0.75);
	};
	instinct.onAfterDamageApplied = function (
		this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: ActiveMove
	) {
		if (damage <= 0 || disabled(this) || !opposingMove(source, target, effect) ||
			target.m.ultraInstinctGuardTurn === this.turn) return;
		target.m.ultraInstinctGuardTurn = this.turn;
		target.m.ultraInstinctGuardMove = moveToken(this, source, effect);
	};
	instinct.onSourceAfterDamageApplied = function (
		this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: ActiveMove
	) {
		if (damage <= 0 || disabled(this) || !opposingMove(source, target, effect)) return;
		source.m.ultraInstinctDamageTurn = this.turn;
		source.m.ultraInstinctDamageMove = moveToken(this, source, effect);
	};
	instinct.onAfterAttackResolved = function (this: Battle, pokemon: Pokemon, target: Pokemon, move: ActiveMove) {
		if (disabled(this) || !pokemon.hp || pokemon.fainted || pokemon.m.ultraInstinctHealTurn === this.turn ||
			pokemon.m.ultraInstinctDamageTurn !== this.turn || pokemon.m.ultraInstinctDamageMove !== move ||
			pokemon.m.ultraInstinctHealAttempt === move) return;
		pokemon.m.ultraInstinctHealAttempt = move;
		const healed = this.heal(pokemon.baseMaxhp / (this.field.isTerrain(favored) ? 8 : 16), pokemon, pokemon, this.effect);
		if (healed) pokemon.m.ultraInstinctHealTurn = this.turn;
	};

	// Compose the complete current components, with breakability checked per component.
	const parts = ['ultrainstinct', 'opportunist', 'magmaarmor'];
	const result: any = Object.fromEntries(Object.entries(table.burningspirit).filter(([key]) => !key.startsWith('on')));
	result.flags = {};
	const keys = new Set(parts.flatMap(id => Object.keys(table[id]).filter(key => key.startsWith('on'))));
	for (const key of keys) {
		const values = parts.map(id => table[id][key]).filter(value => value !== undefined);
		if (!values.some(value => typeof value === 'function')) { result[key] = values[0]; continue; }
		result[key] = function (this: Battle, ...args: any[]) {
			let returned;
			for (const id of parts) {
				const component = this.dex.abilities.get(id), callback = (component as any)[key];
				if (typeof callback !== 'function') continue;
				if (component.flags.breakable && this.suppressingAbility(this.effectState.target, component)) continue;
				let callArgs = args;
				if (id === 'opportunist' && key === 'onFoeAfterEachBoost') {
					const boosts = { ...args[0] }; delete boosts.accuracy; delete boosts.evasion;
					callArgs = [boosts, ...args.slice(1)];
				}
				const value = callback.apply(this, callArgs);
				if (value === false || value === null || value === 0) return value;
				if (value !== undefined) returned = value;
			}
			return returned;
		};
	}
	table.burningspirit = result;
}
