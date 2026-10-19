import type {AbilityDataTable} from '../sim/dex-abilities';
import type {MoveDataTable} from '../sim/dex-moves';

export function freeFollowup(battle: Battle, source: Pokemon, target: Pokemon | undefined, id: string, ability: string) {
	if (!source.hp || !source.isActive || !target?.hp || !target.isActive) return;
	const saved = {move: battle.activeMove, pokemon: battle.activePokemon, target: battle.activeTarget,
		event: battle.event, effect: battle.effect, state: battle.effectState, result: source.moveThisTurnResult};
	try {
		// Independent Hydraulic attacks must not inherit the triggering move's priority/Prankster flag.
		if (ability === 'hydraulicarmor') battle.activeMove = null;
		battle.actions.useMove(id, source, {target, sourceEffect: battle.dex.abilities.get(ability)});
	}
	finally {
		battle.activeMove = saved.move; battle.activePokemon = saved.pokemon; battle.activeTarget = saved.target;
		battle.event = saved.event; battle.effect = saved.effect; battle.effectState = saved.state;
		source.moveThisTurnResult = saved.result;
	}
}

export function installStarterFinishMoves(moves: MoveDataTable) {
	const protect = moves.protect.condition!;
	const original = protect.onTryHit!;
	protect.onTryHit = function (target, source, move) {
		const result = typeof original === 'function' ? original.call(this, target, source, move) : original;
		if (result === this.NOT_FAIL && target.hasAbility('hydraulicarmor') && !source.isAlly(target) &&
			move.category !== 'Status' && !move.isZ && !move.isMax && !move.sourceEffect &&
			target.m.hydraulicProtectTurn !== this.turn) {
			target.m.hydraulicProtectTurn = this.turn;
			((move as any).hydraulicProtect ||= []).push(target);
		}
		return result;
	};
}

export function installStarterFinish(abilities: AbilityDataTable) {
	abilities.unbrokencharge = {
		name: 'Unbroken Charge', num: 11494, rating: 3,
		onSourceDamagingHit(damage, target, source, move) {
			if (!this.effectState.speciesPassive && source.getPassives().includes('unbrokencharge')) return;
			if (move.id === 'ragingbull' && damage > 0 && !target.isAlly(source)) {
				((move as any).unbrokenChargeUsers ||= new Set()).add(source);
			}
		},
		onAnyAfterAttackResolved(source, target, move) {
			if (!this.effectState.speciesPassive && source.getPassives().includes('unbrokencharge')) return;
			if (source !== this.effectState.target || !source.hp || !source.isActive ||
				!(move as any).unbrokenChargeUsers?.delete(source)) return;
			const reset: SparseBoostsTable = {};
			for (const stat of Object.keys(source.boosts) as BoostID[]) if (source.boosts[stat] < 0) reset[stat] = 0;
			if (Object.keys(reset).length) {
				source.setBoost(reset);
				this.add('-clearnegativeboost', source);
			}
		},
	};
	const hydraulic = abilities.hydraulicarmor;
	abilities.hydraulicarmor = {...hydraulic,
		onAfterMove(source, target, move) {
			hydraulic.onAfterMove?.call(this, source, target, move);
			if (move.id !== 'withdraw' || move.sourceEffect || source.moveThisTurnResult !== true) return;
			const foes = source.adjacentFoes().filter(p => p.hp && p.isActive);
			freeFollowup(this, source, foes.find(p => p.position === source.position) || foes[0], 'waterpulse', 'hydraulicarmor');
		},
		onAnyAfterAttackResolved(source, target, move) {
			hydraulic.onAnyAfterAttackResolved?.call(this, source, target, move);
			const holder = this.effectState.target as Pokemon;
			if (!(move as any).hydraulicProtect?.includes(holder)) return;
			(move as any).hydraulicProtect = (move as any).hydraulicProtect.filter((p: Pokemon) => p !== holder);
			freeFollowup(this, holder, source, 'waterpulse', 'hydraulicarmor');
		},
	};
	abilities.soothingbouquet = {...abilities.friendguard, name: 'Soothing Bouquet', num: 11493, rating: 4,
		onModifyMove(move, source, target) {
			abilities.infiltrator.onModifyMove?.call(this, move, source, target);
			if (move.id !== 'sweetscent' || move.hasBounced || move.sourceEffect) return;
			const original = move.onHit;
			move.onHit = function (target, source, activeMove) {
				const result = typeof original === 'function' ? original.call(this, target, source, activeMove) : original;
				if (activeMove.hasBounced || activeMove.sourceEffect || target.isAlly(source)) return result;
				const stats: BoostID[] = ['atk', 'def', 'spa', 'spd', 'spe'];
				const stat = stats.reduce((best, next) => target.boosts[next] > target.boosts[best] ? next : best);
				let changed = false;
				if (target.boosts[stat] > 0) {
					target.setBoost({[stat]: Math.max(0, target.boosts[stat] - 2)});
					this.add('-setboost', target, stat, target.boosts[stat], '[from] ability: Soothing Bouquet');
					changed = true;
				}
				if (target.removeVolatile('focusenergy')) {
					this.add('-end', target, 'move: Focus Energy', '[from] ability: Soothing Bouquet');
					changed = true;
				}
				if (changed) ((activeMove as any).bouquetAffected ||= new Set()).add(target);
				return changed || result;
			};
		},
		onAnyAfterEachBoost(boost, target, source, effect) {
			const move = effect as ActiveMove;
			if (source !== this.effectState.target || move.id !== 'sweetscent' || move.hasBounced || move.sourceEffect ||
				target.isAlly(source) || !Object.values(boost).some(n => n! < 0)) return;
			((move as any).bouquetAffected ||= new Set()).add(target);
		},
		onAnyAfterAttackResolved(source, target, move) {
			if (source !== this.effectState.target || move.id !== 'sweetscent' || move.hasBounced || move.sourceEffect) return;
			const affected = (move as any).bouquetAffected;
			delete (move as any).bouquetAffected;
			if (!affected?.size || !source.hp || !source.isActive) return;
			for (const ally of [source, ...source.adjacentAllies()]) {
				if (!ally.hp || !ally.isActive) continue;
				this.heal(ally.maxhp / 8, ally, source, this.effect);
				ally.removeVolatile('confusion');
			}
			freeFollowup(this, source, source.foes().find(p => affected.has(p) && p.hp && p.isActive), 'gigadrain', 'soothingbouquet');
		},
	};
}

