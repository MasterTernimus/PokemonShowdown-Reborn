'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const ids=['guillotine','horndrill','fissure','sheercold'];
function setup(ability='No Ability'){const m=(ability)=>({species:'Mew',ability,moves:ids});battle=common.createBattle({},[[m(ability)],[m('No Ability')]]);battle.randomizer=n=>n;battle.field.terrain='';const p=battle.p1.active[0],q=battle.p2.active[0];p.hp=p.maxhp=p.baseMaxhp=1000;q.hp=q.maxhp=q.baseMaxhp=2000;return[p,q];}
function use(p,q,id,extra={}){const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false},extra);battle.actions.useMove(m,p,{target:q});return battle.activeMove;}
describe('Approved non-OHKO finishers',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('has exact approved data and is legal under OHKO Clause',()=>{const specs=[['guillotine','Steel','Physical',120,100],['horndrill','Rock','Physical',130,90],['fissure','Ground','Physical',110,100],['sheercold','Ice','Special',130,90]];for(const[id,type,category,power,accuracy]of specs){const m=Dex.moves.get(id);assert.equal(m.type,type);assert.equal(m.category,category);assert.equal(m.basePower,power);assert.equal(m.accuracy,accuracy);assert(!m.ohko);}assert.deepEqual(Dex.formats.get('ohkoclause').onValidateSet.call({dex:Dex},{moves:ids}),[]);assert.equal(Dex.moves.get('horndrill').critRatio,2);assert.deepEqual(Dex.moves.get('sheercold').secondary,{chance:30,status:'frz'});});
 for(const id of ids)for(const kind of ['hit','miss','protect','immunity','substitute','multihit'])it(id+' costs exactly 1/4 after '+kind,()=>{const[p,q]=setup();const extra={damage:20};if(kind==='miss')extra.accuracy=0;if(kind==='protect')q.addVolatile('protect');if(kind==='immunity')q.setAbility('Wonder Guard');if(kind==='substitute'){q.addVolatile('substitute');q.volatiles.substitute.hp=1000;}if(kind==='multihit')extra.multihit=3;use(p,q,id,extra);assert.equal(p.hp,750);});
 for(const id of ids)it(id+' direct opposing KO waives cost after whole extra-hit attack',()=>{const[p,q]=setup();q.hp=35;use(p,q,id,{damage:20,multihit:3});assert.equal(q.hp,0);assert.equal(p.hp,1000);});
 for(const ability of ['Magic Guard','Rock Head'])it('explicit HP cost bypasses '+ability,()=>{const[p,q]=setup(ability);q.addVolatile('protect');use(p,q,'guillotine');assert.equal(p.hp,750);});
 it('cost can KO holder',()=>{const[p,q]=setup();p.hp=100;use(p,q,'guillotine',{damage:1});assert.equal(p.hp,0);});
 it('actual damage is ordinary, with no forced kill',()=>{const[p,q]=setup();use(p,q,'guillotine');assert(q.hp>0&&q.hp<q.maxhp);assert.equal(p.hp,750);assert(!battle.log.some(x=>x.includes('|-ohko|')));});
 it('Fissure multiplies final damage at half HP and preserves New World failure',()=>{const[p,q]=setup();const m=Object.assign(Dex.getActiveMove('fissure'),{willCrit:false});const full=battle.actions.getDamage(p,q,m);q.hp=q.maxhp/2;const half=battle.actions.getDamage(p,q,m);assert(Math.abs(half-full*1.5)<=1);battle.field.terrain='newworldterrain';const hp=q.hp;use(p,q,'fissure');assert.equal(q.hp,hp);assert.equal(p.hp,750);});
 it('Guillotine exposes slicing to Sharpness and Horn Drill exposes drill to Power Drill',()=>{const[p,q]=setup('Sharpness');assert(Dex.moves.get('guillotine').flags.slicing);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('guillotine'),100),150);p.setAbility('Power Drill');assert(Dex.moves.get('horndrill').flags.drill);assert.equal(battle.runEvent('BasePower',p,q,Dex.getActiveMove('horndrill'),100),150);});
 it('Silken Salvo extra hits still pay one HP cost',()=>{const[p,q]=setup('Silken Salvo');use(p,q,'fissure');assert.equal(p.hp,750);});
 it('Dual Wield adds hits without adding HP-cost payments',()=>{const[p,q]=setup('Dual Wield');const m=use(p,q,'guillotine');assert.equal(m.multihit,2);assert.equal(p.hp,750);});
});


