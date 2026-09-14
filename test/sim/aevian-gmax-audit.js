'use strict';
const assert = require('../assert');
const common = require('../common');

describe('Aevian Gmax ability audit', function () {
 let battle;
 afterEach(() => battle?.destroy());
 for (const [species, ability, attack, absorbed, gmaxAbility] of [
  ['Lapras-Aevian', 'Protective Ward', 'psychic', 'watergun', 'crystalresonance'],
  ['Toxtricity-Aevian', 'Galvanize', 'flamethrower', 'thundershock', 'riotamp'],
 ]) {
  it(`${species} gains its absorption ability and keeps its custom form after switching`, function () {
   battle = common.createBattle({formatid: 'gen9mistyfieldadrienn'}, [[
    {species, ability, gigantamax: true, moves: [attack]},
    {species: 'Blissey', ability: 'noability', moves: ['splash']},
   ], [{species: 'Blissey', ability: 'noability', moves: ['splash', absorbed]}]]);
   battle.makeChoices('team 12', 'team 1');
   const pokemon = battle.p1.active[0];
   battle.makeChoices(`move ${attack} dynamax`, 'move splash');
   assert.equal(pokemon.ability, gmaxAbility);
   const expectedForm = pokemon.species.id;
   pokemon.hp = Math.floor(pokemon.maxhp / 2);
   const hp = pokemon.hp;
   battle.makeChoices(`move ${attack}`, `move ${absorbed}`);
   assert(pokemon.hp > hp, 'absorbed attack should heal');
   battle.makeChoices('switch 2', 'move splash');
   battle.makeChoices('switch 2', 'move splash');
   assert.equal(pokemon.species.id, expectedForm);
   assert.equal(pokemon.ability, gmaxAbility);
  });
 }
});
