/** One full local Serene Grace application per resolved move, irrespective of providers. */
export function applySereneGrace(move: ActiveMove, skipCharge = true) {
 const state = move as ActiveMove & {sereneGraceApplied?: boolean};
 if (skipCharge && move.flags.charge) delete move.flags.charge;
 if (state.sereneGraceApplied) return;
 state.sereneGraceApplied = true;
 for (const secondary of move.secondaries || []) if (secondary.chance) secondary.chance *= 2;
 if (move.self?.chance) move.self.chance *= 2;
}
