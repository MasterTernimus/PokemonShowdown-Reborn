/** Serene Grace doubles each secondary once, including when shared by an ally. */
export function applySereneGrace(move: ActiveMove, provider = 'serenegrace') {
 const state = move as ActiveMove & {sereneGraceApplied?: boolean; sereneGraceProviders?: string[]; sereneGraceFactor?: number};
 const providers = state.sereneGraceProviders ||= [];
 if (!providers.includes(provider)) providers.push(provider);
 const factor = 2;
 state.sereneGraceFactor = factor;
 state.sereneGraceApplied = true;
 for (const effect of [...(move.secondaries || []), ...(move.self ? [move.self] : [])]) {
  if (!effect.chance) continue;
  const record = effect as typeof effect & {sereneGraceFactor?: number};
  const multiplier = factor / (record.sereneGraceFactor || 1);
  record.chance = Math.min(100, record.chance! * multiplier);
  record.sereneGraceFactor = factor;
 }
}
