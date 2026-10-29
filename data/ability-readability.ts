/** Player-facing wording only. Full rules remain available in the ability details. */
export const ReadableAbilitySummaries: Record<string, string> = {
	slipstream: 'Airborne; first landed Flying attack each entry sets 3-turn Tailwind.',
	silkward: 'First super-effective hit each entry: half damage; surviving clears negative Speed.',
	bruteforce: 'Reckless + Rock Head.',
	ascendance: '1.5x attack damage, immunity bypass and off-type STAB; Eevee-Starter/Umbreon becomes Divineon.',
	crueltag: 'Traps foes; 20% less damage; Infiltrator + Bad Dreams. Cannot be suppressed.',
	alchemistsurge: 'Sets Psychic Terrain on entry; Prankster.',
	anticipation: 'Scans each foe on entry and every switch-in; reveals threats and guards against the latest.',
	apexarmor: 'Blocks bullets, pulses and Mega Launcher-boosted moves; 20% less attack damage.',
	fossilfrenzy: 'Surviving each opposing attack gives +1 Attack/Speed and confusion. Confusion still hurts.',
	fallenstar: 'Arrows: +1 priority at 1/4 HP. Trapped-target and same-type attacks gain 1.3x power.',
	voidcommand: '20% less damage; KOs boost higher offense; first Z-Move also boosts, without a double KO reward.',
	bewitchingmajesty: 'Sets Bewitched Woods; reflects targeted status moves; blocks foe priority for its side.',
	omenedge: 'Stronger slicing; eligible attacks hit twice; extra foe PP cost; physical Doom Desire on fainting.',
	adaptivecell: 'Category-based Fighting/Psychic typing; attacks use 1.3x Sp. Atk; powder/weather immunity.',
	furnaceengine: 'Fire/Water hits: +6 Speed. Contact burns, recovery, damage reduction and Fire chip.',
	sacredpower: 'Normal becomes Dark (1.3x power); Dark/Ghost power 1.3x; Fairy Tale entry: +1 Sp. Def.',
	execution: 'Normal becomes Dark/Fairy; ability bypass; stronger vs weakened foes; KOs heal 1/8 HP.',
	forewarn: 'Scans each foe on entry/switch-in. Takes 20% less move damage; 25% less from the latest warned move.',
	galewings: 'Flying: +1 priority at 75%+ HP. In effective Strong Winds: all moves +1 priority at any HP.',
	gulpmissile: 'Surf/Dive loads a counterattack: 1/4 attacker HP plus -1 Defense or paralysis. Field variants.',
	hydrabond: 'Eligible attacks hit 3 times; maximizes variable hits in singles/doubles; chains after KOs.',
	imperialmandate: 'At half HP or more: power boost. Below half: Speed boost. Certain fields change the bonuses.',
	argentdevotion: 'Normal becomes Steel; ally entry healing; doubled secondaries; no charging; ability bypass.',
	reapersgrip: 'Ignores foe boosts; heals 1/16 HP/turn; boosts Dark moves; sets Haunted at half HP/on fainting.',
	neutralization: 'Hits lower higher offense by 1; clears Rooms on entry; locks base fields, not Auras.',
	blademastery: 'Sharpness; low-HP slicing priority; first selected slicing HP hit each entry lowers foe Attack.',
	malicewell: 'Contact may burn; first survived opposing attack each entry: +1 Sp. Atk, even after Protect.',
	soulcremation: 'Soul Siphon + Soul Pyre + Malice Well.',
	riftdancer: 'Sun Speed, copied dances, Grass power; once-battle half-HP guard; grows Flower Garden.',
	royaldecree: 'Resets/locks foe stats/screens; Safeguard guards stats; skips charges. Neutralization stops it.',
	strikersmomentum: 'Stronger kicks; foe stat drops boost Attack; never misses; changes type; first KO boosts Speed.',
	stormcircuit: 'Entry: Electric Terrain or Aura for 5 turns (8 with Amplifield Rock).',
	ultraego: 'Ability bypass; healing from damage dealt/taken; attack boosts and field bonuses.',
	territorial: 'Blocks Berries/forced switching; HP hits heal 1/16, +1 Defense once/turn; Intimidate: +1 Attack.',
	ultrainstinct: 'Mold Breaker + Inner Focus; timing power, first-attack protection and attack healing.',
	empress: 'Queenly Majesty + Royal Decree; once-battle half-HP rally cures allies and sets Safeguard.',
	toxiccocoon: 'Shield Dust; halves first Special HP attack each entry; poisons first contact attacker.',
	sushitrick: 'Entry: allies heal 1/4 HP and clear confusion; alone, clears own confusion/negative accuracy.',
	railsight: 'Inner Focus; once/entry, surviving a foe HP attack powers the next Electric attack by 1.5x.',
	bloodchallenge: 'First foe hit each entry: 25% less damage. Counter covers both categories; once/entry heals 1/8 HP.',
	silksights: 'Keen Eye; Electric ignores slowed foes’ boosts; once/entry Bug HP hit can Disable a slowed foe.',
	ringmaster: 'Tough Claws; first Dark attempt +1 priority; Dark hits Taunt; switch-out support.',
	setpiece: 'Court Change/damaging Feint primes next Fire attack: +1 priority, cannot miss. Spent on use.',
	meridianseal: 'Once per entry, Fighting hits suppress a surviving foe for 2 turns; spent only on success.',
	voidsanctum: 'Veil blocks foe stat drops; first exit under Veil extends it 1 turn, once per battle.',
	hydroelectric: 'Water HP hits heal 1/8 once/turn; first Water attack to damage a foe grants +1 Speed afterward.',
	climatereserve: 'Held weather rock sets 5-turn weather on entry; sets default form when weather is ineffective.',
	venamskiss: 'Shed Skin; Poison hits drain HP; pre-poisoned foes cannot heal. Poisoned foes are slower.',
	crescentrend: 'Flying attacks: no contact, ignore screens; excess Substitute damage reaches its owner.',
	familyguardian: 'Friend Guard + Healer; once/entry heals self or a nearby ally 1/4 HP after crossing half HP.',
	revealinggaze: 'Entry uses Miracle Eye; Psychic ignores marked foes’ positive Sp. Def. Keeps Miracle Eye bonuses.',
	exaltedaether: 'Physical Dragon/Flying hits twice: 12.5% first-hit healing; 25% follow-up ignores Defense boosts.',
};

