'use strict';
const assert=require('../../assert'),common=require('../../common');
let battle;
describe('Gardevoir-Void and Royal Voice',function(){
 afterEach(()=>battle?.destroy());
 it('uses normal Gardevoir mechanics and Mega Evolves with Dream Sickness in Royal Voice',function(){
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Gardevoir-Void',ability:'Void Veil',item:'Gardevoirite',moves:['splash']}],[{species:'Mew',ability:'Synchronize',moves:['splash']}]]);
  battle.makeChoices('team 1','team 1');
  const mon=battle.p1.active[0],foe=battle.p2.active[0];
  assert.equal(mon.species.name,'Gardevoir-Void');
  assert.deepEqual(mon.species.baseStats,battle.dex.species.get('Gardevoir').baseStats);
  assert.deepEqual(mon.species.abilities,{0:'Trace',1:'Dream Sickness',H:'Void Veil'});
  assert.equal(mon.canMegaEvo,'Gardevoir-Mega');
  battle.makeChoices('move splash mega','move splash');
  assert.equal(mon.ability,'royalvoice');assert(mon.hasAbility('dreamsickness'));
  const move=battle.dex.getActiveMove('hypervoice');
  battle.singleEvent('ModifyType',mon.getAbility(),mon.abilityState,move,mon);
  assert.equal(move.type,'Fairy');assert.equal(battle.runEvent('BasePower',mon,foe,move,100),120);
  battle.boost({atk:-1,spe:-1},mon,foe,battle.dex.getActiveMove('growl'));
  assert.statStage(mon,'atk',0);assert.statStage(mon,'spe',0);
  mon.hp-=100;const hp=mon.hp;
  battle.singleEvent('Residual',mon.getAbility(),mon.abilityState,mon);
  assert(mon.hp>hp);
  battle.field.setTerrain('psychicterrain',mon);
  assert.equal(battle.runEvent('ModifySpe',mon,null,null,100),200);
 });
});
