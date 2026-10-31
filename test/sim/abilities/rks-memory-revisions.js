'use strict';
const assert=require('assert').strict, common=require('../../common'), {Dex}=require('../../../dist/sim');
describe('Revised single Memory effects',()=>{
 let battle;
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(item){battle=common.createBattle({},[[{species:'Silvally',ability:'RKS System',item,moves:['tackle','tailwind','flamethrower']}],[{species:'Mew',ability:'No Ability',moves:['splash','ember','gust','earthquake']}]]);if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';return [battle.p1.active[0],battle.p2.active[0]];}
 it('Fire absorbs Fire and retains its charged damage boost',()=>{const[p,q]=setup('Fire Memory');const hp=p.hp;battle.actions.useMove('ember',q,{target:p});assert.equal(p.hp,hp);assert(p.volatiles.flashfire);assert(p.hasAbility('flashfire'));assert(!p.hasAbility('soulfire'));assert.equal(battle.runEvent('ModifySpA',p,q,Dex.getActiveMove('flamethrower'),100),150);});
 it('Ghost bypasses Substitute and screens',()=>{const[p,q]=setup('Ghost Memory');const move=Dex.getActiveMove('tackle');battle.runEvent('ModifyMove',p,q,move,move);assert(move.infiltrates);assert(!p.hasAbility('soulfire'));});
 it('Flying blocks wind attacks and responds when Tailwind starts',()=>{const[p,q]=setup('Flying Memory');const hp=p.hp;battle.actions.useMove('gust',q,{target:p});assert.equal(p.hp,hp);assert.equal(p.boosts.atk,1);battle.actions.useMove('tailwind',p);assert.equal(p.boosts.atk,2);assert(!p.hasAbility('galewings'));});
 it('Ground absorbs Ground attacks to recover HP',()=>{const[p,q]=setup('Ground Memory');p.hp=100;const hp=p.hp;battle.actions.useMove('earthquake',q,{target:p});assert.equal(p.hp,hp+Math.floor(p.baseMaxhp/4));assert(!p.hasAbility('sandrush'));});
 it('Ice gains Attack from Fire hits and cannot be burned',()=>{const[p,q]=setup('Ice Memory');battle.actions.useMove('ember',q,{target:p});assert.equal(p.boosts.atk,1);assert.equal(p.trySetStatus('brn',q,Dex.moves.get('willowisp')),false);assert(!p.hasAbility('icebody'));});
 it('Electric absorbs Electric hits and raises Sp. Atk',()=>{const[p,q]=setup('Electric Memory');const hp=p.hp;battle.actions.useMove('thunderbolt',q,{target:p});assert.equal(p.hp,hp);assert.equal(p.boosts.spa,1);assert(p.hasAbility('lightningrod'));assert(!p.hasAbility('transistor'));});
 it('Fairy starts Misty Terrain through RKS System',()=>{const[p]=setup('Fairy Memory');const ability=Dex.abilities.get('rkssystem');battle.singleEvent('Start',ability,p.abilityState,p);assert.equal(battle.field.terrain,'mistyterrain');assert(p.hasAbility('mistysurge'));assert(!p.hasAbility('invigorate'));});

});
