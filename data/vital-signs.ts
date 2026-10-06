import type {Battle} from '../sim/battle';
import type {Pokemon} from '../sim/pokemon';

interface PendingRescue {
	move: ActiveMove;
	source: Pokemon;
	turn: number;
	targets: Pokemon[];
}

/** Record real opposing HP damage, without healing between hits of a move. */
export function recordVitalSigns(this: Battle, damage: number, target: Pokemon, source: Pokemon, effect: Effect) {
	const holder = this.effectState.target as Pokemon;
	if (!holder.hp || !holder.isActive || !source || source.isAlly(target) || !target.isAlly(holder) ||
		!target.hp || !target.isActive || damage <= 0 || effect.effectType !== 'Move' ||
		(effect as ActiveMove).category === 'Status' || target.m.vitalSignsRescued) return;
	const pending: PendingRescue[] = (this.effectState.vitalSignsPending || []).filter(
		(entry: PendingRescue) => entry.turn === this.turn
	);
	let entry = pending.find(entry => entry.move === effect && entry.source === source);
	if (!entry) pending.push(entry = {move: effect as ActiveMove, source, turn: this.turn, targets: []});
	if (!entry.targets.includes(target)) entry.targets.push(target);
	this.effectState.vitalSignsPending = pending;
}

/** The recipient's battle-long allowance survives ability changes, switching and revival. */
export function resolveVitalSigns(this: Battle, source: Pokemon, _target: Pokemon, move: ActiveMove) {
	const holder = this.effectState.target as Pokemon;
	const pending: PendingRescue[] = this.effectState.vitalSignsPending || [];
	const entries = pending.filter(entry => entry.move === move && entry.source === source && entry.turn === this.turn);
	this.effectState.vitalSignsPending = pending.filter(entry => entry.move !== move && entry.turn === this.turn);
	if (!holder.hp || !holder.isActive) return;
	for (const entry of entries) {
		for (const recipient of entry.targets) {
			if (!recipient.hp || recipient.fainted || !recipient.isActive || !recipient.isAlly(holder) ||
				recipient.hp > recipient.maxhp / 2 || recipient.m.vitalSignsRescued) continue;
			const healed = this.heal(recipient.maxhp / 4, recipient, holder, this.effect);
			const status = recipient.status;
			if (status) recipient.cureStatus();
			if ((typeof healed === 'number' && healed > 0) || recipient.status !== status) {
				recipient.m.vitalSignsRescued = true;
				this.add('-activate', recipient, 'ability: Vital Signs', `[of] ${holder}`);
			}
		}
	}
}
