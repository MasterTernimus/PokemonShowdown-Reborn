import { skipPassiveComponent } from './passive-ability-cleanup';
import type { AbilityDataTable } from '../sim/dex-abilities';
type RetaliationMove = ActiveMove & {
	vendettaTarget?: Pokemon,
	silkSlowed?: Pokemon[],
	uprootWeakened?: Pokemon[],
};
function clearMark(state: any) {
	delete state.mark;
	delete state.pending;
	delete state.pendingMove;
	delete state.expires;
}
function finishVendetta(this: Battle, source: Pokemon, target: Pokemon, move: ActiveMove) {
	const holder = this.effectState.target as Pokemon;
	const state = holder.volatiles.vendetta;
	if (!state || !holder.hasAbility('vendetta')) {
		if (state)
			clearMark(state);
		return;
	}
	if (state.pending !== source || state.pendingMove !== move)
		return;
	delete state.pending;
	delete state.pendingMove;
	if (state.spent || !holder.hp || !holder.isActive || !source.hp || !source.isActive)
		return;
	state.spent = true;
	state.mark = source;
	state.expires = this.turn + 1;
	this.add('-activate', holder, 'ability: Vendetta', '[of] ' + String(source));
}
/** Exact follow-up approvals: no automatic form grants or inherited composite effects. */
export function installLatestPassiveAbilities(abilities: AbilityDataTable) {
	abilities.steadyswimmer = {
		name: 'Steady Swimmer', num: 11344, rating: 1, flags: { breakable: 1 },
		onStart(pokemon) {
			abilities.steadyswimmer.onUpdate?.call(this, pokemon);
		},
		onUpdate(pokemon) {
			if (skipPassiveComponent(this, pokemon, 'steadyswimmer')) return;
			if (pokemon.volatiles.confusion) pokemon.removeVolatile('confusion');
		},
		onTryAddVolatile(status, pokemon) {
			if (skipPassiveComponent(this, pokemon, 'steadyswimmer')) return;
			if (status.id === 'confusion') {
				this.add('-immune', pokemon, '[from] ability: Steady Swimmer');
				return null;
			}
		},
	};
	abilities.freeflight = { name: 'Free Flight', num: 11342, rating: 2, flags: {} };
	abilities.entrenched = {
		name: 'Entrenched', num: 11343, rating: 2, flags: { breakable: 1 },
		onDragOut(pokemon, source, effect) {
			if (source && !source.isAlly(pokemon) && (effect?.effectType === 'Move' || effect?.effectType === 'Item'))
				return null;
		},
	};
	abilities.voidomen.onStart = function () {
		this.effectState.used = false;
		this.effectState.ward = false;
	};
	abilities.voidomen.onModifyMove = function (move, source, target) {
		this.dex.abilities.get('serenegrace').onModifyMove?.call(this, move, source, target);
	};
	const omenSecondary = abilities.voidomen.onAfterSuccessfulSecondary;
	function omenSafeguard(this: Battle, source: Pokemon) {
		if (source.volatiles.voidomensafeguardspent)
			return;
		source.addVolatile('voidomensafeguardspent', source, this.effect);
		const existing = source.side.sideConditions.safeguard;
		if (existing) {
			if (existing.duration && existing.duration < 3)
				existing.duration = 3;
		} else if (source.side.addSideCondition('safeguard', source, this.effect))
			source.side.sideConditions.safeguard.duration = 3;
	}
	abilities.voidomen.onAfterSuccessfulSecondary = function (source, target, move) {
		omenSecondary?.call(this, source, target, move);
		if (move.category !== 'Status')
			omenSafeguard.call(this, source);
	};
	abilities.voidomen.onAfterMove = function (source, target, move) {
		if (move.category === 'Status' && move.target === 'self' && source === target && source.moveThisTurnResult === true)
			omenSafeguard.call(this, source);
	};
	const hydroHit = abilities.hydroelectric.onSourceDamagingHit;
	abilities.hydroelectric.onSourceDamagingHit = function (damage, target, source, move) {
		hydroHit?.call(this, damage, target, source, move);
		if (damage <= 0 || target.isAlly(source) || !source.hp || !this.movehasType(move, 'Water') ||
			source.volatiles.hydroelectricspent)
			return;
		this.effectState.speedMove = move;
	};
	abilities.hydroelectric.onAfterMove = function (source, target, move) {
		if (this.effectState.speedMove !== move || !source.hp || source.volatiles.hydroelectricspent)
			return;
		delete this.effectState.speedMove;
		source.addVolatile('hydroelectricspent', source, this.effect);
		this.boost({ spe: 1 }, source, source, this.effect);
	};
	abilities.hydroelectric.onAnyAfterTargetedMove = function (source, target, move) {
		if (source === this.effectState.target)
			abilities.hydroelectric.onAfterMove?.call(this, source, target, move);
	};
	abilities.steadyaim = {
		name: 'Steady Aim', num: 11340, rating: 1, flags: { breakable: 1 },
		onTryBoost(boost, target, source) {
			if (skipPassiveComponent(this, target, 'steadyaim'))
				return;
			if (source !== target && boost.accuracy && boost.accuracy < 0)
				delete boost.accuracy;
		},
	};
	abilities.vendetta = {
		name: 'Vendetta', num: 10160, rating: 4, flags: {},
		onStart(pokemon) {
			pokemon.addVolatile('vendetta', pokemon, this.effect);
		},
		onAfterDamageApplied(damage, target, source, effect) {
			if (damage <= 0 || !source || source.isAlly(target) || effect.effectType !== 'Move' ||
				(effect).category === 'Status')
				return;
			target.addVolatile('vendetta', target, this.effect);
			const state = target.volatiles.vendetta;
			if (state.spent)
				return;
			state.pending = source;
			state.pendingMove = effect;
		},
		onModifyMove(move: RetaliationMove, source, target) {
			const state = source.volatiles.vendetta;
			if (!state?.mark || state.expires < this.turn || !target || target !== state.mark ||
				!target.hp || !target.isActive || target.isAlly(source) || move.category === 'Status' ||
				!['normal', 'adjacentFoe', 'any'].includes(move.target) ||
				!(this.movehasType(move, 'Ground') || this.movehasType(move, 'Dark')))
				return;
			move.vendettaTarget = target;
			clearMark(state);
		},
		onSourceAccuracy(accuracy, target, source, move: RetaliationMove) {
			if (move.vendettaTarget === target && !target.isSemiInvulnerable())
				return true;
		},
		onSourceDamagingHit(damage, target, source, move: RetaliationMove) {
			if (damage > 0 && target.hp && target === move.vendettaTarget && !target.isAlly(source))
				target.addVolatile('vendettatrap', source, this.effect);
		},
		onEnd(pokemon) {
			const state = pokemon.volatiles.vendetta;
			if (state)
				clearMark(state);
		},
		condition: {
			noCopy: true,
			onAnyAfterMove: finishVendetta,
			onAnyAfterTargetedMove: finishVendetta,
			onUpdate(pokemon) {
				const state = this.effectState;
				if (!pokemon.hasAbility('vendetta') || !pokemon.hp || state.expires < this.turn ||
					(state.mark && (!state.mark.hp || !state.mark.isActive)))
					clearMark(state);
			},
			onAnySwitchOut(pokemon) {
				if (this.effectState.mark === pokemon || this.effectState.pending === pokemon)
					clearMark(this.effectState);
			},
			onResidualOrder: 29,
			onResidual() {
				if (this.effectState.expires <= this.turn)
					clearMark(this.effectState);
			},
		},
	};
	const silkModify = abilities.silksights.onModifyMove;
	abilities.silksights.onModifyMove = function (move: RetaliationMove, source, target) {
		silkModify?.call(this, move, source, target);
		move.silkSlowed = source.foes().filter(p => p.boosts.spe < 0);
	};
	abilities.silksights.onSourceDamagingHit = function (damage, target, source, move: RetaliationMove) {
		if (damage <= 0 || !target.hp || target.isAlly(source) || !this.movehasType(move, 'Bug') ||
			!move.silkSlowed?.includes(target) || source.volatiles.silksightsspent || target.volatiles.disable ||
			!target.lastMove || target.lastMove.isZOrMaxPowered || target.lastMove.isMax || target.lastMove.id === 'struggle')
			return;
		if (target.addVolatile('disable', source, this.effect)) {
			target.volatiles['disable' as string].duration = 2;
			source.addVolatile('silksightsspent', source, this.effect);
		}
	};
	abilities.uproot = {
		name: 'Uproot', num: 11341, rating: 4, flags: {},
		onModifyMove(move: RetaliationMove, source) {
			move.uprootWeakened = source.foes().filter(p => p.boosts.spd < 0);
		},
		onSourceDamagingHit(damage, target, source, move: RetaliationMove) {
			if (damage <= 0 || target.isAlly(source) || move.category === 'Status' || !this.movehasType(move, 'Grass'))
				return;
			source.addVolatile('uproot', source, this.effect);
			const state = source.volatiles.uproot;
			if (state.turn !== this.turn) {
				state.turn = this.turn;
				state.targets = [];
				state.drained = 0;
			}
			if (!move.drain && move.uprootWeakened?.includes(target) && source.hp) {
				const amount = Math.min(Math.floor(damage / 4), Math.floor(source.maxhp / 4) - state.drained);
				if (amount > 0) {
					state.healing = true;
					try {
						const healed = this.heal(amount, source, target, 'drain');
						if (typeof healed === 'number') state.drained += healed;
					} finally {
						state.healing = false;
					}
				}
			}
			if (target.hp && !state.targets.includes(target)) {
				state.targets.push(target);
				this.boost({ spd: -2 }, target, source, this.effect);
			}
		},
		condition: {
			noCopy: true,
			onTryHealPriority: -1000,
			onTryHeal(amount, target, source, effect) {
				if (!this.effectState.healing || effect?.id !== 'drain') return;
				// Apply ordinary healing modifiers before enforcing the absolute per-turn cap.
				const modified = this.modify(amount, this.event.modifier);
				this.event.modifier = 1;
				return Math.min(modified, Math.floor(target.maxhp / 4) - this.effectState.drained);
			},
		},
	};
}
