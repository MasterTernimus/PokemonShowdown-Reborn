import { FS, Utils } from '../../lib';
import { Dex, toID } from '../../sim/dex';
import { Auras } from '../../data/auras';
import { FieldNotes } from '../../data/field-guide';

interface Reference { name: string; moves: { [description: string]: string[] } }
const references: { [id: string]: Reference } = JSON.parse(FS('data/field-reference.json').readSync());
const escape = Utils.escapeHTML;
const list = (lines: string[]) => `<ul>${lines.map(line => `<li>${escape(line)}</li>`).join('')}</ul>`;

function renderMainEffects(id: string): string {
	if (id === 'rockyterrain') {
		return '<h4>Damage</h4>' + list(['Rock attacks: 1.5× power. Named move bonuses can stack.']) +
			'<h4>Protection</h4>' + list([
				'Positive Defense stages prevent flinching and block bullet moves.',
				'Substitute also blocks bullet moves.',
			]) + '<h4>Penalties</h4>' + list([
				'Failed contact moves cost 1/8 maximum HP, including misses, immunity and protection failures. Rock Head prevents this penalty.',
				'Flinching costs 1/4 HP. Steadfast or Sturdy prevents this penalty.',
			]) + '<details><summary>Ability interactions and exceptions</summary>' + list([
				'Rock Head prevents the failed-contact penalty; it does not prevent the flinch penalty.',
				'Steadfast and Sturdy prevent the flinch penalty; they do not prevent the failed-contact penalty.',
				'These are the field-specific exceptions listed here, not every possible ability interaction.',
			]) + '</details>';
	}
	const notes = (FieldNotes[id] || []).flatMap(note => note.split(/(?<!Sp)\.\s+(?=[A-Z])/)
		.map(sentence => sentence.endsWith('.') ? sentence : sentence + '.'));
	return `<h4>Main effects</h4>${list(notes)}`;
}

export function resolveFieldName(text: string, aura = false): string | undefined {
	const id = toID(text).replace(/(?:terrain|field|aura)$/, '');
	const aliases: { [id: string]: string } = { chess: 'chessboard', bewitched: 'bewitchedwoods', water: 'watersurface',
		rockyfield: 'rocky', psychic: 'psychic', misty: 'misty', grassy: 'grassy', electric: 'electric', rainbow: 'rainbow',
		flowergarden: 'flowergarden1', starlight: 'starlightarena', murkwater: 'murkwatersurface' };
	const normalized = aliases[id] || id;
	return Object.keys(aura ? Auras : references).find(key => key.replace(/terrain$/, '') === normalized ||
		toID(aura ? Auras[key].name : references[key].name).replace(/(?:terrain|field|aura)$/, '') === normalized);
}

