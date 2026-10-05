/** Plain-language display text only. Battle callbacks and component identities live elsewhere. */
export const AbilityDescriptionOverrides: Record<string, {desc: string; shortDesc: string}> = {
	"selfsufficient": {
		"desc": "Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
		"shortDesc": "Heals 1/16 HP each turn; immune to sandstorm and hail damage."
	},
	"selfrepair": {
		"desc": "Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal.",
		"shortDesc": "Heals 1/16 HP per turn; switching cures status and heals 1/3 HP if cured; no weather damage."
	},
	"naturalrecovery": {
		"desc": "Switching out cures major status and restores 1/3 max HP, plus another 1/3 if a status was cured. Bewitched Woods cures status at turn end without healing.",
		"shortDesc": "Switching cures status and heals 1/3 HP, plus 1/3 if cured; Woods cures status each turn."
	},
	"purifyingfrost": {
		"desc": "On entry, cures status conditions from it and its active allies. Once per switch-in, after its first Ice-type move, it sets Safeguard on its side for 5 turns, even if that move misses or fails.",
		"shortDesc": "Cures its side's active Pokemon on entry; first Ice move sets 5-turn Safeguard."
	},
	"smolderingshroud": {
		"desc": "Other Pokemon cannot lower its stat stages. Gains +1 Attack and Sp. Atk on Volcanic entry. The first foe-caused stat drop it prevents each switch-in also raises its Sp. Atk by one stage.",
		"shortDesc": "Prevents foe stat drops; the first blocked drop each entry gives +1 Sp. Atk."
	},
	"springfur": {
		"desc": "Doubles Defense. Once per switch-in, surviving the first damaging physical move from a foe raises its Attack by one stage.",
		"shortDesc": "Double Defense; surviving the first foe physical move each entry gives +1 Attack."
	},
	"knuckletide": {
		"desc": "Punching moves have 1.4x power. After a punch damages a foe, the next physical or special Water-type attack to damage a foe ignores positive Defense or Sp. Def stat stages, respectively. A miss or Water-type status move does not spend the charge.",
		"shortDesc": "1.4x punching power; a landed punch lets the next Water hit ignore positive defensive stages."
	},
	"reservoir": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Berries normally eaten at 1/4 HP activate at 1/2 HP instead. Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive.",
		"shortDesc": "Absorbs Water for 1/4 HP; water-field healing; Low-HP Berries activate at half HP; Blocks explosions/Aftermath; halves incoming Fire attacking stats."
	},
	"crosscurrent": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. After it damages a foe, its next damaging move has 1.3x power if it uses the opposite category, Physical or Special. Misses and status moves do not change the last landed category. This bonus does not stack with itself.",
		"shortDesc": "Double Speed in rain/water fields; alternating landed physical and special attacks gain 1.3x power."
	},
	"pearlcurrent": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. The first Water-type move absorbed each switch-in also heals its lowest-HP active ally by 1/8 of that ally's max HP.",
		"shortDesc": "Absorbs Water for 1/4 HP; the first absorption each entry also heals an ally by 1/8 HP."
	},
	"slipstream": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Once per switch-in, its first Flying-type attack to damage a foe sets Tailwind on its side for 3 turns. If Tailwind is already active, its duration is refreshed to 3 turns. Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions on activation. Mirror Arena grants +1 accuracy and Laser Focus; shared accuracy entry rewards apply once.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded — first landed Flying attack each switch-in sets 3-turn Tailwind."
	},
	"mimecraft": {
		"desc": "Reflect and Light Screen gain +1 priority. Once per switch-in, the first one it successfully sets heals its lowest-HP active ally by 1/8 of that ally's max HP.",
		"shortDesc": "+1 priority for Reflect and Light Screen; first successful screen heals an ally by 1/8."
	},
	"apexflytrap": {
		"desc": "The holder is airborne, as with Levitate. Once per switch-in, a foe that damages it with a contact move is trapped through the following turn while the holder remains active.",
		"shortDesc": "Airborne; once per entry, traps a contact attacker through the following turn."
	},
	"forgegrit": {
		"desc": "Attack is 1.5x while statused, and burn does not weaken physical attacks. Once per switch-in, the first damaging move it takes from a foe while statused raises its Defense by one stage.",
		"shortDesc": "1.5x Attack while statused; the first foe HP hit while statused each entry gives +1 Defense."
	},
	"masonsfist": {
		"desc": "Punching moves have 1.4x power. When a punching move damages a foe, it removes Reflect, Light Screen, Aurora Veil, Arenite Wall, and Atlantis Wall from that foe's side.",
		"shortDesc": "Punches have 1.4x power — punches that damage a foe break that side's screens."
	},
	"marshconduit": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. The first Water move it absorbs each switch-in also lowers each active foe's Speed by one stage.",
		"shortDesc": "Absorbs Water for 1/4 HP; the first absorption each entry lowers all foes' Speed by 1."
	},
	"silkward": {
		"desc": "Once per switch-in, the first super-effective damaging hit against it deals half damage. It does not set weather.",
		"shortDesc": "First super-effective hit each switch-in deals half damage."
	},
	"swarm": {
		"desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Bug-type attack.",
		"shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Bug attacks."
	},
	"swarmdrive": {
		"desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Bug-type attack. Once per switch-in, knocking out a foe with a Bug-type move that does not switch the user out raises its Speed by one stage. U-turn and other pivot moves cannot trigger the Speed boost.",
		"shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Bug attacks — first non-pivot Bug-move KO each switch-in raises Speed by 1."
	},
	"mirechorus": {
		"desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect. Each foe damaged by a noncontact sound move also has an independent 20% chance to be poisoned. Shield Dust and Covert Cloak block this added poison chance.",
		"shortDesc": "Sound moves: Water (Ice on Icy Field), 1.2x power; Contact hits have a 30% poison chance — noncontact sound hits have a 20% poison chance."
	},
	"boretunnel": {
		"desc": "Absorbs other Pokemon's Ground moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Cave and Desert. The first Ground-type move it absorbs each switch-in also removes Spikes, Toxic Spikes, Stealth Rock, Sticky Web, and G-Max Steelsurge from its own side.",
		"shortDesc": "Absorbs Ground for 1/4 HP; heals on Cave/Desert — first Ground absorption each switch-in clears own-side hazards."
	},
	"mossarmor": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal. switching out heals 1/8 max HP only after a Grass attack dealt opposing HP damage on the current or immediately preceding turn, with no intervening action.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded; Opposing HP hits heal 1/16; +1 Defense once per turn; Switching cures status and heals 1/3 HP if cured; Woods cures status each turn."
	},
	"stormpower": {
		"desc": "If Rain Dance or Primordial Sea is active, its Special Attack is multiplied by 1.5 and it loses 1/8 of its max HP at turn end.",
		"shortDesc": "In rain, 1.5x Sp. Atk and loses 1/8 max HP each turn."
	},
	"stormcalling": {
		"desc": "On entry, summons rain for 5 turns, or 8 with Damp Rock. Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Once per entry, the first resisted sound attack dealing opposing HP damage marks one foe after the attack. The next sound attack against that foe, through the end of the next turn, consumes the mark on attempt and treats resistance as neutral. Does not bypass immunity. Switching clears the mark. Spread attacks mark only their eligible primary foe, otherwise the first eligible foe in side order. Sound moves become Water-type (Ice on Icy Field) and gain 1.2x power. Once per entry a resisted sound attack dealing opposing HP damage marks one foe; the next sound attack against it through next turn consumes the mark on attempt and ignores resistance, not immunity. Target switching clears the mark.",
		"shortDesc": "Summons rain on entry; Sound moves: Water (Ice on Icy Field), 1.2x power; Once/entry: resisted sound hit marks one foe; next sound attempt ignores its resistance."
	},
	"unstableevo": {
		"desc": "Eevee-Starter's IVs carry through form changes. Before using a Let's Go move, it changes into the matching evolution and uses that form's stats, typing, and Speed. It keeps Unstable Evo, Filter, and Self Sufficient, and gains both of the evolution's listed Ability effects. Switching out restores Eevee-Starter. It cannot use battle gimmicks or hold Eevium Z.",
		"shortDesc": "Let's Go moves change form and grant two Ability effects; no gimmicks."
	},
	"hisuianpath": {
		"desc": "Absorbs Grass moves for +1 Attack and Sp. Atk; allied Grass moves also grant both boosts. Heals 1/8 max HP each turn on Forest and 1/16 on Grassy Field. Prevents flinching and Intimidate's Attack drop. Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage.",
		"shortDesc": "Absorbs Grass for +1 Attack/Sp. Atk; grassy-field healing; Cannot flinch; blocks Intimidate; Half contact damage; double Fire damage."
	},
	"scarecrow": {
		"desc": "Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack each turn, plus +1 Sp. Atk on Mountain or Snowy Mountain. Steel moves receive STAB and use 1.5x Attack or Sp. Atk (2x on Factory). On Short-Circuit, Steel moves also gain Electric typing. Adds Steel resistances and Poison immunity without Steel weaknesses. Attacks use double the offensive stat against targets that entered this turn.",
		"shortDesc": "Wind/Tailwind boosts Attack; Steel offense/resistances; double attacking stats against new entrants."
	},
	"bruteforce": {
		"desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power. Prevents move recoil except Struggle. Crash and Life Orb damage still apply.",
		"shortDesc": "Recoil/crash and explosion moves have 1.2x power; no move recoil except Struggle."
	},
	"gigavolt": {
		"desc": "Moves ignore bypassable opposing abilities. Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts. Contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit.",
		"shortDesc": "Moves ignore bypassable abilities; Redirects/absorbs Electric for +1 Attack and Sp. Atk; 30% contact paralysis; 60% on electric fields."
	},
	"verdantedge": {
		"desc": "Doubles Speed in sun or Stage 4 Flower Garden. Slicing moves have 1.5x power, except on Cold Eclipse. Defense is 1.5x on Grassy and Forest fields. On Corrosive, loses 1/8 max HP each turn unless Poison- or Steel-type.",
		"shortDesc": "Double Speed in sun or Stage 4 Flower Garden; Slicing moves have 1.5x power except on Cold Eclipse; 1.5x Defense on Grassy/Forest; Corrosive damages non-Poison/Steel."
	},
	"permafrost": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Takes half damage from special attacks and is immune to hail damage. Mirror Arena entry gives +2 evasion. Icy and Snowy Mountain neutralize weaknesses from its Ice typing. Cold Eclipse doubles Defense. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast.",
		"shortDesc": "30% contact frostbite; heals in icy weather/fields; no hail damage; Half special damage; no hail damage; icy-field defenses; Normal moves become Ice with 1.2x power; icy-field boost."
	},
	"glacialheart": {
		"desc": "Fire hits give +1 Attack. Prevents and cures burns. Gains +1 Attack each turn on Superheated, Dragon's Den, Burning and Volcanic. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk.",
		"shortDesc": "Fire hits/hot fields give +1 Attack; no burns; 30% contact frostbite; heals in icy weather/fields; no hail damage; Ignores redirection; +1 Sp. Atk on specified fields."
	},
	"pastelveil": {
		"desc": "It and its allies cannot be poisoned. Gaining this Ability while it or its ally is poisoned cures them. Before an opposing Pokemon uses a Poison-type move, that Pokemon's Attack and Special Attack are lowered by 1 stage.",
		"shortDesc": "Prevents poison; opposing Poison move users lose Atk/SpA."
	},
	"moonveil": {
		"desc": "It and its allies cannot be poisoned. Gaining this Ability while it or its ally is poisoned cures them. Before an opposing Pokemon uses a Poison-type move, that Pokemon's Attack and Special Attack are lowered by 1 stage. On entry, creates Misty Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
		"shortDesc": "Prevents poison; opposing Poison move users lose Atk/SpA; Creates Misty Terrain on entry."
	},
	"tidalwave": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Cures major status at turn end in effective rain or on Water Surface, Underwater and Midnight Zone. Heals 1/16 max HP each turn in effective rain.",
		"shortDesc": "Absorbs Water for 1/4 HP; water-field healing; Cures status each turn in rain or water fields; Heals 1/16 HP each turn in rain."
	},
	"livewire": {
		"desc": "Electric attacks use 1.3x Attack or Sp. Atk, or 2x on Electric and Factory fields. On Electric Terrain, incoming Ground attacks use half the attacker's offensive stat. Absorbs other Pokemon's Electric moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Electric Terrain and Short-Circuit. Speed is 1.5x while statused, or 2x on Electric Terrain. Ignores paralysis's Speed penalty. Contact attackers lose 1/8 of their max HP.",
		"shortDesc": "Boosts Electric attacking stats; Electric Terrain weakens Ground; Absorbs Electric for 1/4 HP; electric-field healing; 1.5x Speed while statused; 2x on Electric Terrain; Contact attackers lose 1/8 HP."
	},
	"kindledfury": {
		"desc": "Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage. Attack is 1.5x while statused, and burn does not weaken physical attacks. Absorbs Fire moves and gains a 1.5x Fire boost until switching out or losing the ability. Burning Field or grounded Volcanic Field also grants the boost. On Cold Eclipse, Fire absorption is disabled and entry gives +1 Defense and Sp. Def.",
		"shortDesc": "Half contact damage; double Fire damage; 1.5x Attack while statused; ignores burn attack penalty; Absorbs Fire for a 1.5x Fire boost; Cold Eclipse gives defenses instead."
	},
	"burningrage": {
		"desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power. Prevents move recoil except Struggle. Crash and Life Orb damage still apply. Punching moves have 1.4x power. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Recoil/crash and explosion moves have 1.2x power; No move recoil except Struggle; Punches have 1.4x power; Moves ignore bypassable abilities — Proficient."
	},
	"exalt": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. It has Defiant: opposing stat drops raise its Attack by 2 stages. It cannot flinch. Its slicing moves and Steel Wing have 1.5x power, except on Cold Eclipse, as with Sharpness. Intimidate still lowers its Attack and triggers Defiant. Flinch protection can be bypassed by Mold Breaker; ability suppression disables all effects.",
		"shortDesc": "Mold Breaker; Foe stat drops give +2 Attack; cannot flinch; slicing moves and Steel Wing have 1.5x power except on Cold Eclipse."
	},
	"fightingfiend": {
		"desc": "Moves cannot miss. Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk. Takes 20% less attack damage, with a further 50% reduction at full HP (60% total).",
		"shortDesc": "Moves never miss; no sleep/Yawn; stronger Fighting attacks; 20% less damage, 60% at full HP."
	},
	"violentrush": {
		"desc": "On its first active turn, its Speed is 1.5x and its Attack is 1.2x.",
		"shortDesc": "First active turn: 1.5x Spe and 1.2x Atk."
	},
	"kickfiend": {
		"desc": "Kicking moves have 1.4x power. On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind.",
		"shortDesc": "Kicks have 1.4x power; First active turn: 1.5x Spe and 1.2x Atk; No paralysis or opposing/field Speed reductions."
	},
	"crumblingshell": {
		"desc": "When it is hit by a Physical attack, Stealth Rock is set on the attacker's side unless a water field is active or that side already has Stealth Rock.",
		"shortDesc": "Physical hits set Stealth Rock, except in water fields."
	},
	"wreckingball": {
		"desc": "Prevents OHKO moves. At full HP, survives an otherwise fatal attack hit with 1 HP. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. When it is hit by a Physical attack, Stealth Rock is set on the attacker's side unless a water field is active or that side already has Stealth Rock.",
		"shortDesc": "Survives a hit at full HP; immune to OHKO moves; Heals 1/16 HP each turn; immune to sandstorm and hail damage; Physical hits set Stealth Rock, except in water fields."
	},
	"swiftdrill": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection. Heals 1/16 max HP each turn in effective rain.",
		"shortDesc": "Double Speed in rain and water fields; Drill/horn moves have 1.5x power; 2x and pierce protection on rocky fields; Heals 1/16 HP each turn in rain."
	},
	"lifeguard": {
		"desc": "Allies take 25% less attack damage; this does not protect the holder. On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Moves cannot be redirected. Speed doubles on Water Surface, Underwater and Midnight Zone. In Free-for-All only, successfully blocking an opposing damaging move with a protection move earns a guard that reduces the next opposing damaging hit by 25%, through the end of the following turn. It does not stack or refresh while active, is consumed by only one hit, and clears on switching. Merely using protection, blocking status moves or residual damage does not earn or consume it.",
		"shortDesc": "Allies take 25% less attack damage; Entry heals adjacent allies by 1/4 HP (1/3 on Fairy Tale); Ignores redirection; double Speed on water fields — FFA successful protection earns one 25% guard."
	},
	"zen": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive.",
		"shortDesc": "Absorbs Water for 1/4 HP; water-field healing; Ignores opposing combat/accuracy stages; reveals Illusions; Blocks explosions/Aftermath; halves incoming Fire attacking stats."
	},
	"stormsong": {
		"desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. On entry, summons rain for 5 turns, or 8 with Damp Rock. Immune to other Pokemon's sound moves.",
		"shortDesc": "Sound moves: Water (Ice on Icy Field), 1.2x power; Summons rain on entry; Immune to others' sound moves."
	},
	"astralward": {
		"desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Avoids allied damaging moves. Speed doubles on Psychic Terrain or Psychic Aura. On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk.",
		"shortDesc": "Reflects status moves; avoids allied attacks; Psychic-field Speed boost; reveals threats and Illusions."
	},
	"moonlightvigil": {
		"desc": "Prevents flinching and Intimidate's Attack drop. On entry, lowers foes' Defense and Sp. Def by 1 (2 on Cold Eclipse) and changes Underwater to Midnight Zone. Foes targeting it spend 1 extra PP, or 2 on Midnight Zone. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally.",
		"shortDesc": "Cannot flinch; blocks Intimidate; Entry lowers foe defenses; opposing moves spend extra PP; No opposing accuracy drops; ignores evasion; reveals Illusions."
	},
	"hydrabond": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x."
	},
	"neurotoxin": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Heals 1/3 max HP on switching out.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Heals 1/3 HP on switching out."
	},
	"punchfiend": {
		"desc": "Punching moves have 1.4x power. Contact moves bypass protection except Max Guard. Prevents flinching and Intimidate's Attack drop.",
		"shortDesc": "1.4x punching power; contact bypasses protection; no flinching or Intimidate Attack drop."
	},
	"doublestrike": {
		"desc": "Skill Link maximizes eligible multi-hit moves. Moves with 60 or less effective base power (80 or less on Factory Field) gain 1.5x power, punching moves gain 1.4x power. These bonuses stack.",
		"shortDesc": "Maximizes multi-hit counts; 1.5x weak-move and 1.4x punching power, stacking when both apply."
	},
	"spinfiend": {
		"desc": "Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. Prevents and cures sleep.",
		"shortDesc": "1.5x power for moves at 60 power or less (80 on Factory); Prevents and cures sleep."
	},
	"terragift": {
		"desc": "On entry, heals each adjacent ally by 1/4 of that ally's max HP. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Same-type moves have 1.3x power.",
		"shortDesc": "Entry heals allies and reveals Illusions; ignores foe stat changes; 1.3x same-type power."
	},
	"precision": {
		"desc": "Super-effective moves used by it cannot miss and have an increased critical-hit ratio.",
		"shortDesc": "Super-effective moves never miss; boosted critical-hit ratio."
	},
	"secondwind": {
		"desc": "The first otherwise lethal attack has a 50% chance to leave it at 1 HP. This Ability rolls only once per battle, even if the roll fails or it switches out.",
		"shortDesc": "50% chance to survive the first lethal attack at 1 HP; one roll per battle."
	},
	"rapidresponse": {
		"desc": "On its first active turn, its Speed is 1.5x and its Sp. Atk is 1.2x.",
		"shortDesc": "First active turn: 1.5x Spe and 1.2x Sp. Atk."
	},
	"seafiend": {
		"desc": "Physical HP hits set Toxic Spikes on the attacker's side, up to two layers; allied hits use the opposing side. Contact attackers lose 1/6 max HP. Water moves receive STAB and use double Attack or Sp. Atk; incoming Fire attacks use half the attacker's offensive stat. Prevents and cures burns, ignores hail and sandstorm damage, and gains Aqua Ring on entry.",
		"shortDesc": "Physical hits set Toxic Spikes; contact damage; doubled Water attacking stats; Fire/burn/weather protection."
	},
	"hisuianoath": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Contact moves have 1.3x power. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
		"shortDesc": "Entry heals adjacent allies by 1/4 HP (1/3 on Fairy Tale); Contact moves have 1.3x power; Poison bypasses type immunity; poisoned foes lose defenses."
	},
	"aevianoath": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats.",
		"shortDesc": "Entry heals adjacent allies by 1/4 HP (1/3 on Fairy Tale); Two 60% independent rolls; boosting pairs: full +15%; FFA: two full-power targets; No critical hits; 20% less damage; foe stat drops give +2 Defense."
	},
	"hisuianvanguard": {
		"desc": "On its first active turn, its Speed is 1.5x and its Sp. Atk is 1.2x. Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain.",
		"shortDesc": "First active turn: 1.5x Spe and 1.2x Sp. Atk; Absorbs wind; Tailwind/Strong Winds raise Sp. Atk."
	},
	"unovavanguard": {
		"desc": "On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack each turn, plus +1 Sp. Atk on Mountain or Snowy Mountain.",
		"shortDesc": "First active turn: 1.5x Spe and 1.2x Atk; Absorbs wind; Tailwind/Strong Winds raise Attack."
	},
	"unovawing": {
		"desc": "Critical-hit and Competitive effects; no Unburden. Stat drops can raise Special Attack, but item use or loss no longer doubles Speed.",
		"shortDesc": "Critical-hit and Competitive effects; no Unburden."
	},
	"aevianwing": {
		"desc": "Prevents move recoil except Struggle. Crash and Life Orb damage still apply. Gains +2 Attack when a foe lowers its stats. Unfezant becomes Unfezant-Rejuv on entry.",
		"shortDesc": "No move recoil except Struggle; foe stat drops give +2 Attack; transforms Unfezant on entry."
	},
	"aeviandream": {
		"desc": "Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Contact moves have 1.3x power. When it enters battle as Musharna, it transforms into Musharna-Rejuv. If this Ability is suppressed, its Rejuv form reverts to the normal species until it switches out, even if suppression ends earlier.",
		"shortDesc": "Sleeping foes lose 1/8 HP per turn, except on Rainbow; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Contact moves have 1.3x power — transforms Musharna into Musharna-Rejuv."
	},
	"aevianfrost": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Attack is 1.5x while statused, and burn does not weaken physical attacks.",
		"shortDesc": "30% contact frostbite; heals in icy weather/fields; no hail damage; 1.5x Attack while statused; ignores burn attack penalty."
	},
	"aeviantoxin": {
		"desc": "Biting moves have 1.5x power. Doubles Defense; immune to powder effects, sandstorm and hail damage. Attacks always critically hit poisoned foes or on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three. Drapion becomes Drapion-Rejuv on entry.",
		"shortDesc": "1.5x biting power; double Defense; weather/powder immunity; critical hits against poisoned foes."
	},
	"aevianspark": {
		"desc": "Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. Contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit. Sleep lasts half as long, rounded down. Breloom becomes Breloom-Rejuv on entry.",
		"shortDesc": "1.5x weak-move power; contact paralysis; shorter sleep; transforms Breloom on entry."
	},
	"aeviangrief": {
		"desc": "Opposing status moves that check accuracy have 50% base accuracy. On Rainbow Field, opposing status moves fail their accuracy check. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes.",
		"shortDesc": "Status moves have 50% base accuracy; fail on Rainbow; Airborne; immune to Ground attacks unless grounded; Prevents indirect damage; Fairy Tale entry gives +1 Sp. Def; 30% chance to disable attacks; curses foes on faint."
	},
	"aevianrocket": {
		"desc": "When Veluza enters battle with this Ability, it changes into Veluza-Rejuv. It has Brute Force's Reckless power boost and Rock Head recoil protection, restores 1/3 of its max HP on switching out through Regenerator, ignores opposing Abilities with Mold Breaker, and doubles its Speed under Swift Swim's conditions. If this Ability is suppressed, its Rejuv form reverts to the normal species until it switches out, even if suppression ends earlier.",
		"shortDesc": "Transforms Veluza into Veluza-Rejuv."
	},
	"download": {
		"desc": "On entry, it compares the opposing side's combined Defense and Special Defense. If Defense is lower, its Attack rises; otherwise its Special Attack rises. Its first damaging move after switching in is a critical hit.",
		"shortDesc": "Boosts the offense targeting foes' weaker defense; first damaging move crits."
	},
	"defragment": {
		"desc": "On entry, it compares the opposing side's combined Attack and Special Attack. If Attack is higher or tied, its Defense rises; otherwise its Special Defense rises. Its moves cannot miss.",
		"shortDesc": "Entry defensive boost based on foes' offenses; moves cannot miss."
	},
	"adaptivecore": {
		"desc": "On entry, it compares the opposing side's combined Defense and Special Defense. If Defense is lower, its Attack rises; otherwise its Special Attack rises. Its first damaging move after switching in is a critical hit. On entry, it compares the opposing side's combined Attack and Special Attack. If Attack is higher or tied, its Defense rises; otherwise its Special Defense rises. Its moves cannot miss. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal.",
		"shortDesc": "Boosts the offense targeting foes' weaker defense; first damaging move crits; Entry defensive boost based on foes' offenses; moves cannot miss; Heals 1/16 HP per turn; switching cures status and heals 1/3 HP if cured."
	},
	"aevianglacier": {
		"desc": "On entry, Turtonator permanently transforms into Turtonator-Rejuv. Summons hail. On Cold Eclipse, damaging attacks disable their user unless already disabled; excludes Max moves, delayed attacks and Struggle. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. If this Ability is suppressed, its Rejuv form reverts to the normal species until it switches out, even if suppression ends earlier.",
		"shortDesc": "Transforms Turtonator; summons hail; contact frostbite; icy-field healing; Normal moves become Ice."
	},
	"aevianbolt": {
		"desc": "On entry, Druddigon permanently transforms into Druddigon-Rejuv. If Rain Dance or Primordial Sea is active, its Special Attack is multiplied by 1.5 and it loses 1/8 of its max HP at turn end. Contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit. Absorbs other Pokemon's Electric moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Electric Terrain and Short-Circuit. If this Ability is suppressed, its Rejuv form reverts to the normal species until it switches out, even if suppression ends earlier.",
		"shortDesc": "Transforms Druddigon; stronger Sp. Atk with HP cost in rain; contact paralysis; absorbs Electric."
	},
	"ascendance": {
		"desc": "All damaging moves deal 1.5x damage, can hit type immunities, and gain a 1.5x STAB-style boost when they do not match its type. On Holy Field, its Attack and Special Attack are raised by 1 on entry. Eevee-Starter and Umbreon transform into Divineon on entry; Umbreon uses Umbreon-Perfect's appearance while retaining Umbreon's full movepool.",
		"shortDesc": "Damaging moves deal 1.5x, bypass immunities, and gain off-type STAB; transforms Eevee-Starter/Umbreon into Divineon."
	},
	"hisuianresolve": {
		"desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power. Prevents move recoil except Struggle. Crash and Life Orb damage still apply. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def.",
		"shortDesc": "Recoil/crash and explosion moves have 1.2x power; No move recoil except Struggle; Halves Water/Ice attacking stats; prevents freeze; field defenses."
	},
	"nobleconduit": {
		"desc": "Special moves have 1.3x power, with a further 1.5x boost on Electric Terrain. Allies' special moves have 1.3x power. In effective sun, Sp. Atk is 1.5x and it loses 1/8 max HP each turn. Cold Eclipse disables both effects. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage.",
		"shortDesc": "Boosts its own and allies' special moves; Sun: 1.5x Sp. Atk, loses 1/8 HP per turn; disabled on Cold Eclipse; Contact KO costs attacker 1/4 HP (1/2 on Corrosive Mist)."
	},
	"dancer": {
		"desc": "After another Pokemon uses a dance move, it uses the same move. The copied move is subject to all effects that can prevent a move from being executed. A move used through this Ability cannot be copied again by other Pokemon with this Ability.",
		"shortDesc": "After another Pokemon uses a dance move, it uses the same move."
	},
	"nobledance": {
		"desc": "After another Pokemon uses a dance move, it uses the same move. The copied move is subject to all effects that can prevent a move from being executed. A move used through this Ability cannot be copied again by other Pokemon with this Ability. On entry, heals each adjacent ally by 1/4 of that ally's max HP. Prevents and cures confusion and blocks Intimidate's Attack drop.",
		"shortDesc": "After another Pokemon uses a dance move, it uses the same move; Entry heals adjacent allies by 1/4 HP; No confusion or Intimidate Attack drop."
	},
	"noblearmor": {
		"desc": "Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage.",
		"shortDesc": "20% less attack damage; 40% less if super effective; field defenses; 30% contact frostbite; heals in icy weather/fields; no hail damage."
	},
	"noblerider": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Double Speed in rain and water fields; Moves ignore bypassable abilities."
	},
	"celestialheart": {
		"desc": "Gains +1 Sp. Atk when any Pokemon faints, plus +2 Sp. Def on Misty or Rainbow Field. Allies take 25% less attack damage; this does not protect the holder. Doubles move secondary-effect chances and removes charging turns.",
		"shortDesc": "Faints give +1 Sp. Atk; Misty/Rainbow also give +2 Sp. Def; Allies take 25% less attack damage; Double secondary-effect chances; no charging turns."
	},
	"shadowtag": {
		"desc": "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability. It takes 0.75x damage from attacks. On Haunted Field, it reveals foes' held items on entry. This Ability cannot be suppressed.",
		"shortDesc": "Traps foes; takes 0.75x damage from attacks."
	},
	"crueltag": {
		"desc": "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability. It takes 0.75x damage from attacks. On Haunted Field, it reveals foes' held items on entry. This Ability cannot be suppressed. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field.",
		"shortDesc": "Traps foes; takes 0.75x damage from attacks; Moves bypass Substitute and opposing screens; Sleeping foes lose 1/8 HP per turn, except on Rainbow."
	},
	"angershell": {
		"desc": "When it has more than 1/2 its max HP and takes damage from an attack bringing it to 1/2 or less of its max HP, its Attack, Special Attack, and Speed are raised by 1 stage, and its Defense and Special Defense are lowered by 1 stage. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		"shortDesc": "At 1/2 or less of its max HP: +1 Atk, Sp. Atk, Spe, and -1 Def, Sp. Def."
	},
	"cruelshell": {
		"desc": "Other Pokemon cannot lower its Attack. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. When it has more than 1/2 its max HP and takes damage from an attack bringing it to 1/2 or less of its max HP, its Attack, Special Attack, and Speed are raised by 1 stage, and its Defense and Special Defense are lowered by 1 stage. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		"shortDesc": "Other Pokemon cannot lower its Attack; No critical hits; 20% less damage; foe stat drops give +2 Sp. Def; At 1/2 or less of its max HP: +1 Atk, Sp. Atk, Spe, and -1 Def, Sp. Def."
	},
	"adaptability": {
		"desc": "Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus.",
		"shortDesc": "Stronger same-type attack bonus."
	},
	"spiralevolution": {
		"desc": "Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Damaging moves pierce protection at half power. Normal-priority moves act first in Trick Room without gaining priority. Ignores field Speed penalties and takes 20% less attack damage. Twineedle has double power.",
		"shortDesc": "Stronger STAB; airborne; eligible moves hit twice; bypasses screens/Substitute; 20% less attack damage."
	},
	"alchemistsurge": {
		"desc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules. Foe stat drops give +2 Sp. Atk, except on Chessboard. On Chessboard, move power instead rises with missing HP, from 1x at full HP to 2x at 20% HP or less. Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. Psychic Surge follows the existing field/Aura rules: it can create Psychic Terrain on an empty field or Psychic Aura over a compatible field. No Neuroforce.",
		"shortDesc": "Creates Psychic Terrain on entry; Foe stat drops give +2 Sp. Atk; Chessboard boosts power instead; Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Status moves gain +1 priority."
	},
	"guidingomen": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Allies take 25% less attack damage; this does not protect the holder. Doubles move secondary-effect chances and removes charging turns. Once per switch-in, successfully applying a move secondary effect creates a ward that blocks the next opposing stat-drop event against an adjacent ally.",
		"shortDesc": "Mold Breaker; allies take 25% less damage; doubles secondaries, skips charging; first secondary wards an ally."
	},
	"toxicchain": {
		"desc": "Its attacks have a 30% chance of badly poisoning. This effect comes before a move's inherent secondary effect chance.",
		"shortDesc": "Its attacks have a 30% chance of badly poisoning."
	},
	"greatmarsh": {
		"desc": "On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. Its attacks have a 30% chance of badly poisoning. This effect comes before a move's inherent secondary effect chance.",
		"shortDesc": "Reveals threats; absorbs Water; rain/field healing; stronger STAB; hits may badly poison."
	},
	"phalanxform": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Allies take 25% less attack damage; this does not protect the holder. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Steel attacks receive STAB. Cannot be trapped.",
		"shortDesc": "Eligible moves hit three times; supports allies; armor protection; Steel STAB; cannot be trapped."
	},
	"windchime": {
		"desc": "Eligible Normal moves become Steel with 1.2x power, or 1.5x on Factory, Short-Circuit, Fairy Tale, Dragon's Den, Starlight Arena, New World and Holy Field. Sound moves have 1.3x power, or 1.5x on Big Top and Cave. Takes half damage from sound moves. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit.",
		"shortDesc": "Normal moves become Steel; boosted sound moves; half sound damage; airborne."
	},
	"hauntedchime": {
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes.",
		"shortDesc": "Airborne; move KOs raise its highest stat; Absorbs wind; Tailwind/Strong Winds raise Sp. Atk; 30% chance to disable attacks; curses foes on faint."
	},
	"auramaster": {
		"desc": "Takes half contact damage. Prevents flinching and Intimidate's Attack drop. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. When the weak-move bonus applies to a paired move, its second hit has 15% unboosted power outside Free-for-All.",
		"shortDesc": "Half contact damage; no flinch/Intimidate drop; stronger weak moves; eligible moves hit twice."
	},
	"patternshift": {
		"desc": "Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry.",
		"shortDesc": "Changes type to match each eligible move; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Ignores opposing combat/accuracy stages; reveals Illusions."
	},
	"bonewarrior": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Defense; Heals 1/16 HP each turn; immune to sandstorm and hail damage."
	},
	"ironvise": {
		"desc": "Contact moves have 1.3x power. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Halves weight. Speed is 1.25x while free of major status. Factory entry gives +1 Speed. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
		"shortDesc": "Contact moves have 1.3x power; No critical hits; 20% less damage; foe stat drops give +2 Defense; Half weight; 1.25x Speed without status; Factory entry +1 Speed; Entry lowers adjacent foes' Attack by 1."
	},
	"apexvenom": {
		"desc": "Biting moves have 1.5x power. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Poison moves, including Poison Fang, are super effective against Poison- and Steel-type Pokemon. Poison Fang has 1.5x power. Biting moves bypass protection and have a 30% chance to badly poison the target.",
		"shortDesc": "Bites have 1.5x power; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect — Poison hits Poison/Steel; Poison Fang is 1.5x; bites bypass protection and badly poison 30%."
	},
	"blackviper": {
		"desc": "Whiplash: +1 accuracy on entry and 1.5x tail-move power. Its first tail hit against a foe each entry badly poisons that target, subject to normal status immunities.",
		"shortDesc": "Entry gives +1 accuracy; 1.5x tail power; first tail hit each entry badly poisons."
	},
	"sirius": {
		"desc": "Biting moves have 1.5x power. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Poison moves, including Poison Fang, are super effective against Poison- and Steel-type Pokemon. Poison Fang has 1.5x power. Biting moves bypass protection and have a 30% chance to badly poison the target. Whiplash: +1 accuracy on entry and 1.5x tail-move power. Its first tail hit against a foe each entry badly poisons that target, subject to normal status immunities. Retains Apex Venom, Dragon-type Poison Fang, +1 accuracy on entry and 1.5x tail power. Its first tail hit against a foe each entry also badly poisons it, subject to status immunities.",
		"shortDesc": "Bites have 1.5x power; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Poison hits Poison/Steel; Poison Fang is 1.5x; bites bypass protection and badly poison 30%."
	},
	"dragonize": {
		"desc": "Its Normal-type moves become Dragon-type moves and have their power multiplied by 1.2. It gains STAB on Dragon-type moves.",
		"shortDesc": "Normal moves become Dragon type; Dragon STAB; converted moves 1.2x."
	},
	"apexpredator": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Its Rock typing adds no Fighting, Ground, Steel, Water or Grass weakness. Immune to sandstorm and hail damage. Gains +1 Defense and Sp. Def when a foe lowers its stats, and on entry on Desert, Fairy Tale, Cave, Crystal Cavern, New World or Volcanic. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack each turn, plus +1 Sp. Atk on Mountain or Snowy Mountain.",
		"shortDesc": "Rock weaknesses neutralized; critical-hit/weather protection; stronger Dragon moves; wind boosts Attack."
	},
	"bullrush": {
		"desc": "On its first active turn, its Speed is 1.5x and its Attack is 1.2x. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
		"shortDesc": "First active turn: 1.5x Spe and 1.2x Atk; Entry lowers adjacent foes' Attack by 1."
	},
	"aerilate": {
		"desc": "Its Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		"shortDesc": "Its Normal-type moves become Flying type and have 1.2x power."
	},
	"joyride": {
		"desc": "Its Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects. On its first active turn, its Speed is 1.5x and its Attack is 1.2x. Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk. Takes 20% less attack damage.",
		"shortDesc": "Its Normal-type moves become Flying type and have 1.2x power; First active turn: 1.5x Spe and 1.2x Atk; No sleep/Yawn; 1.3x Fighting attacking stats; 20% less damage."
	},
	"aftermath": {
		"desc": "A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage.",
		"shortDesc": "Contact KO costs attacker 1/4 HP (1/2 on Corrosive Mist)."
	},
	"analytic": {
		"desc": "Moves have 1.3x power if no other active Pokemon has a move left to use that turn.",
		"shortDesc": "1.3x power when no other active Pokemon has a move left."
	},
	"inexorable": {
		"desc": "Its attacks have 1.3x power if its target has not moved yet or is switching out.",
		"shortDesc": "1.3x power against targets that have not moved or are switching."
	},
	"wildspirit": {
		"desc": "On entry, its accuracy rises by 1 stage. During its first turn out, its attacks are guaranteed to critical hit. It takes 30% less damage from attacks.",
		"shortDesc": "+1 accuracy on entry; first-turn critical hits; takes 30% less attack damage."
	},
	"anticipation": {
		"desc": "On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk.",
		"shortDesc": "Reveals Illusions and dangerous moves; Psychic-field bonus."
	},
	"aromaveil": {
		"desc": "Protects itself and allies from Attract, Disable, Encore, Heal Block, Taunt and Torment.",
		"shortDesc": "Team protection from attraction and move restrictions."
	},
	"aquashell": {
		"desc": "Prevents and cures burns; immune to sandstorm and hail damage. Gains Aqua Ring on entry. Cures status each turn on Water Surface and Underwater. Contact moves have 1.3x power. Prevents flinching and Intimidate's Attack drop. Prevents and cures burns, grants Aqua Ring on entry, prevents hail and sandstorm damage, and cures status at turn end on Water Surface and Underwater fields.",
		"shortDesc": "No burn or weather damage; Aqua Ring; water-field status cure; Contact moves have 1.3x power; Cannot flinch; blocks Intimidate."
	},
	"baddreams": {
		"desc": "Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field.",
		"shortDesc": "Sleeping foes lose 1/8 HP per turn, except on Rainbow."
	},
	"battery": {
		"desc": "Special moves have 1.3x power, with a further 1.5x boost on Electric Terrain. Allies' special moves have 1.3x power.",
		"shortDesc": "Boosts its own and allies' special moves."
	},
	"battlearmor": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Defense."
	},
	"battlefervor": {
		"desc": "If it moves before its target, its attacks deal 1.2x damage. Once per switch-in, if it would move after the attacker, damaging attacks against it deal 0.8x damage. The first time per battle it is hit by an opposing damaging move, its Attack and Special Attack rise by 1 stage. Foes cannot eat Berries while it is active, and Seed items are prevented. Bewitched Woods, Haunted, and Holy Field disable these effects.",
		"shortDesc": "Fast attacks 1.2x; slow-hit guard once; first hit +Atk/SpA; blocks Berries/Seeds."
	},
	"shadowbond": {
		"desc": "Battle Bond's shared effects plus Proficient and Infiltrator. Ash-Greninja's Water Shuriken hits three times at 30 base power per hit and always critically hits.",
		"shortDesc": "Water Shuriken is 3 hits at 30 power, always critical."
	},
	"apexbond": {
		"desc": "Battle Bond's shared effects plus Supreme Overlord and Rough Skin. Garchomp-Battle-Bond's Dual Chop never misses and always critically hits.",
		"shortDesc": "Dual Chop never misses and always critical."
	},
	"sacredbond": {
		"desc": "Battle Bond's shared effects plus Magma Armor, Intimidate, and Flash Fire. Arcanine-Battle-Bond's Extreme Speed has 1.5x power and always critically hits.",
		"shortDesc": "Extreme Speed is 1.5x power and always critical."
	},
	"berserk": {
		"desc": "When an attack takes it from above half HP to half or less, gains +1 Attack and Sp. Atk after the move. Dragon's Den entry gives +2 Attack and Sp. Atk.",
		"shortDesc": "Crossing half HP from an attack gives +1 Attack/Sp. Atk."
	},
	"bigpecks": {
		"desc": "Other Pokemon cannot lower its Defense.",
		"shortDesc": "Other Pokemon cannot lower its Defense."
	},
	"bulletproof": {
		"desc": "It is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks.",
		"shortDesc": "Immune to bullet/pulse/Mega Launcher moves; takes 0.8x damage."
	},
	"apexarmor": {
		"desc": "It is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks. Contact attackers lose 1/8 of their max HP. Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Blocks bullet/pulse moves, reduces attack damage by 20%, damages contact attackers by 1/8 max HP, and ignores redirection. Restores 1/16 max HP each turn and prevents hail and sandstorm damage.",
		"shortDesc": "Immune to bullet/pulse/Mega Launcher moves; takes 0.8x damage; Contact attackers lose 1/8 HP; Ignores redirection; +1 Sp. Atk on specified fields; Heals 1/16 HP each turn; immune to sandstorm and hail damage."
	},
	"hardyskin": {
		"desc": "Prevents and cures sleep. Effective rain heals 1/8 max HP per turn; effective sun costs 1/8. Move KOs give +1 Attack.",
		"shortDesc": "No sleep; rain heals 1/8 HP per turn, sun costs 1/8; move KOs give +1 Attack."
	},
	"chlorophyll": {
		"desc": "Doubles Speed in sun or Stage 4 Flower Garden.",
		"shortDesc": "Double Speed in sun or Stage 4 Flower Garden."
	},
	"solarbud": {
		"desc": "Once per entry, finishing a turn in effective sun stores one bud. The next Grass attack dealing HP damage to a foe consumes it to cure status and restore 1/8 max HP.",
		"shortDesc": "Once/entry: sun stores a bud; Grass HP damage spends it to cure status/heal 1/8."
	},
	"solarhydra": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. On entry, creates Grassy Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules. In effective sun, Sp. Atk is 1.5x and it loses 1/8 max HP each turn. Cold Eclipse disables both effects. Once per entry, finishing a turn in effective sun stores one bud. The next Grass attack dealing HP damage to a foe consumes it to cure status and restore 1/8 max HP. Once per entry, finishing a turn in effective sun stores a bud; the next Grass attack dealing opposing HP damage consumes it to cure status and heal 1/8 max HP. Solar Power's HP cost and field effects remain. No Self Repair.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Creates Grassy Terrain on entry; Sun: 1.5x Sp. Atk, loses 1/8 HP per turn; disabled on Cold Eclipse; Once/entry: sun stores a bud."
	},
	"astralengine": {
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Moves have 1.3x power if no other active Pokemon has a move left to use that turn. Allies' moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields.",
		"shortDesc": "Airborne; move KOs raise its highest stat; 1.3x power when no other active Pokemon has a move left; Allies' moves have 1.3x power (1.5x on specified fields)."
	},
	"elevate": {
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat.",
		"shortDesc": "Airborne; move KOs raise its highest stat."
	},
	"clearbody": {
		"desc": "Other Pokemon cannot lower its stat stages.",
		"shortDesc": "Other Pokemon cannot lower its stats."
	},
	"cloudnine": {
		"desc": "Suppresses weather effects while active. On Rainbow Field, gains one random non-maxed stat stage other than evasion each turn.",
		"shortDesc": "Suppresses weather; Rainbow gives a random stat boost each turn."
	},
	"conductivity": {
		"desc": "It is immune to sound-based moves. Its Electric-type moves hit Steel-type Pokemon super effectively.",
		"shortDesc": "Sound immunity; Electric moves hit Steel super effectively."
	},
	"competitive": {
		"desc": "Foe stat drops give +2 Sp. Atk, except on Chessboard. On Chessboard, move power instead rises with missing HP, from 1x at full HP to 2x at 20% HP or less.",
		"shortDesc": "Foe stat drops give +2 Sp. Atk; Chessboard boosts power instead."
	},
	"compoundeyes": {
		"desc": "Moves have 1.3x accuracy. Mirror Arena entry gives +1 accuracy and Laser Focus.",
		"shortDesc": "1.3x accuracy; Mirror Arena entry grants accuracy/Laser Focus."
	},
	"contrary": {
		"desc": "Reverses received stat-stage changes, except Z-Power changes.",
		"shortDesc": "Reverses stat changes except Z-Power."
	},
	"queensguard": {
		"desc": "Reverses received stat-stage changes, except Z-Power changes. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Same-type moves have 1.3x power.",
		"shortDesc": "Reverses stat changes except Z-Power; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Entry lowers adjacent foes' Attack by 1; Moves bypass Substitute and opposing screens; Same-type moves have 1.3x power."
	},
	"corrosivetouch": {
		"desc": "Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Grass attacks receive a 1.5x same-type attack bonus.",
		"shortDesc": "1.5x power for moves at 60 power or less (80 on Factory); Contact hits have a 30% poison chance; Poison bypasses type immunity; poisoned foes lose defenses — Grass STAB."
	},
	"corrosion": {
		"desc": "Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
		"shortDesc": "Poison bypasses type immunity; poisoned foes lose defenses."
	},
	"witheringshell": {
		"desc": "Physical hits set Stealth Rock on the attacker's side except in water fields. It cures status and restores exactly 1/3 max HP when switching out, with no extra healing for curing status. If it is at full HP, it survives one hit with at least 1 HP, and OHKO moves fail.",
		"shortDesc": "Physical hits set Stealth Rock on the attacker's side except in water fields. It cures status and restores exactly 1/3 max HP when switching out, with no extra healing for curing status."
	},
	"cursedbody": {
		"desc": "Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes.",
		"shortDesc": "30% chance to disable attacks; curses foes on faint."
	},
	"damp": {
		"desc": "Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive.",
		"shortDesc": "Blocks explosions/Aftermath; halves incoming Fire attacking stats."
	},
	"darkaura": {
		"desc": "All damaging Dark moves have 4/3x power, or 0.75x with Aura Break. Multiple users do not stack. Immune to hail damage on Cold Eclipse.",
		"shortDesc": "Boosts everyone's Dark moves; Aura Break reverses it."
	},
	"relicinstinct": {
		"desc": "Above 50% HP, its moves ignore opposing Abilities. At 50% HP or less, it takes 0.75x damage from attacks, cannot be critically hit, restores 1/16 max HP each turn, and its Attack and Special Attack are halved. Once at 25% HP or less, it heals 25% max HP, clears negative stat stages, and lowers its Defense and Special Defense by 2.",
		"shortDesc": ">50%: ignores Abilities. <=50%: defensive mode; <=25%: one pinch heal."
	},
	"fossilfrenzy": {
		"desc": "When it is hit by a damaging move, its Attack and Speed rise by 1 stage and it becomes confused. While confused, it takes 1.25x damage from attacks. Its held item has no effect. It cannot use Fling successfully. Macho Brace, Power Anklet, Power Band, Power Belt, Power Bracer, Power Lens, and Power Weight still have their effects. On Chessboard, cannot use Ancient Power, Barrage, Continental Crush, Psychic, Rock Throw, Secret Power, Shattered Psyche or Strength. If it hits itself in confusion, it also loses 1/8 of its max HP.",
		"shortDesc": "HP hits give +1 Attack/Speed and confusion; confused damage increases; held items are disabled."
	},
	"defiant": {
		"desc": "Gains +2 Attack when a foe lowers its stats.",
		"shortDesc": "Foe stat drops give +2 Attack."
	},
	"draconicforce": {
		"desc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Same-type moves have 1.3x power. Biting moves have 1.5x power. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Normal moves become Dragon; Dragon STAB; 1.3x same-type and 1.5x biting power; ignores abilities."
	},
	"drizzle": {
		"desc": "On entry, summons rain for 5 turns, or 8 with Damp Rock.",
		"shortDesc": "Summons rain on entry."
	},
	"drought": {
		"desc": "On entry, summons sun for 5 turns, or 8 with Heat Rock.",
		"shortDesc": "Summons sun on entry."
	},
	"unboundblaze": {
		"desc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Same-type moves have 1.3x power. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All.",
		"shortDesc": "Stronger Dragon/same-type moves; Fire absorption; Water/Ice protection; end-turn Fire damage to foes."
	},
	"sunsovereign": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Summons sun for 8 turns on entry. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Same-type moves have 1.3x power. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Heals 1/16 max HP at turn end.",
		"shortDesc": "Mold Breaker; 8-turn sun, stronger Dragon moves, healing and Fire chip."
	},
	"burningspirit": {
		"desc": "Heals 1/16 max HP each turn. Copies foes' positive stat changes after their move, entry or transformation, and at turn end. Copied changes do not loop between users. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Same-type moves have 1.3x power.",
		"shortDesc": "Heals 1/16 HP per turn; copies foe boosts; stronger same-type moves; Water/Ice and freeze protection."
	},
	"emperorsresolve": {
		"desc": "Opposing stat drops give +2 Sp. Atk. Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Same-type moves have 1.3x power. The two Speed boosts do not stack.",
		"shortDesc": "Foe stat drops give +2 Sp. Atk; double Speed in rain/snow and supported fields; 1.3x same-type power."
	},
	"terraresolve": {
		"desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Takes 20% less attack damage, or 40% less from super-effective attacks. Same-type moves have 1.3x power.",
		"shortDesc": "Opposing HP hits heal 1/16; +1 Defense once per turn; 20% less attack damage; 40% less if super effective; Same-type moves have 1.3x power."
	},
	"primalego": {
		"desc": "When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Same-type moves have 1.3x power. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. While Royal Decree or Empress is active without Neutralization, takes 30% less attack damage and has 1.3x move power, except against Battle Bond.",
		"shortDesc": "Ignores foe stages and abilities; stronger same-type moves; heals and gains stats in combat."
	},
	"eclipsevision": {
		"desc": "Its Special Attack is multiplied by 1.5. Its first move slot sets its opening type if Psychic or Dark, and each later Psychic- or Dark-type move changes it to that type. If it is Psychic type, it restores 1/8 of its max HP at turn end. If it is Dark type, its damaging moves restore HP equal to 1/4 of the damage dealt.",
		"shortDesc": "SpA 1.5x; first move slot sets Psychic/Dark type; later moves switch it; Psychic heals; Dark drains."
	},
	"venomarmor": {
		"desc": "On entry, it becomes poisoned if it has no status, even if it is Steel-type. Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. While it has a major status, its physical damage is multiplied by 1.3. Metal Claw has 1.5x power.",
		"shortDesc": "Poisons itself; poison heals; eligible moves hit twice; 1.3x physical damage with status; stronger Metal Claw."
	},
	"toxicarmor": {
		"desc": "On entry, it becomes poisoned if it has no status, even if it is Steel-type. Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. While it has a major status, its physical damage is multiplied by 1.3. Metal Claw has 1.5x power. On its first active turn, its Speed is 1.5x and its Attack is 1.2x.",
		"shortDesc": "Poison heals; eligible moves hit twice; stronger physical moves with status; first-turn Attack/Speed boosts."
	},
	"venomignition": {
		"desc": "Fire attacks deal 1.2x damage to poisoned or badly poisoned targets. Checks status separately for each hit; poison is not consumed.",
		"shortDesc": "Fire attacks deal 1.2x damage against poisoned targets."
	},
	"corrosiveburn": {
		"desc": "Corrosion allows poisoning Poison/Steel types and Poison attacks to hit Steel; newly poisoned foes lose 1 Defense and Sp. Def stage, with existing field effects retained. Oblivious blocks and cures attraction/Taunt, blocks Captivate and prevents Intimidate. Fire damaging attacks deal 1.2x damage if the target is poisoned or badly poisoned when damage is calculated, once per hit. No poison consumption or additional burn/residual effect; no Merciless or Regenerator.",
		"shortDesc": "Poison bypasses type immunity; poisoned foes lose defenses; No attraction/Taunt, Captivate or Intimidate Attack drop; Fire attacks deal 1.2x damage against poisoned targets — Fire damage 1.2x against poisoned targets."
	},
	"noseformation": {
		"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks. Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. After it hits, three 20 BP special Mini-Noses each select the strongest of Steel, Electric, or Rock against their current target. They chain to another valid foe after a KO, and their KOs trigger Elevate.",
		"shortDesc": "20% less attack damage; 40% less if super effective; Airborne; move KOs raise its highest stat — three adaptive 20 BP Mini-Noses chain after KOs and trigger Elevate."
	},
	"mourningvessel": {
		"desc": "Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Status moves gain +1 priority. Damaging moves gain 20% power per fainted ally, capped at double power. At turn end, heals 5% max HP per fainted foe, counting all opposing sides in Free-for-All.",
		"shortDesc": "No indirect damage; +1 status priority; up to double power from fainted allies; fainted foes give healing."
	},
	"fallenstar": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Designated arrow moves gain +1 priority at half HP or less and 1.3x power against trapped foes: Spirit Shackle, Thousand Arrows, Triple Arrows, Snipe Shot, Razor Leaf, Magical Leaf, Spike Cannon, Pin Missile, Icicle Spear, Rock Blast, Bullet Seed, Scale Shot, Psycho Cut and Ceaseless Edge. Retains its arrow follow-up and protective effects.",
		"shortDesc": "Mold Breaker; arrow moves: +1 priority at half HP or less; 1.3x power against trapped foes."
	},
	"eclipse": {
		"desc": "This Ability cannot be suppressed. During weather, its attacks deal 1.5x damage. In clear weather, attacks deal 0.5x damage to it. Its Psychic-type moves become Dark type if Dark would do more damage, and its Dark-type moves become Psychic type if Psychic would do more damage. It restores 1/4 max HP instead of taking damage from Psychic- or Dark-type moves.",
		"shortDesc": "Cannot be suppressed; weather attacks 1.5x; clear damage halved; Psychic/Dark choose type."
	},
	"ragingstorm": {
		"desc": "Moves ignore bypassable opposing abilities. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Attacks bypass Substitute, screens and defensive stat stages and gain +1 critical-hit stage. Takes half damage from priority attacks, in addition to its armor reduction. Immune to hail damage. Move KOs damage remaining foes by 60% of the last damage dealt; if there is no valid target or no damage is dealt, gains +1 Attack instead. Magic Guard prevents this splash damage. Cannot be suppressed.",
		"shortDesc": "Ignores abilities/screens/defensive stages; armor protection; half priority damage; KO splash damage."
	},
	"ragingoverlord": {
		"desc": "Moves ignore bypassable opposing abilities. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Attacks bypass Substitute, screens and defensive stat stages and gain +1 critical-hit stage. Takes half damage from priority attacks, in addition to its armor reduction. Immune to hail damage. Move KOs damage remaining foes by 60% of the last damage dealt; if there is no valid target or no damage is dealt, gains +1 Attack instead. Magic Guard prevents this splash damage. Cannot be suppressed. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops.",
		"shortDesc": "Ignores abilities/screens/defensive stages; armor protection; KO splash damage; fallen allies grant bonuses."
	},
	"voltagevolley": {
		"desc": "Its multi-hit moves become special attacks and use its Special Attack.",
		"shortDesc": "Multi-hit moves become special and use Sp. Atk."
	},
	"vanguard": {
		"desc": "On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Extreme Speed has 1.5x power and becomes Fire when its matchup is better, including against Normal immunity. Direct single-target opposing HP damage grants one 50% guard against the next damaging hit from that opponent that turn. After a successful attack, lethal damage can trigger a once-per-battle final stand: all direct and residual damage leaves at least 1 HP for the rest of that turn. Does not prevent non-damage faint effects. No extra critical-hit reward, permanent indirect immunity or stat-drop protection.",
		"shortDesc": "Entry lowers adjacent foes' Attack by 1 — enhanced Extreme Speed; one-foe guard and once-per-battle final stand."
	},
	"apexcleave": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Gains +1 Attack for each Pokemon knocked out by its move.",
		"shortDesc": "1.5x slicing power; eligible moves hit twice; move KOs give +1 Attack."
	},
	"aurainstinct": {
		"desc": "Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. The first otherwise lethal attack has a 50% chance to leave it at 1 HP. This Ability rolls only once per battle, even if the roll fails or it switches out.",
		"shortDesc": "Stronger STAB; eligible moves hit twice; one 50% roll per battle to survive a lethal attack."
	},
	"sniper": {
		"desc": "It gains 1 Accuracy on entry. Its critical hits deal 2.25x damage instead of 1.5x.",
		"shortDesc": "+1 Accuracy on entry; critical hits deal 2.25x damage."
	},
	"abysssniper": {
		"desc": "It gains 1 Accuracy on entry. Its critical hits deal 2.25x damage instead of 1.5x. Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Its critical hits deal increased damage, and its moves cannot be redirected.",
		"shortDesc": "+1 Accuracy on entry; critical hits deal 2.25x damage; Ignores redirection; +1 Sp. Atk on specified fields."
	},
	"grandmaster": {
		"desc": "Automatically marks the target of a direct damaging Psychic move with Miracle Eye. Successful direct single-target attacks store a 90 BP Psychic special attack; opposing special HP damage stores a 90 BP special attack of the incoming type. One shared pending attack, arriving two turns later. Stored attacks snapshot its level, Special Attack, stages and typing, survive switching or fainting, and respect live target defenses. Independent of normal Future Sight. Retains flinch, powder and weather protection, status-turn guard, and its existing Psychic resistance and manual Miracle Eye utility.",
		"shortDesc": "Automatic Miracle Eye; one stored 90 BP attack after 2 turns; independent of Future Sight."
	},
	"warpath": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. It is immune to powder moves, hail damage, sandstorm damage, and flinching. Its moves have 1.3x accuracy and damaging moves have 1.3x power. Its Attack is 1.5x while statused; burn still reduces its physical damage normally. It takes 25% less damage from attacks. Its Rock-, Fighting-, and Ground-type moves and drill or horn moves bypass screens and Substitute and ignore defensive stat stages. When attacking, it ignores the target's Defense, Sp. Def, and evasion stages; when defending, it ignores the attacker's Attack, Sp. Atk, and accuracy stages.",
		"shortDesc": "Mold Breaker; Powder/weather/flinch immunity; accuracy/power 1.3x; status Atk 1.5x; attacks deal 25% less; stage/bypass effects."
	},
	"atrocity": {
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Same-type moves have 1.3x power. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Contact moves have 1.3x power. Heals 1/16 max HP each turn. Damaging moves have a further 1.3x power, plus another 1.3x on Cold Eclipse. Critical-hit ratio rises by 1. Dragon Rush cannot miss and has a further 1.5x power. Defense and Sp. Def are 1.3x, or 1.5x on Cold Eclipse. While Royal Decree or Empress is active without Neutralization, move power gains another 1.3x and incoming attack damage falls by 30%. Cannot be suppressed.",
		"shortDesc": "Mold Breaker; stronger attacks and defenses; healing, Fire chip and never-miss Dragon Rush."
	},
	"wickedsnare": {
		"desc": "Attacks use double the offensive stat against targets that entered this turn. Contact attackers lose 1 Speed stage. Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods.",
		"shortDesc": "Double attacking stats against newly entered targets; Contact attackers lose 1 Speed; Status moves gain +1 priority; Dark foes usually block them."
	},
	"wickedcommand": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gains +1 critical-hit stage. Takes 20% less attack damage from other Pokemon. A move KO boosts its higher attacking stat by 1, choosing Attack on a tie.",
		"shortDesc": "No sleep/Yawn; +1 critical-hit stage; 20% less damage; KOs boost higher attacking stat."
	},
	"bewitchingmajesty": {
		"desc": "On entry, creates Bewitched Woods for 5 turns. Reflects eligible directly targeted status moves once. Blocks opposing priority moves targeting its side, with the usual side-wide move exceptions.",
		"shortDesc": "Creates 5-turn Bewitched Woods; reflects targeted status moves; blocks foe priority against its side."
	},
	"mythicscale": {
		"desc": "Defense is 1.5x while statused or on Misty, Rainbow, Fairy Tale, Dragon's Den and Starlight Arena. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Moves have 1.3x accuracy. Mirror Arena entry gives +1 accuracy and Laser Focus. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Once per switch-in, directly using a powder move to successfully inflict a non-volatile status on an opponent raises Defense by 1. Called or reflected moves do not trigger this bonus.",
		"shortDesc": "Stronger Defense; airborne; 1.3x accuracy; blocks secondary effects; first successful powder status gives +1 Defense."
	},
	"toxicevolution": {
		"desc": "Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Poisoned foes may be confused, attackers may be poisoned, and Ground moves do not affect the holder.",
		"shortDesc": "Poison bypasses type immunity; poisoned foes lose defenses; Two 60% independent rolls; boosting pairs: full +15%; FFA: two full-power targets; Blocks incoming attack secondary effects; Airborne."
	},
	"soulstrike": {
		"desc": "Its moves ignore accuracy checks. It is immune to Ghost-type moves and restores 1/4 max HP when hit by one. Soul Fire cannot redirect or bypass this immunity. When it faints, it creates Haunted Field for 5 turns, ignoring Neutralization. This Ability cannot be ignored or suppressed by Mold Breaker-style effects.",
		"shortDesc": "Moves never miss; Ghost absorb; faint sets Haunted Field."
	},
	"auroraresonance": {
		"desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Heals 1/16 max HP each turn in effective rain. Sound moves become Water type, Water attacks are absorbed, and the holder heals in rain and snow. Does not add Ice typing.",
		"shortDesc": "Sound moves: Water (Ice on Icy Field), 1.2x power; Absorbs Water for 1/4 HP; water-field healing; 30% contact frostbite; heals in icy weather/fields; no hail damage; Heals 1/16 HP each turn in rain."
	},
	"auroracurrent": {
		"desc": "It has Snow Warning built in. On entry, it summons Snow. It gains STAB on Electric-type moves. During Snow, its Electric-type moves cannot miss and its Defense and Special Defense are boosted by 1.5x.",
		"shortDesc": "Electric STAB; in Snow, Electric never misses and Def/SpD 1.5x."
	},
	"alloycore": {
		"desc": "Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk.",
		"shortDesc": "No indirect/weather damage; heals 1/16 HP per turn; moves ignore redirection."
	},
	"hellfireeclipse": {
		"desc": "Absorbs Fire moves except on Cold Eclipse. All damaging Dark moves have 4/3x power, or 0.75x with Aura Break. Multiple users do not stack. Immune to hail damage on Cold Eclipse. Attack and Sp. Atk are 1.5x in effective sun. After using a Fire move, summons sun for 2 turns if the weather change succeeds.",
		"shortDesc": "Absorbs Fire; boosts all Dark moves; 1.5x attacking stats in sun; Fire moves summon 2-turn sun."
	},
	"sacrededge": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. On entry or Mega Evolution, heals adjacent allies by 1/4 max HP, or 1/3 on Fairy Tale.",
		"shortDesc": "Stronger slicing moves; eligible moves hit twice; entry heals allies by 1/4 HP, or 1/3 on Fairy Tale."
	},
	"omenedge": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. On entry, lowers foes' Defense and Sp. Def by 1 (2 on Cold Eclipse) and changes Underwater to Midnight Zone. Foes targeting it spend 1 extra PP, or 2 on Midnight Zone. On fainting, schedules a physical, 140-power Steel Doom Desire against each foe. An existing delayed attack is delayed by another 2 turns instead.",
		"shortDesc": "Stronger slicing moves; eligible moves hit twice; foes spend extra PP; physical Doom Desire on fainting."
	},
	"invigorate": {
		"desc": "Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition.",
		"shortDesc": "User/allies receive 1.3x healing; 50% to cure ally status each turn."
	},
	"dreadmaw": {
		"desc": "Doubles Attack. On entry, reveals all opposing active Illusions and held items. Each item holder independently has a 30% chance to be Embargoed for 5 turns. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition. Doubles Attack, reveals opposing held items on entry, and improves healing.",
		"shortDesc": "Doubles Attack; Reveals foe Illusions/items; 30% chance of 5-turn Embargo; User/allies receive 1.3x healing; 50% to cure ally status each turn."
	},
	"cursedkeepsake": {
		"desc": "When it is hit by an opposing damaging move, the attacker becomes cursed. Cursed Pokemon deal 0.5x damage to it. It restores HP equal to 1/2 of Curse damage it caused. When it faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization. Frisk breaks all opposing active Illusions on entry, reveals their held items, and independently has a 30% chance to Embargo each item holder for 5 turns.",
		"shortDesc": "Curses attackers; cursed foes deal 0.5x; heals 1/2 Curse damage."
	},
	"curseddoll": {
		"desc": "Contact moves have 1.3x power. Takes 0.8x attack damage at any HP; super-effective attacks deal a further 0.75x damage (0.6x total). Ability-ignoring moves cannot bypass these reductions, but suppression disables them. Immune to hail damage on Cold Eclipse. Its damaging moves curse the foes they hurt. When it faints, it creates Haunted Field for 5 turns. Frisk breaks all opposing active Illusions on entry, reveals their held items, and independently has a 30% chance to Embargo each item holder for 5 turns.",
		"shortDesc": "Contact moves have 1.3x power; 20% less attack damage at any HP; 40% less if super effective — damaging moves curse; faint sets Haunted."
	},
	"cursedmarionette": {
		"desc": "Its status moves have +1 priority. Its attacks and status moves curse opposing targets, and being hit curses the attacker. Cursed foes deal 0.8x damage to it. It restores HP equal to 1/2 of Curse damage it caused. Its Curse deals 1/8 max HP. When it faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization. Frisk breaks all opposing active Illusions on entry, reveals their held items, and independently has a 30% chance to Embargo each item holder for 5 turns.",
		"shortDesc": "Status priority; attacks and incoming hits curse; cursed foes deal 20% less damage; Curse damage heals it."
	},
	"sandsovereign": {
		"desc": "On entry, it sets Sandstorm for 8 turns. It has Dauntless Shield and Solid Rock. Arenite Wall lasts 5 turns, or 8 turns when extended. Each turn, non-immune foes take Rock damage equal to 1/16 max HP. Only in Free-for-All does Rock type effectiveness scale this chip.",
		"shortDesc": "8-turn Sand; Rock chip scales by type in FFA."
	},
	"tyrantstream": {
		"desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power. Prevents move recoil except Struggle. Crash and Life Orb damage still apply. On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Biting moves have 1.5x power.",
		"shortDesc": "Summons sandstorm; stronger recoil/crash/explosion and biting moves; no move recoil except Struggle."
	},
	"frostsovereign": {
		"desc": "On entry, it sets Snow through Snow Warning for 8 turns. It has Ice Body and Filter. Manually used Aurora Veil lasts 8 turns. Each turn, non-immune foes take Ice damage equal to 1/16 max HP. Only in Free-for-All does Ice type effectiveness scale this chip.",
		"shortDesc": "8-turn Snow; Ice chip scales by type in FFA."
	},
	"freezerburn": {
		"desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. Biting moves have 1.5x power. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Eligible Normal moves become Ice with 1.2x power.",
		"shortDesc": "Double Speed in snow and supported fields; stronger biting moves; airborne; Normal moves become Ice."
	},
	"stormfright": {
		"desc": "On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. If Rain Dance or Primordial Sea is active, its Special Attack is multiplied by 1.5 and it loses 1/8 of its max HP at turn end. Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts. On entry, lowers adjacent foes' Attack by 1 stage. Draws in and absorbs Electric moves, raising Attack and Special Attack by 1 stage; Electric Terrain also grants these boosts on entry. In rain, Special Attack is multiplied by 1.5, but it loses 1/8 of its max HP each turn.",
		"shortDesc": "Entry lowers adjacent foes' Attack by 1; In rain, 1.5x Sp. Atk and loses 1/8 max HP each turn; Redirects/absorbs Electric for +1 Attack and Sp. Atk."
	},
	"enlightenment": {
		"desc": "Doubles Attack, or Sp. Atk instead on Psychic Terrain. Prevents flinching and Intimidate's Attack drop. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field.",
		"shortDesc": "Doubles Attack; Psychic Terrain doubles Sp. Atk instead; Cannot flinch; blocks Intimidate; 1.5x power for moves at 60 power or less (80 on Factory)."
	},
	"relentlesslink": {
		"desc": "Multi-hit moves always use their maximum hit count and have 1.5x power. Moves that normally check accuracy per hit check only once. Moves ignore bypassable opposing abilities. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection. Drill and horn moves gain Power Drill effects. Guts and Battle Armor are removed.",
		"shortDesc": "Maximum multi-hit count; 1.5x multi-hit power; Moves ignore bypassable abilities; Drill/horn moves have 1.5x power; 2x and pierce protection on rocky fields."
	},
	"mirrorgreed": {
		"desc": "Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again. Fairy Tale entry gives +1 Sp. Def; Mirror Arena entry gives +1 evasion. Moves have 1.3x power if no other active Pokemon has a move left to use that turn. Takes 20% less attack damage, or 40% less from super-effective attacks.",
		"shortDesc": "Reflects status moves; 1.3x power when moving last; 20% less attack damage, 40% if super effective."
	},
	"uncheckedassault": {
		"desc": "Normal and Fighting moves bypass type immunity. Kicking moves have 1.4x power. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind. Copies foes' positive stat changes after moves, entries, transformations and at turn end.",
		"shortDesc": "Normal/Fighting hit Ghosts; 1.4x kicks; copies foe boosts; no paralysis or opposing Speed drops."
	},
	"royalvoice": {
		"desc": "Eligible Normal moves become Fairy and have 1.2x power, or 1.5x on Misty Terrain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Blocks opposing priority moves aimed at it or its allies. Attacks deal 1.5x damage on Fairy Tale, or on Chessboard unless it has the Queen role. Retains Telepathy, including avoiding allied damaging moves and doubled Speed in Psychic Terrain or Psychic Aura. At turn end, it and its active allies each heal 1/16 max HP. Once per switch-in, if an opposing move would knock out an ally, that ally survives at 1 HP and it loses 1/4 max HP, provided it has more HP than the cost.",
		"shortDesc": "Normal moves become Fairy; blocks foe priority; avoids allied attacks; heals allies and can save one."
	},
	"memoryleak": {
		"desc": "Positive stat boosts it would receive are passed to an adjacent ally instead.",
		"shortDesc": "Passes positive stat boosts to an adjacent ally."
	},
	"temporalshift": {
		"desc": "Its stats cannot be lowered by opposing Pokemon. On the turn after it uses a damaging move, it queues a 100 BP Future Sight matching its primary type against a random valid opposing target; multiple attacks can be queued and announce their strike turns.",
		"shortDesc": "Stats cannot be lowered; after attacking, queues 100 BP Temporal Shift Future Sight."
	},
	"dreamsickness": {
		"desc": "Avoids allied damaging moves. Speed doubles on Psychic Terrain or Psychic Aura. At turn end, it and its active allies each heal 1/16 max HP. Once per switch-in, if an opposing move would knock out an ally, that ally survives at 1 HP and it loses 1/4 max HP, provided it has more HP than the cost.",
		"shortDesc": "Avoids allied attacks; heals its side 1/16 each turn; once per entry saves an ally at a 1/4 HP cost."
	},
	"voidveil": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Immune to Ground moves, indirect damage, sleep, and Yawn; Dark- and Ghost-type moves have 1.3x power. In Fairy Tale, raises Sp. Def by 1 on entry. Its first Dark- or Ghost-type attack each switch-in bypasses Substitute and screens. It does not heal or shelter allies.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded; Prevents indirect damage; Fairy Tale entry gives +1 Sp. Def; No sleep or Yawn; 1.3x Dark/Ghost power — first Dark/Ghost attack pierces Substitute and screens."
	},
	"accumulation": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile each turn. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply.",
		"shortDesc": "Fire/Ice protection; automatic Stockpiles; at 3, waits one turn then releases Belch or Spit Up every other turn."
	},
	"rifteater": {
		"desc": "Summons sandstorm on entry. It has Thick Fat and is immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile each turn. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply. Once per battle, the first damaging hit that would cross below half HP stops at half HP, activates its awakening, then immediately heals 25% max HP. Its fourth move is always Sludge Wave. At half HP or less, it creates Desert Field, becomes Ground/Fire, and changes its fourth move to Heat Wave. If sandstorm has ended, it summons it again at that moment.",
		"shortDesc": "Summons sand; auto-Stockpile; once-battle half-HP guard and heal; awakens at half HP."
	},
	"mountainrift": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. It cannot be critically hit, takes 0.8x damage, gains 2 Sp. Def when a foe lowers its stats, heals 1/16 max HP each turn, and ignores sandstorm and hail damage. On entry, it creates Mountain Field for 5 turns. Once at half HP or less, it starts Gravity and resets Mountain Field to 5 turns. Its four moves are always Earthquake, Sand Tomb, Mountain Gale, and Stone Edge. The first time it would faint, it instead revives at full HP as Torterra-Rift-Shatter, clearing its status, boosts, and volatile conditions.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Sp. Def; Heals 1/16 HP each turn; immune to sandstorm and hail damage — 5-turn Mountain; half HP: Gravity + Mountain reset; first faint: full reset into Shatter."
	},
	"desertrift": {
		"desc": "Rock, Ground and Steel moves have 1.3x power in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage. On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Doubles weight and halves physical attack damage. Factory entry gives +1 Defense and -1 Speed. On entry, summons a sandstorm and creates Desert Field for 5 turns. Rock-, Ground-, and Steel-type attacks gain 30% power during sandstorm or Desert Field. It is immune to sandstorm damage, has doubled weight, and takes half damage from physical moves. Its four moves are always Heat Crash, Heavy Slam, Earthquake, and Stone Edge. Its Desert Field creation or refresh is attempted once per battle; switching or ability changes do not reset it. Mountain Rift retains its explicit field-transition exceptions.",
		"shortDesc": "1.3x Rock/Ground/Steel power in sand or sandy fields; Summons sandstorm on entry; Double weight; half physical damage; Factory stat changes — 5-turn Desert Field; fixed four-move set."
	},
	"adaptivecell": {
		"desc": "It ignores powder moves, sandstorm and hail damage and its Special Attack is multiplied by 1.3. Its first move slot sets its opening type: Fighting for physical moves or Psychic for special moves. Each later damaging move changes its type to match its category. Physical moves use its boosted Special Attack as Attack; special moves use its boosted Special Attack normally.",
		"shortDesc": "Changes Fighting/Psychic type with move category; uses 1.3x Sp. Atk for attacks; powder/weather immunity."
	},
	"adaptivepower": {
		"desc": "Doubles Attack. Heals 1/3 max HP on switching out. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply.",
		"shortDesc": "Double Attack; heals 1/3 HP on switching; no indirect damage."
	},
	"relicbeam": {
		"desc": "Its Sp. Atk becomes equal to its Defense, and Special Attack stat stages use Defense stages instead. Beam moves and moves boosted by Mega Launcher have 1.5x power.",
		"shortDesc": "SpA equals Defense using Def stages; beam/Mega Launcher moves have 1.5x power."
	},
	"perfectforesight": {
		"desc": "Includes Insomnia and retains its opposing-ability copying. Automatically applies target-specific Miracle Eye before a direct damaging Psychic move. Direct single-target HP damage stores a 90 BP Psychic special attack; opposing special HP damage stores a 90 BP special attack of the incoming type. Shares one pending attack per opposing trainer (one in singles, up to three in Free-for-All), released one per turn beginning next turn. Snapshots its own level, Special Attack, stages and typing, without copied offensive abilities or items. Queues survive switching/fainting and coexist with ordinary Future Sight; normal live defenses apply. Once per battle when Alakazam Mega Evolves, sets real Reflect and Light Screen for 5 turns without shortening longer screens.",
		"shortDesc": "Insomnia + ability copy; Miracle Eye; stored attacks; once-per-battle Mega screens."
	},
	"doomwarning": {
		"desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk. On fainting, schedules a special, 140-power Steel Doom Desire against each foe. An existing delayed attack is delayed by another 2 turns instead.",
		"shortDesc": "Reflects status moves; no indirect damage; reveals threats; Doom Desire against foes on fainting."
	},
	"perfectego": {
		"desc": "Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. While Royal Decree or Empress is active without Neutralization, takes 30% less attack damage and has 1.3x move power, except against Battle Bond. Moves cannot miss, including on the suppressing fields. When the Royal Decree power bonus does not apply, attacks have 1.2x power against a foe that has not moved or just switched in, except against Battle Bond.",
		"shortDesc": "Never misses; ignores abilities; heals and gains stats in combat; stronger attacks before foes move."
	},
	"heavenlychorus": {
		"desc": "Eligible Normal moves become Fairy with 1.2x power. Suppresses weather effects while active. On Rainbow Field, gains one random non-maxed stat stage other than evasion each turn. Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage.",
		"shortDesc": "Normal moves become Fairy with 1.2x power; suppresses weather; half contact damage, double Fire damage."
	},
	"mourningsnow": {
		"desc": "On entry, it summons Hail for 8 turns, and Aurora Veil used by it lasts 8 turns. During Hail or Snow, it heals 1/16 max HP each turn. Its damaging moves of any type gain an additional 30% chance to inflict frostbite, preserving their existing effects; this does not require weather. It is immune to Hail damage. When another Pokemon faints, it restores 1/8 max HP, or 1/4 if the faint was caused by an Ice move, Hail, Snow, or Curse. When it faints, all opposing Pokemon become cursed. Damaging hits disable the attacker's move when possible.",
		"shortDesc": "8-turn Hail/Veil; damaging moves add 30% frostbite; faint healing/curse; hit Disable."
	},
	"venombastion": {
		"desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Once per turn, a poisoned foe that damages it loses one stage of its higher offensive stat. No separate Bug power boost, Merciless or Self Sufficient.",
		"shortDesc": "HP hits heal 1/16 and boost Defense once per turn; poisoned attackers lose their higher offense once per turn."
	},
	"rimeknuckle": {
		"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks. Punching moves have 1.4x power. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Damaging moves have a 40% chance to cause frostbite (80% on Icy Field). KOs restore 1/8 max HP, or 1/4 against Mega, G-Max, Terastallized, Stellar or Z-Move item targets. Ice Body adds a 30% chance to frostbite contact attackers, hail immunity, and healing in hail/snow or on Icy, Snowy Mountain and Cold Eclipse fields. Healing is 1/16 max HP, or 1/8 in hail on Cold Eclipse.",
		"shortDesc": "20% less attack damage; 40% less if super effective; Punches have 1.4x power; 30% contact frostbite; heals in icy weather/fields; no hail damage — frostbite chance; KO healing."
	},
	"streettyrant": {
		"desc": "On entry, lowers all active foes' Attack by 1. Damaging moves ignore bypassable abilities. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1.",
		"shortDesc": "Entry lowers foes' Attack; attacks ignore abilities; end-turn status cure, stat reset and healing chance."
	},
	"divineintervention": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Allies take 25% less attack damage; this does not protect the holder. Heals 1/3 max HP on switching out. Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage.",
		"shortDesc": "Entry heals allies; allies take 25% less damage; switching heals 1/3 HP; half contact damage, double Fire damage."
	},
	"mountainhunger": {
		"desc": "Absorbs Grass moves for +1 Attack and Sp. Atk; allied Grass moves also grant both boosts. Heals 1/8 max HP each turn on Forest and 1/16 on Grassy Field. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Sleep lasts half as long, rounded down.",
		"shortDesc": "Absorbs Grass for attacking boosts; half Fire/Ice attacking stats; no hail damage; shorter sleep."
	},
	"irondominion": {
		"desc": "On entry or G-Max activation, it activates Pressure and Mirror Armor's effects and heals its ally like Sworn Duty.",
		"shortDesc": "On entry or G-Max activation, it activates Pressure and Mirror Armor's effects and heals its ally like Sworn Duty."
	},
	"astralwatcher": {
		"desc": "On entry, reveals all opposing Illusions and held items. Each opposing item holder independently has a 30% chance to receive Embargo for 5 turns. Status moves gain +1 priority.",
		"shortDesc": "Reveals opposing Illusions/items; 30% Embargo chance per item holder; +1 status-move priority."
	},
	"treasuretitan": {
		"desc": "Doubles weight and halves physical attack damage. Factory entry gives +1 Defense and -1 Speed. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Takes 25% less super-effective attack damage. Absorbs Ground moves from other Pokemon and heals 1/4 max HP. Copperajah-Gmax's weight-based moves have at least 120 power.",
		"shortDesc": "Double weight; half physical damage; lowers foes' Attack; absorbs Ground; 25% less super-effective damage."
	},
	"ragingfists": {
		"desc": "Hydra Bond, Normal/Fighting Ghost-immunity bypass, and damaging moves cannot miss. Retains Hydra Bond's Free-for-All targeting and Dragon's Den power bonus, without an extra multi-hit power multiplier. Does not grant Fighting Fiend's sleep immunity or Multiscale, or Scrappy's Intimidate immunity. Status moves retain their normal accuracy.",
		"shortDesc": "Normal/Fighting hits Ghosts; damaging moves cannot miss."
	},
	"warship": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Takes 20% less attack damage, or 40% less from super-effective attacks. Biting moves have 1.5x power.",
		"shortDesc": "Double Speed in rain and water fields; 20% less attack damage; 40% less if super effective; Bites have 1.5x power."
	},
	"furnaceengine": {
		"desc": "Fire or Water HP hits give +6 Speed. Entry on Burning, Superheated or Volcanic gives +6 Speed; Dragon's Den, Volcanic and Cold Eclipse give +1 Defense and Sp. Def. Midnight Zone entry makes it Water-type. Water Surface, Underwater and Volcanic give +1 Speed each turn. Contact attackers have a 30% burn chance, or 60% on Volcanic; this cannot burn on Cold Eclipse. Heals 1/16 max HP each turn. Takes 20% less attack damage, or 40% less from super-effective attacks. If it dealt Fire- or Rock-type move damage to opposing HP that turn, at the end of the turn opposing Pokemon take Fire-type damage equal to 1/16 max HP, blocked by Fire immunities. Only in Free-for-All does Fire type effectiveness scale this chip.",
		"shortDesc": "Fire/Water hits give +6 Speed; contact may burn; heals each turn; 20%/40% less attack damage; Fire chip."
	},
	"sandspit": {
		"desc": "When it is hit by an attack, the effect of Sandstorm begins.",
		"shortDesc": "When it is hit by an attack, the effect of Sandstorm begins."
	},
	"duneterror": {
		"desc": "On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. When it is hit by an attack, the effect of Sandstorm begins. Summons sand on entry and when hit; during Sandstorm, opposing Pokemon take Ground-type damage equal to 1/16 max HP, blocked by Ground immunities. On fainting, creates Desert Field for 5 turns.",
		"shortDesc": "Summons sandstorm on entry; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; When it is hit by an attack, the effect of Sandstorm begins — Desert Field for 5 turns on faint."
	},
	"heatcoil": {
		"desc": "Gains +1 Speed at the end of each full turn it spends active. Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact. Cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat.",
		"shortDesc": "Speed rises each full turn; contact may burn; cures freeze; halves Water/Ice attacking stats."
	},
	"sweetdecay": {
		"desc": "Attack is 1.5x, but physical moves have 0.8x accuracy. Berries normally eaten at 1/4 HP activate at 1/2 HP instead. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
		"shortDesc": "1.5x Attack; 0.8x physical accuracy; Low-HP Berries activate at half HP; Prevents sleep and Yawn for itself and allies; Poison bypasses type immunity; poisoned foes lose defenses."
	},
	"bakedbliss": {
		"desc": "Absorbs Fire moves for +2 Defense. Gains +1 Defense each turn on Burning, Superheated, Dragon's Den and Volcanic. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep. Berries normally eaten at 1/4 HP activate at 1/2 HP instead.",
		"shortDesc": "Absorbs Fire for +2 Defense; hot fields raise Defense; Half Fire/Ice attacking stats; immune to hail damage; Prevents sleep and Yawn for itself and allies; Low-HP Berries activate at half HP."
	},
	"sweetsanctuary": {
		"desc": "Allies take 25% less attack damage. Its side is protected from sleep, Yawn, attraction, Disable, Encore, Heal Block, Taunt and Torment. Prevents and cures poison for itself and allies. Before a foe uses a Poison move, lowers that foe's Attack and Sp. Atk by 1. Its own and allies' Poison attacks deal half damage on Misty and Rainbow. On Fairy Tale, gains +1 Sp. Def on entry and whenever a Pokemon enters. On Bewitched Woods, its Fairy typing adds no weakness.",
		"shortDesc": "Protects its side from sleep, poison and disruptive effects; allies take 25% less damage; weakens Poison attackers."
	},
	"riptideclaws": {
		"desc": "Doubles Speed in effective rain. Contact moves have 1.3x power. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Double Speed in rain; 1.3x contact power; critical-hit/damage protection; ignores abilities."
	},
	"tidaljaw": {
		"desc": "Biting moves have 1.5x power. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Takes 20% less attack damage, or 40% less from super-effective attacks. Same-type moves have 1.3x power.",
		"shortDesc": "1.5x biting and 1.3x same-type power; rain/water fields double Speed; 20%/40% less attack damage."
	},
	"dryskin": {
		"desc": "Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn.",
		"shortDesc": "Absorbs Water; rain/water fields heal; Fire, sun and Desert hurt."
	},
	"duskilate": {
		"desc": "Its Normal-type moves become Dark-type moves and have their power multiplied by 1.3.",
		"shortDesc": "Normal moves become Dark type and have 1.3x power."
	},
	"sacredpower": {
		"desc": "Its Normal-type moves become Dark-type moves and have their power multiplied by 1.3. Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def.",
		"shortDesc": "Normal moves become Dark type and have 1.3x power; No sleep or Yawn; 1.3x Dark/Ghost power; Prevents indirect damage; Fairy Tale entry gives +1 Sp. Def."
	},
	"execution": {
		"desc": "Eligible Normal moves become Dark, or Fairy on Holy and Rainbow, with 1.3x power. This rises to 1.5x on Dark Crystal Cavern, New World, Starlight Arena, Cold Eclipse, Short-Circuit, Haunted, Bewitched Woods, Holy and Rainbow. Immune to hail damage on Cold Eclipse. Moves ignore bypassable abilities. Attacks against targets at half HP or less gain 1.3x power. Once per switch-in, a direct hit that brings a surviving foe from above half HP to half or less marks it; the next Dark or Ghost hit against that foe ignores positive defensive boosts and spends the mark. The mark ends if either Pokemon switches. Restores 1/8 max HP per KO; Attack and Sp. Atk cannot fall below -1, and Speed cannot be lowered while a field is active.",
		"shortDesc": "Normal moves become Dark/Fairy; ignores abilities; stronger attacks against weakened foes; KOs heal 1/8 HP."
	},
	"earlybird": {
		"desc": "Sleep lasts half as long, rounded down.",
		"shortDesc": "Sleep lasts half as long."
	},
	"eartheater": {
		"desc": "Absorbs other Pokemon's Ground moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Cave and Desert.",
		"shortDesc": "Absorbs Ground for 1/4 HP; heals on Cave/Desert."
	},
	"caverndrake": {
		"desc": "Absorbs other Pokemon's Ground moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Cave and Desert. Takes 20% less attack damage, or 40% less from super-effective attacks. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Absorbs Ground for 1/4 HP; heals on Cave/Desert; 20% less attack damage; 40% less if super effective; Moves ignore bypassable abilities."
	},
	"echofiend": {
		"desc": "It is immune to sound moves, and this immunity cannot be suppressed. Its sound moves become Flying type and have 1.5x power. Its side is immune to its own damaging sound-based moves.",
		"shortDesc": "Unsuppressible sound immunity; sound -> Flying 1.5x; allies avoid own sound damage."
	},
	"effectspore": {
		"desc": "Damaging hits have separate 10% chances to inflict sleep, paralysis or poison on the attacker; powder immunity blocks this. If Sleep Clause blocks sleep, a further roll can inflict paralysis or poison instead.",
		"shortDesc": "Damaging attackers may sleep, be paralyzed or poisoned."
	},
	"electricsurge": {
		"desc": "On entry, creates Electric Terrain or Electric Aura for 5 turns, or 8 with Amplifield Rock, subject to field rules.",
		"shortDesc": "Creates Electric Terrain/aura on entry."
	},
	"ange": {
		"desc": "Prevents indirect damage and ignores bypassable abilities. Attacks deal double damage to Pulse forms. While it is active, the power of Fairy-type moves used by active Pokemon is multiplied by 1.33. Grass attacks use 1.5x Attack or Sp. Atk. On Fairy Tale, both attacking stats double and moves cannot miss. Opposing Mega, G-Max, Terastallized, Stellar and Ultra Beast Pokemon have 0.7x stats, excluding Rift and Pulse forms even if Terastallized. On fainting, creates Bewitched Woods for 5 turns.",
		"shortDesc": "Ignores abilities/indirect damage; double damage to Pulse; boosts Grass/Fairy; weakens special opposing forms."
	},
	"filter": {
		"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks.",
		"shortDesc": "20% less attack damage; 40% less if super effective."
	},
	"byxbysiontouch": {
		"desc": "Its Poison-type damaging moves restore 1/4 of the damage dealt. Ground-type moves deal 1/2 damage to it.",
		"shortDesc": "Poison moves drain 1/4 damage; takes half Ground damage."
	},
	"fluffyevo": {
		"desc": "Moves that do not match its type gain STAB. Its damaging moves ignore type immunities while respecting resistances, and it ignores powder moves, sandstorm and hail damage.",
		"shortDesc": "1.5x off-type move power; attacks bypass type immunities; no powder/weather damage."
	},
	"mindfreeze": {
		"desc": "It cannot have this Ability suppressed. It is immune to Ice-type attacks and restores 1/4 of its max HP when hit by one. It has Ice Body's healing and hail immunity. Its damaging Psychic-type moves have a 40% chance to cause frostbite, and Freezing Glare's frostbite chance is doubled. Its Physical Ice-type moves become Special.",
		"shortDesc": "Cannot be suppressed; Ice immunity heals 1/4; Psychic may frostbite."
	},
	"riotamp": {
		"desc": "Eligible Normal moves become Electric with 1.2x power. Its side's sound moves have 1.5x power and cannot damage allies; its sound moves use its higher attacking stat. Absorbs other Pokemon's Electric moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Electric Terrain and Short-Circuit.",
		"shortDesc": "Normal moves become Electric; stronger sound moves spare allies; absorbs Electric for 1/4 HP."
	},
	"relicarmor": {
		"desc": "On entry on Desert, Fairy Tale, Cave, Crystal Cavern, New World or Volcanic, gains +1 Defense and Sp. Def. Rock typing adds no Fighting, Ground, Steel, Water or Grass weakness. Prevents critical hits and takes 20% less attack damage. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. After a foe lowers its stats, gains +1 Defense and Sp. Def. Lapras-Aevian gains Ice typing in hail or snow and on Icy, Snowy Mountain and Cold Eclipse.",
		"shortDesc": "Rock weakness/critical-hit protection; 20% less damage; heals each turn; defensive boosts."
	},
	"tyrantdomain": {
		"desc": "On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Prevents critical hits and takes 20% less attack damage. Its Rock typing adds no Fighting, Ground, Steel, Water or Grass weakness. Immune to sandstorm and hail damage. Gains +1 Defense and Sp. Def when a foe lowers its stats, and on entry on Desert, Fairy Tale, Cave, Crystal Cavern, New World or Volcanic. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. Heals 1/16 max HP each turn. On fainting, creates Dragon's Den for 5 turns.",
		"shortDesc": "Summons sand; Rock/critical-hit protection; 20% less damage; fallen allies boost power; heals each turn."
	},
	"snowwarning": {
		"desc": "On entry, it summons Snow.",
		"shortDesc": "On entry, it summons Snow."
	},
	"auroradomain": {
		"desc": "Summons hail on entry. Damaging attacks disable their user on Cold Eclipse, except Max moves, delayed attacks and Struggle; an existing Disable is not replaced. Prevents critical hits and takes 20% less attack damage. Its Rock typing adds no Fighting, Ground, Steel, Water or Grass weakness. Immune to sandstorm and hail damage. Gains +1 Defense and Sp. Def when a foe lowers its stats, and on entry on Desert, Fairy Tale, Cave, Crystal Cavern, New World or Volcanic. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Heals 1/16 max HP each turn. On fainting, creates Fairy Tale and sets or refreshes its side's Aurora Veil for 5 turns. Does not set Aurora Veil on entry.",
		"shortDesc": "Summons hail; Rock/critical-hit protection; 20% less damage; stronger Ice moves; field and Veil on fainting."
	},
	"prismscale": {
		"desc": "Marvel Scale boosts Defense while statused or on supported fields. Oblivious blocks Attract, Captivate, Taunt, and Intimidate's Attack drop. Swift Swim boosts Speed in rain and supported water fields.",
		"shortDesc": "Marvel Scale boosts Defense while statused or on supported fields. Oblivious blocks Attract, Captivate, Taunt, and Intimidate's Attack drop."
	},
	"royalscales": {
		"desc": "Marvel Scale boosts Defense while statused or on supported fields. Oblivious blocks Attract, Captivate, Taunt, and Intimidate's Attack drop. Swift Swim boosts Speed in rain and supported water fields. Its Normal-type moves become Dragon-type moves and have their power multiplied by 1.2. It gains STAB on Dragon-type moves. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
		"shortDesc": "Normal moves become Dragon type; Dragon STAB; converted moves 1.2x; Heals 1/16 HP each turn; immune to sandstorm and hail damage — heals 1/16 each turn; immune to Sandstorm and Hail."
	},
	"relicmishap": {
		"desc": "It takes 0.9x damage from attacks and has Self Sufficient, Water Absorb, and Volt Absorb. It restores 1/16 max HP each turn and is immune to Sandstorm and Hail damage. During Sandstorm, its Special Defense is multiplied by 1.5. During Hail or Snow, its Defense is multiplied by 1.5.",
		"shortDesc": "0.9x damage; Water/Volt Absorb; Sand +SpD; Hail/Snow +Def."
	},
	"windysurge": {
		"desc": "On entry, it sets Tailwind on its side for 2 turns.",
		"shortDesc": "On entry, sets 2-turn Tailwind on its side."
	},
	"flamebody": {
		"desc": "Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact.",
		"shortDesc": "30% contact burn (60% Volcanic); Cold Eclipse gives defenses instead."
	},
	"falsedevotion": {
		"desc": "Status moves gain +1 priority. Doubles move secondary-effect chances. Switching out cures major status and heals 1/3 max HP, plus another 1/3 if a status was cured.",
		"shortDesc": "+1 status priority; double secondary-effect chances; switching cures status and heals HP."
	},
	"truedevotion": {
		"desc": "Status moves gain +1 priority. Doubles move secondary-effect chances. Switching out cures major status and heals 1/3 max HP, plus another 1/3 if a status was cured. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field.",
		"shortDesc": "Status priority; stronger weak moves and secondary chances; switching cures status and heals."
	},
	"pollenbloom": {
		"desc": "Same-type moves have 1.3x power. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip.",
		"shortDesc": "Same-type moves have 1.3x power; Half Fire/Ice attacking stats; immune to hail damage; Ignores opposing combat/accuracy stages; reveals Illusions — healing Grass chip scales by type in FFA."
	},
	"ancientbloom": {
		"desc": "Damaging hits have separate 10% chances to inflict sleep, paralysis or poison on the attacker; powder immunity blocks this. If Sleep Clause blocks sleep, a further roll can inflict paralysis or poison instead. Same-type moves have 1.3x power. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip.",
		"shortDesc": "Damaging attackers may sleep, be paralyzed or poisoned; Same-type moves have 1.3x power; Half Fire/Ice attacking stats; immune to hail damage; Ignores opposing combat/accuracy stages; reveals Illusions; field boosts."
	},
	"firemane": {
		"desc": "Its Fire-type attacks have 1.5x power.",
		"shortDesc": "Its Fire-type attacks have 1.5x power."
	},
	"blazingmane": {
		"desc": "Fire attacks have 1.5x power and damaging moves hit twice, with the second hit at 30% power. At half HP or less, Fire attacks gain +1 priority. Burning and Volcanic Fields raise its Speed by 1 on entry or when the field starts.",
		"shortDesc": "Fire 1.5x; second hit 30%; half-HP Fire +1 priority; fire fields +1 Spe."
	},
	"plasmaeruption": {
		"desc": "Proficient boosts same-type attacks by 1.3x. Contact attackers have Static's chance to be paralyzed and Flame Body's chance to be burned. Fire moves may become Electric, and Electric moves may become Fire (50% chance each), unless the new type would make the target immune. After Burn Up removes Fire typing, Fire moves always become Electric; after Double Shock removes Electric typing, Electric moves always become Fire. Burn Up and Double Shock themselves keep their original type.",
		"shortDesc": "Fire may turn Electric or vice versa (50%). Type loss forces it unless immune."
	},
	"fortressshell": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Same-type moves have 1.3x power. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP. Water immunities block it; type effectiveness scales it only in Free-for-All. Allies' moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields. Allies take 25% less attack damage; this does not protect the holder. Heals 1/16 max HP each turn. On Electric Terrain, Murkwater Surface, Water Surface, Underwater, Midnight Zone, Factory and Short-Circuit, redirects and absorbs Electric moves for +1 Attack and Sp. Atk. Fairy Tale, New World, Cold Eclipse and Starlight Arena give +1 Defense and Sp. Def once per active terrain. New World, Cold Eclipse and Starlight Arena also give 1.5x move power.",
		"shortDesc": "Critical-hit protection; 20% less damage; paired moves and Water chip; ally support; field Electric absorption."
	},
	"waterbarrage": {
		"desc": "Same-type moves have 1.3x power. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP. Water immunities block it; type effectiveness scales it only in Free-for-All.",
		"shortDesc": "1.3x same-type power; eligible moves hit twice; cycling 1/16–3/16 Water damage to foes each turn."
	},
	"livinglegend": {
		"desc": "Absorbs Fire moves and gains a 1.5x Fire boost until switching out or losing the ability. Burning Field or grounded Volcanic Field also grants the boost. On Cold Eclipse, Fire absorption is disabled and entry gives +1 Defense and Sp. Def. On entry, compares foes' combined Defense and Sp. Def: gains +1 Attack if Defense is lower, otherwise +1 Sp. Atk; Factory grants +2 instead. Short-Circuit grants +1 to both. Glitch grants +1 to both; Genesect holding a Drive gains another +1 to both and changes ability according to its Drive. Its attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Anger Shell, Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating. Extreme Speed has 1.5x power and +2 critical-hit stages.",
		"shortDesc": "Absorbs Fire; entry boosts an attacking stat; stronger moves without secondary effects; stronger Extreme Speed."
	},
	"flashfire": {
		"desc": "Absorbs Fire moves and gains a 1.5x Fire boost until switching out or losing the ability. Burning Field or grounded Volcanic Field also grants the boost. On Cold Eclipse, Fire absorption is disabled and entry gives +1 Defense and Sp. Def.",
		"shortDesc": "Absorbs Fire for a 1.5x Fire boost; Cold Eclipse gives defenses instead."
	},
	"fluffy": {
		"desc": "Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage.",
		"shortDesc": "Half contact damage; double Fire damage."
	},
	"holycow": {
		"desc": "On its first entry each battle, it attempts to create Holy Field for 5 turns; it cannot refresh an existing Holy Field or bypass a protected field. Once per actual entry, Milk Drink that restores HP also cures its status. Ability changes do not reset this cure.",
		"shortDesc": "First entry: Holy Field for 5 turns. Once per entry, healing Milk Drink cures status."
	},
	"dreepyvanguard": {
		"desc": "Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Once per entry, the first Dragon Darts dealing opposing HP damage removes Reflect if Physical or Light Screen if Special from each opposing side it damaged, after both darts finish. Uses Dragon Darts' actual higher-offense category. Ability changes do not refresh this effect.",
		"shortDesc": "Stalwart. Once per entry, Dragon Darts damage breaks the matching screen."
	},
	"templechime": {
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Once per entry, Heal Bell actually curing at least one status also resets only the user's negative Special Defense stages. No additional healing.",
		"shortDesc": "Airborne; move KOs boost highest stat; once per entry, Heal Bell curing status clears negative Sp. Def."
	},
	"soothingpresence": {
		"desc": "Allies take 25% less attack damage; this does not protect the holder. Protects itself and allies from Attract, Disable, Encore, Heal Block, Taunt and Torment. Other allies take 25% less attack damage; this does not reduce the holder's damage taken. The holder and its allies are protected from Attract, Disable, Encore, Heal Block, Taunt, and Torment.",
		"shortDesc": "Allies take 25% less attack damage; Team protection from attraction and move restrictions — Other allies take 25% less attack damage. Holder and allies have Aroma Veil protection."
	},
	"friendguard": {
		"desc": "Allies take 25% less attack damage; this does not protect the holder.",
		"shortDesc": "Allies take 25% less attack damage."
	},
	"verdanthospitality": {
		"desc": "Same-type moves have 1.3x power. Allies take 25% less attack damage. On entry, heals active allies by 1/8 max HP. At turn end, heals itself by 1/8 max HP and active allies by 1/16.",
		"shortDesc": "1.3x same-type power; allies take 25% less damage; entry and end-turn healing."
	},
	"verdantsanctuary": {
		"desc": "On entry, sets Grassy Terrain and heals each adjacent ally by 1/4 max HP. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status. Allies also take 3/4 damage from attacks.",
		"shortDesc": "On entry, sets Grassy Terrain and heals each adjacent ally by 1/4 max HP. Healing received by it and its allies is multiplied by 1.3."
	},
	"echosense": {
		"desc": "It is immune to sound moves, and this immunity cannot be suppressed. Its sound moves become Flying type and have 1.5x power. Its side is immune to its own damaging sound-based moves. On entry, reveals all opposing active Illusions and held items. Each item holder independently has a 30% chance to be Embargoed for 5 turns. Avoids allied damaging moves. Speed doubles on Psychic Terrain or Psychic Aura. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist.",
		"shortDesc": "Unsuppressible sound immunity; sound -> Flying 1.5x; allies avoid own sound damage; Reveals foe Illusions/items; 30% chance of 5-turn Embargo; Avoids allied attacks; double Speed on Psychic field/aura."
	},
	"frisk": {
		"desc": "On entry, reveals all opposing active Illusions and held items. Each item holder independently has a 30% chance to be Embargoed for 5 turns.",
		"shortDesc": "Reveals foe Illusions/items; 30% chance of 5-turn Embargo."
	},
	"furcoat": {
		"desc": "Doubles Defense.",
		"shortDesc": "Doubles Defense."
	},
	"galewings": {
		"desc": "If it is at full HP, its Flying-type moves have their priority increased by 1.",
		"shortDesc": "If it is at full HP, its Flying-type moves have their priority increased by 1."
	},
	"wingedwraith": {
		"desc": "Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. If it is at full HP, its Flying-type moves have their priority increased by 1.",
		"shortDesc": "Moves bypass Substitute and opposing screens; If it is at full HP, its Flying-type moves have their priority increased by 1."
	},
	"galvanize": {
		"desc": "Eligible Normal moves become Electric and have 1.2x power, 1.5x on Factory or Electric Terrain, or 2x on Short-Circuit. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast.",
		"shortDesc": "Normal moves become Electric with 1.2x power; field boosts."
	},
	"gluttony": {
		"desc": "Berries normally eaten at 1/4 HP activate at 1/2 HP instead.",
		"shortDesc": "Low-HP Berries activate at half HP."
	},
	"primaltactics": {
		"desc": "Its Special Attack is multiplied by 1.5, but it can only select the first move it executes. These effects are prevented while it is Dynamaxed.",
		"shortDesc": "Its Sp. Atk is 1.5x, but it can only select the first move it executes."
	},
	"grasspelt": {
		"desc": "Defense is 1.5x on Grassy and Forest fields. On Corrosive, loses 1/8 max HP each turn unless Poison- or Steel-type.",
		"shortDesc": "1.5x Defense on Grassy/Forest; Corrosive damages non-Poison/Steel."
	},
	"grassysurge": {
		"desc": "On entry, creates Grassy Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
		"shortDesc": "Creates Grassy Terrain on entry."
	},
	"guarddog": {
		"desc": "Cannot be forced out by opposing moves or items. Intimidate raises Attack by 1 instead of lowering it.",
		"shortDesc": "Blocks forced switching; Intimidate gives +1 Attack."
	},
	"guts": {
		"desc": "Attack is 1.5x while statused, and burn does not weaken physical attacks.",
		"shortDesc": "1.5x Attack while statused; ignores burn attack penalty."
	},
	"harvest": {
		"desc": "At turn end with an empty item slot, has a 50% chance to restore its last consumed Berry or field seed. Guaranteed in sun or on Grassy Field and Stage 2 Flower Garden.",
		"shortDesc": "50% chance to restore a consumed Berry/seed each turn."
	},
	"swornduty": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale.",
		"shortDesc": "Entry heals adjacent allies by 1/4 HP (1/3 on Fairy Tale)."
	},
	"heatproof": {
		"desc": "Incoming Fire attacks use half the attacker's offensive stat. Burn damage is halved.",
		"shortDesc": "Half Fire attacking stats and burn damage."
	},
	"heavymetal": {
		"desc": "Doubles weight and halves physical attack damage. Factory entry gives +1 Defense and -1 Speed.",
		"shortDesc": "Double weight; half physical damage; Factory stat changes."
	},
	"hyperdrill": {
		"desc": "Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Rock moves have 1.5x power.",
		"shortDesc": "Stronger drill/horn moves; eligible moves hit twice; 1.5x Rock power."
	},
	"hospitality": {
		"desc": "On entry, heals each adjacent ally by 1/4 of that ally's max HP.",
		"shortDesc": "Entry heals adjacent allies by 1/4 HP."
	},
	"hugepower": {
		"desc": "Doubles Attack.",
		"shortDesc": "Doubles Attack."
	},
	"hustle": {
		"desc": "Attack is 1.5x, but physical moves have 0.8x accuracy.",
		"shortDesc": "1.5x Attack; 0.8x physical accuracy."
	},
	"hydraheart": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Opposing HP hits heal 1/16; +1 Defense once per turn."
	},
	"sweetresonance": {
		"desc": "On entry, it lowers the evasiveness of adjacent opposing Pokemon by 1 stage every time it switches in. Other Pokemon cannot remove its held item. When it is hit by an attack, the attacker is Embargoed for 5 turns. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. On entry, gives the first adjacent ally Dragon Cheer. Flower Garden entry also lowers foes' Defense and Sp. Def at stage 3+, Attack and Sp. Atk at stage 4+, and Speed and accuracy at stage 5, all by 1; Substitute blocks these entry drops. Misty Terrain entry lowers its own accuracy by 1.",
		"shortDesc": "Lowers foe evasion; protects item; attackers receive Embargo; heals; three-hit moves; ally Dragon Cheer."
	},
	"phantombarrage": {
		"desc": "Other Pokemon cannot lower its stat stages. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Dragon Darts and G-Max Spirit Volley use its higher offensive stat and gain 20% power from Hydra Bond instead of extra hits. Dragon Darts keeps its two-hit pattern; Spirit Volley keeps its full-power hit and weaker follow-up against another foe. In Free-for-All battles, Dragon Darts hits all opposing Pokemon twice.",
		"shortDesc": "Airborne; blocks foe stat drops; bypasses screens/Substitute; extra hits, or 1.2x power for signature moves."
	},
	"astralcore": {
		"desc": "Doubles Attack, or Sp. Atk instead on Psychic Terrain. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally.",
		"shortDesc": "Doubles Attack; Psychic Terrain doubles Sp. Atk instead; Switching cures status and heals 1/3 HP if cured; Woods cures status each turn; No opposing accuracy drops; ignores evasion; reveals Illusions."
	},
	"divinemockery": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Moves ignore bypassable opposing abilities. It gains 1 Accuracy on entry. Its critical hits deal 2.25x damage instead of 1.5x. Eligible attacks gain Hydra Bond's extra hits and ignore opposing Abilities. It gains +1 accuracy on entry and its critical hits deal more damage. Water attacks receive STAB even without Water typing.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Moves ignore bypassable abilities; +1 Accuracy on entry; critical hits deal 2.25x damage — Water STAB."
	},
	"truehydra": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Heals 1/3 max HP on switching out. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Eligible damaging moves hit three times, with the second and third hits at 30% damage. It heals 1/3 of its max HP on switching out, may shed status and other ailments at the end of a turn, heals 1/16 of its max HP each turn, and is immune to Sandstorm and Hail damage.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Heals 1/3 HP on switching out; 50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect; Heals 1/16 HP each turn."
	},
	"desertspirit": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Resisted attacks deal double damage. It is airborne, summons sandstorm on entry, and deals double damage with resisted attacks. Its Ground-type attacks receive STAB even though it is not Ground-type.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded; Summons sandstorm on entry; Resisted attacks deal double damage — Ground moves get STAB."
	},
	"desertshell": {
		"desc": "Multi-hit moves always use their maximum hit count and have 1.5x power. Moves that normally check accuracy per hit check only once. Incoming Fire attacks use half the attacker's offensive stat. Burn damage is halved. On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Multi-hit moves always hit the maximum number of times and have 1.5x power. Damage from Fire-type moves and burns is halved. Summons sandstorm on entry.",
		"shortDesc": "Maximum multi-hit count; 1.5x multi-hit power; Half Fire attacking stats and burn damage; Summons sandstorm on entry."
	},
	"hydratyrant": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. When an attack takes it from above half HP to half or less, gains +1 Attack and Sp. Atk after the move. Dragon's Den entry gives +2 Attack and Sp. Atk. Once per battle, after Draco Meteor applies its Sp. Atk drops, restores all negative stat stages to zero after the entire attack finishes. Positive stages remain. No Self Sufficient healing or immunity.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Crossing half HP from an attack gives +1 Attack/Sp. Atk — once per battle, Draco Meteor clears its negative stat stages."
	},
	"orchardbond": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. At turn end with an empty item slot, has a 50% chance to restore its last consumed Berry or field seed. Guaranteed in sun or on Grassy Field and Stage 2 Flower Garden.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; 50% chance to restore a consumed Berry/seed each turn."
	},
	"hydration": {
		"desc": "Cures major status at turn end in effective rain or on Water Surface, Underwater and Midnight Zone.",
		"shortDesc": "Cures status each turn in rain or water fields."
	},
	"hypercutter": {
		"desc": "Other Pokemon cannot lower its Attack.",
		"shortDesc": "Other Pokemon cannot lower its Attack."
	},
	"icebody": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage.",
		"shortDesc": "30% contact frostbite; heals in icy weather/fields; no hail damage."
	},
	"icescales": {
		"desc": "Takes half damage from special attacks and is immune to hail damage. Mirror Arena entry gives +2 evasion. Icy and Snowy Mountain neutralize weaknesses from its Ice typing. Cold Eclipse doubles Defense.",
		"shortDesc": "Half special damage; no hail damage; icy-field defenses."
	},
	"illuminate": {
		"desc": "Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally.",
		"shortDesc": "No opposing accuracy drops; ignores evasion; reveals Illusions."
	},
	"infiltrator": {
		"desc": "Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist.",
		"shortDesc": "Moves bypass Substitute and opposing screens."
	},
	"burningcrown": {
		"desc": "On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Other Pokemon cannot lower its stat stages. Gains +1 Attack and Sp. Atk on Volcanic entry. Moves ignore bypassable opposing abilities. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Same-type moves have 1.3x power. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Takes 20% less attack damage. Moves have a further 1.5x power on New World, Cold Eclipse and Starlight Arena. Faints grant no stat boosts.",
		"shortDesc": "Lowers foe Attack; prevents foe stat drops; stronger Dragon moves; heals each turn; 20% less attack damage."
	},
	"innerfocus": {
		"desc": "Prevents flinching and Intimidate's Attack drop.",
		"shortDesc": "Cannot flinch; blocks Intimidate."
	},
	"insomnia": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power.",
		"shortDesc": "No sleep or Yawn; 1.3x Dark/Ghost power."
	},
	"frightfulwings": {
		"desc": "It has Intimidate: on entry, it lowers adjacent opponents' Attack by 1 stage, respecting Intimidate's normal protections. Its Water-type attacks receive at least a 1.5x same-type attack bonus, even if it is not Water-type. This does not stack with existing Water STAB or reduce a stronger STAB bonus.",
		"shortDesc": "Water attacks receive at least 1.5x STAB without stacking."
	},
	"intimidate": {
		"desc": "On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
		"shortDesc": "Entry lowers adjacent foes' Attack by 1."
	},
	"inversion": {
		"desc": "On entry, it sets Inverse Field. Stat changes it receives are inverted, except those from Z-Power effects.",
		"shortDesc": "Sets Inverse Field and inverts its stat changes."
	},
	"ironbarbs": {
		"desc": "Contact attackers lose 1/8 of their max HP.",
		"shortDesc": "Contact attackers lose 1/8 HP."
	},
	"armorize": {
		"desc": "Its Normal-type moves become Steel-type moves and have their power multiplied by 1.2.",
		"shortDesc": "Normal moves become Steel type and have 1.2x power."
	},
	"argentdevotion": {
		"desc": "Eligible Normal moves become Steel with 1.2x power, or 1.5x on Factory, Short-Circuit, Fairy Tale, Dragon's Den, Starlight Arena, New World and Holy Field. Immune to hail damage on Cold Eclipse. On entry, heals each adjacent ally by 1/4 max HP, or 1/3 on Fairy Tale. Doubles move secondary-effect chances and removes charging turns. Moves ignore bypassable opposing abilities.",
		"shortDesc": "Normal moves become Steel; entry heals allies; doubled secondary chances; moves ignore abilities."
	},
	"ironfist": {
		"desc": "Punching moves have 1.4x power.",
		"shortDesc": "Punches have 1.4x power."
	},
	"knightsguard": {
		"desc": "Once per switch-in in doubles, redirects the first single-target damaging attack aimed at an adjacent ally to it. It takes 25% less damage from that attack and, if it survives a hit, gains one Attack stage. Spread moves and status moves are not redirected.",
		"shortDesc": "Once per switch-in, intercepts an ally-targeted attack; takes 25% less and gains +1 Atk if hit."
	},
	"lancepoint": {
		"desc": "Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus. Drill moves gain one critical-hit stage and do not make contact. Critical-hit prevention still applies. Does not include Sniper.",
		"shortDesc": "Accuracy protection; drill moves gain +1 critical-hit stage and make no contact."
	},
	"keeneye": {
		"desc": "Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus.",
		"shortDesc": "No opposing accuracy drops; ignores evasion; reveals Illusions."
	},
	"levitate": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded."
	},
	"libero": {
		"desc": "Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply.",
		"shortDesc": "Changes type to match each eligible move."
	},
	"lightmetal": {
		"desc": "Halves weight. Speed is 1.25x while free of major status. Factory entry gives +1 Speed.",
		"shortDesc": "Half weight; 1.25x Speed without status; Factory entry +1 Speed."
	},
	"lightningrod": {
		"desc": "Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts.",
		"shortDesc": "Redirects/absorbs Electric for +1 Attack and Sp. Atk."
	},
	"limber": {
		"desc": "Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind.",
		"shortDesc": "No paralysis or opposing/field Speed reductions."
	},
	"liquidooze": {
		"desc": "Draining moves, Leech Seed and Strength Sap damage their user by the HP they would restore. This damage doubles on Murkwater Surface and Wasteland.",
		"shortDesc": "Drain, Leech Seed and Strength Sap hurt their user."
	},
	"liquidvoice": {
		"desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power.",
		"shortDesc": "Sound moves: Water (Ice on Icy Field), 1.2x power."
	},
	"magicbounce": {
		"desc": "Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again. Fairy Tale entry gives +1 Sp. Def; Mirror Arena entry gives +1 evasion. On Mirror Arena, reflecting a directly targeted move also gives its original user +1 evasion.",
		"shortDesc": "Reflects eligible status moves and hazards; field entry boosts."
	},
	"lunarorbit": {
		"desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Doubles move secondary-effect chances and removes charging turns. Healing moves and Aromatherapy, Heal Bell, Jungle Healing, Purify and Refresh gain +3 priority. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. On entry or Mega Evolution, sets Gravity for 5 turns. Water Surface sinks to Underwater, Underwater to Midnight Zone, and Corrosive Mist to Corrosive, except on New World.",
		"shortDesc": "Reflects status moves; stronger secondary chances; healing priority; no indirect damage; sets Gravity."
	},
	"magicguard": {
		"desc": "Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def.",
		"shortDesc": "Prevents indirect damage; Fairy Tale entry gives +1 Sp. Def."
	},
	"magmaarmor": {
		"desc": "Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def.",
		"shortDesc": "Halves Water/Ice attacking stats; prevents freeze; field defenses."
	},
	"marvelscale": {
		"desc": "Defense is 1.5x while statused or on Misty, Rainbow, Fairy Tale, Dragon's Den and Starlight Arena.",
		"shortDesc": "1.5x Defense while statused or on specified fields."
	},
	"anchoredbattery": {
		"desc": "Pulse and bullet moves have 1.5x power. Cannot be forced to switch out; voluntary switching remains allowed.",
		"shortDesc": "1.5x pulse/bullet power; cannot be forced to switch."
	},
	"megalauncher": {
		"desc": "Pulse and bullet moves have 1.5x power.",
		"shortDesc": "Pulse/bullet moves have 1.5x power."
	},
	"heavyartillery": {
		"desc": "When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Damaging pulse and bullet moves have double power and hit all foes in Doubles and Free-for-All. In Free-for-All, the designated primary target takes full damage and other foes take half their otherwise-calculated damage; protection or immunity of the primary does not promote another target. If no valid primary is supplied, the first active foe in side order is selected. Defense and Special Defense fall by 1 after firing.",
		"shortDesc": "Ignores foe stat changes; armor protection; double-power pulse/bullet moves hit all foes; defenses fall."
	},
	"megasol": {
		"desc": "Its moves are used as if the effects of Sunny Day were active.",
		"shortDesc": "Its moves are used as if the effects of Sunny Day were active."
	},
	"bloomingsun": {
		"desc": "Its moves are used as if the effects of Sunny Day were active. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal.",
		"shortDesc": "Its moves are used as if the effects of Sunny Day were active; User/allies receive 1.3x healing; 50% to cure ally status each turn; Switching cures status and heals 1/3 HP if cured; Woods cures status each turn."
	},
	"merciless": {
		"desc": "Attacks always critically hit poisoned targets and on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three.",
		"shortDesc": "Critical hits against poisoned foes or on corrosive fields."
	},
	"mirrorarmor": {
		"desc": "When another Pokemon would lower its stat stages, those stat drops are reflected onto that Pokemon instead. It also takes 20% less damage from attacks.",
		"shortDesc": "Reflects opposing stat drops; takes 0.8x damage from attacks."
	},
	"stormbell": {
		"desc": "When another Pokemon would lower its stat stages, those stat drops are reflected onto that Pokemon instead. It also takes 20% less damage from attacks. On entry, summons rain for 5 turns, or 8 with Damp Rock. Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Starts rain, reflects opposing stat drops, reduces attack damage by 20%, is airborne, and boosts its best stat after a move KO. Retains Mirror Armor field effects, including +1 Defense and Sp. Def on Fairy Tale entry.",
		"shortDesc": "Reflects opposing stat drops; takes 0.8x damage from attacks; Summons rain on entry; Airborne; move KOs raise its highest stat."
	},
	"mistysurge": {
		"desc": "On entry, creates Misty Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
		"shortDesc": "Creates Misty Terrain on entry."
	},
	"moldbreaker": {
		"desc": "Moves ignore bypassable opposing abilities.",
		"shortDesc": "Moves ignore bypassable abilities."
	},
	"moxie": {
		"desc": "Gains +1 Attack for each Pokemon knocked out by its move.",
		"shortDesc": "Move KOs give +1 Attack."
	},
	"requiem": {
		"desc": "Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. Its first direct damaging interaction with each opposing Pokemon applies Perish Song to that foe. The mark clears when the foe switches out. Whenever an opposing Pokemon faints, it restores 1/4 max HP. When it faints, it creates Haunted Field for 5 turns. This Ability cannot be suppressed.",
		"shortDesc": "Attacks may be disabled; first damage interaction marks foes with Perish Song; foe KOs heal 1/4 HP."
	},
	"reapersgrip": {
		"desc": "When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. All Dark attacks have 4/3x power, or 0.75x with Aura Break. The first damaging hit leaving it at half HP or less creates Haunted Field for 3 turns, or extends a shorter Haunted Field to 3. On fainting, creates Haunted for 5 turns or adds 5 turns to an existing Haunted Field.",
		"shortDesc": "Ignores opposing combat boosts; heals 1/16 HP; boosts all Dark moves; creates Haunted at half HP and on faint."
	},
	"moonlitwings": {
		"desc": "It has Serene Grace and gains STAB on Fairy-type moves.",
		"shortDesc": "Serene Grace + Fairy STAB."
	},
	"terastaladaptability": {
		"desc": "Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. This STAB increase applies only to Rock and Poison moves. Off-type damaging moves have 1.5x power. After any move, takes half damage from types resisted by that move's type until it uses another move.",
		"shortDesc": "Stronger Rock/Poison STAB; 1.5x off-type power; gains last move type's resistances."
	},
	"frozenfortress": {
		"desc": "Prevents critical hits. Heals 1/16 max HP each turn in hail or snow, or 1/8 in hail on Cold Eclipse. Physical HP hits set Stealth Rock on the attacker's side if absent, except on Water Surface, Underwater, Murkwater Surface and Swamp; allied attacks use the opposing side.",
		"shortDesc": "No critical hits; heals in hail/snow; physical hits set Stealth Rock outside water fields."
	},
	"paradoxwheel": {
		"desc": "It gains STAB on Steel- and Electric-type moves.",
		"shortDesc": "Gains Steel/Electric STAB."
	},
	"paradoxpower": {
		"desc": "Its attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Anger Shell, Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating. Electric moves receive STAB.",
		"shortDesc": "Moves lose secondary effects for 1.3x power; Electric moves receive STAB."
	},
	"paradoxpull": {
		"desc": "Prevents opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell or are a Ghost type. Its Steel typing only contributes resistances and immunities, not weaknesses.",
		"shortDesc": "Prevents opposing Steel-type Pokemon from choosing to switch out — ignores Steel weaknesses."
	},
	"multiscale": {
		"desc": "Takes half attack damage at full HP.",
		"shortDesc": "Half attack damage at full HP."
	},
	"naturalcure": {
		"desc": "Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal.",
		"shortDesc": "Switching cures status and heals 1/3 HP if cured; Woods cures status each turn."
	},
	"neutralization": {
		"desc": "Once per target per move, when it directly hits an opposing Pokemon, the target's higher attacking stat is lowered by 1 stage. Spread hits do not trigger this effect. This does not affect other Neutralization users or Pokemon immune to stat drops. While active, base field changes are neutralized, but Auras can still be created and remain active; Trick Room, Magic Room, and Wonder Room are ended and cannot start; and Rainbow Field ends automatically. It also suppresses Royal Decree's stat reset, screen removal, and ongoing restrictions, including those granted by Empress and Royal Sun. Ice Spinner and Steel Roller still remove terrain normally.",
		"shortDesc": "Hits lower the foe's higher offensive stat by 1; blocks base field changes, not Auras."
	},
	"noguard": {
		"desc": "Moves used by or against it always hit, including during semi-invulnerable turns.",
		"shortDesc": "Moves used by or against it always hit."
	},
	"oblivious": {
		"desc": "Prevents and cures attraction and Taunt. Blocks Captivate and Intimidate's Attack drop.",
		"shortDesc": "No attraction/Taunt, Captivate or Intimidate Attack drop."
	},
	"opportunist": {
		"desc": "Copies foes' positive stat changes after their move, entry or transformation, and at turn end. Copied changes do not loop between users.",
		"shortDesc": "Copies foes' stat boosts."
	},
	"overcoat": {
		"desc": "Immune to powder moves, Rage Powder, Effect Spore, sandstorm damage and hail damage.",
		"shortDesc": "Immune to powder effects, sandstorm and hail damage."
	},
	"owntempo": {
		"desc": "Prevents and cures confusion and blocks Intimidate's Attack drop.",
		"shortDesc": "No confusion or Intimidate Attack drop."
	},
	"piercingdrill": {
		"desc": "Moves ignore bypassable abilities. Contact moves pierce protection at 1/4 damage. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection.",
		"shortDesc": "Ignores abilities; contact pierces protection at 1/4 damage; stronger drill/horn moves."
	},
	"pixilate": {
		"desc": "Eligible Normal moves become Fairy and have 1.2x power, or 1.5x on Misty Terrain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast.",
		"shortDesc": "Normal moves become Fairy with 1.2x power; Misty boost."
	},
	"poisonheal": {
		"desc": "Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland.",
		"shortDesc": "Poison heals 1/8 HP; healing on corrosive fields."
	},
	"poisonpoint": {
		"desc": "Contact attackers have a 30% poison chance, or 60% on Wasteland.",
		"shortDesc": "30% contact poison; 60% on Wasteland."
	},
	"poisontouch": {
		"desc": "Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect.",
		"shortDesc": "Contact hits have a 30% poison chance."
	},
	"powerdrill": {
		"desc": "Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection.",
		"shortDesc": "Drill/horn moves have 1.5x power; 2x and pierce protection on rocky fields."
	},
	"powerspot": {
		"desc": "Allies' moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields.",
		"shortDesc": "Allies' moves have 1.3x power (1.5x on specified fields)."
	},
	"prankster": {
		"desc": "Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods.",
		"shortDesc": "Status moves gain +1 priority; Dark foes usually block them."
	},
	"predator": {
		"desc": "Stat changes it receives are inverted, except those from Z-Power effects. If the target has not moved yet or just switched in, its attacks deal 1.3x damage. Attacks deal 2x damage to targets with Neutralization or Royal Decree.",
		"shortDesc": "Has Contrary; boosts attacks into slower/new targets; 2x into authority abilities."
	},
	"royalarmament": {
		"desc": "Steel moves receive STAB. Drill and horn moves have 1.5x power, or 2x on Rocky, Mountain, Snowy Mountain, Cave and Volcanic, where they also bypass protection.",
		"shortDesc": "Steel STAB; drill/horn moves have 1.5x power, or 2x and protection bypass on rocky fields."
	},
	"pressure": {
		"desc": "On entry, lowers foes' Defense and Sp. Def by 1 (2 on Cold Eclipse) and changes Underwater to Midnight Zone. Foes targeting it spend 1 extra PP, or 2 on Midnight Zone.",
		"shortDesc": "Entry lowers foe defenses; opposing moves spend extra PP."
	},
	"prismarmor": {
		"desc": "Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Immune to hail damage on Cold Eclipse.",
		"shortDesc": "20% less attack damage; 40% less if super effective; field defenses."
	},
	"whiplash": {
		"desc": "On entry, it gains +1 accuracy. Its Tail moves have their power multiplied by 1.5.",
		"shortDesc": "On entry: +1 accuracy. Tail moves have 1.5x power."
	},
	"ironwill": {
		"desc": "Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. The first otherwise lethal attack has a 50% chance to leave it at 1 HP. This Ability rolls only once per battle, even if the roll fails or it switches out. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage. Gains +1 accuracy on entry; tail moves have 1.5x power.",
		"shortDesc": "20%/40% less attack damage; one survival roll; heals each turn; +1 accuracy; 1.5x tail power."
	},
	"proficient": {
		"desc": "Same-type moves have 1.3x power.",
		"shortDesc": "Same-type moves have 1.3x power."
	},
	"propellertail": {
		"desc": "Moves cannot be redirected. Speed doubles on Water Surface, Underwater and Midnight Zone.",
		"shortDesc": "Ignores redirection; double Speed on water fields."
	},
	"breakwater": {
		"desc": "Full Propeller Tail: moves cannot be redirected and Speed doubles on Water Surface, Underwater and Midnight Zone. Once per switch-in, a directly selected non-pivot physical Water move that deals opposing HP damage clears entry hazards from its side. Flip Turn, substitutes, misses, protection, called and future attacks do not trigger it. The allowance is spent only when hazards are cleared.",
		"shortDesc": "Ignores redirection; water-field Speed boost; first qualifying physical Water hit clears own hazards."
	},
	"protean": {
		"desc": "Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply.",
		"shortDesc": "Changes type to match each eligible move."
	},
	"zprotean": {
		"desc": "Before each attack other than Struggle, it changes to the move's type and gains STAB. If it is Eevee-Starter, its battle sprite shifts to the matching Eeveelution until it leaves battle.",
		"shortDesc": "Before each attack, changes type and battle sprite to match its move."
	},
	"psychicsurge": {
		"desc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
		"shortDesc": "Creates Psychic Terrain on entry."
	},
	"punkrock": {
		"desc": "Sound moves have 1.3x power, or 1.5x on Big Top and Cave. Takes half damage from sound moves.",
		"shortDesc": "Boosts sound moves; takes half sound damage."
	},
	"purepower": {
		"desc": "Doubles Attack, or Sp. Atk instead on Psychic Terrain.",
		"shortDesc": "Doubles Attack; Psychic Terrain doubles Sp. Atk instead."
	},
	"queenlymajesty": {
		"desc": "Blocks opposing priority moves aimed at it or its allies. Attacks deal 1.5x damage on Fairy Tale, or on Chessboard unless it has the Queen role.",
		"shortDesc": "Blocks opposing priority; Fairy Tale/Chessboard attack bonus."
	},
	"quickfeet": {
		"desc": "Speed is 1.5x while statused, or 2x on Electric Terrain. Ignores paralysis's Speed penalty.",
		"shortDesc": "1.5x Speed while statused; 2x on Electric Terrain."
	},
	"raindish": {
		"desc": "Heals 1/16 max HP each turn in effective rain.",
		"shortDesc": "Heals 1/16 HP each turn in rain."
	},
	"reckless": {
		"desc": "Recoil and crash moves, Explosion, Self-Destruct and Misty Explosion have 1.2x power; Struggle is excluded. On Chessboard, all moves gain a further 1.2x power and incoming attacks gain one critical-hit stage.",
		"shortDesc": "Recoil/crash and explosion moves have 1.2x power."
	},
	"refrigerate": {
		"desc": "Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast.",
		"shortDesc": "Normal moves become Ice with 1.2x power; icy-field boost."
	},
	"regenerator": {
		"desc": "Heals 1/3 max HP on switching out.",
		"shortDesc": "Heals 1/3 HP on switching out."
	},
	"relentlesshunt": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Its moves with 60 or less Base Power gain +1 priority. In Fairy Tale, Big Top, Dragon's Den, Mountain, Snowy Mountain, or Cold Eclipse, its damaging moves deal 2x damage. In Desert, Rocky, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena, or New World, its damaging moves deal 1.5x damage.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded — moves <=60 BP gain +1 priority; boosted fields give 1.5x or 2x damage."
	},
	"rockhead": {
		"desc": "Prevents move recoil except Struggle. Crash and Life Orb damage still apply.",
		"shortDesc": "No move recoil except Struggle."
	},
	"roughskin": {
		"desc": "Contact attackers lose 1/8 of their max HP.",
		"shortDesc": "Contact attackers lose 1/8 HP."
	},
	"roughscale": {
		"desc": "Contact attackers lose 1/8 of their max HP. Contact moves have 1.3x power.",
		"shortDesc": "Contact attackers lose 1/8 HP; Contact moves have 1.3x power."
	},
	"sandforce": {
		"desc": "Rock, Ground and Steel moves have 1.3x power in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage.",
		"shortDesc": "1.3x Rock/Ground/Steel power in sand or sandy fields."
	},
	"sandrush": {
		"desc": "Doubles Speed in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage.",
		"shortDesc": "Double Speed in sand or sandy fields; no sand damage."
	},
	"solarrush": {
		"desc": "Doubles Speed in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage. Doubles Speed in sun or Stage 4 Flower Garden.",
		"shortDesc": "Double Speed in sand or sandy fields; no sand damage; Double Speed in sun or Stage 4 Flower Garden."
	},
	"sandstream": {
		"desc": "On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock.",
		"shortDesc": "Summons sandstorm on entry."
	},
	"safeharbor": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Cures major status at turn end in effective rain or on Water Surface, Underwater and Midnight Zone.",
		"shortDesc": "30% contact frostbite; heals in icy weather/fields; no hail damage; Absorbs Water for 1/4 HP; water-field healing; Cures status each turn in rain or water fields."
	},
	"seablessing": {
		"desc": "Its Defense and Special Defense are 1.5x. On entry, it and adjacent allies heal 1/4 max HP, and it gains Aqua Ring. It has Water Veil and Rain Dish.",
		"shortDesc": "1.5x Def/SpD; entry heals self/allies 1/4."
	},
	"sapsipper": {
		"desc": "Absorbs Grass moves for +1 Attack and Sp. Atk; allied Grass moves also grant both boosts. Heals 1/8 max HP each turn on Forest and 1/16 on Grassy Field.",
		"shortDesc": "Absorbs Grass for +1 Attack/Sp. Atk; grassy-field healing."
	},
	"serenegrace": {
		"desc": "Doubles move secondary-effect chances and removes charging turns.",
		"shortDesc": "Double secondary-effect chances; no charging turns."
	},
	"seasonalstride": {
		"desc": "Normal moves become its primary type and have 1.2x power. Kicking moves have 1.4x power. It has Chlorophyll and changes forme with weather: Spring in rain, Summer in sun, Autumn in sand, Winter in snow.",
		"shortDesc": "Normal -> primary type 1.2x; kicks 1.4x; weather forms."
	},
	"shadowshield": {
		"desc": "Takes 0.8x attack damage at any HP; super-effective attacks deal a further 0.75x damage (0.6x total). Ability-ignoring moves cannot bypass these reductions, but suppression disables them. Immune to hail damage on Cold Eclipse.",
		"shortDesc": "20% less attack damage at any HP; 40% less if super effective."
	},
	"voidcraft": {
		"desc": "Airborne. Takes 20% less attack damage at any HP, or 40% less from super-effective attacks. These reductions cannot be bypassed by ability-ignoring moves; its other protections can. Cannot sleep or be affected by Yawn, and foes cannot lower its stats. Dark and Ghost attacks have 1.3x power. Move KOs raise its highest stat by 1. Starting on Mega Evolution, queues a 120 BP Ghost Future Sight every other turn; each strikes two turns later. Immune to hail damage on Cold Eclipse. Ability suppression disables these effects.",
		"shortDesc": "Airborne; 20% less attack damage (40% if super effective); no sleep/stat drops; recurring Ghost Future Sight."
	},
	"hexbound": {
		"desc": "Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes. Once per switch-in, a directly selected damaging Ghost move that removes HP from a surviving opponent traps that opponent through the following turn. Later hits do not refresh the trap; it ends when it leaves. Ghost types, Shed Shell and normal pivot escapes still work. Misses, protection, substitutes, spread, called, future and residual damage do not trigger the trap. Cursed Body can disable incoming attacks (guaranteed on Haunted Field, disabled on Holy Field) and curses all foes when it faints. No Shadow Tag trapping, damage reduction or item reveal.",
		"shortDesc": "Status moves gain +1 priority; Dark foes usually block them; 30% chance to disable attacks; curses foes on faint — once per entry, a Ghost HP hit traps one foe through next turn."
	},
	"sharpness": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse.",
		"shortDesc": "Slicing moves have 1.5x power except on Cold Eclipse."
	},
	"blademastery": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Raises critical-hit rate by one stage. Below half HP, its slicing moves have +1 priority.",
		"shortDesc": "Slicing moves have 1.5x power except on Cold Eclipse; +1 critical-hit stage — below half HP, slicing moves gain +1 priority."
	},
	"goodasgold": {
		"desc": "It is immune to Status moves.",
		"shortDesc": "It is immune to Status moves."
	},
	"goldentalons": {
		"desc": "Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. It is immune to Status moves. Slicing moves have 1.5x power, except on Cold Eclipse.",
		"shortDesc": "Ignores redirection; +1 Sp. Atk on specified fields; It is immune to Status moves; Slicing moves have 1.5x power except on Cold Eclipse."
	},
	"silkendecoy": {
		"desc": "Mega Ariados spins a persistent cocoon, renewed when another Pokemon faints. It blocks status moves and status conditions while intact, and absorbs one damaging move including all its hits and secondary effects. Also has Insomnia, Self Sufficient, and Swarm.",
		"shortDesc": "Cocoon blocks a move, status and secondaries."
	},
	"cursedarmament": {
		"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks. Curse used by it becomes a 100 BP physical or special Ghost-type attack using its higher Attack or Special Attack, with 100% accuracy, that hits all adjacent foes and curses each target. Curse from it deals 1/8 max HP each turn. It restores 1/4 of the damage dealt by its attacks and by Curse damage it caused. When it reaches half HP or faints, it creates Haunted Field for 5 turns. Frisk breaks all opposing active Illusions on entry, reveals their held items, and independently has a 30% chance to Embargo each item holder for 5 turns.",
		"shortDesc": "20% less attack damage; 40% less if super effective — Curse becomes a 100 BP spread Ghost attack using the higher Attack or Sp. Atk; curses foes; heals 1/4 damage; half HP/faint sets Haunted Field."
	},
	"shedskin": {
		"desc": "At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1.",
		"shortDesc": "50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect."
	},
	"shellarmor": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Sp. Def."
	},
	"slowclamp": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Prevents and cures confusion and blocks Intimidate's Attack drop. Moves have 1.3x power if no other active Pokemon has a move left to use that turn. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Sp. Def; No confusion or Intimidate Attack drop; 1.3x power when no other active Pokemon has a move left; Prevents sleep and Yawn for itself and allies."
	},
	"shielddust": {
		"desc": "Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work.",
		"shortDesc": "Blocks incoming attack secondary effects."
	},
	"skilllink": {
		"desc": "Multi-hit moves always use their maximum hit count and have 1.5x power. Moves that normally check accuracy per hit check only once.",
		"shortDesc": "Maximum multi-hit count; 1.5x multi-hit power."
	},
	"slushrush": {
		"desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse.",
		"shortDesc": "Double Speed in hail, snow and icy fields."
	},
	"webassassin": {
		"desc": "Speed doubles and cannot be lowered. Critical hits deal 3x their usual critical-hit damage. Attacks have maximum critical-hit ratio against poisoned foes or foes with lowered Speed.",
		"shortDesc": "Double Speed; no Speed drops; tripled critical-hit damage; critical hits against poisoned or slowed foes."
	},
	"solarpower": {
		"desc": "In effective sun, Sp. Atk is 1.5x and it loses 1/8 max HP each turn. Cold Eclipse disables both effects.",
		"shortDesc": "Sun: 1.5x Sp. Atk, loses 1/8 HP per turn; disabled on Cold Eclipse."
	},
	"solarrecharge": {
		"desc": "Its Fire-type moves have STAB. It is immune to Fire-type moves and restores 1/4 of its max HP when hit by one. In Sun, it restores 1/8 of its max HP at turn end.",
		"shortDesc": "Fire STAB; Fire immunity heals 1/4; heals 1/8 each turn in Sun."
	},
	"solidrock": {
		"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks.",
		"shortDesc": "20% less attack damage; 40% less if super effective."
	},
	"sinisterblaze": {
		"desc": "This Ability cannot be suppressed, copied, or transferred. It is burned on entry, even through Misty Terrain, and its burn can overwrite other status conditions. In Fairy Tale, Starlight Arena, New World, Burning Field, Volcanic Field, Superheated Field, or Cold Eclipse, its Defense and Special Defense rise by 1 stage on entry. Its burn damage becomes healing; foes take 1/16 max HP each turn, or 1/8 if already burned. It does not heal from this generated damage, but heals from real burn damage dealt to foes. Its physical attacks are not weakened by burn. It is immune to hail and sandstorm damage and counts as Ice type in hail, snow, and ice fields, except for Abysseon and Divineon.",
		"shortDesc": "Burn heals user; foes take 1/16, or 1/8 if burned; no burn penalty; hail/sand immune."
	},
	"soulfire": {
		"desc": "It draws in Fire- and Ghost-type moves to itself and is immune to Fire-type moves, Ghost-type moves, Will-O-Wisp, and damaging weather conditions, raising Attack and Special Attack by 1 stage when hit by them. Its Fire- and Ghost-type moves bypass type immunities, cannot hit Normal-type Pokemon with Ghost-type attacks, and are resisted by Steel- and Dark-type Pokemon. Burns caused by its Fire- and Ghost-type moves or Will-O-Wisp bypass burn immunities, Misty Terrain, and Mist. Fire- and Ghost-type moves from this Ability deal 4x damage to opposing Soul Fire users.",
		"shortDesc": "Draws in and absorbs Fire/Ghost; burns bypass immunities; attacks ignore most resists."
	},
	"soulsiphon": {
		"desc": "Direct Fire/Ghost damage to opponents heals one-third of actual HP damage, capped at one-sixth max HP per turn across all hits and targets. Also prevents the damaged target from recovering HP through the end of the following turn; switching clears this effect and repeated hits refresh it. Does not siphon from substitutes, allies, residual or future damage, or moves that already drain. Normal drain interactions apply. Absorbs Fire moves and gains a 1.5x Fire boost until switching out or losing the ability. Burning Field or grounded Volcanic Field also grants the boost. On Cold Eclipse, Fire absorption is disabled and entry gives +1 Defense and Sp. Def.",
		"shortDesc": "Absorbs Fire; Fire/Ghost hits drain 1/3 damage, capped at 1/6 HP per turn, and block healing."
	},
	"malicewell": {
		"desc": "Full Flame Body: contact attackers have a 30% burn chance (60% on Volcanic Field); Cold Eclipse instead grants +1 Defense and Sp. Def on entry and disables contact burns. Once per actual entry, the first opposing damaging move that executes against it grants +1 Sp. Atk after the entire move finishes if it remains active and survives, including Protect, misses and immunity. All hits and spread targets share one activation. Ally moves, self damage, residual damage and moves that never execute do not qualify. Ability changes or suppression do not reset usage. The activation is consumed even at +6; switching resets usage and normal stat stages, and Haze removes the boost without refreshing usage.",
		"shortDesc": "Contact may burn; surviving the first opposing damaging move each entry gives +1 Sp. Atk, even after Protect."
	},
	"soulpyre": {
		"desc": "Restores 1/8 max HP at the end of a turn when an opposing Pokemon actually took burn damage. Ghost hits against already-burned foes lower Sp. Def by 1 stage once per turn. Prevented burn damage does not grant healing.",
		"shortDesc": "Heals 1/8 after foe burn damage; Ghost hits lower burned foes' Sp. Def."
	},
	"soulcremation": {
		"desc": "Direct Fire/Ghost attacks heal 1/3 of actual opposing HP damage, capped at 1/6 max HP per turn, and block surviving targets' healing through the following turn. Switching clears the block; repeated hits refresh it. Native draining moves, substitutes, allies, residual and delayed damage do not grant this drain. Once per turn, a Ghost hit on an already-burned surviving foe also attempts -1 Sp. Def. At turn end, heals 1/8 max HP if any foe actually took burn damage; this is separate from the drain cap. Once per actual entry, the first executed opposing damaging move targeting it grants +1 Sp. Atk after the entire move if it survives and remains active, even after misses, protection or immunity. This use is spent at +6 and is not reset by ability changes or suppression; switching resets it. Contact attackers have a 30% burn chance (60% on Volcanic). Absorbs Fire for a 1.5x Fire boost; Burning or grounded Volcanic also grants the boost. On Cold Eclipse, Fire absorption and contact burns stop, and entry gives +2 Defense and Sp. Def total. Normal healing blockers and drain interactions apply; suppression disables these effects.",
		"shortDesc": "Fire/Ghost drain and healing block; burn-based healing; one entry Sp. Atk boost; Fire absorption/contact burns."
	},
	"soultag": {
		"desc": "Traps adjacent foes, subject to Ghost-type and Shed Shell escape. Takes 25% less attack damage from other Pokemon. Redirects Fire and Ghost moves and absorbs them and Will-O-Wisp for +1 Attack and Sp. Atk. Fire attacks bypass abilities, type immunities and resistances; Ghost attacks are neutral against non-Normal types but cannot hit Normal. Immune to sandstorm and hail damage. Haunted entry reveals foe items. Haunted and Cold Eclipse entry give +1 Defense and Sp. Def. Haunted, Burning, Volcanic and Bewitched Woods give +1 Attack and Sp. Atk each turn. Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact.",
		"shortDesc": "Traps foes; 25% less damage; absorbs Fire/Ghost for attacking boosts; contact burns and field bonuses."
	},
	"soulheart": {
		"desc": "Gains +1 Sp. Atk when any Pokemon faints, plus +2 Sp. Def on Misty or Rainbow Field.",
		"shortDesc": "Faints give +1 Sp. Atk; Misty/Rainbow also give +2 Sp. Def."
	},
	"highnoon": {
		"desc": "Same-type moves have 1.3x power. Pulse and bullet moves have 1.5x power. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Damaging moves cannot miss; Water moves gain another 1.2x power. Gains one critical-hit stage against a newly switched target or one without a successful action this turn.",
		"shortDesc": "Accurate attacks; stronger same-type, pulse/bullet and Water moves; eligible moves hit twice."
	},
	"soundproof": {
		"desc": "Immune to other Pokemon's sound moves.",
		"shortDesc": "Immune to others' sound moves."
	},
	"solaridol": {
		"desc": "It has Levitate's Ground immunity. Its Fire-type moves have 1.5x power, its Attack is 1.5x during sun, and Grass-type attacks are resisted.",
		"shortDesc": "Fire power 1.5x; Attack 1.5x in sun; resists Grass."
	},
	"forestsurge": {
		"desc": "On entry, it sets Forest Terrain and Grassy Aura for 5 turns, or 8 turns with Amplifield Rock. Same-type moves have 1.3x power.",
		"shortDesc": "Sets Forest and Grassy Aura for 5 turns, or 8 with Amplifield Rock; 1.3x same-type power."
	},
	"lunaridol": {
		"desc": "It has Levitate's Ground immunity and is immune to hail damage. Its Ice-type moves have 1.5x power, and its Special Attack is 1.5x during hail or snow.",
		"shortDesc": "Airborne and hail-immune; 1.5x Ice power; 1.5x Sp. Atk in hail/snow."
	},
	"parasitism": {
		"desc": "Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. While above 50% HP, its weaknesses are neutralized, Magic Guard is active, opposing status moves fail, and opposing attack secondary effects are blocked. The first time Parasect would faint, it fake-faints at 1 HP, then becomes Parasect-Parasite at the end of the turn and revives at full HP. This Ability cannot be suppressed and is immune to Neutralization.",
		"shortDesc": "Absorbs Water; rain/water fields heal; Fire, sun and Desert hurt — above half: defensive protection; first KO triggers Resuscitation."
	},
	"completeparasitism": {
		"desc": "Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. While above 50% HP, its weaknesses are neutralized, Magic Guard is active, opposing status moves fail, and opposing attack secondary effects are blocked. The first time Parasect would faint, it fake-faints at 1 HP, then becomes Parasect-Parasite at the end of the turn and revives at full HP. This Ability cannot be suppressed and is immune to Neutralization. Takes 20% less attack damage, or 40% less from super-effective attacks. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal. A lethal hit triggers a full-HP revival as Parasect-Parasite at the end of the turn, even if Parasitism was used before Mega Evolution.",
		"shortDesc": "Absorbs Water; rain/water fields heal; Fire, sun and Desert hurt; above half: defensive protection; first KO triggers Resuscitation; 20% less attack damage; 40% less if super effective; Heals 1/16 HP per turn."
	},
	"venomheal": {
		"desc": "Other Pokemon cannot lower its Attack. Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland. Contact attackers have a 30% poison chance, or 60% on Wasteland. Its Poison-type moves have 1.5x STAB.",
		"shortDesc": "Other Pokemon cannot lower its Attack; Poison heals 1/8 HP; healing on corrosive fields; 30% contact poison; 60% on Wasteland — Poison moves get 1.5x STAB."
	},
	"resuscitation": {
		"desc": "When Parasect revives as Parasect-Parasite, its status, stat stages, and volatile effects are cleared and it returns to full HP. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply.",
		"shortDesc": "Revives Parasect as Parasite; healing and status recovery; no indirect/weather damage."
	},
	"pendulumswing": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Takes 20% less attack damage, or 40% less from super-effective attacks. Its moves cannot miss.",
		"shortDesc": "No sleep or Yawn; 1.3x Dark/Ghost power; 20% less attack damage; 40% less if super effective — moves cannot miss."
	},
	"nightrealm": {
		"desc": "It can use Dream Eater and Nightmare on awake targets.",
		"shortDesc": "Dream Eater and Nightmare affect awake targets."
	},
	"nightmarepulse": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Takes 20% less attack damage, or 40% less from super-effective attacks. Its moves cannot miss. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes. Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field. On entry, sets Haunted Field for 5 turns if field rules allow. Retains sleep immunity, accurate moves, damage reduction, disabling attackers, and damage to sleeping foes. Does not bypass screens or Substitute. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use.",
		"shortDesc": "No sleep or Yawn; 1.3x Dark/Ghost power; 20% less attack damage; 40% less if super effective; moves cannot miss; 30% chance to disable attacks; curses foes on faint; Sleeping foes lose 1/8 HP per turn, except on Rainbow."
	},
	"pulsewaste": {
		"desc": "Muk-Pulse summons Swamp Field for 5 turns, subject to field-generation blockers. Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply. Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect. Heals 1/3 max HP on switching out. Muk-Pulse always uses Sludge Wave, Earth Power, Muddy Water, and Discharge. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use.",
		"shortDesc": "Muk-Pulse: one Swamp attempt per battle; changes type before moving; contact poison; switch-out healing."
	},
	"overgrow": {
		"desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Grass-type attack.",
		"shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Grass attacks."
	},
	"riftdancer": {
		"desc": "Doubles Speed in sun or Stage 4 Flower Garden. Copies other Pokemon's dance moves. Grass attacks use 1.5x attacking stats at 1/3 HP or less; Flower Garden stage 2 raises the HP threshold to 2/3, stage 4 gives 1.8x at any HP and stage 5 gives 2x. Grassy Terrain gives 1.5x attacking stats for all attacks. Once per battle, the first damaging hit that would cross below half HP stops at half HP, then immediately heals 25% max HP. Once per battle, its first activation attempts to create a full Stage 1 Flower Garden for 5 turns, respecting protected fields. Existing gardens are not advanced or refreshed; this first attempt spends the use even if creation is blocked. Each actual stage gained adds 1 remaining turn to this garden, including re-growth; lowering a stage or trying to grow at maximum adds nothing. The garden grows one stage at each turn end without requiring weather and keeps this property after the user switches out.",
		"shortDesc": "Sun Speed boost; copies dances; stronger Grass moves; once-battle half-HP guard and growing Flower Garden."
	},
	"lunarspirit": {
		"desc": "It has STAB on Psychic- and Normal-type moves.",
		"shortDesc": "Psychic- and Normal-type moves get STAB."
	},
	"royaldecree": {
		"desc": "On entry, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While it is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, enemy-caused stat drops fail, and charge moves fire immediately. Its own self-inflicted stat drops still work. Neutralization disables these Royal Decree effects while active. If Neutralization is already active on entry, the stat and screen reset does not happen; it does not happen later when Neutralization leaves.",
		"shortDesc": "Haze/screen clear; Safeguard blocks reset; blocks setup/screens; skips charge turns."
	},
	"royalhive": {
		"desc": "On entry, it starts in Attack Stance and raises its Attack and Special Attack by 1 stage. After it uses a status move, it changes to Defense Stance, lowering its Attack and Special Attack by 1 stage and raising its Defense and Special Defense by 1 stage. After it uses a damaging move while in Defense Stance, it changes back to Attack Stance, lowering its Defense and Special Defense by 1 stage and raising its Attack and Special Attack by 1 stage. While in Defense Stance, it restores 1/16 of its max HP at turn end.",
		"shortDesc": "Starts +1 Atk/SpA; status moves swap to +1 Def/SpD and heal 1/16; attacks swap back."
	},
	"unnerve": {
		"desc": "While it is active, it prevents opposing Pokemon from using their Berries. This Ability activates before hazards and other Abilities take effect.",
		"shortDesc": "While it is active, it prevents opposing Pokemon from using their Berries."
	},
	"royalsun": {
		"desc": "On entry, summons sun for 5 turns, or 8 with Heat Rock. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. While it is active, it prevents opposing Pokemon from using their Berries. This Ability activates before hazards and other Abilities take effect. Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact. Summons sun for the usual Drought duration. Move power gains 10% per fainted ally; at 2 fallen allies, gains Infiltrator; at 4, flinch immunity; at 5, Magic Guard and a one-time +1 Attack and Special Attack. Opponents cannot eat Berries or use field seeds. Contact has a 30% burn chance, or 60% on Volcanic Field. On Cold Eclipse, lowers opposing Speed by 1 on entry (blocked by Substitute), raises its Defense and Special Defense by 1, and cannot burn through contact.",
		"shortDesc": "Summons sun on entry; Fallen allies add 10% damage each; 2+ Infiltrator, 4+ Inner Focus; While it is active, it prevents opposing Pokemon from using their Berries; 30% contact burn (60% Volcanic)."
	},
	"tremor": {
		"desc": "Immune to Ground moves. Its Bug-type attacks receive STAB. Damaging sound moves used by it or its allies have 1.5x power; its sound moves use its higher offensive stat, and allies are protected from allied sound moves. In Sandstorm, Desert Terrain, or Ashen Beach Terrain, its Rock-, Ground-, and Steel-type attacks have 1.3x power. It is immune to sandstorm damage.",
		"shortDesc": "Airborne; Bug STAB; stronger allied sound moves; stronger Rock/Ground/Steel moves in sand fields."
	},
	"resonanceforce": {
		"desc": "Sound-based moves used by its side deal 1.5x damage. Its side is immune to its own damaging sound-based moves. Sound-based moves used by it use its higher offensive stat.",
		"shortDesc": "Side sound moves 1.5x; allies avoid own sound damage; sound uses higher offense."
	},
	"verdantdrake": {
		"desc": "Same-type moves have 1.3x power. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Heals 1/3 max HP on switching out. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind. Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts.",
		"shortDesc": "1.3x same-type power; eligible moves hit twice; switching heals; absorbs Electric; no paralysis or foe Speed drops."
	},
	"solarbloom": {
		"desc": "If sun is active, it transforms into Cherrim-Sunshine and restores 1/8 of its max HP. While sun is active, its Speed is doubled.",
		"shortDesc": "In sun: becomes Sunshine, heals 1/8, and has doubled Speed."
	},
	"wrathshield": {
		"desc": "Same-type moves have 1.3x power. It is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal. On entry, gains +1 Defense, plus +1 Sp. Def on Cold Eclipse, New World, Starlight Arena or Fairy Tale.",
		"shortDesc": "Blocks bullet/pulse moves; entry Defense boost; end-turn healing; switching cures status."
	},
	"shadowcurrent": {
		"desc": "Before an eligible damaging move, changes to its type; status, reflected, delayed, Snatched and move-calling moves do not trigger this. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. Same-type moves have 1.3x power. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk.",
		"shortDesc": "Changes type before attacks; boosts weak/same-type moves; bypasses screens/Substitute; scouts threats."
	},
	"astralwitchcraft": {
		"desc": "Same-type moves have 1.3x power. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again. Fairy Tale entry gives +1 Sp. Def; Mirror Arena entry gives +1 evasion. On Mirror Arena, reflecting a directly targeted move also gives its original user +1 evasion. Fairy Tale and New World entry also give +1 Sp. Atk and Sp. Def.",
		"shortDesc": "1.3x same-type power; airborne; no indirect damage; reflects status moves; field entry boosts."
	},
	"blazingtempo": {
		"desc": "Gains +1 Speed at the end of each full turn it spends active. Same-type moves have 1.3x power. Kicking moves have 1.4x power. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus. Gains +1 Speed at the end of each eligible turn; same-type moves have 1.3x power and kicking moves have 1.4x power. Prevents freezing and Accuracy drops, and ignores the target's evasiveness. Magma Armor and Keen Eye also retain their field effects.",
		"shortDesc": "+1 Speed after each full active turn; Same-type moves have 1.3x power; Kicks have 1.4x power; Halves Water/Ice attacking stats; prevents freeze; field defenses; No opposing accuracy drops; ignores evasion; reveals Illusions."
	},
	"ragingcurrent": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. Same-type moves have 1.3x power. Water Veil and its burn immunity are removed.",
		"shortDesc": "Double Speed in rain and water fields; Blocks explosions/Aftermath; halves incoming Fire attacking stats; Absorbs Water; rain/water fields heal; Fire, sun and Desert hurt; Opposing HP hits heal 1/16."
	},
	"toxicbloom": {
		"desc": "Same-type moves have 1.3x power. Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip. Heals 1/16 max HP each turn. Poison-type attacks restore 1/4 of actual opposing HP damage, using normal drain rounding and Heal Block, Liquid Ooze and Big Root interactions. No added drain from Substitute-only damage, misses, Protect, immunity or residual poison. Moves that already drain keep their native drain without an extra heal.",
		"shortDesc": "Stronger same-type moves; Fire/Ice protection; ignores foe stat stages; Grass chip/healing; Poison drain."
	},
	"siegelauncher": {
		"desc": "Same-type moves have 1.3x power. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Pulse and bullet moves have 1.5x power; their second paired hit has 15% unboosted power outside Free-for-All. Moves ignore redirection. Heals 1/16 max HP each turn. Foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP; Water immunities block it, and type effectiveness scales it only in Free-for-All.",
		"shortDesc": "Stronger pulse/bullet moves; eligible moves hit twice; ignores redirection; heals and damages foes each turn."
	},
	"sheerforce": {
		"desc": "Its attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Anger Shell, Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",
		"shortDesc": "Its attacks with secondary effects have 1.3x power; nullifies the effects."
	},
	"calderacore": {
		"desc": "Its attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Anger Shell, Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating. On entry, summons sun for 5 turns, or 8 with Heat Rock. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def.",
		"shortDesc": "Its attacks with secondary effects have 1.3x power; nullifies the effects; Summons sun on entry; Halves Water/Ice attacking stats; prevents freeze; field defenses."
	},
	"speedboost": {
		"desc": "Gains +1 Speed at the end of each full turn it spends active.",
		"shortDesc": "+1 Speed after each full active turn."
	},
	"spicyspray": {
		"desc": "When it is hit by an attack, the attacker becomes burned. Heals 1/16 max HP each turn.",
		"shortDesc": "Attackers are burned after hitting its HP; heals 1/16 HP each turn."
	},
	"froststalker": {
		"desc": "Attacks use double the offensive stat against targets that entered this turn. Slicing moves have 1.5x power, except on Cold Eclipse. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Doubles attacking stats against foes that just entered battle. Slicing moves have 1.5x power except on Cold Eclipse. Eligible Normal moves become Ice with 1.2x power, or 1.5x on Icy and Snowy Mountain fields.",
		"shortDesc": "Double attacking stats against newly entered targets; Slicing moves have 1.5x power except on Cold Eclipse; Normal moves become Ice with 1.2x power; icy-field boost."
	},
	"stakeout": {
		"desc": "Attacks use double the offensive stat against targets that entered this turn.",
		"shortDesc": "Double attacking stats against newly entered targets."
	},
	"stalwart": {
		"desc": "Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk.",
		"shortDesc": "Ignores redirection; +1 Sp. Atk on specified fields."
	},
	"stamina": {
		"desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move.",
		"shortDesc": "Opposing HP hits heal 1/16; +1 Defense once per turn."
	},
	"static": {
		"desc": "Contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit.",
		"shortDesc": "30% contact paralysis; 60% on electric fields."
	},
	"steelworker": {
		"desc": "Steel moves receive STAB and use 1.5x Attack or Sp. Atk (2x on Factory). On Short-Circuit, Steel moves also gain Electric typing. Adds Steel resistances and Poison immunity without Steel weaknesses.",
		"shortDesc": "Steel STAB and attacking boost; Steel resistances without weaknesses."
	},
	"stickyhold": {
		"desc": "Other Pokemon cannot remove its item while it survives. Sticky Barb can still transfer.",
		"shortDesc": "Protects its item while it survives."
	},
	"striker": {
		"desc": "Kicking moves have 1.4x power.",
		"shortDesc": "Kicks have 1.4x power."
	},
	"perfectstriker": {
		"desc": "Kicking moves have 1.4x power. Same-type moves have 1.3x power. Moves used by or against it always hit, including during semi-invulnerable turns. Before using a move, changes to that move's type. Excludes reflected, delayed, Snatched and move-calling attacks; type-change restrictions still apply.",
		"shortDesc": "1.4x kicks and 1.3x same-type power; moves by/against it always hit; changes type before moves."
	},
	"strikersmomentum": {
		"desc": "Kicking moves have 1.4x power. Gains +2 Attack when a foe lowers its stats. Same-type moves have 1.3x power. Moves cannot miss. Before a directly used damaging move, changes to its type; excludes called, bounced, delayed and Snatched moves. Once per entry, a move KO gives +1 Speed.",
		"shortDesc": "Stronger kicking and same-type moves; foe stat drops boost Attack; never misses; changes type; first KO boosts Speed."
	},
	"nighthunt": {
		"desc": "Biting moves have 1.5x power. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. On entry, reveals all opposing active Illusions and held items. Each item holder independently has a 30% chance to be Embargoed for 5 turns. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally. Shared Illusion reveals occur once.",
		"shortDesc": "1.5x biting power; bypasses screens/Substitute; lowers foe Attack; reveals items/Illusions; accuracy protection."
	},
	"strongjaw": {
		"desc": "Biting moves have 1.5x power.",
		"shortDesc": "Bites have 1.5x power."
	},
	"blackfang": {
		"desc": "Biting moves have 1.5x power. Prevents and cures sleep. Gains +1 Attack for each Pokemon knocked out by its move.",
		"shortDesc": "Bites have 1.5x power; Prevents and cures sleep; Move KOs give +1 Attack."
	},
	"fluffycraft": {
		"desc": "Contact attacks deal half damage; Fire attacks deal double damage (contact Fire attacks are neutral). Moves of 60 power or less gain 1.5x power, with the existing Factory Field threshold of 80. Switching out cures major status and, only when a status was cured, heals 1/3 max HP. Bewitched Woods also cures status at turn end without this switch-out heal. Normal ability suppression applies.",
		"shortDesc": "Half contact damage; double Fire damage; 1.5x power for moves at 60 power or less (80 on Factory); Switching cures status and heals 1/3 HP if cured; Woods cures status each turn."
	},
	"mightyjaw": {
		"desc": "Biting moves have 1.5x power. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. On its first action after switching in, its biting moves have 2 higher priority.",
		"shortDesc": "Bites have 1.5x power; Entry lowers adjacent foes' Attack by 1 — Proficient; biting moves gain +2 priority on first action."
	},
	"sturdy": {
		"desc": "Prevents OHKO moves. At full HP, survives an otherwise fatal attack hit with 1 HP.",
		"shortDesc": "Survives a hit at full HP; immune to OHKO moves."
	},
	"suctioncups": {
		"desc": "Cannot be forced out by another Pokemon's moves or items. Voluntary switching still works.",
		"shortDesc": "Cannot be forced out."
	},
	"superluck": {
		"desc": "Raises critical-hit rate by one stage.",
		"shortDesc": "+1 critical-hit stage."
	},
	"sweetveil": {
		"desc": "Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep.",
		"shortDesc": "Prevents sleep and Yawn for itself and allies."
	},
	"swiftswim": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone.",
		"shortDesc": "Double Speed in rain and water fields."
	},
	"tangledfeet": {
		"desc": "While confused, incoming moves have half accuracy and its critical-hit rate rises by one stage. Mirror Arena or Big Top entry gives +1 evasion.",
		"shortDesc": "Confusion boosts evasion and critical-hit rate."
	},
	"tanglinghair": {
		"desc": "Contact attackers lose 1 Speed stage.",
		"shortDesc": "Contact attackers lose 1 Speed."
	},
	"technician": {
		"desc": "Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field.",
		"shortDesc": "1.5x power for moves at 60 power or less (80 on Factory)."
	},
	"telepathy": {
		"desc": "Avoids allied damaging moves. Speed doubles on Psychic Terrain or Psychic Aura.",
		"shortDesc": "Avoids allied attacks; double Speed on Psychic field/aura."
	},
	"teravolt": {
		"desc": "Moves ignore bypassable opposing abilities.",
		"shortDesc": "Moves ignore bypassable abilities."
	},
	"thermalexchange": {
		"desc": "Fire hits give +1 Attack. Prevents and cures burns. Gains +1 Attack each turn on Superheated, Dragon's Den, Burning and Volcanic.",
		"shortDesc": "Fire hits/hot fields give +1 Attack; no burns."
	},
	"thickfat": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage.",
		"shortDesc": "Half Fire/Ice attacking stats; immune to hail damage."
	},
	"tintedlens": {
		"desc": "Resisted attacks deal double damage.",
		"shortDesc": "Resisted attacks deal double damage."
	},
	"toughclaws": {
		"desc": "Contact moves have 1.3x power.",
		"shortDesc": "Contact moves have 1.3x power."
	},
	"toxicdebris": {
		"desc": "Physical HP hits set one Toxic Spikes layer on the attacker's side, up to two; allied attacks use the opposing side. Contact attackers also lose 1/6 max HP.",
		"shortDesc": "Physical hits set Toxic Spikes; contact attackers lose 1/6 HP."
	},
	"transistor": {
		"desc": "Electric attacks use 1.3x Attack or Sp. Atk, or 2x on Electric and Factory fields. On Electric Terrain, incoming Ground attacks use half the attacker's offensive stat.",
		"shortDesc": "Boosts Electric attacking stats; Electric Terrain weakens Ground."
	},
	"railguncircuit": {
		"desc": "Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts. never misses; boosts Electric attacks. Redirects and absorbs Electric moves, raising Attack and Special Attack. Electric moves are strengthened; Ground damage is reduced on Electric Terrain.",
		"shortDesc": "Redirects/absorbs Electric for +1 Attack and Sp. Atk — never misses; boosts Electric attacks."
	},
	"razorcurrent": {
		"desc": "On entry, summons rain for 5 turns, or 8 with Damp Rock. Biting moves have 1.5x power. Gains +1 Speed at the end of each full turn it spends active.",
		"shortDesc": "Summons rain on entry; Bites have 1.5x power; +1 Speed after each full active turn."
	},
	"rainsovereign": {
		"desc": "On entry, it sets Rain for 8 turns. Its Electric-, Water-, and Flying-type moves receive STAB. Each turn, non-immune foes take Water damage equal to 1/16 max HP. Only in Free-for-All does Water type effectiveness scale this chip.",
		"shortDesc": "8-turn Rain; Electric/Water/Flying STAB; Water chip scales by type in FFA."
	},
	"toxicrenewal": {
		"desc": "Same-type moves use a 2x STAB multiplier. Switching out heals 1/3 max HP. Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect.",
		"shortDesc": "2x STAB; switching heals 1/3 HP; contact attacks may poison."
	},
	"currentcoil": {
		"desc": "Swift Swim, including this server's eligible water fields. Coil additionally raises Sp. Atk by 1 stage, preserving its other boosts.",
		"shortDesc": "Coil also raises Sp. Atk."
	},
	"stormcircuit": {
		"desc": "On entry, creates Electric Terrain or Electric Aura for 5 turns, or 8 with Amplifield Rock, subject to field rules. Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Coil also gives +1 Sp. Atk.",
		"shortDesc": "Summons Electric aura; KOs boost highest stat; double Speed in rain/water fields; Coil also gives +1 Sp. Atk."
	},
	"ironmountain": {
		"desc": "Takes 25% less damage from super-effective attacks. Once per turn, an opposing HP hit gives +1 Defense and heals 1/16 max HP. Doubles weight, halves physical damage, and gains +1 Defense and -1 Speed on Factory entry.",
		"shortDesc": "25% less super-effective damage; once/turn +1 Defense and 1/16 heal when hit; double weight, half physical damage."
	},
	"woolyconductor": {
		"desc": "Takes half damage from contact attacks and double damage from Fire attacks; contact Fire attacks deal normal damage. Moves ignore bypassable opposing abilities. Contact attackers have a 30% chance to be paralyzed, or 60% on Electric Terrain and Short-Circuit.",
		"shortDesc": "Half contact damage, double Fire damage; ignores abilities; contact paralysis chance."
	},
	"absolutezero": {
		"desc": "On entry, it summons Snow. Moves ignore bypassable opposing abilities. Takes 20% less attack damage, or 40% less from super-effective attacks.",
		"shortDesc": "On entry, it summons Snow; Moves ignore bypassable abilities; 20% less attack damage; 40% less if super effective."
	},
	"surgeconduit": {
		"desc": "On entry, creates Electric Terrain. Redirects opposing single-target Electric moves to itself; absorbs Electric moves for +1 Sp. Atk. Prevents move recoil except Struggle. Takes 20% less attack damage at any HP, or 40% less from super-effective attacks.",
		"shortDesc": "Creates Electric Terrain; absorbs Electric for +1 Sp. Atk; no recoil; 20%/40% less attack damage."
	},
	"digestivesap": {
		"desc": "Direct Poison-type attacks heal it for 1/3 of actual opposing HP damage, capped at 1/8 of its max HP per turn across all hits and targets. Native draining moves do not receive additional healing. Does not drain substitutes, allies, or delayed attacks; normal healing prevention and Liquid Ooze apply.",
		"shortDesc": "Poison attacks drain 1/3 actual foe HP damage; healing capped at 1/8 max HP each turn."
	},
	"solartrap": {
		"desc": "It has Thick Fat and is immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile each turn. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply. Direct Poison-type attacks heal it for 1/3 of actual opposing HP damage, capped at 1/8 of its max HP per turn across all hits and targets. Native draining moves do not receive additional healing. Does not drain substitutes, allies, or delayed attacks; normal healing prevention and Liquid Ooze apply. Draining moves, Leech Seed and Strength Sap damage their user by the HP they would restore. This damage doubles on Murkwater Surface and Wasteland. Poison attacks heal 1/3 of actual damage dealt to foes, capped at 1/8 max HP per turn; draining moves used on it hurt the user instead.",
		"shortDesc": "Fire/Ice protection; automatic Stockpiles/releases; Poison drain; draining moves hurt their user."
	},
	"pulsetriad": {
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Other Pokemon cannot lower its stat stages. On entry, sets Factory Field for 5 turns. Eligible single-target attacks hit three times, it is ungrounded, and opponents cannot lower its stats. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use. Magnezone-Pulse automatically receives Flash Cannon, Discharge, Recover, and Autotomize in that order.",
		"shortDesc": "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x; Airborne; immune to Ground attacks unless grounded; Other Pokemon cannot lower its stats — 5-turn Factory Field on entry."
	},
	"longreach": {
		"desc": "Removes contact and raises critical-hit rate by one stage. Also raises Accuracy on entry and retains field bonuses. No triple critical-hit damage. Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions on activation. Mirror Arena grants +1 accuracy and Laser Focus; shared accuracy entry rewards apply once.",
		"shortDesc": "Removes contact and raises critical-hit rate by one stage."
	},
	"razorreach": {
		"desc": "Slicing moves have 1.5x power, except on Cold Eclipse. Removes contact and raises critical-hit rate by one stage. Also raises Accuracy on entry and retains field bonuses. No triple critical-hit damage. Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions on activation. Mirror Arena grants +1 accuracy and Laser Focus; shared accuracy entry rewards apply once. Slicing moves have 1.5x power (except on Cold Eclipse), all attacks are non-contact, and entry grants +1 accuracy. Retains local Long Reach critical-hit and field effects: 0.9x move accuracy on Rocky/Grassy Field and 1.5x power on Mountain/Snowy Mountain. Replaces the former 1.3x slicing boost; no stacking with it.",
		"shortDesc": "Slicing moves have 1.5x power except on Cold Eclipse; Removes contact and raises critical-hit rate by one stage — all attacks non-contact; +1 accuracy on entry."
	},
	"witheringtouch": {
		"desc": "Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Poison attacks that damage a foe already poisoned before that hit lower its Attack by 1, once per target per turn. Poison caused by that same hit does not qualify; Substitute-only and residual damage do not count.",
		"shortDesc": "Contact hits have a 30% poison chance; Poison bypasses type immunity; poisoned foes lose defenses — Poison HP hits on already-poisoned foes lower Attack once/turn."
	},
	"pulsebulwark": {
		"desc": "Mr. Mime-Pulse automatically receives Light Screen, Reflect, Dazzling Gleam, and Dark Pulse in that order. On entry, sets Short-Circuit Field for 5 turns. Reflect and Light Screen gain +1 priority. Once per actual entry, successfully creating a new one of these screens cures major status on it and its active allies. Ability changes do not reset the cure. Screens retain their normal duration, removal, and bypass rules. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use.",
		"shortDesc": "5-turn Short-Circuit; +1-priority screens; first new screen per entry cures active allies' status."
	},
	"soaringspirit": {
		"desc": "Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
		"shortDesc": "Absorbs wind; Tailwind/Strong Winds raise Sp. Atk; Heals 1/16 HP each turn; immune to sandstorm and hail damage."
	},
	"angerpoint": {
		"desc": "The first damaging hit it takes raises its Attack by 1 stage. A critical hit raises its Attack by 12 stages.",
		"shortDesc": "First damaging hit: +1 Attack; critical hits: +12 Attack."
	},
	"vendetta": {
		"desc": "The first damaging hit it takes raises its Attack by 1 stage. A critical hit raises its Attack by 12 stages. The first otherwise lethal attack has a 50% chance to leave it at 1 HP. This Ability rolls only once per battle, even if the roll fails or it switches out. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
		"shortDesc": "First damaging hit: +1 Attack; critical hits: +12 Attack; 50% chance to survive the first lethal attack at 1 HP; one roll per battle; Heals 1/16 HP each turn; immune to sandstorm and hail damage."
	},
	"triage": {
		"desc": "Healing moves and Aromatherapy, Heal Bell, Jungle Healing, Purify and Refresh gain +3 priority.",
		"shortDesc": "Healing and status-cleansing moves gain +3 priority."
	},
	"turboblaze": {
		"desc": "Moves ignore bypassable opposing abilities.",
		"shortDesc": "Moves ignore bypassable abilities."
	},
	"unaware": {
		"desc": "When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry.",
		"shortDesc": "Ignores opposing combat/accuracy stages; reveals Illusions."
	},
	"unseenfist": {
		"desc": "Contact moves bypass protection except Max Guard. Punching moves have 1.4x power.",
		"shortDesc": "Contact bypasses protection; punches have 1.4x power."
	},
	"phantomfist": {
		"desc": "Contact moves bypass protection except Max Guard. Punching moves have 1.4x power. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal. Takes 0.8x attack damage at any HP; super-effective attacks deal a further 0.75x damage (0.6x total). Ability-ignoring moves cannot bypass these reductions, but suppression disables them. Immune to hail damage on Cold Eclipse. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage. Its moves cannot miss, contact moves bypass Protect, it repairs itself, takes 0.8x attack damage at any HP (0.6x total from super-effective attacks), and damages contact attackers that knock it out.",
		"shortDesc": "Contact bypasses protection; punches have 1.4x power; Heals 1/16 HP per turn; switching cures status and heals 1/3 HP if cured; no weather damage; 20% less attack damage at any HP; 40% less if super effective."
	},
	"ultraego": {
		"desc": "Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. While Royal Decree or Empress is active without Neutralization, takes 30% less attack damage and has 1.3x move power, except against Battle Bond.",
		"shortDesc": "Ignores abilities; damage dealt or taken heals; qualifying hits boost attacking stats; field bonuses."
	},
	"territorial": {
		"desc": "Each opposing physical or special hit that damages its HP heals 1/16 base max HP; the first such hit each turn immediately raises Defense by 1, including between multi-hit strikes. Opposing forced switching is blocked and Intimidate raises Attack instead. Opponents cannot eat Berries or use field seeds; Cold Eclipse entry lowers opposing Speed.",
		"shortDesc": "Blocks Berries and forced switching; HP hits heal 1/16, +1 Defense once per turn; Intimidate gives +1 Attack."
	},
	"lunardread": {
		"desc": "On entry, lowers adjacent foes Sp. Atk by 1 stage, blocked by Substitute and normal stat-drop protection. Prevents sleep and Yawn; Dark and Ghost attacks have 1.3x power. Retains local Pressure: lowers foes Defense and Sp. Def by 1 stage on entry (2 on Cold Eclipse), costs foes 1 extra PP (2 on Midnight Zone), and changes Underwater to Midnight Zone. No mark, damage-reduction or Ground critical-hit effects.",
		"shortDesc": "On entry, lowers adjacent foes Sp. Atk by 1 stage; No sleep or Yawn; 1.3x Dark/Ghost power; Entry lowers foe defenses; opposing moves spend extra PP — retains their local field effects."
	},
	"stillwaters": {
		"desc": "Suppresses weather effects while active. On Rainbow Field, gains one random non-maxed stat stage other than evasion each turn. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry.",
		"shortDesc": "Suppresses weather; Rainbow gives a random stat boost each turn; Prevents indirect damage; Fairy Tale entry gives +1 Sp. Def; Ignores opposing combat/accuracy stages; reveals Illusions."
	},
	"ragingbeast": {
		"desc": "Attack is 1.5x while statused, and burn does not weaken physical attacks. Moves ignore bypassable opposing abilities.",
		"shortDesc": "1.5x Attack while statused; ignores burn attack penalty; Moves ignore bypassable abilities."
	},
	"scavenger": {
		"desc": "Immune to powder moves, Rage Powder, Effect Spore, sandstorm damage and hail damage. Other Pokemon cannot lower its Defense. Heals 1/3 max HP on switching out.",
		"shortDesc": "Immune to powder effects, sandstorm and hail damage; Other Pokemon cannot lower its Defense; Heals 1/3 HP on switching out."
	},
	"ultrainstinct": {
		"desc": "Moves ignore bypassable opposing abilities. Prevents flinching and Intimidate's Attack drop. Attacks deal 2x damage through screens or 1.5x damage when the target has yet to move or has just switched in. On Ashen Beach, New World, Starlight Arena, or Cold Eclipse, it gains 1 Accuracy on entry, deals 1.5x damage, and takes 50% less damage. Otherwise it takes 70% less damage if the attacker has not yet moved. Bewitched Woods, Haunted, and Holy Field suppress these effects.",
		"shortDesc": "Moves ignore bypassable abilities; Cannot flinch; blocks Intimidate — screen and timing boosts; field defenses."
	},
	"duskdrive": {
		"desc": "Full Battle Fervor, Precision and Opportunist, including their field effects, entry behavior, item blocking, damage modifiers and boost-copy timing.",
		"shortDesc": "Full Battle Fervor, Precision and Opportunist, including their field effects, entry behavior, item blocking, damage modifiers and boost-copy timing."
	},
	"burningego": {
		"desc": "Same-type moves have 1.3x power. Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. The first opposing HP hit gives +1 Attack and Sp. Atk and heals 1/16 max HP; later hits heal 1/20 until it completes a damaging move and resets this trigger. On Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. While Royal Decree or Empress is active without Neutralization, takes 30% less attack damage and has 1.3x move power, except against Battle Bond. On Cold Eclipse, the two entry effects together give +2 Defense and Sp. Def.",
		"shortDesc": "Stronger same-type moves; healing and combat boosts; contact burns; Water/Ice and freeze protection."
	},
	"vitalspirit": {
		"desc": "Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk. Takes 20% less attack damage.",
		"shortDesc": "No sleep/Yawn; 1.3x Fighting attacking stats; 20% less damage."
	},
	"voltabsorb": {
		"desc": "Absorbs other Pokemon's Electric moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Electric Terrain and Short-Circuit.",
		"shortDesc": "Absorbs Electric for 1/4 HP; electric-field healing."
	},
	"wastingsurge": {
		"desc": "On entry, it sets Wasteland Terrain. On Water Surface or Underwater, it creates Murkwater Surface instead; from Underwater, non-Poison and non-Steel Pokemon that are not semi-invulnerable faint. If Neutralization is active on Water Surface or Underwater, this effect fails. Its Poison-type damaging moves restore 1/4 of the damage dealt. Ground-type moves deal 1/2 damage to it.",
		"shortDesc": "Sets Wasteland or Murkwater; Poison moves drain 1/4 damage; half Ground damage."
	},
	"waterabsorb": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface.",
		"shortDesc": "Absorbs Water for 1/4 HP; water-field healing."
	},
	"waterveil": {
		"desc": "Prevents and cures burns; immune to sandstorm and hail damage. Gains Aqua Ring on entry. Cures status each turn on Water Surface and Underwater.",
		"shortDesc": "No burn or weather damage; Aqua Ring; water-field status cure."
	},
	"wellbakedbody": {
		"desc": "Absorbs Fire moves for +2 Defense. Gains +1 Defense each turn on Burning, Superheated, Dragon's Den and Volcanic.",
		"shortDesc": "Absorbs Fire for +2 Defense; hot fields raise Defense."
	},
	"stormsovereign": {
		"desc": "On entry, summons replaceable Strong Winds for 8 turns. If it is at full HP, its Flying-type moves have their priority increased by 1. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus. Moves cannot miss.",
		"shortDesc": "Summons 8-turn Strong Winds; Flying priority; accuracy protection; moves never miss."
	},
	"forewarn": {
		"desc": "On entry, it reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves.",
		"shortDesc": "Reveals strongest foe move; removes Illusions; Psychic Terrain +2 SpA; takes 0.8x damage."
	},
	"coldlogic": {
		"desc": "Contact moves have 1.3x power. Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Immune to hail damage on Cold Eclipse. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage. On entry, it reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves.",
		"shortDesc": "Contact moves have 1.3x power; 20% less attack damage; 40% less if super effective; field defenses; Contact KO costs attacker 1/4 HP (1/2 on Corrosive Mist); Reveals strongest foe move; removes Illusions; takes 0.8x damage."
	},
	"whitesmoke": {
		"desc": "Other Pokemon cannot lower its stat stages. Gains +1 Attack and Sp. Atk on Volcanic entry.",
		"shortDesc": "Blocks other Pokemon's stat drops; Volcanic entry boosts attacks."
	},
	"windpower": {
		"desc": "Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain.",
		"shortDesc": "Absorbs wind; Tailwind/Strong Winds raise Sp. Atk."
	},
	"windrider": {
		"desc": "Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack each turn, plus +1 Sp. Atk on Mountain or Snowy Mountain.",
		"shortDesc": "Absorbs wind; Tailwind/Strong Winds raise Attack."
	},
	"wonderskin": {
		"desc": "Opposing status moves that check accuracy have 50% base accuracy. On Rainbow Field, opposing status moves fail their accuracy check.",
		"shortDesc": "Status moves have 50% base accuracy; fail on Rainbow."
	},
	"layeredcoat": {
		"desc": "Doubles Defense. Immune to powder moves, Rage Powder, Effect Spore, sandstorm damage and hail damage.",
		"shortDesc": "Doubles Defense; immune to powder effects, sandstorm and hail damage."
	},
	"empress": {
		"desc": "Blocks opposing priority moves aimed at it or its allies. Attacks deal 1.5x damage on Fairy Tale, or on Chessboard unless it has the Queen role. On entry, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While it is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, enemy-caused stat drops fail, and charge moves fire immediately. Its own self-inflicted stat drops still work. Neutralization disables these Royal Decree effects while active. If Neutralization is already active on entry, the stat and screen reset does not happen; it does not happen later when Neutralization leaves. Fighting moves receive normal STAB. Its Fairy typing adds no Poison or Steel weakness. On Chessboard, Defense and Sp. Def are 1.5x while Neutralization is absent. Neutralization suppresses the stat/screen-control effects but not the priority protection.",
		"shortDesc": "Blocks foe priority; resets and controls stat changes/screens; Fighting STAB; Fairy weakness protection."
	},
	"imperialprincess": {
		"desc": "Kicking moves have 1.4x power. Prevents and cures sleep and blocks Yawn. Fighting attacks use 1.3x Attack or Sp. Atk. Takes 20% less attack damage. Gains +1 Attack for each Pokemon knocked out by its move. It gains normal STAB on Fighting-type moves, and ignores the Fairy-type component of Poison- and Steel-type weaknesses.",
		"shortDesc": "Stronger kicks/Fighting moves; no sleep; 20% less attack damage; KOs boost Attack; Fairy weakness protection."
	},
	"loyalguard": {
		"desc": "Allies take 25% less attack damage; this does not protect the holder. Cannot be forced out by opposing moves or items. Intimidate raises Attack by 1 instead of lowering it. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
		"shortDesc": "Allies take 25% less attack damage; Blocks forced switching; Intimidate gives +1 Attack; Entry lowers adjacent foes' Attack by 1."
	},
	"abysslure": {
		"desc": "It absorbs Electric- and Water-type moves that hit it, restoring 1/4 of its max HP and raising its Attack and Special Attack by 1 stage. It no longer redirects those moves from allies. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Heals 1/16 max HP each turn on Electric Terrain and Short-Circuit.",
		"shortDesc": "Absorbs Electric/Water for 1/4 HP and +1 Attack/Sp. Atk; accuracy protection and field healing."
	},
	"bogbody": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. Incoming Fire and Ice attacks also use half the attacker's offensive stat.",
		"shortDesc": "Airborne; absorbs Water; rain/field healing; Fire/Ice protection with Dry Skin's Fire penalty."
	},
	"toxicsink": {
		"desc": "Damaging hits have separate 10% chances to inflict sleep, paralysis or poison on the attacker; powder immunity blocks this. If Sleep Clause blocks sleep, a further roll can inflict paralysis or poison instead. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition. It redirects and absorbs Poison-type moves, raising its Attack and Special Attack by 1.",
		"shortDesc": "Damaging attackers may sleep, be paralyzed or poisoned; User/allies receive 1.3x healing; 50% to cure ally status each turn — absorbs Poison moves for +1 Atk/SpA."
	},
	"frostsiren": {
		"desc": "Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. On entry, it reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn.",
		"shortDesc": "Normal moves become Ice with 1.2x power; icy-field boost; Reveals strongest foe move; removes Illusions; Psychic Terrain +2 SpA; takes 0.8x damage; Absorbs Water; rain/water fields heal; Fire, sun and Desert hurt."
	},
	"protectiveward": {
		"desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. It can use Arenite Wall and Aurora Veil regardless of weather or field.",
		"shortDesc": "Sound moves: Water (Ice on Icy Field), 1.2x power; No critical hits; 20% less damage; foe stat drops give +2 Sp. Def; Absorbs Water for 1/4 HP; water-field healing — ignores wall conditions."
	},
	"amethystglow": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Moves cannot miss. Adds Ice typing in hail or snow and on Icy, Snowy Mountain and Cold Eclipse.",
		"shortDesc": "Moves never miss; Normal moves become Ice; Ice/weather healing and protection; gains Ice typing."
	},
	"crystalresonance": {
		"desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Eligible Normal moves become Ice and have 1.2x power, or 1.5x on Icy and Snowy Mountain. Excludes moves whose type is set by their own effect, damaging Z-Moves and Terastallized Tera Blast. Moves cannot miss. Adds Ice typing in hail or snow and on Icy, Snowy Mountain and Cold Eclipse. Reflects eligible status moves and entry hazards once; reflected moves cannot bounce again. Fairy Tale entry gives +1 Sp. Def; Mirror Arena entry gives +1 evasion. On Mirror Arena, reflecting a directly targeted move also gives its original user +1 evasion.",
		"shortDesc": "Moves never miss; stronger Ice moves; Ice healing/protection; reflects status moves."
	},
	"islandcurrent": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Absorbs wind moves for +1 Attack. Gains +1 Attack when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Attack each turn, plus +1 Sp. Atk on Mountain or Snowy Mountain.",
		"shortDesc": "Double Speed in rain and water fields; Absorbs wind; Tailwind/Strong Winds raise Attack."
	},
	"oceanicwings": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Cures major status at turn end in effective rain or on Water Surface, Underwater and Midnight Zone. Allies take 25% less attack damage; this does not protect the holder.",
		"shortDesc": "Absorbs Water for 1/4 HP; Cures status each turn in rain or water fields; Allies take 25% less attack damage."
	},
	"ruinjaw": {
		"desc": "Biting moves have 1.5x power. Absorbs other Pokemon's Ground moves, healing 1/4 max HP instead of being hit.",
		"shortDesc": "Bites have 1.5x power; Absorbs Ground for 1/4 HP."
	},
	"triplethreat": {
		"desc": "Hydra Bond + Tangled Feet + Keen Eye + Big Pecks + Limber. Eligible single-target attacks hit three times, with later hits at 30% damage. Existing multihit, charging, delayed, Z/Max and extra-hit-barred moves are excluded; spread moves are excluded outside Free-for-All. In Free-for-All, single-target attacks hit all foes once at 1.3x power; eligible spread attacks hit three times. Dragon's Den gives 1.2x power. Confusion halves incoming accuracy and adds one critical-hit stage. Mirror Arena or Big Top entry gives +1 evasion; Mirror Arena also gives +1 accuracy and Laser Focus. Reveals opposing Illusions, ignores evasion, and prevents other Pokemon's accuracy and Defense drops. Prevents and cures paralysis; blocks opposing and field Speed reductions. Self-inflicted Speed costs and item slowdowns still apply.",
		"shortDesc": "Three-hit attacks; confusion boosts evasion/crit rate. No paralysis or opposing/field Speed drops; Keen Eye + Big Pecks."
	},
	"strikerfrenzy": {
		"desc": "Kicking moves have 1.4x power. Prevents and cures sleep; blocks Yawn. Fighting attacks use 1.3x Attack.",
		"shortDesc": "1.4x kicking power; no sleep or Yawn; Fighting moves use 1.3x Attack."
	},
	"venomveil": {
		"desc": "Draining moves, Leech Seed and Strength Sap damage their user by the HP they would restore. This damage doubles on Murkwater Surface and Wasteland. Prevents and cures burns; immune to sandstorm and hail damage. Gains Aqua Ring on entry. Cures status each turn on Water Surface and Underwater. Moves can poison Steel- and Poison-type foes. Poisoning does not lower their defenses.",
		"shortDesc": "Drain users take damage; can poison Steel/Poison foes; burn/weather protection and Aqua Ring."
	},
	"reflector": {
		"desc": "On entry, copies the active foe's types and adds them to its typing. Matching attacks deal half damage unless it is immune. Reflect Type refreshes the copied types. If this Ability is suppressed, its Rejuv form reverts to the normal species until it switches out, even if suppression ends earlier.",
		"shortDesc": "Copies foe types; adds them to its typing; matching attacks deal 0.5x unless immune."
	},
	"rebornflower": {
		"desc": "Florges becomes Florges-Reborn on entry. Healing received by it and allies is 1.3x. Each adjacent ally has a 50% chance to be cured of major status at turn end. Grass-type allies, including itself, are protected from other Pokemon's stat drops, major status and Yawn; on Bewitched Woods, this protection applies regardless of type.",
		"shortDesc": "Boosts team healing; may cure allies each turn; protects Grass allies from status/stat drops; Florges transforms."
	},
	"toxicspines": {
		"desc": "Physical HP hits set one Toxic Spikes layer on the attacker's side, up to two; allied attacks use the opposing side. Contact attackers also lose 1/6 max HP. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Attacks always critically hit poisoned targets and on Corrosive, Corrosive Mist, Murkwater Surface and Wasteland, unless critical hits are blocked. On Chessboard, gains one critical-hit stage per 20% of the target's missing base max HP, up to three.",
		"shortDesc": "Physical hits set Toxic Spikes; contact attackers lose 1/6 HP; Poison bypasses type immunity; poisoned foes lose defenses; Critical hits against poisoned foes or on corrosive fields."
	},
	"helios": {
		"desc": "On entry, it summons harsh sunlight. Its moves ignore opposing Abilities. Berserk raises its Special Attack by one stage when an attack leaves it at half HP or less, and by two stages on entry in Dragon's Den. Swift Swim doubles its Speed in rain, Water Surface, Murkwater Surface, Underwater, or Midnight Zone.",
		"shortDesc": "On entry, it summons harsh sunlight. Its moves ignore opposing Abilities."
	},
	"corneredfang": {
		"desc": "Attack is 1.5x while statused, and burn does not weaken physical attacks. Once per switch-in, the first biting move selected while at half HP or less has +1 priority. Using that move spends the priority effect even if it misses or is blocked.",
		"shortDesc": "1.5x Attack while statused; ignores burn attack penalty — at half HP, the first biting move each entry gains +1 priority."
	},
	"nighthoard": {
		"desc": "Eating a Berry restores an additional 1/8 max HP and primes the next Dark-type biting attack that damages a foe to apply Taunt for 2 turns. Misses and blocked attacks preserve the charge.",
		"shortDesc": "Eating a Berry heals 1/8 more and charges the next Dark bite to Taunt."
	},
	"dunerunner": {
		"desc": "Doubles Speed in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage. Once per switch-in, being active in sandstorm clears entry hazards from its side.",
		"shortDesc": "Double Speed in sand or sandy fields; no sand damage — entering during sand clears its side's hazards once."
	},
	"frostrunner": {
		"desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. While hail or snow is active, entry hazards cannot damage, poison, or lower its Speed.",
		"shortDesc": "Double Speed in hail, snow and icy fields."
	},
	"bedrockclaw": {
		"desc": "Contact moves have 1.3x power. The first Ground-type contact attack to damage a foe each switch-in removes one opposing screen after damage.",
		"shortDesc": "Contact moves have 1.3x power — first Ground contact hit per entry breaks a screen."
	},
	"rimeclaw": {
		"desc": "Contact moves have 1.3x power. The first Ice-type contact attack to damage a foe each switch-in removes one opposing screen after damage.",
		"shortDesc": "Contact moves have 1.3x power — first Ice contact hit per entry breaks a screen."
	},
	"broodguard": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Allies take 25% less attack damage; this does not protect the holder. Once per switch-in, when an adjacent ally survives an opposing hit that takes it from above half HP to half or less, it gains +1 Defense.",
		"shortDesc": "Half Fire/Ice attacking stats; immune to hail damage; Allies take 25% less attack damage — an ally dropping below half HP grants +1 Defense."
	},
	"suncharm": {
		"desc": "On entry, summons sun for 5 turns, or 8 with Heat Rock. Its first landed Fire hit each entry extends the sunlight it summoned by 1 turn, capped at 8 remaining turns. Once per entry, burning a foe also curses it: 1/8 max HP lost per turn under this server's ability-Curse rules. No HP cost to Ninetales.",
		"shortDesc": "Summons sun; first Fire hit extends its sun; first inflicted burn each entry also curses the foe."
	},
	"causticscales": {
		"desc": "Once per switch-in, the first opposing contact attack to damage it poisons the attacker, subject to normal status immunity.",
		"shortDesc": "Once per switch-in, the first opposing contact attack to damage it poisons the attacker, subject to normal status immunity."
	},
	"prismwings": {
		"desc": "Resisted attacks deal double damage. Once per switch-in, damaging a foe with a resisted attack raises its Speed by 1 stage.",
		"shortDesc": "Resisted attacks deal double damage."
	},
	"oneiricdust": {
		"desc": "On entry, creates Psychic Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules. Once per switch-in, its first powder move that successfully hits a foe also lowers that foe's Sp. Def by 1 stage. Misses, immunity and protection do not spend the effect.",
		"shortDesc": "Creates Psychic Terrain on entry — the first landed powder move each entry lowers Sp. Def."
	},
	"pincercrush": {
		"desc": "Contact moves have 1.3x power. Once per switch-in, its first Steel-type contact attack to damage a foe lowers the foe's Defense by 1 stage.",
		"shortDesc": "Contact moves have 1.3x power — first Steel contact hit per entry lowers the foe’s Defense."
	},
	"gemeye": {
		"desc": "Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus. Once per switch-in, reflects the first reflectable opposing status move aimed directly at it. Side-targeting hazards do not use this reflection.",
		"shortDesc": "No opposing accuracy drops; ignores evasion; reveals Illusions — reflects the first direct opposing status move each entry."
	},
	"lastlaugh": {
		"desc": "If no other active Pokemon has a move left to use this turn, its damaging attack bypasses Substitute. Damaging a foe with that attack restores 1/8 max HP, once per turn.",
		"shortDesc": "When no other Pokemon will move this turn, its hit bypasses Substitute and heals 1/8."
	},
	"livingtangle": {
		"desc": "Contact attackers lose 1 Speed stage. Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move.",
		"shortDesc": "Contact attackers lose 1 Speed; Opposing HP hits heal 1/16; +1 Defense once per turn — contact slows foes while opposing hits raise Defense and heal."
	},
	"rootrenewal": {
		"desc": "Heals 1/3 max HP on switching out. Switching out also cures one adjacent active ally's major status condition.",
		"shortDesc": "Heals 1/3 HP on switching out."
	},
	"fortunatewing": {
		"desc": "Raises critical-hit rate by one stage. Once per switch-in, its first critical hit to damage a foe creates Safeguard for 5 turns. Does not shorten an existing longer Safeguard.",
		"shortDesc": "+1 critical-hit stage — the first critical hit each entry sets Safeguard for 5 turns."
	},
	"snowpack": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Contact moves have 1.3x power.",
		"shortDesc": "Half Fire/Ice attacking stats; immune to hail damage; 30% contact frostbite; heals in icy weather/fields; no hail damage; Contact moves have 1.3x power."
	},
	"stonewall": {
		"desc": "Prevents OHKO moves. At full HP, survives an otherwise fatal attack hit with 1 HP. When Sturdy saves it from a direct hit, it sets one layer of Spikes on the opposing side.",
		"shortDesc": "Survives a hit at full HP; immune to OHKO moves."
	},
	"saltbastion": {
		"desc": "Prevents OHKO moves. At full HP, survives an otherwise fatal attack hit with 1 HP. When Sturdy saves it from a direct hit, its side gains Safeguard for 5 turns.",
		"shortDesc": "Survives a hit at full HP; immune to OHKO moves."
	},
	"anchorbridge": {
		"desc": "Immune to OHKO moves; at full HP survives an otherwise fatal direct hit with 1 HP. Takes 0.8x attack damage, or 0.6x from super-effective attacks. Normal ability suppression and Mold Breaker rules apply. Does not create Light Screen.",
		"shortDesc": "Survives a hit at full HP; immune to OHKO moves; 20% less attack damage; 40% less if super effective — 20% less attack damage, 40% less if super effective."
	},
	"layeredshell": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Once per switch-in, its first opposing special hit deals a further 25% less damage.",
		"shortDesc": "No critical hits; 20% less damage; foe stat drops give +2 Sp. Def — the first special hit each entry deals 25% less damage."
	},
	"fossilram": {
		"desc": "Prevents move recoil except Struggle. Crash and Life Orb damage still apply. Once per turn, damaging a foe with a recoil move lowers its Speed by 1 stage. Struggle recoil is not prevented.",
		"shortDesc": "No move recoil except Struggle — once per turn, recoil-move damage lowers the foe’s Speed."
	},
	"rootediron": {
		"desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. At the end of turns in which it did not attempt a damaging move, it restores 1/16 max HP. Also retains this server's Stamina on-hit Defense gain and healing.",
		"shortDesc": "Opposing HP hits heal 1/16; +1 Defense once per turn — heals 1/16 HP on turns when it does not attack."
	},
	"encorearia": {
		"desc": "Doubles move secondary-effect chances and removes charging turns. Once per switch-in, successfully applying a move secondary effect creates Safeguard for 5 turns. A blocked secondary does not trigger this effect.",
		"shortDesc": "Double secondary-effect chances; no charging turns — the first secondary effect each entry sets 5-turn Safeguard."
	},
	"peppersting": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. After using a Fire move, its first Grass attack to damage a foe each switch-in lowers that foe's Speed and Sp. Def by 1 stage.",
		"shortDesc": "No sleep or Yawn; 1.3x Dark/Ghost power — a Fire move primes the next Grass hit to lower Speed and Sp. Def."
	},
	"sushitrick": {
		"desc": "On entry, heals each adjacent ally by 1/4 max HP and cures its confusion.",
		"shortDesc": "Entry heals adjacent allies by 1/4 HP and cures their confusion."
	},
	"mastercourse": {
		"desc": "Reverses received stat-stage changes, except Z-Power changes. Once per turn, damaging a foe with a Water or Dragon attack gives an adjacent ally +1 critical-hit stage for its next damaging move. The charge does not stack and ends on switching out.",
		"shortDesc": "Reverses stat changes except Z-Power — Water or Dragon hits grant an adjacent ally +1 critical-hit stage."
	},
	"secondbrew": {
		"desc": "Once per turn, when it receives draining-move healing, it also restores 1/8 of the lowest-HP adjacent ally's max HP.",
		"shortDesc": "Once per turn, when it receives draining-move healing, it also restores 1/8 of the lowest-HP adjacent ally's HP."
	},
	"railsight": {
		"desc": "Moves cannot be redirected. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Once per switch-in, surviving a whole opposing damaging move that hits HP stores a non-stacking 1.5x boost for the next Electric attack. Consumed when that attack executes, including misses, Protect or immunity; charge-only and interrupted turns do not consume it. Switching clears it. Does not skip Electro Shot charging, grant an extra Sp. Atk boost or ignore screens.",
		"shortDesc": "Ignores redirection; surviving a foe HP-damaging move once per entry powers the next Electric attack by 1.5x."
	},
	"pollenengine": {
		"desc": "Doubles Speed in sun or Stage 4 Flower Garden. Once per turn, successfully hitting a foe with a powder move or damaging Grass move heals itself and adjacent allies by 1/16 max HP, or 1/8 in sunlight.",
		"shortDesc": "Double Speed in sun or Stage 4 Flower Garden — Grass or powder hits heal it and its allies, more in sun."
	},
	"titanpincer": {
		"desc": "Other Pokemon cannot lower its Attack. Crabhammer and physical Steel-type moves use its Defense instead of Attack when its Defense is higher.",
		"shortDesc": "Other Pokemon cannot lower its Attack."
	},
	"tidaldominion": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Opponents with a lowered Speed stage cannot hit it or its allies with priority moves. Pairs with G-Max Foam Burst's existing Speed drops.",
		"shortDesc": "Double Speed in rain and water fields — foes with lowered Speed cannot use priority against its side."
	},
	"ironlash": {
		"desc": "On entry, it gains +1 accuracy. Its Tail moves have their power multiplied by 1.5. Gains +1 accuracy on entry and tail moves have 1.5x power. Once per turn, damaging a foe with a tail move also raises its Sp. Def by 1 stage.",
		"shortDesc": "On entry: +1 accuracy. Tail moves have 1.5x power — tail hits raise Sp. Def once per turn."
	},
	"gritgrappler": {
		"desc": "Attack is 1.5x while statused, and burn does not weaken physical attacks. While statused, damaging a foe with a Fighting move restores 1/16 max HP once per turn.",
		"shortDesc": "1.5x Attack while statused; ignores burn attack penalty."
	},
	"dreadjaw": {
		"desc": "Gains +1 Attack for each Pokemon knocked out by its move. A move KO also stores one charge that lowers the next opposing entrant's Attack by 1 stage. Charges do not stack and end when the holder leaves.",
		"shortDesc": "Move KOs give +1 Attack — a move KO lowers the next opposing entrant's Attack."
	},
	"floehunter": {
		"desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. In snow or hail, biting moves always critically hit slower targets, unless critical hits are prevented.",
		"shortDesc": "Double Speed in hail, snow and icy fields — bites always crit slower foes in snow or hail, unless blocked."
	},
	"lanceguard": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Blocking a contact move with Protect lowers the attacker's Defense by 1 stage.",
		"shortDesc": "Critical-hit protection; 20% less attack damage; blocking contact with Protect lowers foe Defense by 1."
	},
	"herdshelter": {
		"desc": "Immune to other Pokemon's sound moves. Adjacent allies are also immune to opposing damaging sound moves.",
		"shortDesc": "Immune to others' sound moves."
	},
	"tidalvoice": {
		"desc": "Liquid Voice: sound moves become Water-type (Ice on Icy Field) and gain 1.3x power, including already-Water moves such as Sparkling Aria. Sound moves spare allies. Its first damaging sound hit each entry clears its negative stat stages. After executing Sparkling Aria, each active adjacent ally heals 1/8 of its max HP once per move, even if foes avoid the attack. Does not heal the user or benched allies; Heal Block applies.",
		"shortDesc": "1.3x sound, spares allies, first hit clears drops; Aria heals adjacent allies 1/8."
	},
	"rechargerelay": {
		"desc": "Battery, including its existing Electric Terrain effect. Switching with Volt Switch restores 1/8 of the incoming teammate's max HP.",
		"shortDesc": "Battery, including its existing Electric Terrain effect. Switching with Volt Switch restores 1/8 of the incoming teammate's HP."
	},
	"hovercannon": {
		"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Above half HP, damaging Electric moves cannot miss or be redirected. Type and ability immunities still apply.",
		"shortDesc": "Airborne; immune to Ground attacks unless grounded — above half HP, Electric attacks cannot miss or be redirected."
	},
	"twilightinstinct": {
		"desc": "The first opposing damaging HP hit each stay deals 0.75x damage. If an opponent damages it before it acts, it prepares +1 priority for its next normally zero-priority damaging move on the following turn. One charge, consumed on attempt even if it misses or is protected; expires at that following turn's end. Status and already-prioritized moves receive no boost.",
		"shortDesc": "First foe hit each stay deals 25% less; hit before acting readies a next-turn priority attack."
	},
	"heatreservoir": {
		"desc": "Absorbs Fire moves and gains a 1.5x Fire boost until switching out or losing the ability. Burning Field or grounded Volcanic Field also grants the boost. On Cold Eclipse, Fire absorption is disabled and entry gives +1 Defense and Sp. Def. After a boosted Armor Cannon deals damage, consumes the Flash Fire charge to prevent Armor Cannon's own Defense and Sp. Def drops.",
		"shortDesc": "Absorbs Fire for a 1.5x Fire boost; Cold Eclipse gives defenses instead — a boosted Armor Cannon avoids its own defensive drops."
	},
	"mourningcoat": {
		"desc": "Takes half contact damage. Fire moves deal double damage until a teammate has fainted; afterward the extra Fire weakness stays removed for the battle.",
		"shortDesc": "Half contact damage; double Fire damage until a teammate has fainted."
	},
	"gravewind": {
		"desc": "Doubles Speed in sandstorm or on Desert and Ashen Beach. Immune to sandstorm damage. Entering directly into a fainted teammate's slot summons sandstorm for 3 turns. Does not shorten or refresh an existing sandstorm.",
		"shortDesc": "Double Speed in sand or sandy fields; no sand damage — entering a fainted ally's slot summons sand for 3 turns."
	},
	"dozinggiant": {
		"desc": "Prevents and cures attraction and Taunt. Blocks Captivate and Intimidate's Attack drop. While asleep, takes 25% less damage from special attacks. Sleep Talk cannot select Rest.",
		"shortDesc": "No attraction/Taunt, Captivate or Intimidate Attack drop."
	},
	"quillreservoir": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Absorbing a Water move primes its next landed damaging Poison move to poison the target. The charge does not stack; normal status immunities apply.",
		"shortDesc": "Absorbs Water for 1/4 HP; after absorbing Water, its next landed Poison attack poisons the foe."
	},
	"dreadpresence": {
		"desc": "Opponents lose 1/8 max HP after successfully using a status move, at most once per opponent per turn. Failed moves do not trigger this effect.",
		"shortDesc": "Opponents lose 1/8 HP after successfully using a status move, at most once per opponent per turn. Failed moves do not trigger this effect."
	},
	"palmmastery": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. Force Palm always inflicts paralysis when it lands, subject to status immunities. Its paralysis becomes a primary effect rather than a secondary roll.",
		"shortDesc": "Half Fire/Ice attacking stats; immune to hail damage — Force Palm always paralyzes when it lands."
	},
	"galvanicspirit": {
		"desc": "Vital Spirit, including this server's sleep immunity, 1.3x Fighting attack-stat boost and 20% direct-damage reduction. Contact Electric hits lower the foe's Sp. Def by 1 stage once per turn.",
		"shortDesc": "Electric contact hits lower Sp. Def once per turn."
	},
	"blastchamber": {
		"desc": "Vital Spirit, including sleep immunity, 1.3x Fighting attack-stat boost and 20% direct-damage reduction. A landed Fire attack makes its next Fighting attack unable to miss, and a landed Fighting attack does the same for its next Fire attack. Charges end on switching.",
		"shortDesc": "Fire and Fighting hits make the other type's next attack never miss."
	},
	"lastbrood": {
		"desc": "When it has 1/3 or less of its max HP, rounded down, its offensive stat is multiplied by 1.5 while using a Bug-type attack. Once per battle, surviving an opposing hit that crosses from above half HP to half or less creates a Substitute with 1/8 max HP, at no HP cost. Cannot replace an existing Substitute.",
		"shortDesc": "At 1/3 or less of its max HP, its offensive stat is 1.5x with Bug attacks — once per battle, crossing half HP creates a 1/8-HP Substitute."
	},
	"silksights": {
		"desc": "Moves have 1.3x accuracy and ignore evasion boosts. Prevents opposing accuracy drops and reveals opposing Illusions on entry. Mirror Arena entry gives +1 accuracy and Laser Focus, once per activation. Electric moves ignore positive defensive stages against foes with lowered Speed.",
		"shortDesc": "1.3x accuracy; ignores evasion; no foe accuracy drops; Electric moves bypass boosts on slowed foes."
	},
	"livenet": {
		"desc": "While it is active, it prevents opposing Pokemon from using their Berries. This Ability activates before hazards and other Abilities take effect. While active, Sticky Web placed by it also deals 1/16 max HP of Electric damage to grounded entrants. Heavy-Duty Boots, hazard immunity and Electric immunity prevent the added damage.",
		"shortDesc": "While it is active, it prevents opposing Pokemon from using their Berries — its Sticky Web also chips grounded entrants with Electric damage."
	},
	"barbharvest": {
		"desc": "Contact attackers lose 1/8 of their max HP. After taking three opposing contact moves, restores its consumed Berry once per battle, if its item slot is empty. Multi-hit attacks count as one move; progress persists through switching.",
		"shortDesc": "Contact attackers lose 1/8 HP — restores its used Berry after three opposing contact attacks, once per battle."
	},
	"toxicserenity": {
		"desc": "Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland. While poisoned or badly poisoned, Dragon moves cannot miss.",
		"shortDesc": "Poison heals 1/8 HP; healing on corrosive fields — Dragon moves cannot miss while poisoned."
	},
	"mudtemper": {
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Surviving an opposing Fire or Water hit raises Sp. Def by 1 stage once per turn.",
		"shortDesc": "Critical-hit protection; 20% less attack damage; surviving Fire/Water hits gives +1 Sp. Def once per turn."
	},
	"lockjaw": {
		"desc": "Biting moves have 1.5x power. Biting hits inflict Torment on a surviving foe for 2 turns. Does not prevent switching.",
		"shortDesc": "Bites have 1.5x power."
	},
	"rivershell": {
		"desc": "Shell Armor, including this server's damage reduction and field/stat-drop effects. Shell Smash does not lower its Defense, but still lowers its Sp. Def.",
		"shortDesc": "Shell Smash keeps Defense but still lowers Sp. Def."
	},
	"funeralchoir": {
		"desc": "Damaging sound moves restore 1/32 max HP per currently fainted teammate, capped at 1/8 and once per turn. While a teammate is fainted, damaging Ghost moves also become sound moves, including sound interactions such as Soundproof and Substitute bypass.",
		"shortDesc": "Sound hits heal per fainted ally; Ghost attacks become sound after an ally faints."
	},
	"festivalstep": {
		"desc": "Landing a damaging dance move against a foe clears its negative stat stages after damage. Positive stages are preserved; blocked or missed moves do not trigger the effect.",
		"shortDesc": "Dance hits clear its negative stat stages."
	},
	"saltcrust": {
		"desc": "Other Pokemon cannot lower its stat stages. While Defense is positively boosted, opponents cannot remove its held item. Does not prevent its boosts being reset, stolen or ignored.",
		"shortDesc": "Other Pokemon cannot lower its stats — while Defense is boosted, its held item cannot be removed."
	},
	"beyondfear": {
		"desc": "Prevents flinching and Intimidate's Attack drop. Once per switch-in, an opposing Attack increase grants +1 Defense, or an opposing Sp. Atk increase grants +1 Sp. Def. A move raising both grants both, consuming the one activation.",
		"shortDesc": "Cannot flinch; blocks Intimidate — an opposing offensive boost grants a matching defensive boost once per entry."
	},
	"stillwater": {
		"desc": "Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Absorbing a Water move while already at full HP raises Sp. Def by 1 stage once per turn.",
		"shortDesc": "Absorbs Water; absorbing it at full HP gives +1 Sp. Def once per turn."
	},
	"quarrycannon": {
		"desc": "Solid Rock, including this server's 20% damage reduction and additional 25% reduction against super-effective hits. Rock Blast always hits five times unless interrupted. Does not alter Z/Max moves or Rock Wrecker recharge rules.",
		"shortDesc": "Rock Blast always hits five times."
	},
	"tundramarch": {
		"desc": "Prevents and cures attraction and Taunt. Blocks Captivate and Intimidate's Attack drop. Landing a Ground attack on a foe removes Spikes, Toxic Spikes and Sticky Web from its own side. Ground immunity, Protect and Substitute prevent this activation. Stealth Rock remains.",
		"shortDesc": "No attraction/Taunt, Captivate or Intimidate Attack drop — Ground hits remove Spikes, Toxic Spikes, and Sticky Web."
	},
	"undertow": {
		"desc": "Water Absorb, including its field effects. Damaging Water hits ground surviving foes as with Smack Down. Does not trap them or bypass protection, Substitute or Water immunity.",
		"shortDesc": "Water hits ground surviving foes."
	},
	"deadwater": {
		"desc": "Foes receive half their normal passive end-of-turn healing. Absorbs the HP actually prevented, capped at 1/8 of its max HP per turn. Excludes healing moves, Wish, draining, Leech Seed and switching recovery. Multiple Deadwater holders do not stack.",
		"shortDesc": "Halves foes' passive end-turn healing and absorbs up to 1/8 HP per turn."
	},
	"vitalcircuit": {
		"desc": "Electric attacks without an existing drain effect restore 25% of damage dealt to foes, capped at 1/8 max HP per turn, including Big Root. Respects Liquid Ooze and Heal Block. Does not add to or cap a move's existing drain effect.",
		"shortDesc": "Electric attacks drain 25% of damage, capped at 1/8 HP per turn."
	},
	"ringmaster": {
		"desc": "Contact moves have 1.3x power. Its first damaging Dark hit against a surviving foe each entry attempts to inflict Taunt for 2 turns. Normal Taunt immunities apply; no Fake Out requirement.",
		"shortDesc": "Contact moves have 1.3x power — first Dark hit each entry Taunts the foe for 2 turns."
	},
	"unyielding": {
		"desc": "Each opposing attack hit that damages HP heals 1/16 max HP. The first such hit each turn also raises Defense by 1, before later hits of a multi-hit move. While its Defense stage is positive, opponents cannot force it to switch. Normal switching and stat resets still work.",
		"shortDesc": "HP hits heal 1/16 and give +1 Defense once per turn; raised Defense blocks opposing forced switching."
	},
	"calculatedshot": {
		"desc": "Damaging Water moves gain +1 critical-hit stage and always use the highest normal damage roll. Does not increase fixed damage or bypass accuracy checks. Frisk reveals opposing Illusions (including itemless foes), reveals held items and independently has a 30% chance to Embargo each opposing item holder for 5 turns.",
		"shortDesc": "Water attacks gain +1 critical-hit stage and the highest normal damage roll."
	},
	"darkdominion": {
		"desc": "All damaging Dark moves have 4/3x power, or 0.75x with Aura Break. Multiple users do not stack. Immune to hail damage on Cold Eclipse. Damaging Dark hits inflict Heal Block on surviving foes for 2 turns, including the current turn. Respects protection and Substitute; does not shorten a longer existing Heal Block.",
		"shortDesc": "Boosts everyone's Dark moves; Aura Break reverses it — Dark hits Heal Block surviving foes for 2 turns."
	},
	"reinflate": {
		"desc": "Once per turn, after it finishes a sound-based damaging move that deals actual HP damage to an opponent, it restores 1/8 of its max HP if it remains active and survives. All hits and spread targets share one activation. Substitute-only, ally, self, delayed, missed, protected and immune damage do not qualify. Status moves do not qualify. Heal Block prevents recovery, and ability suppression disables this effect. Ability changes do not refresh the turn's activation.",
		"shortDesc": "Once per turn, after a sound move damages a foe's HP, restores 1/8 max HP."
	},
	"savageresolve": {
		"desc": "Full Guts: Attack is multiplied by 1.5 while statused, and burn does not halve physical damage. Once per actual entry, after surviving an entire opposing damaging move that dealt actual HP damage while it was already statused, it gains one Speed stage if still active. Status inflicted after a hit does not make that hit qualify. All hits and opponents share one activation. Substitute-only, ally, self, residual and delayed damage do not qualify. Switching resets usage; ability replacement and suppression do not. Suppression disables the effect. The Speed boost is an ordinary stat stage and does not remove paralysis's Speed penalty.",
		"shortDesc": "1.5x Attack while statused; surviving a qualifying foe move while statused gives +1 Speed once per entry."
	},
	"gildedgrace": {
		"desc": "Once per switch-in, it prevents the first Special Attack reduction caused by its own damaging move. The entire reduction is prevented. Opposing moves and status moves are unaffected. A reduction that cannot occur at -6 does not spend the use. Losing, regaining, or suppressing this Ability does not refresh it; switching out and back in does.",
		"shortDesc": "Once per entry, prevents its first Sp. Atk drop from its own damaging move."
	},
	"backwash": {
		"desc": "Once per turn, after it finishes a damaging Water-type move that deals actual HP damage to an opponent, its negative Attack and Special Attack stages reset to zero if it survives and remains active. The entire attack uses its current stats before the reset. Positive stages and all other stat stages remain unchanged. All hits and spread targets share one activation. Missed, protected, immune, Substitute-only, ally, self and delayed damage do not qualify. Ability suppression disables the effect, and ability changes do not refresh the turn's activation.",
		"shortDesc": "Once per turn, after Water damage to a foe's HP, clears its negative Atk/Sp. Atk stages."
	},
	"spentforce": {
		"desc": "After executing a damaging move, it has half attack damage and Speed for the next two complete turns, then automatically recovers. The triggering move finishes at full power, including all hits and spread targets. Attacking during fatigue does not extend it, and status moves or waiting do not accelerate recovery. Executed misses, Protect and immunities trigger fatigue; prevented execution and charging-only turns do not. Switching clears fatigue. Suppression disables the penalties but does not reset or pause the timer, and ability replacement does not reset it. Fixed-damage moves retain their fixed damage.",
		"shortDesc": "After an attack, half damage and Speed for two complete turns; then recovers."
	},
	"pulsefiltration": {
		"desc": "Water Absorb and Liquid Ooze, plus Poison-move absorption: Water or Poison moves from another Pokemon heal 1/4 max HP once instead of hitting, even if healing fails. Water Absorb also heals 1/16 on its supported water fields; Liquid Ooze reverses drain, Leech Seed and Strength Sap recovery, doubled on Murkwater Surface or Wasteland. On entry, attempts 5-turn Murkwater Surface. While Swalot-Pulse is active, Underwater immediately becomes 5-turn Murkwater Surface, including after its entry field use is spent; field blockers and suppression still apply. This does not refresh an existing Murkwater Surface. Swalot-Pulse always uses Sludge Wave, Recover, Infestation, and Discharge. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use.",
		"shortDesc": "Absorbs Water/Poison for 1/4 HP; drain harms foes; Swalot-Pulse changes Underwater to Murkwater."
	},
	"agonyflame": {
		"desc": "After it finishes a damaging Fire-type move that deals actual HP damage to an opponent, each surviving active opponent damaged by that move is burned if normal status protections allow, and receives Heal Block for 2 turns, including the current turn. Each target is affected once per move. Heal Block can apply even if burn fails, and a longer existing Heal Block is not shortened. If the move already burned a target, the Ability does not attempt to burn it again after a curing Berry. Protected, immune, Substitute-only, ally, self and delayed damage do not qualify. Ability suppression disables these effects.",
		"shortDesc": "Fire hits burn foes and block healing for 2 turns; requires actual opposing HP damage."
	},
	"pulseeruption": {
		"desc": "Camerupt-Pulse automatically receives Eruption, Snarl, Shadow Ball, and Earth Power in that order. Full Sturdy: OHKO moves fail, and direct move damage cannot KO it from full HP. On entry, attempts to create or refresh Super-Heated Terrain for 5 turns, respecting normal field restrictions. Skill Swap fails. At Camerupt-Pulse's fixed 1 HP, Sturdy can prevent repeated direct hits; indirect damage and ability bypass remain effective. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use. Camerupt must be at full HP immediately before Pulse Evolution or it faints before its HP is converted to 1.",
		"shortDesc": "5-turn Super-Heated field on entry; no Skill Swap."
	},
	"scrapbreaker": {
		"desc": "Moves ignore bypassable abilities. A connecting Gigaton Hammer removes the target side's Reflect, Light Screen and Aurora Veil before damage. Actual opposing HP damage also grounds the target as Smack Down; Substitute-only damage does not ground it. Normal accuracy, protection and consecutive-use restrictions remain.",
		"shortDesc": "Ignores abilities; Gigaton Hammer removes screens and grounds foes after HP damage."
	},
	"toxicsignature": {
		"desc": "Full Unnerve, including its field effects. Poison attacks dealing opposing HP damage place one Toxic Spikes layer on that side only if none exists. Damaging attacks against poisoned targets ignore accuracy and evasion stages but retain their base accuracy and other accuracy modifiers.",
		"shortDesc": "Poison HP hits lay a first Toxic Spikes layer; ignores stages vs poisoned foes."
	},
	"wickedweave": {
		"desc": "Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. A successful status move readies the next contact attack to lower a foe's Speed by 1 after actual HP damage. The charge does not stack, is consumed by a qualifying hit, and expires at the end of the following turn.",
		"shortDesc": "Status moves gain +1 priority; Dark foes usually block them — successful status moves ready a contact-hit Speed drop through the next turn."
	},
	"vaultkeeper": {
		"desc": "Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. Other Pokemon cannot remove its item while it survives. Sticky Barb can still transfer. While active, opposing moves cannot remove this side's Reflect, Light Screen or Aurora Veil. Normal expiration and damage bypass still work; applicable Mold Breaker effects bypass the protection.",
		"shortDesc": "Status moves gain +1 priority; Dark foes usually block them; Protects its item while it survives — protects this side's screens from opposing removal."
	},
	"flintfracture": {
		"desc": "Connecting slicing moves remove the target side's Reflect and Aurora Veil before damage. Opposing HP damage applies stone splinters dealing 1/16 max HP at the end of this turn and the following turn. Reapplication refreshes, never stacks; switching clears splinters. No slicing power multiplier.",
		"shortDesc": "Slicing attacks break Reflect/Veil; HP hits inflict two turns of 1/16 stone splinters."
	},
	"frozenfeast": {
		"desc": "Biting moves have 1.5x power. Ice moves dealing opposing HP damage lower each surviving target's Speed by 1 after the whole move, once per target, unless that move already successfully lowered its Speed. Biting attacks drain one quarter of their actual opposing HP damage if that target had negative Speed stages before the attack began. Normal draining interactions apply.",
		"shortDesc": "Bites have 1.5x power — Ice HP hits lower Speed once; bites drain 25% against already-slowed foes."
	},
	"cinderscales": {
		"desc": "Full Flame Body, Swarm and Shield Dust, including their existing field effects.",
		"shortDesc": "Full Flame Body, Swarm and Shield Dust, including their existing field effects."
	},
	"sporeshroud": {
		"desc": "Damaging hits have separate 10% chances to inflict sleep, paralysis or poison on the attacker; powder immunity blocks this. If Sleep Clause blocks sleep, a further roll can inflict paralysis or poison instead. Contact attacks deal 0.75x damage; non-contact physical attacks are unaffected.",
		"shortDesc": "Damaging attackers may sleep, be paralyzed or poisoned — takes 25% less damage from contact attacks."
	},
	"primevalhunt": {
		"desc": "Multi-hit moves always use their maximum hit count and have 1.5x power. Moves that normally check accuracy per hit check only once. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. The final scheduled hit of a move with at least three hits is a guaranteed critical hit unless critical-hit immunity prevents it. Earlier hits retain normal critical chances; interruption does not promote an earlier hit.",
		"shortDesc": "Maximum multi-hit count; 1.5x multi-hit power; No critical hits; 20% less damage; foe stat drops give +2 Defense — final scheduled hit of 3+ hit moves critically hits."
	},
	"rimebreaker": {
		"desc": "Full Refrigerate, including its field boosts only for converted moves. Once per turn, an Ice move dealing opposing HP damage removes this side's Stealth Rock and one Spikes layer. Toxic Spikes and Sticky Web remain. Natural Ice moves receive no extra ability damage boost.",
		"shortDesc": "Ice HP hits clear own Stealth Rock and one Spikes layer once per turn."
	},
	"evaporate": {
		"desc": "Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. On entry, ends ordinary rain but not Primordial Sea. Once per stay, ending rain or absorbing Water grants one Steam Veil; the next damaging special HP hit deals 0.75x damage and consumes it. It cannot stack or refresh within that stay.",
		"shortDesc": "Absorbs Water; ends ordinary rain; once per stay, ending rain or absorbing Water gives a special-hit veil."
	},
	"pressurekiln": {
		"desc": "Stores half the actual HP damage from opposing direct moves, up to 1/4 max HP. Its next Fire attack dealing opposing HP damage consumes the reservoir and heals the stored amount. Residual, recoil, ally and Substitute-only damage do not fill it. Switching clears storage.",
		"shortDesc": "Stores half foe move HP damage (cap 1/4 max HP); next Fire HP hit consumes it to heal."
	},
	"shattercrust": {
		"desc": "Full Crumbling Shell: physical HP hits set Stealth Rock on the attacker's side if absent (an allied attacker instead selects the opposing side), except on Water Surface, Underwater, Murkwater Surface and Swamp. Additionally, the first opposing physical HP hit each stay deals half damage; if it survives it, adds one Spikes layer to the attacker's side.",
		"shortDesc": "Physical hits set Stealth Rock; first opposing physical HP hit each stay deals half damage and adds Spikes."
	},
	"restorativechime": {
		"desc": "Once per stay, a healing move that actually restores HP also cures the healed recipient's major status; Rest is excluded. Wish checks and consumes the originating entry's cure only when it heals its eventual recipient. Successful sound moves heal it by 1/8 max HP once per turn.",
		"shortDesc": "Healing moves cure a healed recipient once per stay (not Rest); successful sound moves heal 1/8 per turn."
	},
	"gravehunger": {
		"desc": "Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field. Ghost attacks drain 25% of actual opposing HP damage, without adding drain to moves that already drain. While active, halves opposing active Pokemon's healing and gains the HP actually prevented. Combined new healing is capped at 1/8 max HP per turn; opposing healing stays reduced when it is full or capped. Bench healing and switching-out Regenerator are unaffected. Normal healing blockers and drain interactions apply.",
		"shortDesc": "Sleeping foes lose 1/8 HP per turn, except on Rainbow — Ghost HP hits drain 25%; halves foe healing and takes prevented HP (combined cap 1/8 per turn)."
	},
	"primevalhunger": {
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile each turn. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply. Draining attacks that damage a foe's HP inflict Heal Block through the end of the following turn. After the whole move, lower one positive Attack or Sp. Atk stage of each damaged foe, choosing the more boosted stat and Sp. Atk on ties. Never lowers an unboosted stat or grants the user a boost. Substitute-only damage does not trigger these effects; normal stat-drop protections apply.",
		"shortDesc": "Fire/Ice protection; automatic Stockpiles/releases; drain hits block healing and lower a positive attacking stage."
	},
	"dawnherald": {
		"desc": "On entry, summons sun for 5 turns, or 8 with Heat Rock. Allies take 25% less attack damage; the holder does not. Normal weather blocking, ability suppression and bypass rules apply.",
		"shortDesc": "Summons sun; allies take 25% less attack damage."
	},
	"transfixinggaze": {
		"desc": "Frisk: removes opposing Illusions, reveals their held items, and each revealed item holder has a 30% chance of Embargo. While it remains active with its ability functioning, opposing moves cannot switch their user out. Damage, stat changes and other move effects still occur. Manual switching, forced switching and item-triggered switches remain allowed. If it faints, leaves or loses its ability before the move finishes, the pivot succeeds. No lingering mark.",
		"shortDesc": "Reveals items/Illusions; item holders may receive Embargo; opposing moves cannot pivot while it stays active."
	},
	"freshplumage": {
		"desc": "Natural Cure: cures status when switching out and heals 1/3 max HP only when curing a status; Bewitched Woods cures status at turn end without that heal. The first successful Flying damaging move each entry deals 1.2x damage across its entire hit sequence. Misses, Protect and immunity do not consume it; damaging a Substitute does. No additional recoil protection or Body Press bonus. Switching back in resets the Flying bonus.",
		"shortDesc": "Switching cures status; first successful Flying attack each entry deals 1.2x damage."
	}
};

