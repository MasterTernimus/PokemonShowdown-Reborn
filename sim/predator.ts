import type { Battle } from './battle';
import type { Pokemon } from './pokemon';

/** Per-target matchup only; never grants blanket ability bypass or removes negative stages. */
export function predatorUltraMatch(battle: Battle, source: Pokemon | undefined, target: Pokemon | undefined) {
	return !!source && !!target && source.hasAbility('predator') &&
		!battle.field.isTerrain(['bewitchedwoodsterrain', 'hauntedterrain', 'holyterrain']) &&
		target.hasAbility(['ultraego', 'ultrainstinct']);
}
