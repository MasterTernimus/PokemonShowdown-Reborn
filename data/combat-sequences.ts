import type { AbilityDataTable } from '../sim/dex-abilities';
import { composeSelectedAbility } from './selected-mega-simplifications';
import { SharedPassiveAbilityDescriptions, skipPassiveComponent } from './passive-ability-cleanup';
import { misalignedStarsEffect } from './nov16-balance-descriptions';
import { hasCrescentSubDamage } from '../sim/crescent-rend';
import { starsCompositeIds } from './ability-components';

/** Entry identity survives Mega Evolution but changes on a genuine switch-in. */
function sequence(pokemon: Pokemon, key: string) {
	const entry = pokemon.m.ultraRivalryEntryToken;
	if (!pokemon.m[key] || (key !== 'convergence' && pokemon.m[key].entry !== entry)) pokemon.m[key] = { entry };
	return pokemon.m[key];
}
type SequenceMove = ActiveMove & {
	convergenceAttack?: boolean, convergencePrepared?: boolean, convergenceCharged?: boolean,
	framePrepared?: boolean, frameMomentum?: number, };

function recordOpposingMove(this: Battle, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (!target.hp || target.isAlly(source)) return;
	const state = target.m.misalignedStars ||= { recorded: {}, spentEntry: {} };
	state.recorded ||= {};
	if (!state.recorded[move.id]) {
		state.recorded[move.id] = true;
		target.getMoveHitData(this.activeMove || move).starsFirstUse = true;
	}
}

function blockRecordedMove(this: Battle, target: Pokemon, move: ActiveMove, source: Pokemon) {
	const state = target.m.misalignedStars;
	if (!state?.recorded) return;
	const hit = target.getMoveHitData(this.activeMove || move);
	if (hit.starsBlocked) return null;
	if (!state.recorded[move.id] || hit.starsFirstUse) return;
	if (move.category !== 'Status' && cushionRepeat(target, move.id)) return;
	state.recorded[move.id] = null; // The next successful use re-arms this move.
	source.m.starsBlockedBy = target;
	source.m.starsBlockedTurn = this.turn;
	state.spentEntry ||= {};
	state.spentEntry[move.id] = target.m.ultraRivalryEntryToken;
	hit.starsBlocked = true;
	this.add('-activate', target, 'ability: Misaligned Stars');
	this.add('-message', 'The stars were bad for that outcome…');
	this.heal(target.baseMaxhp / 3, target, target);
	return null;
}

function cushionRepeat(holder: Pokemon, id: ID) {
	const spent = holder.m.misalignedStars?.spentEntry;
	return spent && id in spent && spent[id] !== holder.m.ultraRivalryEntryToken;
}

function gainCharge(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: SequenceMove) {
	if (move.effectType !== 'Move' || damage <= 0 || source.isAlly(target) || move.category === 'Status') return;
	const active = (this.activeMove || move) as SequenceMove;
	if (active.convergenceAttack || active.convergenceCharged) return;
	active.convergenceCharged = true;
	sequence(source, 'convergence')[move.category] = true;
}
function frameState(battle: Battle, pokemon: Pokemon) {
	const state = sequence(pokemon, 'framePerfect');
	state.momentum ||= 0;
	// Keep turn order stable even when the engine recalculates Speed between actions.
	if (state.speedTurn !== battle.turn) {
		state.speedTurn = battle.turn;
		state.speedMomentum = state.momentum;
	}
	return state;
}
function resetFrame(this: Battle, pokemon: Pokemon) {
	const state = frameState(this, pokemon);
	state.momentum = 0;
	state.move = '';
	state.hits = [];
}
function frameHit(this: Battle, damage: number, target: Pokemon, source: Pokemon, move: ActiveMove) {
	if (move.effectType !== 'Move' || damage <= 0 || source.isAlly(target) || move.category === 'Status' ||
		skipPassiveComponent(this, source, 'frameperfect')) return;
	const state = frameState(this, source);
	// All spread targets in the same hit share the hit number.
	const hit = move.hit || 1;
	state.hits ||= [];
	if (!state.hits.includes(hit)) state.hits.push(hit);
}

