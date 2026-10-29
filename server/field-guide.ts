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
	const auras = Object.values(Auras).map(aura => {
		const frozen = aura.id === 'frozenaura', ashen = aura.id === 'ashenaura';
		const sections: Record<string, string[]> = {
			'Boosts and general effects': [
				...Object.entries(aura.typeMultipliers).map(([type, n]) => `${type} attacks: ${n}x power` + (aura.typeCondition === 'none' ? ', including airborne users.' : aura.typeCondition === 'special' ? ', for special attacks only.' : ', while the attacker is grounded and not semi-invulnerable.')),
				'Matching field and aura type bonuses do not multiply together. Named move bonuses are separate.',
				...(aura.id === 'electricterrain' ? ['Electric Aura adds no type-wide bonus over Short-Circuit.'] : []),
				...(frozen || ashen ? ['This aura does not grant the full Eclipse field\'s defenses, weather rules, field lock or seed-ability contact effects.'] : []),
			],
			Moves: Object.entries(aura.damageMultipliers).map(([id, n]) => `${Dex.moves.get(id).name}: ${n}x power from its named move bonus.`),
			'Seeds and other effects': [`Mimicry selects ${aura.mimicryType}. An active aura also controls Camouflage and Terrain Pulse typing.`],
			Duration: [`Normally ${aura.turns} turns; the source can change this duration. The aura has a separate timer and does not replace the main field.`],
			'Battle messages': [...new Set(Object.values(aura.moveMessages))].map(message => '"' + message + '" - the named power bonus applies to ' + Object.entries(aura.moveMessages).filter(([, text]) => text === message).map(([id]) => Dex.moves.get(id).name).join(', ') + '. This does not confirm a hit.').concat(['"' + aura.typeMessage + '" - a matching attack receives an aura power modifier. Matching field bonuses can reduce the extra multiplier.', '"' + aura.endMessage + '" - the aura ends or is cleared. This message causes no damage.']),
		};
		if (frozen || ashen) {
			sections.Duration = [
				`${frozen ? 'Bad Seeds' : 'Ashen Seeds'} creates this aura on entry for 5 turns, or 8 with Amplifield Rock. An existing matching aura or Eclipse is not refreshed.`,
				`On no field or ${frozen ? 'Icy' : 'Volcanic'} Field, the ability instead creates full ${frozen ? 'Cold' : 'Infernal'} Eclipse. Field restrictions still apply.`,
				'The aura and main field have separate timers. Cold Eclipse does not pause the aura timer.',
			];
			sections.Transitions = [
				frozen ? 'An unsuppressed Bad Seeds holder can develop Frozen Aura into Cold Eclipse with successful Blizzard, Glaciate or Sheer Cold.' : 'An unsuppressed Ashen Seeds holder can develop Ashen Aura into Infernal Eclipse with successful Infernal Parade or Eruption.',
				'Ordinary development consumes the aura and keeps its remaining turns. The matching ability must belong to the move user.',
				frozen ? 'Direct Eclipse change: on Infernal Eclipse, any user can successfully use Glaciate or Sheer Cold with Frozen Aura to create Cold Eclipse. This consumes the aura but keeps the FIELD timer, not the aura timer.' : 'Direct Eclipse change: on Cold Eclipse, any user can successfully use Eruption with Ashen Aura to create Infernal Eclipse. This consumes the aura but keeps the FIELD timer, not the aura timer.',
				'Field locks still apply. Failed or blocked conversions leave the aura intact. Gravity, weather and repeated aura-setting attempts do not develop this aura.',
				'Ordinary development is blocked by a Flower Garden base, Chessboard, Glitch, Bewitched Woods, Haunted, New World, Underwater, Midnight Zone and Dragon\'s Den.',
			];
			sections.Moves.push(`Nature Power calls ${Dex.moves.get(aura.naturePowerMove).name}, overriding the main field. Terrain Pulse becomes ${aura.mimicryType} and gains its aura-based 2x power bonus.`);
			sections.Moves.push(`Secret Power uses the ${Dex.moves.get(aura.secretPowerMove).name} animation; this does not turn it into that move.`);
			if (frozen) sections.Moves.push(
				'Dragon Rage deals 140 fixed damage. Freeze Shock and Ice Burn skip their charging turn.',
				'Overlapping Frozen Aura and Cold Eclipse bonuses to the same named move are not applied twice. Bitter Malice also avoids a duplicate bonus on Icy or Snowy Mountain; Chilling Water does so on Icy or Snowy Field.',
			);
		}
		return {id: aura.id, name: aura.name, kind: 'aura', group: fieldGuideGroup(aura.id), groupingNote: '', review: 'Registry values and Eclipse aura conversion rules checked against battle handlers.', legacyNotes: [], references: {}, sections};
	});
	const rooms = Object.entries(RoomReference).map(([id, entry]) => ({
		id, name: Dex.moves.get(id).name, kind: 'effect', group: 'Rooms & Gravity',
		summary: entry.summary, review: 'Applies to all sides. Cold Eclipse blocks new uses and pauses existing timers for all four effects; their effects remain active. Rift Eclipse gives new uses eight turns.',
		groupingNote: '',
		sections: {...entry.sections, 'Eclipse interactions': [
			'Cold Eclipse blocks new uses. Existing rooms and Gravity remain active, but their timers pause until Cold Eclipse ends.',
			'Rift Eclipse gives new uses 8 turns. It does not extend effects that were already active.',
			'Infernal Eclipse does not add a special room or Gravity duration. These effects coexist with the main field and aura.',
		], ...(id === 'gravity' ? {'Impact moves': [Dex.moves.all().filter(move => move.flags.gravityboost).map(move => move.name).join(', ') + '.']} : {})},
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
			if (id === 'naturepower') notes = ['Calls ' + mapping.nature + '. Frozen Aura and Ashen Aura override this lookup with their own Nature Power moves.'];
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
