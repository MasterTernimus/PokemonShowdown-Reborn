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

export function getAbilityComponentExclusions(id: string, passives: readonly string[] = [], species = ''): readonly string[] {
	return [...(AbilityComponentExclusions[id] || []),
		...(id === 'stormsovereign' && species === 'pidgeotmega' && passives.includes('noguard') ? ['galewings'] : []),
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

AbilityComponentExclusions.parentalbond = ['friendguard'];
AbilityComponentExclusions.ironwill = ['secondwind'];
AbilityComponentExclusions.calderacore = ['sheerforce'];
AbilityComponentExclusions.razorcurrent = ['strongjaw'];

// Contextual Mega extraction leaves copied/shared packages intact on nonrecipients.
SharedPassiveComponents.slowclamp = [...(SharedPassiveComponents.slowclamp || []), 'shellarmor'];
SharedPassiveComponents.crueltag = [...(SharedPassiveComponents.crueltag || []), 'shadowtag'];
SharedPassiveComponents.joyride = [...(SharedPassiveComponents.joyride || []), 'aerilate'];
SharedPassiveComponents.woolyconductor = [...(SharedPassiveComponents.woolyconductor || []), 'moldbreaker'];
SharedPassiveComponents.relentlesslink = [...(SharedPassiveComponents.relentlesslink || []), 'skilllink'];
SharedPassiveComponents.sandsovereign = [...(SharedPassiveComponents.sandsovereign || []), 'sandstream'];
SharedPassiveComponents.voidvoice = [...(SharedPassiveComponents.voidvoice || []), 'pixilate'];
SharedPassiveComponents.mirrorgreed = [...(SharedPassiveComponents.mirrorgreed || []), 'magicbounce'];
SharedPassiveComponents.dreadmaw = [...(SharedPassiveComponents.dreadmaw || []), 'hugepower'];
SharedPassiveComponents.heavenlychorus = [...(SharedPassiveComponents.heavenlychorus || []), 'pixilate'];
SharedPassiveComponents.cursedmarionette = [...(SharedPassiveComponents.cursedmarionette || []), 'prankster'];
SharedPassiveComponents.doomwarning = [...(SharedPassiveComponents.doomwarning || []), 'magicbounce'];
SharedPassiveComponents.freezerburn = [...(SharedPassiveComponents.freezerburn || []), 'refrigerate'];
SharedPassiveComponents.coldlogic = [...(SharedPassiveComponents.coldlogic || []), 'toughclaws'];
SharedPassiveComponents.uncheckedassault = [...(SharedPassiveComponents.uncheckedassault || []), 'scrappy'];
SharedPassiveComponents.aurainstinct = [...(SharedPassiveComponents.aurainstinct || []), 'adaptability'];
SharedPassiveComponents.frostsovereign = [...(SharedPassiveComponents.frostsovereign || []), 'snowwarning'];
SharedPassiveComponents.stormsovereign = [...(SharedPassiveComponents.stormsovereign || []), 'galewings'];
SharedPassiveComponents.ironvise = [...(SharedPassiveComponents.ironvise || []), 'intimidate'];
SharedPassiveComponents.sacrededge = [...(SharedPassiveComponents.sacrededge || []), 'sharpness'];
SharedPassiveComponents.divineintervention = [...(SharedPassiveComponents.divineintervention || []), 'invigorate'];
SharedPassiveComponents.vitalsigns = [...(SharedPassiveComponents.vitalsigns || []), 'invigorate'];
SharedPassiveComponents.lunarorbit = [...(SharedPassiveComponents.lunarorbit || []), 'magicbounce'];
SharedPassiveComponents.astralcore = [...(SharedPassiveComponents.astralcore || []), 'purepower'];

// Explicitly approved selected/passive swaps.
AbilityComponentExclusions.uncheckedassault = [];
AbilityComponentExclusions.cursedmarionette = [];
Object.assign(SharedPassiveComponentAdditions, {
 dreadmaw: {passive: 'hugepower', component: 'strongjaw'},
 heavenlychorus: {passive: 'pixilate', component: 'naturalcure'},
 cursedmarionette: {passive: 'prankster', component: 'frisk'},
 doomwarning: {passive: 'magicbounce', component: 'anticipation'},
 freezerburn: {passive: 'refrigerate', component: 'levitate'},
 uncheckedassault: {passive: 'scrappy', component: 'limber'},
});

// Approved Mega selected/passive separation, used by client and calculator context.
Object.assign(SharedPassiveAbilityDescriptions, {"slowclamp":{"passive":"shellarmor","desc":"Own Tempo, Analytic and Sweet Veil. Shell Armor is supplied by the species passive.","shortDesc":"Own Tempo, Analytic and Sweet Veil."},"crueltag":{"passive":"shadowtag","desc":"Infiltrator and Bad Dreams. Shadow Tag is supplied by the species passive. This selected package is retained pending approval of its replacement.","shortDesc":"Infiltrator and Bad Dreams."},"joyride":{"passive":"aerilate","desc":"Violent Rush and Vital Spirit. Aerilate is supplied by the species passive.","shortDesc":"Violent Rush and Vital Spirit."},"stormsovereign":{"passive":"noguard","desc":"Summons replaceable Strong Winds for 8 turns on entry. Keen Eye prevents opposing accuracy drops, ignores evasion boosts and reveals opposing Illusions; Mirror Arena entry grants +1 accuracy and Laser Focus. No Guard is supplied by the species passive, affecting both incoming and outgoing moves. This holder does not gain Gale Wings priority.","shortDesc":"8-turn Strong Winds and Keen Eye."},"lunarorbit":{"passive":"magicbounce","desc":"Magic Guard, Serene Grace and Triage. Creates Gravity on entry. Magic Bounce is supplied by the species passive.","shortDesc":"Magic Guard, Serene Grace and Triage."},"astralcore":{"passive":"purepower","desc":"Natural Cure and Illuminate. Pure Power is supplied by the species passive, including its Psychic Terrain Special Attack behavior.","shortDesc":"Natural Cure and Illuminate."},"woolyconductor":{"passive":"moldbreaker","desc":"Fluffy. Once per turn, an opposing contact attacker that deals HP damage loses 1 Speed. Mold Breaker is supplied by the species passive.","shortDesc":"Fluffy."},"relentlesslink":{"passive":"skilllink","desc":"Mold Breaker and Power Drill. Skill Link is supplied by the species passive.","shortDesc":"Mold Breaker and Power Drill."},"sandsovereign":{"passive":"sandstream","desc":"Dauntless Shield, Solid Rock and opposing Rock chip damage each turn. Extends its entry sandstorm to eight turns. Sand Stream is supplied by the species passive.","shortDesc":"Dauntless Shield, Solid Rock and opposing Rock chip damage each turn."},"ironvise":{"passive":"intimidate","desc":"Tough Claws, Battle Armor and Light Metal. Intimidate is supplied by the species passive.","shortDesc":"Tough Claws, Battle Armor and Light Metal."},"voidvoice":{"passive":"pixilate","desc":"Queenly Majesty and Dream Sickness, retaining its existing protective and stat-control effects. Pixilate is supplied by the species passive.","shortDesc":"Queenly Majesty and Dream Sickness, retaining its existing protective and stat-control effects."},"mirrorgreed":{"passive":"magicbounce","desc":"Analytic and Filter. Magic Bounce is supplied by the species passive.","shortDesc":"Analytic and Filter."},"dreadmaw":{"passive":"hugepower","desc":"Frisk, Invigorate and Strong Jaw. Huge Power is supplied by the species passive; its Attack multiplier applies once.","shortDesc":"Frisk, Invigorate and Strong Jaw."},"heavenlychorus":{"passive":"pixilate","desc":"Cloud Nine, Fluffy and Natural Cure, including its local field recovery. Pixilate is supplied by the species passive.","shortDesc":"Cloud Nine, Fluffy and Natural Cure, including its local field recovery."},"cursedmarionette":{"passive":"prankster","desc":"Frisk. Retains its curses, curse healing, Haunted Terrain effects and protection against cursed foes. Prankster is supplied by the species passive.","shortDesc":"Frisk."},"doomwarning":{"passive":"magicbounce","desc":"Magic Guard and Anticipation. On fainting, retains its delayed Doom Desire against opposing slots. Magic Bounce is supplied by the species passive.","shortDesc":"Magic Guard and Anticipation."},"freezerburn":{"passive":"refrigerate","desc":"Slush Rush, Strong Jaw and Levitate. Refrigerate is supplied by the species passive, including its field-dependent power boost.","shortDesc":"Slush Rush, Strong Jaw and Levitate."},"coldlogic":{"passive":"toughclaws","desc":"Prism Armor, Aftermath and Forewarn. Tough Claws is supplied by the species passive.","shortDesc":"Prism Armor, Aftermath and Forewarn."},"uncheckedassault":{"passive":"scrappy","desc":"Striker, Opportunist and Limber. Retains confusion prevention and cure. Scrappy is supplied by the species passive.","shortDesc":"Striker, Opportunist and Limber."},"aurainstinct":{"passive":"adaptability","desc":"Dual Wield and Second Wind. Adaptability is supplied by the species passive.","shortDesc":"Dual Wield and Second Wind."},"frostsovereign":{"passive":"snowwarning","desc":"Ice Body and Filter; retains opposing Ice chip damage each turn and its eight-turn entry hail. Snow Warning is supplied by the species passive.","shortDesc":"Ice Body and Filter; retains opposing Ice chip damage each turn and its eight-turn entry hail."},"sacrededge":{"passive":"sharpness","desc":"Dual Wield and entry healing for adjacent allies, including the Fairy Tale bonus. Sharpness is supplied by the species passive.","shortDesc":"Dual Wield and entry healing for adjacent allies, including the Fairy Tale bonus."},"divineintervention":{"passive":"invigorate","desc":"Vital Signs emergency treatment, Triage, Regenerator and Friend Guard. Invigorate is supplied by the species passive: healing received is multiplied by 1.3 once, and each statused adjacent ally has one 50% cure roll per turn. The emergency treatment allowance remains once per recipient per battle.","shortDesc":"Vital Signs emergency treatment, Triage, Regenerator and Friend Guard."}});


// Approved Kanto Mega recipients: keep shared packages intact on other species.
Object.assign(SharedPassiveComponents, {
 neurotoxin: ['regenerator'], patternshift: ['shedskin'],
 surgeconduit: ['electricsurge'], railguncircuit: ['noguard'],
 completeparasitism: ['dryskin'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 neurotoxin: {passive: 'regenerator', shortDesc: 'Hydra Bond and full local Shed Skin.', desc: 'Hydra Bond and full local Shed Skin, including its recovery, cleansing and field effects. Regenerator is supplied by the species passive.'},
 patternshift: {passive: 'shedskin', shortDesc: 'Protean and Unaware.', desc: 'Protean and Unaware, retaining their full local field interactions. Shed Skin is supplied by the species passive.'},
 surgeconduit: {passive: 'electricsurge', shortDesc: 'Absorbs and redirects Electric attacks; recoil protection and damage reduction.', desc: 'Redirects opposing Electric moves and absorbs Electric attacks for +1 Special Attack. Retains Brute Force recoil protection and Shadow Shield damage reduction. Electric Surge is supplied by the species passive through the local field/Aura system.'},
 railguncircuit: {passive: 'noguard', shortDesc: 'Lightning Rod; boosts Electric attacks and resists Ground attacks on Electric Terrain.', desc: 'Retains full local Lightning Rod and its Electric offensive effects: Electric attacks use 1.3x offensive stats, or 2x on Electric or Factory Terrain. Incoming Ground attacks use half offensive stats on Electric Terrain. Full No Guard is supplied by the species passive, affecting both incoming and outgoing moves.'},
 completeparasitism: {passive: 'dryskin', shortDesc: 'Parasitism revival and protection, Filter and Self Repair.', desc: 'Retains Parasitism revival and protection, Filter and Self Repair. All nested Dry Skin effects are supplied once by the species passive. Revival changes to Parasect-Parasite and its own ability/passive package.'},
});

Object.assign(SharedPassiveComponents, {
 sacredpower: ['insomnia'], silkendecoy: ['selfsufficient'], solarhydra: ['solarpower'], goldentalons: ['stalwart'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 sacredpower: {passive: 'insomnia', shortDesc: 'Duskilate and Magic Guard.', desc: 'Duskilate and Magic Guard retain their full local effects. Insomnia is supplied by the species passive, including sleep prevention and cure, Yawn immunity and 1.3x Dark/Ghost attack power.'},
 silkendecoy: {passive: 'selfsufficient', shortDesc: 'Protective cocoon, Insomnia and Swarm; cocoon renews when another Pokemon faints.', desc: 'Retains its protective cocoon, renewal when another Pokemon faints, Insomnia and Swarm. Self Sufficient is supplied by the species passive: heals 1/16 max HP each turn and prevents sandstorm and hail damage.'},
 solarhydra: {passive: 'solarpower', shortDesc: 'Hydra Bond, Grassy Surge and Solar Bud.', desc: 'Hydra Bond, Grassy Surge and Solar Bud retain their full local effects. Solar Power is supplied by the species passive: 1.5x Special Attack and 1/8 max HP cost in sun, both disabled on Cold Eclipse. Does not grant Self Repair.'},
 goldentalons: {passive: 'stalwart', shortDesc: 'Sharpness and Good as Gold.', desc: 'Sharpness and Good as Gold retain their full local field effects. Stalwart is supplied by the species passive, including redirection bypass and its local field entry Special Attack bonus.'},
});

// Approved Hoenn extraction. Astral Engine and Haunted Chime deliberately retain
// their complete Elevate component, including the allowed redundant Ground immunity.
Object.assign(SharedPassiveComponents, {
 argentdevotion: ['armorize'], execution: ['duskilate'], corrosivetouch: ['technician'],
 desertspirit: ['levitate'], tremor: ['levitate'],
 windchime: ['levitate'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 argentdevotion: {passive: 'armorize', shortDesc: 'Sworn Duty, Serene Grace and Mold Breaker.', desc: 'Sworn Duty, Serene Grace and Mold Breaker retain their full local effects. Armorize is supplied by the species passive, including Steel conversion, its field-dependent power boost and Cold Eclipse hail immunity.'},
 execution: {passive: 'duskilate', shortDesc: 'Double power against foes at half HP or less; retains offense-drop limits, field Speed protection and KO healing.', desc: 'Retains Mold Breaker, double attack power against targets at half HP or less, limits to Attack and Special Attack drops, prevention of Speed drops while a field exists, and 1/8 max HP healing per move KO. Duskilate is supplied by the species passive, retaining its conversion, field power and Cold Eclipse hail immunity.'},
 corrosivetouch: {passive: 'technician', shortDesc: 'Poison Touch, Corrosion and extra Grass STAB.', desc: 'Poison Touch and full local Corrosion remain selected, including their field effects. Grass attacks retain STAB. Technician is supplied by the species passive: 1.5x power at effective base power 60 or less, or 80 or less on Factory Terrain.'},
 desertspirit: {passive: 'levitate', shortDesc: 'Summons sandstorm; doubles resisted damage; Ground attacks gain STAB.', desc: 'Summons sandstorm on entry for 5 turns, or 8 with Smooth Rock. Resisted attacks deal double damage, and Ground attacks receive STAB despite its Dragon/Bug typing. Levitate is supplied by the species passive and follows normal grounding rules.'},
 tremor: {passive: 'levitate', shortDesc: 'Resonance Force, Sand Force and extra Bug STAB.', desc: 'Own and allied damaging sound moves have 1.5x power. Its sound moves use its higher offensive stat without changing category; allied sound attacks do not damage allies. Does not bypass Soundproof. Rock, Ground and Steel attacks have 1.3x power in sandstorm or on Desert/Ashen Beach Terrain, and sandstorm damage is blocked. Bug attacks receive STAB. Levitate replaces the direct Ground immunity as a species passive and follows normal grounding rules.'},
 sirius: {passive: 'venamskiss', shortDesc: 'Apex Venom, Dragon Poison Fang, Shed Skin and full tail effects.', desc: 'Retains full Sirius: Strong Jaw remains selected, and Poison Fang keeps its original single 1.5x power boost and Dragon conversion. Poison Fang and Poison attacks retain their custom Poison/Steel matchups; biting attacks bypass protection and append a 30% toxic chance. Wasteland retains its existing secondary replacement before the added biting toxic chance. Full Shed Skin, +1 entry accuracy, 1.5x tail power and first-tail-hit toxic remain. Venam\'s Kiss is a separate passive: Poison HP hits can poison Steel/Poison foes; pre-poisoned foes are drained and heal-blocked, and poisoned foes have 0.75x Speed. The overlapping Steel matchup applies once; Dragon Poison Fang does not trigger Poison-only passive effects.'},
 windchime: {passive: 'levitate', shortDesc: 'Armorize and Punk Rock.', desc: 'Retains full local Armorize and Punk Rock, including field interactions. The direct Ground immunity is replaced by passive Levitate, which follows normal grounding rules.'},
 astralengine: {passive: 'levitate', shortDesc: 'Elevate, Analytic and Power Spot; Levitate is also a species passive.', desc: 'Retains complete Elevate, including its redundant Ground immunity and highest-stat increase on move KOs, plus Analytic and Power Spot. Levitate is also a species passive. The redundant immunity does not multiply effects or add another KO boost.'},
 hauntedchime: {passive: 'levitate', shortDesc: 'Elevate, Wind Power and Cursed Body; Levitate is also a species passive.', desc: 'Retains complete Elevate, Wind Power and Cursed Body with all local field and fainting effects. Elevate still supplies Ground immunity and one highest-stat increase per move KO. Levitate is also a species passive; the allowed redundant immunity grants no additional KO boost.'},
});
// Approved Sinnoh/Unova migrations; pending redesigns remain unchanged.
Object.assign(SharedPassiveComponents, {
 predator: ['contrary'], nighthunt: ['strongjaw'], voidcraft: ['elevate'],
 stormbell: ['mirrorarmor'], froststalker: ['stakeout'], reapersgrip: ['unaware'],
 streettyrant: ['shedskin'], adaptivepower: ['regenerator'], stormcircuit: ['elevate'],
 soulcremation: ['soulpyre'], phantomfist: ['noguard'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 predator: {passive: 'contrary', shortDesc: 'Conditional power against newly switched, pending-action and authority foes.', desc: 'Retains its existing conditional power and field bonuses. Contrary is supplied by the species passive.'},
 nighthunt: {passive: 'strongjaw', shortDesc: 'Intimidate, Infiltrator, Frisk and Illuminate.', desc: 'Retains Intimidate, Infiltrator, Frisk and Illuminate with their existing local effects. Strong Jaw is supplied by the species passive.'},
 voidcraft: {passive: 'elevate', shortDesc: 'Shadow Shield, Temporal Shift and full Insomnia; retains its recurring hex.', desc: 'Retains Shadow Shield, full Insomnia and its unique Temporal Shift protection and recurring Ghost hex. Entire Elevate is supplied by the species passive: Ground immunity and a highest-stat increase per move KO.'},
 stormbell: {passive: 'mirrorarmor', shortDesc: 'Drizzle and full Elevate.', desc: 'Retains rain on entry and complete Elevate, including Ground immunity and KO boosts. Full local Mirror Armor is supplied by the species passive, including reflection, weather immunity and field bonuses.'},
 froststalker: {passive: 'stakeout', shortDesc: 'Sharpness and Refrigerate.', desc: 'Retains full local Sharpness and Refrigerate. Stakeout is supplied by the species passive and doubles offensive stats against a newly switched target.'},
 reapersgrip: {passive: 'unaware', shortDesc: 'Self Sufficient, Dark Aura and Haunted Terrain reactions.', desc: 'Retains Self Sufficient, Dark Aura and its unique Haunted Terrain triggers. Full local Unaware is supplied by the species passive.'},
 streettyrant: {passive: 'shedskin', shortDesc: 'Entry Attack reduction and ability bypass on damaging moves.', desc: 'Retains its existing opposing Attack reduction and ability bypass for damaging moves. Shed Skin is supplied by the species passive with Scrafty\'s existing 1/8 HP recovery, cleansing and Dragon\'s Den behavior.'},
 adaptivepower: {passive: 'regenerator', shortDesc: 'Huge Power and Magic Guard.', desc: 'Retains Huge Power and Magic Guard. Regenerator is supplied by the species passive.'},
 stormcircuit: {passive: 'elevate', shortDesc: 'Electric Surge, rain/water-field Speed and extra Special Attack from Coil.', desc: 'Retains Electric Surge, its existing rain and water-field Speed multiplier, and Coil\'s additional +1 Special Attack. Entire Elevate is supplied by the species passive: Ground immunity and one highest-stat increase per move KO.'},
 soulcremation: {passive: 'soulpyre', shortDesc: 'Soul Siphon and Malice Well.', desc: 'Retains full Soul Siphon and Malice Well, including their existing field effects. Soul Pyre is supplied by the species passive with its independent burn recovery and Ghost-hit Special Defense drop.'},
 phantomfist: {passive: 'noguard', shortDesc: 'Unseen Fist, Self Repair, Shadow Shield and Aftermath.', desc: 'Retains full Unseen Fist, Self Repair, Shadow Shield and Aftermath. The selected outgoing no-miss effect is replaced by full passive No Guard, affecting incoming and outgoing attacks and normal semi-invulnerability interactions.'},
});
SharedPassiveComponents.auramaster = ['auraguard'];
SharedPassiveAbilityDescriptions.auramaster = {
 passive: 'auraguard', shortDesc: 'Dual Wield, Technician and Inner Focus.',
 desc: 'Retains its existing paired attacks, Technician power and Inner Focus. Contact damage reduction is supplied once by the Aura Guard species passive.',
};
SharedPassiveAbilityDescriptions.predator = {
 passive: 'contrary', shortDesc: '2x power and targeted defense bypass against active Ultra abilities; retains authority and first-action bonuses.',
 desc: 'Against active Ultra Ego, Ultra Instinct or composites containing them, attacks have 2x power, ignore positive Defense/Sp. Def stages and bypass only Ultra incoming-damage reductions. This replaces the first-action bonus. Negative defensive stages, unrelated ability effects, screens, Substitute, Protect, type immunities and post-hit healing remain. The matchup is disabled by ordinary component suppression and Bewitched Woods, Haunted or Holy Terrain. Existing authority and ordinary first-action bonuses are unchanged. Contrary is supplied by the species passive.',
};
// Approved Kalos/Alola recipients; unrelated holders retain their original packages.
Object.assign(SharedPassiveComponents, {
 royalsun: ['unnerve'], ange: ['fairyaura'], inversion: ['contrary'],
 divinemockery: ['moldbreaker'], perfectego: ['noguard'], echosense: ['frisk'],
 corrosiveburn: ['oblivious'], aquashell: ['waterveil'], rainsovereign: ['drizzle'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 royalsun: {passive: 'unnerve', shortDesc: 'Drought, Supreme Overlord and Flame Body.', desc: 'Retains full local Drought, Supreme Overlord and Flame Body. Unnerve is supplied by the species passive, including opposing Berry and field-seed prevention and its Cold Eclipse entry Speed reduction.'},
 ange: {passive: 'fairyaura', shortDesc: 'Ignores abilities and indirect damage; boosts Grass and Fairy Tale offense; weakens special forms.', desc: 'Retains ability bypass, indirect-damage immunity, double damage against Pulse forms, Grass power, Fairy Tale offense and accuracy, and Bewitched Woods on fainting. Opposing exact Mega, Gigantamax, Terastallized, Stellar and Ultra Beast forms have 0.7x stats; Rift and Pulse forms are excluded. Fairy Aura is supplied once by the species passive and does not stack with another Fairy Aura.'},
 inversion: {passive: 'contrary', shortDesc: 'Sets Inverse Field on entry.', desc: 'Sets Inverse Field on entry. Stat-stage inversion is supplied once by the Contrary species passive, retaining its Z-Power exception.'},
 divinemockery: {passive: 'moldbreaker', shortDesc: 'Hydra Bond and extra Water STAB.', desc: 'Retains full local Hydra Bond and extra Water STAB. Mold Breaker is supplied by the species passive. No Sniper entry accuracy or critical-hit multiplier.'},
 perfectego: {passive: 'noguard', shortDesc: 'Ability bypass, combat healing and stat gains.', desc: 'Retains all existing Ultra Ego combat healing, offensive and field defensive stat gains, pinch healing, ability bypass and field suppression. Authority damage bonuses and first-strike power are removed. Full No Guard is supplied by the species passive, affecting incoming and outgoing moves and semi-invulnerability.'},
 echosense: {passive: 'frisk', shortDesc: 'Echo Fiend, Telepathy and Infiltrator.', desc: 'Retains full Echo Fiend, Telepathy and Infiltrator with their existing suppression rules and field effects. Frisk is supplied once by the species passive: reveals opposing Illusions and held items, with one 30% Embargo roll per opposing item holder.'},
 corrosiveburn: {passive: 'oblivious', shortDesc: 'Corrosion and Venom Ignition.', desc: 'Retains full local Corrosion and Venom Ignition: Fire attacks deal 1.2x damage against poisoned targets without consuming poison. Oblivious is supplied by the species passive, including attraction and Taunt prevention and cure, Captivate immunity and Intimidate protection.'},
 aquashell: {passive: 'waterveil', shortDesc: 'Tough Claws and Inner Focus.', desc: 'Retains full local Tough Claws and Inner Focus. Water Veil is supplied by the species passive: burn prevention and cure, Aqua Ring on entry, sandstorm and hail immunity, and status cure on water fields.'},
 rainsovereign: {passive: 'drizzle', shortDesc: 'Extends entry rain to 8 turns; Electric/Water/Flying STAB and opposing Water chip.', desc: 'Drizzle supplies entry rain as a species passive. Rain Sovereign extends that rain to eight turns and retains Electric, Water and Flying STAB plus opposing Water chip each turn, regardless of weather. Existing immunities and Free-for-All type scaling remain.'},
});
Object.assign(SharedPassiveComponents, {
 verdantsanctuary: ['grassysurge'], bogbody: ['levitate'], mastercourse: ['contrary'],
 glacialheart: ['thermalexchange'],
});
Object.assign(SharedPassiveAbilityDescriptions, {
 verdantsanctuary: {passive: 'grassysurge', shortDesc: 'Hospitality and Friend Guard.', desc: 'On entry, Hospitality heals each adjacent ally by 1/4 max HP. Friend Guard reduces damage to allies to 3/4. Grassy Surge is supplied by the species passive. Invigorate is removed: no healing multiplier or adjacent status cure.'},
 bogbody: {passive: 'levitate', shortDesc: 'Thick Fat and Dry Skin.', desc: 'Retains full local Thick Fat and Dry Skin: Fire and Ice offensive stats are halved, Water absorption, the Fire power penalty, rain healing, sun damage and all existing field recovery or damage. Levitate is supplied by the species passive and obeys normal grounding rules.'},
 mastercourse: {passive: 'contrary', shortDesc: 'Water/Dragon HP hits charge an ally, or itself alone, after the move.', desc: "Once per turn, dealing opposing HP damage with a Water or Dragon attack prepares a nonstacking +1 critical-hit-stage charge after the entire move finishes. Give it to the living adjacent ally with the lowest HP percentage, or to itself if none exists. The next executed damaging move consumes the charge even on a miss, protection or immunity; status moves preserve it, and switching clears it. A successful charged Water or Dragon move can prepare another charge afterward. Contrary is supplied by the species passive."},
 glacialheart: {passive: 'thermalexchange', shortDesc: 'Ice Body and Stalwart.', desc: 'Retains full local Ice Body and Stalwart: contact frostbite, weather and cold-field healing, hail immunity, redirection bypass and field entry Special Attack. Thermal Exchange is supplied once by the species passive: Fire hits and hot-field turns give +1 Attack, and burns are prevented and cured.'},
});
// Individually approved package cuts. These do not remove any species passive.
import {SelectedComponentRemovals, SelectedAbilityDescriptions, SelectedPassiveSwaps} from './selected-mega-simplification-data';
for (const [id, removed] of Object.entries(SelectedComponentRemovals)) {
	// Perfect Foresight may still legitimately copy an opposing Insomnia ability.
	if (id === 'perfectforesight') continue;
	AbilityComponentExclusions[id] = [...new Set([...(AbilityComponentExclusions[id] || []), ...removed])];
}
for (const [id, details] of Object.entries(SelectedAbilityDescriptions)) {
	if (SharedPassiveAbilityDescriptions[id]) Object.assign(SharedPassiveAbilityDescriptions[id], details);
}
for (const [id, species] of Object.entries({neurotoxin: 'arbokmegax', enlightenment: 'medichammega',
	solarhydra: 'sunfloramega', stormfright: 'manectricmega', royalsun: 'pyroarmega', toxicrenewal: 'dragalgemega'})) {
	SharedPassiveAbilityDescriptions[id] = {passive: SelectedPassiveSwaps[species], ...SelectedAbilityDescriptions[id]};
}
SharedPassiveComponents.neurotoxin = ['shedskin'];
SharedPassiveComponents.enlightenment = ['purepower'];
SharedPassiveComponents.stormfright = ['intimidate'];
SharedPassiveComponents.royalsun = ['flamebody'];
SharedPassiveComponents.toxicrenewal = ['regenerator'];
SharedPassiveAbilityDescriptions.cursedmarionette.desc += ' Ordinary Ghost Curse costs 1/4 max HP; ability-applied curses retain their existing behavior.';

SharedPassiveComponents.solarhydra = ['solarbud'];

import {GmaxExtractedComponents} from './gmax-passive-data';
import {GmaxPassiveDescriptions} from './gmax-passive-descriptions';
Object.assign(SharedPassiveAbilityDescriptions, GmaxPassiveDescriptions);
for (const [id, components] of Object.entries(GmaxExtractedComponents)) {
	SharedPassiveComponents[id] = [...new Set([...(SharedPassiveComponents[id] || []), ...components])];
}
