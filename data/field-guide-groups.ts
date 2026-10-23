/** Navigation categories follow the four local seed families; they do not alter battle rules. */
export const FieldGuideGroups: { [group: string]: string[] } = {
	Elemental: ['grassyterrain', 'electricterrain', 'mistyterrain', 'burningterrain', 'corrosivemistterrain', 'watersurfaceterrain', 'underwaterterrain', 'midnightzoneterrain', 'icyterrain', 'murkwatersurfaceterrain', 'dragonsdenterrain', 'coldeclipseterrain', 'volcanicterrain', 'snowyterrain'],
	Magical: ['psychicterrain', 'rainbowterrain', 'fairytaleterrain', 'darkcrystalcavernterrain', 'crystalcavernterrain', 'holyterrain', 'newworldterrain', 'starlightarenaterrain', 'inverseterrain', 'hauntedterrain', 'bewitchedwoodsterrain', 'adriennterrain'],
	Synthetic: ['glitchterrain', 'shortcircuitterrain', 'factoryterrain', 'mirrorarenaterrain', 'chessboardterrain', 'bigtopterrain', 'flowergarden1', 'flowergarden2', 'flowergarden3', 'flowergarden4', 'flowergarden5'],
	Telluric: ['corrosiveterrain', 'swampterrain', 'rockyterrain', 'desertterrain', 'forestterrain', 'ashenbeachterrain', 'wastelandterrain', 'caveterrain', 'superheatedterrain', 'mountainterrain', 'snowymountainterrain'],
};
export function fieldGuideGroup(id: string) {
	if (id === 'frozenaura') return 'Elemental';
	return Object.keys(FieldGuideGroups).find(group => FieldGuideGroups[group].includes(id)) || '';
}
export const FieldGuideGroupingNotes: { [id: string]: string } = {
	burningterrain: 'Burning is listed under Elemental for browsing, but both Elemental and Telluric Seeds can activate here.',
	snowyterrain: 'Placed beside the ice fields for browsing; this placement does not add a seed effect.',
	adriennterrain: 'A mixed Misty and Fairy Tale setup, grouped under Magical for browsing.',
	flowergarden1: 'All five garden stages stay together under Synthetic, following the first stage’s seed family. Seed activation still depends on the actual stage.',
};
