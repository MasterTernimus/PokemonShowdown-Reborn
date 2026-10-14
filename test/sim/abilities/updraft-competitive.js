'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Full Competitive in Updraft and Storm Sovereign',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const ability of ['Updraft','Storm Sovereign'])for(const mode of ['opponent','ally','suppressed','chessboard','chessboard-suppressed'])it(ability+' '+mode,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['airslash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');const p=battle.p1.active[0],q=battle.p2.active[0];
  if(mode.includes('suppressed'))p.addVolatile('gastroacid');if(mode.includes('chessboard'))battle.field.terrain='chessboardterrain';
  battle.boost({atk:-1},p,mode==='ally'?p:q,Dex.moves.get('confide'));assert.equal(p.boosts.spa,mode==='opponent'?2:0);
  p.hp=p.baseMaxhp/5;assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('airslash'),100),mode==='chessboard'?200:100);
 });
 it('retains the separate native passives',()=>{assert.deepEqual(Dex.species.get('pidgeot').passives,['bigpecks']);assert.deepEqual(Dex.species.get('pidgeotmega').passives,['noguard']);});
});
