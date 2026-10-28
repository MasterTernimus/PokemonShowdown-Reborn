'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const {Dex} = require('../../../dist/sim');
const impacts = ['rockslide','rocktomb','rockwrecker','avalanche','iciclecrash','mountaingale','bodyslam','stomp','dragonrush','heavyslam','heatcrash','hammerarm','icehammer','dragonhammer','woodhammer','gigatonhammer','dracometeor'];
describe('Swift and Gravity rework', function () {
 let battle; afterEach(() => {battle?.destroy(); battle = null;});
 const set = (species='Mew', ability='No Ability', item='') => ({species, ability, item, moves:['swift','gravity','growl','rockslide']});
 function setup(a=set(),b=set()) {battle=common.createBattle({},[[a],[b]]);return [battle.p1.active[0],battle.p2.active[0]];}
 for(const [atk,spa,boost,expected] of [[200,100,{},'Physical'],[100,200,{},'Special'],[100,100,{},'Special'],[100,200,{atk:3},'Physical'],[200,100,{atk:-3},'Special']]) it(`Swift adapts ${atk}/${spa} ${JSON.stringify(boost)} to ${expected}`,()=>{
  const [p,q]=setup();p.storedStats.atk=atk;p.storedStats.spa=spa;Object.assign(p.boosts,boost);p.setItem('Choice Band');p.status='brn';
  const move=Dex.getActiveMove('swift');battle.singleEvent('ModifyMove',move,{},p,q,move,move);
  assert.equal(move.category,expected);assert.equal(move.overrideOffensiveStat,expected==='Physical'?'atk':'spa');assert.equal(move.overrideDefensiveStat,expected==='Physical'?'def':'spd');assert.equal(move.critRatio,2);assert.equal(move.accuracy,true);assert.equal(move.target,'allAdjacentFoes');assert.equal(Dex.moves.get('swift').category,'Special');
  const seen=[];battle.onEvent('ModifyMove',battle.format,-100,function(m){if(m.id==='swift')seen.push(m.category);});battle.actions.useMove('swift',p,{target:q});assert(seen.includes(expected));
 });
 it('marks exactly the approved impact moves',()=>{assert.deepEqual(Dex.moves.all().filter(m=>m.flags.gravityboost).map(m=>m.id).sort(),impacts.slice().sort());});
 for(const id of [...impacts,'tackle','earthquake','meteorbeam','stoneedge','swift'])it(id+' gains only its intended Gravity power bonus',()=>{
  const [p,q]=setup();const move=Dex.getActiveMove(id);const plain=battle.runEvent('BasePower',p,q,move,1000);battle.field.addPseudoWeather('gravity',p);const changed=battle.runEvent('BasePower',p,q,move,1000);assert.equal(changed,impacts.includes(id)?1300:plain);battle.field.removePseudoWeather('gravity');assert.equal(battle.runEvent('BasePower',p,q,move,1000),plain);
 });
 it('does not carry the impact bonus into Z/Max conversions',()=>{const[p,q]=setup();battle.field.addPseudoWeather('gravity',p);for(const mode of ['isZ','isMax']){const m=Dex.getActiveMove('rockslide');m[mode]=true;assert.equal(battle.runEvent('BasePower',p,q,m,1000),1000);}});
 for(const [ability,item,multiplier] of [['No Ability','',2],['Heavy Metal','',4],['Light Metal','',1],['No Ability','Float Stone',1]])it('doubles effective weight with '+ability+'/'+item,()=>{const[p,q]=setup(set('Mew',ability,item));const raw=p.weighthg;const before=p.getWeight();battle.field.addPseudoWeather('gravity',p);assert.equal(p.getWeight(),raw*multiplier);assert.equal(q.getWeight(),q.weighthg*2);battle.field.removePseudoWeather('gravity');assert.equal(p.getWeight(),before);});
 it('changes Low Kick and Grass Knot thresholds but preserves equal weight ratios',()=>{const[p,q]=setup();q.weighthg=150;p.weighthg=700;const power=id=>Dex.moves.get(id).basePowerCallback.call(battle,p,q,Dex.getActiveMove(id));assert.equal(power('lowkick'),40);assert.equal(power('grassknot'),40);const heavy=power('heavyslam');battle.field.addPseudoWeather('gravity',p);assert.equal(power('lowkick'),60);assert.equal(power('grassknot'),60);assert.equal(power('heavyslam'),heavy);});
 it('retains Void Veil exemption and responds to suppression',()=>{const[p,q]=setup(set('Gardevoir','Void Veil'));const original=p.getWeight();battle.field.addPseudoWeather('gravity',q);assert.equal(p.getWeight(),original);p.addVolatile('gastroacid');assert.equal(p.getWeight(),original*2);p.removeVolatile('gastroacid');assert.equal(p.getWeight(),original);});
 it('applies once to every active Pokemon in doubles and to incoming replacements',()=>{battle=common.createBattle({gameType:'doubles'},[[set(),set(),set()],[set(),set()]]);const p=battle.p1.active[0];battle.field.addPseudoWeather('gravity',p);for(const mon of battle.getAllActive())assert.equal(mon.getWeight(),mon.weighthg*2);battle.makeChoices('switch 3, move growl','move growl, move growl');for(const mon of battle.getAllActive())assert.equal(mon.getWeight(),mon.weighthg*2);battle.field.removePseudoWeather('gravity');for(const mon of battle.getAllActive())assert.equal(mon.getWeight(),mon.weighthg);});
 it('retains Avalanche retaliation and applies Gravity afterward',()=>{const[p,q]=setup();const m=Dex.getActiveMove('avalanche');p.attackedBy.push({source:q,damage:10,thisTurn:true,move:'tackle',slot:q.getSlot()});assert.equal(m.basePowerCallback.call(battle,p,q,m),160);battle.field.addPseudoWeather('gravity',p);assert.equal(battle.runEvent('BasePower',p,q,m,160),208);});
 it('expires cleanly without permanent weight changes',()=>{const[p,q]=setup();battle.field.addPseudoWeather('gravity',p);for(let i=0;i<5;i++)battle.makeChoices('move growl','move growl');assert(!battle.field.getPseudoWeather('gravity'));assert.equal(p.getWeight(),p.weighthg);assert.equal(q.getWeight(),q.weighthg);});
});


