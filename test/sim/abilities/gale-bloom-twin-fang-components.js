'use strict';
const assert=require('assert').strict;
const {Battle,Dex}=require('../../../dist/sim');
describe('Gale Bloom Shield Dust and Twin Fang Rivalry additions',()=>{
 let battle;
 afterEach(()=>battle?.destroy());
 function setup(ability='Gale Bloom',species='Mew',mode='doubles'){
  const mon={species:'Mew',ability:'No Ability',moves:['splash','tackle','gust']};
  const teams=mode==='freeforall'?[[{...mon,species,ability}],[mon],[mon],[mon]]:[[{...mon,species,ability},mon,mon],[mon,mon,mon]];
  const options={formatid:mode==='freeforall'?'gen9freeforall4pmistyfieldadrienn':mode==='singles'?'gen9nofieldsinglesgame':'gen9nofielddoublesbattle'};
  for(let i=0;i<teams.length;i++)options['p'+(i+1)]={team:teams[i]};battle=new Battle(options);
  if(battle.requestState==='teampreview')battle.makeChoices(...teams.map(t=>'team '+t.map((_,i)=>i+1).join('')));
  battle.field.terrain='';for(const s of battle.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=10000;
  return[battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(q,p,id='watergun',extra={}){battle.clearActiveMove();return battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{basePower:1,accuracy:true,willCrit:false},extra),q,{target:p});}
 function secondaryHit(q,p){hit(q,p,'watergun',{secondaries:[{chance:100,status:'par'},{chance:100,self:{boosts:{spa:1}}}]});}
 it('Gale Bloom advertises Shield Dust while retaining its own unbreakable support flags',()=>{
  const[p]=setup();assert(p.hasAbility('shielddust'));assert.equal(p.getAbility().flags.breakable,undefined);
  assert(Dex.abilities.get('galebloom').desc.includes('Shield Dust'));
 });
 it('blocks target secondaries but preserves attacker self-secondaries and primary status moves',()=>{
  const[p,q]=setup();secondaryHit(q,p);assert.equal(p.status,'');assert.equal(q.boosts.spa,1);
  hit(q,p,'thunderwave',{accuracy:true});assert.equal(p.status,'par');
 });
 it('selected Shield Dust stops under suppression and resumes when restored',()=>{
  const[p,q]=setup();p.addVolatile('gastroacid');secondaryHit(q,p);assert.equal(p.status,'par');
  p.cureStatus();p.removeVolatile('gastroacid');secondaryHit(q,p);assert.equal(p.status,'');
 });
 it('Mold Breaker bypasses the added Shield Dust without globally making Gale Bloom breakable',()=>{
  const[p,q]=setup();q.setAbility('Mold Breaker');secondaryHit(q,p);assert.equal(p.status,'par');assert.equal(q.boosts.spa,1);
 });
 it('native and selected Shield Dust overlap once and the native passive survives selected suppression',()=>{
  const[p,q]=setup('Gale Bloom','Venomoth');assert(p.getPassives().includes('mothborn'));p.addVolatile('gastroacid');secondaryHit(q,p);assert.equal(p.status,'');assert.equal(q.boosts.spa,1);
 });
 it('the first actual Flying HP hit still boosts the lowest adjacent ally once per entry',()=>{
  const[p,q]=setup();const ally=p.side.active[1];ally.hp=100;hit(p,q,'gust');assert.equal(ally.boosts.spa,1);
  hit(p,q,'gust');assert.equal(ally.boosts.spa,1);hit(p,q,'watergun');assert.equal(ally.boosts.spa,1);
 });
 for(const attacker of ['M','F','N',''])for(const defender of ['M','F','N',''])it('Twin Fang uses full local Rivalry gender rule '+attacker+'/'+defender,()=>{
  const[p,q]=setup('Twin Fang');p.gender=attacker;q.gender=defender;
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),!defender||defender==='N'||attacker===defender?1300:1000);
 });
 it('Twin Fang retains unboosted Attack copying and its independent Special Attack stages',()=>{
  const[p]=setup('Twin Fang');p.storedStats.atk=250;p.storedStats.spa=100;p.boosts.atk=2;p.boosts.spa=-1;assert.equal(p.getStat('spa'),166);
 });
 it('selected and native Twin Fang/Rivalry overlap gives one power multiplier and one ally guard',()=>{
  const[p,q]=setup('Rivalry','Haxorus-Mega');assert(p.getPassives().includes('twinfang'));assert(p.hasAbilityOrPassive('rivalry'));q.gender='N';
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),3072);
  p.addVolatile('gastroacid');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),3072);
 });
 it('a native Rivalry passive and selected Twin Fang overlap once',()=>{
  const[p,q]=setup('Twin Fang','Nidoqueen');assert(p.getPassives().includes('rivalry'));q.gender='N';
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),3072);
 });
 it('protects other allies including friendly fire, but not its own holder or FFA opponents',()=>{
  const[p,q]=setup('Twin Fang');const ally=p.side.active[1],move=Dex.getActiveMove('tackle');
  for(const source of [p,q])assert.equal(battle.runEvent('ModifyDamage',source,ally,move,4096),3072);
  assert.equal(battle.runEvent('ModifyDamage',q,p,move,4096),4096);
 });
 it('selected Rivalry effects stop with Twin Fang suppression',()=>{
  const[p,q]=setup('Twin Fang');q.gender='N';p.addVolatile('gastroacid');
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1000);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),4096);
 });
 it('Rivalry ally support retains the primitive Mold Breaker behavior and separate-holder stacking',()=>{
  const[p,q]=setup('Twin Fang');q.setAbility('Mold Breaker');const move=Dex.getActiveMove('tackle');move.ignoreAbility=true;battle.setActiveMove(move,q,p.side.active[1]);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],move,4096),3072);
  p.side.active[1].setAbility('Rivalry');assert.equal(battle.runEvent('ModifyDamage',q,p,move,4096),3072);
 });
 it('FFA opponents receive no Rivalry guard',()=>{
  const[p,q]=setup('Twin Fang','Mew','freeforall');const move=Dex.getActiveMove('tackle');
  for(const side of battle.sides)assert.equal(battle.runEvent('ModifyDamage',q,side.active[0],move,4096),4096);
 });
 it('regular Haxorus Rivalry stays single-provider through selected suppression without Twin Fang mechanics',()=>{
  const[p,q]=setup('Sharpness','Haxorus');q.gender='N';assert.deepEqual(p.getPassives(),['rivalry']);assert(!p.hasAbilityOrPassive('twinfang'));
  assert.equal(p.getStat('spa',true),p.storedStats.spa);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  p.addVolatile('gastroacid');assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),3072);
 });
 it('actual Mega evolution and reversal swap Rivalry/Twin Fang without losing or doubling Rivalry',()=>{
  const[p,q]=setup('Sharpness','Haxorus');q.gender='N';p.setItem('Haxorite');p.canMegaEvo=battle.actions.canMegaEvo(p);
  function strikes(){let count=0;const original=battle.spreadDamage;battle.spreadDamage=function(damage,targets,source,effect,...rest){const result=original.call(this,damage,targets,source,effect,...rest);if(effect?.effectType==='Move')result.forEach((d,i)=>{if(targets[i]===q&&d>0)count++;});return result;};try{hit(p,q,'tackle',{basePower:40});return count;}finally{battle.spreadDamage=original;}}
  assert.equal(p.ability,'sharpness');assert.deepEqual(p.getPassives(),['rivalry']);assert.equal(strikes(),1);
  assert(battle.actions.runMegaEvo(p));assert.equal(p.species.id,'haxorusmega');assert.equal(p.ability,'ragingoverlord');assert.deepEqual(p.getPassives(),['twinfang']);
  assert.equal(p.getStat('spa',true),p.storedStats.atk);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);
  assert.equal(battle.runEvent('ModifyDamage',q,p.side.active[1],Dex.getActiveMove('tackle'),4096),3072);assert.equal(strikes(),2);
  assert(p.formeChange('Haxorus',Dex.items.get('haxorite'),true));assert.deepEqual(p.getPassives(),['rivalry']);assert.equal(p.ability,'sharpness');assert.equal(p.getStat('spa',true),p.storedStats.spa);
  assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('tackle'),1000),1300);assert.equal(strikes(),1);
 });
 it('keeps exactly one contact follow-up and does not retarget it after a KO',()=>{
  const[p,q]=setup('Twin Fang');hit(p,q,'tackle',{basePower:40});assert(battle.log.some(l=>l.includes('|-hitcount|')&&l.endsWith('|2')));
  const partner=q.side.active[1],hp=partner.hp;q.hp=1;hit(p,q,'tackle',{basePower:40});assert.equal(partner.hp,hp);
 });
});
