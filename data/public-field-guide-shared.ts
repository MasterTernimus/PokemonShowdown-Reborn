/** Explicitly reviewed shared mappings. Keep separate from the reference-only index. */
export const FieldMoveMappings: { [id: string]: { camouflage: string, mimicry: string, pulse: string, nature: string } } = {};
const mappings = [
	['ashenbeach', 'Ground', 'Meditate'], ['bewitchedwoods', 'Fairy', 'Alluring Voice'],
	['bigtop', 'Fighting', 'Acrobatics'], ['burning', 'Fire', 'Flamethrower'], ['cave', 'Rock', 'Rock Tomb'],
	['chessboard', 'Psychic', 'Ancient Power'], ['coldeclipse', 'Ice', 'Ice Beam'], ['rifteclipse', 'Dark', 'Dark Pulse'], ['infernaleclipse', 'Fire', 'Infernal Parade'],
	['corrosivemist', 'Poison', 'Venoshock'], ['corrosive', 'Poison', 'Acid'],
	['darkcrystalcavern', 'Dark', 'Dark Pulse'], ['desert', 'Ground', 'Sand Tomb'],
	['dragonsden', 'Dragon', 'Dragon Pulse'], ['electric', 'Electric', 'Thunderbolt'],
	['factory', 'Steel', 'Gear Grind'], ['fairytale', 'Fairy', 'Secret Sword'], ['forest', 'Bug', 'Wood Hammer'],
	['glitch', '???', 'Metronome'], ['grassy', 'Grass', 'Energy Ball'], ['haunted', 'Ghost', 'Phantom Force'],
	['holy', 'Normal', 'Judgment'], ['icy', 'Ice', 'Ice Beam'], ['inverse', 'Normal', 'Trick Room'],
	['mirrorarena', 'Steel', 'Mirror Shot'], ['misty', 'Fairy', 'Mist Ball'], ['mountain', 'Rock', 'Rock Slide'],
	['murkwatersurface', 'Poison', 'Sludge Wave'], ['psychic', 'Psychic', 'Psychic'],
	['rainbow', 'Dragon', 'Aurora Beam'], ['rocky', 'Rock', 'Rock Smash'], ['shortcircuit', 'Electric', 'Discharge'],
	['snowymountain', 'Ice', 'Avalanche'], ['starlightarena', 'Dark', 'Moonblast'],
	['superheated', 'Fire', 'Heat Wave'], ['swamp', 'Water', 'Muddy Water'], ['underwater', 'Water', 'Water Pulse'],
	['midnightzone', 'Water', 'Anchor Shot'], ['volcanic', 'Fire', 'Flamethrower'],
	['wasteland', 'Poison', 'Gunk Shot'], ['watersurface', 'Water', 'Whirlpool'], ['snowy', 'Ice', 'Powder Snow'],
];
for (const [id, type, nature] of mappings) FieldMoveMappings[id + 'terrain'] = { camouflage: type, mimicry: type, pulse: type, nature };
FieldMoveMappings.forestterrain.mimicry = 'Grass';
FieldMoveMappings.mirrorarenaterrain.pulse = 'Ice';
FieldMoveMappings.midnightzoneterrain.pulse = 'Normal';
for (let stage = 1; stage <= 5; stage++) FieldMoveMappings[`flowergarden${stage}`] = {
	camouflage: 'Normal', mimicry: 'Grass', pulse: 'Normal', nature: stage === 1 ? 'Growth' : stage === 5 ? 'Petal Blizzard' : 'Tri Attack',
};