Object.assign(AbilityDescriptionOverrides, {
	"glacialmass": {
		"name": "Glacial Mass",
		"desc": "Heavy Metal + Thick Fat: doubles weight, halves physical attack damage, and halves the attacking stat of Fire- and Ice-type moves. Immune to hail damage. On entry to Factory Field, Defense rises one stage and Speed falls one stage. On Cold Eclipse, Defense and Sp. Def are 1.5x, the field Speed penalty is ignored, and hail heals 1/10 max HP each turn.",
		"shortDesc": "Double weight; halves physical and Fire/Ice damage; hail immunity."
	},
	"unleashedego": {
		"name": "Unleashed Ego",
		"desc": "Ultra Ego + Levitate + Raging Storm. Airborne unless grounded. Damaging hits from foes raise Attack and Sp. Atk once until it uses an attack; heals 1/16 max HP on that hit and 1/20 on further hits. Dealing attack damage heals 1/16 once per turn. Ashen Beach, New World, Starlight Arena, Cold Eclipse and Fairy Tale add once-per-entry Defense/Sp. Def boosts for physical/special hits and a one-use 1/4-HP pinch heal. Royal Decree or Empress enables 1.3x power (except against Battle Bond) and 0.7x incoming damage unless Neutralization is active. Bewitched Woods, Haunted and Holy fields disable Ultra Ego effects. Raging Storm bypasses abilities, screens, Substitute and defensive stat stages; +1 critical-hit ratio. Attack KOs splash 60% of the recorded hit damage onto remaining foes, or grant +1 Attack if no splash damage is dealt. Battle Armor prevents critical hits, gives 0.8x incoming damage, +2 Defense after opposing stat drops, and +1 Defense on Fairy Tale entry. Incoming priority damage is further halved. Immune to hail; cannot be suppressed.",
		"shortDesc": "Ultra Ego boosts/healing; airborne; bypasses defenses; KO splash; armor."
	},
	"moonlithide": {
		"name": "Moonlit Hide",
		"desc": "Shadow Shield + Magic Guard: takes 20% less attack damage at any HP, or 40% less if super effective. Immune to indirect damage. On entry to Fairy Tale Field, Sp. Def rises one stage. Ability-ignoring moves cannot bypass the damage reductions; suppression disables the ability.",
		"shortDesc": "Takes 20% less attack damage, or 40% if super effective. Immune to indirect damage."
	}
});

