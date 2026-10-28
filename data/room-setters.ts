import type { AbilityDataTable } from '../sim/dex-abilities';

export function installRoomSetters(abilities: AbilityDataTable) {
	for (const [id, name, room, roomName, num] of [
		['gravitywell', 'Gravity Well', 'gravity', 'Gravity', 11989],
		['arcanechamber', 'Arcane Chamber', 'magicroom', 'Magic Room', 11990],
		['mirrorchamber', 'Mirror Chamber', 'wonderroom', 'Wonder Room', 11991],
	] as const) {
		abilities[id] = {
			name, num, rating: 4, flags: {},
			shortDesc: `Starts ${roomName} on entry. Does not refresh an active effect.`,
			desc: `Starts ${roomName} when the holder enters, using its normal duration and battle effects. Does not refresh or end an existing ${roomName}. The effect remains after the holder switches out.`,
			onStart(pokemon) {
				if (this.field.getPseudoWeather(room)) return;
				this.add('-ability', pokemon, name);
				this.field.addPseudoWeather(room, pokemon, this.effect);
			},
		};
	}
	abilities.lostepoch = {
		name: 'Lost Epoch', num: 11992, rating: 5,
		flags: { failroleplay: 1, failskillswap: 1, noentrain: 1, noreceiver: 1, notrace: 1, notransform: 1 },
		shortDesc: 'Unown: starts 5-turn Trick Room once per battle. Cannot be copied or transferred.',
		desc: 'Only works for an untransformed Unown. Once per battle, starts Trick Room on entry for exactly 5 turns, without duration extensions. An existing Trick Room is not ended or refreshed and does not consume the activation. Switching, suppression, or losing and regaining the ability cannot reset a spent activation. Cannot be copied by Trace, Role Play, Receiver, Power of Alchemy, or Transform, or transferred by Skill Swap or Entrainment. Suppression can prevent activation; an established Trick Room remains until it expires or is removed normally.',
		onStart(pokemon) {
			if (pokemon.baseSpecies.baseSpecies !== 'Unown' || pokemon.transformed || pokemon.m.lostEpochSpent ||
				this.field.getPseudoWeather('trickroom')) return;
			this.add('-ability', pokemon, 'Lost Epoch');
			if (this.field.addPseudoWeather('trickroom', pokemon, this.effect)) pokemon.m.lostEpochSpent = true;
		},
	};
}