export const StarterFinishDescriptions = {
	unbrokencharge: {name: 'Unbroken Charge', shortDesc: 'After Raging Bull damages opposing HP, clears all negative stat stages after the whole attack.', desc: 'After Raging Bull successfully damages opposing HP, the living active holder clears all negative stat stages, including accuracy and evasion, once after the whole attack. Positive stages are preserved. No trigger on a miss, protection, immunity, Substitute-only damage or ally damage. This species passive stays active under selected-ability suppression and does not double with a copied selected instance.'},
	soothingbouquet: {name: 'Soothing Bouquet', shortDesc: 'Friend Guard + Infiltrator; Sweet Scent calms foes, heals allies, then uses Giga Drain.', desc: 'Full Friend Guard and Infiltrator. Sweet Scent retains normal and field effects. Each reached opposing target loses up to two positive stages from its highest boosted combat stat (Attack, Defense, Sp. Atk, Sp. Def, Speed tie order), stopping at zero, and loses Focus Energy. This direct reset bypasses stat-change reactions. If any normal stat drop, reset or Focus Energy removal succeeds, after the whole move the living holder and living adjacent allies heal 1/8 max HP and lose confusion independently of healing success. Then uses one ordinary free Giga Drain at the first affected surviving active foe in slot order. Protect blocks; reflected or generated Sweet Scent grants no custom effects or rewards. Normal healing and Giga Drain accuracy, protection, immunity and drain apply. No PP cost or recursion.'},
	hydraulicarmor: {name: 'Hydraulic Armor', shortDesc: 'Stamina; Withdraw/Protect fire Water Pulse; Skull Bash fires Hydro Pump.', desc: 'Full local Stamina. Water Pulse and Hydro Pump use higher boosted Defense or Sp. Atk, remaining Special against Sp. Def. Successful Withdraw uses one free Water Pulse at the corresponding opposing slot, falling back to the first living legal adjacent foe. Protect fires one Water Pulse at the surviving active attacker after the first opposing damaging attack it fully blocks that turn; no trigger from Z/Max chip or generated attacks. Shelter has no attack. A Skull Bash opposing HP strike uses one Hydro Pump at the same surviving active foe after the whole attack. All follow-ups require a living active holder, use no PP, cannot recurse, and retain normal accuracy, protection, immunity and effects.'},
};
