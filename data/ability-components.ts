/** Genuine mechanical components shared by battle identity and search. */
export const AbilityComponents: { [id: string]: string[] } = {
	eternalflower: ['moldbreaker'],
	ange: ['moldbreaker'],
	reservoir: ['waterabsorb', 'gluttony', 'damp'],
	savageresolve: ['guts'],
	lancepoint: ['keeneye'],
	anchoredbattery: ['megalauncher', 'suctioncups'],
	shadowbond: ['battlebond', 'filter', 'selfsufficient', 'proficient', 'infiltrator'],
	apexbond: ['battlebond', 'filter', 'selfsufficient', 'supremeoverlord', 'roughskin'],
	sacredbond: ['battlebond', 'filter', 'selfsufficient', 'magmaarmor', 'intimidate', 'flashfire'],
	battlebond: ['filter', 'selfsufficient'],
	highnoon: ['dualwield', 'megalauncher', 'proficient'],
	strikersmomentum: ['proficient'],
	forestsurge: ['proficient'],
	exalt: ['defiant', 'sharpness', 'moldbreaker'],
	warpath: ['moldbreaker'],
	burningrage: ['proficient'],
	terragift: ['hospitality', 'unaware', 'proficient'],
	blazingtempo: ['proficient', 'speedboost', 'striker', 'magmaarmor', 'keeneye'],
	verdantdrake: ['proficient', 'dualwield', 'regenerator', 'lightningrod', 'limber'],
	mightyjaw: ['proficient'],
	blazingmane: ['proficient'],
	plasmaeruption: ['proficient', 'static', 'flamebody'],
	gigavolt: ['moldbreaker', 'lightningrod', 'static'],
	verdantedge: ['chlorophyll', 'grasspelt', 'sharpness'],
	permafrost: ['icebody', 'icescales', 'refrigerate'],
	glacialheart: ['thermalexchange', 'icebody', 'stalwart'],
	tidalwave: ['waterabsorb', 'hydration', 'raindish'],
	livewire: ['transistor', 'voltabsorb', 'quickfeet', 'ironbarbs'],
	kindledfury: ['fluffy', 'guts', 'flashfire'],
	verdanthospitality: ['proficient'],
	verdantsanctuary: ['grassysurge', 'invigorate', 'hospitality', 'friendguard'],
	fortressshell: ['proficient'],
	waterbarrage: ['proficient'],
	unboundblaze: ['proficient'],
	pollenbloom: ['proficient', 'thickfat'],
	ironclad: ['armorize'],
	apexpredator: ['relicarmor', 'dragonize', 'windrider'],
	tyrantdomain: ['relicarmor', 'supremeoverlord', 'selfsufficient', 'sandstream'],
	auroradomain: ['relicarmor', 'refrigerate', 'selfsufficient', 'snowwarning'],
	royalscales: ['prismscale', 'marvelscale', 'oblivious', 'swiftswim', 'dragonize', 'selfsufficient'],
	aeviandream: ['baddreams', 'shedskin', 'toughclaws'],
	wingedwraith: ['infiltrator', 'galewings'],
	toxicsink: ['effectspore', 'invigorate'],
	ragingbeast: ['guts', 'moldbreaker'],
	lunardread: ['dishearten', 'insomnia', 'pressure'],
	stillwaters: ['cloudnine', 'magicguard', 'unaware'],
	scavenger: ['overcoat', 'bigpecks', 'regenerator'],
	toxicspines: ['toxicdebris', 'corrosion', 'merciless'],
	truedevotion: ['falsedevotion', 'serenegrace', 'naturalrecovery', 'prankster', 'technician'],
	falsedevotion: ['serenegrace', 'naturalrecovery', 'prankster'],
	witheringshell: ['crumblingshell', 'naturalrecovery', 'sturdy'],
	argentdevotion: ['armorize', 'swornduty', 'serenegrace', 'moldbreaker'],
	fluffyevo: ['overcoat'],
	bonewarrior: ['battlearmor', 'selfsufficient'],
	seafiend: ['toxicdebris', 'waterbubble', 'waterveil'],
	hisuianoath: ['swornduty', 'toughclaws', 'corrosion'],
	abysslure: ['voltabsorb', 'waterabsorb', 'illuminate'],
	celestialheart: ['soulheart', 'friendguard', 'serenegrace'],
	phalanxform: ['hydrabond', 'friendguard', 'battlearmor'],
	astralcore: ['purepower', 'naturalcure', 'illuminate'],
	doomwarning: ['magicbounce', 'magicguard', 'anticipation'],
	ancientbloom: ['effectspore', 'selfsufficient', 'proficient'],
	furnaceengine: ['steamengine', 'flamebody', 'selfsufficient', 'solidrock'],
	apexflytrap: ['levitate'],
	forgegrit: ['guts'],
	masonsfist: ['ironfist'],
	marshconduit: ['waterabsorb'],
	swarmdrive: ['swarm'],
	mirechorus: ['liquidvoice', 'poisontouch'],
	boretunnel: ['eartheater'],
	duneterror: ['sandstream', 'shedskin', 'sandspit'],
	waterbubble: ['waterveil'],
	hisuianvanguard: ['rapidresponse', 'windpower'],
	unovavanguard: ['violentrush', 'windrider'],
	hisuianresolve: ['bruteforce', 'reckless', 'rockhead', 'magmaarmor'],
	nobleconduit: ['battery', 'solarpower', 'aftermath'],
	nobledance: ['dancer', 'hospitality', 'owntempo'],
	noblearmor: ['prismarmor', 'icebody'],
	noblerider: ['swiftswim', 'moldbreaker'],
	gooey: ['hydration', 'sapsipper'],
	irondominion: ['pressure', 'swornduty', 'mirrorarmor'],
	bewitchingmajesty: ['magicbounce', 'queenlymajesty'],
	soulstrike: [],
	mountainhunger: ['sapsipper', 'thickfat', 'earlybird'],
	astralwatcher: ['prankster', 'defragment', 'frisk'],
	alchemistsurge: ['psychicsurge', 'competitive', 'hydrabond', 'prankster'],
	lunarorbit: ['magicbounce', 'serenegrace', 'triage', 'magicguard'],
	territorial: ['unnerve', 'stamina', 'guarddog'],
	treasuretitan: ['filter', 'eartheater', 'heavymetal', 'intimidate'],
	royalsun: ['drought', 'supremeoverlord', 'unnerve', 'flamebody'],
	ragingfists: ['hydrabond', 'scrappy'],
	aquashell: ['waterveil', 'toughclaws', 'innerfocus'],
	warship: ['swiftswim', 'solidrock', 'strongjaw'],
	sweetdecay: ['hustle', 'gluttony', 'sweetveil', 'corrosion'],
	bakedbliss: ['wellbakedbody', 'thickfat', 'sweetveil', 'gluttony'],
	hydraheart: ['hydrabond', 'stamina'],
	truehydra: ['hydrabond', 'regenerator', 'shedskin', 'selfsufficient'],
	moonveil: ['pastelveil', 'mistysurge'],
	aevianspark: ['technician', 'static', 'earlybird'],
	aeviangrief: ['magicguard', 'cursedbody', 'wonderskin', 'levitate'],
	aevianrocket: ['bruteforce', 'reckless', 'rockhead', 'regenerator', 'moldbreaker', 'swiftswim'],
	railguncircuit: ['lightningrod'],
	wreckingball: ['sturdy', 'selfsufficient', 'crumblingshell'],
	swiftdrill: ['swiftswim', 'powerdrill', 'raindish'],
	bullrush: ['violentrush', 'intimidate'],
	safeharbor: ['icebody', 'waterabsorb', 'hydration'],
	ironvise: ['toughclaws', 'battlearmor', 'lightmetal', 'intimidate'],
	razorcurrent: ['drizzle', 'strongjaw', 'speedboost'],
	longreach: ['superluck', 'keeneye'],
	paradoxengine: [],
	greatmarsh: ['anticipation', 'dryskin', 'adaptability', 'toxicchain'],
	lifeguard: ['friendguard', 'swornduty', 'propellertail'],
	zen: ['waterabsorb', 'unaware', 'damp'],
	stormsong: ['liquidvoice', 'drizzle', 'soundproof'],
	astralward: ['magicbounce', 'telepathy', 'anticipation'],
	moonlightvigil: ['innerfocus', 'pressure', 'illuminate'],
	adaptivecore: ['download', 'defragment', 'selfrepair'],
	sweetresonance: ['supersweetsyrup', 'selfsufficient', 'hydrabond'],
	sweetsanctuary: ['friendguard', 'sweetveil', 'aromaveil', 'pastelveil'],
	auroraresonance: ['liquidvoice', 'waterabsorb', 'icebody', 'raindish'],
	absolutezero: ['snowwarning', 'moldbreaker', 'filter'],
	protectiveward: ['liquidvoice', 'shellarmor', 'waterabsorb'],
	crystalresonance: ['amethystglow', 'magicbounce'],
	windchime: ['armorize', 'punkrock', 'levitate'],
	bogbody: ['thickfat', 'levitate', 'dryskin'],
	solarhydra: ['hydrabond', 'grassysurge', 'solarpower', 'selfrepair', 'selfsufficient', 'naturalcure'],
	astralengine: ['elevate', 'powerspot', 'analytic'],
	hauntedchime: ['elevate', 'windpower', 'cursedbody'],
	auramaster: ['dualwield', 'innerfocus', 'technician'],
	bloomingsun: ['megasol', 'invigorate', 'naturalcure', 'proficient'],
	echosense: ['echofiend', 'frisk', 'telepathy', 'infiltrator'],
	froststalker: ['stakeout', 'sharpness', 'refrigerate'],
	sacredpower: ['duskilate', 'insomnia', 'magicguard'],
	nighthunt: ['strongjaw', 'infiltrator', 'intimidate', 'frisk', 'illuminate'],
	corrosivetouch: ['technician', 'poisontouch', 'corrosion'],
	stormbell: ['mirrorarmor', 'drizzle', 'elevate'],
	apexarmor: ['bulletproof', 'roughskin', 'stalwart', 'selfsufficient'],
	burningcrown: ['filter', 'selfsufficient', 'whitesmoke', 'moldbreaker', 'proficient'],
	burningego: ['proficient', 'ultraego', 'flamebody', 'magmaarmor'],
	burningspirit: ['selfsufficient', 'opportunist', 'magmaarmor', 'proficient'],
	crueltag: ['shadowtag', 'infiltrator', 'baddreams'],
	emperorsresolve: ['competitive', 'slushrush', 'swiftswim', 'proficient'],
	execution: ['duskilate', 'moldbreaker'],
	fallenstar: ['moldbreaker', 'dualwield', 'selfsufficient', 'proficient'],
	parasitism: ['dryskin'],
	completeparasitism: ['parasitism', 'dryskin', 'filter', 'selfrepair'],
	silkendecoy: ['insomnia', 'selfsufficient', 'swarm'],
	wickedsnare: ['stakeout', 'tanglinghair', 'prankster'],
	mythicscale: ['marvelscale', 'levitate', 'compoundeyes', 'shielddust'],
	aurainstinct: ['adaptability', 'dualwield', 'secondwind'],
	wrathshield: ['bulletproof', 'dauntlessshield', 'selfrepair', 'proficient'],
	shadowcurrent: ['protean', 'technician', 'anticipation', 'infiltrator', 'proficient'],
	astralwitchcraft: ['levitate', 'magicguard', 'magicbounce', 'proficient'],
	ragingcurrent: ['swiftswim', 'damp', 'dryskin', 'stamina', 'proficient'],
	calderacore: ['magmaarmor', 'sheerforce', 'drought'],
	doublestrike: ['ironfist', 'technician', 'skilllink'],
	siegelauncher: ['stalwart', 'proficient'],
	soulcremation: ['soulsiphon', 'soulpyre', 'malicewell'],
	malicewell: ['flamebody'],
	soultag: ['soulfire', 'shadowtag', 'flamebody'],
	deserttyrant: ['sandstream'],
	desertspirit: ['levitate', 'sandstream', 'tintedlens'],
	tremor: ['levitate', 'resonanceforce', 'sandforce'],
	desertshell: ['skilllink', 'heatproof', 'sandstream'],
	riptideclaws: ['swiftswim', 'toughclaws', 'shellarmor', 'moldbreaker'],
	fossilfrenzy: ['klutz'],
	phantomfist: ['unseenfist', 'selfrepair', 'shadowshield', 'aftermath'],
	alloycore: ['magicguard', 'selfsufficient', 'stalwart'],
	hellfireeclipse: ['solarpower', 'darkaura'],
	sacrededge: ['sharpness', 'swornduty'],
	omenedge: ['sharpness', 'dualwield', 'pressure'],
	dreadmaw: ['hugepower', 'frisk', 'invigorate'],
	cursedkeepsake: ['frisk'],
	cursedmarionette: ['prankster', 'frisk'],
	cursedarmament: ['filter', 'frisk'],
	phantombarrage: ['clearbody', 'infiltrator', 'levitate', 'hydrabond'],
	sandsovereign: ['sandstream', 'dauntlessshield', 'solidrock'],
	frostsovereign: ['snowwarning', 'icebody', 'filter'],
	freezerburn: ['slushrush', 'refrigerate', 'strongjaw', 'levitate'],
	stormfright: ['intimidate', 'stormpower', 'lightningrod'],
	enlightenment: ['purepower'],
	relentlesslink: ['skilllink', 'moldbreaker', 'powerdrill'],
	relentlesshunt: ['levitate'],
	mirrorgreed: ['magicbounce', 'analytic'],
	moonlitwings: ['serenegrace'],
	uncheckedassault: ['scrappy', 'striker', 'opportunist', 'limber'],
	voidvoice: ['pixilate', 'queenlymajesty', 'dreamsickness', 'telepathy'],
	perfectforesight: ['trace', 'insomnia'],
	dreamsickness: ['telepathy'],
	voidveil: ['levitate', 'magicguard', 'insomnia'],
	knuckletide: ['ironfist'],
	crosscurrent: ['swiftswim'],
	pearlcurrent: ['waterabsorb'],
	slipstream: ['levitate', 'keeneye'],
	smolderingshroud: ['whitesmoke'],
	springfur: ['furcoat'],
	voidhex: ['prankster', 'cursedbody'],
	breakwater: ['propellertail'],
	divinemockery: ['hydrabond', 'moldbreaker', 'sniper'],
	voidtyrant: ['hydrabond', 'berserk', 'selfsufficient'],
	hisuianpath: ['sapsipper', 'innerfocus', 'fluffy'],
	toxicevolution: ['moldbreaker', 'corrosion', 'dualwield', 'shielddust', 'levitate'],
	heavenlychorus: ['pixilate', 'cloudnine', 'fluffy'],
	voidomen: ['friendguard', 'serenegrace', 'moldbreaker'],
	heatcoil: ['speedboost', 'magmaarmor', 'flamebody'],
	coldlogic: ['toughclaws', 'prismarmor', 'aftermath', 'forewarn'],
	ironwill: ['prismarmor', 'secondwind', 'selfsufficient', 'whiplash'],
	joyride: ['aerilate', 'violentrush', 'vitalspirit'],
	hardyskin: ['dryskin', 'vitalspirit', 'moxie'],
	noseformation: ['filter', 'elevate'],
	perfectego: ['ultraego'],
	prismscale: ['marvelscale', 'oblivious', 'swiftswim'],
	queensguard: ['contrary', 'shedskin', 'intimidate', 'infiltrator', 'proficient'],
	rainsovereign: ['drizzle'],
	riotamp: ['galvanize', 'resonanceforce', 'voltabsorb'],
	mourningsnow: ['snowwarning', 'icebody'],
	venombastion: ['stamina', 'selfsufficient', 'merciless'],
	draconicforce: ['dragonize', 'strongjaw', 'moldbreaker', 'proficient'],
	tidaljaw: ['strongjaw', 'swiftswim', 'filter', 'proficient'],
	heavyartillery: ['unaware', 'shellarmor'],
	perfectstriker: ['striker', 'noguard', 'libero', 'proficient'],
	vanguard: ['intimidate'],
	royalarmament: ['powerdrill'],
	seablessing: ['waterveil', 'raindish'],
	seasonalstride: ['chlorophyll'],
	slowclamp: ['shellarmor', 'owntempo', 'analytic', 'sweetveil'],
	soaringspirit: ['windpower', 'selfsufficient'],
	solartrap: ['accumulation', 'digestivesap', 'liquidooze'],
	spiralevolution: ['moldbreaker', 'adaptability', 'levitate', 'dualwield', 'infiltrator', 'shielddust'],
	stormsovereign: ['galewings', 'keeneye'],
	sunsovereign: ['moldbreaker', 'drought', 'unboundblaze', 'selfsufficient', 'proficient'],
	terraresolve: ['stamina', 'solidrock', 'proficient'],
	primalego: ['unaware', 'proficient', 'ultraego', 'moldbreaker'],
	toxicbloom: ['pollenbloom', 'selfsufficient'],
	toxicrenewal: ['adaptability', 'regenerator', 'poisontouch'],
	vendetta: ['angerpoint', 'secondwind', 'selfsufficient'],
	auroracurrent: ['snowwarning'],
	dunetyrant: ['sandstream', 'strongjaw'],
	ironmountain: ['filter', 'stamina', 'heavymetal'],
	woolyconductor: ['fluffy', 'moldbreaker', 'static'],
	helios: ['drought', 'moldbreaker', 'berserk', 'swiftswim'],
	rimeknuckle: ['ironfist', 'filter', 'icebody'],
	ragingstorm: ['moldbreaker', 'battlearmor'],
	ragingoverlord: ['ragingstorm', 'supremeoverlord', 'moldbreaker', 'battlearmor'],
	abysssniper: ['sniper', 'stalwart'],
	atrocity: ['moldbreaker', 'unboundblaze', 'selfsufficient', 'proficient', 'toughclaws'],
	streettyrant: ['intimidate', 'shedskin', 'moldbreaker'],
	vitalsigns: ['invigorate'],
	divineintervention: ['vitalsigns', 'triage', 'regenerator', 'friendguard'],
	voidcraft: ['elevate', 'shadowshield', 'temporalshift', 'insomnia'],
	requiem: ['cursedbody'],
	reapersgrip: ['unaware', 'darkaura', 'selfsufficient'],
	pendulumswing: ['insomnia', 'filter'],
	nightmarepulse: ['pendulumswing', 'cursedbody', 'baddreams'],
	pulsetriad: ['hydrabond', 'levitate', 'clearbody'],
	pulsewaste: ['protean', 'poisontouch', 'regenerator'],
	rifteater: ['accumulation', 'sandstream'],
	mountainrift: ['shellarmor', 'selfsufficient'],
	desertrift: ['sandforce', 'sandstream', 'heavymetal'],
	glacialmass: ['heavymetal', 'thickfat'],
	unleashedego: ['ultraego', 'levitate', 'ragingstorm'],
	moonlithide: ['shadowshield', 'magicguard'],
	supersweetsyrup: ['stickyhold'],
	naturalrecovery: ['naturalcure', 'regenerator'],
	mossarmor: ['stamina', 'naturalrecovery', 'levitate'],
	stormcalling: ['drizzle', 'liquidvoice', 'tintedlens'],
	aevianfrost: ['icebody', 'guts'],
	aeviantoxin: ['strongjaw', 'layeredcoat', 'furcoat', 'overcoat', 'merciless'],
	aevianglacier: ['snowwarning', 'icebody', 'refrigerate'],
	aevianbolt: ['stormpower', 'static', 'voltabsorb'],
	riftdancer: ['chlorophyll', 'dancer', 'overgrow'],
	curseddoll: ['toughclaws', 'shadowshield', 'frisk'],
	apexvenom: ['strongjaw', 'shedskin'],
	sirius: ['apexvenom', 'whiplash'],
	neurotoxin: ['hydrabond', 'shedskin', 'regenerator'],
	patternshift: ['protean', 'shedskin', 'unaware'],
	venomarmor: ['poisonheal', 'dualwield'],
	toxicarmor: ['venomarmor', 'violentrush'],
	corrosiveburn: ['corrosion', 'oblivious', 'venomignition'],
	solarrush: ['sandrush', 'chlorophyll'],
	ultrainstinct: ['moldbreaker', 'innerfocus'],
	unovawing: ['superluck', 'competitive'],
	aevianwing: ['rockhead', 'defiant'],
	resuscitation: ['selfrepair', 'magicguard'],
	shieldsdown: ['shellarmor', 'selfrepair', 'crumblingshell'],
	schooling: ['hydrabond', 'selfrepair', 'moldbreaker'],
	seviischooling: ['schooling', 'hydrabond', 'selfrepair', 'moldbreaker'],
};
Object.assign(AbilityComponents, {
	"updraft": [],
	"corneredfang": [
		"guts",
	],
	"nighthoard": [],
	"dunerunner": [
		"sandrush",
	],
	"frostrunner": [
		"slushrush",
	],
	"bedrockclaw": [
		"toughclaws",
	],
	"rimeclaw": [
		"toughclaws",
	],
	"broodguard": [
		"thickfat",
		"friendguard",
	],
	"suncharm": [
		"drought",
	],
	"causticscales": [],
	"prismwings": [
		"tintedlens",
	],
	"oneiricdust": [
		"psychicsurge",
	],
	"pincercrush": [
		"toughclaws",
	],
	"decoypincers": [],
	"toxiccocoon": [],
	"galebloom": [],
	"gemeye": [
		"keeneye",
	],
	"lastlaugh": [],
	"openingoverture": [],
	"resonantblade": [],
	"finalnote": [],
	"livingtangle": [
		"tanglinghair",
		"stamina",
	],
	"rootrenewal": [
		"regenerator",
	],
	"fortunatewing": [
		"superluck",
	],
	"snowpack": [
		"thickfat",
		"icebody",
		"toughclaws",
	],
	"icemirror": [],
	"wailingsnow": [],
	"stonewall": [
		"sturdy",
	],
	"saltbastion": [
		"sturdy",
	],
	"anchorbridge": [
		"sturdy",
	],
	"layeredshell": [
		"shellarmor",
	],
	"breakaway": [],
	"fossilram": [
		"rockhead",
	],
	"rootediron": [
		"stamina",
	],
	"encorearia": [
		"serenegrace",
	],
	"peppersting": [
		"insomnia",
	],
	"sushitrick": [
		"hospitality",
	],
	"mastercourse": [
		"contrary",
	],
	"secondbrew": [],
	"railsight": [
		"stalwart",
	],
});

