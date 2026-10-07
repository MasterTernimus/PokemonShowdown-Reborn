import {StarterPassives} from './starter-passives';

/** Explicitly approved ordinary species; no evolution or battle-form inheritance. */
export const ThematicPassiveGroups = {
	hypercutter: ['kingler', 'pinsir', 'crawdaunt', 'gliscor'],
	shielddust: ['butterfree', 'vivillon', 'dustox', 'mothim', 'masquerain'],
	overcoat: ['cacnea', 'cacturne', 'maractus'],
	liquidooze: ['swalot', 'tentacruel', 'muk', 'gulpin', 'tentacool', 'grimer'],
	keeneye: ['fearow', 'noctowl', 'watchog', 'furret'],
	sweetveil: ['alcremie', 'slurpuff', 'vespiquen', 'milcery', 'swirlix', 'combee'],
	runaway: ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
	levitate: ['baltoy', 'claydol', 'chimecho', 'misdreavus', 'mismagius', 'duskull', 'dusknoir', 'cryogonal',
		'flygon', 'solrock', 'lunatone', 'rotom', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow',
		'tynamo', 'eelektrik', 'eelektross', 'koffing', 'weezing', 'weezinggalar', 'hydreigon'],
} as const;

/** Ordinary cosmetic equivalents, including the two event Vivillon patterns. */
export const PassiveCosmeticForms = {
	vivillon: ['archipelago', 'continental', 'elegant', 'garden', 'highplains', 'icysnow', 'jungle', 'marine',
		'modern', 'monsoon', 'ocean', 'polar', 'river', 'sandstorm', 'savanna', 'sun', 'tundra', 'fancy', 'pokeball'],
	alcremie: ['rubycream', 'matchacream', 'mintcream', 'lemoncream', 'saltedcream', 'rubyswirl', 'caramelswirl', 'rainbowswirl'],
} as const;

export const SpeciesPassives: {[id: string]: readonly string[]} = {...StarterPassives};
export const ThematicPassiveIds = new Set<string>(Object.keys(ThematicPassiveGroups));
for (const [passive, ids] of Object.entries(ThematicPassiveGroups)) {
	for (const id of ids) SpeciesPassives[id] = Object.freeze([passive]);
}
for (const [base, forms] of Object.entries(PassiveCosmeticForms)) {
	for (const form of forms) SpeciesPassives[base + form] = SpeciesPassives[base];
}
Object.freeze(SpeciesPassives);
