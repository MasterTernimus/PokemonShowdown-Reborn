'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Approved Haxorus, furnace, scales and Gooey changes',()=>{
 let battle;afterEach(()=>battle?.destroy());
 function setup(ability,species='Mew',ffa=false){const p={species,ability,moves:['splash']},f={species:'Blissey',ability:'No Ability',moves:['splash']};battle=common.createBattle({formatid:ffa?(ability==='Furnace Engine'?'gen9freeforall4pdragonsden':'gen9freeforall4pmistyfieldadrienn'):'gen9nofieldsinglesgame'},ffa?[[p],[f],[f],[f]]:[[p],[f]]);battle.makeChoices(...Array(ffa?4:2).fill('team 1'));battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;return[battle.p1.active[0],battle.p2.active[0]];}
 function hit(p,t,id,extra={}){const m=battle.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false,secondaries:undefined,basePower:10},extra);battle.actions.useMove(m,p,{target:t});return battle.activeMove;}
 function residual(p){battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);}
 for(const ability of ['Raging Storm','Raging Overlord'])it(ability+' preserves target boosts and retains defensive bypass',()=>{
  const[p,t]=setup(ability,'Haxorus');t.boosts={atk:2,def:3,spa:1,spd:2,spe:2,accuracy:1,evasion:0};const before={...t.boosts};
  const m=hit(p,t,'tackle');assert.deepEqual(t.boosts,before);assert(m.ignoreAbility&&m.infiltrates&&m.ignoreDefensive);assert(p.hasAbility('battlearmor'));if(ability==='Raging Overlord')assert(p.hasAbility('supremeoverlord'));
 });
 it('Raging Storm still cleaves remaining FFA opponents on its KO',()=>{
  const[p,t]=setup('Raging Storm','Haxorus',true),others=battle.sides.slice(2).map(s=>s.active[0]),before=others.map(x=>x.hp);t.hp=1;hit(p,t,'tackle');battle.faintMessages();assert(others.every((x,i)=>x.hp<before[i]));
 });
 it('Furnace Engine keeps components and self-healing but no idle chip',()=>{
  const[p,t]=setup('Furnace Engine','Coalossal-Gmax');for(const a of ['steamengine','flamebody','solidrock','selfsufficient'])assert(p.hasAbility(a),a);p.hp-=100;const hp=p.hp,foehp=t.hp;residual(p);assert(p.hp>hp);assert.equal(t.hp,foehp);
 });
 for(const move of ['ember','rockthrow'])it('Furnace earns existing all-foe chip from '+move+' HP damage for only that turn',()=>{
  const[p,t]=setup('Furnace Engine','Coalossal-Gmax',true);hit(p,t,move);const foes=battle.sides.slice(1).map(s=>s.active[0]),hp=foes.map(x=>x.hp);residual(p);for(let i=0;i<foes.length;i++)assert.equal(hp[i]-foes[i].hp,Math.floor(foes[i].baseMaxhp/16));battle.turn++;const after=foes.map(x=>x.hp);residual(p);assert.deepEqual(foes.map(x=>x.hp),after);
 });
 it('Furnace rejects substitute-only, protected, unrelated, self and residual damage',()=>{
  const[p,t]=setup('Furnace Engine','Coalossal-Gmax');t.addVolatile('substitute');hit(p,t,'ember',{basePower:1});assert.notEqual(p.abilityState.furnaceDamageTurn,battle.turn);t.removeVolatile('substitute');t.addVolatile('protect');hit(p,t,'rockthrow');t.removeVolatile('protect');hit(p,t,'tackle');hit(p,p,'ember');battle.damage(5,t,p,battle.dex.conditions.get('brn'));assert.notEqual(p.abilityState.furnaceDamageTurn,battle.turn);
 });
 it('Furnace rejects allied HP damage',()=>{
  const p={species:'Coalossal-Gmax',ability:'Furnace Engine',moves:['splash']},f={species:'Blissey',ability:'No Ability',moves:['splash']};battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[p,f],[f,f]]);battle.makeChoices('team 12','team 12');const mon=battle.p1.active[0];hit(mon,battle.p1.active[1],'ember');assert.notEqual(mon.abilityState.furnaceDamageTurn,battle.turn);
 });
 it('Royal Scales loses healing/weather immunity while retaining Prism Scale and Dragonize',()=>{
  const[p,t]=setup('Royal Scales','Milotic-Mega');for(const a of ['prismscale','marvelscale','oblivious','swiftswim','dragonize'])assert(p.hasAbility(a),a);assert(!p.hasAbility('selfsufficient'));p.hp-=100;const hp=p.hp;residual(p);assert.equal(p.hp,hp);assert(p.runStatusImmunity('sandstorm'));assert(p.runStatusImmunity('hail'));
  p.status='brn';assert.equal(battle.runEvent('ModifyDef',p,null,null,100),150);battle.field.setWeather('raindance',p);assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);hit(t,p,'taunt',{category:'Status'});assert(!p.volatiles.taunt);const m=battle.dex.getActiveMove('hypervoice');battle.singleEvent('ModifyType',p.getAbility(),p.abilityState,m,p);assert.equal(m.type,'Dragon');
 });
 it('Gooey drops Speed only once for five hits, then again on the next attack',()=>{
  const[p,t]=setup('Gooey','Goodra');hit(t,p,'tailslap',{multihit:5,basePower:1});assert.equal(t.boosts.spe,-2);hit(t,p,'tailslap',{multihit:5,basePower:1});assert.equal(t.boosts.spe,-4);
 });
 it('Gooey preserves the Murkwater magnitude and nested identities',()=>{
  const[p,t]=setup('Gooey','Goodra');assert(p.hasAbility('hydration'));assert(p.hasAbility('sapsipper'));battle.field.terrain='murkwatersurfaceterrain';hit(t,p,'tailslap',{multihit:5,basePower:1});assert.equal(t.boosts.spe,-4);
 });
 it('spread multi-hit attacks trigger each distinct Gooey holder once',()=>{
  const[p,t]=setup('Gooey','Goodra',true);const second=battle.p3.active[0];second.setAbility('Gooey');hit(t,p,'rockslide',{target:'allAdjacent',multihit:3,basePower:1});assert.equal(t.boosts.spe,-4);
 });

 it('Furnace preserves FFA Fire effectiveness and ability immunity for earned chip',()=>{
  const[p,t]=setup('Furnace Engine','Coalossal-Gmax',true);hit(p,t,'rockthrow');const foes=battle.sides.slice(1).map(s=>s.active[0]);foes[0].setType('Grass');foes[1].setType('Water');foes[2].setAbility('Flash Fire');const hp=foes.map(x=>x.hp);residual(p);assert.equal(hp[0]-foes[0].hp,Math.floor(foes[0].baseMaxhp/8));assert.equal(hp[1]-foes[1].hp,Math.floor(foes[1].baseMaxhp/32));assert.equal(foes[2].hp,hp[2]);
 });
});
