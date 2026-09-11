'use strict';
const assert=require('../../assert'),common=require('../../common');
let battle;
describe('Silvally Mimicry',function(){
 afterEach(()=>battle?.destroy());
 it('follows field changes despite holding a different Memory and returns to Normal without a field',function(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Silvally-Fire',item:'Fire Memory',ability:'Mimicry',moves:['splash']}],[{species:'Mew',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');
  const mon=battle.p1.active[0];
  for(const [field,type] of [['electricterrain','Electric'],['grassyterrain','Grass'],['mistyterrain','Fairy'],['psychicterrain','Psychic'],['burningterrain','Fire'],['watersurfaceterrain','Water'],['hauntedterrain','Ghost'],['glitchterrain','???']]){
   battle.field.setTerrain(field,mon);assert.deepEqual(mon.getTypes(),[type]);assert.equal(mon.item,'firememory');
  }
  for(let i=0; i<20 && battle.field.terrain; i++) battle.field.clearTerrain();assert.deepEqual(mon.getTypes(),['Normal']);
  assert.equal(mon.setType('Water'),false,'Other type changes remain blocked');
 });
});

