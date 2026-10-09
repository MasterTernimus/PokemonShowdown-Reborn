/** Explicit Gmax approvals; base forms and excluded branches are not recipients. */
export const GmaxPassiveSelections: Record<string, string> = {
	pikachugmax: 'static', meowthgmax: 'pickup', kinglergmax: 'swiftswim', gengargmax: 'cursedbody',
	eeveegmax: 'overcoat', garbodorgmax: 'stickyhold', aegislashgmax: 'owntempo',
	corviknightgmax: 'swornduty', orbeetlegmax: 'frisk', drednawgmax: 'strongjaw',
	coalossalgmax: 'flamebody', flapplegmax: 'gluttony', appletungmax: 'gluttony',
	sandacondagmax: 'shedskin', toxtricitygmax: 'voltabsorb', toxtricitylowkeygmax: 'voltabsorb',
	centiskorchgmax: 'flamebody', hatterenegmax: 'sweetveil', grimmsnarlgmax: 'prankster',
	grimmsnarlgmaxazzy: 'prankster', alcremiegmax: 'friendguard', copperajahgmax: 'heavymetal',
	duraludongmax: 'stalwart', dragapultgmax: 'levitate', dipplingmax: 'selfsufficient',
};

/** Recipient-dependent extraction preserves shared abilities on nonrecipients. */
export const GmaxExtractedComponents: Record<string, string[]> = {
	gigavolt: ['static'], fluffyevo: ['overcoat'], irondominion: ['swornduty'], astralwatcher: ['frisk'],
	warship: ['strongjaw'], furnaceengine: ['flamebody'], sweetdecay: ['gluttony'], bakedbliss: ['gluttony'],
	duneterror: ['shedskin'], riotamp: ['voltabsorb'], heatcoil: ['flamebody'], wickedsnare: ['prankster'],
	sweetsanctuary: ['friendguard'], treasuretitan: ['heavymetal'], alloycore: ['stalwart'],
	phantombarrage: ['levitate'], sweetresonance: ['selfsufficient'],
};

export const GmaxRedesignDescriptions: Record<string, { shortDesc: string, desc: string }> = {
	crushingdepths: {
		shortDesc: 'Physical Water HP hits lower Defense once per turn; Steel hits exploit lowered Defense.',
		desc: 'Once per turn after a whole physical Water attack damages an opposing Pokemon\'s HP, lowers one surviving active target\'s Defense by 1. Normal stat-drop prevention and reflection apply. Physical Steel attacks deal 1.3x damage to targets whose Defense stage is already negative. Multi-hit and spread attacks do not repeat the Defense drop. Substitute-only damage, protection, misses and immunities do not qualify. Swift Swim is supplied separately by the species passive.',
	},
	afterlifegate: {
		shortDesc: 'Special Ghost/Poison HP hits curse once per turn; own KOs heal; Shadow Shield.',
		desc: 'Once per turn after a whole special Ghost or Poison attack damages an opposing Pokemon\'s HP, curses one surviving active foe if it is not already cursed. This ability-sourced Curse deals 1/8 base max HP each turn and costs its user no HP. Once per turn, a foe knocked out by its own attack or its own Afterlife Gate Curse heals it for 1/8 max HP, only while it is alive and active. Other curses and unrelated knockouts do not qualify. Full local Shadow Shield reduces attack damage by 20%, or 40% for super-effective attacks, at any HP; it retains its Cold Eclipse hail immunity. Cursed Body is supplied separately by the species passive. No Shadow Tag.',
	},
};
