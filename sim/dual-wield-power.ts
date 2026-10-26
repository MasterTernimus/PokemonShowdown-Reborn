import type { Battle } from './battle';
import type { Pokemon } from './pokemon';
type Modifier = number | number[];
interface Context {
	move: ActiveMove; source: Pokemon; target: Pokemon; boosted: boolean; full: boolean;
	powerOperations: (Modifier | 'dual')[]; marked: boolean; typeMod?: number;
	preparing: boolean;
}
const contexts = new WeakMap<Battle, Context>();
export function dualWieldContext(battle: Battle) { return contexts.get(battle); }
export function setDualWieldContext(battle: Battle, move?: ActiveMove, source?: Pokemon, target?: Pokemon) {
	const old = contexts.get(battle);
	if (move?.multihitType === 'dualwield' && source && target) contexts.set(battle, {
		move, source, target, boosted: !!move.dualWieldBoosted,
		full: battle.gameType === 'freeforall' && source.hasAbilityOrPassive('siegelauncher'),
		powerOperations: [], marked: false, preparing: false,
	});
	else contexts.delete(battle);
	return old;
}
export function restoreDualWieldContext(battle: Battle, old?: Context) {
	if (old) contexts.set(battle, old); else contexts.delete(battle);
}
export function ownOffensiveAbility(context: Context, effect: any, state: any, holder: unknown) {
	return holder === context.source && (effect.effectType === 'Ability' || !!state?.speciesPassive ||
		effect.id === 'starterpassives' || state?.sourceEffect?.effectType === 'Ability');
}
function boost(context: Context) { context.boosted = true; context.move.dualWieldBoosted = true; }
export function markDualWieldScale(battle: Battle, move: ActiveMove) {
	const context = contexts.get(battle);
	if (context?.move === move && battle.event?.id === 'BasePower' && !context.marked) {
		context.marked = true; context.powerOperations.push('dual');
	}
}
/** Observe only offensive power/damage modifiers, never stats, STAB, items or environment effects. */
export function recordDualWieldModifier(battle: Battle, numerator: number | number[], denominator: number) {
	const context = contexts.get(battle);
	if (!context || battle.event?.effect !== context.move ||
		!['BasePower', 'ModifyDamage'].includes(battle.event.id)) return true;
	const operation: Modifier = Array.isArray(numerator) ? [...numerator] : [numerator, denominator];
	const positive = (Array.isArray(numerator) ? numerator[0] / numerator[1] : numerator / denominator) > 1;
	const own = ownOffensiveAbility(context, battle.effect, battle.effectState, battle.effectState?.target);
	if (context.preparing) { if (own && positive) boost(context); return true; }
	if (own && positive) {
		boost(context);
		if (context.move.hit > 1 && !context.full) return false;
	}
	if (battle.event.id === 'BasePower') context.powerOperations.push(operation);
	return true;
}
export function recordDualWieldReturn(
	battle: Battle, effect: any, state: any, holder: unknown, before: unknown, after: unknown
) {
	const context = contexts.get(battle);
	if (!context || battle.event?.effect !== context.move || !['BasePower', 'ModifyDamage'].includes(battle.event.id) ||
		!ownOffensiveAbility(context, effect, state, holder) ||
		typeof before !== 'number' || typeof after !== 'number' || after <= before) return after;
	boost(context);
	return !context.preparing && context.move.hit > 1 && !context.full ? before : after;
}
export function finishDualWieldPower(battle: Battle) {
	const context = contexts.get(battle);
	if (!context || battle.event?.effect !== context.move || battle.event.id !== 'BasePower') return;
	const scale = context.full ? 1 : context.boosted ? context.move.hit > 1 ? 0.15 : 1 : 0.6;
	if (!context.marked) context.powerOperations.push('dual');
	battle.event.modifier = context.powerOperations.reduce<number>((value, operation) =>
		battle.chain(value, operation === 'dual' ? scale : operation), 1);
}

/** Pure eligibility conditions; actual final-damage callbacks execute once at their normal phase. */
export const DualWieldFinalDamageHooks = new Set([
	'moonveil', 'corrosiveburn', 'abysssniper', 'freezerburn', 'voidvoice', 'eternalflower', 'desertspirit', 'neuroforce',
	'pastelveil', 'queenlymajesty', 'rkssystem', 'sniper', 'tintedlens', 'empress', 'prismwings', 'spentforce', 'venomignition',
	'freshplumage', 'patientmarksman', 'guidinggallop', 'crushingdepths', 'ruinedsky', 'rivalmalice', 'pastelsanctuary',
]);
export function dualWieldFinalDamageBoost(
	battle: Battle, id: string, source: Pokemon, target: Pokemon, move: ActiveMove
): boolean {
	const custom = (battle.dex.abilities.get(id) as any).dualWieldDamageBoost;
	if (typeof custom === 'function') return !!custom.call(battle, source, target, move);
	switch (id) {
	case 'corrosiveburn': case 'venomignition':
		return battle.movehasType(move, 'Fire') && ['psn', 'tox'].includes(target.status);
	case 'freezerburn': return target.status === 'brn' && battle.movehasType(move, 'Ice');
	case 'eternalflower': return /^Pulse(?:-|$)/i.test(target.species.forme);
	case 'empress': {
		const species = source.m.perfectIllusion && source.illusion ? source.illusion.species : source.species;
		if (['tsareena', 'tsareenaalt'].includes(species.id) && source.getPassives().includes('queenlymajesty')) return false;
	}
	// falls through
	case 'queenlymajesty': case 'voidvoice':
		return battle.field.isTerrain('fairytaleterrain') ||
			battle.field.isTerrain('chessboardterrain') && source.Role !== 'Queen';
	case 'sniper': case 'abysssniper': case 'patientmarksman': return !!target.getMoveHitData(move).crit;
	case 'neuroforce': return target.getMoveHitData(move).typeMod > 0;
	case 'tintedlens': case 'desertspirit': case 'prismwings': return target.getMoveHitData(move).typeMod < 0;
	case 'freshplumage': {
		const entry = source.m.approvedSignatures;
		return (!entry?.freshPlumageUsed || entry.freshPlumageMove === move) && battle.movehasType(move, 'Flying');
	}
	case 'crushingdepths':
		return move.category === 'Physical' && battle.movehasType(move, 'Steel') && target.boosts.def < 0;
	case 'ruinedsky': return target.hasType(['Flying', 'Dragon']);
	case 'rivalmalice': return target.hp > 0;
	case 'rkssystem': {
		const ability = battle.dex.abilities.get('rkssystem') as any;
		return ability.memoryAbilities.call(battle, source).some((part: string) =>
			dualWieldFinalDamageBoost(battle, part, source, target, move));
	}
	default: return false;
	}
}