AbilityDescriptionOverrides.conquerorswill = {
	"desc": "Supreme Overlord + Unnerve. Move power gains 10% per fallen ally, including an allied side, with no cap; Free-for-All doubles the count. At 2 fallen, moves bypass screens and Substitute; at 4, cannot flinch; at 5, gains +1 Attack and Sp. Atk once per entry and immunity to indirect damage. Faints update these effects while active. Opponents cannot eat Berries or use field Seeds. On Cold Eclipse entry, lowers each foe's Speed one stage unless behind Substitute. Kowtow Cleave removes opposing Reflect, Light Screen and Aurora Veil before damage, even through Substitute; protection, a miss or immunity prevents removal. Suppression disables this ability.",
	"shortDesc": "Grows stronger as allies fall. Opponents cannot eat Berries. Kowtow Cleave breaks their screens."
};

AbilityDescriptionOverrides.parentalbond = {
	"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Eligible attacks hit twice; the second hit deals 80% damage. Existing multi-hit moves, spread hits, charging or delayed attacks, Z/Max moves and moves barred from extra hits are excluded. Contact moves have 1.3x power. Normal- and Fighting-type moves can hit Ghosts. Allies take 25% less attack damage; this does not protect the holder. Cannot be suppressed.",
	"shortDesc": "Mold Breaker; attacks hit twice (second hit 80%); stronger contact moves; protects allies."
};

