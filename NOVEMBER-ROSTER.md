# November roster update

Implemented locally; not published.

## Farigiraf

Armor Tail replaces Gluttony as its passive, blocking opposing priority and reducing attack damage by 20% under the existing armor field and strongest-reduction rules. Choices: Twin Appetite / Twin Focus / Royal Decree. Twin Focus makes Psychic attacks ignore positive defensive stages.

## Paradox abilities

Each ancient form has Protosynthesis as its single passive; each future form has Quark Drive. Booster Energy works with these passives. Koraidon and Miraidon are unchanged. Hidden abilities are design choices inspired by their lore.

| Pokémon | Ability 1 | Ability 2 | Hidden |
|---|---|---|---|
| Great Tusk | Rolling Fortress | Siege Tusks | Battle Armor |
| Scream Tail | Competitive | Friend Guard | Intimidate |
| Brute Bonnet | Spore Shroud | Regenerator | Strong Jaw |
| Flutter Mane | Infiltrator | Prankster | Levitate |
| Slither Wing | Cinder Scales | Overcoat | Tough Claws |
| Sandy Shocks | Magnet Pull | Hydra Bond | Sand Force |
| Roaring Moon | Intimidate | Free Flight | Strong Jaw |
| Walking Wake | Pressure | Water Veil | Swift Swim |
| Gouging Fire | Pressure | Flash Fire | Turboblaze |
| Raging Bolt | Pressure | Volt Absorb | Transistor |
| Iron Treads | Rolling Fortress | Siege Tusks | Speed Boost |
| Iron Bundle | Prankster | Evil Santa | Slush Rush |
| Iron Hands | Grit Grappler | Sheer Force | Iron Fist |
| Iron Jugulis | Strings of Ruin | False Liberation | Mega Launcher |
| Iron Moth | Cinder Scales | Dawn Herald | Levitate |
| Iron Thorns | Sand Stream | Mountain Hide | Analytic |
| Iron Valiant | Void Veil | Ruptured Heaven | Download |
| Iron Leaves | Justified | Sharpness | Mind's Eye |
| Iron Boulder | Justified | Sharpness | Rock Head |
| Iron Crown | Justified | Sharpness | Steelworker |

