/** Player-facing wording only. Battle rules remain in terrains, moves and Field. */
export const FieldTransitionNotes: Record<string, string[]> = {
	dragonsdenterrain: [
		'To Volcanic: two cooling uses in total: Surf, Muddy Water, Blizzard or Water Pledge. The first leaves Dragon’s Den active.',
		'To Volcanic immediately: Sparkling Aria.',
		'To Cave immediately: one strong cooling use: Glaciate, Water Spout, Hydro Vortex, Oceanic Operetta or Subzero Slammer.',
		'To Fairy Tale: Mist Ball (5 turns). Infernal Rage, Ice Spinner and Steel Roller cannot end this transition early.',
		'Cooling counts even on a miss, immunity or Protect. Mist Ball still needs to deal damage. Draco Meteor and Dragon Energy undo one cooling use; Devastating Drake resets cooling.',
		'Ordinary field setters cannot replace Dragon’s Den.',
		'After reaching Volcanic, one more cooling use turns it into Cave.',
	],
	icyterrain: [
		'Reveal the field underneath → Anchor Shot or Dive’s attacking turn. With no field underneath, creates Water Surface.',
		'Reveal the field underneath → Bulldoze, Earthquake, Fissure, Magnitude or Tectonic Rage. With no field underneath, scatters Spikes instead.',
		'Melt → Burning Jealousy, Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inferno Overdrive, Lava Plume, Magma Drift, Mind Blown, Raging Fury, Searing Shot or a Fire Max move. Reveals the field underneath, or Cave if there is none.',
		'Melt → two uses in total of Scald, Steam Eruption or Hydro Steam, or one Matcha Gotcha. Reveals the field underneath, or Water Surface if there is none.',
		'Infernal Rage can also melt the ice after its field-clearing hit. Revealing Misty scatters Spikes on both sides.',
	],
	watersurfaceterrain: [
		'To Underwater: Dive, Gravity, Anchor Shot or Grav Apple. Clears the weather.',
		'To Murkwater Surface: Sludge Wave twice or Acid Downpour once. Neutralization prevents this.',
		'To Icy: Blizzard, Glaciate or Subzero Slammer. The ice remembers Water Surface underneath.',
	],
	underwaterterrain: [
		'To Water Surface: Bounce, Dive, Sky Drop, Fly or Shore Up.',
		'To Midnight Zone: Dark Void, Black Hole Eclipse, Night Daze or Dark Pulse.',
		'To Murkwater Surface: Sludge Wave twice or Acid Downpour once. Active Pokémon faint unless Poison-type, Steel-type or semi-invulnerable. Neutralization prevents this transition.',
		'Ordinary field setters cannot replace Underwater.',
	],
	snowyterrain: ['Clear the snow → successful Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate or Inferno Overdrive. Reveals the field underneath.'],
	mountainterrain: [
		'To Snowy Mountain: Blizzard, Glaciate or Subzero Slammer.',
		'To Snowy Mountain: sustained hail. From a fresh field, three end-of-turn checks; after a non-hail turn, two consecutive hail checks.',
	],
	forestterrain: [
		'To Burning: Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate or Inferno Overdrive. Rain together with Water Sport blocks ignition.',
		'To Burning: a Fire Max move, even with rain and Water Sport. Infernal Rage can ignite it after its field-clearing hit.',
		'To Bewitched Woods: Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat or Curse used by a Ghost type.',
		'To Swamp: Water Max moves, or 3 flooding points: Surf adds 1; Muddy Water adds 2.',
	],
	adriennterrain: [
		'Starts as Misty over Fairy Tale. Clearing Misty reveals Fairy Tale.',
		'While Misty is active, its pollution and wind-clearing transitions apply. See Misty for the move list.',
	],
	chessboardterrain: ['Locked: another full field cannot replace Chessboard.'],
	glitchterrain: ['Locked: another full field cannot replace Glitch.'],
	caveterrain: [
		'To Crystal Cavern: Power Gem or Diamond Storm. To Icy: Blizzard or Subzero Slammer.',
		'To Dragon’s Den: Devastating Drake, Draco Meteor, Core Enforcer or a Dragon Max move; two uses in total of Dragon Pulse or Dragon Energy also work. Dragon Rend changes it after damaging an enemy or its Substitute.',
		'To Volcanic: Blast Burn, Eruption, Inferno Overdrive, Mind Blown, Searing Shot or Burn Up. The explosion deals half max HP to active Pokémon.',
		'Explosion protection: semi-invulnerability, Protect, Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil or Well-Baked Body.',
		'Volcanic without the explosion → a Fire Max move; or two uses in total of Magma Drift, Fever Pitch, Heat Wave, Lava Plume, Overheat, Incinerate, Inferno, Flame Burst, Fire Pledge or Sacred Fire.',
	],
	factoryterrain: ['To Short Circuit: Bulldoze, Fissure, Earthquake, Explosion, Magnitude, Self-Destruct, Tectonic Rage, Light That Burns the Sky, Aura Wheel, Discharge, Gigavolt Havoc, Ion Deluge, Overdrive or physical Super UMD Move.'],
	shortcircuitterrain: ['To Factory: Aura Wheel, Charge Beam, Discharge, Gigavolt Havoc, Ion Deluge, Overdrive, Parabolic Charge, Wild Charge, Rising Voltage or special Super UMD Move.'],
	hauntedterrain: ['To Holy: Origin Pulse, Purify, Sacred Fire, Dazzling Gleam or Flash.'],
	holyterrain: ['To Haunted: Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat or Curse used by a Ghost type. Neutralization prevents this.'],
	corrosiveterrain: ['To Grassy: Purify or Seed Flare.'],
	crystalcavernterrain: [
		'To Cave: two uses in total of Bulldoze, Earthquake, Fissure or Magnitude; Tectonic Rage works in one. The breaking move gains 1.3× power.',
		'To Dark Crystal Cavern: Dark Pulse, Dark Void, Night Daze or Light That Burns the Sky, unless ordinary sun is active.',
		'If sunlight created Crystal Cavern, it returns to Dark Crystal Cavern when that sun ends.',
	],
	darkcrystalcavernterrain: [
		'To Cave: two uses in total of Bulldoze, Earthquake, Fissure, Magnitude or Tectonic Rage. The breaking move gains 1.3× power.',
		'To Crystal Cavern: ordinary sun. Returns here when that sun ends.',
	],
	murkwatersurfaceterrain: ['To Water Surface: Whirlpool.', 'To Icy: Blizzard, Glaciate or Subzero Slammer. The ice remembers Murkwater underneath.'],
	newworldterrain: ['To Starlight Arena: Gravity, Geomancy or Light of Ruin.', 'Ordinary field setters cannot replace New World.'],
	starlightarenaterrain: ['No special outgoing move or weather transition. New World changes into this field through Gravity, Geomancy or Light of Ruin; Eclipse fields can become it through Geomancy or Light of Ruin.'],
	rainbowterrain: ['Clear → Light That Burns the Sky, or hail/sandstorm at turn end.'],
	swampterrain: ['Reveal the field underneath → 3 drying points. Sun adds 1 per turn; harsh sun adds 3. Clears if there is no field underneath.'],
	volcanicterrain: [
		'To Cave: one cooling or strong cooling use: Surf, Muddy Water, Blizzard, Sparkling Aria, Water Pledge, Glaciate, Water Spout, Hydro Vortex, Oceanic Operetta or Subzero Slammer. Misses, immunities and Protect still count.',
		'To Cave: two uses in total of Sand Tomb, Scorching Sands, Sandsear Storm, Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Water Sport, Sludge Wave or G-Max Wind Rage.',
		'To Cave: Continental Crush, Supersonic Skystrike or Acid Downpour once; ordinary rain or sandstorm at turn end also works.',
		'To Dragon’s Den: Dragon Pulse or Dragon Energy twice in total; Devastating Drake, Draco Meteor or Core Enforcer once. Dragon Rend changes it after damaging an enemy or its Substitute. This progress is separate from cooling.',
	],
	wastelandterrain: ['No special move or weather transition. Usually expires after 3 turns, or 5 when created by an ability; Amplifield Rock adds 3. A starting field may be permanent.'],
};

