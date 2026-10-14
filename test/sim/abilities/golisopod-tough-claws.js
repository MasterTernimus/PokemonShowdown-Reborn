'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
describe('Base Golisopod Tough Claws passive',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('replaces base Defiant while preserving Mega and Aevian forms',()=>{
  assert.deepEqual(Dex.species.get('golisopod').passives,['toughclaws']);
  assert.deepEqual(Dex.species.get('golisopodmega').passives,['waterveil']);
  for(const s of Dex.species.all().filter(s=>s.id.startsWith('golisopod')&&s.id.includes('aev')))assert(!s.passives?.includes('toughclaws'));
 });
 for(const mode of ['contact','noncontact','suppressed','active-duplicate','bypass'])it(mode,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Golisopod',ability:mode==='active-duplicate'?'Tough Claws':'No Ability',moves:['tackle']}],[{species:'Mew',ability:'No Ability',moves:['splash'] }]]);
  battle.makeChoices('team 1','team 1');const p=battle.p1.active[0],q=battle.p2.active[0];
  if(mode==='suppressed')p.addVolatile('gastroacid',q);
  const move=Dex.getActiveMove(mode==='noncontact'?'swift':'tackle');if(mode==='bypass')move.ignoreAbility=true;
  assert.equal(battle.runEvent('BasePower',p,q,move,100),mode==='noncontact'?100:130);
  assert.equal(p.boosts.atk,0);
 });
 it('Rock Blast is already a physical bullet move',()=>{const m=Dex.moves.get('rockblast');assert.equal(m.category,'Physical');assert.equal(m.flags.bullet,1);});
});
