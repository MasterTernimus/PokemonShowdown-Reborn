import {November16BalanceDescriptions} from './nov16-balance-descriptions';
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
		desc: "Once per turn after a whole physical Water attack damages an opposing Pokemon's HP, lowers one surviving active target's Defense by 1. Normal stat-drop prevention and reflection apply. Physical Steel attacks deal 1.3x damage to targets whose Defense stage is already negative. Multi-hit and spread attacks do not repeat the Defense drop. Substitute-only damage, protection, misses and immunities do not qualify.",
	},
	afterlifegate: {
		shortDesc: November16BalanceDescriptions.afterlifegate.shortDesc,
		desc: November16BalanceDescriptions.afterlifegate.desc,
	},
};
