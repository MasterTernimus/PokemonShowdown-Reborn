import type {AbilityData, AbilityDataTable} from '../sim/dex-abilities';
import {SignaturePassiveComponents} from './passive-ability-cleanup';

/** Component-specific bypass preserves Infiltrator when Limber is ignored. */
export function installMoonlitProwl(abilities: AbilityDataTable) {
 SignaturePassiveComponents.moonlitprowl = ['infiltrator', 'limber'];
 const ability: AbilityData = {
  name: 'Moonlit Prowl', num: 11971, rating: 3.5, flags: {},
  onModifyMove: abilities.infiltrator.onModifyMove,
 };
 for (const [key, value] of Object.entries(abilities.limber)) {
  if (!key.startsWith('on')) continue;
  (ability as any)[key] = typeof value === 'function' ? function (this: Battle, ...args: any[]) {
   const limber = this.dex.abilities.get('limber');
   if (this.suppressingAbility(this.effectState.target, limber)) return;
   return (value as Function).apply(this, args);
  } : value;
 }
 abilities.moonlitprowl = ability;
}
