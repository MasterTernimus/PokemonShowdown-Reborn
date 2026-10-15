import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const GarchompPoiseDescriptions = {
 championspoise: {name: "Champion's Poise", shortDesc: 'First opposing Ice attack: half damage for all hits. Once/entry Swords Dance heals 1/8.', desc: 'Once per battle, the first opposing damaging Ice-type move to damage its HP deals half damage for its entire use, including all hits. Misses, protection, immunity and Substitute-only damage do not consume it. Once per genuine entry, Swords Dance that actually raises a stat heals 1/8 maximum HP under normal healing rules. Switching resets only the healing allowance; restarting the selected ability does not reset either allowance.'},
 pyrousdominion: {name: 'Pyrous Dominion', shortDesc: 'Full local Pressure; Dragon Rush and Stone Edge have 100 base accuracy.', desc: 'Full local Pressure, including entry Defense/Sp. Def drops and field interactions. Dragon Rush and Stone Edge have 100% base accuracy; normal accuracy and evasion modifiers still apply.'},
};
export function installGarchompPoise(abilities: AbilityDataTable) {
 abilities.championspoise = {
  name: "Champion's Poise", num: 11502, rating: 3, flags: {},
  onSwitchIn(pokemon) { if (!skipPassiveComponent(this, pokemon, 'championspoise')) pokemon.m.poiseHealed = false; },
  onSourceModifyDamage(damage, source, target, move) {
   if (skipPassiveComponent(this, target, 'championspoise') || source.isAlly(target) || move.category === 'Status' || !this.movehasType(move, 'Ice')) return;
   if (target.m.poiseIceUsed && target.m.poiseIceMove !== this.activeMove) return;
   return this.chainModify(0.5);
  },
  onAnyAfterDamageApplied(damage, target, source, move) {
   if (target !== this.effectState.target || !source || source.isAlly(target) || damage <= 0 || !move || move.effectType !== 'Move' || (move as ActiveMove).category === 'Status' || !this.movehasType(move as ActiveMove, 'Ice') || target.m.poiseIceUsed) return;
   target.m.poiseIceUsed = true; target.m.poiseIceMove = this.activeMove;
  },
  onAfterBoost(boost, target, source, effect) {
   if (skipPassiveComponent(this, target, 'championspoise') || effect?.id !== 'swordsdance' || target !== source || target.m.poiseHealed || !Object.values(boost).some(n => n && n > 0)) return;
   target.m.poiseHealed = true; this.heal(target.baseMaxhp / 8, target, target, this.effect);
  },
 };
 abilities.pyrousdominion = {...abilities.pressure, name: 'Pyrous Dominion', num: 11503, rating: 4,
  onModifyMove(move) { if (['dragonrush', 'stoneedge'].includes(move.id) && !move.isZ && !move.isMax) move.accuracy = 100; },
 };
}
