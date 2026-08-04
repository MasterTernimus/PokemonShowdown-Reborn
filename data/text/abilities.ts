export const AbilitiesText: { [id: IDEntry]: AbilityText } = {
	noability: {
		name: "No Ability",
		shortDesc: "Does nothing.",
	},
	adaptability: {
		name: "Adaptability",
		desc: "This Pokemon's moves that match one of its types have a same-type attack bonus (STAB) of 2 instead of 1.5.",
		shortDesc: "This Pokemon's same-type attack bonus (STAB) is 2 instead of 1.5.",
	},
	spiralevolution: {
		name: "Spiral Evolution",
		desc: "This Pokemon has built-in Adaptability, Hydra Bond, and Levitate, cannot flinch, takes half damage from priority moves, and its damaging moves hit through protection for half damage. In Trick Room, its non-priority moves act before other non-priority moves. Twineedle has double power and a 50% chance to be a critical hit; in multi battles it hits all adjacent foes once, and if Twineedle or Double Hit have some targets protected, protected hits focus into unprotected foes like Dragon Darts.",
		shortDesc: "Adaptability + Hydra Bond + Levitate; reduced Protect-pierce; no flinch; Twineedle focus.",
	},
	alchemicsurge: {
		name: "Alchemic Surge",
		desc: "This Pokemon has Competitive, Psychic Surge, Hydra Bond, and Infiltrator. On entry, it sets Psychic Terrain. If any of its stats are lowered by a foe, its Sp. Atk is raised by 2 stages. Its damaging moves use Hydra Bond's effects, and its moves bypass substitutes, screens, Safeguard, and Mist.",
		shortDesc: "Competitive + Psychic Surge + Hydra Bond + Infiltrator.",
	},
	auramaster: {
		name: "Aura Master",
		desc: "This Pokemon has Mega Launcher and Inner Focus's effects, and takes 35% less damage from damaging moves.",
		shortDesc: "Mega Launcher + Inner Focus; takes 0.65x damage.",
	},
	patternshift: {
		name: "Pattern Shift",
		desc: "This Pokemon has Shed Skin, Protean, and Merciless's effects.",
		shortDesc: "Shed Skin + Protean + Merciless.",
	},
	bonewarrior: {
		name: "Bone Warrior",
		desc: "This Pokemon has Technician, Battle Armor, and Skill Link's effects.",
		shortDesc: "Technician + Battle Armor + Skill Link.",
	},
	technicalspecialist: {
		name: "Technical Specialist",
		desc: "This Pokemon has Technician, Shed Skin, and Shell Armor's effects.",
		shortDesc: "Technician + Shed Skin + Shell Armor.",
	},
	dualwield: {
		name: "Dual Wield",
		desc: "Moves that would be boosted by Sharpness or Mega Launcher, plus arrow moves, hit twice, with each hit dealing 70% damage. Spread moves keep their spread targeting.",
		shortDesc: "Sharpness/Mega Launcher/arrow moves hit twice at 70%; spread stays spread.",
	},
	apexpredator: {
		name: "Apex Predator",
		desc: "This Pokemon has Relic Armor's effects. Its super-effective moves never miss. If it knocks out a target with a move, it restores 1/4 max HP per target knocked out.",
		shortDesc: "Relic Armor; super-effective moves never miss; KO heals 1/4.",
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
		desc: "This Pokemon has Natural Cure, Pure Power, Illuminate, and Defragment's effects.",
		shortDesc: "Natural Cure + Pure Power + Illuminate + Defragment.",
	},
	joyride: {
		name: "Joyride",
		desc: "This Pokemon has Aerilate and Infiltrator's effects. Its Normal-type moves become Flying-type and have 1.2x power, and its moves bypass substitutes, screens, Safeguard, and Mist. When this Pokemon uses a damaging Flying-type move, its Attack or Speed, whichever is lower, rises by 1 stage. If this Pokemon knocks out a target with a Flying-type move, it restores 25% of its maximum HP for each target knocked out.",
		shortDesc: "Aerilate + Infiltrator; Flying moves boost lower Atk/Spe; Flying KOs heal 25%.",
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
		desc: "If this Pokemon, but not its substitute, is struck by a critical hit, its Attack is raised by 12 stages.",
		shortDesc: "If this Pokemon (not its substitute) takes a critical hit, its Attack is raised 12 stages.",
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
		desc: "On switch-in, this Pokemon is alerted if any opposing Pokemon has an attacking move with a type that is super effective against this Pokemon, or any OHKO move. This effect considers Hidden Power to be its determined type, and every other move to be its original type.",
		shortDesc: "On switch-in, this Pokemon shudders if any foe has a supereffective or OHKO move.",
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
		desc: "This Pokemon has Water Bubble, Water Veil, Tough Claws, and Shell Armor built in. Its Water-type attacks are doubled, Fire-type attacks used against it are halved, contact moves are boosted by 1.3x, it cannot be burned or critically hit, it is immune to Hail and Sandstorm damage, and it gains Aqua Ring on switch-in.",
		shortDesc: "Water Bubble + Water Veil + Tough Claws + Shell Armor.",
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
		shortDesc: "This Pokemon and its allies have their special attacks boosted by 1.3x.",
	},
	battlearmor: {
		name: "Battle Armor",
		shortDesc: "Cannot be crit; takes 0.8x damage from attacks.",
	},
	battlebond: {
		name: "Battle Bond",
		desc: "At the end of each turn, this Pokemon restores 1/16 max HP. When this Pokemon knocks out another Pokemon, it transforms into its Bond form, and knocking out a target restores 1/8 of this Pokemon's maximum HP. This Pokemon takes 0.75x damage from attacks, takes 30% less damage from Fighting Clause Abilities, and those Abilities' bonus damage does not affect it. Once per battle, if a move would knock it out from above 1/3 max HP, it survives with 1 HP. This Pokemon's attacks deal 1.3x damage to Pokemon with Royal Decree or Neutralization. In Cold Eclipse, its attacks deal 1.3x damage and it takes 0.6x damage from attacks.",
		shortDesc: "Heals 1/16; 0.75x from attacks; Cold Eclipse: 1.3x damage, 0.6x taken.",
		gen8: {
			desc: "If this Pokemon is a Greninja, it transforms into Ash-Greninja if it attacks and knocks out another Pokemon. If this Pokemon is an Ash-Greninja, its Water Shuriken has 20 power and always hits three times.",
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
		shortDesc: "This Pokemon is immune to bullet moves and moves boosted by Mega Launcher.",
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
		desc: "This Pokemon has Contrary's effect and cannot flinch. When Contrary causes this Pokemon's stats to be raised, it restores 1/16 of its maximum HP.",
		shortDesc: "Contrary; no flinch; Contrary stat raises heal 1/16 max HP.",
	},
	corrosion: {
		name: "Corrosion",
		shortDesc: "This Pokemon can poison or badly poison a Pokemon regardless of its typing.",
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
		desc: "While this Pokemon is active, Explosion, Mind Blown, Misty Explosion, Self-Destruct, and the Aftermath Ability are prevented from having an effect.",
		shortDesc: "Prevents Explosion/Mind Blown/Misty Explosion/Self-Destruct/Aftermath while active.",
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
		desc: "While this Pokemon has 1/4 or less of its maximum HP, its Attack and Special Attack are halved.",
		shortDesc: "While this Pokemon has 1/4 or less of its max HP, its Attack and Sp. Atk are halved.",
	},
	relicinstinct: {
		name: "Relic Instinct",
		desc: "If this Pokemon has more than 50% HP, its Rock- and Flying-type moves have 1.3x power and its moves ignore opposing Abilities. If this Pokemon has 50% or less HP, its Rock- and Flying-type moves have 1.1x power, it takes 0.75x damage from attacks, cannot be critically hit, restores 1/16 max HP each turn, and its Attack and Special Attack are halved. Once, when it reaches 25% HP or less, it heals 25% max HP, clears its negative stat stages, and lowers its Defense and Special Defense by 2 stages.",
		shortDesc: ">50%: Rock/Flying 1.3x + Mold Breaker. <=50%: defensive mode; <=25% pinch heal.",
	},
	fossilfrenzy: {
		name: "Fossil Frenzy",
		desc: "When this Pokemon is hit by a damaging move, its Attack and Speed rise by 1 stage and it becomes confused. While confused, it takes 1.25x damage from attacks. This Pokemon has Klutz's effect. If it hits itself in confusion, it also loses 1/8 of its maximum HP.",
		shortDesc: "Hit by attacks: +1 Atk/Spe and confusion; confused takes 1.25x; Klutz; self-hit costs 1/8.",
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
		desc: "On switch-in, this Pokemon's Attack or Special Attack is raised by 1 stage based on the weaker combined defensive stat of all opposing Pokemon. Attack is raised if their Defense is lower, and Special Attack is raised if their Special Defense is the same or lower. This Pokemon's first damaging move after switching in is a critical hit.",
		shortDesc: "On switch-in, boosts Atk/SpA from all foes' defenses; first damaging move crits.",
	},
	dragonize: {
		name: "Dragonize",
		desc: "This Pokemon's Normal-type moves become Dragon-type moves and have their power multiplied by 1.2.",
		shortDesc: "Normal moves become Dragon type and have 1.2x power.",
	},
	draconicforce: {
		name: "Draconic Force",
		desc: "This Pokemon has Dragonize, Strong Jaw, Sheer Force, and Guts's effects.",
		shortDesc: "Dragonize + Strong Jaw + Sheer Force + Guts.",
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
	solargrace: {
		name: "Solar Grace",
		desc: "On switch-in or Mega Evolution, this Pokemon summons Sunny Day. Opposing Pokemon cannot lower this Pokemon's Speed or Special Attack. If this Pokemon moves before the target, its Fire- and Flying-type moves have 1.2x power. If this Pokemon has not moved yet, it takes 0.75x damage from attacks. Its attacks heal 30% of the damage dealt, doubled against G-Max Pokemon, up to 33% of its max HP per hit.",
		shortDesc: "Sets Sun; faster Fire/Flying 1.2x; before moving takes 0.75x; drains attacks.",
	},
	eternalflower: {
		name: "Eternal Flower",
		desc: "This Pokemon's Grass-type moves use 1.5x Attack and Special Attack. Opposing Mega, G-Max, Terastallized, Stellar, and Ultra Beast Pokemon have Attack, Defense, Special Attack, Special Defense, and Speed reduced to 0.6x while this Pokemon is active. This debuff does not affect allies. When this Pokemon faints, it creates Bewitched Woods for 5 turns.",
		shortDesc: "Grass attacks use 1.5x offenses; opposing gimmick Pokemon have stats reduced to 0.6x.",
	},
	ange: {
		name: "Ange",
		desc: "This Pokemon has Eternal Flower, Fairy Aura, and Magic Guard's effects. Its Grass-type moves use 1.5x Attack and Special Attack, Fairy-type moves are boosted, and opposing Mega, G-Max, Terastallized, Stellar, and Ultra Beast Pokemon have their stats reduced to 0.6x. When this Pokemon faints, it creates Bewitched Woods for 5 turns.",
		shortDesc: "Eternal Flower + Fairy Aura + Magic Guard; weakens opposing gimmicks.",
	},
	ascendance: {
		name: "Ascendance",
		desc: "This Pokemon gains a STAB damage bonus on moves that do not already match its type. Its damaging moves ignore type-based immunities, but not Ability immunities, and still respect resistances. Its Defense is doubled, and it has Overcoat's effects.",
		shortDesc: "All moves get STAB if needed; hits type immunities; Fur Coat + Overcoat.",
	},
	mindfreeze: {
		name: "Mind Freeze",
		desc: "This Pokemon is immune to Ice-type attacks and restores 1/4 of its maximum HP when hit by one. It has Ice Body's healing and hail immunity. Its Psychic-type moves have a 40% chance to cause frostbite, and Freezing Glare's frostbite chance is doubled. Its Physical Ice-type moves become Special.",
		shortDesc: "Absorbs Ice for 25%; Ice Body effects; Psychic moves frostbite; Physical Ice becomes Special.",
	},
	frozensummit: {
		name: "Frozen Summit",
		desc: "This Pokemon has Thick Fat's effect, is immune to hail damage, and its damaging moves have 1.3x power.",
		shortDesc: "Thick Fat + hail immunity; damaging moves have 1.3x power.",
	},
	riotamp: {
		name: "Riot Amp",
		desc: "This Pokemon has Punk Rock, Galvanize, and Technician's effects. Its Normal-type moves become Electric type and are boosted, sound moves are boosted, and moves with 60 or less Base Power are boosted.",
		shortDesc: "Punk Rock + Galvanize + Technician.",
	},
	relicarmor: {
		name: "Relic Armor",
		desc: "This Pokemon cannot be critically hit. If an opposing Pokemon lowers its stats, its Defense and Special Defense rise by 1 stage. It takes 0.8x damage from attacks, does not take recoil damage except Struggle, has Pressure's PP effect, and its moves ignore Abilities.",
		shortDesc: "No crits; stat drops +1 Def/SpD; takes 0.8x; Rock Head + Pressure + Mold Breaker.",
	},
	windysurge: {
		name: "Windy Surge",
		desc: "On switch-in, this Pokemon sets Tailwind on its side for 2 turns.",
		shortDesc: "On switch-in, sets 2-turn Tailwind on this Pokemon's side.",
	},
	burningspirit: {
		name: "Burning Spirit",
		desc: "This Pokemon cannot be frozen or frostbitten. Water-type attacks used against this Pokemon deal 0.5x damage, and contact moves used against it deal 0.7x damage. This Pokemon's damaging moves have a 30% chance to burn the target. It restores 1/16 of its max HP at the end of each turn, and its Fire-type moves have 1.5x power at 1/2 max HP or less. Once per battle, if this Pokemon would be knocked out, it survives with 1 HP and gains Magic Guard's effect.",
		shortDesc: "0.5x Water; 0.7x contact; 30% burn; heals 1/16; low HP Fire boost; one-time endure.",
	},
	emperorsresolve: {
		name: "Emperor's Resolve",
		desc: "If this Pokemon has a stat lowered by an opposing Pokemon, its Special Attack rises by 2 stages. This Pokemon takes 0.75x damage from resisted moves and cannot flinch. Its Water- and Steel-type moves have 1.2x power. Its Ice-type moves gain STAB, its Speed is doubled in hail or snow, and it is immune to hail and snow damage.",
		shortDesc: "SpA +2 on foe stat drop; 0.75x resisted; Water/Steel 1.2x; Ice STAB; Slush Rush.",
	},
	terraresolve: {
		name: "Terra Resolve",
		desc: "When this Pokemon's stats are lowered by an opposing Pokemon, its Attack rises by 1 stage. If its Defense or Special Defense is lowered, it takes 0.75x damage from attacks until the end of the next turn. It takes 0.75x damage from super-effective attacks, restores 1/16 of its max HP at the end of each turn, and restores HP equal to 1/8 of the damage dealt by its damaging moves.",
		shortDesc: "Foe stat drops +1 Atk; 0.75x super-effective; heals 1/16 and drains 1/8 damage.",
	},
	eclipsevision: {
		name: "Eclipse Vision",
		desc: "This Pokemon's Special Attack is multiplied by 1.3. Before it uses a Psychic-type or Dark-type move, it becomes that type and remains that type. If this Pokemon is Psychic type, it restores 1/16 of its max HP at the end of each turn. If this Pokemon is Dark type, its damaging moves restore HP equal to 1/4 of the damage dealt.",
		shortDesc: "SpA 1.3x; Psychic/Dark moves change user's type; Psychic heals; Dark drains.",
	},
	venomrush: {
		name: "Venom Rush",
		desc: "This Pokemon has Toxic Boost's effect. If it is poisoned or badly poisoned, its physical moves have 1.5x power, and poison damage restores 1/8 of its max HP instead of damaging it.",
		shortDesc: "Toxic Boost; poison heals 1/8 instead of damaging.",
	},
	firstvenom: {
		name: "First Venom",
		desc: "This Pokemon has the custom Shed Skin effect, giving it a 50% chance at the end of each turn to cure status, remove common negative effects, reset negative stat stages, and restore 1/3 max HP when it has a negative condition or is at 1/2 HP or less. While it has at least 75% of its max HP, its damaging Poison- and Dark-type moves have +1 priority, and its Dark-type moves have 1.5x power and gain STAB.",
		shortDesc: "Custom Shed Skin; at >=75% HP Poison/Dark attacks +1 priority; Dark 1.5x + STAB.",
	},
	noseformation: {
		name: "Nose Formation",
		desc: "This Pokemon has Elevate's effect. After this Pokemon hits with a damaging move, Mini-Noses strike the target three times with a 30 Base Power special attack that chooses Steel, Electric, or Rock, whichever would deal the most damage.",
		shortDesc: "Elevate; damaging hits trigger 3 Mini-Nose follow-up hits.",
	},
	mourningvessel: {
		name: "Mourning Vessel",
		desc: "This Pokemon's damaging moves deal 20% more damage for each fainted ally. At the end of each turn, this Pokemon restores 35% of its max HP for each fainted opposing Pokemon, counting every opposing side in Free-For-All battles.",
		shortDesc: "Damage +20% per fainted ally; heals 35% per fainted foe from all opposing sides.",
	},
	fallenstar: {
		name: "Fallen Star",
		desc: "This Ability cannot be suppressed. This Pokemon restores 1/16 max HP at the end of each turn. Its arrow moves trigger Dual Wield, ignore the target's Ability, cannot be redirected, hit through protection at 50% power, or double damage if the hit is critical, and have 1.3x power. Snipe Shot gets an additional 1.5x power boost. If this Pokemon has 1/2 or less of its maximum HP, its arrow moves gain +2 priority and this Pokemon takes 50% less damage. If an arrow move targets a Pokemon that cannot switch out, it has 1.5x power instead. After this Pokemon uses an arrow move, it takes 75% less damage for the rest of the turn. If this Pokemon KOes a target with an arrow move, it uses that move again at 50% power. In Free-For-All battles, arrow moves hit all foes. Arrow moves are Spirit Shackle, Thousand Arrows, Triple Arrows, Snipe Shot, Razor Leaf, Magical Leaf, Spike Cannon, Pin Missile, Icicle Spear, Rock Blast, Bullet Seed, Barrage, Scale Shot, Psycho Cut, and Ceaseless Edge.",
		shortDesc: "Heals 1/16; arrow moves Dual Wield, ignore Ability/redirect/Protect, +2 at <=1/2 HP, FFA spread.",
	},
	eclipse: {
		name: "Eclipse",
		desc: "During weather, this Pokemon's attacks deal 1.5x damage. In clear weather, attacks deal 0.5x damage to this Pokemon. Its Psychic-type moves become Dark type if Dark would do more damage, and its Dark-type moves become Psychic type if Psychic would do more damage. It restores 1/4 max HP instead of taking damage from Psychic- or Dark-type moves.",
		shortDesc: "Weather attacks 1.5x; clear weather takes 0.5x; Psychic/Dark pick better type; absorbs both.",
	},
	ragingstorm: {
		name: "Raging Storm",
		desc: "This Ability cannot be suppressed. This Pokemon's attacks have Mold Breaker, remove the target's positive stat changes before damage, and ignore Reflect, Light Screen, Aurora Veil, and defensive stat boosts. If this Pokemon gets a KO, it damages remaining foes for 60% of the last damage in multi battles, or raises Attack by 1 if there is no valid target or no damage is dealt. Magic Guard users do not take this damage.",
		shortDesc: "Cannot be suppressed; Mold Breaker; attacks clear boosts/ignore screens; KO bonus.",
	},
	voltagevolley: {
		name: "Voltage Volley",
		desc: "This Pokemon's multi-hit moves become special attacks and use its Special Attack.",
		shortDesc: "Multi-hit moves become special and use Sp. Atk.",
	},
	vanguard: {
		name: "Vanguard",
		desc: "This Pokemon has Intimidate built in. Extreme Speed has 1.5x power and becomes Fire-type if Fire would deal more damage. This Pokemon heals 30% of the damage it deals with attacks, doubled against G-Max Pokemon, up to 33% of its max HP per hit. After using Extreme Speed, this Pokemon takes 0.25x damage until the end of the turn. This Pokemon can only be damaged by direct attacks. Its stats cannot be lowered by opposing Pokemon. Once per battle, it endures a KO and survives at 1 HP.",
		shortDesc: "Intimidate; Extreme Speed 1.5x; drains damage; Magic Guard; stats can't drop.",
	},
	apexcleave: {
		name: "Apex Cleave",
		desc: "This Pokemon's slicing moves have 1.5x power and ignore Substitute, Reflect, Light Screen, and Aurora Veil.",
		shortDesc: "Sharpness; slicing moves ignore Substitute, screens, and Aurora Veil.",
	},
	aurainstinct: {
		name: "Aura Instinct",
		desc: "This Pokemon has Sworn Duty's effect. Its moves ignore Abilities, and it cannot flinch. At the end of each turn, it restores 1/16 max HP. On Ashen Beach, New World, Starlight Arena, Holy, or Cold Eclipse fields, its Accuracy is raised by 1 on switch-in, its attacks deal 1.5x damage, and it takes 0.25x damage from attacks. The first time this Pokemon would be knocked out, it survives with 1 HP.",
		shortDesc: "Sworn Duty; heals 1/16; field boosts offense/defense; endures once.",
	},
	royalcurrent: {
		name: "Royal Current",
		desc: "This Pokemon has Marvel Scale and Sniper's effects. When it lands a critical hit, its Speed rises by 1 stage.",
		shortDesc: "Marvel Scale + Sniper; critical hits raise Speed by 1.",
	},
	grandmaster: {
		name: "Grandmaster",
		desc: "This Pokemon cannot flinch and has Overcoat's immunity to powder, Hail, and Sandstorm. After it uses Miracle Eye, it resists Dark-type moves. If it uses a status move, it takes 0.25x damage for the rest of the turn. If it moves before the target, its Psychic-type moves ignore resistances. When this Pokemon is damaged by an opposing attack, uses Future Sight, or faints, Future Sight is queued on opposing slots. Existing Grandmaster delayed attacks stack instead of blocking new ones.",
		shortDesc: "Overcoat; no flinch; status guard; repeatedly queues Future Sight.",
	},
	warpath: {
		name: "War Path",
		desc: "This Pokemon has Overcoat's immunity to powder, Hail, and Sandstorm. Its Attack is 1.5x while statused. Its Rock-, Fighting-, and Ground-type moves ignore Reflect, Light Screen, Aurora Veil, and defensive boosts. It cannot flinch and ignores stat increases.",
		shortDesc: "Overcoat; status Atk 1.5x; Rock/Fighting/Ground ignore screens/boosts; no flinch.",
	},
	atrocity: {
		name: "Atrocity",
		desc: "This Ability cannot be suppressed. This Pokemon's damaging moves have 1.3x power, +1 critical hit ratio, ignore Abilities, ignore defensive stat boosts, and bypass Substitute, Reflect, Light Screen, and Aurora Veil. Its Defense and Special Defense are 1.3x. It heals 30% of the damage it deals with attacks, doubled against G-Max Pokemon, up to 33% of its max HP per hit, and restores 1/16 max HP at the end of each turn. In Cold Eclipse, its damaging moves gain another 1.3x boost, and its Defense and Special Defense become 1.5x.",
		shortDesc: "Cannot be suppressed; moves 1.3x; drains. Cold Eclipse: stronger damage/defense/healing.",
	},
	wickedsnare: {
		name: "Wicked Snare",
		desc: "This Pokemon has Stakeout's effect. Opposing Pokemon that switch in have their Speed lowered by 1 stage. If this Pokemon knocks out a Pokemon that switched in this turn, it restores 1/8 of its maximum HP. Targets hit by this Pokemon become affected by Torment.",
		shortDesc: "Stakeout; switch-ins lose Speed; KO on switched-in target heals 1/8; hits Torment.",
	},
	crumblingshell: {
		name: "Crumbling Shell",
		desc: "When this Pokemon is hit by a Physical attack, Stealth Rock is set on the attacker's side of the field if that side does not already have Stealth Rock.",
		shortDesc: "When hit by a Physical attack, sets Stealth Rock on the attacker's side.",
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
		desc: "This Pokemon has Marvel Scale's Defense boost. When this Pokemon poisons a target, that target becomes confused.",
		shortDesc: "Marvel Scale; targets poisoned by this Pokemon become confused.",
	},
	corrosivedust: {
		name: "Corrosive Dust",
		desc: "Pokemon making contact with this Pokemon have a 30% chance to be poisoned. While this Pokemon is active, Pokemon that become poisoned also become confused.",
		shortDesc: "Contact has 30% poison chance; poisoned Pokemon become confused.",
	},
	souleater: {
		name: "Soul Eater",
		desc: "This Pokemon's moves ignore accuracy checks. While this Pokemon has more than 1/4 of its maximum HP, attacks deal 0.7x damage to it. This Pokemon is immune to Ghost-type moves and restores 1/4 max HP when hit by one. Soul Fire cannot redirect or bypass this immunity. When this Pokemon faints, it creates Haunted Field for 5 turns, ignoring Neutralization. This Ability cannot be ignored or suppressed by Mold Breaker-style effects.",
		shortDesc: "One-sided No Guard; 0.7x damage above 1/4 HP; on faint creates Haunted Field.",
	},
	alloycore: {
		name: "Alloy Core",
		desc: "This Pokemon can only be damaged by direct attacks and cannot have its stats lowered by opposing Pokemon. This Pokemon's moves ignore Substitute, Reflect, Light Screen, and Aurora Veil.",
		shortDesc: "Magic Guard + Clear Body; moves ignore Substitute and screens.",
	},
	hellfireeclipse: {
		name: "Hellfire Eclipse",
		desc: "During harsh sunlight, this Pokemon's Attack and Special Attack are multiplied by 1.5. After this Pokemon uses a Fire-type move, it sets Sunny Day for 2 turns.",
		shortDesc: "In Sun: Atk/SpA 1.5x; Fire moves set 2-turn Sun.",
	},
	sacrededge: {
		name: "Sacred Edge",
		desc: "This Pokemon has Sharpness, Dual Wield, and Sworn Duty's effects. Its slicing moves have 1.5x power. When Dual Wield applies to one of those slicing moves, the first hit keeps the 1.5x Sharpness boost and the second hit deals 30% of that boosted damage. On switch-in or Mega Evolution, it heals its ally by 1/4 max HP, or 1/3 on Fairy Tale Field.",
		shortDesc: "Sharpness + Dual Wield + Sworn Duty.",
	},
	omenedge: {
		name: "Omen Edge",
		desc: "This Pokemon has Sharpness's effect. Its slicing moves have +1 critical hit ratio, and its critical hits deal 1.5x more damage like Sniper. When this Pokemon faints, it casts a physical Doom Desire on each opposing Pokemon.",
		shortDesc: "Sharpness; slicing +1 crit; stronger crits. On faint: physical Doom Desire on foes.",
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
	cursedmarionette: {
		name: "Cursed Marionette",
		desc: "This Pokemon's status moves have +1 priority. If this Pokemon uses a status move on an opposing Pokemon, hits an opposing Pokemon with a damaging move, or is hit by an opposing damaging move, that opposing Pokemon becomes cursed. Cursed Pokemon deal 0.5x damage to this Pokemon. This Pokemon restores HP equal to 1/2 of Curse damage it caused. The first time this Pokemon falls below half HP, it creates Haunted Field for 3 turns, ignoring Neutralization. When this Pokemon faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, or extends active Haunted Field by 5 turns, ignoring Neutralization.",
		shortDesc: "Status +1; curses foes; cursed foes deal 0.5x; heals 1/2 Curse damage.",
	},
	cursedarmament: {
		name: "Cursed Armament",
		desc: "Curse used by this Pokemon becomes a 100 BP physical Ghost-type attack with 100% accuracy that hits all adjacent foes and curses each target. Cursed Pokemon deal 0.5x damage to this Pokemon. This Pokemon restores HP equal to 1/2 of Curse damage it caused. When this Pokemon faints, opposing Pokemon become cursed and it creates Haunted Field for 5 turns, ignoring Neutralization.",
		shortDesc: "Curse is a 100 BP spread attack; cursed foes deal 0.5x; heals Curse damage.",
	},
	sandsovereign: {
		name: "Sand Sovereign",
		desc: "On switch-in, this Pokemon summons Sandstorm. During Sandstorm, this Pokemon's moves have 1.2x power and attacks deal 0.7x damage to it. At the end of each turn, non-Rock, non-Ground, and non-Steel Pokemon lose 1/16 max HP.",
		shortDesc: "Sets Sand; in Sand moves 1.2x and takes 0.7x; chips vulnerable Pokemon.",
	},
	dunetyrant: {
		name: "Dune Tyrant",
		desc: "This Pokemon has Sand Stream and Strong Jaw built in. On switch-in, it summons Sandstorm. During Sandstorm, its Defense is boosted by 1.5x and attacks deal 0.8x damage to it.",
		shortDesc: "Sand Stream + Strong Jaw; in Sand, Def 1.5x and takes 0.8x.",
	},
	frostsovereign: {
		name: "Frost Sovereign",
		desc: "On switch-in, this Pokemon summons Hail for 8 turns, and Aurora Veil used by this Pokemon lasts 8 turns. During Hail, this Pokemon's moves have 1.2x power and attacks deal 0.7x damage to it. At the end of each turn, non-Ice Pokemon lose 1/16 max HP.",
		shortDesc: "Sets 8-turn Hail; 8-turn Aurora Veil; in Hail moves 1.2x and takes 0.7x.",
	},
	freezerburn: {
		name: "Freezer Burn",
		desc: "This Pokemon has Refrigerate and Snow Warning built in. Normal-type moves become Ice-type and have 1.2x power. Fire-type moves used by this Pokemon have 1.2x power. This Pokemon's charge moves execute immediately.",
		shortDesc: "Refrigerate + Snow Warning; Fire moves 1.2x; charge moves fire instantly.",
	},
	stormfright: {
		name: "Storm Fright",
		desc: "On switch-in, opposing Pokemon have their Attack lowered by 1 stage. This Pokemon is immune to Electric-type moves and raises its Special Attack by 1 stage when hit by one. This Pokemon has Teravolt's effect.",
		shortDesc: "Intimidate + Lightning Rod + Teravolt.",
	},
	enlightenment: {
		name: "Enlightenment",
		desc: "This Pokemon's Attack is doubled. Its contact moves ignore Abilities. If this Pokemon hits a target with a damaging move and the target does not faint, this Pokemon restores 1/4 of its maximum HP.",
		shortDesc: "Pure Power; contact ignores Abilities; non-KO hits heal 1/4.",
	},
	relentlesslink: {
		name: "Relentless Link",
		desc: "This Pokemon has Skill Link, Guts, and Shield Dust's effects.",
		shortDesc: "Skill Link + Guts + Shield Dust.",
	},
	mirrorgreed: {
		name: "Mirror Greed",
		desc: "This Pokemon has Magic Bounce, Prankster, Stall, and Analytic's effects.",
		shortDesc: "Magic Bounce + Prankster + Stall + Analytic.",
	},
	uncheckedassault: {
		name: "Unchecked Assault",
		desc: "This Pokemon has Scrappy, Limber, and Opportunist's effects.",
		shortDesc: "Scrappy + Limber + Opportunist.",
	},
	royalvoice: {
		name: "Royal Voice",
		desc: "This Pokemon has Pixilate, Queenly Majesty, and Sworn Duty's effects. Its Normal-type moves become Fairy type and have 1.2x power. Its Psychic- and Fairy-type moves have 1.2x power. On switch-in or Mega Evolution, it heals its ally by 1/4 max HP, or 1/3 on Fairy Tale Field.",
		shortDesc: "Pixilate + Queenly Majesty + Sworn Duty; Psychic/Fairy moves 1.2x.",
	},
	perfectforesight: {
		name: "Perfect Foresight",
		desc: "On switch-in, this Pokemon identifies and gains the Ability of the opposing Pokemon with the highest offensive stat. Future Sight queued by this Ability has 60 BP, ignores defensive boosts, screens, and Abilities, and hits Dark-type Pokemon neutrally. If this Pokemon uses a move on opposing Pokemon, is damaged by an opposing attack, or uses Future Sight, Future Sight is queued on the affected opposing slots. Spread moves queue Future Sight on all enemies, and existing Perfect Foresight delayed attacks stack instead of blocking new ones.",
		shortDesc: "Gains strongest foe's Ability; repeatedly queues 60 BP Future Sight.",
	},
	doomwarning: {
		name: "Doom Warning",
		desc: "This Pokemon has Magic Bounce. Future Sight used by this Pokemon behaves like Perfect Foresight. This Pokemon's damaging attacks queue Future Sight on opposing targets they hit. When this Pokemon faints, Doom Desire is cast on all opposing Pokemon.",
		shortDesc: "Magic Bounce; attacks queue Future Sight; on faint casts Doom Desire on foes.",
	},
	perfectego: {
		name: "Perfect Ego",
		desc: "This Pokemon has Ultra Ego and Battle Fervor's effects. Its moves cannot miss.",
		shortDesc: "Ultra Ego + Battle Fervor; moves cannot miss.",
	},
	heavenlychorus: {
		name: "Heavenly Chorus",
		desc: "This Pokemon has Pixilate, Cloud Nine, Fluffy, and Natural Cure's effects.",
		shortDesc: "Pixilate + Cloud Nine + Fluffy + Natural Cure.",
	},
	mourningsnow: {
		name: "Mourning Snow",
		desc: "On switch-in, this Pokemon summons Hail for 8 turns, and Aurora Veil used by this Pokemon lasts 8 turns. During Hail, this Pokemon has Ice Body's effect and opposing non-Ice Pokemon have a 30% chance to become frostbitten at the end of the turn. When another Pokemon faints, this Pokemon restores 1/8 max HP, or 1/4 if the faint was caused by an Ice move, Hail, Snow, or Curse. When this Pokemon faints, all opposing Pokemon become cursed. This Pokemon has a 100% Cursed Body effect.",
		shortDesc: "Sets 8-turn Hail/Veil; heals when others faint; frostbite; Cursed Body.",
	},
	venombastion: {
		name: "Venom Bastion",
		desc: "This Pokemon has Shell Armor's effect. Its Bug-type moves have 1.5x power, and contact moves used against it deal 0.75x damage.",
		shortDesc: "Shell Armor; Bug moves 1.5x; takes 0.75x contact damage.",
	},
	rimeknuckle: {
		name: "Rime Knuckle",
		desc: "This Pokemon's Defense and Special Defense are multiplied by 1.25 while above 50% HP, or 1.5 while at 50% HP or lower. Its punching moves have 1.4x power. Its moves have a 40% chance to cause frostbite. If this Pokemon is above 50% HP, attacks from faster Pokemon deal 33% less damage to it. If this Pokemon knocks out a target, it restores 1/10 of its maximum HP, or 1/2 if the target was Mega, G-Max, Terastallized, Stellar, or holding a Z-Move item.",
		shortDesc: "Def/SpD scale by HP; punching moves 1.4x; KO heals 1/10 or 1/2 vs gimmicks.",
	},
	razorcurrent: {
		name: "Razor Current",
		desc: "This Pokemon's Steel-type moves have 1.5x power. At the end of each turn, its Speed rises by 1 stage.",
		shortDesc: "Steel moves 1.5x; Speed rises by 1 each turn.",
	},
	guardiantempest: {
		name: "Guardian Tempest",
		desc: "On switch-in, this Pokemon summons Rain. This Pokemon has Berserk and Friend Guard's effects.",
		shortDesc: "Drizzle + Berserk + Friend Guard.",
	},
	toxicrenewal: {
		name: "Toxic Renewal",
		desc: "This Pokemon has Adaptability, Regenerator, and Merciless's effects.",
		shortDesc: "Adaptability + Regenerator + Merciless.",
	},
	stormcircuit: {
		name: "Storm Circuit",
		desc: "On switch-in, this Pokemon creates Electric Terrain. During Rain, its Speed is doubled.",
		shortDesc: "Electric Surge + Swift Swim.",
	},
	ironmountain: {
		name: "Iron Mountain",
		desc: "This Pokemon has Filter, Stamina, and Heavy Metal's effects. Super-effective attacks deal 0.75x damage to it. Once per turn when hit by an opposing damaging move, its Defense rises by 1 stage and it restores 1/16 max HP. Its weight is doubled.",
		shortDesc: "Filter + Stamina + Heavy Metal.",
	},
	woolyconductor: {
		name: "Wooly Conductor",
		desc: "This Pokemon has Fur Coat, Mold Breaker, and Static's effects. Its Defense is doubled, its moves ignore opposing Abilities, and contact moves used against it may paralyze the attacker.",
		shortDesc: "Fur Coat + Mold Breaker + Static.",
	},
	surgeconduit: {
		name: "Surge Conduit",
		desc: "On switch-in, this Pokemon creates Electric Terrain. This Pokemon draws Electric-type moves to itself to raise its Attack and Special Attack by 1 stage, and is immune to Electric-type moves.",
		shortDesc: "Electric Surge + Lightning Rod.",
	},
	solartrap: {
		name: "Solar Trap",
		desc: "This Pokemon has Simple, Corrosion, and Innards Out's effects.",
		shortDesc: "Simple + Corrosion + Innards Out.",
	},
	soaringspirit: {
		name: "Soaring Spirit",
		desc: "When this Pokemon knocks out an opposing Pokemon, its Speed and higher attacking stat rise by 1 stage, and the next attack that hits it deals 25% less damage.",
		shortDesc: "KO: +1 Speed and higher offense; next hit deals 25% less.",
	},
	vendetta: {
		name: "Vendetta",
		desc: "When this Pokemon is hit by a damaging move, its Attack rises by 1 stage. The first time it would be knocked out by damage, it survives with 1 HP. If a Pokemon damaged this Pokemon this turn, this Pokemon's Dark- and Ground-type moves ignore that target's defensive boosts and screens. If it knocks out that attacker, it restores 1/4 max HP.",
		shortDesc: "Hit: +1 Atk; once endures; retaliatory Dark/Ground bypass defenses and can heal.",
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
		desc: "This Pokemon has Friend Guard and Regenerator's effects.",
		shortDesc: "Friend Guard + Regenerator.",
	},
	auroraresonance: {
		name: "Aurora Resonance",
		desc: "This Pokemon's sound-based moves have 1.2x power and become Water type. This Pokemon has Water Absorb's effect. If Rain is active, this Pokemon heals its status condition at the end of each turn.",
		shortDesc: "Sound moves become Water and 1.2x; Water Absorb; cures status in rain.",
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
		desc: "This Pokemon has Prankster, Telepathy, and Frisk's effect, including Frisk's chance to Embargo opposing Pokemon.",
		shortDesc: "Prankster + Telepathy + Frisk with Embargo chance.",
	},
	treasuretitan: {
		name: "Treasure Titan",
		desc: "This Pokemon has Heavy Metal, Filter, and Earth Eater's effects.",
		shortDesc: "Heavy Metal + Filter + Earth Eater.",
	},
	ragingfists: {
		name: "Raging Fists",
		desc: "This Pokemon has Scrappy, Hydra Bond, Unseen Fist, and Skill Link's effects.",
		shortDesc: "Scrappy + Hydra Bond + Unseen Fist + Skill Link.",
	},
	warship: {
		name: "War Ship",
		desc: "If Rain is active, this Pokemon's Speed is doubled. This Pokemon does not take recoil damage and ignores opposing stat boosts like Unaware.",
		shortDesc: "Swift Swim + Rock Head + Unaware.",
	},
	furnaceengine: {
		name: "Furnace Engine",
		desc: "When this Pokemon is hit by a Water- or Fire-type move, its Speed is maximized. Water-type moves used against this Pokemon deal 0.5x damage. At the end of each turn, opposing Pokemon lose 1/16 max HP unless they are Fire, Rock, Ground, or airborne.",
		shortDesc: "Hit by Water/Fire maxes Speed; 0.5x Water; chips vulnerable foes.",
	},
	deserttyrant: {
		name: "Desert Tyrant",
		desc: "On switch-in, this Pokemon summons Sandstorm. While Sandstorm is active, this Pokemon's Ground- and Rock-type moves have 1.2x power, Ground-type Pokemon have 1.5x Defense, and opposing Pokemon lose 1/16 max HP each turn unless they are Ground, Rock, Steel, or airborne.",
		shortDesc: "Sets Sand; Ground/Rock 1.2x; Ground Def 1.5x; chips vulnerable foes.",
	},
	heatcoil: {
		name: "Heat Coil",
		desc: "At the end of each turn, this Pokemon's Speed rises by 1 stage. Contact moves used against this Pokemon deal 0.75x damage. If this Pokemon is hit by a contact move, the attacker loses 1/16 max HP.",
		shortDesc: "+1 Speed each turn; 0.75x contact damage; contact attackers lose 1/16.",
	},
	sweetsanctuary: {
		name: "Sweet Sanctuary",
		desc: "This Pokemon has Friend Guard, Sweet Veil, and Aroma Veil's effects.",
		shortDesc: "Friend Guard + Sweet Veil + Aroma Veil.",
	},
	riptideclaws: {
		name: "Riptide Claws",
		desc: "This Pokemon has Swift Swim, Technician, Shell Armor, and Anger Shell's effects.",
		shortDesc: "Swift Swim + Technician + Shell Armor + Anger Shell.",
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
		desc: "This Pokemon's Poison-type damaging moves and damaging moves that can poison heal the user for 50% of the damage dealt. Ground-type moves deal 1/4 damage to this Pokemon. When an opposing Pokemon loses HP from poison or toxic poison, this Pokemon restores HP equal to the HP lost.",
		shortDesc: "Poison/poisoning attacks drain 50%; Ground damage is 1/4; drains foes' poison damage.",
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
	firemane: {
		name: "Fire Mane",
		desc: "This Pokemon's Fire-type attacks have 1.5x power.",
		shortDesc: "This Pokemon's Fire-type attacks have 1.5x power.",
	},
	blazingmane: {
		name: "Blazing Mane",
		desc: "This Pokemon has Fire Mane's effect. Its Speed is raised by 1 stage on entry if Burning Terrain is active, and whenever Burning Terrain starts while it is active. Its damaging moves hit twice, and the second hit deals 30% of the original damage and can trigger additional secondary effects. If this Pokemon has 1/4 or less of its max HP, its Fire-type attacks have +1 priority.",
		shortDesc: "Fire 1.5x; +1 Spe on Burning Terrain; damaging moves hit twice; low HP Fire +1 priority.",
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
		desc: "On switch-in, this Pokemon is alerted to the move with the highest power, at random, known by an opposing Pokemon. This effect considers OHKO moves to have 150 power, Counter, Mirror Coat, and Metal Burst to have 120 power, every other attacking move with an unspecified power to have 80 power, and non-damaging moves to have 1 power.",
		shortDesc: "On switch-in, this Pokemon is alerted to the foes' move with the highest power.",
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
		shortDesc: "On switch-in, this Pokemon identifies the held items of all opposing Pokemon.",
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
		desc: "When this Pokemon is hit by a contact move, the attacker's Speed is lowered by 2 stages and its highest offensive stat is lowered by 1 stage. This Pokemon restores 1/16 max HP, or 1/8 max HP if the attacker's Speed was already lowered.",
		shortDesc: "Contact: attacker -2 Spe and -1 highest offense; heals 1/16, or 1/8 if Spe already lowered.",
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
		desc: "If the last item this Pokemon used is a Berry, there is a 50% chance it gets restored at the end of each turn. If Sunny Day is active, this chance is 100%.",
		shortDesc: "If last item used is a Berry, 50% chance to restore it each end of turn. 100% in Sun.",

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
		desc: "This Pokemon's weight is doubled. This effect is calculated after the effect of Autotomize, and before the effect of Float Stone.",
		shortDesc: "This Pokemon's weight is doubled.",
	},
	hyperdrill: {
		name: "Hyper Drill",
		desc: "This Pokemon has Power Drill built in. Its Rock-type moves receive a same-type attack bonus.",
		shortDesc: "Power Drill; Rock moves get STAB.",
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
		desc: "When this Pokemon switches in, it appears as the last unfainted Pokemon in its party until it takes direct damage from another Pokemon's attack. While disguised, it copies the disguised Pokemon's Ability and gains STAB on moves matching the disguised Pokemon's types, but keeps its own defensive typing. The copied Ability is removed when the disguise breaks.",
		shortDesc: "Disguises itself, copies Ability, and gains STAB from the disguised Pokemon's types.",

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
		shortDesc: "This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.",
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
		desc: "This Pokemon's punch-based attacks have their power multiplied by 1.2.",
		shortDesc: "This Pokemon's punch-based attacks have 1.2x power. Sucker Punch is not boosted.",
	},
	justified: {
		name: "Justified",
		shortDesc: "This Pokemon's Attack is raised by 1 stage after it is damaged by a Dark-type move.",
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
		shortDesc: "This Pokemon's weight is halved.",
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
		shortDesc: "This Pokemon cannot be paralyzed. Gaining this Ability while paralyzed cures it.",
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
		desc: "On switch-in, this Pokemon's Accuracy is raised by 1 stage. Its attacks do not make contact with the target, and its critical hits deal 2.25x damage instead of 1.5x.",
		shortDesc: "+1 Accuracy on switch-in; no contact; critical hits deal 2.25x.",
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
		desc: "This Pokemon has Magic Bounce and Serene Grace. On switch-in, it sets Gravity for 5 turns. This Pokemon is immune to Gravity's negative effects: it is not grounded, its Ground immunity is not removed, and it can still use moves normally restricted by Gravity. This Pokemon also benefits from Metronome's focused mode.",
		shortDesc: "Magic Bounce + Serene Grace; sets Gravity; benefits from focused Metronome.",
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
		shortDesc: "This Pokemon cannot be frozen. Gaining this Ability while frozen cures it.",
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
		desc: "This Pokemon has Marvel Scale, Water Veil, and Dragonize's effects. Its Defense is 1.5x while statused or in boosted fields, it cannot be burned, it gains Aqua Ring on switch-in, it is immune to hail and sandstorm damage, and its Normal-type moves become Dragon type and have 1.2x power.",
		shortDesc: "Marvel Scale + Water Veil + Dragonize.",
	},
	megalauncher: {
		name: "Mega Launcher",
		desc: "This Pokemon's pulse moves have their power multiplied by 1.5. Heal Pulse restores 3/4 of a target's maximum HP, rounded half down.",
		shortDesc: "This Pokemon's pulse moves have 1.5x power. Heal Pulse heals 3/4 target's max HP.",
	},
	megasol: {
		name: "Mega Sol",
		shortDesc: "This Pokemon's moves are used as if the effects of Sunny Day were active.",
	},
	bloomingsun: {
		name: "Blooming Sun",
		desc: "This Pokemon has Mega Sol, Flower Gift, Flower Veil, and Leaf Guard's effects. Flower Gift and Leaf Guard are always active.",
		shortDesc: "Mega Sol + always-active Flower Gift, Flower Veil, and Leaf Guard.",
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
		desc: "This Pokemon can hit Ghost types with Normal- and Fighting-type moves, gains STAB on Fairy- and Dark-type moves, and prevents other Pokemon from lowering its accuracy. This Pokemon ignores a target's evasiveness, takes 20% less damage from damaging moves, and restores 1/16 max HP after its damaging moves hit. In Cold Eclipse, its damaging moves have 1.3x power, it takes 0.7x damage from damaging moves, and its hit healing becomes 1/8 max HP.",
		shortDesc: "Normal/Fighting hit Ghost; Fairy/Dark STAB; takes 0.8x. Cold Eclipse strengthens it.",
	},
	minus: {
		name: "Minus",
		desc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
		shortDesc: "If an active ally has this Ability or the Plus Ability, this Pokemon's Sp. Atk is 1.5x.",
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
		desc: "When one of this Pokemon's stat stages would be lowered by another Pokemon, that Pokemon's stat stage is lowered instead. This effect does not happen if this Pokemon's stat stage was already -6. If the other Pokemon has a substitute, neither Pokemon has its stat stage lowered.",
		shortDesc: "If this Pokemon's stat stages would be lowered, the attacker's are lowered instead.",
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
		desc: "This Pokemon boosts its moves with 80 or less Base Power by 1.5x and has Invigorate's healing boost. When this Pokemon damages a target, or is damaged by an attack, the other Pokemon is marked by Requiem: first it gets Perish Song, then Curse if already under Perish Song, then Mean Look if already under Perish Song and Curse. Curse applied by Requiem deals 1/8 max HP each turn. If this Pokemon knocks out a target with a move, it restores 1/8 max HP per target knocked out. When this Pokemon faints, it creates Haunted Field for 5 turns and marks its direct attacker.",
		shortDesc: "80 BP-and-below moves 1.5x; marks foes Perish Song -> Curse -> Mean Look; harvest heals.",
	},
	moonlitwings: {
		name: "Moonlit Wings",
		desc: "This Pokemon has Serene Grace and Shield Dust's effects, gains STAB on Fairy-type moves, takes half damage from Fire-type attacks, and is immune to status, Yawn, and confusion.",
		shortDesc: "Fairy STAB + Serene Grace + Shield Dust; takes 0.5x Fire damage; immune to status.",
	},
	terastaladaptability: {
		name: "Terastal Adaptability",
		desc: "This Pokemon has Adaptability's effect for Rock- and Poison-type moves. Its non-STAB damaging moves deal 1.5x damage. After it uses a damaging move, it gains that type's resistances until it uses another damaging move.",
		shortDesc: "Rock/Poison Adaptability; non-STAB 1.5x; gains last move type's resistances.",
	},
	shellprison: {
		name: "Shell Prison",
		desc: "This Pokemon has Shell Armor and Ice Body's effects. When hit by an attack, it automatically uses Clamp on the attacker; this Clamp traps through the turn it triggers and the next turn. This Pokemon restores 1/16 max HP at the end of each turn. Its Defense and Special Defense are 1.5x in Fairy Tale, Water Surface, Underwater, Cold Eclipse, and Ashen Beach.",
		shortDesc: "Shell Armor + Ice Body; hit uses short Clamp; heals; field Def/SpD 1.5x.",
	},
	shelltrap: {
		name: "Shell Trap",
		desc: "This Pokemon has Shell Prison, Regenerator, and Shell Armor's effects. When hit by an attack, it automatically uses Clamp on the attacker; this Clamp traps through the turn it triggers and the next turn. This Pokemon restores 1/16 max HP at the end of each turn and restores 1/3 max HP when it switches out. Its Defense and Special Defense are 1.5x in Fairy Tale, Water Surface, Underwater, Cold Eclipse, and Ashen Beach.",
		shortDesc: "Shell Prison + Regenerator + Shell Armor; field Def/SpD 1.5x.",
	},
	rollingassault: {
		name: "Rolling Assault",
		desc: "This Pokemon has Filter's effect. Rollout starts at 50 Base Power, does not lock the user into the move, and permanently gains 30 Base Power each time this Pokemon uses it. When this Pokemon uses Rollout, Rolling Kick, or Rapid Spin, its Speed rises by 1 stage.",
		shortDesc: "Filter; Rollout scales by +30 without lock; rolling/Rapid Spin gives +1 Spe.",
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
	wickedcommand: {
		name: "Wicked Command",
		desc: "This Pokemon has Insomnia and Super Luck's effects and takes 20% less damage from other Pokemon's damaging moves. If this Pokemon knocks out an enemy with a move, its higher attacking stat is raised by 1 stage, with Attack chosen on a tie. It also restores 1/4 of its maximum HP and removes entry hazards from its side.",
		shortDesc: "Insomnia + Super Luck; takes 0.8x damage; KO boosts higher offense, heals 1/4, clears hazards.",
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
		shortDesc: "Status moves ignore Abilities and move last; before status takes 0.75x; status heals 1/8.",
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
		desc: "This Pokemon has Overcoat's effect. Before using a physical move, it becomes Fighting type; before using a special move, it becomes Psychic type. If its Special Attack is higher than its Attack, its physical moves may use Special Attack for damage calculation while still targeting Defense.",
		shortDesc: "Overcoat; physical moves turn it Fighting and can use SpA; special moves turn it Psychic.",
	},
	voidveil: {
		name: "Void Veil",
		desc: "This Pokemon has Telepathy and Temporal Shift's effects, but its delayed Future Sight starts after one turn out and queues every other turn. Its delayed Future Sight becomes Fairy type if that would hit the target harder. In Cold Eclipse, this delayed Future Sight is 90 Base Power instead of 60. It is immune to Gravity and its negative effects. This Pokemon and its allies cannot have their Speed lowered. At the end of each turn, this Pokemon and its ally restore 1/16 max HP. If an opposing attack would knock out this Pokemon's ally while this Pokemon is above 25% HP, this Pokemon takes that damage instead. Once per switch-in, if an ally is at 25% HP or lower at the end of the turn, that ally heals 1/4 max HP, is cured of status, and is sheltered until the end of the next turn.",
		shortDesc: "Telepathy + delayed Void Future Sight; Cold Eclipse makes it 90 BP; protects allies.",
	},
	knightsguard: {
		name: "Knight's Guard",
		desc: "This Pokemon cannot flinch, and a blocked flinch raises its Speed by 1 stage. Its ally takes 25% less damage from priority moves. Once per switch-in, if its ally is at 25% HP or lower at the end of the turn, this Pokemon's Attack and Speed rise by 1 and its ally takes 25% less damage from attacks until the end of the next turn. The first time this Pokemon would be knocked out by a move, it survives with 1 HP.",
		shortDesc: "Blocks flinch and gains Speed from it; ally resists priority; low-HP ally triggers Last Stand.",
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
		desc: "If an enemy hits this Pokemon with a contact move, all opposing Pokemon get Perish Song. If an affected opposing Pokemon already has Perish Song, its countdown is reduced by 1 instead. During Haunted Field, affected foes are trapped while adjacent to this Pokemon. This effect is blocked by Holy Field and does not trigger from allies.",
		shortDesc: "Enemy contact gives foes Perish Song; repeat hits reduce the count; traps in Haunted Field.",

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
		desc: "This Pokemon's contact moves ignore a target's protection and deal 1/4 the usual damage. This Pokemon also has Power Drill's effect, boosting drill moves by 1.5x.",
		shortDesc: "Contact pierces protection. Has Power Drill.",
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
		desc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Special Attack is multiplied by 1.5.",
		shortDesc: "If an active ally has this Ability or the Minus Ability, this Pokemon's Sp. Atk is 1.5x.",
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
		desc: "This Pokemon copies the Ability of an ally that faints. Abilities that cannot be copied are As One, Battle Bond, Comatose, Commander, Disguise, Embody Aspect, Flower Gift, Forecast, Hunger Switch, Ice Face, Illusion, Imposter, Multitype, Neutralizing Gas, Poison Puppeteer, Power Construct, Power of Alchemy, Protosynthesis, Quark Drive, Receiver, RKS System, Schooling, Shields Down, Stance Change, Tera Shell, Tera Shift, Teraform Zero, Trace, Wonder Guard, Zen Mode, and Zero to Hero.",
		shortDesc: "This Pokemon copies the Ability of an ally that faints.",
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
		desc: "This Pokemon has Prism Armor, Heatproof, and Sand Force's effects. It restores 1/16 of its maximum HP after it hits with a damaging move and after it is hit by a damaging move. Once per battle, it survives a KO from a move at 1 HP.",
		shortDesc: "Prism Armor + Heatproof + Sand Force; heals 1/16 on attacking/being hit; endures once.",
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
		desc: "If Sun or Electric Terrain is active, this Pokemon's Speed is doubled. This Pokemon's Fighting-type and Electric-type moves have 1.5x power.",
		shortDesc: "Sun/Electric Terrain: Speed 2x. Fighting/Electric moves have 1.5x power.",
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
		shortDesc: "This Pokemon's offensive stat is multiplied by 1.5 while using a Rock-type attack.",
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
	runaway: {
		name: "Run Away",
		shortDesc: "No competitive use.",
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
		desc: "This Pokemon absorbs Water- and Ice-type attacks to restore 1/4 of its maximum HP. It also has Ice Body and Hydration's effects.",
		shortDesc: "Absorbs Water/Ice moves; Ice Body + Hydration.",
	},
	seablessing: {
		name: "Sea Blessing",
		desc: "This Pokemon's Defense and Special Defense are multiplied by 1.5. On switch-in, this Pokemon and its adjacent allies restore 1/4 max HP, and this Pokemon gains Aqua Ring. This Pokemon has Hydration, Water Veil, and Rain Dish's effects.",
		shortDesc: "1.5x Def/SpD; entry heals self/allies 1/4; Hydration + Water Veil + Rain Dish.",
	},
	sapsipper: {
		name: "Sap Sipper",
		desc: "This Pokemon is immune to Grass-type moves and raises its Attack by 1 stage when hit by a Grass-type move.",
		shortDesc: "This Pokemon's Attack is raised 1 stage if hit by a Grass move; Grass immunity.",
	},
	schooling: {
		name: "Schooling",
		desc: "On switch-in, if this Pokemon is a Wishiwashi that is level 20 or above and has more than 1/4 of its maximum HP left, it changes to School Form. If it is in School Form and its HP drops to 1/4 of its maximum HP or less, it changes to Solo Form at the end of the turn. If it is in Solo Form and its HP is greater than 1/4 its maximum HP at the end of the turn, it changes to School Form. While in School Form, it has Hydra Bond's effect.",
		shortDesc: "Wishiwashi changes forms by HP; School Form has Hydra Bond.",

		transform: "[POKEMON] formed a school!",
		transformEnd: "[POKEMON] stopped schooling!",
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
		desc: "This Pokemon's Normal-type moves become the type matching its primary type and have 1.2x power. Its kicking moves have 1.4x power. This Pokemon has Chlorophyll's effect. At the end of the turn, it changes forme to match the weather: Spring in rain, Summer in sun, Autumn in sandstorm, and Winter in hail or snow.",
		shortDesc: "Normal moves become primary type at 1.2x; kicks 1.4x; Chlorophyll; weather changes forme.",
	},
	shadowshield: {
		name: "Shadow Shield",
		shortDesc: "If this Pokemon is at full HP, damage taken from attacks is halved.",
	},
	shadowguard: {
		name: "Shadow Guard",
		desc: "This Pokemon has Shadow Shield and Elevate's effects. It also queues a full-power Temporal Shift Future Sight every turn, using whichever of Ghost, Dark, or Fairy would hit the target best.",
		shortDesc: "Shadow Shield + Elevate; every turn queues full-power Ghost/Dark/Fairy Temporal Shift.",
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
		desc: "This Pokemon has Sharpness's effect. This Pokemon gains STAB on Fighting-type moves and has Fighting-type resistances.",
		shortDesc: "Sharpness; gains Fighting STAB and resistances.",
	},
	shedskin: {
		name: "Shed Skin",
		desc: "At the end of each turn, this Pokemon has a 50% chance to cure its non-volatile status, remove common negative effects, reset its negative stat stages to 0, and restore 1/3 max HP. This can also activate while below half HP.",
		shortDesc: "50% chance to cleanse negatives, reset negative stat stages, and heal 1/3.",
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
		shortDesc: "Cannot be crit; takes 0.8x damage from attacks.",
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
		shortDesc: "If this Pokemon strikes with a critical hit, the damage is multiplied by 1.5.",
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
		desc: "On switch-in, all active Pokemon's stat stages are reset to 0, except Pokemon on a side protected by Safeguard, and Reflect, Light Screen, and Aurora Veil are removed from both sides. While this Pokemon is active, Reflect, Light Screen, and Aurora Veil cannot be created, enemy stat boosts fail, and enemy-caused stat drops fail. This Pokemon's own self-inflicted stat drops still work. This Pokemon's charge moves fire immediately without charge turns, but recharge moves still require recharge. Neutralization disables these Royal Decree effects while active.",
		shortDesc: "Haze/screen clear; Safeguard blocks reset; blocks setup/screens; skips charge turns.",
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
		desc: "This Pokemon always has Dry Skin's effects, gains Grass-type resistances without Grass-type weaknesses, is immune to powder moves, and is healed by Black Sludge. This Ability cannot be suppressed or ignored and is immune to Neutralization's stat drops and Royal Decree's stat control. When hit by a damaging move, there is a 50% chance to inflict sleep, paralysis, or poison on the attacker. While it has more than 50% HP, its weaknesses are neutralized, incoming damage is reduced to 0.8x, it is protected from indirect damage including entry hazards, opposing status moves fail against it, and secondary effects from attacks are blocked.",
		shortDesc: "Dry Skin + Grass resistances; ignores Neutralization/Royal Decree.",
	},
	pendulumswing: {
		name: "Pendulum Swing",
		desc: "This Pokemon's accuracy is multiplied by 1.5, and its Special Attack is multiplied by 1.5.",
		shortDesc: "1.5x accuracy and 1.5x Sp. Atk.",
	},
	tremor: {
		name: "Tremor",
		desc: "On switch-in, this Pokemon summons Sandstorm. This Pokemon is immune to Ground-type moves. Sound-based moves used by this Pokemon become physical, use Attack, have 1.5x power, and ignore sound-based Ability immunities. Sound-based moves used by this Pokemon's allies have 1.5x power and use the user's higher offensive stat. This Pokemon's side is immune to its own damaging sound-based moves.",
		shortDesc: "Sand Stream + Levitate; side sound moves 1.5x; user sound moves physical/use Atk.",
	},
	resonanceforce: {
		name: "Resonance Force",
		desc: "Sound-based moves used by this Pokemon's side deal 1.5x damage. This Pokemon's side is immune to its own damaging sound-based moves. Sound-based moves used by this Pokemon use Attack instead of their usual attacking stat.",
		shortDesc: "Side's sound moves 1.5x; allies avoid own damaging sound moves; user's sound moves use Atk.",
	},
	verdantdrake: {
		name: "Verdant Drake",
		desc: "This Pokemon's Grass- and Dragon-type moves have 1.2x power. It takes 0.75x damage from Fire- and Ice-type attacks. When it switches out, it restores 33% of its maximum HP.",
		shortDesc: "Grass/Dragon moves 1.2x; 0.75x Fire/Ice damage; restores 33% on switch-out.",
	},
	solarbloom: {
		name: "Solar Bloom",
		desc: "If sun is active, this Pokemon transforms into Cherrim-Sunshine and restores 1/8 of its maximum HP. While sun is active, its Speed is doubled.",
		shortDesc: "In sun: becomes Sunshine, heals 1/8, and has doubled Speed.",
	},
	wrathshield: {
		name: "Wrath Shield",
		desc: "This Pokemon has Sworn Duty's effect. After this Pokemon uses a damaging move, the next enemy attack that hits it raises its Attack and Defense by 1 stage and restores 1/16 of its maximum HP. Additional hits do not trigger this again until this Pokemon uses another damaging move. It takes 0.8x damage from attacks. It has Bulletproof's effect, blocks moves boosted by Mega Launcher, cannot be critically hit, and raises Special Defense by 1 stage and restores 1/16 max HP the first time its stats are lowered each turn.",
		shortDesc: "Sworn Duty; takes 0.8x; after attacking, next enemy hit gives +1 Atk/Def and heals.",
	},
	shadowcurrent: {
		name: "Shadow Current",
		desc: "This Pokemon has Sworn Duty and Infiltrator's effects. Before using a move, this Pokemon becomes the move's type. Its moves with less than 80 Base Power have 1.5x power. This Pokemon takes 0.75x damage from attacks. Water Shuriken's first hit is 90 Base Power, followed by 1 to 6 weaker hits that still receive the low-power boost.",
		shortDesc: "Sworn Duty + Infiltrator; Protean; <80 BP 1.5x; Water Shuriken opens at 90 BP.",
	},
	astralwitchcraft: {
		name: "Astral Witchcraft",
		desc: "This Pokemon has Sworn Duty's effect. It is airborne, immune to Ground-type moves, only takes damage from direct attacks, and reflects most non-damaging moves back at the user.",
		shortDesc: "Sworn Duty + Levitate + Magic Guard + Magic Bounce.",
	},
	blazingtempo: {
		name: "Blazing Tempo",
		desc: "At the end of each turn, this Pokemon's Speed rises by 1 stage. Its Fire- and Fighting-type moves have 1.2x power if its Speed has been raised.",
		shortDesc: "Speed rises each turn; Fire/Fighting moves 1.2x if Speed is boosted.",
	},
	ragingcurrent: {
		name: "Raging Current",
		desc: "If rain is active, this Pokemon's Speed is doubled. It has Damp and Water Veil's effects, and takes 0.5x damage from Fire-type moves.",
		shortDesc: "Swift Swim + Damp + Water Veil; 0.5x Fire damage.",
	},
	toxicbloom: {
		name: "Toxic Bloom",
		desc: "This Pokemon takes 0.9x damage from attacks and 0.75x additional damage from Fire- and Ice-type attacks, is immune to hail damage, and restores 1/16 of its maximum HP at the end of each turn. Its Giga Drain has 2x power. It draws in Poison-type moves, is immune to them, and raises Attack and Special Attack by 1 stage when hit by one.",
		shortDesc: "Takes 0.9x; extra 0.75x Fire/Ice; heals; Giga Drain 2x; absorbs Poison.",
	},
	siegelauncher: {
		name: "Siege Launcher",
		desc: "This Pokemon has Shell Armor's effect and ignores Steel's Fire-, Fighting-, and Ground-type weaknesses. It takes 0.8x damage from attacks. Its Water Pulse has 2x power. Its other pulse, aura, beam, cannon, and bullet moves have 1.5x power and trigger Dual Wield. If the target is protected by Reflect, Light Screen, or Aurora Veil, those moves have 1.3x power instead and ignore those effects. When Dual Wield applies to these launcher moves, the first hit keeps the full launcher boost and the second hit deals 30% of that boosted damage. Its moves cannot be redirected. Its attacks heal 30% of the damage dealt, doubled against G-Max Pokemon, up to 33% of its max HP per hit. It restores 1/16 of its maximum HP at the end of each turn.",
		shortDesc: "Shell Armor; no Steel weaknesses; takes 0.8x; launcher moves boosted + Dual Wield; drains.",
	},
	calderacore: {
		name: "Caldera Core",
		desc: "This Pokemon has Thick Fat's effect. Its Fire- and Ground-type moves have 1.2x power. It takes 0.5x damage from Water-type attacks. At the end of each turn, opposing Pokemon lose 1/16 max HP unless they are Fire, Ground, Rock, or airborne.",
		shortDesc: "Thick Fat; Fire/Ground moves 1.2x; 0.5x Water; chips vulnerable foes.",
	},
	soultag: {
		name: "Soul Tag",
		desc: "This Pokemon has Soul Fire and Temporal Shift's effects, and prevents adjacent opposing Pokemon from switching out.",
		shortDesc: "Soul Fire + Temporal Shift + Shadow Tag.",
	},
	speedboost: {
		name: "Speed Boost",
		desc: "This Pokemon's Speed is raised by 1 stage at the end of each full turn it has been on the field.",
		shortDesc: "This Pokemon's Speed is raised 1 stage at the end of each full turn on the field.",
	},
	spicyspray: {
		name: "Spicy Spray",
		shortDesc: "If this Pokemon is hit by an attack, the attacker becomes burned.",
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
		shortDesc: "Enemy hits raise Def + heal 1/16 once/turn; first special hit raises SpD + heals; first below-half hit heals 25%.",
	},
	stancechange: {
		name: "Stance Change",
		desc: "If this Pokemon is an Aegislash, it changes to Blade Forme before using an attacking move, and changes to Shield Forme before using King's Shield. This Pokemon has Dual Wield's effect and restores 1/16 of its maximum HP at the end of each turn. Aegislash takes 20% less damage in Shield Forme, and in Free-For-All, consecutive hits against Shield Forme in the same turn deal 30% less damage. Aegislash-Blade's damaging moves deal 1.2x damage.",
		shortDesc: "Changes Forme; Dual Wield; heals 1/16. Shield bulkier; Blade deals 1.2x.",
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
		desc: "This Pokemon's Speed is raised by 6 stages after it is damaged by a Fire- or Water-type move.",
		shortDesc: "This Pokemon's Speed is raised by 6 stages after it is damaged by Fire/Water moves.",
	},
	steelworker: {
		name: "Steelworker",
		shortDesc: "This Pokemon's offensive stat is multiplied by 1.5 while using a Steel-type attack.",
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
		desc: "For each fainted ally, this Pokemon's moves deal 1.1x damage and it takes 5% less damage from attacks, with no limit; in Free-for-All, fainted allies count twice. This Pokemon also takes 10% less damage from all damaging moves. This updates even while this Pokemon is active. At 1 or more fainted allies, its Attack cannot be lowered. At 2 or more, it cannot flinch. At 3 or more, it takes 25% less damage from super effective attacks and once per battle endures at 1 HP if it would be knocked out from above half HP. At 4 or more, its Dark- and Steel-type moves ignore screens. At 5 fainted allies, it gains Magic Guard's effect and its Attack rises by 1 stage. It restores 1/16 max HP at the end of each turn.",
		shortDesc: "Fallen allies boost/reduce damage; doubled in FFA; 10% less damage; 5 gives Magic Guard.",

		activate: "  [POKEMON] gained strength from the fallen!",
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
		shortDesc: "This Pokemon's healing moves have their priority increased by 3.",
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
		desc: "This Pokemon ignores other Pokemon's Attack, Special Attack, and accuracy stat stages when taking damage, and ignores other Pokemon's Defense, Special Defense, and evasiveness stat stages when dealing damage.",
		shortDesc: "This Pokemon ignores other Pokemon's stat stages when taking or doing damage.",
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
		shortDesc: "This Pokemon's contact moves ignore the target's protection, except Max Guard.",
	},
	phantomfist: {
		name: "Phantom Fist",
		desc: "This Pokemon has Unseen Fist's effect. Its punching moves have 1.3x power. Its Ghost-type punching moves ignore immunities and resistances. If this Pokemon hits through Protect, Detect, Spiky Shield, Baneful Bunker, King's Shield, or Obstruct with a punching move, its Attack rises by 1 stage.",
		shortDesc: "Unseen Fist; punching moves 1.3x; Ghost punches ignore immunities/resists.",
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
		shortDesc: "This Pokemon cannot fall asleep. Gaining this Ability while asleep cures it.",
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
		desc: "This Pokemon's offensive stat is doubled while using a Water-type attack. If a Pokemon uses a Fire-type attack against this Pokemon, that Pokemon's offensive stat is halved when calculating the damage to this Pokemon. This Pokemon has Water Veil's effects: it cannot be burned, gaining this Ability while burned cures it, it is immune to Hail and Sandstorm damage, and it gains Aqua Ring on switch-in.",
		shortDesc: "Water power 2x; Fire power against it halved; Water Veil + Aqua Ring.",
	},
	watercompaction: {
		name: "Water Compaction",
		shortDesc: "This Pokemon's Defense is raised 2 stages after it is damaged by a Water-type move.",
	},
	waterveil: {
		name: "Water Veil",
		desc: "This Pokemon cannot be burned and is immune to Hail and Sandstorm damage. Gaining this Ability while burned cures it. On switch-in, it gains Aqua Ring.",
		shortDesc: "Cannot be burned; immune to Hail/Sandstorm; gains Aqua Ring.",
	},
	riptidejaw: {
		name: "Riptide Jaw",
		desc: "This Pokemon has Water Veil and Strong Jaw's effects. It cannot be burned, creates Aqua Ring on switch-in, and its biting moves have 1.5x power. The first damaging move this Pokemon uses after switching in has +1 priority.",
		shortDesc: "Water Veil + Aqua Ring + Strong Jaw; first damaging move after switch-in has +1 priority.",
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
		desc: "If this Pokemon is a Palafin in Zero Form, switching out has it change to Hero Form. This Pokemon gains STAB on Fighting-type moves and gains Fighting's Bug-, Dark-, and Rock-type resistances. Once per battle, if this Pokemon would be knocked out, it survives at 1 HP. While in Hero Form, it has Friend Guard's effect. When it switches in as Hero Form, it and its ally restore 1/8 max HP and are cured of status, or restore 1/4 max HP if below half HP.",
		shortDesc: "Switches out into Hero. Fighting STAB/resists; once survives at 1 HP. Hero: Friend Guard + heal.",

		activate: "  [POKEMON] underwent a heroic transformation!",
	},
	battlefervor: {
		name: "Battle Fervor",
		desc: "If this Pokemon moves before its target, its attacks deal 1.2x damage. Once per switch-in, if it would move after the attacker, damaging attacks against it deal 0.8x damage. The first time per battle it is hit by an opposing damaging move, its Attack and Special Attack rise by 1 stage. Foes cannot eat Berries while this Pokemon is active, and Seed items are prevented.",
		shortDesc: "Fast attacks 1.2x; once per switch-in slow takes 0.8x; hit boosts once; blocks Berries.",
	},
	duskilate: {
		name: "Duskilate",
		desc: "This Pokemon's Normal-type moves become Dark-type moves and have their power multiplied by 1.3.",
		shortDesc: "Normal moves become Dark type and have 1.3x power.",
	},
	execution: {
		name: "Execution",
		desc: "Deals more damage the lower the target's HP is and built in Duskilate. This Pokemon has Sworn Duty's effect. If the target is at 50% HP or lower, this Pokemon's attacks deal 2x damage. If this Pokemon knocks out another Pokemon with a move, it restores 1/8 of its maximum HP per target knocked out. Its Attack and Special Attack cannot be lowered below -1, and fields prevent its Speed from being lowered.",
		shortDesc: "Built-in Duskilate + Sworn Duty; 2x vs targets at 50% HP or lower; KO heals.",
	},
	echofiend: {
		name: "Echo Fiend",
		desc: "This Pokemon is immune to sound moves, and this immunity cannot be suppressed. Its sound moves become Flying type and have 1.5x power. This Pokemon's side is immune to its own damaging sound-based moves.",
		shortDesc: "Unsuppressible sound immunity; sound moves become Flying and have 1.5x power; allies avoid own sound damage.",
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
		desc: "On switch-in, this Pokemon restores 20% of its own maximum HP and 20% of each adjacent ally's maximum HP. This Pokemon takes 0.8x damage from attacks and its Grass-type moves have 1.2x power. When this Pokemon is hit by a damaging attack, the attacker has a 30% chance to be poisoned, paralyzed, or put to sleep. This Pokemon restores 1/16 max HP at the end of each turn.",
		shortDesc: "Heals self/allies on entry; takes 0.8x; Grass 1.2x; Effect Spore; 1/16 recovery.",
	},
	fortressshell: {
		name: "Fortress Shell",
		desc: "This Pokemon ignores Steel's Fire-, Fighting-, and Ground-type weaknesses. Its Water-type moves have 1.2x power. This Pokemon takes 0.8x damage from attacks, and its allies take 0.8x damage from attacks. While this Pokemon is active, it and its allies cannot be hit by critical hits. This Pokemon restores 1/16 max HP at the end of each turn. Fairy Tale, New World, Cold Eclipse, and Starlight Arena give this Pokemon +1 Defense and +1 Special Defense once per active terrain.",
		shortDesc: "No Steel weaknesses; Water 1.2x; 0.8x damage; side blocks crits; field +Def/SpD.",
	},
	hydrabond: {
		name: "Hydra Bond",
		desc: "This Pokemon's damaging moves become multi-hit moves that hit three times. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power.",
		shortDesc: "Damaging moves hit 3 times; hits 2/3 have 30% power. FFA: single-target hits all foes at 1.3x.",
	},
	imperialmandate: {
		name: "Imperial Mandate",
		desc: "At 50% HP or higher, this Pokemon's damage dealt is doubled. Below 50% HP, its Speed is doubled instead. It also deals 1.2x damage, takes 0.8x damage from attacks, and restores 1/16 max HP at the end of each turn. In Fairy Tale, Cold Eclipse, and New World, it raises Defense and Special Defense by 1 and deals 1.5x damage.",
		shortDesc: "High HP doubles damage; low HP doubles Speed; 0.8x taken; 1/16 recovery.",
	},
	phantombarrage: {
		name: "Phantom Barrage",
		desc: "This Pokemon has Clear Body, Infiltrator, Levitate, and Hydra Bond's effects, and restores 1/16 max HP at the end of each turn. Dragon Darts and G-Max Spirit Volley use this Pokemon's higher offensive stat. In Free-for-All battles, Dragon Darts and G-Max Spirit Volley hit all opposing Pokemon twice.",
		shortDesc: "Clear Body + Infiltrator + Levitate + Hydra Bond; heals 1/16.",
	},
	hydrabreaker: {
		name: "Hydra Breaker",
		desc: "This Pokemon has Hydra Bond and Mold Breaker's effects. Its damaging moves become three-hit attacks, with the second and third hits dealing 30% damage, and its moves ignore Abilities.",
		shortDesc: "Hydra Bond + Mold Breaker.",
	},
	hydratyrant: {
		name: "Hydra Tyrant",
		desc: "This Pokemon has Hydra Bond's effects. Its damaging moves become three-hit attacks, with the second and third hits dealing 30% damage. Its super-effective attacks deal 1.3x damage. When this Pokemon gets a KO, it raises either Speed or the offensive stat used for the KO by 1 stage, whichever is lower.",
		shortDesc: "Hydra Bond; super-effective hits 1.3x; KO boosts lower of Speed/offense used.",
	},
	burningcrown: {
		name: "Burning Crown",
		desc: "This Pokemon and its ally cannot have their stats lowered. When a Pokemon faints, this Pokemon and its ally each gain +1 Attack or Special Attack, whichever is higher for that Pokemon. Fire-type moves used by this Pokemon and its ally have 1.2x power. This Pokemon is airborne and immune to Ground-type moves, takes 0.8x damage from attacks, and restores 1/16 max HP at the end of each turn.",
		shortDesc: "User/ally block stat drops; faint boosts higher offense; side Fire 1.2x.",
	},
	pollenbloom: {
		name: "Pollen Bloom",
		desc: "This Pokemon has Thick Fat's Fire- and Ice-type resistance benefits, and its Grass-type moves have 1.3x power. At the end of each turn, opposing non-Grass Pokemon that are not seeded take pollen damage equal to 1/16 max HP, and this Pokemon heals the damage dealt. This damage uses Grass-type effectiveness.",
		shortDesc: "Thick Fat; Grass 1.3x; drains opposing non-Grass foes.",
	},
	waterbarrage: {
		name: "Water Barrage",
		desc: "This Pokemon's Water-type moves have 1.3x power. On switch-in, it gains Aqua Ring. At the end of each turn, opposing non-Water Pokemon take cycling Water damage of 1/16, 2/16, then 3/16 max HP. This damage uses Water-type effectiveness.",
		shortDesc: "Water 1.3x; Aqua Ring; cycling Water chip to non-Water foes.",
	},
	wildfirecore: {
		name: "Wildfire Core",
		desc: "This Pokemon has Dragonize's effect. If it is not Dragon type, it gains STAB on Dragon-type moves. Its Fire-type moves have 1.3x power. This Pokemon takes 0.5x damage from Water-type moves. If Sun or Hail is active, resisted Fire-type moves used by this Pokemon are boosted like Tinted Lens. At the end of each turn, opposing non-Fire Pokemon take Fire-type damage equal to 1/16 max HP, doubled if burned or if this Pokemon used a Fire-type move this turn. This damage uses Fire-type effectiveness.",
		shortDesc: "Dragonize + Dragon STAB; Fire 1.3x; 0.5x Water; fire chip to foes.",
	},
	memoryleak: {
		name: "Memory Leak",
		desc: "This Pokemon's two-turn charge moves no longer require a charging turn. Positive stat boosts this Pokemon would receive are passed to an adjacent ally instead.",
		shortDesc: "Skips charge turns; passes positive stat boosts to an adjacent ally.",
	},
	defragment: {
		name: "Defragment",
		desc: "On switch-in, this Pokemon compares the opposing side's combined Attack and Special Attack. If Attack is higher or tied, its Defense rises; otherwise its Special Defense rises. This Pokemon's moves cannot miss.",
		shortDesc: "Entry defensive boost based on foes' offenses; moves cannot miss.",
	},
	temporalshift: {
		name: "Temporal Shift",
		desc: "This Pokemon's stats cannot be lowered by opposing Pokemon. After one turn out, every other turn it queues a 120 BP Future Sight matching the user's primary type against a random valid opposing target; multiple attacks can be queued and announce their strike turns.",
		shortDesc: "Stats cannot be lowered; after one turn, queues 120 BP Future Sight every other turn.",
	},
	accumulation: {
		name: "Accumulation",
		desc: "This Pokemon has Thick Fat's effect and is immune to sandstorm and hail damage. Belch used by this Pokemon can be used without eating a Berry. At the end of each turn after this Pokemon has been out for at least one turn, it gains a Stockpile stack, up to 3. This does not happen if its last move was Spit Up or Swallow. Once it reaches 3 Stockpile stacks, every other turn it chooses the foe and whether Belch or Spit Up would deal more damage, then uses only that move. Automatically used Spit Up respects protection and invulnerability. If this Pokemon uses Spit Up, it follows with Belch on the same target and loses 1 Stockpile stack. If this Pokemon uses Belch, it does not follow with Spit Up. If this Pokemon uses Swallow, it also uses Spit Up and Belch on the best target before consuming its Stockpile.",
		shortDesc: "Thick Fat; Belch needs no Berry; auto-builds Stockpile; Spit Up/Swallow combo into Belch.",
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
	ironclad: {
		name: "Ironclad",
		desc: "This Pokemon's Normal-type moves become Steel-type moves and have their power multiplied by 1.2.",
		shortDesc: "Normal moves become Steel type and have 1.2x power.",
	},
	argentdevotion: {
		name: "Argent Devotion",
		desc: "This Pokemon has built-in Ironclad and Sworn Duty. Steel-type and Fairy-type moves used by this Pokemon deal 1.2x damage. If this Pokemon knocks out another Pokemon with a move, it and its adjacent allies restore 1/8 max HP per target knocked out.",
		shortDesc: "Ironclad + Sworn Duty; Steel/Fairy moves 1.2x; KO heals user/allies.",
	},
	ironcognition: {
		name: "Iron Cognition",
		desc: "This Pokemon has Tough Claws, Full Metal Body, and Prism Armor's effects.",
		shortDesc: "Tough Claws + Full Metal Body + Prism Armor.",
	},
	neutralization: {
		name: "Neutralization",
		desc: "When this Pokemon hits an opposing Pokemon with a damaging or status move, or inflicts status on an opposing Pokemon, the target's higher attacking stat is lowered by 2 stages and Speed is lowered by 1 stage. This does not affect other Neutralization users or Pokemon immune to stat drops, and it does not trigger stat-drop reactive effects. While active, field changes are neutralized, and Rainbow Field ends automatically. Ice Spinner and Steel Roller still remove terrain normally.",
		shortDesc: "Hits lower foe offense/Spe; neutralizes field changes, not active field effects.",
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
		desc: "This Pokemon gains STAB on Steel-type moves, has Power Drill built in, and has Steel-type resistances without gaining Steel-type weaknesses.",
		shortDesc: "Steel STAB; Power Drill; Steel resistances without Steel weaknesses.",
	},
	relentlesshunt: {
		name: "Relentless Hunt",
		desc: "This Pokemon's moves with 60 or less Base Power gain +1 priority. In Fairy Tale, Big Top, Dragon's Den, Mountain, Snowy Mountain, or Cold Eclipse, its damaging moves deal 2x damage. In Desert, Rocky, Forest, Burning, Superheated, Ashen Beach, Water Surface, Cave, Starlight Arena, or New World, its damaging moves deal 1.5x damage.",
		shortDesc: "Moves <=60 BP gain +1 priority; boosted fields give 1.5x or 2x damage.",
	},
	soulfire: {
		name: "Soul Fire",
		desc: "This Pokemon draws in Fire- and Ghost-type moves to itself and is immune to Fire-type moves, Ghost-type moves, Will-O-Wisp, and damaging weather conditions, raising Attack and Special Attack by 1 stage when hit by them. Its Fire- and Ghost-type moves cannot hit Normal-type Pokemon with Ghost-type attacks and are resisted by Steel- and Dark-type Pokemon, but otherwise ignore type resistances. Burns caused by this Pokemon's Fire- and Ghost-type moves or Will-O-Wisp bypass burn immunities, Misty Terrain, and Mist. Fire- and Ghost-type moves from this Ability deal 4x damage to opposing Soul Fire users.",
		shortDesc: "Draws in and absorbs Fire/Ghost; burns bypass immunities; attacks ignore most resists.",
	},
	sinisterblaze: {
		name: "Sinister Blaze",
		desc: "This Pokemon is always burned and its burn can overwrite other status conditions. Burn heals this Pokemon instead of damaging it. While this Pokemon is burned, opposing Pokemon lose doubled burn damage each turn, and this Pokemon heals the damage dealt to each foe this way. This Ability cannot be Skill Swapped, suppressed, copied by Role Play, given by Entrainment, or Traced.",
		shortDesc: "Always burned; burn heals user; foes lose burn damage and heal it; cannot be copied/suppressed.",
	},
	stormsovereign: {
		name: "Storm Sovereign",
		desc: "This Pokemon's moves cannot miss. Its Flying-type and wind-based moves have 1.2x power. Its wind-based moves ignore Substitute, Light Screen, and Aurora Veil.",
		shortDesc: "Moves cannot miss; Flying/wind moves 1.2x; wind bypasses Sub/screens.",
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
	strikersmomentum: {
		name: "Striker's Momentum",
		desc: "This Pokemon's moves cannot miss. When this Pokemon uses a damaging move, its type changes to match that move before attacking. Its kicking moves have 1.3x power. Once per switch-in, if this Pokemon knocks out a target with a kicking move, its Speed rises by 1 stage.",
		shortDesc: "Moves never miss; damaging moves change user's type; kicking moves 1.3x; kick KO gives +1 Spe once.",
	},
	ultraego: {
		name: "Ultra Ego",
		desc: "This Pokemon's moves ignore abilities. At the end of each turn, it restores 1/16 max HP. Once per turn, its damaging attacks heal 1/16 max HP, and if one of its moves knocks out a Pokemon it heals 1/10 max HP. After this Pokemon uses a damaging move, the next opposing damaging hit raises its Attack and Special Attack by 1 and heals 1/16 max HP. Additional hits before it attacks again heal 1/20 max HP. Ally hits never trigger the boost or healing.",
		shortDesc: "Mold Breaker; heals each turn/attack; next enemy hit boosts Atk/SpA.",
	},
	ultrainstinct: {
		name: "Ultra Instinct",
		desc: "This Pokemon's moves ignore abilities. At the end of each turn, it restores 1/16 max HP. Its attacks deal 2x damage against targets protected by Reflect, Light Screen, or Aurora Veil. It cannot flinch and blocks Intimidate. If it moves before the target, its attacks deal 1.5x damage; if attacked before it moves, it takes 30% damage and once per battle can endure a KO from above 50% HP at 1 HP.",
		shortDesc: "Heals 1/16; ignores abilities; 2x vs screens; fast attacks/pre-move guard.",
	},
	duskdrive: {
		name: "Dusk Drive",
		desc: "At the end of each turn, this Pokemon restores 1/16 max HP. Once per turn, its damaging attacks heal 1/16 max HP. After this Pokemon uses a damaging move, the next opposing damaging hit raises its Attack and Special Attack by 1 and heals 1/16 max HP. If it moves before the target, its attacks deal 1.5x damage. In a boosted field, its attacks deal 1.3x damage. If attacked before moving, it takes 50% damage; in a boosted field, it takes 60% damage instead.",
		shortDesc: "Heals each turn/attack; next enemy hit boosts; fast 1.5x; field 1.3x/0.6x taken.",
	},
	burningego: {
		name: "Burning Ego",
		desc: "This Pokemon has Ultra Ego, Reckless, and Moxie's effects. Its moves ignore abilities, it restores 1/16 max HP at the end of each turn, and once per turn its damaging attacks heal 1/16 max HP. After it uses a damaging move, the next opposing damaging hit raises its Attack and Special Attack by 1 and heals 1/16 max HP; additional hits before it attacks again heal 1/20 max HP. Recoil, crash, Explosion, Self-Destruct, and Misty Explosion are boosted by 1.2x. If this Pokemon takes recoil damage, its Attack rises by 1 stage. If it knocks out a target with a move, its Attack rises by 1 stage.",
		shortDesc: "Ultra Ego + Reckless + Moxie; recoil damage gives +1 Atk.",
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
