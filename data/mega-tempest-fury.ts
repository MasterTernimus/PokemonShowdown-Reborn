import type {AbilityData} from '../sim/dex-abilities';

/** Lifetime state belongs to the individual Pokemon, not its resettable ability/passive state. */
export const MegaTempestFury: Partial<AbilityData> = {
 onStart(pokemon) { this.dex.abilities.get('angerpoint').onStart?.call(this, pokemon); },
 onSwitchIn(pokemon) { this.dex.abilities.get('angerpoint').onStart?.call(this, pokemon); },
 onHit(target, source, move) { this.dex.abilities.getHandler('angerpoint', 'onHit')?.call(this, target, source, move); },
 onDamagingHit(damage, target, source) {
  if (!target.hp || damage <= 0 || !source || target.isAlly(source) || target.m.megaTempestAcquired) return;
  target.m.megaTempestAcquired = true;
  target.m.megaTempestCharged = true;
 },
 onModifyMove(move, pokemon) {
  if (pokemon.m.megaTempestCharged && move.type === 'Water' && move.category !== 'Status') move.willCrit = true;
 },
 onSourceDamagingHit(damage, target, source, move) {
  if (damage > 0 && !target.isAlly(source) && move.type === 'Water') source.m.megaTempestCharged = false;
 },
 onSourceAfterSubDamage(damage, target, source, move) {
  if (damage > 0 && !target.isAlly(source) && move.type === 'Water') source.m.megaTempestCharged = false;
 },
};
