'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
const hidden = ['Mightyena-Mega', 'Mightyena-Grim', 'Mightyena-Mega-Grim'];

describe('Hidden Mightyena forms', () => {
 let battle;
 afterEach(() => { battle?.destroy(); battle = null; });
 const set = species => ({species, ability: Dex.species.get(species).abilities[0], moves: ['tackle']});
 it('retains historical data while rejecting named and ID imports', () => {
  const validator = new TeamValidator('gen9nofieldsinglesgame');
  for (const name of hidden) {
   const species = Dex.species.get(name);
   assert(species.exists);
   for (const input of [name, species.id]) {
    assert(validator.validateSet(set(input), {}).some(error => error.includes('disabled')), input);
   }
  }
  for (const name of ['Mightyena', 'Mightyena-Deso']) {
   assert(!(validator.validateSet(set(name), {}) || []).some(error => error.includes('disabled')), name);
  }
 });
 it('rejects every item route to a hidden Mega', () => {
  const validator = new TeamValidator('gen9nofieldsinglesgame');
  const routes = Dex.items.all().flatMap(item => Object.entries(item.megaStone || {})
   .filter(([, target]) => hidden.includes(target)).map(([species]) => ({species, item: item.name})));
  assert(routes.length);
  for (const {species, item} of routes) {
   assert(validator.validateSet({...set(species), item}, {}).some(error => error.includes('disabled')), species + ': ' + item);
  }
 });
 it('rejects unchecked battle creation and forced form or Mega changes', () => {
  for (const name of hidden) {
   assert.throws(() => common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[set(name)], [set('Mew')]]), /disabled/);
  }
  battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[set('Mightyena')], [set('Mew')]]);
  battle.makeChoices('team 1', 'team 1');
  const pokemon = battle.p1.active[0];
  for (const name of hidden) {
   assert(!pokemon.formeChange(name), name);
   pokemon.canMegaEvo = name;
   assert.equal(battle.actions.runMegaEvo(pokemon), false, name);
  }
 });
 it('omits hidden forms from calculator and public rules, including family links', () => {
  const calculator = require('../../../dist/sim/custom-calculator').calculatorMetadata();
  const rules = require('../../../dist/server/rules-encyclopedia');
  const catalog = rules.rulesCatalog();
  for (const name of hidden) {
   assert(!calculator.species.some(species => species.name === name));
   assert(!catalog.species.some(species => species.name === name));
   assert(!rules.rulesDetail('species', 'Mightyena').forms.includes(name));
   assert.throws(() => rules.rulesDetail('species', name), /Unknown Pokémon/);
  }
  for (const name of ['Mightyena', 'Mightyena-Deso']) {
   assert(calculator.species.some(species => species.name === name), name);
   assert(catalog.species.some(species => species.name === name), name);
  }
 });
});
