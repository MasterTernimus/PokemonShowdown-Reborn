import type {Battle} from './battle';
import type {Pokemon} from './pokemon';
import {Condition} from './dex-conditions';
import {ThematicPassiveIds} from '../data/species-passives';

const effects = new WeakMap<object, Condition>();

/** Separate condition identity/state: uses original callbacks without ability suppression or copying. */
export function passiveEffect(battle: Battle, id: string): Condition {
	const ability = battle.dex.abilities.get(id);
	let effect = effects.get(ability);
	if (!effect) {
		effect = new Condition({...ability, id: `speciespassive${id}`, effectType: 'Condition',
			fullname: `passive: ${ability.name}`, onSwitchIn: ability.onStart, onSwitchInSubOrder: 7});
		effects.set(ability, effect);
	}
	return effect;
}

export function passiveState(pokemon: Pokemon, id: string) {
	return pokemon.passiveStates[id] ||= pokemon.battle.initEffectState({
		id: `speciespassive${id}`, target: pokemon, speciesPassive: id,
	});
}

export function thematicPassives(pokemon: Pokemon) {
	return pokemon.getPassives().filter(id => ThematicPassiveIds.has(id));
}
