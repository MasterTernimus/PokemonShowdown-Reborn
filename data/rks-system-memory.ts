/** Shared single-ability runtime Memory effects; also exported to presentation clients. */
export const RKSSystemMemoryAbilities: {[item: string]: string[]} = {
	bugmemory: ['tintedlens'],
	darkmemory: ['pressure'],
	dragonmemory: ['marvelscale'],
	electricmemory: ['lightningrod'],
	fairymemory: ['mistysurge'],
	fightingmemory: ['innerfocus'],
	firememory: ['flashfire'],
	flyingmemory: ['windrider'],
	ghostmemory: ['infiltrator'],
	grassmemory: ['hospitality'],
	groundmemory: ['eartheater'],
	icememory: ['thermalexchange'],
	poisonmemory: ['regenerator'],
	psychicmemory: ['magicbounce'],
	rockmemory: ['purifyingsalt'],
	steelmemory: ['swornduty'],
	watermemory: ['swiftswim'],
};

export function getRKSSystemMemoryAbilities(item: string): string[] {
	return RKSSystemMemoryAbilities[item] || ['scrappy'];
}
