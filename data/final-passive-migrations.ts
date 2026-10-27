import type {AbilityDataTable} from '../sim/dex-abilities';

export const FinalPassiveMigrations: {[id: string]: string[]} = {
 kingambit: ['supremeoverlord'],
 ursaluna: ['thickfat'], ursalunabloodmoon: ['mindseye'], archaludon: ['stalwart'], rhydon: ['lightningrod'],
 tsareena: ['queenlymajesty'], tsareenaalt: ['queenlymajesty'],
 porygon2: ['download'], porygonz: ['download'], medicham: ['purepower'],
};
export const FinalPassiveSlotChanges: {[id: string]: {[slot: string]: string}} = {
 rhydon: {0: 'Grand Strategy', 1: 'Lightning Rod', H: 'Brute Force'}, ursalunabloodmoon: {0: 'Bloodmoon Gaze'}, porygonz: {1: 'Error Handler'}, medicham: {0: 'Still Mind'},
};
export const FinalPassiveComponents: {[id: string]: string[]} = {
 bloodmoongaze: ['infiltrator', 'competitive'], errorhandler: ['aromaveil', 'infiltrator'],
 stillmind: ['anticipation', 'oblivious'], empress: ['queenlymajesty', 'royaldecree', 'longreach'],
};
export const FinalPassiveDescriptions = {
 bloodmoongaze: {shortDesc: "Infiltrator + Competitive.", desc: "Full local Infiltrator bypasses Substitute and opposing screens. Full Competitive grants +2 Sp. Atk when an opposing Pokemon lowers a stat; on Chessboard it instead scales move power up to 2x as HP falls."},
 errorhandler: {shortDesc: "Aroma Veil + Infiltrator.", desc: "Full Aroma Veil protects this Pokemon and its allies from Attract, Disable, Encore, Heal Block, Taunt and Torment. Full Infiltrator bypasses Substitute and opposing screens."},
 stillmind: {shortDesc: "Anticipation + Oblivious.", desc: "Full local Anticipation reveals opposing Illusions and warns of super-effective or OHKO moves, with its Psychic Terrain Sp. Atk boost. Full Oblivious prevents infatuation, Taunt, Captivate and Intimidate Attack drops and cures infatuation or Taunt."},
 empress: {shortDesc: 'Royal Decree + Long Reach; Fairy resists Poison/Steel; Fighting STAB.', desc: "Preserves full Royal Decree and Empress effects: Fairy typing resists Poison and Steel, and Fighting moves receive STAB. Adds full local Long Reach, including contact removal, Keen Eye effects, entry accuracy boost, critical-stage boost and field modifiers. Queenly Majesty is supplied separately by Tsareena and Tsareena-Alt’s passive; other users retain the original component."},
};

export function installFinalPassiveMigrations(abilities: AbilityDataTable) {
 abilities.bloodmoongaze = {...abilities.infiltrator, ...abilities.competitive, name: 'Bloodmoon Gaze', num: 11446};
 abilities.errorhandler = {...abilities.aromaveil, ...abilities.infiltrator, flags: {...abilities.aromaveil.flags}, name: 'Error Handler', num: 11447};
 abilities.stillmind = {...abilities.anticipation, ...abilities.oblivious, name: 'Still Mind', num: 11448};
 const oldEmpress = {...abilities.empress};
 const nativeQueen = (pokemon: Pokemon) => {
  const species = pokemon.m.perfectIllusion && pokemon.illusion ? pokemon.illusion.species : pokemon.species;
  return ['tsareena', 'tsareenaalt'].includes(species.id) && pokemon.getPassives().includes('queenlymajesty');
 };
 abilities.empress.onModifyDamage = function (damage, source, target, move) {
  if (!nativeQueen(source)) return oldEmpress.onModifyDamage!.call(this, damage, source, target, move);
 };
 abilities.empress.onFoeTryMove = function (target, source, move) {
  if (!nativeQueen(this.effectState.target) && typeof oldEmpress.onFoeTryMove === 'function') return oldEmpress.onFoeTryMove.call(this, target, source, move);
 };
 abilities.empress.onStart = function (pokemon) {
  oldEmpress.onStart!.call(this, pokemon);
		abilities.longreach.onStart?.call(this, pokemon);
 };
 abilities.empress.onTryBoost = abilities.longreach.onTryBoost;
 abilities.empress.onBasePower = abilities.longreach.onBasePower;
 abilities.empress.onModifyCritRatio = abilities.longreach.onModifyCritRatio;
 abilities.empress.onModifyMove = function (move, pokemon, target) {
  oldEmpress.onModifyMove?.call(this, move, pokemon, target);
  abilities.longreach.onModifyMove!.call(this, move, pokemon, target);
 };
}
