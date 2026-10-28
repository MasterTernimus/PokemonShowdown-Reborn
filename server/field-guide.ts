import { ReviewedReferenceDetails } from '../data/field-guide-reviewed-reference-data';
import { FieldMessageTriggers } from '../data/field-message-triggers';
import { CheckedFieldReferences } from '../data/field-guide-reference-details';
import { FieldSeedNotes, FieldMoveMappings, FieldSecretPowerNotes } from '../data/public-field-guide-shared';
import { fieldGuideGroup, FieldGuideGroupingNotes } from '../data/field-guide-groups';
import { FS } from '../lib';
import { Dex } from '../sim/dex';
import { calculatorMetadata } from '../sim/custom-calculator';
import { Auras } from '../data/auras';
import { FieldNotes } from '../data/field-guide';
import { ReviewedFieldGuide } from '../data/public-field-guide';
import { RoomReference } from '../data/room-reference';
const index = JSON.parse(FS('data/field-guide-index.json').readSync());
export function publicFieldGuide() {
	const fields = calculatorMetadata().fields.filter(f => f.id).map(field => ({
		...field, name: field.id === 'adriennterrain' ? 'Adrienn Mixed Field' : field.name, kind: 'field', group: fieldGuideGroup(field.id), groupingNote: FieldGuideGroupingNotes[field.id] || '', sections: { ...(ReviewedFieldGuide[field.id] || {}), ...((ReviewedFieldGuide[field.id]?.['Battle messages'] || FieldMessageTriggers[field.id] || index.fieldStartMessages?.[field.id]) ? { 'Battle messages': FieldMessageTriggers[field.id] || [...new Set<string>([...(ReviewedFieldGuide[field.id]?.['Battle messages'] || []), ...(index.fieldStartMessages?.[field.id] || [])])].map(message => index.fieldStartMessages?.[field.id]?.includes(message) ? '“' + message + '” — printed directly when this field starts. It announces activation; the text itself adds no extra effect.' : 'Trigger review pending — “' + message + '” is flavor text; its exact cause has not yet been documented.') } : {}) },
		review: ReviewedFieldGuide[field.id] ? 'Source-reviewed field effects and indexed move, ability and item interactions.' : 'Detailed sections have not yet been source-reviewed. Older notes below are explicitly unverified.',
		legacyNotes: ReviewedFieldGuide[field.id] || field.id === 'newworldterrain' ? [] : FieldNotes[field.id] || [],
		referenceDetails: fieldReferenceDetails(field.id),
		references: Object.fromEntries(Object.entries(index.fields[field.id] || {}).map(([kind, ids]) => [kind,
			(ids as string[]).map(id => (kind === 'abilities' ? Dex.abilities : kind === 'moves' ? Dex.moves : Dex.items).get(id).name)])),
	}));
	const auras = Object.values(Auras).map(aura => ({ id: aura.id, name: aura.name, kind: 'aura', group: fieldGuideGroup(aura.id), groupingNote: 'Temporary aura, separate from full fields.', review: 'Values below come directly from the active aura registry. Shared promotion rules and conditional handlers can add effects.', legacyNotes: [], references: {}, sections: {
		'Boosts and general effects': [...Object.entries(aura.typeMultipliers).map(([type, n]) => `${type}: ${n}x power` + (aura.typeCondition === 'none' ? '.' : aura.typeCondition === 'special' ? ', for special attacks only.' : ', while the attacker is grounded and not semi-invulnerable.')), 'Matching field and aura type bonuses are reconciled rather than multiplied twice. Named move bonuses are separate. Electric Aura adds no type-wide bonus over Short-Circuit.'],
		Moves: Object.entries(aura.damageMultipliers).map(([id, n]) => `${Dex.moves.get(id).name}: ${n}× named move-power modifier.`),
		'Seeds and other effects': [`Temporary aura, distinct from a full field. Registry duration: ${aura.turns} turns; the observed battle duration can differ. Mimicry type: ${aura.mimicryType}.`, 'Compatibility, conversion, source provenance and paused timers follow the engine. These registry values are not an exhaustive description of shared handlers.'],
		'Battle messages': [...new Set(Object.values(aura.moveMessages))].map(message => '"' + message + '" — the named aura power modifier is evaluated for ' + Object.entries(aura.moveMessages).filter(([,text]) => text === message).map(([id]) => Dex.moves.get(id).name).join(', ') + '. Its exact multiplier is listed in Moves; the message does not confirm a hit.').concat(['"' + aura.typeMessage + '" — a matching type attack passes the aura type conditions above, or a named move without a separate message receives its aura modifier. Shared field/aura reconciliation can reduce the extra multiplier.', '"' + aura.endMessage + '" — this aura ends or is cleared; it does not itself inflict damage.']),
	} }));
	const rooms = Object.entries(RoomReference).map(([id, entry]) => ({
		id, name: Dex.moves.get(id).name, kind: 'effect', group: 'Rooms & Gravity',
		summary: entry.summary, review: 'Applies to all sides. Cold Eclipse blocks and removes all four effects.',
		groupingNote: 'A separate battle effect with its own timer, alongside the main field and aura.',
		sections: {...entry.sections, ...(id === 'gravity' ? {'Impact moves': [Dex.moves.all().filter(move => move.flags.gravityboost).map(move => move.name).join(', ') + '.']} : {})},
		legacyNotes: [], references: {}, referenceDetails: {} as ReturnType<typeof fieldReferenceDetails>,
	}));
	return { fingerprint: index.fingerprint, entries: [...fields, ...auras, ...rooms], coverage: { fields: fields.length, auras: auras.length, rooms: rooms.length, reviewedFields: Object.keys(ReviewedFieldGuide).length, exhaustive: false }, notice: 'Every field has source-reviewed sections and indexed interaction details. Battle messages are explained separately from mechanics. The indexed review is not a guarantee of exhaustive cross-file coverage; documented discrepancies describe current behavior rather than intended balance.' };
}