// These fields have no field-specific move/weather transition. General field setters
// and clearing moves still obey their own restrictions; this is not an immunity claim.
for (const id of ['ashenbeachterrain', 'bigtopterrain', 'desertterrain', 'fairytaleterrain',
	'inverseterrain', 'rockyterrain', 'electricterrain', 'psychicterrain']) {
	FieldTransitionNotes[id] = ['No special move or weather transition. Use a field-setting or field-clearing effect.'];
}

for (let stage = 1; stage <= 5; stage++) {
	FieldTransitionNotes[`flowergarden${stage}`] = [
		'Grow one stage → Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom. Ripen grows two stages when starting at stages 1–3. Maximum stage: 5.',
		'Grows at turn end in sun or rain, including harsh sun and heavy rain. A garden created by Rift Lilligant also grows naturally. At most one automatic growth per turn.',
		'Shrink one stage → Cut or X-Scissor. Acid Downpour resets the garden to stage 1.',
		'To Burning, at stage 3 or higher: Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive. Rain or Water Sport prevents ignition.',
		'Dousing a burning garden restores its saved stage minus the turns it burned, with a minimum of stage 1. Rain Dance, Water Spout and Water Sport also grow it.',
		'Dousing moves: Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage.',
	];
}

/** Extra conditions only; the route table already lists destinations, moves and use counts. */
export const FieldTransitionExtraNotes: Record<string, string[]> = Object.fromEntries(
	Object.keys(FieldTransitionNotes).map(id => [id, []])
);
Object.assign(FieldTransitionExtraNotes, {
	dragonsdenterrain: ['Ordinary field setters cannot replace Dragon’s Den.',
		'Mist Ball’s Fairy Tale lasts 5 turns; clearing moves cannot end it early.',
		'After reaching Volcanic, one more cooling use turns it into Cave.'],
	caveterrain: ['Explosion protection: semi-invulnerability, Protect, Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil or Well-Baked Body.'],
	icyterrain: ['Revealing Misty scatters Spikes on both sides.'],
	underwaterterrain: ['Ordinary field setters cannot replace Underwater.'],
	newworldterrain: ['Ordinary field setters cannot replace New World.'],
	chessboardterrain: ['Another full field cannot replace Chessboard.'],
	glitchterrain: ['Another full field cannot replace Glitch.'],
	adriennterrain: ['While Misty is active, use Misty’s pollution and clearing rules.'],
	volcanicterrain: ['Progress toward Dragon’s Den is separate from cooling.'],
	wastelandterrain: ['Usually lasts 3 turns, or 5 when created by an ability. Amplifield Rock adds 3. Starting fields can be permanent.'],
});
for (let stage = 1; stage <= 5; stage++) FieldTransitionExtraNotes[`flowergarden${stage}`] = [
	'Sun and rain include harsh sun and heavy rain. At most one automatic growth per turn.',
	'A burning garden returns at its saved stage minus turns spent burning, minimum stage 1.',
	'Rain Dance, Water Spout and Water Sport also grow the garden when they put out its fire.',
];

