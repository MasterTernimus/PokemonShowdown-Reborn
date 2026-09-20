# Custom Mega ability audit

Generated 2026-09-19 from the local Showdown battle engine.

## Coverage and outcome

- 119 non-cosmetic Mega forms with custom abilities; 112 unique ability names.
- Singles: 119/119; Doubles: 119/119; Free-for-All: 119/119.
- 96 composite abilities were compared with their component event hooks. 4 deliberate/specialized differences remain after review.
- The roster check Mega Evolves each form, confirms its final species and ability, runs an attack-power event, and advances through another turn. Focused battle tests cover the named effects below.

## Confirmed defects fixed

- Mega Slowbro had an undefined Shell Trap ability. It now has Shell Armor and Regenerator, with battle tests for damage reduction and switch recovery.
- Gengar-Mega Cruel Tag lacked Shadow Tag trapping and damage reduction; Clawitzer-Mega Heavy Artillery and Venusaur-Mega Toxic Bloom lacked Unaware boost handling.
- Swampert-Mega Raging Current lacked Damp explosion prevention, Water Veil burn protection/Aqua Ring, and Fire damage reduction.
- Golurk-Mega Phantom Fist lacked its punch power boost; Falinks-Mega Phalanx Form lacked Battle Armor damage reduction; Aggron-Mega Iron Mountain lacked Heavy Metal physical protection.
- Other component hooks restored where applicable: Apex Predator, Joyride, Storm Fright, Mirror Greed, Relentless Link, Royal Voice, Soul Tag, Mourning Snow, Blooming Sun, Heavenly Chorus, Doom Warning, Unchecked Assault, True Devotion, Cursed Marionette, Silken Decoy, Hydra Breaker, Draconic Force, and Wooly Conductor.
- Raging Storm and Raging Overlord now apply their listed Battle Armor effects. Sand Sovereign no longer falsely advertises Battle Armor/Filter; it identifies its implemented Sand Stream, Dauntless Shield, and Solid Rock components.
- Emboar-Mega Burning Ego and the separate Reborn Mega route were fixed and verified in the preceding Emboar audit.

## Reviewed specialized differences

- Solar Trap implements its Innards Out-style retaliation at lethal damage rather than the inherited DamagingHit event; a battle test confirms the attacker takes damage.
- Apex Predator omits Relic Armor’s Lapras-Aevian-only typing change because its holder is Aerodactyl-Mega.
- Hellfire Eclipse deliberately uses custom sunlight Attack/Sp. Atk boosts and does not list Solar Power’s HP loss.
- Mourning Snow heals through its own weather residual; forwarding Ice Body’s weather healing would heal twice.

## Limits

These checks do not exhaust every move, field, item, switch pattern, or team composition for all forms. Passing the roster check establishes that the Mega route and basic ability events run in the three battle modes; the focused tests establish the listed effects. No failure remains in those checks. The repository-wide TypeScript check still reports thousands of diagnostics across existing project files; the targeted `test-npm` TypeScript check passes.

## Roster results

Each ✓ means the Mega route, ability identity, attack-power event, and following turn passed in that battle mode.