function fieldReferenceDetails(field: string) {
	const sections = ReviewedFieldGuide[field] || {};
	return Object.fromEntries(Object.entries(index.fields[field] || {}).map(([kind, ids]) => [kind, (ids as string[]).map(id => {
		const effect = (kind === 'abilities' ? Dex.abilities : kind === 'moves' ? Dex.moves : Dex.items).get(id);
		let notes = CheckedFieldReferences[field]?.[kind]?.[id] || (ReviewedReferenceDetails as Record<string, Record<string, Record<string, string[]>>>)[field]?.[kind]?.[id];
		if (!notes && kind === 'items' && FieldSeedNotes[field]?.includes(effect.name)) notes = [FieldSeedNotes[field]];
		const mapping = FieldMoveMappings[field];
		if (!notes && mapping && kind === 'moves') {
			if (id === 'camouflage') notes = ['Changes the user to ' + mapping.camouflage + '. An active aura overrides the type; type-change restrictions apply.'];
			if (id === 'naturepower') notes = ['Calls ' + mapping.nature + '. Frozen Aura overrides this lookup with its own Nature Power move.'];
			if (id === 'terrainpulse') notes = ['Becomes ' + mapping.pulse + '. An active aura overrides its type. Only Electric, Grassy, Misty, Psychic and Rainbow full fields activate its separate doubled-power check, with no aura and no adaptive protection on the target.'];
			if (id === 'secretpower' && FieldSecretPowerNotes[field]) notes = [FieldSecretPowerNotes[field]];
		}
		if (!notes && mapping && kind === 'abilities' && id === 'mimicry') notes = ['Selects ' + mapping.mimicry + '. An active aura overrides the type; Terastallization and other type-change restrictions apply.'];
		if (!notes) {
			const sectionNames = kind === 'abilities' ? ['Abilities'] : kind === 'moves' ? ['Moves', 'Transitions'] : ['Seeds and other effects'];
			notes = [...new Set(sectionNames.flatMap(section => sections[section] || []).filter(text => text.toLowerCase().includes(effect.name.toLowerCase())))];
		}
		return { id, name: effect.name, reviewed: !!notes.length, fieldEffects: notes, generalSummary: id === 'voidcrossing' ? '' : effect.shortDesc || '',
			...(kind === 'moves' ? { moveStats: (() => { const move = Dex.moves.get(id); return { type: move.type, category: move.category, power: move.basePower, accuracy: move.accuracy, pp: move.pp }; })() } : {}) };
	})]));
}
