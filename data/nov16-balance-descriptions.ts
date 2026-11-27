import { UltraEgoRivalryDescription } from './ultra-rivalry-description';

export const misalignedStarsEffect = 'Includes Anticipation. Opposing attacks deal 10% less damage. Each opposing move alternates: the first successful use is recorded and the next is blocked, healing 1/3 max HP. The cycle repeats separately for each move. After switching back in, the first damaging use of each previously blocked attack deals half damage and heals 1/4 max HP if the holder survives. Its next use is blocked. Each multihit attack counts as one use. Against Ultra Ego and Ultra Instinct, the holder ignores their matchup damage bonuses, protection and positive stat stages they grant. Ultra ability bypass cannot stop the Stars.';

/** Current wording for the approved November 16 balance pass. */
export const November16BalanceDescriptions: Record<string, { name?: string, desc: string, shortDesc: string }> = {
	execution: {
		shortDesc: 'Misaligned Stars + Void Veil. Bypasses abilities, punishes weakened foes and heals on KOs.',
		desc: 'Includes Duskilate, Mold Breaker, Void Veil and Misaligned Stars. Moves ignore bypassable opposing abilities. Levitate and Telepathy protect against Ground and allied attacks. Gravity cannot ground the user, and beneficial terrain effects apply while airborne. Attacks deal 1.3× damage against foes at half HP or less. Once per entry, a hit that brings a surviving foe from above half HP to half or less marks it: the next Dark or Ghost hit ignores its positive defensive stages. Either Pokémon switching clears the mark. Heals 1/8 max HP per KO. Attack and Sp. Atk cannot fall below −1. Fields protect Speed from stat drops. ' + misalignedStarsEffect,
	},
	racingspirit: {
		shortDesc: "Rock Head + Flash Fire.",
		desc: "Prevents move recoil except Struggle. Includes Flash Fire: absorbs Fire moves for a 1.5× Fire Boost, with its usual field effects.",
	},
	soulforgedarmor: {
		shortDesc: "Flash Fire; takes 20% less damage from super-effective attacks.",
		desc: "Super-effective attacks deal 20% less damage. Includes Flash Fire: absorbs Fire moves for a 1.5× Fire Boost, with its usual field effects.",
	},
	soulpyre: {
		shortDesc: "Infiltrator; heals after foe burn damage. Ghost hits weaken burned foes.",
		desc: "Bypasses Substitute, screens, Safeguard and Mist. Heals 1/8 max HP at turn end if a foe took burn damage. Once per turn, a Ghost hit lowers an already-burned foe’s Sp. Def by 1.",
	},
	soulsiphon: {
		shortDesc: "Flash Fire; Fire/Ghost hits drain HP and block healing.",
		desc: "Includes Flash Fire and its field effects. Fire or Ghost hits to opposing HP block healing through the next turn and restore one third of damage dealt, capped at 1/6 max HP per turn. Delayed attacks do not trigger this effect. Draining moves only grant their own healing.",
	},
	heatreservoir: {
		shortDesc: "Preserves Sp. Def on the first Armor Cannon stat drop each entry.",
		desc: "Once per switch-in, Armor Cannon’s own stat drop lowers only Defense. Later uses lower both Defense and Sp. Def as usual.",
	},
	flashfire: {
		shortDesc: "Absorbs Fire for a 1.5× Fire Boost that carries through Mega Evolution.",
		desc: "Absorbing a Fire move grants Fire Boost, multiplying Fire attacks by 1.5. The boost carries through Mega Evolution and clears on switching. Burning or grounded Volcanic grants it at turn end. Infernal Eclipse grants a temporary charge while the field lasts. Cold Eclipse disables Fire absorption.",
	},
	stalwart: {
		shortDesc: "Moves ignore redirection and hit through Substitute.",
		desc: "Moves ignore redirection and bypass the target’s Substitute. On entry in New World, Starlight Arena, Fairy Tale or Chessboard, raises Sp. Atk by 1.",
	},
	petalrhythm: {
		name: "Petal Rhythm", shortDesc: "The first successful dance each entry restores 1/8 max HP.",
		desc: "The first time the holder successfully uses a dance move after switching in, it restores 1/8 of its maximum HP. Dances copied by Dancer count.",
	},
	splintershell: {
		name: "Splinter Shell", shortDesc: "Blocks critical hits. Contact KOs trigger Aftermath.",
		desc: "Prevents critical hits. A foe that knocks out the holder with a contact move loses 1/4 of its maximum HP, or 1/2 on Corrosive Mist. Damp prevents this damage.",
	},
	ballastplating: {
		name: "Ballast Plating", shortDesc: "Body Press, Heavy Slam and Gyro Ball have 1.2× power.",
		desc: "Multiplies the base power of Body Press, Heavy Slam and Gyro Ball by 1.2.",
	},
	pollenbloom: {
		shortDesc: "Thick Fat + Aroma Veil.",
		desc: "Halves the attacking stat of incoming Fire and Ice moves and protects against hail. Aroma Veil protects the holder and its allies from attraction and move restrictions.",
	},
	sunsovereign: {
		shortDesc: "Drought + Infernal Dominion + White Smoke.",
		desc: "Summons sun and lowers opposing Attack on entry. White Smoke blocks opposing stat drops. On Volcanic Field or Dragon's Den, entry raises Attack and Sp. Atk by 1. Rock attacks are capped at neutral effectiveness, and Stealth Rock deals no damage to the holder. A direct Fire hit clears sand and grants Molten Guard once per turn against the next opposing Rock attack.",
	},
	stormpower: {
		shortDesc: "Rain boosts Attack and Sp. Atk by 1.5×. Costs 1/8 max HP each rain turn.",
		desc: "In rain or heavy rain, Attack and Sp. Atk are multiplied by 1.5. The holder loses 1/8 of its maximum HP at the end of each rain turn.",
	},
	ancientbloom: {
		shortDesc: "Verdant Monarch + Friend Guard; field bonuses and 1.1× accuracy.",
		desc: "Thick Fat and Aroma Veil protect the holder. Aroma Veil protects allies from move restrictions, and Friend Guard reduces damage to allies by 25%. Fairy Tale, New World, Cold Eclipse and Starlight Arena entry grant +1 Defense and Sp. Def. The latter three grant 1.5× move power. All moves have 1.1× accuracy.",
	},
	toxicbloom: {
		shortDesc: "Verdant Monarch + Toxic Sink; 1.1× accuracy.",
		desc: "Includes Thick Fat, Aroma Veil and Toxic Sink. All moves have 1.1× accuracy.",
	},
	"prismscale": {
		"desc": "Friend Guard reduces attack damage to allies by 25%. Swift Swim boosts Speed in rain and its supported water fields.",
		"shortDesc": "Friend Guard + Swift Swim.",
	},
	"pyrousdominion": {
		"desc": "Earth Eater absorbs other Pokémon’s Ground moves and heals 1/4 max HP, with 1/16 healing each turn on Cave and Desert. Limber prevents and cures paralysis and prevents opposing or field-based Speed reductions.",
		"shortDesc": "Earth Eater + Limber.",
	},
	"moonveil": {
		"desc": "It and its allies cannot be poisoned. Gaining this Ability while it or its ally is poisoned cures them. Before an opposing Pokemon uses a Poison-type move, that Pokemon's Attack and Special Attack are lowered by 1 stage. On entry, creates Misty Terrain for 5 turns, or 8 with Amplifield Rock, subject to field and Aura rules.",
		"shortDesc": "Pastel Veil + Misty Surge.",
		"name": "Void Promise",
	},
	"infernaldominion": {
		"desc": "Has Intimidate. Incoming Rock attack effectiveness is capped at neutral, preserving stronger resistance or immunity. Prevents only this holder's Stealth Rock damage without removing the hazard. A direct Fire attack dealing opposing HP damage clears Sandstorm and, once per turn regardless of weather, grants Molten Guard until turn end. The guard blocks the next opposing Rock attack against this holder, including all hits, without shielding other spread targets. Generated attacks do not arm it. Leaving, ability loss and Mega Evolution clear the guard.",
		"shortDesc": "Intimidate; Molten Guard; Rock hits capped at neutral; ignores Stealth Rock damage.",
	},
	"shadowshield": {
		"desc": "Takes half attack damage at full HP. Ability-ignoring moves cannot bypass this protection; suppression disables it. Immune to hail damage on Cold Eclipse.",
		"shortDesc": "Half attack damage at full HP; no hail damage on Cold Eclipse.",
	},
	"moonlithide": {
		"desc": "Shadow Shield + Magic Guard: Takes half attack damage at full HP. Immune to indirect damage. On entry to Fairy Tale Field, Sp. Def rises one stage. Ability-ignoring moves cannot bypass the damage reductions; suppression disables the ability.",
		"shortDesc": "Half attack damage at full HP. Immune to indirect damage.",
	},
	"voidcraft": {
		"desc": 'Temporal Shift queues a 100-power Future Sight of the user’s primary type on the turn after a damaging move and prevents opposing stat drops. ' + misalignedStarsEffect + ' Fairy attacks gain STAB. Shadow Shield halves attack damage at full HP and protects against hail on Cold Eclipse.',
		"shortDesc": 'Temporal Shift with Misaligned Stars, Shadow Shield, and Fairy STAB.',
	},
	temporalshift: {
		shortDesc: 'Misaligned Stars. Blocks opposing stat drops. Attacking queues a 100-power Future Sight.',
		desc: 'Opposing Pokémon cannot lower the user’s stats. On the turn after it uses a damaging move, it queues a 100-power Future Sight of its primary type against a random foe. Multiple attacks can be queued. ' + misalignedStarsEffect,
	},
	tomeofavarice: {
		name: 'Tome of Avarice',
		shortDesc: 'Misaligned Stars. Attacks that previously damaged the user deal 30% less, even after switching.',
		desc: 'Attacks that previously damaged the user’s HP deal 30% less damage to it for the rest of the battle, including after it switches back in. ' + misalignedStarsEffect,
	},
	"curseddoll": {
		"desc": "Contact moves have 1.3x power. Takes half attack damage at full HP. This protection cannot be bypassed by ability-ignoring moves, but suppression disables it. Once per battle, surviving an opposing attack at half HP or less grants +1 Attack. Immune to hail on Cold Eclipse.",
		"shortDesc": "Tough Claws + Shadow Shield; surviving an attack at half HP grants +1 Attack once per battle.",
	},
	"afterlifegate": {
		"desc": "Once per turn after a whole special Ghost or Poison attack damages an opposing Pokemon's HP, curses one surviving active foe if it is not already cursed. This ability-sourced Curse deals 1/8 base max HP each turn and costs its user no HP. Once per turn, a foe knocked out by its own attack or its own Afterlife Gate Curse heals it for 1/8 max HP, only while it is alive and active. Other curses and unrelated knockouts do not qualify. Shadow Shield halves attack damage at full HP and prevents hail damage on Cold Eclipse.",
		"shortDesc": "Special Ghost/Poison HP hits curse once per turn; own KOs heal; Shadow Shield.",
	},
	"hellfireeclipse": {
		"desc": "Dark Aura boosts all damaging Dark moves by 4/3, or multiplies them by 0.75 with Aura Break; multiple users do not stack. Immune to hail damage on Cold Eclipse. After a Fire or Dark move damages a foe directly, blocks healing for 2 turns and has a 30% chance to burn. Rolls once per damaged foe per move.",
		"shortDesc": "Dark Aura + Agony Flame.",
	},
	"ultraego": {
		"desc": "Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. On Ashen Beach and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field." + UltraEgoRivalryDescription,
		"shortDesc": "Ability bypass; healing from damage dealt/taken; attack boosts and field bonuses.",
	},
	"burningego": {
		"desc": "Contact attackers have a 30% burn chance, or 60% on Volcanic. On Infernal Eclipse, Flame Body grants +1 Defense and Sp. Def on entry; Cold Eclipse disables contact burns. Prevents freezing outside Cold Eclipse and cures freeze. Incoming Water and Ice attacks use half the attacker's offensive stat. Dragon's Den and Infernal Eclipse block Fire moves. On Dragon's Den, Volcanic or Infernal Eclipse entry, gains +1 Defense and Sp. Def. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. On Ashen Beach and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. On Infernal Eclipse, the two entry effects together give +2 Defense and Sp. Def." + UltraEgoRivalryDescription,
		"shortDesc": "Contact attackers have a 30% burn chance, or 60% on Volcanic.",
	},
	"perfectego": {
		"desc": "Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. On Ashen Beach and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field. Moves cannot miss, including on the suppressing fields." + UltraEgoRivalryDescription,
		"shortDesc": "Never misses; ignores abilities; heals and gains stats in combat.",
	},
	"unleashedego": {
		"desc": "Ultra Ego + Levitate + Raging Storm. Airborne unless grounded. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. Dealing attack damage heals 1/16 once per turn. Ashen Beach and Fairy Tale add once-per-entry Defense/Sp. Def boosts for physical/special hits and a one-use 1/4-HP pinch heal. Royal Decree or Empress enables 1.3x power (except against Battle Bond) and 0.7x incoming damage unless Neutralization is active. Bewitched Woods, Haunted and Holy fields disable Ultra Ego effects. Raging Storm bypasses abilities, screens, Substitute and defensive stat stages; +1 critical-hit ratio. Attack KOs splash 60% of the recorded hit damage onto remaining foes. Incoming priority damage is halved. Immune to hail; cannot be suppressed." + UltraEgoRivalryDescription,
		"shortDesc": "Ultra Ego boosts/healing; airborne; bypasses defenses; KO splash.",
	},
	"primalego": {
		"desc": "Ignores target Defense/Sp. Def/evasion stages when attacking, and attacker Attack/Defense/Sp. Atk/accuracy stages when defending. Reveals opposing Illusions on entry. Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. On Ashen Beach and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field." + UltraEgoRivalryDescription,
		"shortDesc": "Unaware + Ultra Ego + Mold Breaker.",
	},
	"ashenseeds": {
		"desc": "On entry, sets Ashen Aura for 5 turns (8 with Amplifield Rock). On an empty field or Volcanic Field, sets Infernal Eclipse instead.\n\nAshen Aura boosts Fire attacks by 30%. Two successful Infernal Parade or Eruption attacks develop the Aura into Infernal Eclipse for its remaining turns. On Cold Eclipse, any Pokémon can trigger this change with Eruption, keeping the field timer.\n\nDuring Infernal Eclipse, the holder takes half damage from weaknesses caused by its Fire typing and keeps the field in place until it expires or the holder leaves or is suppressed. Eligible non-Fire contact attackers inherit Ashen Seeds. Non-Fire holders lose 1 Attack and Sp. Atk each turn. If an Eclipse field is already active, one qualifying attack is enough.",
		"shortDesc": "Entry: Ashen Aura/Infernal Eclipse; two qualifying attacks develop its Aura.",
	},
	"badseeds": {
		"desc": "On entry, sets Frozen Aura for 5 turns (8 with Amplifield Rock). On an empty field or Icy Field, sets Cold Eclipse instead.\n\nFrozen Aura boosts Ice attacks by 30% and removes weaknesses from Ice typing on both sides. Two successful Blizzard, Glaciate or Sheer Cold attacks develop the Aura into Cold Eclipse for its remaining turns. On Infernal Eclipse, any Pokémon can trigger this change with Glaciate or Sheer Cold, keeping the field timer.\n\nDuring Cold Eclipse, the holder takes half damage from weaknesses caused by its Ice typing and keeps the field in place until it expires or the holder leaves or is suppressed. Eligible non-Ice contact attackers inherit Bad Seeds. Non-Ice holders lose 1 Attack and Sp. Atk each turn. If an Eclipse field is already active, one qualifying attack is enough.",
		"shortDesc": "Entry: Frozen Aura/Cold Eclipse; two qualifying attacks develop its Aura.",
	},
};