AbilityDescriptionOverrides.spiralevolution = {
	"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Damaging moves pierce protection at half power. Normal-priority moves act first in Trick Room without gaining priority. Ignores field Speed penalties and takes 20% less attack damage. Twineedle has double power.",
	"shortDesc": "Mold Breaker; stronger STAB; airborne; Dual Wield; bypasses screens/Substitute; 20% less damage."
};

AbilityDescriptionOverrides.toxicevolution = {
	"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Poisoned foes may be confused, attackers may be poisoned, and Ground moves do not affect the holder.",
	"shortDesc": "Mold Breaker; Corrosion + Dual Wield + Shield Dust + Levitate."
};

AbilityDescriptionOverrides.toxicevolution = {
	"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Poisoned foes may be confused, attackers may be poisoned, and Ground moves do not affect the holder. Once per turn, successfully poisoning a foe with its own move or poison retaliation restores 1/8 of its maximum HP.",
	"shortDesc": "Mold Breaker; Corrosion + Dual Wield + Shield Dust + Levitate; own poison heals 1/8 HP once/turn."
};

AbilityDescriptionOverrides.mythicscale = {
	"desc": "Defense is 1.5x while statused or on Misty, Rainbow, Fairy Tale, Dragon's Den and Starlight Arena. Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Moves have 1.3x accuracy. Mirror Arena entry gives +1 accuracy and Laser Focus. Blocks secondary effects of other Pokemon's attacks that affect it; effects on the attacker still work.  Called or reflected moves do not trigger this bonus. Once per entry, the first foe successfully statused by its directly selected powder move or directly executed G-Max Befuddle grants it +1 Defense and its active allies +1 Sp. Def. These moves share one activation; the holder does not gain Sp. Def.",
	"shortDesc": "Marvel Scale + Levitate + Compound Eyes + Shield Dust; powder/Befuddle status: +1 Def, allies +1 SpD once/entry."
};

