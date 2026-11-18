import { towerSlots } from './tower-and-forest';
import { skySlots } from './sky-sea-land';
import { lakeSlots } from './lake-guardians';
import type { SpeciesData } from '../sim/dex-species';

export const revisedSlots: Record<string, SpeciesData['abilities']> = {
	...towerSlots, ...skySlots, ...lakeSlots,
	liepard: { 0: 'Limber', 1: 'Unburden', H: 'Alley Ambush' },
	druddigon: { 0: 'Sheer Force', 1: 'Mold Breaker', H: 'Basking Scales', S: 'Aevian Bolt' },
	froslass: { 0: 'Haunting Veil', 1: 'Ice Body', H: 'Insomnia', S: 'Bad Seeds' },
	noctowl: { 0: 'Duskilate', 1: 'Night Watch', H: 'Tinted Lens' },
	togetic: { 0: 'Healer', 1: 'Sweet Veil', H: 'Super Luck' },
	xatu: { 0: 'Temporal Shift', 1: 'Neutralization', H: 'Forewarn' },
	houndoom: { 0: 'Agony Flame', 1: 'Insomnia', H: 'Unnerve' },
	shiftry: { 0: 'Chlorophyll', 1: 'Early Bird', H: 'Gale Revel' },
	swellow: { 0: 'Guts', 1: 'Aerilate', H: 'Slipstream Dive' },
	pelipper: { 0: 'Accumulation', 1: 'Hydration', H: 'Rain Courier' },
	dusclops: { 0: 'Frisk', 1: 'Cursed Body', H: 'Misaligned Stars' },
	articuno: { 0: 'Winter Herald', 1: 'Soundproof', H: 'Mirror Armor' },
	zapdos: { 0: 'Spring Herald', 1: 'Lightning Rod', H: 'Competitive' },
	moltres: { 0: 'Summer Herald', 1: 'Solar Power', H: 'Berserk' },
	deoxys: { 0: 'Synchronize', 1: 'Clear Body', H: 'Alien Genome' },
	deoxysattack: { 0: 'Inner Focus', 1: 'Download', H: 'Alien Genome' },
	deoxysdefense: { 0: 'Sturdy', 1: 'Shell Armor', H: 'Alien Genome' },
	deoxysspeed: { 0: 'Infiltrator', 1: 'Limber', H: 'Alien Genome' },
	ambipom: { 0: 'Whiplash', 1: 'Pickup', H: 'Scrappy' },
};

export const revisedPassives: Record<string, string> = {
	liepard: 'prankster',
	noctowl: 'frisk',
	togetic: 'serenegrace',
	xatu: 'magicbounce',
	qwilfishhisui: 'ironbarbs',
	lugia: 'multiscale',
	hooh: 'regenerator',
	celebi: 'naturalrecovery',
	shiftry: 'windrider',
	swellow: 'scrappy',
	dusclops: 'pressure',
	latias: 'levitate',
	latios: 'levitate',
	latiasmega: 'levitate',
	latiosmega: 'levitate',
	kyogre: 'drizzle',
	kyogreprimal: 'primordialsea',
	groudon: 'drought',
	groudonprimal: 'desolateland',
	rayquaza: 'airlock',
	rayquazamega: 'deltastream',
	deoxys: 'pressure',
	deoxysattack: 'pressure',
	deoxysdefense: 'pressure',
	deoxysspeed: 'pressure',
	ambipom: 'doublestrike',
	garchompbattlebond: 'serratedscales',
	uxie: 'giftofknowledge',
	mesprit: 'giftofemotion',
	azelf: 'giftofwill',
};

export const revisedNames: Record<string, string> = {
	mightyjaw: 'Tidal Awakening',
	verdanthospitality: 'Verdant Awakening',
	blazingmane: 'Plasma Awakening',
	lightweightswarm: 'Alloy Swarm',
};
