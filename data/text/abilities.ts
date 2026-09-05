export const AbilitiesText: { [id: IDEntry]: AbilityText } = {
	noability: {
		name: "No Ability",
		shortDesc: "Does nothing.",
	},
	selfsufficient: { name: "Self Sufficient", desc: "Restores 1/16 of this Pokemon's maximum HP at the end of each turn and is immune to Sandstorm and Hail damage.", shortDesc: "Heals 1/16 each turn; immune to Sandstorm and Hail." },
	selfrepair: { name: "Self Repair", desc: "This Pokemon has Self Sufficient and Natural Cure's effects.", shortDesc: "Self Sufficient + Natural Cure." },
	unstableevo: {
		name: "Unstable Evo",
		desc: "Eevee-Starter's IVs carry through form changes. Before using a Let's Go move, it changes into the matching evolution and uses that form's stats, typing, and Speed. It keeps Unstable Evo, Filter, and Self Sufficient, and gains both of the evolution's listed Ability effects. Switching out restores Eevee-Starter. It cannot use battle gimmicks or hold Eevium Z.",
		shortDesc: "Filter + Self Sufficient; Let's Go moves change form and grant two Ability effects; no gimmicks.",
	},
	hisuianpath: { name: "Hisuian Path", desc: "This Pokemon has Sap Sipper, Inner Focus, and Fluffy's effects.", shortDesc: "Sap Sipper + Inner Focus + Fluffy." },
	scarecrow: { name: "Scarecrow", desc: "This Pokemon has Wind Rider, Steelworker, and Stakeout's effects.", shortDesc: "Wind Rider + Steelworker + Stakeout." },
	bruteforce: { name: "Brute Force", desc: "This Pokemon has Reckless and Rock Head's effects.", shortDesc: "Reckless + Rock Head." },
	precision: { name: "Precision", desc: "Super-effective moves used by this Pokemon cannot miss and have an increased critical-hit ratio.", shortDesc: "Super-effective moves never miss; boosted critical-hit ratio." },
	secondwind: { name: "Second Wind", desc: "Endures the first attack that would knock it out at 1 HP.", shortDesc: "Endures the first KO at 1 HP." },
	rapidresponse: { name: "Rapid Response", desc: "On this Pokemon's first active turn, its Speed is 1.5x and its Sp. Atk is 1.2x.", shortDesc: "First active turn: 1.5x Spe and 1.2x Sp. Atk." },
	seafiend: { name: "Sea Fiend", desc: "This Pokemon has Toxic Debris and Water Bubble's effects.", shortDesc: "Toxic Debris + Water Bubble." },
	hisuianoath: { name: "Hisuian Oath", desc: "This Pokemon has Sworn Duty, Tough Claws, and Corrosion's effects.", shortDesc: "Sworn Duty + Tough Claws + Corrosion." },
	aevianoath: { name: "Aevian Oath", desc: "This Pokemon has Sworn Duty, Dual Wield, and Battle Armor's effects.", shortDesc: "Sworn Duty + Dual Wield + Battle Armor." },
	hisuianvanguard: { name: "Hisuian Vanguard", desc: "This Pokemon has Rapid Response and Wind Power's effects.", shortDesc: "Rapid Response + Wind Power." },
	unovavanguard: { name: "Unova Vanguard", desc: "This Pokemon has Violent Rush and Wind Rider's effects.", shortDesc: "Violent Rush + Wind Rider." },
	unovawing: {
		name: "Unova Wing",
		desc: "This Pokemon has Super Luck, Competitive, and Unburden's effects.",
		shortDesc: "+1 critical-hit stage; opposing stat drops give +2 Sp. Atk; item loss doubles Speed.",
	},
	aevianwing: {
		name: "Aevian Wing",
		desc: "This Pokemon has Scrappy, Rock Head, and Defiant's effects. It changes into Unfezant-Rejuv once when it enters battle.",
		shortDesc: "Transforms once; Scrappy + Rock Head + Defiant.",
	},
	ascendance: {
		name: "Ascendance",
		desc: "All damaging moves deal 1.5x damage, can hit type immunities, and gain a 1.5x STAB-style boost when they do not match this Pokemon's type. On Holy Field, this Pokemon's Attack and Special Attack are raised by 1 on entry. Eevee-Starter and Umbreon transform into Divineon on entry; Umbreon uses Umbreon-Perfect's appearance while retaining Umbreon's full movepool.",
		shortDesc: "Damaging moves deal 1.5x, bypass immunities, and gain off-type STAB; transforms Eevee-Starter/Umbreon into Divineon.",
	},
	hisuianresolve: { name: "Hisuian Resolve", desc: "This Pokemon has Brute Force and Magma Armor's effects.", shortDesc: "Brute Force + Magma Armor." },
	nobleconduit: { name: "Noble Conduit", desc: "This Pokemon has Battery, Solar Power, and Aftermath's effects.", shortDesc: "Battery + Solar Power + Aftermath." },
	nobledance: { name: "Noble Dance", desc: "This Pokemon has Dancer, Hospitality, and Own Tempo's effects.", shortDesc: "Dancer + Hospitality + Own Tempo." },
	noblearmor: { name: "Noble Armor", desc: "This Pokemon has Prism Armor and Ice Body's effects.", shortDesc: "Prism Armor + Ice Body." },
	noblerider: { name: "Noble Rider", desc: "This Pokemon has Swift Swim and Mold Breaker's effects.", shortDesc: "Swift Swim + Mold Breaker." },
	celestialheart: { name: "Celestial Heart", desc: "This Pokemon has Multiscale and Soul-Heart's effects.", shortDesc: "Multiscale + Soul Heart." },
	crueltag: { name: "Cruel Tag", desc: "This Pokemon has Shadow Tag and Infiltrator's effects. When it faints, Haunted Field starts for 5 turns.", shortDesc: "Shadow Tag + Infiltrator; faint summons Haunted Field." },
	cruelshell: { name: "Cruel Shell", desc: "This Pokemon has Hyper Cutter, Shell Armor, and Anger Shell's effects.", shortDesc: "Hyper Cutter + Shell Armor + Anger Shell." },
	adaptability: {
		name: "Adaptability",
		desc: "This Pokemon's moves that match one of its types have a same-type attack bonus (STAB) of 2 instead of 1.5.",
		shortDesc: "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.",
	},
	spiralevolution: {
		name: "Spiral Evolution",
		desc: "This Pokemon has Adaptability, Levitate, Dual Wield, Infiltrator, and Shield Dust. Its damaging moves pierce protection for reduced damage, its normal-priority moves act first in Trick Room without gaining priority, it ignores field-based Speed penalties, and it takes 0.8x damage.",
		shortDesc: "Adaptability + Levitate + Dual Wield + Infiltrator + Shield Dust; ignores field Speed penalties; protection pierce; takes 0.8x.",
	},
	alchemistsurge: {
		name: "Alchemist Surge",
		desc: "This Pokemon creates Psychic Terrain on entry, gains Competitive, Neuroforce, and Hydra Bond's effects.",
		shortDesc: "Psychic Surge + Competitive + Neuroforce + Hydra Bond.",
	},
	guidingomen: {
		name: "Guiding Omen",
		desc: "This Pokemon has Friend Guard and Serene Grace's effects.",
		shortDesc: "Friend Guard + Serene Grace.",
	},
	greatmarsh: {
		name: "Great Marsh",
		desc: "This Pokemon has Dry Skin, Adaptability, Poison Touch, and Anticipation's effects. On switch-in, it removes foe Illusions.",
		shortDesc: "Dry Skin + Adaptability + Poison Touch + Anticipation; removes foe Illusions on entry.",
	},
	phalanxform: {
		name: "Phalanx Form",
		desc: "This Pokemon has Hydra Bond, Friend Guard, and Battle Armor's effects, gains STAB on Steel moves, and cannot be trapped.",
		shortDesc: "Hydra Bond + Friend Guard + Battle Armor; Steel STAB; untrappable.",
	},
	windchime: {
		name: "Wind Chime",
		desc: "This Pokemon has Armorize, Punk Rock, and Levitate's effects.",
		shortDesc: "Armorize + Punk Rock + Levitate.",
	},
	hauntedchime: {
		name: "Haunted Chime",
		desc: "This Pokemon has Elevate, Wind Power, and Cursed Body's effects.",
		shortDesc: "Elevate + Wind Power + Cursed Body.",
	},
	auramaster: {
		name: "Aura Master",
		desc: "This Pokemon takes half damage from contact moves and has Dual Wield, Inner Focus, and Technician's effects.",
		shortDesc: "0.5x from contact; Dual Wield + Inner Focus + Technician.",
	},
	patternshift: {
		name: "Pattern Shift",
		desc: "This Pokemon has Protean, Shed Skin, and Unaware's effects.",
		shortDesc: "Protean + Shed Skin + Unaware.",
	},
	bonewarrior: {
		name: "Bone Warrior",
		desc: "This Pokemon has Battle Armor and Self Sufficient's effects.",
		shortDesc: "Battle Armor + Self Sufficient.",
	},
	technicalspecialist: {
		name: "Technical Specialist",
		desc: "This Pokemon has Technician, Shed Skin, and Shell Armor's effects.",
		shortDesc: "Technician + Shed Skin + Shell Armor.",
	},
	dualwield: {
		name: "Dual Wield",
		desc: "Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 65% power, with an independent accuracy check for each hit. When combined with Sharpness, Mega Launcher, or Power Drill, the first hit receives that boost and the second hit deals 20% of the move's unboosted power. In Free-for-All, both hits use full power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair.",
		shortDesc: "Two 65% independent rolls; boosting pairs: full +20%; FFA: two full-power targets.",
	},
	apexvenom: {
		name: "Apex Venom",
		desc: "This Pokemon has Strong Jaw and Shed Skin's effects. Poison moves, including Poison Fang, are super effective against Poison- and Steel-type Pokemon. Poison Fang is Dragon-type and has 1.5x power. Biting moves bypass protection and have a 30% chance to badly poison the target.",
		shortDesc: "Strong Jaw + Shed Skin; Poison hits Poison/Steel; Poison Fang is Dragon/1.5x; bites bypass protection and badly poison 30%.",
	},
	apexpredator: {
		name: "Apex Predator",
		desc: "This Pokemon has Relic Armor, Precision, and Wind Rider's effects.",
		shortDesc: "Relic Armor + Precision + Wind Rider.",
	},
	violentrush: {
		name: "Violent Rush",
		desc: "On this Pokemon's first active turn, its Speed is 1.5x and its Attack is 1.2x.",
		shortDesc: "First active turn: 1.5x Spe and 1.2x Atk.",
	},
	unleashedego: {
		name: "Unleashed Ego",
		desc: "This Pokemon has Ultra Ego, Levitate, and Raging Storm's effects.",
		shortDesc: "Ultra Ego + Levitate + Raging Storm.",
	},
	astralcore: {
		name: "Astral Core",
		desc: "This Pokemon has Pure Power, Natural Cure, and Illuminate's effects.",
		shortDesc: "Pure Power + Natural Cure + Illuminate.",
	},
	joyride: {
		name: "Joyride",
		desc: "This Pokemon has Aerilate and Hyper Cutter's effects.",
		shortDesc: "Aerilate + Hyper Cutter.",
	},
	aerilate: {
		name: "Aerilate",
		desc: "This Pokemon's Normal-type moves become Flying-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc: "This Pokemon's Normal-type moves become Flying type and have 1.2x power.",
		gen6: {
			desc: "This Pokemon's Normal-type moves become Flying-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
			shortDesc: "This Pokemon's Normal-type moves become Flying type and have 1.3x power.",
		},
	},
	aftermath: {
		name: "Aftermath",
		desc: "If this Pokemon is knocked out with a contact move, that move's user loses 1/4 of its maximum HP, rounded down. This effect is prevented if the move's user has the Magic Guard Ability or if any active Pokemon has the Damp Ability.",
		shortDesc: "If this Pokemon is KOed with a contact move, that move's user loses 1/4 its max HP.",

		damage: "  [POKEMON] was hurt!",
	},
	airlock: {
		name: "Air Lock",
		shortDesc: "While this Pokemon is active, the effects of weather conditions are disabled.",

		start: "  The effects of the weather disappeared.",
	},
	analytic: {
		name: "Analytic",
		desc: "The power of this Pokemon's move is multiplied by 1.3 if it is the last to move in a turn. Does not affect Doom Desire and Future Sight.",
		shortDesc: "This Pokemon's attacks have 1.3x power if it is the last to move in a turn.",
	},
	angerpoint: {
		name: "Anger Point",
		desc: "The first damaging hit this Pokemon takes raises its Attack by 1 stage. A critical hit raises its Attack by 12 stages.",
		shortDesc: "First damaging hit: +1 Attack; critical hits: +12 Attack.",
		gen4: {
			desc: "If this Pokemon, or its substitute, is struck by a critical hit, its Attack is raised by 12 stages.",
			shortDesc: "If this Pokemon or its substitute takes a critical hit, its Attack is raised 12 stages.",
		},

		boost: "  [POKEMON] maxed its Attack!",
	},
	angershell: {
		name: "Anger Shell",
		desc: "When this Pokemon has more than 1/2 its maximum HP and takes damage from an attack bringing it to 1/2 or less of its maximum HP, its Attack, Special Attack, and Speed are raised by 1 stage, and its Defense and Special Defense are lowered by 1 stage. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		shortDesc: "At 1/2 or less of this Pokemon's max HP: +1 Atk, Sp. Atk, Spe, and -1 Def, Sp. Def.",
	},
	anticipation: {
		name: "Anticipation",
		desc: "On switch-in, this Pokemon is alerted if any opposing Pokemon has a super-effective or OHKO move, and foe Illusions are removed.",
		shortDesc: "Warns of super-effective/OHKO moves; removes foe Illusions on entry.",
		gen5: {
			desc: "On switch-in, this Pokemon is alerted if any opposing Pokemon has an attacking move with a type that is super effective against this Pokemon, or any OHKO move. This effect considers moves to be their original type.",
		},
		gen4: {
			desc: "On switch-in, this Pokemon is alerted if any opposing Pokemon has an attacking move with a type that is super effective against this Pokemon, or any OHKO move if this Pokemon is not immune to the type and the Pokemon with the move is not a lower level than this Pokemon. This effect considers moves to be their original type. This effect is not activated by Counter, Dragon Rage, Metal Burst, Mirror Coat, Night Shade, Psywave, or Seismic Toss. This effect checks if this Pokemon is holding an Iron Ball, if it is under the effects of Foresight (Odor Sleuth), Gravity, Ingrain, Miracle Eye, or Roost, and whether each opposing Pokemon has the Normalize or Scrappy Abilities before determining if their attacks fit the conditions.",
		},

		activate: "  [POKEMON] shuddered!",
	},
	arenatrap: {
		name: "Arena Trap",
		desc: "Prevents opposing Pokemon from choosing to switch out unless they are airborne, are holding a Shed Shell, or are a Ghost type.",
		shortDesc: "Prevents opposing Pokemon from choosing to switch out unless they are airborne.",
		gen6: {
			desc: "Prevents adjacent opposing Pokemon from choosing to switch out unless they are airborne, are holding a Shed Shell, or are a Ghost type.",
		},
		gen5: {
			desc: "Prevents adjacent opposing Pokemon from choosing to switch out unless they are airborne or holding a Shed Shell.",
		},
		gen4: {
			desc: "Prevents opposing Pokemon from choosing to switch out unless they are airborne or holding a Shed Shell.",
		},
		gen3: {
			desc: "Prevents opposing Pokemon from choosing to switch out unless they are airborne.",
		},
	},
	armortail: {
		name: "Armor Tail",
		desc: "Priority moves used by opposing Pokemon targeting this Pokemon or its allies are prevented from having an effect.",
		shortDesc: "This Pokemon and its allies are protected from opposing priority moves.",

		block: "#damp",
	},
	aromaveil: {
		name: "Aroma Veil",
		desc: "This Pokemon and its allies cannot become affected by Attract, Disable, Encore, Heal Block, Taunt, or Torment.",
		shortDesc: "Protects user/allies from Attract, Disable, Encore, Heal Block, Taunt, and Torment.",

		block: "  [POKEMON] is protected by an aromatic veil!",
	},
	asone: {
		name: "As One",
		shortDesc: "See 'As One (Glastrier)' and 'As One (Spectrier)'.",

		start: "  [POKEMON] has two Abilities!",
	},
	asoneglastrier: {
		name: "As One (Glastrier)",
		shortDesc: "Combination of the Unnerve and Chilling Neigh Abilities.",
	},
	asonespectrier: {
		name: "As One (Spectrier)",
		shortDesc: "Combination of the Unnerve and Grim Neigh Abilities.",
	},
	aquashell: {
		name: "Aqua Shell",
		desc: "This Pokemon has Water Bubble and Water Veil. Its Water attacks are doubled, incoming Fire attacks are halved, it cannot be burned, it ignores Hail and Sandstorm damage, and it gains Aqua Ring on entry.",
		shortDesc: "Water Bubble + Water Veil; gains Aqua Ring on entry.",
	},
	aurabreak: {
		name: "Aura Break",
		desc: "While this Pokemon is active, the effects of the Dark Aura and Fairy Aura Abilities are reversed, multiplying the power of Dark- and Fairy-type moves, respectively, by 3/4 instead of 1.33.",
		shortDesc: "While this Pokemon is active, the Dark Aura and Fairy Aura power modifier is 0.75x.",

		start: "  [POKEMON] reversed all other Pok\u00E9mon's auras!",
	},
	baddreams: {
		name: "Bad Dreams",
		desc: "Causes opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.",
		shortDesc: "Causes sleeping foes to lose 1/8 of their max HP at the end of each turn.",
		gen6: {
			desc: "Causes adjacent opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.",
			shortDesc: "Causes sleeping adjacent foes to lose 1/8 of their max HP at the end of each turn.",
		},
		gen4: {
			desc: "Causes opposing Pokemon to lose 1/8 of their maximum HP, rounded down, at the end of each turn if they are asleep.",
			shortDesc: "Causes sleeping foes to lose 1/8 of their max HP at the end of each turn.",
		},

		damage: "  [POKEMON] is tormented!",
	},
	ballfetch: {
		name: "Ball Fetch",
		shortDesc: "No competitive use.",
	},
	battery: {
		name: "Battery",
		desc: "This Pokemon and its allies have 1.3x power on Special attacks. The user's Special attacks get an additional 1.5x multiplier in Electric Terrain or Rain.",
		shortDesc: "Self/ally Special attacks 1.3x; user gets extra 1.5x in Electric Terrain/Rain.",
	},
	battlearmor: {
		name: "Battle Armor",
		desc: "This Pokemon cannot be struck by critical hits and takes 0.8x damage from attacks. In Fairy Tale, it gains 1 Defense on entry; opposing stat drops give it 2 Defense.",
		shortDesc: "No critical hits; takes 0.8x damage; Fairy Tale +1 Def; stat drops give +2 Def.",
	},
	battlebond: {
		name: "Battle Bond",
		desc: "When this Pokemon is a Greninja or Greninja-Bond, it transforms into Ash-Greninja after it knocks out another Pokemon, and knocking out a target restores 1/8 of this Pokemon's maximum HP. This Pokemon takes 0.75x damage from attacks, takes 30% less damage from Fighting Clause Abilities, and those Abilities' bonus damage does not affect it. In Doubles, Multi, or Free-For-All, once per battle, if a move would knock it out from above 1/3 max HP, it survives with 1 HP. This Pokemon's attacks deal 1.3x damage to Pokemon with Royal Decree or Neutralization. In Cold Eclipse, its attacks deal 1.3x damage and it takes 0.6x damage from attacks.",
		shortDesc: "After a KO, Greninja or Greninja-Bond becomes Ash-Greninja; 0.75x damage from attacks; KO healing.",
		gen8: {
			desc: "If this Pokemon is a Greninja or Greninja-Bond, it transforms into Ash-Greninja after attacking and knocking out another Pokemon. If this Pokemon is an Ash-Greninja, its Water Shuriken has 20 power and always hits three times.",
			shortDesc: "After KOing a Pokemon: becomes Ash-Greninja, Water Shuriken: 20 power, hits 3x.",
		},
		activate: "  [POKEMON] became fully charged due to its bond with its Trainer!",
		transform: "[POKEMON] became Ash-Greninja!",
	},
	beadsofruin: {
		name: "Beads of Ruin",
		shortDesc: "Active Pokemon without this Ability have their Special Defense multiplied by 0.75.",

		start: "  [POKEMON]'s Beads of Ruin weakened the Sp. Def of all surrounding Pokémon!",
	},
	beastboost: {
		name: "Beast Boost",
		desc: "This Pokemon's highest stat is raised by 1 stage if it attacks and knocks out another Pokemon. Stat stage changes are not considered. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order.",
		shortDesc: "This Pokemon's highest stat is raised by 1 if it attacks and KOes another Pokemon.",
	},
	berserk: {
		name: "Berserk",
		desc: "When this Pokemon has more than 1/2 its maximum HP and takes damage from an attack bringing it to 1/2 or less of its maximum HP, its Special Attack is raised by 1 stage. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		shortDesc: "This Pokemon's Sp. Atk is raised by 1 when it reaches 1/2 or less of its max HP.",
	},
	bigpecks: {
		name: "Big Pecks",
		shortDesc: "Prevents other Pokemon from lowering this Pokemon's Defense stat stage.",
	},
	blaze: {
		name: "Blaze",
		desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its offensive stat is multiplied by 1.5 while using a Fire-type attack.",
		shortDesc: "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Fire attacks.",
		gen4: {
			desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Fire-type attacks have their power multiplied by 1.5.",
			shortDesc: "At 1/3 or less of its max HP, this Pokemon's Fire-type attacks have 1.5x power.",
		},
	},
	bulletproof: {
		name: "Bulletproof",
		desc: "This Pokemon is immune to bullet, pulse, and all Mega Launcher-boosted moves and takes 20% less damage from attacks.",
		shortDesc: "Immune to bullet/pulse/Mega Launcher moves; takes 0.8x damage.",
	},
	cheekpouch: {
		name: "Cheek Pouch",
		desc: "If this Pokemon eats a held Berry, it restores 1/3 of its maximum HP, rounded down, in addition to the Berry's effect. This effect can also activate after the effects of Bug Bite, Fling, Pluck, Stuff Cheeks, and Teatime if the eaten Berry had an effect on this Pokemon.",
		shortDesc: "If this Pokemon eats a Berry, it restores 1/3 of its max HP after the Berry's effect.",
		gen7: {
			desc: "If this Pokemon eats a held Berry, it restores 1/3 of its maximum HP, rounded down, in addition to the Berry's effect. This effect can also activate after the effects of Bug Bite, Fling, and Pluck if the eaten Berry has an effect on this Pokemon.",
		},
	},
	chillingneigh: {
		name: "Chilling Neigh",
		desc: "This Pokemon's Attack is raised by 1 stage if it attacks and knocks out another Pokemon.",
		shortDesc: "This Pokemon's Attack is raised by 1 stage if it attacks and KOes another Pokemon.",
	},
	chlorophyll: {
		name: "Chlorophyll",
		desc: "If Sunny Day is active, this Pokemon's Speed is doubled. This effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "If Sunny Day is active, this Pokemon's Speed is doubled.",
		gen7: {
			desc: "If Sunny Day is active, this Pokemon's Speed is doubled.",
		},
	},
	clearbody: {
		name: "Clear Body",
		shortDesc: "Prevents other Pokemon from lowering this Pokemon's stat stages.",
	},
	cloudnine: {
		name: "Cloud Nine",
		shortDesc: "While this Pokemon is active, the effects of weather conditions are disabled.",

		start: "#airlock",
	},
	colorchange: {
		name: "Color Change",
		desc: "This Pokemon's type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		shortDesc: "This Pokemon's type changes to the type of a move it's hit by, unless it has the type.",
		gen4: {
			desc: "This Pokemon's type changes to match the type of the last move that hit it, unless that type is already one of its types. This effect applies after each hit from a multi-hit move. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
	},
	comatose: {
		name: "Comatose",
		desc: "This Pokemon is considered to be asleep and cannot become affected by a non-volatile status condition or Yawn.",
		shortDesc: "This Pokemon cannot be statused, and is considered to be asleep.",

		start: "  [POKEMON] is drowsing!",
	},
	commander: {
		name: "Commander",
		desc: "If this Pokemon is a Tatsugiri and a Dondozo is an active ally, this Pokemon goes into the Dondozo's mouth. The Dondozo has its Attack, Special Attack, Speed, Defense, and Special Defense raised by 2 stages. During the effect, the Dondozo cannot be switched out, this Pokemon cannot select an action, and attacks targeted at this Pokemon will be avoided but it will still take indirect damage. If this Pokemon faints during the effect, a Pokemon can be switched in as a replacement but the Dondozo remains unable to be switched out. If the Dondozo faints during the effect, this Pokemon regains the ability to select an action.",
		shortDesc: "If ally is Dondozo: this Pokemon cannot act or be hit, +2 to all Dondozo's stats.",

		activate: "  [POKEMON] was swallowed by [TARGET] and became [TARGET]'s commander!",
	},
	competitive: {
		name: "Competitive",
		desc: "This Pokemon's Special Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.",
		shortDesc: "This Pokemon's Sp. Atk is raised by 2 for each of its stats that is lowered by a foe.",
	},
	compoundeyes: {
		name: "Compound Eyes",
		shortDesc: "This Pokemon's moves have their accuracy multiplied by 1.3.",
	},
	contrary: {
		name: "Contrary",
		shortDesc: "If this Pokemon has a stat stage raised it is lowered instead, and vice versa.",
		gen7: {
			desc: "If this Pokemon has a stat stage raised it is lowered instead, and vice versa. This Ability does not affect stat stage increases received from Z-Power effects that happen before a Z-Move is used.",
		},
		gen6: {
			desc: "If this Pokemon has a stat stage raised it is lowered instead, and vice versa.",
		},
	},
	queensguard: {
		name: "Queen's Guard",
		desc: "This Pokemon has Contrary, Shed Skin, and Intimidate's effects.",
		shortDesc: "Contrary + Shed Skin + Intimidate.",
	},
	corrosion: {
		name: "Corrosion",
		desc: "This Pokemon's Poison moves and status can affect normally immune targets. In Wasteland, its moves can add status; Corrosive fields amplify its damage; poisoned foes lose 1 Defense and Sp. Def.",
		shortDesc: "Poison bypasses immunity; Wasteland/Corrosive effects; poison lowers Def/SpD.",
	},
	costar: {
		name: "Costar",
		shortDesc: "On switch-in, this Pokemon copies all of its ally's stat stage changes.",
	},
	cottondown: {
		name: "Cotton Down",
		desc: "When this Pokemon is hit by an attack, the Speed of all other Pokemon on the field is lowered by 1 stage.",
		shortDesc: "If this Pokemon is hit, it lowers the Speed of all other Pokemon on the field 1 stage.",
	},
	cudchew: {
		name: "Cud Chew",
		shortDesc: "If this Pokemon eats a Berry, it will eat that Berry again at the end of the next turn.",
	},
	curiousmedicine: {
		name: "Curious Medicine",
		shortDesc: "On switch-in, this Pokemon's allies have their stat stages reset to 0.",
	},
	cursedbody: {
		name: "Cursed Body",
		desc: "If this Pokemon is hit by an attack, there is a 30% chance that move gets disabled unless one of the attacker's moves is already disabled. When this Pokemon faints, all opposing Pokemon become cursed.",
		shortDesc: "30% disables moves that hit this Pokemon; on faint, curses all foes.",
	},
	cutecharm: {
		name: "Cute Charm",
		desc: "There is a 30% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender.",
		shortDesc: "30% chance of infatuating Pokemon of the opposite gender if they make contact.",
		gen4: {
			desc: "There is a 30% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "There is a 1/3 chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "1/3 chance of infatuating Pokemon of the opposite gender if they make contact.",
		},
	},
	damp: {
		name: "Damp",
		desc: "Blocks Explosion, Mind Blown, Misty Explosion, Self-Destruct, and Aftermath. In Corrosive Mist, it stifles ignition moves and halves incoming Fire attacking stats.",
		shortDesc: "Blocks explosions/Aftermath; stifles ignition in Corrosive Mist; halves incoming Fire stats.",
		gen7: {
			desc: "While this Pokemon is active, Explosion, Mind Blown, Self-Destruct, and the Aftermath Ability are prevented from having an effect.",
			shortDesc: "Prevents Explosion/Mind Blown/Self-Destruct/Aftermath while this Pokemon is active.",
		},
		gen6: {
			desc: "While this Pokemon is active, Explosion, Self-Destruct, and the Aftermath Ability are prevented from having an effect.",
			shortDesc: "Prevents Explosion/Self-Destruct/Aftermath while this Pokemon is active.",
		},
		gen3: {
			desc: "While this Pokemon is active, Explosion and Self-Destruct are prevented from having an effect.",
			shortDesc: "Prevents Explosion and Self-Destruct while this Pokemon is active.",
		},

		block: "  [SOURCE] cannot use [MOVE]!",
	},
	dancer: {
		name: "Dancer",
		desc: "After another Pokemon uses a dance move, this Pokemon uses the same move. The copied move is subject to all effects that can prevent a move from being executed. A move used through this Ability cannot be copied again by other Pokemon with this Ability.",
		shortDesc: "After another Pokemon uses a dance move, this Pokemon uses the same move.",
	},
	darkaura: {
		name: "Dark Aura",
		desc: "While this Pokemon is active, the power of Dark-type moves used by active Pokemon is multiplied by 1.33.",
		shortDesc: "While this Pokemon is active, a Dark move used by any Pokemon has 1.33x power.",

		start: "  [POKEMON] is radiating a dark aura!",
	},
	dauntlessshield: {
		name: "Dauntless Shield",
		shortDesc: "On switch-in, this Pokemon's Defense is raised by 1 stage. Once per battle.",
		gen8: {
			shortDesc: "On switch-in, this Pokemon's Defense is raised by 1 stage.",
		},
	},
	dazzling: {
		name: "Dazzling",
		desc: "Priority moves used by opposing Pokemon targeting this Pokemon or its allies are prevented from having an effect.",
		shortDesc: "This Pokemon and its allies are protected from opposing priority moves.",

		block: "#damp",
	},
	defeatist: {
		name: "Defeatist",
		desc: "While this Pokemon has 1/4 or less of its maximum HP, its Attack and Special Attack are halved. This Pokemon also has Relic Armor's effect.",
		shortDesc: "At 1/4 HP or less, Atk/SpA are halved; also has Relic Armor.",
	},
	relicinstinct: {
		name: "Relic Instinct",
		desc: "Above 50% HP, this Pokemon's moves ignore opposing Abilities. At 50% HP or less, it takes 0.75x damage from attacks, cannot be critically hit, restores 1/16 max HP each turn, and its Attack and Special Attack are halved. Once at 25% HP or less, it heals 25% max HP, clears negative stat stages, and lowers its Defense and Special Defense by 2.",
		shortDesc: ">50%: ignores Abilities. <=50%: defensive mode; <=25%: one pinch heal.",
	},
	fossilfrenzy: {
		name: "Fossil Frenzy",
		desc: "When this Pokemon is hit by a damaging move, its Attack and Speed rise by 1 stage and it becomes confused. While confused, it takes 1.25x damage from attacks. This Pokemon has Klutz's effect. If it hits itself in confusion, it also loses 1/8 of its maximum HP.",
		shortDesc: "Hit: +1 Atk/Spe and confusion; confusion takes 1.25x; Klutz; self-hit costs 1/8.",
	},
	defiant: {
		name: "Defiant",
		desc: "This Pokemon's Attack is raised by 2 stages for each of its stat stages that is lowered by an opposing Pokemon.",
		shortDesc: "This Pokemon's Attack is raised by 2 for each of its stats that is lowered by a foe.",
	},
	deltastream: {
		name: "Delta Stream",
		desc: "On switch-in, the weather becomes Delta Stream, which removes the weaknesses of the Flying type from Flying-type Pokemon. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by the Desolate Land or Primordial Sea Abilities.",
		shortDesc: "On switch-in, strong winds begin until this Ability is not active in battle.",
	},
	desolateland: {
		name: "Desolate Land",
		desc: "On switch-in, the weather becomes Desolate Land, which includes all the effects of Sunny Day and prevents damaging Water-type moves from executing. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by the Delta Stream or Primordial Sea Abilities.",
		shortDesc: "On switch-in, extremely harsh sunlight begins until this Ability is not active in battle.",
	},
	disguise: {
		name: "Disguise",
		desc: "If this Pokemon is a Mimikyu, its status moves have +1 priority while its disguise is intact. The first hit it takes in battle deals 0 neutral damage, curses the attacker, breaks the disguise, changes it to Busted Form, and makes it lose 1/8 of its max HP. Curse inflicted by Disguise deals 1/8 max HP each turn. After its disguise is broken, attackers that hit it with damaging moves become cursed. Confusion damage also breaks the disguise.",
		shortDesc: "Intact: status +1. First hit is blocked/curses; busted hit curses foes for 1/8.",
		gen7: {
			desc: "If this Pokemon is a Mimikyu, the first hit it takes in battle deals 0 neutral damage. Its disguise is then broken and it changes to Busted Form. Confusion damage also breaks the disguise.",
			shortDesc: "(Mimikyu only) First hit deals 0 damage, breaks disguise.",
		},

		block: "  Its disguise served it as a decoy!",
		transform: "[POKEMON]'s disguise was busted!",
	},
	download: {
		name: "Download",
		desc: "On switch-in, this Pokemon compares the opposing side's combined Defense and Special Defense. If Defense is lower, its Attack rises; otherwise its Special Attack rises. Its first damaging move after switching in is a critical hit.",
		shortDesc: "Boosts the offense targeting foes' weaker defense; first damaging move crits.",
	},
	livinglegend: {
		name: "Living Legend",
		desc: "This Pokemon has Flash Fire, Download, and Sheer Force. Hidden effect: Extreme Speed has 1.5x power.",
		shortDesc: "Flash Fire + Download + Sheer Force; Extreme Speed 1.5x.",
	},
	dragonize: {
		name: "Dragonize",
		desc: "This Pokemon's Normal-type moves become Dragon-type moves and have their power multiplied by 1.2. This Pokemon gains STAB on Dragon-type moves.",
		shortDesc: "Normal moves become Dragon type; Dragon STAB; converted moves 1.2x.",
	},
	draconicforce: {
		name: "Draconic Force",
		desc: "This Pokemon has Dragonize, Strong Jaw, and Mold Breaker's effects.",
		shortDesc: "Dragonize + Strong Jaw + Mold Breaker.",
	},
	dragonsmaw: {
		name: "Dragon's Maw",
		desc: "This Pokemon's offensive stat is multiplied by 1.5 while using a Dragon-type attack.",
		shortDesc: "This Pokemon's Dragon-type attacks have 1.5x power.",
	},
	drizzle: {
		name: "Drizzle",
		shortDesc: "On switch-in, this Pokemon summons Rain Dance.",
	},
	drought: {
		name: "Drought",
		shortDesc: "On switch-in, this Pokemon summons Sunny Day.",
	},
		sunsovereign: {
		name: "Sun Sovereign",
		desc: "This Pokemon has Drought, Wildfire Core, and Self Sufficient's effects. Its sun lasts 8 turns.",
		shortDesc: "Drought + Wildfire Core + Self Sufficient; 8-turn Sun.",
	},
	eternalflower: {
		name: "Eternal Flower",
		desc: "This Pokemon's Grass-type moves use 1.5x Attack and Special Attack. Opposing Mega, G-Max, Terastallized, Stellar, and Ultra Beast Pokemon have Attack, Defense, Special Attack, Special Defense, and Speed reduced to 0.7x while this Pokemon is active. This debuff does not affect allies. When this Pokemon faints, it creates Bewitched Woods for 5 turns.",
		shortDesc: "Grass attacks use 1.5x offenses; opposing gimmick Pokemon have stats reduced to 0.7x.",
	},
	ange: {
		name: "Ange",
		desc: "This Pokemon has Eternal Flower, Fairy Aura, and Magic Guard's effects. Its Grass-type moves use 1.5x Attack and Special Attack, Fairy-type moves are boosted, and opposing Mega, G-Max, Terastallized, Stellar, and Ultra Beast Pokemon have their stats reduced to 0.7x. When this Pokemon faints, it creates Bewitched Woods for 5 turns.",
		shortDesc: "Eternal Flower + Fairy Aura + Magic Guard; weakens opposing gimmicks.",
	},
	fluffyevo: {
		name: "Fluffy Evo",
		desc: "Moves that do not match this Pokemon's type gain STAB. Its damaging moves ignore type immunities while respecting resistances, and it has Overcoat's effects.",
		shortDesc: "Off-type moves gain STAB; hits type immunities; Overcoat.",
	},
	mindfreeze: {
		name: "Mind Freeze",
		desc: "This Pokemon cannot have this Ability suppressed. It is immune to Ice-type attacks and restores 1/4 of its maximum HP when hit by one. It has Ice Body's healing and hail immunity. Its damaging Psychic-type moves have a 40% chance to cause frostbite, and Freezing Glare's frostbite chance is doubled. Its Physical Ice-type moves become Special.",
		shortDesc: "Cannot be suppressed; Ice immunity heals 1/4; Ice Body; Psychic may frostbite.",
	},
	riotamp: {
		name: "Riot Amp",
		desc: "This Pokemon has Punk Rock, Galvanize, Resonance Force, Technician, and Volt Absorb's effects.",
		shortDesc: "Punk Rock + Galvanize + Resonance Force + Technician + Volt Absorb.",
	},
	relicarmor: {
		name: "Relic Armor",
		desc: "In Desert, Fairy Tale, Cave, Crystal Cavern, New World, or Volcanic Field, this Pokemon's Defense and Special Defense rise by 1. Its Rock typing does not add weaknesses to Fighting, Ground, Steel, Water, or Grass. It cannot be critically hit, takes 0.8x damage from attacks, and has Self Sufficient's effects. After an opposing Pokemon lowers one of its stats, its Defense and Special Defense rise by 1.",
		shortDesc: "Rock weaknesses removed; field +1 Def/SpD; no crits; 0.8x damage; Self Sufficient.",
	},
	relicmishap: {
		name: "Relic Mishap",
		desc: "This Pokemon takes 0.9x damage from attacks and has Self Sufficient, Water Absorb, and Volt Absorb. It restores 1/16 max HP each turn and is immune to Sandstorm and Hail damage. During Sandstorm, its Special Defense is multiplied by 1.5. During Hail or Snow, its Defense is multiplied by 1.5.",
		shortDesc: "0.9x damage; Self Sufficient; Water/Volt Absorb; Sand +SpD; Hail/Snow +Def.",
	},
	windysurge: {
		name: "Windy Surge",
		desc: "On switch-in, this Pokemon sets Tailwind on its side for 2 turns.",
		shortDesc: "On switch-in, sets 2-turn Tailwind on this Pokemon's side.",
	},
	burningspirit: {
		name: "Burning Spirit",
		desc: "This Pokemon has Self Sufficient, Opportunist, and Magma Armor's effects.",
		shortDesc: "Self Sufficient + Opportunist + Magma Armor.",
	},
	emperorsresolve: {
		name: "Emperor's Resolve",
		desc: "This Pokemon has Competitive and Slush Rush, and gains STAB on Ice-type moves.",
		shortDesc: "Competitive + Slush Rush + Ice STAB.",
	},
	terraresolve: {
		name: "Terra Resolve",
		desc: "This Pokemon has Stamina, Rocky Payload, and Self Sufficient's effects.",
		shortDesc: "Stamina + Rocky Payload + Self Sufficient.",
	},
	eclipsevision: {
		name: "Eclipse Vision",
		desc: "This Pokemon's Special Attack is multiplied by 1.5. Its first move slot sets its opening type if Psychic or Dark, and each later Psychic- or Dark-type move changes it to that type. If this Pokemon is Psychic type, it restores 1/8 of its max HP at the end of each turn. If this Pokemon is Dark type, its damaging moves restore HP equal to 1/4 of the damage dealt.",
		shortDesc: "SpA 1.5x; first move slot sets Psychic/Dark type; later moves switch it; Psychic heals; Dark drains.",
	},
	venomarmor: {
		name: "Venom Armor",
		desc: "On switch-in, this Pokemon becomes poisoned if it has no status, even if it is Steel-type. This Pokemon has Poison Heal and Dual Wield's effects. While poisoned, its physical damage is multiplied by 1.3. Metal Claw has 1.5x power.",
		shortDesc: "Self-poisons on switch-in; Poison Heal + Dual Wield; poisoned physical damage 1.3x; Metal Claw 1.5x.",
	},
	noseformation: {
		name: "Nose Formation",
		desc: "This Pokemon has Filter and Elevate. After it hits, three 20 BP special Mini-Noses each select the strongest of Steel, Electric, or Rock against their current target. They chain to another valid foe after a KO, and their KOs trigger Elevate.",
		shortDesc: "Filter + Elevate; three adaptive 20 BP Mini-Noses chain after KOs and trigger Elevate.",
	},
	mourningvessel: {
		name: "Mourning Vessel",
		desc: "This Pokemon has Prankster's and Magic Guard's effects. Its damaging moves deal 20% more damage for each fainted ally, up to 2x damage. At the end of each turn, it restores 5% of its max HP for each fainted opposing Pokemon, counting every opposing side in Free-For-All battles.",
		shortDesc: "Prankster + Magic Guard; fallen allies boost damage; foes fainted heal 5% each turn.",
	},
	mightyjaw: {
		name: "Mighty Jaw",
		desc: "This Pokemon has Strong Jaw and Intimidate's effects. Until it takes its first action after switching in, its moves have 2 higher priority.",
		shortDesc: "Strong Jaw + Intimidate; first action after switch-in has +2 priority.",
	},
	fallenstar: {
		name: "Fallen Star",
		desc: "This Ability cannot be suppressed. This Pokemon has Mold Breaker, Dual Wield, Skill Link, and Self Sufficient. Existing multi-hit Arrow moves use Skill Link normally. Arrow moves deal 1.5x damage to trapped targets. At half HP or less, Arrow moves gain +1 priority and this Pokemon takes half damage. After an Arrow move, it takes 0.25x damage for the turn. An Arrow KO repeats the move at half power. In Free-for-All, Arrow moves hit every foe twice at full power.",
		shortDesc: "Mold Breaker + Dual Wield + Self Sufficient; at half HP, Arrows gain +1 priority.",
	},
	eclipse: {
		name: "Eclipse",
		desc: "This Ability cannot be suppressed. During weather, this Pokemon's attacks deal 1.5x damage. In clear weather, attacks deal 0.5x damage to this Pokemon. Its Psychic-type moves become Dark type if Dark would do more damage, and its Dark-type moves become Psychic type if Psychic would do more damage. It restores 1/4 max HP instead of taking damage from Psychic- or Dark-type moves.",
		shortDesc: "Cannot be suppressed; weather attacks 1.5x; clear damage halved; Psychic/Dark choose type.",
	},
	ragingstorm: {
		name: "Raging Storm",
		desc: "This Ability cannot be suppressed. This Pokemon has Mold Breaker and Battle Armor. Its attacks remove the target's positive stat changes before damage and ignore Reflect, Light Screen, Aurora Veil, and defensive stat boosts. If this Pokemon gets a KO, it damages remaining foes for 60% of the last damage in multi battles, or raises Attack by 1 if there is no valid target or no damage is dealt. Magic Guard users do not take this damage.",
		shortDesc: "Cannot be suppressed; Mold Breaker + Battle Armor; attacks clear boosts/ignore screens; KO bonus.",
	},
	ragingoverlord: {
		name: "Raging Overlord",
		desc: "This Ability cannot be suppressed. This Pokemon has Raging Storm and Supreme Overlord's effects.",
		shortDesc: "Raging Storm + Supreme Overlord.",
	},
	voltagevolley: {
		name: "Voltage Volley",
		desc: "This Pokemon's multi-hit moves become special attacks and use its Special Attack.",
		shortDesc: "Multi-hit moves become special and use Sp. Atk.",
	},
	vanguard: {
		name: "Vanguard",
		desc: "This Pokemon has Intimidate built in. Extreme Speed has 1.5x power and a higher critical-hit ratio. It becomes Fire-type if Fire would deal more damage. After Extreme Speed, this Pokemon takes 0.25x damage from attacks for the rest of the turn. Its next Extreme Speed is guaranteed to crit after its one-time Endure activates. Opposing Pokemon cannot lower its stats, and non-move damage cannot affect it. Once per battle, it survives a direct-move KO at 1 HP.",
		shortDesc: "Intimidate; Extreme Speed 1.5x and higher crit rate; 0.25x post-ES damage; one-time 1 HP Endure.",
	},
	apexcleave: {
		name: "Apex Cleave",
		desc: "This Pokemon has Sharpness, Dual Wield, and Moxie's effects. Slicing moves use a second Dual Wield hit at 20% of their unboosted power.",
		shortDesc: "Sharpness + Dual Wield + Moxie.",
	},
	aurainstinct: {
		name: "Aura Instinct",
		desc: "This Pokemon has Adaptability, Dual Wield, and Second Wind's effects.",
		shortDesc: "Adaptability + Dual Wield + Second Wind.",
	},
	abysssniper: {
		name: "Abyss Sniper",
		desc: "This Pokemon has Sniper and Stalwart's effects. Its critical hits deal increased damage, and its moves cannot be redirected.",
		shortDesc: "Sniper + Stalwart.",
	},
	grandmaster: {
		name: "Grandmaster",
		desc: "This Pokemon cannot flinch. Miracle Eye makes it resist Dark moves. After a status move, it takes 20% less attack damage for the turn. Psychic moves ignore resistances when it moves first. Being attacked, using Future Sight, or fainting queues Future Sight on foes.",
		shortDesc: "No flinch; status grants 20% damage reduction; queues Future Sight.",
	},
	warpath: {
		name: "War Path",
		desc: "This Pokemon has Overcoat's immunity to powder, Hail, and Sandstorm. Its Attack is 1.5x while statused. Its Rock-, Fighting-, and Ground-type moves ignore Reflect, Light Screen, Aurora Veil, and defensive boosts. It cannot flinch and ignores stat increases.",
		shortDesc: "Overcoat; status Atk 1.5x; Rock/Fighting/Ground ignore screens/boosts; no flinch.",
	},
	atrocity: {
		name: "Atrocity",
		desc: "This Ability cannot be suppressed and has Wildfire Core and Self Sufficient's effects. This Pokemon's damaging moves have 1.3x power, +1 critical hit ratio, ignore Abilities and defensive stat boosts, and bypass Substitute, Reflect, Light Screen, and Aurora Veil. Its Defense and Special Defense are 1.3x. Each damaging hit restores 1/4 of the damage dealt, with no per-hit cap. In Cold Eclipse, its damaging moves gain another 1.3x boost, and its Defense and Special Defense become 1.5x.",
		shortDesc: "Wildfire Core + Self Sufficient; damaging hits heal 1/4 damage.",
	},
	wickedsnare: {
		name: "Wicked Snare",
		desc: "This Pokemon has Stakeout, Tangling Hair, and Prankster's effects.",
		shortDesc: "Stakeout + Tangling Hair + Prankster.",
	},
	crumblingshell: {
		name: "Crumbling Shell",
		desc: "When this Pokemon is hit by a Physical attack, Stealth Rock is set on the attacker's side unless a water field is active or that side already has Stealth Rock.",
		shortDesc: "Physical hits set Stealth Rock, except in water fields.",
	},
	witheringshell: {
		name: "Withering Shell",
		desc: "This Pokemon has Crumbling Shell, Self Repair, and Weak Armor's effects. Physical hits set Stealth Rock on the attacker's side except in water fields, lower this Pokemon's Defense by 1, and raise its Speed by 2. It restores 1/16 max HP each turn, is immune to Hail and Sandstorm damage, and cures status while restoring 1/3 max HP when switching out.",
		shortDesc: "Crumbling Shell + Self Repair + Weak Armor.",
	},
	iceabsorb: {
		name: "Ice Absorb",
		desc: "This Pokemon is immune to Ice-type moves and restores 1/4 of its maximum HP when hit by an Ice-type move.",
		shortDesc: "This Pokemon is immune to Ice and heals 1/4 when hit by Ice.",
	},
	wastingsurge: {
		name: "Wasting Surge",
		desc: "On switch-in, this Pokemon sets Wasteland Terrain. On Water Surface or Underwater, it creates Murkwater Surface instead; from Underwater, non-Poison and non-Steel Pokemon that are not semi-invulnerable faint. If Neutralization is active on Water Surface or Underwater, this effect fails. This Pokemon also has Byxbysion Touch's effects.",
		shortDesc: "Sets Wasteland/Murkwater; Underwater KOs non-Poison/Steel; Byxbysion Touch.",
	},
	bewitchingmajesty: {
		name: "Bewitching Majesty",
		desc: "On switch-in, this Pokemon creates Bewitched Woods for 5 turns. This Pokemon has Magic Bounce and Queenly Majesty's effects.",
		shortDesc: "Sets Bewitched Woods for 5 turns. Magic Bounce + Queenly Majesty.",
	},
	corrosivescale: {
		name: "Corrosive Scale",
		desc: "This Pokemon has Marvel Scale, Invigorate, and Friend Guard's effects. When this Pokemon poisons a target, that target becomes confused.",
		shortDesc: "Marvel Scale + Invigorate + Friend Guard; poison causes confusion.",
	},
	toxicevolution: {
		name: "Toxic Evolution",
		desc: "This Pokemon has Corrosion, Dual Wield, and Shield Dust. When it poisons an opposing Pokemon, that Pokemon also becomes confused. Opposing Pokemon that hit it with a damaging move have a 50% chance to become poisoned.",
		shortDesc: "Corrosion + Dual Wield + Shield Dust; its poison confuses; attackers may be poisoned.",
	},
	soulstrike: {
		name: "Soul Strike",
		desc: "This Pokemon's moves ignore accuracy checks. It is immune to Ghost-type moves and restores 1/4 max HP when hit by one. Soul Fire cannot redirect or bypass this immunity. When this Pokemon faints, it creates Haunted Field for 5 turns, ignoring Neutralization. This Ability cannot be ignored or suppressed by Mold Breaker-style effects.",
		shortDesc: "Moves never miss; Ghost absorb; faint sets Haunted Field.",
	},
	alloycore: {
		name: "Alloy Core",
		desc: "This Pokemon has Magic Guard, Self Sufficient, and Stalwart's effects.",
		shortDesc: "Magic Guard + Self Sufficient + Stalwart.",
	},
	hellfireeclipse: {
		name: "Hellfire Eclipse",
		desc: "This Pokemon has Flash Fire and Dark Aura's effects. During harsh sunlight, its Attack and Special Attack are multiplied by 1.5. After it uses a Fire-type move, it sets Sunny Day for 2 turns.",
		shortDesc: "Flash Fire + Dark Aura; Sun: Atk/SpA 1.5x; Fire moves set 2-turn Sun.",
	},
	sacrededge: {
		name: "Sacred Edge",
		desc: "This Pokemon has Sharpness, Dual Wield, and Sworn Duty's effects. Its slicing moves have 1.5x power. When Dual Wield applies to one of those slicing moves, the first hit keeps the 1.5x Sharpness boost and the second hit has 20% of the move's unboosted power. On switch-in or Mega Evolution, it heals its ally by 1/4 max HP, or 1/3 on Fairy Tale Field.",
		shortDesc: "Sharpness + Dual Wield + Sworn Duty.",
	},
	omenedge: {
		name: "Omen Edge",
		desc: "This Pokemon has Sharpness, Dual Wield, and Tough Claws. When it faints, it casts a physical Doom Desire on each opposing Pokemon.",
		shortDesc: "Sharpness + Dual Wield + Tough Claws; on faint: Doom Desire on foes.",
	},
	dreadmaw: {
		name: "Dread Maw",
		desc: "This Pokemon has Huge Power and Strong Jaw's effects.",
		shortDesc: "Huge Power + Strong Jaw.",
	},
	cursedkeepsake: {
		name: "Cursed Keepsake",
		desc: "When this Pokemon is hit by an opposing damaging move, the attacker becomes cursed. Cursed Pokemon deal 0.5x damage to this Pokemon. This Pokemon restores HP equal to 1/2 of Curse damage it caused. When this Pokemon faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization.",
		shortDesc: "Curses attackers; cursed foes deal 0.5x; heals 1/2 Curse damage.",
	},
	curseddoll: {
		name: "Cursed Doll",
		desc: "This Pokemon has Tough Claws and Shadow Shield's effects. Its damaging moves curse the foes they hurt. When it faints, it creates Haunted Field for 5 turns.",
		shortDesc: "Tough Claws + Shadow Shield; damaging moves curse; faint sets Haunted.",
	},
	cursedmarionette: {
		name: "Cursed Marionette",
		desc: "This Pokemon's status moves have +1 priority. Its attacks and status moves curse opposing targets, and being hit curses the attacker. Cursed foes deal 0.8x damage to this Pokemon. This Pokemon restores HP equal to 1/2 of Curse damage it caused. Its Curse deals 1/8 max HP. When it faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization.",
		shortDesc: "Prankster; attacks/status curse; cursed foes deal 0.8x; heals 1/2 Curse damage.",
	},
	cursedarmament: {
		name: "Cursed Armament",
		desc: "This Pokemon has Filter's effects. Curse used by this Pokemon becomes a 100 BP physical or special Ghost-type attack using its higher Attack or Special Attack, with 100% accuracy, that hits all adjacent foes and curses each target. Curse from this Pokemon deals 1/8 max HP each turn. This Pokemon restores 1/4 of the damage dealt by its attacks and by Curse damage it caused. When this Pokemon reaches half HP or faints, it creates Haunted Field for 5 turns.",
		shortDesc: "Filter; Curse becomes a 100 BP spread Ghost attack using the higher Attack or Sp. Atk; curses foes; heals 1/4 damage; half HP/faint sets Haunted Field.",
	},
	sandsovereign: {
		name: "Sand Sovereign",
		desc: "On entry, this Pokemon sets Sandstorm for 8 turns. It has Dauntless Shield and Solid Rock. Arenite Wall lasts 5 turns, or 8 turns when extended. Each turn, foes take immunity-aware Rock damage equal to 1/16 max HP, scaled by effectiveness.",
		shortDesc: "8-turn Sand; Dauntless Shield + Solid Rock; Arenite Wall 5/8 turns; Rock chip.",
	},
	tyrantstream: {
		name: "Tyrant Stream",
		desc: "This Pokemon has Brute Force, Sand Stream, and Strong Jaw's effects.",
		shortDesc: "Brute Force + Sand Stream + Strong Jaw.",
	},
	frostsovereign: {
		name: "Frost Sovereign",
		desc: "On entry, this Pokemon sets Snow through Snow Warning for 8 turns. It has Ice Body and Filter. Manually used Aurora Veil lasts 8 turns. Each turn, foes take immunity-aware Ice damage equal to 1/16 max HP, scaled by effectiveness.",
		shortDesc: "8-turn Snow Warning; Ice Body + Filter; manual Veil lasts 8 turns; Ice chip.",
	},
	freezerburn: {
		name: "Freezer Burn",
		desc: "This Pokemon has Slush Rush and Refrigerate. Refrigerate-converted moves have 1.2x power.",
		shortDesc: "Slush Rush + Refrigerate; converted moves have 1.2x power.",
	},
	stormfright: {
		name: "Storm Fright",
		desc: "On switch-in, opposing Pokemon have their Attack lowered by 1 stage. This Pokemon is immune to Electric-type moves and raises its Special Attack by 1 stage when hit by one. This Pokemon has Teravolt and Strong Jaw's effects.",
		shortDesc: "Intimidate + Lightning Rod + Teravolt + Strong Jaw.",
	},
	enlightenment: {
		name: "Enlightenment",
		desc: "This Pokemon has Pure Power, Inner Focus, and Technician's effects.",
		shortDesc: "Pure Power + Inner Focus + Technician.",
	},
	relentlesslink: {
		name: "Relentless Link",
		desc: "This Pokemon has Skill Link, Battle Armor, Mold Breaker's, and Guts's effects.",
		shortDesc: "Skill Link + Battle Armor + Mold Breaker + Guts.",
	},
	mirrorgreed: {
		name: "Mirror Greed",
		desc: "This Pokemon has Magic Bounce, Analytic, and Filter's effects.",
		shortDesc: "Magic Bounce + Analytic + Filter.",
	},
	uncheckedassault: {
		name: "Unchecked Assault",
		desc: "This Pokemon has Scrappy, Technician, Opportunist, and Limber's effects.",
		shortDesc: "Scrappy + Technician + Opportunist + Limber.",
	},
	royalvoice: {
		name: "Royal Voice",
		desc: "This Pokemon has Pixilate, Queenly Majesty, and Sworn Duty's effects.",
		shortDesc: "Pixilate + Queenly Majesty + Sworn Duty.",
	},
	perfectforesight: {
		name: "Perfect Foresight",
		desc: "On switch-in, this Pokemon identifies and gains the Ability of the opposing Pokemon with the highest offensive stat. Future Sight queued by this Ability has 60 BP, ignores defensive boosts, screens, and Abilities, and hits Dark-type Pokemon neutrally. If this Pokemon uses a move on opposing Pokemon, is damaged by an opposing attack, or uses Future Sight, Future Sight is queued on the affected opposing slots. Spread moves queue Future Sight on all enemies, and existing Perfect Foresight delayed attacks stack instead of blocking new ones.",
		shortDesc: "Gains strongest foe's Ability; repeatedly queues 60 BP Future Sight.",
	},
	doomwarning: {
		name: "Doom Warning",
		desc: "This Pokemon has Magic Bounce and Magic Guard. When it faints, Doom Desire is cast on every opposing Pokemon.",
		shortDesc: "Magic Bounce + Magic Guard; faint casts Doom Desire.",
	},
	perfectego: {
		name: "Perfect Ego",
		desc: "This Pokemon has Ultra Ego's effects, and its moves cannot miss.",
		shortDesc: "Ultra Ego; moves cannot miss.",
	},
	heavenlychorus: {
		name: "Heavenly Chorus",
		desc: "This Pokemon has Pixilate, Cloud Nine, and Fluffy's effects.",
		shortDesc: "Pixilate + Cloud Nine + Fluffy.",
	},
	mourningsnow: {
		name: "Mourning Snow",
		desc: "On switch-in, this Pokemon summons Hail for 8 turns, and Aurora Veil used by this Pokemon lasts 8 turns. During Hail, this Pokemon has Ice Body's effect and opposing non-Ice Pokemon have a 30% chance to become frostbitten at the end of the turn. When another Pokemon faints, this Pokemon restores 1/8 max HP, or 1/4 if the faint was caused by an Ice move, Hail, Snow, or Curse. When this Pokemon faints, all opposing Pokemon become cursed. This Pokemon has a 100% Cursed Body effect.",
		shortDesc: "Sets 8-turn Hail/Veil; heals when others faint; frostbite; Cursed Body.",
	},
	venombastion: {
		name: "Venom Bastion",
		desc: "This Pokemon has Stamina's effect: when hit by an opposing attack, its Defense rises by 1 stage once per turn and it restores 1/16 max HP. Its Bug-type moves have 1.5x power.",
		shortDesc: "Stamina + Bug moves 1.5x; hit: +1 Def once/turn and heals 1/16.",
	},
	rimeknuckle: {
		name: "Rime Knuckle",
		desc: "This Pokemon has Filter and Iron Fist. Its moves have a 40% chance to cause frostbite. If this Pokemon knocks out a target, it restores 1/8 of its maximum HP, or 1/4 if the target was Mega, G-Max, Terastallized, Stellar, or holding a Z-Move item.",
		shortDesc: "Filter + Iron Fist; 40% frostbite; KO heals 1/8 or 1/4 vs gimmicks.",
	},
	razorcurrent: {
		name: "Razor Current",
		desc: "This Pokemon has Drizzle, Speed Boost, Steelworker, and Strong Jaw's effects.",
		shortDesc: "Drizzle + Speed Boost + Steelworker + Strong Jaw.",
	},
	rainsovereign: {
		name: "Rain Sovereign",
		desc: "On entry, this Pokemon sets Rain for 8 turns. Its Electric-, Water-, and Flying-type moves receive STAB. Each turn, foes take immunity-aware Water damage equal to 1/16 max HP, scaled by effectiveness.",
		shortDesc: "8-turn Rain; Electric/Water/Flying STAB; immunity-aware Water chip.",
	},
	toxicrenewal: {
		name: "Toxic Renewal",
		desc: "This Pokemon has Adaptability and Regenerator's effects.",
		shortDesc: "Adaptability + Regenerator.",
	},
	stormcircuit: {
		name: "Storm Circuit",
		desc: "This Pokemon creates Electric Terrain on entry and has Swift Swim and Elevate's effects. After it knocks out a foe, its highest stat rises by the number of targets fainted.",
		shortDesc: "Electric Surge + Swift Swim + Elevate.",
	},
	ironmountain: {
		name: "Iron Mountain",
		desc: "This Pokemon has Filter, Stamina, and Heavy Metal's effects. Super-effective attacks deal 0.75x damage to it. Once per turn when hit by an opposing damaging move, its Defense rises by 1 stage and it restores 1/16 max HP. Its weight is doubled.",
		shortDesc: "Filter + Stamina + Heavy Metal.",
	},
	woolyconductor: {
		name: "Wooly Conductor",
		desc: "This Pokemon has Fluffy, Mold Breaker, and Static's effects. It takes half damage from contact moves, but takes double damage from Fire moves. Its moves ignore opposing Abilities, and contact moves used against it may paralyze the attacker.",
		shortDesc: "Fluffy + Mold Breaker + Static.",
	},
	surgeconduit: {
		name: "Surge Conduit",
		desc: "This Pokemon has Electric Surge, Lightning Rod, and Brute Force's effects.",
		shortDesc: "Electric Surge + Lightning Rod + Brute Force.",
	},
	solartrap: {
		name: "Solar Trap",
		desc: "This Pokemon has Accumulation, Innards Out, and Solar Power. In Sun, Solar Power boosts Special Attack by 1.5x and costs 1/8 max HP each turn.",
		shortDesc: "Accumulation + Innards Out + Solar Power.",
	},
	soaringspirit: {
		name: "Soaring Spirit",
		desc: "This Pokemon has Wind Power and Self Sufficient's effects.",
		shortDesc: "Wind Power + Self Sufficient.",
	},
	vendetta: {
		name: "Vendetta",
		desc: "This Pokemon has Anger Point, Second Wind, and Self Sufficient's effects.",
		shortDesc: "Anger Point + Second Wind + Self Sufficient.",
	},
	orchardbond: {
		name: "Orchard Bond",
		desc: "This Pokemon has Hydra Bond and Harvest's effects.",
		shortDesc: "Hydra Bond + Harvest.",
	},
	streettyrant: {
		name: "Street Tyrant",
		desc: "This Pokemon has Intimidate, Regenerator, and Mold Breaker's effects.",
		shortDesc: "Intimidate + Regenerator + Mold Breaker.",
	},
	divineintervention: {
		name: "Divine Intervention",
		desc: "This Pokemon has Sworn Duty, Friend Guard, and Regenerator's effects.",
		shortDesc: "Sworn Duty + Friend Guard + Regenerator.",
	},
	auroraresonance: {
		name: "Aurora Resonance",
		desc: "This Pokemon has Liquid Voice, Water Absorb, and Hydration's effects.",
		shortDesc: "Liquid Voice + Water Absorb + Hydration.",
	},
	auroracurrent: {
		name: "Aurora Current",
		desc: "This Pokemon has Snow Warning built in. On switch-in, it summons Snow. It gains STAB on Electric-type moves. During Snow, its Electric-type moves cannot miss and its Defense and Special Defense are boosted by 1.5x.",
		shortDesc: "Snow Warning; Electric STAB; in Snow, Electric never misses and Def/SpD 1.5x.",
	},
	mountainhunger: {
		name: "Mountain Hunger",
		desc: "This Pokemon has Thick Fat, Gluttony, and Sap Sipper's effects. It is immune to hail damage and takes reduced damage from Fire- and Ice-type attacks.",
		shortDesc: "Thick Fat + Gluttony + Sap Sipper.",
	},
	irondominion: {
		name: "Iron Dominion",
		desc: "On switch-in or G-Max activation, this Pokemon activates Pressure and Mirror Armor's effects and heals its ally like Sworn Duty.",
		shortDesc: "Pressure + Mirror Armor + Sworn Duty.",
	},
	astralwatcher: {
		name: "Astral Watcher",
		desc: "This Pokemon has Prankster, Telepathy, and Defragment. On entry, it reveals foes' items and may apply Embargo.",
		shortDesc: "Prankster + Telepathy + Defragment; reveals foes' items.",
	},
	treasuretitan: {
		name: "Treasure Titan",
		desc: "This Pokemon has Filter, Earth Eater, and Heavy Metal's effects. Copperajah-Gmax's weight-based moves always use their maximum power.",
		shortDesc: "Filter + Earth Eater + Heavy Metal; weight moves use max power.",
	},
	ragingfists: {
		name: "Raging Fists",
		desc: "This Pokemon has Hydra Bond, Fighting Fiend, and Scrappy's effects.",
		shortDesc: "Hydra Bond + Fighting Fiend + Scrappy.",
	},
	warship: {
		name: "War Ship",
		desc: "If Rain is active, this Pokemon's Speed is doubled. This Pokemon does not take recoil damage and ignores opposing stat boosts like Unaware.",
		shortDesc: "Swift Swim + Rock Head + Unaware.",
	},
	furnaceengine: {
		name: "Furnace Engine",
		desc: "This Pokemon has Steam Engine, Flame Body, and Self Sufficient's effects. At the end of each turn, opposing Pokemon take Fire-type damage equal to 1/16 max HP, scaled by effectiveness and blocked by Fire immunities.",
		shortDesc: "Steam Engine + Flame Body + Self Sufficient; Fire chip.",
	},
	duneterror: {
		name: "Dune Terror",
		desc: "This Pokemon has Sand Stream and Shed Skin's effects. During Sandstorm, grounded foes take Ground-type residual damage based on effectiveness, blocked by Ground immunities.",
		shortDesc: "Sand Stream + Shed Skin; Ground chip respects immunities.",
	},
	heatcoil: {
		name: "Heat Coil",
		desc: "This Pokemon has Speed Boost, Magma Armor, and Flame Body's effects.",
		shortDesc: "Speed Boost + Magma Armor + Flame Body.",
	},
	sweetsanctuary: {
		name: "Sweet Sanctuary",
		desc: "This Pokemon has Friend Guard, Sweet Veil, Aroma Veil, and Pastel Veil's effects.",
		shortDesc: "Friend Guard + Sweet Veil + Aroma Veil + Pastel Veil.",
	},
	riptideclaws: {
		name: "Riptide Claws",
		desc: "This Pokemon has Swift Swim, Tough Claws, and Shell Armor's effects.",
		shortDesc: "Swift Swim + Tough Claws + Shell Armor.",
	},
	dryskin: {
		name: "Dry Skin",
		desc: "This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move. The power of Fire-type moves is multiplied by 1.25 when used on this Pokemon. At the end of each turn, this Pokemon restores 1/8 of its maximum HP, rounded down, if the weather is Rain Dance, and loses 1/8 of its maximum HP, rounded down, if the weather is Sunny Day. The weather effects are prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "This Pokemon is healed 1/4 by Water, 1/8 by Rain; is hurt 1.25x by Fire, 1/8 by Sun.",
		gen7: {
			desc: "This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move. The power of Fire-type moves is multiplied by 1.25 when used on this Pokemon. At the end of each turn, this Pokemon restores 1/8 of its maximum HP, rounded down, if the weather is Rain Dance, and loses 1/8 of its maximum HP, rounded down, if the weather is Sunny Day.",
		},

		damage: "  ([POKEMON] was hurt by its Dry Skin.)",
	},
	earlybird: {
		name: "Early Bird",
		shortDesc: "This Pokemon's sleep counter drops by 2 instead of 1.",
	},
	eartheater: {
		name: "Earth Eater",
		desc: "This Pokemon is immune to Ground-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Ground-type move.",
		shortDesc: "This Pokemon heals 1/4 of its max HP when hit by Ground moves; Ground immunity.",
	},
	effectspore: {
		name: "Effect Spore",
		desc: "30% chance a Pokemon hitting this Pokemon with a damaging move will be poisoned, paralyzed, or fall asleep.",
		shortDesc: "30% chance of poison/paralysis/sleep on others hitting this Pokemon.",
		gen4: {
			desc: "30% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "10% chance a Pokemon making contact with this Pokemon will be poisoned, paralyzed, or fall asleep. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "10% chance of poison/paralysis/sleep on others making contact with this Pokemon.",
		},
	},
	electricsurge: {
		name: "Electric Surge",
		shortDesc: "On switch-in, this Pokemon summons Electric Terrain.",
	},
	electromorphosis: {
		name: "Electromorphosis",
		shortDesc: "This Pokemon gains the Charge effect when it takes a hit from an attack.",

		start: "  Being hit by [MOVE] charged [POKEMON] with power!",
	},
	embodyaspectcornerstone: {
		name: "Embody Aspect (Cornerstone)",
		shortDesc: "On switch-in, this Pokemon's Defense is raised by 1 stage.",

		boost: "  The Cornerstone Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Defense rose!",
	},
	embodyaspecthearthflame: {
		name: "Embody Aspect (Hearthflame)",
		shortDesc: "On switch-in, this Pokemon's Attack is raised by 1 stage.",

		boost: "  The Hearthflame Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Attack rose!",
	},
	embodyaspectteal: {
		name: "Embody Aspect (Teal)",
		shortDesc: "On switch-in, this Pokemon's Speed is raised by 1 stage.",

		boost: "  The Teal Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Speed rose!",
	},
	embodyaspectwellspring: {
		name: "Embody Aspect (Wellspring)",
		shortDesc: "On switch-in, this Pokemon's Special Defense is raised by 1 stage.",

		boost: "  The Wellspring Mask worn by [POKEMON] shone brilliantly, and [POKEMON]'s Sp. Def rose!",
	},
	emergencyexit: {
		name: "Emergency Exit",
		desc: "When this Pokemon has more than 1/2 its maximum HP and takes damage bringing it to 1/2 or less of its maximum HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
		shortDesc: "This Pokemon switches out when it reaches 1/2 or less of its maximum HP.",
	},
	fairyaura: {
		name: "Fairy Aura",
		desc: "While this Pokemon is active, the power of Fairy-type moves used by active Pokemon is multiplied by 1.33.",
		shortDesc: "While this Pokemon is active, a Fairy move used by any Pokemon has 1.33x power.",

		start: "  [POKEMON] is radiating a fairy aura!",
	},
	filter: {
		name: "Filter",
		shortDesc: "Takes 0.8x damage from attacks; super-effective hits are also 0.75x.",
	},
	byxbysiontouch: {
		name: "Byxbysion Touch",
		desc: "This Pokemon's Poison-type damaging moves restore 1/4 of the damage dealt. Ground-type moves deal 1/2 damage to this Pokemon. It has Poison Touch's effect.",
		shortDesc: "Poison attacks drain 1/4; Ground damage halved; Poison Touch.",
	},
	flamebody: {
		name: "Flame Body",
		shortDesc: "30% chance a Pokemon making contact with this Pokemon will be burned.",
		gen4: {
			desc: "30% chance a Pokemon making contact with this Pokemon will be burned. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "1/3 chance a Pokemon making contact with this Pokemon will be burned. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "1/3 chance a Pokemon making contact with this Pokemon will be burned.",
		},
	},
	flareboost: {
		name: "Flare Boost",
		desc: "This Pokemon's Fire-type attacks have 1.5x power. While this Pokemon is burned, the power of its special attacks is also multiplied by 1.5.",
		shortDesc: "Fire attacks have 1.5x power; burned special attacks also have 1.5x power.",
	},
	falsedevotion: {
		name: "False Devotion",
		desc: "This Pokemon has Serene Grace, Natural Cure, and Prankster's effects.",
		shortDesc: "Built-in Serene Grace, Natural Cure, and Prankster.",
	},
	blinddevotion: {
		name: "Blind Devotion",
		desc: "This Pokemon has False Devotion, Technician, and Cotton Down's effects.",
		shortDesc: "False Devotion + Technician + Cotton Down.",
	},
	firemane: {
		name: "Fire Mane",
		desc: "This Pokemon's Fire-type attacks have 1.5x power.",
		shortDesc: "This Pokemon's Fire-type attacks have 1.5x power.",
	},
	blazingmane: {
		name: "Blazing Mane",
		desc: "Fire attacks have 1.5x power and damaging moves hit twice, with the second hit at 30% power. At half HP or less, Fire attacks gain +1 priority. Burning and Volcanic Fields raise its Speed by 1 on entry or when the field starts.",
		shortDesc: "Fire 1.5x; second hit 30%; half-HP Fire +1 priority; fire fields +1 Spe.",
	},
	flashfire: {
		name: "Flash Fire",
		desc: "This Pokemon is immune to Fire-type moves. The first time it is hit by a Fire-type move, its offensive stat is multiplied by 1.5 while using a Fire-type attack as long as it remains active and has this Ability. If this Pokemon is frozen, it cannot be defrosted by Fire-type attacks.",
		shortDesc: "This Pokemon's Fire attacks do 1.5x damage if hit by one Fire move; Fire immunity.",
		gen4: {
			desc: "This Pokemon is immune to Fire-type moves, as long as it is not frozen. The first time it is hit by a Fire-type move, damage from its Fire-type attacks will be multiplied by 1.5 as long as it remains active and has this Ability.",
		},
		gen3: {
			desc: "This Pokemon is immune to Fire-type moves, as long as it is not frozen. The first time it is hit by a Fire-type move, damage from its Fire-type attacks will be multiplied by 1.5 as long as it remains active and has this Ability. If this Pokemon has a non-volatile status condition, is a Fire type, or has a substitute, Will-O-Wisp will not activate this Ability.",
		},

		start: "  The power of [POKEMON]'s Fire-type moves rose!",
	},
	flowergift: {
		name: "Flower Gift",
		desc: "If this Pokemon is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5. These effects are prevented if the Pokemon is holding a Utility Umbrella.",
		shortDesc: "If user is Cherrim and Sunny Day is active, it and allies' Attack and Sp. Def are 1.5x.",
		gen7: {
			desc: "If this Pokemon is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Attack and Special Defense of it and its allies are multiplied by 1.5.",
		},
		gen4: {
			desc: "If Sunny Day is active, the Attack and Special Defense of this Pokemon and its allies are multiplied by 1.5.",
			shortDesc: "If Sunny Day is active, Attack and Sp. Def of this Pokemon and its allies are 1.5x.",
		},
	},
	flowerveil: {
		name: "Flower Veil",
		desc: "Grass-type Pokemon on this Pokemon's side cannot have their stat stages lowered by other Pokemon or have a non-volatile status condition inflicted on them by other Pokemon.",
		shortDesc: "This side's Grass types can't have stats lowered or status inflicted by other Pokemon.",

		block: "  [POKEMON] surrounded itself with a veil of petals!",
	},
	fluffy: {
		name: "Fluffy",
		desc: "This Pokemon receives 1/2 damage from contact moves, but double damage from Fire moves.",
		shortDesc: "This Pokemon takes 1/2 damage from contact moves, 2x damage from Fire moves.",
	},
	forecast: {
		name: "Forecast",
		desc: "If this Pokemon is a Castform, its type changes to the current weather condition's type, including Sandstorm. Sunny Form has Solar Power and Flame Body effects. Rainy Form has Dry Skin, Rain Dish, and Hydration effects. Snowy Form has Slush Rush, Ice Body, and hail immunity. Sandy Form has Sand Rush, Earth Eater, and sand immunity. This effect is prevented if this Pokemon is holding a Utility Umbrella and the weather is Rain Dance or Sunny Day.",
		shortDesc: "Castform changes form in weather and gains form-based bonus effects.",
		gen7: {
			desc: "If this Pokemon is a Castform, its type changes to the current weather condition's type, except Sandstorm.",
		},
	},
	forewarn: {
		name: "Forewarn",
		desc: "On switch-in, this Pokemon reveals a strongest move known by an opposing Pokemon and removes foe Illusions. In Psychic Terrain, it gains 2 Sp. Atk and takes 0.8x damage from moves.",
		shortDesc: "Reveals strongest foe move; removes Illusions; Psychic Terrain +2 SpA; takes 0.8x damage.",
		gen4: {
			desc: "On switch-in, this Pokemon is alerted to the move with the highest power, at random, known by an opposing Pokemon. This effect considers OHKO moves to have 150 power, Counter, Mirror Coat, and Metal Burst to have 120 power, and every other attacking move with an unspecified power to have 80 power.",
		},

		activate: "  [TARGET]'s [MOVE] was revealed!",
		activateNoTarget: "  [POKEMON]'s Forewarn alerted it to [MOVE]!",
	},
	friendguard: {
		name: "Friend Guard",
		shortDesc: "This Pokemon's allies receive 3/4 damage from other Pokemon's attacks.",
	},
	verdanthospitality: {
		name: "Verdant Hospitality",
		desc: "This Pokemon has Friend Guard's effect. On switch-in, it restores 1/8 of its ally's max HP. At the end of each turn, this Pokemon restores 1/8 of its max HP and its ally restores 1/16 of its max HP.",
		shortDesc: "Friend Guard; heals ally on switch-in; heals self and ally each turn.",
	},
	frisk: {
		name: "Frisk",
		desc: "On switch-in, this Pokemon identifies the held items of all opposing Pokemon, removes foe Illusions, and each revealed foe has a 30% chance to be Embargoed.",
		shortDesc: "Reveals items; removes Illusions; foes have a 30% Embargo chance.",
		gen5: {
			shortDesc: "On switch-in, this Pokemon identifies the held item of a random opposing Pokemon.",
		},

		activate: "  [POKEMON] frisked [TARGET] and found its [ITEM]!",
		activateNoTarget: "  [POKEMON] frisked its target and found one [ITEM]!",
	},
	fullmetalbody: {
		name: "Full Metal Body",
		shortDesc: "Prevents other Pokemon from lowering this Pokemon's stat stages.",
	},
	furcoat: {
		name: "Fur Coat",
		shortDesc: "This Pokemon's Defense is doubled.",
	},
	layeredcoat: {
		name: "Layered Coat",
		desc: "This Pokemon has Fur Coat and Overcoat's effects.",
		shortDesc: "Fur Coat + Overcoat.",
	},
	galewings: {
		name: "Gale Wings",
		shortDesc: "If this Pokemon is at full HP, its Flying-type moves have their priority increased by 1.",
		gen6: {
			shortDesc: "This Pokemon's Flying-type moves have their priority increased by 1.",
		},
	},
	galvanize: {
		name: "Galvanize",
		desc: "This Pokemon's Normal-type moves become Electric-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc: "This Pokemon's Normal-type moves become Electric type and have 1.2x power.",
	},
	gluttony: {
		name: "Gluttony",
		desc: "When this Pokemon is holding a Berry that usually activates with 1/4 or less of its maximum HP, it is eaten at 1/2 or less of its maximum HP instead.",
		shortDesc: "This Pokemon eats Berries at 1/2 max HP or less instead of their usual 1/4 max HP.",
	},
	goodasgold: {
		name: "Good as Gold",
		shortDesc: "This Pokemon is immune to Status moves.",
	},
	gooey: {
		name: "Gooey",
		desc: "When this Pokemon is hit by an opposing damaging move, the attacker's Speed is lowered by 2 stages and its highest offensive stat is lowered by 1 stage. This Pokemon also has Hydration and Sap Sipper's effects.",
		shortDesc: "Any damaging hit: attacker -2 Spe/-1 offense; Hydration + Sap Sipper.",
	},
	fluffycraft: {
		name: "Fluffy Craft",
		desc: "This Pokemon has Fluffy and Technician's effects.",
		shortDesc: "Fluffy + Technician.",
	},
	gorillatactics: {
		name: "Gorilla Tactics",
		desc: "This Pokemon's Attack is multiplied by 1.5, but it can only select the first move it executes. These effects are prevented while this Pokemon is Dynamaxed.",
		shortDesc: "This Pokemon's Attack is 1.5x, but it can only select the first move it executes.",
	},
	primaltactics: {
		name: "Primal Tactics",
		desc: "This Pokemon's Special Attack is multiplied by 1.5, but it can only select the first move it executes. These effects are prevented while this Pokemon is Dynamaxed.",
		shortDesc: "This Pokemon's Sp. Atk is 1.5x, but it can only select the first move it executes.",
	},
	grasspelt: {
		name: "Grass Pelt",
		shortDesc: "If Grassy Terrain is active, this Pokemon's Defense is multiplied by 1.5.",
	},
	grassysurge: {
		name: "Grassy Surge",
		shortDesc: "On switch-in, this Pokemon summons Grassy Terrain.",
	},
	grimneigh: {
		name: "Grim Neigh",
		desc: "This Pokemon's Special Attack is raised by 1 stage if it attacks and knocks out another Pokemon.",
		shortDesc: "This Pokemon's Sp. Atk is raised by 1 stage if it attacks and KOes another Pokemon.",
	},
	guarddog: {
		name: "Guard Dog",
		desc: "This Pokemon is immune to the effect of the Intimidate Ability and raises its Attack by 1 stage instead. This Pokemon cannot be forced to switch out by another Pokemon's attack or item.",
		shortDesc: "Immune to Intimidate. Intimidated: +1 Attack. Cannot be forced to switch out.",
	},
	gulpmissile: {
		name: "Gulp Missile",
		desc: "If this Pokemon is a Cramorant, it changes forme when it hits a target with Surf or uses the first turn of Dive successfully. It becomes Gulping Form with an Arrokuda in its mouth if it has more than 1/2 of its maximum HP remaining, or Gorging Form with a Pikachu in its mouth if it has 1/2 or less of its maximum HP remaining. If Cramorant gets hit in Gulping or Gorging Form, it spits the Arrokuda or Pikachu at its attacker, even if it has no HP remaining. The projectile deals damage equal to 1/4 of the target's maximum HP, rounded down; this damage is blocked by the Magic Guard Ability but not by a substitute. An Arrokuda also lowers the target's Defense by 1 stage, and a Pikachu paralyzes the target. Cramorant will return to normal if it spits out a projectile, switches out, or Dynamaxes.",
		shortDesc: "When hit after Surf/Dive, attacker takes 1/4 max HP and -1 Defense or paralysis.",
	},
	guts: {
		name: "Guts",
		desc: "If this Pokemon has a non-volatile status condition, its Attack is multiplied by 1.5. This Pokemon's physical attacks ignore the burn effect of halving damage.",
		shortDesc: "If this Pokemon is statused, its Attack is 1.5x; ignores burn halving physical damage.",
	},
	hadronengine: {
		name: "Hadron Engine",
		shortDesc: "On switch-in, summons Electric Terrain. During Electric Terrain, Sp. Atk is 1.3333x.",

		start: "  [POKEMON] turned the ground into Electric Terrain, energizing its futuristic engine!",
		activate: "  [POKEMON] used the Electric Terrain to energize its futuristic engine!",
	},
	harvest: {
		name: "Harvest",
		desc: "At the end of each turn, this Pokemon can restore its last Berry or seed item if it has no item. The chance is 50%, or 100% in Sun or Grassy Terrain.",
		shortDesc: "Restores a used Berry/seed: 50% chance; 100% in Sun or Grassy Terrain.",

		addItem: "  [POKEMON] harvested one [ITEM]!",
	},
	healer: {
		name: "Healer",
		desc: "30% chance this Pokemon's ally has its non-volatile status condition cured at the end of each turn.",
		shortDesc: "30% chance this Pokemon's ally has its status cured at the end of each turn.",
		gen6: {
			desc: "30% chance each of this Pokemon's adjacent allies has its non-volatile status condition cured at the end of each turn.",
			shortDesc: "30% chance each adjacent ally has its status cured at the end of each turn.",
		},
	},
	heatproof: {
		name: "Heatproof",
		desc: "If a Pokemon uses a Fire-type attack against this Pokemon, that Pokemon's offensive stat is halved when calculating the damage to this Pokemon. This Pokemon takes half of the usual burn damage, rounded down.",
		shortDesc: "Fire damage against this Pokemon is dealt with 1/2 offensive stat; 1/2 burn damage.",
		gen8: {
			desc: "The power of Fire-type attacks against this Pokemon is halved. This Pokemon takes half of the usual burn damage, rounded down.",
			shortDesc: "The power of Fire-type attacks against this Pokemon is halved; burn damage halved.",
		},
	},
	heavymetal: {
		name: "Heavy Metal",
		desc: "This Pokemon's weight is doubled. In Factory, it gains 1 Defense and loses 1 Speed; physical attacks against it deal 0.5x damage.",
		shortDesc: "Weight doubled; Factory +1 Def/-1 Spe; takes 0.5x physical damage.",
	},
	reflector: {
		name: "Reflector",
		desc: "On entry, copies the active foe's types and adds them to this Pokemon's typing. Matching attacks deal half damage unless this Pokemon is immune. Reflect Type refreshes the copied types.",
		shortDesc: "Copies foe types; adds them to its typing; matching attacks deal 0.5x unless immune.",
	},
		hyperdrill: {
		name: "Hyper Drill",
		desc: "This Pokemon has Power Drill and Dual Wield's effects. Drill moves are used twice; the first hit receives Power Drill and the second hit deals 20% of the move's unboosted power. Its Rock-type moves receive a same-type attack bonus.",
		shortDesc: "Power Drill + Dual Wield; Rock moves get STAB.",
	},
	honeygather: {
		name: "Honey Gather",
		shortDesc: "No competitive use.",
	},
	hospitality: {
		name: "Hospitality",
		shortDesc: "On switch-in, this Pokemon restores 1/4 of its ally's maximum HP, rounded down.",

		heal: "  [POKEMON] drank down all the matcha that [SOURCE] made!",
	},
	hugepower: {
		name: "Huge Power",
		shortDesc: "This Pokemon's Attack is doubled.",
	},
	hungerswitch: {
		name: "Hunger Switch",
		desc: "If this Pokemon is a Morpeko, it changes formes between its Full Belly Mode and Hangry Mode at the end of each turn.",
		shortDesc: "If Morpeko, it changes between Full Belly and Hangry Mode at the end of each turn.",
	},
	hustle: {
		name: "Hustle",
		desc: "This Pokemon's Attack is multiplied by 1.5 and the accuracy of its physical attacks is multiplied by 0.8.",
		shortDesc: "This Pokemon's Attack is 1.5x and accuracy of its physical attacks is 0.8x.",
	},
	hydration: {
		name: "Hydration",
		desc: "This Pokemon has its non-volatile status condition cured at the end of each turn if Rain Dance is active. This effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "This Pokemon has its status cured at the end of each turn if Rain Dance is active.",
		gen7: {
			desc: "This Pokemon has its non-volatile status condition cured at the end of each turn if Rain Dance is active.",
		},
	},
	hypercutter: {
		name: "Hyper Cutter",
		shortDesc: "Prevents other Pokemon from lowering this Pokemon's Attack stat stage.",
	},
	icebody: {
		name: "Ice Body",
		desc: "If Snow is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from hail.",
		shortDesc: "Heals 1/16 in Snow and is immune to hail damage.",
		gen8: {
			desc: "If Hail is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from Hail.",
			shortDesc: "If Hail is active, this Pokemon heals 1/16 of its max HP each turn; immunity to Hail.",
		},
	},
	iceface: {
		name: "Ice Face",
		desc: "If this Pokemon is an Eiscue, the first physical hit it takes in battle deals 0 neutral damage. Its ice face is then broken and it changes forme to Noice Face. Eiscue regains its Ice Face forme when Snow begins or when Eiscue switches in while Snow is active. Confusion damage also breaks the ice face.",
		shortDesc: "If Eiscue, the first physical hit it takes deals 0 damage. Effect is restored in Snow.",
		gen8: {
			desc: "If this Pokemon is an Eiscue, the first physical hit it takes in battle deals 0 neutral damage. Its ice face is then broken and it changes forme to Noice Face. Eiscue regains its Ice Face forme when Hail begins or when Eiscue switches in while Hail is active. Confusion damage also breaks the ice face.",
			shortDesc: "If Eiscue, the first physical hit it takes deals 0 damage. This effect is restored in Hail.",
		},
	},
	icescales: {
		name: "Ice Scales",
		shortDesc: "This Pokemon receives 1/2 damage from special attacks.",
	},
	illuminate: {
		name: "Illuminate",
		desc: "Prevents other Pokemon from lowering this Pokemon's accuracy stat stage. This Pokemon ignores a target's evasiveness stat stage.",
		shortDesc: "This Pokemon's accuracy can't be lowered by others; ignores their evasiveness stat.",
		gen8: {
			desc: "No competitive use.",
			shortDesc: "No competitive use.",
		},
	},
	illusion: {
		name: "Illusion",
		desc: "On switch-in, this Pokemon disguises itself as the ally judged most threatening to the opposing active Pokemon using matchups, Speed, STAB, and damaging moves. It copies that ally's Ability and gains STAB from its types while keeping its own defensive typing. The disguise ends when it takes direct damage.",
		shortDesc: "Disguises as the ally with the best matchup; copies its Ability and STAB until directly damaged.",

		end: "  [POKEMON]'s illusion wore off!",
	},
	immunity: {
		name: "Immunity",
		shortDesc: "This Pokemon cannot be poisoned. Gaining this Ability while poisoned cures it.",
	},
	imposter: {
		name: "Imposter",
		desc: "On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it. If there is no Pokemon at that position, this Pokemon does not Transform.",
		shortDesc: "On switch-in, this Pokemon Transforms into the opposing Pokemon that is facing it.",
	},
	infiltrator: {
		name: "Infiltrator",
		desc: "This Pokemon's moves ignore substitutes and the opposing side's Reflect, Light Screen, Safeguard, Mist, and Aurora Veil.",
		shortDesc: "Moves ignore substitutes and foe's Reflect/Light Screen/Safeguard/Mist/Aurora Veil.",
		gen6: {
			desc: "This Pokemon's moves ignore substitutes and the opposing side's Reflect, Light Screen, Safeguard, and Mist.",
			shortDesc: "Moves ignore substitutes and the foe's Reflect, Light Screen, Safeguard, and Mist.",
		},
		gen5: {
			desc: "This Pokemon's moves ignore the opposing side's Reflect, Light Screen, Safeguard, and Mist.",
			shortDesc: "This Pokemon's moves ignore the foe's Reflect, Light Screen, Safeguard, and Mist.",
		},
	},
	innardsout: {
		name: "Innards Out",
		desc: "If this Pokemon is knocked out with a move, that move's user loses HP equal to the amount of damage inflicted on this Pokemon.",
		shortDesc: "If this Pokemon is KOed with a move, that move's user loses an equal amount of HP.",

		damage: "#aftermath",
	},
	innerfocus: {
		name: "Inner Focus",
		desc: "This Pokemon cannot be made to flinch. This Pokemon is immune to the effect of the Intimidate Ability.",
		shortDesc: "This Pokemon cannot be made to flinch. Immune to Intimidate.",
		gen7: {
			desc: "This Pokemon cannot be made to flinch.",
			shortDesc: "This Pokemon cannot be made to flinch.",
		},
	},
	insomnia: {
		name: "Insomnia",
		desc: "This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it. Its Dark- and Ghost-type damaging moves have 1.3x power.",
		shortDesc: "Cannot sleep; Dark/Ghost damaging moves have 1.3x power.",
	},
	intimidate: {
		name: "Intimidate",
		desc: "On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon with the Inner Focus, Oblivious, Own Tempo, or Scrappy Abilities and Pokemon behind a substitute are immune.",
		shortDesc: "On switch-in, this Pokemon lowers the Attack of opponents by 1 stage.",
		gen7: {
			desc: "On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.",
		},
		gen6: {
			desc: "On switch-in, this Pokemon lowers the Attack of adjacent opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.",
			shortDesc: "On switch-in, this Pokemon lowers the Attack of adjacent opponents by 1 stage.",
		},
		gen4: {
			desc: "On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune. If U-turn breaks an opposing substitute and this Pokemon switches in as the replacement, the Pokemon that had the substitute is still immune to this Ability.",
			shortDesc: "On switch-in, this Pokemon lowers the Attack of opponents by 1 stage.",
		},
		gen3: {
			desc: "On switch-in, this Pokemon lowers the Attack of opposing Pokemon by 1 stage. Pokemon behind a substitute are immune.",
		},
	},
	intrepidsword: {
		name: "Intrepid Sword",
		shortDesc: "On switch-in, this Pokemon's Attack is raised by 1 stage. Once per battle.",
		gen8: {
			shortDesc: "On switch-in, this Pokemon's Attack is raised by 1 stage.",
		},
	},
	ironbarbs: {
		name: "Iron Barbs",
		desc: "Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.",
		shortDesc: "Pokemon making contact with this Pokemon lose 1/8 of their max HP.",

		damage: "#roughskin",
	},
	ironfist: {
		name: "Iron Fist",
		desc: "This Pokemon's punch-based attacks have their power multiplied by 1.4.",
		shortDesc: "This Pokemon's punch-based attacks have 1.4x power.",
	},
	justified: {
		name: "Justified",
		shortDesc: "This Pokemon's Attack is raised by 1 stage after it is damaged by a Dark-type move.",
	},
	knightsguard: {
		name: "Knight's Guard",
		desc: "This Pokemon has Sworn Duty, Justified, and Steadfast's effects.",
		shortDesc: "Sworn Duty + Justified + Steadfast.",
	},
	keeneye: {
		name: "Keen Eye",
		desc: "Prevents other Pokemon from lowering this Pokemon's accuracy stat stage. This Pokemon ignores a target's evasiveness stat stage.",
		shortDesc: "This Pokemon's accuracy can't be lowered by others; ignores their evasiveness stat.",
		gen5: {
			desc: "Prevents other Pokemon from lowering this Pokemon's accuracy stat stage.",
			shortDesc: "Prevents other Pokemon from lowering this Pokemon's accuracy stat stage.",
		},
	},
	klutz: {
		name: "Klutz",
		desc: "This Pokemon's held item has no effect. This Pokemon cannot use Fling successfully. Macho Brace, Power Anklet, Power Band, Power Belt, Power Bracer, Power Lens, and Power Weight still have their effects.",
		shortDesc: "This Pokemon's held item has no effect, except Macho Brace. Fling cannot be used.",
	},
	leafguard: {
		name: "Leaf Guard",
		desc: "If Sunny Day is active, this Pokemon cannot become affected by a non-volatile status condition or Yawn, and Rest will fail for it. This effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "If Sunny Day is active, this Pokemon cannot be statused and Rest will fail for it.",
		gen7: {
			desc: "If Sunny Day is active, this Pokemon cannot become affected by a non-volatile status condition or Yawn, and Rest will fail for it.",
		},
		gen4: {
			desc: "If Sunny Day is active, this Pokemon cannot become affected by a non-volatile status condition or Yawn, but can use Rest normally.",
			shortDesc: "If Sunny Day is active, this Pokemon cannot be statused, but Rest works normally.",
		},
	},
	levitate: {
		name: "Levitate",
		desc: "This Pokemon is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, Sticky Web, and the Arena Trap Ability. The effects of Gravity, Ingrain, Smack Down, Thousand Arrows, and Iron Ball nullify the immunity. Thousand Arrows can hit this Pokemon as if it did not have this Ability.",
		shortDesc: "This Pokemon is immune to Ground; Gravity/Ingrain/Smack Down/Iron Ball nullify it.",
		gen5: {
			desc: "This Pokemon is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability. The effects of Gravity, Ingrain, Smack Down, and Iron Ball nullify the immunity.",
		},
		gen4: {
			desc: "This Pokemon is immune to Ground-type attacks and the effects of Spikes, Toxic Spikes, and the Arena Trap Ability. The effects of Gravity, Ingrain, and Iron Ball nullify the immunity.",
			shortDesc: "This Pokemon is immune to Ground; Gravity/Ingrain/Iron Ball nullify it.",
		},
		gen3: {
			desc: "This Pokemon is immune to Ground-type attacks and the effects of Spikes and the Arena Trap Ability.",
			shortDesc: "This Pokemon is immune to Ground.",
		},
	},
	libero: {
		name: "Libero",
		desc: "This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type. This effect can only happen once per switch-in, and only if this Pokemon is not Terastallized.",
		shortDesc: "This Pokemon's type changes to the type of the move it is using. Once per switch-in.",
		gen8: {
			desc: "This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type.",
			shortDesc: "This Pokemon's type changes to match the type of the move it is about to use.",
		},
	},
	lightmetal: {
		name: "Light Metal",
		desc: "This Pokemon's weight is halved, rounded down to a tenth of a kilogram. This effect is calculated after the effect of Autotomize, and before the effect of Float Stone. A Pokemon's weight will not drop below 0.1 kg.",
		shortDesc: "Weight halved; Factory +1 Spe; unstatused Pokemon have 1.25x Speed.",
	},
	lightningrod: {
		name: "Lightning Rod",
		desc: "This Pokemon is immune to Electric-type moves and raises its Special Attack by 1 stage when hit by an Electric-type move. If this Pokemon is not the target of a single-target Electric-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move. If multiple Pokemon could redirect with this Ability, it goes to the one with the highest Speed, or in the case of a tie to the one that has had this Ability active longer.",
		shortDesc: "This Pokemon draws Electric moves to itself to raise Sp. Atk by 1; Electric immunity.",
		gen4: {
			desc: "If this Pokemon is not the target of a single-target Electric-type move used by another Pokemon, this Pokemon redirects that move to itself.",
			shortDesc: "This Pokemon draws single-target Electric moves to itself.",
		},
		gen3: {
			desc: "If this Pokemon is not the target of a single-target Electric-type move used by an opposing Pokemon, this Pokemon redirects that move to itself. This effect considers Hidden Power a Normal-type move.",
			shortDesc: "This Pokemon draws single-target Electric moves used by opponents to itself.",
		},

		activate: "  [POKEMON] took the attack!",
	},
	limber: {
		name: "Limber",
		desc: "This Pokemon cannot be paralyzed, cures paralysis if it gains this Ability, and cannot have its Speed lowered by another Pokemon.",
		shortDesc: "Cannot be paralyzed; cures paralysis; opposing Speed drops fail.",
	},
	lingeringaroma: {
		name: "Lingering Aroma",
		desc: "Pokemon making contact with this Pokemon have their Ability changed to Lingering Aroma. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Lingering Aroma, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
		shortDesc: "Making contact with this Pokemon has the attacker's Ability become Lingering Aroma.",
		gen8: {
			desc: "Pokemon making contact with this Pokemon have their Ability changed to Lingering Aroma. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Lingering Aroma, Multitype, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",
		},

		changeAbility: "  A lingering aroma clings to [TARGET]!",
	},
	liquidooze: {
		name: "Liquid Ooze",
		shortDesc: "This Pokemon damages those draining HP from it for as much as they would heal.",
		gen4: {
			desc: "This Pokemon damages those draining HP from it for as much as they would heal. This effect does not consider Dream Eater.",
		},

		damage: "  [POKEMON] sucked up the liquid ooze!",
	},
	liquidvoice: {
		name: "Liquid Voice",
		desc: "This Pokemon's sound-based moves become Water-type moves. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc: "This Pokemon's sound-based moves become Water type.",
	},
	longreach: {
		name: "Long Reach",
		desc: "On switch-in, this Pokemon's Accuracy is raised by 1 stage. Its attacks do not make contact with the target, and its critical hits deal 3x damage.",
		shortDesc: "+1 Accuracy on switch-in; no contact; critical hits deal 3x.",
	},
	magicbounce: {
		name: "Magic Bounce",
		desc: "This Pokemon is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. Moves reflected in this way are unable to be reflected again by this or Magic Coat's effect. Spikes, Stealth Rock, Sticky Web, and Toxic Spikes can only be reflected once per side, by the leftmost Pokemon under this or Magic Coat's effect. The Lightning Rod and Storm Drain Abilities redirect their respective moves before this Ability takes effect.",
		shortDesc: "This Pokemon blocks certain Status moves and bounces them back to the user.",
		gen5: {
			desc: "This Pokemon is unaffected by certain non-damaging moves directed at it and will instead use such moves against the original user. Moves reflected in this way are unable to be reflected again by this or Magic Coat's effect. Spikes, Stealth Rock, and Toxic Spikes can only be reflected once per side, by the leftmost Pokemon under this or Magic Coat's effect. The Lightning Rod and Storm Drain Abilities redirect their respective moves before this Ability takes effect.",
		},

		move: "#magiccoat",
	},
	lunarorbit: {
		name: "Lunar Orbit",
		desc: "This Pokemon has Magic Bounce, Serene Grace, and Triage. On switch-in, it sets Gravity for 5 turns.",
		shortDesc: "Magic Bounce + Serene Grace + Triage; sets Gravity for 5 turns.",
	},
	magicguard: {
		name: "Magic Guard",
		desc: "This Pokemon can only be damaged by direct attacks. Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage are considered direct damage.",
		shortDesc: "This Pokemon can only be damaged by direct attacks.",
		gen4: {
			desc: "This Pokemon can only be damaged by direct attacks. Curse and Substitute on use, Belly Drum, Pain Split, Struggle recoil, and confusion damage are considered direct damage. This Pokemon cannot be prevented from moving because of paralysis, and is unaffected by Toxic Spikes on switch-in.",
			shortDesc: "This Pokemon can only be damaged by direct attacks, and can't be fully paralyzed.",
		},
	},
	magician: {
		name: "Magician",
		desc: "If this Pokemon has no item, it steals the item off a Pokemon it hits with an attack. Does not affect Doom Desire and Future Sight. If multiple targets are hit by an attack the item is stolen from the fastest Pokemon, while considering the effect of Trick Room and prioritizing opposing Pokemon before allies.",
		shortDesc: "If this Pokemon has no item, it steals the item off a Pokemon it hits.",
	},
	magmaarmor: {
		name: "Magma Armor",
		desc: "This Pokemon cannot be frozen outside Cold Eclipse and cures freeze when it gains this Ability. In Dragon's Den, Volcanic, or Cold Eclipse, it gains 1 Def and Sp. Def on entry. Water/Ice attacks use 0.5x attacking stats; Dragon's Den absorbs Fire moves.",
		shortDesc: "No freeze; field +Def/SpD; halves Water/Ice; Dragon's Den absorbs Fire.",
	},
	magnetpull: {
		name: "Magnet Pull",
		desc: "Prevents opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell or are a Ghost type.",
		shortDesc: "Prevents opposing Steel-type Pokemon from choosing to switch out.",
		gen6: {
			desc: "Prevents adjacent opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell or are a Ghost type.",
			shortDesc: "Prevents adjacent opposing Steel-type Pokemon from choosing to switch out.",
		},
		gen5: {
			desc: "Prevents adjacent opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell.",
			shortDesc: "Prevents adjacent opposing Steel-type Pokemon from choosing to switch out.",
		},
		gen4: {
			desc: "Prevents opposing Steel-type Pokemon from choosing to switch out, unless they are holding a Shed Shell.",
			shortDesc: "Prevents opposing Steel-type Pokemon from choosing to switch out.",
		},
		gen3: {
			desc: "Prevents Steel-type Pokemon from choosing to switch out, other than this Pokemon.",
			shortDesc: "Prevents Steel-type Pokemon from choosing to switch out, other than this Pokemon.",
		},
	},
	marvelscale: {
		name: "Marvel Scale",
		shortDesc: "If this Pokemon is statused, its Defense is multiplied by 1.5.",
	},
	prismscale: {
		name: "Prism Scale",
		desc: "This Pokemon has Marvel Scale and Dragonize's effects.",
		shortDesc: "Marvel Scale + Dragonize.",
	},
	megalauncher: {
		name: "Mega Launcher",
		desc: "This Pokemon's pulse and bullet moves have their power multiplied by 1.5.",
		shortDesc: "Pulse and bullet moves have 1.5x power.",
	},
	heavyartillery: {
		name: "Heavy Artillery",
		desc: "This Pokemon's damaging pulse and bullet moves have their power doubled, hit all opposing Pokemon in Doubles and at full power in Free-for-All, and lower its Defense and Special Defense by 1 after use. This Pokemon has Unaware and Shell Armor's effects.",
		shortDesc: "Damaging pulse/bullet moves 2x; spread in Doubles, full power in FFA; lowers Def/SpD; Unaware + Shell Armor.",
	},
	megasol: {
		name: "Mega Sol",
		shortDesc: "This Pokemon's moves are used as if the effects of Sunny Day were active.",
	},
	bloomingsun: {
		name: "Blooming Sun",
		desc: "This Pokemon has Mega Sol, Invigorate, and Natural Cure's effects.",
		shortDesc: "Mega Sol + Invigorate + Natural Cure.",
	},
	merciless: {
		name: "Merciless",
		shortDesc: "This Pokemon's attacks are critical hits if the target is poisoned.",
	},
	mimicry: {
		name: "Mimicry",
		desc: "This Pokemon's types change to match the active Terrain when this Pokemon acquires this Ability, or whenever a Terrain begins. Electric type during Electric Terrain, Grass type during Grassy Terrain, Fairy type during Misty Terrain, and Psychic type during Psychic Terrain. If this Ability is acquired without an active Terrain, or a Terrain ends, this Pokemon's types become the original types for its species.",
		shortDesc: "This Pokemon's types change to match the Terrain. Type reverts when Terrain ends.",

		activate: "  [POKEMON] returned to its original type!",
	},
	mindseye: {
		name: "Mind's Eye",
		desc: "This Pokemon has Self Sufficient, can hit Ghost types with Normal- and Fighting-type moves, gains Fairy- and Dark-type STAB, ignores evasiveness, and cannot have its accuracy lowered. It takes 20% less damage and heals 1/16 after damaging moves hit. Cold Eclipse strengthens these effects.",
		shortDesc: "Self Sufficient; Ghost-piercing Normal/Fighting; Fairy/Dark STAB; 20% damage reduction.",
	},
	minus: {
		name: "Minus",
		desc: "This Pokemon's Electric- and Steel-type moves use 1.3x Attack and Sp. Atk. In Electric Terrain, its Sp. Atk is multiplied by 1.5.",
		shortDesc: "Electric/Steel moves use 1.3x Atk/SpA; Electric Terrain gives 1.5x SpA.",
		gen4: {
			desc: "If an active ally has the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
			shortDesc: "If an active ally has the Plus Ability, this Pokemon's Sp. Atk is 1.5x.",
		},
		gen3: {
			desc: "If an active Pokemon has the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
			shortDesc: "If an active Pokemon has the Plus Ability, this Pokemon's Sp. Atk is 1.5x.",
		},
	},
	mirrorarmor: {
		name: "Mirror Armor",
		desc: "When another Pokemon would lower this Pokemon's stat stages, those stat drops are reflected onto that Pokemon instead. This Pokemon also takes 20% less damage from attacks.",
		shortDesc: "Reflects opposing stat drops; takes 0.8x damage from attacks.",
	},
	mistysurge: {
		name: "Misty Surge",
		shortDesc: "On switch-in, this Pokemon summons Misty Terrain.",
	},
	moldbreaker: {
		name: "Mold Breaker",
		desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Armor Tail, Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Earth Eater, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Good as Gold, Grass Pelt, Guard Dog, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Illuminate, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mind's Eye, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Purifying Salt, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Tera Shell, Thermal Exchange, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, Well-Baked Body, White Smoke, Wind Rider, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		shortDesc: "This Pokemon's moves and their effects ignore the Abilities of other Pokemon.",
		gen8: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen7: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen6: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen5: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen4: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Clear Body, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Heatproof, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Lightning Rod, Limber, Magma Armor, Marvel Scale, Motor Drive, Oblivious, Own Tempo, Sand Veil, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, and Wonder Guard. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move. The Attack modifier from an ally's Flower Gift Ability is not negated.",
		},

		start: "  [POKEMON] breaks the mold!",
	},
	moody: {
		name: "Moody",
		desc: "This Pokemon has a random stat, other than accuracy or evasiveness, raised by 2 stages and another stat lowered by 1 stage at the end of each turn.",
		shortDesc: "Boosts a random stat (except accuracy/evasion) +2 and another stat -1 every turn.",
		gen7: {
			desc: "This Pokemon has a random stat raised by 2 stages and another stat lowered by 1 stage at the end of each turn.",
			shortDesc: "Raises a random stat by 2 and lowers another stat by 1 at the end of each turn.",
		},
	},
	motordrive: {
		name: "Motor Drive",
		desc: "This Pokemon is immune to Electric-type moves and raises its Speed by 1 stage when hit by an Electric-type move.",
		shortDesc: "This Pokemon's Speed is raised 1 stage if hit by an Electric move; Electric immunity.",
	},
	moxie: {
		name: "Moxie",
		desc: "This Pokemon's Attack is raised by 1 stage if it attacks and knocks out another Pokemon.",
		shortDesc: "This Pokemon's Attack is raised by 1 stage if it attacks and KOes another Pokemon.",
	},
	requiem: {
		name: "Requiem",
		desc: "This Pokemon has Cursed Body's effect. Its first direct damaging interaction with each opposing Pokemon applies Perish Song to that foe. The mark clears when the foe switches out. Whenever an opposing Pokemon faints, this Pokemon restores 1/4 max HP. When this Pokemon faints, it creates Haunted Field for 5 turns. This Ability cannot be suppressed.",
		shortDesc: "Cursed Body; first hit marks foes with Perish Song; foe KO heals 1/4; faint sets Haunted.",
	},
	reapersgrip: {
		name: "Reaper's Grip",
		desc: "This Pokemon has Unaware and Pressure's effects. Its foes lose 1 extra PP when targeting it. When it faints, it creates Haunted Field for 5 turns.",
		shortDesc: "Unaware + Pressure; foes lose 1 extra PP; faint sets 5-turn Haunted Field.",
	},
	moonlitwings: {
		name: "Moonlit Wings",
		desc: "This Pokemon has Serene Grace and gains STAB on Fairy-type moves.",
		shortDesc: "Serene Grace + Fairy STAB.",
	},
	terastaladaptability: {
		name: "Terastal Adaptability",
		desc: "This Pokemon has Adaptability's effect for Rock- and Poison-type moves. Its non-STAB damaging moves deal 1.5x damage. After it uses a damaging move, it gains that type's resistances until it uses another damaging move.",
		shortDesc: "Rock/Poison Adaptability; non-STAB 1.5x; gains last move type's resistances.",
	},
	frozenfortress: {
		name: "Frozen Fortress",
		desc: "This Pokemon has Shell Armor, Ice Body, and Crumbling Shell's effects.",
		shortDesc: "Shell Armor + Ice Body + Crumbling Shell.",
	},
	paradoxwheel: {
		name: "Paradox Wheel",
		desc: "This Pokemon gains STAB on Steel- and Electric-type moves.",
		shortDesc: "Gains Steel/Electric STAB.",
	},
	paradoxpower: {
		name: "Paradox Power",
		desc: "This Pokemon has Sheer Force's effect and gains STAB on Electric-type moves.",
		shortDesc: "Sheer Force; gains Electric STAB.",
	},
	paradoxpull: {
		name: "Paradox Pull",
		desc: "This Pokemon has Magnet Pull's effect. Its Steel typing only contributes resistances and immunities, not weaknesses.",
		shortDesc: "Magnet Pull; ignores Steel weaknesses.",
	},
	multiscale: {
		name: "Multiscale",
		shortDesc: "If this Pokemon is at full HP, damage taken from attacks is halved.",
	},
	multitype: {
		name: "Multitype",
		shortDesc: "If this Pokemon is an Arceus, its type changes to match its held Plate.",
		gen7: {
			shortDesc: "If this Pokemon is an Arceus, its type changes to match its held Plate or Z-Crystal.",
		},
		gen6: {
			shortDesc: "If this Pokemon is an Arceus, its type changes to match its held Plate.",
		},
		gen4: {
			shortDesc: "If this Pokemon is an Arceus, its type changes to match its held Plate. This Pokemon cannot lose its held item due to another Pokemon's attack.",
		},
	},
	mummy: {
		name: "Mummy",
		desc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
		shortDesc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy.",
		gen8: {
			desc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",
		},
		gen7: {
			desc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Battle Bond, Comatose, Disguise, Multitype, Mummy, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",
		},
		gen6: {
			desc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Multitype, Mummy, or Stance Change Abilities.",
		},
		gen5: {
			desc: "Pokemon making contact with this Pokemon have their Ability changed to Mummy. Does not affect Pokemon with the Multitype or Mummy Abilities.",
		},

		changeAbility: "  [TARGET]'s Ability became Mummy!",
	},
	myceliummight: {
		name: "Mycelium Might",
		desc: "This Pokemon's status moves ignore the target's Ability and move last in their priority bracket. Before this Pokemon uses a status move, attacks deal 0.75x damage to it. When it successfully uses a status move, it restores 1/8 of its maximum HP.",
		shortDesc: "Status ignores Abilities and moves last; takes 0.75x before status; heals 1/8.",
	},
	naturalcure: {
		name: "Natural Cure",
		desc: "This Pokemon has its non-volatile status condition cured when it switches out. If a status is cured this way, it restores 1/3 of its maximum HP.",
		shortDesc: "On switch out, cures status and heals 1/3 max HP if cured.",

		activate: "  ([POKEMON] is cured by its Natural Cure!)",
	},
	neuroforce: {
		name: "Neuroforce",
		desc: "This Pokemon's attacks that are super effective against the target have their damage multiplied by 1.25.",
		shortDesc: "This Pokemon's attacks that are super effective against the target do 1.25x damage.",
	},
	neutralizinggas: {
		name: "Neutralizing Gas",
		desc: "While this Pokemon is active, Abilities have no effect. This Ability activates before hazards and other Abilities take effect. Does not affect the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Tera Shift, Zen Mode, or Zero to Hero Abilities.",
		shortDesc: "While this Pokemon is active, Abilities have no effect.",
		gen8: {
			desc: "While this Pokemon is active, Abilities have no effect. This Ability activates before hazards and other Abilities take effect. Does not affect the As One, Battle Bond, Comatose, Disguise, Gulp Missile, Ice Face, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, or Zen Mode Abilities.",
		},

		start: "  Neutralizing gas filled the area!",
		end: "  The effects of the neutralizing gas wore off!",
	},
	noguard: {
		name: "No Guard",
		shortDesc: "Every move used by or against this Pokemon will always hit.",
	},
	normalize: {
		name: "Normalize",
		desc: "This Pokemon's moves are changed to be Normal type and have their power multiplied by 1.2. This effect comes before other effects that change a move's type.",
		shortDesc: "This Pokemon's moves are changed to be Normal type and have 1.2x power.",
		gen6: {
			desc: "This Pokemon's moves are changed to be Normal type. This effect comes before other effects that change a move's type.",
			shortDesc: "This Pokemon's moves are changed to be Normal type.",
		},
		gen4: {
			desc: "This Pokemon's moves are changed to be Normal type. This effect comes after other effects that change a move's type, except Struggle.",
		},
	},
	oblivious: {
		name: "Oblivious",
		desc: "This Pokemon cannot be infatuated or taunted. Gaining this Ability while infatuated or taunted cures it. This Pokemon is immune to the effect of the Intimidate Ability.",
		shortDesc: "This Pokemon cannot be infatuated or taunted. Immune to Intimidate.",
		gen7: {
			desc: "This Pokemon cannot be infatuated or taunted. Gaining this Ability while infatuated or taunted cures it.",
			shortDesc: "This Pokemon cannot be infatuated or taunted.",
		},
		gen5: {
			desc: "This Pokemon cannot be infatuated. Gaining this Ability while infatuated cures it.",
			shortDesc: "This Pokemon cannot be infatuated. Gaining this Ability while infatuated cures it.",
		},
	},
	opportunist: {
		name: "Opportunist",
		shortDesc: "When an opposing Pokemon has a stat stage raised, this Pokemon copies the effect.",
	},
	orichalcumpulse: {
		name: "Orichalcum Pulse",
		shortDesc: "On switch-in, summons Sunny Day. During Sunny Day, Attack is 1.3333x.",

		start: "  [POKEMON] turned the sunlight harsh, sending its ancient pulse into a frenzy!",
		activate: "  [POKEMON] basked in the sunlight, sending its ancient pulse into a frenzy!",
	},
	overcoat: {
		name: "Overcoat",
		desc: "This Pokemon is immune to powder moves, damage from Sandstorm, and the effects of Rage Powder and the Effect Spore Ability.",
		shortDesc: "This Pokemon is immune to powder moves, Sandstorm damage, and Effect Spore.",
		gen8: {
			desc: "This Pokemon is immune to powder moves, damage from Sandstorm or Hail, and the effects of Rage Powder and the Effect Spore Ability.",
			shortDesc: "This Pokemon is immune to powder moves, Sandstorm or Hail damage, Effect Spore.",
		},
		gen5: {
			desc: "This Pokemon is immune to damage from Sandstorm or Hail.",
			shortDesc: "This Pokemon is immune to damage from Sandstorm or Hail.",
		},
	},
	adaptivecell: {
		name: "Adaptive Cell",
		desc: "This Pokemon has Overcoat's effect and its Special Attack is multiplied by 1.3. Its first move slot sets its opening type: Fighting for physical moves or Psychic for special moves. Each later damaging move changes its type to match its category. Physical moves use its boosted Special Attack as Attack; special moves use its boosted Special Attack normally.",
		shortDesc: "Overcoat; SpA 1.3x; first move slot sets Fighting/Psychic; later moves switch type.",
	},
	adaptivepower: {
		name: "Adaptive Power",
		desc: "This Pokemon has Pure Power, Magic Guard, and Regenerator's effects.",
		shortDesc: "Pure Power + Magic Guard + Regenerator.",
	},
	dreamsickness: {
		name: "Dream Sickness",
		desc: "This Pokemon has Telepathy and Sworn Duty. Its stats cannot be lowered, and its allies' Speed cannot be lowered. At the end of each turn, this Pokemon and its allies restore 1/16 max HP. If an opposing attack would knock out an ally while this Pokemon is above 25% HP, this Pokemon takes the damage instead. Once per switch-in, an ally at 25% HP or lower heals 1/4 max HP, is cured of status, and is sheltered through the next turn.",
		shortDesc: "Telepathy + Sworn Duty; heals and protects allies.",
	},
	voidveil: {
		name: "Void Veil",
		desc: "This Pokemon has Levitate, Friend Guard, and Costar's effects.",
		shortDesc: "Levitate + Friend Guard + Costar.",
	},
	relicbeam: {
		name: "Relic Beam",
		desc: "This Pokemon's Sp. Atk becomes equal to its Defense, and Special Attack stat stages use Defense stages instead. Beam moves and moves boosted by Mega Launcher have 1.5x power.",
		shortDesc: "SpA equals Defense using Def stages; beam/Mega Launcher moves have 1.5x power.",
	},
	overgrow: {
		name: "Overgrow",
		desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its offensive stat is multiplied by 1.5 while using a Grass-type attack.",
		shortDesc: "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Grass attacks.",
		gen4: {
			desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Grass-type attacks have their power multiplied by 1.5.",
			shortDesc: "At 1/3 or less of its max HP, this Pokemon's Grass-type attacks have 1.5x power.",
		},
	},
	owntempo: {
		name: "Own Tempo",
		desc: "This Pokemon cannot be confused. Gaining this Ability while confused cures it. This Pokemon is immune to the effect of the Intimidate Ability.",
		shortDesc: "This Pokemon cannot be confused. Immune to Intimidate.",
		gen7: {
			desc: "This Pokemon cannot be confused. Gaining this Ability while confused cures it.",
			shortDesc: "This Pokemon cannot be confused.",
		},
	},
	parentalbond: {
		name: "Parental Bond",
		desc: "Cannot be suppressed. This Pokemon has Parental Bond, Tough Claws, Scrappy, and Friend Guard's effects. Its damaging moves become multi-hit moves that hit twice; the second hit deals reduced damage. Does not affect Doom Desire, Dragon Darts, Dynamax Cannon, Endeavor, Explosion, Final Gambit, Fling, Future Sight, Ice Ball, Rollout, Self-Destruct, existing multi-hit moves, multi-target moves, or two-turn moves.",
		shortDesc: "Unsuppressable. Parental Bond + Tough Claws + Scrappy + Friend Guard.",
	},
	pastelveil: {
		name: "Pastel Veil",
		desc: "This Pokemon and its allies cannot be poisoned. Gaining this Ability while this Pokemon or its ally is poisoned cures them. Before an opposing Pokemon uses a Poison-type move, that Pokemon's Attack and Special Attack are lowered by 1 stage.",
		shortDesc: "Prevents poison; opposing Poison move users lose Atk/SpA.",
	},
	perishbody: {
		name: "Perish Body",
		desc: "If an enemy hits this Pokemon with a damaging move, all opposing Pokemon get Perish Song. If an affected opposing Pokemon already has Perish Song, its countdown is reduced by 1 instead. During Haunted Field, affected foes are trapped while adjacent to this Pokemon. This effect is blocked by Holy Field and does not trigger from allies.",
		shortDesc: "Enemy hit: foes get Perish Song; repeat hits lower the count; Haunted traps.",

		start: "  The opposing Pok\u00E9mon will faint in three turns!",
	},
	pickpocket: {
		name: "Pickpocket",
		desc: "If this Pokemon has no item and is hit by a contact move, it steals the attacker's item. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability.",
		shortDesc: "If this Pokemon has no item and is hit by a contact move, it steals the attacker's item.",
	},
	pickup: {
		name: "Pickup",
		desc: "At the end of each turn, if this Pokemon is not holding an item and at least one adjacent Pokemon used an item during this turn, one of those Pokemon is selected at random and this Pokemon obtains that Pokemon's last used item. An item is not considered the last used if it was a popped Air Balloon, if the item was picked up by another Pokemon with this Ability, or if the item was lost to Bug Bite, Corrosive Gas, Covet, Incinerate, Knock Off, Pluck, or Thief. Items thrown with Fling can be picked up.",
		shortDesc: "If this Pokemon has no item, it finds one used by an adjacent Pokemon this turn.",
		gen7: {
			desc: "At the end of each turn, if this Pokemon is not holding an item and at least one adjacent Pokemon used an item during this turn, one of those Pokemon is selected at random and this Pokemon obtains that Pokemon's last used item. An item is not considered the last used if it was a popped Air Balloon, if the item was picked up by another Pokemon with this Ability, or if the item was lost to Bug Bite, Covet, Incinerate, Knock Off, Pluck, or Thief. Items thrown with Fling can be picked up.",
		},
		gen4: {
			desc: "No competitive use.",
			shortDesc: "No competitive use.",
		},

		addItem: "#recycle",
	},
	piercingdrill: {
		name: "Piercing Drill",
		desc: "This Pokemon has Mold Breaker's effect. Its contact moves ignore a target's protection and deal 1/4 the usual damage. It also has Power Drill's effect, boosting drill moves by 1.5x, or 2x in Rocky, Mountain, Snowy Mountain, Cave, and Volcanic fields.",
		shortDesc: "Mold Breaker; contact pierces Protect at 1/4; drill moves 1.5x, or 2x in fields.",
	},
	pixilate: {
		name: "Pixilate",
		desc: "This Pokemon's Normal-type moves become Fairy-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc: "This Pokemon's Normal-type moves become Fairy type and have 1.2x power.",
		gen6: {
			desc: "This Pokemon's Normal-type moves become Fairy-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
			shortDesc: "This Pokemon's Normal-type moves become Fairy type and have 1.3x power.",
		},
	},
	plus: {
		name: "Plus",
		desc: "This Pokemon's Electric- and Steel-type moves use 1.3x Attack and Sp. Atk. In Electric Terrain, its Sp. Atk is multiplied by 1.5.",
		shortDesc: "Electric/Steel moves use 1.3x Atk/SpA; Electric Terrain gives 1.5x SpA.",
		gen4: {
			desc: "If an active ally has the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
			shortDesc: "If an active ally has the Minus Ability, this Pokemon's Sp. Atk is 1.5x.",
		},
		gen3: {
			desc: "If an active Pokemon has the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
			shortDesc: "If an active Pokemon has the Minus Ability, this Pokemon's Sp. Atk is 1.5x.",
		},
	},
	poisonheal: {
		name: "Poison Heal",
		desc: "If this Pokemon is poisoned, it restores 1/8 of its maximum HP, rounded down, at the end of each turn instead of losing HP.",
		shortDesc: "This Pokemon is healed by 1/8 of its max HP each turn when poisoned; no HP loss.",
	},
	poisonpoint: {
		name: "Poison Point",
		shortDesc: "30% chance a Pokemon making contact with this Pokemon will be poisoned.",
		gen4: {
			desc: "30% chance a Pokemon making contact with this Pokemon will be poisoned. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "1/3 chance a Pokemon making contact with this Pokemon will be poisoned. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "1/3 chance a Pokemon making contact with this Pokemon will be poisoned.",
		},
	},
	poisonpuppeteer: {
		name: "Poison Puppeteer",
		desc: "If this Pokemon is a Pecharunt and poisons or badly poisons a target, the target also becomes confused.",
		shortDesc: "Pecharunt: If this Pokemon poisons a target, the target also becomes confused.",
	},
	poisontouch: {
		name: "Poison Touch",
		desc: "This Pokemon's contact moves have a 30% chance of poisoning. This effect comes after a move's inherent secondary effect chance.",
		shortDesc: "This Pokemon's contact moves have a 30% chance of poisoning.",
	},
	powerconstruct: {
		name: "Power Construct",
		desc: "If this Pokemon is a Zygarde in its 10% or 50% Forme, it changes to Complete Forme when it has 1/2 or less of its maximum HP at the end of the turn.",
		shortDesc: "If Zygarde 10%/50%, changes to Complete if at 1/2 max HP or less at end of turn.",

		activate: "  You sense the presence of many!",
		transform: "[POKEMON] transformed into its Complete Forme!",
	},
	powerofalchemy: {
		name: "Power of Alchemy",
		desc: "This Pokemon has Self Sufficient and Regenerator's effects. It copies a fainted ally's Ability while retaining both built-in effects until it switches out.",
		shortDesc: "Self Sufficient + Regenerator; copies a fainted ally's Ability and retains both.",
		gen8: {
			desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",
		},
		gen7: {
			desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",
		},

		changeAbility: "#receiver",
	},
	powerspot: {
		name: "Power Spot",
		desc: "This Pokemon's allies have the power of their moves multiplied by 1.3. This affects Doom Desire and Future Sight, even if the user is not on the field.",
		shortDesc: "This Pokemon's allies have the power of their moves multiplied by 1.3.",
	},
	prankster: {
		name: "Prankster",
		desc: "This Pokemon's non-damaging moves have their priority increased by 1. Opposing Dark-type Pokemon are immune to these moves, and any move called by these moves, if the resulting user of the move has this Ability.",
		shortDesc: "This Pokemon's Status moves have priority raised by 1, but Dark types are immune.",
		gen6: {
			desc: "This Pokemon's non-damaging moves have their priority increased by 1.",
			shortDesc: "This Pokemon's non-damaging moves have their priority increased by 1.",
		},
	},
	pressure: {
		name: "Pressure",
		desc: "If this Pokemon is the target of an opposing Pokemon's move, that move loses one additional PP. Imprison, Snatch, and Tera Blast also lose one additional PP when used by an opposing Pokemon, but Sticky Web does not.",
		shortDesc: "If this Pokemon is the target of a foe's move, that move loses one additional PP.",
		gen8: {
			desc: "If this Pokemon is the target of an opposing Pokemon's move, that move loses one additional PP. Imprison and Snatch also lose one additional PP when used by an opposing Pokemon, but Sticky Web does not.",
		},
		gen5: {
			desc: "If this Pokemon is the target of an opposing Pokemon's move, that move loses one additional PP. Imprison and Snatch also lose one additional PP when used by an opposing Pokemon.",
		},
		gen4: {
			desc: "If this Pokemon is the target of another Pokemon's move, that move loses one additional PP.",
			shortDesc: "If this Pokemon is the target of a move, that move loses one additional PP.",
		},

		start: "  [POKEMON] is exerting its pressure!",
	},
	primordialsea: {
		name: "Primordial Sea",
		desc: "On switch-in, the weather becomes Primordial Sea, which includes all the effects of Rain Dance and prevents damaging Fire-type moves from executing. This weather remains in effect until this Ability is no longer active for any Pokemon, or the weather is changed by the Delta Stream or Desolate Land Abilities.",
		shortDesc: "On switch-in, heavy rain begins until this Ability is not active in battle.",
	},
	prismarmor: {
		name: "Prism Armor",
		shortDesc: "Takes 0.8x damage from attacks; super-effective hits are also 0.75x.",
	},
	ironwill: {
		name: "Iron Will",
		desc: "This Pokemon has Prism Armor, Second Wind, and Self Sufficient's effects.",
		shortDesc: "Prism Armor + Second Wind + Self Sufficient.",
	},
	propellertail: {
		name: "Propeller Tail",
		shortDesc: "This Pokemon's moves cannot be redirected to a different target by any effect.",
	},
	protean: {
		name: "Protean",
		desc: "This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type. This effect can only happen once per switch-in, and only if this Pokemon is not Terastallized.",
		shortDesc: "This Pokemon's type changes to the type of the move it is using. Once per switch-in.",
		gen8: {
			desc: "This Pokemon's type changes to match the type of the move it is about to use. This effect comes after all effects that change a move's type.",
			shortDesc: "This Pokemon's type changes to match the type of the move it is about to use.",
		},
	},
	wingedwraith: {
		name: "Winged Wraith",
		desc: "This Pokemon has Infiltrator and Gale Wings' effects.",
		shortDesc: "Infiltrator + Gale Wings.",
	},
	zprotean: {
		name: "Z Protean",
		desc: "Before each attack other than Struggle, this Pokemon changes to the move's type and gains STAB. If it is Eevee-Starter, its battle sprite shifts to the matching Eeveelution until it leaves battle.",
		shortDesc: "Before each attack, changes type and battle sprite to match its move.",
	},
	protosynthesis: {
		name: "Protosynthesis",
		desc: "If Sunny Day is active or this Pokemon uses a held Booster Energy, this Pokemon's highest stat is multiplied by 1.3, or by 1.5 if the highest stat is Speed. Stat stage changes are considered at the time this Ability activates. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order. If this effect was started by Sunny Day, a held Booster Energy will not activate and the effect ends when Sunny Day is no longer active. If this effect was started by a held Booster Energy, it ends when this Pokemon is no longer active.",
		shortDesc: "Sunny Day active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed.",

		activate: "  The harsh sunlight activated [POKEMON]'s Protosynthesis!",
		activateFromItem: "  [POKEMON] used its Booster Energy to activate Protosynthesis!",
		start: "  [POKEMON]'s [STAT] was heightened!",
		end: "  The effects of [POKEMON]'s Protosynthesis wore off!",
	},
	psychicsurge: {
		name: "Psychic Surge",
		shortDesc: "On switch-in, this Pokemon summons Psychic Terrain.",
	},
	punkrock: {
		name: "Punk Rock",
		desc: "This Pokemon's sound-based moves have their power multiplied by 1.3. This Pokemon takes halved damage from sound-based moves.",
		shortDesc: "This Pokemon receives 1/2 damage from sound moves. Its own have 1.3x power.",
	},
	purepower: {
		name: "Pure Power",
		shortDesc: "This Pokemon's Attack is doubled.",
	},
	purifyingsalt: {
		name: "Purifying Salt",
		desc: "This Pokemon cannot become affected by a non-volatile status condition or Yawn. If a Pokemon uses a Ghost-type attack against this Pokemon, that Pokemon's offensive stat is halved when calculating the damage to this Pokemon.",
		shortDesc: "Ghost damage to this Pokemon dealt with a halved offensive stat; can't be statused.",
	},
	paradoxengine: {
		name: "Paradox Engine",
		desc: "If Sun or Electric Terrain is active, this Pokemon's Speed is multiplied by 1.5. Its Fighting- and Electric-type moves have 1.5x power.",
		shortDesc: "Sun/Electric Terrain: Speed 1.5x; Fighting/Electric moves 1.5x.",
	},
	quarkdrive: {
		name: "Quark Drive",
		desc: "If Electric Terrain is active or this Pokemon uses a held Booster Energy, this Pokemon's highest stat is multiplied by 1.3, or by 1.5 if the highest stat is Speed. Stat stage changes are considered at the time this Ability activates. If multiple stats are tied, Attack, Defense, Special Attack, Special Defense, and Speed are prioritized in that order. If this effect was started by Electric Terrain, a held Booster Energy will not activate and the effect ends when Electric Terrain is no longer active. If this effect was started by a held Booster Energy, it ends when this Pokemon is no longer active.",
		shortDesc: "Electric Terrain active or Booster Energy used: highest stat is 1.3x, or 1.5x if Speed.",

		activate: "  The Electric Terrain activated [POKEMON]'s Quark Drive!",
		activateFromItem: "  [POKEMON] used its Booster Energy to activate its Quark Drive!",
		start: "  [POKEMON]'s [STAT] was heightened!",
		end: "  The effects of [POKEMON]'s Quark Drive wore off!",
	},
	queenlymajesty: {
		name: "Queenly Majesty",
		desc: "Priority moves used by opposing Pokemon targeting this Pokemon or its allies are prevented from having an effect.",
		shortDesc: "This Pokemon and its allies are protected from opposing priority moves.",

		block: "#damp",
	},
	quickdraw: {
		name: "Quick Draw",
		shortDesc: "This Pokemon has a 30% chance to move first in its priority bracket with attacking moves.",

		activate: "  Quick Draw made [POKEMON] move faster!",
	},
	quickfeet: {
		name: "Quick Feet",
		desc: "If this Pokemon has a non-volatile status condition, its Speed is multiplied by 1.5. This Pokemon ignores the paralysis effect of halving Speed.",
		shortDesc: "If this Pokemon is statused, its Speed is 1.5x; ignores Speed drop from paralysis.",
		gen6: {
			desc: "If this Pokemon has a non-volatile status condition, its Speed is multiplied by 1.5. This Pokemon ignores the paralysis effect of quartering Speed.",
		},
	},
	raindish: {
		name: "Rain Dish",
		desc: "If Rain Dance is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "If Rain Dance is active, this Pokemon heals 1/16 of its max HP each turn.",
		gen7: {
			desc: "If Rain Dance is active, this Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn.",
		},
	},
	rattled: {
		name: "Rattled",
		desc: "This Pokemon's Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack, or if an opposing Pokemon affected this Pokemon with the Intimidate Ability.",
		shortDesc: "Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack, or Intimidated.",
		gen7: {
			desc: "This Pokemon's Speed is raised by 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.",
			shortDesc: "This Pokemon's Speed is raised 1 stage if hit by a Bug-, Dark-, or Ghost-type attack.",
		},
	},
	receiver: {
		name: "Receiver",
		desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Flower Gift, Forecast, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Power of Alchemy, Protosynthesis, Quark Drive, Receiver, RKS System, Schooling, Shields Down, Stance Change, Tera Shell, Tera Shift, Teraform Zero, Trace, Wonder Guard, Zen Mode, and Zero to Hero.",
		shortDesc: "This Pokemon copies the Ability of an ally that faints.",
		gen8: {
			desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",
		},
		gen7: {
			desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, Wonder Guard, and Zen Mode.",
		},

		changeAbility: "  [SOURCE]'s [ABILITY] was taken over!",
	},
	reckless: {
		name: "Reckless",
		desc: "This Pokemon's attacks with recoil or crash damage have their power multiplied by 1.2. Does not affect Struggle.",
		shortDesc: "This Pokemon's attacks with recoil or crash damage have 1.2x power; not Struggle.",
	},
	refrigerate: {
		name: "Refrigerate",
		desc: "This Pokemon's Normal-type moves become Ice-type moves and have their power multiplied by 1.2. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
		shortDesc: "This Pokemon's Normal-type moves become Ice type and have 1.2x power.",
		gen6: {
			desc: "This Pokemon's Normal-type moves become Ice-type moves and have their power multiplied by 1.3. This effect comes after other effects that change a move's type, but before Ion Deluge and Electrify's effects.",
			shortDesc: "This Pokemon's Normal-type moves become Ice type and have 1.3x power.",
		},
	},
	regenerator: {
		name: "Regenerator",
		shortDesc: "This Pokemon restores 1/3 of its maximum HP, rounded down, when it switches out.",
	},
	ripen: {
		name: "Ripen",
		desc: "When this Pokemon eats certain Berries, the effects are doubled. Berries that restore HP or PP have the amount doubled, Berries that raise stat stages have the amount doubled, Berries that halve damage taken quarter it instead, and a Jaboca Berry or Rowap Berry has the attacker lose 1/4 of its maximum HP, rounded down.",
		shortDesc: "When this Pokemon eats certain Berries, the effects are doubled.",
	},
	rivalry: {
		name: "Rivalry",
		desc: "This Pokemon's attacks have their power multiplied by 1.25 against targets of the same gender or multiplied by 0.75 against targets of the opposite gender. There is no modifier if either this Pokemon or the target is genderless.",
		shortDesc: "This Pokemon's attacks do 1.25x on same gender targets; 0.75x on opposite gender.",
	},
	rkssystem: {
		name: "RKS System",
		desc: "If this Pokemon is Silvally, it gains the custom effects tied to its held Memory, even if its current form does not match that Memory, and restores 1/16 of its maximum HP at the end of each turn. Silvally without a Memory uses Scrappy's effect instead.",
		shortDesc: "Silvally gains its Memory effects and heals 1/16; no Memory gives Scrappy.",
	},
	rockhead: {
		name: "Rock Head",
		desc: "This Pokemon does not take recoil damage, except Struggle. Does not affect Life Orb damage or crash damage.",
		shortDesc: "This Pokemon does not take recoil damage besides Struggle/Life Orb/crash damage.",
		gen3: {
			desc: "This Pokemon does not take recoil damage, except Struggle. Does not affect crash damage.",
			shortDesc: "This Pokemon does not take recoil damage besides Struggle and crash damage.",
		},
	},
	rockypayload: {
		name: "Rocky Payload",
		desc: "This Pokemon gains Rock STAB. Its offensive stat is multiplied by 1.5 while using a Rock-type attack, or 2x in Rocky Terrain. It gains Rock-type resistances without gaining Rock-type weaknesses.",
		shortDesc: "Rock STAB; Rock attacks 1.5x, or 2x in Rocky Terrain; gains Rock resistances.",
	},
	roughskin: {
		name: "Rough Skin",
		desc: "Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down.",
		shortDesc: "Pokemon making contact with this Pokemon lose 1/8 of their max HP.",
		gen4: {
			desc: "Pokemon making contact with this Pokemon lose 1/8 of their maximum HP, rounded down. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "Pokemon making contact with this Pokemon lose 1/16 of their maximum HP, rounded down. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "Pokemon making contact with this Pokemon lose 1/16 of their max HP.",
		},

		damage: "  [POKEMON] was hurt!",
	},
	roughscale: {
		name: "Rough Scale",
		desc: "This Pokemon has Rough Skin and Tough Claws' effects.",
		shortDesc: "Rough Skin + Tough Claws.",
	},
	caverndrake: {
		name: "Cavern Drake",
		desc: "This Pokemon has Earth Eater, Solid Rock, and Mold Breaker's effects.",
		shortDesc: "Earth Eater + Solid Rock + Mold Breaker.",
	},
	runaway: {
		name: "Run Away",
		desc: "This Pokemon is ignored by entry hazards when it switches in, including Spikes, Stealth Rock, Sticky Web, Toxic Spikes, and their field variants.",
		shortDesc: "Immune to entry-hazard effects on switch-in.",
	},
	sandforce: {
		name: "Sand Force",
		desc: "If Sandstorm is active, this Pokemon's Ground-, Rock-, and Steel-type attacks have their power multiplied by 1.3. This Pokemon takes no damage from Sandstorm.",
		shortDesc: "This Pokemon's Ground/Rock/Steel attacks do 1.3x in Sandstorm; immunity to it.",
	},
	sandrush: {
		name: "Sand Rush",
		desc: "If Sandstorm is active, this Pokemon's Speed is doubled. This Pokemon takes no damage from Sandstorm.",
		shortDesc: "If Sandstorm is active, this Pokemon's Speed is doubled; immunity to Sandstorm.",
	},
	sandspit: {
		name: "Sand Spit",
		shortDesc: "When this Pokemon is hit by an attack, the effect of Sandstorm begins.",
		gen8: {
			desc: "When this Pokemon is hit by an attack, the effect of Sandstorm begins. This effect comes after the effects of Max and G-Max Moves.",
		},
	},
	sandstream: {
		name: "Sand Stream",
		shortDesc: "On switch-in, this Pokemon summons Sandstorm.",
	},
	sandveil: {
		name: "Sand Veil",
		desc: "If Sandstorm is active, the accuracy of moves used against this Pokemon is multiplied by 0.8. This Pokemon takes no damage from Sandstorm.",
		shortDesc: "If Sandstorm is active, this Pokemon's evasiveness is 1.25x; immunity to Sandstorm.",
	},
	safeharbor: {
		name: "Safe Harbor",
		desc: "This Pokemon absorbs Water- and Ice-type attacks to restore 1/4 of its maximum HP. It also has Ice Body, Hydration, and Self Sufficient's effects.",
		shortDesc: "Absorbs Water/Ice moves; Ice Body + Hydration + Self Sufficient.",
	},
	seablessing: {
		name: "Sea Blessing",
		desc: "This Pokemon's Defense and Special Defense are 1.5x. On entry, it and adjacent allies heal 1/4 max HP, and it gains Aqua Ring. It has Water Veil and Rain Dish.",
		shortDesc: "1.5x Def/SpD; entry heals self/allies 1/4; Water Veil + Rain Dish.",
	},
	sapsipper: {
		name: "Sap Sipper",
		desc: "This Pokemon is immune to Grass-type moves and raises its Attack by 1 stage when hit by a Grass-type move.",
		shortDesc: "This Pokemon's Attack is raised 1 stage if hit by a Grass move; Grass immunity.",
	},
	schooling: {
		name: "Schooling",
		desc: "A level 20 or higher Wishiwashi changes to School Form above 1/4 maximum HP and returns to Solo Form at or below 1/4 maximum HP. While in School Form, it has Hydra Bond, Self Repair, and Filter's effects.",
		shortDesc: "Changes form by HP; School: Hydra Bond + Self Repair + Filter.",

		transform: "[POKEMON] formed a school!",
		transformEnd: "[POKEMON] stopped schooling!",
	},
	toxicsink: {
		name: "Toxic Sink",
		desc: "This Pokemon has Effect Spore and Invigorate. It redirects and absorbs Poison-type moves, raising its Attack and Special Attack by 1.",
		shortDesc: "Effect Spore + Invigorate; absorbs Poison moves for +1 Atk/SpA.",
	},
	scrappy: {
		name: "Scrappy",
		desc: "This Pokemon can hit Ghost types with Normal- and Fighting-type moves. This Pokemon is immune to the effect of the Intimidate Ability.",
		shortDesc: "Fighting, Normal moves hit Ghost. Immune to Intimidate.",
		gen7: {
			desc: "This Pokemon can hit Ghost types with Normal- and Fighting-type moves.",
			shortDesc: "This Pokemon can hit Ghost types with Normal- and Fighting-type moves.",
		},
	},
	screencleaner: {
		name: "Screen Cleaner",
		shortDesc: "On switch-in, the effects of Aurora Veil, Light Screen, and Reflect end for both sides.",
	},
	seedsower: {
		name: "Seed Sower",
		shortDesc: "When this Pokemon is hit by an attack, the effect of Grassy Terrain begins.",
	},
	serenegrace: {
		name: "Serene Grace",
		desc: "This Pokemon's moves have their secondary effect chance doubled. This effect stacks with the Rainbow effect, except for secondary effects that cause the target to flinch.",
		shortDesc: "This Pokemon's moves have their secondary effect chance doubled.",
		gen4: {
			desc: "This Pokemon's moves have their secondary effect chance doubled.",
		},
	},
	seasonalstride: {
		name: "Seasonal Stride",
		desc: "Normal moves become this Pokemon's primary type and have 1.2x power. Kicking moves have 1.4x power. It has Chlorophyll and changes forme with weather: Spring in rain, Summer in sun, Autumn in sand, Winter in snow.",
		shortDesc: "Normal -> primary type 1.2x; kicks 1.4x; Chlorophyll; weather forms.",
	},
	shadowshield: {
		name: "Shadow Shield",
		shortDesc: "If this Pokemon is at full HP, damage taken from attacks is halved.",
	},
	shadowguard: {
		name: "Shadow Guard",
		desc: "This Pokemon has Shadow Tag, Shadow Shield, and Elevate's effects. On the turn after it uses a damaging move, it queues a 100 BP Temporal Shift Future Sight using whichever of Ghost, Dark, or Fairy would hit the target best. Shadow Tag's faint effect also applies.",
		shortDesc: "Shadow Tag + Shadow Shield + Elevate; after attacking, queues 100 BP Ghost/Dark/Fairy Temporal Shift.",
	},
	shadowtag: {
		name: "Shadow Tag",
		desc: "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability. This Pokemon takes 0.75x damage from attacks. When this Pokemon faints, it creates Haunted Field for 5 turns, ignoring Neutralization. This Ability cannot be suppressed.",
		shortDesc: "Traps foes; takes 0.75x damage; on faint creates Haunted Field.",
		gen6: {
			desc: "Prevents adjacent opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell, are a Ghost type, or also have this Ability.",
			shortDesc: "Prevents adjacent foes from choosing to switch unless they also have this Ability.",
		},
		gen5: {
			desc: "Prevents adjacent opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell or also have this Ability.",
		},
		gen4: {
			desc: "Prevents opposing Pokemon from choosing to switch out, unless they are holding a Shed Shell or also have this Ability.",
			shortDesc: "Prevents foes from choosing to switch unless they also have this Ability.",
		},
		gen3: {
			desc: "Prevents opposing Pokemon from choosing to switch out.",
			shortDesc: "Prevents opposing Pokemon from choosing to switch out.",
		},
	},
	sharpness: {
		name: "Sharpness",
		shortDesc: "This Pokemon's slicing moves have their power multiplied by 1.5.",
	},
	blademastery: {
		name: "Blade Mastery",
		desc: "This Pokemon has Sharpness and Super Luck. Below half HP, its slicing moves have +1 priority.",
		shortDesc: "Sharpness + Super Luck; below half HP, slicing moves gain +1 priority.",
	},
	shedskin: {
		name: "Shed Skin",
		desc: "At the end of each turn, this Pokemon has a 50% chance to cure its non-volatile status, remove common negative effects including Curse and Perish Song, reset its negative stat stages to 0, and restore 1/4 max HP. This can also activate while at or below half HP. In Dragon's Den, activation is guaranteed; it instead raises the higher offensive stat by 1, lowers Defense and Special Defense by 1, and restores 1/4 max HP.",
		shortDesc: "50% to cure effects, reset drops, and heal 1/4; guaranteed in Dragon's Den.",
	},
	sheerforce: {
		name: "Sheer Force",
		desc: "This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Anger Shell, Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",
		shortDesc: "This Pokemon's attacks with secondary effects have 1.3x power; nullifies the effects.",
		gen8: {
			desc: "This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Berserk, Color Change, Emergency Exit, Pickpocket, Wimp Out, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",
		},
		gen6: {
			desc: "This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Color Change, Pickpocket, Red Card, Eject Button, Kee Berry, and Maranga Berry from activating.",
		},
		gen5: {
			desc: "This Pokemon's attacks with secondary effects have their power multiplied by 1.3, but the secondary effects are removed. If a secondary effect was removed, it also removes the user's Life Orb recoil and Shell Bell recovery, and prevents the target's Color Change, Pickpocket, Red Card, and Eject Button from activating.",
		},
	},
	shellarmor: {
		name: "Shell Armor",
		desc: "This Pokemon cannot be struck by critical hits and takes 0.8x damage from attacks. In Fairy Tale or Dragon's Den, it gains 1 Defense on entry; opposing stat drops give +2 Sp. Def.",
		shortDesc: "No critical hits; takes 0.8x damage; field +1 Def; stat drops give +2 SpD.",
	},
	shielddust: {
		name: "Shield Dust",
		desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, cause this Pokemon's stat stages to be lowered, as well as Anchor Shot, Eerie Spell, Fling, Psychic Noise, Salt Cure, Spirit Shackle, Syrup Bomb, and Throat Chop. The effect of Sparkling Aria is prevented if this Pokemon is the only target. Secondary effects added by King's Rock, Razor Fang, and the Poison Touch, Stench, and Toxic Chain Abilities are also prevented against this Pokemon.",
		shortDesc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack.",
		gen8: {
			desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, cause this Pokemon's stat stages to be lowered, as well as Anchor Shot, Eerie Spell, Fling, Spirit Shackle, and Throat Chop. The effect of Sparkling Aria is prevented if this Pokemon is the only target. Secondary effects added by King's Rock, Razor Fang, and the Poison Touch and Stench Abilities are also prevented against this Pokemon.",
		},
		gen7: {
			desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, cause this Pokemon's stat stages to be lowered, as well as Anchor Shot, Fling, Spirit Shackle, and Throat Chop. The effect of Sparkling Aria is prevented if this Pokemon is the only target. Secondary effects added by King's Rock, Razor Fang, and the Poison Touch and Stench Abilities are also prevented against this Pokemon.",
		},
		gen6: {
			desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, cause this Pokemon's stat stages to be lowered, and Fling. Secondary effects added by King's Rock, Razor Fang, and the Poison Touch and Stench Abilities are also prevented against this Pokemon.",
		},
		gen4: {
			desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, cause this Pokemon's stat stages to be lowered, and Fling. Secondary effects added by King's Rock and Razor Fang are also prevented against this Pokemon.",
		},
		gen3: {
			desc: "This Pokemon is not affected by the secondary effect of another Pokemon's attack. Attacks with secondary effects that are prevented include those with a chance (even 100%) to paralyze, sleep, freeze, burn, poison, confuse, cause this Pokemon to flinch, or cause this Pokemon's stat stages to be lowered. The secondary effect added by King's Rock is also prevented against this Pokemon.",
		},
	},
	starboxer: {
		name: "Star Boxer",
		desc: "This Pokemon's punching moves hit four times and have 1.5x power. Each hit is full power, but secondary effects only occur on the first two hits.",
		shortDesc: "Punching moves hit 4 times at full power and 1.5x; secondaries only on hits 1-2.",
	},
	shieldsdown: {
		name: "Shields Down",
		desc: "If this Pokemon is a Minior, it changes to its Core forme if it has 1/2 or less of its maximum HP, and changes to Meteor Form if it has more than 1/2 its maximum HP. This check is done on switch-in and at the end of each turn. While in its Meteor Form, it cannot become affected by a non-volatile status condition or Yawn.",
		shortDesc: "If Minior, switch-in/end of turn it changes to Core at 1/2 max HP or less, else Meteor.",

		transform: "Shields Down deactivated!\n([POKEMON] shielded itself.)",
		transformEnd: "Shields Down activated!\n([POKEMON] stopped shielding itself.)",
	},
	simple: {
		name: "Simple",
		shortDesc: "When one of this Pokemon's stat stages is raised or lowered, the amount is doubled.",
		gen7: {
			desc: "When one of this Pokemon's stat stages is raised or lowered, the amount is doubled. This Ability does not affect stat stage increases received from Z-Power effects that happen before a Status Z-Move is used.",
		},
		gen6: {
			desc: "When one of this Pokemon's stat stages is raised or lowered, the amount is doubled.",
		},
		gen4: {
			desc: "This Pokemon's stat stages are considered doubled during stat calculations. A stat stage cannot be considered more than 6 or less than -6.",
			shortDesc: "This Pokemon's stat stages are considered doubled during stat calculations.",
		},
	},
	skilllink: {
		name: "Skill Link",
		desc: "This Pokemon's multi-hit attacks always hit the maximum number of times and have 1.5x power. Triple Kick and Triple Axel do not check accuracy for the second and third hits.",
		shortDesc: "Multi-hit attacks always hit max times and have 1.5x power.",
		gen7: {
			desc: "This Pokemon's multi-hit attacks always hit the maximum number of times. Triple Kick does not check accuracy for the second and third hits.",
		},
		gen4: {
			desc: "This Pokemon's multi-hit attacks always hit the maximum number of times. Does not affect Triple Kick.",
		},
	},
	slowstart: {
		name: "Slow Start",
		desc: "On switch-in, this Pokemon's Attack is 0.65x and Speed is 0.5x for 3 turns, and its Defense is doubled. On Holy Field, the Attack and Speed drops are removed and its Defense is 1.5x instead.",
		shortDesc: "3 turns: Atk 0.65x, Spe 0.5x, Def 2x; Holy removes drops and gives Def 1.5x.",
		gen7: {
			desc: "On switch-in, this Pokemon's Attack and Speed are halved for 5 turns. During the effect, if this Pokemon uses a generic Z-Move based on a special move, its Special Attack is halved during damage calculation.",
		},
		gen6: {
			desc: "On switch-in, this Pokemon's Attack and Speed are halved for 5 turns.",
		},

		start: "  [POKEMON] can't get it going!",
		end: "  [POKEMON] finally got its act together!",
	},
	slushrush: {
		name: "Slush Rush",
		shortDesc: "If Snow is active, this Pokemon's Speed is doubled.",
		gen8: {
			shortDesc: "If Hail is active, this Pokemon's Speed is doubled.",
		},
	},
	sniper: {
		name: "Sniper",
		desc: "This Pokemon gains 1 Accuracy on entry. Its critical hits deal 2.25x damage instead of 1.5x.",
		shortDesc: "+1 Accuracy on entry; critical hits deal 2.25x damage.",
	},
	webassassin: {
		name: "Web Assassin",
		desc: "This Pokemon's Speed is doubled and cannot be lowered. This Pokemon has Sniper's effect. Its attacks are always critical hits against targets that are poisoned or have lowered Speed.",
		shortDesc: "Speed doubled and cannot drop; Sniper; always crits poisoned or Speed-lowered targets.",
	},
	snowcloak: {
		name: "Snow Cloak",
		desc: "If Snow is active, the accuracy of moves used against this Pokemon is multiplied by 0.8.",
		shortDesc: "If Snow is active, this Pokemon's evasiveness is 1.25x.",
		gen8: {
			desc: "If Hail is active, the accuracy of moves used against this Pokemon is multiplied by 0.8. This Pokemon takes no damage from Hail.",
			shortDesc: "If Hail is active, this Pokemon's evasiveness is 1.25x; immunity to Hail.",
		},
	},
	snowwarning: {
		name: "Snow Warning",
		shortDesc: "On switch-in, this Pokemon summons Snow.",
		gen8: {
			shortDesc: "On switch-in, this Pokemon summons Hail.",
		},
	},
	solarpower: {
		name: "Solar Power",
		desc: "If Sunny Day is active, this Pokemon's Special Attack is multiplied by 1.5 and it loses 1/8 of its maximum HP, rounded down, at the end of each turn. These effects are prevented if the Pokemon is holding a Utility Umbrella.",
		shortDesc: "If Sunny Day is active, this Pokemon's Sp. Atk is 1.5x; loses 1/8 max HP per turn.",
		gen7: {
			desc: "If Sunny Day is active, this Pokemon's Special Attack is multiplied by 1.5 and it loses 1/8 of its maximum HP, rounded down, at the end of each turn.",
		},
	},
	solarrecharge: {
		name: "Solar Recharge",
		desc: "This Pokemon's Fire-type moves have STAB. It is immune to Fire-type moves and restores 1/4 of its maximum HP when hit by one. In Sun, it restores 1/8 of its maximum HP at the end of each turn.",
		shortDesc: "Fire STAB; Fire immunity heals 1/4; heals 1/8 each turn in Sun.",
	},
	solidrock: {
		name: "Solid Rock",
		shortDesc: "Takes 0.8x damage from attacks; super-effective hits are also 0.75x.",
	},
	soulheart: {
		name: "Soul-Heart",
		shortDesc: "This Pokemon's Special Attack is raised by 1 stage when another Pokemon faints.",
	},
	soundproof: {
		name: "Soundproof",
		shortDesc: "This Pokemon is immune to sound-based moves, unless it used the move.",
		gen7: {
			shortDesc: "This Pokemon is immune to sound-based moves, including Heal Bell.",
		},
		gen5: {
			shortDesc: "This Pokemon is immune to sound-based moves, except Heal Bell.",
		},
		gen4: {
			shortDesc: "This Pokemon is immune to sound-based moves, including Heal Bell.",
		},
	},
	conductivity: {
		name: "Conductivity",
		desc: "This Pokemon is immune to sound-based moves. Its Electric-type moves hit Steel-type Pokemon super effectively.",
		shortDesc: "Sound immunity; Electric moves hit Steel super effectively.",
	},
	solaridol: {
		name: "Solar Idol",
		desc: "This Pokemon has Levitate's Ground immunity. Its Fire-type moves have 1.5x power, its Attack is 1.5x during sun, and Grass-type attacks are resisted.",
		shortDesc: "Levitate; Fire power 1.5x; Attack 1.5x in sun; resists Grass.",
	},
	lunaridol: {
		name: "Lunar Idol",
		desc: "This Pokemon has Levitate's Ground immunity and is immune to hail damage. Its Ice-type moves have 1.5x power, and its Special Attack is 1.5x during hail or snow.",
		shortDesc: "Levitate; immune to hail; Ice power 1.5x; Sp. Atk 1.5x in hail/snow.",
	},
	royaldecree: {
		name: "Royal Decree",
		desc: "On switch-in, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While this Pokemon is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, enemy-caused stat drops fail, and charge moves fire immediately. This Pokemon's own self-inflicted stat drops still work. Neutralization disables these Royal Decree effects while active.",
		shortDesc: "Haze/screen clear; Safeguard blocks reset; blocks setup/screens; skips charge turns.",
	},
	empress: {
		name: "Empress",
		desc: "This Pokemon has Queenly Majesty and Royal Decree's effects, gains normal STAB on Fighting-type moves, and ignores the Fairy-type component of Poison- and Steel-type weaknesses.",
		shortDesc: "Queenly Majesty + Royal Decree; Fighting STAB; ignores Fairy's Poison/Steel weakness.",
	},
	imperialprincess: {
		name: "Imperial Princess",
		desc: "This Pokemon has Striker, Vital Spirit, and Moxie's effects, gains normal STAB on Fighting-type moves, and ignores the Fairy-type component of Poison- and Steel-type weaknesses.",
		shortDesc: "Striker + Vital Spirit + Moxie; Fighting STAB; ignores Fairy's Poison/Steel weakness.",
	},
	loyalguard: {
		name: "Loyal Guard",
		desc: "This Pokemon has Friend Guard, Guard Dog, and Intimidate's effects.",
		shortDesc: "Friend Guard + Guard Dog + Intimidate.",
	},
	abysslure: {
		name: "Abyss Lure",
		desc: "This Pokemon redirects Electric- and Water-type moves to itself, is immune to them, restores 1/4 of its maximum HP, and raises its Attack and Special Attack by 1 stage. It also has Illuminate's effect.",
		shortDesc: "Redirects Electric/Water; heals 1/4; +1 Atk/SpA; Illuminate.",
	},
	bogbody: {
		name: "Bog Body",
		desc: "This Pokemon has Electromorphosis, Levitate, and Dry Skin's effects.",
		shortDesc: "Electromorphosis + Levitate + Dry Skin.",
	},
	frostsiren: {
		name: "Frost Siren",
		desc: "This Pokemon has Refrigerate, Forewarn, and Dry Skin's effects.",
		shortDesc: "Refrigerate + Forewarn + Dry Skin.",
	},
	royalhive: {
		name: "Royal Hive",
		desc: "On switch-in, this Pokemon starts in Attack Stance and raises its Attack and Special Attack by 1 stage. After it uses a status move, it changes to Defense Stance, lowering its Attack and Special Attack by 1 stage and raising its Defense and Special Defense by 1 stage. After it uses a damaging move while in Defense Stance, it changes back to Attack Stance, lowering its Defense and Special Defense by 1 stage and raising its Attack and Special Attack by 1 stage. While in Defense Stance, it restores 1/16 of its maximum HP at the end of each turn.",
		shortDesc: "Starts +1 Atk/SpA; status moves swap to +1 Def/SpD and heal 1/16; attacks swap back.",
	},
	royalsun: {
		name: "Royal Sun",
		desc: "On switch-in, this Pokemon summons Sunny Day for 5 turns and activates Royal Decree's effects. Safeguard protects a side from Royal Decree's switch-in stat reset. Neutralization disables the Royal Decree effects while active.",
		shortDesc: "Drought + Royal Decree; Safeguard blocks the reset; disabled by Neutralization.",
	},
	parasitism: {
		name: "Parasitism",
		desc: "This Pokemon has Dry Skin. While above 50% HP, its weaknesses are neutralized, Magic Guard is active, opposing status moves fail, and opposing attack secondary effects are blocked. The first time Parasect would faint, it fake-faints at 1 HP, then becomes Parasect-Parasite at the end of the turn and revives at full HP. This Ability cannot be suppressed and is immune to Neutralization.",
		shortDesc: "Dry Skin; above half: defensive protection; first KO triggers Resuscitation.",
	},
	venomheal: {
		name: "Venom Heal",
		desc: "This Pokemon has Hyper Cutter, Poison Heal, and Poison Point's effects. Its Poison-type moves have 1.5x STAB.",
		shortDesc: "Hyper Cutter + Poison Heal + Poison Point; Poison moves get 1.5x STAB.",
	},
	resuscitation: {
		name: "Resuscitation",
		desc: "When Parasect revives as Parasect-Parasite, its status, stat stages, and volatile effects are cleared and it returns to full HP. Afterward, this Ability has Self Repair and Magic Guard's effects.",
		shortDesc: "Revival fully resets battle effects; Self Repair + Magic Guard.",
	},
	pendulumswing: {
		name: "Pendulum Swing",
		desc: "This Pokemon has Insomnia and Filter's effects. Its moves cannot miss.",
		shortDesc: "Insomnia + Filter; moves cannot miss.",
	},
	nightrealm: {
		name: "Night Realm",
		desc: "This Pokemon can use Dream Eater and Nightmare on awake targets.",
		shortDesc: "Dream Eater and Nightmare affect awake targets.",
	},
	nightmarepulse: {
		name: "Nightmare Pulse",
		desc: "This Pokemon has Pendulum Swing and Night Realm's effects.",
		shortDesc: "Pendulum Swing + Night Realm.",
	},
	pulsewaste: {
		name: "Pulse Waste",
		desc: "This Pokemon has Protean, Poison Touch, and Regenerator's effects.",
		shortDesc: "Protean + Poison Touch + Regenerator.",
	},
	riftdancer: {
		name: "Rift Dancer",
		desc: "This Pokemon has Opportunist, Chlorophyll, and Dancer's effects.",
		shortDesc: "Opportunist + Chlorophyll + Dancer.",
	},
	lunarspirit: {
		name: "Lunar Spirit",
		desc: "This Pokemon has STAB on Psychic- and Normal-type moves.",
		shortDesc: "Psychic- and Normal-type moves get STAB.",
	},
	kickfiend: {
		name: "Kick Fiend",
		desc: "This Pokemon has Striker, Violent Rush, and Limber's effects.",
		shortDesc: "Striker + Violent Rush + Limber.",
	},
	punchfiend: {
		name: "Punch Fiend",
		desc: "This Pokemon has Iron Fist, Inner Focus, and Unseen Fist's effects.",
		shortDesc: "Iron Fist + Inner Focus + Unseen Fist.",
	},
	spinfiend: {
		name: "Spin Fiend",
		desc: "This Pokemon has Technician and Vital Spirit's effects.",
		shortDesc: "Technician + Vital Spirit.",
	},
	fightingfiend: {
		name: "Fighting Fiend",
		desc: "This Pokemon has Vital Spirit and Multiscale's effects, and its moves cannot miss.",
		shortDesc: "Vital Spirit + Multiscale; moves cannot miss.",
	},
	emperorspride: {
		name: "Emperor's Pride",
		desc: "This Pokemon has Defiant and Swift Swim's effects. Its Flying-type moves receive STAB.",
		shortDesc: "Defiant + Swift Swim; Flying moves get STAB.",
	},
	terragift: {
		name: "Terra Gift",
		desc: "This Pokemon has Hospitality, Unaware, and Solid Rock's effects.",
		shortDesc: "Hospitality + Unaware + Solid Rock.",
	},
	burningrage: {
		name: "Burning Rage",
		desc: "This Pokemon has Brute Force, Iron Fist, and Turboblaze's effects.",
		shortDesc: "Brute Force + Iron Fist + Turboblaze.",
	},
	neurotoxin: {
		name: "Neurotoxin",
		desc: "This Pokemon has Strong Jaw, Shed Skin, Hydra Bond, and Regenerator's effects.",
		shortDesc: "Strong Jaw + Shed Skin + Hydra Bond + Regenerator.",
	},
	tremor: {
		name: "Tremor",
		desc: "On switch-in, this Pokemon summons Sandstorm. This Pokemon is immune to Ground-type moves. Sound-based moves used by this Pokemon become physical, use Attack, have 1.5x power, and ignore sound-based Ability immunities. Sound-based moves used by this Pokemon's allies have 1.5x power and use the user's higher offensive stat. This Pokemon's side is immune to its own damaging sound-based moves.",
		shortDesc: "Sand Stream + Levitate; side sound moves 1.5x; user sound moves physical/use Atk.",
	},
	resonanceforce: {
		name: "Resonance Force",
		desc: "Sound-based moves used by this Pokemon's side deal 1.5x damage. This Pokemon's side is immune to its own damaging sound-based moves. Sound-based moves used by this Pokemon use its higher offensive stat.",
		shortDesc: "Side sound moves 1.5x; allies avoid own sound damage; sound uses higher offense.",
	},
	verdantdrake: {
		name: "Verdant Drake",
		desc: "This Pokemon has Proficient, Regenerator, and Dual Wield's effects. Its STAB moves have 1.2x power, it restores 1/3 max HP when it switches out, and moves boosted by Sharpness or Mega Launcher, plus arrow moves, hit twice for reduced damage.",
		shortDesc: "Proficient + Regenerator + Dual Wield.",
	},
	solarbloom: {
		name: "Solar Bloom",
		desc: "If sun is active, this Pokemon transforms into Cherrim-Sunshine and restores 1/8 of its maximum HP. While sun is active, its Speed is doubled.",
		shortDesc: "In sun: becomes Sunshine, heals 1/8, and has doubled Speed.",
	},
	wrathshield: {
		name: "Wrath Shield",
		desc: "This Pokemon has Bulletproof, Dauntless Shield, and Self Repair's effects. It gains 1 Defense stage on entry, plus 1 Special Defense stage in Cold Eclipse, New World, Starlight Arena, or Fairy Tale. It is immune to bullet and pulse moves and restores HP through Self Repair.",
		shortDesc: "Bulletproof + Dauntless Shield + Self Repair; boosted fields also give +1 SpD.",
	},
	shadowcurrent: {
		name: "Shadow Current",
		desc: "This Pokemon has Protean, Technician, and Sworn Duty. Before using a move, it becomes that move's type.",
		shortDesc: "Protean + Technician + Sworn Duty.",
	},
	astralwitchcraft: {
		name: "Astral Witchcraft",
		desc: "This Pokemon has Sworn Duty, Levitate, and Magic Guard's effects. In Fairy Tale or New World, its Special Attack and Special Defense rise by 1 on entry.",
		shortDesc: "Sworn Duty + Levitate + Magic Guard; Fairy Tale/New World: +1 SpA/SpD.",
	},
	blazingtempo: {
		name: "Blazing Tempo",
		desc: "This Pokemon has Speed Boost, Striker, and Proficient's effects.",
		shortDesc: "Speed Boost + Striker + Proficient.",
	},
	ragingcurrent: {
		name: "Raging Current",
		desc: "This Pokemon has Swift Swim, Damp, Water Veil, Dry Skin, and Stamina's effects.",
		shortDesc: "Swift Swim + Damp + Water Veil + Dry Skin + Stamina.",
	},
	toxicbloom: {
		name: "Toxic Bloom",
		desc: "This Pokemon has Pollen Bloom and Self Sufficient. Its Poison-type attacks restore 1/4 of the damage they deal.",
		shortDesc: "Pollen Bloom + Self Sufficient; Poison attacks heal 1/4 damage.",
	},
	siegelauncher: {
		name: "Siege Launcher",
		desc: "This Pokemon has Water Barrage, Mega Launcher, Self Sufficient, and Stalwart's effects. Moves boosted by Mega Launcher are used twice through Dual Wield; the second hit deals 20% of the move's unboosted power.",
		shortDesc: "Water Barrage + Mega Launcher + Self Sufficient + Stalwart; boosted moves add 20% hit.",
	},
	calderacore: {
		name: "Caldera Core",
		desc: "This Pokemon has Magma Armor, Sheer Force, and Drought's effects.",
		shortDesc: "Magma Armor + Sheer Force + Drought.",
	},
	soultag: {
		name: "Soul Tag",
		desc: "This Pokemon has Soul Fire and Shadow Tag's effects.",
		shortDesc: "Soul Fire + Shadow Tag.",
	},
	speedboost: {
		name: "Speed Boost",
		desc: "This Pokemon's Speed is raised by 1 stage at the end of each full turn it has been on the field.",
		shortDesc: "This Pokemon's Speed is raised 1 stage at the end of each full turn on the field.",
	},
	spicyspray: {
		name: "Spicy Spray",
		desc: "When this Pokemon is hit by an attack, the attacker becomes burned. This Pokemon has Self Sufficient's effect.",
		shortDesc: "Contact burns the attacker; Self Sufficient.",
	},
	stakeout: {
		name: "Stakeout",
		shortDesc: "This Pokemon's offensive stat is doubled against a target that switched in this turn.",
	},
	stall: {
		name: "Stall",
		shortDesc: "This Pokemon moves last among Pokemon using the same or greater priority moves.",
	},
	stalwart: {
		name: "Stalwart",
		desc: "This Pokemon's moves cannot be redirected to a different target by any effect.",
		shortDesc: "This Pokemon's moves cannot be redirected to a different target.",
	},
	stamina: {
		name: "Stamina",
		shortDesc: "Enemy hits raise Def and heal 1/16.",
	},
	stancechange: {
		name: "Stance Change",
		desc: "This Pokemon has Dual Wield. Aegislash changes to Blade Forme before attacking and Shield Forme before King's Shield. Shield Forme takes 20% less damage; consecutive Free-for-All hits deal 30% less damage. Blade Forme deals 1.2x damage.",
		shortDesc: "Dual Wield; Shield: 20% less damage; Blade: 1.2x damage.",
		gen6: {
			desc: "If this Pokemon is an Aegislash, it changes to Blade Forme before attempting to use an attacking move, and changes to Shield Forme before attempting to use King's Shield.",
		},

		transform: "Changed to Blade Forme!",
		transformEnd: "Changed to Shield Forme!",
	},
	static: {
		name: "Static",
		shortDesc: "30% chance a Pokemon making contact with this Pokemon will be paralyzed.",
		gen4: {
			desc: "30% chance a Pokemon making contact with this Pokemon will be paralyzed. This effect does not happen if this Pokemon did not lose HP from the attack.",
		},
		gen3: {
			desc: "1/3 chance a Pokemon making contact with this Pokemon will be paralyzed. This effect does not happen if this Pokemon did not lose HP from the attack.",
			shortDesc: "1/3 chance a Pokemon making contact with this Pokemon will be paralyzed.",
		},
	},
	steadfast: {
		name: "Steadfast",
		shortDesc: "If this Pokemon flinches, its Speed is raised by 1 stage.",
	},
	steamengine: {
		name: "Steam Engine",
		desc: "This Pokemon has Magma Armor. Fire- or Water-type hits raise its Speed by 6 stages; heat fields activate it on entry, and Water Surface, Underwater, or Volcanic Terrain raises Speed each turn.",
		shortDesc: "Magma Armor; Fire/Water hits raise Speed by 6; certain fields also activate it.",
	},
	steelworker: {
		name: "Steelworker",
		desc: "This Pokemon gains Steel STAB. Its offensive stat is multiplied by 1.5 while using a Steel-type attack, or 2x in Factory Terrain. It gains Steel-type resistances and Poison immunity without gaining Steel-type weaknesses.",
		shortDesc: "Steel STAB; Steel attacks 1.5x, or 2x in Factory; gains Steel defensive traits.",
	},
	steelyspirit: {
		name: "Steely Spirit",
		desc: "This Pokemon and its allies' Steel-type moves have their power multiplied by 1.5. This affects Doom Desire even if the user is not on the field.",
		shortDesc: "This Pokemon and its allies' Steel-type moves have their power multiplied by 1.5.",
	},
	stench: {
		name: "Stench",
		desc: "This Pokemon's attacks without a chance to make the target flinch gain a 10% chance to make the target flinch.",
		shortDesc: "This Pokemon's attacks without a chance to flinch gain a 10% chance to flinch.",
		gen4: {
			desc: "No competitive use.",
			shortDesc: "No competitive use.",
		},
	},
	stickyhold: {
		name: "Sticky Hold",
		desc: "This Pokemon cannot lose its held item due to another Pokemon's Ability or attack, unless the attack knocks out this Pokemon. A Sticky Barb will be transferred to other Pokemon regardless of this Ability.",
		shortDesc: "This Pokemon cannot lose its held item due to another Pokemon's Ability or attack.",
		gen4: {
			desc: "This Pokemon cannot lose its held item due to another Pokemon's attack, even if the attack knocks out this Pokemon. A Sticky Barb will be transferred to other Pokemon regardless of this Ability.",
		},

		block: "  [POKEMON]'s item cannot be removed!",
	},
	stormdrain: {
		name: "Storm Drain",
		desc: "This Pokemon is immune to Water-type moves and raises its Attack and Special Attack by 1 stage when hit by a Water-type move. If this Pokemon is not the target of a single-target Water-type move used by another Pokemon, this Pokemon redirects that move to itself if it is within the range of that move. If multiple Pokemon could redirect with this Ability, it goes to the one with the highest Speed, or in the case of a tie to the one that has had this Ability active longer.",
		shortDesc: "This Pokemon draws Water moves to itself to raise Atk and Sp. Atk by 1; Water immunity.",
		gen4: {
			desc: "If this Pokemon is not the target of a single-target Water-type move used by another Pokemon, this Pokemon redirects that move to itself.",
			shortDesc: "This Pokemon draws single-target Water moves to itself.",
		},

		activate: "#lightningrod",
	},
	protectiveward: {
		name: "Protective Ward",
		desc: "This Pokemon is immune to Hail and has Liquid Voice and Storm Drain's effects. It can use Arenite Wall and Aurora Veil regardless of weather or field. In Hail and Ice fields, it is treated as an Ice-type Pokemon.",
		shortDesc: "Liquid Voice + Storm Drain; ignores Arenite Wall/Aurora Veil conditions; Hail immune; Ice in Ice fields.",
	},
	amethystglow: {
		name: "Amethyst Glow",
		desc: "This Pokemon's moves cannot miss and it has Ice Body and Refrigerate's effects. It is treated as an Ice-type Pokemon in Hail and Ice fields.",
		shortDesc: "Moves cannot miss; Ice Body + Refrigerate; Ice in Ice fields.",
	},
	strongjaw: {
		name: "Strong Jaw",
		desc: "This Pokemon's bite-based attacks have their power multiplied by 1.5.",
		shortDesc: "This Pokemon's bite-based attacks have 1.5x power. Bug Bite is not boosted.",
	},
	sturdy: {
		name: "Sturdy",
		desc: "If this Pokemon is at full HP, it survives one hit with at least 1 HP. OHKO moves fail when used against this Pokemon.",
		shortDesc: "If this Pokemon is at full HP, it survives one hit with at least 1 HP. Immune to OHKO.",
		gen4: {
			desc: "OHKO moves fail when used against this Pokemon.",
			shortDesc: "OHKO moves fail when used against this Pokemon.",
		},

		activate: "  [POKEMON] endured the hit!",
	},
	suctioncups: {
		name: "Suction Cups",
		shortDesc: "This Pokemon cannot be forced to switch out by another Pokemon's attack or item.",

		block: "  [POKEMON] is anchored in place with its suction cups!",
	},
	superluck: {
		name: "Super Luck",
		shortDesc: "This Pokemon's critical hit ratio is raised by 1 stage.",
	},
	supersweetsyrup: {
		name: "Supersweet Syrup",
		shortDesc: "On switch-in, this Pokemon lowers the evasiveness of opponents 1 stage. Once per battle.",

		start: "  A supersweet aroma is wafting from the syrup covering [POKEMON]!",
	},
	supremeoverlord: {
		name: "Supreme Overlord",
		desc: "This Pokemon has Self Sufficient. Each fainted ally gives its moves 1.1x damage; in Free-for-All, allies count twice. At 1+, it has Clear Body; 2+, Inner Focus; 3+, Filter and Second Wind; 4+, Infiltrator; 5+, Magic Guard and +1 Attack/Sp. Atk.",
		shortDesc: "Self Sufficient; fallen allies boost damage; thresholds grant defenses and stat boosts.",

		activate: "  [POKEMON] gained strength from the fallen!",
	},
	blackfang: {
		name: "Black Fang",
		desc: "This Pokemon has Strong Jaw, Insomnia, and Moxie's effects.",
		shortDesc: "Strong Jaw + Insomnia + Moxie.",
	},
	surgesurfer: {
		name: "Surge Surfer",
		shortDesc: "If Electric Terrain is active, this Pokemon's Speed is doubled.",
	},
	swarm: {
		name: "Swarm",
		desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its offensive stat is multiplied by 1.5 while using a Bug-type attack.",
		shortDesc: "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Bug attacks.",
		gen4: {
			desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Bug-type attacks have their power multiplied by 1.5.",
			shortDesc: "At 1/3 or less of its max HP, this Pokemon's Bug-type attacks have 1.5x power.",
		},
	},
	sweetveil: {
		name: "Sweet Veil",
		desc: "This Pokemon and its allies cannot fall asleep, but those already asleep do not wake up immediately. This Pokemon and its allies cannot use Rest successfully or become affected by Yawn, and those previously affected will not fall asleep.",
		shortDesc: "This Pokemon and its allies cannot fall asleep; those already asleep do not wake up.",

		block: "  [POKEMON] can't fall asleep due to a veil of sweetness!",
	},
	swiftswim: {
		name: "Swift Swim",
		desc: "If Rain Dance is active, this Pokemon's Speed is doubled. This effect is prevented if this Pokemon is holding a Utility Umbrella.",
		shortDesc: "If Rain Dance is active, this Pokemon's Speed is doubled.",
		gen7: {
			desc: "If Rain Dance is active, this Pokemon's Speed is doubled.",
		},
	},
	swordofruin: {
		name: "Sword of Ruin",
		shortDesc: "Active Pokemon without this Ability have their Defense multiplied by 0.75.",

		start: "  [POKEMON]'s Sword of Ruin weakened the Defense of all surrounding Pokémon!",
	},
	symbiosis: {
		name: "Symbiosis",
		desc: "If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off, or if the ally used an Eject Button or Eject Pack.",
		shortDesc: "If an ally uses its item, this Pokemon gives its item to that ally immediately.",
		gen7: {
			desc: "If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off, or if the ally used an Eject Button.",
		},
		gen6: {
			desc: "If an ally uses its item, this Pokemon gives its item to that ally immediately. Does not activate if the ally's item was stolen or knocked off.",
		},

		activate: "  [POKEMON] shared its [ITEM] with [TARGET]!",
	},
	synchronize: {
		name: "Synchronize",
		desc: "If another Pokemon burns, paralyzes, poisons, or badly poisons this Pokemon, that Pokemon receives the same non-volatile status condition.",
		shortDesc: "If another Pokemon burns/poisons/paralyzes this Pokemon, it also gets that status.",
		gen4: {
			desc: "If another Pokemon burns, paralyzes, or poisons this Pokemon, that Pokemon receives the same non-volatile status condition. If another Pokemon badly poisons this Pokemon, that Pokemon becomes poisoned.",
		},
	},
	tabletsofruin: {
		name: "Tablets of Ruin",
		shortDesc: "Active Pokemon without this Ability have their Attack multiplied by 0.75.",

		start: "  [POKEMON]'s Tablets of Ruin weakened the Attack of all surrounding Pokémon!",
	},
	tangledfeet: {
		name: "Tangled Feet",
		shortDesc: "This Pokemon's evasiveness is doubled as long as it is confused.",
	},
	tanglinghair: {
		name: "Tangling Hair",
		shortDesc: "Pokemon making contact with this Pokemon have their Speed lowered by 1 stage.",
	},
	technician: {
		name: "Technician",
		desc: "This Pokemon's moves of 60 power or less have their power multiplied by 1.5, including Struggle. This effect comes after a move's effect changes its own power.",
		shortDesc: "This Pokemon's moves of 60 power or less have 1.5x power, including Struggle.",
		gen4: {
			desc: "This Pokemon's moves of 60 power or less have their power multiplied by 1.5, except Struggle. This effect comes after a move's effect changes its own power, as well as the effects of Charge and Helping Hand.",
			shortDesc: "This Pokemon's moves of 60 power or less have 1.5x power, except Struggle.",
		},
	},
	telepathy: {
		name: "Telepathy",
		shortDesc: "This Pokemon does not take damage from attacks made by its allies.",

		block: "  [POKEMON] can't be hit by attacks from its ally Pok\u00E9mon!",
	},
	teraformzero: {
		name: "Teraform Zero",
		shortDesc: "Terapagos: Terastallizing ends the effects of weather and terrain. Once per battle.",
	},
	terashell: {
		name: "Tera Shell",
		desc: "If this Pokemon is a Terapagos at full HP, the effectiveness of attacks against it is changed to 0.5 unless this Pokemon is immune to the move. Multi-hit moves retain the same effectiveness throughout the attack.",
		shortDesc: "Terapagos: If full HP, attacks taken have 0.5x effectiveness unless naturally immune.",

		activate: "  [POKEMON] made its shell gleam! It's distorting type matchups!",
	},
	terashift: {
		name: "Tera Shift",
		shortDesc: "If this Pokemon is a Terapagos, it transforms into its Terastal Form on entry.",

		transform: "[POKEMON] transformed!",
	},
	teravolt: {
		name: "Teravolt",
		desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Armor Tail, Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Earth Eater, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Good as Gold, Grass Pelt, Guard Dog, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Illuminate, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mind's Eye, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Purifying Salt, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Tera Shell, Thermal Exchange, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, Well-Baked Body, White Smoke, Wind Rider, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		shortDesc: "This Pokemon's moves and their effects ignore the Abilities of other Pokemon.",
		gen8: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen7: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen6: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen5: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen4: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Clear Body, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Heatproof, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Lightning Rod, Limber, Magma Armor, Marvel Scale, Motor Drive, Oblivious, Own Tempo, Sand Veil, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, and Wonder Guard. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move. The Attack modifier from an ally's Flower Gift Ability is not negated.",
		},

		start: "  [POKEMON] is radiating a bursting aura!",
	},
	thermalexchange: {
		name: "Thermal Exchange",
		desc: "This Pokemon's Attack is raised 1 stage after it is damaged by a Fire-type move. This Pokemon cannot be burned. Gaining this Ability while burned cures it.",
		shortDesc: "This Pokemon's Attack is raised by 1 when damaged by Fire moves; can't be burned.",
	},
	thickfat: {
		name: "Thick Fat",
		desc: "If a Pokemon uses a Fire- or Ice-type attack against this Pokemon, that Pokemon's offensive stat is halved when calculating the damage to this Pokemon. This Pokemon is immune to hail damage.",
		shortDesc: "Halves Fire/Ice damage stats and is immune to hail damage.",
		gen4: {
			desc: "The power of Fire- and Ice-type attacks against this Pokemon is halved.",
			shortDesc: "The power of Fire- and Ice-type attacks against this Pokemon is halved.",
		},
		gen3: {
			desc: "If a Pokemon uses a Fire- or Ice-type attack against this Pokemon, that Pokemon's Special Attack is halved when calculating the damage to this Pokemon.",
			shortDesc: "Fire-/Ice-type moves against this Pokemon deal damage with a halved Sp. Atk stat.",
		},
	},
	tintedlens: {
		name: "Tinted Lens",
		shortDesc: "This Pokemon's attacks that are not very effective on a target deal double damage.",
	},
	torrent: {
		name: "Torrent",
		desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its offensive stat is multiplied by 1.5 while using a Water-type attack.",
		shortDesc: "At 1/3 or less of its max HP, this Pokemon's offensive stat is 1.5x with Water attacks.",
		gen4: {
			desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its Water-type attacks have their power multiplied by 1.5.",
			shortDesc: "At 1/3 or less of its max HP, this Pokemon's Water-type attacks have 1.5x power.",
		},
	},
	toughclaws: {
		name: "Tough Claws",
		shortDesc: "This Pokemon's contact moves have their power multiplied by 1.3.",
	},
	toxicboost: {
		name: "Toxic Boost",
		desc: "While this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5.",
		shortDesc: "While this Pokemon is poisoned, its physical attacks have 1.5x power.",
	},
	toxicchain: {
		name: "Toxic Chain",
		desc: "This Pokemon's attacks have a 30% chance of badly poisoning. This effect comes before a move's inherent secondary effect chance.",
		shortDesc: "This Pokemon's attacks have a 30% chance of badly poisoning.",
	},
	toxicdebris: {
		name: "Toxic Debris",
		shortDesc: "If this Pokemon is hit by a physical attack, Toxic Spikes are set on the opposing side.",
	},
	trace: {
		name: "Trace",
		desc: "On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Flower Gift, Forecast, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Power of Alchemy, Protosynthesis, Quark Drive, Receiver, RKS System, Schooling, Shields Down, Stance Change, Teraform Zero, Tera Shell, Tera Shift, Trace, Zen Mode, and Zero to Hero. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		shortDesc: "On switch-in, or when it can, this Pokemon copies a random adjacent foe's Ability.",
		gen8: {
			desc: "On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are As One, Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Gulp Missile, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		},
		gen7: {
			desc: "On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are Battle Bond, Comatose, Disguise, Flower Gift, Forecast, Illusion, Imposter, Multitype, Power Construct, Power of Alchemy, Receiver, RKS System, Schooling, Shields Down, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		},
		gen6: {
			desc: "On switch-in, this Pokemon copies a random adjacent opposing Pokemon's Ability. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Stance Change, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		},
		gen5: {
			desc: "On switch-in, this Pokemon copies a random adjacent opposing Pokemon's Ability. Abilities that cannot be copied are Flower Gift, Forecast, Illusion, Imposter, Multitype, Trace, and Zen Mode. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		},
		gen4: {
			desc: "On switch-in, this Pokemon copies a random opposing Pokemon's Ability. Abilities that cannot be copied are Forecast, Multitype, and Trace. If no opposing Pokemon has an Ability that can be copied, this Ability will activate as soon as one does.",
		},
		gen3: {
			desc: "On switch-in, this Pokemon copies a random opposing Pokemon's Ability.",
		},

		changeAbility: "  [POKEMON] traced [SOURCE]'s [ABILITY]!",
	},
	transistor: {
		name: "Transistor",
		shortDesc: "This Pokemon's offensive stat is multiplied by 1.3 while using an Electric-type attack.",
		gen8: {
			shortDesc: "This Pokemon's offensive stat is multiplied by 1.5 while using an Electric-type attack.",
		},
	},
	railguncircuit: {
		name: "Railgun Circuit",
		desc: "This Pokemon has Transistor's effects. Moves used by this Pokemon never miss. Moves used against this Pokemon do not gain this accuracy effect.",
		shortDesc: "Transistor effects; this Pokemon's moves never miss.",
	},
	triage: {
		name: "Triage",
		shortDesc: "Healing and status-cleansing moves have their priority increased by 3.",
	},
	tidaljaw: {
		name: "Tidal Jaw",
		desc: "This Pokemon has Strong Jaw, Swift Swim, and Filter's effects.",
		shortDesc: "Strong Jaw + Swift Swim + Filter.",
	},
	islandcurrent: {
		name: "Island Current",
		desc: "This Pokemon has Swift Swim and Wind Rider's effects.",
		shortDesc: "Swift Swim + Wind Rider.",
	},
	oceanicwings: {
		name: "Oceanic Wings",
		desc: "This Pokemon has Water Absorb, Hydration, and Friend Guard's effects.",
		shortDesc: "Water Absorb + Hydration + Friend Guard.",
	},
	ruinjaw: {
		name: "Ruin Jaw",
		desc: "This Pokemon has Strong Jaw and Earth Eater's effects.",
		shortDesc: "Strong Jaw + Earth Eater.",
	},
	truant: {
		name: "Truant",
		shortDesc: "This Pokemon skips every other turn instead of using a move.",
		gen3: {
			desc: "This Pokemon skips every other turn instead of using a move. If this Pokemon replaces a Pokemon that fainted during end-of-turn effects, its first turn will be skipped.",
		},

		cant: "[POKEMON] is loafing around!",
	},
	turboblaze: {
		name: "Turboblaze",
		desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Armor Tail, Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Earth Eater, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Good as Gold, Grass Pelt, Guard Dog, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Illuminate, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mind's Eye, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Purifying Salt, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Tera Shell, Thermal Exchange, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, Well-Baked Body, White Smoke, Wind Rider, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		shortDesc: "This Pokemon's moves and their effects ignore the Abilities of other Pokemon.",
		gen8: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dazzling, Disguise, Dry Skin, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Ice Face, Ice Scales, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Mirror Armor, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Pastel Veil, Punk Rock, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen7: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dazzling, Disguise, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Fluffy, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Queenly Majesty, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Bubble, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen6: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Aroma Veil, Aura Break, Battle Armor, Big Pecks, Bulletproof, Clear Body, Contrary, Damp, Dark Aura, Dry Skin, Fairy Aura, Filter, Flash Fire, Flower Gift, Flower Veil, Friend Guard, Fur Coat, Grass Pelt, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Overcoat, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Sweet Veil, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen5: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Big Pecks, Clear Body, Contrary, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Friend Guard, Heatproof, Heavy Metal, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Light Metal, Lightning Rod, Limber, Magic Bounce, Magma Armor, Marvel Scale, Motor Drive, Multiscale, Oblivious, Own Tempo, Sand Veil, Sap Sipper, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Telepathy, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, Wonder Guard, and Wonder Skin. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move, and whether or not their Ability is beneficial to this Pokemon.",
		},
		gen4: {
			desc: "This Pokemon's moves and their effects ignore certain Abilities of other Pokemon. The Abilities that can be negated are Battle Armor, Clear Body, Damp, Dry Skin, Filter, Flash Fire, Flower Gift, Heatproof, Hyper Cutter, Immunity, Inner Focus, Insomnia, Keen Eye, Leaf Guard, Levitate, Lightning Rod, Limber, Magma Armor, Marvel Scale, Motor Drive, Oblivious, Own Tempo, Sand Veil, Shell Armor, Shield Dust, Simple, Snow Cloak, Solid Rock, Soundproof, Sticky Hold, Storm Drain, Sturdy, Suction Cups, Tangled Feet, Thick Fat, Unaware, Vital Spirit, Volt Absorb, Water Absorb, Water Veil, White Smoke, and Wonder Guard. This affects every other Pokemon on the field, whether or not it is a target of this Pokemon's move. The Attack modifier from an ally's Flower Gift Ability is not negated.",
		},

		start: "  [POKEMON] is radiating a blazing aura!",
	},
	unaware: {
		name: "Unaware",
		desc: "This Pokemon ignores other Pokemon's stat stages when taking or doing damage, and removes foe Illusions on switch-in.",
		shortDesc: "Ignores foe stat stages; removes foe Illusions on entry.",
	},
	unburden: {
		name: "Unburden",
		desc: "If this Pokemon loses its held item for any reason, its Speed is doubled as long as it remains active, has this Ability, and is not holding an item.",
		shortDesc: "Speed is doubled on held item loss; boost is lost if it switches, gets new item/Ability.",
	},
	unnerve: {
		name: "Unnerve",
		desc: "While this Pokemon is active, it prevents opposing Pokemon from using their Berries. This Ability activates before hazards and other Abilities take effect.",
		shortDesc: "While this Pokemon is active, it prevents opposing Pokemon from using their Berries.",

		start: "  [TEAM] is too nervous to eat Berries!",
	},
	unseenfist: {
		name: "Unseen Fist",
		desc: "This Pokemon's contact moves ignore the target's protection, except Max Guard, and its punching moves have Iron Fist's power boost.",
		shortDesc: "Contact moves ignore protection; punching moves have Iron Fist's boost.",
	},
	phantomfist: {
		name: "Phantom Fist",
		desc: "This Pokemon's moves cannot miss and it has Filter, Self Repair, and Unseen Fist's effects.",
		shortDesc: "Moves cannot miss + Filter + Self Repair + Unseen Fist.",
	},
	vesselofruin: {
		name: "Vessel of Ruin",
		shortDesc: "Active Pokemon without this Ability have their Special Attack multiplied by 0.75.",

		start: "  [POKEMON]'s Vessel of Ruin weakened the Sp. Atk of all surrounding Pokémon!",
	},
	victorystar: {
		name: "Victory Star",
		shortDesc: "This Pokemon and its allies' moves have their accuracy multiplied by 1.1.",
	},
	vitalspirit: {
		name: "Vital Spirit",
		desc: "This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it. Its Fighting-type moves use 1.3x Attack or Special Attack.",
		shortDesc: "Cannot sleep; Fighting moves use 1.3x Atk/SpA.",
	},
	voltabsorb: {
		name: "Volt Absorb",
		desc: "This Pokemon is immune to Electric-type moves and restores 1/4 of its maximum HP, rounded down, when hit by an Electric-type move.",
		shortDesc: "This Pokemon heals 1/4 of its max HP when hit by Electric moves; Electric immunity.",
		gen3: {
			desc: "This Pokemon is immune to damaging Electric-type moves and restores 1/4 of its maximum HP, rounded down, when hit by one.",
			shortDesc: "This Pokemon heals 1/4 its max HP when hit by a damaging Electric move; immunity.",
		},
	},
	wanderingspirit: {
		name: "Wandering Spirit",
		desc: "Pokemon making contact with this Pokemon have their Ability swapped with this one. Does not affect Pokemon with the Abilities As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Hunger Switch, Ice Face, Illusion, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Protosynthesis, Quark Drive, RKS System, Schooling, Shields Down, Stance Change, Tera Shell, Tera Shift, Teraform Zero, Wonder Guard, Zen Mode, or Zero to Hero.",
		shortDesc: "Pokemon making contact with this Pokemon have their Ability swapped with this one.",
		gen8: {
			desc: "Pokemon making contact with this Pokemon have their Ability swapped with this one. Does not affect Pokemon with the Abilities As One, Battle Bond, Comatose, Disguise, Gulp Missile, Hunger Switch, Ice Face, Illusion, Multitype, Neutralizing Gas, Power Construct, RKS System, Schooling, Shields Down, Stance Change, Wonder Guard, or Zen Mode.",
		},

		activate: "#skillswap",
	},
	waterabsorb: {
		name: "Water Absorb",
		desc: "This Pokemon is immune to Water-type moves and restores 1/4 of its maximum HP, rounded down, when hit by a Water-type move.",
		shortDesc: "This Pokemon heals 1/4 of its max HP when hit by Water moves; Water immunity.",
	},
	waterbubble: {
		name: "Water Bubble",
		desc: "This Pokemon gains Water STAB, and its offensive stat is doubled while using Water attacks. Fire attacks against it use half the attacker's offensive stat. It also has Water Veil's effects.",
		shortDesc: "Water STAB/offense 2x; Fire offense 0.5x; Water Veil.",
	},
	watercompaction: {
		name: "Water Compaction",
		desc: "Damage from Water-type attacks is halved. After this Pokemon is damaged by a Water-type move, its Defense rises by 2 stages.",
		shortDesc: "Halves Water damage; taking Water damage raises Defense by 2.",
	},
	waterveil: {
		name: "Water Veil",
		desc: "This Pokemon cannot be burned and is immune to Hail and Sandstorm damage. Gaining this Ability while burned cures it. On switch-in, it gains Aqua Ring.",
		shortDesc: "Cannot be burned; immune to Hail/Sandstorm; gains Aqua Ring.",
	},
	weakarmor: {
		name: "Weak Armor",
		desc: "If a physical attack hits this Pokemon, its Defense is lowered by 1 stage and its Speed is raised by 2 stages.",
		shortDesc: "If a physical attack hits this Pokemon, Defense is lowered by 1, Speed is raised by 2.",
		gen6: {
			desc: "If a physical attack hits this Pokemon, its Defense is lowered by 1 stage and its Speed is raised by 1 stage.",
			shortDesc: "If a physical attack hits this Pokemon, Defense is lowered by 1, Speed is raised by 1.",
		},
	},
	wellbakedbody: {
		name: "Well-Baked Body",
		desc: "This Pokemon is immune to Fire-type moves and raises its Defense by 2 stages when hit by a Fire-type move.",
		shortDesc: "This Pokemon's Defense is raised 2 stages if hit by a Fire move; Fire immunity.",
	},
	whitesmoke: {
		name: "White Smoke",
		shortDesc: "Prevents other Pokemon from lowering this Pokemon's stat stages.",
	},
	wimpout: {
		name: "Wimp Out",
		desc: "When this Pokemon has more than 1/2 its maximum HP and takes damage bringing it to 1/2 or less of its maximum HP, it immediately switches out to a chosen ally. This effect applies after all hits from a multi-hit move. This effect is prevented if the move had a secondary effect removed by the Sheer Force Ability. This effect applies to both direct and indirect damage, except Curse and Substitute on use, Belly Drum, Pain Split, and confusion damage.",
		shortDesc: "This Pokemon switches out when it reaches 1/2 or less of its maximum HP.",
	},
	windpower: {
		name: "Wind Power",
		desc: "This Pokemon is immune to wind moves and raises its Special Attack by 1 stage when hit by a wind move, when Tailwind begins on this Pokemon's side, or when it switches in while Tailwind is active.",
		shortDesc: "Wind move immunity; +1 Sp. Atk from wind moves or allied Tailwind.",
	},
	windrider: {
		name: "Wind Rider",
		desc: "This Pokemon is immune to wind moves and raises its Attack by 1 stage when hit by a wind move or when Tailwind begins on this Pokemon's side.",
		shortDesc: "Attack raised by 1 if hit by a wind move or Tailwind begins. Wind move immunity.",
	},
	wonderguard: {
		name: "Wonder Guard",
		shortDesc: "This Pokemon can only be damaged by supereffective moves and indirect damage.",
		gen4: {
			shortDesc: "This Pokemon is only damaged by Fire Fang, supereffective moves, indirect damage.",
		},
		gen3: {
			shortDesc: "This Pokemon is only damaged by supereffective moves and indirect damage.",
		},
	},
	wonderskin: {
		name: "Wonder Skin",
		desc: "Non-damaging moves that check accuracy have their accuracy changed to 50% when used against this Pokemon. This effect comes before other effects that modify accuracy.",
		shortDesc: "Status moves with accuracy checks are 50% accurate when used on this Pokemon.",
	},
	zenmode: {
		name: "Zen Mode",
		desc: "If this Pokemon is a Darmanitan or Galarian Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. Standard Darmanitan is also Zen Mode in Ashen Beach or Psychic Terrain. Galarian Darmanitan is also Zen Mode in Icy Terrain, Snowy Mountain, or Cold Eclipse. If Darmanitan's HP is above 1/2 of its maximum HP and the matching field is not active, it changes back to Standard Mode.",
		shortDesc: "Darmanitan goes Zen at <=1/2 HP; fields force matching Zen formes.",
		gen7: {
			desc: "If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan's HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode.",
		},
		gen6: {
			desc: "If this Pokemon is a Darmanitan, it changes to Zen Mode if it has 1/2 or less of its maximum HP at the end of a turn. If Darmanitan's HP is above 1/2 of its maximum HP at the end of a turn, it changes back to Standard Mode. If Darmanitan loses this Ability while in Zen Mode, it reverts to Standard Mode immediately.",
		},

		transform: "Zen Mode triggered!",
		transformEnd: "Zen Mode ended!",
	},
	zerotohero: {
		name: "Zero to Hero",
		desc: "This Pokemon gains Fighting-type STAB. Palafin changes to Hero Form after switching out or entering in Water fields. In Doubles, Multi, or Free-for-All, it survives one KO at 1 HP. Hero Form grants Friend Guard and heals active allies on entry.",
		shortDesc: "Palafin becomes Hero; Fighting STAB; Hero: Friend Guard + entry healing.",

		activate: "  [POKEMON] underwent a heroic transformation!",
	},
	battlefervor: {
		name: "Battle Fervor",
		desc: "If this Pokemon moves before its target, its attacks deal 1.2x damage. Once per switch-in, if it would move after the attacker, damaging attacks against it deal 0.8x damage. The first time per battle it is hit by an opposing damaging move, its Attack and Special Attack rise by 1 stage. Foes cannot eat Berries while this Pokemon is active, and Seed items are prevented. Bewitched Woods, Haunted, and Holy Field disable these effects.",
		shortDesc: "Fast attacks 1.2x; slow-hit guard once; first hit +Atk/SpA; blocks Berries/Seeds.",
	},
	duskilate: {
		name: "Duskilate",
		desc: "This Pokemon's Normal-type moves become Dark-type moves and have their power multiplied by 1.3.",
		shortDesc: "Normal moves become Dark type and have 1.3x power.",
	},
	execution: {
		name: "Execution",
		desc: "This Pokemon has Duskilate. Its attacks deal double damage to targets at half HP or less, move KOs heal 1/8 max HP per target, Attack and Special Attack cannot fall below -1, and fields cannot lower its Speed.",
		shortDesc: "Duskilate; 2x vs low HP; KO heals 1/8.",
	},
	echofiend: {
		name: "Echo Fiend",
		desc: "This Pokemon is immune to sound moves, and this immunity cannot be suppressed. Its sound moves become Flying type and have 1.5x power. This Pokemon's side is immune to its own damaging sound-based moves.",
		shortDesc: "Unsuppressible sound immunity; sound -> Flying 1.5x; allies avoid own sound damage.",
	},
	solarhydra: {
		name: "Solar Hydra",
		desc: "This Pokemon has Hydra Bond, Grassy Surge, Solar Power, and Self Repair's effects.",
		shortDesc: "Hydra Bond + Grassy Surge + Solar Power + Self Repair.",
	},
	astralengine: {
		name: "Astral Engine",
		desc: "This Pokemon has Elevate, Filter, and Analytic's effects.",
		shortDesc: "Elevate + Filter + Analytic.",
	},
	elevate: {
		name: "Elevate",
		desc: "This Pokemon is immune to Ground-type attacks and Spikes, Toxic Spikes, Sticky Web, and the Arena Trap Ability. This Pokemon's highest stat is raised by 1 stage if it attacks and knocks out another Pokemon. Stat stage changes are not considered.",
		shortDesc: "Ground immunity plus Beast Boost-style boost after KO.",
	},
	evilsanta: {
		name: "Evil Santa",
		desc: "This Pokemon's Present becomes a 120 Base Power Dark-type move that hits all opposing Pokemon. Delibird gets STAB on Dark-type moves. Present always applies one random extra effect that succeeds: damage equal to 1/8 of the target's max HP, bad poison, 3-turn confusion, or Curse.",
		shortDesc: "Present becomes 120 BP Dark spread and applies a random successful extra effect.",
	},
	forestsurge: {
		name: "Forest Surge",
		desc: "On switch-in, this Pokemon sets Forest Terrain for 5 turns.",
		shortDesc: "On switch-in, this Pokemon sets Forest Terrain for 5 turns.",
	},
	ancientbloom: {
		name: "Ancient Bloom",
		desc: "This Pokemon has Effect Spore and Self Sufficient's effects. It keeps its field-based Defense, Special Defense, and power boosts.",
		shortDesc: "Effect Spore + Self Sufficient; keeps field boosts.",
	},
	fortressshell: {
		name: "Fortress Shell",
		desc: "This Pokemon has Self Sufficient, Shell Armor, Friend Guard, and Dual Wield's effects. In Water Surface, Underwater, Factory, and Short Circuit fields, Electric moves are redirected to it and raise its Attack and Special Attack. Fairy Tale, New World, Cold Eclipse, and Starlight Arena give it +1 Defense and +1 Special Defense once per active terrain.",
		shortDesc: "Self Sufficient + Shell Armor + Friend Guard + Dual Wield; keeps field bonuses.",
	},
	hydrabond: {
		name: "Hydra Bond",
		desc: "This Pokemon's damaging moves become multi-hit moves that hit three times. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power.",
		shortDesc: "Damaging moves hit 3x; hits 2/3 at 30%; FFA singles hit all foes at 1.3x.",
	},
	imperialmandate: {
		name: "Imperial Mandate",
		desc: "At 50% HP or higher, this Pokemon's damage dealt is doubled. Below 50% HP, its Speed is doubled instead. It also deals 1.2x damage and takes 0.8x damage from attacks. In Fairy Tale, Cold Eclipse, and New World, it raises Defense and Special Defense by 1 and deals 1.5x damage.",
		shortDesc: "High HP doubles damage; low HP doubles Speed; 1.2x dealt and 0.8x taken.",
	},
	phantombarrage: {
		name: "Phantom Barrage",
		desc: "This Pokemon has Infiltrator, Levitate, and Hydra Bond's effects. Dragon Darts and G-Max Spirit Volley use this Pokemon's higher offensive stat. In Free-for-All battles, Dragon Darts and G-Max Spirit Volley hit all opposing Pokemon twice.",
		shortDesc: "Infiltrator + Levitate + Hydra Bond; higher offensive stat for signature attacks.",
	},
	hydrabreaker: {
		name: "Hydra Breaker",
		desc: "This Pokemon has Hydra Bond and Mold Breaker's effects.",
		shortDesc: "Hydra Bond + Mold Breaker.",
	},
	hydratyrant: {
		name: "Hydra Tyrant",
		desc: "This Pokemon has Hydra Bond, Berserk, and Self Sufficient's effects.",
		shortDesc: "Hydra Bond + Berserk + Self Sufficient.",
	},
	burningcrown: {
		name: "Burning Crown",
		desc: "This Pokemon has Intimidate, White Smoke, Filter, and Self Sufficient. When a Pokemon faints, it raises the highest offensive stat of itself and its allies by 1. Its field bonuses remain active.",
		shortDesc: "Intimidate + White Smoke + Filter + Self Sufficient; faint raises the side's highest offenses.",
	},
	pollenbloom: {
		name: "Pollen Bloom",
		desc: "This Pokemon has Thick Fat and Proficient's effects. At the end of each turn, opposing non-Grass Pokemon take Grass-type damage equal to 1/16 max HP, scaled by effectiveness and blocked by Grass immunities; this Pokemon heals the damage dealt by that chip.",
		shortDesc: "Thick Fat + Proficient; Grass scaling chip heals the user for damage dealt.",
	},
	waterbarrage: {
		name: "Water Barrage",
		desc: "This Pokemon has Proficient and Dual Wield's effects. At the end of each turn, opposing Pokemon take cycling Water damage of 1/16, 2/16, then 3/16 max HP, scaled by effectiveness and blocked by Water immunities.",
		shortDesc: "Proficient + Dual Wield; cycling Water chip respects effectiveness and immunities.",
	},
	wildfirecore: {
		name: "Wildfire Core",
		desc: "This Pokemon has Dragonize, Magma Armor, and Proficient's effects. It is immune to Hail damage. At the end of each turn, opposing Pokemon take Fire-type damage equal to 1/16 max HP, doubled if burned or if this Pokemon used a Fire- or Dragon-type move this turn. This damage uses Fire-type effectiveness and is blocked by Fire immunities.",
		shortDesc: "Dragonize + Magma Armor + Proficient; Fire scaling chip respects immunities.",
	},
	memoryleak: {
		name: "Memory Leak",
		desc: "Positive stat boosts this Pokemon would receive are passed to an adjacent ally instead.",
		shortDesc: "Passes positive stat boosts to an adjacent ally.",
	},
	proficient: {
		name: "Proficient",
		desc: "This Pokemon's STAB moves have their power multiplied by 1.2.",
		shortDesc: "STAB moves have 1.2x power.",
	},
	defragment: {
		name: "Defragment",
		desc: "On switch-in, this Pokemon compares the opposing side's combined Attack and Special Attack. If Attack is higher or tied, its Defense rises; otherwise its Special Defense rises. This Pokemon's moves cannot miss.",
		shortDesc: "Entry defensive boost based on foes' offenses; moves cannot miss.",
	},
	temporalshift: {
		name: "Temporal Shift",
		desc: "This Pokemon's stats cannot be lowered by opposing Pokemon. On the turn after it uses a damaging move, it queues a 100 BP Future Sight matching its primary type against a random valid opposing target; multiple attacks can be queued and announce their strike turns.",
		shortDesc: "Stats cannot be lowered; after attacking, queues 100 BP Temporal Shift Future Sight.",
	},
	accumulation: {
		name: "Accumulation",
		desc: "This Pokemon has Thick Fat and is immune to sandstorm and hail damage. It can use Belch without eating a Berry and automatically gains one Stockpile each turn. After reaching 3 Stockpiles, it waits one full turn before randomly choosing Belch or Spit Up with equal odds, then can release every other turn. Its established Spit Up and Swallow combinations still apply.",
		shortDesc: "Thick Fat; auto-Stockpiles; at 3 waits one turn, then auto-releases every other turn.",
	},
	invigorate: {
		name: "Invigorate",
		desc: "Healing received by this Pokemon and its allies is multiplied by 1.2. At the end of each turn, this Pokemon has a 50% chance to cure each adjacent ally's status condition.",
		shortDesc: "User/allies receive 1.2x healing; 50% to cure ally status each turn.",
	},
	swornduty: {
		name: "Sworn Duty",
		desc: "On switch-in, this Pokemon heals its adjacent ally by 1/4 max HP.",
		shortDesc: "On entry, heals an adjacent ally by 1/4 max HP.",
	},
	inversion: {
		name: "Inversion",
		desc: "On switch-in, this Pokemon sets Inverse Field. Stat changes this Pokemon receives are inverted, except those from Z-Power effects.",
		shortDesc: "Sets Inverse Field and inverts its stat changes.",
	},
	armorize: {
		name: "Armorize",
		desc: "This Pokemon's Normal-type moves become Steel-type moves and have their power multiplied by 1.2.",
		shortDesc: "Normal moves become Steel type and have 1.2x power.",
	},
	argentdevotion: {
		name: "Argent Devotion",
		desc: "This Pokemon has Armorize and Sworn Duty's effects.",
		shortDesc: "Armorize + Sworn Duty.",
	},
	ironcognition: {
		name: "Iron Cognition",
		desc: "This Pokemon has Tough Claws and Prism Armor's effects.",
		shortDesc: "Tough Claws + Prism Armor.",
	},
	neutralization: {
		name: "Neutralization",
		desc: "Once per target per move, when this Pokemon directly hits an opposing Pokemon, the target's higher attacking stat is lowered by 2 stages and Speed is lowered by 1 stage. Spread hits do not trigger this effect. This does not affect other Neutralization users or Pokemon immune to stat drops. While active, field changes are neutralized; Trick Room, Magic Room, and Wonder Room are ended and cannot start; and Rainbow Field ends automatically. Ice Spinner and Steel Roller still remove terrain normally.",
		shortDesc: "Hits lower foe offense/Spe; blocks field changes and Trick/Magic/Wonder Room.",
	},
	aeviandream: {
		name: "Aevian Dream",
		desc: "This Pokemon has Bad Dreams, Shed Skin, and Tough Claws's effects. When it enters battle as Musharna, it transforms into Musharna-Rejuv.",
		shortDesc: "Bad Dreams + Shed Skin + Tough Claws; transforms Musharna into Musharna-Rejuv.",
	},
	powerdrill: {
		name: "Power Drill",
		desc: "This Pokemon's drill moves have 1.5x power.",
		shortDesc: "Drill moves have 1.5x power.",
	},
	predator: {
		name: "Predator",
		desc: "Stat changes this Pokemon receives are inverted, except those from Z-Power effects. If the target has not moved yet or just switched in, this Pokemon's attacks deal 1.3x damage. Attacks deal 2x damage to targets with Neutralization or Royal Decree.",
		shortDesc: "Has Contrary; boosts attacks into slower/new targets; 2x into authority abilities.",
	},
	royalarmament: {
		name: "Royal Armament",
		desc: "This Pokemon gains STAB on Steel-type moves and has Power Drill's effects.",
		shortDesc: "Steel STAB + Power Drill.",
	},
	relentlesshunt: {
		name: "Relentless Hunt",
		desc: "This Pokemon has Levitate. Its moves with 60 or less Base Power gain +1 priority. In Fairy Tale, Big Top, Dragon's Den, Mountain, Snowy Mountain, or Cold Eclipse, its damaging moves deal 2x damage. In Desert, Rocky, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena, or New World, its damaging moves deal 1.5x damage.",
		shortDesc: "Levitate; moves <=60 BP gain +1 priority; boosted fields give 1.5x or 2x damage.",
	},
	soulfire: {
		name: "Soul Fire",
		desc: "This Pokemon draws in Fire- and Ghost-type moves to itself and is immune to Fire-type moves, Ghost-type moves, Will-O-Wisp, and damaging weather conditions, raising Attack and Special Attack by 1 stage when hit by them. Its Fire- and Ghost-type moves bypass type immunities, cannot hit Normal-type Pokemon with Ghost-type attacks, and are resisted by Steel- and Dark-type Pokemon. Burns caused by this Pokemon's Fire- and Ghost-type moves or Will-O-Wisp bypass burn immunities, Misty Terrain, and Mist. Fire- and Ghost-type moves from this Ability deal 4x damage to opposing Soul Fire users.",
		shortDesc: "Draws in and absorbs Fire/Ghost; burns bypass immunities; attacks ignore most resists.",
	},
	sinisterblaze: {
		name: "Sinister Blaze",
		desc: "This Ability cannot be suppressed, copied, or transferred. This Pokemon is burned on switch-in, even through Misty Terrain, and its burn can overwrite other status conditions. In Fairy Tale, Starlight Arena, New World, Burning Field, Volcanic Field, Superheated Field, or Cold Eclipse, its Defense and Special Defense rise by 1 stage on entry. Its burn damage becomes healing; foes take 1/8 max HP each turn, or 1/4 if already burned. It does not heal from this generated damage, but heals from real burn damage dealt to foes. Its physical attacks are not weakened by burn. It is immune to hail and sandstorm damage and counts as Ice type in hail, snow, and ice fields.",
		shortDesc: "Burn heals user; foes take 1/8, or 1/4 if burned; no burn penalty; hail/sand immune.",
	},
	stormsovereign: {
		name: "Storm Sovereign",
		desc: "On entry, this Pokemon sets changeable Strong Winds for 8 turns and activates Windy Surge. It has Speed Boost, its moves cannot miss, and foes take immunity-aware Flying chip equal to 1/16 max HP, scaled by effectiveness.",
		shortDesc: "Windy Surge + Speed Boost; 8-turn Strong Winds; no misses; Flying chip.",
	},
	highnoon: {
		name: "High Noon",
		desc: "This Pokemon's Water-type moves have 1.2x power. Its attacks cannot miss unless the target is in the semi-invulnerable turn of a move. Moves that would be boosted by Sharpness or Mega Launcher, plus arrow moves, trigger Dual Wield. Its moves have +1 critical hit ratio against targets that have not moved yet this turn.",
		shortDesc: "Water moves 1.2x; attacks cannot miss; Dual Wield; +1 crit vs unmoved targets.",
	},
	striker: {
		name: "Striker",
		desc: "This Pokemon's kicking moves have 1.4x power.",
		shortDesc: "Kicking moves have 1.4x power.",
	},
	perfectstriker: {
		name: "Perfect Striker",
		desc: "This Pokemon has Striker, No Guard, and Libero's effects.",
		shortDesc: "Striker + No Guard + Libero.",
	},
	silkendecoy: {
		name: "Silken Decoy",
		desc: "On Mega Evolution, this Pokemon spins a protective cocoon. When any Pokemon faints while this Pokemon is active, it spins a cocoon if it does not already have one. The cocoon blocks the next damaging hit, and blocks the remaining hits of that multi-hit move. It also has Insomnia and Self Sufficient's effects.",
		shortDesc: "One cocoon blocks a damaging hit and the rest of that multi-hit move; Insomnia + Self Sufficient.",
	},
	strikersmomentum: {
		name: "Striker's Momentum",
		desc: "This Pokemon has Striker, Defiant, and Libero's effects, and its moves cannot miss. Once per switch-in, a KO caused by this Pokemon raises its Speed by 1 stage.",
		shortDesc: "Moves cannot miss; Striker + Defiant + Libero; first KO gives +1 Speed.",
	},
	ultraego: {
		name: "Ultra Ego",
		desc: "Moves ignore abilities; it heals each turn and after attacks. KOs heal more, and the first enemy hit boosts Attack and Sp. Atk. Bewitched Woods, Haunted, and Holy Field disable these effects.",
		shortDesc: "Mold Breaker; heals and boosts from combat; inactive in Bewitched/Haunted/Holy.",
	},
	territorial: {
		name: "Territorial",
		desc: "This Pokemon has Unnerve, Unaware, and Tough Claws's effects.",
		shortDesc: "Unnerve + Unaware + Tough Claws.",
	},
	lunardread: {
		name: "Lunar Dread",
		desc: "This Pokemon has Magic Guard and Pressure's effects.",
		shortDesc: "Magic Guard + Pressure.",
	},
	ragingbeast: {
		name: "Raging Beast",
		desc: "This Pokemon has Guts and Mold Breaker's effects.",
		shortDesc: "Guts + Mold Breaker.",
	},
	scavenger: {
		name: "Scavenger",
		desc: "This Pokemon has Overcoat, Big Pecks, and Regenerator's effects.",
		shortDesc: "Overcoat + Big Pecks + Regenerator.",
	},
	toxicspines: {
		name: "Toxic Spines",
		desc: "This Pokemon has Toxic Debris, Corrosion, and Merciless's effects.",
		shortDesc: "Toxic Debris + Corrosion + Merciless.",
	},
	ultrainstinct: {
		name: "Ultra Instinct",
		desc: "This Pokemon has Mold Breaker and Inner Focus. It deals 2x damage through screens and 1.5x damage when moving first. In Ashen Beach, New World, Starlight Arena, and Cold Eclipse, it gains 1 Accuracy on entry, deals 1.5x damage, and takes 50% less damage. Outside those fields, it takes 70% less damage when hit before its attacker has moved. Bewitched Woods, Haunted, and Holy Field disable these effects.",
		shortDesc: "Mold Breaker + Inner Focus; screens 2x; acts-first 1.5x; field bonuses.",
	},
	duskdrive: {
		name: "Dusk Drive",
		desc: "This Pokemon has Precision, Opportunist, and Battle Fervor built in.",
		shortDesc: "Precision + Opportunist + Battle Fervor.",
	},
	burningego: {
		name: "Burning Ego",
		desc: "This Pokemon has Ultra Ego and Magma Armor's effects.",
		shortDesc: "Ultra Ego + Magma Armor.",
	},
	rebornflower: {
		name: "Reborn Flower",
		desc: "This Pokemon has Invigorate and Flower Veil's effects. It permanently becomes Florges-Reborn when it enters battle.",
		shortDesc: "Invigorate + Flower Veil; permanently becomes Florges-Reborn on entry.",
	},

	// CAP
	mountaineer: {
		name: "Mountaineer",
		shortDesc: "On switch-in, this Pokemon avoids all Rock-type attacks and Stealth Rock.",
	},
	rebound: {
		name: "Rebound",
		desc: "On switch-in, this Pokemon blocks certain status moves and instead uses the move against the original user.",
		shortDesc: "On switch-in, blocks certain status moves and bounces them back to the user.",

		move: "#magiccoat",
	},
	persistent: {
		name: "Persistent",
		desc: "The duration of Gravity, Heal Block, Magic Room, Safeguard, Tailwind, Trick Room, and Wonder Room is increased by 2 turns if the effect is started by this Pokemon.",
		shortDesc: "When used, Gravity/Heal Block/Safeguard/Tailwind/Room effects last 2 more turns.",

		activate: "  [POKEMON] extends [MOVE] by 2 turns!",
	},
};
