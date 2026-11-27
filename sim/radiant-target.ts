/** Held Z-Crystals and active transformations qualify once, even when they overlap. */
export function radiantTarget(pokemon: Pokemon) {
	return !!(
		pokemon.species.isMega ||
		pokemon.getItem().zMove ||
		pokemon.species.forme.includes('Gmax') ||
		pokemon.terastallized
	);
}
