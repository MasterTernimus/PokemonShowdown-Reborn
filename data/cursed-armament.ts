import type { AbilityDataTable } from '../sim/dex-abilities';

function eligible(battle: Battle, move: ActiveMove) {
	return move.category !== 'Status' && !move.isExternal && !move.flags.futuremove &&
		!(move.sourceEffect && (battle.dex.moves.get(move.sourceEffect).exists || move.sourceEffect === 'dancer')) &&
		!move.damage && !move.damageCallback && (battle.movehasType(move, 'Ghost') || battle.movehasType(move, 'Steel'));
}

/** Approved mixed Ghost/Steel weapon charge; all PP changes use current underlying slots. */
export function installCursedArmament(abilities: AbilityDataTable) {
	const previous = abilities.cursedarmament;
	abilities.cursedarmament = {
		name: previous.name, num: previous.num, rating: previous.rating, flags: previous.flags,
		onTryMove(source, target, move) {
			if (!eligible(this, move)) return;
			this.effectState.attack = move;
			this.effectState.chargedAttack = !!this.effectState.charged;
			delete this.effectState.charged;
			this.effectState.victims = [];
		},
		onBasePowerPriority: 8,
		onBasePower(power, source, target, move) {
			if (eligible(this, move)) return this.chainModify(this.effectState.chargedAttack ? 1.4 : 1.2);
		},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !eligible(this, move) || source.isAlly(target) || !this.effectState.attack) return;
			if (!this.effectState.victims.includes(target)) this.effectState.victims.push(target);
		},
		onAfterMove(source, target, move) {
			if (!this.effectState.attack || !eligible(this, move)) return;
			const charged = this.effectState.chargedAttack;
			const victims: Pokemon[] = this.effectState.victims || [];
			delete this.effectState.attack;
			delete this.effectState.chargedAttack;
			delete this.effectState.victims;
			if (source.m.cursedArmamentDrainTurn === this.turn || !source.hp) return;
			const foe = victims.find(p => p.hp > 0 && !p.fainted && p.isActive);
			if (!foe) return;
			const queued = this.queue.willMove(foe);
			const newEntry = foe.m.cursedArmamentEntryTurn === this.turn;
			const history = charged ? foe.lastMove?.id : undefined;
			const primaryID = charged && newEntry ? undefined : history || (queued && queued.move.id);
			let primary = foe.moveSlots.find(slot => slot.id === primaryID);
			if (!primaryID && newEntry) {
				const candidates = foe.moveSlots.filter(slot => slot.pp > 0 && this.dex.moves.get(slot.id).category !== 'Status');
				if (candidates.length) primary = this.sample(candidates);
			}
			let drained = 0;
			for (const slot of foe.moveSlots) {
				const amount = slot === primary ? (charged ? 3 : 2) : charged ? 1 : 0;
				const taken = Math.min(slot.pp, amount);
				slot.pp -= taken;
				drained += taken;
			}
			if (!drained) return;
			source.m.cursedArmamentDrainTurn = this.turn;
			if (!charged) this.effectState.charged = true;
			// Never disclose the queued move or a previously unrevealed moveslot.
			this.add('-activate', source, 'ability: Cursed Armament', `[of] ${foe}`);
		},
		onEnd() { delete this.effectState.charged; },
		onSwitchOut() { delete this.effectState.charged; },
		onFaint() { delete this.effectState.charged; },
	};
}
