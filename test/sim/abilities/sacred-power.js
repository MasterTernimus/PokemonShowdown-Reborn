'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Noctowl and Sacred Power',function(){
 afterEach(()=>battle?.destroy());
 it('Mega Evolves with the requested stats and combines all three abilities',function(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Noctowl',item:'Noctowlite',ability:'Duskilate',moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');
  const mon=battle.p1.active[0],foe=battle.p2.active[0];
  assert.deepEqual(mon.species.baseStats,{hp:100,atk:50,def:78,spa:96,spd:106,spe:80});
  assert.equal(mon.canMegaEvo,'Noctowl-Mega');
  battle.makeChoices('move splash mega','move splash');
  assert.equal(mon.ability,'sacredpower');
  assert.deepEqual(mon.species.baseStats,{hp:100,atk:55,def:98,spa:106,spd:141,spe:110});
  assert.deepEqual(mon.getTypes(),['Dark','Flying']);
  for(const id of ['duskilate','adaptability','magicguard'])assert(mon.hasAbility(id));
  let move=battle.dex.getActiveMove('hypervoice');
  battle.singleEvent('ModifyType',mon.getAbility(),mon.abilityState,move,mon);
  assert.equal(move.type,'Dark');
  assert.equal(battle.runEvent('BasePower',mon,foe,move,100),130);
  assert.equal(battle.runEvent('ModifySTAB',mon,foe,move,1.5),2);
  const hp=mon.hp;
  battle.damage(30,mon,mon,battle.dex.conditions.get('brn'));
  assert.equal(mon.hp,hp);
  battle.damage(30,mon,foe,battle.dex.getActiveMove('psychic'));
  assert.equal(mon.hp,hp-30);
  battle.field.setTerrain('holyterrain',mon);
  move=battle.dex.getActiveMove('hypervoice');
  battle.singleEvent('ModifyType',mon.getAbility(),mon.abilityState,move,mon);
  assert.equal(move.type,'Fairy');
  // Duskilate's 1.5x and Holy Field's special Fairy 1.5x both apply.
  assert.equal(battle.runEvent('BasePower',mon,foe,move,100),225);
  battle.field.setTerrain('fairytaleterrain',mon);
  battle.singleEvent('Start',mon.getAbility(),mon.abilityState,mon);
  assert.statStage(mon,'spd',1);
 });
});
