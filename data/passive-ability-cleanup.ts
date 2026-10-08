/** Components moved out of exclusive selected packages into existing species passives. */
export const AbilityComponentExclusions: { [id: string]: readonly string[] } = {
 uncheckedassault: ['limber'], cinderscales: ['shielddust'],
 cursedkeepsake: ['frisk'], curseddoll: ['frisk'], cursedmarionette: ['frisk'], cursedarmament: ['frisk'],
 guidinglight: ['illuminate'],
 chargedtail: ['static'],
 woolyconductor: ['static'],
 reservoir: ['damp'],
 baitedbloom: ['stickyhold'],
 invisiblewall: ['soundproof'],
 stormsong: ['soundproof'],
	nobledance: ['owntempo'],
	conductivity: ['soundproof'],
	anchoredbattery: ['suctioncups'],
	spiralevolution: ['levitate', 'infiltrator'],
	toxicevolution: ['levitate'],
	mythicscale: ['levitate'],
	"toxicbloom": [
		"proficient",
	],
	"ancientbloom": [
		"proficient",
	],
	"bloomingsun": [
		"proficient",
	],
	"verdantdrake": [
		"proficient",
	],
	"primalego": [
		"proficient",
	],
	"terraresolve": [
		"proficient",
	],
	"queensguard": [
		"proficient",
	],
	"wrathshield": [
		"proficient",
	],
	"forestsurge": [
		"proficient",
	],
	"atrocity": [
		"proficient",
	],
	"sunsovereign": [
		"proficient",
	],
	"burningcrown": [
		"proficient",
	],
	"plasmaeruption": [
		"proficient",
	],
	"blazingtempo": [
		"proficient",
	],
	"burningspirit": [
		"proficient",
	],
	"burningego": [
		"proficient",
	],
	"astralwitchcraft": [
		"proficient",
	],
	"strikersmomentum": [
		"proficient",
	],
	"perfectstriker": [
		"proficient",
	],
	"siegelauncher": [
		"proficient",
	],
	"fortressshell": [
		"proficient",
	],
	"draconicforce": [
		"proficient",
	],
	"tidaljaw": [
		"proficient",
	],
	"ragingcurrent": [
		"proficient",
	],
	"emperorsresolve": [
		"proficient",
	],
	"shadowbond": [
		"proficient",
	],
	"shadowcurrent": [
		"proficient",
	],
	"highnoon": [
		"proficient",
	],
	"titanpincer": [
		"hypercutter",
	],
	"lockinggrip": [
		"hypercutter",
	],
	"cruelshell": [
		"hypercutter",
	],
	"scaleshelter": [
		"shielddust",
	],
	"lancepoint": [
		"keeneye",
	],
	"nightwatch": [
		"keeneye",
	],
	"royalescort": [
		"sweetveil",
	],
	"templechime": [
		"levitate",
	],
	"voiddrift": [
		"levitate",
	],
	"solaridol": [
		"levitate",
	],
	"lunaridol": [
		"levitate",
	],
};

for (const id of ['apexpredator', 'tyrantdomain', 'auroradomain']) {
 AbilityComponentExclusions[id] = [...(AbilityComponentExclusions[id] || []), 'relicarmor', 'selfsufficient'];
}

/** Shared packages retain the component for users without the matching species passive. */
export const SharedPassiveComponents: { [id: string]: readonly string[] } = {
"parasitism": ["dryskin"],
"safeharbor": ["hydration"],
"witheringshell": ["naturalcure"],
"cinderscales": ["shielddust"],
"vaultkeeper": ["stickyhold"],
"cursedkeepsake": ["frisk"],
"curseddoll": ["frisk"],
"cursedmarionette": ["frisk"],
"cursedarmament": ["frisk"],
"razorreach": ["keeneye"],
"slipstream": ["keeneye"],
"evergreen": ["overcoat"],
"scavenger": ["overcoat"],
"uncheckedassault": ["limber"],
"echofiend": ["soundproof"],
"mourningsnow": ["cursedbody"],
 abysslure: ['illuminate'],
 orchardbond: ['harvest'],
	"venomheal": [
		"hypercutter",
	],
	"venomveil": [
		"liquidooze",
	],
	"elevate": [
		"levitate",
	],
};

export function getAbilityComponentExclusions(id: string, passives: readonly string[] = []): readonly string[] {
	return [...(AbilityComponentExclusions[id] || []),
		...(SharedPassiveComponents[id] || []).filter(p => passives.includes(p))];
}

