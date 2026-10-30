import type { ModdedDex } from '../sim/dex';
import { getGigantamaxForm } from '../sim/gigantamax';
import { DisabledSpecies } from './disabled-species';

/** Mega/Gmax forms enabled by this set, rather than every form in its family. */
export function authorityForms(dex: ModdedDex, set: PokemonSet): Species[] {
	const species = dex.species.get(set.species);
	const item = dex.items.get(set.item);
	const forms = new Map<string, Species>();
	const add = (name: string) => {
		const form = dex.species.get(name);
		if (form.exists && !DisabledSpecies.has(form.id) && (form.isMega || form.forme.includes('Gmax'))) {
			forms.set(form.id, form);
		}
	};
	add(species.name);
	const destination = item.megaStone?.[species.name] || item.megaStone?.[species.baseSpecies];
	if (destination) add(destination);
	// Shared stones can offer alternate Mega buttons (e.g. Torterra X/Y).
	if (item.megaStone) {
		const family = dex.species.get(species.baseSpecies);
		for (const name of new Set([...(species.otherFormes || []), ...(family.otherFormes || [])])) {
			const form = dex.species.get(name);
			if (form.requiredItem === item.name || form.requiredItems?.includes(item.name)) add(name);
		}
	}
	// Reborn offers Gmax from canGigantamax even without the legacy set flag.
	if (species.canGigantamax && !(species.id.startsWith('eeveestarter') && dex.toID(set.ability) === 'unstableevo')) {
		add(getGigantamaxForm(dex, species, dex.toID(set.species)));
	}
	return [...forms.values()];
}
