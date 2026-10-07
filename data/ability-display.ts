import {AbilityDisplaySummaries} from './ability-display-summaries';
import { Aliases } from './aliases';
import {AbilityComponents} from './ability-components';

/** Break long player text into readable points without dropping rules or splitting stat names. */
export function abilityDescriptionLines(description: string): string[] {
	return description.replace(/\b(Sp|No|Mr|Mrs)\.\s/g, '$1\u0001 ')
		.split(/\.\s+(?=[A-Z0-9])|;\s+/)
		.map(line => line.replace(/\u0001/g, '.').trim()).filter(Boolean);
}

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
	"voidcommand": [
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
 blazingmane: ['firemane', 'proficient'],
 pollenbloom: ['thickfat', 'unaware', 'proficient'],
 atrocity: ['unboundblaze', 'toughclaws'],
 unboundblaze: ['dragonize', 'magmaarmor', 'proficient'],
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
	return parts.filter((part, index) => part !== 'proficient' && !parts.some((other, otherIndex) => other !== part &&
		getAbilityDisplayClosure(other).has(part) && (!getAbilityDisplayClosure(part).has(other) || otherIndex < index)));
}

/** Short effects and component names are separate display fields. */
export function getAbilitySelectorSummary(id: string, summary: string, _nameOf: (id: string) => string): string {
 id = canonicalAbilityDisplayID(id);
 if (AbilityDisplaySummaries[id]) return AbilityDisplaySummaries[id];
 if (id === 'proficient') return summary;
 const closure = getAbilityDisplayClosure(id);
 const clauses = summary.split(/;\s*/).filter(clause => {
  const parts = clause.trim().replace(/\.$/, '').split(/\s*\+\s*|,\s*(?:and\s+)?|\s+and\s+/);
  return !parts.every(part => closure.has(canonicalAbilityDisplayID(part)));
 });
 const result = clauses.join('; ').replace(/\bProficient\b/gi, '1.3x same-type move power');
 return result ? result.replace(/^[a-z]/, letter => letter.toUpperCase()) : 'Combines the listed abilities.';
}