/** Primitive delegates consult the outer package, including copied packages, before applying an effect. */
export function skipPassiveComponent(battle: Battle, pokemon: Pokemon | undefined, component: string): boolean {
	if (battle.effectState?.speciesPassive === component || battle.effect.id === 'starterpassives') return false;
	if (pokemon?.getPassives().includes(component)) return true;
	const ids = [battle.effect.id, pokemon?.ability,
		pokemon?.ability === 'perfectforesight' ? pokemon.m.perfectForesightAbility : ''];
	return ids.some(id => id && AbilityComponentExclusions[id]?.includes(component));
}

/** Contextual text for partial shared packages; generic descriptions remain intact. */
export const SharedPassiveAbilityDescriptions: {
	[id: string]: { passive: string, desc: string, shortDesc: string },
} = {
 orchardbond: {"passive":"harvest","desc":"Eligible single-target damaging moves hit three times; existing multi-hit moves, spread moves outside Free-for-All, charging moves, delayed attacks, Z/Max moves and moves barred from extra hits are excluded. The second and third hits deal 30% damage and retarget the foe's ally if the first target fainted. In Free-for-All battles, single-target moves hit all foes once at 1.3x power; spread moves hit all foes three times, with later hits at 30% power, and full-power spread moves stay full power. Moves have 1.2x power on Dragon's Den.","shortDesc":"Eligible attacks hit three times; Free-for-All attacks hit all foes."},
	"venomheal": {
		"passive": "hypercutter",
		"desc": "Poison damage instead heals 1/8 max HP. Also heals 1/8 each turn on Corrosive Mist and Murkwater Surface, or while grounded on Corrosive and Wasteland. Contact attackers have a 30% poison chance, or 60% on Wasteland. Its Poison-type moves have 1.5x STAB.",
		"shortDesc": "Poison moves get 1.5x STAB.",
	},
	"venomveil": {
		"passive": "liquidooze",
		"desc": "Prevents and cures burns; immune to sandstorm and hail damage. Gains Aqua Ring on entry. Cures status each turn on Water Surface and Underwater. Moves can poison Steel- and Poison-type foes. Poisoning does not lower their defenses.",
		"shortDesc": "Can poison Steel/Poison foes; burn/weather protection and Aqua Ring.",
	},
	"elevate": {
		"passive": "levitate",
		"desc": "Move KOs raise its highest stat by 1, ignoring stat stages when choosing the stat.",
		"shortDesc": "Move KOs raise its highest stat.",
	},
};

/** New component granted only when the package's original component became a species passive. */
export const SharedPassiveComponentAdditions: {[id: string]: {passive: string, component: string}} = {
 orchardbond: {passive: 'harvest', component: 'stickyhold'},
 abysslure: {passive: 'illuminate', component: 'suctioncups'},
};
export function getAbilityComponentAdditions(id: string, passives: readonly string[] = []): string[] {
 const replacement = SharedPassiveComponentAdditions[id];
 return replacement && passives.includes(replacement.passive) ? [replacement.component] : [];
}

SharedPassiveAbilityDescriptions.orchardbond.desc += ' Other Pokemon cannot remove its held item while it survives, except Sticky Barb.';
SharedPassiveAbilityDescriptions.orchardbond.shortDesc = 'Eligible attacks hit three times; protects its held item.';
SharedPassiveAbilityDescriptions.abysslure = {
 passive: 'illuminate',
 desc: "Absorbs Electric and Water attacks, healing 1/4 max HP and raising Attack and Special Attack by 1. Does not redirect attacks. Prevents forced switching. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface. Heals 1/16 max HP on Electric Terrain and Short-Circuit.",
 shortDesc: 'Absorbs Electric/Water attacks for healing and boosts; prevents forced switching; field healing.',
};

