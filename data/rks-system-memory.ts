/** Shared unchanged runtime Memory components; also exported to presentation clients. */
export const RKSSystemMemoryAbilities: {[item: string]: string[]} = {
	bugmemory: ['tintedlens', 'shielddust'],
	darkmemory: ['pressure', 'intimidate'],
	dragonmemory: ['marvelscale', 'toughclaws'],
	electricmemory: ['transistor', 'lightningrod'],
	fairymemory: ['invigorate', 'friendguard'],
	fightingmemory: ['innerfocus', 'sheerforce'],
	firememory: ['soulfire', 'flamebody'],
	flyingmemory: ['galewings', 'airlock'],
	ghostmemory: ['soulfire', 'cursedbody'],
	grassmemory: ['hospitality', 'chlorophyll'],
	groundmemory: ['sandrush', 'stamina'],
	icememory: ['icebody', 'slushrush'],
	poisonmemory: ['regenerator', 'corrosion'],
	psychicmemory: ['magicbounce', 'magicguard'],
	rockmemory: ['purifyingsalt', 'solidrock'],
	steelmemory: ['swornduty', 'mirrorarmor'],
	watermemory: ['swiftswim', 'waterveil'],
};

export function getRKSSystemMemoryAbilities(item: string): string[] {
	return RKSSystemMemoryAbilities[item] || ['scrappy'];
}
