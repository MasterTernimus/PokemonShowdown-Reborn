/** Event additions only. Never merge these into ordinary Politoed's learnset. */
export const AevianKingMoveSources: Record<string, string[]> = {
	"dragoncheer": [
		"9L0",
	],
	"purify": [
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
	"lifedew": [
		"9L30",
	],
	"hypervoice": [
		"9L38",
	],
	"megahorn": [
		"9L41",
	],
	"dragonpulse": [
		"9L43",
	],
	"instruct": [
		"9L50",
	],
	"fakeout": [
		"9L57",
	],
	"haze": [
		"9L60",
	],
	"recover": [
		"9L65",
	],
	"aurasphere": [
		"9M",
	],
	"bounce": [
		"9M",
	],
	"calmmind": [
		"9M",
	],
	"defog": [
		"9M",
	],
	"dracometeor": [
		"9M",
	],
	"dragonclaw": [
		"9M",
	],
	"naturepower": [
		"9M",
	],
	"outrage": [
		"9M",
	],
	"slackoff": [
		"9M",
	],
	"thunderwave": [
		"9M",
	],
	"uproar": [
		"9M",
	],
	"weatherball": [
		"9M",
	],
};
export const AevianKingOrdinaryMoves = ["round", "hypervoice", "haze", "bounce", "uproar", "weatherball"];
export const AevianKingExclusiveMoves = Object.keys(AevianKingMoveSources).filter(id => !AevianKingOrdinaryMoves.includes(id));
