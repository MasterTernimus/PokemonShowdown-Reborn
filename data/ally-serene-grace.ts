/** One full local Serene Grace application per resolved move, irrespective of providers. */
export function applySereneGrace(move: ActiveMove) {
 const state = move as ActiveMove & {sereneGraceApplied?: boolean};
 if (state.sereneGraceApplied) return;
 state.sereneGraceApplied = true;
 if (move.flags.charge) delete move.flags.charge;
 for (const secondary of move.secondaries || []) if (secondary.chance) secondary.chance *= 2;
 if (move.self?.chance) move.self.chance *= 2;
}
