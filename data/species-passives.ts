import {StarterPassives} from './starter-passives';

/** Explicitly approved ordinary species; no evolution or battle-form inheritance. */
export const ThematicPassiveGroups = {
	hypercutter: ['kingler', 'pinsir', 'crawdaunt', 'gliscor'],
	shielddust: ['butterfree', 'vivillon', 'dustox', 'mothim', 'masquerain'],
	overcoat: ['cacnea', 'cacturne', 'maractus'],
	liquidooze: ['swalot', 'tentacruel', 'muk', 'gulpin', 'tentacool', 'grimer'],
	keeneye: ['fearow', 'noctowl', 'watchog', 'furret'],
	sweetveil: ['alcremie', 'slurpuff', 'vespiquen', 'milcery', 'swirlix', 'combee'],
	runaway: ['eevee', 'vaporeon', 'jolteon', 'flareon', 'espeon', 'umbreon', 'leafeon', 'glaceon', 'sylveon'],
	levitate: ['baltoy', 'claydol', 'chimecho', 'misdreavus', 'mismagius', 'duskull', 'dusknoir', 'cryogonal',
		'flygon', 'solrock', 'lunatone', 'rotom', 'rotomheat', 'rotomwash', 'rotomfrost', 'rotomfan', 'rotommow',
		'tynamo', 'eelektrik', 'eelektross', 'koffing', 'weezing', 'weezinggalar', 'hydreigon'],
} as const;

/** Ordinary cosmetic equivalents, including the two event Vivillon patterns. */
export const PassiveCosmeticForms = {
	vivillon: ['archipelago', 'continental', 'elegant', 'garden', 'highplains', 'icysnow', 'jungle', 'marine',
		'modern', 'monsoon', 'ocean', 'polar', 'river', 'sandstorm', 'savanna', 'sun', 'tundra', 'fancy', 'pokeball'],
	alcremie: ['rubycream', 'matchacream', 'mintcream', 'lemoncream', 'saltedcream', 'rubyswirl', 'caramelswirl', 'rainbowswirl'],
} as const;