/** Only aliases whose field hooks delegate to these components. Unique custom effects stay named. */
export const FieldAbilityComponents: Record<string, Record<string, string[]>> = {
	dragonsdenterrain: {
		atrocity: ['magmaarmor', 'dragonize'], unboundblaze: ['magmaarmor', 'dragonize'],
		draconicforce: ['dragonize'], smolderingshroud: ['whitesmoke'], constrictingheat: ['whitesmoke'],
		ragingfists: ['hydrabond'],
	},
	fairytaleterrain: { atrocity: ['dragonize'], unboundblaze: ['dragonize'], draconicforce: ['dragonize'] },
	volcanicterrain: { smolderingshroud: ['whitesmoke'], constrictingheat: ['whitesmoke'] },
};

for (const field of ['factoryterrain', 'shortcircuitterrain', 'fairytaleterrain', 'dragonsdenterrain',
	'starlightarenaterrain', 'newworldterrain', 'holyterrain']) {
	(FieldAbilityComponents[field] ||= {}).argentdevotion =
		field === 'fairytaleterrain' ? ['armorize', 'swornduty'] : ['armorize'];
}
for (const field of ['icyterrain', 'snowymountainterrain', 'coldeclipseterrain']) {
	(FieldAbilityComponents[field] ||= {}).mindfreeze = ['icebody'];
}
FieldAbilityComponents.factoryterrain.scarecrow = ['steelworker'];

for (const field of ['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain']) {
	(FieldAbilityComponents[field] ||= {}).hyperdrill = ['powerdrill'];
}

