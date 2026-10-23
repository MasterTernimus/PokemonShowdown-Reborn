/** Approved ability-gated additions. */
export const AevianWebMoveSources: Record<string, string[]> = {
	"splinteredweb": ["9L0"],
	"uturn": [
		"9L1",
	],
	"glare": [
		"9L1",
	],
	"rocksmash": [
		"9L1",
	],
	"rockthrow": [
		"9L4",
	],
	"rockpolish": [
		"9L15",
	],
	"rockblast": [
		"9L29",
	],
	"rocktomb": [
		"9L31",
	],
	"partingshot": [
		"9L33",
	],
	"fling": [
		"9L34",
	],
	"stealthrock": [
		"9L43",
	],
	"crosschop": [
		"9L47",
	],
	"acrobatics": [
		"9L49",
	],
	"stoneedge": [
		"9L56",
	],
	"knockoff": [
		"9L60",
	],
	"finalgambit": [
		"9L67",
	],
	"arenitewall": [
		"9M",
	],
	"assurance": [
		"9M",
	],
	"beatup": [
		"9M",
	],
	"brickbreak": [
		"9M",
	],
	"brutalswing": [
		"9M",
	],
	"dig": [
		"9M",
	],
	"doubleedge": [
		"9M",
	],
	"facade": [
		"9M",
	],
	"irondefense": [
		"9M",
	],
	"lashout": [
		"9M",
	],
	"poisonsweep": [
		"9M",
	],
	"pounce": [
		"9M",
	],
	"revenge": [
		"9M",
	],
	"rockslide": [
		"9M",
	],
	"slashandburn": [
		"9M",
	],
	"snatch": [
		"9M",
	],
	"spikes": [
		"9M",
	],
	"stackingshot": [
		"9M",
	],
	"stompingtantrum": [
		"9M",
	],
	"strength": [
		"9M",
	],
	"superpower": [
		"9M",
	],
	"swagger": [
		"9M",
	],
	"trailblaze": [
		"9M",
	],
};
export const AevianWebOrdinaryMoves = ["doubleedge", "facade", "pounce", "swagger"];
export const AevianWebExclusiveMoves = Object.keys(AevianWebMoveSources).filter(id => !AevianWebOrdinaryMoves.includes(id));
