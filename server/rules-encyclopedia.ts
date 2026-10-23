/** Public, read-only rules views. Validation never writes back into the submitted team. */
import { Dex, Teams, TeamValidator, toID } from '../sim';
import { AbilityComponents } from '../data/ability-components';
import { resolveNaturePowerMove } from '../data/nature-power';
import { Auras } from '../data/auras';
import * as King from '../data/aevian-king-moves';
import * as Ascendance from '../data/aevian-ascendance-moves';
import * as Web from '../data/aevian-web-moves';
import { publicFieldGuide } from './field-guide';

const gates = [
	{ species: 'politoed', ability: 'aevianking', sources: King.AevianKingMoveSources, exclusive: King.AevianKingExclusiveMoves },
	{ species: 'poliwrath', ability: 'aevianascendance', sources: Ascendance.AevianAscendanceMoveSources, exclusive: Ascendance.AevianAscendanceExclusiveMoves },
	{ species: 'galvantula', ability: 'aevianweb', sources: Web.AevianWebMoveSources, exclusive: Web.AevianWebExclusiveMoves },
];
const displayName = (id: string) => id === 'eldritchremedy' ? 'Curious Medicine' : Dex.abilities.get(id).name;
function abilityDetail(id: string) {
	const ability = Dex.abilities.get(id);
	return { id: ability.id, name: displayName(ability.id), description: ability.desc || ability.shortDesc,
		components: (AbilityComponents[ability.id] || []).map(component => ({ id: component, name: displayName(component) })),
		identityNote: ability.id === 'eldritchremedy' ? 'Slowking-Galar passive; retains the distinct Eldritch Remedy rules identity.' : '' };
}
export function rulesCatalog() {
	const guide = publicFieldGuide();
	return { species: Dex.species.all().filter(s => s.exists).map(s => ({ id: s.id, name: s.name, types: s.types })),
		abilities: Dex.abilities.all().filter(a => a.exists).map(a => ({ id: a.id, name: displayName(a.id) })),
		fields: guide.entries.filter(e => e.kind === 'field').map(e => ({ id: e.id, name: e.name, group: e.group })),
		auras: Object.values(Auras).map(a => ({ id: a.id, name: a.name })),
		formats: Dex.formats.all().filter(f => f.effectType === 'Format' && (f.searchShow || f.challengeShow)).map(f => ({ id: f.id, name: f.name })),
		notice: 'Current server data. Field links cover indexed, reviewed interactions, not every indirect mechanic. Team checks apply only to the selected format.' };
}
export function rulesDetail(kind: string, query: string) {
	const guide = publicFieldGuide();
	if (kind === 'ability') {
		const ability = Dex.abilities.get(query);
		if (!ability.exists) throw new Error('Unknown ability.');
		return { kind, ...abilityDetail(ability.id), fields: guide.entries.filter(e =>
			'referenceDetails' in e && (e.referenceDetails.abilities || []).some(a => a.id === ability.id)).map(e => ({ id: e.id, name: e.name })) };
	}
	const species = Dex.species.get(query);
	if (!species.exists) throw new Error('Unknown Pokémon.');
	const gate = gates.find(g => toID(species.baseSpecies) === g.species);
	return { kind: 'species', id: species.id, name: species.name, types: species.types, stats: species.baseStats,
		abilities: Object.entries(species.abilities).map(([slot, name]) => ({ slot, ...abilityDetail(toID(name)) })),
		passives: (species.passives || []).map(abilityDetail),
		forms: [...new Set([species.baseSpecies, ...(Dex.species.get(species.baseSpecies).otherFormes || [])])],
		event: gate ? { ability: abilityDetail(gate.ability), moves: Object.entries(gate.sources).map(([id, sources]) => ({ id, name: Dex.moves.get(id).name, sources, exclusive: gate.exclusive.includes(id) })) } : null };
}
export function teamClinic(input: { team: string, format: string, field?: string, aura?: string }) {
	if (typeof input.team !== 'string' || input.team.length > 24000) throw new Error('Paste a team export of at most 24 KB.');
	const format = Dex.formats.get(input.format);
	if (!format.exists || format.effectType !== 'Format') throw new Error('Choose a registered battle format.');
	const guide = publicFieldGuide();
	const field = input.field ? guide.entries.find(e => e.kind === 'field' && e.id === input.field) : null;
	if (input.field && !field) throw new Error('Choose a registered field.');
	if (input.aura && !Auras[input.aura]) throw new Error('Choose a registered aura.');
	const team = Teams.import(input.team);
	if (!team?.length || team.length > 24) throw new Error('No readable team found, or too many sets.');
	// The validator can normalize its input. Never expose that as an edited export.
	let errors: string[] | null;
	try { errors = TeamValidator.get(input.format).validateTeam(Teams.import(input.team)); } catch { return { checked: false, errors: ['The validator could not complete this format. No legality claim is made.'], proposals: [], sets: [] }; }
	const proposals: string[] = [];
	const sets = team.map((set, index) => {
		const species = Dex.species.get(set.species);
		const gate = gates.find(g => toID(species.baseSpecies) === g.species);
		const gated = gate ? set.moves.filter(m => gate.exclusive.includes(toID(m))) : [];
		if (gate && gated.length && toID(set.ability) !== gate.ability) proposals.push(
			`${index + 1}. ${species.name}: choose ${displayName(gate.ability)} to keep ${gated.map(m => Dex.moves.get(m).name).join(', ')}, or replace those exclusive moves. Other event restrictions still apply.`);
		const moveIds = set.moves.map(toID);
		const abilityIds = [toID(set.ability), ...(species.passives || [])];
		const interactions = field && 'referenceDetails' in field ? ['moves', 'abilities', 'items'].flatMap(kind =>
			(field.referenceDetails?.[kind] || []).filter(row => kind === 'moves' ? moveIds.includes(row.id as ID) : kind === 'abilities' ? abilityIds.includes(row.id as ID) : row.id === toID(set.item))
				.map(row => ({ name: row.name, reviewed: row.reviewed, effects: row.fieldEffects }))) : [];
		return { name: species.name, calculatorSet: { ...set, species: species.name }, naturePower: moveIds.includes('naturepower' as ID) ? Dex.moves.get(resolveNaturePowerMove(input.field || '', input.aura ? Auras[input.aura] : null)).name : null, interactions };
	});
	const moves = team.flatMap(set => set.moves.map(id => Dex.moves.get(id))).filter(m => m.exists);
	const checks = [
		{ role: 'Direct recovery', evidence: moves.filter(m => !!m.heal).map(m => m.name), scope: 'Moves with a direct healing fraction; ability, drain and item recovery are not counted.' },
		{ role: 'Pivoting', evidence: moves.filter(m => !!m.selfSwitch).map(m => m.name), scope: 'Moves that switch their user; forced switches and manual switching are not counted.' },
		{ role: 'Physical damage', evidence: moves.filter(m => m.category === 'Physical').map(m => m.name), scope: 'Physical-category moves only; effectiveness and damage are not assessed.' },
		{ role: 'Special damage', evidence: moves.filter(m => m.category === 'Special').map(m => m.name), scope: 'Special-category moves only; effectiveness and damage are not assessed.' },
	].map(c => ({ ...c, evidence: [...new Set(c.evidence)], missing: !c.evidence.length }));
	const forecast = { supported: !!field, rules: field ? ((field.sections as Record<string, string[]>).Transitions || []) : [],
		notice: field ? 'Conditional transition reference, not a simulated prediction. Required successful moves, counters and exceptions remain in each rule. Current battle counters, opponent actions and timing are unknown.' : 'Transition forecasting without a selected field is unsupported.' };
	return { checked: true, format: format.name, errors: errors || [], proposals, sets, checks, forecast,
		notice: 'Suggestions are not applied. This checks the selected format only; unrestricted formats may allow moves that ordinary learnset formats reject. Field notes describe conditional rules, not guaranteed battle outcomes. Nature Power legality, priority and targeting still follow the battle engine.' };
}