export const SpeciesPassives: {[id: string]: readonly string[]} = {...StarterPassives};
export const ThematicPassiveIds = new Set<string>(Object.keys(ThematicPassiveGroups));
for (const [passive, ids] of Object.entries(ThematicPassiveGroups)) {
	for (const id of ids) SpeciesPassives[id] = Object.freeze([passive]);
}
for (const [base, forms] of Object.entries(PassiveCosmeticForms)) {
	for (const form of forms) SpeciesPassives[base + form] = SpeciesPassives[base];
}
/** Exact revised bug passive split; selected gimmick abilities supply Shield Dust. */
export const WingedBugPassiveForms = ['beedrill', 'beedrillmega', 'butterfree', 'butterfreemega', 'butterfreegmax'] as const;
for (const id of WingedBugPassiveForms) SpeciesPassives[id] = Object.freeze(id === 'butterfree' ? ['shielddust'] : ['levitate']);
/** Additional exact recipients; existing Liquid Ooze remains on ordinary Grimer and Muk. */
export const AdditionalPassiveGroups = {
	"stickyhold": [
		"grimeralola",
		"mukalola",
		"trubbish",
		"garbodor"
	],
	"soundproof": [
		"whismur",
		"loudred",
		"exploud"
	],
	"suctioncups": [
		"octillery",
		"inkay",
		"malamar",
		"grapploct"
	]
} as const;
for (const [passive, ids] of Object.entries(AdditionalPassiveGroups)) {
 ThematicPassiveIds.add(passive);
 for (const id of ids) SpeciesPassives[id] = Object.freeze([...(SpeciesPassives[id] || []), passive]);
}
/** Approved dance forms; Quaquaval retains only Torrent. */
export const DancerPassiveForms = ["ludicolo","oricorio","oricoriopompom","oricoriopau","oricoriosensu","lilligant","lilliganthisui","bellossom","meloetta","meloettapirouette"] as const;
ThematicPassiveIds.add('owntempo');
for (const id of DancerPassiveForms) SpeciesPassives[id] = Object.freeze([...(SpeciesPassives[id] || []), 'owntempo']);
export const RelicArmorPassiveForms = ['laprasaevian', 'omastar', 'kabutops', 'aerodactyl', 'cradily', 'armaldo', 'relicanth', 'rampardos', 'bastiodon', 'carracosta', 'tyrantrum', 'aurorus', 'aerodactylmega', 'tyrantrummega', 'aurorusmega'] as const;
ThematicPassiveIds.add('relicarmor');
for (const id of RelicArmorPassiveForms) SpeciesPassives[id] = Object.freeze([...(SpeciesPassives[id] || []), 'relicarmor']);
/** Approved exact Kanto/Johto recipients. Includes the explicitly approved full local Illuminate behavior. */
export const KantoJohtoPassiveGroups = {
 "illuminate": ["lanturn"],
  "bigpecks": [
    "pidgeot",
    "articuno",
    "zapdos",
    "moltres",
    "skarmory",
    "lugia",
    "hooh"
  ],
  "gluttony": [
    "raticate",
    "snorlax",
    "snorlaxgmax"
  ],
  "owntempo": [
    "arbok",
    "hypno",
    "jynx"
  ],
  "static": [
    "raichu",
    "ampharos",
    "ampharosmega"
  ],
  "limber": [
    "persian",
    "ditto"
  ],
  "damp": [
    "golduck",
    "poliwrath"
  ],
  "shielddust": [
    "venomoth"
  ],
  "stickyhold": [
    "victreebel",
    "ariados",
    "shuckle"
  ],
  "earlybird": [
    "dodrio",
    "xatu"
  ],
  "soundproof": [
    "electrode",
    "mrmime",
    "politoed"
  ],
  "harvest": [
    "exeggutor"
  ],
  "healer": [
    "kangaskhan",
    "kangaskhanmega",
    "miltank",
    "blissey",
    "celebi"
  ],
  "synchronize": [
    "mew"
  ],
  "innerfocus": [
    "crobat",
    "granbull",
    "raikou",
    "entei",
    "suicune"
  ],
  "sturdy": [
    "sudowoodo"
  ],
  "oblivious": [
    "quagsire"
  ],
  "levitate": [
    "unown"
  ],
  "poisonpoint": [
    "qwilfish"
  ],
  "hypercutter": [
    "scizor",
    "heracross"
  ],
  "heatproof": [
    "magcargo"
  ],
  "pickup": [
    "delibird"
  ],
  "waterveil": [
    "mantine"
  ]
} as const;
for (const [passive, ids] of Object.entries(KantoJohtoPassiveGroups)) {
 ThematicPassiveIds.add(passive);
 for (const id of ids) SpeciesPassives[id] = Object.freeze([...(SpeciesPassives[id] || []), passive]);
}
/** Explicit regional whitelist approved after Kanto/Johto; no automatic form inheritance. */
export const RegionalPassiveGroups = {
  "sandforce": [
    "sandslash",
    "dugtrio",
    "garchompmega"
  ],
  "rivalry": [
    "nidoqueen",
    "nidoking"
  ],
  "aromaveil": [
    "clefable",
    "wigglytuff",
    "wobbuffet",
    "illumise",
    "florges",
    "aromatisse",
    "ribombee"
  ],
  "flamebody": [
    "rapidash",
    "magmortar",
    "talonflame"
  ],
  "cursedbody": [
    "ninetales",
    "froslass",
    "froslassmega",
    "marowak",
    "marowakalola",
    "cofagrigus",
    "runerigus",
    "mimikyu",
    "mimikyubusted",
    "dragapult",
    "annihilape",
    "houndstone"
  ],
  "guarddog": [
    "arcanine",
    "arcaninehisui",
    "mightyena",
    "stoutland"
  ],
  "flowerveil": [
    "vileplume",
    "sunflora",
    "leavanny"
  ],
  "dryskin": [
    "parasect",
    "amoonguss",
    "heliolisk"
  ],
  "hypercutter": [
    "farfetchd",
    "kleavor",
    "sandslashalola",
    "donphan"
  ],
  "hydration": [
    "dewgong",
    "lapras",
    "dragonite",
    "laprasgmax",
    "dragonitemega",
    "azumarill",
    "lumineon",
    "floatzel",
    "dracovish"
  ],
  "analytic": [
    "slowbro",
    "starmie",
    "slowking",
    "magnezone",
    "porygonz",
    "metagross"
  ],
  "solidrock": [
    "golem"
  ],
  "shellarmor": [
    "cloyster",
    "forretress"
  ],
  "infiltrator": [
    "gengar",
    "hitmonlee",
    "hitmonchan",
    "hitmontop",
    "shiftry",
    "zangoose",
    "zangoosemega",
    "chandelure",
    "zoroark",
    "ceruledge"
  ],
  "ironfist": [
    "ledian",
    "machamp",
    "machampgmax"
  ],
  "naturalcure": [
    "corsola",
    "altaria",
    "altariamega",
    "reuniclus",
    "trevenant"
  ],
  "unnerve": [
    "houndoom",
    "houndoommega",
    "tyranitar",
    "tyranitarmega",
    "honchkrow",
    "spiritomb",
    "furfroudandy",
    "zoroarkhisui"
  ],
  "pickup": [
    "smeargle",
    "pachirisu",
    "ambipom",
    "raticatealola"
  ],
  "shielddust": [
    "beautifly",
    "shedinja",
    "whimsicott",
    "volcarona",
    "gourgeist",
    "gourgeistsmall",
    "gourgeistlarge",
    "gourgeistsuper"
  ],
  "oblivious": [
    "slaking",
    "wailord",
    "grumpig",
    "whiscash",
    "bibarel",
    "lickilicky",
    "slowbrogalar",
    "spinda"
  ],
  "stickyhold": [
    "delcatty",
    "kecleon",
    "gastrodon",
    "gastrodoneast",
    "purugly",
    "skuntank",
    "tangrowth",
    "goodra",
    "klefki",
    "araquanid",
    "passimian",
    "pyukumuku",
    "dhelmise",
    "greedent",
    "thievul",
    "centiskorch",
    "sirfetchd",
    "goodrahisui",
    "spidops",
    "grafaiai",
    "gholdengo",
    "sinistcha",
    "sinistchamasterpiece",
    "komala"
  ],
  "soundproof": [
    "aggron",
    "camerupt",
    "aggronmega",
    "cameruptmega",
    "swoobat",
    "klinklang",
    "beheeyem",
    "golurk",
    "pyroar",
    "noivern",
    "electrodehisui",
    "revavroom",
    "golemalola"
  ],
  "frisk": [
    "banette",
    "banettemega",
    "banettemegaz",
    "wyrdeer",
    "ursaluna",
    "ursalunabloodmoon",
    "sableye",
    "sableyemega",
    "gumshoos"
  ],
  "waterveil": [
    "gorebyss",
    "huntail",
    "furfroulareine",
    "kingdra"
  ],
  "keeneye": [
    "staraptor",
    "luxray",
    "drapion",
    "yanmega",
    "braviaryhisui",
    "squawkabilly",
    "squawkabillyblue",
    "squawkabillyyellow",
    "squawkabillywhite",
    "kilowattrel",
    "espathra",
    "bombirdier",
    "flamigo",
    "veluza",
    "farigiraf",
    "braviary"
  ],
  "overcoat": [
    "wormadam",
    "wormadamsandy",
    "wormadamtrash",
    "drifblim",
    "hippowdon",
    "abomasnow",
    "mamoswine",
    "gigalith",
    "crustle",
    "scrafty",
    "cinccino",
    "vanilluxe",
    "sawsbuck",
    "sawsbuckspring",
    "sawsbucksummer",
    "sawsbuckautumn",
    "sawsbuckwinter",
    "ferrothorn",
    "beartic",
    "mandibuzz",
    "furfrou",
    "furfroudiamond",
    "carbink",
    "avalugg",
    "orbeetle",
    "eldegoss",
    "dubwool",
    "coalossal",
    "sandaconda",
    "grimmsnarl",
    "cursola",
    "frosmoth",
    "eiscue",
    "copperajah",
    "avalugghisui",
    "ninetalesalola",
    "dugtrioalola",
    "eiscuenoice"
  ],
  "limber": [
    "lopunny",
    "lopunnymega",
    "toxicroak",
    "electivire",
    "salazzle",
    "tatsugiri",
    "tatsugiridroopy",
    "tatsugiristretchy",
    "clodsire",
    "persianalola",
    "mienshao"
  ],
  "owntempo": [
    "simisage",
    "simisear",
    "simipour",
    "musharna",
    "throh",
    "sawk",
    "darmanitan",
    "bouffalant",
    "aegislash",
    "furfrouheart",
    "toxtricity",
    "toxtricitylowkey",
    "polteageist",
    "polteageistantique",
    "obstagoon",
    "mrrime",
    "morpeko",
    "arctozolt",
    "arctovish",
    "darmanitangalar",
    "aegislashblade",
    "darmanitanzen",
    "darmanitangalarzen",
    "morpekohangry"
  ],
  "static": [
    "zebstrika",
    "emolga",
    "furfroustar",
    "manectric",
    "manectricmega",
    "togedemaru",
    "boltund",
    "dracozolt",
    "pawmot"
  ],
  "sweetveil": [
    "audino",
    "alomomola",
    "furfroudebutante",
    "shiinotic",
    "hatterene",
    "indeedee",
    "indeedeef",
    "oinkologne",
    "oinkolognef",
    "dachsbun",
    "arboliva",
    "hydrapple",
    "raichualola"
  ],
  "innerfocus": [
    "basculin",
    "basculinbluestriped",
    "accelgor",
    "furfroukabuki",
    "basculegion",
    "basculegionf"
  ],
  "bigpecks": [
    "swanna",
    "hawlucha",
    "unfezant"
  ],
  "leafguard": [
    "gogoat",
    "lurantis",
    "tsareena",
    "comfey",
    "flapple",
    "appletun",
    "exeggutoralola",
    "jumpluff"
  ],
  "suctioncups": [
    "barbaracle",
    "palossand",
    "pincurchin",
    "stonjourner",
    "wugtrio",
    "stunfiskgalar",
    "klawf"
  ],
  "poisonpoint": [
    "furfroumatron",
    "sneasler",
    "overqwil",
    "scolipede",
    "scolipedemega"
  ],
  "anticipation": [
    "furfroupharaoh",
    "rapidashgalar",
    "absol",
    "absolmega",
    "absolmegaz",
    "medicham",
    "medichammega"
  ],
  "steadfast": [
    "falinks",
    "falinksmega",
    "lucario",
    "gallade",
    "lycanroc",
    "lycanrocmidnight",
    "lycanrocdusk"
  ],
  "runaway": [
    "maushold",
    "mausholdfour",
    "cyclizar",
    "dudunsparce",
    "dudunsparcethreesegment"
  ],
  "telepathy": [
    "slowkinggalar",
    "oranguru"
  ],
  "forewarn": [
    "alakazam",
    "alakazammega",
    "gothitelle"
  ],
  "thickfat": [
    "walrein",
    "hariyama",
    "crabominable",
    "crabominablemega",
    "cetitan"
  ],
  "defiant": [
    "tauros",
    "taurospaldeacombat",
    "taurospaldeablaze",
    "taurospaldeaaqua",
    "pangoro",
    "perrserker"
  ],
  "bruteforce": [
    "rhydon"
  ],
  "clearbody": [
    "steelix",
    "steelixmega",
    "minior",
    "miniororange",
    "minioryellow",
    "miniorgreen",
    "miniorblue",
    "miniorindigo",
    "miniorviolet",
    "miniormeteor"
  ],
  "plus": [
    "plusle"
  ],
  "minus": [
    "minun"
  ],
  "roughskin": [
    "sharpedo",
    "sharpedomega",
    "sharpedomegay",
    "druddigon",
    "brambleghast"
  ],
  "gluttony": [
    "linoone",
    "pelipper",
    "heatmor",
    "cramorant",
    "cramorantgulping",
    "cramorantgorging"
  ],
  "whitesmoke": [
    "torkoal"
  ],
  "ripen": [
    "tropius"
  ],
  "earlybird": [
    "swellow",
    "chatot"
  ],
  "illuminate": [
    "volbeat"
  ],
  "friendguard": [
    "luvdisc",
    "drampa",
    "wishiwashi",
    "wishiwashischool",
    "palafin",
    "palafinhero"
  ],
  "effectspore": [
    "breloom",
    "toedscruel"
  ],
  "compoundeyes": [
    "ninjask",
    "galvantula"
  ],
  "strongjaw": [
    "mawile",
    "bruxish",
    "barraskewda",
    "drednaw",
    "mabosstiff"
  ],
  "levitate": [
    "glalie",
    "glaliemega"
  ],
  "swarm": [
    "kricketune",
    "durant"
  ],
  "serenegrace": [
    "togekiss"
  ],
  "sapsipper": [
    "carnivine"
  ],
  "pickpocket": [
    "liepard"
  ],
  "rattled": [
    "archeops"
  ],
  "battlearmor": [
    "haxorus"
  ],
  "poisontouch": [
    "seismitoad"
  ],
  "damp": [
    "stunfisk"
  ],
  "waterabsorb": [
    "jellicent"
  ],
  "cheekpouch": [
    "diggersby"
  ],
  "symbiosis": [
    "dedenne"
  ],
  "liquidooze": [
    "dragalge",
    "dragalgemega"
  ],
  "rockhead": [
    "toucannon"
  ],
  "battery": [
    "vikavolt"
  ],
  "merciless": [
    "toxapex"
  ],
  "stamina": [
    "mudsdale"
  ],
  "fluffy": [
    "bewear"
  ],
  "aftermath": [
    "turtonator"
  ],
  "striker": [
    "lokix"
  ],
  "sturdy": [
    "garganacl"
  ],
  "eartheater": [
    "orthworm"
  ]
} as const;
for (const [passive, ids] of Object.entries(RegionalPassiveGroups)) {
 ThematicPassiveIds.add(passive);
 for (const id of ids) SpeciesPassives[id] = Object.freeze([...(SpeciesPassives[id] || []), passive]);
}
export const LatestPassiveGroups = {
  "rattled": [
    "granbull"
  ],
  "defiant": [
    "gyarados",
    "gyaradosmega",
    "golisopod"
  ],
  "aromaveil": [
    "milotic",
    "miloticmega"
  ],
  "intimidate": [
    "mawilemega"
  ],
  "infiltrator": [
    "seviper",
    "weavile"
  ],
  "clearbody": [
    "bronzong",
    "archaludon"
  ],
  "roughskin": [
    "garchomp",
    "garchompmegaz",
    "garchompbattlebond"
  ],
  "anticipation": [
    "sigilyph"
  ],
  "keeneye": [
    "krookodile"
  ],
  "overcoat": [
    "escavalier"
  ],
  "steadyaim": [
    "clawitzer",
    "clawitzermega"
  ],
  "friendguard": [
    "meowstic",
    "meowsticmmega"
  ],
  "steadfast": [
    "kommoo"
  ],
  "unnerve": [
    "corviknight"
  ],
  "flamebody": [
    "armarouge"
  ],
  "stickyhold": [
    "tinkaton"
  ],
  "flowerveil": [
    "cherrim",
    "cherrimsunshine"
  ],
  "owntempo": [
    "bellibolt",
    "scovillain",
    "rabsca",
    "dondozo"
  ]
} as const;
for (const [passive, ids] of Object.entries(LatestPassiveGroups)) {
 ThematicPassiveIds.add(passive);
 for (const id of ids) SpeciesPassives[id] = Object.freeze([passive]);
}
export const SettledPassiveGroups = {
 "steadyswimmer": ["seaking"],
  "freeflight": [
    "salamence"
  ],
  "forewarn": [
    "gardevoir"
  ],
  "solidrock": [
    "rhyperior"
  ],
  "rockypayload": [
    "conkeldurr"
  ],
  "overcoat": [
    "excadrill",
    "excadrillmega"
  ],
  "superluck": [
    "meowsticf",
    "meowsticfmega"
  ],
  "entrenched": [
    "kingambit",
    "baxcalibur"
  ],
  "liquidooze": [
    "glimmora",
    "glimmoramega"
  ],
  "levitate": [
    "probopass"
  ],
  "poisonpoint": [
    "roserade",
    "roserademega"
  ]
} as const;
for (const [passive, ids] of Object.entries(SettledPassiveGroups)) {
 ThematicPassiveIds.add(passive);
 for (const id of ids) SpeciesPassives[id] = Object.freeze([passive]);
}
Object.freeze(SpeciesPassives);