AbilityDescriptionOverrides.nightwatch = {
	"desc": "Keen Eye + Insomnia: reveals opposing Illusions; ignores evasion and prevents opposing accuracy drops. Mirror Arena entry grants +1 accuracy and Laser Focus. Prevents sleep and Yawn; Dark and Ghost attacks have 1.3x power. Once per entry, after observing the same foe execute the same directly selected status move on consecutive turns, attempts normal Disable after its second use. Observations reset when either Pokemon leaves; called, reflected and allied moves do not count.",
	"shortDesc": "Keen Eye + Insomnia; once/entry, Disables a foe repeating its status move on consecutive turns."
};

AbilityDescriptionOverrides.fruitfulbough = {
	"desc": "Harvest: at each turn end, has a 50% chance to restore its last consumed Berry or eligible field seed if it has no item; always restores in sun, Grassy Terrain or Flower Garden 2. Consuming its own Berry heals each active ally by 1/8 of that ally's maximum HP once per turn. The holder receives only the Berry's normal benefit. Removed, stolen or restored items and consumed seeds do not trigger ally healing.",
	"shortDesc": "Harvest; consuming its own Berry heals active allies 1/8 HP once/turn, excluding itself."
};

AbilityDescriptionOverrides.soulanchor = {
	"desc": "Steelworker: Steel attacks gain STAB and 1.5x Attack or Sp. Atk (2x on Factory); on Short-Circuit they also become Electric-type. Immune to Poison attacks; resists Normal, Flying, Rock, Bug, Steel, Grass, Psychic, Ice, Dragon and Fairy attacks. A foe successfully trapped by its Anchor Shot loses 1/16 maximum HP each turn end; the holder heals by actual damage dealt. Only one tether per holder; a new tether replaces the old, and either Pokemon leaving ends it. Trap immunity, escape, indirect-damage immunity, suppression and healing restrictions apply.",
	"shortDesc": "Steelworker; its Anchor Shot tethers one trapped foe, draining 1/16 HP each turn."
};