export const FieldSeedNotes: { [id: string]: string } = {
	electricterrain: 'Elemental Seed raises Speed by one stage and applies Charge.',
	grassyterrain: 'Elemental Seed raises Defense by one stage and applies Ingrain.',
	mistyterrain: 'Elemental Seed raises Special Defense by one stage and uses Wish on its holder.',
	burningterrain: 'Elemental Seed raises Attack, Special Attack and Speed by one stage and uses Fire Spin on its holder. Telluric Seed is also consumed here, but its use handler has no Burning effect.',
	corrosivemistterrain: 'Elemental Seed raises Attack and Special Attack by one stage and attempts to badly poison its holder.',
	watersurfaceterrain: 'Elemental Seed raises Special Defense by one stage and applies Aqua Ring.',
	underwaterterrain: 'Elemental Seed raises Speed by one stage and uses Soak on its holder, normally changing it to Water.',
	midnightzoneterrain: 'Elemental Seed raises Special Attack by one stage and applies Aqua Ring.',
	murkwatersurfaceterrain: 'Elemental Seed raises Speed by one stage, applies Aqua Ring and attempts to badly poison its holder.',
	icyterrain: 'Elemental Seed raises Speed by two stages and invokes the field’s icy-spikes damage on its holder.',
	dragonsdenterrain: 'Elemental Seed raises Special Attack by one stage and grants the Flash Fire power-up volatile.',
	coldeclipseterrain: 'Elemental Seed raises Speed by one stage and uses Soak on its holder; Soak changes its target to Ice on Cold Eclipse.',
	volcanicterrain: 'Elemental Seed raises Attack, Special Attack and Speed by one stage and uses Fire Spin on its holder.',
	psychicterrain: 'Magical Seed raises Special Attack by two stages and attempts to confuse its holder.',
	rainbowterrain: 'Magical Seed raises Special Attack by one stage and uses Wish on its holder.',
	fairytaleterrain: 'Magical Seed applies King’s Shield and its consecutive-protection counter.',
	darkcrystalcavernterrain: 'Magical Seed raises Special Defense by one stage and applies Magic Coat.',
	crystalcavernterrain: 'Magical Seed raises Special Attack by one stage and applies Magic Coat.',
	holyterrain: 'Magical Seed raises Special Attack by one stage and applies Magic Coat.',
	newworldterrain: 'Magical Seed raises Attack, Defense, Special Attack, Special Defense and Speed by one stage, then applies recharge.',
	inverseterrain: 'Magical Seed raises Attack, Defense, Special Attack, Special Defense and Speed by one stage, then applies recharge.',
	starlightarenaterrain: 'Magical Seed raises Special Attack by one stage and uses Wish on its holder.',
	hauntedterrain: 'Magical Seed raises Defense and Special Defense by one stage and attempts to burn its holder.',
	bewitchedwoodsterrain: 'Magical Seed raises Special Defense by one stage and applies Ingrain.',
	glitchterrain: 'Synthetic Seed raises Defense by one stage and makes the holder typeless.',
	shortcircuitterrain: 'Synthetic Seed raises Special Defense by one stage and applies Magnet Rise.',
	factoryterrain: 'Synthetic Seed raises Special Attack by one stage and applies Laser Focus.',
	mirrorarenaterrain: 'Synthetic Seed raises evasion by one stage and applies Magic Coat.',
	chessboardterrain: 'Synthetic Seed raises Special Attack by one stage and applies Magic Coat.',
	bigtopterrain: 'Synthetic Seed raises Attack by one stage and applies Helping Hand.',
	flowergarden1: 'Synthetic Seed raises Special Defense by one stage, applies Ingrain and grows the garden by one stage. Its automatic activation list includes stage 1 only.',
	corrosiveterrain: 'Telluric Seed applies Baneful Bunker.',
	swampterrain: 'Telluric Seed raises Defense by one stage and replaces an eligible active ability with Clear Body. Its explicit protected-ability list and ordinary ability-changing restrictions still apply; it does not replace species passives.',
	rockyterrain: 'Telluric Seed raises Defense by one stage and deals Rock-effectiveness-scaled damage based on 1/4 maximum HP to its holder.',
	desertterrain: 'Telluric Seed raises Defense, Special Defense and Speed by one stage and uses Sand Tomb on its holder.',
	forestterrain: 'Telluric Seed applies Spiky Shield.',
	ashenbeachterrain: 'Telluric Seed applies Focus Energy.',
	wastelandterrain: 'Telluric Seed raises Attack and Special Attack by one stage and adds Stealth Rock to every side.',
	caveterrain: 'Telluric Seed raises Defense by two stages and deals Rock-effectiveness-scaled damage based on 1/4 maximum HP to its holder.',
	superheatedterrain: 'Telluric Seed raises Defense by one stage and applies Shell Trap.',
	mountainterrain: 'Telluric Seed raises Attack by two stages and lowers accuracy by one.',
	snowymountainterrain: 'Telluric Seed raises Special Attack by two stages and lowers accuracy by one.',
	snowyterrain: 'No automatic activation for Elemental, Magical, Synthetic or Telluric Seed is registered on Snowy Terrain. Its Elemental grouping is navigation only.',
};

