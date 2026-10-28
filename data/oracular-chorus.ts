import type {AbilityDataTable} from '../sim/dex-abilities';
import {composeSelectedAbility} from './selected-mega-simplifications';
import {skipPassiveComponent} from './passive-ability-cleanup';
export const OracularChorusDescription = {
  "shortDesc": "Psychic STAB + Soundproof + Resonance Force.",
  "desc": "Psychic moves receive STAB. Immune to sound moves from other Pokémon. Resonance Force boosts its side's sound moves by 50% and protects allies from allied damaging sound moves."
};
export function installOracularChorus(abilities: AbilityDataTable) {
 // Avoid repeating the same sound component if it is also acquired as a selected ability.
 for (const key of ['onBasePower', 'onAllyBasePower', 'onAnyTryHit'] as const) {
  const handler = abilities.resonanceforce[key] as any;
  (abilities.resonanceforce as any)[key] = function (this: Battle, ...args: any[]) {
   if (skipPassiveComponent(this, this.effectState.target, 'resonanceforce')) return;
   if (key === 'onAllyBasePower' && this.effect.id === 'oraclesrefrain' && args[1] === this.effectState.target) return;
   return handler?.apply(this, args);
  };
 }
 abilities.oraclesrefrain = {name:"Oracle's Refrain",num:12003,rating:4,flags:{},...OracularChorusDescription};
 composeSelectedAbility(abilities, 'oraclesrefrain', ['resonanceforce', 'soundproof'], true);
 abilities.oraclesrefrain.onModifyMove = function (move) {
  if (move.category !== 'Status' && move.type === 'Psychic') move.forceSTAB = true;
 };
 // A selected duplicate of the complete passive must not multiply its effects again.
 for (const [key, handler] of Object.entries(abilities.oraclesrefrain)) {
  if (!key.startsWith('on') || typeof handler !== 'function') continue;
  (abilities.oraclesrefrain as any)[key] = function (this: Battle, ...args: any[]) {
   if (!this.effectState.speciesPassive && this.effectState.target?.getPassives().includes('oraclesrefrain')) return;
   return handler.apply(this, args);
  };
 }
}
