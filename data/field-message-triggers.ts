/** Manually checked against the current field callbacks; flavor is not mechanical evidence. */
export const FieldMessageTriggers: Record<string, string[]> = {
	"hauntedterrain": [
		"“Evil spirits gathered!” — Haunted Field starts. This announces the field; the message itself adds no extra effect.",
		"“The evil aura powered up the attack!” — the field evaluates a primary Ghost attack for its 1.5× power modifier. Adaptive field rules can change the applied modifier.",
		"“Will-o'-wisps joined the attack...” — Fire Spin, Flame Burst, Flame Charge or Inferno receives its named 1.5× field modifier. Their added Ghost typing is handled separately.",
		"“Boo!” — Astonish, Bone Club, Bone Rush or Bonemerang receives its named 1.5× modifier.",
		"“Spooky scary skeletons!” — Shadow Bone receives its separate 1.2× modifier, in addition to applicable type bonuses.",
		"“The evil spirits have been exorcised!” — after Origin Pulse, Purify, Sacred Fire, Dazzling Gleam or Flash, the handler requests Holy Field. The message is emitted even if a field lock prevents the change. The misspelled Judgment check does not trigger it.",
		"“[Pokémon]’s dream is corrupted by the evil spirits!” — at turn end, a sleeping non-Ghost Pokémon has 1/16 base max HP damage attempted. Damage immunity can prevent the loss without suppressing this message.",
	],
	"icyterrain": [
		"“The field is covered in ice.” — Icy Field starts; this announces the field rather than adding another effect.",
		"“The cold strengthened the attack!” — a primary Ice attack receives its 1.5× modifier; Bitter Malice also receives a separate named 1.5× modifier and can print the same message again. Adaptive field rules apply.",
		"“The cold softened the attack...” — a primary Fire attack, or Scald, Steam Eruption or Hydro Steam, receives a 0.5× modifier. The hot-water moves gain an additional 1.3× modifier if the stored hot-water count is exactly one.",
		"“The cold air crystallized the missile” — Snipe Shot receives its named 1.2× modifier. Its added Ice typing is handled separately.",
		"“The freezing air boosted the attack!” — Chilling Water receives its named 2× modifier.",
		"“[Pokémon] gained momentum on the ice!” — after a grounded user uses Defense Curl, Feint, Ice Ball, Ice Spinner, Lunge, Rollout, Steamroller, or a physical contact move with positive priority, the surviving user successfully gains Speed. Contrary instead lowers Speed and prints “lost momentum”. The source’s misspelled Spin Out check does not match Spin Out.",
		"“The Anchor broke past the Ice!” — after Anchor Shot, the handler requests restoration of the underlying field, or Water Surface if none exists.",
		"“The quake broke up the ice and revealed…” — after Bulldoze, Earthquake, Fissure, Magnitude or Tectonic Rage with an underlying field, restoration is requested. Without an underlying field, each side instead receives Spikes and this message is not printed.",
		"“The ice melted away!” — after Burning Jealousy, Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Inferno Overdrive, Lava Plume, Magma Drift, Mind Blown, Raging Fury, Searing Shot or a Fire Max move, restoration is requested, falling back to Cave. Magma Drift respects its transition block; Infernal Rage uses this path only when its own field-clearing flag was set.",
		"“The hot water melted the ice!” — the second accumulated Scald, Steam Eruption or Hydro Steam use requests restoration, falling back to Water Surface.",
		"“The hot tea melted the ice!” — after Matcha Gotcha, a surviving user is offered 30% max HP healing and restoration is requested, falling back to Water Surface.",
		"“[Pokémon] made a hole in the ice!” — Dive’s charging turn; the field stays. “The ice was broken from underneath!” — Dive’s attacking turn requests restoration, falling back to Water Surface.",
		"Restoration messages describe a request, not proof that a field lock allowed the change. A stacked field is uncovered first; restoring underlying Misty also attempts Spikes on both sides. Messages do not create additional damage or stat changes beyond the handlers described above.",
	],
};

