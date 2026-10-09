/** Individually approved component cuts and exact replacements; unanswered choices are absent. */
export const SelectedComponentRemovals: { [id: string]: string[] } = {
	"streettyrant": [
		"shedskin",
	],
	"ange": [
		"fairyaura",
		"magicguard",
	],
	"siegelauncher": [
		"selfsufficient",
	],
	"stormfright": [
		"intimidate",
		"static",
	],
	"enlightenment": [
		"anticipation",
		"purepower",
	],
	"royalsun": [
		"flamebody",
		"unnerve",
	],
	"toxicrenewal": [
		"regenerator",
		"liquidooze",
	],
	"adaptivepower": [
		"regenerator",
	],
	"apexcleave": [
		"sharpness",
	],
	"freezerburn": [
		"strongjaw",
		"refrigerate",
	],
	"phantomfist": [
		"shadowshield",
		"selfrepair",
		"naturalcure",
		"noguard",
	],
	"surgeconduit": [
		"shadowshield",
		"bruteforce",
		"electricsurge",
		"reckless",
	],
	"solarhydra": [
		"solarpower",
		"solarbud",
	],
	"cursedarmament": [
		"filter",
		"frisk",
	],
	"unboundblaze": [
		"proficient",
	],
	"pollenbloom": [
		"proficient",
	],
	"waterbarrage": [
		"proficient",
	],
	"toxicbloom": [
		"selfsufficient",
	],
	"atrocity": [
		"moldbreaker",
		"selfsufficient",
	],
	"sunsovereign": [
		"moldbreaker",
		"selfsufficient",
	],
	"toxicevolution": [
		"moldbreaker",
		"dualwield",
	],
	"spiralevolution": [
		"shielddust",
	],
	"neurotoxin": [
		"shedskin",
	],
	"lunarorbit": [
		"triage",
		"serenegrace",
	],
	"completeparasitism": [
		"filter",
		"dryskin",
	],
	"perfectforesight": [
		"insomnia",
	],
	"slowclamp": [
		"owntempo",
	],
	"parentalbond": [
		"moldbreaker",
		"toughclaws",
	],
	"celestialheart": [
		"serenegrace",
	],
	"bloomingsun": [
		"naturalcure",
	],
	"silkendecoy": [
		"insomnia",
	],
	"ironvise": [
		"battlearmor",
	],
	"sandsovereign": [
		"dauntlessshield",
	],
	"verdantdrake": [
		"dualwield",
	],
	"blazingtempo": [
		"striker",
	],
	"ragingcurrent": [
		"stamina",
	],
	"corrosivetouch": [
		"corrosion",
	],
	"dreadmaw": [
		"frisk",
	],
	"ironmountain": [
		"heavymetal",
	],
	"heavenlychorus": [
		"cloudnine",
	],
	"astralengine": [
		"analytic",
	],
	"royalscales": [
		"oblivious",
	],
	"hauntedchime": [
		"elevate",
	],
	"nighthunt": [
		"frisk",
		"infiltrator",
	],
	"uncheckedassault": [
		"striker",
	],
	"queensguard": [
		"infiltrator",
	],
	"shadowcurrent": [
		"moldbreaker",
		"infiltrator",
	],
	"heavyartillery": [
		"shellarmor",
	],
};
export const SelectedExactComponents: { [id: string]: string[] } = {
	"solarhydra": [
		"hydrabond",
		"grassysurge",
	],
	"cursedarmament": [],
	"ange": [
		"eternalflower",
		"moldbreaker",
	],
	"siegelauncher": [
		"megalauncher",
		"stalwart",
		"waterbarrage",
	],
	"neurotoxin": [
		"hydrabond",
		"regenerator",
	],
	"surgeconduit": [
		"lightningrod",
		"rockhead",
	],
	"railguncircuit": [
		"lightningrod",
		"transistor",
	],
	"enlightenment": [
		"innerfocus",
		"technician",
	],
	"stormfright": [
		"stormpower",
		"lightningrod",
	],
	"apexcleave": [
		"dualwield",
		"moxie",
	],
	"streettyrant": [
		"intimidate",
		"moldbreaker",
	],
	"adaptivepower": [
		"magicguard",
		"hugepower",
	],
	"phantomfist": [
		"unseenfist",
		"aftermath",
		"selfsufficient",
	],
	"toxicrenewal": [
		"adaptability",
		"poisontouch",
	],
	"freezerburn": [
		"slushrush",
		"levitate",
	],
	"royalsun": [
		"supremeoverlord",
		"drought",
	],
};
export const SelectedPassiveSwaps: { [id: string]: string } = {
	"sunfloramega": "solarbud",
	"arbokmegax": "shedskin",
	"medichammega": "purepower",
	"manectricmega": "intimidate",
	"pyroarmega": "flamebody",
	"dragalgemega": "regenerator",
};
export const SelectedAbilityDescriptions: Record<string, { shortDesc: string, desc: string }> = {
	"unboundblaze": {
		"shortDesc": "Dragon conversion/STAB, Magma Armor and Fire chip.",
		"desc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All.",
	},
	"pollenbloom": {
		"shortDesc": "Thick Fat, Unaware and Grass chip recovery.",
		"desc": "Thick Fat + Unaware. Fire and Ice attacks use half the attacker's attacking stat; hail causes no damage. Ignores the foe's Defense, Sp. Def and evasion changes when attacking, and their Attack, Defense, Sp. Atk and accuracy changes when defending. Reveals opposing Illusions on entry. At each turn's end, drains 1/16 of each foe's base maximum HP and heals by the HP actually drained. Grass types and Grass-immune foes are unaffected. In Free-for-All only, Grass weaknesses and resistances change the drain amount.",
	},
	"waterbarrage": {
		"shortDesc": "Dual Wield and cycling Water chip.",
		"desc": "Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. Separate bespoke composites can specify a boosted first hit and a 15% second hit. A literal Mega Launcher + Water Barrage combination instead boosts both eligible pulse/bullet hits by 1.5x: 0.9x each outside Free-for-All, or 1.5x each in Free-for-All. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP. Water immunities block it; type effectiveness scales it only in Free-for-All.",
	},
	"toxicbloom": {
		"shortDesc": "Pollen Bloom and Poison-hit recovery.",
		"desc": "Incoming Fire and Ice attacks use half the attacker's offensive stat. Immune to hail damage. When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. At turn end, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, blocked by Grass immunities; it heals the damage dealt by that chip. Only in Free-for-All does Grass type effectiveness scale this chip. Poison-type attacks restore 1/4 of actual opposing HP damage, using normal drain rounding and Heal Block, Liquid Ooze and Big Root interactions. No added drain from Substitute-only damage, misses, Protect, immunity or residual poison. Moves that already drain keep their native drain without an extra heal.",
	},
	"atrocity": {
		"shortDesc": "Unbound Blaze and retained combat bonuses.",
		"desc": "Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All. Contact moves have 1.3x power. Damaging moves have a further 1.3x power, plus another 1.3x on Cold Eclipse. Defense and Sp. Def are 1.3x, or 1.5x on Cold Eclipse. While Royal Decree or Empress is active without Neutralization, move power gains another 1.3x and incoming attack damage falls by 30%. Cannot be suppressed.",
	},
	"sunsovereign": {
		"shortDesc": "Drought, eight-turn sun and Unbound Blaze.",
		"desc": "Summons sun for 8 turns on entry. Eligible Normal moves become Dragon with 1.2x power, or 1.5x on Dragon's Den and Fairy Tale. Dragon moves receive STAB. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Immune to hail damage. At turn end, deals Fire-type damage to foes equal to 1/16 max HP, doubled if the foe is burned or the holder used a Fire or Dragon move that turn. Fire immunities block this damage; type effectiveness scales it only in Free-for-All.",
	},
	"siegelauncher": {
		"shortDesc": "Mega Launcher + Stalwart + Water Barrage.",
		"desc": "Mega Launcher gives pulse and bullet moves 1.5x power. Water Barrage supplies exactly one eligible Dual Wield pair, each hit at 0.6x power outside Free-for-All: pulse/bullet pairs therefore use 0.9x power per hit before STAB and passives. In Free-for-All both hits use full power, with the existing second-target selection. Existing multi-hit, charging, delayed, Z/Max and ineligible moves gain no extra pair. Stalwart bypasses redirection and grants +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. At turn end, foes take cycling Water damage of 1/16, 2/16, then 3/16 max HP; Water immunities block it and type effectiveness scales it only in Free-for-All. Proficient is a separate species passive.",
	},
	"toxicevolution": {
		"shortDesc": "Corrosion, Shield Dust and retained poison recovery/protection.",
		"desc": "Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5. Poisoning a foe also confuses it. Enemy attackers have a 50% poison chance after dealing damage. Takes 20% less attack damage. Once per turn, successfully poisoning a foe with its own move or poison retaliation restores 1/8 of its maximum HP. Dealing actual attack damage to an already-poisoned foe can also trigger the same 1/8 base maximum HP healing, sharing the existing once-per-turn cap with poison infliction and retaliation. Shield Dust blocks opposing move secondary effects.",
	},
	"spiralevolution": {
		"shortDesc": "Mold Breaker, Adaptability, Dual Wield and retained Trick Room/protection rules.",
		"desc": "Mold Breaker: moves ignore bypassable opposing abilities. Same-type attack bonus becomes 2x instead of 1.5x, or 2.25x instead of an existing 2x bonus. Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Damaging moves pierce protection at half power. Normal-priority moves act first in Trick Room without gaining priority. Ignores field Speed penalties and takes 20% less attack damage. Twineedle has double power.",
	},
	"neurotoxin": {
		"shortDesc": "Hydra Bond + Regenerator.",
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Heals 1/3 max HP on switching out. Shed Skin is supplied separately by the species passive.",
	},
	"surgeconduit": {
		"shortDesc": "Lightning Rod + Rock Head.",
		"desc": "Redirects eligible Electric moves, including allied moves, and absorbs Electric hits for +1 Attack and Sp. Atk. Electric Terrain entry grants both boosts. Rock Head prevents move recoil except Struggle. Electric Surge is supplied separately by the species passive.",
	},
	"railguncircuit": {
		"shortDesc": "Lightning Rod + Transistor.",
		"desc": "Redirects eligible Electric moves, including allied moves, and absorbs Electric hits for +1 Attack and Sp. Atk. Electric Terrain entry grants both boosts. Electric attacks use 1.3x Attack or Sp. Atk, or 2x on Electric Terrain and Factory. No Guard is supplied separately by the species passive.",
	},
	"lunarorbit": {
		"shortDesc": "Magic Guard and five-turn Gravity entry.",
		"desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry gives +1 Sp. Def. On entry or Mega Evolution, sets Gravity for 5 turns. Water Surface sinks to Underwater, Underwater to Midnight Zone, and Corrosive Mist to Corrosive, except on New World.",
	},
	"completeparasitism": {
		"shortDesc": "Parasitism and Self Repair; Dry Skin is passive.",
		"desc": "While above 50% HP, its weaknesses are neutralized, Magic Guard is active, opposing status moves fail, and opposing attack secondary effects are blocked. The first time Parasect would faint, it fake-faints at 1 HP, then becomes Parasect-Parasite at the end of the turn and revives at full HP. This Ability cannot be suppressed and is immune to Neutralization. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. Switching out cures major status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this extra heal. A lethal hit triggers a full-HP revival as Parasect-Parasite at the end of the turn, even if Parasitism was used before Mega Evolution. Dry Skin is supplied separately by the species passive.",
	},
	"perfectforesight": {
		"shortDesc": "Copies an opposing ability; Miracle Eye, queued attacks and Mega screens.",
		"desc": "Retains its opposing-ability copying. Automatically applies target-specific Miracle Eye before a direct damaging Psychic move. Direct single-target HP damage stores a 90 BP Psychic special attack; opposing special HP damage stores a 90 BP special attack of the incoming type. Shares one pending attack per opposing trainer (one in singles, up to three in Free-for-All), released one per turn beginning next turn. Snapshots its own level, Special Attack, stages and typing, without copied offensive abilities or items. Queues survive switching/fainting and coexist with ordinary Future Sight; normal live defenses apply. Once per battle when Alakazam Mega Evolves, sets real Reflect and Light Screen for 5 turns without shortening longer screens.",
	},
	"slowclamp": {
		"shortDesc": "Analytic + Sweet Veil.",
		"desc": "Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale or Dragon's Den entry and +2 Sp. Def when a foe lowers its stats. Moves have 1.3x power if no other active Pokemon has a move left to use that turn. Prevents sleep and Yawn for itself and allies, including Rest. Does not cure existing sleep.",
	},
	"parentalbond": {
		"shortDesc": "Eligible attacks hit twice; the second hit deals 80% damage.",
		"desc": "Eligible attacks hit twice; the second hit deals 80% damage. Existing multi-hit moves, spread hits, charging or delayed attacks, Z/Max moves and moves barred from extra hits are excluded. Cannot be suppressed. Fixed-damage attacks retain their existing fixed-damage handling. Existing KO spillover and Free-for-All follow-up rules remain. Friend Guard is a separate species passive.",
	},
	"celestialheart": {
		"shortDesc": "Soul-Heart + Friend Guard.",
		"desc": "Gains +1 Sp. Atk when any Pokemon faints, plus +2 Sp. Def on Misty or Rainbow Field. Allies take 25% less attack damage; this does not protect the holder.",
	},
	"bloomingsun": {
		"shortDesc": "Mega Sol + Invigorate.",
		"desc": "Its moves are used as if the effects of Sunny Day were active. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition.",
	},
	"silkendecoy": {
		"shortDesc": "Protective cocoon and Swarm; Self Sufficient is passive.",
		"desc": "Mega Ariados spins a persistent cocoon, renewed when another Pokemon faints. It blocks status moves and status conditions while intact, and absorbs one damaging move including all its hits and secondary effects. Retains Swarm; Self Sufficient is supplied separately by the species passive.",
	},
	"ironvise": {
		"shortDesc": "Tough Claws + Light Metal.",
		"desc": "Contact moves have 1.3x power. Halves weight. Speed is 1.25x while free of major status. Factory entry gives +1 Speed. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
	},
	"sandsovereign": {
		"shortDesc": "Solid Rock, eight-turn sand and Rock chip.",
		"desc": "On entry, it sets Sandstorm for 8 turns. It has Solid Rock. Arenite Wall lasts 5 turns, or 8 turns when extended. Each turn, non-immune foes take Rock damage equal to 1/16 max HP. Only in Free-for-All does Rock type effectiveness scale this chip.",
	},
	"verdantdrake": {
		"shortDesc": "Lightning Rod, Limber and retained Regenerator.",
		"desc": "Heals 1/3 max HP on switching out. Prevents and cures paralysis. Other Pokemon and field effects cannot lower its Speed; self-inflicted costs and item slowdowns still apply. Does not alter Trick Room or prevent removing Speed boosts or Tailwind. Redirects single-target Electric moves to itself and absorbs Electric moves for +1 Attack and Sp. Atk. Electric Terrain entry also grants both boosts.",
	},
	"blazingtempo": {
		"shortDesc": "Speed Boost + Magma Armor + Keen Eye.",
		"desc": "Gains +1 Speed at the end of each full turn it spends active. Prevents freezing outside Cold Eclipse and cures existing freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den blocks Fire moves. On Dragon's Den, Volcanic or Cold Eclipse entry, gains +1 Defense and Sp. Def. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry gives +1 accuracy and Laser Focus. Gains +1 Speed at the end of each eligible turn.. Prevents freezing and Accuracy drops, and ignores the target's evasiveness. Magma Armor and Keen Eye also retain their field effects.",
	},
	"ragingcurrent": {
		"shortDesc": "Swift Swim + Damp + Dry Skin.",
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Prevents Explosion, Self-Destruct, Mind Blown, Misty Explosion and Aftermath damage. Incoming Fire attacks use half the attacker's offensive stat. On Corrosive Mist, also prevents Eruption, Fire Pledge, Flame Burst, Heat Wave, Incinerate, Lava Plume, Searing Shot and Inferno Overdrive. Absorbs Water moves for 1/4 max HP; incoming Fire moves have 1.25x power. Effective rain heals 1/8 HP per turn; sun costs 1/8. Field healing per turn: 1/16 on Underwater, Swamp, Misty or grounded Water Surface; 1/8 when grounded and Poison-type on Murkwater. Corrosive Mist heals Poison types by 1/8 but damages non-Steel others by 1/8. Desert costs 1/8 HP per turn. Water Veil and its burn immunity are removed.",
	},
	"corrosivetouch": {
		"shortDesc": "Poison Touch and Grass STAB; Technician is passive.",
		"desc": "Contact hits have a 30% chance to poison the target. Shield Dust and Covert Cloak block this effect. Grass attacks receive a 1.5x same-type attack bonus. Technician is supplied separately by the species passive.",
	},
	"dreadmaw": {
		"shortDesc": "Strong Jaw + Invigorate.",
		"desc": "Biting moves have 1.5x power. Healing received by it and its allies is multiplied by 1.3. At turn end, it has a 50% chance to cure each adjacent ally's status condition. Huge Power is supplied separately by the species passive.",
	},
	"ironmountain": {
		"shortDesc": "Super-effective protection; one defensive boost/heal per turn.",
		"desc": "Takes 25% less damage from super-effective attacks. Once per turn, an opposing HP hit gives +1 Defense and heals 1/16 max HP.",
	},
	"enlightenment": {
		"shortDesc": "Inner Focus + Technician.",
		"desc": "Prevents flinching and Intimidate's Attack drop. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory. Pure Power is supplied separately by the species passive, including its Psychic Terrain Sp. Atk behavior.",
	},
	"stormfright": {
		"shortDesc": "Storm Power + Lightning Rod.",
		"desc": "Rain multiplies Sp. Atk by 1.5 and costs 1/8 max HP at turn end. Redirects eligible Electric moves, including allied moves, and absorbs them for +1 Attack and Sp. Atk. Electric Terrain entry grants both boosts. Intimidate is supplied separately by the species passive.",
	},
	"heavenlychorus": {
		"shortDesc": "Fluffy + Natural Cure.",
		"desc": "Takes half contact damage and double Fire damage; contact Fire attacks deal normal damage. Switching out cures status and heals 1/3 max HP only if a status was cured. Bewitched Woods cures status at turn end without this heal. Pixilate is supplied separately by the species passive.",
	},
	"astralengine": {
		"shortDesc": "Elevate + Power Spot.",
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat. Allies' moves have 1.3x power, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields.",
	},
	"royalscales": {
		"shortDesc": "Marvel Scale, Swift Swim, Dragonize and Self Sufficient.",
		"desc": "Marvel Scale boosts Defense while statused or on supported fields. Swift Swim boosts Speed in rain and supported water fields. Its Normal-type moves become Dragon-type moves and have their power multiplied by 1.2. It gains STAB on Dragon-type moves. Heals 1/16 max HP each turn. Immune to sandstorm and hail damage.",
	},
	"hauntedchime": {
		"shortDesc": "Wind Power + Cursed Body.",
		"desc": "Airborne: immune to Ground attacks and grounded hazards unless grounded. Absorbs wind moves for +1 Sp. Atk. Gains +1 Sp. Atk when Tailwind starts on its side or it enters during Tailwind. Strong Winds gives +1 Sp. Atk each turn, plus +1 Attack on Mountain or Snowy Mountain. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, curses all active foes.",
	},
	"freezerburn": {
		"shortDesc": "Slush Rush + Levitate.",
		"desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. Airborne: immune to Ground attacks and grounded hazards unless grounded. Refrigerate is supplied separately by the species passive.",
	},
	"coldlogic": {
		"shortDesc": "Prism Armor + Aftermath + Forewarn; damage reductions do not stack.",
		"desc": "Contact moves have 1.3x power. Takes 20% less attack damage, plus a further 25% reduction against super-effective attacks or on Crystal Cavern and Dark Crystal Cavern (40% total). Defense and Sp. Def are 4/3x on Cold Eclipse, Dark Crystal Cavern and Rainbow. Immune to hail damage on Cold Eclipse. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist. Damp prevents this damage. On entry, it reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves. Native Mega Metagross uses the strongest applicable Forewarn/Prism Armor damage reduction, never their product. Forewarn damage protection still requires Psychic Terrain, a Psychic aura alone does not qualify. Prism Armor field Defense/Sp. Def multipliers, Forewarn reveals and entry Sp. Atk remain unchanged.",
	},
	"nighthunt": {
		"shortDesc": "Intimidate + Illuminate.",
		"desc": "Biting moves have 1.5x power. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply. Prevents other Pokemon's accuracy drops and ignores evasion boosts. Reveals opposing Illusions on activation. Mirror Arena entry lowers foes' accuracy by 1. Starlight Arena entry gives +2 Sp. Atk and puts Spotlight on its first adjacent ally. Shared Illusion reveals occur once.",
	},
	"uncheckedassault": {
		"shortDesc": "Vital Spirit + Opportunist + Limber.",
		"desc": "Vital Spirit prevents and cures sleep, blocks Yawn, and gives Fighting attacks 1.3x Attack or Sp. Atk. Opportunist copies opposing positive stat changes after moves, entries, transformations and at turn end. Limber prevents and cures paralysis and retains its Speed-drop protection. Existing confusion prevention and cure remain. Scrappy is supplied separately by the species passive.",
	},
	"apexcleave": {
		"shortDesc": "Dual Wield + Moxie.",
		"desc": "Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 15% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. Gains +1 Attack per move KO. Sand Force is supplied separately by the species passive.",
	},
	"queensguard": {
		"shortDesc": "Contrary + Shed Skin + Intimidate.",
		"desc": "Reverses received stat-stage changes, except Z-Power changes. At turn end, if statused, affected by a listed ailment, negatively boosted or at half HP or less, has a 50% chance to heal 1/4 max HP, cure status, clear negative stages and remove Attract, confusion, Curse, Disable, Encore, Heal Block, Leech Seed, Nightmare, Perish Song, Taunt, Torment and Yawn. On Dragon's Den, activation is guaranteed but only cures status and heals, then raises its higher attacking stat by 1 and lowers both defenses by 1. On entry, lowers adjacent foes' Attack by 1. Substitute and Intimidate protections still apply.",
	},
	"streettyrant": {
		"shortDesc": "Intimidate + Mold Breaker.",
		"desc": "On entry, lowers adjacent foes' Attack by 1 with normal Substitute and Intimidate protections. Moves ignore bypassable opposing abilities. Shed Skin is supplied separately by the species passive; Scrafty retains its approved 1/8 max HP recovery; other users and composites retain 1/4.",
	},
	"adaptivepower": {
		"shortDesc": "Magic Guard + Huge Power.",
		"desc": "Doubles Attack. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. Fairy Tale entry grants +1 Sp. Def. Regenerator is supplied separately by the species passive.",
	},
	"phantomfist": {
		"shortDesc": "Unseen Fist + Aftermath + Self Sufficient.",
		"desc": "Contact moves bypass protection except Max Guard. Punching moves have 1.4x power. Heals 1/16 max HP each turn and ignores sandstorm and hail damage. A contact attacker that knocks it out loses 1/4 max HP, or 1/2 on Corrosive Mist; Damp prevents this damage. No Guard is supplied separately by the species passive.",
	},
	"shadowcurrent": {
		"shortDesc": "Protean, Technician and Anticipation.",
		"desc": "Before an eligible damaging move, changes to its type; status, reflected, delayed, Snatched and move-calling moves do not trigger this. Moves with effective power of 60 or less have 1.5x power; the threshold is 80 on Factory Field. On entry, reveals opposing Illusions and alerts to an opposing super-effective or OHKO move. If no threat is found, Psychic Terrain grants +2 Sp. Atk.",
	},
	"royalsun": {
		"shortDesc": "Drought + Supreme Overlord.",
		"desc": "Summons sun for 5 turns, or 8 with Heat Rock. Each fainted ally adds 10% move power, capped at 5 after Free-for-All doubles the effective count, for at most 1.5x power. At 2 fallen allies, gains Infiltrator; at 4, flinch immunity; at 5, Magic Guard and a one-time +1 Attack and Sp. Atk. Flame Body is supplied separately by the species passive.",
	},
	"toxicrenewal": {
		"shortDesc": "Adaptability + Poison Touch.",
		"desc": "Uses full local Adaptability for same-type moves, including its existing higher-STAB interaction. Contact hits have a 30% chance to poison; Shield Dust and Covert Cloak block this effect. Regenerator is supplied separately by the species passive.",
	},
	"heavyartillery": {
		"shortDesc": "Unaware and custom pulse/bullet artillery.",
		"desc": "When attacking, ignores the target's Defense, Sp. Def and evasion stages. When defending, ignores the attacker's Attack, Defense, Sp. Atk and accuracy stages. Reveals opposing Illusions on entry. Damaging pulse and bullet moves have double power and hit all foes in Doubles and Free-for-All. In Free-for-All, the designated primary target takes full damage and other foes take half their otherwise-calculated damage; protection or immunity of the primary does not promote another target. If no valid primary is supplied, the first active foe in side order is selected. Defense and Special Defense fall by 1 after firing.",
	},
	"phalanxform": {
		"shortDesc": "Hydra Bond, Friend Guard, Battle Armor and trap escape.",
		"desc": "Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den. Allies take 25% less attack damage; this does not protect the holder. Prevents critical hits and takes 20% less attack damage. Gains +1 Defense on Fairy Tale entry and +2 Defense when a foe lowers its stats.Cannot be trapped.",
	},
	"ange": {
		"shortDesc": "Eternal Flower + Mold Breaker.",
		"desc": "Uses full local Eternal Flower: Grass attacks use 1.5x Attack or Sp. Atk, multiplied by 2 on Fairy Tale or Cold Eclipse and 1.5 on Starlight Arena, New World or Bewitched Woods. Damaging moves deal double damage to Pulse forms. Its existing exact special-form selectors weaken opposing stats to 0.7x. Fainting creates Bewitched Woods for five turns. Moves bypass opposing abilities once. Fairy Aura is supplied separately by the species passive.",
	},
	"cursedarmament": {
		"shortDesc": "Ghost/Steel attacks gain 20% power; stolen PP charges a 40% attack.",
		"desc": "Own non-fixed, non-delayed Ghost and Steel attacks gain 20% power, retaining their physical or special category. Once per turn after a whole attack damages a surviving active foe, steal up to 2 PP from its queued move; a newly entered foe without a queued move instead loses up to 2 PP from one random damaging move. Stealing PP stores one charge. The next eligible attack consumes it on attempt, including a miss, protection or immunity, and gains 40% power instead of 20%. A successful charged attack steals up to 3 PP from the last attempted current move, or the queued move if none was used, plus 1 PP from every other current move. Newly entered foes always use one random damaging move as the charged primary, even with earlier move history. Charged attacks cannot recharge themselves. Both drains share one use per turn and affect one surviving foe; Substitute-only damage and KOs do not qualify. No healing or PP refund. Switching, fainting, suppression or losing the ability clears the charge. Frisk is supplied separately by the species passive. Curse retains its ordinary local behavior and HP cost.",
	},
	"solarhydra": {
		"shortDesc": "Hydra Bond + Grassy Surge.",
		"desc": "Retains full local Hydra Bond and Grassy Surge. Solar Bud is a separate species passive: after a sunny end turn, the next opposing Grass HP hit cures status and heals 1/8 max HP, once per entry. Solar Power is removed, including its offensive multiplier and HP cost.",
	},
};
