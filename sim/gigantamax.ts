import type { ModdedDex } from './dex';

/** Shared by battle requests and team validation, including custom profile forms. */
export function getGigantamaxForm(dex: ModdedDex, species: Species, originalSpecies: string): string {
	if (species.id === 'machampalt') return 'machampgmaxalt';
	if (species.id === 'grimmsnarlazzy') return 'grimmsnarlgmaxazzy';
	if (['eeveestarter', 'eeveestarteralt'].includes(originalSpecies)) return 'eeveegmax';
	if (['pikachu', 'pikachucosplay', 'pikachurockstar', 'pikachubelle', 'pikachupopstar',
		'pikachuphd', 'pikachulibre', 'pikachupartner', 'pikachustarter'].includes(species.id)) {
		return 'pikachugmax';
	}
	const ownForm = species.id + 'gmax';
	if (dex.species.get(ownForm).exists) return ownForm;
	const base = dex.species.get(species.baseSpecies);
	return base.exists ? base.id + 'gmax' : ownForm;
}
