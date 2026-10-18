import type {AbilityDataTable} from '../sim/dex-abilities';

function guardId(battle: Battle) {
	return battle.effectState.speciesPassive || battle.effect.id;
}
function guarded(battle: Battle, target: Pokemon, source: Pokemon, move: ActiveMove, id = guardId(battle)) {
	if (!source || move.category === 'Status' || (id === 'buriedtrio' && source.isAlly(target))) return false;
	return (move as any)[id + 'Targets']?.has(target) ||
		(id === 'threadshelter' ? !!target.volatiles.threadshelter : !target.m.buriedTrioSpent);
}
function spendGuard(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (damage <= 0 || !guarded(this, target, source, move)) return;
	const id = guardId(this);
	((move as any)[id + 'Targets'] ||= new Set()).add(target);
	if (id === 'threadshelter') target.removeVolatile('threadshelter');
	else target.m.buriedTrioSpent = true;
}
function reduceGuard(this: Battle, damage: number, source: Pokemon, target: Pokemon, move: ActiveMove) {
	if (guarded(this, target, source, move)) return this.chainModify(guardId(this) === 'threadshelter' ? 0.75 : 0.7);
}
/** Fixed-damage moves bypass ModifyDamage; apply only this batch's explicit attack guards. */
export function guardFixedDamage(battle: Battle, damage: number | false | null, source: Pokemon, target: Pokemon, move: ActiveMove) {
	if (typeof damage !== 'number' || damage <= 0) return damage;
	for (const [id, factor] of [['threadshelter', 0.75], ['buriedtrio', 0.7]] as const) {
		if (target.hasAbilityOrPassive(id) && guarded(battle, target, source, move, id)) damage = battle.modify(damage, factor);
	}
	if (target.hasAbilityOrPassive('venomthread') && !target.isAlly(source) && ['psn', 'tox'].includes(source.status)) damage = battle.modify(damage, 0.8);
	if (move.flags.sound && feedbackActive(source)) damage = battle.modify(damage, 0.8);
	if (target.getMoveHitData(move).quarterContactProtect) {
		damage = Math.max(1, battle.modify(damage, 0.25));
		battle.add('-zbroken', target);
	}
	return damage;
}
function feedbackActive(source: Pokemon) {
	const marks: Map<Pokemon, number> = source.volatiles.feedback?.sources || new Map();
	return [...marks].some(([p, entry]) => p.hp && p.isActive && (p.m.feedbackEntry || 0) === entry && p.hasAbilityOrPassive('feedback'));
}
function clearFeedback(this: Battle, source: Pokemon) {
	for (const target of this.getAllActive()) {
		const marks: Map<Pokemon, number> | undefined = target.volatiles.feedback?.sources;
		marks?.delete(source);
		if (marks && !marks.size) target.removeVolatile('feedback');
	}
}
function removeFeedbackSource(this: Battle, source: Pokemon) {
	const marks: Map<Pokemon, number> | undefined = this.effectState.sources;
	marks?.delete(source);
	if (marks && !marks.size) (this.effectState.target as Pokemon).removeVolatile('feedback');
}
export function installGuardPassives(abilities: AbilityDataTable) {
	abilities.venomthread = {
		name: 'Venom Thread', num: 11715, rating: 3.5, flags: {},
		onAnyModifySpe(speed, pokemon) {
			if (!['psn', 'tox'].includes(pokemon.status)) return;
			const provider = this.getAllActive().find(p => p.hp && !p.isAlly(pokemon) && p.hasAbilityOrPassive('venomthread'));
			if (provider === this.effectState.target) return this.chainModify(0.75);
		},
		onSourceModifyDamage(damage, source, target, move) {
			if (!source.isAlly(target) && ['psn', 'tox'].includes(source.status)) return this.chainModify(0.8);
		},
	};
	// Existing Silken Decoy delegates already contain full Self Sufficient. Its former
	// passive is now Venom Thread, so those delegates supply exactly one copy.
	delete abilities.restorativechime.onSourceHeal;
	abilities.restorativechime.onSourceDamagingHit = function (damage, target, source, move) {
		if (damage > 0 && move.flags.sound && !target.isAlly(source)) (move as any).restorativeChimeOpposingHit = true;
	};
	abilities.restorativechime.onAnyAfterSubDamage = function (damage, target, source, move) {
		if (source === this.effectState.target && damage > 0 && move.flags.sound && !target.isAlly(source)) {
			(move as any).restorativeChimeOpposingHit = true;
		}
	};
	abilities.restorativechime.onAfterMove = function (source, target, move) {
		const success = move.category === 'Status' ?
			(source.moveThisTurnResult === true || (move as any).restorativeChimeSuccess) : (move as any).restorativeChimeOpposingHit;
		if (!source.hp || !source.isActive || !move.flags.sound || !success || source.m.restorativeSoundTurn === this.turn) return;
		source.m.restorativeSoundTurn = this.turn;
		for (const recipient of [source, ...source.adjacentAllies()]) {
			if (recipient.hp && recipient.isActive) this.heal(recipient.baseMaxhp / 8, recipient, source, this.effect);
		}
	};
	abilities.threadshelter = {
		name: 'Thread Shelter', num: 11710, rating: 3, flags: {},
		onAfterMove(source, target, move) {
			if (source.hp && source.moveThisTurnResult === true && ['silktrap', 'stickyweb'].includes(move.id)) {
				source.addVolatile('threadshelter');
			}
		},
		onSourceModifyDamage: reduceGuard, onDamagingHit: spendGuard, onAfterSubDamage: spendGuard,
		condition: {noCopy: true},
	};
	abilities.buriedtrio = {
		name: 'Buried Trio', num: 11711, rating: 3, flags: {},
		onSourceModifyDamage: reduceGuard, onDamagingHit: spendGuard, onAfterSubDamage: spendGuard,
	};
	abilities.elasticbelly = {
		name: 'Elastic Belly', num: 11712, rating: 3, flags: {},
		onDamagePriority: 100,
		onDamage(damage, target, source, effect) {
			if (damage <= 0 || effect?.effectType !== 'Move' || !source || source.isAlly(target) || target.m.elasticBellySpent) return;
			const starts: Map<Pokemon, number> = (effect as any).elasticBellyStarts ||= new Map();
			if (!starts.has(target)) starts.set(target, target.hp);
		},
		onDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !source || source.isAlly(target) || target.m.elasticBellySpent) return;
			((move as any).elasticBellyHits ||= new Set()).add(target);
		},
		onAnyAfterAttackResolved(source, target, move) {
			const holder = this.effectState.target as Pokemon;
			const starts: Map<Pokemon, number> | undefined = (move as any).elasticBellyStarts;
			const hp = starts?.get(holder);
			starts?.delete(holder);
			if (!(move as any).elasticBellyHits?.has(holder) || !hp || !holder.hp || !holder.isActive || holder.m.elasticBellySpent ||
				hp * 2 <= holder.maxhp || holder.hp * 2 > holder.maxhp) return;
			holder.m.elasticBellySpent = true;
			this.heal(holder.baseMaxhp / 8, holder, holder, this.effect);
		},
	};
	abilities.feedback = {
		name: 'Feedback', num: 11713, rating: 3, flags: {},
		onSourceDamagingHit(damage, target, source, move) {
			if (damage <= 0 || !move.flags.sound || source.isAlly(target) || !source.hp || !target.hp) return;
			target.addVolatile('feedback', source);
			const state = target.volatiles.feedback;
			if (state) (state.sources ||= new Map()).set(source, source.m.feedbackEntry || 0);
		},
		onSwitchOut: clearFeedback, onFaint: clearFeedback,
		condition: {
			noCopy: true,
			onAnySwitchOut: removeFeedbackSource,
			onAnyFaint: removeFeedbackSource,
			onModifyDamage(damage, source, target, move) {
				if (!move.flags.sound) return;
				if (feedbackActive(source)) return this.chainModify(0.8);
			},
		},
	};
	abilities.comfortingpresence = {
		name: 'Comforting Presence', num: 11714, rating: 3, flags: {},
		onAnyAfterSuccessfulStatusHit(target, source, move) {
			if (source !== this.effectState.target || target === source || !target.isAlly(source) || !target.hp || !source.hp ||
				source.m.comfortingPresenceTurn === this.turn) return;
			if (this.heal(target.maxhp / 16, target, source, this.effect)) source.m.comfortingPresenceTurn = this.turn;
		},
	};
}

