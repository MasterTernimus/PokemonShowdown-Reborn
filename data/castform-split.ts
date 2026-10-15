import type {AbilityDataTable} from '../sim/dex-abilities';
export const CastformForms = ['castform', 'castformsunny', 'castformrainy', 'castformsnowy', 'castformsandy', 'castformwindy'];
export const ClimateReserveRocks: {[id: string]: {weather: string, form: string}} = {
 heatrock: {weather: 'sunnyday', form: 'Castform-Sunny'},
 damprock: {weather: 'raindance', form: 'Castform-Rainy'},
 smoothrock: {weather: 'sandstorm', form: 'Castform-Sandy'},
 icyrock: {weather: 'hail', form: 'Castform-Snowy'},
};
export const PerfectForecastForms: {[id: string]: {components: string[], shortDesc: string, desc: string}} = {
 castform: {components: [], shortDesc: 'Normal form: no additional form bonus.', desc: 'Normal form has no additional bonus. Forecast supplies weather-driven form changes separately.'},
 castformwindy: {components: [], shortDesc: 'Windy form: damaging Flying moves have 1.3x power.', desc: 'While Windy with active Perfect Forecast, damaging Flying-type moves have 1.3x power. No Speed or priority bonus. Forecast alone and Climate Reserve do not grant this boost.'},
 castformsunny: {components: ['solarpower', 'flamebody'], shortDesc: 'Modified Solar Power: 1.5x Sp. Atk in sun, no HP drain; Flame Body: 30% contact burn.', desc: 'Sunny form: modified Solar Power gives 1.5x Sp. Atk in effective sun without HP drain. Its Flame Body effect has a 30% chance to burn a contact attacker. No additional local field bonuses are granted.'},
 castformrainy: {components: ['waterabsorb', 'raindish', 'hydration'], shortDesc: 'Water Absorb: heals 1/4; Rain Dish + extra rain recovery: 3/16 total; Hydration.', desc: 'Rainy form: Water Absorb nullifies other Pokemon\'s Water attacks and heals 1/4 base max HP. Rain Dish restores 1/16 in rain; its custom extra recovery adds 1/8, for 3/16 total per rain turn. Hydration cures status in effective rain. This is not Dry Skin and grants no extra local field recovery or Fire weakness.'},
 castformsnowy: {components: ['slushrush', 'icebody'], shortDesc: 'Slush Rush: 2x Speed; Ice Body: 1/16 recovery in snow/hail or supported icy fields; hail immunity.', desc: 'Snowy form: Slush Rush doubles Speed in hail, snow, Icy, Snowy Mountain or Cold Eclipse. Ice Body restores 1/16 base max HP in those conditions, once when weather and field overlap, and prevents hail damage. This modified package has no contact frostbite and no doubled Cold Eclipse healing.'},
 castformsandy: {components: ['eartheater', 'sandrush'], shortDesc: 'Earth Eater: Ground absorption heals 1/4; Sand Rush: 2x Speed in sand/Desert/Ashen Beach; sand immunity.', desc: 'Sandy form: Earth Eater nullifies other Pokemon\'s Ground attacks and heals 1/4 base max HP. Sand Rush doubles Speed in sandstorm, Desert or Ashen Beach and prevents sandstorm damage. No additional local component effects are granted.'},
};
export const CastformDescriptions = {
 forecast: {shortDesc: 'Castform changes form with effective weather; no form-specific ability bonuses.', desc: 'Castform changes to Sunny in sun, Rainy in rain, Snowy in hail or snow, Sandy in sandstorm, Windy in Delta Stream, and Normal otherwise. Effective weather and Utility Umbrella apply. Does not transform copied Pokemon or supply any form-specific bonus.'},
 perfectforecast: {shortDesc: 'Forecast form changes plus the current Castform form\'s named, modified bonus package.', desc: 'Changes Castform with effective weather and supplies only its current form\'s bonuses. Sunny: modified Solar Power (1.5x Sp. Atk in sun, no HP drain) and Flame Body. Rainy: Water Absorb, Rain Dish plus 1/8 extra rain recovery (3/16 total), and Hydration. Snowy: modified Slush Rush and Ice Body (2x Speed, 1/16 healing, hail immunity in supported conditions). Sandy: Earth Eater and Sand Rush. Windy: damaging Flying moves have 1.3x power, without extra Speed or priority. Normal has no added bonus. These effects require active Perfect Forecast; the separate Forecast passive only changes forms.'},
 climatereserve: {shortDesc: 'Entry: held weather rock sets 5-turn weather. Without effective weather, its rock sets Castform\'s default form.', desc: 'On genuine entry, an active Heat Rock, Damp Rock, Smooth Rock or Icy Rock sets sun, rain, sandstorm or hail for exactly 5 turns; rocks do not extend this weather. Forecast still follows effective external weather. Without effective weather, the current active rock gives Sunny, Rainy, Sandy or Snowy form; no rock gives Normal form. Item loss, replacement or suppression updates this default. Ability suppression disables the default and entry weather, but not the Forecast passive. Ability restarts do not set weather. Grants no Perfect Forecast bonuses or Sp. Def boost.'},
};
export function installCastformSplit(abilities: AbilityDataTable) {
 const original = abilities.forecast;
 abilities.perfectforecast = {...original, name: 'Perfect Forecast', num: 11442};
 abilities.perfectforecast.onBasePower = function (basePower, source, target, move) {
  if (source.species.id === 'castformwindy' && move.category !== 'Status' && move.type === 'Flying') return this.chainModify(1.3);
 };
 abilities.forecast = {name: 'Forecast', num: 59, rating: 2, flags: original.flags,
  onStart: original.onStart,
  onWeatherChange(pokemon, source, effect) {
   if (pokemon.baseSpecies.baseSpecies === 'Castform' && !pokemon.transformed &&
    !pokemon.effectiveWeather() && pokemon.hasAbility('climatereserve')) {
    const reserve = ClimateReserveRocks[pokemon.item];
    if (reserve && pokemon.hasItem(pokemon.item)) {
     if (pokemon.isActive && pokemon.species.name !== reserve.form) pokemon.formeChange(reserve.form, this.effect, false, '[msg]');
     return;
    }
   }
   return original.onWeatherChange!.call(this, pokemon, source, effect);
  },
  onUpdate(pokemon) {
   abilities.forecast.onWeatherChange!.call(this, pokemon, null!, this.effect);
  },
 };
 abilities.perfectforecast.onStart = function (pokemon) {
  if (!pokemon.getPassives().includes('forecast')) original.onStart!.call(this, pokemon);
 };
 abilities.perfectforecast.onWeatherChange = function (pokemon, source, effect) {
  if (!pokemon.getPassives().includes('forecast')) original.onWeatherChange!.call(this, pokemon, source, effect);
 };
 abilities.climatereserve = {
  name: 'Climate Reserve', num: 11299, rating: 3, flags: original.flags,
  onSwitchIn(pokemon) {
   const reserve = ClimateReserveRocks[pokemon.item];
   if (reserve && pokemon.hasItem(pokemon.item)) this.field.setWeather(reserve.weather, pokemon, this.effect);
  },
 };
}
