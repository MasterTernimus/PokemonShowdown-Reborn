'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
function setup(ability='No Ability',item=''){
 const mon=(ability,item)=>({species:'Mew',ability,item,moves:['skullbash','splash']});
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon(ability,item)],[mon('No Ability','')]]);
 if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';battle.randomizer=n=>n;
 const p=battle.p1.active[0],q=battle.p2.active[0];p.maxhp=p.baseMaxhp=1000;p.hp=400;q.hp=q.maxhp=q.baseMaxhp=10000;return[p,q];
}
function use(p,q,extra={}){const move=Object.assign(Dex.getActiveMove('skullbash'),{accuracy:true,willCrit:false,damage:20},extra);battle.actions.runMove(move,p,p.getLocOf(q));}
describe('Skull Bash 15 percent recovery',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('keeps 80 power, charge/contact flags and no healing or drain classification',()=>{const move=Dex.moves.get('skullbash');assert.equal(move.basePower,80);assert.equal(move.priority,0);assert(move.flags.charge);assert(move.flags.contact);assert(!move.flags.heal);assert(!move.drain);assert.match(move.desc,/15%/);});
 it('does not heal on charge; heals 15 percent once after its damaging turn',()=>{const[p,q]=setup();use(p,q);assert.equal(p.hp,400);assert.equal(q.hp,10000);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert(p.volatiles.skullbash);assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),80);use(p,q);assert.equal(p.hp,550);assert(q.hp<10000);});
 for(const kind of ['miss','protect','immunity'])it('does not heal after '+kind,()=>{const[p,q]=setup('No Ability','Power Herb');if(kind==='protect')q.addVolatile('protect');if(kind==='immunity')q.setType('Ghost');use(p,q,{accuracy:kind==='miss'?0:true});assert.equal(p.hp,400);});
 it('preserves existing no-recovery behavior for Substitute-only damage',()=>{const[p,q]=setup('No Ability','Power Herb');q.addVolatile('substitute');q.volatiles.substitute.hp=100;use(p,q);assert.equal(p.hp,400);assert.equal(q.volatiles.substitute.hp,80);});
 it('extra hits grant one recovery for the entire damaging use',()=>{const[p,q]=setup('No Ability','Power Herb');use(p,q,{multihit:3});assert.equal(q.hp,9940);assert.equal(p.hp,550);});
 it('caps at current maximum HP',()=>{const[p,q]=setup('No Ability','Power Herb');p.hp=970;use(p,q);assert.equal(p.hp,1000);});
 it('uses base maximum HP and native integer rounding',()=>{const[p,q]=setup('No Ability','Power Herb');p.baseMaxhp=333;p.maxhp=666;p.hp=100;use(p,q);assert.equal(p.hp,149);});
 it('Heal Block stops recovery without stopping its damaging attack',()=>{const[p,q]=setup('No Ability','Power Herb');p.addVolatile('healblock',q);use(p,q);assert.equal(p.hp,400);assert.equal(q.hp,9980);});
 it('contact recoil fainting prevents recovery or revival',()=>{const[p,q]=setup('No Ability','Power Herb');p.hp=1;q.setAbility('Rough Skin');use(p,q);assert.equal(p.hp,0);assert.equal(q.hp,9980);});
 it('Power Herb keeps charge boosts and skips charge protection',()=>{const[p,q]=setup('No Ability','Power Herb');use(p,q);assert.equal(p.item,'');assert.equal(p.hp,550);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert(!p.volatiles.skullbash);assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),100);});
 for(const ability of ['Serene Grace'])it(ability+' retains the existing charge-skipping attack and new recovery',()=>{const[p,q]=setup(ability);use(p,q);assert.equal(q.hp,9980);assert.equal(p.hp,550);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert(!p.volatiles.skullbash);});
 it('preserves the existing Encore Aria charge behavior while raising its eventual recovery',()=>{const[p,q]=setup('Encore Aria');use(p,q);assert.equal(q.hp,10000);assert.equal(p.hp,400);assert(p.volatiles.skullbash);use(p,q);assert.equal(q.hp,9980);assert.equal(p.hp,550);});
});