export function abilityIncludesComponent(ability: string, component: string, seen = new Set<string>()): boolean {
	const id = ability.toLowerCase().replace(/[^a-z0-9]/g, '');
	const query = component.toLowerCase().replace(/[^a-z0-9]/g, '');
	if (id === query) return true;
	if (seen.has(id)) return false;
	seen.add(id);
	return (AbilityComponents[id] || []).some(part => abilityIncludesComponent(part, query, seen));
}

Object.assign(AbilityComponents, {
  "sovereignarsenal": [],
  "pollenengine": [
    "chlorophyll"
  ],
  "titanpincer": [
    "hypercutter"
  ],
  "shellcracker": [],
  "tidaldominion": [
    "swiftswim"
  ],
  "tempestfury": [],
  "ironlash": [
    "whiplash"
  ],
  "trailbreaker": [],
  "armoredadvance": [],
  "gritgrappler": [
    "guts"
  ],
  "dreadjaw": [
    "moxie"
  ],
  "floehunter": [
    "slushrush"
  ],
  "lanceguard": [
    "shellarmor"
  ],
  "headlongresolve": [],
  "herdshelter": [
    "soundproof"
  ],
  "scorchsweep": [],
  "opensky": [],
  "tidalvoice": [
    "liquidvoice"
  ],
  "rechargerelay": [
    "battery"
  ],
  "hovercannon": [
    "levitate"
  ],
  "keenhunt": [],
  "bloodchallenge": [],
  "twilightinstinct": [],
  "twincannons": [],
  "twinblades": [],
  "heatreservoir": [
    "flashfire"
  ],
  "mourningcoat": [
    "fluffy"
  ],
  "gravewind": [
    "sandrush"
  ],
  "dozinggiant": [
    "oblivious"
  ],
  "quillreservoir": [
    "waterabsorb"
  ],
  "raisedquills": []
});