AbilityDescriptionOverrides.guidinglight = {
	"desc": "Dazzling + Illuminate: blocks opposing priority moves aimed at its side; reveals Illusions, ignores evasion and prevents opposing accuracy drops. Mirror Arena entry lowers opposing accuracy; Starlight Arena entry grants +2 Sp. Atk and spotlights a partner. Successfully using Spotlight on an ally makes that ally take 20% less attack damage for the rest of the turn. Does not stack or change Spotlight redirection rules.",
	"shortDesc": "Dazzling + Illuminate; successful Spotlight on an ally reduces its attack damage taken 20% this turn."
};

AbilityDescriptionOverrides.royalescort = {
	"desc": "Pressure + Sweet Veil: opposing moves targeting it cost 1 extra PP (2 in Midnight Zone); prevents sleep and Yawn for its side. Entry lowers opposing Defense and Sp. Def by 1 (2 on Cold Eclipse); Underwater becomes Midnight Zone. Once per entry, the first qualifying Order grants one reward: Attack Order damaging a foe lowers that foe's Attack by 1; successful Defend Order shields active allies against their next damaging hit by 25%, until the end of the following turn; Heal Order actually healing the holder heals active allies by 1/8 maximum HP. All three share one budget; failures do not spend it. The holder receives no extra ally shield or heal. Shields do not stack.",
	"shortDesc": "Pressure + Sweet Veil; once/entry, one successful Order weakens a foe, shields allies or heals allies."
};

