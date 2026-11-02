import type {AbilityData} from '../sim/dex-abilities';

export const RiftHerald: AbilityData = {
	name: 'Rift Herald', num: 11999, rating: 4, flags: {},
	shortDesc: 'Entry: Rift Aura, or full Rift Eclipse on no field. Rift Opening develops the Aura.',
	desc: 'On entry, creates Rift Aura for 5 turns, or 8 with an active Amplifield Rock; on no field, instead creates full Rift Eclipse. Existing Rift Aura or Rift Eclipse is not refreshed, and repeated ability entry does not develop the Aura. Rift Aura preserves the underlying field and boosts both sides\u2019 Dark attacks by 1.3x and Ghost attacks by 1.2x, while weakening Fairy attacks to 0.75x. Matching base-field bonuses do not stack; matching Fairy penalties use the stronger reduction rather than multiplying together. It does not grant full Rift Eclipse defenses, sleep damage, or Room/Gravity effects. Any user\u2019s successful Rift Opening develops an existing Rift Aura into full Rift Eclipse, consuming the Aura and preserving its remaining turns; the ability prepares the Aura so only one move use is needed. Normal Aura and field restrictions apply. Does not summon weather.',
	onStart(pokemon) {
		if (this.field.isAura('riftaura') || this.field.isTerrain('rifteclipseterrain')) return;
		const duration = pokemon.hasItem('amplifieldrock') ? 8 : 5;
		if (!this.field.terrain) {
			this.field.setFieldOrAura('rifteclipseterrain', duration, pokemon, this.effect, true);
		} else {
			this.field.setAura('riftaura', duration, pokemon, this.effect);
		}
	},
};

/** Fire counterpart to Bad Seeds; its defensive and spreading effects require the full field. */
export const AshenSeeds: AbilityData = {
 name: 'Ashen Seeds', num: 12030, rating: 4, flags: {breakable: 1},
 shortDesc: 'Entry: Ashen Aura or Infernal Eclipse. Infernal Parade/Eruption can develop the Aura.',
 desc: "On entry, sets Ashen Aura for 5 turns (8 with Amplifield Rock). On an empty field or Volcanic Field, sets Infernal Eclipse instead.\n\nAshen Aura boosts Fire attacks by 30%. Land Infernal Parade or Eruption to turn the Aura into Infernal Eclipse for its remaining turns. On Cold Eclipse, any Pokémon can trigger this change with Eruption, keeping the field timer.\n\nDuring Infernal Eclipse, the holder takes half damage from weaknesses caused by its Fire typing and keeps the field in place until it expires or the holder leaves or is suppressed. Eligible non-Fire contact attackers inherit Ashen Seeds. Non-Fire holders lose 1 Attack and Sp. Atk each turn.",
 onStart(pokemon) {
  if (pokemon.m.ashenSeedsContact || this.field.isAura('ashenaura') || this.field.isTerrain('infernaleclipseterrain')) return;
  const duration = pokemon.hasItem('amplifieldrock') ? 8 : 5;
  if (!this.field.terrain || this.field.isTerrain('volcanicterrain')) {
   this.field.setFieldOrAura('infernaleclipseterrain', duration, pokemon, this.effect, true);
  } else {
   this.field.setAura('ashenaura', duration, pokemon, this.effect);
  }
 },
 onAfterMove(source, target, move) { this.field.promoteSeedAura(source, move); },
 onEffectivenessPriority: -100,
 onEffectiveness(typeMod, target, type, move) {
  if (type === 'Fire') { this.effectState.fireWeaknessMove = move; this.effectState.fireWeakness = typeMod; }
 },
 onSourceModifyDamage(damage, source, target, move) {
  if (this.field.isTerrain('infernaleclipseterrain') && target.hasType('Fire') && this.effectState.fireWeaknessMove === move && this.effectState.fireWeakness > 0) return this.chainModify(0.5);
 },
 onDamagingHit(damage, target, source, move) {
  if (!this.field.isTerrain('infernaleclipseterrain') || source.hasType('Fire') || source.getAbility().flags.cantsuppress || source.ability === 'ashenseeds') return;
  if (!this.checkMoveMakesContact(move, source, target, !source.isAlly(target))) return;
  source.m.ashenSeedsContact = true;
  try { source.setAbility('ashenseeds', target, this.effect); } finally { delete source.m.ashenSeedsContact; }
 },
 onResidualOrder: 28,
 onResidual(pokemon) {
  if (this.field.isTerrain('infernaleclipseterrain') && !pokemon.hasType('Fire')) this.boost({atk: -1, spa: -1}, pokemon, pokemon);
 },
};