Object.assign(AbilityComponents, {
  "mountainbreaker": [],
  "dreadpresence": [],
  "palmmastery": [
    "thickfat"
  ],
  "galvanicspirit": [
    "vitalspirit"
  ],
  "blastchamber": [
    "vitalspirit"
  ],
  "venomspurs": [],
  "lastbrood": [
    "swarm"
  ],
  "venombastion": [
    "stamina"
  ],
  "shadowfeint": [],
	"silksights": ["compoundeyes", "keeneye"],
  "livenet": [
    "unnerve"
  ],
  "barbharvest": [
    "ironbarbs"
  ],
  "currentcoil": [
    "swiftswim"
  ],
  "stormcircuit": [
    "electricsurge",
    "elevate",
    "currentcoil",
    "swiftswim"
  ],
  "soulpyre": [],
  "blackviper": [
    "whiplash"
  ],
  "silkshuriken": [],
  "hiddenscroll": [],
  "toxicserenity": [
    "poisonheal"
  ],
  "mudtemper": [
    "battlearmor"
  ],
  "skywarden": [],
  "lockjaw": [
    "strongjaw"
  ],
  "rivershell": [
    "shellarmor"
  ],
	"territorial": ["unnerve", "stamina", "guarddog"],
  "funeralchoir": [],
  "festivalstep": [],
  "saltcrust": [
    "clearbody"
  ],
  "beyondfear": [
    "innerfocus"
  ],
  "stillwater": [
    "waterabsorb"
  ],
  "mudmeditation": []
});