Object.assign(SharedPassiveAbilityDescriptions, {
  "parasitism": {
    "passive": "dryskin",
    "desc": "While above 50% HP, its weaknesses are neutralized, Magic Guard is active, opposing status moves fail, and opposing attack secondary effects are blocked. The first time Parasect would faint, it fake-faints at 1 HP, then becomes Parasect-Parasite at the end of the turn and revives at full HP. This Ability cannot be suppressed and is immune to Neutralization.",
    "shortDesc": "Above half HP, guards weaknesses, indirect damage, status moves and secondaries; one revival."
  },
  "safeharbor": {
    "passive": "hydration",
    "desc": "Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Absorbs other Pokemon's Water moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Underwater, grounded on Water Surface, or grounded and Poison-type on Murkwater Surface.",
    "shortDesc": "Contact frostbite chance; Ice Body, Water Absorb and field healing."
  },
  "witheringshell": {
    "passive": "naturalcure",
    "desc": "Physical hits set Stealth Rock on the attacker's side except in water fields. Switching out restores exactly 1/3 max HP, sharing this recovery with passive Natural Cure. At full HP, survives a hit with at least 1 HP; OHKO moves fail.",
    "shortDesc": "Physical hits set opposing Stealth Rock; switch recovery; Sturdy."
  },
  "razorreach": {
    "passive": "keeneye",
    "desc": "Slicing moves have 1.5x power except on Cold Eclipse. Moves do not make contact and have one extra critical-hit stage. Entry raises accuracy by 1, sharing the Mirror Arena entry reward with passive Keen Eye. Move accuracy is 0.9x on Rocky or Grassy Field; moves have 1.5x power on Mountain or Snowy Mountain.",
    "shortDesc": "Boosts slicing moves and critical-hit rate; no contact; entry accuracy and field bonuses."
  },
  "slipstream": {
    "passive": "keeneye",
    "desc": "Airborne: immune to Ground attacks, Spikes, Toxic Spikes, Sticky Web and Arena Trap unless grounded. Thousand Arrows can still hit. Once per switch-in, its first Flying-type attack to damage a foe sets Tailwind on its side for 3 turns. If Tailwind is already active, its duration is refreshed to 3 turns.",
    "shortDesc": "Airborne; first damaging Flying attack each entry sets three-turn Tailwind."
  },
  "evergreen": {
    "passive": "overcoat",
    "desc": "Applicable Berry effects are doubled, including the full local Ripen behavior.",
    "shortDesc": "Full Ripen."
  },
  "scavenger": {
    "passive": "overcoat",
    "desc": "Other Pokemon cannot lower its Defense. Heals 1/3 max HP on switching out.",
    "shortDesc": "Defense-drop protection; heals 1/3 HP on switching out."
  },
  "echofiend": {
    "passive": "soundproof",
    "desc": "Sound moves become Flying, Fire on Volcanic Field, or Crystal on Crystal Cavern. Sound moves have 1.5x power, or 2x on Cave, Volcanic and Crystal Cavern. Protects allies from allied damaging sound moves. This selected package cannot be suppressed.",
    "shortDesc": "Converts and boosts sound attacks; protects allies from allied sound damage."
  },
  "vaultkeeper": {
    "passive": "stickyhold",
    "desc": "Status moves gain +1 priority. Opposing Dark types block these moves except on Bewitched Woods. While active, opposing moves cannot remove this side's Reflect, Light Screen or Aurora Veil. Normal expiration and damage bypass still work; applicable Mold Breaker effects bypass the protection.",
    "shortDesc": "Prankster; protects this side's screens from opposing removal."
  },
  "mourningsnow": {
    "passive": "cursedbody",
    "desc": "On entry, it summons Hail for 8 turns, and Aurora Veil used by it lasts 8 turns. During Hail or Snow, it heals 1/16 max HP each turn. Its damaging moves of any type gain an additional 30% chance to inflict frostbite, preserving their existing effects; this does not require weather. It is immune to Hail damage. When another Pokemon faints, it restores 1/8 max HP, or 1/4 if the faint was caused by an Ice move, Hail, Snow, or Curse. Damaging hits disable the attacker's move when possible.",
    "shortDesc": "Extended Hail/Veil; frostbite attacks; weather/faint healing; guaranteed eligible Disable."
  }
});

// Latest exact recipient migrations; shared nonrecipients retain their components.
Object.assign(SharedPassiveComponents, {
  "hydroelectric": [
    "dryskin"
  ],
  "doomwarning": [
    "anticipation"
  ],
  "palmmastery": [
    "thickfat"
  ],
  "glacialmass": [
    "thickfat"
  ],
  "apexarmor": [
    "roughskin"
  ],
  "smolderingshroud": [
    "whitesmoke"
  ],
  "silksights": [
    "compoundeyes"
  ],
  "lockjaw": [
    "strongjaw"
  ],
  "freezerburn": [
    "levitate"
  ],
  "voidomen": [
    "serenegrace"
  ],
  "ragingstorm": [
    "battlearmor"
  ],
  "mirechorus": [
    "poisontouch"
  ],
  "undertow": [
    "waterabsorb"
  ],
  "rechargerelay": [
    "battery"
  ],
  "toxicspines": [
    "merciless"
  ],
  "unyielding": [
    "stamina"
  ],
  "saltbastion": [
    "sturdy"
  ],
  "roughscale": [
    "roughskin"
  ]
});

