/** Exact regional distribution; no normal-Arboliva or pre-evolution inheritance. */
export const ArbolivaAevianLearnset: NonNullable<import('../sim/dex-species').LearnsetData['learnset']> = {};
const levels: {[move: string]: number} = {
 icebeam: 0, safeguard: 1, haze: 1, tackle: 1, absorb: 5, growth: 7, iceball: 10,
 helpinghand: 13, frustration: 16, powdersnow: 20, hail: 23, iciclecrash: 27,
 snarl: 31, frostbreath: 34, leechseed: 37, terrainpulse: 46, darkpulse: 50,
 gigadrain: 52, synthesis: 60, blizzard: 78,
};
for (const [id, level] of Object.entries(levels)) ArbolivaAevianLearnset[id as ID] = [`9L${level}`];
for (const id of [
 'auroraveil', 'blizzard', 'bulletseed', 'charm', 'chillingwater', 'darkpulse', 'earthpower',
 'energyball', 'frostbreath', 'gigadrain', 'grassknot', 'helpinghand', 'icebeam', 'icespinner',
 'iciclecrash', 'iciclespear', 'icywind', 'lashout', 'leafstorm', 'magicalleaf', 'nastyplot',
 'seedbomb', 'snarl', 'solarbeam', 'solarblade', 'sunnyday', 'swift', 'synthesis', 'taunt',
 'torment', 'weatherball', 'memento',
]) (ArbolivaAevianLearnset[id as ID] ||= []).push('9M');
