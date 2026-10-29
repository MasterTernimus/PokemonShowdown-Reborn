/** Display-only audit; callbacks and component metadata remain unchanged. */
export const ConciseAbilityDescriptions: Record<string, {desc:string;shortDesc:string}> = {
  "smolderingshroud": {
    "desc": "Prevents opposing stat drops. Gains +1 Attack and Sp. Atk on Volcanic entry. The first foe-caused stat drop it prevents each switch-in also raises its Sp. Atk by one stage.",
    "shortDesc": "First blocked opposing stat drop each entry raises Sp. Atk by 1."
  },
  "springfur": {
    "desc": "Fur Coat. Once per genuine entry, after an opposing damaging move breaks its Substitute and the whole attack finishes, the living user attempts +1 Attack. Consumed even if blocked or capped. Self-removal, Tidy Up and bypassing the Substitute do not qualify; ability restarts do not reset it.",
    "shortDesc": "Fur Coat; once per entry, a foe breaking its Substitute grants +1 Attack after the move."
  },
  "marshconduit": {
    "desc": "Water Absorb: absorbs other Pokemon's Water moves to heal 1/4 max HP and has local field healing. Its first absorption each entry also lowers all active foes' Speed one stage and clears its own confusion and negative accuracy stages, preserving positive accuracy. Later absorptions retain normal healing only.",
    "shortDesc": "First Water absorption each entry slows foes and clears confusion and negative accuracy."
  },
  "glacialheart": {
    "desc": "Ice Body: contact attackers have a 30% frostbite chance; heals 1/16 max HP in hail/snow or qualifying cold fields, 1/8 in hail on Cold Eclipse; immune to hail damage. After dealing positive opposing HP damage with an Ice attack, prepares Dragon; Dragon damage prepares Ice. The next successful attack of the prepared type ignores positive Defense or Special Defense stages for its whole move, including every hit; negative stages remain. Preparation updates only after the move finishes, never stacks, and clears on switching. Misses, protection, immunity, Substitute-only damage, status moves and unrelated types do not change preparation. Suppression disables both preparation and its benefit without consuming stored preparation.",
    "shortDesc": "Ice Body; alternating Ice/Dragon hits bypass positive defensive stages."
  },
  "punchfiend": {
    "desc": "Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions; Mirror Arena entry grants +1 accuracy and Laser Focus. Unseen Fist lets contact moves pierce protection at 1/4 damage; Max Guard blocks them. Inner Focus prevents flinching and Intimidate Attack drops. Hitmonchan receives Iron Fist separately as its species passive.",
    "shortDesc": "Keen Eye, Unseen Fist and Inner Focus."
  },
  "voidomen": {
    "desc": "Friend Guard reduces attack damage to other allies by 25%. While active, doubles secondary-effect chances for its holder and actual allies without stacking with Serene Grace or other providers. Void Omen can skip one required charge turn per receiving Pokemon per stay on the field, including its holder. Only that recipient switching resets its allowance; provider switches, ability changes, Transform and multiple providers do not refill it. Field skips, Power Herb and independent Serene Grace do not consume the allowance. Suppression disables the grant. Once per entry, the first successful damaging-move secondary or successful self-targeted status move sets or refreshes Safeguard to at least 3 turns. Separately, after activation, the first successfully applied secondary effect creates a ward against the next opposing stat-drop event targeting the holder or an adjacent active ally. Positive changes and self-inflicted drops remain. The ward ends when spent or the holder leaves.",
    "shortDesc": "Friend Guard; doubled secondary chances; one charge skip per recipient per stay; Safeguard and stat-drop ward."
  },
  "bonewarrior": {
    "desc": "Battle Armor, including critical-hit immunity, 0.8x incoming attack damage and field effects. Once per turn after a bone-flag attack damages opposing HP, the living active holder restores 1/8 max HP after the whole attack. Normal healing restrictions apply.",
    "shortDesc": "Battle Armor; bone attacks heal 1/8 max HP once per turn after opposing HP damage."
  },
  "apexvenom": {
    "desc": "Strong Jaw gives biting attacks 1.5x power. Poison Fang has no separate signature multiplier. Local Poison/Steel matchup overrides, bite protection bypass and toxic chance, and Shed Skin.",
    "shortDesc": "Strong Jaw 1.5x; has poison matchups and Shed Skin."
  },
  "blaze": {
    "desc": "When this Pokemon has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Fire-type attack.",
    "shortDesc": "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Fire attacks."
  },
  "cheekpouch": {
    "desc": "If this Pokemon eats a held Berry, it restores 1/3 of its max HP, rounded down, in addition to the Berry's effect. This effect can also activate after the effects of Bug Bite, Fling, Pluck, Stuff Cheeks, and Teatime if the eaten Berry had an effect on this Pokemon.",
    "shortDesc": "If this Pokemon eats a Berry, it restores 1/3 of its max HP after the Berry's effect."
  },
  "clearbody": {
    "desc": "Prevents opposing stat drops.",
    "shortDesc": "Other Pokemon cannot lower its stats."
  },
  "curiousmedicine": {
    "desc": "On entry, clears negative stat stages and confusion from the holder and active allies, keeping positive stages. Each Pokemon actually cleansed recovers 1/8 max HP, subject to normal healing restrictions. Does not affect the bench.",
    "shortDesc": "On entry, clears self/allies' negative stages and confusion; each cleansed Pokemon heals 1/8 HP."
  },
  "defeatist": {
    "desc": "While this Pokemon has 1/4 or less of its max HP, its Attack and Special Attack are halved. This Pokemon also has Relic Armor's effect.",
    "shortDesc": "At 1/4 HP or less, Atk/SpA are halved; also has Relic Armor."
  },
  "relicinstinct": {
    "desc": "Above half HP, its moves bypass opposing Abilities. At half HP or less, Attack and Sp. Atk are halved, attack damage is reduced by 25%, critical hits are prevented, and it heals 1/16 max HP at turn end. Once per Pokemon per battle, surviving at 25% HP or less restores it to 60% max HP and clears negative stat stages, preserving positive stages. Recovery waits until an entire attack finishes; other damage and end-turn checks can also trigger it. Healing restrictions apply: blocked healing spends no charge and gives no cleanse. Switching and ability changes do not reset the charge. No Defense drops or healthy attack HP cost.",
    "shortDesc": "Above half HP bypasses abilities; below half trades offense for defense. Once per battle, at 25% HP heals to 60% and clears drops."
  },
  "fossilfrenzy": {
    "desc": "Once per opposing damaging move it survives, after the entire move finishes, gains +1 Attack and Speed and attempts confusion. Allied, self and indirect damage do not trigger it. Has Klutz item suppression and its exceptions, Fling failure and local Chess Board move restrictions. While confused, incoming attack damage is 1.25x; hurting itself in confusion also costs 1/8 max HP.",
    "shortDesc": "After each opposing damaging move it survives: +1 Attack/Speed and confusion. Confusion can still hurt it."
  },
  "sunsovereign": {
    "desc": "Summons sun for 8 turns on entry. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den and Infernal Eclipse block Fire moves. On Dragon's Den, Volcanic or Infernal Eclipse entry, gains +1 Defense and Sp. Def. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Intimidate lowers adjacent foes' Attack by 1 on entry, respecting Substitute and normal Intimidate protections.",
    "shortDesc": "Drought, eight-turn sun, Unbound Blaze and Intimidate."
  },
  "burningspirit": {
    "desc": "Mold Breaker + Inner Focus. Attacks have 1.3x power against an opposing target still queued to move or that switched in this turn, except a target with Battle Bond. The first opposing HP-damaging move each turn deals 30% less damage across all hits. Substitute-only damage preserves the allowance. After a whole attack deals opposing HP damage, heals 1/16 max HP once per turn while alive; healing restrictions apply. Multi-hit and spread moves heal only once; a failed heal cannot retry within the same move. On Ashen Beach, New World, Starlight Arena and Cold Eclipse: 35% reduction and 1/8 healing. The turn allowance persists through switches, form/ability changes and Transform. Bewitched Woods, Haunted and Holy disable Ultra Instinct's effects. Against Ultra Ego or its composites, the protected move deals 40% less damage and ignores positive offensive stages. Ultra Ego ignores its own negative Attack or Sp. Atk stages when attacking Ultra Instinct. Has the Predator interaction. Burning Spirit also has full local Magma Armor: Water and Ice attacks use half attacking stats; Dragon's Den and Infernal Eclipse block Fire moves; prevents freeze outside Cold Eclipse and cures freeze; Dragon's Den, Volcanic and Infernal Eclipse entry grant +1 Defense and Sp. Def. Opportunist copies foes' positive Attack, Defense, Sp. Atk, Sp. Def and Speed changes at the normal move, entry, transformation and residual flushes; it does not copy accuracy or evasion. Copied boosts cannot loop, and each queued gain is applied once.",
    "shortDesc": "Ultra Instinct + Opportunist (five combat stats only) + Magma Armor."
  },
  "venomarmor": {
    "desc": "Dual Wield and Battle Armor. Metal Claw has two 60%-power hits. Does not automatically poison, heal or grant the former status-based damage boost.",
    "shortDesc": "Dual Wield + Battle Armor."
  },
  "toxicarmor": {
  "desc": "Full local Dual Wield, Metal Claw with two 60%-power hits, and opening Violent Rush. While poisoned, opposing Pokemon cannot lower its Attack; self-inflicted drops remain. A native positive-priority damaging attack that damages opposing HP prepares the next eligible Dual Wield attack on the following turn for +1 priority. Consumes on attempt, including miss, protection or immunity; expires at that turn end and clears on switching. No stacking, generated attacks, Z/Max attacks or self-rearming from the granted priority. Cannot be suppressed, replaced or bypassed by Mold Breaker.",
  "shortDesc": "Dual Wield + opening Violent Rush; priority hits prepare next-turn priority."
},
  "noseformation": {
  "shortDesc": "Elevate; successful opposing attacks trigger three 30 BP Special Mini-Noses.",
  "desc": "Elevate grants airborne status, subject to grounding, and one highest-stat increase per move KO, using nature-adjusted stats while ignoring stages and other stat modifiers. After a successful opposing attack, fires one trio of 30 BP Special Mini-Noses, choosing Steel, Electric or Rock and retargeting living foes when needed. Each is a normal attack respecting protection, Substitute and immunity. No ally triggers or recursive trios."
},
  "mourningvessel": {
    "desc": "Move power +20% per cumulative allied faint, capped at 2x. Heals 5% max HP per cumulative opposing faint each turn. Includes allied sides in Multi and all opposing sides in Free-for-All.",
    "shortDesc": "+20% power per allied faint, up to 2x; heals 5% HP per opposing faint."
  },
  "ragingstorm": {
    "desc": "Moves ignore bypassable abilities, Substitute, screens and defensive stages and gain one critical-hit stage. Incoming priority attack damage is halved. Immune to hail damage. Move KOs retain the 60% damage splash or Attack increase. Cannot be suppressed.",
    "shortDesc": "bypasses screens/defensive stages; priority resistance and KO splash."
  },
  "wickedsnare": {
    "desc": "Intimidate lowers adjacent foes' Attack by one stage on entry, respecting its normal protections. After a damaging Dark move finishes all hits, each opponent that took positive HP damage loses one Defense stage, once per target per move. Substitute-only damage, misses, protection and immunity do not trigger this effect. Native effects remain independent: Crunch can also cause its own Defense drop.",
    "shortDesc": "Intimidate; damaging Dark moves lower each damaged foe's Defense after all hits."
  },
  "toxicevolution": {
    "desc": "Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Poisoning a foe also confuses it. Enemy attackers have a 50% poison chance after dealing damage. Takes 20% less attack damage. Once per turn, successfully poisoning a foe with its own move or poison retaliation restores 1/8 of its max HP. Dealing actual attack damage to an already-poisoned foe can also trigger the same 1/8 base max HP healing, sharing the once-per-turn cap with poison infliction and retaliation. Shield Dust blocks opposing move secondary effects.",
    "shortDesc": "Corrosion, Shield Dust and retained poison recovery/protection."
  },
  "sandsovereign": {
    "desc": "Sets or refreshes Sandstorm to 8 turns on entry. Full local Solid Rock. Rock moves use the better Rock/Ground matchup keeps damaging Rock moves Rock-type with normal Rock STAB, but uses the better overall Rock or Ground type-chart matchup; Ground-immune typings do not replace the Rock matchup. Manually used Arenite Wall lasts 8 turns. Each turn, non-immune foes take Rock damage equal to 1/16 max HP; type effectiveness scales this chip only in Free-for-All.",
    "shortDesc": "Solid Rock; better Rock/Ground matchup; eight-turn sand and Rock chip."
  },
  "heatcoil": {
		"desc": "Speed Boost and Long Reach. Long Reach removes contact. Has the current modified Magma Armor package: cures freeze, and incoming Water/Ice attacks use half the offensive stat; this is not an upgrade to full Magma Armor. No new binding effect.",
    "shortDesc": "Speed Boost + Long Reach; modified Magma Armor; Flame Body passive is separate."
  },
  "sweetsanctuary": {
    "desc": "Ripen doubles HP restored and stat boosts from Berries, and doubles resistance Berries' damage reduction. When Decorate actually raises at least one stat, heals that target by 1/4 of its current max HP once after the move. Failed or blocked Decorate, or no actual positive boost, grants no healing. Normal healing restrictions apply. Ripen does not multiply this healing.",
    "shortDesc": "Ripen; successful Decorate heals its boosted target by 1/4 max HP."
  },
  "emergencyexit": {
    "desc": "When this Pokemon has more than 1/2 its max HP and takes damage bringing it to 1/2 or less of its max HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
    "shortDesc": "This Pokemon switches out when it reaches 1/2 or less of its max HP."
  },
  "pollenbloom": {
    "desc": "Thick Fat + Unaware. Fire and Ice attacks use half the attacker's attacking stat; hail causes no damage. Ignores the foe's Defense, Sp. Def and evasion changes when attacking, and their Attack, Defense, Sp. Atk and accuracy changes when defending. Reveals opposing Illusions on entry. At each turn's end, drains 1/16 of each foe's base max HP and heals by the HP actually drained. Grass types and Grass-immune foes are unaffected. In Free-for-All only, Grass weaknesses and resistances change the drain amount.",
    "shortDesc": "Thick Fat, Unaware and Grass chip recovery."
  },
  "waterbarrage": {
    "desc": "Stalwart bypasses redirection and grants +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. A literal Mega Launcher + Water Barrage combination instead boosts both eligible pulse/bullet hits by 1.5x: 0.9x each in every battle format. In Free-for-All, both hits still use 60% power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP. Water immunities block it; type effectiveness scales it only in Free-for-All.",
    "shortDesc": "Dual Wield + Stalwart; cycling Water chip."
  },
  "gulpmissile": {
    "desc": "If this Pokemon is a Cramorant, it changes forme when it hits a target with Surf or uses the first turn of Dive successfully. It becomes Gulping Form with an Arrokuda in its mouth if it has more than 1/2 of its max HP remaining, or Gorging Form with a Pikachu in its mouth if it has 1/2 or less of its max HP remaining. If Cramorant gets hit in Gulping or Gorging Form, it spits the Arrokuda or Pikachu at its attacker, even if it has no HP remaining. The projectile deals damage equal to 1/4 of the target's max HP, rounded down; this damage is blocked by the Magic Guard Ability but not by a substitute. An Arrokuda also lowers the target's Defense by 1 stage, and a Pikachu paralyzes the target. Cramorant will return to normal if it spits out a projectile, switches out, or Dynamaxes. Species passive on all three Cramorant forms, replacing Gluttony; works independently of the selected ability and preserves it through loading and discharge. Water Surface/Underwater force Gulping on entry or terrain change; Electric/Factory/Short-Circuit make Surf load Gorging. Underwater projectile damage is quarter target max HP multiplied by ordinary Water effectiveness (zero if Water-immune); other fields keep the ordinary quarter-HP projectile.",
    "shortDesc": "When hit after Surf/Dive, attacker takes 1/4 max HP and -1 Defense or paralysis."
  },
  "hungerswitch": {
    "desc": "If this Pokemon is a Morpeko, it changes formes between its Belly Mode and Hangry Mode at the end of each turn.",
    "shortDesc": "If Morpeko, it changes between Belly and Hangry Mode at the end of each turn."
  },
  "dreaddominion": {
    "desc": "Hydra Bond and Moxie. Intimidate lowers adjacent foes' Attack by 1 on entry, respecting Substitute and normal Intimidate protections. Does not change Dark/Fairy type matchups.",
    "shortDesc": "Hydra Bond, Moxie and Intimidate."
  },
  "sweetresonance": {
		"desc": "On entry, lowers adjacent foes’ evasion by 1. Prevents item removal. Attackers are Embargoed for 5 turns after hitting it. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Entry: gives the first adjacent ally Dragon Cheer. Flower Garden entry also lowers foes' Defense and Sp. Def at stage 3+, Attack and Sp. Atk at stage 4+, and Speed and accuracy at stage 5, all by 1; Substitute blocks these entry drops. Misty Terrain entry lowers its own accuracy by 1.",
    "shortDesc": "Lowers foe evasion; protects item; attackers receive Embargo; heals; three-hit moves; ally Dragon Cheer."
  },
  "phantombarrage": {
		"desc": "Prevents opposing stat drops. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Dragon Darts and G-Max Spirit Volley use its higher offensive stat and gain 20% power from Hydra Bond instead of extra hits. Dragon Darts keeps its two-hit pattern; Spirit Volley keeps its full-power hit and weaker follow-up against another foe. In Free-for-All battles, Dragon Darts hits all opposing Pokemon twice.",
    "shortDesc": "Blocks foe stat drops; bypasses screens/Substitute; extra hits, or 1.2x power for signature moves."
  },
  "iceabsorb": {
    "desc": "This Pokemon is immune to Ice-type moves and restores 1/4 of its max HP when hit by an Ice-type move.",
    "shortDesc": "This Pokemon is immune to Ice and heals 1/4 when hit by Ice."
  },
  "burningcrown": {
    "desc": "On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Prevents opposing stat drops. Gains +1 Attack and Sp. Atk on Volcanic entry. Moves ignore bypassable opposing abilities. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den and Infernal Eclipse block Fire moves. On Dragon's Den, Volcanic or Infernal Eclipse entry, gains +1 Defense and Sp. Def. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Takes 20% less attack damage. Moves have a further 1.5x power on New World, Cold Eclipse and Starlight Arena. Faints grant no stat boosts.",
    "shortDesc": "Takes 20% less attack damage."
  },
  "inversion": {
    "desc": "Sets Inverse Field on entry. Infiltrator bypasses Substitute and opposing screens. Hypnosis bypasses accuracy checks while this ability is active; protection and sleep immunities still apply.",
    "shortDesc": "Sets Inverse Field; Infiltrator; Hypnosis bypasses accuracy. Contrary is separate."
  },
  "bloomingsun": {
    "desc": "Has the full local effects of Mega Sol and Flower Veil, including their field interactions.",
    "shortDesc": "Mega Sol + Flower Veil."
  },
  "requiem": {
    "desc": "Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. Its first direct damaging interaction or successful opponent-targeting status move in either direction applies Perish Song to that foe: when the holder affects a foe or a foe affects the holder. Failed, missed, protected, immune, self, ally and field status moves do not trigger punishment. Status moves do not trigger Cursed Body. The mark clears when the marked foe switches out, not when the holder switches; Perish Song is not refreshed, and an attempted but blocked countdown still spends the mark. Whenever an opposing Pokemon faints, it restores 1/4 max HP. When it faints, it creates Haunted Field for 5 turns. This Ability cannot be suppressed. Filter: takes 20% less attack damage, or 40% less from super-effective attacks. This component follows Requiem's unsuppressible, non-breakable ability behavior.",
    "shortDesc": "Filter; disables attacks, marks foes to perish, heals on foe faint; creates Haunted."
  },
  "myceliummight": {
    "desc": "This Pokemon's status moves ignore the target's Ability and move last in their priority bracket. Before this Pokemon uses a status move, attacks deal 0.75x damage to it. When it successfully uses a status move, it restores 1/8 of its max HP.",
    "shortDesc": "Status ignores Abilities and moves last; takes 0.75x before status; heals 1/8."
  },
  "powerconstruct": {
    "desc": "If this Pokemon is a Zygarde in its 10% or 50% Forme, it changes to Complete Forme when it has 1/2 or less of its max HP at the end of the turn.",
    "shortDesc": "If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn."
  },
  "breakwater": {
    "desc": "Propeller Tail: moves cannot be redirected and Speed doubles on Water Surface, Underwater and Midnight Zone. Once per switch-in, a directly selected non-pivot physical Water move that deals opposing HP damage clears entry hazards from its side. Flip Turn, substitutes, misses, protection, called and future attacks do not trigger it. The allowance is spent only when hazards are cleared.",
    "shortDesc": "Water-field Speed boost; first qualifying physical Water hit clears own hazards."
  },
  "ripen": {
    "desc": "When this Pokemon eats certain Berries, the effects are doubled. Berries that restore HP or PP have the amount doubled, Berries that raise stat stages have the amount doubled, Berries that halve damage taken quarter it instead, and a Jaboca Berry or Rowap Berry has the attacker lose 1/4 of its max HP, rounded down.",
    "shortDesc": "When this Pokemon eats certain Berries, the effects are doubled."
  },
  "rkssystem": {
    "desc": "If this Pokemon is Silvally, it gains the custom effects tied to its held Memory, even if its current form does not match that Memory, and restores 1/16 of its max HP at the end of each turn. Silvally without a Memory uses Scrappy's effect instead.",
    "shortDesc": "Silvally gains its Memory effects and heals 1/16; no Memory gives Scrappy."
  },
  "roughscale": {
    "desc": "Contact attackers lose 1/8 max HP. Tough Claws gives contact moves 1.3x power. Once per switch-in, after the first resisted opposing attack to damage HP finishes all its hits, raises Defense by 1 if the holder survives and remains active. Normal boost prevention applies. Misses, protection, immunity, Substitute-only damage and zero HP damage do not activate it.",
    "shortDesc": "Tough Claws; first resisted opposing HP attack each entry grants +1 Defense after the move."
  },
  "schooling": {
    "desc": "A level 20 or higher Wishiwashi changes to School Form above 1/4 max HP. Underwater and Midnight Zone force School Form; Water Surface and Murkwater force it while grounded. It returns to Solo Form at or below 1/4 max HP otherwise. While in School Form, it has Hydra Bond, Self Repair, and Mold Breaker's effects.",
    "shortDesc": "Changes form with HP and water fields; its School form gains the listed components."
  },
  "seviischooling": {
    "desc": "Changes Wishiwashi into its Ghost-type Sevii form, or Ghost/Dragon Sevii Schooling form at level 20 or higher above 1/4 max HP. Underwater and Midnight Zone force School Form; Water Surface and Murkwater force it while grounded. The School Form has Hydra Bond, Self Repair, and Mold Breaker's effects.",
    "shortDesc": "Changes Wishiwashi to Sevii form; School: Hydra Bond + Self Repair + Mold Breaker."
  },
  "cursedarmament": {
    "desc": "Own non-fixed, non-delayed Ghost and Steel attacks gain 20% power, retaining their physical or special category. Once per turn after a whole attack damages a surviving active foe, steal up to 2 PP from its queued move; a newly entered foe without a queued move instead loses up to 2 PP from one random damaging move. Stealing PP stores one charge. The next eligible attack consumes it on attempt, including a miss, protection or immunity, and gains 40% power instead of 20%. A successful charged attack steals up to 3 PP from the last attempted current move, or the queued move if none was used, plus 1 PP from every other current move. Newly entered foes always use one random damaging move as the charged primary, even with earlier move history. Charged attacks cannot recharge themselves. Both drains share one use per turn and affect one surviving foe; Substitute-only damage and KOs do not qualify. Switching, fainting, suppression or losing the ability clears the charge. Curse has its ordinary local behavior and HP cost.",
    "shortDesc": "Ghost/Steel attacks gain 20% power; stolen PP charges a 40% attack."
  },
  "shieldsdown": {
    "desc": "If this Pokemon is a Minior, it changes to its Core forme if it has 1/2 or less of its max HP, and changes to Meteor Form if it has more than 1/2 its max HP. This check is done on switch-in and at the end of each turn. While in its Meteor Form, it cannot become affected by a non-volatile status condition or Yawn. This Pokemon also has Shell Armor, Self Repair, and Crumbling Shell's effects.",
    "shortDesc": "Form changes at 1/2 HP."
  },
  "malicewell": {
    "desc": "Flame Body: contact attackers have a 30% burn chance (60% on Volcanic Field); Cold Eclipse instead grants +1 Defense and Sp. Def on entry and disables contact burns. Once per actual entry, the first opposing damaging move that executes against it grants +1 Sp. Atk after the entire move finishes if it remains active and survives, including Protect, misses and immunity. All hits and spread targets share one activation. Ally moves, self damage, residual damage and moves that never execute do not qualify. Ability changes or suppression do not reset usage. The activation is consumed even at +6; switching resets usage and normal stat stages, and Haze removes the boost without refreshing usage.",
    "shortDesc": "Contact may burn; surviving the first opposing damaging move each entry gives +1 Sp. Atk, even after Protect."
  },
  "siegelauncher": {
    "desc": "Mega Launcher gives pulse and bullet moves 1.5x power. Water Barrage supplies exactly one eligible Dual Wield pair, each hit at 0.6x power outside Free-for-All: pulse/bullet pairs therefore use 0.9x power per hit before STAB and passives. In Free-for-All both hits use full power, with the second-target selection. Existing multi-hit, charging, delayed, Z/Max and ineligible moves gain no extra pair. Water Barrage supplies Stalwart exactly once: redirection bypass and +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP; Water immunities block it and type effectiveness scales it only in Free-for-All.",
    "shortDesc": "Mega Launcher + Stalwart + Water Barrage."
  },
  "calderacore": {
    "desc": "Drought and Magma Armor. On entry, summons sun for 5 turns, or 8 with Heat Rock. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den and Infernal Eclipse block Fire moves. On Dragon's Den, Volcanic or Infernal Eclipse entry, gains +1 Defense and Sp. Def.",
    "shortDesc": "Drought + Magma Armor."
  },
  "torrent": {
    "desc": "When this Pokemon has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Water-type attack.",
    "shortDesc": "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Water attacks."
  },
  "ironmountain": {
    "desc": "Takes 25% less damage from super-effective attacks. Once per turn, an opposing HP hit gives +1 Defense and heals 1/16 max HP. Hyper Cutter additionally prevents opposing Attack reductions. Its damage reduction and once-per-turn Defense/healing effects are customized, not full Filter or full Stamina. Soundproof is a separate species passive.",
    "shortDesc": "Custom: 25% less super-effective damage; once/turn HP hit gives +1 Def and heals 1/16. Hyper Cutter."
  },
  "pulsetriad": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents opposing stat drops. On entry, sets Factory Field for 3 turns. Eligible single-target attacks hit three times, it is ungrounded, and opponents cannot lower its stats. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use. Magnezone-Pulse automatically receives Flash Cannon, Discharge, Recover, and Autotomize in that order. Its field creation, refresh and conversion last exactly 3 turns; Amplifield Rock does not extend them.",
    "shortDesc": "5-turn Factory Field on entry."
  },
  "ultrainstinct": {
    "desc": "Mold Breaker + Inner Focus. Attacks have 1.3x power against an opposing target still queued to move or that switched in this turn, except a target with Battle Bond. The first opposing HP-damaging move each turn deals 30% less damage across all hits. Substitute-only damage preserves the allowance. After a whole attack deals opposing HP damage, heals 1/16 max HP once per turn while alive; healing restrictions apply. Multi-hit and spread moves heal only once; a failed heal cannot retry within the same move. On Ashen Beach, New World, Starlight Arena and Cold Eclipse: 35% reduction and 1/8 healing. The turn allowance persists through switches, form/ability changes and Transform. Bewitched Woods, Haunted and Holy disable Ultra Instinct's effects. Against Ultra Ego or its composites, the protected move deals 40% less damage and ignores positive offensive stages. Ultra Ego ignores its own negative Attack or Sp. Atk stages when attacking Ultra Instinct. Has the Predator interaction.",
    "shortDesc": "Mold Breaker + Inner Focus; 1.3x timing power; first attack each turn deals 30% less; attack healing."
  },
  "duskdrive": {
    "desc": "Battle Fervor, Precision and Opportunist, including their field effects, entry behavior, item blocking, damage modifiers and boost-copy timing.",
    "shortDesc": "Combines the listed abilities."
  },
  "stormsovereign": {
		"desc": "Summons replaceable Strong Winds for 8 turns on entry. Each turn, non-immune foes take Flying damage equal to 1/16 base maximum HP; type effectiveness scales this chip only in Free-for-All. Flying-type foes are immune. Updraft: Competitive: opposing stat drops raise Special Attack by 2 outside Chessboard; on Chessboard, instead boosts damage with missing HP up to 2x at 20% HP. Flying moves ignore evasion boosts. Once per switch-in, the first Flying attack dealing opposing HP damage raises the living adjacent ally with the lowest HP percentage by 1 Speed stage, or the holder if no such ally exists. Only one recipient is boosted; ability restarts and Mega Evolution do not reset the entry allowance. Mega Pidgeot receives No Guard from its species passive and has no Gale Wings priority. Other holders retain their full-HP Flying priority and never-miss effect when no No Guard passive is present.",
		"shortDesc": "Updraft (Competitive), eight-turn Strong Winds and opposing Flying chip.",
  },
  "whitesmoke": {
    "desc": "Prevents opposing stat drops. Gains +1 Attack and Sp. Atk on Volcanic entry.",
    "shortDesc": "Blocks other Pokemon's stat drops; Volcanic entry boosts attacks."
  },
  "wimpout": {
    "desc": "When this Pokemon has more than 1/2 its max HP and takes damage bringing it to 1/2 or less of its max HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
    "shortDesc": "This Pokemon switches out when it reaches 1/2 or less of its max HP."
  },
  "zenmode": {
    "desc": "If this Pokemon is a Darmanitan or Galarian Darmanitan, it changes to Zen Mode if it has 1/2 or less of its max HP at the end of a turn. Standard Darmanitan is also Zen Mode in Ashen Beach or Psychic Terrain. Galarian Darmanitan is also Zen Mode in Icy Terrain, Snowy Mountain, or Cold Eclipse. If Darmanitan's HP is above 1/2 of its max HP and the matching field is not active, it changes back to Standard Mode.",
    "shortDesc": "Darmanitan goes Zen at <=1/2 HP; fields force matching Zen formes."
  },
  "zerotohero": {
    "desc": "Gains Fighting-type STAB. Palafin changes to Hero Form after switching out or entering Water fields. In Doubles, Multi or Free-for-All, survives one KO at 1 HP. Hero Form has no additional healing or ally damage reduction.",
    "shortDesc": "Palafin becomes Hero; Fighting STAB; survives one KO in multiplayer battles."
  },
  "toxicspines": {
    "desc": "Physical HP hits set one Toxic Spikes layer on the attacker's side, up to two; allied attacks use the opposing side. Contact attackers also lose 1/6 max HP. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Attacks always critically hit poisoned targets and on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three. Iron Barbs additionally deals 1/8 of a contact attacker's base max HP; this is separate from Toxic Debris's 1/6 contact damage.",
    "shortDesc": "Physical hits set Toxic Spikes; contact attackers lose 1/6 HP; Poison bypasses type immunity; poisoned foes lose defenses; Critical hits against poisoned foes or on corrosive fields. Iron Barbs adds 1/8 contact damage."
  },
  "updraft": {
    "desc": "Updraft: Competitive: opposing stat drops raise Special Attack by 2 outside Chessboard; on Chessboard, instead boosts damage with missing HP up to 2x at 20% HP. Flying moves ignore evasion boosts. Once per switch-in, the first Flying attack dealing opposing HP damage raises the living adjacent ally with the lowest HP percentage by 1 Speed stage, or the holder if no such ally exists. Only one recipient is boosted; ability restarts and Mega Evolution do not reset the entry allowance.",
    "shortDesc": "Competitive; Flying ignores evasion; one ally Speed boost per entry."
  },
  "encorearia": {
    "desc": "Serene Grace doubles secondary-effect chances, including chance-based self effects. On genuine switch-in, grants the team Safeguard for 5 turns, preserving any longer duration. Ending suppression or restarting/copying the ability does not refresh Safeguard.",
    "shortDesc": "Serene Grace; genuine switch-in grants at least 5-turn team Safeguard."
  },
  "sushitrick": {
    "desc": "On entry, heals each adjacent active ally by 1/4 max HP and removes its confusion. If there is no adjacent active ally to serve, instead clears its own confusion and negative accuracy stages, preserving positive accuracy, without self-healing.",
    "shortDesc": "Entry heals adjacent allies 1/4 HP and clears confusion; alone, clears own confusion and negative accuracy."
  },
  "secondbrew": {
    "desc": "Once per turn, after it actually recovers positive HP from draining-move healing, heals its lowest-HP adjacent ally by 1/8 of that ally's max HP. HP, Heal Block, Liquid Ooze and zero healing do not grant the ally reward or spend the turn's use.",
    "shortDesc": "Actual positive draining-move healing also heals its lowest-HP adjacent ally by 1/8, once per turn."
  },
  "floehunter": {
    "desc": "Slush Rush doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. During effective hail only, physical attacks deal 1.5x damage to opposing Water-type targets, once even for dual types. Frozen Aura alone and snow do not activate the damage bonus; biting moves do not automatically critically hit.",
    "shortDesc": "In hail, physical attacks deal 1.5x damage to Water-type foes."
  },
  "tidalvoice": {
    "desc": "Liquid Voice changes sound moves to Water, or Ice on Icy Field, with exactly 1.2x power. Soundproof blocks other Pokemon's sound moves. Sound moves spare allies. Damaging sound moves bypass ordinary Protect-family moves and Wide Guard for full damage, but not Max Guard. After a complete sound attack deals opposing HP damage, the living, active user has one 30% chance to gain 1 Special Attack. Spread and multiple hits roll only once; Substitute-only hits, ally damage, misses and immunities do not qualify. This ability chance is unaffected by Serene Grace or Sheer Force.",
    "shortDesc": "Liquid Voice + Soundproof; sound bypasses ordinary guards; 30% +1 SpA after foe HP damage."
  },
  "dozinggiant": {
    "desc": "Oblivious. While actually asleep, takes 25% less Special attack damage and opponents cannot force it to switch. Voluntary switching still works. Sleep Talk cannot select Rest.",
    "shortDesc": "While asleep, takes 25% less special damage and cannot be forced out; Sleep Talk excludes Rest."
  },
  "skywarden": {
    "desc": "Wind Rider. After successful Defog clears effects, creates five-turn Mist without shortening longer Mist. The first successful Defog each entry heals 1/8 max HP; this allowance is consumed even at full HP. Defog is not a wind move.",
    "shortDesc": "Wind Rider; successful Defog sets Mist and first per entry heals 1/8 HP."
  },
  "saltcrust": {
    "desc": "Prevents opposing stat drops. While Defense is positively boosted, opponents cannot remove its held item. Does not prevent its boosts being reset, stolen or ignored.",
    "shortDesc": "While Defense is boosted, its held item cannot be removed."
  },
  "quarrycannon": {
    "desc": "Mega Launcher: pulse and bullet moves gain 50% power. Damaging pulse and bullet moves become Physical, using Attack against Defense, except Z/Max moves. Accuracy, secondary effects, hit counts, and recharge rules are unchanged.",
    "shortDesc": "Mega Launcher; damaging pulse/bullet moves become Physical (except Z/Max)."
  },
  "ringmaster": {
    "desc": "Tough Claws once. The first damaging Dark move attempted each genuine entry gains +1 priority; misses and protection spend it, but pre-action flinch or paralysis do not. Ability restarts do not reset it. Each successful Dark attack dealing opposing HP damage attempts two-turn Taunt on surviving foes, with ordinary Taunt immunity and reapplication rules. A committed living switch-out, including pivots and forced switches, clears own-side hazards before entry and gives the exact replacement +1 in its highest non-HP stat after entry and Baton Pass transfer. Suppression at departure prevents this benefit; fainting is not a switch-out.",
    "shortDesc": "Tough Claws; first Dark attempt +1 priority; Dark HP hits Taunt; switch clears hazards and boosts replacement."
  },
  "reinflate": {
    "desc": "Punk Rock: sound power 1.3x (1.5x on Big Top/Cave); incoming sound damage halved. Once per turn after a whole sound attack deals opposing HP damage, heals 1/4 max HP while alive and active. Heal Block applies; switching or changing abilities does not refresh the turn allowance.",
    "shortDesc": "Punk Rock; sound HP damage heals 1/4 max HP once per turn."
  },
  "savageresolve": {
    "desc": "Guts: Attack is multiplied by 1.5 while statused, and burn does not halve physical damage. Once per actual entry, after surviving an entire opposing damaging move that dealt actual HP damage while it was already statused, it gains one Speed stage if still active. Status inflicted after a hit does not make that hit qualify. All hits and opponents share one activation. Substitute-only, ally, self, residual and delayed damage do not qualify. Switching resets usage; ability replacement and suppression do not. Suppression disables the effect. The Speed boost is an ordinary stat stage and does not remove paralysis's Speed penalty.",
    "shortDesc": "Surviving a qualifying foe move while statused gives +1 Speed once per entry."
  },
  "pulseeruption": {
    "desc": "Camerupt-Pulse automatically receives Eruption, Snarl, Shadow Ball, and Earth Power in that order. Sturdy: OHKO moves fail, and direct move damage cannot KO it from full HP. On entry, attempts to create or refresh Super-Heated Terrain for 3 turns, respecting normal field restrictions. Skill Swap fails. At Camerupt-Pulse's fixed 1 HP, Sturdy can prevent repeated direct hits; indirect damage and ability bypass remain effective. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use. Camerupt must be at full HP immediately before Pulse Evolution or it faints before its HP is converted to 1. Its field creation, refresh and conversion last exactly 3 turns; Amplifield Rock does not extend them.",
    "shortDesc": "5-turn Super-Heated field on entry; no Skill Swap."
  },
  "toxicsignature": {
    "desc": "Unnerve, including its field effects. Poison attacks dealing opposing HP damage place one Toxic Spikes layer on that side only if none exists. Damaging attacks against poisoned targets ignore accuracy and evasion stages but retain their base accuracy and other accuracy modifiers.",
    "shortDesc": "Poison HP hits lay a first Toxic Spikes layer; ignores stages vs poisoned foes."
  },
  "cinderscales": {
    "desc": "Flame Body and Swarm, including their field effects. Prevents externally inflicted accuracy-stage drops; self-inflicted accuracy costs still apply.",
    "shortDesc": "Combines the listed abilities."
  },
  "rimebreaker": {
    "desc": "Refrigerate, including its field boosts only for converted moves. Once per turn, an Ice move dealing opposing HP damage removes this side's Stealth Rock and one Spikes layer. Toxic Spikes and Sticky Web remain. Natural Ice moves receive no extra ability damage boost.",
    "shortDesc": "Ice HP hits clear own Stealth Rock and one Spikes layer once per turn."
  },
  "shattercrust": {
    "desc": "Crumbling Shell: physical HP hits set Stealth Rock on the attacker's side if absent (an allied attacker instead selects the opposing side), except on Water Surface, Underwater, Murkwater Surface and Swamp. Additionally, the first opposing physical HP hit each stay deals half damage; if it survives it, adds one Spikes layer to the attacker's side.",
    "shortDesc": "First opposing physical HP hit each stay deals half damage and adds Spikes."
  },
  "freshplumage": {
    "desc": "Natural Cure: switching cures status and heals 1/8 max HP only when curing status; Bewitched Woods cures status at turn end without that heal. Its first successful Flying attack each entry deals 1.2x damage across all hits, including Substitute damage. Misses, Protect and immunity preserve the charge. A successful Roost can restore a spent charge once per entry, allowing at most two boosted Flying attacks. Roost before spending the initial charge does not grant or store another charge.",
    "shortDesc": "First Flying attack has 1.2x power; successful Roost restores the charge once per entry."
  },
  "conquerorswill": {
    "desc": "Unnerve prevents opposing Pokemon from eating Berries or using field Seeds. On Cold Eclipse entry, lowers each foe's Speed one stage unless behind Substitute. Kowtow Cleave removes opposing Reflect, Light Screen and Aurora Veil before damage, even through Substitute; protection, a miss or immunity prevents removal. Suppression disables these active effects.",
    "shortDesc": "Kowtow Cleave breaks opposing screens."
  },
  "fruitfulbough": {
    "desc": "Harvest: at each turn end, has a 50% chance to restore its last consumed Berry or eligible field seed if it has no item; always restores in sun, Grassy Terrain or Flower Garden 2. Consuming its own Berry heals each active ally by 1/8 of that ally's max HP once per turn. The holder receives only the Berry's normal benefit. Removed, stolen or restored items and consumed seeds do not trigger ally healing.",
    "shortDesc": "Consuming its own Berry heals active allies 1/8 HP once/turn, excluding itself."
  },
  "soulanchor": {
    "desc": "Steelworker: Steel attacks gain STAB and 1.5x Attack or Sp. Atk (2x on Factory); on Short-Circuit they also become Electric-type. Immune to Poison attacks; resists Normal, Flying, Rock, Bug, Steel, Grass, Psychic, Ice, Dragon and Fairy attacks. A foe successfully trapped by its Anchor Shot loses 1/16 max HP each turn end; the holder heals by actual damage dealt. Only one tether per holder; a new tether replaces the old, and either Pokemon leaving ends it. Trap immunity, escape, indirect-damage immunity, suppression and healing restrictions apply.",
    "shortDesc": "Its Anchor Shot tethers one trapped foe, draining 1/16 HP each turn."
  },
  "eldritchremedy": {
    "desc": "Own Tempo + Curious Medicine: prevents confusion and Intimidate Attack drops. On entry, clears negative stages and confusion from self and active allies, keeping positive stages; each Pokemon cleansed heals 1/8 max HP. Once per turn, a damaging Eerie Spell cures one major status: the holder first, otherwise the statused active ally with lowest HP percentage. Does not affect the bench.",
    "shortDesc": "Eerie Spell cures one major status on self or an active ally once/turn."
  },
  "hydraulicarmor": {
    "desc": "Stamina. Water Pulse and Hydro Pump use higher boosted Defense or Sp. Atk, remaining Special against Sp. Def. Successful Withdraw uses one free Water Pulse at the corresponding opposing slot, falling back to the first living legal adjacent foe. Protect fires one Water Pulse at the surviving active attacker after the first opposing damaging attack it fully blocks that turn; no trigger from Z/Max chip or generated attacks. Shelter has no attack. A Skull Bash opposing HP strike uses one Hydro Pump at the same surviving active foe after the whole attack. All follow-ups require a living active holder, use no PP, cannot recurse, and retain normal accuracy, protection, immunity and effects.",
    "shortDesc": "Stamina; Withdraw/Protect fire Water Pulse; Skull Bash fires Hydro Pump."
  },
  "voiddrift": {
    "desc": "Overcoat. Restores 1/16 of its base max HP each turn during sand. While airborne on effective New World, its special Ground moves ignore its negative Sp. Atk stages for damage calculation. Positive stages and other modifiers remain; its actual stages are unchanged.",
    "shortDesc": "On New World, its special Ground moves ignore lowered Sp. Atk while airborne."
  },
  "dreadwings": {
    "desc": "Intimidate and Unnerve: on entry, lowers adjacent foes' Attack one stage under normal Intimidate protections; foes cannot eat Berries or use field seeds while Unnerve is active. On Cold Eclipse entry, lowers opposing Speed one stage unless protected by Substitute. A Dark Pulse that damages a surviving foe also applies Torment under normal volatile-status rules, preventing consecutive use of the same move. Existing Torment does not stack.",
    "shortDesc": "Weakens foes on entry; Dark Pulse damage applies Torment to surviving foes."
  },
  "demolitiontrunk": {
    "desc": "Sheer Force. Once per entry, the first Heavy Slam or Heat Crash to damage a foe removes Reflect, Light Screen and Aurora Veil from that foe's side after damage. Both moves share one charge; misses, protection and hits only on Substitute do not spend it.",
    "shortDesc": "First Heavy Slam or Heat Crash damage each entry clears the foe side's screens after damage."
  },
  "deepresonance": {
    "desc": "Soundproof. Psychic Noise that damages a surviving foe also lowers that foe's Attack by one stage, once per target per move. Normal stat-drop protection applies; Psychic Noise has its effects.",
    "shortDesc": "Psychic Noise damage lowers surviving foes' Attack once per target per move."
  },
  "siegemagnet": {
    "desc": "Magnet Pull. Once per entry, the first Electric attack to damage a foe also attempts Heal Block on that foe for this turn and the following turn. Normal volatile-status protection applies; Heal Block is not shortened. Misses, protection and Substitute-only hits preserve the charge. No power boost.",
    "shortDesc": "First Electric attack damage each entry applies two-turn Heal Block."
  },
  "patientmarksman": {
    "desc": "Sniper: gains one accuracy stage on entry and has its critical-damage modifier. Successfully using Focus Energy also clears its confusion and negative accuracy stages, preserving positive accuracy and other stages. Failed Focus Energy grants no cleanse.",
    "shortDesc": "Successful Focus Energy clears its confusion and negative accuracy."
  },
  "cradleward": {
    "desc": "Sweet Veil prevents sleep and Yawn for itself and allies, including Rest, without curing sleep. Successfully setting Trick Room also sets normal five-turn Safeguard on its own side. Turning Trick Room off does not count.",
    "shortDesc": "Setting Trick Room also sets five-turn Safeguard on its side."
  },
  "sunreserve": {
    "desc": "Flash Fire, including its Fire power boost and field effects. Absorbing a Fire attack additionally heals 1/8 max HP at most once per turn, subject to healing restrictions. Cold Eclipse has Flash Fire's entry Defense/Sp. Def boosts and disables Fire absorption, so no absorption heal occurs there. Field-granted Flash Fire boosts do not trigger healing.",
    "shortDesc": "Absorbing a Fire attack also heals 1/8 HP once per turn."
  },
  "silentreprisal": {
    "desc": "Soundproof + full local Anticipation. Immune to other Pokemon's sound moves. On entry, exposes opposing Illusion and checks for super-effective attacks or OHKO moves; if none trigger its warning, gains two Sp. Atk stages on Psychic Terrain, matching local Anticipation.",
    "shortDesc": "Combines the listed abilities."
  },
  "dreamrefuge": {
    "desc": "Telepathy: immune to allied damaging moves and doubles Speed on Psychic Terrain or its aura. Once per entry, its first successful Moonlight also cures one active ally's major status, choosing the affected ally with the lowest HP percentage. Ordinary Moonlight healing and failure rules apply.",
    "shortDesc": "First successful Moonlight each entry cures the statused active ally with lowest HP percentage."
  },
  "closedcircuit": {
    "desc": "Clear Body prevents other Pokemon from lowering its stat stages. If both Gear Grind hits damage the target, heals 1/16 max HP after the move, once per use. No healing if either hit misses, is blocked, hits only Substitute, or the first hit ends the attack. Normal healing restrictions apply.",
    "shortDesc": "Heals 1/16 HP after Gear Grind if both hits damage the target."
  },
  "pridecall": {
    "desc": "Competitive + Unnerve. Opposing stat drops grant +2 Sp. Atk outside Chess Board; on Chess Board, has Competitive's missing-HP power boost instead. Foes cannot eat Berries or use field seeds while Unnerve is active; has its Cold Eclipse entry Speed drops.",
    "shortDesc": "Combines the listed abilities."
  },
  "solarstride": {
    "desc": "Chlorophyll, including the Flower Garden stage-four Speed boost. While sunlight is effective, damaging Electric attacks remove opposing Reflect, Light Screen and Aurora Veil before damage using normal screen-breaking rules. Does not bypass Protect or immunities, and grants no extra damage multiplier.",
    "shortDesc": "In effective sun, Electric attacks break opposing screens before damage."
  },
  "frillflash": {
    "desc": "Dazzling. When its Electrify actually converts an opposing move from another type to Electric, attempts to Disable that converted move after it finishes, through the end of the following turn. Normal Disable eligibility and protection apply. No bonus for failed Electrify, inability to act, an already-Electric move, or an allied move.",
    "shortDesc": "Its Electrify conversion Disables the opposing move after execution through next turn."
  },
  "stokebelly": {
    "desc": "Gluttony. Consuming a Berry clears its negative Attack stages, preserving positive Attack and other stages.",
    "shortDesc": "Eating a Berry clears its negative Attack stages."
  },
  "rousingfeast": {
    "desc": "Gluttony. Consuming a Berry clears its negative Attack and Speed stages, preserving positive stages and all other stats.",
    "shortDesc": "Eating a Berry clears its negative Attack and Speed stages."
  },
  "sentinelfist": {
    "desc": "Iron Fist gives punching moves 1.4x power. Once per entry, when its Wide Guard actually blocks an opposing damaging attack, restores 1/8 max HP under normal healing restrictions. No reward for using Wide Guard without blocking an attack.",
    "shortDesc": "Its first Wide Guard block each entry heals 1/8 max HP."
  },
  "pursuitwake": {
    "desc": "Infiltrator. Aqua Jet that deals damage clears its negative Speed stages, preserving positive Speed. Misses, protection and damage immunity give no cleanse.",
    "shortDesc": "Damaging Aqua Jet clears its negative Speed stages."
  },
  "gentlegiant": {
    "desc": "Cloud Nine suppresses weather effects and has its Rainbow Field random stat boost. Once per entry, gains one Sp. Atk stage when an adjacent ally survives an opposing attack that takes it from above half HP to half HP or less. No trigger from self-damage, allied attacks, indirect damage, or a KO. Normal boost rules apply.",
    "shortDesc": "Once per entry, +1 Sp. Atk when an adjacent ally survives a foe hit crossing half HP."
  },
  "ringcraft": {
    "desc": "Limber prevents and cures paralysis and blocks opposing and field Speed reductions. The first damaging Flying Press hit against a foe each entry attempts two-turn Taunt after damage, under normal Taunt protection. Misses, Protect and Substitute preserve the charge; Taunt is not shortened.",
    "shortDesc": "First Flying Press damage each entry attempts two-turn Taunt after the hit."
  },
  "constrictingheat": {
    "desc": "White Smoke prevents other Pokemon from lowering its stats and grants +1 Attack and Sp. Atk on Volcanic entry. Fire Lash damage partially traps a surviving foe as Fire Spin for this turn end and the next. Only one ability trap per holder; a new trapped foe releases the previous one. No stacking with partial traps. Traps end when the holder leaves, loses the ability or Dynamaxes/Gigantamaxes. Normal escape, protection and residual-damage rules apply.",
    "shortDesc": "Damaging Fire Lash binds one foe for two turns. Switching or Dynamax/Gigantamax ends it."
  },
  "wreckingcrew": {
    "desc": "Iron Fist gives punching moves 1.4x power. Damaging punches remove opposing Reflect, Light Screen, Aurora Veil, Arenite Wall and Atlantis Wall before damage, under normal screen-breaking rules. Does not bypass protection, immunity or Substitute and grants no extra attacks.",
    "shortDesc": "Damaging punches break opposing screens and custom walls before damage."
  },
  "evergreen": {
    "desc": "Overcoat + Ripen: immune to powder moves and sandstorm/hail damage; applicable Berry effects are doubled, including local Ripen behavior. No additional effect.",
    "shortDesc": "Combines the listed abilities."
  },
  "battlegrip": {
    "desc": "Moxie grants +1 Attack for each Pokemon knocked out by its move. Knocking out an opponent with a move also clears its confusion and negative accuracy stages, preserving positive accuracy.",
    "shortDesc": "Move KOs against opponents also clear its confusion and negative accuracy."
  },
  "scentscout": {
    "desc": "Frisk on entry reveals opposing active Illusions and held items; each item holder independently has a 30% chance of five-turn Embargo. Once per holder entry, the first opponent switching in while this Pokemon is already active also has its held item revealed. This extra observation only reveals the item and never repeats Frisk's other effects; an empty item slot still spends it.",
    "shortDesc": "Once per entry, reveals the first incoming opponent's item while already active."
  },
  "baitedbloom": {
    "desc": "Gluttony makes pinch Berries activate at half HP and Leftovers heal 1/8 max HP each turn. Regenerator restores 1/3 base max HP when switching out.",
    "shortDesc": "Gluttony and Regenerator: early pinch Berries, stronger Leftovers; heals 1/3 on switching."
  },
  "guidinggallop": {
    "desc": "Pastel Veil, including poison prevention/cures for itself and allies, opposing Poison-move Attack/Sp. Atk drops and field effects. A successful status move directly targeting another ally also clears that ally's negative Speed stages, preserving positive Speed. Self-targeting and side-wide or field moves do not trigger it.",
    "shortDesc": "Successful status moves directly targeting an ally clear that ally's negative Speed."
  },
  "carrionwatch": {
    "desc": "Frisk + Unnerve. Entry reveals opposing active Illusions and held items, with each item holder independently having a 30% chance of five-turn Embargo. Foes cannot eat Berries or use field seeds while Unnerve is active; has its Cold Eclipse entry Speed drops.",
    "shortDesc": "Combines the listed abilities."
  },
  "scaleshelter": {
    "desc": "Overcoat blocks powder moves and sandstorm/hail damage. The first successful directly selected Quiver Dance per switch-in grants one ward: opposing damaging attacks deal 20% less HP damage until the end of the first such attack to damage HP, including all its hits. Misses, protection, immunity, Substitute-only damage and zero HP damage preserve it. Called moves do not grant it; wards cannot stack.",
    "shortDesc": "Overcoat; first selected Quiver Dance each entry grants a 20% whole-attack HP ward."
  },
  "stagesweep": {
    "desc": "Screen Cleaner. Holder and adjacent active allies have Infiltrator while the holder remains active. A successful Rapid Spin, including Substitute damage, gives ordinary current-turn Helping Hand to an eligible partner and pivots if a legal replacement exists. An already-acted partner is ineligible unless newly switched. Once per entry, actual hazard removal also clears all negative stat stages and heals 1/8 base max HP. No-hazard success can still support/pivot; misses, protection, immunity and contact KO cannot. Ally Infiltrator ends when the holder leaves.",
    "shortDesc": "Screen Cleaner; ally Infiltrator; Rapid Spin supports partner and pivots."
  },
  "icebreaker": {
    "desc": "Hyper Cutter prevents other Pokemon from lowering its Attack. Ice Hammer removes opposing Reflect before damage, including through Substitute, but not on protection, a miss or immunity. Its Speed drop is unchanged.",
    "shortDesc": "Ice Hammer breaks Reflect before damage and keeps its Speed drop."
  },
  "crushingvenom": {
    "desc": "Strong Jaw gives biting moves 1.5x power. Once per entry, its first damaging bite against a foe applies two-turn Heal Block after HP damage. A hit absorbed by Substitute spends the use without affecting its holder; misses, protection and immunity do not spend it.",
    "shortDesc": "First damaging bite each entry applies two-turn Heal Block after damage."
  },
  "crosswire": {
    "desc": "Iron Fist gives punches 1.4x power. A damaging punch against a foe stores one charge. Its next special Electric attack ignores positive Sp. Def stages when Sp. Def is used for damage. Successful HP or Substitute damage consumes the charge; misses, protection and immunity preserve it. A physical Electric punch cannot consume its newly gained charge. No extra damage multiplier; switching clears the charge.",
    "shortDesc": "A damaging punch charges the next special Electric attack to ignore positive Sp. Def."
  },
  "deepchill": {
    "desc": "Oblivious + Intimidate. After surviving a whole opposing damaging move that deals HP damage, lowers the attacker’s Speed by 1 once per turn.",
    "shortDesc": "Oblivious + Intimidate; surviving a hit lowers attacker Speed once/turn."
  },
  "tunnelclearance": {
    "desc": "Hyper Cutter. Successful Rapid Spin damage removes opposing Reflect and Light Screen after damage, including when hitting Substitute. Does not remove Aurora Veil or other walls.",
    "shortDesc": "Damaging Rapid Spin removes opposing Reflect and Light Screen after damage."
  },
  "crystalbastion": {
    "desc": "Sturdy. Once per entry, its own Wide Guard actually blocking an opposing damaging attack clears only its negative Defense and Sp. Def stages. Positive stages remain.",
    "shortDesc": "First own Wide Guard block each entry clears negative Defense and Sp. Def."
  },
  "buriedcoil": {
    "desc": "Sand Spit summons sandstorm when hit by an attack. Once per entry, successfully using Coil clears its confusion and negative accuracy stages, preserving positive accuracy.",
    "shortDesc": "First successful Coil each entry clears confusion and negative accuracy."
  },
  "staticreserve": {
    "desc": "Static: contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit. Once per entry, successfully causing paralysis with Static grants Charge. Failed status attempts do not spend the use.",
    "shortDesc": "Its first successful Static paralysis each entry grants Charge."
  },
  "garlandgift": {
    "desc": "Flower Veil, including its field effects. Once per entry, successful Floral Healing also clears the recipient's confusion and negative accuracy stages. Positive accuracy remains; failed healing does not spend the use.",
    "shortDesc": "First successful Floral Healing each entry clears recipient confusion and negative accuracy."
  },
  "riotstance": {
    "desc": "Defiant. Once per entry, successfully blocking an opposing damaging attack with Obstruct stores one charge. Its next damaging Dark move gains +1 priority and consumes the charge when actually attempted, not during priority previews. Switching clears the charge; subsequent blocks cannot rearm it that entry. Sucker Punch still requires its usual success condition.",
    "shortDesc": "First damaging Obstruct block each entry grants +1 priority to its next damaging Dark move."
  },
  "drumguard": {
    "desc": "Soundproof. Once per entry, Drum Beating successfully lowering an opposing Pokemon's Speed clears only the user's negative Defense and Sp. Def stages. Positive stages remain. Misses, immunity and blocked Speed drops do not trigger or spend the use.",
    "shortDesc": "First successful Drum Beating Speed drop each entry clears own negative Defense and Sp. Def."
  },
  "measuredcounsel": {
    "desc": "Own Tempo prevents and cures confusion and blocks Intimidate's Attack drop. Successfully scheduling Future Sight also clears its confusion and negative Sp. Atk stages, preserving positive Sp. Atk. An occupied Future Sight slot does not trigger this effect.",
    "shortDesc": "Successful Future Sight clears own confusion and negative Sp. Atk."
  },
  "raincourier": {
    "desc": "Rain Dish: restores 1/16 max HP in effective rain. Once per entry, successfully establishing Tailwind removes entry hazards from its own side. Failed Tailwind while already active does not trigger or spend the use.",
    "shortDesc": "Once per entry, successfully setting Tailwind clears own-side entry hazards."
  },
  "disorientingmind": {
    "desc": "Infiltrator bypasses Substitute and opposing protective screens. Once per entry, its first damaging Psychic attack dealing opposing HP damage applies Torment after damage, subject to normal eligibility. Misses, Protect and immunity do not spend the use.",
    "shortDesc": "First damaging Psychic hit each entry applies Torment after damage."
  },
  "wisecounsel": {
    "desc": "Inner Focus blocks flinching and Intimidate's Attack drop. Once per entry, successfully using Instruct on an active ally cures that ally's confusion before its ordinary repeated action. Failed Instruct and non-ally targets do not trigger or spend the use.",
    "shortDesc": "First successful ally Instruct each entry cures confusion before the repeated action."
  },
  "mindcurrent": {
    "desc": "Inner Focus blocks flinching and Intimidate. Once per entry, Psychic damage to a foe or its Substitute grants Charge after the move ends, so the triggering move cannot consume it.",
    "shortDesc": "Inner Focus; first Psychic damage each entry grants Charge after the move."
  },
  "afterlifegate": {
    "desc": "Once per turn after a whole special Ghost or Poison attack damages an opposing Pokemon's HP, curses one surviving active foe if it is not already cursed. This ability-sourced Curse deals 1/8 base max HP each turn and costs its user no HP. Once per turn, a foe knocked out by its own attack or its own Afterlife Gate Curse heals it for 1/8 max HP, only while it is alive and active. Other curses and unrelated knockouts do not qualify. Shadow Shield reduces attack damage by 20%, or 40% for super-effective attacks, at any HP; it has its Cold Eclipse hail immunity.",
    "shortDesc": "Special Ghost/Poison HP hits curse once per turn; own KOs heal; Shadow Shield."
  },
  "unbridledwrath": {
    "desc": "Sheer Force removes eligible secondary effects and gives those moves approximately 1.3x power, once. Rampage moves still lock the user and cause their normal ending confusion. Inner Focus prevents flinching and Intimidate Attack drops.",
    "shortDesc": "Sheer Force + Inner Focus."
  },
  "venompincer": {
    "desc": "Poison Touch: contact attacks have a 30% poison chance, subject to Shield Dust, Covert Cloak and normal poison immunities. The first damaging contact hit dealing opposing HP damage each entry lowers that target's Speed by 1. Switching resets this allowance; ability changes do not. Misses, protection, immunity and Substitute-only damage do not spend it. A knockout spends it without lowering a fainted target's Speed.",
    "shortDesc": "Poison Touch; first opposing contact HP hit per entry lowers target Speed."
  },
  "patriarchswrath": {
    "desc": "Power Drill boosts drill and horn moves by 1.5x, or 2x with protection bypass on its supported rocky fields. Whiplash grants +1 accuracy on entry and 1.5x tail-move power. Poison and Ground attacks use the higher Attack/Defense or Sp. Atk/Sp. Def ratio to choose their damage category. Horn and tail moves gain one critical-hit stage.",
    "shortDesc": "Power Drill + Whiplash; adaptive Poison/Ground category; horn/tail +1 critical stage."
  },
  "matriarchsvigil": {
    "desc": "Thick Fat and Aroma Veil. Once per genuine entry, after this Pokemon or an adjacent ally survives an opposing whole damaging move that takes it from above half HP to half HP or less, the injured Pokemon gains +1 Defense and +1 Sp. Def after all hits. One shared activation per entry. Residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not reset the budget. Rivalry is a separate species passive; Friend Guard is not included.",
    "shortDesc": "Thick Fat + Aroma Veil; once/entry, surviving a hit across half HP gives self or an adjacent ally +1 Def/SpD."
  },
  "bloodmoongaze": {
    "desc": "Infiltrator bypasses Substitute and opposing screens. Competitive grants +2 Sp. Atk when an opposing Pokemon lowers a stat; on Chessboard it instead scales move power up to 2x as HP falls.",
    "shortDesc": "Infiltrator + Competitive."
  },
  "errorhandler": {
    "desc": "Aroma Veil protects this Pokemon and its allies from Attract, Disable, Encore, Heal Block, Taunt and Torment. Infiltrator bypasses Substitute and opposing screens.",
    "shortDesc": "Aroma Veil + Infiltrator."
  },
  "stillmind": {
    "desc": "Anticipation reveals opposing Illusions and warns of super-effective or OHKO moves, with its Psychic Terrain Sp. Atk boost. Oblivious prevents infatuation, Taunt, Captivate and Intimidate Attack drops and cures infatuation or Taunt.",
    "shortDesc": "Anticipation + Oblivious."
  },
  "shellderartillery": {
    "desc": "Mega Launcher gives pulse and bullet moves 1.5x power. Oblivious prevents infatuation, Captivate, Taunt and Intimidate Attack drops, and cures infatuation and Taunt.",
    "shortDesc": "Mega Launcher + Oblivious."
  },
  "teaceremony": {
    "desc": "Sticky Hold protects the held item from removal. Aroma Veil protects the user and allies from infatuation, Disable, Encore, Heal Block, Taunt and Torment.",
    "shortDesc": "Sticky Hold + Aroma Veil."
  },
  "familyguardian": {
    "desc": "Friend Guard reduces damage to other allies by 25%; full local Healer gives each adjacent statused ally a 30% chance to be cured each turn. Once per genuine entry, after the user or an adjacent ally survives an opposing whole damaging attack that takes it from above half HP to half HP or less, it heals 1/4 of its max HP after all hits. One shared budget is spent only when healing succeeds. Heal Block prevents healing; residual damage, friendly fire and Substitute-only damage do not qualify. Ability restarts do not refresh the budget.",
    "shortDesc": "Friend Guard + Healer; once/entry, rescues self or an adjacent ally crossing half HP with 1/4 healing."
  },
  "apocalypticflame": {
    "desc": "Own Tempo. Once per turn after a physical attack deals opposing HP damage, heals 1/8 max HP and attempts to lower one damaged surviving opponent’s stronger attacking stat by one stage, Attack on ties. Normal healing and stat-drop restrictions apply independently.",
    "shortDesc": "Own Tempo; physical HP hit heals 1/8 and lowers foe’s stronger attack once per turn."
  },
  "rupturedheaven": {
    "desc": "Sharpness boosts slicing moves by 1.5, except on Cold Eclipse Terrain. Only slicing moves become non-contact. Other contact moves remain contact moves.",
    "shortDesc": "Sharpness; slicing moves become non-contact."
  },
  "wintersmalice": {
    "desc": "Refrigerate, Berserk and Cursed Body. Eligible Normal moves become Ice and gain Refrigerate’s power boost. Direct attack damage crossing half HP raises Attack and Sp. Atk; Berserk also grants its Dragon’s Den entry boosts. Cursed Body can disable damaging moves, has its field exceptions, and curses foes when the holder faints. Components do not duplicate an existing species passive.",
    "shortDesc": "Refrigerate + Berserk + Cursed Body."
  },
  "swiftvenom": {
    "desc": "Swift Swim and Merciless. Doubles Speed in effective rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Attacks always critically hit poisoned targets and on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three.",
    "shortDesc": "Swift Swim + Merciless."
  },
  "soulreaver": {
    "desc": "Infiltrator: bypasses opposing Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Physical and special Ghost attacks, including Night Shade, restore HP equal to 25% of actual damage dealt. Uses the greater of native drain and 25%, never adds them; Spectral Scream remains 25%. Curse residual damage does not drain. Normal ability suppression disables both effects.",
    "shortDesc": "Infiltrator; Ghost attacks drain at least 25% of damage dealt."
  },
  "steelwingescort": {
    "desc": "Sworn Duty: on entry heals adjacent allies by 1/4 max HP, or 1/3 on Fairy Tale Field. A successful U-turn protects its incoming replacement from entry-hazard damage during that entry only. Hazard statuses, Sticky Web and hazard layers remain.",
    "shortDesc": "Sworn Duty; U-turn shields the replacement from entry-hazard damage once."
  },
  "silenthunter": {
    "desc": "Super Luck raises the critical-hit rate of all moves by one stage. Biting moves gain one additional critical-hit stage. In current-generation battles, ordinary biting moves have a 50% critical-hit chance, or 100% with Scope Lens or Razor Claw. Normal critical-hit damage and critical-hit prevention apply.",
    "shortDesc": "Super Luck; biting moves gain another critical-hit stage."
  },
  "magneticcommand": {
    "desc": "Frisk and Stalwart, including their entry effects and targeting behavior.",
    "shortDesc": "Frisk + Stalwart."
  },
  "plushwhiplash": {
    "desc": "Whiplash, Technician and Fluffy: entry raises accuracy, tail attacks gain 1.5x power, Technician checks calculated power before the tail boost, contact damage is halved and Fire damage doubled.",
    "shortDesc": "Whiplash + Technician + Fluffy."
  },
  "silkensalvo": {
    "desc": "Fluffy. Eligible single-target, single-hit attacks become 2–5 hits at 40% calculated power each, rounded to nearest with ties down before modifiers. Hit distribution is 2, 2, 3, 3, 4, 5; Loaded Dice gives 5 hits for converted attacks only. One initial accuracy check, separate critical rolls and drain each hit; move secondaries run only on the first two hits. Fury Cutter and Stacking Shot advance their shared chain once per move. Native multi-hit moves are unchanged. Fixed-damage, OHKO, charge, recharge, self-KO, delayed, Z/Max moves and Fling, Endeavor, Beat Up, Rollout, Ice Ball and Uproar are excluded.",
    "shortDesc": "Fluffy; eligible single-hit attacks hit 2–5 times at 40% power per hit."
  },
  "abyssalclaws": {
    "desc": "Tough Claws boosts contact moves once. Water attacks receive ordinary 1.5x STAB without adding Water typing or stacking another STAB bonus if already Water-type. Incoming Fire, Water, Ice and Steel attacks receive one extra resistance factor. Does not add Water weaknesses or lower Speed.",
    "shortDesc": "Tough Claws; Water STAB; halves Fire, Water, Ice and Steel damage."
  },
  "antlioninstinct": {
    "desc": "Sheer Force. Bug attacks receive ordinary 1.5x STAB, without stacking extra STAB if already Bug-type. Incoming Grass, Ground and Fighting attacks receive one extra resistance factor, once regardless of defensive typing. No Bug typing or weaknesses are added.",
    "shortDesc": "Sheer Force; Bug STAB; one extra Grass, Ground and Fighting resistance."
  },
  "burrowambush": {
    "desc": "Earth Eater. A direct opposing attack KO arms a retreat. Once a living opposing replacement has completed entry effects and any entry faint chain, the user must choose a legal benched replacement. One retreat per KO batch. No retreat after a battle-winning KO, without a legal bench, or from ally, indirect, delayed, recoil, hazard or Destiny Bond KOs. Fainting, departure, ability loss or suppression cancels the pending retreat. Other pending switches are preserved.",
    "shortDesc": "Earth Eater; after a direct foe KO, retreats once the replacement settles."
  },
  "adhesivearmor": {
    "desc": "Sticky Hold protects the held item. Opposing moves and effects cannot force this Pokemon to switch. Voluntary switches and its own pivot moves remain available.",
    "shortDesc": "Sticky Hold; cannot be forced to switch."
  },
  "causticooze": {
    "desc": "Liquid Ooze reverses healing from draining moves, Leech Seed and Strength Sap, including doubled damage on Murkwater Surface and Wasteland. Poison attacks have 1.3x power.",
    "shortDesc": "Liquid Ooze; Poison attacks have 1.3x power."
  },
  "royalpresence": {
    "desc": "Pressure and Unnerve. Opposing moves targeting it cost extra PP (2 extra in Midnight Zone); entry lowers opposing Defense and Sp. Def, and Underwater becomes Midnight Zone. Unnerve prevents opposing berry use and has its field effects. Outside Cold Eclipse, its Defense and Sp. Def drop is attempted only once per opposing Pokemon per battle for each Pressure user. Switching, Transform and ability loss or regain do not reset that allowance; a blocked or reflected attempt spends it. Cold Eclipse has repeatable -2 drops on entry and neither spends nor resets the ordinary allowance.",
    "shortDesc": "Pressure + Unnerve."
  },
  "hivesanctuary": {
    "desc": "Sweet Veil prevents sleep and Yawn on the holder and its allies, including Rest, without curing sleep. Friend Guard reduces attack damage to allies by 25%; it does not reduce damage to the holder.",
    "shortDesc": "Sweet Veil + Friend Guard."
  },
  "trickperformer": {
    "desc": "Technician and Prankster. Reflect and Light Screen receive a total of +1 priority when Mimecraft is also present.",
    "shortDesc": "Technician + Prankster; Mimecraft screens total +1 priority."
  },
  "taptempo": {
    "desc": "Own Tempo. After an Ice- or Psychic-type attack damages an opponent, attempts to lower that opponent's Speed by one stage with 30% probability, once per whole move. Does not trigger on allies or Substitute-only damage.",
    "shortDesc": "Own Tempo; damaging Ice/Psychic attacks have one 30% Speed-drop roll."
  },
  "prismskimmer": {
    "desc": "Water attacks receive ordinary 1.5x STAB without stacking extra STAB when already Water. Incoming Fire, Water, Ice and Steel attack damage is halved, without adding Water typing or weaknesses. Gains ordinary two-turn Laser Focus on genuine entry and once after surviving opposing attack HP damage; no ally, residual or Substitute-only triggers.",
    "shortDesc": "Water STAB and resistances; Laser Focus on entry or after surviving a hit."
  },
  "astralconcord": {
    "desc": "Has all local Forewarn warning, Illusion reveal, damage protection and Psychic Terrain effects. Competitive raises Special Attack by two stages when an opponent lowers a stat.",
    "shortDesc": "Forewarn + Competitive."
  },
  "cellularconcord": {
    "desc": "Cures major status on switching out and, when curing status, heals 1/8 base max HP unless Withering Shell applies. Cures status at turn end on Bewitched Woods. Moves gain the local Analytic power boost when no other active Pokemon has a move remaining in the action queue.",
    "shortDesc": "Natural Cure + Analytic."
  },
  "guidingglow": {
    "desc": "Illuminate reveals opposing Illusion, ignores evasion and prevents opposing accuracy drops, retaining Mirror Arena and Starlight entry effects. Sweet Veil prevents sleep and Yawn on the holder and allies, including Rest, without curing sleep. Its Starlight ally Spotlight does not duplicate Fairy Ring.",
    "shortDesc": "Illuminate + Sweet Veil."
  },
  "rainlitgrowth": {
    "desc": "Rain Dish restores 1/16 base max HP during effective rain or heavy rain. Grass moves have 1.3x power during effective rain or heavy rain; weather suppression disables these rain benefits.",
    "shortDesc": "Rain Dish; Grass moves have 1.3x power in effective rain."
  },
  "rivalresolve": {
    "desc": "On genuine entry, becomes regularly poisoned if status-free. Poison Heal prevents poison damage and restores 1/8 base max HP, including its Corrosive, Wasteland, Corrosive Mist and Murkwater field recovery. Only this passive recovery bypasses healing prevention; it cannot revive or exceed max HP. Incoming Poison-type attacks are at most 0.5x effective after offensive matchup overrides; immunity and stronger resistance remain. Dragon-type Drake Fang is not Poison.",
    "shortDesc": "Poisons on entry; protected Poison Heal; Poison attacks are at most resisted."
  },
  "mycelialbond": {
    "desc": "Dry Skin, including Water absorption, Fire vulnerability, weather and field effects, once even with Parasitism. Self and adjacent allies’ eligible single-target single-hit attacks hit once more at 25% calculated damage. Does not stack with another holder or multihit/bond, retarget after a KO or recurse. Excludes spread, Z/Max, fixed/OHKO, delayed, charge/recharge, self-KO and item-consuming/repeating exceptions. No extra secondary or self-stat rolls; ordinary per-hit drain, recoil and Substitute interaction remain.",
    "shortDesc": "Dry Skin; self and adjacent allies gain one eligible extra hit at 25% damage."
  },
  "silentact": {
    "desc": "Soundproof. A successful status move stores one 1.3x power bonus for the next damaging Psychic/Fairy attack. Consumed on attempt even on miss, protection or immunity; does not stack and clears on switching.",
    "shortDesc": "Soundproof; successful status stores next Psychic/Fairy attack at 1.3x power."
  },
  "curtaincall": {
    "desc": "Ice Body and Filter. Ice Body has 30% contact frostbite, hail immunity, 1/16 recovery in hail/snow or qualifying cold fields and 1/8 in hail on Cold Eclipse. Filter multiplies non-super-effective attack damage by 0.8 and super-effective attack damage by 0.6; does not permanently change raw defenses.",
    "shortDesc": "Ice Body + Filter."
  },
  "pearlsiphon": {
    "desc": "Competitive. After an attack without drain deals opposing HP damage, restores 1/8 actual damage, capped at 1/8 max HP per turn. Resolves after the whole attack; excludes ally and Substitute-only damage. Ordinary ability-healing restrictions apply.",
    "shortDesc": "Competitive; non-draining attacks restore 1/8 opposing HP damage, capped each turn."
  },
  "pearltide": {
    "desc": "Hydration. Once per turn after a Water attack damages opposing HP, restores 1/16 max HP to this living active Pokemon and its lowest-HP-percentage adjacent living ally. Resolves after the whole attack; ordinary healing restrictions apply.",
    "shortDesc": "Hydration; Water HP hit heals self and weakest adjacent ally 1/16 once per turn."
  },
  "abyssalfang": {
    "desc": "Strong Jaw. Once per turn after a biting attack damages opposing HP, attempts to lower one damaged surviving opponent’s Special Defense by one stage after the whole attack. No ally or Substitute-only trigger; normal stat-drop protection applies.",
    "shortDesc": "Strong Jaw; bite HP attack lowers one foe’s Sp. Def once per turn."
  },
  "abyssalcurrent": {
    "desc": "Water Absorb. Once per turn after a Dark attack damages opposing HP, attempts to lower one damaged surviving opponent’s Attack by one stage after the whole attack. No ally or Substitute-only trigger; normal stat-drop protection applies.",
    "shortDesc": "Water Absorb; Dark HP attack lowers one foe’s Attack once per turn."
  },
  "soothingbouquet": {
    "desc": "Friend Guard and Infiltrator. Sweet Scent has normal and field effects. Each reached opposing target loses up to two positive stages from its highest boosted combat stat (Attack, Defense, Sp. Atk, Sp. Def, Speed tie order), stopping at zero, and loses Focus Energy. This direct reset bypasses stat-change reactions. If any normal stat drop, reset or Focus Energy removal succeeds, after the whole move the living holder and living adjacent allies heal 1/8 max HP and lose confusion independently of healing success. Then uses one ordinary free Giga Drain at the first affected surviving active foe in slot order. Protect blocks; reflected or generated Sweet Scent grants no custom effects or rewards. Normal healing and Giga Drain accuracy, protection, immunity and drain apply. No PP cost or recursion.",
    "shortDesc": "Friend Guard + Infiltrator; Sweet Scent calms foes, heals allies, then uses Giga Drain."
  },
  "mountainhide": {
    "desc": "Solid Rock and Inner Focus: takes 20% less attack damage, or 40% less from super-effective attacks, and prevents flinching and Intimidate Attack drops.",
    "shortDesc": "Solid Rock + Inner Focus."
  },
  "rimebark": {
    "desc": "Thick Fat and Ice Body: incoming Fire and Ice attacks use half the attacker's offensive stat; immune to hail damage. Contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow or qualifying cold fields, and 1/8 in hail on Cold Eclipse.",
    "shortDesc": "Thick Fat + Ice Body."
  },
  "championspoise": {
    "desc": "Once per battle, the first opposing damaging Ice-type move to damage its HP deals half damage for its entire use, including all hits. Misses, protection, immunity and Substitute-only damage do not consume it. Once per genuine entry, Swords Dance that actually raises a stat heals 1/8 max HP under normal healing rules. Switching resets only the healing allowance; restarting the selected ability does not reset either allowance.",
    "shortDesc": "First opposing Ice attack: half damage for all hits. Once/entry Swords Dance heals 1/8."
  },
  "pyrousdominion": {
    "desc": "Pressure, including entry Defense/Sp. Def drops and field interactions. Dragon Rush and Stone Edge have 100% base accuracy; normal accuracy and evasion modifiers still apply.",
    "shortDesc": "Pressure; Dragon Rush and Stone Edge have 100 base accuracy."
  },
  "bottomlessgullet": {
    "desc": "Gluttony and Cheek Pouch: qualifying pinch Berries activate at half HP, and eating a Berry heals 1/3 max HP under normal healing rules.",
    "shortDesc": "Gluttony + Cheek Pouch."
  },
  "divefisher": {
    "desc": "Water Veil: prevents/cures burns, grants Aqua Ring on entry, prevents hail/sandstorm damage, and cures status on Water Surface or Underwater at turn end. Ordinary Dive executes in one turn as Special using Sp. Atk against Sp. Def, with normal power, flags, accuracy and Gulp Missile loading.",
    "shortDesc": "Water Veil; ordinary Dive is one-turn Special."
  },
  "scatterbrain": {
    "desc": "Oblivious and Unaware: prevents infatuation, Taunt and Intimidate drops, clears infatuation/Taunt, breaks opposing Illusion on entry, and ignores relevant opposing stat stages in damage/accuracy calculations.",
    "shortDesc": "Oblivious + Unaware."
  },
  "polarrest": {
    "desc": "Early Bird + Ice Body: sleep lasts half as long; contact attackers have a 30% frostbite chance. Heals 1/16 max HP in hail/snow or on Icy, Snowy Mountain and Cold Eclipse fields; 1/8 in Cold Eclipse hail. Immune to hail damage.",
    "shortDesc": "Early Bird + Ice Body."
  },
  "glacierbreaker": {
    "desc": "Mold Breaker. Damaging Ice moves remove Reflect, Light Screen and Aurora Veil before damage, following Brick Break rules.",
    "shortDesc": "Mold Breaker; damaging Ice moves break screens."
  },
  "cushionchorus": {
    "desc": "Friend Guard + Aroma Veil: allies take 25% less attack damage; protects the holder and allies from mental effects.",
    "shortDesc": "Friend Guard + Aroma Veil."
  },
  "perfectapple": {
    "desc": "Pure Power, Self Sufficient and Anger Shell: doubles Attack (Sp. Atk instead on Psychic Terrain), heals 1/16 max HP per turn and prevents sand/hail damage. Crossing from above half HP to half HP or below through qualifying attack damage triggers normal Anger Shell: +1 Attack, Sp. Atk and Speed; -1 Defense and Sp. Def.",
    "shortDesc": "Pure Power + Self Sufficient + Anger Shell."
  },
  "solarmimicry": {
    "desc": "Bug STAB and resistances to Fighting, Grass and Ground. Personal sunlight without changing field weather; Utility Umbrella and weather suppression apply. After ordinary Solar Blade, lowers own Speed by 1 once per use; Contrary applies.",
    "shortDesc": "Bug STAB/resistances; personal sun; Solar Blade lowers own Speed."
  },
  "canopyarcher": {
		"desc": "Flying STAB and resistances to Bug, Fighting and Grass. Classified arrow moves bypass accuracy/evasion checks. Scrappy lets Normal/Fighting moves hit Ghost types and prevents Intimidate Attack drops. Long Reach removes contact. Protection and other immunities apply.",
    "shortDesc": "Flying STAB/resistances; classified arrow moves never miss."
  },
  "boundspirits": {
    "desc": "Prankster + Magic Guard.",
    "shortDesc": "Prankster + Magic Guard."
  },
  "keystoneseal": {
    "desc": "Cursed Body + continuous Imprison using its current moveset. Blocks opposing forced switches. Suppression disables the seal.",
    "shortDesc": "Cursed Body; continuous Imprison; blocks opposing forced switches."
  },
  "zen": {
    "desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive.",
    "shortDesc": "Water-field healing; reveals Illusions; halves incoming Fire attacking stats."
  },
  "neurotoxin": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Heals 1/3 max HP on switching out.",
    "shortDesc": "Hydra Bond + Regenerator."
  },
  "terragift": {
    "desc": "On entry, heals each adjacent ally by 1/4 of that ally's max HP. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Same-type moves have 1.3x power.",
    "shortDesc": "Same-type moves gain 1.3x power."
  },
  "alchemistsurge": {
		"desc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules. Foe stat drops give +2 Sp. Atk, except on Chessboard. On Chessboard, move power instead rises with missing HP, from 1x at full HP to 2x at 20% HP or less. Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. Psychic Surge follows the field/Aura rules: it can create Psychic Terrain on an empty field or Psychic Aura over a compatible field.",
    "shortDesc": "Combines the listed abilities."
  },
  "phalanxform": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Allies take 25% less attack damage; this does not protect the holder. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats.Cannot be trapped.",
    "shortDesc": "Hydra Bond, Friend Guard, Battle Armor and trap escape."
  },
  "patternshift": {
    "desc": "Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry.",
    "shortDesc": "Changes type to match each eligible move; Dragon's Den changes the effect; reveals Illusions."
  },
  "primalego": {
    "desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. Against an opposing effective Ultra Instinct (including composites), its attacks ignore its own negative Attack and Sp. Atk stages. Ultra Instinct instead reduces its first HP-damaging move each turn by 40% and ignores positive Attack or Sp. Atk stages for that protected move. Stored stages are unchanged; normal +1 retaliation is unchanged. The rivalry is disabled on Bewitched Woods, Haunted and Holy.",
    "shortDesc": "Combines the listed abilities."
  },
  "ancientbloom": {
    "desc": "Damaging hits have separate 10% chances to inflict sleep, paralysis or poison on the attacker; powder immunity blocks this. If Sleep Clause blocks sleep, a further roll can inflict paralysis or poison instead. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip.",
    "shortDesc": "End-turn Grass damage to foes restores its HP."
  },
  "hydrabond": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Gilded Helix is the exception: three full 50-power hits in every format, with all-foes targeting in Free-for-All; suppression restores its native two hits.",
		"shortDesc": "Eligible single hits strike 3x; native variable hits maximize in singles/doubles; remaining hits chain after KO.",
  },
  "hydraheart": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move.",
    "shortDesc": "FFA singles hit all foes at 1.3x; +1 Defense once per turn."
  },
  "truehydra": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. Heals 1/3 max HP on switching out. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Eligible damaging moves hit three times, with the second and third hits at 30% damage. It heals 1/3 of its max HP on switching out, may shed status and other ailments at the end of a turn, heals 1/16 of its max HP each turn, and is immune to Sandstorm and Hail damage.",
    "shortDesc": "Combines the listed abilities."
  },
  "voidtyrant": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. When an attack takes it from above half HP to half or less, gains +1 Attack and Sp. Atk after the move. Dragon's Den entry gives +2 Attack and Sp. Atk. Once per battle, after Draco Meteor applies its Sp. Atk drops, restores all negative stat stages to zero after the entire attack finishes. Positive stages remain.",
    "shortDesc": "Once per battle, Draco Meteor clears its negative stages before White Herb is needed."
  },
  "orchardbond": {
		"desc": "Eligible single-target attacks hit three times. In singles and doubles, native variable multi-hit moves use their maximum hit count, keeping native per-hit accuracy and damage. Remaining native hits can continue into another living opposing active Pokemon after a KO at 70% damage. Excludes non-FFA spread, charge, delayed, Z/Max and extra-hit-barred moves. Follow-ups deal 30% damage, retargeting another living opposing active Pokemon after a KO. In FFA, single-target moves hit all foes at 1.3x power; spread moves hit all foes three times with 30% follow-ups. Full-power spread stays full power. Moves have 1.2x power on Dragon's Den. At turn end with an empty item slot, has a 50% chance to restore its last consumed Berry or field seed. Guaranteed in sun or on Grassy Field and Stage 2 Flower Garden.",
    "shortDesc": "FFA singles hit all foes at 1.3x; 50% chance to restore a consumed Berry/seed each turn."
  },
  "heavyartillery": {
    "desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Damaging pulse and bullet moves have double power and hit all foes in Doubles and Free-for-All. In Free-for-All, the designated primary target takes full damage and other foes take half their otherwise-calculated damage; protection or immunity of the primary does not promote another target. If no valid primary is supplied, the first active foe in side order is selected. Positive opposing pulse/bullet HP damage breaks that side's Reflect, Light Screen, Aurora Veil, Atlantis Wall and Arenite Wall. Starts Neutral with no defensive contribution. At the end of a turn without executing a damaging move, becomes Loaded: +1 effective Defense and Sp. Def stage. Any damaging move reaching execution becomes Fired before hit resolution: -1 effective Defense and Sp. Def stage, including misses, protection and immunity. Each state replaces the previous state and never stacks. Ordinary boosts remain separate; effective stages stay within -6 to +6. Status moves, charging, recharge and inability to act count as idle turns. Switching, Haze, Clear Smog, defensive stage replacement and ability replacement clear the state to Neutral. Simple and Contrary do not alter these contributions. Suppression pauses the contribution and prevents loading; an existing state still becomes Fired when attacking. No screen removal on Substitute-only damage or failed hits.",
    "shortDesc": "Unaware and custom pulse/bullet artillery."
  },
  "reapersgrip": {
    "desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. All Dark attacks have 4/3x power, or 0.75x with Aura Break. The first damaging hit leaving it at half HP or less creates Haunted Field for 3 turns, or extends a shorter Haunted Field to 3. On fainting, creates Haunted for 5 turns or adds 5 turns to an existing Haunted Field.",
    "shortDesc": "Ignores opposing combat boosts; heals 1/16 HP; boosts all Dark moves; creates Haunted at half HP and on faint."
  },
  "soulcremation": {
    "desc": "Direct Fire/Ghost attacks heal 1/3 of actual opposing HP damage, capped at 1/6 max HP per turn, and block surviving targets' healing through the following turn. Switching clears the block; repeated hits refresh it. Native draining moves, substitutes, allies, residual and delayed damage do not grant this drain. Once per turn, a Ghost hit on an already-burned surviving foe also attempts -1 Sp. Def. At turn end, heals 1/8 max HP if any foe actually took burn damage; this is separate from the drain cap. Once per actual entry, the first executed opposing damaging move targeting it grants +1 Sp. Atk after the entire move if it survives and remains active, even after misses, protection or immunity. This use is spent at +6 and is not reset by ability changes or suppression; switching resets it. Contact attackers have a 30% burn chance (60% on Volcanic). Absorbs Fire for a 1.5x Fire boost; Burning or grounded Volcanic also grants the boost. On Cold Eclipse, Fire absorption and contact burns stop, and entry gives +2 Defense and Sp. Def total. Normal healing and drain rules apply. Mega Chandelure with active Soul Cremation bypasses Soul Fire's Fire/Ghost attack absorption only. Ordinary type effectiveness and type immunities remain; this grants neither general Mold Breaker nor a damage multiplier. Will-O-Wisp and Soul Fire redirection are unchanged.",
    "shortDesc": "Combines the listed abilities."
  },
  "toxicbloom": {
    "desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip. Poison-type attacks restore 1/4 of actual opposing HP damage, using normal drain rounding and Heal Block, Liquid Ooze and Big Root interactions. No added drain from Substitute-only damage, misses, Protect, immunity or residual poison. Moves that already drain keep their native drain without an extra heal.",
    "shortDesc": "Pollen Bloom and Poison-hit recovery."
  },
  "unaware": {
    "desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry.",
    "shortDesc": "Ignores opposing combat/accuracy stages; reveals Illusions."
  },
  "stillwaters": {
    "desc": "Suppresses weather effects while active. On Rainbow Field, gains one random non-maxed stat stage other than evasion each turn. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry.",
    "shortDesc": "Combines the listed abilities."
  }
};

import { CurrentAbilityDescriptionCleanup } from './current-ability-description-cleanup';
Object.assign(ConciseAbilityDescriptions, CurrentAbilityDescriptionCleanup);
