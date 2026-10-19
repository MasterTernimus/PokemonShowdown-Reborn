'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Four additional selective reductions',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability,gameType='singles'){
  const mon={species:'Mew',ability:'No Ability',moves:['splash','magneticflux','helpinghand','tackle']};
  battle=common.createBattle({gameType},[[{...mon,ability},{...mon}],[{...mon},{...mon}]]);
  for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=4000;
  return[battle.p1.active[0],battle.p2.active[0],battle.p1.active[1]];
 }
 function use(p,q,id,extra={}){battle.clearActiveMove();battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra),p,{target:q});}
 function modify(p,q,id){const m=Dex.getActiveMove(id);battle.runEvent('ModifyMove',p,q,m,m);return m;}
 function incoming(p,q,typeMod=0,type='Normal'){const m=Dex.getActiveMove('tackle');m.type=type;p.getMoveHitData(m).typeMod=typeMod;return battle.runEvent('ModifyDamage',q,p,m,100);}

 for(const species of ['Corsola','Corsola-Reborn'])it(species+' loses Sturdy and has passive Natural Recovery',()=>{const[p,q]=setup('Withering Shell');p.formeChange(species,null,true);p.setAbility('Withering Shell');p.hp=p.maxhp=p.baseMaxhp=3000;assert(p.getPassives().includes('naturalrecovery'));const m=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('Damage',p,q,m,4000),4000);assert.notEqual(battle.runEvent('TryHit',p,q,Object.assign(Dex.getActiveMove('fissure'),{ohko:true})),null);p.hp=1000;p.setStatus('psn');battle.runEvent('SwitchOut',p);assert.equal(p.hp,3000);assert.equal(p.status,'');use(q,p,'tackle',{damage:10});assert(q.side.sideConditions.stealthrock);});
 it('Relic Instinct never emergency-heals or cleanses negative stages, retaining both modes',()=>{const[p,q]=setup('Relic Instinct');p.hp=800;p.boosts.atk=-2;battle.runEvent('Update',p);battle.runEvent('AfterDamageApplied',p,q,Dex.getActiveMove('tackle'),1);assert.equal(p.hp,800);assert.equal(p.boosts.atk,-2);assert(!p.m.relicInstinctSpent);assert.equal(incoming(p,q),75);assert.equal(battle.runEvent('ModifyAtk',p,null,null,100),50);battle.runEvent('Residual',p);assert.equal(p.hp,1050);p.hp=4000;assert(modify(p,q,'tackle').ignoreAbility);assert.equal(incoming(p,q),100);});
 it('Primeval Hunt keeps local Skill Link/Own Tempo without final-hit guaranteed crit',()=>{const[p,q]=setup('Primeval Hunt');const m=modify(p,q,'bulletseed');assert.equal(m.multihit,5);m.hit=m.multihit;assert.equal(battle.runEvent('ModifyCritRatio',p,q,m,1),1);assert(!p.addVolatile('confusion',q));assert(p.hasAbility('skilllink'));assert(p.hasAbility('owntempo'));});
 it('Double Strike retains threshold and multihits without punching multiplier',()=>{const[p,q]=setup('Double Strike');const m=Dex.getActiveMove('machpunch');assert.equal(battle.runEvent('BasePower',p,q,m,40),60);assert.equal(battle.runEvent('BasePower',p,q,m,75),75);battle.field.terrain='factoryterrain';assert.equal(battle.runEvent('BasePower',p,q,m,75),112);assert.equal(modify(p,q,'bulletseed').multihit,5);});
});
