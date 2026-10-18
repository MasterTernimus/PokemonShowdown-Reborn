import type {Pokemon} from './pokemon';

/** Public display only; the persistent cocoon remains owned by Silken Decoy. */
export function updateCocoonIndicator(pokemon: Pokemon) {
	const visible = pokemon.hp > 0 && pokemon.isActive && pokemon.species.id === 'ariadosmega' &&
		pokemon.m.silkenDecoyCocoon && pokemon.hasAbility('silkendecoy');
	if (visible && !pokemon.volatiles.cocoonactive) {
		pokemon.addVolatile('cocoonactive');
	} else if (!visible && pokemon.volatiles.cocoonactive) {
		pokemon.removeVolatile('cocoonactive');
	}
}
