import type { AbilityDataTable } from '../sim/dex-abilities';

export const GrapplingClawsDescription = {
	shortDesc: 'Tough Claws; physical contact HP hits lower one foe\'s Speed after the move, once per turn.',
	desc: 'Full local Tough Claws gives contact moves 1.3x power. Dragging Grip: once per turn, after an entire physical contact attack deals opposing HP damage, lowers one surviving active opposing target\'s Speed by 1. Normal stat-drop prevention and reflection apply. Multi-hit and spread attacks cannot repeat this effect. Misses, protection, immunities and Substitute-only damage do not activate it. Does not trap, prevent healing or cause binding damage.',
};
export const NativeSlipstreamDescription = {
	passive: 'levitate',
	shortDesc: 'Keen Eye; first Flying HP hit each entry sets three-turn Tailwind.',
	desc: 'Full local Keen Eye prevents opposing accuracy drops, ignores opposing evasion boosts and reveals opposing Illusions on activation. Mirror Arena entry grants +1 accuracy and Laser Focus, with shared entry rewards applied once. Once per switch-in, its first Flying-type attack to damage opposing HP sets Tailwind on its side for 3 turns; existing Tailwind is extended to at least 3 turns, never shortened. Levitate is supplied separately by the species passive.',
};

function finishGrip(this: Battle, source: Pokemon) {
	const targets: Pokemon[] = this.effectState.gripTargets || [];
	delete this.effectState.gripTargets;
	if (!source.hp || !source.isActive || source.m.draggingGripTurn === this.turn) return;
	const target = targets.find(p => p.hp > 0 && !p.fainted && p.isActive && !p.isAlly(source));
	if (!target) return;
	source.m.draggingGripTurn = this.turn;
	this.boost({ spe: -1 }, target, source, this.dex.abilities.get('grapplingclaws'));
}

export function installTargetedPassiveReworks(abilities: AbilityDataTable) {
	abilities.grapplingclaws = {
		name: 'Grappling Claws', rating: 3.5, num: 11333, flags: {},
		onBasePowerPriority: abilities.toughclaws.onBasePowerPriority,
		onBasePower(power, source, target, move) {
			return this.dex.abilities.get('toughclaws').onBasePower?.call(this, power, source, target, move);
		},
		onBeforeMove() { delete this.effectState.gripTargets; },
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || target.isAlly(source) || move.category !== 'Physical' || !move.flags.contact) return;
			this.effectState.gripTargets ||= [];
			if (!this.effectState.gripTargets.includes(target)) this.effectState.gripTargets.push(target);
		},
		onAfterMove: finishGrip,
		onAnyAfterTargetedMove(source) {
			if (source === this.effectState.target) finishGrip.call(this, source);
		},
	};
	const immunity = abilities.slipstream.onImmunity!;
	abilities.slipstream.onImmunity = function (type, pokemon) {
		if (pokemon.getPassives().includes('levitate')) return;
		return immunity.call(this, type, pokemon);
	};
	// Preserve the primitive's full local behavior everywhere. Only an existing
	// species-passive recipient skips a second selected/copied/delegated instance.
	const voice = abilities.liquidvoice;
	const type = voice.onModifyType!;
	voice.onModifyType = function (move, pokemon, target) {
		if (!this.effectState.speciesPassive && pokemon.getPassives().includes('liquidvoice')) return;
		return type.call(this, move, pokemon, target);
	};
	const power = voice.onBasePower!;
	voice.onBasePower = function (basePower, source, target, move) {
		if (!this.effectState.speciesPassive && source.getPassives().includes('liquidvoice')) return;
		return power.call(this, basePower, source, target, move);
	};
}