Object.assign(SharedPassiveAbilityDescriptions, {
  "hydroelectric": {
    "passive": "dryskin",
    "desc": "Dealing HP damage with a Water move heals 1/8 max HP once per turn, without stacking across hits or targets. Normal healing restrictions apply.",
    "shortDesc": "Dealing HP damage with a Water move heals 1/8 max HP once per turn, without stacking across hits or targets. Normal healing restrictions apply."
  },
  "doomwarning": {
    "passive": "anticipation",
    "desc": "Reflects eligible status moves and hazards once. On Mirror Arena, reflecting a directly targeted move gives its original user +1 evasion. Prevents indirect damage; HP costs, Pain Split, confusion and Struggle recoil still apply. On fainting, schedules a special, 140-power Steel Doom Desire against each foe. An existing delayed attack is delayed by another 2 turns instead.",
    "shortDesc": "Reflects status moves; no indirect damage; reveals threats; Doom Desire against foes on fainting."
  },
  "palmmastery": {
    "passive": "thickfat",
    "desc": "Force Palm always inflicts paralysis when it lands, subject to status immunities. Its paralysis becomes a primary effect rather than a secondary roll.",
    "shortDesc": "Force Palm always paralyzes when it lands."
  },
  "glacialmass": {
    "passive": "thickfat",
    "desc": "Doubles weight and halves physical attack damage. On entry to Factory Field, Defense rises one stage and Speed falls one stage. On Cold Eclipse, Defense and Sp. Def are 1.5x, the field Speed penalty is ignored, and hail heals 1/10 max HP each turn.",
    "shortDesc": "Halves physical and Fire/Ice damage; hail immunity."
  },
  "apexarmor": {
    "passive": "roughskin",
    "desc": "Blocks bullet, pulse, and Mega Launcher-boosted moves and takes 20% less attack damage. Moves ignore redirection. On New World, Starlight Arena, Fairy Tale and Chessboard entry, gains +1 Sp. Atk. Heals 1/16 max HP each turn and prevents sandstorm and hail damage.",
    "shortDesc": "Combines the listed abilities."
  },
  "smolderingshroud": {
    "passive": "whitesmoke",
    "desc": "The first foe-caused stat-drop event prevented each entry raises Special Attack by 1. Shares White Smoke protection and Volcanic entry boosts with its passive without doubling them.",
    "shortDesc": "First blocked opposing stat drop each entry raises Sp. Atk by 1."
  },
  "silksights": {
    "passive": "compoundeyes",
    "desc": "Ignores evasion boosts, prevents opposing accuracy drops and reveals opposing Illusions on entry. Mirror Arena entry grants +1 accuracy and Laser Focus, sharing this reward with passive Compound Eyes. Electric moves ignore positive defensive stages against foes with lowered Speed.",
    "shortDesc": "No foe accuracy drops; Electric moves bypass boosts on slowed foes."
  },
  "lockjaw": {
    "passive": "strongjaw",
    "desc": "Biting hits inflict Torment on a surviving foe for 2 turns. Does not prevent switching.",
    "shortDesc": "Biting hits inflict Torment on a surviving foe for 2 turns. Does not prevent switching."
  },
  "freezerburn": {
    "passive": "levitate",
    "desc": "Doubles Speed in hail, snow or on Icy, Snowy Mountain and Cold Eclipse. Biting moves have 1.5x power. Eligible Normal moves become Ice with 1.2x power.",
    "shortDesc": "Double Speed in snow and supported fields; stronger biting moves; Normal moves become Ice."
  },
  "voidomen": {
    "passive": "serenegrace",
    "desc": "Mold Breaker + Friend Guard. Once per entry, actually applying a move secondary effect creates a ward that blocks the next opposing stat-drop event against the holder or an adjacent active ally. Positive changes and self-inflicted drops remain. The ward lasts until used or the holder leaves; further secondary effects do not refresh the spent entry reward.",
    "shortDesc": "First applied secondary each entry wards the holder or an ally against one opposing stat-drop event."
  },
  "ragingstorm": {
    "passive": "battlearmor",
    "desc": "Moves ignore bypassable opposing abilities. Attacks bypass Substitute, screens and defensive stat stages and gain +1 critical-hit stage. Takes half damage from priority attacks. Immune to hail damage. Move KOs damage remaining foes by 60% of the last damage dealt; if there is no valid target or no damage is dealt, gains +1 Attack instead. Magic Guard prevents this splash damage. Cannot be suppressed.",
    "shortDesc": "Bypasses screens and defensive stages; halves priority damage; KOs damage other foes."
  },
  "mirechorus": {
    "passive": "poisontouch",
    "desc": "Sound moves become Water-type, or Ice-type on Icy Field, and have 1.2x power. Each foe damaged by a noncontact sound move also has an independent 20% chance to be poisoned. Shield Dust and Covert Cloak block this added poison chance.",
    "shortDesc": "Noncontact sound hits have a 20% poison chance."
  },
  "undertow": {
    "passive": "waterabsorb",
    "desc": "Damaging Water hits ground surviving foes as with Smack Down. Does not trap them or bypass protection, Substitute or Water immunity.",
    "shortDesc": "Damaging Water hits ground surviving foes as with Smack Down. Does not trap them or bypass protection, Substitute or Water immunity."
  },
  "rechargerelay": {
    "passive": "battery",
    "desc": "Switching with Volt Switch restores 1/8 of the incoming teammate's max HP.",
    "shortDesc": "Switching with Volt Switch restores 1/8 of the incoming teammate's max HP."
  },
  "toxicspines": {
    "passive": "merciless",
    "desc": "Physical HP hits set one Toxic Spikes layer on the attacker's side, up to two; allied attacks use the opposing side. Contact attackers also lose 1/6 max HP. Can poison Poison and Steel types; Poison moves bypass Steel immunity. Newly poisoned foes lose 1 Defense and Sp. Def. On Wasteland, move secondary effects become separate 2.5% frostbite, burn, paralysis and poison chances. On Corrosive and Corrosive Mist, incoming damage is multiplied by 1.5.",
    "shortDesc": "Combines the listed abilities."
  },
  "unyielding": {
    "passive": "stamina",
    "desc": "While its Defense stage is positive, opponents cannot force it to switch. Normal switching and stat resets still work.",
    "shortDesc": "While its Defense stage is positive, opponents cannot force it to switch. Normal switching and stat resets still work."
  },
  "saltbastion": {
    "passive": "sturdy",
    "desc": "When passive Sturdy saves it from a direct hit, its side gains Safeguard for 5 turns.",
    "shortDesc": "When passive Sturdy saves it from a direct hit, its side gains Safeguard for 5 turns."
  },
  "roughscale": {
    "passive": "roughskin",
    "desc": "Contact moves have 1.3x power.",
    "shortDesc": "Contact moves have 1.3x power."
  }
});

