/** Rock-typing weakness protection uses actual fields, never an Aura equivalent. */
export const RelicArmorFields = [
	'rockyterrain', 'fairytaleterrain', 'watersurfaceterrain', 'underwaterterrain',
	'murkwatersurfaceterrain', 'midnightzoneterrain', 'starlightarenaterrain', 'newworldterrain',
	'holyterrain', 'mountainterrain', 'caveterrain', 'volcanicterrain', 'dragonsdenterrain',
	'crystalcavernterrain', 'darkcrystalcavernterrain',
];

export function clearRelicArmorIndicators(pokemon: Pokemon) {
	pokemon.removeVolatile('relicarmoractive');
	pokemon.removeVolatile('relicarmorfield');
	delete pokemon.m.relicArmorAnnouncedField;
}

export function updateRelicArmorIndicator(battle: Battle, pokemon: Pokemon) {
	if (!pokemon.hp || !pokemon.isActive || pokemon.illusion || !pokemon.hasAbilityOrPassive(['relicarmor', 'defeatist'])) {
		clearRelicArmorIndicators(pokemon);
		return;
	}
	const protectedField = battle.field.isTerrain(RelicArmorFields);
	const indicator = protectedField ? 'relicarmorfield' : 'relicarmoractive';
	pokemon.removeVolatile(protectedField ? 'relicarmoractive' : 'relicarmorfield');
	if (!pokemon.volatiles[indicator]) pokemon.addVolatile(indicator, pokemon, battle.dex.abilities.get('relicarmor'));
	const field = protectedField ? battle.field.terrain : '';
	if (field && pokemon.m.relicArmorAnnouncedField !== field) {
		battle.add('-message', `${pokemon.name}'s Relic Armor neutralizes its Rock-typing weaknesses on this field!`);
	}
	pokemon.m.relicArmorAnnouncedField = field;
}