/** Plain-language explanations, shared by battle data, reference text and client exports. */
export const PlainLanguageAbilityDescriptions: Record<string, {shortDesc: string, desc: string}> = {
	undertow: {
		shortDesc: "Water attacks gain Smack Down's grounding effect. Water Absorb.",
		desc: "Water attacks gain Smack Down's grounding effect when they damage a foe directly. A surviving airborne foe is grounded until it switches out, allowing Ground moves to hit it. Substitute and Water immunities still block this effect. Also has Water Absorb, including its field healing.",
	},
	lockinggrip: {
		shortDesc: 'First Bug attack each switch-in applies Torment: the foe cannot repeat its last move.',
		desc: 'Once each switch-in, the first Bug attack that damages a foe directly applies Torment if it survives: it cannot use the same move twice in a row. Hitting a Substitute spends the use without applying Torment. Misses, protection and immunity preserve the use; changing abilities does not reset it.',
	},
	lockjaw: {
		shortDesc: 'Bites gain 50% power and apply 2-turn Torment: the foe cannot repeat its last move.',
		desc: 'Biting moves gain 50% power. A bite that damages a foe directly applies Torment for 2 turns if it survives, preventing it from using the same move twice in a row. The foe can still switch out. Substitute blocks this effect.',
	},
	palmmastery: {
		shortDesc: 'Thick Fat; Force Palm always paralyzes if the target can be paralyzed.',
		desc: 'Has Thick Fat. Force Palm always paralyzes when it hits, provided the target can be paralyzed. This is a primary move effect, so Shield Dust and Covert Cloak do not block the paralysis.',
	},
	falseliberation: {
		shortDesc: 'Mold Breaker; once each switch-in, a Dark hit stops the foe repeating its last move.',
		desc: 'Has Mold Breaker. Once each switch-in, a Dark attack that damages a foe directly applies Torment if it survives: it cannot use the same move twice in a row. Only successfully applying Torment spends the use. It does not refresh an existing Torment.',
	},
	disorientingmind: {
		shortDesc: 'Infiltrator; Psychic hits apply Torment: the foe cannot repeat its last move.',
		desc: 'Has Infiltrator. Psychic attacks that damage a foe directly apply Torment if it survives, preventing it from using the same move twice in a row. Normal Torment protections apply. Can apply Torment again after it ends.',
	},
	deepresonance: {
		shortDesc: 'Soundproof; Psychic Noise also lowers the foe\'s Attack by 1 stage.',
		desc: 'Has Soundproof. After Psychic Noise damages a foe directly, lowers its Attack by 1 stage if it survives. Activates once per target per move. Normal stat-drop protection applies, and Psychic Noise keeps its usual effects.',
	},
	reinflate: {
		shortDesc: 'Punk Rock; damaging a foe with a sound attack heals 1/4 HP, once per turn.',
		desc: 'Sound attacks gain 30% power (50% on Big Top or Cave), and incoming sound damage is halved. Once per turn, heals 1/4 max HP after a sound attack damages a foe directly, if still active and alive. Heal Block applies. Switching or changing abilities does not reset the turn limit.',
	},
	battlespoils: {
		shortDesc: 'Damaging a foe with a contact attack heals 1/16 HP, once per turn.',
		desc: 'Once per turn, heals 1/16 max HP after a contact attack damages a foe directly, if still active and alive. Healing happens after the entire attack, even if it hits multiple times. Substitute-only damage does not count, and normal healing restrictions apply.',
	},
	scalerhythm: {
		shortDesc: 'Damaging a foe with a sound attack raises Defense by 1 stage after the attack.',
		desc: 'After a sound attack damages a foe directly, raises Defense by 1 stage if still active and alive. Activates once per attack, even with multiple hits or targets. For Clanging Scales, this happens after its Defense drop. Substitute-only damage does not count. Normal stat-change rules apply.',
	},
	meteorcore: {
		shortDesc: 'Meteor Mash raises Attack after damaging a foe, unless its own boost already triggered.',
		desc: 'After Meteor Mash damages a foe directly, raises Attack by 1 stage if its usual Attack boost did not trigger. Activates once per attack, if still active and alive. Z-Moves, Max Moves and Substitute-only damage do not count. Normal stat-change rules apply.',
	},
	rimebreaker: {
		shortDesc: 'Refrigerate; Ice hits clear your Stealth Rock and one Spikes layer, once per turn.',
		desc: 'Has Refrigerate, including its field bonuses for converted moves. Once per turn, an Ice attack that damages a foe directly removes Stealth Rock and one layer of Spikes from your side. Toxic Spikes and Sticky Web remain. Naturally Ice-type moves do not gain Refrigerate\'s power boost.',
	},
	dredger: {
		shortDesc: 'Ground hits clear one Spikes layer, or Toxic Spikes if none remain, once per turn.',
		desc: 'Once per turn, a Ground attack that damages a foe directly removes one layer of Spikes from your side. If there are no Spikes, removes one layer of Toxic Spikes instead. Other hazards remain. Multiple hits or targets still remove only one layer.',
	},
	pressurekiln: {
		shortDesc: 'Stores half the damage taken; the next Fire hit uses it to heal, up to 1/4 HP.',
		desc: 'Stores half the damage taken from opposing attacks as healing, up to 1/4 max HP. The next Fire attack that damages a foe directly uses all stored healing. This does not reduce incoming damage. Residual, recoil, ally and Substitute-only damage do not fill the reserve. Switching clears it.',
	},
	raisedquills: {
		shortDesc: 'After using a status move, poisons the next foe that damages it.',
		desc: 'Successfully using a status move prepares one poison retaliation. The next foe to damage it directly is poisoned if possible, even without contact. That hit spends the retaliation even if poison is blocked. Repeated status moves do not stack it; switching clears it.',
	},
	solarbud: {
		shortDesc: 'End a turn in sun, then damage a foe with Grass to cure status and heal 1/8 HP. Once per switch-in.',
		desc: 'Once each switch-in, ending a turn in active sun prepares a bud. The next Grass attack that damages a foe directly consumes it, curing the holder\'s status and restoring 1/8 base max HP. Misses, protection, immunity and Substitute-only damage preserve the bud.',
	},
	openingoverture: {
		shortDesc: 'First successful sound move each switch-in starts 3-turn Tailwind.',
		desc: 'Once each switch-in, successfully using a sound move starts Tailwind for 3 turns, doubling your side\'s Speed. It does not shorten an existing longer Tailwind.',
	},
	silkward: {
		shortDesc: 'Halves the first super-effective hit each switch-in; clears Speed drops if it survives.',
		desc: 'Once each switch-in, the first super-effective hit deals half damage. After that hit, clears the holder\'s negative Speed stages if it survives, including when the hit damages its Substitute. Positive Speed stages stay unchanged.',
	},
};