Object.assign(AbilityComponents, {
  sirius: ['apexvenom', 'blackviper', 'whiplash'],
  coldopen: [], quarrycannon: ['solidrock'], tundramarch: ['oblivious'],
  undertow: ['waterabsorb'], deadwater: [], vitalcircuit: [],
  ringmaster: ['toughclaws'], unyielding: ['stamina'], primalrhythm: [],
	setpiece: [], calculatedshot: ['frisk'], lunardread: ['dishearten', 'insomnia', 'pressure'], falsebouquet: [],
  voidtyrant: ['hydrabond', 'berserk'],
  meridianseal: [], rimeplate: [], darkdominion: ['darkaura'],
});

AbilityComponents.soothingpresence = ['friendguard', 'aromaveil'];

// Approved October signature revisions; no shared component is globally changed.
Object.assign(AbilityComponents, {
  steelplumage: [], venomcanticle: [], solarbud: [], dissonantecho: [],
  templechime: ['elevate', 'levitate'],
  solarhydra: ['hydrabond', 'grassysurge', 'solarpower', 'solarbud'],
  stormcalling: ['drizzle', 'liquidvoice', 'dissonantecho'],
  mossarmor: ['levitate', 'stamina', 'naturalcure'],
});

Object.assign(AbilityComponents, {searescuer: [], dreepyvanguard: ['stalwart'], groundingtail: []});

