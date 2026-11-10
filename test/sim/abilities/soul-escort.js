'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Dusknoir passive replacement',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 it('uses Pressure with Frisk in the freed slot; Mega retains Unaware',()=>{
  assert.deepEqual(Dex.species.get('dusknoir').passives,['pressure']);
  assert.equal(Dex.species.get('dusknoir').abilities[1],'Frisk');
  assert.deepEqual(Dex.species.get('dusknoirmega').passives,['unaware']);
 });
 it('fainting no longer gives its replacement hazard immunity or creates Haunted Field',()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dusknoir',ability:'Requiem',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);
  battle.makeChoices('team 12','team 1');const p=battle.p1.active[0],reserve=battle.p1.pokemon[1];
  p.side.addSideCondition('stealthrock',battle.p2.active[0]);p.faint();battle.faintMessages();
  assert(!p.side.slotConditions[0].soulescort);assert.equal(battle.field.terrain,'');
  const hp=reserve.hp;battle.actions.switchIn(reserve, 0);battle.actions.runSwitch(reserve);assert(reserve.hp<hp);
 });
});