Object.assign(FieldMessageTriggers, {
	"bewitchedwoodsterrain": [
		"“Mystical aura amplified the attack!” — Hex, Mystical Fire or Spirit Break is evaluated for its named 1.5x power modifier. This is separate from type bonuses; Adaptive Cycle can alter the applied field multiplier.",
	],
	"bigtopterrain": [
		"“Back, foul beast!” — Fire Lash, Vine Whip or Power Whip is attempted. “What grace!” — Fiery Dance, Petal Dance or Revelation Dance is attempted. “An extravagant aerial finish!” — Acrobatics or Fly is attempted. Their named field power bonus is 1.5x.",
		"“Loud and Clear!” — a sound-flagged move or Drum Beating is attempted; the separate power callback gives damaging qualifying moves 1.5x power. Attempt messages do not prove the move hit.",
		"“Weak!”, “Ok!”, “Nice!”, “Powerful!” and “OVER 9000!” report the Striker roll on eligible physical Fighting attacks (except Seismic Toss/Counter) or the field’s listed striking moves. They correspond to damage multipliers 0.5x, 1x, 1.5x, 2x and 3x respectively; the Striker rules determine the roll.",
	],
	"caveterrain": [
		"“Bits of rock fell from the crumbling ceiling!” — the first accumulated Bulldoze, Earthquake, Fissure, Magnitude, Tectonic Rage or Continental Crush use arms the collapse counter. “The quake collapsed the ceiling!” — the next qualifying use resets that counter and applies collapse damage to exposed active Pokémon. Semi-invulnerability, protection, Wide Guard, Mat Block, Rock Head, Bulletproof and Stalwart protect; Prism Armor/Solid Rock reduce it to one third max HP, Battle Armor/Shell Armor to half, and full-HP Sturdy/Endure preserves one HP.",
		"“The cave was littered with crystals!” — Power Gem or Diamond Storm requests Crystal Cavern. “The cave froze over!” — Blizzard or Subzero Slammer requests Icy Field.",
		"“The cave combusted!” — Blast Burn, Eruption, Inferno Overdrive, Mind Blown, Searing Shot or Burn Up immediately requests Volcanic Summit, with the explosion branch first attempting half-max-HP damage against unprotected/nonimmune active Pokémon. Fire Max moves request the transition without that explosion damage. Two accumulated uses of Magma Drift, Fever Pitch, Heat Wave, Lava Plume, Overheat, Incinerate, Inferno, Flame Burst, Fire Pledge or Sacred Fire also trigger it; the first prints the supercritical-temperature warning. Magma Drift retains its transition block. The misspelled Fusion Flare check does not match the real move.",
	],
	"chessboardterrain": [
		"“En Passant!” — Fake Out, Feint, Feint Attack, First Impression, Shadow Sneak, Smart Strike or Sucker Punch receives the named 1.5x field modifier. Adaptive Cycle can alter the applied modifier.",
	],
	"coldeclipseterrain": [
  '“The frozen reality cannot be changed!” — a new Room or Gravity use fails; existing timers remain paused.',
  '“The frozen dimension thawed into a Rift Eclipse!” — a successful listed heating move transforms Cold Eclipse, subject to field locks.',
  '“The eclipse was purified, leaving a permanent natural field!” — successful Purify leaves untimed Icy Field; normal Cave transitions still apply.',
 ],
	"corrosivemistterrain": [
		"“The toxic mist combusted!” — after Eruption, Explosion, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Self-Destruct, Inferno Overdrive or a Fire Max move, if no active Damp holder prevents it. Infernal Rage additionally requires its own successful field-clearing flag. Exposed active Pokémon receive explosion damage, then the field clears; Flash Fire, Well-Baked Body, semi-invulnerability, protection and Wide Guard are checked, with Sturdy/Endure handled separately.",
	],
	"corrosiveterrain": [
		"“The polluted field was purified!” — after Purify or Seed Flare, the handler requests Grassy Field. This message precedes the transition request and does not guarantee that a field lock permits it.",
	],
	"crystalcavernterrain": [
		"“The crystals were broken up...” — the first accumulated Bulldoze, Earthquake, Fissure or Magnitude use records breakage. “The crystals were shattered!” — the second qualifying use, or Tectonic Rage immediately, requests Cave.",
	],
	"darkcrystalcavernterrain": [
		"“The cavern brightened!” — a weather-change callback sees ordinary Sunny Day and requests Crystal Cavern. Harsh sun is not this exact check.",
	],
	"desertterrain": [
		"“The intense desert heat blunted the attack!” — a grounded user’s primary Water move, excluding Scald, Steam Eruption and Hydro Steam, receives 0.5x power.",
		"“The floating sand particles partially grounded the attack!” — a primary Electric attack against a grounded target receives 0.5x power.",
		"“The harsh desert heat augmented the attack!” — Burn Up, Dig, Needle Arm, Heat Wave, Pin Missile, Sand Tomb, Sandsear Storm, Scald, Scorching Sands, Searing Sunraze Smash, Solar Beam, Solar Blade, Steam Eruption, Thousand Waves or Hydro Steam receives its named 1.5x modifier.",
		"“The lifeless desert strengthened the attack!” — Bonemerang, Bone Club, Bone Rush or Shadow Bone receives its named 1.5x modifier. Adaptive Cycle rules apply to these field modifiers.",
	],
	"dragonsdenterrain": [
		"“The lava solidified!” — cooling progress reaches three: Surf or Muddy Water adds one, Sparkling Aria adds two. The handler then requests Cave. The separately documented immediate cooling moves use their own transition branches.",
	],
	"glitchterrain": [
		"“ERROR! MOVE NOT FOUND!” — Roar or Whirlwind is prevented before execution.",
		"“Ghosts forgot how to beat Psychics!” — a primary Ghost move attempts to hit a Psychic target and is blocked; the matching immunity callback can also emit the message.",
	],
	"holyterrain": [
		"“Godspeed!” — Extreme Speed receives its named 1.5x modifier.",
		"“The holy energy resonated with the attack!” — a special Fairy/Normal move receives 1.5x power, or Mystical Fire, Magical Leaf, Ancient Power, Judgment, Dei Ludicium, Sacred Fire, Sacred Sword or Return receives its separate named 1.5x modifier. Both applicable branches can print.",
		"“The attack was cleansed...” — a primary Ghost attack or special Dark attack receives 0.5x power. Adaptive Cycle rules apply.",
	],
	"mountainterrain": [
		"“The whole mountain is moving!” — Mountain Gale is evaluated for its named 1.3x bonus. “Yodelayheehoo~” — Hyper Voice is evaluated for its named 1.5x bonus.",
		"“The mountain was covered in snow!” — after Blizzard, Glaciate or Subzero Slammer, or when the hail counter reaches two, the field requests Snowy Mountain. The first hail residual initializes the counter to zero, so uninterrupted hail from a fresh field reaches that threshold on its third check.",
	],
	"murkwatersurfaceterrain": [
		"“The maelstrom flushed out the poison!” — after Whirlpool, the handler requests Water Surface. This transition callback is separate from damage success.",
	],
	"newworldterrain": [
		"“The world’s matter reformed!” — after Gravity, Geomancy or Light of Ruin, the handler requests Starlight Arena.",
		"“The ethereal energy strengthened the attack!” — one of the explicitly named 1.5x moves in this page’s move-power list is evaluated. This is not a bonus for all signature moves; the exact listed move must match. Adaptive Cycle rules apply.",
	],
	"rainbowterrain": [
		"“The bright light pierced through the technicolor madness!” — after Light That Burns the Sky, Rainbow is cleared.",
		"“The violent weather tore the field apart!” — the residual callback finds hail or sandstorm and clears Rainbow. Snow is not included in this check.",
	],
	"snowymountainterrain": [
		"“The snow melted away!” — after Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Inferno Overdrive or a Fire Max move, the handler requests Mountain. Infernal Rage uses this path only with its successful field-clearing flag.",
	],
	"starlightarenaterrain": [
		"“A star came crashing down!” — Doom Desire receives its named 4x power modifier while the field’s weather gate permits starlight bonuses. Adaptive Cycle rules apply.",
	],
	"superheatedterrain": [
		"“Steam shot up from the field!” — Muddy Water, Sparkling Aria, Surf, Water Pledge, Water Spout, Hydro Vortex or Oceanic Operetta receives a 0.5625x named modifier. After use, those moves and Water Sport also attempt one Accuracy drop on each non-semi-invulnerable active Pokémon.",
		"“The field cooled off!” — the power callback applies a 1.3x modifier to Blizzard, Glaciate or Subzero Slammer; their after-use callback clears the field. The current text-selection branch also prints this phrase for Fire Max moves even though their separate after-use effect changes the field to Burning. The message alone is not proof of cooling.",
	],
	"midnightzoneterrain": [
		"“The water pressure is crushing...” — Midnight Zone starts; this announces the field, not a separate damage event.",
		"“The darkness dissipates!” — after Flash, Dazzling Gleam, Light That Burns the Sky, Bounce or Fly, a change to Underwater succeeds. Unlike many transition messages, this one is conditioned on the successful change.",
	],
	"volcanicterrain": [
		"“Draconic energy seeps in...” — the first Dragon Pulse or Dragon Energy use records progress toward Dragon Den.",
		"“The draconic energy mutated the field” — a second Dragon Pulse/Dragon Energy, or Devastating Drake, Draco Meteor or Core Enforcer immediately, requests Dragon Den.",
	],
	"wastelandterrain": [
		"“...Stalagmites burst up from the ground!” — the residual callback finds swallowed Spikes recorded for this Pokémon’s side. A grounded, non-semi-invulnerable Pokémon then receives one-third-max-HP damage; the message can appear even if that eligibility check prevents damage.",
		"“...Poison needles shot up from the ground!” — swallowed Toxic Spikes are recorded for its side. A grounded, non-semi-invulnerable, non-Poison/non-Steel Pokémon then faces poison plus one-eighth-max-HP damage. The message is printed before these eligibility checks.",
	],
	"flowergarden1": [
		"“The garden grew a little!” — a successful garden-stage increase after Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom, or an eligible growth-triggering entry ability. Ripen raises growth by two stages through stage 3; growth stops at stage 5. The message is printed only if the stage change succeeds.",
		"“The garden caught fire!” — at stage 3 or higher, a successful qualifying Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive use changes the garden to Burning. Rain, heavy rain and active Water Sport prevent this ignition. The message requires the transition to succeed.",
	],
	"flowergarden2": [
		"“The garden grew a little!” — a successful garden-stage increase after Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom, or an eligible growth-triggering entry ability. Ripen raises growth by two stages through stage 3; growth stops at stage 5. The message is printed only if the stage change succeeds.",
		"“The garden caught fire!” — at stage 3 or higher, a successful qualifying Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive use changes the garden to Burning. Rain, heavy rain and active Water Sport prevent this ignition. The message requires the transition to succeed.",
	],
	"flowergarden3": [
		"“The garden grew a little!” — a successful garden-stage increase after Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom, or an eligible growth-triggering entry ability. Ripen raises growth by two stages through stage 3; growth stops at stage 5. The message is printed only if the stage change succeeds.",
		"“The garden caught fire!” — at stage 3 or higher, a successful qualifying Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive use changes the garden to Burning. Rain, heavy rain and active Water Sport prevent this ignition. The message requires the transition to succeed.",
	],
	"flowergarden4": [
		"“The garden grew a little!” — a successful garden-stage increase after Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom, or an eligible growth-triggering entry ability. Ripen raises growth by two stages through stage 3; growth stops at stage 5. The message is printed only if the stage change succeeds.",
		"“The garden caught fire!” — at stage 3 or higher, a successful qualifying Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive use changes the garden to Burning. Rain, heavy rain and active Water Sport prevent this ignition. The message requires the transition to succeed.",
	],
	"flowergarden5": [
		"“The garden grew a little!” — a successful garden-stage increase after Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport or Bloom Doom, or an eligible growth-triggering entry ability. Ripen raises growth by two stages through stage 3; growth stops at stage 5. The message is printed only if the stage change succeeds.",
		"“The garden caught fire!” — at stage 3 or higher, a successful qualifying Heat Wave, Eruption, Searing Shot, Flame Burst, Lava Plume, Fire Pledge, Mind Blown, Incinerate, Burning Jealousy or Inferno Overdrive use changes the garden to Burning. Rain, heavy rain and active Water Sport prevent this ignition. The message requires the transition to succeed.",
	],
});