// Venom Veil forwards selected Corrosion hooks; this identity enables poison-status immunity bypass.
AbilityComponents.venomveil = ['liquidooze', 'corrosion', 'waterveil'];

AbilityComponents.frightfulwings = ['intimidate'];

AbilityComponents.pulseeruption = ['sturdy'];

Object.assign(AbilityComponents, {
	"scrapbreaker": [
		"moldbreaker",
	],
	"toxicsignature": [
		"unnerve",
	],
	"wickedweave": [
		"prankster",
	],
	"vaultkeeper": [
		"prankster",
		"stickyhold",
	],
	"masterkey": [],
	"groundingtail": [],
	"flintfracture": [],
	"frozenfeast": [
		"strongjaw",
	],
	"cinderscales": [
		"flamebody",
		"swarm",
		"shielddust",
	],
	"sporeshroud": [
		"effectspore",
	],
	"primevalhunt": [
		"skilllink",
		"battlearmor",
	],
	"rimebreaker": [
		"refrigerate",
	],
	"twilightinstinct": [],
	"duskdrive": [
		"battlefervor",
		"precision",
		"opportunist",
	],
	"evaporate": [
		"dryskin",
	],
	"pressurekiln": [],
	"shattercrust": [
		"crumblingshell",
	],
	"restorativechime": [],
	"dissonantchime": [],
	"gravehunger": [
		"baddreams",
	],
});

