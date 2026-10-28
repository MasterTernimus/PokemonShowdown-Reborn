/** Public reference copy for effects that coexist with fields and auras. */
export const RoomReference: Record<string, {summary: string, sections: Record<string, string[]>}> = {
	trickroom: {
		summary: 'Slower Pokémon move first within the same priority bracket.',
		sections: {
			'How it works': ['Reverses Speed-based turn order for everyone. Move priority still applies.', 'Using Trick Room again ends it. Other rooms, Gravity, fields and auras can coexist with it.'],
			'Duration': ['Normally 5 turns. The current server uses 8 on Psychic Terrain, Chessboard or New World; otherwise 7 with Persistent. Amplifield Rock does not extend Trick Room.', 'Lost Epoch always starts exactly 5 turns.'],
			'Abilities': ['Unown’s Lost Epoch starts Trick Room once per battle. It cannot be copied or transferred, and does not end or refresh an existing Trick Room.'],
		},
	},
	wonderroom: {
		summary: 'Swaps defenses, blocks critical hits, and strengthens defensive attacks.',
		sections: {
			'How it works': ['Swaps Defense and Sp. Def for all Pokémon without permanently exchanging their stat stages.', 'Prevents critical hits. Attacks using Defense or Sp. Def as their attacking stat gain 20% power and use the opposite defensive stat. Z-Moves and Max Moves do not receive this power bonus.'],
			'Duration': ['Normally 5 turns; 8 on Psychic Terrain or New World, or with an active Amplifield Rock; otherwise 7 with Persistent.', 'Using Wonder Room again ends it. It can coexist with other rooms, Gravity, fields and auras.'],
			'Move interactions': ['Guard Split: both participants gain +1 Defense and Sp. Def after the split. Power Split: both lose 1 Attack and Sp. Atk. Normal stat-change protections apply.', 'Guard Swap clears the user’s negative defensive stages after swapping. Power Swap clears negative offensive stages; Heart Swap clears all negative stages.', 'Speed Swap also swaps Speed stages, then clears the user’s negative Speed. Pain Split also cures both participants’ confusion.', 'Power Trick also exchanges Attack and Defense stages when toggled during Wonder Room.', 'Power Shift activated here swaps both Attack ↔ Defense and Sp. Atk ↔ Sp. Def. Both swaps remain after the room ends, until toggled off or switched out. Baton Pass transfers them.'],
			'Abilities': ['Beheeyem’s Mirror Chamber and Mega Claydol’s World Axis start Wonder Room on entry. An already active room is not ended or refreshed.'],
		},
	},
	magicroom: {
		summary: 'Suppresses held items, boosts mystical attacks, and extends new barriers.',
		sections: {
			'How it works': ['Suppresses held-item effects for everyone. Psychic, Ghost and Fairy attacks gain 20% power.', 'New Reflect, Light Screen, Aurora Veil, Arenite Wall, Atlantis Wall, Safeguard and Mist last 8 turns. Their normal use requirements still apply.', 'Existing barriers are not extended. Newly extended barriers keep their duration after Magic Room ends.'],
			'Duration': ['Normally 5 turns; 8 on Psychic Terrain or New World, or with Amplifield Rock active when the room starts; otherwise 7 with Persistent.', 'Using Magic Room again ends it. It can coexist with other rooms, Gravity, fields and auras.'],
			'Move interactions': ['Magic Coat also protects current active allies for the rest of that turn. Later switch-ins do not inherit it.', 'Heal Pulse restores 75% max HP. This does not stack with Mega Launcher.'],
			'Abilities': ['Carbink’s Arcane Chamber starts Magic Room on entry. It does not end or refresh an active room.'],
		},
	},
	gravity: {
		summary: 'Grounds Pokémon, improves accuracy, and strengthens falling or crushing attacks.',
		sections: {
			'How it works': ['Grounds Pokémon and disables airborne moves such as Fly, Bounce and High Jump Kick. It cancels Magnet Rise and Telekinesis.', 'Accuracy is multiplied by about 1.67. Positive evasion stages are ignored, not removed; negative evasion still applies.', 'Effective weight doubles. Impact moves gain 30% power; wind moves lose 25% power. These power changes exclude Z-Moves and Max Moves.', 'Ordinary Gardevoir with active Void Veil is exempt from grounding, airborne-move restrictions, doubled weight and the evasion-stage effect.'],
			'Duration': ['Normally 5 turns; 8 on Psychic Terrain or with an active Amplifield Rock; otherwise 7 with Persistent.', 'Reusing Gravity fails while active unless an aura can be promoted. Gravity can coexist with all three rooms.'],
			'Move interactions': ['Dig and Dive skip their charge turn without consuming Power Herb.'],
			'Field interactions': ['Water Surface sinks to Underwater; Underwater sinks to Midnight Zone; Corrosive Mist becomes Corrosive Field.', 'Gravity can promote an active aura into its full field. Frozen Aura becomes Cold Eclipse. Field locks and the order of field transformations still apply. New World blocks Gravity’s field transformation.'],
			'Abilities': ['Lunatone and Solrock’s Gravity Well starts Gravity on entry without refreshing it. Lunar Orbit also starts Gravity and applies its field interactions.'],
		},
	},
};