export function appendSharedFieldGuide(sections: { [id: string]: { [section: string]: string[] } }) {
	for (const [id, entry] of Object.entries(sections)) {
		const mapping = FieldMoveMappings[id];
		if (mapping) entry['Shared move and ability mappings'] = [
			`Camouflage changes its user to ${mapping.camouflage}; Mimicry selects ${mapping.mimicry}; Terrain Pulse becomes ${mapping.pulse}. These are distinct mappings, not a shared type assumption. Type-changing restrictions still apply. An active aura overrides Camouflage, Mimicry and Terrain Pulse with its own type.`,
			`Nature Power calls ${mapping.nature}. Frozen Aura overrides this with Ice Beam and Ashen Aura with Infernal Parade; other auras do not replace this field lookup.`,
		];
		if (['electricterrain', 'grassyterrain', 'mistyterrain', 'psychicterrain', 'rainbowterrain'].includes(id)) entry['Shared move and ability mappings'].push('Without an aura, Terrain Pulse doubles its base power here unless the target has adaptive field protection. This power check does not require grounding.');
		if (FieldSeedNotes[id]) entry['Seeds and other effects'] = [FieldSeedNotes[id], ...(entry['Seeds and other effects'] || []).filter(s => !/^(Elemental|Magical|Synthetic|Telluric) Seed/.test(s)), 'Seed effects require the item to activate and be consumed. Type, status, healing, trapping and stat-change restrictions still apply; a listed attempt is not a guarantee against immunity.'];
	}
	sections.coldeclipseterrain.Abilities.push('Mimicry additionally grants one Defense and Special Defense stage when it successfully changes the holder’s type here. Merely rechecking an already matching type does not grant the boost.');
	sections.crystalcavernterrain['Shared move and ability mappings'] = ['Camouflage, Mimicry and Terrain Pulse select the current crystal element: Fire, Water, Grass or Psychic. Active aura typing overrides that choice. Nature Power calls Power Gem.'];
	sections.newworldterrain['Shared move and ability mappings'] = ['Camouflage, Mimicry and Terrain Pulse select a random ordinary type unless an aura supplies the type. Nature Power calls Spacial Rend, except for Frozen Aura’s explicit override.'];
	sections.adriennterrain['Shared move and ability mappings'] = ['Adrienn’s format starts with Misty over Fairy Tale. Shared move and seed effects follow the actual current field, not a separate Adrienn type table.'];
	for (let n = 2; n <= 5; n++) sections[`flowergarden${n}`]['Seeds and other effects'] = [...(sections[`flowergarden${n}`]['Seeds and other effects'] || []), 'Synthetic Seed’s automatic activation list includes stage 1 only; moving directly into this later stage does not activate it through that list.'];
}