describe('Quarter HP finisher boundaries and calculator parity', () => {
 afterEach(() => { battle?.destroy(); battle = null; });
 for (const [maxhp, hp, expected] of [[1003,1003,753],[1003,200,0],[3,3,2]]) {
  it(`floors current max HP / 4 with minimum 1: max=${maxhp}, hp=${hp}`, () => {
   const [p,q] = setup(); p.maxhp = maxhp; p.baseMaxhp = maxhp * 2; p.hp = hp;
   use(p,q,'guillotine',{damage:1}); assert.equal(p.hp,expected);
  });
 }
 for (const ko of [false,true]) it('one payment per spread execution; any direct opposing KO waives it: '+ko, () => {
  const mon = {species:'Mew',ability:'No Ability',moves:['guillotine']};
  battle = common.createBattle({gameType:'doubles'},[[mon,mon],[mon,mon]]);
  battle.field.terrain = '';
  for (const p of battle.getAllActive()) p.hp = p.maxhp = p.baseMaxhp = 1000;
  const p=battle.p1.active[0],q=battle.p2.active[0];
  if (ko) q.hp=10;
  use(p,q,'guillotine',{damage:20,target:'allAdjacentFoes'});
  assert.equal(p.hp,ko?1000:750);
  assert.equal(battle.p2.active[1].hp,980);
 });
 it('does not charge again when the same execution is settled twice', () => {
  const [p,q]=setup(); const move=use(p,q,'guillotine',{damage:1});
  require('../../../dist/sim/finisher-cost').settleFinisherCost(battle,p,move);
  assert.equal(p.hp,750);
 });
 for (const id of ids) it(id+' publishes the increased power and quarter HP cost', () => {
  const move=Dex.moves.get(id);
  assert(move.shortDesc.includes('1/4 HP'));
  assert(move.desc.includes('1/4 max HP'));
  assert(!move.desc.includes('1/8'));
 });
 for (const id of ids) for (const hpPercent of [100,1]) it(id+' calculator matches battle damage and conditional cost, target HP='+hpPercent, () => {
  const c=require('../../../dist/sim/custom-calculator');
  const input={format:'gen9nofieldsinglesgame',move:id,samples:8,seed:42,
   actors:[{species:'Mew',ability:'No Ability'}, {species:'Mew',ability:'No Ability',hpPercent},
    {species:'Mew',ability:'No Ability'}, {species:'Mew',ability:'No Ability'}]};
  const scenario=c.validateScenario(input),damage=[],loss=[];
  for(let sample=0;sample<8;sample++) {
   const {battle:b,mons}=c.buildCalculatorBattle(scenario,sample);
   try {
    const before=mons.map(p=>p.hp),maxhp=mons[0].maxhp;
    b.actions.runMove(id,mons[0],mons[0].getLocOf(mons[1]));
    damage.push(before[1]-mons[1].hp); loss.push(before[0]-mons[0].hp);
    assert.equal(loss[sample],mons[1].hp?Math.max(1,Math.floor(maxhp/4)):0);
   } finally { b.destroy(); }
  }
  const result=c.calculateScenario(input);
  assert.equal(result.results[1].minNetLoss,Math.min(...damage));
  assert.equal(result.results[1].maxNetLoss,Math.max(...damage));
  assert.equal(result.results[0].minNetLoss,Math.min(...loss));
  assert.equal(result.results[0].maxNetLoss,Math.max(...loss));
 });
});