export const GuardPassiveDescriptions = {
	venomthread: {shortDesc: 'Poisoned foes have 0.75x Speed and deal 20% less attack damage to it.', desc: 'While active, poisoned opposing Pokemon have 0.75x Speed; multiple holders do not stack this reduction. Attacks from poisoned opponents deal 20% less damage to this holder. Both regular and bad poison qualify. These are modifiers, not stat drops; curing poison or the holder leaving immediately ends the applicable effect.'},
	silkendecoy: {shortDesc: 'Protective cocoon + Swarm + Self Sufficient; other faints renew the cocoon.', desc: 'Mega Ariados spins a persistent cocoon, renewed when another Pokemon faints. It blocks status moves and status conditions while intact, and absorbs one damaging move including all its hits and secondary effects. Retains full local Swarm and Self Sufficient exactly once: restores 1/16 base maximum HP each turn and prevents sandstorm and hail damage. Venom Thread is its separate species passive.'},
	restorativechime: {shortDesc: 'Successful sound moves heal it and adjacent active allies by 1/8 max HP, once per turn.', desc: 'Once per turn, a successful sound move restores 1/8 base maximum HP to the living active user and each living adjacent active ally. Damaging sound moves must connect with an opponent; ally-only hits do not count. Heal Bell qualifies if it cures status, restores HP or establishes Safeguard. Fully failed moves do not trigger healing. No longer cures healing recipients\' status. Levitate remains Chimecho\'s separate passive.'},
	threadshelter: {shortDesc: 'Successful Silk Trap/Sticky Web stores one 25% guard for the next damaging move.', desc: 'Successfully using Silk Trap or Sticky Web stores one guard. The next damaging move to hit it deals 25% less damage across every hit, including Substitute damage. Guards do not stack and end on switching. Failed moves do not grant a guard.'},
	buriedtrio: {shortDesc: 'First opposing damaging move each entry deals 30% less damage across all hits.', desc: 'Each genuine entry, the first opposing damaging move to hit it deals 30% less damage across all hits, including Substitute damage. Misses, protection and immunity do not spend the use. Ability restarts do not reset it.'},
	elasticbelly: {shortDesc: 'Once per entry, surviving a foe move crossing half HP heals 1/8 max HP.', desc: 'Once per genuine entry, after surviving an entire opposing damaging move that starts it above half HP and ends at half or below, restores 1/8 base maximum HP. Substitute-only damage, ally attacks, residual damage and HP costs do not trigger it. Ability restarts do not reset it.'},
	feedback: {shortDesc: 'Sound HP hits mark foes; their sound moves deal 20% less damage while it stays active.', desc: 'Sound attacks that damage opposing HP mark that foe. A marked foe\'s sound attacks deal 20% less damage while the originating holder remains active. Repeated marks and multiple holders do not stack. Marks end when their source leaves or the marked foe switches. Substitute-only damage does not mark.'},
	comfortingpresence: {shortDesc: 'Successful status moves targeting an ally heal it by 1/16 max HP, once per turn.', desc: 'After a successful status move targeting another ally, restores 1/16 of that ally\'s maximum HP, once per turn. Failed moves and self-targeting do not qualify. Full-HP or blocked healing does not spend the turn\'s use.'},
};