export function appendReviewedHazards(sections: { [id: string]: { [section: string]: string[] } }) {
	const extra: { [id: string]: string[] } = {
		"crystalcavernterrain": [
			"Stealth Rock combines Rock effectiveness with the current crystal element and advances the element once when the hazard applies. Immunity to that element prevents this application.",
		],
		"dragonsdenterrain": [
			"Stealth Rock uses Fire effectiveness instead of Rock effectiveness, based on the usual 1/8 maximum HP before type scaling.",
		],
		"volcanicterrain": [
			"Stealth Rock uses Fire effectiveness instead of Rock effectiveness, based on the usual 1/8 maximum HP before type scaling.",
		],
		"coldeclipseterrain": [
			"Soak changes its target to Ice. Stealth Rock uses Ice effectiveness instead of Rock effectiveness.",
		],
		"rockyterrain": [
			"Stealth Rock doubles its type-effectiveness exponent: weaknesses and resistances are squared, rather than applying a flat doubled damage bonus.",
		],
		"caveterrain": [
			"Stealth Rock doubles its type-effectiveness exponent: weaknesses and resistances are squared, rather than applying a flat doubled damage bonus.",
		],
		"forestterrain": [
			"Sticky Web lowers Speed by two stages instead of one, subject to its ordinary entry-hazard exemptions.",
		],
		"wastelandterrain": [
			"Newly placed Spikes, Toxic Spikes, Sticky Web and Stealth Rock are swallowed and removed as side conditions, recording that side for the corresponding eruption. The field clears its eruption records during its field-residual handler; these are not permanently stacking entry hazards.",
		],
		"newworldterrain": [
			"Named 1.5x signature/light list: Aurora Beam, Signal Beam, Flash Cannon, Dazzling Gleam, Mirror Shot, Photon Geyser, Psystrike, Aeroblast, Sacred Fire, Mist Ball, Luster Purge, Origin Pulse, Precipice Blades, Dragon Ascent, Psycho Boost, Roar of Time, Magma Storm, Crush Grip, Judgment, Dei Ludicium, Seed Flare, Shadow Force, Searing Shot, V-create, Secret Sword, Sacred Sword, Relic Song, Fusion Bolt, Fusion Flare, Ice Burn, Freeze Shock, Bolt Strike, Blue Flare, Techno Blast, Oblivion Wing, Land's Wrath, Thousand Arrows, Thousand Waves, Diamond Storm, Steam Eruption, Core Enforcer, Fleur Cannon, Prismatic Laser, Sunsteel Strike, Spectral Thief, Moongeist Beam, Multi-Attack, Mind Blown, Plasma Fists, Earth Power, Power Gem, Eruption, Continental Crush, Genesis Supernova, Soul-Stealing 7-Star Strike, Searing Sunraze Smash, Menacing Moonraze Maelstrom, Astral Barrage, Behemoth Bash, Behemoth Blade, Collision Course, Double Iron Bash, Dragon Energy, Dynamax Cannon, Electro Drift, Eternabeam, Fiery Wrath, Glacial Lance, Ruination, Freezing Glare, Tera Starstorm, Surging Strikes, Malignant Chain, Tachyon Cutter, Mighty Cleave, Hydro Steam, Thunderclap, Ivy Cudgel, Psyblade, Sandsear Storm, Wildbolt Storm, Springtide Storm, Thunder Cage, Thunderous Kick, Wicked Blow, Mirror Beam.",
		],
	};
	for (const [id, rows] of Object.entries(extra)) (sections[id].Moves ||= []).push(...rows);
	for (const entry of Object.values(sections)) entry['Shared rules and limitations'] = ["Strong Winds on any field boosts Fairy Wind, Gust, Icy Wind, Ominous Wind, Razor Wind, Silver Wind, Twister, Heavenly Wing and Airstream Assault by 1.5x. Special Flying moves independently gain 1.5x, giving 2.25x when both apply. The message 'The wind strengthened the attack!' marks this bonus. Gale Wings gives all moves +1 priority at any HP; Wind Power and Wind Rider each gain +1 Attack and Special Attack per turn. Weather suppression disables these weather bonuses.", "Power multipliers apply during battle, not permanently to base stats. Named and type bonuses may stack unless a shared rule reconciles them. Adaptive field protection can alter their contribution.", "Clearing removes the current field layer and reveals the previous one; it need not leave an empty field, and a format can retain the same underlying field. Transitions remain subject to shared field locks, including Bad Seeds, Pulse Blockade and applicable Neutralization rules. An end-of-move trigger does not always require damage; explicit success requirements are stated in the transition text.", "Infernal Rage, Wind Dance and Airstream Assault require their qualifying hit and a living user for their shared field-clearing path. Clearing an aura first prevents a full-field transition on the same use."];
}