AbilityComponents.primevalhunger = ['accumulation'];

AbilityComponents.razorreach = ['sharpness', 'longreach', 'keeneye'];
AbilityComponents.witheringtouch = ['poisontouch', 'corrosion'];

AbilityComponents.anchorbridge = ['sturdy', 'solidrock'];
AbilityComponents.railsight = ['stalwart'];

AbilityComponents.kickfiend = ['striker', 'violentrush', 'limber'];

AbilityComponents.fluffycraft = ['fluffy', 'technician', 'naturalcure'];

AbilityComponents.dawnherald = ['drought', 'friendguard'];

AbilityComponents.transfixinggaze = ['frisk'];

AbilityComponents.freshplumage = ['naturalcure'];

AbilityComponents.pulsefiltration = ['waterabsorb', 'liquidooze'];

AbilityComponents.soulsiphon = ['flashfire'];

AbilityComponents.conquerorswill = ['supremeoverlord', 'unnerve'];

AbilityComponents.triplethreat = ['hydrabond', 'tangledfeet', 'keeneye', 'bigpecks', 'limber'];

// Its other local effects remain manually implemented; do not add identities for partial components.
AbilityComponents.parentalbond = ['moldbreaker'];

AbilityComponents.nightwatch = ['keeneye', 'insomnia'];
AbilityComponents.fruitfulbough = ['harvest'];
AbilityComponents.soulanchor = ['steelworker'];