SharedPassiveComponents.apexbond = ['roughskin'];
SharedPassiveAbilityDescriptions.silksights = {passive: 'compoundeyes', ...{"desc":"Keen Eye prevents external accuracy drops, ignores evasion boosts and reveals opposing Illusions. Mirror Arena entry grants +1 accuracy and Laser Focus once, shared with passive Compound Eyes. Electric attacks ignore positive defensive stages against slowed foes. Once per entry, Bug attacks dealing opposing HP damage to a foe whose Speed was already lowered attempt to Disable its last move through the following turn. Normal Disable eligibility applies; only success consumes the use.","shortDesc":"Keen Eye; Electric bypasses slowed foes' boosts; once/entry Bug HP hit on slowed foe Disables its last move."}};

SharedPassiveComponents.quarrycannon = ['solidrock'];
SharedPassiveAbilityDescriptions.quarrycannon = {passive: 'solidrock', desc: 'Rock Blast hits exactly five times. Its species passive supplies Solid Rock without stacking the damage reduction.', shortDesc: 'Rock Blast hits five times.'};
SharedPassiveAbilityDescriptions.voidomen = {passive: 'serenegrace', desc: 'Mold Breaker and Friend Guard. Its first successful attack secondary creates a ward against one opposing stat-drop event. Once per entry, either a successful attack secondary or successful non-damaging self-targeted move grants 3-turn Safeguard; both routes share one use and do not shorten or refresh longer Safeguard.', shortDesc: 'First successful secondary or self status move: 3-turn Safeguard once/entry; secondary also grants stat-drop ward.'};

SharedPassiveAbilityDescriptions.hydroelectric = {passive: "dryskin", ...{"desc":"Dry Skin is supplied by the species passive. Dealing Water-move HP damage retains the existing once-per-turn 1/8 max HP healing. Once per entry, after a Water attack finishes dealing actual opposing HP damage, gains +1 Speed. Multiple hits and targets grant only one boost; allies, Substitute-only damage, misses, protection and absorption do not qualify. Ability changes do not refresh the entry allowance.","shortDesc":"Water HP hits heal 1/8 once/turn; first Water attack dealing opposing HP damage grants +1 Speed after the move."}};

SharedPassiveAbilityDescriptions.voidomen.desc = SharedPassiveAbilityDescriptions.voidomen.desc.replace('Mold Breaker and ', '');
