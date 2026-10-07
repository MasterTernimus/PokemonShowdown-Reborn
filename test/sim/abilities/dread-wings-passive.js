'use strict';
const assert=require('assert').strict,fs=require('fs'),common=require('../../common');
const {Dex}=require('../../../dist/sim');let battle;const fixtures=[];
function setup(foeAbility='Pressure',foe='Mew',ability='Dread Wings'){
 const mon=(species,ability)=>({species,ability,moves:['splash','darkpulse','skillswap','roleplay']});
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon('Hydreigon',ability),mon('Mew','Pressure')],[mon(foe,foeAbility),mon('Chansey','Pressure')]]);
 battle.makeChoices('team 12','team 12');battle.field.terrain='';battle.debugMode=false;return[battle.p1.active[0],battle.p2.active[0]];
}
describe('Hydreigon innate Levitate and revised Dread Wings',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 after(()=>{const {extractChannelMessages}=require('../../../dist/sim/battle');fs.writeFileSync('artifacts/dread-wings-protocol-fixtures.json',JSON.stringify(fixtures.map(f=>({...f,log:extractChannelMessages(f.log.join('\n'),[0])[0]})),null,2)+'\n');});
 it('replaces only Levitate in Dread Wings, keeps all three selected slots and excludes combat variants',()=>{
  const{AbilityComponents}=require('../../../dist/data/ability-components');assert.deepEqual(AbilityComponents.dreadwings,['intimidate','unnerve']);
  assert.deepEqual(Object.values(Dex.species.get('hydreigon').abilities),['Dread Wings','Dark Dominion','Void Tyrant']);assert.deepEqual(Dex.species.get('hydreigon').passives,['levitate']);
  for(const s of Dex.species.all().filter(s=>s.id.startsWith('hydreigon')&&s.id!=='hydreigon'))assert.deepEqual(s.passives,[],s.id);
 });
 it('runs Intimidate and full Unnerve once each per entry, without overwriting the selected ability in protocol',()=>{
  const[p,t]=setup();assert.equal(t.boosts.atk,-1);assert.equal(battle.runEvent('TryEatItem',t),false);assert.equal(battle.runEvent('UseItem',t,null,null,Dex.items.get('magicalseed')),false);
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(t.boosts.atk,-1);
  assert.equal(battle.log.filter(l=>l.includes('[component] Intimidate')).length,1);assert.equal(battle.log.filter(l=>l.includes('[component] Unnerve')).length,1);
  assert(!battle.log.some(l=>/\|-ability\|p1a:.*\|(Intimidate|Unnerve)(\||$)/.test(l)));
  assert(!p.runImmunity('Ground',true));fixtures.push({name:'dread-wings-components',log:battle.log.slice()});
  p.addVolatile('gastroacid');assert.notEqual(battle.runEvent('TryEatItem',t),false);assert(!p.isGrounded());
 });
 for(const [ability,species]of [['Inner Focus','Mew'],['Clear Body','Mew'],['No Ability','Kingler']])it('honors '+ability+' / '+species+' Intimidate protection',()=>{const[,t]=setup(ability,species);assert.equal(t.boosts.atk,0);});
 it('preserves Unnerve Cold Eclipse entry slowdown and avoids replaying entry effects',()=>{
  const[p,t]=setup();battle.field.setTerrain('coldeclipseterrain',t);battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert.equal(t.boosts.atk,-2);assert.equal(t.boosts.spe,-1);
  battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(t.boosts.atk,-2);assert.equal(t.boosts.spe,-1);
 });
 it('applies Torment only after Dark Pulse damages a surviving foe and stops under suppression',()=>{
  const[p,t]=setup();assert(!t.volatiles.torment);const pulse=battle.dex.getActiveMove('darkpulse');pulse.basePower=1;
  battle.actions.useMove(pulse,p,{target:t});assert(t.volatiles.torment);t.removeVolatile('torment');p.addVolatile('gastroacid');battle.actions.useMove(pulse,p,{target:t});assert(!t.volatiles.torment);
  p.removeVolatile('gastroacid');battle.actions.useMove('tackle',p,{target:t});assert(!t.volatiles.torment);
 });
 it('Skill Swap and Role Play transfer the selected package without moving innate Levitate',()=>{
  const[p,t]=setup();battle.actions.useMove('skillswap',p,{target:t});assert.equal(t.ability,'dreadwings');assert.equal(p.ability,'pressure');assert.deepEqual(p.getPassives(),['levitate']);assert.deepEqual(t.getPassives(),[]);assert(t.isGrounded());assert.equal(p.boosts.atk,-1);
  battle.actions.useMove('roleplay',p,{target:t});assert.equal(p.ability,'dreadwings');assert.deepEqual(p.getPassives(),['levitate']);
  fixtures.push({name:'dread-wings-swapped',log:battle.log.slice()});
 });
 it('copied Dread Wings has no copied Levitate and respects suppression',()=>{
  const[p,t]=setup('Perfect Foresight');t.m.perfectForesightAbility='dreadwings';t.m.perfectForesightAbilityState=battle.initEffectState({id:'dreadwings',target:t});
  delete t.abilityState.intimidateActivated;battle.singleEvent('Start',Dex.abilities.get('dreadwings'),t.m.perfectForesightAbilityState,t);
  assert.deepEqual(t.getPassives(),[]);assert(t.isGrounded());assert(t.hasAbility('intimidate'));assert(!t.hasAbility('levitate'));
  t.addVolatile('gastroacid');assert(!t.hasAbility('intimidate'));assert(!p.isGrounded());
  fixtures.push({name:'dread-wings-copied',log:battle.log.slice()});
 });
 it('Dark Dominion and Void Tyrant keep their identities while the species supplies Levitate',()=>{
  const[p,t]=setup();for(const ability of ['Dark Dominion','Void Tyrant']){p.setAbility(ability);assert.equal(p.ability,Dex.toID(ability));p.addVolatile('gastroacid');assert(!p.isGrounded());p.removeVolatile('gastroacid');}
  t.setAbility('Mold Breaker');const move=battle.dex.getActiveMove('earthquake');move.basePower=1;const hp=p.hp;battle.actions.useMove(move,t,{target:p});assert(p.hp<hp);battle.clearActiveMove();assert(!p.isGrounded());
 });
});
