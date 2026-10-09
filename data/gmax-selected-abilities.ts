import type { AbilityDataTable } from '../sim/dex-abilities';

function finishCrushingDepths(this: Battle, source: Pokemon) {
	const targets: Pokemon[] = this.effectState.depthTargets || [];
	delete this.effectState.depthTargets;
	if (!source.hp || source.m.crushingDepthsTurn === this.turn) return;
	const target = targets.find(p => p.hp > 0 && !p.fainted && p.isActive);
	if (!target) return;
	source.m.crushingDepthsTurn = this.turn;
	this.boost({ def: -1 }, target, source, this.dex.abilities.get('crushingdepths'));
}
function finishAfterlifeGate(this: Battle, source: Pokemon) {
	const targets: Pokemon[] = this.effectState.gateTargets || [];
	delete this.effectState.gateTargets;
	if (!source.hp || source.m.afterlifeCurseTurn === this.turn) return;
	const target = targets.find(p => p.hp > 0 && !p.fainted && p.isActive && !p.volatiles.curse);
	if (!target) return;
	if (target.addVolatile('curse', source, this.dex.abilities.get('afterlifegate'))) {
		source.m.afterlifeCurseTurn = this.turn;
	}
}

export function installGmaxSelectedAbilities(abilities: AbilityDataTable) {
	abilities.crushingdepths = {
		name: 'Crushing Depths', num: 11427, rating: 4, flags: {},
		onBeforeMove() { delete this.effectState.depthTargets; },
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || source.isAlly(target) || move.category !== 'Physical' || !this.movehasType(move, 'Water')) return;
			this.effectState.depthTargets ||= [];
			if (!this.effectState.depthTargets.includes(target)) this.effectState.depthTargets.push(target);
		},
		onAfterMove: finishCrushingDepths,
		onAnyAfterTargetedMove(source) {
			if (source === this.effectState.target) finishCrushingDepths.call(this, source);
		},
		onModifyDamage(damage, source, target, move) {
			if (move.category === 'Physical' && this.movehasType(move, 'Steel') && target.boosts.def < 0) {
				return this.chainModify(1.3);
			}
		},
	};
	abilities.afterlifegate = {
		name: 'Afterlife Gate', num: 11428, rating: 4.5, flags: { ...abilities.shadowshield.flags },
		onBeforeMove() { delete this.effectState.gateTargets; },
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || source.isAlly(target) || move.category !== 'Special' ||
				!this.movehasType(move, ['Ghost', 'Poison'])) return;
			this.effectState.gateTargets ||= [];
			if (!this.effectState.gateTargets.includes(target)) this.effectState.gateTargets.push(target);
		},
		onAfterMove: finishAfterlifeGate,
		onAnyAfterTargetedMove(source) {
			if (source === this.effectState.target) finishAfterlifeGate.call(this, source);
		},
		onSourceModifyDamage: abilities.shadowshield.onSourceModifyDamage,
		onImmunity: abilities.shadowshield.onImmunity,
		onAnyFaint(target, source, effect) {
			const owner = this.effectState.target;
			if (!owner?.hp || owner.fainted || !owner.isActive || owner.isAlly(target) ||
				owner.m.afterlifeHealTurn === this.turn) return;
			const curse = target.volatiles.curse;
			const ownAttack = source === owner && effect?.effectType === 'Move';
			const ownCurse = effect?.id === 'curse' && curse?.source === owner && curse.sourceEffect?.id === 'afterlifegate';
			if (!ownAttack && !ownCurse) return;
			owner.m.afterlifeHealTurn = this.turn;
			this.heal(owner.maxhp / 8, owner, owner, this.dex.abilities.get('afterlifegate'));
		},
	};
}
