import {MegaTempestFury} from '../data/mega-tempest-fury';
import type { Battle } from './battle';
import type { Pokemon } from './pokemon';
import { Condition } from './dex-conditions';
import { ThematicPassiveIds } from '../data/species-passives';
import { SignaturePassiveCallbacks } from '../data/signature-passive-data';

const effects = new WeakMap<object, Condition>();

/** Separate condition identity/state: uses original callbacks without ability suppression or copying. */
export function passiveEffect(battle: Battle, id: string): Condition {
	const ability = battle.dex.abilities.get(id);
	let effect = effects.get(ability);
	if (!effect) {
		effect = new Condition({ ...ability, id: `speciespassive${id}`, effectType: 'Condition',
			fullname: `passive: ${ability.name}`, onSwitchIn: ability.onStart || ability.onSwitchIn, onSwitchInSubOrder: 7 });
		const callbacks = SignaturePassiveCallbacks[id];
		if (callbacks) for (const key of Object.keys(effect)) {
			if (key.startsWith('on') && typeof (effect as any)[key] === 'function' && !callbacks.includes(key)) {
				delete (effect as any)[key];
			}
		}
		// Preserve Sirius's first-tail toxic before the passive attempts regular poison.
		if (id === 'venamskiss') Object.assign(effect, { onSourceDamagingHitPriority: -1 });
		if (id === 'tempestfury') Object.assign(effect, MegaTempestFury);
		effects.set(ability, effect);
	}
	return effect;
}

export function passiveState(pokemon: Pokemon, id: string) {
	pokemon.passiveStates[id] ||= pokemon.battle.initEffectState({
		id: `speciespassive${id}`, target: pokemon, speciesPassive: id,
	});
	return pokemon.passiveStates[id];
}

export function thematicPassives(pokemon: Pokemon) {
	return pokemon.getPassives().filter(id => ThematicPassiveIds.has(id));
}

const migratedEntryPassives = new Set(['supremeoverlord', 'unnerve', 'fairyaura', 'darkaura', 'contrary', 'moldbreaker', 'noguard',
	'eldritchremedy', 'mimecraft', 'saltbastion', 'download', 'hospitality',
	'frisk', 'oblivious', 'waterveil', 'drizzle', 'grassysurge', 'electricsurge', 'thermalexchange', 'flamebody', 'intimidate', 'slowstart',
	'zerotohero', 'supersweetsyrup', 'swornduty', 'gluttony', 'heavymetal', 'stalwart']);
/** Entry effects in the approved Kalos/Alola and Paldea migrations run once when acquired. */
export function startGainedPassives(pokemon: Pokemon, previous: readonly string[], only?: readonly string[]) {
	if (!pokemon.isActive) return;
	if (previous.includes('slowstart') && !pokemon.getPassives().includes('slowstart') && !pokemon.hasAbility('slowstart')) pokemon.removeVolatile('slowstart');
	for (const id of thematicPassives(pokemon)) {
		if (only && !only.includes(id)) continue;
		if (previous.includes(id) || !migratedEntryPassives.has(id)) continue;
		if (id !== 'supremeoverlord') delete pokemon.passiveStates[id];
		pokemon.battle.singleEvent('SwitchIn', passiveEffect(pokemon.battle, id), passiveState(pokemon, id), pokemon);
	}
}
