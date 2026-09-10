# Field and condition audit — 2026-09-10

Local server changes; not deployed. Build succeeded. Final verification: **2,852 passing, zero failing** (see field-audit-final.json).

## Coverage and limits

- 37 custom fields and four native terrains, each exercised with 62 moves over two turns.
- All 41 fields exercised with Elemental, Magical, Synthetic and Telluric Seeds.
- Every custom field tested through the mid-battle transition path.
- Literal field, weather, status, volatile and side-condition references checked across eight implementation files; 137 format field registrations checked.
- Targeted Rocky, Icy, water-field, field-message, format and Neutralization regressions.
- This is broad runtime smoke coverage plus targeted assertions, not exhaustive proof of every ability, move, doubles, switching and field combination. Full project TypeScript checking still reports existing errors; the complete legacy test suite was not certified by this audit.

## Corrections

1. Field changes now run FieldStart, initialize field state, apply entry effects, and honor rejection with rollback. This fixes underwater weather cleanup and missing Wasteland state, among other transitions. Successful changes return true.
2. Terrain dex objects retain their supplied condition handlers.
3. Rocky failed-contact recoil now reads the actual move result. Previously it checked an unset move.success property.
4. Rocky's added Rock typing preserves other types already added to a move.
5. Cave entry removes hail rather than accidentally removing other weather and preserving hail.
6. Iron Dominion and Mirror Armor use the registered Mirror Arena field ID. Gulp Missile and Tectonic Rage use the registered Electric Terrain ID. Removed Dusty Drift's unreachable Sky field reference.
7. Telluric Seed on Wasteland processes both sides before returning.
8. Removed nonexistent Magma Armor and Sand Tomb volatile additions; retained Fire immunity and actual partial trapping. Cleaned a phantom Leppa Berry volatile reference in dormant Mystery Berry code; Mystery Berry is intentionally removed from this server's item registry, so this is not an active gameplay fix.
9. Z-Moves that create their terrain during move execution now receive the configured temporary duration and marker afterward. Splintered Stormshards has a regression checking four turns including activation and eventual expiry.

## Rocky Field rules

These describe this repository, including its custom balance; they are not a claim about standard Showdown rules.

### Attacks

| Attack | Field effect |
|---|---|
| Primary Rock-type attacks | 1.5× base power |
| Bulldoze, Earthquake, Magnitude, Rock Climb, Strength | Add Rock typing alongside existing typing; 1.5× base power |
| Accelerock | Both Rock and named bonuses apply: 2.25× total |
| Rock Smash | 2× base power |
| Rock Climb | Also gains one critical-hit stage |
| Rock Polish | Raises Speed three stages |
| Nature Power | Calls Rock Smash |
| Secret Power | 30% flinch secondary |
| Camouflage / Mimicry | Rock typing |
| Terrain Pulse | Rock typing; this implementation has base power 50 with no terrain doubling handler |

The general Rock bonus tests the primary move.type. Merely gaining secondary Rock typing does not add another 1.5× bonus. Final damage also depends on stats, STAB, effectiveness, abilities and other modifiers.

### Defense, bullets and flinching

A positive Defense stage prevents flinching. It also blocks moves flagged as bullets; Substitute independently blocks those moves. High unboosted Defense is insufficient. The message says the move rebounded, but the implementation cancels the hit: it does not reflect damage or damage the Substitute.

If a Pokémon actually flinches, it takes one quarter of base maximum HP as field damage, except with Sturdy or Steadfast. Magic Guard prevents this indirect damage. If a contact move returns failure, the user takes one eighth of base maximum HP; Rock Head exempts it, Magic Guard prevents the damage, and Long Reach removes contact. Successful contact has no such penalty.

### Stealth Rock and seeds

Rocky doubles Stealth Rock's *effectiveness exponent*, not its final damage. Before rounding or protection:

| Rock effectiveness | Entry damage |
|---|---|
| ¼× | 1/128 maximum HP |
| ½× | 1/32 maximum HP |
| Neutral | 1/8 maximum HP |
| 2× weak | 1/2 maximum HP |
| 4× weak | 2× maximum HP, enough to KO |

This unusually severe weakness scaling was verified and retained as existing balance. Ordinary hazard protections still apply.

Telluric Seed is consumed, raises Defense one stage, and deals Rock-scaled damage based on one quarter maximum HP: neutral 25%, 2× weak 50%, 4× weak 100%, and ½× resistant 12.5%, before rounding/protection. Its Defense boost enables the field's bullet and flinch protection if the Pokémon survives.

Arenite Wall can be used without sandstorm and lasts eight turns here. It halves super-effective damage subject to its critical-hit and infiltration bypasses.

### Ability interactions

- Rocky Payload uses a 2× attacking-stat modifier here rather than its usual 1.5× for Rock-containing moves, alongside its own STAB behavior.
- Hyper Drill, Piercing Drill and Power Drill strengthen drill/horn moves to 2× and let them bypass Protect here; individual abilities retain their other effects.
- Predator uses its 2× modifier here when its target timing condition is met (newly switched or still queued to move).
- Relentless Hunt uses its 1.5× field power modifier here.
- Long Reach removes contact but also applies a 0.9× accuracy modifier to numeric-accuracy moves here. Its other general effects remain.
- Rock Head, Sturdy, Steadfast and Magic Guard interact with the collision rules described above.

### Duration and changing fields

A starting Rocky Field uses duration 9999, effectively battle-long unless replaced. A normal Splintered Stormshards Z-Move creates it for four turns including activation; after that turn's upkeep three remain. Its move also has a 1.3× power modifier when the field can be set. The generic terrain system controls replacement and restoration. Rocky has no dedicated destruction trigger in its own AfterMove handler.

## Reproduce

Run `node build`, then:

```text
node node_modules/mocha/bin/mocha.js --no-config test/sim/moves/field-regressions.js test/sim/moves/rockyfield.js test/sim/moves/field-audit.js test/sim/moves/field-data-integrity.js test/sim/moves/icyfield.js test/sim/moves/waterfields.js test/sim/moves/waterfield-messages.js test/sim/team-validator/field-formats.js test/sim/abilities/neutralization.js
```
