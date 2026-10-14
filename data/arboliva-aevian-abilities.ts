import type {AbilityDataTable} from '../sim/dex-abilities';
import {skipPassiveComponent} from './passive-ability-cleanup';
export function installArbolivaAevianAbilities(abilities: AbilityDataTable) {
 abilities.badseeds = {
  name: 'Bad Seeds', num: 11457, rating: 4, flags: {breakable: 1},
  onStart(pokemon) {
   if (pokemon.m.badSeedsContact || this.field.isAura('frozenaura') || this.field.isTerrain(['dragonsdenterrain', 'coldeclipseterrain'])) return;
   const duration = pokemon.hasItem('amplifieldrock') ? 8 : 5;
   if (!this.field.terrain || this.field.isTerrain(['icyterrain', 'snowymountainterrain'])) {
    this.field.setFieldOrAura('coldeclipseterrain', duration, pokemon, this.effect, true);
   } else {
    this.field.setAura('frozenaura', duration, pokemon, this.effect);
   }
  },
  // Observe the normal effectiveness event once, after field rules; never rerun it for damage protection.
  onEffectivenessPriority: -100,
  onEffectiveness(typeMod, target, type, move) {
   if (type === 'Ice') { this.effectState.iceWeaknessMove = move; this.effectState.iceWeakness = typeMod; }
  },
  onSourceModifyDamage(damage, source, target, move) {
   if (this.field.isTerrain('coldeclipseterrain') && target.hasType('Ice') && this.effectState.iceWeaknessMove === move && this.effectState.iceWeakness > 0) return this.chainModify(0.5);
  },
  onDamagingHit(damage, target, source, move) {
   if (!this.field.isTerrain('coldeclipseterrain') || source.hasType('Ice') || source.getAbility().flags.cantsuppress || source.ability === 'badseeds') return;
   if (!this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) return;
   source.m.badSeedsContact = true;
   try { source.setAbility('badseeds', target, this.effect); } finally { delete source.m.badSeedsContact; }
  },
  onResidualOrder: 28,
  onResidual(pokemon) {
   if (this.field.isTerrain('coldeclipseterrain') && !pokemon.hasType('Ice')) this.boost({atk: -1, spa: -1}, pokemon, pokemon);
  },
 };
 // Preserve each primitive's complete local callbacks, with passive-component deduplication.
 const combined: any = {name: "Winter's Malice", num: 11458, rating: 4.5, flags: {}};
 for (const id of ['refrigerate', 'berserk', 'cursedbody']) {
  for (const [key, callback] of Object.entries(abilities[id as ID])) {
   if (!key.startsWith('on')) continue;
   if (typeof callback !== 'function') { combined[key] = callback; continue; }
   const previous = combined[key];
   combined[key] = function (this: Battle, ...args: any[]) {
    const first = previous?.apply(this, args);
    if (skipPassiveComponent(this, this.effectState.target, id)) return first;
    const second = callback.apply(this, args);
    return second === undefined ? first : second;
   };
  }
 }
 abilities.wintersmalice = combined;
}
