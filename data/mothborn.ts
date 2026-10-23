import type {AbilityDataTable} from '../sim/dex-abilities';
import {SignaturePassiveComponents} from './passive-ability-cleanup';

/** Venomoth's independent Bug STAB and Shield Dust package. */
export function installMothborn(abilities: AbilityDataTable) {
 SignaturePassiveComponents.mothborn = ['shielddust'];
 abilities.mothborn = {
  name: 'Mothborn', num: 11968, rating: 3.5, flags: {},
  onModifyMove(move) {
   if (move.category !== 'Status' && move.type === 'Bug') move.forceSTAB = true;
  },
  onModifySecondaries(secondaries, target, source, move) {
   const shieldDust = this.dex.abilities.get('shielddust');
   if (this.suppressingAbility(this.effectState.target, shieldDust)) return;
   return shieldDust.onModifySecondaries?.call(this, secondaries, target, source, move);
  },
 };
}
