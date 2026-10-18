import {AbilityComponentExclusions} from './passive-ability-cleanup';
/** Genuine mechanical components shared by battle identity and search. */
export const AbilityComponents: { [id: string]: string[] } = {
 piercingdrill: [],
 deepbore: ['moldbreaker', 'powerdrill'],
 grandmaster: ['innerfocus'],
 swiftvenom: ['swiftswim', 'merciless'],
	dreaddominion: ['hydrabond', 'moxie', 'intimidate'],
	eternalflower: ['moldbreaker'],
	ange: ['moldbreaker'],
	reservoir: ['waterabsorb', 'gluttony', 'damp'],
	savageresolve: ['guts'],
	lancepoint: ['keeneye'],
	anchoredbattery: ['megalauncher', 'suctioncups'],
	shadowbond: ['battlebond', 'selfsufficient', 'proficient', 'infiltrator'],
	apexbond: ['battlebond', 'selfsufficient', 'supremeoverlord', 'roughskin'],
	sacredbond: ['battlebond', 'selfsufficient', 'magmaarmor', 'intimidate', 'flashfire'],
	battlebond: ['selfsufficient'],
	highnoon: ['dualwield', 'megalauncher', 'proficient'],
	strikersmomentum: ['proficient'],
	forestsurge: ['proficient'],
	exalt: ['defiant', 'sharpness', 'moldbreaker'],
	grandstrategy: ['moldbreaker'],
	// Brute Force delegates power/recoil callbacks; it does not grant full Reckless/Rock Head field identities.
	burningrage: ['proficient', 'bruteforce', 'ironfist', 'moldbreaker'],
	terragift: ['hospitality', 'unaware', 'proficient'],
	blazingtempo: ['proficient', 'speedboost', 'striker', 'magmaarmor', 'keeneye'],
	verdantdrake: ['proficient', 'dualwield', 'regenerator', 'lightningrod', 'limber'],
	mightyjaw: ['proficient'],
	blazingmane: ['proficient'],
	plasmaeruption: ['proficient', 'static', 'flamebody'],
	gigavolt: ['moldbreaker', 'lightningrod', 'static'],
	verdantedge: ['chlorophyll', 'grasspelt', 'sharpness'],
	permafrost: ['icebody', 'icescales', 'refrigerate'],
	glacialheart: ['icebody'],
	tidalwave: ['waterabsorb', 'hydration', 'raindish'],
	livewire: ['transistor', 'voltabsorb', 'quickfeet', 'ironbarbs'],
	kindledfury: ['fluffy', 'guts', 'flashfire'],
	verdanthospitality: ['proficient'],
	verdantsanctuary: ['grassysurge', 'hospitality', 'friendguard'],
	fortressshell: ['proficient'],
	waterbarrage: ['proficient'],
	unboundblaze: ['proficient'],
	pollenbloom: ['proficient', 'thickfat'],
	ironclad: ['armorize'],
	apexpredator: ['relicarmor', 'dragonize', 'windrider'],
	tyrantdomain: ['relicarmor', 'supremeoverlord', 'selfsufficient', 'sandstream'],
	auroradomain: ['relicarmor', 'refrigerate', 'selfsufficient', 'snowwarning'],
	royalscales: ['marvelscale', 'oblivious', 'swiftswim', 'dragonize', 'selfsufficient'],
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
	bonewarrior: ['battlearmor'],
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
	moonveil: ['pastelveil', 'mistysurge', 'friendguard'],
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
	desertspirit: ['levitate', 'sandstream', 'overcoat', 'tintedlens'],
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
	mirrorgreed: ['magicbounce', 'analytic', 'opportunist'],
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
	divinemockery: ['hydrabond', 'moldbreaker'],
	voidtyrant: ['hydrabond', 'berserk', 'selfsufficient'],
	hisuianpath: ['sapsipper', 'innerfocus', 'fluffy'],
	toxicevolution: ['moldbreaker', 'corrosion', 'dualwield', 'shielddust', 'levitate'],
	heavenlychorus: ['pixilate', 'cloudnine', 'fluffy'],
	voidomen: ['friendguard', 'serenegrace', 'moldbreaker'],
	heatcoil: ['speedboost', 'magmaarmor', 'flamebody'],
	coldlogic: ['toughclaws', 'aftermath', 'forewarn'],
	ironwill: ['prismarmor', 'secondwind', 'selfsufficient', 'whiplash'],
	joyride: ['aerilate', 'violentrush', 'vitalspirit'],
	hardyskin: ['dryskin', 'vitalspirit', 'moxie'],
	noseformation: ['elevate'],
	perfectego: ['ultraego'],
	prismscale: ['friendguard', 'oblivious', 'swiftswim'],
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
	ragingstorm: ['moldbreaker'],
	ragingoverlord: ['ragingstorm', 'supremeoverlord', 'moldbreaker'],
	abysssniper: ['sniper', 'stalwart'],
	atrocity: ['moldbreaker', 'unboundblaze', 'selfsufficient', 'proficient', 'toughclaws'],
	streettyrant: ['intimidate', 'shedskin', 'moldbreaker'],
	vitalsigns: ['invigorate'],
	divineintervention: ['vitalsigns', 'triage', 'regenerator', 'friendguard'],
	voidcraft: ['elevate', 'shadowshield', 'temporalshift', 'insomnia'],
	requiem: ['cursedbody', 'filter'],
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
	toxicarmor: ['dualwield', 'violentrush'],
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
	"updraft": ['competitive'],
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
		"magicguard",
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
	const rawId = ability.toLowerCase().replace(/[^a-z0-9]/g, '');
	const id = ({bedrockclaw:'duneclaws',rimeclaw:'glacierclaws',dunerunner:'sandrush',frostrunner:'slushrush',mineralgrip:'barbharvest',royalonslaught:'patriarchswrath',royalaegis:'matriarchsvigil',masterptissier:'masterpatissier'} as {[id:string]:string})[rawId] || rawId;
	const query = component.toLowerCase().replace(/[^a-z0-9]/g, '');
	if (id === query) return true;
	if (AbilityComponentExclusions[id]?.includes(query)) return false;
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
    "liquidvoice", "soundproof"
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
  coldopen: [], quarrycannon: ['megalauncher'], tundramarch: ['oblivious'],
  undertow: ['waterabsorb'], deadwater: [], vitalcircuit: [],
  ringmaster: ['toughclaws'], unyielding: ['innerfocus'], primalrhythm: [],
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
		"owntempo",
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
AbilityComponents.railsight = ['innerfocus'];

AbilityComponents.kickfiend = ['striker', 'violentrush', 'limber'];

AbilityComponents.fluffycraft = ['fluffy', 'technician', 'naturalcure'];

AbilityComponents.dawnherald = ['drought', 'friendguard'];

AbilityComponents.transfixinggaze = ['frisk'];

AbilityComponents.freshplumage = ['naturalcure'];

AbilityComponents.pulsefiltration = ['waterabsorb', 'liquidooze'];

AbilityComponents.soulsiphon = ['flashfire'];

AbilityComponents.conquerorswill = ['unnerve'];

AbilityComponents.triplethreat = ['hydrabond', 'tangledfeet', 'keeneye', 'bigpecks', 'limber'];

// Its other local effects remain manually implemented; do not add identities for partial components.
AbilityComponents.parentalbond = ['moldbreaker'];

AbilityComponents.nightwatch = ['keeneye', 'insomnia'];
AbilityComponents.fruitfulbough = ['harvest'];
AbilityComponents.soulanchor = ['steelworker'];

AbilityComponents.guidinglight = ['dazzling', 'healer'];
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

Object.assign(AbilityComponents, {"evergreen":["overcoat","ripen"],"battlegrip":["moxie"],"scentscout":["frisk"],"surefoot":[],"baitedbloom":["gluttony","stickyhold"],"guidinggallop":["pastelveil"],"carrionwatch":["frisk","unnerve"]});

Object.assign(AbilityComponents, {"scaleshelter":["shielddust","overcoat"],"stagesweep":["screencleaner"],"icebreaker":["hypercutter"],"cactuschorus":["waterabsorb","sandrush"],"crushingvenom":["strongjaw"],"crosswire":["ironfist"],"deepchill":["oblivious"],"climatereserve":[]});

Object.assign(AbilityComponents, {"tunnelclearance":["hypercutter"],"crystalbastion":["sturdy"],"buriedcoil":["sandspit"],"staticreserve":["static"],"lockinggrip":["hypercutter"],"garlandgift":["flowerveil"]});

AbilityComponents.riotstance = ['defiant'];

AbilityComponents.drumguard = ['soundproof'];
AbilityComponents.measuredcounsel = ['owntempo'];

AbilityComponents.raincourier = ['raindish'];

AbilityComponents.disorientingmind = ['infiltrator'];
AbilityComponents.wisecounsel = ['innerfocus'];
AbilityComponents.mindcurrent = ['innerfocus'];

AbilityComponents.voidcrossing = ['magicguard', 'infiltrator'];

AbilityComponents.orchardbond = ['hydrabond', 'harvest'];

// Previously implicit components are explicit for shared-package search and form-aware displays.
AbilityComponents.venomheal = [...(AbilityComponents.venomheal || []), 'hypercutter'];
AbilityComponents.elevate = [...(AbilityComponents.elevate || []), 'levitate'];
for (const [id, excluded] of Object.entries(AbilityComponentExclusions)) {
 AbilityComponents[id] = (AbilityComponents[id] || []).filter(part => !excluded.includes(part));
}

AbilityComponents.gentlescales = ['compoundeyes'];

AbilityComponents.vendetta = [];

AbilityComponents.spiralevolution = ['moldbreaker', 'adaptability', 'dualwield', 'shielddust'];
AbilityComponents.toxicevolution = ['moldbreaker', 'corrosion', 'dualwield', 'shielddust'];
AbilityComponents.mythicscale = ['marvelscale', 'compoundeyes', 'shielddust'];

AbilityComponents.voidomen = ['friendguard', 'serenegrace'];

AbilityComponents.hauntingveil = ['cursedbody', 'infiltrator'];

AbilityComponents.solartrap = ['accumulation', 'liquidooze'];
AbilityComponents.auraprecision = ['shielddust', 'technician'];

import {SelectedComponentRemovals, SelectedExactComponents} from './selected-mega-simplification-data';
for (const [id, removed] of Object.entries(SelectedComponentRemovals)) {
	AbilityComponents[id] = (AbilityComponents[id] || []).filter(part => !removed.includes(part));
}
Object.assign(AbilityComponents, SelectedExactComponents);
AbilityComponents.uncheckedassault = [...AbilityComponents.uncheckedassault, 'vitalspirit'];
// These primitives already dispatch these components; record their genuine ownership.
AbilityComponents.waterbarrage = ['dualwield', 'stalwart'];
AbilityComponents.pollenbloom = ['thickfat', 'unaware'];

import {GmaxExtractedComponents} from './gmax-passive-data';
for (const [id, components] of Object.entries(GmaxExtractedComponents)) {
	AbilityComponents[id] = [...new Set([...(AbilityComponents[id] || []), ...components])];
}
AbilityComponents.crushingdepths = [];
AbilityComponents.afterlifegate = ['shadowshield'];

AbilityComponents.grapplingclaws = ['toughclaws'];

AbilityComponents.baitedbloom = ['gluttony', 'regenerator'];
AbilityComponents.sunsovereign = [...AbilityComponents.sunsovereign, 'intimidate'];
AbilityComponents.stormsovereign = AbilityComponents.stormsovereign.filter(id => id !== 'keeneye').concat('updraft');
AbilityComponents.sandsovereign = [...AbilityComponents.sandsovereign, 'mountainbreaker'];
AbilityComponents.frostsovereign = [...AbilityComponents.frostsovereign, 'soundproof'];

AbilityComponents.burningspirit = ['ultrainstinct', 'opportunist', 'magmaarmor'];
AbilityComponents.venompincer = ['poisontouch'];
AbilityComponents.punchfiend = ['keeneye', 'innerfocus', 'unseenfist'];

AbilityComponents.unbridledwrath = ['sheerforce', 'innerfocus'];

AbilityComponents.toxicspines = [...AbilityComponents.toxicspines, 'ironbarbs'];

AbilityComponents.patriarchswrath = ['powerdrill', 'whiplash'];
AbilityComponents.matriarchsvigil = ['thickfat', 'aromaveil', 'friendguard'];

AbilityComponents.heatcoil = [...AbilityComponents.heatcoil, 'longreach'];
AbilityComponents.inversion = [...(AbilityComponents.inversion || []), 'infiltrator'];
AbilityComponents.ironmountain = [...AbilityComponents.ironmountain, 'hypercutter'];

import {FinalPassiveComponents} from './final-passive-migrations';
import {FamilyReplacementComponents} from './family-replacements';
Object.assign(AbilityComponents, FinalPassiveComponents, FamilyReplacementComponents);

AbilityComponents.knightsguard = ['swornduty'];

AbilityComponents.ruinedsky = ['moldbreaker'];
AbilityComponents.apocalypticflame = ['owntempo'];
AbilityComponents.rupturedheaven = ['sharpness'];
AbilityComponents.burningquake = ['superluck'];

AbilityComponents.wintersmalice = ['refrigerate', 'berserk', 'cursedbody'];

AbilityComponents.bloomingsun = ['megasol', 'flowerveil'];
AbilityComponents.skywarden = ['windrider'];
AbilityComponents.steelwingescort = ['swornduty'];
AbilityComponents.soulreaver = ['infiltrator'];
AbilityComponents.wickedsnare = ['intimidate'];
AbilityComponents.sweetsanctuary = ['ripen'];

AbilityComponents.silenthunter = ['superluck'];

AbilityComponents.abyssalclaws = ['toughclaws'];
delete AbilityComponents.grapplingclaws;
AbilityComponents.antlioninstinct = ['sheerforce'];
AbilityComponents.burrowambush = ['eartheater'];

AbilityComponents.plushwhiplash = ['whiplash', 'technician', 'fluffy'];
AbilityComponents.silkensalvo = ['fluffy'];
delete AbilityComponents.fluffycraft;

AbilityComponents.magneticcommand = ['frisk', 'stalwart'];

AbilityComponents.adhesivearmor = ['stickyhold'];
AbilityComponents.causticooze = ['liquidooze'];
AbilityComponents.royalpresence = ['pressure','unnerve'];
AbilityComponents.hivesanctuary = ['sweetveil','friendguard'];
delete AbilityComponents.royalescort;

AbilityComponents.guidingglow = ['illuminate','sweetveil'];
AbilityComponents.rainlitgrowth = ['raindish'];
AbilityComponents.astralconcord = ['forewarn','competitive'];
AbilityComponents.cellularconcord = ['naturalcure','analytic'];
AbilityComponents.trickperformer = ['technician','prankster'];
AbilityComponents.taptempo = ['owntempo'];

AbilityComponents.venomarmor = ['dualwield','battlearmor'];
AbilityComponents.toxicarmor = ['dualwield','violentrush'];
AbilityComponents.sirius = [...(AbilityComponents.sirius || []),'venamskiss'];
AbilityComponents.mycelialbond = ['dryskin'];
AbilityComponents.scrapbreaker = [];

AbilityComponents.silentact = ['soundproof'];
AbilityComponents.curtaincall = ['icebody','filter'];
AbilityComponents.stagesweep = ['screencleaner','infiltrator'];

AbilityComponents.pearlsiphon = ['competitive'];
AbilityComponents.pearltide = ['hydration'];
AbilityComponents.abyssalfang = ['strongjaw'];
AbilityComponents.abyssalcurrent = ['waterabsorb'];

AbilityComponents.soothingbouquet = ['friendguard','infiltrator'];

AbilityComponents.mountainhide = ['solidrock','innerfocus'];
AbilityComponents.rimebark = ['thickfat','icebody'];
AbilityComponents.blademastery = ['sharpness','superluck'];
AbilityComponents.goldentalons = ['stalwart','goodasgold','sharpness'];

AbilityComponents.pyrousdominion = ['pressure'];

AbilityComponents.bottomlessgullet = ['gluttony','cheekpouch'];
AbilityComponents.divefisher = ['waterveil'];
AbilityComponents.scatterbrain = ['oblivious','unaware'];

AbilityComponents.reinflate = ['punkrock'];
AbilityComponents.cushionchorus = ['friendguard','aromaveil'];
AbilityComponents.perfectapple = ['purepower','selfsufficient','angershell'];
AbilityComponents.boundspirits = ['prankster','magicguard'];
AbilityComponents.keystoneseal = ['cursedbody'];

AbilityComponents.polarrest = ['earlybird', 'icebody'];
AbilityComponents.glacierbreaker = ['moldbreaker'];
AbilityComponents.deepchill = ['oblivious', 'intimidate'];

AbilityComponents.accumulation = [...(AbilityComponents.accumulation || []), 'thickfat'];

AbilityComponents.beguilingbouquet = ['aromaveil'];
AbilityComponents.venomspurs = ['corrosion'];
AbilityComponents.lastbrood = ['swarm'];

AbilityComponents.racingspirit = ['rockhead','limber'];

AbilityComponents.soothingcream = ['ripen'];
AbilityComponents.masterpatissier = ['aromaveil'];
AbilityComponents.sweetsanctuary = ['stamina'];

AbilityComponents.tirelessmuscle = ['innerfocus'];

AbilityComponents.bloodsickle = ['hypercutter'];
AbilityComponents.graspingcurrent = ['suctioncups'];

AbilityComponents.barbharvest = ['suctioncups'];

AbilityComponents.rimeboundspirit = ['heatproof'];

Object.assign(AbilityComponents,{livewiretrap:['static'],mudflatdynamo:['battlearmor'],ironclamp:['battlearmor'],baitedcounter:['filter']});

AbilityComponents.blackviper = [...new Set([...(AbilityComponents.blackviper || []), 'shedskin'])];

AbilityComponents.magneticbulwark = ['filter'];

AbilityComponents.blademastery = ['sharpness'];
AbilityComponents.ange = ['fairyaura'];
AbilityComponents.lastingpromise = ['friendguard'];
AbilityComponents.desertvigil = ['overcoat'];

AbilityComponents.imperialprincess = ['striker', 'vitalspirit'];
AbilityComponents.ragingcurrent = ['swiftswim', 'damp', 'dryskin', 'stamina'];

AbilityComponents.beyondfear = [];
AbilityComponents.unboundspirit = ['vitalspirit'];
AbilityComponents.ragingheart = [];
AbilityComponents.silkendecoy = ['selfsufficient', 'swarm'];

Object.assign(AbilityComponents,{rollingfortress:['rockhead'],siegetusks:['moldbreaker'],floehunter:['slushrush'],headlongresolve:['reckless'],scorchsweep:['rockhead'],keenhunt:['keeneye'],hyperdrill:['powerdrill'],venombastion:['stamina']});
delete AbilityComponents.armoredadvance; delete AbilityComponents.trailbreaker;

Object.assign(AbilityComponents,{duneclaws:['toughclaws'],glacierclaws:['toughclaws']});
for(const id of ['bedrockclaw','rimeclaw','dunerunner','frostrunner'])delete AbilityComponents[id];

import {EeveeCloysterComponents} from './eeveelution-cloyster-approved';
Object.assign(AbilityComponents,EeveeCloysterComponents);


AbilityComponents.ironmountain=['hypercutter','suctioncups'];
AbilityComponents.disguise=[];
AbilityComponents.stancechange=[];

Object.assign(AbilityComponents,{hydraflight:['levitate','hydrabond'],worldbreaker:['berserk','merciless','duskilate'],falseliberation:['moldbreaker','berserk']});

AbilityComponents.performer=['dancer','songstress'];

import {MewtwoComponents} from './mewtwo-approved';
Object.assign(AbilityComponents,MewtwoComponents);

import {SeasonalBirdComponents} from './seasonal-birds';
Object.assign(AbilityComponents, SeasonalBirdComponents);

import {JirachiComponents} from './jirachi-approved';
Object.assign(AbilityComponents,JirachiComponents);

import {RegiComponents} from './regi-approved';
Object.assign(AbilityComponents,RegiComponents);

import {PrimordialComponents} from './primordial-approved';
Object.assign(AbilityComponents, PrimordialComponents);