export const ConciseFieldAbilityNotes: Record<string, Record<string, string[]>> = {
	dragonsdenterrain: {
		magmaarmor: ['On entry: +1 Defense and Sp. Def.', 'Immune to incoming Fire moves.'],
		dragonize: ['Converted Normal → Dragon moves: 1.5× power instead of 1.2×.'],
		berserk: ['On entry: +1 Sp. Atk.', 'Surviving a hit that crosses half HP: +2 Sp. Atk.'],
		dragonsmaw: ['Dragon attacks use 2× Attack or Sp. Atk instead of 1.5×.', 'Fairy typing on the holder contributes a resistance instead of its normal matchup.'],
		hydrabond: ['Attacks gain 1.2× power.'],
		ragingfists: ['Attacks gain 1.2× power.'],
		goodasgold: ['Removes weaknesses contributed by the holder’s Steel typing.'],
		shellarmor: ['On entry: +1 Defense.'],
		shedskin: ['Its end-of-turn recovery always activates when eligible: cures status, heals 1/4 HP and raises the higher attacking stat by 1, then lowers Defense and Sp. Def by 1.', 'Scrafty heals 1/8 HP instead. Negative stages or temporary ailments can trigger recovery but are not cleared.'],
	},
	fairytaleterrain: { dragonize: ['Converted Normal → Dragon moves: 1.5× power instead of 1.2×.'] },
	volcanicterrain: { magmaarmor: ['On entry: +1 Defense and Sp. Def.'] },
	infernaleclipseterrain: { magmaarmor: ['On entry: +1 Defense and Sp. Def.', 'Immune to incoming Fire moves.'] },
	coldeclipseterrain: { magmaarmor: ['Can receive frostbite; still cures it afterward.'] },
};
for (const field of ['rockyterrain', 'mountainterrain', 'snowymountainterrain', 'caveterrain', 'volcanicterrain']) {
	(ConciseFieldAbilityNotes[field] ||= {}).powerdrill = ['Drill and horn moves: 2× power; bypass Protect.'];
}
for (const field of ['caveterrain', 'desertterrain']) {
	(ConciseFieldAbilityNotes[field] ||= {}).eartheater = ['At turn end: heals 1/16 max HP.'];
}
for (const field of [
	'dragonsdenterrain', 'fairytaleterrain', 'rainbowterrain', 'starlightarenaterrain', 'mistyterrain',
]) {
	(ConciseFieldAbilityNotes[field] ||= {}).marvelscale = ['Defense: 1.5×, even without a status condition.'];
}
for (const field of ['burningterrain', 'superheatedterrain', 'dragonsdenterrain', 'volcanicterrain']) {
	(ConciseFieldAbilityNotes[field] ||= {}).thermalexchange = ['At turn end: +1 Attack.'];
	ConciseFieldAbilityNotes[field].wellbakedbody = ['At turn end: +1 Defense.'];
}
for (const [power, fields] of [
	[2, ['fairytaleterrain', 'dragonsdenterrain']],
	[1.5, ['rockyterrain', 'bigtopterrain', 'mountainterrain', 'snowymountainterrain', 'coldeclipseterrain']],
	[1.3, ['desertterrain', 'forestterrain', 'burningterrain', 'superheatedterrain', 'ashenbeachterrain',
		'watersurfaceterrain', 'caveterrain', 'starlightarenaterrain', 'newworldterrain']],
] as const) {
	for (const field of fields) (ConciseFieldAbilityNotes[field] ||= {}).relentlesshunt = [`Attacks gain ${power}× power.`];
}
for (const field of ['factoryterrain', 'shortcircuitterrain', 'fairytaleterrain', 'dragonsdenterrain',
	'starlightarenaterrain', 'newworldterrain', 'holyterrain']) {
	(ConciseFieldAbilityNotes[field] ||= {}).armorize = ['Converted Normal → Steel moves: 1.5× power instead of 1.2×.'];
}

const redundantSentences = new Set([
	'See the ability and move entries below for additional interactions.',
	'Seed effects require the item to activate and be consumed.',
	'Type, status, healing, trapping and stat-change restrictions still apply; a listed attempt is not a guarantee against immunity.',
	'Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.',
	'These are distinct mappings, not a shared type assumption.',
	'Type-changing restrictions still apply.',
	'Ordinary item, stat and status restrictions apply.',
	'Other immunity and damage-prevention mechanics still apply.',
	'Shared field locks still apply.',
	'Shared field restrictions still apply.',
]);

/** Keep numbers, conditions and exceptions. Split prose at sentence boundaries, not decimals or stat abbreviations. */
export function conciseFieldNotes(lines: readonly string[]): string[] {
	return [...new Set(lines.flatMap(line => line
		.replace(/Special Attack/g, 'Sp. Atk').replace(/Special Defense/g, 'Sp. Def')
		.replace(/base maximum HP/g, 'max HP').replace(/maximum HP/g, 'max HP')
		.replace(/Pokemon/g, 'Pokémon').replace(/(\d)x\b/g, '$1×')
		.replace(/during the residual phase/g, 'at turn end')
		.replace(/at field residual/g, 'at turn end')
		.replace(/the status-move clearing branch/g, 'clearing with a status move')
		.replace(/named ([\d.]+×) (?:power )?bonus/g, '$1 power')
		.replace(/, despite older prose calling it Snow/g, '')
		.split(/(?<!\bSp)\. (?=[A-Z])/)
		.map(sentence => sentence.trim())
		.filter(sentence => sentence && !sentence.includes('is misspelled') &&
			!/^Its ordinary .+ remain\.?$/.test(sentence) &&
			!/^Healing prevention or full HP can prevent recovery\.?$/.test(sentence) &&
			!redundantSentences.has(sentence.endsWith('.') ? sentence : sentence + '.'))
		.map(sentence => /[.!?]$/.test(sentence) ? sentence : sentence + '.')))];
}
