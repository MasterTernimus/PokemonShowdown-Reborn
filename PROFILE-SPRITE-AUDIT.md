# Profile and sprite audit — 2026-09-14

## Fixed

- Consolidated 17 duplicate client object entries. Preserved complete shiny sprite metadata, correct dimensions, form links, move effects, and learnset additions.
- Fixed inherited extra ability slots on Mega/Gmax profiles and missing data on native cosmetic forms. Cosmetic aliases such as Burmy-Sandy/Trash no longer enter the special-event ability-slot path.
- Added the missing client Reuniclus-Mega profile and synchronized mismatched stats/types/abilities with the server, including Eevee-Starter-Alt, Rotom, Lilligant, Zangoose-Reborn, and Seviper-Reborn.
- Corrected Absolute Zero's incoming Fire resistance and restricted its Ice-versus-Fire effect to its holder. Updated composite ability aliases and descriptions for the current ability designs.
- Included the new Kommo-o-Aevian profile, learnset, Vile Assault, abilities, front/back/shiny sprites and menu icons; retained the current Aevian balance and icon changes.
- Completed Klinklang's Light Metal/90 Special Attack change and Unovan Zoroark's exact Hisuian stat match on both sides.

## Verification

- Server/client comparison: 1,662 profiles agree on stats, types and ability slots. The deliberately retired Luxray-Deso skin is excluded explicitly by the audit.
- Duplicate-key scan: zero remaining duplicate object keys in the checked server data and client Dex source.
- Server regression suite: 223 passing, including Mega/Gmax routes, earlier custom abilities, field regressions, new ability behavior, and legality.
- Client menu icon, teambuilder art and Furfrou suites: 2,875 passing, including verification against the shipped bundle.
- Changed-sprite audit: 260 selections, 82 existing files, zero errors; additional new-profile audit: 336 selections passing. Ampharos and Glalie profile/sprite checks also pass.
- All 15 selectable Aevian client profiles have legal labels. Every listed ability slot on selectable server Aevian profiles validates in the custom no-field singles, Water Surface singles and Water Surface doubles formats. Kommo-o-Aevian, Musharna and Vile Assault have explicit client checks.

Gmax profiles retain transformation-only labels; their base forms are selectable and the tested Gmax routes work. These checks concern this server's custom formats, not official Showdown ladders. Automated checks cover asset selection/existence and metadata, not a manual inspection of every animation frame or every possible battle interaction.

Both builds succeed. The optional client news-refresh hook cannot run because PHP is absent; TypeScript compilation succeeds.
