import type { TerrainData } from '../sim/dex-terrains';
import type { FieldConditionData } from '../sim/dex-conditions';

/** Field arrivals also cover successful transitions into these environments. */
export const FieldArrivalMessages: Readonly<Record<string, string>> = {
	burningterrain: 'Flames race across the battlefield!',
	coldeclipseterrain: 'An icy eclipse steals the warmth from the battlefield!',
	rifteclipseterrain: 'Reality fractures beneath the eclipse!',
	infernaleclipseterrain: 'Infernal flames consume the eclipsed sky!',
	corrosivemistterrain: 'A choking purple mist rolls over the battlefield!',
	corrosiveterrain: 'Corrosive sludge eats into the ground!',
	desertterrain: 'Blistering winds sweep across the dunes!',
	factoryterrain: 'The machinery roars to life!',
	fairytaleterrain: 'An ancient tale unfolds across the battlefield!',
	forestterrain: 'The forest canopy closes overhead!',
	inverseterrain: 'The rules of nature turn upside down!',
	mirrorarenaterrain: 'Countless reflections surround the combatants!',
	rainbowterrain: 'A brilliant rainbow washes the battlefield in color!',
	rockyterrain: 'Jagged stones rise across the battlefield!',
	shortcircuitterrain: 'Sparks leap between the broken machines!',
	snowyterrain: 'A fresh blanket of snow settles over the battlefield!',
	superheatedterrain: 'The air shimmers with unbearable heat!',
	swampterrain: 'The ground sinks beneath dark, stagnant water!',
	volcanicterrain: 'Molten rivers glow beneath a sky of ash!',
	wastelandterrain: 'Twisted heaps of refuse stretch across the battlefield!',
};

export function installFieldArrivalMessages(terrains: { [id: string]: TerrainData }) {
	for (const [id, message] of Object.entries(FieldArrivalMessages)) {
		const condition = terrains[id]?.condition as FieldConditionData | undefined;
		if (!condition) throw new Error(`Missing field for arrival message: ${id}`);
		const start = condition.onFieldStart;
		condition.onFieldStart = function (...args) {
			const result: unknown = start?.apply(this, args);
			if (result !== false && this.field.terrain === id) this.add('-message', message);
			return result;
		};
	}
}

export function whiteSmokeFieldEntry(battle: Battle, pokemon: Pokemon) {
	if (!battle.field.isTerrain(['volcanicterrain', 'dragonsdenterrain'])) return;
	if (!battle.boost({ atk: 1, spa: 1 }, pokemon, pokemon)) return;
	const heat = battle.field.isTerrain('dragonsdenterrain') ? 'dragon fire' : 'volcanic heat';
	battle.add('-message', `The ${heat} charged ${pokemon.illusion?.name || pokemon.name}'s white smoke!`);
}
