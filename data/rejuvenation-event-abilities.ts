import type { AbilityDataTable } from '../sim/dex-abilities';

/** Retained local Deep Chill and Mega Seviper's Venam's Kiss passive. */
export function installRejuvenationEvents(abilities: AbilityDataTable) {
	abilities.deepchill = {
		...abilities.oblivious,
		onDamagingHit(damage, target, source, move) {
			if (damage <= 0 || move.category !== 'Physical' || source.isAlly(target) || target.volatiles['deepchillturnspent'])
				return;
			this.effectState.pendingMove = move;
			this.effectState.pendingAttacker = source;
		},
		onAnyAfterAttackResolved(source, target, move) {
			const holder = this.effectState.target;
			if (this.effectState.pendingMove !== move || this.effectState.pendingAttacker !== source)
				return;
			delete this.effectState.pendingMove;
			delete this.effectState.pendingAttacker;
			if (!holder.hp || holder.volatiles['deepchillturnspent'])
				return;
			holder.addVolatile('deepchillturnspent', holder, this.effect);
			if (source.hp)
				this.boost({ spe: -1 }, source, holder, this.effect);
		},
		name: 'Deep Chill', rating: 4, num: 11298,
	};

	abilities.venamskiss = {
		onModifyMove(move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Poison')) {
				if (move.ignoreImmunity !== true) {
					move.ignoreImmunity ||= {};
					move.ignoreImmunity.Poison = true;
				}
			}
		},
		onEffectiveness(typeMod, target, type, move) {
			if (type === 'Steel' && this.movehasType(move, 'Poison'))
				return 1;
		},
		onPrepareHit(source, target, move) {
			if (move.category !== 'Status' && this.movehasType(move, 'Poison'))
				(move as any).venamsKissTargets = source.foes().filter(p => ['psn', 'tox'].includes(p.status));
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || !this.movehasType(move, 'Poison'))
				return;
			if ((move as any).venamsKissTargets?.includes(target)) {
				if (target.hp) {
					const existing = target.volatiles.healblock;
					if (existing)
						existing.duration = Math.max(2, existing.duration || 0);
					else if (target.addVolatile('healblock', source, this.effect))
						target.volatiles.healblock.duration = 2;
				}
				if (!move.drain) {
					source.addVolatile('venamskissturn', source, this.effect);
					const state = source.volatiles.venamskissturn;
					const amount = Math.min(Math.round(damage / 3), Math.max(0, Math.floor(source.baseMaxhp / 4) - (state.healed || 0)));
					if (amount > 0) {
						state.healed = (state.healed || 0) + amount;
						this.heal(amount, source, target, 'drain');
					}
				}
			}
			if (target.hp)
				target.trySetStatus('psn', source, this.effect);
		},
		onFoeModifySpe(speed, pokemon) {
			if (!['psn', 'tox'].includes(pokemon.status))
				return;
			const holders = pokemon.foes().filter(p => p.hasAbilityOrPassive('venamskiss'));
			if (holders[0] === this.effectState.target)
				return this.chainModify(0.75);
		},
		flags: {}, name: "Venam's Kiss", rating: 4.5, num: 11330,
	};

}