export const FieldSecretPowerNotes: { [id: string]: string } = {
	"ashenbeachterrain": "Secret Power: 30% chance to lower accuracy by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"darkcrystalcavernterrain": "Secret Power: 30% chance to lower accuracy by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"desertterrain": "Secret Power: 30% chance to lower accuracy by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"bigtopterrain": "Secret Power: 30% chance to lower Special Defense by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"starlightarenaterrain": "Secret Power: 30% chance to lower Special Defense by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"burningterrain": "Secret Power: 30% chance to burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"dragonsdenterrain": "Secret Power: 30% chance to burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"superheatedterrain": "Secret Power: 30% chance to burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"volcanicterrain": "Secret Power: 30% chance to burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"caveterrain": "Secret Power: 30% chance to flinch. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"mountainterrain": "Secret Power: 30% chance to flinch. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"rockyterrain": "Secret Power: 30% chance to flinch. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"chessboardterrain": "Secret Power: 30% chance to lower Defense by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"coldeclipseterrain": "Secret Power: 30% chance to inflict the freeze/frostbite status. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"snowymountainterrain": "Secret Power: 30% chance to inflict the freeze/frostbite status. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"icyterrain": "Secret Power: 30% chance to inflict the freeze/frostbite status. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances. It also takes Ice Shard's type, power, accuracy and priority.",
	"corrosivemistterrain": "Secret Power: 30% chance to poison. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"corrosiveterrain": "Secret Power: 30% chance to poison. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"murkwatersurfaceterrain": "Secret Power: 30% chance to poison. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"electricterrain": "Secret Power: 30% chance to paralyze. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"shortcircuitterrain": "Secret Power: 30% chance to paralyze. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"factoryterrain": "Secret Power: 30% chance to lower Attack by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"underwaterterrain": "Secret Power: 30% chance to lower Attack by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"fairytaleterrain": "Secret Power: 30% chance to put the target to sleep. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"forestterrain": "Secret Power: 30% chance to put the target to sleep. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"grassyterrain": "Secret Power: 30% chance to put the target to sleep. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"glitchterrain": "Secret Power: 30% chance to lower Speed by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"psychicterrain": "Secret Power: 30% chance to lower Speed by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"swampterrain": "Secret Power: 30% chance to lower Speed by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"watersurfaceterrain": "Secret Power: 30% chance to lower Speed by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"hauntedterrain": "Secret Power: 30% chance to apply Ghost-style Curse. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"holyterrain": "Secret Power: 30% chance to lower Special Attack by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"mistyterrain": "Secret Power: 30% chance to lower Special Attack by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"midnightzoneterrain": "Secret Power: 30% chance to lower Special Attack by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"inverseterrain": "Secret Power: 30% chance to confuse. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"mirrorarenaterrain": "Secret Power: 30% chance to lower evasion by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"newworldterrain": "Secret Power: 30% chance to lower Attack, Defense, Special Attack, Special Defense and Speed together by one stage. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"bewitchedwoodsterrain": "Secret Power: separate 10% secondary rolls for poison, sleep and paralysis. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"crystalcavernterrain": "Secret Power: separate 7.5% secondary rolls for confusion, freeze/frostbite, sleep and burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"rainbowterrain": "Secret Power: separate 7.5% secondary rolls for paralysis, sleep, freeze/frostbite and burn. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"wastelandterrain": "Secret Power: separate 7.5% secondary rolls for burn, paralysis, poison and freeze/frostbite. Normal secondary-effect and status protections apply; other move/ability modifiers can alter these chances.",
	"flowergarden1": "Secret Power becomes Sweet Scent with its secondary effects removed.",
	"flowergarden5": "Secret Power becomes Petal Dance aimed at all adjacent foes, with its secondary effects removed.",
	"flowergarden2": "Secret Power has no field-specific secondary assigned here; the current handler clears its secondary list.",
	"flowergarden3": "Secret Power has no field-specific secondary assigned here; the current handler clears its secondary list.",
	"flowergarden4": "Secret Power has no field-specific secondary assigned here; the current handler clears its secondary list.",
	"snowyterrain": "Secret Power has no field-specific secondary assigned here; the current handler clears its secondary list.",
};
export function appendSecretPowerGuide(sections: { [id: string]: { [section: string]: string[] } }) { for (const [id, text] of Object.entries(FieldSecretPowerNotes)) (sections[id].Moves ||= []).push(text); }

FieldSeedNotes.coldeclipseterrain = 'Elemental Seed grants +2 Speed and Torment; it does not change typing.';
FieldSeedNotes.rifteclipseterrain = 'Magical Seed grants +1 Defense and establishes eight-turn Trick Room.';
FieldSeedNotes.infernaleclipseterrain = 'Elemental Seed grants +1 Attack and Special Attack and a four-turn Fire Spin effect.';
FieldSeedNotes.snowyterrain = 'Elemental Seed grants +1 Special Defense, Wish, and five-turn Safeguard.';
