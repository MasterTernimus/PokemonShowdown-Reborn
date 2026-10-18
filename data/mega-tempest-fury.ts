import type {AbilityData} from '../sim/dex-abilities';

/** Lifetime state belongs to the individual Pokemon, not its resettable ability/passive state. */
export const MegaTempestFury: Partial<AbilityData> = {
 onStart() {},
 onSwitchIn() {},
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
