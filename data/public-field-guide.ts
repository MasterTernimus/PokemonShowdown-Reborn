import { RemainingFieldGuide } from './public-field-guide-remaining';
import { appendSharedFieldGuide, appendReviewedHazards, appendSecretPowerGuide } from './public-field-guide-shared';
/** Reviewed entries are deliberately separate from legacy notes and generated indexes. */
export const ReviewedFieldGuide: { [id: string]: { [section: string]: string[] } } = {
	hauntedterrain: {
		Transitions: [
			"From Holy: Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat, or Curse used by a Ghost type can create Haunted after the move. The Holy handler blocks this transition while Neutralization is active; shared field locks still apply.",
			"To Holy: Origin Pulse, Purify, Sacred Fire, Dazzling Gleam and Flash request Holy after the move. Judgment is also listed for this change, but currently does not trigger it.",
		],
		'Boosts and general effects': [
			"Primary Ghost attacks gain 1.5× base power. Ghost attacks can hit Normal typing; additional move typing can still affect effectiveness.",
			"Ghost Pokémon gain 1.3× Defense and Special Defense.",
			"Sleeping non-Ghost Pokémon lose 1/16 base maximum HP each turn. Other immunity and damage-prevention mechanics still apply.",
			"Field boosts use the engine’s adaptive-field modifier; conditional abilities can alter their contribution. Named bonuses can stack with the type bonus.",
		],
		Abilities: [
			"Cursed Body: the usual eligible damaging-hit Disable roll always succeeds here, unless the attacker is already disabled or the move is excluded. Its local fainting curse is a shared ability effect, not a Haunted-only effect.",
			"Mimicry selects Ghost. Power Spot boosts allies’ move power by 1.5× instead of its ordinary 1.3×.",
			"Rattled grants +1 Speed on entry. Shadow Tag reveals opposing held items on entry. Wandering Spirit loses one Speed stage each turn.",
			"Perish Body adds its trapping volatile when its damaging-hit handler activates here; its normal targeting and trapping exceptions still apply.",
			"This reviewed list is not exhaustive. Custom field-setting composites and shared helpers are indexed below for further documentation.",
		],
		Moves: [
			"Fire Spin, Flame Burst, Flame Charge and Inferno: named 1.5× power bonus. Astonish, Bone Club, Bone Rush and Bonemerang: named 1.5× bonus. Shadow Bone: named 1.2× bonus, in addition to the Ghost bonus.",
			"Origin Pulse, Purify, Sacred Fire, Dazzling Gleam and Flash are listed for a 1.3× power modifier where applicable. Status moves do not gain damaging power merely from this list.",
			"Hypnosis has 90% accuracy. Will-O-Wisp has 90% accuracy here, overridden to 100% for a Fire-type user by its later check.",
			"Lick has a 100% paralysis secondary. Bitter Malice has a 100% Special Attack drop secondary and a separate 30% freeze-status secondary; ordinary secondary-effect protections still apply.",
			"Fire Spin targets all adjacent foes. Spite removes up to 6 PP. Nightmare deals 1/3 base maximum HP each turn.",
			"Spirit Break is super effective against Ghost typing. Nature Power calls Phantom Force. Camouflage and Terrain Pulse select Ghost. Secret Power has a 30% Ghost Curse secondary.",
			"Scary Face currently retains its primary −2 Speed and adds a separate −4 Speed secondary. It is not documented as a simple replacement with −4.",
			"Shelter’s Haunted mapping is commented out in the current source. Do not assume the example’s Ghost-damage reduction is implemented.",
		],
		'Seeds and other effects': [
			"Magical Seed raises Defense and Special Defense by one stage and attempts to burn its holder when consumed on Haunted. Ordinary item, stat and status restrictions apply.",
		],
		'Battle messages': [
			"Evil spirits gathered!", "The evil aura powered up the attack!", "Will-o'-wisps joined the attack...", "Boo!", "Spooky scary skeletons!", "The evil spirits have been exorcised!",
		],
	},
};

