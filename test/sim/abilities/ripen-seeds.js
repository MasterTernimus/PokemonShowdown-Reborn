'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Ripen held Seeds',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(species='Mew',ability='Ripen',item='Elemental Seed'){
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,item,moves:['splash','seedbomb','leechseed']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);
  b.makeChoices('team 12','team 1');b.randomizer=d=>d;return b.p1.active[0];
 }
 for(const ability of ['Ripen','Evergreen','Soothing Cream'])it('doubles selected/component '+ability+' exactly once on consumption',()=>{
  const p=setup('Mew',ability);assert.equal(p.item,'elementalseed');assert.equal(p.boosts.def,0);
  b.field.setTerrain('grassyterrain',p);assert.equal(p.item,'');assert.equal(p.boosts.def,2);assert(p.volatiles.ingrain);
  b.fieldEvent('TerrainChange');assert.equal(p.boosts.def,2);
 });
 for(const ability of ['No Ability','Ripen','Evergreen'])it('doubles passive Ripen with '+ability+' without stacking under suppression',()=>{
  const p=setup('Tropius',ability);p.addVolatile('gastroacid');b.field.setTerrain('grassyterrain',p);assert.equal(p.boosts.def,2);
 });
 it('does not use suppressed selected Ripen',()=>{const p=setup();p.addVolatile('gastroacid');b.field.setTerrain('grassyterrain',p);assert.equal(p.boosts.def,1);});
 for(const [item,field,stat,amount] of [['Magical Seed','psychicterrain','spa',4],['Synthetic Seed','factoryterrain','spa',2],['Telluric Seed','mountainterrain','atk',4]])it(item+' doubles positive stages and preserves other effects',()=>{
  const p=setup('Mew','Ripen',item);b.field.setTerrain(field,p);assert.equal(p.item,'');assert.equal(p.boosts[stat],amount);
  if(item==='Magical Seed')assert(p.volatiles.confusion);
  if(item==='Synthetic Seed')assert(p.volatiles.laserfocus);
  if(item==='Telluric Seed')assert.equal(p.boosts.accuracy,-1);
 });
 for(const [ability,expected]of [['Simple',4],['Contrary',-2]])it('scales the Seed before '+ability,()=>{
  const p=setup('Tropius',ability);b.field.setTerrain('grassyterrain',p);assert.equal(p.boosts.def,expected);
 });
 it('honors the stage cap and still consumes at activation',()=>{const p=setup();p.boosts.def=5;b.field.setTerrain('grassyterrain',p);assert.equal(p.boosts.def,6);assert.equal(p.item,'');});
 it('activates once on entry to an existing field',()=>{
  const p=setup();b.makeChoices('switch 2','move 1');b.field.setTerrain('grassyterrain',b.p1.active[0]);assert.equal(p.item,'elementalseed');b.makeChoices('switch 2','move 1');assert.equal(p.item,'');assert.equal(p.boosts.def,2);
 });
 it('does not make Aura changes consume Seeds',()=>{const p=setup();b.field.setTerrain('forestterrain',p);b.field.aurasEnabled=true;assert(b.field.setAura('grassyterrain',5,p,Dex.moves.get('grassyterrain')));assert.equal(p.item,'elementalseed');assert.equal(p.boosts.def,0);});
 it('preserves Seed recoil rather than doubling it',()=>{const p=setup('Mew','Ripen','Telluric Seed'),hp=p.hp;b.field.setTerrain('caveterrain',p);assert.equal(p.boosts.def,4);assert.equal(hp-p.hp,Math.floor(p.maxhp/4));});
 it('does not double non-Seed boosts or Seed-named move damage',()=>{
  const p=setup('Mew','Ripen',''),q=b.p2.active[0];b.boost({atk:1},p,p,Dex.moves.get('growth'));assert.equal(p.boosts.atk,1);
  const move=Dex.getActiveMove('seedbomb');move.willCrit=false;const damage=b.actions.getDamage(p,q,move);p.setAbility('No Ability');assert.equal(b.actions.getDamage(p,q,move),damage);
  p.setAbility('Ripen');b.actions.runMove('leechseed',p,p.getLocOf(q));assert(q.volatiles.leechseed);const hp=q.hp;b.fieldEvent('Residual');assert.equal(hp-q.hp,Math.floor(q.baseMaxhp/8));
 });
 it('keeps Berry stat doubling once with selected plus passive Ripen',()=>{const p=setup('Tropius','Ripen','Liechi Berry');p.hp=1;p.eatItem();assert.equal(p.boosts.atk,2);});
});
