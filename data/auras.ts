/** Temporary Auras add their own rules without replacing the active base field. */
export interface AuraData {
	id: string;
	name: string;
	turns: number;
	mimicryType: string;
	secretPowerMove: string;
	naturePowerMove: string;
	damageMultipliers: {[move: string]: number};
	secondaryTypeAdditions: {[move: string]: string};
	typeMultipliers: {[type: string]: number};
	typeCondition: 'grounded' | 'electric' | 'psychic' | 'special' | 'none';
	moveMessages: {[move: string]: string};
	typeMessage: string;
	endMessage: string;
	statusBuffs: string[];
	statusNerfs: string[];
}

function values<T>(ids: string[], value: T): {[id: string]: T} {
	return Object.fromEntries(ids.map(id => [id, value]));
}

const electricMoves = ['explosion', 'selfdestruct', 'hurricane', 'surf', 'smackdown', 'muddywater', 'thousandarrows', 'wildboltstorm'];
const grassyMoves = ['fairywind', 'silverwind', 'ominouswind', 'icywind', 'razorwind', 'gust', 'twister'];
const mistyMoves = ['mysticalfire', 'magicalleaf', 'doomdesire', 'icywind', 'mistball', 'aurasphere', 'steameruption', 'silverwind', 'moongeistbeam', 'smog', 'clearsmog', 'strangesteam', 'springtidestorm', 'hydrosteam'];
const rainbowMoves = ['silverwind', 'mysticalfire', 'dragonpulse', 'triattack', 'sacredfire', 'firepledge', 'waterpledge', 'grasspledge', 'aurorabeam', 'mirrorbeam', 'judgment', 'relicsong', 'hiddenpower', 'secretpower', 'weatherball', 'mistball', 'heartstamp', 'moonblast', 'zenheadbutt', 'sparklingaria', 'fleurcannon', 'prismaticlaser', 'twinkletackle', 'oceanicoperetta', 'solarbeam', 'solarblade', 'dazzlinggleam', 'luminacrash'];
const psychicMoves = ['secretpower', 'hiddenpower', 'hex', 'magicalleaf', 'mysticalfire', 'moonblast', 'aurasphere', 'focusblast', 'mindblown'];

export const Auras: {[id: string]: AuraData} = {
	electricterrain: {
		id: 'electricterrain', name: 'Electric Aura', turns: 5, mimicryType: 'Electric',
		secretPowerMove: 'shockwave', naturePowerMove: 'thunderbolt',
		damageMultipliers: {...values(electricMoves, 1.5), magnetbomb: 2},
		secondaryTypeAdditions: values(electricMoves.filter(id => id !== 'wildboltstorm'), 'Electric'),
		typeMultipliers: {Electric: 1.3}, typeCondition: 'electric',
		moveMessages: {
			...values(electricMoves, 'The attack became hyper-charged!'),
			explosion: 'The explosion became hyper-charged!', selfdestruct: 'The explosion became hyper-charged!',
			magnetbomb: 'The attack powered up!',
		},
		typeMessage: 'The Electric Aura strengthened the attack!',
		endMessage: 'The electricity disappeared from the battlefield.',
		statusBuffs: ['magnetrise', 'risingvoltage', 'psyblade'], statusNerfs: [],
	},
	grassyterrain: {
		id: 'grassyterrain', name: 'Grassy Aura', turns: 5, mimicryType: 'Grass',
		secretPowerMove: 'seedbomb', naturePowerMove: 'energyball',
		damageMultipliers: values(grassyMoves, 1.5), secondaryTypeAdditions: {},
		typeMultipliers: {Grass: 1.3}, typeCondition: 'grounded',
		moveMessages: values(grassyMoves, 'The wind picked up strength from the Aura!'),
		typeMessage: 'The Grassy Aura strengthened the attack!',
		endMessage: 'The grass disappeared from the battlefield.',
		statusBuffs: ['grassyglide'], statusNerfs: [],
	},
	mistyterrain: {
		id: 'mistyterrain', name: 'Misty Aura', turns: 5, mimicryType: 'Fairy',
		secretPowerMove: 'mistball', naturePowerMove: 'mistball',
		damageMultipliers: values(mistyMoves, 1.5), secondaryTypeAdditions: {},
		typeMultipliers: {Fairy: 1.3}, typeCondition: 'none',
		moveMessages: values(mistyMoves, "The mist's energy strengthened the attack!"),
		typeMessage: 'The Misty Aura strengthened the attack!',
		endMessage: 'The mist disappeared from the battlefield.',
		statusBuffs: ['mistyexplosion'], statusNerfs: [],
	},
	rainbowterrain: {
		id: 'rainbowterrain', name: 'Rainbow Aura', turns: 5, mimicryType: 'Dragon',
		secretPowerMove: 'aurorabeam', naturePowerMove: 'aurorabeam',
		damageMultipliers: values(rainbowMoves, 1.5), secondaryTypeAdditions: {},
		typeMultipliers: {Normal: 1.3}, typeCondition: 'special',
		moveMessages: values(rainbowMoves, 'The attack was rainbow-charged!'),
		typeMessage: 'The rainbow energized the attack!', endMessage: 'The rainbow disappeared.',
		statusBuffs: [], statusNerfs: [],
	},
	psychicterrain: {
		id: 'psychicterrain', name: 'Psychic Aura', turns: 5, mimicryType: 'Psychic',
		secretPowerMove: 'psychic', naturePowerMove: 'psychic',
		damageMultipliers: values(psychicMoves, 1.5), secondaryTypeAdditions: {},
		typeMultipliers: {Psychic: 1.3}, typeCondition: 'psychic',
		moveMessages: values(psychicMoves, 'The psychic energy strengthened the attack!'),
		typeMessage: 'The Psychic Aura strengthened the attack!',
		endMessage: 'The psychic energy disappeared from the battlefield.',
		statusBuffs: ['expandingforce'], statusNerfs: [],
	},
};
