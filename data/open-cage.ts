import type { AbilityData } from '../sim/dex-abilities';

export const OpenCageText = {
	name: 'Open Cage',
	shortDesc: 'Sound attacks free self and nearby allies from move restrictions and trapping.',
	desc: 'After a damaging sound move hits an opponent, clears binding, Taunt, Encore, Disable and Torment from the user and adjacent allies. They can escape trapping effects through the end of the following turn. The escape effect ends on switching.',
};

type OpenCageMove = ActiveMove & { openCageSource?: Pokemon };

export const OpenCage: AbilityData = {
	...OpenCageText,
	num: 12010, rating: 3, flags: {},
	onSourceDamagingHit(damage, target, source, move: OpenCageMove) {
		if (damage > 0 && move.category !== 'Status' && move.flags.sound && !source.isAlly(target)) {
			move.openCageSource = source;
		}
	},
	onAfterMove(source, target, move: OpenCageMove) {
		if (move.openCageSource !== source) return;
		delete move.openCageSource;
		if (!source.hp || !source.isActive) return;
		this.add('-activate', source, 'ability: Open Cage');
		for (const ally of [source, ...source.adjacentAllies()]) {
			if (!ally.hp || !ally.isActive) continue;
			for (const id of ['partiallytrapped', 'taunt', 'encore', 'disable', 'torment']) ally.removeVolatile(id);
			ally.addVolatile('opencage', source, this.effect);
		}
	},
	condition: {
		name: 'Open Cage', duration: 2, noCopy: true,
		onStart(pokemon) {
			this.add('-start', pokemon, 'Open Cage');
		},
		onRestart() {
			this.effectState.duration = 2;
		},
		// Match Run Away/Shed Shell; Commander restrictions still run afterward.
		onTrapPokemonPriority: -10,
		onTrapPokemon(pokemon) {
			pokemon.trapped = false;
		},
		onMaybeTrapPokemonPriority: -10,
		onMaybeTrapPokemon(pokemon) {
			pokemon.maybeTrapped = false;
		},
		onEnd(pokemon) {
			this.add('-end', pokemon, 'Open Cage');
		},
	},
};
