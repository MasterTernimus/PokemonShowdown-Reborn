/** Manually checked against terrain callbacks, shared Field rules and seed handlers.
 * These are reviewed sections, not a claim that every cross-file interaction is documented. */
export const RemainingFieldGuide: { [id: string]: { [section: string]: string[] } } = {
	bewitchedwoodsterrain: {
		Transitions: [
			'Origin Pulse, Purify, Sacred Fire, Dazzling Gleam and Flash attempt to restore Forest after use, but the shared field-replacement rule currently blocks that change. Judgment also fails to trigger the attempted change. These are current implementation discrepancies, not guaranteed ways out.',
			'Electric, Grassy, Misty, Psychic, Forest, Rainbow and Cold Eclipse cannot replace this field through ordinary field-setting or field-changing effects.',
		],
		'Boosts and general effects': [
			"Primary Grass and Fairy attacks gain 1.5x power; primary Dark attacks gain 1.3x. The Grass bonus applies regardless of the attacker's type or grounding, while the separate Grass-type healing requires grounding.",
			'Fairy attacks are super effective against Steel and neutral against Dark and Poison. Poison attacks are resisted by Fairy and neutral against Grass. Other defensive types still contribute to the final matchup.',
			'Sleeping Pokémon lose 1/16 base maximum HP each turn, including Ghost types. Grounded Grass types outside a semi-invulnerable turn heal 1/16 base maximum HP.',
		],
		Abilities: ['Eternal Flower grants 1.5× Defense and Special Defense, blocks major status, and heals 1/16 base maximum HP each turn. This healing is separate from the grounded Grass healing.'],
		Moves: [
			'Hex, Mystical Fire and Spirit Break gain 1.5× power. Aurora Beam, Bubble Beam, Charge Beam, Flash Cannon, Hyper Beam, Ice Beam, Magical Leaf, Mirror Beam, Psybeam and Signal Beam gain 1.4×.',
			'Dark Pulse, Moonblast, Night Daze and Vorpal Blade gain 1.2×. Origin Pulse, Sacred Fire and Dazzling Gleam gain 1.3×. Named bonuses can stack with type bonuses; status moves do not gain damaging power.',
		],
		'Seeds and other effects': ['Magical Seed raises Special Defense by one stage and applies Ingrain.'],
		'Battle messages': ['Evil spirits gathered!', 'Mystical aura amplified the attack!'],
	},
	chessboardterrain: {
		Transitions: ['The shared field rules prevent another full field from replacing the Chessboard. It has no move-triggered exit in its own handler.'],
		'Boosts and general effects': [
			'In formats using Assign Roles, the first team member is a Pawn in singles; the first two are Pawns in doubles. The last member becomes Queen. Among the remaining members, a King’s Rock holder becomes King, otherwise the member with the lowest base maximum HP does. Remaining roles follow the highest stat: offense → Bishop, defense → Rook, Speed → Knight. FFA does not receive the singles/doubles Pawn assignment.',
			'Rook and Queen gain one Defense and Special Defense stage on entry; Bishop gains one Attack and Special Attack stage. King receives +1 move priority. Queen gains 1.5× move power. Knight gains 3× power against a Queen and 1.25× for moves aimed at all adjacent foes.',
			'A full-HP Pawn survives an otherwise fatal move hit at 1 HP once, then loses its Pawn protection. Healing back to full does not restore it.',
		],
		Moves: [
			'Queen’s Gambit, Ancient Power, Barrage, Continental Crush, Psychic, Rock Throw, Secret Power, Shattered Psyche and Strength add Rock typing and gain 1.5× power. Barrage gains another 2×.',
			'Those chess-piece moves gain another 2× against a confused target or one with Unaware, Simple, Klutz, Oblivious or Defeatist; Queen’s Gambit also checks Gorilla Tactics. They instead gain a 0.5× modifier against Adaptability, Synchronize, Anticipation or Telepathy; Queen’s Gambit also checks Opportunist. Both modifiers can apply if separate conditions coexist.',
			'Fake Out, Feint, Feint Attack, First Impression, Shadow Sneak, Smart Strike and Sucker Punch gain 1.5×. Stomping Tantrum and Tectonic Rage gain 1.3×. Stomping Tantrum, Outrage and Thrash gain one critical-hit stage.',
		],
		Abilities: ['Attacks against Reckless or Gorilla Tactics gain one critical-hit stage. These are checks on the target, not the attacker.'],
		'Seeds and other effects': ['Synthetic Seed raises Special Attack by one stage and applies Magic Coat.'],
		'Battle messages': ['Opening variation set', 'En Passant!'],
	},
	coldeclipseterrain: {
		Transitions: [
			'Lasts five turns when newly set, or eight if hail is already active. Hail beginning later adds three turns once. Harsh sunlight prevents formation and clears an existing Cold Eclipse; ordinary sunlight clears it after two consecutive end-of-turn checks.',
			'Two successful uses in total of Heat Wave, Eruption, Searing Shot, Searing Sunraze Smash, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate or Inferno Overdrive clear it. Uses during rain, heavy rain or Water Sport do not advance this heat counter.',
			'Successful Geomancy or Light of Ruin changes it into permanent Starlight Arena. Shared field locks can still prevent changes.',
			'Rain starts three-turn Water Sport. Ordinary rain and sandstorm become hail at turn end; heavy rain does not freeze.',
		],
		'Boosts and general effects': [
			'Ice, Ghost, Fire, Steel and Dragon types gain 1.5× Defense and Special Defense. Mind Freeze, Thick Fat, Sinister Blaze, Illusion, Ascendance, Duskilate and Armorize also qualify. Ice Scales separately doubles Defense.',
			'Grounded Pokémon have 0.75× Speed unless Ice or Dragon type, or protected by Limber, Slush Rush, Ice Body, Mind Freeze, Thick Fat, Illusion, Duskilate, Armorize, Web Assassin or Spiral Evolution.',
			'Ice typing in an attack gives 1.5× power; Dragon gives 2×; Rock or Fighting gives 0.5×. Fighting is neutral against Ice, while Ice is resisted by Dragon. Multi-type attacks retain their other matchup contributions.',
			'Fire attacks have 0.5× power, or 0.75× with Soul Fire, but Full Metal Body, Turboblaze and Atrocity instead give them 2×. Soul Fire also gives Ghost attacks 1.5×. These checks use ability or passive effects.',
			'Dragon types avoid hail damage. During hail, Ice types and holders of Mind Freeze, Ice Body, Thick Fat or Sinister Blaze heal 1/10 base maximum HP each turn.',
		],
		Moves: [
			'Rock, Steel, Ground and Water attacks add Ice typing, except Ground bone moves and Steel attacks used with Armorize. Freeze Shock and Ice Burn no longer need their charging turn.',
			'Trick Room, Wonder Room, Magic Room and Gravity fail and are removed when the field starts. Solar Beam and Solar Blade fail without sunlight.',
			'Wind-flagged moves, Razor Wind, Silver Wind, Ominous Wind, Chilling Water, Subzero Slammer, Night Slash and Rage gain 2× power. Being both wind-flagged and named does not double this bonus again.',
			'Bitter Malice, Blood Moon, Freezing Glare, Moongeist Beam, Fiery Wrath, Roar of Time, Freeze Shock, Ice Burn and Menacing Moonraze Maelstrom gain 1.5×. Hydro Steam, Scald, Steam Eruption and Light That Burns the Sky gain 0.5×.',
			'Rage becomes a 60-power physical Dark move that raises Attack by one stage. Chilling Water lowers Attack by two stages; Snarl lowers Special Attack by two. Blizzard, Bleakwind Storm, Icy Wind, Cold Snap and Dark Void bypass accuracy checks.',
		],
		Abilities: ['Relentless Hunt doubles move power and gives +1 priority to moves whose current base power is at most 80. Fortress Shell grants one Defense and Special Defense stage when first activated for this field on the current entry.'],
		'Seeds and other effects': ['Elemental Seed raises Speed by one stage and uses the local Soak effect on its holder; its final typing follows Soak’s Cold Eclipse rule.'],
		'Battle messages': ['The morning has arrived!', 'The hail deepened the Cold Eclipse!'],
	},
	crystalcavernterrain: {
		Transitions: [
			'Bulldoze, Earthquake, Fissure or Magnitude cracks the crystals; a second use from this group changes the field to Cave. Tectonic Rage changes it immediately. The breaking attack gains 1.3× power.',
			'Dark Pulse, Dark Void, Night Daze or Light That Burns the Sky changes it to Dark Crystal Cavern unless ordinary sunlight is active. If ordinary sunlight created this Crystal Cavern, its ending also restores Dark Crystal Cavern.',
		],
		'Boosts and general effects': ['Primary Rock and Dragon attacks gain 1.5× power. Damaging Rock attacks, Multi-Attack, Rock Climb, Strength and Prismatic Laser use Rock plus the current crystal element: Fire → Water → Grass → Psychic. The cycle advances during qualifying damage events, so multi-hit attacks can advance it more than once.'],
		Moves: [
			'Multi-Attack, Rock Climb, Strength and Prismatic Laser gain 1.5×. Ancient Power, Diamond Storm, Power Gem, Rock Smash and Rock Tomb gain another named 1.5× bonus.',
			'Aurora Beam, Doom Desire, Dazzling Gleam, Flash Cannon, Mirror Beam, Luster Purge, Mirror Shot, Moongeist Beam, Photon Geyser, Signal Beam and Techno Blast gain 1.3×.',
			'The listed Judgment crystal effect, Menacing Moonraze Maelstrom light bonus, and darkness-trigger power bonus currently contain mismatched checks and do not activate as their older notes imply. Their other ordinary effects remain.',
		],
		'Seeds and other effects': ['Magical Seed raises Special Attack by one stage and applies Magic Coat.'],
		'Battle messages': ['The crystals were broken up...', 'The crystals were shattered!'],
	},
	darkcrystalcavernterrain: {
		Transitions: [
			'Two uses in total of Bulldoze, Earthquake, Fissure, Magnitude or Tectonic Rage change the field to Cave. Unlike bright Crystal Cavern, Tectonic Rage is not an immediate one-use break here. The second breaking attack gains 1.3× power.',
			'Ordinary sunlight changes it to Crystal Cavern. When that sunlight ends, the sunlight-created Crystal Cavern returns here.',
		],
		'Boosts and general effects': ['Dark and Ghost types gain 1.5× Defense and Special Defense.'],
		Moves: [
			'Prismatic Laser gains 2× power; Light That Burns the Sky gains 0.5×.',
			'Ceaseless Edge, Black Hole Eclipse, Dark Pulse, Night Daze, Night Slash, Menacing Moonraze Maelstrom, Shadow Ball, Shadow Bone, Shadow Claw, Shadow Force, Shadow Punch, Shadow Sneak, Aurora Beam, Dazzling Gleam, Diamond Storm, Doom Desire, Flash Cannon, Luster Purge, Mirror Beam, Mirror Shot, Moongeist Beam, Photon Geyser, Power Gem, Signal Beam and Techno Blast gain 1.5×.',
		],
		'Seeds and other effects': ['Magical Seed raises Special Defense by one stage and applies Magic Coat.'],
		'Battle messages': ['The darkness is gathering...', 'The cavern brightened!'],
	},
	dragonsdenterrain: {
		Transitions: [
			'Surf or Muddy Water adds one cooling point; Sparkling Aria adds two. At three points, the lava solidifies into Cave. Draco Meteor and Dragon Energy damage events subtract one point; Devastating Drake subtracts two. Cooling can go below zero, and multi-hit damage events can repeat the subtraction.',
			'Glaciate, Hydro Vortex, Oceanic Operetta or Subzero Slammer changes it to Volcanic. Mist Ball changes it to Fairy Tale. If the cooling threshold is already met, the Cave change takes precedence.',
			'Hail is removed on formation. Ordinary field-setting effects cannot replace Dragon’s Den, but its specific field-changing moves can, subject to shared locks.',
		],
		'Boosts and general effects': [
			'Primary Dragon and Fire attacks gain 1.5× power, Rock attacks 1.3×, and Ice or Water attacks 0.5×. Dragon types gain 1.3× Defense. The corresponding Special Defense check uses a mismatched type name and currently does not grant its advertised bonus.',
			'Multiscale makes a super-effective matchup against the target’s Dragon typing neutral; the other defensive type still contributes.',
		],
		Moves: [
			'Smack Down, Thousand Arrows, Continental Crush, Tectonic Rage, Rock Climb and Earthquake add Fire typing. Strength becomes Rock/Fire.',
			'Smack Down, Thousand Arrows, Continental Crush, Tectonic Rage, Dragon Ascent, Pay Day, Luster Purge and Mist Ball gain 2× power.',
			'Magma Drift, Matrix Shot, Lava Plume, Magma Storm, Mega Kick, Make It Rain, Rock Climb, Strength, Diamond Storm, Power Gem, Shell Trap, Earth Power and Stomping Tantrum gain 1.5×.',
			'The instant transition moves and Mist Ball gain 1.3×; attacks that meet the cooling threshold can also gain this modifier. Type and named bonuses stack.',
		],
		'Seeds and other effects': ['Elemental Seed raises Special Attack by one stage and grants the Flash Fire power-up volatile.'],
		'Battle messages': ['The lava solidified!', 'If you wish to slay a dragon...'],
	},
	mirrorarenaterrain: {
		Transitions: ['Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct or Tectonic Rage shatters and clears the field. Active Pokémon take half base maximum HP unless semi-invulnerable, protected, using Wide Guard or Endure, or covered by Shell Armor or Battle Armor.'],
		'Boosts and general effects': [
			'Each positive accuracy or evasion stage on the attacker, and each negative accuracy or evasion stage on the target, adds a critical-hit stage.',
			'A missed physical contact move costs its user 1/4 base maximum HP and removes one positive evasion stage, unless protected or covered by Shell Armor or Battle Armor.',
		],
		Moves: [
			'Non-contact special moves bypass accuracy against a target with raised evasion when aimed normally at one target, or when the user has only one foe. Mirror Shot and the named reflected-light moves below bypass accuracy regardless of raised evasion.',
			'Against raised evasion, Charge Beam, Solar Beam, Psybeam, Tri Attack, Ice Beam, Hyper Beam, Bubble Beam, Origin Pulse, Fleur Cannon and Moongeist Beam gain 2× power. Mirror Shot always gains 2×.',
			'Aurora Beam, Dazzling Gleam, Flash Cannon, Doom Desire, Luster Purge, Photon Geyser, Prismatic Laser, Signal Beam, Techno Blast and Light That Burns the Sky gain 1.5× and bypass accuracy. Field-shattering attacks gain 1.3×.',
		],
		'Seeds and other effects': ['Synthetic Seed raises evasion by one stage and applies Magic Coat. Bright Powder or Lax Incense grants one evasion stage on entry. Wide Lens or Zoom Lens grants one accuracy stage and Laser Focus on entry.'],
	},
	murkwatersurfaceterrain: {
		Transitions: ['Whirlpool flushes the poison out, changing the field to Water Surface. Blizzard, Glaciate or Subzero Slammer freezes it into Icy Terrain; the frozen field remembers the underlying murkwater.'],
		'Boosts and general effects': [
			'Grounded non-Water types have 0.75× Speed unless covered by Surge Surfer, Swift Swim, Limber, Web Assassin or Spiral Evolution.',
			'Primary Water and Poison attacks gain 1.5× power. Electric attacks against grounded targets gain approximately 1.3×.',
			'Grounded Pokémon take Poison-effectiveness-scaled damage based on 1/8 base maximum HP each turn. Poison and Steel types, adaptive field protection, Immunity, Magic Guard, Poison Heal, Toxic Boost, Wonder Guard, Pastel Veil and Surge Surfer avoid it. Dry Skin, Flame Body, Magma Armor or Water Absorb doubles it; being underwater with Dive multiplies it by four.',
		],
		Moves: [
			'Water moves, Mud Bomb, Mud Shot, Mud Barrage and Thousand Waves become Water/Poison. Smack Down and Apple Acid add Poison; Sludge Wave adds Water.',
			'Damaging Ground moves fail unless they are Ground bone moves; Sand Attack also fails. The mud moves converted to Water are not stopped by this Ground-type check.',
			'Mud Bomb, Mud Shot, Mud Barrage, Thousand Waves, Acid, Acid Spray, Brine, Smack Down, Wave Crash and Apple Acid gain a named 1.5× power bonus. Whirlpool, Blizzard, Glaciate and Subzero Slammer gain approximately 1.3×.',
		],
		'Seeds and other effects': ['Elemental Seed raises Speed by one stage, applies Aqua Ring and attempts to badly poison its holder.'],
		'Battle messages': ['The water is tainted...', 'The maelstrom flushed out the poison!'],
	},
	midnightzoneterrain: {
		Transitions: [
			'Underwater becomes Midnight Zone after Dark Void, Black Hole Eclipse, Night Daze or Dark Pulse. Flash, Dazzling Gleam, Light That Burns the Sky, Bounce or Fly returns Midnight Zone to Underwater.',
			'Other full-field changes are blocked. Existing weather is cleared on formation; Sunny Day, Rain Dance, Sandstorm, Hail, Snowscape and Chilly Reception fail here.',
		],
		'Boosts and general effects': [
			'Non-Water types have 0.25× Speed unless covered by Steelworker, Schooling, Swift Swim or Limber. Their physical attacks also have 0.33× power unless covered by Steelworker, Schooling or Swift Swim; Limber does not exempt that damage penalty.',
			'Water, Ice and Dark attacks gain 1.5× power; Electric attacks gain 1.2×. Ground attacks converted to Water gain an additional 1.2× trench bonus; Ground bone attacks keep their Ground typing and also receive that bonus.',
			'Water and Ghost types avoid pressure damage, as do Water Veil, Dry Skin, Storm Drain, Steelworker, Schooling and Magic Guard. Otherwise pressure removes 1/10 base maximum HP per turn, or 1/4 for Steel, Ice, Fire or Rock types. Surviving Water types heal 1/16; Water Absorb or Dry Skin separately heals 1/10.',
		],
		Moves: [
			'Fire moves fail. Spikes, Stealth Rock, Sticky Web, Toxic Spikes, Stone Axe, Ceaseless Edge, Defog and Tar Shot also fail.',
			'Damaging Ground moves become Water except Ground bone moves. Dragon Darts and Grav Apple also become Water. Damaging Dark moves gain a 30% Special Attack drop secondary; special Dark attacks retain Dark STAB and field power but use Water defensive matchups. Serene Grace can modify the added secondary.',
			'Water Pulse gains a named 1.5× bonus. Anchor Shot and Dragon Darts gain 2×. Dark Pulse, Night Daze, Night Slash, Shadow Ball, Shadow Force, Shadow Claw, Shadow Punch and Shadow Bone gain 1.2×.',
			'Signal Beam, Doom Desire, Flash Cannon, Luster Purge, Dazzling Gleam, Mirror Shot, Techno Blast, Power Gem, Moongeist Beam and Menacing Moonraze Maelstrom have 0.5× power.',
		],
		Abilities: ['Illuminate bypasses accuracy checks for its user. Pressure protection and Speed exemptions are separate: having one does not imply the other.'],
		'Seeds and other effects': ['Elemental Seed raises Special Attack by one stage and applies Aqua Ring.'],
		'Battle messages': ['The water pressure is crushing...', 'The darkness dissipates!'],
	},
	snowymountainterrain: {
		Transitions: [
			'Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Inferno Overdrive or a Fire-type Max move melts it into Mountain. Infernal Rage does so only when its own field-clearing condition succeeded.',
			'The ordinary sunlight counter currently requests Snowy Mountain again instead of Mountain, so it does not melt the field as older notes may suggest.',
		],
		'Boosts and general effects': ['Primary Rock, Ice and Flying attacks gain 1.5× power; Fire attacks have 0.5×. Rock attacks add Ice typing.'],
		Moves: [
			'Vital Throw, Circle Throw, Storm Throw, Ominous Wind, Silver Wind, Twister, Razor Wind, Fairy Wind, Avalanche, Powder Snow, Hyper Voice, Glaciate and Bitter Malice gain 1.5×. Icy Wind gains 2×. Scald, Steam Eruption and Hydro Steam have 0.5× power.',
			'Strong Winds globally boosts Ominous Wind, Icy Wind, Silver Wind, Twister, Razor Wind, Fairy Wind, Gust, Heavenly Wing and Airstream Assault by 1.5×, and special Flying attacks independently by 1.5×. On this field only, Bleakwind Storm, Sandsear Storm and Wildbolt Storm gain another 1.5× during Strong Winds. Named and type modifiers stack.',
			'The listed melting attacks gain 1.3× before the field changes.',
		],
		'Seeds and other effects': ['Telluric Seed raises Special Attack by two stages and lowers accuracy by one.'],
		'Battle messages': ['The snow melted away!', 'The snow glows white on the mountain...'],
	},
	starlightarenaterrain: {
		Transitions: ['Gravity, Geomancy or Light of Ruin changes New World into Starlight Arena. Successful Geomancy or Light of Ruin changes Cold Eclipse into permanent Starlight Arena. This field’s own handler has no move-triggered exit.'],
		'Boosts and general effects': ['With no weather present, primary Dark and Psychic attacks gain 1.5× power and Fairy attacks 1.3×; Nostra’s Wish instead gets a 2× Fairy modifier. Dark moves add Fairy typing even when weather disables the power bonuses.'],
		Moves: [
			'With no weather: Doom Desire gains 4× power. Aurora Beam, Signal Beam, Flash Cannon, Luster Purge, Dazzling Gleam, Mirror Shot, Techno Blast, Solar Beam, Photon Geyser, Moonblast, Meteor Beam and Mirror Beam gain 1.5×.',
			'With no weather: Draco Meteor, Meteor Mash, Comet Punch, Spacial Rend, Swift, Hyperspace Hole, Hyperspace Fury, Moongeist Beam, Sunsteel Strike, Black Hole Eclipse, Searing Sunraze Smash and Menacing Moonraze Maelstrom gain 2×.',
			'Meteor Assault’s recharge is removed after use, including when weather is present.',
		],
		Abilities: ['Fortress Shell grants one Defense and Special Defense stage when first activated for this field on the current entry.'],
		'Seeds and other effects': ['Magical Seed raises Special Attack by one stage and uses Wish on its holder.'],
		'Battle messages': ['Starlight fills the battlefield.', 'A star came crashing down!'],
	},
	newworldterrain: {
		Transitions: ['Gravity, Geomancy or Light of Ruin changes the field to Starlight Arena. Existing weather is cleared when New World starts. Ordinary field-setting effects cannot replace it; specific field-changing effects remain subject to shared restrictions.'],
		'Boosts and general effects': ['Grounded Pokémon have 0.75× Speed unless covered by Limber, Web Assassin or Spiral Evolution. Airborne Pokémon normally have 0.9× Defense and Special Defense. Dark attacks gain 1.5× power.'],
		Moves: [
			'Doom Desire and Nostra’s Wish gain 4× power. Vacuum Wave, Draco Meteor, Meteor Mash, Moonblast, Comet Punch, Swift, Meteor Beam, Hyperspace Hole, Spacial Rend, Hyperspace Fury, Ancient Power and Black Hole Eclipse gain 2×. Bulldoze, Earthquake and Magnitude have 0.25× power.',
			'Radiant Assault and the field’s named signature/light attacks gain 1.5× power. The full named list is included separately below; it is not a blanket bonus to every signature move.',
		],
		Abilities: ['Fortress Shell grants one Defense and Special Defense stage when first activated for this field on the current entry.'],
		'Seeds and other effects': ['Magical Seed raises Attack, Defense, Special Attack, Special Defense and Speed by one stage, then applies recharge.'],
		'Battle messages': ['The world’s matter reformed!', 'The ethereal energy strengthened the attack!'],
	},
	superheatedterrain: {
		Transitions: [
			'Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Self-Destruct or Inferno Overdrive changes it to Burning unless Water Sport is active. Infernal Rage requires its own successful field-clearing condition. Fire-type Max moves also change it and bypass that Water Sport check.',
			'The intended rain blocker uses a mismatched weather name here, so ordinary rain does not currently block this transition. Blizzard, Glaciate or Subzero Slammer clears the field. Hail and snow are removed at turn end.',
		],
		'Boosts and general effects': ['Fire attacks gain 1.1× power; Ice attacks have 0.5×. Most Water attacks have 0.9×, with the specific steam exceptions below.'],
		Moves: [
			'Scald and Steam Eruption gain 1.5×. Muddy Water, Sparkling Aria, Surf, Water Pledge, Water Spout, Hydro Vortex and Oceanic Operetta have 0.5625× power instead of the ordinary Water penalty.',
			'Those steam moves and Water Sport attempt to lower every active Pokémon’s accuracy by one stage, except during semi-invulnerable turns; normal stat-drop protections still apply.',
			'The listed ignition and cooling attacks gain 1.3× power, stacking with applicable type modifiers.',
		],
		'Seeds and other effects': ['Telluric Seed raises Defense by one stage and applies Shell Trap.'],
		'Battle messages': ['Steam shot up from the field!', 'The field cooled off!'],
	},
	volcanicterrain: {
		Transitions: [
			'Two uses in total of Sand Tomb, Scorching Sands, Sandsear Storm, Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Muddy Water, Sparkling Aria, Water Sport, Surf, Water Pledge, Sludge Wave or G-Max Wind Rage change it to Cave. Continental Crush, Supersonic Skystrike, Hydro Vortex or Acid Downpour does so immediately.',
			'Two uses in total of Dragon Pulse or Dragon Energy change it to Dragon’s Den. Devastating Drake, Draco Meteor or Core Enforcer does so immediately. The Dragon and Cave counters are separate.',
			'Ordinary rain or sandstorm changes it to Cave during the residual phase. Hail is removed on formation, weather change and during residual checks.',
		],
		'Boosts and general effects': [
			'Grounded users’ Fire attacks gain 1.5× power. Grass attacks against grounded targets have 0.5×; Ice attacks have 0.5× regardless of grounding. Water attacks have 0.75×. Rock attacks add Fire typing. Freeze/frostbite status is blocked.',
			'Grounded Pokémon take Fire-effectiveness-scaled damage based on 1/8 base maximum HP each turn. Fire types, Aqua Ring, Flame Body, Flare Boost, Flash Fire, Heatproof, Magma Armor, Water Bubble, Water Veil and Well-Baked Body avoid this field damage. Leaf Guard, Fluffy, Grass Pelt, Ice Body or Tar Shot doubles it; ordinary damage-prevention effects can still apply.',
		],
		Moves: [
			'Clear Smog and Smog gain 2× power and add Fire typing. Smack Down, Thousand Arrows and Rock Slide gain 1.5× and add Fire. Infernal Parade and Ethereal Tempest gain 1.5×.',
			'The Cave-changing Z-Moves gain 1.3×, as do the ordinary Cave-changing moves once that counter is already primed. Dragon Pulse and Dragon Energy gain 1.3×; the immediate Dragon-changing moves gain that modifier when the Dragon counter is primed.',
			'The Burn Up residual handler restores a typeless slot to Fire after using Burn Up.',
		],
		Abilities: ['Blazing Mane grants one Speed stage when the field starts and when its holder enters.'],
		'Seeds and other effects': ['Elemental Seed raises Attack, Special Attack and Speed by one stage, then uses Fire Spin on its holder.'],
		'Battle messages': ['Draconic energy seeps in...', 'The draconic energy mutated the field'],
	},
	wastelandterrain: {
		Transitions: ['When set through its duration callback, Wasteland lasts five turns from an ability or three from another effect; Amplifield Rock adds three. Its own handler has no move-triggered exit. Format-defined permanent fields follow their format setup.'],
		'Boosts and general effects': ['Recorded hazards erupt during residual processing rather than behaving only as ordinary entry hazards. Grounded targets outside a semi-invulnerable turn take 1/3 base maximum HP from Spikes. Toxic Spikes attempts poison and deals 1/8 to grounded non-Poison/non-Steel targets. Sticky Web attempts a four-stage Speed drop even against airborne targets. Stealth Rock deals Rock-effectiveness-scaled damage based on 1/4 maximum HP, including to airborne targets. Semi-invulnerable targets avoid these eruptions; normal protections still apply.'],
		Moves: [
			'Mud Bomb, Mud Shot and Mud Barrage add Poison typing. These moves, Power Whip and Vine Whip gain 1.5× power. Gunk Shot, Octazooka, Sludge, Sludge Bomb and Sludge Wave gain 1.2×. Bulldoze, Earthquake and Magnitude have 0.25×. Spit Up gains 2×.',
			'The field’s status guard prevents the listed sludge/Octazooka/Acid Downpour effects and Corrosion users from applying status to Poison or Steel types or holders of Immunity, Toxic Boost or Poison Heal. It does not grant a general ability to poison those targets.',
		],
		'Seeds and other effects': ['Telluric Seed raises Attack and Special Attack by one stage and adds Stealth Rock to every side.'],
		'Battle messages': ['...Stalagmites burst up from the ground!', '...Poison needles shot up from the ground!'],
	},
};
