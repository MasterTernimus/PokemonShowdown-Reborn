/** Current battle states only; held items and past gimmick use do not qualify. */
export function radiantTarget(pokemon: Pokemon) {
 return !!(pokemon.species.isMega || pokemon.volatiles.dynamax || pokemon.species.forme.includes('Gmax') || pokemon.terastallized === 'Stellar');
}
