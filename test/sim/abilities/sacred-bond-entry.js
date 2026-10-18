'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Sacred Bond entry and Intimidate identity',()=>{
 let battle;afterEach(()=>battle?.destroy());
 for(const [ability,stage]of [['No Ability',-1],['Inner Focus',0],['Clear Body',0],['Guard Dog',1]]){
  it(`respects ${ability} on entry, re-entry, and no duplicate startup`,()=>{
   battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Arcanine-Battle-Bond',ability:'Sacred Bond',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability,moves:['splash']}]]);
   battle.makeChoices('team 12','team 1');const dog=battle.p1.active[0],foe=battle.p2.active[0];
   assert.equal(foe.boosts.atk,stage,battle.log.join('\n'));
   battle.singleEvent('Start',dog.getAbility(),dog.abilityState,dog);
   assert.equal(foe.boosts.atk,stage,'startup must not duplicate Intimidate');
   battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');
   assert.equal(foe.boosts.atk,stage*2,battle.log.join('\n'));
  });
  it(`respects ${ability} when transforming with a surviving adjacent foe`,()=>{
   battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[{species:'Arcanine-Alt',ability:'Battle Bond',moves:['sacredfire']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',level:1,ability:'No Ability',moves:['splash']},{species:'Mew',ability,moves:['splash']}]]);
   battle.makeChoices('team 12','team 12');battle.p2.active[0].hp=1;
   battle.makeChoices('move sacredfire 1, move splash','move splash, move splash');
   assert.equal(battle.p1.active[0].ability,'sacredbond');assert.equal(battle.p2.active[1].boosts.atk,stage,battle.log.join('\n'));
  });
  it(`respects ${ability} on the pending replacement after a transformation KO`,()=>{
   battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Arcanine-Alt',ability:'Battle Bond',moves:['sacredfire']}],[{species:'Mew',level:1,ability:'No Ability',moves:['splash']},{species:'Mew',ability,moves:['splash']}]]);
   battle.makeChoices('team 1','team 12');battle.p2.active[0].hp=1;
   battle.makeChoices('move sacredfire','move splash');battle.makeChoices('','switch 2');
   assert.equal(battle.p2.active[0].boosts.atk,stage,battle.log.join('\n'));
   assert(!battle.p1.active[0].abilityState.sacredBondPendingIntimidate);
  });
 }
});