November16BalanceDescriptions.voidpromise = November16BalanceDescriptions.moonveil;

Object.assign(November16BalanceDescriptions, {
	"solidrock": {
		"desc": "Takes 10% less attack damage, or 32.5% less from super-effective attacks. Its damage reduction is inactive on New World, Dragon’s Den, Mountain, Holy, Haunted, Starlight Arena, Snowy Mountain and all Flower Garden stages. With Solid Rock, Filter or Prism Armor, only the strongest damage cut from abilities, passives, Mist, Safeguard or Lucky Chant applies.",
		"shortDesc": "10% less attack damage; 32.5% less from super-effective hits. Field restrictions apply.",
	},
	"filter": {
		"desc": "Takes 10% less attack damage, or 32.5% less from super-effective attacks. Its damage reduction is inactive on New World, Dragon’s Den, Mountain, Holy, Haunted, Starlight Arena, Snowy Mountain and all Flower Garden stages. With Solid Rock, Filter or Prism Armor, only the strongest damage cut from abilities, passives, Mist, Safeguard or Lucky Chant applies.",
		"shortDesc": "10% less attack damage; 32.5% less from super-effective hits. Field restrictions apply.",
	},
	"primalego": {
		"desc": "Moves ignore bypassable abilities. After dealing HP damage, heals 1/16 max HP once per turn. Each entry, turns when this Pokémon deals or takes direct attack damage to or from a foe count toward Ultra Ego. At the end of the first such turn and every other one afterward, it gains +1 Attack and Sp. Atk. Heals once per incoming attack: 1/16 max HP, then 1/20 until the holder attacks. On Ashen Beach and Fairy Tale, the first qualifying physical and special hits also give +1 Defense and Sp. Def respectively. In those fields, a qualifying hit at half HP or less instead heals 1/4 max HP once per activation; blocked healing does not spend it. These effects stop on Bewitched Woods, Haunted and Holy Field." + UltraEgoRivalryDescription + " Hospitality heals each adjacent ally by 1/4 max HP on entry.",
		"shortDesc": "Ultra Ego + Hospitality.",
	},
	"verdanthospitality": {
		"name": "Bloom Shelter",
		"desc": "Friend Guard reduces attack damage to allies by 25%. Natural Cure cures its major status on switching out and heals 1/8 max HP if a status was cured. Bewitched Woods also cures its status at turn end.",
		"shortDesc": "Friend Guard + Natural Cure.",
	},
	"waterbarrage": {
		"desc": "Eligible slicing, pulse, bullet, horn, drill, and Arrow moves hit twice at 60% power, with an independent accuracy check for each hit. With an ability power boost such as Mega Launcher, the first hit uses that boost at full power and the second uses 15% base power. In Free-for-All, both hits still use 60% power: the first hits the selected foe and the second targets another random living foe when possible. Existing multi-hit moves are not given an additional Dual Wield pair. All moves have 1.1x accuracy. Shell Armor prevents critical hits and reduces attack damage by 20% outside its restricted fields. Fairy Tale and Dragon’s Den entry grant +1 Defense; opposing stat drops grant +2 Sp. Def.",
		"shortDesc": "Dual Wield + Shell Armor; all moves gain 10% accuracy.",
	},
	"siegelauncher": {
		"desc": "Mega Launcher gives pulse and bullet moves 1.5x power. Dual Wield supplies exactly one eligible pair: outside Free-for-All, pulse/bullet attacks use 1.5x power for the first hit and 0.15x for the second before STAB and passives. In Free-for-All both hits use full power, with the second-target selection. Existing multi-hit, charging, delayed, Z/Max and ineligible moves gain no extra pair. Stalwart: bypasses redirection and Substitute, and gives +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. All moves have 1.1x accuracy.",
		"shortDesc": "Mega Launcher + Dual Wield + Stalwart; all moves gain 10% accuracy.",
	},
	"fortressshell": {
		"desc": "Stalwart bypasses redirection and Substitute, and gives +1 Sp. Atk on New World, Starlight Arena, Fairy Tale or Chessboard entry. Guardian Presence boosts allies move power by 1.3x, or 1.5x on Haunted, Bewitched Woods, Holy and Psychic fields, and reduces their attack damage by 25%; neither applies to the holder. During Electric Aura or Electric Terrain, Murkwater Surface, Water Surface, Underwater, Midnight Zone, Factory and Short-Circuit, redirects and absorbs Electric moves for +1 Attack and Sp. Atk. Existing Fairy Tale, New World, Cold Eclipse and Starlight Arena entry/terrain bonuses give +1 Defense and Sp. Def; the latter three retain 1.5x move power. All moves have 1.1x accuracy.",
		"shortDesc": "Stalwart + Guardian Presence; field bonuses and Electric absorption; 10% accuracy.",
	},
});

