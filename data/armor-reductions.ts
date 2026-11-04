import {SignaturePassiveComponents} from './signature-passive-data';

export const armorFields = new Set([
	'newworldterrain', 'dragonsdenterrain', 'mountainterrain', 'holyterrain', 'hauntedterrain',
	'starlightarenaterrain', 'snowymountainterrain', 'flowergarden1', 'flowergarden2', 'flowergarden3',
	'flowergarden4', 'flowergarden5',
]);
const fieldRestricted = new Set(['solidrock', 'filter', 'shellarmor', 'battlearmor']);

export function fieldDisablesArmorReduction(field: string, ability: string) {
	return fieldRestricted.has(ability) && armorFields.has(field);
}

export function hasReductionArmor(pokemon: Pokemon) {
	const ids = armorFields.has(pokemon.battle.field.terrain) ? ['prismarmor'] : ['solidrock', 'filter', 'prismarmor'];
	const ability = pokemon.getAbility();
	// The selected ability and each passive have independent suppression/bypass rules.
	if (pokemon.hasAbility(ids) && (!ability.flags.breakable || !pokemon.battle.suppressingAbility(pokemon, ability))) return true;
	return pokemon.getPassives().some(id => pokemon.hasAbilityOrPassive(id) &&
		ids.some(part => id === part || SignaturePassiveComponents[id]?.includes(part)));
}
