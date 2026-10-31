'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex,TeamValidator}=require('../../../dist/sim');
const mon=(ability='No Ability',species='Mew')=>({species,ability,moves:['splash','sing','healbell','perishsong']});
describe('Lapras songs, harbor and storm rework',()=>{
 let b;
 afterEach(()=>{b?.destroy();b=null;});
 function start(ability='Safe Harbor',mode='singles',species='Lapras'){
  const teams=[[mon(ability,species),mon(),mon()],[mon(),mon(),mon()]];
  if(mode==='ffa')teams.push([mon(),mon(),mon()],[mon(),mon(),mon()]);
  b=common.createBattle({formatid:mode==='ffa'?'gen9freeforall4pmistyfieldadrienn':mode==='doubles'?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},teams);
  b.makeChoices(...teams.map(()=>'team 123'));b.field.terrain='';b.randomChance=(n,d)=>n>=d;b.randomizer=n=>n;
  return[b.p1.active[0],b.p2.active[0]];
 }
 function hit(p,t,id='watergun',extra={}){
  b.clearActiveMove();const m=b.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false,basePower:m.category==='Status'?0:20,secondaries:undefined},extra);
  b.actions.useMove(m,p,{target:t});const used=b.activeMove;b.runEvent('AfterMove',p,t,used);b.clearActiveMove();return used;
 }
 it('Safe Harbor absorbs Water, cures status in rain, and has no Ice Body contact effect',()=>{
  const[p,t]=start();p.hp=100;hit(t,p);assert.equal(p.hp,100+Math.round(p.baseMaxhp/4));
  p.setStatus('brn');b.field.setWeather('raindance',p);b.makeChoices('move splash','move splash');assert.equal(p.status,'');
  b.randomChance=()=>true;hit(t,p,'tackle');assert.equal(t.status,'');
 });
 it('Safe Harbor heals the immediate replacement after hazards and cannot bank the heal',()=>{
  const[p,t]=start();const replacement=p.side.pokemon[1];replacement.hp=100;
  p.side.addSideCondition('stealthrock',t);b.makeChoices('switch 2','move splash');
  assert.equal(replacement.hp,100);
  assert(!p.side.slotConditions[0].harborpassage);
  const next=p.side.pokemon[2];next.hp=100;b.makeChoices('switch 3','move splash');assert(next.hp<100);
 });
 it('a hazard KO spends the harbor gift and fainting Lapras never creates one',()=>{
  const[p,t]=start();p.side.pokemon[1].hp=1;p.side.addSideCondition('stealthrock',t);
  b.makeChoices('switch 2','move splash');assert.equal(p.side.active[0].hp,0);assert(!p.side.slotConditions[0].harborpassage);
  const next=p.side.pokemon[2];next.hp=100;b.makeChoices('switch 3','');assert(next.hp<100);
  p.faint();b.faintMessages();assert(!p.side.slotConditions[0].harborpassage);
 });
 it('suppression prevents Safe Harbor from leaving a gift',()=>{
  const[p,t]=start();p.addVolatile('gastroacid',t);const next=p.side.pokemon[1];next.hp=100;
  b.makeChoices('switch 2','move splash');assert.equal(next.hp,100);
 });
 it('Ocean Lullaby keeps Shell Armor and Ice Body, with component-specific bypass',()=>{
  const[p,t]=start('Ocean Lullaby');assert(p.hasAbility('shellarmor'));assert(p.hasAbility('icebody'));
  const m=b.dex.getActiveMove('tackle');assert.equal(b.runEvent('CriticalHit',p,t,m),false);
  p.hp=100;b.field.setWeather('hail',p);b.makeChoices('move splash','move splash');assert(p.hp>100);
  b.randomChance=()=>true;t.setAbility('Mold Breaker');hit(t,p,'tackle');assert.equal(t.status,'frz');
 });
 for(const mode of ['singles','doubles','ffa'])it('sound damage heals only the user’s active side once per turn in '+mode,()=>{
  const[p,t]=start('Ocean Lullaby',mode);p.hp=100;
  const ally=p.allies()[0];if(ally){ally.hp=100;ally.addVolatile('confusion');}
  const foeHp=t.hp;hit(p,t,'hypervoice');assert.equal(p.hp,100+Math.floor(p.baseMaxhp/16));assert(t.hp<foeHp);
  if(ally){assert.equal(ally.hp,100+Math.floor(ally.baseMaxhp/16));assert(!ally.volatiles.confusion);}
  const hp=p.hp;hit(p,t,'hypervoice');assert.equal(p.hp,hp);
 });
 it('Snowscape sets Snowy Field, not weather; Hail and Snowy Field do not double Ice Body healing',()=>{
  const[p]=start('Ocean Lullaby');p.hp=100;hit(p,p,'snowscape');
  assert.equal(b.field.weather,'');assert.equal(b.field.terrain,'snowyterrain');
  b.makeChoices('move splash','move splash');assert.equal(p.hp,100+Math.floor(p.baseMaxhp/16));
  b.field.setWeather('hail',p);const hp=p.hp;
  b.makeChoices('move splash','move splash');assert.equal(p.hp,hp+Math.floor(p.baseMaxhp/16));
 });
 it('successful Sing heals, failed Sing and protected damaging sounds do not',()=>{
  const[p,t]=start('Ocean Lullaby');p.hp=100;hit(p,t,'sing');assert.equal(t.status,'slp');assert(p.hp>100);
  b.turn++;const hp=p.hp;hit(p,t,'sing');assert.equal(p.hp,hp);
  t.addVolatile('protect');hit(p,t,'hypervoice');assert.equal(p.hp,hp);
  t.removeVolatile('protect');t.setAbility('Soundproof');hit(p,t,'hypervoice');assert.equal(p.hp,hp);
 });
 it('Heal Bell and Perish Song qualify, while Life Dew is not a sound move',()=>{
  const[p,t]=start('Ocean Lullaby');p.hp=100;hit(p,p,'healbell');
  assert.equal(p.hp,100+Math.round(p.baseMaxhp/8)+Math.floor(p.baseMaxhp/16));
  b.turn++;const hp=p.hp;hit(p,t,'perishsong');assert.equal(p.hp,hp+Math.floor(p.baseMaxhp/16));
  b.turn++;p.hp=100;hit(p,p,'lifedew');assert.equal(p.hp,100+Math.round(p.maxhp/4));
 });
 it('charged Wild Charge is adaptive, 1.5x power and recoil-free, but uncharged Wild Charge is normal',()=>{
  const[p,t]=start('Storm Memory');p.hp=p.maxhp=p.baseMaxhp=2000;t.hp=t.maxhp=t.baseMaxhp=3000;
  hit(t,p,'thunderbolt');assert(p.volatiles.stormcharge);p.boosts.spa=3;
  const hp=p.hp,m=hit(p,t,'wildcharge');assert.equal(m.category,'Special');assert.equal(m.overrideDefensiveStat,'spd');assert(!m.recoil);assert.equal(p.hp,hp);assert(!p.volatiles.stormcharge);
  assert.equal(b.runEvent('BasePower',p,t,m,100,true),150);
  const ordinary=hit(p,t,'wildcharge');assert.equal(ordinary.category,'Physical');assert(ordinary.recoil);assert(p.hp<hp);
  p.addVolatile('stormcharge');p.boosts.atk=6;const physical=hit(p,t,'wildcharge');assert.equal(physical.category,'Physical');assert(!physical.recoil);
 });
 it('Storm Charge survives misses, protection and immunity, but is spent on a Substitute hit',()=>{
  const[p,t]=start('Storm Memory');p.addVolatile('stormcharge');
  hit(p,t,'wildcharge',{accuracy:0});assert(p.volatiles.stormcharge);
  t.addVolatile('protect');hit(p,t,'wildcharge');assert(p.volatiles.stormcharge);t.removeVolatile('protect');
  t.setType('Ground');hit(p,t,'wildcharge');assert(p.volatiles.stormcharge);t.setType('Normal');
  t.addVolatile('substitute');hit(p,t,'wildcharge');assert(!p.volatiles.stormcharge);
 });
 it('Gmax has only Liquid Voice passive and no automatic weather, Veil or old absorption',()=>{
  const[p,t]=start('Aurora Resonance','singles','Lapras-Gmax');assert.deepEqual(p.getPassives(),['liquidvoice']);
  assert(!p.hasAbilityOrPassive('hydration'));assert(!p.hasAbility('waterabsorb'));assert(!p.side.sideConditions.auroraveil);
  const m=hit(p,t,'hypervoice');assert.equal(m.type,'Water');assert.equal(b.runEvent('BasePower',p,t,m,100,true),120);
  p.side.addSideCondition('auroraveil',p);assert.equal(b.runEvent('BasePower',p,t,m,100,true),156);
 });
 it('G-Max Resonance cures the active side and creates Veil for subsequent attacks',()=>{
  const[p,t]=start('Aurora Resonance','doubles','Lapras-Gmax');const ally=p.allies()[0];p.setStatus('brn');ally.setStatus('psn');
  const power=[];const original=b.actions.getDamage;b.actions.getDamage=function(s,target,move,...args){if(s===p)power.push(!!p.side.sideConditions.auroraveil);return original.call(this,s,target,move,...args);};
  hit(p,t,'gmaxresonance');assert.equal(p.status,'');assert.equal(ally.status,'');assert(p.side.sideConditions.auroraveil);assert.equal(power[0],false);
  ally.setStatus('brn');hit(p,t,'watergun');assert.equal(ally.status,'brn');assert.equal(power.at(-1),true);
  b.turn++;hit(p,t,'watergun');assert.equal(ally.status,'');
 });
 it('Wild Charge is legal for Lapras without adding Volt Tackle or changing global Wild Charge',()=>{
  const v=new TeamValidator('gen9nofieldsinglesgame@@@Obtainable Abilities');
  assert.equal(v.checkCanLearn(Dex.moves.get('wildcharge'),Dex.species.get('lapras'),undefined,{level:100}),null);
  Dex.includeData();assert(!Dex.data.Learnsets.lapras.learnset.volttackle);assert.equal(Dex.moves.get('wildcharge').basePower,120);
  assert.deepEqual(Dex.moves.get('wildcharge').recoil,[1,4]);
 });
});
