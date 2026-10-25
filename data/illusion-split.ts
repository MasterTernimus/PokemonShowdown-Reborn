import type {AbilityDataTable} from '../sim/dex-abilities';
export const IllusionDescriptions = {
 "illusion": {
  "desc": "Disguises itself as a teammate without copying mechanical traits. The optional Initial Disguise teammate is used on the holder’s first entry only; if unavailable, normal automatic selection applies. Auto and later entries use the last eligible healthy teammate in battle order. Direct damaging hits and normal reveal effects, including opposing Mind’s Eye, break the disguise. Types, STAB, abilities and passives are not copied.",
  "shortDesc": "Teammate disguise only; optional initial teammate, then Auto."
 },
 "perfectillusion": {
  "desc": "Advanced disguise copies its teammate’s STAB types, eligible selected ability and species passives until revealed. The optional Initial Disguise teammate is used on the holder’s first entry only; if unavailable, normal automatic selection applies. Auto uses the last healthy teammate on first entry, then the best threat-scored healthy teammate when possible. Blacklisted form and copying abilities are not copied. Mirror Arena entry grants +1 evasion; Chessboard grants 1.2x move power while disguised; Cold Eclipse prevents hail damage. Direct damage and reveal effects, including opposing Mind’s Eye, remove the disguise and copied traits. This is distinct from the ordinary Illusion species passive.",
  "shortDesc": "Advanced teammate disguise copies STAB, eligible ability and passives until revealed."
 }
};
function chosenInitialDisguise(pokemon: Pokemon): boolean {
 if (pokemon.previouslySwitchedIn !== 0) return false;
 const slot = pokemon.set.initialDisguise;
 if (!Number.isInteger(slot) || !slot || slot < 1 || slot > pokemon.side.team.length) return false;
 const selected = pokemon.side.team[slot - 1];
 const target = pokemon.side.pokemon.find(candidate => candidate.set === selected);
 if (!target || target === pokemon || target.fainted || !target.hp ||
  (pokemon.terastallized && ['Ogerpon', 'Terapagos'].includes(target.species.baseSpecies))) return false;
 pokemon.illusion = target;
 return true;
}
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
   if (!chosenInitialDisguise(pokemon)) advanced.onBeforeSwitchIn!.call(this, pokemon);
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
   if (chosenInitialDisguise(pokemon)) return;
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
