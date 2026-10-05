// Ability-specific exceptions to the ordinary Starter Eevee removal batch.
export const StarterEeveeMoveExceptions: {[ability: string]: readonly string[]} = {
	"sinisterblaze": [
		"strengthsap",
		"pursuit",
		"poisonfang",
		"punishment",
		"spiritbreak",
		"bittermalice",
		"infernalparade",
		"destinybond",
		"dreameater",
		"eeriespell",
		"perishsong",
		"blueflare",
		"doomdesire",
		"hex",
		"icefang",
		"nightshade",
		"ominouswind"
	],
	"ascendance": [
		"punishment",
		"spiritbreak",
		"extremespeed",
		"crunch",
		"defog",
		"dragonpulse",
		"hurricane",
		"playrough",
		"tailwind",
		"thunderfang",
		"triattack"
	]
};
