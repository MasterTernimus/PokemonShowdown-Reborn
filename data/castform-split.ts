import type {AbilityDataTable} from '../sim/dex-abilities';
export const CastformForms = ['castform', 'castformsunny', 'castformrainy', 'castformsnowy', 'castformsandy', 'castformwindy'];
export const PerfectForecastForms: {[id: string]: {components: string[], shortDesc: string, desc: string}} = {
 castform: {components: [], shortDesc: 'Normal form: no additional form bonus.', desc: 'Normal form has no additional bonus. Forecast supplies weather-driven form changes separately.'},
 castformwindy: {components: [], shortDesc: 'Windy form: no additional form bonus.', desc: 'Windy form has no additional bonus. Forecast supplies weather-driven form changes separately.'},
 castformsunny: {components: ['solarpower', 'flamebody'], shortDesc: 'Modified Solar Power: 1.5x Sp. Atk in sun, no HP drain; Flame Body: 30% contact burn.', desc: 'Sunny form: modified Solar Power gives 1.5x Sp. Atk in effective sun without HP drain. Its Flame Body effect has a 30% chance to burn a contact attacker. No additional local field bonuses are granted.'},
 castformrainy: {components: ['waterabsorb', 'raindish', 'hydration'], shortDesc: 'Water Absorb: heals 1/4; Rain Dish + extra rain recovery: 3/16 total; Hydration.', desc: 'Rainy form: Water Absorb nullifies other Pokemon\'s Water attacks and heals 1/4 base max HP. Rain Dish restores 1/16 in rain; its custom extra recovery adds 1/8, for 3/16 total per rain turn. Hydration cures status in effective rain. This is not Dry Skin and grants no extra local field recovery or Fire weakness.'},
 castformsnowy: {components: ['slushrush', 'icebody'], shortDesc: 'Slush Rush: 2x Speed; Ice Body: 1/16 recovery in snow/hail or supported icy fields; hail immunity.', desc: 'Snowy form: Slush Rush doubles Speed in hail, snow, Icy, Snowy Mountain or Cold Eclipse. Ice Body restores 1/16 base max HP in those conditions, once when weather and field overlap, and prevents hail damage. This modified package has no contact frostbite and no doubled Cold Eclipse healing.'},
 castformsandy: {components: ['eartheater', 'sandrush'], shortDesc: 'Earth Eater: Ground absorption heals 1/4; Sand Rush: 2x Speed in sand/Desert/Ashen Beach; sand immunity.', desc: 'Sandy form: Earth Eater nullifies other Pokemon\'s Ground attacks and heals 1/4 base max HP. Sand Rush doubles Speed in sandstorm, Desert or Ashen Beach and prevents sandstorm damage. No additional local component effects are granted.'},
};
export const CastformDescriptions = {
 forecast: {shortDesc: 'Castform changes form with effective weather; no form-specific ability bonuses.', desc: 'Castform changes to Sunny in sun, Rainy in rain, Snowy in hail or snow, Sandy in sandstorm, Windy in Delta Stream, and Normal otherwise. Effective weather and Utility Umbrella apply. Does not transform copied Pokemon or supply any form-specific bonus.'},
 perfectforecast: {shortDesc: 'Forecast form changes plus the current Castform form\'s named, modified bonus package.', desc: 'Changes Castform with effective weather and supplies only its current form\'s bonuses. Sunny: modified Solar Power (1.5x Sp. Atk in sun, no HP drain) and Flame Body. Rainy: Water Absorb, Rain Dish plus 1/8 extra rain recovery (3/16 total), and Hydration. Snowy: modified Slush Rush and Ice Body (2x Speed, 1/16 healing, hail immunity in supported conditions). Sandy: Earth Eater and Sand Rush. Normal and Windy have no added bonus. These effects require active Perfect Forecast; the separate Forecast passive only changes forms.'},
 climatereserve: {shortDesc: 'Once per entry, after surviving the first opposing whole HP-damaging attack: +1 Sp. Def.', desc: 'Once per genuine switch-in, after surviving the first opposing damaging move that removes HP, raises Sp. Def by 1 after all its hits. Misses, protection, immunity, Substitute-only damage, residual damage and allied attacks do not qualify. Fainting gives no boost. Ability restarts or changes do not reset the allowance. Normal boost prevention applies. Does not extend weather; Forecast form changes are supplied separately by the species passive.'},
};
export function installCastformSplit(abilities: AbilityDataTable) {
 const original = abilities.forecast;
 abilities.perfectforecast = {...original, name: 'Perfect Forecast', num: 11442};
 abilities.forecast = {name: 'Forecast', num: 59, rating: 2, flags: original.flags,
  onStart: original.onStart, onWeatherChange: original.onWeatherChange};
 abilities.perfectforecast.onStart = function (pokemon) {
  if (!pokemon.getPassives().includes('forecast')) original.onStart!.call(this, pokemon);
 };
 abilities.perfectforecast.onWeatherChange = function (pokemon, source, effect) {
  if (!pokemon.getPassives().includes('forecast')) original.onWeatherChange!.call(this, pokemon, source, effect);
 };
 abilities.climatereserve = {
  name: 'Climate Reserve', num: 11299, rating: 3, flags: original.flags,
  onAfterDamageApplied(damage, target, source, effect) {
   if (damage <= 0 || !source || source.isAlly(target) || effect?.effectType !== 'Move' || effect.category === 'Status' || target.m.climateReserveUsed) return;
   target.m.climateReserveUsed = true;
   target.m.climateReservePending = {source, move: effect};
  },
  onAnyAfterAttackResolved(source, target, move) {
   const holder = this.effectState.target;
   if (holder.m.climateReservePending?.source !== source || holder.m.climateReservePending?.move !== move) return;
   delete holder.m.climateReservePending;
   if (holder.hp && holder.isActive && holder.hasAbility('climatereserve')) this.boost({spd: 1}, holder, holder);
  },
 };
}