AbilityComponents.guidinglight = ['dazzling', 'illuminate'];
AbilityComponents.royalescort = ['pressure', 'sweetveil'];

AbilityComponents.liquidarsenal = ['technician'];
AbilityComponents.knightsreprisal = ['bulletproof'];
AbilityComponents.voidsanctum = ['snowwarning'];
AbilityComponents.chargedtail = ['static'];
AbilityComponents.falsebouquet = ['magician'];

AbilityComponents.eldritchremedy = ["owntempo","curiousmedicine"];

AbilityComponents.infernaldominion = ["intimidate"];

AbilityComponents.hydraulicarmor = ["stamina"];

AbilityComponents.hauntingpresence = ["levitate"];

AbilityComponents.slumberinggiant = ["comatose","thickfat"];

AbilityComponents.oceanlullaby = ["shellarmor"];

AbilityComponents.shadowscreen = ["infiltrator"];

AbilityComponents.voidpromise = ["unaware"];

AbilityComponents.voiddrift = ["levitate","overcoat"];

AbilityComponents.voidguile = ["magician", "infiltrator"];

AbilityComponents.voidwrath = ['moldbreaker'];

AbilityComponents.creepingbloom = ['infiltrator'];

AbilityComponents.dreadwings = ['intimidate', 'unnerve'];

