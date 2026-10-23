/** Approved ability-gated additions. */
export const AevianAscendanceMoveSources: Record<string, string[]> = {
	"scentedgeyser": ["9L0"],
	"purify": [
		"9L1",
	],
	"meditate": [
		"9L1",
	],
	"aurasphere": [
		"9L1",
	],
	"round": [
		"9L11",
	],
	"healbell": [
		"9L18",
	],
	"dragonbreath": [
		"9L21",
	],
	"hypervoice": [
		"9L38",
	],
	"dragonpulse": [
		"9L41",
	],
	"recover": [
		"9L46",
	],
	"calmmind": [
		"9L57",
	],
	"haze": [
		"9L60",
	],
	"defog": [
		"9M",
	],
	"dracometeor": [
		"9M",
	],
	"dragoncheer": [
		"9M",
	],
	"outrage": [
		"9M",
	],
};
export const AevianAscendanceOrdinaryMoves = ["meditate", "round", "haze"];
export const AevianAscendanceExclusiveMoves = Object.keys(AevianAscendanceMoveSources).filter(id => !AevianAscendanceOrdinaryMoves.includes(id));