describe('Gravity calculator and multiplayer parity', function () {
 const {calculateScenario,validateScenario,buildCalculatorBattle,calculatorFormats}=require('../../../dist/sim/custom-calculator');
 const scenario=(mode,move='rockslide',rooms=['gravity'])=>({format:calculatorFormats().find(f=>f.gameType===mode).id,field:'',move,rooms,samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability',ivs:{},evs:{}}))});
 for(const mode of ['singles','doubles','freeforall'])it(mode+' calculator applies Gravity once per battler and impact',()=>{const built=buildCalculatorBattle(validateScenario(scenario(mode)),0);try{for(const p of built.battle.getAllActive())assert.equal(p.getWeight(),p.weighthg*2);assert.equal(built.battle.runEvent('BasePower',built.mons[0],built.mons[1],Dex.getActiveMove('rockslide'),1000),1300);}finally{built.battle.destroy();}});
 it('publishes current Swift and Gravity effects through the existing calculator engine',()=>{for(const move of ['swift','rockslide','grassknot']){const input=scenario('singles',move),result=calculateScenario(input);assert(result.results[1].max>0);assert(result.resolved.rooms.includes('gravity'));assert.equal(result.move,Dex.moves.get(move).name);}});
 it('preserves Swift spread targeting and its high critical-hit stage',()=>{const built=buildCalculatorBattle(validateScenario(scenario('doubles','swift',[])),0);try{const {battle,mons}=built;const calls=[];battle.randomChance=(n,d)=>{calls.push([n,d]);return false;};battle.actions.runMove('swift',mons[0],mons[0].getLocOf(mons[1]));assert(mons[1].hp<mons[1].maxhp);assert(mons[3].hp<mons[3].maxhp);assert.equal(mons[2].hp,mons[2].maxhp);assert(calls.some(([n,d])=>n===1&&d===8));}finally{built.battle.destroy();}});
});