// These species passives intentionally omit components present in the selectable ability.
export const PlainLanguagePassiveDescriptions: Record<string, {shortDesc: string, desc: string}> = {
	undertow: {
		shortDesc: "Water attacks gain Smack Down's grounding effect.",
		desc: "Water attacks gain Smack Down's grounding effect when they damage a foe directly. A surviving airborne foe is grounded until it switches out, allowing Ground moves to hit it. Substitute and Water immunities still block this effect.",
	},
	lockinggrip: {
		shortDesc: PlainLanguageAbilityDescriptions.lockinggrip.shortDesc,
		desc: 'Once each switch-in, the first Bug attack that damages a foe directly applies Torment if it survives: it cannot use the same move twice in a row. Substitute damage spends the use without applying Torment, including before later hits. Misses, protection and immunity preserve the use. Changing abilities does not reset it.',
	},
	lockjaw: {
		shortDesc: 'Bites apply 2-turn Torment: the foe cannot repeat its last move.',
		desc: 'Biting attacks that damage a foe directly apply Torment for 2 turns if it survives, preventing it from using the same move twice in a row. The foe can still switch out. Substitute blocks this effect.',
	},
	palmmastery: {
		shortDesc: 'Force Palm always paralyzes if the target can be paralyzed.',
		desc: 'Force Palm always paralyzes when it hits, provided the target can be paralyzed. This is a primary move effect, so Shield Dust and Covert Cloak do not block the paralysis.',
	},
};

for (const [id, text] of Object.entries(PlainLanguageAbilityDescriptions)) {
	ReadableAbilitySummaries[id] = text.shortDesc;
}
