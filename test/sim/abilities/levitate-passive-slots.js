'use strict';
const assert=require('assert').strict;
const {Dex,TeamValidator}=require('../../../dist/sim');
const before=require('./thematic-selected-slots.json');
describe('Approved Levitate selected-slot replacements',()=>{
 for(const[id,old]of Object.entries(before))it(id+' changes only slot '+old.slot+' to '+old.replacement,()=>{
  const species=Dex.species.get(id);assert.deepEqual(species.abilities,{...old.abilities,[old.slot]:old.replacement});
  assert.deepEqual(species.baseStats,old.baseStats);assert.deepEqual(species.types,old.types);assert.deepEqual(species.passives,['levitate']);
  const validator=new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities');
  const set={species:species.name,ability:old.replacement,moves:['tackle'],nature:'Serious',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}};
  const errors=validator.validateSet(set);assert(!errors?.length,JSON.stringify(errors));
  const invalid=validator.validateSet({...set,ability:'Levitate'});assert(invalid?.some(x=>/can't have Levitate/.test(x)),JSON.stringify(invalid));
  const metadata=require('../../../dist/sim/custom-calculator').calculatorMetadata().species.find(s=>s.name===species.name);assert.deepEqual(metadata.abilities,species.abilities);assert.deepEqual(metadata.passives,['levitate']);
 });
 it('preserves useful existing selected slots and excluded earlier stages',()=>{
  for(const id of ['eelektross','weezing','weezinggalar'])assert(Object.values(Dex.species.get(id).abilities).includes('Elevate'),id);
  for(const[id,ability]of [['chimecho','Temple Chime'],['mismagius','Void Crossing'],['solrock','Solar Idol'],['lunatone','Lunar Idol']])assert(Object.values(Dex.species.get(id).abilities).includes(ability),id);
  assert(Object.values(Dex.species.get('hydreigon').abilities).includes('Dread Wings'));assert.deepEqual(Dex.species.get('hydreigon').passives,['levitate']);
  for(const id of ['chingling','dusclops','vibrava'])assert.deepEqual(Dex.species.get(id).passives,[]);
 });
});
