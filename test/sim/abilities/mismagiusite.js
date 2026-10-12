'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim'),{TeamValidator}=require('../../../dist/sim/team-validator');
let battle;
describe('Mega Mismagius restored Dusk Stone',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [species,item,mega] of [['Mismagius','Mismagiusite',null],['Mismagius','Dusk Stone','Mismagius-Mega'],['Gardevoir','Dusk Stone','Gardevoir-Void-Mega'],['Gardevoir','Mismagiusite',null]])it(species+' with '+item,()=>{
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,item,ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');const p=battle.p1.active[0];assert.equal(battle.actions.canMegaEvo(p)||null,mega);if(mega){assert(battle.actions.runMegaEvo(p));assert.equal(p.species.name,mega);}
 });
 it('validates Dusk Stone and preserves ordinary evolution items',()=>{
  const v=TeamValidator.get('gen9nofieldsinglesgame'),set={species:'Mismagius-Mega',ability:'Void Craft',moves:['shadowball'],item:'Dusk Stone'};
  assert.equal(v.validateTeam([{...set}]),null);assert(v.validateForme({...set,item:'Mismagiusite'}).length);assert.deepEqual(v.validateForme({...set}),[]);
  for(const s of ['mismagius','honchkrow','chandelure','aegislash'])assert.equal(Dex.species.get(s).evoItem,'Dusk Stone',s);
  assert.equal(Dex.items.get('duskstone').megaStone.Mismagius,'Mismagius-Mega');assert.equal(Dex.species.get('mismagiusmega').requiredItem,'Dusk Stone');assert(!Dex.items.get('mismagiusite').exists);
 });
 it('reports deferred saved items without rewriting them',()=>{const set={species:'Mismagius',ability:'Levitate',moves:['shadowball'],item:'Mismagiusite'};const result=TeamValidator.get('gen9nofieldsinglesgame').validateTeam([set]);assert(result.some(s=>s.includes('Mismagiusite is deferred')&&s.includes('Dusk Stone')));assert.equal(set.item,'Mismagiusite');});
 it('calculator accepts Dusk Stone and explains deferred Mismagiusite',()=>{const {validateScenario}=require('../../../dist/sim/custom-calculator');const input={format:'gen9nofieldsinglesgame',move:'shadowball',actors:[{species:'Mismagius-Mega',ability:'Void Craft',item:'Dusk Stone'},{species:'Mew',ability:'No Ability'},{species:'Mew',ability:'No Ability'},{species:'Mew',ability:'No Ability'}]};assert.equal(validateScenario(input).actors[0].set.item,'Dusk Stone');input.actors[0].item='Mismagiusite';assert.throws(()=>validateScenario(input),/Mismagiusite is deferred.*Dusk Stone/);});
});
