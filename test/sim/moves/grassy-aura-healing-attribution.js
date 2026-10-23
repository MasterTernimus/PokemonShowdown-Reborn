'use strict';
const assert = require('assert').strict;
const { Battle, Dex } = require('../../../dist/sim');

describe('Grassy Aura healing attribution', () => {
 let battle;
 function setup(item = '') {
  battle = new Battle({formatid:'gen9nofieldsinglesgame',seed:[1,2,3,4],
   p1:{team:[{species:'Mew',ability:'No Ability',item,moves:['splash']}]},
   p2:{team:[{species:'Mew',ability:'No Ability',moves:['splash']}]}});
  if(battle.requestState==='teampreview')battle.makeChoices('team 1','team 1');
  battle.field.startTerrain('factoryterrain');
  const p=battle.p1.active[0];p.hp=128;p.maxhp=p.baseMaxhp=256;
  return p;
 }
 const heals = () => battle.log.filter(line => line.startsWith('|-heal|p1a:'));
 afterEach(() => {battle?.destroy();battle=null;});
 it('labels actual end-turn healing Grassy Aura without changing the amount or timing', () => {
  const p=setup();battle.field.setAura('grassyterrain',5,p);
  const events=[];const runEvent=battle.runEvent;
  battle.runEvent=function(event,target,source,effect,...args) {
   if(target===p&&['TryHeal','ResidualHeal','Heal'].includes(event)&&effect?.id==='terrainaura')events.push([event,effect]);
   return runEvent.call(this,event,target,source,effect,...args);
  };
  battle.makeChoices('move splash','move splash');
  assert.equal(p.hp,144);assert.equal(battle.field.auraTurns,4);
  assert.equal(heals().length,2);
  assert(heals().every(line=>line.endsWith('|[from] Grassy Aura')));
  assert(!heals().some(line=>line.includes('Terrain Aura')));
  assert.deepEqual(events.map(([event])=>event),['TryHeal','ResidualHeal','Heal']);
  assert(events.every(([,effect])=>effect===Dex.conditions.get('terrainaura')));
  assert.equal(Dex.conditions.get('terrainaura').name,'Terrain Aura');
 });
 for(const state of ['airborne','semi-invulnerable','heal-blocked'])it('preserves healing eligibility: '+state,()=>{
  const p=setup();battle.field.setAura('grassyterrain',5,p);
  if(state==='airborne')p.setType('Flying');
  if(state==='semi-invulnerable')p.addVolatile('fly',p);
  if(state==='heal-blocked')p.addVolatile('healblock',p);
  battle.fieldEvent('Residual');
  assert.equal(p.hp,128);assert.equal(heals().length,0);
 });
 it('retains the original source if a nested heal hook replaces the Aura',()=>{
  const p=setup();battle.field.setAura('grassyterrain',5,p);
  const runEvent=battle.runEvent;
  battle.runEvent=function(event,target,source,effect,...args) {
   if(event==='TryHeal'&&effect?.id==='terrainaura')battle.field.setAura('electricterrain',5,p);
   return runEvent.call(this,event,target,source,effect,...args);
  };
  battle.heal(16,p,p,Dex.conditions.get('terrainaura'));
  assert.equal(p.hp,144);assert.equal(battle.field.auraField,'electricterrain');
  assert(heals().every(line=>line.endsWith('|[from] Grassy Aura')));
 });
 it('does not rename ordinary Grassy Terrain healing',()=>{
  const p=setup();battle.field.setFieldOrAura('grassyterrain',5,p,null,true);
  battle.fieldEvent('Residual');
  assert.equal(p.hp,144);
  assert(heals().every(line=>line.includes('[from] Grassy Terrain')));
  assert(!heals().some(line=>line.includes('Grassy Aura')));
 });
 for(const aura of ['electricterrain','mistyterrain','psychicterrain','rainbowterrain','frozenaura'])it('does not rename another Aura or item healing: '+aura,()=>{
  const p=setup('leftovers');assert(battle.field.setAura(aura,5,p));
  battle.fieldEvent('Residual');
  assert.equal(p.hp,144);
  assert(heals().every(line=>line.endsWith('|[from] item: Leftovers')));
  const count=heals().length;
  battle.heal(16,p,p,Dex.conditions.get('terrainaura'));
  assert.equal(p.hp,160);
  assert(heals().slice(count).every(line=>line.endsWith('|[from] Terrain Aura')));
 });
 it('does not rename item healing while Grassy Aura is active',()=>{
  const p=setup('leftovers');battle.field.setAura('grassyterrain',5,p);
  battle.fieldEvent('Residual');
  assert.equal(p.hp,160);
  assert(heals().some(line=>line.endsWith('|[from] Grassy Aura')));
  assert(heals().some(line=>line.endsWith('|[from] item: Leftovers')));
 });
});