| Mega form | Custom ability | S | D | FFA |
| --- | --- | :---: | :---: | :---: |
| Venusaur-Mega | Toxic Bloom | ✓ | ✓ | ✓ |
| Charizard-Mega-X | Atrocity | ✓ | ✓ | ✓ |
| Charizard-Mega-X-Alt | Atrocity | ✓ | ✓ | ✓ |
| Charizard-Mega-Y | Sun Sovereign | ✓ | ✓ | ✓ |
| Blastoise-Mega | Siege Launcher | ✓ | ✓ | ✓ |
| Butterfree-Mega | Toxic Evolution | ✓ | ✓ | ✓ |
| Beedrill-Mega | Spiral Evolution | ✓ | ✓ | ✓ |
| Pidgeot-Mega | Storm Sovereign | ✓ | ✓ | ✓ |
| Arbok-Mega-X | Neurotoxin | ✓ | ✓ | ✓ |
| Arbok-Mega-Y | Pattern Shift | ✓ | ✓ | ✓ |
| Raichu-Mega-X | Surge Conduit | ✓ | ✓ | ✓ |
| Raichu-Mega-Y | Railgun Circuit | ✓ | ✓ | ✓ |
| Clefable-Mega | Lunar Orbit | ✓ | ✓ | ✓ |
| Parasect-Mega | Complete Parasitism | ✓ | ✓ | ✓ |
| Alakazam-Mega | Perfect Foresight | ✓ | ✓ | ✓ |
| Alakazam-Mega-Alt | Perfect Foresight | ✓ | ✓ | ✓ |
| Victreebel-Mega | Solar Trap | ✓ | ✓ | ✓ |
| Slowbro-Mega | Shell Trap | ✓ | ✓ | ✓ |
| Gengar-Mega | Cruel Tag | ✓ | ✓ | ✓ |
| Starmie-Mega | Astral Core | ✓ | ✓ | ✓ |
| Pinsir-Mega | Joyride | ✓ | ✓ | ✓ |
| Gyarados-Aevian-Mega | Helios | ✓ | ✓ | ✓ |
| Gyarados-Mega | Unleashed Ego | ✓ | ✓ | ✓ |
| Aerodactyl-Mega | Apex Predator | ✓ | ✓ | ✓ |
| Dragonite-Mega | Celestial Heart | ✓ | ✓ | ✓ |
| Meganium-Mega | Blooming Sun | ✓ | ✓ | ✓ |
| Meganium-Mega-Y | Blooming Sun | ✓ | ✓ | ✓ |
| Feraligatr-Mega | Draconic Force | ✓ | ✓ | ✓ |
| Noctowl-Mega | Sacred Power | ✓ | ✓ | ✓ |
| Ampharos-Mega | Wooly Conductor | ✓ | ✓ | ✓ |
| Ampharos-Aevian-Mega | Absolute Zero | ✓ | ✓ | ✓ |
| Sunflora-Mega | Solar Hydra | ✓ | ✓ | ✓ |
| Steelix-Mega | Iron Will | ✓ | ✓ | ✓ |
| Scizor-Mega | Technical Specialist | ✓ | ✓ | ✓ |
| Heracross-Mega | Relentless Link | ✓ | ✓ | ✓ |
| Skarmory-Mega | Golden Talons | ✓ | ✓ | ✓ |
| Houndoom-Mega | Hellfire Eclipse | ✓ | ✓ | ✓ |
| Tyranitar-Mega | Sand Sovereign | ✓ | ✓ | ✓ |
| Sceptile-Mega | Verdant Drake | ✓ | ✓ | ✓ |
| Blaziken-Mega | Blazing Tempo | ✓ | ✓ | ✓ |
| Swampert-Mega | Raging Current | ✓ | ✓ | ✓ |
| Gardevoir-Mega | Royal Voice | ✓ | ✓ | ✓ |
| Gardevoir-Mega-Z | Argent Devotion | ✓ | ✓ | ✓ |
| Gardevoir-Void-Mega | Execution | ✓ | ✓ | ✓ |
| Breloom-Mega | Corrosive Touch | ✓ | ✓ | ✓ |
| Sableye-Mega | Mirror Greed | ✓ | ✓ | ✓ |
| Mawile-Mega | Dread Maw | ✓ | ✓ | ✓ |
| Aggron-Mega | Iron Mountain | ✓ | ✓ | ✓ |
| Medicham-Mega | Enlightenment | ✓ | ✓ | ✓ |
| Manectric-Mega | Storm Fright | ✓ | ✓ | ✓ |
| Sharpedo-Mega | Razor Current | ✓ | ✓ | ✓ |
| Sharpedo-Mega-Y | Apex Armor | ✓ | ✓ | ✓ |
| Camerupt-Mega | Caldera Core | ✓ | ✓ | ✓ |
| Flygon-Mega-Z | Tremor | ✓ | ✓ | ✓ |
| Altaria-Mega | Heavenly Chorus | ✓ | ✓ | ✓ |
| Zangoose-Mega | Toxic Armor | ✓ | ✓ | ✓ |
| Seviper-Mega | Sirius | ✓ | ✓ | ✓ |
| Claydol-Mega | Astral Engine | ✓ | ✓ | ✓ |
| Banette-Mega | Cursed Marionette | ✓ | ✓ | ✓ |
| Banette-Mega-Z | Cursed Armament | ✓ | ✓ | ✓ |
| Chimecho-Mega | Wind Chime | ✓ | ✓ | ✓ |
| Absol-Mega | Doom Warning | ✓ | ✓ | ✓ |
| Absol-Mega-Z | Omen Edge | ✓ | ✓ | ✓ |
| Glalie-Mega | Freezer Burn | ✓ | ✓ | ✓ |
| Glalie-Aevian-Mega | Moss Armor | ✓ | ✓ | ✓ |
| Metagross-Mega | Iron Cognition | ✓ | ✓ | ✓ |
| Staraptor-Mega | Predator | ✓ | ✓ | ✓ |
| Luxray-Mega | Night Hunt | ✓ | ✓ | ✓ |
| Lopunny-Mega | Unchecked Assault | ✓ | ✓ | ✓ |
| Mismagius-Mega | Shadow Guard | ✓ | ✓ | ✓ |
| Bronzong-Mega | Storm Bell | ✓ | ✓ | ✓ |
| Garchomp-Mega | Apex Cleave | ✓ | ✓ | ✓ |
| Garchomp-Mega-Z | Relentless Hunt | ✓ | ✓ | ✓ |
| Lucario-Mega | Aura Instinct | ✓ | ✓ | ✓ |
| Lucario-Mega-Z | Aura Master | ✓ | ✓ | ✓ |
| Abomasnow-Mega | Frost Sovereign | ✓ | ✓ | ✓ |
| Weavile-Mega | Frost Stalker | ✓ | ✓ | ✓ |
| Gallade-Mega | Sacred Edge | ✓ | ✓ | ✓ |
| Gallade-Mega-Azzy | Sacred Edge | ✓ | ✓ | ✓ |
| Dusknoir-Mega | Reaper's Grip | ✓ | ✓ | ✓ |
| Froslass-Mega | Mourning Snow | ✓ | ✓ | ✓ |
| Serperior-Mega | Queen's Guard | ✓ | ✓ | ✓ |
| Emboar-Mega | Burning Ego | ✓ | ✓ | ✓ |
| Froslass-Aevian-Mega | Storm Calling | ✓ | ✓ | ✓ |
| Chimecho-Mega-Y | Haunted Chime | ✓ | ✓ | ✓ |
| Emboar-Mega-Reborn | Burning Ego | ✓ | ✓ | ✓ |
| Audino-Mega | Divine Intervention | ✓ | ✓ | ✓ |
| Scolipede-Mega | Venom Bastion | ✓ | ✓ | ✓ |
| Scolipede-Mega-Azzy | Venom Bastion | ✓ | ✓ | ✓ |
| Scrafty-Mega | Street Tyrant | ✓ | ✓ | ✓ |
| Reuniclus-Mega | Adaptive Power | ✓ | ✓ | ✓ |
| Eelektross-Mega | Storm Circuit | ✓ | ✓ | ✓ |
| Chandelure-Mega | Soul Tag | ✓ | ✓ | ✓ |
| Haxorus-Mega | Raging Overlord | ✓ | ✓ | ✓ |
| Golurk-Mega | Phantom Fist | ✓ | ✓ | ✓ |
| Chesnaught-Mega | Wrath Shield | ✓ | ✓ | ✓ |
| Delphox-Mega | Astral Witchcraft | ✓ | ✓ | ✓ |
| Greninja-Mega | Shadow Current | ✓ | ✓ | ✓ |
| Pyroar-Mega | Royal Sun | ✓ | ✓ | ✓ |
| Floette-Mega | Ange | ✓ | ✓ | ✓ |
| Meowstic-M-Mega | Alchemist Surge | ✓ | ✓ | ✓ |
| Meowstic-F-Mega | Alchemist Surge | ✓ | ✓ | ✓ |
| Malamar-Mega | Inversion | ✓ | ✓ | ✓ |
| Barbaracle-Mega | Hydra Breaker | ✓ | ✓ | ✓ |
| Dragalge-Mega | Toxic Renewal | ✓ | ✓ | ✓ |
| Hawlucha-Mega | Perfect Ego | ✓ | ✓ | ✓ |
| Noivern-Mega | Echo Sense | ✓ | ✓ | ✓ |
| Crabominable-Mega | Rime Knuckle | ✓ | ✓ | ✓ |
| Salazzle-Mega | Corrosive Burn | ✓ | ✓ | ✓ |
| Golisopod-Mega | Aqua Shell | ✓ | ✓ | ✓ |
| Drampa-Mega | Rain Sovereign | ✓ | ✓ | ✓ |
| Falinks-Mega | Phalanx Form | ✓ | ✓ | ✓ |
| Bellibolt-Mega | Bog Body | ✓ | ✓ | ✓ |
| Glimmora-Mega | Terastal Adaptability | ✓ | ✓ | ✓ |
| Cinderace-Mega | Perfect Striker | ✓ | ✓ | ✓ |
| Ledian-Mega | Star Boxer | ✓ | ✓ | ✓ |
| Ariados-Mega | Silken Decoy | ✓ | ✓ | ✓ |
| Roserade-Mega | True Devotion | ✓ | ✓ | ✓ |
| Clawitzer-Mega | Heavy Artillery | ✓ | ✓ | ✓ |