AbilityDescriptionOverrides.liquidarsenal = {
	"desc": "Technician: moves with effective power 60 or less gain 1.5x power (80 or less on Factory). Water attacks use the lower of the target's current, fully modified Defense and Sp. Def while keeping their category and normal attacking stat. Ties keep the normal defense. Explicit defensive-stat overrides and fixed-damage rules retain precedence.",
	"shortDesc": "Technician; Water attacks use the target's lower Defense or Sp. Def without changing category."
};

AbilityDescriptionOverrides.knightsreprisal = {
	"desc": "Bulletproof: immune to bullet and pulse moves; takes 20% less attack damage. Successfully blocking an opposing damaging move with Spiky Shield stores one nonstacking charge: the next damaging move gains +1 priority. Using that move or switching consumes the charge. Normal priority blockers apply.",
	"shortDesc": "Bulletproof; blocking an attack with Spiky Shield grants the next damaging move +1 priority."
};

AbilityDescriptionOverrides.aurorasanctum = {
	"desc": "Snow Warning: summons hail on entry; on Cold Eclipse, damaging hits Disable the attacker's move under the usual local restrictions. While Aurora Veil is active on its side, opposing Pokemon cannot lower the holder's or its active allies' stats. Self-inflicted drops remain. This protection ends with Aurora Veil or ability suppression and adds no damage reduction.",
	"shortDesc": "Snow Warning; while its side has Aurora Veil, blocks opposing stat drops for itself and allies."
};

AbilityDescriptionOverrides.chargedtail = {
	"desc": "Static: contact attackers have a 30% chance to be paralyzed, or 60% on Electric Terrain or Short-Circuit. Successfully paralyzing a Pokemon with its own Nuzzle grants normal Charge after Nuzzle finishes, doubling its next Electric attack. Charge does not stack; failed paralysis grants nothing.",
	"shortDesc": "Static; successful Nuzzle paralysis grants Charge for the next Electric attack."
};

AbilityDescriptionOverrides.falsebouquet = {
	"desc": "Its first damaging Flower Trick against a surviving foe each entry attempts Leech Seed; Grass immunity and Substitute still apply. Includes full local Magician: when itemless, steals a removable item after an eligible damaging move, respecting normal theft restrictions. Fairy Tale, Bewitched Woods, Haunted, Misty and New World entry grant +1 Sp. Atk; on Psychic Terrain, incoming status moves with numeric accuracy use 50 accuracy.",
	"shortDesc": "Magician; first Flower Trick hit each entry attempts Leech Seed."
};

AbilityDescriptionOverrides.stancechange = {
	"desc": "This Pokemon has Dual Wield. Aegislash changes to Blade Forme before attacking and Shield Forme before King's Shield. Shield Forme takes 20% less damage; consecutive Free-for-All hits deal 30% less damage. Blade Forme deals 1.2x damage. On Fairy Tale and Chessboard, activation raises Defense and Special Defense by 1; switching to Blade raises Attack and Special Attack by 1 and lowers both defenses by 1, with the reverse on switching to Shield. Once per entry, successfully blocking an opposing contact attack with King's Shield attempts normal Disable after the attack ends, lasting for the next two turns. Does not affect Aegislash-Gmax's separate ability.",
	"shortDesc": "Changes stance; retains local attack/defense bonuses. Once/entry, King's Shield contact block Disables for 2 turns."
};

AbilityDescriptionOverrides.curiousmedicine = {
	"desc": "On entry, clears negative stat stages and confusion from the holder and active allies, keeping positive stages. Each Pokemon actually cleansed recovers 1/8 maximum HP, subject to normal healing restrictions. Does not affect the bench.",
	"shortDesc": "On entry, clears self/allies' negative stages and confusion; each cleansed Pokemon heals 1/8 HP."
};

AbilityDescriptionOverrides.eldritchremedy = {
	"desc": "Own Tempo + Curious Medicine: prevents confusion and Intimidate Attack drops. On entry, clears negative stages and confusion from self and active allies, keeping positive stages; each Pokemon cleansed heals 1/8 maximum HP. Once per turn, a damaging Eerie Spell cures one major status: the holder first, otherwise the statused active ally with lowest HP percentage. Does not affect the bench.",
	"shortDesc": "Own Tempo + Curious Medicine; Eerie Spell cures one major status on self or an active ally once/turn."
};

AbilityDescriptionOverrides.infernaldominion = {
	"desc": "Intimidate. A successful Fire attack partially traps one foe as Fire Spin, with residual damage at this turn end and the next. A new ability trap releases its previous target; existing partial traps do not stack. The trap ends when the holder leaves, loses the ability or Mega Evolves. Normal partial-trapping escape, damage and item rules apply.",
	"shortDesc": "Intimidate; Fire hits partially trap one foe for two turns. Switching or Mega Evolution ends it."
};

AbilityDescriptionOverrides.hydraulicarmor = {
	"desc": "Stamina: damaging enemy hits heal 1/16 maximum HP each hit and grant +1 Defense at most once per turn. Water Pulse and Hydro Pump use Defense if its boosted value exceeds Sp. Atk, following local higher-stat move rules; ties keep Sp. Atk. They remain Special, use normal Special attack modifiers, and target Sp. Def.",
	"shortDesc": "Stamina; Water Pulse and Hydro Pump use the higher boosted Defense or Sp. Atk, remaining Special."
};

AbilityDescriptionOverrides.hauntingpresence = {
	"desc": "Levitate: airborne with normal Ground and grounded-hazard immunity. Hex doubles its power against major status or Comatose, or if the target has Taunt, Encore, Disable or Heal Block. These conditions grant only one doubling.",
	"shortDesc": "Levitate; Hex also doubles against Taunt, Encore, Disable or Heal Block, without stacking."
};

AbilityDescriptionOverrides.slumberinggiant = {
	"desc": "Comatose + Thick Fat: always considered asleep for relevant moves and fields while able to act normally; cannot receive major status or Yawn. Fire and Ice attacks use half offensive power against it, and hail cannot damage it. Retains Comatose's suppression and ability-replacement restrictions.",
	"shortDesc": "Comatose + Thick Fat: always treated as asleep; immune to status; halves Fire/Ice attack power."
};

AbilityDescriptionOverrides.oceanlullaby = {
	"desc": "Shell Armor prevents critical hits. Once per turn, a successful damaging sound move clears confusion and negative accuracy stages from the holder and active allies. Other stages and positive accuracy remain; the bench is unaffected. Does not change Sing accuracy.",
	"shortDesc": "Shell Armor; damaging sound hits clear self/allies' confusion and negative accuracy once/turn."
};

AbilityDescriptionOverrides.shadowscreen = {
	"desc": "Infiltrator: moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Mat Block can be used after the first turn, but shares the normal Protect-style consecutive-use failure counter. Grants no additional priority; Mat Block keeps its current local move priority.",
	"shortDesc": "Infiltrator; Mat Block works after turn one but uses the normal consecutive-protection failure counter."
};

AbilityDescriptionOverrides.moonlitpromise = {
	"desc": "Unaware. Wishes created while this ability is active also clear the eventual recipient's negative stat stages when they resolve, preserving positive stages and normal Wish healing. The stored bonus follows the Wish even if the user switches out.",
	"shortDesc": "Unaware; its Wish clears the recipient's negative stat stages when it resolves."
};

AbilityDescriptionOverrides.sandshroud = {
	"desc": "Levitate + Overcoat: airborne, immune to powder moves and sandstorm/hail damage under normal rules. Recovers 1/16 maximum HP at turn end during sandstorm. Has no evasion effect.",
	"shortDesc": "Levitate + Overcoat; heals 1/16 maximum HP each turn during sandstorm."
};

AbilityDescriptionOverrides.arcanepilfer = {
	"desc": "Full local Magician: while itemless, steals a removable item after eligible damaging moves. Fairy Tale, Bewitched Woods, Haunted, Misty and New World entry grant +1 Sp. Atk; Psychic Terrain limits incoming numeric-accuracy status moves to 50 accuracy. A successful Mystical Fire also applies Embargo for the rest of this turn and the following turn, respecting normal volatile-status rules and existing Embargo duration.",
	"shortDesc": "Magician; successful Mystical Fire also applies two-turn Embargo."
};

AbilityDescriptionOverrides.faultline = {
	"desc": "Full local Mold Breaker: moves ignore bypassable opposing abilities. Once per entry, the first Sand Tomb that successfully applies its binding effect adds one Spikes layer to the target's side, up to the normal three-layer cap. Misses, protection, immunity and Substitute preventing binding give no layer. Spikes causes no immediate damage to the trapped target.",
	"shortDesc": "Mold Breaker; first successful Sand Tomb bind each entry adds one Spikes layer to the foe's side."
};

AbilityDescriptionOverrides.voidveil = {
	"desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Immune to Ground moves, indirect damage, sleep, and Yawn; Dark- and Ghost-type moves have 1.3x power. In Fairy Tale, raises Sp. Def by 1 on entry. Its first Dark- or Ghost-type attack each switch-in bypasses Substitute and screens. It does not heal or shelter allies. Ordinary Gardevoir with this ability ignores only New World's airborne Defense and Sp. Def penalties; other users do not. Gravity still grounds it, and other field effects remain.",
	"shortDesc": "Levitate + Magic Guard + Insomnia; first Dark/Ghost hit bypasses barriers; Gardevoir ignores New World defense penalties."
};

AbilityDescriptionOverrides.creepingbloom = {
	"desc": "Infiltrator: moves bypass Substitute, Reflect, Light Screen, Aurora Veil, Safeguard and Mist. Once per entry, the first Poison attack to damage a foe also attempts regular poison on each opposing target damaged by that same move, once per target. Damage spends the charge even if poison is blocked or the foe already has status; misses, protection and damage immunity do not. Bonus ability poison respects normal poison immunities, Safeguard and status protection. Allies are never poisoned by this bonus, and normal move secondaries are unchanged.",
	"shortDesc": "Infiltrator; first Poison attack to damage a foe each entry also attempts poison on all foes it damages."
};

AbilityDescriptionOverrides.dreadwings = {
	"desc": "Levitate + full local Unnerve: airborne with normal Ground and grounded-hazard immunity; foes cannot eat Berries or use field seeds while Unnerve is active. On Cold Eclipse entry, lowers opposing Speed one stage unless protected by Substitute. A Dark Pulse that damages a surviving foe also applies Torment under normal volatile-status rules, preventing consecutive use of the same move. Existing Torment does not stack.",
	"shortDesc": "Levitate + Unnerve; Dark Pulse damage also applies Torment to surviving foes."
};

AbilityDescriptionOverrides.setpiece = {
	"desc": "Successfully using Court Change or damaging a target with Feint stores one charge. Its next damaging Fire attack gains +1 priority and perfect accuracy. The charge is spent only when that attack executes, including failure into protection or immunity; move previews and inability to act do not spend it. Switching clears it.",
	"shortDesc": "Court Change or damaging Feint primes next Fire attack: +1 priority, perfect accuracy; spent on execution."
};

AbilityDescriptionOverrides.dozinggiant = {
	"desc": "Full Oblivious. While actually asleep, takes 25% less Special attack damage and opponents cannot force it to switch. Voluntary switching still works. Sleep Talk cannot select Rest.",
	"shortDesc": "Oblivious; while asleep, 25% less Special damage and cannot be forced out. Sleep Talk excludes Rest."
};

AbilityDescriptionOverrides.causticchamber = {
	"desc": "Own Tempo prevents and cures confusion and blocks Intimidate Attack drops. Shell Side Arm ignores positive Defense or Sp. Def stages for damage, while retaining its normal Physical/Special selection, negative stages and all other effects.",
	"shortDesc": "Own Tempo; Shell Side Arm ignores positive defensive stages without changing its category selection."
};

AbilityDescriptionOverrides.demolitiontrunk = {
	"desc": "Full Sheer Force. Once per entry, the first Heavy Slam or Heat Crash to damage a foe removes Reflect, Light Screen and Aurora Veil from that foe's side after damage. Both moves share one charge; misses, protection and hits only on Substitute do not spend it.",
	"shortDesc": "Sheer Force; first Heavy Slam or Heat Crash damage each entry clears the foe side's screens after damage."
};

AbilityDescriptionOverrides.deepresonance = {
	"desc": "Full Soundproof. Psychic Noise that damages a surviving foe also lowers that foe's Attack by one stage, once per target per move. Normal stat-drop protection applies; Psychic Noise retains its existing effects.",
	"shortDesc": "Soundproof; Psychic Noise damage lowers surviving foes' Attack once per target per move."
};

AbilityDescriptionOverrides.siegemagnet = {
	"desc": "Full Magnet Pull. Once per entry, the first Electric attack to damage a foe also attempts Heal Block on that foe for this turn and the following turn. Normal volatile-status protection applies; existing Heal Block is not shortened. Misses, protection and Substitute-only hits preserve the charge. No power boost.",
	"shortDesc": "Magnet Pull; first Electric attack damage each entry applies two-turn Heal Block."
};

AbilityDescriptionOverrides.patientmarksman = {
	"desc": "Full local Sniper: gains one accuracy stage on entry and retains its critical-damage modifier. Successfully using Focus Energy also clears its confusion and negative accuracy stages, preserving positive accuracy and other stages. Failed Focus Energy grants no cleanse.",
	"shortDesc": "Sniper; successful Focus Energy clears its confusion and negative accuracy."
};

AbilityDescriptionOverrides.sushitrick = {
	"desc": "On entry, heals each adjacent active ally by 1/4 maximum HP and removes its confusion. If there is no adjacent active ally to serve, instead clears its own confusion and negative accuracy stages, preserving positive accuracy, without self-healing.",
	"shortDesc": "Entry heals adjacent allies 1/4 HP and clears confusion; alone, clears own confusion and negative accuracy."
};

AbilityDescriptionOverrides.cradleward = {
	"desc": "Full Sweet Veil prevents sleep and Yawn for itself and allies, including Rest, without curing existing sleep. Successfully setting Trick Room also sets normal five-turn Safeguard on its own side. Turning Trick Room off does not count.",
	"shortDesc": "Sweet Veil; setting Trick Room also sets five-turn Safeguard on its side."
};

AbilityDescriptionOverrides.raisedquills = {
	"desc": "Successfully using a status move stores one non-stacking retaliation. The next opposing damaging hit spends it and attempts to poison the attacker, whether or not the move makes contact. Normal poison immunities apply. Switching clears preparation.",
	"shortDesc": "A successful status move primes poison retaliation against the next opposing damaging hit."
};

AbilityDescriptionOverrides.sunreserve = {
	"desc": "Full local Flash Fire, including its Fire power boost and field effects. Absorbing a Fire attack additionally heals 1/8 maximum HP at most once per turn, subject to healing restrictions. Cold Eclipse retains Flash Fire's entry Defense/Sp. Def boosts and disables Fire absorption, so no absorption heal occurs there. Field-granted Flash Fire boosts do not trigger healing.",
	"shortDesc": "Flash Fire; absorbing a Fire attack also heals 1/8 HP once per turn."
};

