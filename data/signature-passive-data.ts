/** Exact signature migrations approved independently of family and cosmetic propagation. */
export const SignaturePassiveSelections: { [id: string]: string } = {
	slowkinggalar: 'eldritchremedy', mrmime: 'mimecraft', raichu: 'chargedtail', fearow: 'lancepoint',
	kingler: 'titanpincer', cloyster: 'pearlcurrent', garganacl: 'saltbastion',
	vikavolt: 'rechargerelay', jellicent: 'undertow', jellicentazzy: 'undertow', pinsir: 'lockinggrip',
	hariyama: 'palmmastery', drednaw: 'lockjaw', seismitoad: 'mirechorus',
};
/** Only full primitive components actually retained by these seven signatures. */
export const SignaturePassiveComponents: { [id: string]: readonly string[] } = {
	eldritchremedy: ['owntempo', 'curiousmedicine'], pearlcurrent: ['waterabsorb'], saltbastion: ['sturdy'],
	mirechorus: ['liquidvoice'],
};

/** Custom-only passive versions; copied selected packages elsewhere retain their original components. */
export const SignaturePassiveCallbacks: { [id: string]: readonly string[] } = {
	rechargerelay: ['onBeforeSwitchOut', 'onSwitchOut'], undertow: ['onSourceDamagingHit'],
	lockinggrip: ['onSourceDamagingHit', 'onSourceAfterSubDamage'], palmmastery: ['onModifyMove'],
	lockjaw: ['onSourceDamagingHit'],
	mirechorus: ['onModifyType', 'onBasePower', 'onSourceDamagingHit'],
};
export const SignaturePassiveRemovedComponents: { [id: string]: readonly string[] } = {
	rechargerelay: ['battery'], undertow: ['waterabsorb'], lockinggrip: ['hypercutter'],
	palmmastery: ['thickfat'], lockjaw: ['strongjaw'], mirechorus: ['poisontouch'],
};
export const SignaturePassiveDescriptions: { [id: string]: { shortDesc: string, desc: string } } = {
	rechargerelay: { shortDesc: 'Volt Switch heals the incoming teammate by 1/8 max HP.',
		desc: 'Switching with Volt Switch heals the incoming teammate by 1/8 of its base maximum HP. This passive does not include Battery.' },
	undertow: { shortDesc: 'Water attacks dealing HP damage ground surviving foes.',
		desc: 'Water attacks that deal HP damage ground surviving foes as with Smack Down. Does not trap foes or bypass protection, Substitute or Water immunity. This passive does not include Water Absorb.' },
	lockinggrip: { shortDesc: 'First damaging Bug attack per entry can Torment; Substitute spends the use.',
		desc: 'Once per entry, its first damaging Bug attack against a foe applies Torment after HP damage if the foe survives. Substitute damage spends the use without tormenting its holder, including before later hits. Misses, protection and immunity preserve the use. Ability replacement does not reset it; switching does. This passive does not include Hyper Cutter.' },
	palmmastery: { shortDesc: 'Force Palm always paralyzes when it lands, subject to immunity.',
		desc: 'Force Palm paralysis is a primary move effect rather than a secondary roll. It always paralyzes when it lands, subject to status immunity and existing status. This passive does not include Thick Fat.' },
	lockjaw: { shortDesc: 'Biting HP hits Torment surviving foes for 2 turns.',
		desc: 'Biting attacks that deal HP damage apply Torment to surviving foes for 2 turns. Does not prevent switching or bypass Substitute. This passive does not include Strong Jaw.' },
	mirechorus: { shortDesc: 'Sound becomes Water (Ice on Icy), 1.2x power; noncontact sound can poison.',
		desc: 'Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Each foe damaged by a noncontact sound hit has a 20% poison chance. Shield Dust and Covert Cloak prevent this added poison. This passive does not include contact Poison Touch.' },
};
