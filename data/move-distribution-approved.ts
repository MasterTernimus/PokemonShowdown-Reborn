/** Explicit additional learners; keep regional/cloak scope narrow. */
export const ApprovedMoveAdditions: {[move: string]: readonly string[]} = {
	crestcleave: ['haxorus'],
	beasthunter: ['haxorus'],
	spectralscream: ['spiritomb', 'banette', 'cursola'],
	spiritmend: ['spiritomb'],
	stackingshot: ['hitmonchan','ledian','pangoro','hariyama','crabominable','hitmontop'],
	magmadrift: ['magmortar','heatmor'],
	poisonsweep: ['arbok','skuntank','salazzle'],
	irritation: ['butterfree','dustox','ribombee','wormadam','volbeat','illumise','accelgor'],
	slashandburn: ['shiftry','parasect'],
	atlantiswall: ['lumineon','gorebyss'],
	arenitewall: ['gigalith','sandaconda'],
};

// Invigorate holders, including composite abilities; battle-only Megas inherit their base's pool.
// Mawile, Eternal Floette and Florges are also explicitly approved.
export const SafeguardSupportSpecies = [
	'vileplume', 'exeggutor', 'exeggutoralola', 'chansey', 'tangela', 'chikorita', 'bayleef', 'meganium',
	'hoppip', 'skiploom', 'blissey', 'mawile', 'roselia', 'budew', 'roserade', 'audino', 'swadloon',
	'petilil', 'lilliganthisui', 'alomomola', 'spritzee', 'aromatisse', 'fomantis', 'lurantistotem',
	'bounsweet', 'steenee', 'hatenna', 'hattrem', 'hatterene', 'zarude', 'zarudedada', 'embirch',
	'floetteeternal', 'florges', 'florgesreborn',
] as const;