AbilityDescriptionOverrides.silentreprisal = {
	"desc": "Full Soundproof + full local Anticipation. Immune to other Pokemon's sound moves. On entry, exposes opposing Illusion and checks for super-effective attacks or OHKO moves; if none trigger its warning, gains two Sp. Atk stages on Psychic Terrain, matching local Anticipation.",
	"shortDesc": "Soundproof + local Anticipation, including Illusion detection and its conditional Psychic Terrain boost."
};

AbilityDescriptionOverrides.dreamrefuge = {
	"desc": "Full Telepathy: immune to allied damaging moves and doubles Speed on Psychic Terrain or its aura. Once per entry, its first successful Moonlight also cures one active ally's major status, choosing the affected ally with the lowest HP percentage. No bonus self-cure; ordinary Moonlight healing and failure rules apply.",
	"shortDesc": "Telepathy; first successful Moonlight each entry cures the statused active ally with lowest HP percentage."
};

AbilityDescriptionOverrides.closedcircuit = {
	"desc": "Full Clear Body prevents other Pokemon from lowering its stat stages. If both Gear Grind hits damage the target, heals 1/16 maximum HP after the move, once per use. No healing if either hit misses, is blocked, hits only Substitute, or the first hit ends the attack. Normal healing restrictions apply.",
	"shortDesc": "Clear Body; heals 1/16 HP after Gear Grind if both hits damage the target."
};

AbilityDescriptionOverrides.pridecall = {
	"desc": "Full local Competitive + Unnerve. Opposing stat drops grant +2 Sp. Atk outside Chess Board; on Chess Board, retains Competitive's missing-HP power boost instead. Foes cannot eat Berries or use field seeds while Unnerve is active; retains its Cold Eclipse entry Speed drops.",
	"shortDesc": "Competitive + Unnerve, including their local field effects."
};

AbilityDescriptionOverrides.hydroelectric = {
	"desc": "Full local Dry Skin, including Water absorption, Fire vulnerability, weather healing/damage and field effects. Dealing damage with a Water move additionally heals 1/8 maximum HP once per turn, without stacking across hits or targets. Normal healing restrictions apply.",
	"shortDesc": "Dry Skin; damaging Water moves also heal 1/8 HP once per turn."
};

AbilityDescriptionOverrides.solarstride = {
	"desc": "Full Chlorophyll, including the Flower Garden stage-four Speed boost. While sunlight is effective, damaging Electric attacks remove opposing Reflect, Light Screen and Aurora Veil before damage using normal screen-breaking rules. Does not bypass Protect or immunities, and grants no extra damage multiplier.",
	"shortDesc": "Chlorophyll; in effective sun, Electric attacks break opposing screens before damage."
};

AbilityDescriptionOverrides.frillflash = {
	"desc": "Full Dazzling. When its Electrify actually converts an opposing move from another type to Electric, attempts to Disable that converted move after it finishes, through the end of the following turn. Normal Disable eligibility and protection apply. No bonus for failed Electrify, inability to act, an already-Electric move, or an allied move.",
	"shortDesc": "Dazzling; its Electrify conversion Disables the opposing move after execution through next turn."
};

AbilityDescriptionOverrides.stokebelly = {
	"desc": "Full Gluttony. Consuming a Berry clears its negative Attack stages, preserving positive Attack and other stages.",
	"shortDesc": "Gluttony; eating a Berry clears its negative Attack stages."
};

AbilityDescriptionOverrides.freshplumage = {
	"desc": "Full local Natural Cure: switching cures status and heals 1/3 maximum HP only when curing status; Bewitched Woods cures status at turn end without that heal. Its first successful Flying attack each entry deals 1.2x damage across all hits, including Substitute damage. Misses, Protect and immunity preserve the charge. A successful Roost can restore a spent charge once per entry, allowing at most two boosted Flying attacks. Roost before spending the initial charge does not grant or store another charge.",
	"shortDesc": "Natural Cure; first Flying attack is 1.2x. Successful Roost restores a spent charge once per entry."
};

AbilityDescriptionOverrides.meridianseal = {
	"desc": "Once per entry, a Fighting hit against a surviving foe can suppress its Ability for two turns, including the current turn. The charge is spent only when suppression succeeds. Protect, Substitute, Ability Shield and unsuppressible Abilities prevent suppression without spending the chance. Switching clears the seal.",
	"shortDesc": "Fighting hits suppress a surviving foe for two turns; once per entry, spent only on successful suppression."
};

AbilityDescriptionOverrides.invisiblewall = {
	"desc": "Full Soundproof. Once per entry, when its Wide Guard actually blocks an opposing damaging attack, sets five-turn Safeguard on its own side. Using Wide Guard without blocking an attack gives no reward.",
	"shortDesc": "Soundproof; its first Wide Guard block each entry sets five-turn Safeguard."
};

AbilityDescriptionOverrides.pursuitwake = {
	"desc": "Full Infiltrator. Aqua Jet that deals damage clears its negative Speed stages, preserving positive Speed. Misses, protection and damage immunity give no cleanse.",
	"shortDesc": "Infiltrator; damaging Aqua Jet clears its negative Speed stages."
};

AbilityDescriptionOverrides.sentinelfist = {
	"desc": "Full local Iron Fist gives punching moves 1.4x power. Once per entry, when its Wide Guard actually blocks an opposing damaging attack, restores 1/8 maximum HP under normal healing restrictions. No reward for using Wide Guard without blocking an attack.",
	"shortDesc": "Iron Fist; its first Wide Guard block each entry heals 1/8 maximum HP."
};

AbilityDescriptionOverrides.gentlegiant = {
	"desc": "Full Cloud Nine suppresses weather effects and retains its Rainbow Field random stat boost. Once per entry, gains one Sp. Atk stage when an adjacent ally survives an opposing attack that takes it from above half HP to half HP or less. No trigger from self-damage, allied attacks, indirect damage, or a KO. Normal boost rules apply.",
	"shortDesc": "Cloud Nine; once per entry, +1 Sp. Atk when an adjacent ally survives a foe hit crossing half HP."
};

AbilityDescriptionOverrides.rousingfeast = {
	"desc": "Full Gluttony. Consuming a Berry clears its negative Attack and Speed stages, preserving positive stages and all other stats.",
	"shortDesc": "Gluttony; eating a Berry clears its negative Attack and Speed stages."
};

AbilityDescriptionOverrides.windpower = {
	"desc": "Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain. Successfully establishing Tailwind itself also clears its own confusion and negative accuracy stages, preserving positive accuracy.",
	"shortDesc": "Absorbs wind for Sp. Atk; Tailwind and Strong Winds boost it. Its successful Tailwind also clears confusion/accuracy drops."
};

AbilityDescriptionOverrides.silkward = {
	"desc": "Once per entry, the first super-effective damaging hit deals half damage. After that ward activates, clears its negative Speed stages if it survives, without granting an extra Speed stage. Positive Speed is preserved. Does not set weather.",
	"shortDesc": "First super-effective hit each entry deals half damage; if it survives, clears negative Speed afterward."
};

AbilityDescriptionOverrides.ringcraft = {
	"desc": "Full local Limber prevents and cures paralysis and blocks opposing and field Speed reductions. The first damaging Flying Press hit against a foe each entry attempts two-turn Taunt after damage, under normal Taunt protection. Misses, Protect and Substitute preserve the charge; existing Taunt is not shortened.",
	"shortDesc": "Limber; first Flying Press damage each entry attempts two-turn Taunt after the hit."
};

AbilityDescriptionOverrides.marshconduit = {
	"desc": "Full Water Absorb: absorbs other Pokemon's Water moves to heal 1/4 maximum HP and retains local field healing. Its first absorption each entry also lowers all active foes' Speed one stage and clears its own confusion and negative accuracy stages, preserving positive accuracy. Later absorptions retain normal healing only.",
	"shortDesc": "Water Absorb; first absorption each entry slows foes and clears own confusion and negative accuracy."
};

AbilityDescriptionOverrides.constrictingheat = {
	"desc": "Full White Smoke prevents other Pokemon from lowering its stats and grants +1 Attack and Sp. Atk on Volcanic entry. Fire Lash damage partially traps a surviving foe as Fire Spin for this turn end and the next. Only one ability trap per holder; a new trapped foe releases the previous one. No stacking with existing partial traps. Traps end when the holder leaves, loses the ability or Dynamaxes/Gigantamaxes. Normal escape, protection and residual-damage rules apply.",
	"shortDesc": "White Smoke; damaging Fire Lash binds one foe for two turns. Switching or Dynamax/Gigantamax ends it."
};

AbilityDescriptionOverrides.venomspurs = {
	"desc": "Damaging a foe with a Poison move prepares one non-stacking charge. Its next qualifying Bug hit lowers the foe's Defense one stage before damage; the charge is spent only when the hit deals damage. Inability to act, misses, protection and Substitute-only hits preserve it. Switching clears preparation.",
	"shortDesc": "Poison damage primes the next Bug hit to lower Defense before damage; failed or blocked hits keep the charge."
};

AbilityDescriptionOverrides.gritreprisal = {
	"desc": "Full Guts: Attack is 1.5x while statused and burn does not weaken physical attacks. Surviving an opposing damaging hit stores one charge. Its next damaging punching move ignores positive stages of the defense used for that hit, retaining its normal category and defensive-stat choice. Successful punch damage spends the charge; failed or blocked hits preserve it. Switching clears it. No extra power, healing or Defense boost.",
	"shortDesc": "Guts; surviving a foe hit primes the next damaging punch to ignore positive defensive stages."
};

AbilityDescriptionOverrides.wreckingcrew = {
	"desc": "Full local Iron Fist gives punching moves 1.4x power. Damaging punches remove opposing Reflect, Light Screen, Aurora Veil, Arenite Wall and Atlantis Wall before damage, under normal screen-breaking rules. Does not bypass protection, immunity or Substitute and grants no extra attacks.",
	"shortDesc": "Iron Fist; damaging punches break opposing screens and custom walls before damage."
};

AbilityDescriptionOverrides.relicinstinct = {
	"desc": "Above half HP, its moves bypass opposing Abilities. At half HP or less, Attack and Sp. Atk are halved, attack damage is reduced by 25%, critical hits are prevented, and it heals 1/16 maximum HP at turn end. Once per Pokemon per battle, surviving at 25% HP or less restores it to 60% maximum HP and clears negative stat stages, preserving positive stages. Recovery waits until an entire attack finishes; other damage and end-turn checks can also trigger it. Healing restrictions apply: blocked healing spends no charge and gives no cleanse. Switching and ability changes do not reset the charge. No Defense drops or healthy attack HP cost.",
	"shortDesc": "Above half HP bypasses abilities; below half trades offense for defense. Once per battle, at 25% HP heals to 60% and clears drops."
};

AbilityDescriptionOverrides.fossilfrenzy = {
	"desc": "Once per opposing damaging move it survives, after the entire move finishes, gains +1 Attack and Speed and attempts confusion. Allied, self and indirect damage do not trigger it. Retains Klutz item suppression and its exceptions, Fling failure and local Chess Board move restrictions. While confused, incoming attack damage is 1.25x; hurting itself in confusion also costs 1/8 maximum HP.",
	"shortDesc": "After each opposing damaging move it survives: +1 Attack/Speed and confusion. Retains Klutz and confusion damage costs."
};

AbilityDescriptionOverrides.evergreen = {
	"desc": "Full Overcoat + Ripen: immune to powder moves and sandstorm/hail damage; applicable Berry effects are doubled, including local Ripen behavior. No additional effect.",
	"shortDesc": "Overcoat + Ripen."
};

AbilityDescriptionOverrides.battlegrip = {
	"desc": "Full Moxie grants +1 Attack for each Pokemon knocked out by its move. Knocking out an opponent with a move also clears its confusion and negative accuracy stages, preserving positive accuracy.",
	"shortDesc": "Moxie; move KOs against opponents also clear its confusion and negative accuracy."
};

AbilityDescriptionOverrides.scentscout = {
	"desc": "Full local Frisk on entry reveals opposing active Illusions and held items; each item holder independently has a 30% chance of five-turn Embargo. Once per holder entry, the first opponent switching in while this Pokemon is already active also has its held item revealed. This extra observation only reveals the item and never repeats Frisk's other effects; an empty item slot still spends it.",
	"shortDesc": "Frisk; once per entry, reveals the first incoming opponent's item while already active."
};

AbilityDescriptionOverrides.surefoot = {
	"desc": "Full Inner Focus prevents flinching and Intimidate Attack drops. Ground attacks ignore the target's positive Defense stages only when Defense is the stat used for damage. Does not ignore positive Sp. Def, abilities or screens, or change attack category.",
	"shortDesc": "Inner Focus; Ground attacks ignore positive Defense stages when using Defense for damage."
};

AbilityDescriptionOverrides.baitedbloom = {
	"desc": "Full Gluttony + Sticky Hold: qualifying low-HP Berries activate at half HP; other Pokemon cannot remove its item while it survives, retaining the Sticky Barb exception.",
	"shortDesc": "Gluttony + Sticky Hold."
};

AbilityDescriptionOverrides.guidinggallop = {
	"desc": "Full local Pastel Veil, including poison prevention/cures for itself and allies, opposing Poison-move Attack/Sp. Atk drops and field effects. A successful status move directly targeting another ally also clears that ally's negative Speed stages, preserving positive Speed. Self-targeting and side-wide or field moves do not trigger it.",
	"shortDesc": "Pastel Veil; successful status moves directly targeting an ally clear that ally's negative Speed."
};

AbilityDescriptionOverrides.carrionwatch = {
	"desc": "Full local Frisk + Unnerve. Entry reveals opposing active Illusions and held items, with each item holder independently having a 30% chance of five-turn Embargo. Foes cannot eat Berries or use field seeds while Unnerve is active; retains its Cold Eclipse entry Speed drops.",
	"shortDesc": "Frisk + Unnerve, including their local entry and field effects."
};

AbilityDescriptionOverrides.supremeoverlord = {
	"desc": "Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Fallen allies add 10% damage each; 2+ Infiltrator, 4+ Inner Focus. Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.royalsun = {
	"desc": "On entry, summons sun for 5 turns, or 8 with Heat Rock. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. While it is active, it prevents opposing Pokemon from using their Berries. This Ability activates before hazards and other Abilities take effect. Contact attackers have a 30% burn chance, or 60% on Volcanic. On Cold Eclipse, gains +1 Defense and Sp. Def on entry instead and cannot burn through contact. Summons sun for the usual Drought duration. Move power gains 10% per fainted ally; at 2 fallen allies, gains Infiltrator; at 4, flinch immunity; at 5, Magic Guard and a one-time +1 Attack and Special Attack. Opponents cannot eat Berries or use field seeds. Contact has a 30% burn chance, or 60% on Volcanic Field. On Cold Eclipse, lowers opposing Speed by 1 on entry (blocked by Substitute), raises its Defense and Special Defense by 1, and cannot burn through contact. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Summons sun on entry; Fallen allies add 10% damage each; 2+ Infiltrator, 4+ Inner Focus; While it is active, it prevents opposing Pokemon from using their Berries; 30% contact burn (60% Volcanic). Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.conquerorswill = {
	"desc": "Supreme Overlord + Unnerve. Move power gains 10% per fallen ally, including an allied side, capped at 5 after Free-for-All doubles the count. At 2 fallen, moves bypass screens and Substitute; at 4, cannot flinch; at 5, gains +1 Attack and Sp. Atk once per entry and immunity to indirect damage. Faints update these effects while active. Opponents cannot eat Berries or use field Seeds. On Cold Eclipse entry, lowers each foe's Speed one stage unless behind Substitute. Kowtow Cleave removes opposing Reflect, Light Screen and Aurora Veil before damage, even through Substitute; protection, a miss or immunity prevents removal. Suppression disables this ability. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Grows stronger as allies fall. Opponents cannot eat Berries. Kowtow Cleave breaks their screens. Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.apexbond = {
	"desc": "Battle Bond's shared effects plus Supreme Overlord and Rough Skin. Garchomp-Battle-Bond's Dual Chop never misses and always critically hits. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Dual Chop never misses and always critical. Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.ragingoverlord = {
	"desc": "Moves ignore bypassable opposing abilities. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats. Attacks bypass Substitute, screens and defensive stat stages and gain +1 critical-hit stage. Takes half damage from priority attacks, in addition to its armor reduction. Immune to hail damage. Move KOs damage remaining foes by 60% of the last damage dealt; if there is no valid target or no damage is dealt, gains +1 Attack instead. Magic Guard prevents this splash damage. Cannot be suppressed. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Ignores abilities/screens/defensive stages; armor protection; KO splash damage; fallen allies grant bonuses. Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.shedskin = {
	"desc": "At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. On Scrafty with Shed Skin or Street Tyrant, recovery is 1/8 max HP in both ordinary conditions and Dragon's Den; other users and composites retain 1/4.",
	"shortDesc": "50% end-turn cure/reset and 1/4 heal; Dragon's Den changes the effect. Scrafty heals 1/8."
};

AbilityDescriptionOverrides.streettyrant = {
	"desc": "On entry, lowers all active foes' Attack by 1. Damaging moves ignore bypassable abilities. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. On Scrafty with Shed Skin or Street Tyrant, recovery is 1/8 max HP in both ordinary conditions and Dragon's Den; other users and composites retain 1/4.",
	"shortDesc": "Entry lowers foes' Attack; attacks ignore abilities; end-turn status cure, stat reset and healing chance. Mega Scrafty heals 1/8."
};

AbilityDescriptionOverrides.twinblades = {
	"desc": "Single-target Fire and Ghost slicing attacks hit twice at half power per hit (60% power per hit in FFA). In FFA the second hit targets a random different eligible foe, or the original foe if none exists; elsewhere it redirects after a KO. The second hit ignores positive defensive stages. Secondary effects roll only on the first hit. Excludes Z/Max, fixed-damage and existing multi-hit moves.",
	"shortDesc": "Fire/Ghost slicing moves hit twice: 50% each, or 60% in FFA; second hit bypasses Defense boosts."
};

AbilityDescriptionOverrides.tyrantdomain = {
	"desc": "On entry, summons sandstorm for 5 turns, or 8 with Smooth Rock. Prevents critical hits and takes 20% less attack damage. Its Rock typing adds no Fighting, Ground, Steel, Water or Grass weakness. Immune to sandstorm and hail damage. Gains +1 Defense and Sp. Def when a foe lowers its stats, and on entry on Desert, Fairy Tale, Cave, Crystal Cavern, New World or Volcanic. Each fainted ally adds 10% move damage; in Free-for-All, allies count twice. At 2+ fallen allies it gains Infiltrator; 4+, flinch immunity from Inner Focus; 5+, indirect-damage immunity and a one-time +1 Attack and Sp. Atk. It does not block stat drops. Heals 1/16 max HP each turn. On fainting, creates Dragon's Den for 5 turns. Effective fallen count is capped at 5 after Free-for-All doubling, for a maximum 1.5x Supreme Overlord power multiplier; unlocks at 2/4/5 are unchanged.",
	"shortDesc": "Summons sand; Rock/critical-hit protection; 20% less damage; fallen allies boost power; heals each turn. Supreme Overlord caps at 5 effective faints (1.5x power)."
};

AbilityDescriptionOverrides.waterbubble = {
	"desc": "This Pokemon's offensive stat is doubled while using Water attacks. Fire attacks against it use half the attacker's offensive stat. It also has Water Veil's effects. Does not grant Water STAB; natural STAB is unchanged.",
	"shortDesc": "Water Veil; doubles Water attacking stats; halves incoming Fire attacking stats."
};

AbilityDescriptionOverrides.seafiend = {
	"desc": "Physical HP hits set Toxic Spikes on the attacker's side, up to two layers; allied hits use the opposing side. Contact attackers lose 1/6 max HP. Water moves use double Attack or Sp. Atk; incoming Fire attacks use half the attacker's offensive stat. Prevents and cures burns, ignores hail and sandstorm damage, and gains Aqua Ring on entry. Does not grant Water STAB; natural STAB is unchanged.",
	"shortDesc": "Physical hits set Toxic Spikes; contact damage; doubled Water attacking stats; Fire/burn/weather protection."
};

AbilityDescriptionOverrides.scaleshelter = {
	"desc": "Full local Shield Dust + Overcoat: blocks opposing secondary effects, powder moves and sandstorm/hail damage.",
	"shortDesc": "Shield Dust + Overcoat."
};

AbilityDescriptionOverrides.stagesweep = {
	"desc": "Full Screen Cleaner removes screens from both sides on entry. When its Rapid Spin successfully removes at least one hazard, clears only its negative Defense and Sp. Def stages; positive stages remain.",
	"shortDesc": "Screen Cleaner; removing hazards with Rapid Spin clears its negative Defense and Sp. Def."
};

AbilityDescriptionOverrides.icebreaker = {
	"desc": "Full Hyper Cutter prevents other Pokemon from lowering its Attack. Ice Hammer removes opposing Reflect before damage, including through Substitute, but not on protection, a miss or immunity. Its Speed drop is unchanged.",
	"shortDesc": "Hyper Cutter; Ice Hammer breaks Reflect before damage and keeps its Speed drop."
};

AbilityDescriptionOverrides.cactuschorus = {
	"desc": "Full local Water Absorb: absorbs Water moves for 1/4 max HP and retains its field healing. A successful Helping Hand also clears the recipient ally's confusion.",
	"shortDesc": "Water Absorb; successful Helping Hand clears the recipient ally's confusion."
};

AbilityDescriptionOverrides.crushingvenom = {
	"desc": "Full Strong Jaw gives biting moves 1.5x power. Once per entry, its first damaging bite against a foe applies two-turn Heal Block after HP damage. A hit absorbed by Substitute spends the use without affecting its holder; misses, protection and immunity do not spend it.",
	"shortDesc": "Strong Jaw; first damaging bite each entry applies two-turn Heal Block after damage."
};

AbilityDescriptionOverrides.crosswire = {
	"desc": "Full local Iron Fist gives punches 1.4x power. A damaging punch against a foe stores one charge. Its next special Electric attack ignores positive Sp. Def stages when Sp. Def is used for damage. Successful HP or Substitute damage consumes the charge; misses, protection and immunity preserve it. A physical Electric punch cannot consume its newly gained charge. No extra damage multiplier; switching clears the charge.",
	"shortDesc": "Iron Fist; a damaging punch charges the next special Electric attack to ignore positive Sp. Def."
};

AbilityDescriptionOverrides.deepchill = {
	"desc": "Full local Oblivious. Once per entry, its first damaging Ice attack against a foe applies Torment after HP damage. A hit absorbed by Substitute spends the use without affecting its holder; misses, protection and immunity do not spend it.",
	"shortDesc": "Oblivious; first damaging Ice attack each entry applies Torment after damage."
};

AbilityDescriptionOverrides.climatereserve = {
	"desc": "Uses Forecast's Castform weather-form changes only, without its weather-dependent ability bonuses. Once per entry, successfully changing weather with its own move raises Sp. Def by 1. Its own Sunny Day, Rain Dance, Sandstorm and Hail weather last one extra turn, added after weather-extending items. Repeated callbacks do not stack; permanent weather and Tailwind are not extended.",
	"shortDesc": "Forecast form changes only; first own weather change per entry gives +1 Sp. Def; manual weather lasts +1 turn."
};

AbilityDescriptionOverrides.perishbody = {
	"desc": "If an enemy hits this Pokemon with a damaging move, all opposing Pokemon get Perish Song. If an affected opposing Pokemon already has Perish Song, its countdown is reduced by 1 instead. During Haunted Field, affected foes are trapped while adjacent to this Pokemon. This effect is blocked by Holy Field and does not trigger from allies. Cursola and its forms never shorten an existing Perish Song countdown.",
	"shortDesc": "Enemy hits apply Perish Song to foes; Cursola never shortens existing countdowns."
};

AbilityDescriptionOverrides.rimeknuckle = {
	"desc": "Takes 20% less attack damage, or 40% less from super-effective attacks. Punching moves have 1.4x power. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Damaging moves have a 20% chance to cause frostbite (40% on Icy Field). KOs restore 1/8 max HP, or 1/4 against Mega, G-Max, Terastallized, Stellar or Z-Move item targets. Ice Body adds a 30% chance to frostbite contact attackers, hail immunity, and healing in hail/snow or on Icy, Snowy Mountain and Cold Eclipse fields. Healing is 1/16 max HP, or 1/8 in hail on Cold Eclipse.",
	"shortDesc": "20% less attack damage; 20% less if super effective; Punches have 1.4x power; 30% contact frostbite; heals in icy weather/fields; no hail damage — frostbite chance; KO healing."
};

AbilityDescriptionOverrides.tunnelclearance = {
	"desc": "Full Hyper Cutter. Successful Rapid Spin damage removes opposing Reflect and Light Screen after damage, including when hitting Substitute. Does not remove Aurora Veil or other walls.",
	"shortDesc": "Hyper Cutter; damaging Rapid Spin removes opposing Reflect and Light Screen after damage."
};

AbilityDescriptionOverrides.crystalbastion = {
	"desc": "Full Sturdy. Once per entry, its own Wide Guard actually blocking an opposing damaging attack clears only its negative Defense and Sp. Def stages. Positive stages remain.",
	"shortDesc": "Sturdy; first own Wide Guard block each entry clears negative Defense and Sp. Def."
};

AbilityDescriptionOverrides.buriedcoil = {
	"desc": "Full Sand Spit summons sandstorm when hit by an attack. Once per entry, successfully using Coil clears its confusion and negative accuracy stages, preserving positive accuracy.",
	"shortDesc": "Sand Spit; first successful Coil each entry clears confusion and negative accuracy."
};

AbilityDescriptionOverrides.staticreserve = {
	"desc": "Full Static: contact attackers have a 30% paralysis chance, or 60% on Electric Terrain and Short-Circuit. Once per entry, successfully causing paralysis with Static grants Charge. Failed status attempts do not spend the use.",
	"shortDesc": "Static; its first successful Static paralysis each entry grants Charge."
};

AbilityDescriptionOverrides.lockinggrip = {
	"desc": "Full Hyper Cutter. Once per entry, its first damaging Bug attack against a foe applies Torment after HP damage. A hit absorbed by Substitute spends the use without affecting its holder; misses, protection and immunity do not spend it.",
	"shortDesc": "Hyper Cutter; first damaging Bug attack each entry applies Torment after damage."
};

AbilityDescriptionOverrides.garlandgift = {
	"desc": "Full local Flower Veil, including its field effects. Once per entry, successful Floral Healing also clears the recipient's confusion and negative accuracy stages. Positive accuracy remains; failed healing does not spend the use.",
	"shortDesc": "Flower Veil; first successful Floral Healing each entry clears recipient confusion and negative accuracy."
};

AbilityDescriptionOverrides.verdanthospitality = {
	"desc": "Same-type moves have 1.3x power. Allies take 25% less attack damage. On entry, heals active allies by 1/8 max HP. At turn end, heals itself by 1/16 max HP and active allies by 1/16.",
	"shortDesc": "1.3x same-type power; allies take 25% less damage; entry and end-turn healing."
};

AbilityDescriptionOverrides.bloodchallenge = {
	"desc": "Its first opposing direct hit each entry deals 25% less damage. Counter can retaliate against either physical or special attacks. Once per entry, Counter successfully dealing opposing damage heals it by 1/8 max HP.",
	"shortDesc": "First direct hit per entry deals 25% less damage; Counter also answers special hits. First damaging Counter per entry heals 1/8."
};

AbilityDescriptionOverrides.purifyingfrost = {
	"desc": "On entry, cures status conditions from it and its active allies. Once per switch-in, after its first Ice-type move successfully affects a target, it sets Safeguard on its side for 5 turns, misses, protection, immunity and failed moves do not trigger or spend it.",
	"shortDesc": "Entry cures active team status; first successful Ice move each entry sets Safeguard."
};

AbilityDescriptionOverrides.mudmeditation = {
	"desc": "Takes 25% less special attack damage while waiting to perform a selected status move. Successfully using a status move extends this protection through the rest of that turn; failure does not earn the extension.",
	"shortDesc": "25% less special damage while awaiting a status move, and through the turn after successful use."
};

AbilityDescriptionOverrides.disguise = {
	"desc": "Intact Mimikyu gains +1 status-move priority. Its first damaging hit breaks Disguise, prevents that hit's damage and critical hit, costs 1/8 max HP, and curses an opposing attacker. This Curse deals 1/8 max HP per turn. Confusion damage also breaks Disguise. Busted forms do not curse later attackers and have no continuing Relic Armor damage reduction, critical immunity or defensive boosts.",
	"shortDesc": "Intact: +1 status priority; first hit blocked, costs 1/8 HP and curses foe. No ongoing armor or curses."
};

AbilityDescriptionOverrides.riotstance = {
	"desc": "Full Defiant. Once per entry, successfully blocking an opposing damaging attack with Obstruct stores one charge. Its next damaging Dark move gains +1 priority and consumes the charge when actually attempted, not during priority previews. Switching clears the charge; subsequent blocks cannot rearm it that entry. Sucker Punch still requires its usual success condition.",
	"shortDesc": "Defiant; first damaging Obstruct block each entry grants +1 priority to its next damaging Dark move."
};

AbilityDescriptionOverrides.royaldecree = {
	"desc": "On entry, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While it is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, enemy-caused stat drops fail, and charge moves fire immediately. Its own self-inflicted stat drops still work. Neutralization disables these Royal Decree effects while active. If Neutralization is already active on entry, the stat and screen reset does not happen; it does not happen later when Neutralization leaves. The Royal Decree or Empress holder may gain its own self-caused stat boosts and pay its own move-induced stat drops. Opponent-caused changes and changes to other Pokemon retain the existing restrictions.",
	"shortDesc": "Haze/screen clear; Safeguard blocks reset; blocks setup/screens; skips charge turns. Allows holder self boosts and move costs."
};

AbilityDescriptionOverrides.empress = {
	"desc": "Blocks opposing priority moves aimed at it or its allies. Attacks deal 1.5x damage on Fairy Tale, or on Chessboard unless it has the Queen role. On entry, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While it is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, enemy-caused stat drops fail, and charge moves fire immediately. Its own self-inflicted stat drops still work. Neutralization disables these Royal Decree effects while active. If Neutralization is already active on entry, the stat and screen reset does not happen; it does not happen later when Neutralization leaves. Fighting moves receive normal STAB. Its Fairy typing adds no Poison or Steel weakness. On Chessboard, Defense and Sp. Def are 1.5x while Neutralization is absent. Neutralization suppresses the stat/screen-control effects but not the priority protection. The Royal Decree or Empress holder may gain its own self-caused stat boosts and pay its own move-induced stat drops. Opponent-caused changes and changes to other Pokemon retain the existing restrictions.",
	"shortDesc": "Blocks foe priority; resets and controls stat changes/screens; Fighting STAB; Fairy weakness protection. Allows holder self boosts and move costs."
};

AbilityDescriptionOverrides.coldlogic = {
	"desc": "Contact moves have 1.3x power. Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Immune to hail damage on Cold Eclipse. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage. On entry, it reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves. Cold Logic applies Forewarn's additional 0.8x attack-damage factor only when the effective base field is Psychic Terrain; a Psychic aura alone does not qualify. Global Forewarn and all other Cold Logic effects are unchanged.",
	"shortDesc": "Tough Claws + Prism Armor + Aftermath + Forewarn; extra Forewarn reduction only on Psychic Terrain."
};

AbilityDescriptionOverrides.updraft = {
	"desc": "Flying moves ignore evasion boosts. Once per entry, its first Flying attack dealing opposing HP damage raises the lowest-HP adjacent active ally's Speed by 1. If no active adjacent ally exists, it raises its own Speed instead. Only one recipient is boosted.",
	"shortDesc": "Flying moves ignore evasion; first Flying HP hit per entry gives ally +1 Speed, or self if alone."
};

AbilityDescriptionOverrides.secondbrew = {
	"desc": "Once per turn, after it actually recovers positive HP from draining-move healing, heals its lowest-HP adjacent ally by 1/8 of that ally's max HP. Full HP, Heal Block, Liquid Ooze and zero healing do not grant the ally reward or spend the turn's use.",
	"shortDesc": "Actual positive draining-move healing also heals its lowest-HP adjacent ally by 1/8, once per turn."
};

AbilityDescriptionOverrides.drumguard = {
	"desc": "Full Soundproof. Once per entry, Drum Beating successfully lowering an opposing Pokemon's Speed clears only the user's negative Defense and Sp. Def stages. Positive stages remain. Misses, immunity and blocked Speed drops do not trigger or spend the use.",
	"shortDesc": "Soundproof; first successful Drum Beating Speed drop each entry clears own negative Defense and Sp. Def."
};

AbilityDescriptionOverrides.measuredcounsel = {
	"desc": "Full Own Tempo prevents and cures confusion and blocks Intimidate's Attack drop. Successfully scheduling Future Sight also clears its confusion and negative Sp. Atk stages, preserving positive Sp. Atk. An occupied Future Sight slot does not trigger this effect.",
	"shortDesc": "Own Tempo; successful Future Sight clears own confusion and negative Sp. Atk."
};

AbilityDescriptionOverrides.tacticalretreat = {
	"desc": "When damage takes it from above half HP to half or less and it survives, switches out if a replacement is available. If its selected damaging attack is still queued, waits until that action finishes, even if the attack is prevented. Status moves and already completed actions do not defer the retreat. Does not change priority, grant an attack, interrupt multi-hit moves, heal, or clear stat changes.",
	"shortDesc": "At half HP from above half, retreats after its queued attack, or normally if none."
};

AbilityDescriptionOverrides.raincourier = {
	"desc": "Full Rain Dish: restores 1/16 max HP in effective rain. Once per entry, successfully establishing Tailwind removes entry hazards from its own side. Failed Tailwind while already active does not trigger or spend the use.",
	"shortDesc": "Rain Dish; once per entry, successfully setting Tailwind clears own-side entry hazards."
};

AbilityDescriptionOverrides.lastlaugh = {
	"desc": "If no other active Pokemon has a move left to use this turn, its damaging attack bypasses Substitute. Damaging a foe with that attack restores 1/8 max HP, once per turn. Once per entry, a damaging attack that hits a foe after that foe has completed its move action this turn applies Torment after damage, subject to normal eligibility. Merely switching in does not qualify.",
	"shortDesc": "Last-action hits bypass Substitute and heal 1/8; once/entry, hitting an already-acted foe applies Torment."
};

AbilityDescriptionOverrides.fortunatewing = {
	"desc": "Raises critical-hit rate by one stage. Once per entry, its first critical hit dealing opposing HP damage sets 5-turn Safeguard and cures confusion on active allies. Does not shorten a longer Safeguard or repeat the reward.",
	"shortDesc": "+1 crit stage; first damaging critical hit each entry sets Safeguard and cures active allies' confusion."
};

AbilityDescriptionOverrides.disorientingmind = {
	"desc": "Full Infiltrator bypasses Substitute and opposing protective screens. Once per entry, its first damaging Psychic attack dealing opposing HP damage applies Torment after damage, subject to normal eligibility. Misses, Protect and immunity do not spend the use.",
	"shortDesc": "Infiltrator; first damaging Psychic hit each entry applies Torment after damage."
};

AbilityDescriptionOverrides.wisecounsel = {
	"desc": "Full Inner Focus blocks flinching and Intimidate's Attack drop. Once per entry, successfully using Instruct on an active ally cures that ally's confusion before its ordinary repeated action. Failed Instruct and non-ally targets do not trigger or spend the use.",
	"shortDesc": "Inner Focus; first successful ally Instruct each entry cures confusion before the repeated action."
};

AbilityDescriptionOverrides.mindcurrent = {
	"desc": "Full Inner Focus blocks flinching and Intimidate's Attack drop. Once per entry, a damaging Psychic move dealing damage to a foe or its Substitute grants Charge after the move finishes. The triggering move cannot consume the new Charge. Misses, Protect and immunity do not spend the use.",
	"shortDesc": "Inner Focus; first damaging Psychic move each entry grants Charge after the move completes."
};

AbilityDescriptionOverrides.zerotohero = {
	"desc": "Gains Fighting-type STAB. Palafin changes to Hero Form after switching out or entering Water fields. In Doubles, Multi or Free-for-All, survives one KO at 1 HP. Hero Form retains Friend Guard and, on entry, heals itself and active allies by a flat 1/8 of each recipient's maximum HP, regardless of current HP.",
	"shortDesc": "Palafin becomes Hero; Fighting STAB; Hero grants Friend Guard and heals self/active allies 1/8 on entry."
};
