'use strict';
const assert=require('assert').strict, common=require('../../common');
describe('Agony Flame',function(){
 let b;afterEach(()=>b?.destroy());
 function setup(format='gen9nofieldsinglesgame',item=''){
  const p={species:'Houndoom',ability:'Agony Flame',item:'Houndoominite',moves:['flamethrower','heatwave','splash']};
  const t={species:'Blissey',ability:'No Ability',item,moves:['splash','softboiled']};
  const teams=format.includes('freeforall')?[[p],[t],[t],[t]]:format.includes('doubles')?[[p,t],[t,t]]:[[p],[t]];
  b=common.createBattle({formatid:format},teams);b.makeChoices(...teams.map(t=>t.length>1?'team 12':'team 1'));
  if(format.includes('freeforall'))b.field.changeTerrain('factoryterrain',b.p1.active[0]);
  b.randomChance=(n,d)=>n>=d;return[b.p1.active[0],b.p2.active[0]];
 }
 function use(p,t,extra={},name='flamethrower'){const m=b.dex.getActiveMove(name);Object.assign(m,{accuracy:true,willCrit:false,basePower:5,secondaries:undefined},extra);b.actions.runMove(m,p,p.getLocOf(t));}
 it('uses approved base/Mega stats and separate abilities',()=>{
  const[p]=setup();assert.deepEqual(p.species.baseStats,{hp:75,atk:110,def:60,spa:120,spd:85,spe:110});assert.equal(p.species.bst,560);
  assert.deepEqual(p.species.abilities,{0:'Flash Fire',1:'Agony Flame',H:'Battle Fervor'});
  const mega=b.dex.species.get('houndoommega');assert.deepEqual(mega.baseStats,{hp:75,atk:110,def:100,spa:150,spd:95,spe:130});assert.equal(mega.bst,660);assert.equal(mega.abilities[0],'Hellfire Eclipse');
 });
 it('burns and Heal Blocks after the whole multi-hit move, once per target',()=>{
  const[p,t]=setup();const during=[];b.onEvent('DamagingHit',b.format,()=>during.push(t.status));use(p,t,{multihit:3});
  assert.deepEqual(during,['','','']);assert.equal(t.status,'brn');assert.equal(t.volatiles.healblock.duration,2);
  assert.equal(b.log.filter(l=>l.includes('|-status|')&&l.includes('|brn')).length,1);
 });
 it('affects each actually damaged FFA opponent',()=>{
  const[p,t]=setup('gen9freeforall4pmistyfieldadrienn');use(p,t,{},'heatwave');
  for(const side of b.sides.slice(1)){assert.equal(side.active[0].status,'brn');assert.equal(side.active[0].volatiles.healblock.duration,2);}
 });
 for(const item of ['Lum Berry','Rawst Berry'])it('does not re-burn after a native burn consumes '+item,()=>{
  const[p,t]=setup(undefined,item);use(p,t,{secondaries:[{chance:100,status:'brn'}]});assert.equal(t.item,'');assert.equal(t.status,'');assert.equal(t.volatiles.healblock.duration,2);
  assert.equal(b.log.filter(l=>l.includes('|-status|')&&l.includes('|brn')).length,1);
 });
 it('allows a Berry to cure the ability burn',()=>{const[p,t]=setup(undefined,'Lum Berry');use(p,t);b.runEvent('Update');assert.equal(t.item,'');assert.equal(t.status,'');assert(t.volatiles.healblock);});
 for(const mode of ['miss','protect','immune','substitute','nonfire','delayed','suppressed','self'])it('excludes '+mode,()=>{
  const[p,t]=setup();let extra={};if(mode==='miss')extra.accuracy=0;if(mode==='protect')t.addVolatile('protect');if(mode==='immune')t.setAbility('Flash Fire');if(mode==='substitute')t.addVolatile('substitute');if(mode==='nonfire')extra.type='Dark';if(mode==='delayed')extra.flags={futuremove:1};if(mode==='suppressed')p.addVolatile('gastroacid');
  const target=mode==='self'?p:t;use(p,target,extra);assert.equal(target.status,'');assert(!target.volatiles.healblock);
 });
 it('excludes allies',()=>{const[p]=setup('gen9nofielddoublesbattle'),t=b.p1.active[1];use(p,t);assert.equal(t.status,'');assert(!t.volatiles.healblock);});
 for(const mode of ['Fire','Water Veil','safeguard','misty'])it('respects burn protection '+mode+' but still blocks healing',()=>{
  const[p,t]=setup();if(mode==='Fire')t.setType('Fire');if(mode==='Water Veil')t.setAbility('Water Veil');if(mode==='safeguard')t.side.addSideCondition('safeguard',t);if(mode==='misty')b.field.setTerrain('mistyterrain',t);
  use(p,t);assert.equal(t.status,'');assert(t.volatiles.healblock);
 });
 for(const mode of ['Shield Dust','Covert Cloak'])it('treats its effects as ability effects through '+mode,()=>{
  const[p,t]=setup(undefined,mode==='Covert Cloak'?mode:'');if(mode==='Shield Dust')t.setAbility(mode);use(p,t);assert.equal(t.status,'brn');assert(t.volatiles.healblock);
 });
 it('does not replace existing status or shorten longer Heal Block',()=>{const[p,t]=setup();t.setStatus('par');t.addVolatile('healblock',p);const duration=t.volatiles.healblock.duration;use(p,t);assert.equal(t.status,'par');assert.equal(t.volatiles.healblock.duration,duration);});
 it('expires Heal Block after current and following turn',()=>{
  const[p,t]=setup();use(p,t);t.cureStatus();assert.equal(b.heal(10,t,t,b.dex.moves.get('recover')),false);
  b.makeChoices('move splash','move splash');assert.equal(t.volatiles.healblock.duration,1);
  b.makeChoices('move splash','move splash');assert(!t.volatiles.healblock);assert(b.heal(10,t,t,b.dex.moves.get('recover'))>0);
 });
 it('refreshes a shorter Heal Block without stacking durations',()=>{const[p,t]=setup();use(p,t);t.volatiles.healblock.duration=1;b.turn++;use(p,t);assert.equal(t.volatiles.healblock.duration,2);});
 it('Mega Evolution replaces Agony Flame with Hellfire Eclipse',()=>{
  const[p,t]=setup();assert(b.actions.runMegaEvo(p));assert.equal(p.ability,'hellfireeclipse');assert.equal(p.species.bst,660);use(p,t);assert.equal(t.status,'');assert(!t.volatiles.healblock);assert.equal(b.field.weather,'sunnyday');
 });
});
