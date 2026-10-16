/** Natural Grace does not stack; each distinct approved provider contributes once. */
export function applySereneGrace(move: ActiveMove, skipCharge = true, provider = 'serenegrace') {
 const state = move as ActiveMove & {sereneGraceApplied?: boolean; sereneGraceProviders?: string[]; sereneGraceFactor?: number};
 if (skipCharge && move.flags.charge) delete move.flags.charge;
 const providers = state.sereneGraceProviders ||= [];
 if (!providers.includes(provider)) providers.push(provider);
 const auraCount = providers.filter(id => id === 'voidomen' || id === 'lunarorbit').length;
 const factor = 2 ** Math.max(1, auraCount);
 state.sereneGraceFactor = factor;
 state.sereneGraceApplied = true;
 for (const effect of [...(move.secondaries || []), ...(move.self ? [move.self] : [])]) {
  if (!effect.chance) continue;
  const record = effect as typeof effect & {sereneGraceFactor?: number};
  const multiplier = factor / (record.sereneGraceFactor || 1);
  record.chance = Math.max(record.chance!, Math.min(60, record.chance! * multiplier));
  record.sereneGraceFactor = factor;
 }
}
