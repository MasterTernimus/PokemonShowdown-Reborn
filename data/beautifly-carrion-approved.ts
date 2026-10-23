import type {AbilityDataTable} from '../sim/dex-abilities';

function galeState(pokemon: Pokemon) {
 const entry = pokemon.previouslySwitchedIn;
 if (pokemon.m.galeBloom?.entry !== entry) {
  pokemon.m.galeBloom = {entry, speedUsed: false, supportUsed: false};
 }
 return pokemon.m.galeBloom;
}

export function installBeautiflyCarrion(abilities: AbilityDataTable) {
 abilities.pastelsanctuary = {
  ...abilities.pastelveil,
  name: 'Pastel Sanctuary', num: 11970, rating: 4,
  // Pastel Veil's onAnySwitchIn invokes onStart. Keep healing in the actual SwitchIn event.
  onSwitchIn(pokemon) {
   if (!pokemon.hp || pokemon.m.pastelSanctuaryEntry === pokemon.previouslySwitchedIn) return;
   pokemon.m.pastelSanctuaryEntry = pokemon.previouslySwitchedIn;
   for (const target of [pokemon, ...pokemon.adjacentAllies()]) {
    if (target.hp && !target.fainted) this.heal(target.maxhp / 8, target, pokemon, this.effect);
   }
  },
 };
 abilities.galebloom = {
  ...abilities.galebloom,
  onStart(pokemon) { galeState(pokemon); },
  onSourceDamagingHit(damage, target, source, move) {
   if (damage <= 0 || !source.hp || !source.isActive || target.isAlly(source) ||
    move.effectType !== 'Move' || move.category === 'Status' || move.type !== 'Flying') return;
   const state = galeState(source);
   if (!state.speedUsed) {
    state.speedUsed = true;
    this.boost({spe: 1}, source, source, this.effect);
   }
   if (!state.supportUsed) {
    const ally = source.adjacentAllies().filter(p => p.hp && !p.fainted)
     .sort((a, b) => a.hp / a.maxhp - b.hp / b.maxhp)[0];
    if (ally) {
     state.supportUsed = true;
     this.boost({spa: 1}, ally, source, this.effect);
    }
   }
  },
 };
 const carrion = abilities.carrionwatch;
 abilities.carrionwatch = {
  ...abilities.frisk, ...abilities.overcoat,
  name: carrion.name, num: carrion.num, rating: carrion.rating, flags: carrion.flags,
  onStart(pokemon) {
   this.singleEvent('Start', this.dex.abilities.get('frisk'), pokemon.abilityState, pokemon);
  },
  onImmunity(type, pokemon) {
   if (this.suppressingAbility(pokemon, this.dex.abilities.get('overcoat'))) return;
   return this.dex.abilities.get('overcoat').onImmunity?.call(this, type, pokemon);
  },
  onTryHit(target, source, move) {
   if (this.suppressingAbility(target, this.dex.abilities.get('overcoat'))) return;
   const callback = this.dex.abilities.get('overcoat').onTryHit;
   if (typeof callback === 'function') return callback.call(this, target, source, move);
  },
 };
}

export const BeautiflyCarrionDescriptions = {
 pastelsanctuary: {
  shortDesc: 'Pastel Veil; actual entry heals itself and adjacent allies by 1/8 max HP.',
  desc: 'Full local Pastel Veil, including poison prevention and cures for itself and allies, opposing Poison-move Attack and Sp. Atk drops, and all field effects. Once per actual entry, attempts to heal itself and each adjacent living ally by 1/8 of that target\'s current maximum HP. Normal healing prevention applies; full HP or a blocked heal still spends the entry activation. Other Pokemon entering, ability acquisition and restarting after suppression do not trigger this heal; an entry while suppressed does not postpone it. Global Pastel Veil is unchanged.',
 },
 galebloom: {
  shortDesc: 'Shield Dust; first Flying foe HP hit each entry gives +1 Speed and boosts an ally\'s Sp. Atk.',
  desc: 'Full local Shield Dust blocks incoming move secondary effects on this Pokemon, while retaining effects on the attacker and primary move effects. Shield Dust follows normal ability bypass rules. Once per actual entry, its first Flying attack hit to damage a foe\'s HP raises its own Speed by 1 stage, even without an ally. Separately, its first such hit with a living adjacent ally raises the lowest HP-percentage adjacent ally\'s Sp. Atk by 1 stage. Multi-hit and spread moves do not multiply either boost. Misses, immunity, protection, Substitute-only damage, allied hits, status moves and residual damage do not trigger either boost. Suppression disables these effects without renewing spent boosts; ability restarts or reacquisition do not reset them. Actual reentry resets both boosts.',
 },
 carrionwatch: {
  shortDesc: 'Frisk + Overcoat, including their full local entry and protection effects.',
  desc: 'Full local Frisk + Overcoat. Entry reveals opposing active Illusions and held items, with each item holder independently having a 30% chance of five-turn Embargo. Overcoat prevents powder moves, Rage Powder redirection, Effect Spore, sandstorm damage and hail damage, with its normal ability suppression, bypass and native-passive overlap rules. Carrion Watch no longer includes Unnerve, its Berry and field-seed restrictions, or its Cold Eclipse entry Speed drops. Normal item rules, actual opposing Unnerve, and any Frisk-inflicted Embargo still apply.',
 },
};
