import {AbilityComponents} from './ability-components';
import {getAbilityComponentAdditions, skipPassiveComponent} from './passive-ability-cleanup';
import {SignaturePassiveComponents, SignaturePassiveRemovedComponents} from './signature-passive-data';

const resolvedHits = new WeakMap<object, Set<Pokemon>>();

/** Absorption can stop TryHit, but must first resolve the holder's other matching absorption effect. */
export function absorbHit(battle: Battle, target: Pokemon, source: Pokemon, move: ActiveMove, type: 'Water' | 'Electric') {
	if (target === source || !battle.movehasType(move, type)) return;
	let resolved = resolvedHits.get(battle.event);
	if (!resolved) resolvedHits.set(battle.event, resolved = new Set());
	if (resolved.has(target)) return null;

	const healID = type === 'Water' ? 'waterabsorb' : 'voltabsorb';
	const boostID = type === 'Water' ? 'stormdrain' : 'lightningrod';
	const providers = battle.findPokemonEventHandlers(target, 'onTryHit').filter(provider => {
		if (provider.state?.speciesPassive) return true;
		if (provider.effect.effectType !== 'Ability' || target.ignoringAbility()) return false;
		return !provider.effect.flags.breakable || !battle.suppressingAbility(target, provider.effect);
	});
	const contains = (id: string, component: string, seen = new Set<string>()): boolean => {
		if (seen.has(id) || SignaturePassiveRemovedComponents[id]?.includes(component)) return false;
		seen.add(id);
		return id === component || [...(AbilityComponents[id] || []), ...(SignaturePassiveComponents[id] || []),
			...getAbilityComponentAdditions(id, target.getPassives())].some(part => contains(part, component, seen));
	};
	let absorbed = false;
	for (const component of [healID, boostID]) {
		for (const provider of providers) {
			const id = provider.state?.speciesPassive || provider.effect.id;
			const matches = id === target.ability ? target.hasAbility(component) : contains(id, component);
			// Abyss Lure's local absorption boost is the same reward, not a second stack.
			if (!matches && !(component === boostID && contains(id, 'abysslure'))) continue;
			let applied = false;
			battle.singleEvent('TryHit', provider.effect, provider.state, target, source, move, undefined, function (this: Battle) {
				if (skipPassiveComponent(this, target, component)) return;
				applied = true;
				if (component === healID) {
					if (type === 'Water') this.add('-message', `${target.name} absorbed some of the water!`);
					if (!this.heal(target.baseMaxhp / 4, target, target, this.effect)) {
						this.add('-immune', target, `[from] ability: ${this.dex.abilities.get(component).name}`);
					}
				} else if (!this.boost({spa: 1, atk: 1}, target, target, this.effect)) {
					this.add('-immune', target, `[from] ability: ${this.dex.abilities.get(component).name}`);
				}
			});
			if (!applied) continue;
			absorbed = true;
			break;
		}
	}
	if (absorbed) {
		resolved.add(target);
		return null;
	}
}
