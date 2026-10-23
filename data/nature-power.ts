/** Public field/aura inputs only. Does not evaluate legality, priority or targeting. */
const fieldMoves = new Map<string, string>([
	['flowergarden1', 'growth'],
	['flowergarden5', 'petalblizzard'],
	['ashenbeachterrain', 'meditate'],
	['bewitchedwoodsterrain', 'alluringvoice'],
	['bigtopterrain', 'acrobatics'],
	['burningterrain', 'flamethrower'],
	['caveterrain', 'rocktomb'],
	['chessboardterrain', 'ancientpower'],
	['coldeclipseterrain', 'icywind'],
	['corrosivemistterrain', 'venoshock'],
	['corrosiveterrain', 'acid'],
	['crystalcavernterrain', 'powergem'],
	['darkcrystalcavernterrain', 'darkpulse'],
	['desertterrain', 'sandtomb'],
	['dragonsdenterrain', 'dragonpulse'],
	['electricterrain', 'thunderbolt'],
	['factoryterrain', 'geargrind'],
	['fairytaleterrain', 'secretsword'],
	['forestterrain', 'woodhammer'],
	['glitchterrain', 'metronome'],
	['grassyterrain', 'energyball'],
	['hauntedterrain', 'phantomforce'],
	['holyterrain', 'judgment'],
	['icyterrain', 'icebeam'],
	['inverseterrain', 'trickroom'],
	['mirrorarenaterrain', 'mirrorshot'],
	['mountainterrain', 'rockslide'],
	['murkwatersurfaceterrain', 'sludgewave'],
	['mistyterrain', 'mistball'],
	['newworldterrain', 'spacialrend'],
	['psychicterrain', 'psychic'],
	['rainbowterrain', 'aurorabeam'],
	['rockyterrain', 'rocksmash'],
	['shortcircuitterrain', 'discharge'],
	['snowymountainterrain', 'avalanche'],
	['starlightarenaterrain', 'moonblast'],
	['superheatedterrain', 'heatwave'],
	['swampterrain', 'muddywater'],
	['underwaterterrain', 'waterpulse'],
	['midnightzoneterrain', 'anchorshot'],
	['volcanicterrain', 'flamethrower'],
	['wastelandterrain', 'gunkshot'],
	['watersurfaceterrain', 'whirlpool'],
]);

/** Returns the called move ID; the Nature Power Status wrapper still runs normally.
 * Only Frozen Aura overrides the field, using its authoritative registry value.
 * Flower Garden stages 2-4 intentionally retain the existing Tri Attack fallback.
 */
export function resolveNaturePowerMove(
	fieldId: string, aura?: { id: string, naturePowerMove: string } | null
): string {
	if (aura?.id === 'frozenaura') return aura.naturePowerMove;
	return fieldMoves.get(fieldId) ?? 'triattack';
}