Object.assign(November16BalanceDescriptions, {
	"terraresolve": {
		"desc": "Opposing attacks that damage HP heal 1/16 max HP once per move. The first each turn raises Defense by 1. Takes 10% less attack damage, or 32.5% less from super-effective hits. Prevents forced switching.",
		"shortDesc": "Stamina + Solid Rock + Suction Cups.",
	},
	"rimeknuckle": {
		"desc": "Takes 10% less attack damage, or 32.5% less from super-effective attacks. Punching moves have 1.4x power. Contact attackers have a 30% chance of frostbite. Heals 1/16 max HP each turn in hail or snow, or on Icy, Snowy Mountain and Cold Eclipse without those weathers; hail on Cold Eclipse heals 1/8 instead. Immune to hail damage. Damaging moves have a 20% chance to cause frostbite (40% on Icy or Snowy Field). KOs restore 1/8 max HP, or 1/4 against Mega, G-Max, Terastallized, Stellar or Z-Move item targets. Ice Body adds a 30% chance to frostbite contact attackers, hail immunity, and healing in hail/snow or on Icy, Snowy Mountain and Cold Eclipse fields. Healing is 1/16 max HP, or 1/8 in hail on Cold Eclipse.",
		"shortDesc": "Frostbite chance; KO healing.",
	},
	"warship": {
		"desc": "Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Takes 10% less attack damage, or 32.5% less from super-effective attacks. Biting moves have 1.5x power.",
		"shortDesc": "Swift Swim + Solid Rock + Strong Jaw.",
	},
	"furnaceengine": {
		"desc": "Fire or Water HP hits give +6 Speed. Entry on Burning, Superheated or Volcanic gives +6 Speed; Dragon's Den, Volcanic and Infernal Eclipse give +1 Defense and Sp. Def. Midnight Zone entry makes it Water-type. Water Surface, Underwater and Volcanic give +1 Speed each turn. Contact attackers have a 30% burn chance, or 60% on Volcanic; this cannot burn on Cold Eclipse. Heals 1/16 max HP each turn. Takes 10% less attack damage, or 32.5% less from super-effective attacks. If it dealt Fire- or Rock-type move damage to opposing HP that turn, at the end of the turn opposing Pokemon take Fire-type damage equal to 1/16 max HP, blocked by Fire immunities. Only in Free-for-All does Fire type effectiveness scale this chip.",
		"shortDesc": "Fire/Water hits: +6 Speed. Contact burns, recovery, damage reduction and Fire chip.",
	},
	"tidaljaw": {
		"desc": "Biting moves have 1.5x power. Doubles Speed in rain or on Water Surface, Murkwater Surface, Underwater and Midnight Zone. Takes 10% less attack damage, or 32.5% less from super-effective attacks.",
		"shortDesc": "Strong Jaw + Swift Swim + Filter.",
	},
	"caverndrake": {
		"desc": "Absorbs other Pokemon's Ground moves, healing 1/4 max HP instead of being hit. Heals 1/16 max HP each turn on Cave and Desert. Takes 10% less attack damage, or 32.5% less from super-effective attacks.",
		"shortDesc": "Earth Eater + Solid Rock.",
	},
	"requiem": {
		"desc": "Damaging attacks have a 30% chance to be Disabled, guaranteed on Haunted and blocked on Holy; normal Cursed Body exclusions apply. Takes 10% less attack damage, or 32.5% less from super-effective attacks. Cannot be suppressed.",
		"shortDesc": "Cursed Body disabling + Filter; cannot be suppressed.",
	},
	"nightmarepulse": {
		"desc": "Prevents and cures sleep, blocks Yawn, and gives Dark and Ghost attacks 1.3x power. Takes 10% less attack damage, or 32.5% less from super-effective attacks. Its moves cannot miss. Damaging attacks have a 30% chance to be disabled, guaranteed on Haunted and disabled on Holy Field. Excludes Max moves, delayed attacks and Struggle. On fainting, active foes are cursed for two end-of-turn ticks of 1/8 max HP each, then the curse ends. Sleeping foes, including Comatose users, lose 1/8 max HP each turn. Disabled on Rainbow Field. On entry, sets Haunted Field for 3 turns if field rules allow. Has sleep immunity, accurate moves, damage reduction, disabling attackers, and damage to sleeping foes. Does not bypass screens or Substitute. Field creation or refresh is attempted only once per battle per holder, even if blocked; switching, suppression, revival, or ability changes never reset this use. Its field creation, refresh and conversion last exactly 3 turns; Amplifield Rock does not extend them.",
		"shortDesc": "Moves cannot miss; curses foes on faint; Sleeping foes lose 1/8 HP per turn, except on Rainbow.",
	},
	"absolutezero": {
		"desc": "On entry, it summons Snow. Moves ignore bypassable opposing abilities. Takes 10% less attack damage, or 32.5% less from super-effective attacks.",
		"shortDesc": "Snow Warning + Mold Breaker + Filter.",
	},
	"anchorbridge": {
		"desc": "Immune to OHKO moves; at full HP survives an otherwise fatal direct hit with 1 HP. Takes 0.9x attack damage, or 0.675x from super-effective attacks. Normal ability suppression and Mold Breaker rules apply.",
		"shortDesc": "10% less damage; 32.5% less from super-effective hits.",
	},
	"magneticbulwark": {
		"desc": "Full local Filter: takes 10% less attack damage, or 32.5% less from super-effective attacks.",
		"shortDesc": "Takes 10% less damage; 32.5% less from super-effective hits.",
	},
	"curtaincall": {
		"desc": "Ice Body and Filter. Ice Body has 30% contact frostbite, hail immunity, 1/16 recovery in hail/snow or qualifying cold fields and 1/8 in hail on Cold Eclipse. Filter multiplies non-super-effective attack damage by 0.9 and super-effective attack damage by 0.675; does not permanently change raw defenses.",
		"shortDesc": "Ice Body + Filter.",
	},
	"aevianweb": {
		"desc": "Transforms Galvantula into Bug/Rock Galvantula-Rejuv on entry. Full local Guts gives 1.5x Attack while statused and ignores the burn damage penalty. Keen Eye prevents external accuracy drops, ignores evasion boosts and reveals opposing Illusions; Mirror Arena entry grants +1 accuracy and Laser Focus. Solid Rock reduces attack damage by 10%, or 32.5% total for super-effective attacks.",
		"shortDesc": "Guts + Keen Eye + Solid Rock; Galvantula becomes Rejuv.",
	},
});

import { rosterDescriptions } from './nov18-abilities';
Object.assign(November16BalanceDescriptions, rosterDescriptions);
November16BalanceDescriptions.verdanthospitality.name = 'Verdant Awakening';

November16BalanceDescriptions.mightyjaw = {
	shortDesc: '1.3x same-type power, 1.5x bite power, Intimidate. Opening bites gain +2 priority.',
	desc: 'On entry, lowers adjacent foes’ Attack with Intimidate. Same-type attacks have 1.3x power and biting attacks have 1.5x power. Both apply to a same-type bite. Biting moves gain +2 priority on its first action after switching in.',
};
