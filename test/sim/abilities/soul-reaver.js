'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex, TeamValidator} = require('../../../dist/sim');
let battle;
function setup(mode = '') {
 const set = (species, ability) => ({species, ability, moves: ['shadowball', 'nightshade', 'splash', 'curse']});
 battle = common.createBattle({formatid:'gen9nofieldsinglesgame'}, [[set('Dusknoir','Soul Reaver')], [set('Mew',mode === 'gas' ? 'Neutralizing Gas' : 'No Ability')]]);
 battle.makeChoices('team 1','team 1');
 const p = battle.p1.active[0], q = battle.p2.active[0];
 p.hp = 50; q.hp = q.maxhp = q.baseMaxhp = 500;
 if (mode === 'gastro') p.addVolatile('gastroacid', q);
 return [p,q];
}
describe('Soul Reaver and Alolan Muk approved additions', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const id of ['shadowball','shadowclaw','nightshade','spectralscream']) it('drains actual damage once: '+id, () => {
  const [p,q] = setup(); const old = p.hp;
  const move = Object.assign(Dex.getActiveMove(id), {damage:80, accuracy:true, willCrit:false, secondaries:null});
  battle.actions.useMove(move,p,{target:q});
  assert.equal(500-q.hp,80); assert.equal(p.hp-old,20);
 });
 for (const fraction of [[1,8],[1,4],[1,2],[3,4]]) it('uses maximum native drain '+fraction.join('/'), () => {
  const [p,q] = setup();
  battle.actions.useMove(Object.assign(Dex.getActiveMove('shadowball'), {damage:80,accuracy:true,secondaries:null,drain:fraction}),p,{target:q});
  assert.equal(p.hp-50,Math.max(20,80*fraction[0]/fraction[1]));
 });
 for (const mode of ['normal','gastro','gas','replaced']) it('suppression and ability replacement: '+mode, () => {
  const [p,q] = setup(mode); if (mode === 'replaced') p.setAbility('pressure');
  q.addVolatile('substitute'); const hp=q.hp;
  battle.actions.useMove(Object.assign(Dex.getActiveMove('shadowball'), {damage:80,accuracy:true,secondaries:null}),p,{target:q});
  assert.equal(hp-q.hp,mode === 'normal'?80:0); assert.equal(p.hp-50,mode === 'normal'?20:0);
 });
 it('caps drain to remaining target HP', () => {
  const [p,q]=setup(); q.hp=12;
  battle.actions.useMove(Object.assign(Dex.getActiveMove('shadowball'), {damage:80,accuracy:true,secondaries:null}),p,{target:q});
  assert.equal(p.hp-50,3);
 });
 it('does not drain non-Ghost attacks', () => {
  const [p,q]=setup(); battle.actions.useMove(Object.assign(Dex.getActiveMove('psychic'),{damage:80,accuracy:true,secondaries:null}),p,{target:q}); assert.equal(p.hp,50);
 });
 it('drains each multihit damage exactly once', () => {
  const [p,q]=setup(); battle.actions.useMove(Object.assign(Dex.getActiveMove('shadowball'),{damage:20,multihit:3,accuracy:true,secondaries:null}),p,{target:q}); assert.equal(500-q.hp,60); assert.equal(p.hp-50,15);
 });
 for(const mode of ['protect','miss','immune']) it('no recovery on '+mode,()=>{
  const [p,q]=setup(); if(mode==='protect')q.addVolatile('protect'); if(mode==='immune')q.setType('Normal');
  battle.actions.useMove(Object.assign(Dex.getActiveMove('shadowball'),{damage:80,accuracy:mode==='miss'?0:true,secondaries:null}),p,{target:q}); assert.equal(p.hp,50);assert.equal(q.hp,500);
 });
 it('does not add drain to Curse residual', () => {
  const [p,q]=setup(); const move=Dex.getActiveMove('curse'); battle.runEvent('ModifyMove',p,q,move,move); assert.equal(move.drain,undefined);
  q.addVolatile('curse',p); battle.fieldEvent('Residual'); assert.equal(p.hp,50);
 });
 it('retains complete Infiltrator move flag on status and damaging moves', () => {
  const [p,q]=setup(); for(const id of ['shadowball','toxic','growl']) { const m=Dex.getActiveMove(id); battle.runEvent('ModifyMove',p,q,m,m); assert.equal(m.infiltrates,true); }
 });
 it('preserves Dusknoir other slots, passive and Mega', () => {
  assert.deepEqual(Dex.species.get('dusknoir').abilities,{0:'Requiem',1:'Pressure',H:'Soul Reaver'});
  assert.deepEqual(Dex.species.get('dusknoir').passives,['levitate']);
  assert.deepEqual(Dex.species.get('dusknoirmega').abilities,{0:"Reaper's Grip"});
  assert.equal(Dex.species.get('dusknoiralt').abilities.H,'Soul Reaver');
  assert.deepEqual(Dex.abilities.get('soulreaver').flags,{});
 });
 it('adds Corrosive Strike to Alolan Muk only and validates it', () => {
  assert(Dex.species.getLearnsetData('mukalola').learnset.corrosivestrike);
  assert(Dex.species.getLearnsetData('muk').learnset.corrosivestrike); // Existing distribution remains.
  assert(!Dex.species.getLearnsetData('grimeralola').learnset.corrosivestrike);
  const problems=new TeamValidator('gen9nofieldsinglesgame').validateTeam([{species:'Muk-Alola',ability:'Mold Breaker',moves:['Corrosive Strike'],nature:'Adamant',evs:{hp:252,atk:252,spd:4}}]);
  assert.equal(problems,null,JSON.stringify(problems));
 });
});
