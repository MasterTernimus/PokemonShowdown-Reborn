import { FieldCoolingMoves } from '../data/field-cooling';
import { Dex } from '../sim/dex';

export interface FieldTransitionRoute {
	from: string;
	to: string;
	trigger: string;
	uses: string;
	note: string;
	/** Conditional destinations, such as melting ice without an underlying field. */
	alsoTo?: string[];
}

/** Reviewed routes, shared by incoming and outgoing lists. Never infer a route from prose. */
export function fieldTransitionRoutes(): FieldTransitionRoute[] {
	const routes: FieldTransitionRoute[] = [];
	const add = (from: string, to: string, trigger: string, uses = '1 use', note = '', alsoTo?: string[]) => {
		routes.push({ from, to, trigger, uses, note, ...(alsoTo ? { alsoTo } : {}) });
	};
	const normalCooling = Object.keys(FieldCoolingMoves)
		.filter(id => FieldCoolingMoves[id] === 1 && id !== 'sparklingaria')
		.map(id => Dex.moves.get(id).name).join(', ');
	const strongCooling = Object.keys(FieldCoolingMoves).filter(id => FieldCoolingMoves[id] === 2)
		.map(id => Dex.moves.get(id).name).join(', ');
	const allCooling = Object.keys(FieldCoolingMoves).map(id => Dex.moves.get(id).name).join(', ');
	const fire = 'Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Mind Blown, Searing Shot, Inferno Overdrive';
	const wind = 'Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Supersonic Skystrike, G-Max Wind Rage';
	const ghosts = 'Ominous Wind, Phantom Force, Shadow Force, Spectral Scream, Trick-or-Treat, Ghost-type Curse';
	const quakes = 'Bulldoze, Earthquake, Fissure, Magnitude';
	const drying = 'Sand Tomb, Scorching Sands, Sandsear Storm, Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Water Sport, Sludge Wave, G-Max Wind Rage';
	const heating = 'Heat Wave, Lava Plume, Fire Pledge, Infernal Parade, Raging Fury, Flame Burst, Incinerate, Burning Jealousy, Mystical Fire, Searing Shot';
	const strongHeating = 'Precipice Blades, Eruption, Magma Storm, Inferno Overdrive, Blast Burn, Mind Blown';
	const dousing = 'Defog, Gust, Wind Dance, Airstream Assault, Hurricane, Muddy Water, Sand Tomb, Razor Wind, Sludge Wave, Sparkling Aria, Surf, Water Pledge, Water Sport, Water Spout, Hydro Vortex, Tailwind, Twister, Whirlwind, Continental Crush, Supersonic Skystrike, G-Max Wind Rage';
	add('dragonsdenterrain', 'volcanicterrain', normalCooling, '2 uses total', 'Mix these moves. Misses, immunities and Protect count; the first use keeps Dragon’s Den. Draco Meteor / Dragon Energy undo 1 step; Devastating Drake resets progress.');
	add('dragonsdenterrain', 'volcanicterrain', 'Sparkling Aria', '1 use', 'Skips the cooling counter, even on a miss, immunity or Protect.');
	add('dragonsdenterrain', 'caveterrain', strongCooling, '1 use', 'Skips Volcanic entirely, even on a miss, immunity or Protect.');
	add('dragonsdenterrain', 'fairytaleterrain', 'Mist Ball', '1 damaging hit', 'Fairy Tale lasts 5 turns.');
	add('volcanicterrain', 'caveterrain', allCooling, '1 use', 'Misses, immunities and Protect count.');
	add('volcanicterrain', 'caveterrain', drying, '2 uses total');
	add('volcanicterrain', 'caveterrain', 'Continental Crush, Supersonic Skystrike, Acid Downpour');
	add('volcanicterrain', 'caveterrain', 'Rain or sandstorm', 'At turn end');
	for (const field of ['caveterrain', 'volcanicterrain']) {
		add(field, 'dragonsdenterrain', 'Dragon Pulse, Dragon Energy', '2 uses total');
		add(field, 'dragonsdenterrain', 'Devastating Drake, Draco Meteor, Core Enforcer');
		add(field, 'dragonsdenterrain', 'Dragon Rend', '1 damaging hit',
			'Damage to an enemy or its Substitute counts. Field locks still apply.');
	}
	add('caveterrain', 'dragonsdenterrain', 'Dragon-type Max move');
	add('caveterrain', 'crystalcavernterrain', 'Power Gem, Diamond Storm');
	add('caveterrain', 'icyterrain', 'Blizzard, Subzero Slammer');
	add('caveterrain', 'volcanicterrain', 'Blast Burn, Eruption, Inferno Overdrive, Mind Blown, Searing Shot, Burn Up', '1 use', 'Explosion: active Pokémon lose ½ max HP unless protected, semi-invulnerable or covered by a listed explosion-protection ability.');
	add('caveterrain', 'volcanicterrain', 'Fire-type Max move', '1 use', 'No explosion.');
	add('caveterrain', 'volcanicterrain', 'Magma Drift, Fever Pitch, Heat Wave, Lava Plume, Overheat, Incinerate, Inferno, Flame Burst, Fire Pledge, Sacred Fire', '2 uses total', 'No explosion.');
	add('crystalcavernterrain', 'caveterrain', quakes, '2 uses total', 'The breaking attack gains 1.3× power.');
	add('crystalcavernterrain', 'caveterrain', 'Tectonic Rage', '1 use', 'The breaking attack gains 1.3× power.');
	add('darkcrystalcavernterrain', 'caveterrain', quakes + ', Tectonic Rage', '2 uses total', 'The breaking attack gains 1.3× power.');
	add('crystalcavernterrain', 'darkcrystalcavernterrain', 'Dark Pulse, Dark Void, Night Daze, Light That Burns the Sky', '1 use', 'Blocked by ordinary sun.');
	add('darkcrystalcavernterrain', 'crystalcavernterrain', 'Ordinary sun', 'When sun begins', 'Returns to Dark Crystal Cavern when that sun ends.');
	add('crystalcavernterrain', 'darkcrystalcavernterrain', 'Sun ends', 'When sun ends', 'Only if that sun created Crystal Cavern.');
	add('watersurfaceterrain', 'underwaterterrain', 'Dive, Gravity, Anchor Shot, Grav Apple', '1 use', 'Clears weather.');
	add('underwaterterrain', 'watersurfaceterrain', 'Bounce, Dive, Sky Drop, Fly, Shore Up');
	add('underwaterterrain', 'midnightzoneterrain', 'Dark Void, Black Hole Eclipse, Night Daze, Dark Pulse');
	add('midnightzoneterrain', 'underwaterterrain', 'Flash, Dazzling Gleam, Light That Burns the Sky, Bounce, Fly');
	for (const field of ['watersurfaceterrain', 'underwaterterrain']) {
		const note = 'Neutralization blocks pollution.' + (field === 'underwaterterrain' ? ' Active Pokémon faint unless Poison-type, Steel-type or semi-invulnerable.' : '');
		add(field, 'murkwatersurfaceterrain', 'Sludge Wave', '2 uses', note);
		add(field, 'murkwatersurfaceterrain', 'Acid Downpour', '1 use', note);
	}
	add('murkwatersurfaceterrain', 'watersurfaceterrain', 'Whirlpool');
	for (const field of ['watersurfaceterrain', 'murkwatersurfaceterrain']) {
		add(field, 'icyterrain', 'Blizzard, Glaciate, Subzero Slammer', '1 use',
			'The ice remembers the water field underneath.');
	}
	add('icyterrain', 'previous', 'Anchor Shot, Dive’s attacking turn', '1 use', 'Restores the field underneath; otherwise creates Water Surface.', ['watersurfaceterrain']);
	add('icyterrain', 'previous', quakes + ', Tectonic Rage', '1 use', 'Requires a field underneath. Without one, adds Spikes instead.');
	add('icyterrain', 'previous', fire + ', Burning Jealousy, Magma Drift, Raging Fury, Fire-type Max move', '1 use', 'Restores the field underneath; otherwise creates Cave.', ['caveterrain']);
	add('icyterrain', 'previous', 'Scald, Steam Eruption, Hydro Steam', '2 uses total', 'Restores the field underneath; otherwise creates Water Surface.', ['watersurfaceterrain']);
	add('icyterrain', 'previous', 'Matcha Gotcha', '1 use', 'Restores the field underneath; otherwise creates Water Surface.', ['watersurfaceterrain']);
	add('icyterrain', 'previous', 'Infernal Rage', '1 qualifying hit', 'Restores the field underneath; otherwise creates Cave.', ['caveterrain']);
	add('mountainterrain', 'snowymountainterrain', 'Blizzard, Glaciate, Subzero Slammer');
	add('mountainterrain', 'snowymountainterrain', 'Hail', '3 turns from a fresh field', 'After a non-hail turn, needs 2 consecutive hail checks instead.');
	add('snowymountainterrain', 'mountainterrain', fire + ', Fire-type Max move');
	add('snowymountainterrain', 'mountainterrain', 'Infernal Rage', '1 qualifying hit');
	add('snowyterrain', 'previous', fire, '1 successful use', 'Reveals the field underneath; otherwise clears the field.');
	add('forestterrain', 'burningterrain', fire, '1 use', 'Rain together with Water Sport blocks ignition.');
	add('forestterrain', 'burningterrain', 'Fire-type Max move', '1 use', 'Rain and Water Sport do not stop this route.');
	add('forestterrain', 'burningterrain', 'Infernal Rage', '1 qualifying hit', 'Rain together with Water Sport blocks ignition.');
	add('forestterrain', 'bewitchedwoodsterrain', ghosts);
	add('forestterrain', 'swampterrain', 'Water-type Max move');
	for (const field of ['forestterrain', 'grassyterrain']) {
		add(field, 'swampterrain', 'Surf (+1), Muddy Water (+2)', '3 points total', 'Mix the two moves to reach 3 points.');
	}
	add('grassyterrain', 'burningterrain', fire + ', Explosion, Self-Destruct', '1 use', 'Ordinary rain or Water Sport prevents ignition.');
	add('grassyterrain', 'burningterrain', 'Fire-type Max move');
	add('grassyterrain', 'corrosiveterrain', 'Sludge Wave, Acid Downpour', '1 use', 'Neutralization prevents this.');
	add('grassyterrain', 'desertterrain', 'Harsh sun begins', 'Weather change');
	add('grassyterrain', 'snowyterrain', 'Blizzard, Avalanche, Subzero Slammer', '1 successful use', 'Snowy lasts 5 turns.');
	add('grassyterrain', 'snowyterrain', 'Powder Snow', '2 successful uses', 'Snowy lasts 5 turns.');
	add('burningterrain', 'previous', dousing, '1 use', 'Restores the field underneath; otherwise clears Burning. A garden returns with its stage reduced by the turns spent burning.');
	add('burningterrain', 'previous', 'Ordinary rain or sandstorm', 'At turn end', 'Sandstorm does not douse a burning Flower Garden.');
	add('swampterrain', 'previous', 'Sun (+1 per turn), harsh sun (+3)', '3 drying points', 'Restores the field underneath; otherwise clears Swamp.');
	add('holyterrain', 'hauntedterrain', ghosts, '1 use', 'Neutralization prevents this.');
	add('hauntedterrain', 'holyterrain', 'Origin Pulse, Purify, Sacred Fire, Dazzling Gleam, Flash');
	add('corrosiveterrain', 'grassyterrain', 'Purify, Seed Flare');
	add('corrosivemistterrain', 'corrosiveterrain', 'Gravity');
	add('corrosivemistterrain', 'mistyterrain', 'Seed Flare');
	add('corrosivemistterrain', 'previous', wind, '1 use', 'Clears the mist, revealing the field underneath if present.');
	add('corrosivemistterrain', 'previous', fire + ', Explosion, Self-Destruct, Fire-type Max move', '1 use', 'Combusts the mist, dealing max-HP damage before clearing. Damp prevents it; protections and survival effects apply.');
	add('corrosivemistterrain', 'previous', 'Infernal Rage', '1 qualifying hit', 'Same combustion effect. Damp prevents it.');
	add('mistyterrain', 'corrosivemistterrain', 'Smog, Clear Smog, Poison Gas', '2 uses total', 'Neutralization prevents this.');
	add('mistyterrain', 'corrosivemistterrain', 'Acid Downpour', '1 use', 'Neutralization prevents this.');
	add('mistyterrain', 'previous', 'Defog, Gust, Hurricane, Razor Wind, Tailwind, Twister, Whirlwind, Supersonic Skystrike, G-Max Wind Rage', '1 use', 'Reveals the field underneath. Neutralization prevents status moves from clearing it.');
	add('adriennterrain', 'fairytaleterrain', 'Clear the opening Misty layer', 'Follow Misty’s clearing routes', 'Adrienn starts with Misty over Fairy Tale.');
	add('factoryterrain', 'shortcircuitterrain', 'Bulldoze, Fissure, Earthquake, Explosion, Magnitude, Self-Destruct, Tectonic Rage, Light That Burns the Sky, Aura Wheel, Discharge, Gigavolt Havoc, Ion Deluge, Overdrive, physical Super UMD Move');
	add('shortcircuitterrain', 'factoryterrain', 'Aura Wheel, Charge Beam, Discharge, Gigavolt Havoc, Ion Deluge, Overdrive, Parabolic Charge, Wild Charge, Rising Voltage, special Super UMD Move');
	add('mirrorarenaterrain', 'previous', 'Boomburst, Bulldoze, Earthquake, Explosion, Fissure, Hyper Voice, Magnitude, Self-Destruct, Tectonic Rage', '1 use', 'Shatters the mirrors; active Pokémon take ½ max HP unless protected, semi-invulnerable, using Wide Guard/Endure or covered by Shell Armor/Battle Armor.');
	add('superheatedterrain', 'burningterrain', fire + ', Explosion, Self-Destruct', '1 use', 'Water Sport prevents ignition.');
	add('superheatedterrain', 'burningterrain', 'Fire-type Max move', '1 use', 'Ignores Water Sport.');
	add('superheatedterrain', 'burningterrain', 'Infernal Rage', '1 qualifying hit');
	add('superheatedterrain', 'previous', 'Blizzard, Glaciate, Subzero Slammer', '1 use', 'Clears Superheated.');
	add('rainbowterrain', 'previous', 'Light That Burns the Sky', '1 use', 'Clears Rainbow.');
	add('rainbowterrain', 'previous', 'Hail or sandstorm', 'At turn end', 'Clears Rainbow.');
	add('newworldterrain', 'starlightarenaterrain', 'Gravity, Geomancy, Light of Ruin');
	add('coldeclipseterrain', 'rifteclipseterrain', heating + ', ' + strongHeating, '1 successful use');
	add('coldeclipseterrain', 'infernaleclipseterrain', 'Eruption with Ashen Aura', '1 successful use', 'Consumes the aura and keeps the field timer.');
	add('coldeclipseterrain', 'icyterrain', 'Purify', '1 successful use', 'Permanent Icy with Cave underneath.');
	add('rifteclipseterrain', 'infernaleclipseterrain', heating, '2 heating points', 'Each adds 1; freezing cancels heating.');
	add('rifteclipseterrain', 'infernaleclipseterrain', strongHeating, '1 successful use', 'Adds 2 heating points; existing freezing progress can offset them.');
	add('rifteclipseterrain', 'coldeclipseterrain', 'Blizzard, Cold Truth, Sheer Cold, Avalanche, Freezing Glare, Cold Snap', '2 freezing points', 'Each adds 1; heating cancels freezing.');
	add('rifteclipseterrain', 'coldeclipseterrain', 'Glaciate, Freeze Shock, Ice Burn, Subzero Slammer', '1 successful use', 'Adds 2 freezing points; existing heating progress can offset them.');
	add('rifteclipseterrain', 'previous', 'Purify, Seed Flare', '1 successful use', 'Clears Rift Eclipse.');
	add('infernaleclipseterrain', 'rifteclipseterrain', 'Surf, Muddy Water, Sparkling Aria, Water Pledge, Blizzard, Chilling Water, Hydro Pump, Sheer Cold', '2 cooling points', 'Each adds 1; heating removes cooling progress.');
	add('infernaleclipseterrain', 'rifteclipseterrain', 'Glaciate, Water Spout, Hydro Vortex, Oceanic Operetta, Subzero Slammer', '1 successful use', 'Adds 2 cooling points.');
	add('infernaleclipseterrain', 'coldeclipseterrain', 'Glaciate or Sheer Cold with Frozen Aura', '1 successful use', 'Consumes the aura and keeps the field timer.');
	add('infernaleclipseterrain', 'volcanicterrain', 'Purify, Judgment, Origin Pulse', '1 successful use', 'Permanent Volcanic with Cave underneath.');
	for (const field of ['coldeclipseterrain', 'infernaleclipseterrain']) {
		add(field, 'starlightarenaterrain', 'Geomancy, Light of Ruin', '1 successful use',
			'Creates permanent Starlight Arena.');
	}
	for (let stage = 1; stage <= 5; stage++) {
		const field = `flowergarden${stage}`;
		if (stage < 5) {
			const growthMoves = 'Growth, Flower Shield, Rain Dance, Sunny Day, Rototiller, Ingrain, Grassy Terrain, Water Sport, Bloom Doom';
			const ordinaryGrowth = stage <= 3 ? 'Without Ripen.' : '';
			add(field, `flowergarden${stage + 1}`, growthMoves, '1 use', ordinaryGrowth);
			add(field, `flowergarden${stage + 1}`, 'Sun, rain, or a garden created by Rift Lilligant',
				'At turn end', ordinaryGrowth + ' At most one automatic growth per turn.');
			if (stage <= 3) {
				add(field, `flowergarden${stage + 2}`, growthMoves, '1 use with Ripen');
				add(field, `flowergarden${stage + 2}`, 'Sun, rain, or a garden created by Rift Lilligant',
					'At turn end with Ripen', 'At most one automatic growth per turn.');
			}
		}
		if (stage > 1) {
			add(field, `flowergarden${stage - 1}`, 'Cut, X-Scissor');
			add(field, 'flowergarden1', 'Acid Downpour');
		}
		if (stage >= 3) {
			add(field, 'burningterrain', fire + ', Burning Jealousy', '1 use', 'Rain or Water Sport prevents ignition.');
		}
	}
	return routes;
}