export function renderAura(id: string): string {
	const aura = Auras[id];
	const attackBoosts: string[] = [];
	const moveChanges: string[] = [];
	for (const [type, multiplier] of Object.entries(aura.typeMultipliers)) {
		attackBoosts.push(`${type} attacks: ${multiplier}× power${aura.typeCondition === 'special' ? ' for special attacks only' :
			aura.typeCondition === 'none' ? '' : ' for grounded, non-semi-invulnerable users'}.`);
	}
	const longMoveLists: string[] = [];
	for (const multiplier of [...new Set(Object.values(aura.damageMultipliers))]) {
		const moves = Object.keys(aura.damageMultipliers)
			.filter(move => aura.damageMultipliers[move] === multiplier)
			.map(move => Dex.moves.get(move).name);
		if (moves.length > 12) {
			moveChanges.push(`${multiplier}× move power for ${moves.length} named moves.`);
			longMoveLists.push(`${multiplier}×: ${moves.join(', ')}`);
		} else {
			moveChanges.push(`${multiplier}× move power: ${moves.join(', ')}.`);
		}
	}
	if (Object.keys(aura.secondaryTypeAdditions).length) {
		moveChanges.push(`Additional Electric typing: ${Object.keys(aura.secondaryTypeAdditions).map(move => Dex.moves.get(move).name).join(', ')}.`);
	}
	const extras: { [id: string]: string[] } = {
		electricterrain: [
			'Rising Voltage doubles against grounded targets; Psyblade gains 1.5× power.',
			'Quark Drive activates without consuming Booster Energy.',
			'The Electric type bonus is disabled on Short Circuit. No sleep protection.',
		],
		grassyterrain: [
			'Grounded, non-semi-invulnerable Pokémon heal 1/16 maximum HP each turn.',
			'Grassy Glide gains +1 priority.',
			'No Grassy Seed activation or Earthquake reduction.',
		],
		mistyterrain: [
			'Fairy Pokémon gain 1.5× Special Defense, including airborne Fairy Pokémon.',
			'Grounded Misty Explosion gains its separate 1.5× bonus.',
			'No status protection or Dragon damage reduction.',
		],
		psychicterrain: [
			'Telepathy doubles Speed.',
			'Opposing priority attacks are blocked against grounded, non-semi-invulnerable targets; self, ally and redirection moves are exempt.',
			'Expanding Force targets all adjacent opponents and gains a separate 1.5× boost for grounded users, stacking with the 1.3× Psychic boost.',
		],
		rainbowterrain: [
			'No random extra typing or doubled secondary-effect chances.',
			'Rain Dance and Sunny Day transitions create this Aura; Fire/Water Pledge creates the full Rainbow Field.',
		],
	};
	const otherEffects = [...extras[id],
		`Mimicry and Camouflage become ${aura.mimicryType}. Terrain Pulse becomes ${aura.mimicryType} and doubles in power.`,
	];
	const sharedRules = [
		`Secret Power animation: ${Dex.moves.get(aura.secretPowerMove).name}. Nature Power and Secret Power secondary effects follow the base field.`,
		'One Aura at a time. Its timer pauses on Cold Eclipse. Move-specific field/Aura bonuses may stack; overlapping type boosts use the stronger bonus with a 1.5× minimum.',
		'Gravity, Lunar Orbit activation and G-Max Gravitas can convert an Aura to a full field for 5 turns, or 8 with Amplifield Rock, subject to field restrictions. Different matching terrain sources can also convert it; repeating one source only refreshes it. Passive Gravity does not convert new Auras.',
	];
	return `<strong>${escape(aura.name)}</strong>` +
		`<h4>Attack boost</h4>${list(attackBoosts)}` +
		`<h4>Changed moves</h4>${list(moveChanges)}` +
		(longMoveLists.length ? `<details><summary>Full boosted move list</summary>${list(longMoveLists)}</details>` : '') +
		`<h4>Other effects</h4>${list(otherEffects)}` +
		`<details><summary>Shared Aura rules</summary>${list(sharedRules)}</details>`;
}

export function renderField(id: string): string {
	const reference = references[id];
	return `<strong>${escape(reference.name)} — Full Field</strong>` +
		renderMainEffects(id) +
		`<p><strong>Move effects:</strong> Use /field ${escape(reference.name)}, MOVE for one move's changes. ` +
		'In battle, hover a move to see the relevant effects for the current field.</p>' +
		`<p>For the detailed reference, use <strong>/field ${escape(reference.name)} full</strong>.</p>`;
}

