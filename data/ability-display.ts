import { AbilityDescriptionOverrides } from './ability-descriptions';
import { Aliases } from './aliases';
import {AbilityComponents} from './ability-components';

// Display-only additions confirmed by named descriptions and active implementation.
// Do not alter battle identity when filling omissions in the mechanical registry.
const AdditionalDisplayComponents: {[id: string]: string[]} = {
	"selfrepair": [
		"naturalcure",
		"selfsufficient"
	],
	"scarecrow": [
		"windrider",
		"steelworker",
		"stakeout"
	],
	"bruteforce": [
		"reckless",
		"rockhead"
	],
	"fightingfiend": [
		"vitalspirit",
		"multiscale"
	],
	"kickfiend": [
		"striker",
		"violentrush",
		"limber"
	],
	"punchfiend": [
		"ironfist",
		"innerfocus",
		"unseenfist"
	],
	"spinfiend": [
		"technician",
		"vitalspirit"
	],
	"aevianoath": [
		"swornduty",
		"dualwield",
		"battlearmor"
	],
	"cruelshell": [
		"hypercutter",
		"shellarmor",
		"angershell"
	],
	"unleashedego": [
		"ultraego",
		"levitate",
		"ragingstorm"
	],
	"asoneglastrier": [
		"unnerve",
		"chillingneigh"
	],
	"asonespectrier": [
		"unnerve",
		"grimneigh"
	],
	"mourningvessel": [
		"prankster",
		"magicguard"
	],
	"apexcleave": [
		"sharpness",
		"dualwield",
		"moxie"
	],
	"wickedcommand": [
		"insomnia",
		"superluck"
	],
	"tyrantstream": [
		"sandstream",
		"bruteforce"
	],
	"adaptivepower": [
		"hugepower",
		"magicguard",
		"regenerator"
	],
	"caverndrake": [
		"eartheater",
		"solidrock",
		"moldbreaker"
	],
	"orchardbond": [
		"hydrabond",
		"harvest"
	],
	"blademastery": [
		"sharpness",
		"superluck"
	],
	"goldentalons": [
		"stalwart",
		"goodasgold",
		"sharpness"
	],
	"venomheal": [
		"hypercutter",
		"poisonheal",
		"poisonpoint"
	],
	"blackfang": [
		"strongjaw",
		"insomnia",
		"moxie"
	],
	"fluffycraft": [
		"fluffy",
		"technician"
	],
	"surgeconduit": [
		"bruteforce",
		"shadowshield"
	],
	"duskdrive": [
		"precision",
		"opportunist",
		"battlefervor"
	],
	"layeredcoat": [
		"furcoat",
		"overcoat"
	],
	"empress": [
		"queenlymajesty",
		"royaldecree"
	],
	"imperialprincess": [
		"striker",
		"vitalspirit",
		"moxie"
	],
	"loyalguard": [
		"friendguard",
		"guarddog",
		"intimidate"
	],
	"frostsiren": [
		"refrigerate",
		"forewarn",
		"dryskin"
	],
	"amethystglow": [
		"icebody",
		"refrigerate"
	],
	"islandcurrent": [
		"swiftswim",
		"windrider"
	],
	"oceanicwings": [
		"waterabsorb",
		"hydration",
		"friendguard"
	],
	"ruinjaw": [
		"strongjaw",
		"eartheater"
	],
	"triplethreat": [
		"hydrabond",
		"tangledfeet",
		"keeneye",
		"bigpecks",
		"limber"
	],
	"strikerfrenzy": [
		"striker",
		"vitalspirit"
	],
	"venomveil": [
		"liquidooze",
		"corrosion",
		"waterveil"
	],
	"rebornflower": [
		"invigorate",
		"flowerveil"
	]
};

// The legacy identity registry is not always an exact implementation summary.
// Burning Crown uses flat damage reduction, not Filter; its other delegates remain active.
const DisplayComponentOverrides: {[id: string]: string[]} = {
 soulcremation: ['soulsiphon', 'soulpyre', 'malicewell'],
 burningcrown: ['intimidate', 'whitesmoke', 'moldbreaker', 'unboundblaze', 'selfsufficient', 'proficient'],
};

/** Canonical display identities only; never installs or dispatches battle callbacks. */
export function canonicalAbilityDisplayID(name: string): string {
	let id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
	const seen = new Set<string>();
	while (Aliases[id as ID] && !seen.has(id)) {
		seen.add(id);
		id = Aliases[id as ID].toLowerCase().replace(/[^a-z0-9]/g, '');
	}
	return id;
}

function directDisplayComponents(id: string): string[] {
	id = canonicalAbilityDisplayID(id);
	const parts = DisplayComponentOverrides[id] ||
		(AbilityComponents[id]?.length ? AbilityComponents[id] : AdditionalDisplayComponents[id]) || [];
	return [...new Set(parts.map(canonicalAbilityDisplayID))];
}

export function getAbilityDisplayClosure(id: string, seen = new Set<string>()): Set<string> {
	id = canonicalAbilityDisplayID(id);
	if (seen.has(id)) return seen;
	seen.add(id);
	for (const part of directDisplayComponents(id)) getAbilityDisplayClosure(part, seen);
	return seen;
}

export function getAbilityDisplayComponents(id: string): string[] {
	const parts = directDisplayComponents(id);
	// A component already included by another named package needs no second display entry.
	return parts.filter((part, index) => !parts.some((other, otherIndex) => other !== part &&
		getAbilityDisplayClosure(other).has(part) && (!getAbilityDisplayClosure(part).has(other) || otherIndex < index)));
}

/** Remove only metadata-confirmed standalone component lists, preserving all mechanics prose. */
export function getAbilitySelectorSummary(id: string, summary: string, nameOf: (id: string) => string): string {
	const reviewed = AbilityDescriptionOverrides[canonicalAbilityDisplayID(id)];
	if (reviewed && summary === reviewed.shortDesc) return summary;
	// Sushi Trick's approved summary describes the effect directly; metadata retains Hospitality.
	if (canonicalAbilityDisplayID(id) === 'sushitrick') return summary;
	const components = getAbilityDisplayComponents(id);
	if (!components.length) return summary;
	const closure = getAbilityDisplayClosure(id);
	const clauses = summary.split(/;\s*/);
	const mechanics = clauses.filter(clause => {
		const parts = clause.trim().replace(/\.$/, '').split(/\s*\+\s*|,\s*(?:and\s+)?|\s+and\s+/);
		return !parts.every(part => closure.has(canonicalAbilityDisplayID(part)));
	}).join('; ').replace(/\.$/, '');
	const names = components.map(nameOf).filter(Boolean);
	const missing = names.filter(name => !mechanics.toLowerCase().includes(name.toLowerCase()));
	if (!missing.length && mechanics === summary.replace(/\.$/, '')) return summary;
	return [missing.join(' + '), mechanics].filter(Boolean).join('; ') + '.';
}
