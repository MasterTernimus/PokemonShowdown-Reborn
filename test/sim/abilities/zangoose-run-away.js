'use strict';
const assert=require('assert').strict,common=require('../../common');let battle;
function start(species='Zangoose',ability='Venom Armor'){
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[
 {species:'Mew',ability:'Run Away',moves:['splash']},{species,ability,moves:['splash','tackle']}
 ],[{species:'Mew',ability:'Shadow Tag',moves:['splash']}]]);
 battle.makeChoices('team 12','team 1');return battle.p1.pokemon[1];
}
describe('Regular Zangoose scoped Run Away replacement',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('bypasses entry hazards and their Speed drop, and escapes trapping',()=>{
  const p=start();for(let id of ['spikes','stealthrock','toxicspikes','stickyweb'])battle.p1.addSideCondition(id,battle.p2.active[0]);
  battle.p1.addSideCondition('spikes',battle.p2.active[0]);battle.p1.addSideCondition('spikes',battle.p2.active[0]);
  battle.makeChoices('switch 2','move splash');assert.equal(p.hp,p.maxhp);assert.equal(p.boosts.spe,0);assert(p.hasAbility('runaway'));
  battle.runEvent('TrapPokemon',p);assert(!p.trapped);
  assert(battle.choose('p1','switch 2'));
 });
 for(let [species,ability,protect]of [['Zangoose','Venom Armor',false],['Zangoose-Mega','Toxic Armor',true],['Mew','Venom Armor',true]])it(species+' retains the intended Attack-drop scope',()=>{
  const p=start(species,ability);battle.makeChoices('switch 2','move splash');p.trySetStatus('psn');
  p.boosts.atk=0;const foe=battle.p2.active[0];
  battle.boost({atk:-1},p,foe,battle.dex.abilities.get('intimidate'));
  assert.equal(p.boosts.atk,protect?0:-1);assert.equal(p.hasAbility('runaway'),species==='Zangoose');
 });
});
