import type {AbilityDataTable} from '../sim/dex-abilities';
export const IllusionDescriptions = {
 illusion: {shortDesc: 'Disguises itself as the last eligible party member; copies no mechanical traits.', desc: 'On entry, disguises itself as the last eligible non-fainted party member. Direct damaging hits and normal reveal effects break the disguise. Does not copy types, STAB, abilities or species passives, and grants no field bonuses.'},
 perfectillusion: {shortDesc: 'Advanced disguise: copies target STAB, eligible ability and passives until revealed.', desc: 'Uses the existing advanced disguise selection: the last healthy party member on first entry, then the best threat-scored healthy teammate when possible. While disguised, copies its target\'s STAB types, eligible selected ability and species passives. The copied ability activates normally; blacklisted form and copying abilities are not copied. Mirror Arena entry grants +1 evasion; Chessboard grants 1.2x move power while disguised; Cold Eclipse prevents hail damage. Damage or reveal effects end the disguise and copied traits. This selected package is distinct from the ordinary Illusion species passive.'},
};
export function installIllusionSplit(abilities: AbilityDataTable) {
 const advanced = abilities.illusion;
 const end = advanced.onEnd! as (this: Battle, pokemon: Pokemon) => void;
 const clear = function (this: Battle, pokemon: Pokemon) {
  end.call(this, pokemon);
  delete pokemon.m.perfectIllusion;
 };
 abilities.perfectillusion = {...advanced, name: 'Perfect Illusion', num: 11443,
  onBeforeSwitchIn(pokemon) {
   pokemon.m.perfectIllusion = true;
   advanced.onBeforeSwitchIn!.call(this, pokemon);
  },
  onStart(pokemon) {
   if (pokemon.illusion) pokemon.m.perfectIllusion = true;
   advanced.onStart!.call(this, pokemon);
   if (pokemon.illusion && pokemon.m.perfectIllusion && !pokemon.volatiles.illusioncopy) {
    pokemon.addVolatile('illusioncopy');
    const state = pokemon.volatiles['illusioncopy' as ID];
    if (state) state.originalAbility = 'perfectillusion';
   }
   if (pokemon.volatiles.illusioncopy) pokemon.volatiles.illusioncopy.copiedAbility = pokemon.ability;
  },
  onEnd: clear,
 };
 abilities.illusion = {
  name: 'Illusion', num: 149, rating: 4.5, flags: advanced.flags,
  onBeforeSwitchIn(pokemon) {
   if (pokemon.m.perfectIllusion || (pokemon.ability === 'perfectillusion' && !pokemon.ignoringAbility())) return;
   pokemon.illusion = null;
   for (let i = pokemon.side.pokemon.length - 1; i >= 0; i--) {
    const candidate = pokemon.side.pokemon[i];
    if (candidate !== pokemon && !candidate.fainted && candidate.hp &&
     (!pokemon.terastallized || !['Ogerpon', 'Terapagos'].includes(candidate.species.baseSpecies))) {
     pokemon.illusion = candidate; break;
    }
   }
  },
  onDamagingHit: advanced.onDamagingHit,
  onEnd: clear,
  onFaint(pokemon) { pokemon.illusion = null; delete pokemon.m.perfectIllusion; },
 };
}
