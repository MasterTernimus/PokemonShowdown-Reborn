'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Six approved repeatable ability contracts',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability,doubles=false){
  const mon={species:'Mew',ability:'No Ability',moves:['splash','tackle','growl','tailwhip']};
  battle=common.createBattle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},[[{...mon,ability},{...mon}],[{...mon},{...mon}]]);battle.makeChoices('team 12','team 12');
  for(const s of battle.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=10000;
  return[battle.p1.active[0],battle.p2.active[0],battle.p1.active[1]];
 }
 function act(p,q,id,extra={}){battle.clearActiveMove();const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra);if(!p.moveSlots.some(s=>s.id===id))p.moveSlots.push({id,move:m.name,pp:99,maxpp:99,target:m.target,disabled:false,used:false});battle.actions.runMove(m,p,p.getLocOf(q));return m;}
 it('Dissonant Chime repeatedly clears only positive stages on opposing HP hits',()=>{
  const[p,q]=setup('Dissonant Chime');for(let i=0;i<2;i++){q.boosts.atk=2;q.boosts.def=-2;act(p,q,'hypervoice');assert.equal(q.boosts.atk,0);assert.equal(q.boosts.def,-2);}
  const hp=p.hp;act(q,p,'hypervoice');assert.equal(p.hp,hp);
  p.addVolatile('gastroacid');q.boosts.atk=2;act(p,q,'hypervoice');assert.equal(q.boosts.atk,2);
 });
 it('Dissonant Chime ignores allied and blocked hits',()=>{
  const[p,q,ally]=setup('Dissonant Chime',true);ally.boosts.atk=2;act(p,ally,'hypervoice',{target:'normal'});assert.equal(ally.boosts.atk,2);
  q.boosts.atk=2;q.addVolatile('protect');act(p,q,'hypervoice');assert.equal(q.boosts.atk,2);
 });
 it('Disorienting Mind reapplies Torment after it ends and respects immunity and suppression',()=>{
  const[p,q]=setup('Disorienting Mind');for(let i=0;i<2;i++){act(p,q,'psybeam');assert(q.volatiles.torment);q.removeVolatile('torment');}
  q.setType('Dark');act(p,q,'psybeam');assert(!q.volatiles.torment);q.setType('Normal');p.addVolatile('gastroacid');act(p,q,'psybeam');assert(!q.volatiles.torment);
 });
 it('Disorienting Mind retains Infiltrator through Substitute and excludes allies',()=>{
  const[p,q,ally]=setup('Disorienting Mind',true);q.addVolatile('substitute');const hp=q.hp;act(p,q,'psybeam');assert(q.hp<hp);assert(q.volatiles.torment);act(p,ally,'psybeam');assert(!ally.volatiles.torment);
 });
 it('Scale Shelter has no full-HP reduction or stored Quiver Dance wards',()=>{
  const[p,q]=setup('Scale Shelter');const m=Dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyDamage',q,p,m,100),100);
  p.hp--;assert.equal(battle.runEvent('ModifyDamage',q,p,m,100),100);act(p,p,'quiverdance');assert(!p.volatiles.scaleshelterward);assert(!p.volatiles.scaleshelterspent);
  p.hp=p.maxhp;assert.equal(battle.runEvent('ModifyDamage',q,p,m,100),100);p.addVolatile('gastroacid');assert.equal(battle.runEvent('ModifyDamage',q,p,m,100),100);
 });
 it('Scale Shelter retains Overcoat powder and weather protection',()=>{
  const[p,q]=setup('Scale Shelter');act(q,p,'spore');assert.equal(p.status,'');assert.equal(battle.runEvent('Immunity',p,null,null,'sandstorm'),false);assert.equal(battle.runEvent('Immunity',p,null,null,'hail'),false);
 });
 it('Scale Shelter blocks opposing accuracy drops but allows allied changes and suppression',()=>{
  const[p,q,ally]=setup('Scale Shelter',true);
  act(q,p,'sandattack');assert.equal(p.boosts.accuracy,0);
  act(ally,p,'sandattack');assert.equal(p.boosts.accuracy,-1);
  p.addVolatile('gastroacid');act(q,p,'sandattack');assert.equal(p.boosts.accuracy,-2);
 });
 it('Anchored Battery lowers Speed once per complete multihit move, repeatedly',()=>{
  const[p,q]=setup('Anchored Battery');for(let i=1;i<=2;i++){act(p,q,'bulletseed',{multihit:5,basePower:1});assert.equal(q.boosts.spe,-i);}
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('waterpulse'),100),150);
 });
 it('Anchored Battery ignores blocked, ally and Substitute-only hits; normal stat protections remain',()=>{
  const[p,q,ally]=setup('Anchored Battery',true);q.addVolatile('protect');act(p,q,'waterpulse');assert.equal(q.boosts.spe,0);q.removeVolatile('protect');q.addVolatile('substitute');act(p,q,'waterpulse',{basePower:1});assert.equal(q.boosts.spe,0);
  q.removeVolatile('substitute');q.setAbility('Clear Body');act(p,q,'waterpulse');assert.equal(q.boosts.spe,0);act(p,ally,'waterpulse');assert.equal(ally.boosts.spe,0);
 });
 it('Night Watch disables each successful opposing status move without waiting for repetition',()=>{
  const[p,q]=setup('Night Watch');for(const id of ['growl','tailwhip']){act(q,p,id);assert.equal(q.volatiles.disable?.move,id);q.removeVolatile('disable');}
  assert(!p.volatiles.nightwatchstate);
 });
 it('Night Watch ignores opposing self-setup, allied status and blocked status',()=>{
  const[p,q,ally]=setup('Night Watch',true);act(q,q,'swordsdance');assert(!q.volatiles.disable);act(ally,p,'growl');assert(!ally.volatiles.disable);
  p.addVolatile('protect');act(q,p,'tailwhip');assert(!q.volatiles.disable);p.removeVolatile('protect');p.addVolatile('substitute');act(q,p,'tailwhip');assert(!q.volatiles.disable);
 });
 it('Night Watch respects normal Disable protection and avoids response recursion',()=>{
  const[p,q]=setup('Night Watch');q.setAbility('Aroma Veil');act(q,p,'growl');assert(!q.volatiles.disable);q.setAbility('Night Watch');act(q,p,'tailwhip');assert.equal(q.volatiles.disable?.move,'tailwhip');assert(!p.volatiles.disable);assert(battle.log.length<200);
 });
 it('Night Watch retains Insomnia and suppression prevents new responses',()=>{
  const[p,q]=setup('Night Watch');assert(!p.trySetStatus('slp',q));p.addVolatile('gastroacid');act(q,p,'growl');assert(!q.volatiles.disable);
 });
 it('Apex Flytrap repeats and refreshes its short trap without an entry budget',()=>{
  const[p,q]=setup('Apex Flytrap');assert.equal(p.isGrounded(),null);act(q,p,'tackle');assert.equal(q.volatiles.apexflytraptrapped.duration,2);
  q.volatiles.apexflytraptrapped.duration=1;act(q,p,'tackle');assert.equal(q.volatiles.apexflytraptrapped.duration,2);q.removeVolatile('apexflytraptrapped');act(q,p,'tackle');assert(q.volatiles.apexflytraptrapped);assert.equal(p.m.apexFlytrapUsed,undefined);
 });
 it('Apex Flytrap ignores Ghosts, noncontact, Substitute-only damage, and suppressed triggers',()=>{
  const[p,q]=setup('Apex Flytrap');q.setType('Ghost');act(q,p,'tackle');assert(!q.volatiles.apexflytraptrapped);q.setType('Normal');act(q,p,'watergun');assert(!q.volatiles.apexflytraptrapped);
  p.addVolatile('substitute');act(q,p,'tackle',{basePower:1});assert(!q.volatiles.apexflytraptrapped);p.removeVolatile('substitute');p.addVolatile('gastroacid');act(q,p,'tackle');assert(!q.volatiles.apexflytraptrapped);
 });
 it('Apex Flytrap releases its trap when the holder switches out',()=>{
  const[p,q]=setup('Apex Flytrap');act(q,p,'tackle');assert(q.volatiles.apexflytraptrapped);battle.makeChoices('switch 2','move splash');assert(!q.volatiles.apexflytraptrapped);
 });
});
