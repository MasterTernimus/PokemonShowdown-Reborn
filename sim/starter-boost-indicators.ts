import type {Pokemon} from './pokemon';

/** Display state only: never announces a component as a replacement ability. */
export function updateStarterBoostIndicators(pokemon: Pokemon) {
	const battle = pokemon.battle;
	const field = battle.field;
	const garden = field.flowerGardenStage();
	const lowHP = pokemon.hp <= pokemon.maxhp / 3;
	const active = {
		blaze: (lowHP || field.isTerrain(['burningterrain', 'volcanicterrain'])) && !field.isTerrain('coldeclipseterrain'),
		torrent: lowHP || field.isTerrain(['watersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain']),
		overgrow: lowHP || field.isTerrain('grassyterrain') || garden >= 4 || (garden === 2 && pokemon.hp <= pokemon.maxhp * 2 / 3),
	};
	for (const id of ['blaze', 'torrent', 'overgrow'] as const) {
		const marker = `${id}active`;
		const enabled = pokemon.hp > 0 && pokemon.isActive && active[id] && pokemon.hasAbilityOrPassive(id);
		if (enabled && !pokemon.volatiles[marker]) {
			pokemon.addVolatile(marker);
		} else if (!enabled && pokemon.volatiles[marker]) {
			pokemon.removeVolatile(marker);
		}
	}
}