Lore references: [official descriptions](https://press.pokemon.com/en/OVER-ONE-THOUSAND-POKEMON-ACROSS-THE-FRANCHISE-NOW-DISCOVERED), [Paradox descriptions](https://bulbapedia.bulbagarden.net/wiki/Paradox_Pok%C3%A9mon).

## Starmie

Passive: Illuminate. Choices: Cosmic Analysis / Natural Cure / Victory Star. Cosmic Analysis combines full local Analytic and Download, including Download’s entry boost, first damaging move critical hit and field bonuses. Staryu and Mega Starmie are unchanged.

## Evergreen and Scavenger

- Evergreen restores the last consumed Berry or field Seed at turn end: 50% normally, guaranteed in hail/snow. Removes Ripen and Overcoat; ordinary Harvest is unchanged.
- Scavenger heals 1/4 base max HP when another active Pokémon faints, once per turn. Removes Big Pecks, Regenerator and Overcoat. Carrion Watch remains Mandibuzz’s Overcoat option.

## Tyranitar, Hitmon passives and Sylveon

- Regular Tyranitar: Earth Eater / Battle Armor / Dread Presence; retains Sand Stream passive. Dread Presence is Dark Aura + Unnerve. Mega Tyranitar is unchanged.
- Punch Fiend: Iron Fist + Keen Eye. Kick Fiend: Striker + Limber. Spin Fiend: Technician + Steadfast. Removes Serene Grace from the first two and Vital Spirit from Spin Fiend.
- Sylveon: Competitive / Soothing Presence / Aroma Veil; Pixilate passive unchanged. Aroma Veil replaces Fairy Aura as approved, but is also a component of Soothing Presence.

## Breaking News

Removed its 25% Psychic/Fairy power bonus against exposed foes. Forewarn, exposure, and defensive-stage bypass for the reporter and adjacent allies remain.

## Other changes

- Astral Witchcraft: Levitate + Magic Guard + Serene Grace; replaces Void Guile. Mega Delphox’s passive is unchanged.
- Lunar Orbit explicitly includes Serene Grace without doubling its existing multiplier again.
- Volt Tackle loses its extra Electric Terrain multiplier; normal terrain bonus and recoil removal remain.
- Slowking-Galar: Neutralization / Own Tempo / Regenerator; passive unchanged.
- Worldbreaker becomes Strings of Ruin. Old-name imports still resolve; mechanics unchanged.
- Current server metadata overrides stale inferred client components. Older composite reveals remain compatible in replays.

## Aevian passives and approved stats

Only previously empty passive slots were filled. Existing Lapras, Milotic, Toxtricity and Skeledirge Aevian passives are preserved. Glimmora’s Self Repair is the explicitly requested exception to the minor-passive theme; Adaptive Core now contains Download + Defragment.

| Form | New passive |
|---|---|
| Arcanine-Aevian | Early Bird |
| Glalie-Aevian | Levitate |
| Glalie-Aevian-Mega | Levitate |
| Froslass-Aevian | Own Tempo |
| Froslass-Aevian-Mega | Own Tempo |
| Gyarados-Aevian | Own Tempo |
| Gyarados-Aevian-Mega | Own Tempo |
| Lapras-Aevian-Gmax | Own Tempo |
| Ampharos-Aevian | Static |
| Ampharos-Aevian-Mega | Static |
| Roserade-Aevian | Poison Point |
| Gastrodon-Aevian | Sticky Hold |
| Gastrodon-East-Aevian | Sticky Hold |
| Mismagius-Aevian | Own Tempo |
| Chandelure-Aevian | Static |
| Volcarona-Aevian | Big Pecks |
| Golisopod-Aevian | Heatproof |
| Golisopod-Aevian-Mega | Heatproof |
| Kommo-o-Aevian | Own Tempo |
| Sneasler-Aevian | Keen Eye |
| Arboliva-Aevian | Early Bird |
| Glimmora-Aevian | Self Repair |
| Glimmora-Aevian-Mega | Self Repair |

Approved stats (HP / Atk / Def / SpA / SpD / Spe):

- Glalie-Aevian: 110 / 110 / 105 / 50 / 85 / 40 — 500 BST.
- Mega Glalie-Aevian: 110 / 135 / 105 / 90 / 85 / 80 — **605 BST**. The proposal incorrectly labelled it 600; the exact approved stats preserve its previous 605 total.
- Froslass-Aevian: 70 / 70 / 70 / 110 / 70 / 110 — unchanged, 500 BST.
- Mega Froslass-Aevian: 70 / 80 / 80 / 140 / 100 / 130 — 600 BST.

Their selectable ability names and typings are unchanged. The approved Levitate and Heatproof component migrations are described below.

## Checks

Latest passive migration checks: server build and type-check passed; 14 focused server tests and 148 focused client tests passed, with one client test pending. All 28 Aevian records match between server and client for abilities, passives and stats, with matching final server source fingerprint. These are targeted checks, not a full-suite pass. Production HTML/news generation was deliberately skipped. Leaf’s engine has not been repackaged and nothing was pushed.

Levitate is now separate from Moss Armor (Stamina + Natural Cure). Heatproof is now separate from Desert Shell (Skill Link + Sand Stream).

Echo Fiend: ordinary sound boost 1.2x (field bonuses preserved); inherited by Echo Sense. Cursed Body/Mourning Snow faint curses: two 1/8-HP end-of-turn ticks, then clear. Ordinary Curse and other ability curses retain their existing rules.

Echo Fiend follow-up: Cave, Volcanic and Crystal Cavern now use 1.5x rather than 2x; ordinary 1.2x and Mountain/Snowy Mountain 1.5x retained. Echo Sense inherits the same change.

Shed Skin cleanup now sends removal messages for otherwise silent lingering conditions and cancels Yawn/Perish Song without triggering sleep/faint. Client Perish Song end messages clear all countdown indicators, including silent messages. Dragon’s Den behavior remains unchanged.

Galar starters: Rising Striker/Rhythm/Marksman replace Set Piece/Drum Guard/Patient Marksman. Base Inteleon replaces Dual Wield with Infiltrator; Calculated Shot adds full local Sniper while retaining Frisk and Water effects. Gmax: Grand Striker (Striker + Defiant + Rising Striker, including boosted G-Max Fireball), Grand Rhythm (Forest Surge + Rising Rhythm), Grand Marksman (Mega Launcher + Dual Wield + Rising Marksman, Water 1.2x). Rising uses persist across form/ability changes until switching. Starter passives unchanged.

Follow-up: Sniper removed from Calculated Shot; Frisk, Water critical-hit stage and maximum rolls retained.
