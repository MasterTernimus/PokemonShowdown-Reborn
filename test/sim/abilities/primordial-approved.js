'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Approved Regigigas and Primordial mechanics',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(ability='Worldforged',item=''){b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Regigigas',ability,item,moves:['tackle','doublehit','earthquake','splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash','tackle','doublehit','shadowball']}]]);b.makeChoices('team 12','team 1');b.randomizer=d=>d;return[b.p1.active[0],b.p2.active[0]];}
 it('has final base/Fan lineups and a Normal 770 BST Primordial form',()=>{
  assert.deepEqual(Dex.species.get('regigigas').abilities,{0:'Continental Pull',1:'Worldforged',H:'Colossal Frame'});
  assert.deepEqual(Dex.species.get('rotomfan').abilities,{0:'Eject',1:'Windy Surge',H:'Air Lock'});
  const s=Dex.species.get('regigigasprimordial');assert(s.isPrimal);assert.equal(s.bst,770);assert.deepEqual(s.types,['Normal']);assert.deepEqual(s.baseStats,{hp:110,atk:150,def:130,spa:150,spd:130,spe:100});
 });
 it('Orb reverts on genuine entry, removes Slow Start and persists without a Mega action',()=>{const[p]=setup('Worldforged','Primordial Orb');assert.equal(p.species.id,'regigigasprimordial');assert.equal(p.ability,'worldbinder');assert.deepEqual(p.getPassives(),['primordialconstruct','ancientassembly']);assert(!p.volatiles.slowstart);assert.equal(b.p1.gimmickCount,0);assert.equal(p.takeItem(),false);assert(b.log.some(l=>l.includes('|-ability|p1a:')&&l.endsWith('|Worldbinder')));assert(!b.log.some(l=>l.includes('|-ability|p1a:')&&l.endsWith('|Mold Breaker')));b.makeChoices('switch 2','move 1');b.makeChoices('switch 2','move 1');assert.equal(p.species.id,'regigigasprimordial');assert(!p.volatiles.slowstart);});
 it('base Slow Start follows Transform and stops when leaving its passive form',()=>{const[p,q]=setup();assert(p.volatiles.slowstart);assert(q.transformInto(p));assert(q.volatiles.slowstart);q.formeChange('Mew',null,true);assert(!q.volatiles.slowstart);});
 it('Worldforged and Orb boost only the five Regi attack types; Assembly caps at 30%',()=>{
  const[p,q]=setup();for(const[type,n]of [['Dragon',130],['Electric',130],['Ice',130],['Rock',130],['Steel',130],['Normal',100]]){const m=Object.assign(Dex.getActiveMove('tackle'),{type});assert.equal(b.runEvent('BasePower',p,q,m,100),n,type);}
  p.setItem('Primordial Orb');b.singleEvent('SwitchIn',p.getItem(),p.itemState,p);assert.equal(p.species.id,'regigigasprimordial');p.m.ancientAssemblySpecies=['regirock','regice','registeel','regieleki','regidrago'];const m=Object.assign(Dex.getActiveMove('tackle'),{type:'Ice'});assert.equal(b.runEvent('BasePower',p,q,m,100),195);
 });
 it('Colossal Frame reduces physical attacks only',()=>{const[p,q]=setup('Colossal Frame');assert.equal(b.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),75);assert.equal(b.runEvent('ModifyDamage',q,p,Dex.getActiveMove('psychic'),100),100);});
 it('Construct checks each hit, preserves Ghost immunity and excludes the four types',()=>{
  const[p,q]=setup('Worldforged','Primordial Orb');p.addVolatile('gastroacid');
  for(const[type,n]of [['Normal',50],['Fire',50],['Dark',100],['Ghost',100],['Ground',100],['Fighting',100]]){const m=Object.assign(Dex.getActiveMove('tackle'),{type});assert.equal(b.runEvent('ModifyDamage',q,p,m,100),n,type);}
  let hp=p.hp;b.actions.runMove('shadowball',q,q.getLocOf(p));assert.equal(p.hp,hp);
  p.hp=Math.floor(p.maxhp/2);assert.equal(b.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),100);
  p.hp=Math.floor(p.maxhp/2)+1;const losses=[],original=b.runEvent.bind(b);b.runEvent=(event,...args)=>{if(event==='AfterDamageApplied'&&args[0]===p)losses.push(args[3]);return original(event,...args);};
  b.actions.runMove(Object.assign(Dex.getActiveMove('doublehit'),{accuracy:true,willCrit:false,basePower:40}),q,q.getLocOf(p));assert.equal(losses.length,2);assert(losses[1]>=losses[0]*1.9,JSON.stringify(losses));
 });
 it('Worldbinder removes only positive opposing stages after the entire HP-damaging move',()=>{
  const[p,q]=setup('Worldforged','Primordial Orb');q.hp=q.maxhp=3000;q.boosts.atk=2;q.boosts.def=2;q.boosts.spd=-1;const during=[],original=b.runEvent.bind(b);b.runEvent=(event,...args)=>{if(event==='AfterDamageApplied'&&args[0]===q)during.push(q.boosts.def);return original(event,...args);};
  b.actions.runMove(Object.assign(Dex.getActiveMove('doublehit'),{accuracy:true,willCrit:false}),p,p.getLocOf(q));assert.deepEqual(during,[2,2]);assert.equal(q.boosts.atk,0);assert.equal(q.boosts.def,0);assert.equal(q.boosts.spd,-1);
 });
 it('Worldbinder bypasses Levitate, but Substitute-only hits do not clear boosts',()=>{const[p,q]=setup('Worldforged','Primordial Orb');q.setAbility('Levitate');const hp=q.hp;b.actions.runMove('earthquake',p,p.getLocOf(q));assert(q.hp<hp);q.hp=q.maxhp;q.addVolatile('substitute');q.volatiles.substitute.hp=1000;q.boosts.atk=2;b.actions.runMove('tackle',p,p.getLocOf(q));assert.equal(q.boosts.atk,2);});
 it('Worldbinder does not clear stages on protection, misses or type immunity',()=>{
  const[p,q]=setup('Worldforged','Primordial Orb');q.boosts.atk=2;q.addVolatile('protect');b.actions.runMove('tackle',p,p.getLocOf(q));assert.equal(q.boosts.atk,2);q.removeVolatile('protect');
  b.actions.runMove(Object.assign(Dex.getActiveMove('tackle'),{accuracy:0}),p,p.getLocOf(q));assert.equal(q.boosts.atk,2);q.setType('Ghost');b.actions.runMove('tackle',p,p.getLocOf(q));assert.equal(q.boosts.atk,2);
 });
 it('Transform takes Primordial passives and leaves its original raw HP unchanged',()=>{
  const[p,q]=setup('Worldforged','Primordial Orb'),hp=q.maxhp;assert(q.transformInto(p));assert.equal(q.maxhp,hp);assert.deepEqual(q.getPassives(),['primordialconstruct','ancientassembly']);assert(!q.volatiles.slowstart);q.addVolatile('gastroacid');assert.equal(b.runEvent('ModifyDamage',p,q,Dex.getActiveMove('tackle'),100),50);
 });
 it('Continental Pull lowers outgoing targets only after the whole contact move, once per target per turn',()=>{
  const[p,q]=setup('Continental Pull');q.hp=q.maxhp=5000;const during=[],original=b.runEvent.bind(b);b.runEvent=(event,...args)=>{if(event==='AfterDamageApplied'&&args[0]===q)during.push(q.boosts.spe);return original(event,...args);};
  const use=()=>b.actions.runMove(Object.assign(Dex.getActiveMove('doublehit'),{accuracy:true,willCrit:false}),p,p.getLocOf(q));use();assert.deepEqual(during,[0,0]);assert.equal(q.boosts.spe,-1);use();assert.equal(q.boosts.spe,-1);b.turn++;use();assert.equal(q.boosts.spe,-2);b.actions.runMove('tackle',q,q.getLocOf(p));assert.equal(q.boosts.spe,-2);assert.equal(p.boosts.spe,0);
 });
 it('Continental Pull requires opposing HP damage, contact, and an unsuppressed selected ability',()=>{
  const[p,q]=setup('Continental Pull');q.hp=q.maxhp=5000;const use=(id='tackle',patch={})=>b.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},patch),p,p.getLocOf(q));
  q.addVolatile('substitute');q.volatiles.substitute.hp=2000;use();assert.equal(q.boosts.spe,0);q.removeVolatile('substitute');q.addVolatile('protect');use();assert.equal(q.boosts.spe,0);q.removeVolatile('protect');use('tackle',{accuracy:0});assert.equal(q.boosts.spe,0);use('earthquake');assert.equal(q.boosts.spe,0);q.setType('Ghost');use();assert.equal(q.boosts.spe,0);q.setType('Psychic');p.addVolatile('gastroacid');use();assert.equal(q.boosts.spe,0);p.removeVolatile('gastroacid');use();assert.equal(q.boosts.spe,-1);
 });
 it('Continental Pull tracks each opposing target independently and never lowers allies',()=>{
  b=common.createBattle({gameType:'doubles'},[[{species:'Regigigas',ability:'Continental Pull',moves:['tackle']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);const p=b.p1.active[0],ally=b.p1.active[1];
  for(const q of [...b.p2.active,ally]){q.hp=q.maxhp=2000;b.actions.runMove(Object.assign(Dex.getActiveMove('tackle'),{accuracy:true,willCrit:false}),p,p.getLocOf(q));assert.equal(q.boosts.spe,q===ally?0:-1);}
 });
});