Object.assign(AbilityComponents, {
	"causticchamber": [
		"owntempo"
	],
	"demolitiontrunk": [
		"sheerforce"
	],
	"deepresonance": [
		"soundproof"
	],
	"siegemagnet": [
		"magnetpull"
	],
	"patientmarksman": [
		"sniper"
	],
	"cradleward": [
		"sweetveil"
	],
	"sunreserve": [
		"flashfire"
	],
	"silentreprisal": [
		"soundproof",
		"anticipation"
	],
	"dreamrefuge": [
		"telepathy"
	],
	"closedcircuit": [
		"clearbody"
	]
});

Object.assign(AbilityComponents, {"pridecall":["competitive","unnerve"],"hydroelectric":["dryskin"],"solarstride":["chlorophyll"],"frillflash":["dazzling"]});

Object.assign(AbilityComponents, {"stokebelly":["gluttony"],"rousingfeast":["gluttony"],"invisiblewall":["soundproof"],"sentinelfist":["ironfist"],"pursuitwake":["infiltrator"],"gentlegiant":["cloudnine"],"ringcraft":["limber"],"constrictingheat":["whitesmoke"]});

AbilityComponents.voidreprisal = ['guts'];
AbilityComponents.wreckingcrew = ['ironfist'];

Object.assign(AbilityComponents, {"evergreen":["overcoat","ripen"],"battlegrip":["moxie"],"scentscout":["frisk"],"surefoot":["innerfocus"],"baitedbloom":["gluttony","stickyhold"],"guidinggallop":["pastelveil"],"carrionwatch":["frisk","unnerve"]});

Object.assign(AbilityComponents, {"scaleshelter":["shielddust","overcoat"],"stagesweep":["screencleaner"],"icebreaker":["hypercutter"],"cactuschorus":["waterabsorb"],"crushingvenom":["strongjaw"],"crosswire":["ironfist"],"deepchill":["oblivious"],"climatereserve":[]});

Object.assign(AbilityComponents, {"tunnelclearance":["hypercutter"],"crystalbastion":["sturdy"],"buriedcoil":["sandspit"],"staticreserve":["static"],"lockinggrip":["hypercutter"],"garlandgift":["flowerveil"]});

AbilityComponents.riotstance = ['defiant'];

AbilityComponents.drumguard = ['soundproof'];
AbilityComponents.measuredcounsel = ['owntempo'];

AbilityComponents.raincourier = ['raindish'];

AbilityComponents.disorientingmind = ['infiltrator'];
AbilityComponents.wisecounsel = ['innerfocus'];
AbilityComponents.mindcurrent = ['innerfocus'];

AbilityComponents.voidcrossing = ['magicguard', 'infiltrator'];