export function renderFieldFull(id: string): string {
	const reference = references[id];
	const groups: { [section: string]: [string, string[]][] } = {
		'General move effects': [],
		'Role-dependent move effects': [],
		'Other conditional move effects': [],
	};
	for (const entry of Object.entries(reference.moves)) {
		const description = entry[0];
		const section = /\((?:King|Queen|Knight|Rook|Bishop|Pawn)\b/i.test(description) ? 'Role-dependent move effects' :
			(description.includes('(') || description.includes('[')) ? 'Other conditional move effects' : 'General move effects';
		groups[section].push(entry);
	}
	const sections = Object.entries(groups).filter(([, entries]) => entries.length).map(([section, entries]) => {
		const rows = entries.sort((a, b) => a[0].localeCompare(b[0])).map(([description, moves]) =>
			`<li><details><summary>${escape(description)} — ${moves.length} ${moves.length === 1 ? 'move' : 'moves'}</summary>` +
			`<p>${escape(moves.join(', '))}</p></details></li>`).join('');
		return `<details><summary>${escape(section)} (${entries.length})</summary><ul>${rows}</ul></details>`;
	}).join('');
	return `<strong>${escape(reference.name)} — Detailed effects</strong>` +
		renderMainEffects(id) +
		'<p>This reference combines main field rules with move previews; conditional ability interactions and field transitions may have additional effects.</p>' +
		'<h4>Move changes</h4><p>Open a category, then an effect to see its moves. ' +
		`For one move, use /field ${escape(reference.name)}, MOVE.</p>${sections}`;
}

export function renderFieldMove(id: string, moveName: string): string {
	const reference = references[id];
	const move = Dex.moves.get(moveName);
	const effects = Object.entries(reference.moves).filter(([, moves]) => moves.some(name => toID(name) === move.id))
		.map(([description]) => description);
	return `<strong>${escape(reference.name)} — ${escape(move.name)}</strong>` +
		`<h4>Listed field modifiers</h4>${effects.length ? list(effects) : '<p>No move-specific modifier is listed. Main field rules may still apply.</p>'}` +
		'<p>This is a reference, not a calculated damage result. Ability, Aura, target, weather and role conditions can change the outcome.</p>';
}

async function lookup(context: Chat.CommandContext, target: string, room: Room | null, aura: boolean) {
	let id: string | undefined;
	let turns: number | null | undefined;
	let moveName = '';
	let full = false;
	let paused = false;
	if (!aura) {
		if (target.includes(',')) {
			const comma = target.indexOf(',');
			moveName = target.slice(comma + 1).trim();
			target = target.slice(0, comma).trim();
			if (toID(moveName) === 'full') {
				full = true;
				moveName = '';
			}
		} else if (toID(target) === 'full') {
			full = true;
			target = 'info';
		} else if (/\s+full\s*$/i.test(target)) {
			full = true;
			target = target.replace(/\s+full\s*$/i, '').trim();
		}
	}
	if (!target.trim() || toID(target) === 'info') {
		if (!room?.battle) {
			return context.errorReply(`Use /${aura ? 'aura Psychic' : 'field Chess'} to look up a name outside battle.`);
		}
		const state = await room.battle.getFieldInfo();
		if (!state) return context.errorReply('The battle state is not available yet.');
		id = aura ? state.aura : state.field;
		turns = aura ? state.auraTurns : state.fieldTurns;
		paused = aura && state.field === 'coldeclipseterrain';
		if (!id) return context.sendReplyBox(`There is no active ${aura ? 'Aura' : 'base field'} in this battle.`);
	} else {
		id = resolveFieldName(target, aura);
	}
	if (!id || !(aura ? Auras[id] : references[id])) {
		return context.errorReply(`Unknown ${aura ? 'Aura' : 'field'}. Available: ${Object.values(aura ? Auras : references).map(entry => entry.name).join(', ')}.`);
	}
	if (moveName && !Dex.moves.get(moveName).exists) return context.errorReply(`Unknown move: ${moveName}.`);
	const timerText = paused ? 'Duration paused by Cold Eclipse. The countdown resumes after leaving this field, if the Aura remains active.' : turns === null ? 'Permanent — no timed expiration; field-changing effects can still end it.' :
		`${turns} ${turns === 1 ? 'turn' : 'turns'} remaining (including this turn).`;
	const timer = turns === undefined ? '' : `<p>${timerText}</p>`;
	context.sendReplyBox(`<div style="max-height:480px;overflow:auto">${timer}${aura ? renderAura(id) : moveName ? renderFieldMove(id, moveName) : full ? renderFieldFull(id) : renderField(id)}</div>`);
}

export const commands: Chat.ChatCommands = {
	async field(target, room) { await lookup(this, target, room, false); },
	async aura(target, room) { await lookup(this, target, room, true); },
	fieldhelp: ['/field info — privately shows the current battle field and its effects.', '/field NAME — shows a field’s main rules, e.g. /field Chess.', '/field NAME full — shows the detailed reference: main rules and listed move modifiers; additional conditional interactions may apply.', '/field full — shows the detailed reference for the active battle field.', '/field NAME, MOVE — shows listed field modifiers, not calculated damage, e.g. /field Chess, Fake Out.'],
	aurahelp: ['/aura — privately shows the current battle Aura and its effects.', '/aura NAME — looks up an Aura, e.g. /aura Psychic.'],
};
