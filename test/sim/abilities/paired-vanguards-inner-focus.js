'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim');
describe('Paired Inner Focus Vanguards',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 for(const [ability,entry,stat]of [['Unova Vanguard','Violent Rush','atk'],['Hisuian Vanguard','Rapid Response','spa']]){
  function setup(){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash','tackle']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Arcanine',ability:'Intimidate',moves:['splash','gust','fakeout']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 12','team 12');return [battle.p1.active[0],battle.p2.active[0]];}
  it(ability+' protects from Intimidate and flinch, but suppression disables protection',()=>{const[p,t]=setup();assert.equal(p.boosts.atk,0);assert.equal(p.addVolatile('flinch',t),null);p.addVolatile('gastroacid');assert(p.addVolatile('flinch',t));battle.boost({atk:-1},p,t,Dex.abilities.get('Intimidate'));assert.equal(p.boosts.atk,-1);});
  it(ability+' retains its entry multipliers and loses them at the original time',()=>{const[p]=setup();const a=Dex.abilities.get(ability),base=Dex.abilities.get(entry),calls=[];const context={dex:Dex,chainModify:x=>{calls.push(x);return x;}};for(const turns of [0,1,2]){p.activeTurns=turns;for(const key of ['onModifySpe',stat==='atk'?'onModifyAtk':'onModifySpA'])assert.equal(a[key].call(context,100,p),base[key].call(context,100,p));}assert.deepEqual(calls,[1.5,1.5,1.2,1.2,1.5,1.5,1.2,1.2]);});
  it(ability+' no longer absorbs wind, grows in Strong Winds or reacts to Tailwind',()=>{const[p,t]=setup();const hp=p.hp;const m=battle.dex.getActiveMove('gust');m.accuracy=true;m.willCrit=false;battle.actions.useMove(m,t,{target:p});assert(p.hp<hp);assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spa,0);p.side.addSideCondition('tailwind',p);battle.field.setWeather('deltastream',t);battle.makeChoices('move splash','move splash');assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spa,0);const a=Dex.abilities.get(ability);for(const key of ['onTryHit','onResidual','onSideConditionStart'])assert.equal(a[key],undefined);assert(p.hasAbility('innerfocus'));assert(!p.hasAbility('windpower'));assert(!p.hasAbility('windrider'));});
 }
 it('replaces only Noivern slot 1 and preserves Mega and other options',()=>{assert.deepEqual(Dex.species.get('Noivern').abilities,{0:'Dragonize',1:'Infiltrator',H:'Echo Fiend'});assert.equal(Dex.species.get('Noivern-Mega').abilities[0],'Echo Sense');});
});