export const CombatSequenceDescriptions = {
	convergence: {
		shortDesc: 'Keen Eye; physical + special hits charge a 1.5× attack that pierces resistances, screens and boosts.',
		desc: 'Includes Keen Eye. Land a physical and a special attack in either order to charge the next attack: 1.5× damage, ignoring positive defensive stages, type resistances and screens. Weaknesses and immunities still apply. Each move grants one charge. The charged attack consumes both charges even on a miss or block and earns no charge. Charges persist through switching.',
	},
	misalignedstars: {
		shortDesc: 'Takes 10% less attack damage. Blocks every other use of each foe move and heals 1/3 HP.',
		desc: misalignedStarsEffect,
	},
	frameperfect: {
		shortDesc: 'Inner Focus; any attacks build up to +50% Speed, +30% damage and 10% attack protection.',
		desc: 'Includes Inner Focus. Each successful opposing hit adds one momentum after the move finishes, up to 10. Each point grants 5% Speed, 3% damage and 1% less attack damage. Multihits count separately; spread targets count once per hit. Speed changes take effect next turn. Changing attacks, misses and blocked attacks preserve momentum. Status moves, inability to attack and switching clear momentum. Stacks normally with Metronome.',
	},
};

export function installCombatSequences(
	abilities: AbilityDataTable, descriptions: { [id: string]: { shortDesc: string, desc: string } }
) {
	Object.assign(SharedPassiveAbilityDescriptions.coldlogic, descriptions.coldlogic);
	abilities.convergence = {
		name: 'Convergence', num: 32593, rating: 4, flags: {}, ...CombatSequenceDescriptions.convergence,
	};
	composeSelectedAbility(abilities, 'convergence', ['keeneye'], true);
	const keenMove = abilities.convergence.onModifyMove!;
	abilities.convergence.onModifyMove = function (move: SequenceMove, pokemon, target) {
		keenMove.call(this, move, pokemon, target);
		if (move.convergencePrepared || move.category === 'Status') return;
		move.convergencePrepared = true;
		const state = sequence(pokemon, 'convergence');
		if (!state.Physical || !state.Special) return;
		state.Physical = state.Special = false;
		move.convergenceAttack = true;
		move.ignoreScreens = true;
		move.ignorePositiveDefensive = true;
		const previous = move.onEffectiveness;
		move.onEffectiveness = function (typeMod, defender, type, attack) {
			const result = previous?.call(this, typeMod, defender, type, attack);
			return Math.max(0, typeof result === 'number' ? result : typeMod);
		};
	};
	abilities.convergence.onModifyDamage = function (damage, source, target, move: SequenceMove) {
		if (move.convergenceAttack) return this.chainModify(1.5);
	};
	abilities.convergence.onSourceAfterDamageApplied = gainCharge;
	abilities.convergence.onSourceAfterSubDamage = gainCharge;

	abilities.misalignedstars = {
		name: 'Misaligned Stars', num: 32594, rating: 4, flags: {}, ...CombatSequenceDescriptions.misalignedstars,
	};
	composeSelectedAbility(abilities, 'misalignedstars', ['anticipation'], true);
	const anticipationStart = abilities.misalignedstars.onStart!;
	function announceStars(this: Battle, pokemon: Pokemon) {
		const entry = pokemon.m.ultraRivalryEntryToken;
		if (!('starsAnnouncedEntry' in pokemon.m) || pokemon.m.starsAnnouncedEntry !== entry) {
			pokemon.m.starsAnnouncedEntry = entry;
			this.add('-message', 'For a moment, the stars traced an unfamiliar sky.');
		}
	}
	abilities.misalignedstars.onStart = function (pokemon) {
		announceStars.call(this, pokemon);
		anticipationStart.call(this, pokemon);
	};
	abilities.misalignedstars.onSourceModifyDamage = function (damage, source, target) {
		if (target.isAlly(source) || skipPassiveComponent(this, target, 'misalignedstars')) return;
		return this.chainModify(0.9);
	};
	abilities.misalignedstars.onDamagingHit = function (damage, target, source, move) {
		if (damage <= 0 || move.category === 'Status' || !target.hp || target.isAlly(source)) return;
		recordOpposingMove.call(this, target, source, move);
		const hit = target.getMoveHitData(this.activeMove || move);
		if (hit.starsReduced) {
			target.m.misalignedStars.spentEntry[move.id] = target.m.ultraRivalryEntryToken;
			hit.starsHeal = target;
		}
	};
	abilities.misalignedstars.onAfterSuccessfulStatusHit = recordOpposingMove;
	// Spectral Thief steals boosts before hit callbacks. Its blocked use must leave those boosts in place.
	abilities.misalignedstars.onMoveTargeted = function (target, source, move) {
		if (move.stealsBoosts && !target.isAlly(source) &&
			target.m.misalignedStars?.recorded?.[move.id] && !cushionRepeat(target, move.id))
			move.stealsBoosts = false;
	};
	// Accuracy, immunities and Protect are resolved. Block before a damaging hit would consume a Gem.
	abilities.misalignedstars.onTryPrimaryHitPriority = 1;
	abilities.misalignedstars.onTryPrimaryHit = function (target, source, move) {
		if (target.isAlly(source) || (target.volatiles.substitute && !move.flags.bypasssub && !move.infiltrates)) return;
		return blockRecordedMove.call(this, target, move, source);
	};
	abilities.misalignedstars.onDamagePriority = 2;
	abilities.misalignedstars.onDamage = function (damage, target, source, effect) {
		if (damage <= 0 || effect.effectType !== 'Move' || effect.category === 'Status' ||
			!source || target.isAlly(source)) return;
		const state = target.m.misalignedStars;
		// Crescent Rend can break a Substitute and send the remaining damage to the holder.
		if (state?.recorded?.[effect.id] &&
			hasCrescentSubDamage(target, effect) && !cushionRepeat(target, effect.id)) {
			return blockRecordedMove.call(this, target, effect, source);
		}
		const hit = target.getMoveHitData(this.activeMove || effect);
		if (!hit.starsReduced && !cushionRepeat(target, effect.id)) return;
		hit.starsFirstUse = true;
		hit.starsReduced = true;
		return Math.max(1, this.modify(damage, 0.5));
	};
	abilities.misalignedstars.onAnyAfterAttackResolved = function (source, target, move) {
		const holder: Pokemon = this.effectState.target;
		const hit = move?.moveHitData?.[holder.getSlot()];
		if (!holder.hp || hit?.starsHeal !== holder) return;
		delete hit.starsHeal;
		this.add('-activate', holder, 'ability: Misaligned Stars');
		this.heal(holder.baseMaxhp / 4, holder, holder);
	};
	// Future Sight and other delayed hits reach this boundary outside the normal move action.
	abilities.misalignedstars.onAnyAfterTargetedMove = abilities.misalignedstars.onAnyAfterAttackResolved;

	// Omen Sight already checks Anticipation alongside Forewarn in one scouting report.
	const omenSight = abilities.omensight;
	const scout = omenSight.onStart!;
	omenSight.onStart = function (pokemon) {
		announceStars.call(this, pokemon);
		scout.call(this, pokemon);
	};
	const forewarnDamage = omenSight.onDamage!;
	for (const [key, hook] of Object.entries(abilities.misalignedstars)) {
		if (key.startsWith('on') && key !== 'onStart' && key !== 'onDamage') Object.assign(omenSight, { [key]: hook });
	}
	omenSight.onDamage = function (damage, target, source, effect) {
		const warned = forewarnDamage.call(this, damage, target, source, effect);
		const amount = typeof warned === 'number' ? warned : damage;
		const stars = abilities.misalignedstars.onDamage!.call(this, amount, target, source, effect);
		return stars === undefined ? warned : stars;
	};

	abilities.frameperfect = {
		name: 'Frame Perfect', num: 32595, rating: 4, flags: {}, ...CombatSequenceDescriptions.frameperfect,
	};
	composeSelectedAbility(abilities, 'frameperfect', ['innerfocus'], true);
	abilities.frameperfect.onBeforeMovePriority = 100;
	abilities.frameperfect.onBeforeMove = function (pokemon, target, move) {
		if (skipPassiveComponent(this, pokemon, 'frameperfect')) return;
		frameState(this, pokemon);
		if (move.category === 'Status') resetFrame.call(this, pokemon);
	};
	abilities.frameperfect.onModifyMove = function (move: SequenceMove, pokemon) {
		if (move.framePrepared || skipPassiveComponent(this, pokemon, 'frameperfect')) return;
		const state = frameState(this, pokemon);
		if (move.category === 'Status') resetFrame.call(this, pokemon);
		move.framePrepared = true;
		move.frameMomentum = state.momentum;
		state.move = move.id;
		state.hits = [];
	};
	abilities.frameperfect.onSourceAfterDamageApplied = frameHit;
	abilities.frameperfect.onSourceAfterSubDamage = frameHit;
	abilities.frameperfect.onAnyAfterAttackResolved = function (pokemon, target, move) {
		if (pokemon !== this.effectState.target) return;
		if (skipPassiveComponent(this, pokemon, 'frameperfect')) return;
		const state = frameState(this, pokemon);
		if (move.category === 'Status') resetFrame.call(this, pokemon);
		else state.momentum = Math.min(10, state.momentum + state.hits.length);
		state.hits = [];
	};
	abilities.frameperfect.onMoveAborted = resetFrame;
	abilities.frameperfect.onModifySpe = function (spe, pokemon) {
		if (!skipPassiveComponent(this, pokemon, 'frameperfect')) {
			return this.chainModify(1 + 0.05 * frameState(this, pokemon).speedMomentum);
		}
	};
	abilities.frameperfect.onModifyDamage = function (damage, source, target, move: SequenceMove) {
		if (!skipPassiveComponent(this, source, 'frameperfect')) return this.chainModify(1 + 0.03 * (move.frameMomentum ?? 0));
	};
	abilities.frameperfect.onSourceModifyDamage = function (damage, source, target) {
		if (!skipPassiveComponent(this, target, 'frameperfect')) {
			return this.chainModify(1 - 0.01 * frameState(this, target).momentum);
		}
	};
	abilities.frameperfect.onSwitchOut = function (pokemon) { delete pokemon.m.framePerfect; };

	composeSelectedAbility(abilities, 'insight', ['convergence', 'ultrainstinct'], true);
	// These abilities keep their custom hooks alongside the component's hooks.
	for (const [id, component] of [
		['coldlogic', 'convergence'], ['reapersgrip', 'misalignedstars'],
		['execution', 'misalignedstars'],
		...starsCompositeIds.map(ability => [ability, 'misalignedstars'] as const),
		['temporalshift', 'misalignedstars'], ['tomeofavarice', 'misalignedstars'],
	] as const) {
		const ability = abilities[id] as any;
		for (const [key, handler] of Object.entries(abilities[component])) {
			if (!key.startsWith('on')) continue;
			const previous = ability[key];
			if (previous === undefined) { ability[key] = handler; continue; }
			if (typeof handler !== 'function') continue;
			ability[key] = function (this: Battle, ...args: any[]) {
				const result = previous.apply(this, args);
				if (result === false || result === null || result === 0) return result;
				const next = handler.apply(this, args);
				return next === undefined ? result : next;
			};
		}
	}
	for (const id of ['convergence', 'misalignedstars', 'frameperfect', 'insight', 'coldlogic',
		...starsCompositeIds] as const) {
		Object.assign(abilities[id], descriptions[id]);
	}
}
