'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
const {AbilityComponents}=require('../../../dist/data/ability-components');
describe('Approved Mega Zangoose Battle Armor removal',()=>{
 let b;afterEach(()=>b?.destroy());
 function setup(species='Zangoose-Mega',ability='Toxic Armor'){b=common.createBattle({gameType:'singles'},[[{species,ability,moves:['metalclaw','quickattack','swordsdance']}],[{species:'Mew',ability:'No Ability',moves:['tackle','growl']}]]);return[b.p1.active[0],b.p2.active[0]];}
 it('removes the inherited component and every Battle Armor callback from Toxic Armor only',()=>{
  const a=Dex.abilities.get('toxicarmor');for(const key of ['onCriticalHit','onSourceModifyDamage','onStart','onAfterEachBoost'])assert.equal(a[key],undefined,key);
  assert.deepEqual(AbilityComponents.toxicarmor,['dualwield','violentrush']);assert(AbilityComponents.venomarmor.includes('battlearmor'));assert.equal(Dex.abilities.get('venomarmor').onCriticalHit,false);assert(!a.desc.includes('Venom Armor'));
 });
 it('allows critical hits and takes unreduced damage; base Venom Armor retains both protections',()=>{
  const[p,q]=setup();const m=Dex.getActiveMove('tackle');assert.equal(b.runEvent('CriticalHit',p,q,m),true);assert.equal(b.runEvent('ModifyDamage',q,p,m,100),100);
  p.setAbility('Venom Armor',p,null,true);assert.equal(b.runEvent('CriticalHit',p,q,m),false);assert.equal(b.runEvent('ModifyDamage',q,p,m,100),80);
 });
 it('does not gain Fairy Tale entry Defense or reactive Defense after opposing stat drops',()=>{
  const[p,q]=setup();b.field.terrain='fairytaleterrain';b.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(p.boosts.def,0);b.boost({atk:-1},p,q,Dex.moves.get('growl'));assert.equal(p.boosts.def,0);
 });
 it('preserves Dual Wield, both 60%-power Metal Claw hits, opening rush and passive healing',()=>{
  const[p,q]=setup();const m=Dex.getActiveMove('metalclaw');b.runEvent('ModifyMove',p,q,m,m);assert.equal(m.multihit,2);assert.equal(m.multihitType,'dualwield');for(const hit of [1,2]){m.hit=hit;assert.equal(b.runEvent('BasePower',p,q,m,100),60);}p.activeTurns=1;assert.equal(b.runEvent('ModifyAtk',p,q,m,100),120);assert.equal(b.runEvent('ModifySpe',p,null,null,100),150);p.activeTurns=2;assert.equal(b.runEvent('ModifyAtk',p,q,m,100),100);assert.equal(b.runEvent('ModifySpe',p,null,null,100),100);assert.deepEqual(p.getPassives(),['rivalresolve']);assert.equal(p.status,'psn');p.hp=100;p.baseMaxhp=800;b.runEvent('Damage',p,p,Dex.conditions.get('psn'),50);assert.equal(p.hp,200);
 });
 it('preserves legitimate pre-Mega stat boosts without retaining Venom Armor callbacks',()=>{
  const[p,q]=setup('Zangoose','Venom Armor');p.setItem('Zangoosite');p.canMegaEvo='Zangoose-Mega';b.boost({atk:2,def:2},p,p);assert(b.actions.runMegaEvo(p));assert.equal(p.ability,'toxicarmor');assert.equal(p.boosts.atk,2);assert.equal(p.boosts.def,2);assert.equal(b.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),100);b.boost({spe:-1},p,q);assert.equal(p.boosts.def,2);
 });
});
