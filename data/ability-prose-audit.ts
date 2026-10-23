/** Presentation-only wording pass over all 1072 resolved abilities. No callback or component changes. */
export const AbilityProseAudit: Record<string,{desc:string;shortDesc:string}> = {
  "selfrepair": {
    "desc": "Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal.",
    "shortDesc": "Heals 1/16 max HP each turn and ignores sandstorm and hail damage."
  },
  "mossarmor": {
    "desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal. switching out heals 1/8 max HP only after a Grass attack dealt opposing HP damage on the current or immediately preceding turn, with no intervening action.",
    "shortDesc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded."
  },
  "hisuianpath": {
    "desc": "Absorbs Grass moves for +1 Attack and Sp. Atk; allied Grass moves also grant both boosts. Heals 1/8 max HP each turn on Forest and 1/16 on Grassy Field. Prevents flinching and Intimidate's Attack drop. Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage.",
    "shortDesc": "Absorbs Grass moves for +1 Attack and Sp. Atk; allied Grass moves also grant both boosts."
  },
  "scarecrow": {
		"desc": "Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack and Sp. Atk each turn. Steel moves receive STAB and use 1.5x Attack or Sp. Atk (2x on Factory). On Short-Circuit, Steel moves also gain Electric typing. Adds Steel resistances and Poison immunity without Steel weaknesses. Attacks use double the offensive stat against targets that entered this turn.",
    "shortDesc": "Absorbs wind moves for +1 Attack."
  },
  "bruteforce": {
    "desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power. Prevents move recoil except Struggle. Crash and Life Orb damage still apply.",
    "shortDesc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded."
  },
  "gigavolt": {
    "desc": "Moves ignore bypassable opposing abilities. Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts. Contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit.",
    "shortDesc": "Moves ignore bypassable opposing abilities."
  },
  "moonveil": {
    "desc": "Allies take 25% less damage from attacks. It and its allies cannot be poisoned. Gaining this Ability while it or its ally is poisoned cures them. Before an opposing Pokemon uses a Poison-type move, that Pokemon's Attack and Special Attack are lowered by 1 stage. On entry, creates Misty Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
    "shortDesc": "Allies take 25% less damage from attacks."
  },
  "kickfiend": {
    "desc": "Kicking moves have 1.4x power. On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind.",
    "shortDesc": "Kicking moves have 1.4x power."
  },
  "wreckingball": {
    "desc": "Prevents OHKO moves. At full HP, survives an otherwise fatal attack hit with 1 HP. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. When it is hit by a Physical attack, Stealth Rock is set on the attacker's side unless a water field is active or that side already has Stealth Rock.",
    "shortDesc": "Prevents OHKO moves."
  },
  "swiftdrill": {
    "desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection. Heals 1/16 max HP each turn in effective rain.",
    "shortDesc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone."
  },
  "stormsong": {
    "desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. On entry, summons rain for 5 turns, or 8 with Damp Rock.",
    "shortDesc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power."
  },
  "hisuianoath": {
    "desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Contact moves have 1.3x power. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
    "shortDesc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale."
  },
  "aevianoath": {
    "desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. Separate power boosts apply to both 60%-power hits. In Free-for-All, both hits still use 60% power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats.",
    "shortDesc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale."
  },
  "hisuianvanguard": {
		"desc": "On its first active turn, its Speed is 1.5x and its Sp. Atk is 1.2x. Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack and Sp. Atk each turn.",
    "shortDesc": "On its first active turn, its Speed is 1.5x and its Sp. Atk is 1.2x."
  },
  "unovawing": {
    "desc": "Critical-hit and Competitive effects; no Unburden. Stat drops can raise Special Attack, but item use or loss no longer doubles Speed.",
    "shortDesc": "Critical-hit and Competitive effects; no Unburden."
  },
  "aeviantoxin": {
    "desc": "Biting moves have 1.5x power. Doubles Defense; immune to powder effects, sandstorm and hail damage. Attacks always critically hit poisoned foes or on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three. Drapion becomes Drapion-Rejuv on entry.",
    "shortDesc": "Biting moves have 1.5x power."
  },
  "aeviangrief": {
    "desc": "Opposing status moves that check accuracy have 50% base accuracy. On Rainbow Field, opposing status moves fail their accuracy check. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes.",
    "shortDesc": "Opposing status moves that check accuracy have 50% base accuracy."
  },
  "nobleconduit": {
    "desc": "Special moves have 1.3x power, with a further 1.5x boost on Electric Terrain. Allies' special moves have 1.3x power. In effective sun, Attack and Sp. Atk are 1.5x and it loses 1/8 max HP each turn. Cold Eclipse disables both effects. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage.",
    "shortDesc": "Special moves have 1.3x power, with a further 1.5x boost on Electric Terrain."
  },
  "crueltag": {
    "desc": "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability. It takes 0.8x damage from attacks. On Haunted Field, it reveals foes' held items on entry. This Ability cannot be suppressed. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field.",
    "shortDesc": "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability."
  },
  "cruelshell": {
    "desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. When it has more than 1/2 its max HP and takes damage from an attack bringing it to 1/2 or less of its max HP, its Attack, Special Attack, and Speed are raised by 1 stage, and its Defense and Special Defense are lowered by 1 stage. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
    "shortDesc": "Prevents critical hits and takes 20% less attack damage."
  },
  "alchemistsurge": {
		"desc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules. Foe stat drops give +2 Sp. Atk, except on Chessboard. On Chessboard, move power instead rises with missing HP, from 1x at full HP to 2x at 20% HP or less. Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. Psychic Surge follows the existing field/Aura rules: it can create Psychic Terrain on an empty field or Psychic Aura over a compatible field. No Neuroforce.",
    "shortDesc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules."
  },
  "joyride": {
    "desc": "Its Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects. On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk.",
    "shortDesc": "Its Normal-type moves become Flying-type moves and have their power multiplied by 1.2."
  },
  "airlock": {
    "desc": "While it is active, the effects of weather conditions are disabled.",
    "shortDesc": "While it is active, the effects of weather conditions are disabled."
  },
  "armortail": {
    "desc": "Priority moves used by opposing Pokemon targeting it or its allies are prevented from having an effect.",
    "shortDesc": "It and its allies are protected from opposing priority moves."
  },
  "aurabreak": {
    "desc": "While it is active, the effects of the Dark Aura and Fairy Aura Abilities are reversed, multiplying the power of Dark- and Fairy-type moves, respectively, by 3/4 instead of 1.33.",
    "shortDesc": "While it is active, the Dark Aura and Fairy Aura power modifier is 0.75x."
  },
  "beastboost": {
    "desc": "Its highest stat is raised by 1 stage if it attacks and knocks out another Pokemon. Stat stage changes are not considered. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order.",
    "shortDesc": "Its highest stat is raised by 1 if it attacks and KOes another Pokemon."
  },
  "blaze": {
    "desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Fire-type attack.",
    "shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Fire attacks."
  },
  "apexarmor": {
    "desc": "It is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks. Contact attackers lose 1/8 of their max HP. Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Blocks bullet/pulse moves, reduces attack damage by 20%, damages contact attackers by 1/8 max HP, and ignores redirection. Restores 1/16 max HP each turn and prevents hail and sandstorm damage.",
    "shortDesc": "It is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks."
  },
  "cheekpouch": {
    "desc": "If it eats a held Berry, it restores 1/3 of its max HP, rounded down, in addition to the Berry's effect. This effect can also activate after the effects of Bug Bite, Fling, Pluck, Stuff Cheeks, and Teatime if the eaten Berry had an effect on it.",
    "shortDesc": "If it eats a Berry, it restores 1/3 of its max HP after the Berry's effect."
  },
  "chillingneigh": {
    "desc": "Its Attack is raised by 1 stage if it attacks and knocks out another Pokemon.",
    "shortDesc": "Its Attack is raised by 1 stage if it attacks and KOes another Pokemon."
  },
  "colorchange": {
    "desc": "Its type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
    "shortDesc": "Its type changes to the type of a move it's hit by, unless it has the type."
  },
  "comatose": {
    "desc": "It is considered to be asleep and cannot become affected by a non-volatile status condition or Yawn.",
    "shortDesc": "It cannot be statused, and is considered to be asleep."
  },
  "commander": {
    "desc": "If it is a Tatsugiri and a Dondozo is an active ally, it goes into the Dondozo's mouth. The Dondozo has its Attack, Special Attack, Speed, Defense, and Special Defense raised by 2 stages. During the effect, the Dondozo cannot be switched out, it cannot select an action, and attacks targeted at it will be avoided but it will still take indirect damage. If it faints during the effect, a Pokemon can be switched in as a replacement but the Dondozo remains unable to be switched out. If the Dondozo faints during the effect, it regains the ability to select an action.",
    "shortDesc": "If ally is Dondozo: it cannot act or be hit, +2 to all Dondozo's stats."
  },
  "costar": {
    "desc": "On switch-in, it copies all of its ally's stat stage changes.",
    "shortDesc": "On switch-in, it copies all of its ally's stat stage changes."
  },
  "cottondown": {
    "desc": "When it is hit by an attack, the Speed of all other Pokemon on the field is lowered by 1 stage.",
    "shortDesc": "If it is hit, it lowers the Speed of all other Pokemon on the field 1 stage."
  },
  "cudchew": {
    "desc": "If it eats a Berry, it will eat that Berry again at the end of the next turn.",
    "shortDesc": "If it eats a Berry, it will eat that Berry again at the end of the next turn."
  },
  "cutecharm": {
    "desc": "There is a 30% chance a Pokemon making contact with it will become infatuated if it is of the opposite gender.",
    "shortDesc": "30% chance of infatuating Pokemon of the opposite gender if they make contact."
  },
  "dauntlessshield": {
    "desc": "On switch-in, its Defense is raised by 1 stage. Once per battle.",
    "shortDesc": "On switch-in, its Defense is raised by 1 stage. Once per battle."
  },
  "dazzling": {
    "desc": "Priority moves used by opposing Pokemon targeting it or its allies are prevented from having an effect.",
    "shortDesc": "It and its allies are protected from opposing priority moves."
  },
  "defeatist": {
    "desc": "While it has 1/4 or less of its max HP, its Attack and Special Attack are halved. It also has Relic Armor's effect.",
    "shortDesc": "At 1/4 HP or less, Atk/SpA are halved; also has Relic Armor."
  },
  "disguise": {
    "desc": "Intact Mimikyu and Totem Mimikyu block one damaging hit, become busted and lose 1/8 max HP. An opposing attacker is cursed for 1/8 max HP each turn. Confusion can break Disguise; Mold Breaker bypasses it. Transform does not grant protection.",
    "shortDesc": "Intact disguise blocks one hit, then costs 1/8 HP and curses an opposing attacker."
  },
  "draconicforce": {
    "desc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Biting moves have 1.5x power. Moves ignore bypassable opposing abilities.",
    "shortDesc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale."
  },
  "dragonsmaw": {
    "desc": "Its offensive stat is multiplied by 1.5 while using a Dragon-type attack.",
    "shortDesc": "Its Dragon-type attacks have 1.5x power."
  },
  "emperorsresolve": {
    "desc": "Opposing stat drops give +2 Sp. Atk. Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. The two Speed boosts do not stack.",
    "shortDesc": "Opposing stat drops give +2 Sp. Atk."
  },
  "terraresolve": {
    "desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Takes 20% less attack damage, or 40% less from super-effective attacks.",
    "shortDesc": "Each opposing attack hit that damages HP heals 1/16 max HP."
  },
  "primalego": {
    "desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. Against an opposing effective Ultra Instinct (including composites), its attacks ignore its own negative Attack and Sp. Atk stages. Ultra Instinct instead reduces its first HP-damaging move each turn by 40% and ignores positive Attack or Sp. Atk stages for that protected move. Stored stages are unchanged; normal +1 retaliation is unchanged. The rivalry is disabled on Bewitched Woods, Haunted and Holy.",
    "shortDesc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending."
  },
  "ragingoverlord": {
    "desc": "Moves ignore bypassable opposing abilities. Attacks bypass Substitute, screens and defensive stat stages and gain +1 critical-hit stage. Takes half damage from priority attacks. Immune to hail damage. Move KOs damage remaining foes by 60% of the last damage dealt; if there is no valid target or no damage is dealt, gains +1 Attack instead. Magic Guard prevents this splash damage. Cannot be suppressed. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
    "shortDesc": "Moves ignore bypassable opposing abilities."
  },
  "auroraresonance": {
    "desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Heals 1/16 max HP each turn in effective rain. Sound moves become Water type, Water attacks are absorbed, and the holder heals in rain and snow. Does not add Ice typing.",
    "shortDesc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power."
  },
  "sacrededge": {
    "desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. Separate power boosts apply to both 60%-power hits. In Free-for-All, both hits still use 60% power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. On entry or Mega Evolution, heals adjacent allies by 1/4 max HP, or 1/3 on Fairy Tale.",
    "shortDesc": "Slicing moves have 1.5x power, except on Cold Eclipse."
  },
  "relentlesslink": {
    "desc": "Multi-hit moves always use their maximum hit count and have 1.5x power. Moves that normally check accuracy per hit check only once. Moves ignore bypassable opposing abilities. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection. Drill and horn moves gain Power Drill effects. Guts and Battle Armor are removed.",
    "shortDesc": "Multi-hit moves always use their maximum hit count and have 1.5x power."
  },
  "mirrorgreed": {
    "desc": "Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again. Fairy Tale entry gives +1 Sp. Def; Mirror Arena entry gives +1 evasion. Moves have 1.3x power if no other active Pokemon has a move left to use that turn. Takes 20% less attack damage, or 40% less from super-effective attacks. Opportunist copies positive stat boosts gained by opposing Pokemon.",
    "shortDesc": "Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again."
  },
  "sweetdecay": {
    "desc": "Attack is 1.5x, but physical moves have 0.8x accuracy. Berries normally eaten at 1/4 HP activate at 1/2 HP instead. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
    "shortDesc": "Attack is 1.5x, but physical moves have 0.8x accuracy."
  },
  "bakedbliss": {
    "desc": "Absorbs Fire moves for +2 Defense. Gains +1 Defense each turn on Burning, Superheated, Dragon's Den and Volcanic. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep. Berries normally eaten at 1/4 HP activate at 1/2 HP instead.",
    "shortDesc": "Absorbs Fire moves for +2 Defense."
  },
  "electromorphosis": {
    "desc": "It gains the Charge effect when it takes a hit from an attack.",
    "shortDesc": "It gains the Charge effect when it takes a hit from an attack."
  },
  "embodyaspectcornerstone": {
    "desc": "On switch-in, its Defense is raised by 1 stage.",
    "shortDesc": "On switch-in, its Defense is raised by 1 stage."
  },
  "embodyaspecthearthflame": {
    "desc": "On switch-in, its Attack is raised by 1 stage.",
    "shortDesc": "On switch-in, its Attack is raised by 1 stage."
  },
  "embodyaspectteal": {
    "desc": "On switch-in, its Speed is raised by 1 stage.",
    "shortDesc": "On switch-in, its Speed is raised by 1 stage."
  },
  "embodyaspectwellspring": {
    "desc": "On switch-in, its Special Defense is raised by 1 stage.",
    "shortDesc": "On switch-in, its Special Defense is raised by 1 stage."
  },
  "emergencyexit": {
    "desc": "When it has more than 1/2 its max HP and takes damage bringing it to 1/2 or less of its max HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
    "shortDesc": "It switches out when it reaches 1/2 or less of its max HP."
  },
  "eternalflower": {
    "desc": "Includes Mold Breaker. Its attacks deal 2x damage to all Pulse forms. Its Grass-type moves use 1.5x Attack and Special Attack. Opposing Mega, G-Max, Terastallized, Stellar, and Ultra Beast Pokemon have Attack, Defense, Special Attack, Special Defense, and Speed reduced to 0.7x while it is active. This debuff does not affect allies. When it faints, it creates Bewitched Woods for 5 turns.",
    "shortDesc": "2x damage to Pulse; Grass offenses 1.5x; weakens opposing gimmicks."
  },
  "fairyaura": {
    "desc": "While it is active, the power of Fairy-type moves used by active Pokemon is multiplied by 1.33.",
    "shortDesc": "While it is active, a Fairy move used by any Pokemon has 1.33x power."
  },
  "flareboost": {
    "desc": "Its Fire-type attacks have 1.5x power. While it is burned, the power of its special attacks is also multiplied by 1.5.",
    "shortDesc": "Fire attacks have 1.5x power; burned special attacks also have 1.5x power."
  },
  "flowergift": {
    "desc": "If it is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5. These effects are prevented if the Pokemon is holding a Utility Umbrella.",
    "shortDesc": "If user is Cherrim and Sunny Day is active, it and allies' Attack and Sp. Def are 1.5x."
  },
  "flowerveil": {
    "desc": "Grass-type Pokemon on its side cannot have their stat stages lowered by other Pokemon or have a non-volatile status condition inflicted on them by other Pokemon.",
    "shortDesc": "This side's Grass types can't have stats lowered or status inflicted by other Pokemon."
  },
  "soothingpresence": {
    "desc": "Allies take 25% less attack damage; this does not protect the holder. Protects itself and allies from Attract, Disable, Encore, Heal Block, Taunt and Torment. Other allies take 25% less attack damage; this does not reduce the holder's damage taken. The holder and its allies are protected from Attract, Disable, Encore, Heal Block, Taunt, and Torment.",
    "shortDesc": "Allies take 25% less attack damage; this does not protect the holder."
  },
  "fullmetalbody": {
    "desc": "Prevents other Pokemon from lowering its stat stages.",
    "shortDesc": "Prevents other Pokemon from lowering its stat stages."
  },
  "gooey": {
    "desc": "When it is hit by an opposing damaging move, once per attacking move, the attacker's Speed is lowered by 2 stages, or 4 stages on Murkwater Surface. It also has Hydration and Sap Sipper's effects.",
    "shortDesc": "Damaging hit: attacker -2 Spe (-4 on Murkwater)."
  },
  "gorillatactics": {
    "desc": "Its Attack is multiplied by 1.5, but it can only select the first move it executes. These effects are prevented while it is Dynamaxed.",
    "shortDesc": "Its Attack is 1.5x, but it can only select the first move it executes."
  },
  "grimneigh": {
    "desc": "Its Special Attack is raised by 1 stage if it attacks and knocks out another Pokemon.",
    "shortDesc": "Its Sp. Atk is raised by 1 stage if it attacks and KOes another Pokemon."
  },
  "gulpmissile": {
    "desc": "If it is a Cramorant, it changes forme when it hits a target with Surf or uses the first turn of Dive successfully. It becomes Gulping Form with an Arrokuda in its mouth if it has more than 1/2 of its max HP remaining, or Gorging Form with a Pikachu in its mouth if it has 1/2 or less of its max HP remaining. If Cramorant gets hit in Gulping or Gorging Form, it spits the Arrokuda or Pikachu at its attacker, even if it has no HP remaining. The projectile deals damage equal to 1/4 of the target's max HP, rounded down; this damage is blocked by the Magic Guard Ability but not by a substitute. An Arrokuda also lowers the target's Defense by 1 stage, and a Pikachu paralyzes the target. Cramorant will return to normal if it spits out a projectile, switches out, or Dynamaxes. Species passive on all three Cramorant forms, replacing Gluttony; works independently of the selected ability and preserves it through loading and discharge. Water Surface/Underwater force Gulping on entry or terrain change; Electric/Factory/Short-Circuit make Surf load Gorging. Underwater projectile damage is quarter target max HP multiplied by ordinary Water effectiveness (zero if Water-immune); other fields keep the ordinary quarter-HP projectile.",
    "shortDesc": "When hit after Surf/Dive, attacker takes 1/4 max HP and -1 Defense or paralysis."
  },
  "healer": {
    "desc": "30% chance its ally has its non-volatile status condition cured at turn end.",
    "shortDesc": "30% chance its ally has its status cured at turn end."
  },
  "hungerswitch": {
    "desc": "If it is a Morpeko, it changes formes between its Belly Mode and Hangry Mode at turn end.",
    "shortDesc": "If Morpeko, it changes between Belly and Hangry Mode at turn end."
  },
  "truehydra": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Heals 1/3 max HP on switching out. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
    "shortDesc": "Eligible attacks hit three times; switch and turn-end healing; ailment recovery."
  },
  "iceabsorb": {
    "desc": "It is immune to Ice-type moves and restores 1/4 of its max HP when hit by an Ice-type move.",
    "shortDesc": "It is immune to Ice and heals 1/4 when hit by Ice."
  },
  "iceface": {
    "desc": "If it is an Eiscue, the first physical hit it takes in battle deals 0 neutral damage. Its ice face is then broken and it changes forme to Noice Face. Eiscue regains its Ice Face forme when Snow begins or when Eiscue switches in while Snow is active. Confusion damage also breaks the ice face.",
    "shortDesc": "If Eiscue, the first physical hit it takes deals 0 damage. Effect is restored in Snow."
  },
  "immunity": {
    "desc": "It cannot be poisoned. Gaining this Ability while poisoned cures it.",
    "shortDesc": "It cannot be poisoned. Gaining this Ability while poisoned cures it."
  },
  "imposter": {
    "desc": "On switch-in, it Transforms into the opposing Pokemon that is facing it. If there is no Pokemon at that position, it does not Transform.",
    "shortDesc": "On switch-in, it Transforms into the opposing Pokemon that is facing it."
  },
  "innardsout": {
    "desc": "If it is knocked out with a move, that move's user loses HP equal to the amount of damage inflicted on it.",
    "shortDesc": "If it is KOed with a move, that move's user loses an equal amount of HP."
  },
  "intrepidsword": {
    "desc": "On switch-in, its Attack is raised by 1 stage. Once per battle.",
    "shortDesc": "On switch-in, its Attack is raised by 1 stage. Once per battle."
  },
  "argentdevotion": {
    "desc": "Eligible Normal moves become Steel with 1.2x power, or 1.5x on Factory, Short-Circuit, Fairy Tale, Dragon's Den, Starlight Arena, New World and Holy Field. Immune to hail damage on Cold Eclipse. On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Doubles move secondary-effect chances and removes charging turns. Moves ignore bypassable opposing abilities.",
    "shortDesc": "Eligible Normal moves become Steel with 1.2x power, or 1.5x on Factory, Short-Circuit, Fairy Tale, Dragon's Den, Starlight Arena, New World and Holy Field."
  },
  "justified": {
    "desc": "Its Attack is raised by 1 stage after it is damaged by a Dark-type move.",
    "shortDesc": "Its Attack is raised by 1 stage after it is damaged by a Dark-type move."
  },
  "klutz": {
    "desc": "Its held item has no effect. It cannot use Fling successfully. Macho Brace, Power Anklet, Power Band, Power Belt, Power Bracer, Power Lens, and Power Weight still have their effects.",
    "shortDesc": "Its held item has no effect, except Macho Brace. Fling cannot be used."
  },
  "leafguard": {
    "desc": "If Sunny Day is active, it cannot become affected by a non-volatile status condition or Yawn, and Rest will fail for it. This effect is prevented if it is holding a Utility Umbrella.",
    "shortDesc": "If Sunny Day is active, it cannot be statused and Rest will fail for it."
  },
  "lingeringaroma": {
    "desc": "Pokemon making contact with it have their Ability changed to Lingering Aroma. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Lingering Aroma, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
    "shortDesc": "Making contact with it has the attacker's Ability become Lingering Aroma."
  },
  "magician": {
    "desc": "If it has no item, it steals the item off a Pokemon it hits with an attack. Does not affect Doom Desire and Future Sight. If multiple targets are hit by an attack the item is stolen from the fastest Pokemon, while considering the effect of Trick Room and prioritizing opposing Pokemon before allies.",
    "shortDesc": "If it has no item, it steals the item off a Pokemon it hits."
  },
  "prismscale": {
    "desc": "Friend Guard reduces attack damage to allies by 25%. Oblivious blocks Attract, Captivate, Taunt, and Intimidate's Attack drop. Swift Swim boosts Speed in rain and supported water fields.",
    "shortDesc": "Friend Guard reduces attack damage to allies by 25%."
  },
  "mimicry": {
    "desc": "Its types change to match the active Terrain when it acquires this Ability, or whenever a Terrain begins. Electric type during Electric Terrain, Grass type during Grassy Terrain, Fairy type during Misty Terrain, and Psychic type during Psychic Terrain. If this Ability is acquired without an active Terrain, or a Terrain ends, its types become the original types for its species.",
    "shortDesc": "Its types change to match the Terrain. Type reverts when Terrain ends."
  },
  "mindseye": {
    "desc": "It has Self Sufficient, can hit Ghost types with Normal- and Fighting-type moves, gains Fairy- and Dark-type STAB, ignores evasiveness, and cannot have its accuracy lowered. It takes 20% less damage and heals 1/16 after damaging moves hit. Cold Eclipse strengthens these effects.",
    "shortDesc": "Self Sufficient; Ghost-piercing Normal/Fighting; Fairy/Dark STAB; 20% damage reduction."
  },
  "minus": {
    "desc": "Its Electric- and Steel-type moves use 1.3x Attack and Sp. Atk. In Electric Terrain, its Sp. Atk is multiplied by 1.5.",
    "shortDesc": "Electric/Steel moves use 1.3x Atk/SpA; Electric Terrain gives 1.5x SpA."
  },
  "moody": {
    "desc": "It has a random stat, other than accuracy or evasiveness, raised by 2 stages and another stat lowered by 1 stage at turn end.",
    "shortDesc": "Boosts a random stat (except accuracy/evasion) +2 and another stat -1 every turn."
  },
  "motordrive": {
    "desc": "It is immune to Electric-type moves and raises its Speed by 1 stage when hit by an Electric-type move.",
    "shortDesc": "Its Speed is raised 1 stage if hit by an Electric move; Electric immunity."
  },
  "multitype": {
    "desc": "If it is an Arceus, its type changes to match its held Plate.",
    "shortDesc": "If it is an Arceus, its type changes to match its held Plate."
  },
  "mummy": {
    "desc": "Pokemon making contact with it have their Ability changed to Mummy. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
    "shortDesc": "Pokemon making contact with it have their Ability changed to Mummy."
  },
  "myceliummight": {
    "desc": "Its status moves ignore the target's Ability and move last in their priority bracket. Before it uses a status move, attacks deal 0.75x damage to it. When it successfully uses a status move, it restores 1/8 of its max HP.",
    "shortDesc": "Status ignores Abilities and moves last; takes 0.75x before status; heals 1/8."
  },
  "neuroforce": {
    "desc": "Its attacks that are super effective against the target have their damage multiplied by 1.25.",
    "shortDesc": "Its attacks that are super effective against the target do 1.25x damage."
  },
  "neutralizinggas": {
    "desc": "While it is active, Abilities have no effect. This Ability activates before hazards and other Abilities take effect. Does not affect the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
    "shortDesc": "While it is active, Abilities have no effect."
  },
  "normalize": {
    "desc": "Its moves are changed to be Normal type and have their power multiplied by 1.2. This effect comes before other effects that change a move's type.",
    "shortDesc": "Its moves are changed to be Normal type and have 1.2x power."
  },
  "perishbody": {
    "desc": "If an enemy hits it with a damaging move, all opposing Pokemon get Perish Song. If an affected opposing Pokemon already has Perish Song, its countdown is reduced by 1 instead. During Haunted Field, affected foes are trapped while adjacent to it. This effect is blocked by Holy Field and does not trigger from allies. Cursola and its forms never shorten an existing Perish Song countdown.",
    "shortDesc": "Enemy hits apply Perish Song to foes; Cursola never shortens existing countdowns."
  },
  "pickpocket": {
    "desc": "If it has no item and is hit by a contact move, it steals the attacker's item. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
    "shortDesc": "If it has no item and is hit by a contact move, it steals the attacker's item."
  },
  "pickup": {
    "desc": "At turn end, if it is not holding an item and at least one adjacent Pokemon used an item during this turn, one of those Pokemon is selected at random and it obtains that Pokemon's last used item. An item is not considered the last used if it was a popped Air Balloon, if the item was picked up by another Pokemon with this Ability, or if the item was lost to Bug Bite, Corrosive Gas, Covet, Incinerate, Knock Off, Pluck, or Thief. Items thrown with Fling can be picked up.",
    "shortDesc": "If it has no item, it finds one used by an adjacent Pokemon this turn."
  },
  "plus": {
    "desc": "Its Electric- and Steel-type moves use 1.3x Attack and Sp. Atk. In Electric Terrain, its Sp. Atk is multiplied by 1.5.",
    "shortDesc": "Electric/Steel moves use 1.3x Atk/SpA; Electric Terrain gives 1.5x SpA."
  },
  "poisonpuppeteer": {
    "desc": "If it is a Pecharunt and poisons or badly poisons a target, the target also becomes confused.",
    "shortDesc": "Pecharunt: If it poisons a target, the target also becomes confused."
  },
  "powerconstruct": {
    "desc": "If it is a Zygarde in its 10% or 50% Forme, it changes to Complete Forme when it has 1/2 or less of its max HP at the end of the turn.",
    "shortDesc": "If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn."
  },
  "powerofalchemy": {
    "desc": "It has Self Sufficient and Regenerator's effects. It copies a fainted ally's Ability while retaining both built-in effects until it switches out.",
    "shortDesc": "Self Sufficient + Regenerator; copies a fainted ally's Ability and retains both."
  },
  "protosynthesis": {
    "desc": "If Sunny Day is active or it uses a held Booster Energy, its highest stat is multiplied by 1.3, or by 1.5 if the highest stat is Speed. Stat stage changes are considered at the time this Ability activates. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order. If this effect was started by Sunny Day, a held Booster Energy will not activate and the effect ends when Sunny Day is no longer active. If this effect was started by a held Booster Energy, it ends when it is no longer active.",
    "shortDesc": "Sunny Day active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed."
  },
  "purifyingsalt": {
    "desc": "It cannot become affected by a non-volatile status condition or Yawn. If a Pokemon uses a Ghost-type attack against it, that Pokemon's offensive stat is halved when calculating the damage to it.",
    "shortDesc": "Ghost damage to it dealt with a halved offensive stat; can't be statused."
  },
  "quarkdrive": {
    "desc": "If Electric Terrain is active or it uses a held Booster Energy, its highest stat is multiplied by 1.3, or by 1.5 if the highest stat is Speed. Stat stage changes are considered at the time this Ability activates. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order. If this effect was started by Electric Terrain, a held Booster Energy will not activate and the effect ends when Electric Terrain is no longer active. If this effect was started by a held Booster Energy, it ends when it is no longer active.",
    "shortDesc": "Electric Terrain active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed."
  },
  "quickdraw": {
    "desc": "It has a 30% chance to move first in its priority bracket with attacking moves.",
    "shortDesc": "It has a 30% chance to move first in its priority bracket with attacking moves."
  },
  "rattled": {
    "desc": "Its Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack, or if an opposing Pokemon affected it with the Intimidate Ability.",
    "shortDesc": "Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack, or Intimidated."
  },
  "receiver": {
    "desc": "It copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Flower Gift, Forecast, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Power of Alchemy, Protosynthesis, Quark Drive, Receiver, RKS System, Schooling, Shields Down, Stance Change, Tera Shell, Tera Shift, Teraform Zero, Trace, Wonder Guard, Zen Mode, and Zero to Hero.",
    "shortDesc": "It copies the Ability of an ally that faints."
  },
  "ripen": {
    "desc": "When it eats certain Berries, the effects are doubled. Berries that restore HP or PP have the amount doubled, Berries that raise stat stages have the amount doubled, Berries that halve damage taken quarter it instead, and a Jaboca Berry or Rowap Berry has the attacker lose 1/4 of its max HP, rounded down.",
    "shortDesc": "When it eats certain Berries, the effects are doubled."
  },
  "rkssystem": {
    "desc": "If it is Silvally, it gains the custom effects tied to its held Memory, even if its current form does not match that Memory, and restores 1/16 of its max HP at turn end. Silvally without a Memory uses Scrappy's effect instead.",
    "shortDesc": "Silvally gains its Memory effects and heals 1/16; no Memory gives Scrappy."
  },
  "runaway": {
    "desc": "It can switch out despite trapping moves and abilities. It is also ignored by entry hazards when it switches in, including Spikes, Stealth Rock, Sticky Web, Toxic Spikes, and their field variants.",
    "shortDesc": "Can escape trapping; immune to entry hazards."
  },
  "sandveil": {
    "desc": "If Sandstorm is active, the accuracy of moves used against it is multiplied by 0.8. It takes no damage from Sandstorm.",
    "shortDesc": "If Sandstorm is active, its evasiveness is 1.25x; immunity to Sandstorm."
  },
  "scrappy": {
    "desc": "It can hit Ghost types with Normal- and Fighting-type moves. It is immune to the effect of the Intimidate Ability.",
    "shortDesc": "Fighting, Normal moves hit Ghost. Immune to Intimidate."
  },
  "seedsower": {
    "desc": "When it is hit by an attack, the effect of Grassy Terrain begins.",
    "shortDesc": "When it is hit by an attack, the effect of Grassy Terrain begins."
  },
  "goldentalons": {
    "desc": "Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. It is immune to Status moves. Slicing moves have 1.5x power, except on Cold Eclipse.",
    "shortDesc": "Moves cannot be redirected."
  },
  "silkendecoy": {
    "desc": "Mega Ariados spins a persistent cocoon, renewed when another Pokemon faints. It blocks status moves and status conditions while intact, and absorbs one damaging move including all its hits and secondary effects. Retains full local Swarm and Self Sufficient exactly once: restores 1/16 base max HP each turn and prevents sandstorm and hail damage. Venom Thread is its separate species passive.",
    "shortDesc": "Protective cocoon + Swarm + Self Sufficient; other faints renew the cocoon."
  },
  "shieldsdown": {
    "desc": "If it is a Minior, it changes to its Core forme if it has 1/2 or less of its max HP, and changes to Meteor Form if it has more than 1/2 its max HP. This check is done on switch-in and at turn end. While in its Meteor Form, it cannot become affected by a non-volatile status condition or Yawn. It also has Shell Armor, Self Repair, and Crumbling Shell's effects.",
    "shortDesc": "Form changes at 1/2 HP."
  },
  "simple": {
    "desc": "When one of its stat stages is raised or lowered, the amount is doubled.",
    "shortDesc": "When one of its stat stages is raised or lowered, the amount is doubled."
  },
  "slowstart": {
    "desc": "On switch-in, its Attack is 0.65x and Speed is 0.5x for 3 turns, and its Defense is doubled. On Holy Field, the Attack and Speed drops are removed and its Defense is 1.5x instead.",
    "shortDesc": "3 turns: Atk 0.65x, Spe 0.5x, Def 2x; Holy removes drops and gives Def 1.5x."
  },
  "snowcloak": {
    "desc": "If Snow is active, the accuracy of moves used against it is multiplied by 0.8.",
    "shortDesc": "If Snow is active, its evasiveness is 1.25x."
  },
  "soulcremation": {
    "desc": "Direct Fire/Ghost attacks heal 1/3 of actual opposing HP damage, capped at 1/6 max HP per turn, and block surviving targets' healing through the following turn. Switching clears the block; repeated hits refresh it. Native draining moves, substitutes, allies, residual and delayed damage do not grant this drain. Once per turn, a Ghost hit on an already-burned surviving foe also attempts -1 Sp. Def. At turn end, heals 1/8 max HP if any foe actually took burn damage; this is separate from the drain cap. Once per actual entry, the first executed opposing damaging move targeting it grants +1 Sp. Atk after the entire move if it survives and remains active, even after misses, protection or immunity. This use is spent at +6 and is not reset by ability changes or suppression; switching resets it. Contact attackers have a 30% burn chance (60% on Volcanic). Absorbs Fire for a 1.5x Fire boost; Burning or grounded Volcanic also grants the boost. On Cold Eclipse, Fire absorption and contact burns stop, and entry gives +2 Defense and Sp. Def total. Normal healing and drain rules apply. Mega Chandelure with active Soul Cremation bypasses Soul Fire's Fire/Ghost attack absorption only. Ordinary type effectiveness and type immunities remain; this grants neither general Mold Breaker nor a damage multiplier. Will-O-Wisp and Soul Fire redirection are unchanged.",
    "shortDesc": "Direct Fire/Ghost attacks heal 1/3 of actual opposing HP damage, capped at 1/6 max HP per turn, and block surviving targets' healing through the following turn."
  },
  "froststalker": {
    "desc": "Attacks use double the offensive stat against targets that entered this turn. Slicing moves have 1.5x power, except on Cold Eclipse. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Doubles attacking stats against foes that just entered battle. Slicing moves have 1.5x power except on Cold Eclipse. Eligible Normal moves become Ice with 1.2x power, or 1.5x on Icy and Snowy Mountain fields.",
    "shortDesc": "Attacks use double the offensive stat against targets that entered this turn."
  },
  "stall": {
    "desc": "It moves last among Pokemon using the same or greater priority moves.",
    "shortDesc": "It moves last among Pokemon using the same or greater priority moves."
  },
  "steadfast": {
    "desc": "If it flinches, its Speed is raised by 1 stage.",
    "shortDesc": "If it flinches, its Speed is raised by 1 stage."
  },
  "steamengine": {
    "desc": "It has Magma Armor. Fire- or Water-type hits raise its Speed by 6 stages; heat fields activate it on entry, and Water Surface, Underwater, or Volcanic Terrain raises Speed each turn.",
    "shortDesc": "Magma Armor; Fire/Water hits raise Speed by 6; certain fields also activate it."
  },
  "steelyspirit": {
    "desc": "It and its allies' Steel-type moves have their power multiplied by 1.5. This affects Doom Desire even if the user is not on the field.",
    "shortDesc": "It and its allies' Steel-type moves have their power multiplied by 1.5."
  },
  "stench": {
    "desc": "Its attacks without a chance to make the target flinch gain a 10% chance to make the target flinch.",
    "shortDesc": "Its attacks without a chance to flinch gain a 10% chance to flinch."
  },
  "stormdrain": {
    "desc": "It is immune to Water-type moves and raises its Attack and Special Attack by 1 stage when hit by a Water-type move. If it is not the target of a single-target Water-type move used by another Pokemon, it redirects that move to itself if it is within the range of that move. If multiple Pokemon could redirect with this Ability, it goes to the one with the highest Speed, or in the case of a tie to the one that has had this Ability active longer.",
    "shortDesc": "It draws Water moves to itself to raise Atk and Sp. Atk by 1; Water immunity."
  },
  "supersweetsyrup": {
    "desc": "On switch-in, it lowers the evasiveness of adjacent opposing Pokemon by 1 stage every time it switches in. Substitute blocks this. Flower Garden stages 3–5 add the existing stat drops; Misty Terrain lowers its accuracy.",
    "shortDesc": "On every entry, lowers adjacent foes’ evasiveness 1 stage."
  },
  "symbiosis": {
    "desc": "If an ally uses its item, it gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off, or if the ally used an Eject Button or Eject Pack.",
    "shortDesc": "If an ally uses its item, it gives its item to that ally immediately."
  },
  "synchronize": {
    "desc": "If another Pokemon burns, paralyzes, poisons, or badly poisons it, that Pokemon receives the same non-volatile status condition.",
    "shortDesc": "If another Pokemon burns/poisons/paralyzes it, it also gets that status."
  },
  "terashell": {
    "desc": "If it is a Terapagos at full HP, the effectiveness of attacks against it is changed to 0.5 unless it is immune to the move. Multi-hit moves retain the same effectiveness throughout the attack.",
    "shortDesc": "Terapagos: If full HP, attacks taken have 0.5x effectiveness unless naturally immune."
  },
  "terashift": {
    "desc": "If it is a Terapagos, it transforms into its Terastal Form on entry.",
    "shortDesc": "If it is a Terapagos, it transforms into its Terastal Form on entry."
  },
  "torrent": {
    "desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Water-type attack.",
    "shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Water attacks."
  },
  "toxicboost": {
    "desc": "While it is poisoned, the power of its physical attacks is multiplied by 1.5.",
    "shortDesc": "While it is poisoned, its physical attacks have 1.5x power."
  },
  "trace": {
    "desc": "On switch-in, it copies a random opposing Pokemon's Ability. Abilities that cannot be copied are As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Flower Gift, Forecast, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Power of Alchemy, Protosynthesis, Quark Drive, Receiver, RKS System, Schooling, Shields Down, Stance Change, Teraform Zero, Tera Shell, Tera Shift, Trace, Zen Mode, and Zero to Hero. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
    "shortDesc": "On switch-in, or when it can, it copies a random adjacent foe's Ability."
  },
  "stormcircuit": {
    "desc": "On entry, creates Electric Terrain or Electric Aura for 5 turns, or 8 with Amplifield Rock, subject to field rules. Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Coil also gives +1 Sp. Atk.",
    "shortDesc": "On entry, creates Electric Terrain or Electric Aura for 5 turns, or 8 with Amplifield Rock, subject to field rules."
  },
  "truant": {
    "desc": "It skips every other turn instead of using a move.",
    "shortDesc": "It skips every other turn instead of using a move."
  },
  "unburden": {
    "desc": "If it loses its held item for any reason, its Speed is doubled as long as it remains active, has this Ability, and is not holding an item.",
    "shortDesc": "Speed is doubled on held item loss; boost is lost if it switches, gets new item/Ability."
  },
  "stillwaters": {
    "desc": "Suppresses weather effects while active. On Rainbow Field, gains one random non-maxed stat stage other than evasion each turn. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry.",
    "shortDesc": "Suppresses weather effects while active."
  },
  "scavenger": {
    "desc": "Immune to powder moves, Rage Powder, Effect Spore, sandstorm damage and hail damage. Other Pokemon cannot lower its Defense. Heals 1/3 max HP on switching out.",
    "shortDesc": "Immune to powder moves, Rage Powder, Effect Spore, sandstorm damage and hail damage."
  },
  "duskdrive": {
    "desc": "Battle Fervor, Precision and Opportunist, including their field effects, entry behavior, item blocking, damage modifiers and boost-copy timing.",
    "shortDesc": "Battle Fervor, Precision and Opportunist, including their field effects, entry behavior, item blocking, damage modifiers and boost-copy timing."
  },
  "burningego": {
    "desc": "Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. On Cold Eclipse, the two entry effects together give +2 Defense and Sp. Def. Against an opposing effective Ultra Instinct (including composites), its attacks ignore its own negative Attack and Sp. Atk stages. Ultra Instinct instead reduces its first HP-damaging move each turn by 40% and ignores positive Attack or Sp. Atk stages for that protected move. Stored stages are unchanged; normal +1 retaliation is unchanged. The rivalry is disabled on Bewitched Woods, Haunted and Holy.",
    "shortDesc": "Contact attackers have a 30% burn chance, or 60% on Volcanic."
  },
  "victorystar": {
    "desc": "It and its allies' moves have their accuracy multiplied by 1.1.",
    "shortDesc": "It and its allies' moves have their accuracy multiplied by 1.1."
  },
  "wanderingspirit": {
    "desc": "Pokemon making contact with it have their Ability swapped with this one. Does not affect Pokemon with the Abilities As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Hunger Switch, Ice Face, Illusion, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Protosynthesis, Quark Drive, RKS System, Schooling, Shields Down, Stance Change, Tera Shell, Tera Shift, Teraform Zero, Wonder Guard, Zen Mode, or Zero to Hero.",
    "shortDesc": "Pokemon making contact with it have their Ability swapped with this one."
  },
  "waterbubble": {
    "desc": "Its offensive stat is doubled while using Water attacks. Fire attacks against it use half the attacker's offensive stat. It also has Water Veil's effects. Does not grant Water STAB; natural STAB is unchanged.",
    "shortDesc": "Doubles Water attacking stats; halves incoming Fire attacking stats."
  },
  "watercompaction": {
    "desc": "Damage from Water-type attacks is halved. After it is damaged by a Water-type move, its Defense rises by 2 stages.",
    "shortDesc": "Halves Water damage; taking Water damage raises Defense by 2."
  },
  "weakarmor": {
    "desc": "If a physical attack hits it, its Defense is lowered by 1 stage and its Speed is raised by 2 stages.",
    "shortDesc": "If a physical attack hits it, Defense is lowered by 1, Speed is raised by 2."
  },
  "wimpout": {
    "desc": "When it has more than 1/2 its max HP and takes damage bringing it to 1/2 or less of its max HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
    "shortDesc": "It switches out when it reaches 1/2 or less of its max HP."
  },
  "wonderguard": {
    "desc": "It can only be damaged by supereffective moves and indirect damage.",
    "shortDesc": "It can only be damaged by supereffective moves and indirect damage."
  },
  "zenmode": {
    "desc": "If it is a Darmanitan or Galarian Darmanitan, it changes to Zen Mode if it has 1/2 or less of its max HP at the end of a turn. Standard Darmanitan is also Zen Mode in Ashen Beach or Psychic Terrain. Galarian Darmanitan is also Zen Mode in Icy Terrain, Snowy Mountain, or Cold Eclipse. If Darmanitan's HP is above 1/2 of its max HP and the matching field is not active, it changes back to Standard Mode.",
    "shortDesc": "Darmanitan goes Zen at <=1/2 HP; fields force matching Zen formes."
  },
  "mountaineer": {
    "desc": "On switch-in, it avoids all Rock-type attacks and Stealth Rock.",
    "shortDesc": "On switch-in, it avoids all Rock-type attacks and Stealth Rock."
  },
  "rebound": {
    "desc": "On switch-in, it blocks certain status moves and instead uses the move against the original user.",
    "shortDesc": "On switch-in, blocks certain status moves and bounces them back to the user."
  },
  "persistent": {
    "desc": "The duration of Gravity, Heal Block, Magic Room, Safeguard, Tailwind, Trick Room, and Wonder Room is increased by 2 turns if the effect is started by it.",
    "shortDesc": "When used, Gravity/Heal Block/Safeguard/Tailwind/Room effects last 2 more turns."
  },
  "loyalguard": {
    "desc": "Allies take 25% less attack damage; this does not protect the holder. Cannot be forced out by opposing moves or items. Intimidate raises Attack by 1 instead of lowering it. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
    "shortDesc": "Allies take 25% less attack damage; this does not protect the holder."
  },
  "triplethreat": {
    "desc": "Hydra Bond + Tangled Feet + Keen Eye + Big Pecks + Limber. Eligible single-target attacks hit three times, with later hits at 30% damage. Existing multihit, charging, delayed, Z/Max and extra-hit-barred moves are excluded; spread moves are excluded outside Free-for-All. In Free-for-All, single-target attacks hit all foes once at 1.3x power; eligible spread attacks hit three times. Dragon's Den gives 1.2x power. Confusion halves incoming accuracy and adds one critical-hit stage. Mirror Arena or Big Top entry gives +1 evasion; Mirror Arena also gives +1 accuracy and Laser Focus. Reveals opposing Illusions, ignores evasion, and prevents other Pokemon's accuracy and Defense drops. Prevents and cures paralysis; blocks opposing and field Speed reductions. Self-inflicted Speed costs and item slowdowns still apply.",
    "shortDesc": "Hydra Bond + Tangled Feet + Keen Eye + Big Pecks + Limber."
  },
  "unyielding": {
    "desc": "Inner Focus prevents flinching and Intimidate Attack drops. Opponents cannot force it to switch, regardless of its stat stages. Voluntary switching still works. Stamina is a separate species passive on Mudsdale.",
    "shortDesc": "Inner Focus; opponents cannot force it to switch."
  },
  "cinderscales": {
    "desc": "Flame Body and Swarm, including their existing field effects. Prevents externally inflicted accuracy-stage drops; self-inflicted accuracy costs still apply.",
    "shortDesc": "Flame Body and Swarm, including their existing field effects."
  },
  "restorativechime": {
    "desc": "Once per turn, a successful sound move restores 1/8 base max HP to the living active user and each living adjacent active ally. Damaging sound moves must connect with an opponent; ally-only hits do not count. Heal Bell qualifies if it cures status, restores HP or establishes Safeguard. Fully failed moves do not trigger healing. No longer cures healing recipients' status. Levitate remains Chimecho's separate passive.",
    "shortDesc": "Successful sound moves heal it and adjacent active allies by 1/8 max HP, once per turn."
  },
  "slumberinggiant": {
    "desc": "Comatose + Thick Fat: always considered asleep for relevant moves and fields while able to act normally; cannot receive major status or Yawn. Fire and Ice attacks use half offensive power against it, and hail cannot damage it. Retains Comatose's suppression and ability-replacement restrictions.",
    "shortDesc": "Comatose + Thick Fat: always considered asleep for relevant moves and fields while able to act normally; cannot receive major status or Yawn."
  },
  "voidguile": {
    "desc": "Magician + Infiltrator, including all local field effects, entry boosts and normal item-theft rules. Its moves bypass opposing screens, Substitute and Safeguard as usual for Infiltrator.",
    "shortDesc": "Magician + Infiltrator, including all local field effects, entry boosts and normal item-theft rules."
  },
  "voidwrath": {
    "desc": "Mold Breaker. Outrage does not lock it into successive turns or cause rampage confusion. Choice items retain their normal move lock. Other moves retain their normal behavior.",
    "shortDesc": "Outrage lasts one turn and does not cause confusion."
  },
  "silentreprisal": {
    "desc": "Soundproof + full local Anticipation. Immune to other Pokemon's sound moves. On entry, exposes opposing Illusion and checks for super-effective attacks or OHKO moves; if none trigger its warning, gains two Sp. Atk stages on Psychic Terrain, matching local Anticipation.",
    "shortDesc": "Soundproof + full local Anticipation."
  },
  "pridecall": {
    "desc": "Competitive + Unnerve. Opposing stat drops grant +2 Sp. Atk outside Chess Board; on Chess Board, retains Competitive's missing-HP power boost instead. Foes cannot eat Berries or use field seeds while Unnerve is active; retains its Cold Eclipse entry Speed drops.",
    "shortDesc": "Competitive + Unnerve."
  },
  "evergreen": {
    "desc": "Overcoat + Ripen: immune to powder moves and sandstorm/hail damage; applicable Berry effects are doubled, including local Ripen behavior. No additional effect.",
    "shortDesc": "Overcoat + Ripen: immune to powder moves and sandstorm/hail damage; applicable Berry effects are doubled, including local Ripen behavior."
  },
  "scentscout": {
    "desc": "Frisk on entry reveals opposing active Illusions and held items; each item holder independently has a 30% chance of five-turn Embargo. Once per holder entry, the first opponent switching in while it is already active also has its held item revealed. This extra observation only reveals the item and never repeats Frisk's other effects; an empty item slot still spends it.",
    "shortDesc": "Once per entry, reveals the first incoming opponent's item while already active."
  },
  "carrionwatch": {
    "desc": "Frisk + Unnerve. Entry reveals opposing active Illusions and held items, with each item holder independently having a 30% chance of five-turn Embargo. Foes cannot eat Berries or use field seeds while Unnerve is active; retains its Cold Eclipse entry Speed drops.",
    "shortDesc": "Frisk + Unnerve."
  },
  "auraprecision": {
    "desc": "Shield Dust blocks secondary effects aimed at it while retaining attacker self-effects. Technician multiplies eligible move power by 1.5 at effective base power 60 or less, or 80 or less on Factory Terrain. Does not add extra hits or Inner Focus. Aura Guard is a separate species passive.",
    "shortDesc": "Shield Dust and Technician."
  },
  "matriarchsvigil": {
    "desc": "Full local Thick Fat, Aroma Veil and Friend Guard. Once per genuine entry, after it or an adjacent ally survives an opposing whole damaging move that takes it from above half HP to half HP or less, the injured Pokemon gains +1 Defense and +1 Sp. Def after all hits. One shared activation per entry. Residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not reset the budget. Friend Guard reduces damage to other allies by 25%, independently stacking with the separate Rivalry passive. Neither ally reduction protects its own holder.",
    "shortDesc": "Thick Fat + Aroma Veil + Friend Guard; once/entry, surviving a hit across half HP gives self or an adjacent ally +1 Def/SpD."
  },
  "errorhandler": {
    "desc": "Aroma Veil protects it and its allies from Attract, Disable, Encore, Heal Block, Taunt and Torment. Infiltrator bypasses Substitute and opposing screens. Download is a separate species passive.",
    "shortDesc": "Aroma Veil + Infiltrator. Download is a separate passive."
  },
  "ruinedsky": {
    "desc": "Its moves have the effects of Mold Breaker. Damage is multiplied by 1.3 if the target is currently Flying-type or Dragon-type; the bonus applies only once against Flying/Dragon targets. This does not bypass type immunities, including Flying's Ground immunity.",
    "shortDesc": "Mold Breaker; 1.3x damage against Flying or Dragon targets (once)."
  },
  "adhesivearmor": {
    "desc": "Sticky Hold protects the held item. Opposing moves and effects cannot force it to switch. Voluntary switches and its own pivot moves remain available.",
    "shortDesc": "Sticky Hold; cannot be forced to switch."
  },
  "trickperformer": {
    "desc": "Technician and Prankster. Reflect and Light Screen receive +1 priority when Mimecraft is also present.",
    "shortDesc": "Technician + Prankster; Mimecraft screens total +1 priority."
  },
  "fairyring": {
    "desc": "Special Defense is multiplied by 1.3. Recovery from draining moves, Strength Sap, Leech Seed, Ingrain and Aqua Ring is multiplied by 1.3, stacking once with Big Root. Each turn, each major-statused opposing Pokemon loses 1/16 max HP and it drains the actual HP lost with its recovery bonus. Magic Guard prevents the residual loss; Liquid Ooze reverses draining recovery. Heal Block prevents recovery, not opposing residual damage. On genuine entry, applies ordinary Spotlight to one living adjacent ally until the end of the turn; does not repeat Illuminate's existing Spotlight.",
    "shortDesc": "Sp. Def 1.3x; draining healing 1.3x; drains statused foes; entry Spotlights an ally."
  },
  "crystalward": {
    "desc": "Blocks opposing ball/bomb moves targeting it or adjacent active allies. Allied Pollen Puff still works. Protection ends if it leaves, faints or is suppressed; Mold Breaker and Ability Shield apply normally.",
    "shortDesc": "Blocks opposing ball/bomb moves for itself and adjacent allies."
  },
  "lastingpromise": {
    "desc": "Full local Friend Guard. When a Wish cast by it while this ability is active successfully restores HP to a different ally, it also cures that recipient's major status. Tracks the original wisher across switching. Does not add HP, cure itself, or cure on failed, blocked or full-HP healing. No once-battle restriction.",
    "shortDesc": "Friend Guard; its Wish cures a different ally's major status only after successfully healing it."
  },
  "elasticbelly": {
    "desc": "Once per genuine entry, after surviving an entire opposing damaging move that starts it above half HP and ends at half or below, restores 1/8 base max HP. Substitute-only damage, ally attacks, residual damage and HP costs do not trigger it. Ability restarts do not reset it.",
    "shortDesc": "Once per entry, surviving a foe move crossing half HP heals 1/8 max HP."
  },
  "comfortingpresence": {
    "desc": "After a successful status move targeting another ally, restores 1/16 of that ally's max HP, once per turn. Failed moves and self-targeting do not qualify. Full-HP or blocked healing does not spend the turn's use.",
    "shortDesc": "Successful status moves targeting an ally heal it by 1/16 max HP, once per turn."
  }
};
