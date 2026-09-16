# Flower Garden Release Audit

## Included

- Flower Garden stages 1-5, transitions, stage effects, and player documentation.
- Selectable Singles, Doubles, 3P/4P Free-for-All, and Multi formats.
- Parasect-Aevian rename, Mega Parasect, Parasectite, and revival sequencing.
- Mega Ariados Cocoon status/secondary protection, Swarm, and regular Ariados HP 80.
- Removal of Proficient from composite abilities, preserving standalone Proficient.
- G-Max Sandblast no longer creates Desert.
- Matching client profiles, descriptions, field backgrounds, and sprite fixes.
- Client Feraligatr Poison Fang restored by correcting the removal list.

## Verification

- Server build passed; 149 focused simulation/regression tests passed.
- All five format variants start with Flower Garden 1 and support stage growth.
- Client build passed (optional PHP news hook unavailable locally).
- 1,162 focused client sprite/art tests passed.
- Browser verification passed for all five backgrounds through growth and cut-down.
- Parasect normal/shiny front/back assets, items, profiles, and legacy aliases verified.
- Broader client battle suite: 43 passed, 1 pending, 7 failed. Five failures reproduce
  with the prior battle-dex source (Togekiss, Lapras, Medicham, Lopunny, ability text).
  Two additional assertions expect pre-audit Rotom/Bellibolt dimensions. These remain
  unresolved; this is not a clean full-suite result.

## Excluded

- Local diagnostic logs/reports and unused replacement Aevian party icons.
- Wildfire Core damage adjustment pending clarification.
