import type {AbilityDataTable} from '../sim/dex-abilities';

interface CocoonState {
 entry: number;
 specialUsed: boolean;
 poisonUsed: boolean;
 guardedMove?: ActiveMove;
 guardedSource?: Pokemon;
}
function cocoonState(pokemon: Pokemon): CocoonState {
 // This native counter changes only on an actual entry, including entries under suppression.
 const entry = pokemon.previouslySwitchedIn;
 if (pokemon.m.toxicCocoon?.entry !== entry) {
  pokemon.m.toxicCocoon = {entry, specialUsed: false, poisonUsed: false};
 }
 return pokemon.m.toxicCocoon;
}

export function installDustoxAbilities(abilities: AbilityDataTable) {
 abilities.nightforager = {
  name: 'Night Forager', num: 11969, rating: 3.5, flags: {},
  onSourceDamagingHit(damage, target, source, move) {
   if (damage <= 0 || !source.hp || !source.isActive || target.isAlly(source) ||
    move.effectType !== 'Move' || move.category === 'Status' ||
    !(this.movehasType(move, 'Bug') || this.movehasType(move, 'Poison')) ||
    source.m.nightForagerTurn === this.turn) return;
   source.m.nightForagerTurn = this.turn;
   this.heal(source.maxhp / 8, source, source, this.effect);
  },
 };
 abilities.toxiccocoon = {
  ...abilities.toxiccocoon,
  onStart(pokemon) { cocoonState(pokemon); },
  onModifySecondaries(secondaries, target, source, move) {
   // Preserve the original guard/contact rules; only Shield Dust uses its primitive bypass rules.
   if (this.suppressingAbility(this.effectState.target, this.dex.abilities.get('shielddust'))) return;
   return this.dex.abilities.get('shielddust').onModifySecondaries?.call(this, secondaries, target, source, move);
  },
  onSourceModifyDamage(damage, source, target, move) {
   if (move.category !== 'Special' || source.isAlly(target)) return;
   const state = cocoonState(target);
   const attack = this.activeMove || move;
   if (!state.specialUsed || (state.guardedMove === attack && state.guardedSource === source)) {
    return this.chainModify(0.5);
   }
  },
  onDamagingHit(damage, target, source, move) {
   if (damage <= 0 || source.isAlly(target)) return;
   const state = cocoonState(target);
   if (move.category === 'Special' && !state.specialUsed) {
    state.specialUsed = true;
    state.guardedMove = this.activeMove || move;
    state.guardedSource = source;
   }
   if (!state.poisonUsed && this.checkMoveMakesContact(move, source, target)) {
    state.poisonUsed = true;
    source.trySetStatus('psn', target, this.effect);
   }
  },
 };
}

export const DustoxAbilityDescriptions = {
 nightforager: {
  desc: 'Once per turn, its first damaging Bug- or Poison-type move to deal actual opposing HP damage attempts to heal 1/8 of its current maximum HP. Each turn has only one activation, including all hits and targets; a blocked heal or being at full HP still spends that activation. Substitute-only damage, misses, protection, immunity, ally damage, status moves and residual damage do not trigger it. Normal ability suppression and healing prevention apply.',
  shortDesc: 'First Bug/Poison move dealing foe HP damage each turn heals 1/8 max HP.',
 },
 toxiccocoon: {
  desc: 'Full local Shield Dust blocks incoming move secondary effects on this Pokemon, while preserving attacker self-effects and primary effects; normal Shield Dust ability bypass applies. Once per actual entry, the first opposing Special attack to damage its HP has its ordinary damage halved for the whole triggering move, including all hits. As before, Special damage to a Substitute can be halved before the charge is spent, but Substitute-only damage does not consume it. Separately, its first opposing contact HP hit each entry attempts to poison the attacker; immunity still spends that attempt. Suppression, ability restarts and reacquisition do not refresh either charge; switching out and actually entering again does.',
  shortDesc: 'Shield Dust; first Special HP attack each entry is halved for all hits; first contact attacker is poisoned.',
 },
};