Object.assign(ReviewedFieldGuide, {
	"forestterrain": {
		"Transitions": [
			"Fire ignition moves and Fire Max moves can create Burning. The ignition branch is blocked only when both rain and Water Sport are present; shared transition locks still apply.",
			"Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat and Ghost-type Curse create Bewitched Woods. Water Max moves create Swamp. Surf adds one swamp counter and Muddy Water adds two; three counters create Swamp.",
		],
		"Boosts and general effects": [
			"Primary Grass attacks and special Bug attacks gain 1.5x power. Named bonuses can stack with type bonuses; adaptive field modifiers still apply.",
		],
		"Moves": [
			"Gale Strike, Attack Order, Electroweb, Drum Beating, Skitter Smack and Pounce gain 1.5x power. Cut gains 2x; Air Cutter, Air Slash, Breaking Swipe, Fury Cutter, Psycho Cut and Slash gain 1.5x. These cutting moves plus Gale Strike and Cut gain additional Grass typing.",
			"Grav Apple gains 1.5x. Surf and Muddy Water gain a 0.5x modifier, with an additional 1.3x when their use reaches the swamp transition threshold. Water Max moves gain 1.3x.",
			"Nature Power calls Wood Hammer. Terrain Pulse becomes Bug. Nature's Madness removes three quarters of current HP, subject to its normal restrictions.",
		],
		"Abilities": [
			"Grass Pelt grants its 1.5x Defense modifier here. Other indexed ability interactions remain under review.",
		],
	},
	"factoryterrain": {
		"Transitions": [
			"Bulldoze, Fissure, Earthquake, Explosion, Magnitude, Self-Destruct, Tectonic Rage, Light That Burns the Sky, Aura Wheel, Discharge, Gigavolt Havoc, Ion Deluge and Overdrive request Short Circuit after use. Physical Super UMD Move can also transition from Factory, once its field-resolution guard permits.",
		],
		"Boosts and general effects": [
			"Primary Electric moves gain 1.2x. Double Iron Bash, Flash Cannon, Gear Grind, Gyro Ball and Magnet Bomb gain 2x. Named and type bonuses can stack, with adaptive field modifiers.",
		],
		"Moves": [
			"Super UMD Move, Steamroller and Techno Blast gain 1.5x. The listed transition moves gain 1.3x; physical Super UMD Move also gains 1.3x.",
			"Steel Beam costs one quarter maximum HP instead of one half. Shift Gear raises Attack and Speed by two stages each. Metal Sound lowers Special Defense by three stages. Nature Power calls Gear Grind; Terrain Pulse becomes Steel.",
		],
		"Abilities": [
			"Technician's power threshold rises to 80. Download raises its selected stat by two stages. Heavy Metal raises Defense and lowers Speed on entry; Light Metal raises Speed on entry.",
			"Galvanize's conversion power modifier is 1.5x. Electromorphosis additionally raises Special Defense on a damaging hit.",
		],
	},
	"shortcircuitterrain": {
		"Transitions": [
			"Aura Wheel, Charge Beam, Discharge, Gigavolt Havoc, Ion Deluge, Overdrive, Parabolic Charge, Wild Charge and Rising Voltage request Factory after use. Special Super UMD Move can also transition from Short Circuit when its field-resolution guard permits.",
		],
		"Boosts and general effects": [
			"Primary Electric power cycles through 0.8x, 1.5x, 0.5x, 1.2x and 2x. The counter advances when the power callback runs, not simply once per turn. Named bonuses can stack; adaptive field modifiers apply.",
		],
		"Moves": [
			"Flash Cannon, Gear Grind, Gyro Ball, Magnet Bomb, Muddy Water, Surf, Steel Beam and Double Iron Bash gain additional Electric typing. Zap Cannon has 80% accuracy.",
			"Gear Grind, Gyro Ball, Hydro Vortex, Magnet Bomb, Muddy Water, Surf and Flash Cannon gain 1.5x. Super UMD Move, Dazzling Gleam, Hydro Vortex and Infernal Parade gain a separate 1.5x named modifier; Hydro Vortex appears in both lists.",
			"Dark Pulse, Night Daze, Night Slash, Phantom Force, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch and Shadow Sneak gain 1.3x. Light That Burns the Sky has a 0.5x modifier. Steel Beam gains roughly 1.667x and makes its user faint.",
			"The Factory transition moves gain 1.3x. Nature Power calls Discharge; Terrain Pulse becomes Electric.",
		],
		"Abilities": [
			"Galvanize's conversion modifier becomes 2x. Download raises both Attack and Special Attack by one stage. Electromorphosis additionally raises Special Defense on a damaging hit.",
		],
	},
	"rockyterrain": {
		"Boosts and general effects": [
			"Primary Rock moves gain 1.5x. Positive Defense stages prevent flinching. Positive Defense stages or Substitute block bullet and pulse moves.",
			"Flinching deals one quarter base maximum HP unless the target has Steadfast or Sturdy. Failed or protected contact attacks cost their user one eighth base maximum HP unless Rock Head prevents this field effect.",
		],
		"Moves": [
			"Bulldoze, Earthquake, Magnitude, Rock Climb and Strength gain additional Rock typing and 1.5x power. Accelerock gains a named 1.5x bonus in addition to the Rock bonus. Rock Smash gains 2x. Adaptive field modifiers still apply.",
			"Rock Climb gains one critical-hit stage. Rock Polish raises Speed by three stages. Nature Power calls Rock Smash; Terrain Pulse becomes Rock.",
			"Stealth Rock doubles the type-effectiveness exponent here; this is not a flat doubling of all Stealth Rock damage.",
		],
		"Abilities": [
			"Power Drill's eligible drill and horn moves gain its 2x field power modifier and protection bypass. Other indexed ability interactions remain under review.",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"desertterrain": {
		"Boosts and general effects": [
			"Ground types gain 1.5x Special Defense. Water attacks aimed at another Water- or Grass-type Pokemon are intercepted and attempt to restore one quarter base maximum HP instead.",
			"Primary Water attacks from grounded users have a 0.5x modifier, except Scald, Steam Eruption and Hydro Steam. Primary Electric attacks against grounded targets have a 0.5x modifier. Adaptive field modifiers apply.",
			"In sun or extreme sun, Water and Grass types lose one eighth base maximum HP each turn unless Chlorophyll or Solar Power exempts them. Normal damage prevention still applies.",
		],
		"Moves": [
			"Soak, Aqua Ring and Life Dew fail because the desert is too dry.",
			"Burn Up, Dig, Needle Arm, Heat Wave, Pin Missile, Sand Tomb, Sandsear Storm, Scald, Scorching Sands, Searing Sunraze Smash, Solar Beam, Solar Blade, Steam Eruption, Thousand Waves and Hydro Steam gain 1.5x power.",
			"Bonemerang, Bone Club, Bone Rush and Shadow Bone gain 1.5x power.",
		],
		"Battle messages": [
			"The intense desert heat blunted the attack!",
			"The floating sand particles partially grounded the attack!",
			"The harsh desert heat augmented the attack!",
			"The lifeless desert strengthened the attack!",
		],
	},
	"icyterrain": {
		"Boosts and general effects": [
			"Grounded non-Ice Pokemon have 0.75x Speed unless Limber, Snow Cloak, Slush Rush, Ice Body, Refrigerate or Spiral Evolution exempts them. Ice types gain 1.5x Defense during hail.",
			"Primary Ice moves gain 1.5x power and primary Fire moves have a 0.5x modifier. Adaptive field modifiers apply. Grounded entrants without Magic Guard take icy-spikes damage: 1/8 maximum HP with zero or one Spikes layer, 1/6 with two, or 1/4 with three. The same damage applies when Elemental Seed invokes it; this field check does not exempt Heavy-Duty Boots.",
		],
		"Moves": [
			"Primary Rock moves gain additional Ice typing. Bitter Malice gains 1.5x power and ten percentage points on its freeze/frostbite secondary, once per move.",
			"Scald, Steam Eruption and Hydro Steam have a 0.5x modifier and an additional 1.3x when the stored hot-water counter is one. Snipe Shot gains 1.2x; Chilling Water gains 2x.",
			"Grounded users receive the engine's icy-momentum marker for eligible physical priority contact moves and the named rolling/sliding moves; the downstream momentum behavior remains under review.",
		],
		"Battle messages": [
			"The field is covered in ice.",
			"The cold strengthened the attack!",
			"The cold softened the attack...",
			"The cold air crystallized the missile",
			"The freezing air boosted the attack!",
		],
	},
	"snowyterrain": {
		"Boosts and general effects": [
			"Grounded non-Ice Pokemon have 0.75x Speed unless Slush Rush, Ice Body, Snow Cloak, Limber, Web Assassin or Spiral Evolution exempts them. Ice types gain 1.5x Special Defense during hail.",
			"Primary Fire moves, Scald, Eruption and Hydro Steam have one 0.5x modifier. Named field bonuses can stack; adaptive field modifiers apply.",
		],
		"Moves": [
			"Physical Steel moves, Bulldoze, Earthquake, Magnitude, Mud Bomb, Mud Shot, Mud Barrage and Sand Tomb gain additional Ice typing.",
			"Blizzard, Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Powder Snow, Silver Wind, Twister, Mud Barrage, Mud Shot, Mud Bomb and Chilling Water gain 1.5x. Special Flying moves share that same bonus branch.",
			"Aeroblast, Air Cutter, Air Slash, Bleakwind Storm, Chilling Water, Fairy Wind, Glaciate, Gust, Hurricane, Ominous Wind, Razor Wind, Silver Wind and Twister gain a separate 1.5x bonus, stacking when both lists apply.",
		],
		"Transitions": [
			"At field residual, ordinary rain changes to hail. Sun or extreme sun without Water Sport records a sun counter, then clears the field on the next eligible residual check. The counter is not reset by the shown non-sun branch. Move-triggered transitions remain under review.",
		],
	},
	"mountainterrain": {
		"Boosts and general effects": [
			"Primary Rock and Flying attacks gain 1.5x power. Named bonuses stack where applicable, with adaptive field modifiers.",
		],
		"Moves": [
			"Vital Throw, Circle Throw, Storm Throw, Ominous Wind, Icy Wind, Silver Wind, Twister, Razor Wind, Fairy Wind, Thunder, Eruption, Avalanche and Hyper Voice gain 1.5x.",
			"On every field during Strong Winds, Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister, Heavenly Wing and Airstream Assault gain an additional 1.5x. Special Flying moves independently gain an additional 1.5x in Strong Winds.",
			"Blizzard, Glaciate, Subzero Slammer and Mountain Gale gain 1.3x.",
		],
		"Transitions": [
			"Consecutive hail field-residual checks advance a counter toward Snowy Mountain. An initially undefined counter is first set to zero; the transition occurs at two. Non-hail residual checks reset it. Move-triggered transitions remain under review.",
		],
		"Battle messages": [
			"The whole mountain is moving!",
			"Yodelayheehoo~",
			"The mountain was covered in snow!",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"electricterrain": {
		"Boosts and general effects": [
			"Grounded, non-semi-invulnerable Pokemon cannot be put to sleep or receive Yawn. Primary Electric attacks from grounded, non-semi-invulnerable users gain 1.5x power.",
			"The ordinary duration is five turns, or three when created by Stoked Sparksurfer, Ion Deluge or Plasma Fists; Amplifield Rock adds three. Battle display can intentionally show a public duration range.",
		],
		"Moves": [
			"Explosion, Hurricane, Muddy Water, Overdrive, Self-Destruct, Smack Down, Thousand Arrows, Surf and Wildbolt Storm gain additional Electric typing and a named 1.5x power modifier. Hydro Vortex gains the additional typing but is absent from that named power list.",
			"Magnet Bomb gains 2x power. Named and primary-type bonuses can stack, with adaptive field modifiers.",
		],
	},
	"grassyterrain": {
		"Boosts and general effects": [
			"Grounded users' primary Grass attacks gain 1.5x power. Primary Fire attacks against grounded targets also gain 1.5x. Grounded, non-semi-invulnerable Pokemon heal one sixteenth base maximum HP each turn.",
			"Ordinary duration is five turns, or three from Bloom Doom; Amplifield Rock adds three.",
		],
		"Moves": [
			"Absorb, Giga Drain, Mega Drain and Horn Leech drain three quarters of damage dealt.",
			"Earthquake, Bulldoze, Magnitude, Muddy Water and Surf have a 0.5x power modifier. Fairy Wind, Silver Wind, Grass Knot, Icy Wind, Ominous Wind, Razor Wind and Twister gain 1.5x. Named and primary-type bonuses can stack, with adaptive field modifiers.",
			"Sludge Wave and Acid Downpour gain 1.3x. Surf and Muddy Water gain an additional 1.3x when reaching the swamp-counter threshold.",
		],
		"Transitions": [
			"The ignition list includes Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Self-Destruct and Inferno Overdrive; Fire Max moves also request Burning. The ordinary ignition branch checks rain and Water Sport. The heavy-rain check is currently misspelled and does not correctly recognize Primordial Sea.",
			"Sludge Wave or Acid Downpour requests Corrosive unless Neutralization blocks it. Surf adds one swamp counter and Muddy Water adds two; three counters request Swamp.",
			"Changing weather to extreme sun requests Desert and sets an existing terrain duration to 9999.",
		],
	},
	"mistyterrain": {
		"Boosts and general effects": [
			"Grounded, non-semi-invulnerable Pokemon are protected from major status and confusion. Fairy types gain 1.5x Special Defense.",
			"Primary Dragon moves have a 0.5x power modifier; primary Fairy moves gain 1.5x. These power checks do not require grounding. Ordinary duration is five turns, or three from Mist; Amplifield Rock adds three.",
		],
		"Moves": [
			"Explosion, Mind Blown and Self-Destruct fail. Misty Explosion instead gains 2x power.",
			"Shadow Ball, Night Daze and Dark Pulse have a 0.5x modifier. Aura Sphere, Clear Smog, Doom Desire, Icy Wind, Magical Leaf, Mist Ball, Moongeist Beam, Mystical Fire, Silver Wind, Smog, Springtide Storm, Steam Eruption and Strange Steam gain 1.5x.",
			"The listed wind-clearing moves gain 1.3x where they deal damage. Corrosive transition moves gain 1.3x when the stored counter is one; Acid Downpour gains it immediately. Adaptive field modifiers apply.",
		],
		"Transitions": [
			"Smog, Clear Smog and Poison Gas record a corrosive counter, then request Corrosive Mist on the next eligible use. Acid Downpour requests it immediately. Neutralization blocks this transition.",
			"Defog, Gust, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Supersonic Skystrike and G-Max Wind Rage clear the field. Neutralization blocks the status-move clearing branch; shared field restrictions still apply.",
		],
	},
	"psychicterrain": {
		"Boosts and general effects": [
			"Grounded, non-semi-invulnerable targets are protected from opposing positive-priority moves. Allies, self-targeting moves, Follow Me, Rage Powder and Spotlight are exempt. The local threshold is priority above 0.1.",
			"Grounded, non-semi-invulnerable users' primary Psychic attacks gain 1.5x power. Ordinary duration is five turns, or eight with Amplifield Rock.",
		],
		"Moves": [
			"Aura Sphere, Hex, Magical Leaf, Mind Blown, Moonblast and Mystical Fire gain a named 1.5x power modifier. Named and primary-type bonuses can stack, with adaptive field modifiers.",
		],
	},
});

// Shared stage pattern reviewed against terrains.ts and field.ts.
ReviewedFieldGuide.flowergarden1 = {
	"Boosts and general effects": [
		"Primary Grass attacks have a 1x modifier and primary Bug attacks have a 1x modifier. Named modifiers can stack; adaptive field modifiers apply.",
	],
	"Moves": [],
	"Transitions": [
		"Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport and Bloom Doom grow the garden. Ripen grows by two stages when starting at stage 1–3; otherwise growth is one, capped at five.",
		"Cut and X-Scissor reduce the stage by one, stopping at one. Acid Downpour resets it to stage one.",
		"At stage three or above, Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy and Inferno Overdrive can ignite the garden when rain/heavy rain and field or Pokemon Water Sport do not prevent it.",
		"Sun, extreme sun, rain, heavy rain or the Rift-garden flag enables residual growth, guarded against duplicate growth during that residual turn. Burning-garden dousing restores its stored stage minus burning turns, with a minimum of one; Rain Dance, Water Spout and Water Sport also request growth. Other dousing moves are Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage. Oceanic Operetta is misspelled in this list and does not activate this restoration path.",
	],
	"Abilities": [
		"One growth is triggered per entrant with Drizzle, Drought, Flower Gift, Flower Veil, Orichalcum Pulse, Mega Sol, Searing Petals, Seed Sower, Grassy Surge, Forest Surge, Pollen Bloom, Toxic Bloom or Ancient Bloom. Composite components do not multiply this entry growth.",
	],
	"Battle messages": [
		"The garden grew a little!",
		"The garden caught fire!",
	],
};
ReviewedFieldGuide.flowergarden2 = {
	"Boosts and general effects": [
		"Primary Grass attacks have a 1.1x modifier and primary Bug attacks have a 1x modifier. Named modifiers can stack; adaptive field modifiers apply.",
	],
	"Moves": [
		"Cut gains 2x power against Grass targets, otherwise 1.5x.",
	],
	"Transitions": [
		"Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport and Bloom Doom grow the garden. Ripen grows by two stages when starting at stage 1–3; otherwise growth is one, capped at five.",
		"Cut and X-Scissor reduce the stage by one, stopping at one. Acid Downpour resets it to stage one.",
		"At stage three or above, Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy and Inferno Overdrive can ignite the garden when rain/heavy rain and field or Pokemon Water Sport do not prevent it.",
		"Sun, extreme sun, rain, heavy rain or the Rift-garden flag enables residual growth, guarded against duplicate growth during that residual turn. Burning-garden dousing restores its stored stage minus burning turns, with a minimum of one; Rain Dance, Water Spout and Water Sport also request growth. Other dousing moves are Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage. Oceanic Operetta is misspelled in this list and does not activate this restoration path.",
	],
	"Abilities": [
		"One growth is triggered per entrant with Drizzle, Drought, Flower Gift, Flower Veil, Orichalcum Pulse, Mega Sol, Searing Petals, Seed Sower, Grassy Surge, Forest Surge, Pollen Bloom, Toxic Bloom or Ancient Bloom. Composite components do not multiply this entry growth.",
	],
	"Battle messages": [
		"The garden grew a little!",
		"The garden caught fire!",
	],
};
ReviewedFieldGuide.flowergarden3 = {
	"Boosts and general effects": [
		"Primary Grass attacks have a 1.3x modifier and primary Bug attacks have a 1.5x modifier. Named modifiers can stack; adaptive field modifiers apply.",
		"Primary Fire attacks gain 1.5x power.",
	],
	"Moves": [
		"Cut gains 2x power against Grass targets, otherwise 1.5x.",
		"Fleur Cannon, Flower Trick, Petal Blizzard, Petal Dance and Springtide Storm gain 1.2x named power.",
	],
	"Transitions": [
		"Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport and Bloom Doom grow the garden. Ripen grows by two stages when starting at stage 1–3; otherwise growth is one, capped at five.",
		"Cut and X-Scissor reduce the stage by one, stopping at one. Acid Downpour resets it to stage one.",
		"At stage three or above, Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy and Inferno Overdrive can ignite the garden when rain/heavy rain and field or Pokemon Water Sport do not prevent it.",
		"Sun, extreme sun, rain, heavy rain or the Rift-garden flag enables residual growth, guarded against duplicate growth during that residual turn. Burning-garden dousing restores its stored stage minus burning turns, with a minimum of one; Rain Dance, Water Spout and Water Sport also request growth. Other dousing moves are Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage. Oceanic Operetta is misspelled in this list and does not activate this restoration path.",
	],
	"Abilities": [
		"One growth is triggered per entrant with Drizzle, Drought, Flower Gift, Flower Veil, Orichalcum Pulse, Mega Sol, Searing Petals, Seed Sower, Grassy Surge, Forest Surge, Pollen Bloom, Toxic Bloom or Ancient Bloom. Composite components do not multiply this entry growth.",
	],
	"Battle messages": [
		"The garden grew a little!",
		"The garden caught fire!",
	],
};
ReviewedFieldGuide.flowergarden4 = {
	"Boosts and general effects": [
		"Primary Grass attacks have a 1.5x modifier and primary Bug attacks have a 2x modifier. Named modifiers can stack; adaptive field modifiers apply.",
		"Primary Fire attacks gain 1.5x power.",
		"Super-effective interactions against Grass typing become neutral for that typing. This does not remove weaknesses contributed by the other type. Grassy Glide gains one priority level.",
	],
	"Moves": [
		"Cut gains 2x power against Grass targets, otherwise 1.5x.",
		"Fleur Cannon, Flower Trick, Petal Blizzard, Petal Dance and Springtide Storm gain 1.5x named power.",
	],
	"Transitions": [
		"Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport and Bloom Doom grow the garden. Ripen grows by two stages when starting at stage 1–3; otherwise growth is one, capped at five.",
		"Cut and X-Scissor reduce the stage by one, stopping at one. Acid Downpour resets it to stage one.",
		"At stage three or above, Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy and Inferno Overdrive can ignite the garden when rain/heavy rain and field or Pokemon Water Sport do not prevent it.",
		"Sun, extreme sun, rain, heavy rain or the Rift-garden flag enables residual growth, guarded against duplicate growth during that residual turn. Burning-garden dousing restores its stored stage minus burning turns, with a minimum of one; Rain Dance, Water Spout and Water Sport also request growth. Other dousing moves are Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage. Oceanic Operetta is misspelled in this list and does not activate this restoration path.",
	],
	"Abilities": [
		"One growth is triggered per entrant with Drizzle, Drought, Flower Gift, Flower Veil, Orichalcum Pulse, Mega Sol, Searing Petals, Seed Sower, Grassy Surge, Forest Surge, Pollen Bloom, Toxic Bloom or Ancient Bloom. Composite components do not multiply this entry growth.",
	],
	"Battle messages": [
		"The garden grew a little!",
		"The garden caught fire!",
	],
};
ReviewedFieldGuide.flowergarden5 = {
	"Boosts and general effects": [
		"Primary Grass attacks have a 2x modifier and primary Bug attacks have a 2x modifier. Named modifiers can stack; adaptive field modifiers apply.",
		"Primary Fire attacks gain 1.5x power.",
		"Super-effective interactions against Grass typing become neutral for that typing. This does not remove weaknesses contributed by the other type. Grassy Glide gains one priority level.",
	],
	"Moves": [
		"Cut gains 2x power against Grass targets, otherwise 1.5x.",
		"Fleur Cannon, Flower Trick, Petal Blizzard, Petal Dance and Springtide Storm gain 1.5x named power.",
		"Petal Dance and Petal Blizzard target all adjacent foes. Powder moves other than Rage Powder also gain that targeting when their original target is normal, adjacent foe, random normal or all adjacent.",
	],
	"Transitions": [
		"Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport and Bloom Doom grow the garden. Ripen grows by two stages when starting at stage 1–3; otherwise growth is one, capped at five.",
		"Cut and X-Scissor reduce the stage by one, stopping at one. Acid Downpour resets it to stage one.",
		"At stage three or above, Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy and Inferno Overdrive can ignite the garden when rain/heavy rain and field or Pokemon Water Sport do not prevent it.",
		"Sun, extreme sun, rain, heavy rain or the Rift-garden flag enables residual growth, guarded against duplicate growth during that residual turn. Burning-garden dousing restores its stored stage minus burning turns, with a minimum of one; Rain Dance, Water Spout and Water Sport also request growth. Other dousing moves are Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage. Oceanic Operetta is misspelled in this list and does not activate this restoration path.",
	],
	"Abilities": [
		"One growth is triggered per entrant with Drizzle, Drought, Flower Gift, Flower Veil, Orichalcum Pulse, Mega Sol, Searing Petals, Seed Sower, Grassy Surge, Forest Surge, Pollen Bloom, Toxic Bloom or Ancient Bloom. Composite components do not multiply this entry growth.",
	],
	"Battle messages": [
		"The garden grew a little!",
		"The garden caught fire!",
	],
};

Object.assign(ReviewedFieldGuide, {
	"inverseterrain": {
		"Boosts and general effects": [
			"Type-effectiveness exponents are reversed. Ordinary type immunities become weaknesses. Freeze-Dry's special interaction with Water is excluded from this field's reversal callback.",
			"The field includes a special Ground-type immunity override for Thunder Wave. Shared move-specific immunity handling still applies.",
			"The duration callback gives Topsy-related sources three turns, or six with Amplifield Rock. Other sources receive five turns in this callback; other setters may override it.",
		],
	},
	"glitchterrain": {
		"Boosts and general effects": [
			"Damaging Grass, Fire, Water, Electric, Ice, Dragon, Psychic and Dark moves become special. Normal, Fighting, Ghost, Poison, Bug, Flying, Ground, Rock and Steel moves become physical. Damaging Fairy moves first become Normal.",
			"A faster attacker gains one critical-hit stage based on the callback's unmodified Speed comparison. Psychic moves gain 1.2x power.",
			"Ghost moves fail against Psychic targets. Bug is super effective against Poison, Poison is super effective against Bug, Ice is neutral against Fire, and Ghost/Dark are resisted by Steel. Dragon effectiveness is set neutral by this callback, but immunity handling remains separate.",
			"Ordinary duration is five turns, or eight with Amplifield Rock. Additional shared stat interactions and transitions remain under review.",
		],
		"Moves": [
			"Roar and Whirlwind fail.",
		],
		"Battle messages": [
			"ERROR! MOVE NOT FOUND!",
			"Ghosts forgot how to beat Psychics!",
			"1n!taliz3 .b//////attl3",
		],
	},
	"adriennterrain": {
		"Boosts and general effects": [
			"This selectable setup starts with Misty Terrain above Fairy Tale Terrain. It is a layered format setup, not a separate replacement for either field's mechanics. Read Misty for the initial active effects and Fairy Tale for the underlying field.",
			"Clearing or changing the upper field follows the shared field stack and transition rules. Documentation of every stack-specific exception remains under review.",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"watersurfaceterrain": {
		"Boosts and general effects": [
			"Grounded non-Water Pokemon have 0.75x Speed unless Swift Swim, Surge Surfer, Limber, Web Assassin or Spiral Evolution exempts them. Tar Shot is washed away at residual.",
			"Primary Water attacks gain 1.5x power. Primary Electric attacks against grounded targets gain 1.5x, while Fire attacks against grounded targets have a 0.5x modifier. Named bonuses can stack, with adaptive field modifiers.",
		],
		"Moves": [
			"Damaging primary Ground moves fail unless recognized by the shared ground-bone exception. Sand Attack also fails.",
			"Anchor Shot and Dragon Darts gain 2x power. Triple Dive gains 1.5x and Wave Crash gains 2x.",
			"Dive, Muddy Water, Surf, Whirlpool, Hydro Vortex and Splishy Splash gain a named 1.5x modifier. Whirlpool, Surf, Muddy Water, Dive, Sludge Wave, Octazooka, Origin Pulse and Hydro Vortex independently gain 1.2x, stacking for moves in both lists.",
			"Dive, Gravity, Acid Downpour, Blizzard, Subzero Slammer, Glaciate and Grav Apple have a named 5325/4096 power modifier where applicable. Sludge Wave gains that modifier when its stored counter is one. Full move-triggered transition rules remain under review.",
		],
		"Abilities": [
			"Propeller Tail users gain an additional 1.5x power modifier on positive-priority moves. Other shared ability healing and suppression interactions remain indexed for review.",
		],
	},
	"underwaterterrain": {
		"Boosts and general effects": [
			"Non-Water Pokemon have half Speed unless Limber, Web Assassin, Spiral Evolution, Elevate, Swift Swim or Steelworker exempts them. Starting this field clears existing weather.",
			"Primary Water attacks gain 1.5x power. Primary Electric attacks gain 2x power and numeric accuracy checks succeed. Physical non-Water moves have a 0.5x power modifier when the user is not Water-type and lacks Steelworker, Elevate, Schooling and Swift Swim. Named modifiers can stack, with adaptive field modifiers.",
			"Water-weak Pokemon take base maximum HP/8 multiplied by Water effectiveness each residual, unless Dry Skin, Magic Guard, Protective Ward, Swift Swim, Storm Drain or Water Absorb exempts them. Flame Body and Magma Armor double eligible damage. Neutral or Water-resistant typing does not take this field damage.",
			"Tar Shot is washed away. Pure Water attacks are neutral against Water typing; additional move typing follows the callback's separate combined-type handling.",
		],
		"Moves": [
			"Tar Shot, Spicy Extract, Sunny Day, Hail, Sandstorm and Rain Dance fail. All primary Fire moves fail.",
			"Ground moves gain additional Water typing unless recognized by the ground-bone exception. Dragon Darts and Grav Apple become Water, replacing their previous move typing.",
			"Anchor Shot and Dragon Darts gain 2x power. Triple Dive and Water Pulse gain 1.5x. Bounce, Dive, Sky Drop, Fly and Acid Downpour gain a named 1.3x modifier where applicable; Sludge Wave also gains it when its stored counter is one. Full transition rules remain under review.",
		],
		"Abilities": [
			"Propeller Tail users gain an additional 1.5x modifier on positive-priority moves. Shared Water Absorb and other ability healing remain separately applicable.",
		],
	},
	"swampterrain": {
		"Boosts and general effects": [
			"Primary Poison attacks against grounded targets gain 1.5x. Primary Bug, Grass and Water attacks gain 1.3x; primary Fire attacks have a 0.8x modifier. Named modifiers can stack, with adaptive field modifiers.",
			"Grounded Pokemon receive a residual Speed-drop attempt: one stage normally, two when trapped. Quick Feet, Swift Swim, Clear Body, White Smoke, Full Metal Body, Mycelium Might, Propeller Tail and Steam Engine exempt them, but the current Heavy-Duty Boots branch re-enables that attempt even for these abilities.",
			"Sleeping or Comatose Pokemon without Magic Guard take one sixteenth base maximum HP each turn, or one eighth when trapped. A volatile sourced from Infestation, Spider Web, Leech Seed or Snap Trap also triggers one random stat-drop attempt per residual.",
			"Ordinary duration is four turns, or seven with Amplifield Rock.",
		],
		"Moves": [
			"Explosion, Mind Blown and Self-Destruct fail. Poison Powder, Stun Spore and Sleep Powder have 100% accuracy. Thousand Arrows and Smack Down gain additional Water typing.",
			"Attack Order, Strength Sap, String Shot and moves with drain replace their secondary list with a guaranteed one-stage drop to a randomly chosen stat, subject to ordinary secondary protections.",
			"Thousand Arrows, Smack Down, Brine, Gunk Shot, Hydro Vortex, Mud Barrage, Mud Bomb, Mud Shot, Muddy Water, Savage Spin-Out and Sludge Wave gain 1.5x. Bulldoze, Earthquake and Magnitude have a 0.25x modifier.",
		],
		"Transitions": [
			"Sun adds one drying counter per residual; extreme sun adds three. At three, the field requests its previous terrain, or clears if none is recorded. Move-driven drying and the exact shared stack restrictions remain under review.",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"ashenbeachterrain": {
		"Boosts and general effects": [
			"Fighting types and Inner Focus holders cannot receive confusion. Own Tempo, Pure Power, Sand Veil and Steadfast make accuracy checks succeed unless the target has Unnerve.",
		],
		"Moves": [
			"Sand Tomb, Mud Bomb, Mud Shot and Mud Barrage gain 2x power. Hidden Power, Land's Wrath, Muddy Water, Strength, Surf, Thousand Waves and Clangorous Soulblaze gain 1.5x. Aura Sphere, Focus Blast, Stored Power and Zen Headbutt gain 1.3x. Psychic gains 1.2x. Adaptive field modifiers apply.",
			"After Fire Spin, Leaf Tornado, Twister, Whirlpool or a special Flying move, every active Pokemon that is not semi-invulnerable receives a one-stage accuracy-drop attempt. Sand Tomb's field volatile also causes a residual accuracy-drop attempt.",
		],
		"Battle messages": [
			"Dust swirled around the battlefield...",
		],
	},
	"bigtopterrain": {
		"Boosts and general effects": [
			"Sound moves and Drum Beating gain 1.5x power. Named bonuses can stack, with adaptive field modifiers.",
			"Eligible striking moves and physical Fighting moves other than Seismic Toss and Counter use the StrikerBonus damage roll: 0.5x, 1x, 1.5x, 2x or 3x. Outcomes depend on Attack stages and ability checks, not equal probabilities.",
		],
		"Moves": [
			"Pay Day and Make It Rain gain 2x power. Wind Dance, Acrobatics, Fiery Dance, Fire Lash, First Impression, Fly, Petal Dance, Power Whip, Revelation Dance and Vine Whip gain 1.5x. Skitter Smack, Body Press and Triple Axel gain 1.2x.",
		],
		"Abilities": [
			"Guts, Sheer Force, Huge Power, Pure Power, Punk Rock, Striker, Ultra Ego and Ultra Instinct use the special StrikerBonus odds table. Body Press also uses it with Bulletproof, Sturdy, Heavy Metal, Thick Fat or Solid Rock. The helper uses active-ability checks; passive equivalence must not be assumed without checking the caller.",
		],
		"Battle messages": [
			"Now presenting!",
			"Back, foul beast!",
			"What grace!",
			"An extravagant aerial finish!",
			"Loud and Clear!",
			"Weak!",
			"Ok!",
			"Nice!",
			"Powerful!",
			"OVER 9000!",
		],
	},
	"caveterrain": {
		"Boosts and general effects": [
			"Primary Rock moves and sound moves each gain 1.5x power. Noncontact Flying moves have a 0.5x modifier. Starting Cave clears hail. Named bonuses can stack, with adaptive field modifiers.",
			"The second eligible cave-collapse move collapses the ceiling and resets the counter. Semi-invulnerability, protection, Wide Guard, Mat Block, Rock Head, Bulletproof or Stalwart exempts a Pokemon. Prism Armor/Solid Rock take one third base maximum HP; Battle Armor/Shell Armor take one half. Full-HP Sturdy or Endure leaves one HP via the field's damage branch; otherwise the request is a full base-maximum-HP hit, subject to normal damage handling.",
		],
		"Moves": [
			"Rock Tomb gains a named 1.5x bonus. Power Gem, Diamond Storm, Blizzard and Subzero Slammer gain 1.3x. Fire and Dragon Max moves gain 1.3x.",
			"Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage and Continental Crush advance the collapse counter.",
			"Dragon Pulse and Dragon Energy gain 1.3x; Devastating Drake, Draco Meteor and Core Enforcer receive that named bonus only when the stored Dragon's Den counter is one. Fire transition moves have further counter-dependent power modifiers.",
		],
		"Transitions": [
			"Power Gem and Diamond Storm request Crystal Cavern; Blizzard and Subzero Slammer request Icy. Devastating Drake, Draco Meteor, Core Enforcer and Dragon Max moves request Dragon's Den. Dragon Pulse/Dragon Energy prime its counter, then transition on another eligible use.",
			"Blast Burn, Eruption, Inferno Overdrive, Mind Blown, Searing Shot and Burn Up combust the cave and request Volcanic. Fusion Flare is misspelled in this rule and does not activate that entry. Combustion requests half base maximum HP damage to active Pokemon except semi-invulnerable/protected targets and Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil or Well-Baked Body holders.",
			"Fire Max moves request Volcanic without that explosion loop. Magma Drift, Fever Pitch, Heat Wave, Lava Plume, Overheat, Incinerate, Inferno, Flame Burst, Fire Pledge and Sacred Fire prime a volcanic counter, then transition on another eligible use. Magma Drift respects its transition-block check. Shared field locks still apply.",
		],
		"Battle messages": [
			"The cave echoes dully...",
			"The quake collapsed the ceiling!",
			"Bits of rock fell from the crumbling ceiling!",
			"The cave was littered with crystals!",
			"The cave froze over!",
			"The cave combusted!",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"burningterrain": {
		"Boosts and general effects": [
			"Grounded users' primary Fire attacks gain 1.5x power. Primary Grass attacks against grounded targets and primary Ice attacks have a 0.5x modifier. Freeze/frostbite is prevented. Hail is cleared on field start and during residual handling.",
			"Grounded non-Fire Pokemon take base maximum HP/8 multiplied by Fire effectiveness each residual, unless Aqua Ring, Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil or Well-Baked Body exempts them. Leaf Guard, Fluffy, Grass Pelt, Ice Body or Tar Shot doubles eligible damage. Normal damage prevention still applies.",
			"The duration callback gives four turns, or seven with Amplifield Rock; other field setters and the burning-garden state can override normal lifetime.",
		],
		"Moves": [
			"Rock Slide, Smack Down and Thousand Arrows gain additional Fire typing and 2x power. Smog and Clear Smog gain Fire typing and 1.5x. Infernal Parade gains 1.5x. Field-clearing moves gain a named 1.3x modifier where applicable. Named bonuses can stack, with adaptive field modifiers.",
			"After Burn Up, the residual handler replaces any ??? type with Fire.",
		],
		"Abilities": [
			"Blazing Mane raises Speed by one when entering Burning, and for existing active holders when Burning starts.",
		],
		"Transitions": [
			"Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Water Sport, Water Spout, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike and G-Max Wind Rage restore the previous field or clear Burning. Oceanic Operetta is misspelled in this rule; its clearing behavior still needs verification.",
			"Ordinary rain or sandstorm also restores the previous field or clears Burning at field residual. Burning Flower Garden uses its own dousing path; rain douses it, while the shown sandstorm branch returns without clearing.",
		],
	},
	"corrosiveterrain": {
		"Boosts and general effects": [
			"Grounded entrants take base maximum HP/4 multiplied by Poison effectiveness unless Poison/Steel typing or Immunity, Magic Guard, Poison Heal, Toxic Boost or Wonder Guard exempts them.",
			"Sleeping or Comatose Pokemon lose one sixteenth base maximum HP at residual unless Poison/Steel typing or one of those abilities exempts them; this residual check does not require grounding.",
		],
		"Moves": [
			"Poison Powder, Stun Spore, Sleep Powder and Toxic have 100% accuracy. Primary Grass moves gain additional Poison typing.",
			"Mud Bomb, Mud Shot, Mud Barrage, Muddy Water, Smack Down, Whirlpool, Thousand Arrows and Apple Acid gain additional Poison typing and 1.5x power. Acid, Acid Spray, Grass Knot and Snap Trap gain 2x. Seed Flare gains 1.3x. Adaptive field modifiers apply.",
		],
		"Transitions": [
			"Purify and Seed Flare request Grassy Terrain after use, subject to shared field restrictions.",
		],
		"Battle messages": [
			"The polluted field was purified!",
		],
	},
	"corrosivemistterrain": {
		"Boosts and general effects": [
			"Primary Fire attacks gain 1.5x power. Special Flying moves, Apple Acid, Bubble Beam, Bubble, Sparkling Aria and Energy Ball gain additional Poison typing.",
			"At field residual, non-Poison/non-Steel active Pokemon are offered ordinary poison; a successful status application also requests one eighth base maximum HP damage through the poison damage event. This branch is skipped when the stored Neutralizing Gas counter is one.",
		],
		"Moves": [
			"Apple Acid, Bubble, Bubble Beam, Sparkling Aria, Smog, Clear Smog and Acid Spray gain 1.5x power. Clearing/ignition moves gain 1.3x where applicable; Seed Flare appears in that list and also receives another 1.3x. Adaptive field modifiers apply.",
		],
		"Transitions": [
			"Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Self-Destruct, Inferno Overdrive and Fire Max moves combust the mist. Infernal Rage participates only after its field-clear flag is set. Any active Damp holder prevents this combustion branch.",
			"Combustion requests full base-maximum-HP damage, then clears the field. Flash Fire, Well-Baked Body, semi-invulnerability, protection and Wide Guard exempt a target. Sturdy or Endure instead requests base maximum HP minus one through the damage event; this is not a guarantee of survival when already injured.",
			"Gravity requests Corrosive. Seed Flare requests Misty. Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Supersonic Skystrike and G-Max Wind Rage clear the field. Shared field restrictions still apply.",
		],
		"Battle messages": [
			"The toxic mist combusted!",
		],
	},
});

Object.assign(ReviewedFieldGuide, {
	"holyterrain": {
		"Boosts and general effects": [
			"Damaging moves cannot hit an ally other than their user. Primary Normal moves ignore Normal-type immunity; Normal attacks become super effective against Ghost and Dark typing, with additional move typing handled separately.",
			"Special Fairy and Normal attacks gain 1.5x power. Primary Dragon and Psychic gain 1.2x. Primary Ghost and special Dark attacks have a 0.5x modifier. Named bonuses can stack, with adaptive field modifiers.",
		],
		"Moves": [
			"Radiant Assault, Mystical Fire, Magical Leaf, Ancient Power, Judgment, Dei Iudicium, Sacred Fire, Extreme Speed, Sacred Sword and Return gain a named 1.5x modifier. ",
			"Multipulse, Psystrike, Aeroblast, Origin Pulse, Doom Desire, Mist Ball, Crush Grip, Luster Purge, Secret Sword, Psycho Boost, Relic Song, Spacial Rend, Hyperspace Hole, Roar of Time, Land's Wrath, Precipice Blades, Dragon Ascent, Moongeist Beam, Sunsteel Strike, Prismatic Laser, Fleur Cannon, Diamond Storm, Genesis Supernova, Searing Sunraze Smash and Menacing Moonraze Maelstrom gain 1.3x where their registered IDs match the source list.",
			"The Haunted-transition moves gain a named 1.3x modifier where applicable.",
		],
		"Transitions": [
			"Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat and Ghost-type Curse request Haunted unless an active Neutralization holder blocks the transition. Shared field locks still apply.",
		],
		"Battle messages": [
			"Benedictus Sanctus Spiritus...",
			"Godspeed!",
			"The holy energy resonated with the attack!",
			"The attack was cleansed...",
		],
	},
	"fairytaleterrain": {
		"Boosts and general effects": [
			"Primary Fire moves gain additional Dragon typing. Primary Dragon attacks gain 2x power; primary Fairy and Steel gain 1.5x. Steel attacks become super effective against Dragon typing. Named bonuses can stack, with adaptive field modifiers.",
		],
		"Moves": [
			"Cut, Sacred Sword, Secret Sword and Slash become Steel-type.",
			"Air Slash, Ancient Power, Fleur Cannon, Leaf Blade, Magical Leaf, Moongeist Beam, Mystical Fire, Night Slash, Psycho Cut, Relic Song, Smart Strike, Solar Blade, Sparkling Aria, Oceanic Operetta, Kowtow Cleave, Aqua Cutter, Ceaseless Edge, Stone Axe, Behemoth Blade, Razor Shell and Behemoth Bash gain 1.5x. Menacing Moonraze Maelstrom is misspelled in the rule and does not get this named bonus.",
			"Draining Kiss and Mist Ball gain 2x power.",
		],
		"Abilities": [
			"Fortress Shell grants +1 Defense and Special Defense on field start or entry, with a stored guard against duplicate Fairy Tale activation. Other field-specific ability handlers remain indexed for review.",
		],
	},
	"rainbowterrain": {
		"Boosts and general effects": [
			"Secondary chances double unless the move is Secret Power or the user has Serene Grace. A move's self-effect chance doubles only inside that same eligible secondary-list branch.",
			"Special Normal moves gain a randomly selected additional type and 1.5x power. Named bonuses can stack, with adaptive field modifiers.",
			"Sleeping Pokemon heal one sixteenth base maximum HP each residual. Comatose users also heal unless they have Magic Guard; the code's Magic Guard check applies to the Comatose branch, not the ordinary sleep branch.",
			"Pledge-created duration is four turns, or seven with Amplifield Rock. Rain Dance/Sunny Day creation uses the current weather duration, falling back to five. Other sources get five in this callback.",
		],
		"Moves": [
			"Aurora Beam, Dazzling Gleam, Dragon Pulse, the three Pledges, Fleur Cannon, Heart Stamp, Hidden Power, Judgment, Dei Iudicium, Mirror Beam, Mist Ball, Moonblast, Mystical Fire, Oceanic Operetta, Prismatic Laser, Relic Song, Sacred Fire, Secret Power, Silver Wind, Solar Beam, Solar Blade, Sparkling Aria, Tri Attack, Twinkle Tackle, Weather Ball and Zen Headbutt gain 1.5x.",
			"Dark Pulse, Night Daze, Never-Ending Nightmare and Shadow Ball have a 0.5x modifier. Light That Burns the Sky gains 1.3x.",
		],
		"Transitions": [
			"Light That Burns the Sky clears the field. Hail or sandstorm also clears it during residual handling.",
		],
		"Battle messages": [
			"The bright light pierced through the technicolor madness!",
			"The violent weather tore the field apart!",
		],
	},
});

Object.assign(ReviewedFieldGuide, RemainingFieldGuide);
appendSharedFieldGuide(ReviewedFieldGuide);

appendReviewedHazards(ReviewedFieldGuide);

appendSecretPowerGuide(ReviewedFieldGuide);

// Additional shared ability handlers checked against the resolved ability definitions.
for (const [id, lines] of Object.entries({
	"mirrorarenaterrain": [
		"Compound Eyes and Keen Eye grant one accuracy stage and Laser Focus on entry.",
		"Illuminate lowers each foe's accuracy by one stage on entry. Sand Veil, Snow Cloak and Tangled Feet each grant one evasion stage on entry.",
	],
	"starlightarenaterrain": [
		"Illuminate grants two Special Attack stages on entry. In multi-active formats it also applies Spotlight to a living adjacent ally if that ally does not already have it.",
	],
	"bewitchedwoodsterrain": [
		"Natural Cure clears its holder's major status during residual processing. Flower Veil protects all allied types here, not just Grass: it blocks eligible external stat drops, major status and Yawn; its ordinary source/effect exceptions still apply.",
		"Flower Gift's field-change handler changes an eligible Cherrim to Sunshine form here. Its weather-change handler also preserves Sunshine on this field.",
		"Power Spot gives allies 1.5x move power here instead of its ordinary 1.3x. Magician grants one Special Attack stage on entry.",
	],
	"holyterrain": [
		"Power Spot gives allies 1.5x move power here instead of its ordinary 1.3x.",
	],
	"psychicterrain": [
		"Power Spot gives allies 1.5x move power here instead of its ordinary 1.3x. Magician sets the accuracy of eligible incoming status moves to 50.",
	],
	"fairytaleterrain": [
		"Magician grants one Special Attack stage on entry.",
	],
	"hauntedterrain": [
		"Magician grants one Special Attack stage on entry.",
	],
	"mistyterrain": [
		"Magician grants one Special Attack stage on entry.",
	],
	"newworldterrain": [
		"Magician grants one Special Attack stage on entry.",
	],
	"mountainterrain": [
	],
	"snowymountainterrain": [
		"Snow Cloak multiplies incoming accuracy by approximately 0.8 even without hail or snow.",
	],
	"coldeclipseterrain": [
		"Snow Cloak multiplies incoming accuracy by approximately 0.8 even without hail or snow. Prism Armor prevents hail damage here.",
	],
	"icyterrain": [
		"Snow Cloak multiplies incoming accuracy by approximately 0.8 even without hail or snow.",
	],
	"desertterrain": [
		"Sand Veil multiplies incoming accuracy by 0.8 even without sandstorm.",
	],
	"ashenbeachterrain": [
		"Sand Veil multiplies incoming accuracy by 0.8 even without sandstorm.",
	],
	"bigtopterrain": [
		"Tangled Feet grants one evasion stage on entry.",
	],
	"rockyterrain": [
	],
	"grassyterrain": [
	],
})) (ReviewedFieldGuide[id].Abilities ||= []).push(...lines);
