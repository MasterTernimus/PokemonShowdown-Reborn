'use strict';const assert=require('assert').strict,common=require('../../common');const{Dex}=require('../../../dist/sim');let battle;
function setup(a='No Ability',b='No Ability'){const set=ability=>({species:'Mew',ability,moves:['meditate','aquabatics','splash','tackle']});battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[set(a),set('No Ability')],[set(b),set('No Ability')]]);battle.makeChoices('team 12','team 12');return[battle.p1.active[0],battle.p2.active[0]];}
function use(p,id='meditate'){battle.actions.useMove(id,p);}
describe('Meditate elapsed-turn cooldown and Aquabatics dance',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('heals quarter HP, chooses Attack on ties and never boosts Speed',()=>{const[p]=setup();p.hp=1;const hp=p.hp;use(p);assert.equal(p.hp-hp,Math.round(p.baseMaxhp/4));assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,0);assert.equal(p.boosts.spe,0);});
 it('uses staged offense',()=>{const[p]=setup();p.boosts.spa=1;use(p);assert.equal(p.boosts.spa,2);assert.equal(p.boosts.atk,0);});
 it('blocks same-turn and next-turn calls; elapsed idle turn restores availability',()=>{const[p]=setup();use(p);const turn=battle.turn;use(p);assert.equal(p.boosts.atk,1);battle.turn=turn+1;use(p);assert.equal(p.boosts.atk,1);battle.turn=turn+2;use(p);assert.equal(p.boosts.atk,2);});
 it('disables the next-turn choice and restores after another move',()=>{const[p]=setup();battle.makeChoices('move meditate','move splash');assert(p.getMoves().find(x=>x.id==='meditate').disabled);battle.makeChoices('move splash','move splash');assert(!p.getMoves().find(x=>x.id==='meditate').disabled);battle.makeChoices('move meditate','move splash');assert.equal(p.boosts.atk,2);});
 it('full HP still boosts; capped offense still heals; total failure sets no cooldown',()=>{let[p]=setup();use(p);assert.equal(p.boosts.atk,1);battle.destroy();[p]=setup();p.boosts.atk=6;p.hp=1;use(p);assert(p.hp>1);assert(p.volatiles.meditate);battle.destroy();[p]=setup();p.boosts.atk=6;use(p);assert(!p.volatiles.meditate);p.hp=1;use(p);assert(p.volatiles.meditate);});
 it('switch-out clears the restriction',()=>{const[p]=setup();use(p);battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert.equal(battle.p1.active[0],p);assert(!p.volatiles.meditate);use(p);assert.equal(p.boosts.atk,1);});
 it('Heal Block prevents execution without consuming cooldown',()=>{const[p,q]=setup();p.addVolatile('healblock',q);battle.actions.runMove('meditate',p);assert(!p.volatiles.meditate);assert.equal(p.boosts.atk,0);});
 it('Taunt prevents execution without consuming cooldown',()=>{const[p,q]=setup();p.addVolatile('taunt',q);battle.actions.runMove('meditate',p);assert(!p.volatiles.meditate);});
 for(const field of ['psychicterrain','rainbowterrain','ashenbeachterrain'])it('no extra boosts on '+field,()=>{const[p]=setup();battle.field.startTerrain(field);use(p);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,0);assert.equal(p.boosts.spe,0);});
 it('has the healing flag and receives local Triage priority',()=>{const[p,q]=setup('Triage');const move=Dex.getActiveMove('meditate');assert(move.flags.heal);assert.equal(battle.runEvent('ModifyPriority',p,q,move,0),3);});
 it('Aquabatics is a dance; existing Dancer self-use boost is preserved without recursion',()=>{const[p,q]=setup('Dancer','Dancer');assert(Dex.moves.get('aquabatics').flags.dance);battle.makeChoices('move aquabatics','move splash');assert.equal(p.boosts.spa,2);assert.equal(p.boosts.spe,2);assert.equal(q.boosts.spa,1);assert.equal(q.boosts.spe,1);assert.equal(battle.log.filter(l=>l.startsWith('|move|')&&l.includes('|Aquabatics|')).length,2);});
 it('Big Top Aquabatics keeps existing boosted amounts',()=>{const[p,q]=setup('No Ability','Dancer');battle.field.startTerrain('bigtopterrain');battle.makeChoices('move aquabatics','move splash');for(const x of[p,q]){assert.equal(x.boosts.spa,2);assert.equal(x.boosts.spe,2);}});
});

describe('Meditate called-move boundaries',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('Instruct cannot repeat a successful Meditate',()=>{const[p,q]=setup();battle.actions.runMove('meditate',p);assert.equal(p.boosts.atk,1);battle.actions.useMove('instruct',q,{target:p});assert.equal(p.boosts.atk,1);});
 it('Haze and Transform do not erase the successful-use cooldown',()=>{const[p,q]=setup();use(p);const turn=p.volatiles.meditate.lastSuccess;battle.actions.useMove('haze',q);assert.equal(p.boosts.atk,0);p.transformInto(q);assert.equal(p.volatiles.meditate.lastSuccess,turn);use(p);assert.equal(p.boosts.atk,0);});
 it('Snatch applies healing, boost and cooldown to the actual recipient',()=>{const[p,q]=setup();q.hp=1;q.addVolatile('snatch',q);use(p);assert.equal(p.boosts.atk,0);assert(!p.volatiles.meditate);assert.equal(q.boosts.atk,1);assert(q.hp>1);assert(q.volatiles.meditate);use(q);assert.equal(q.boosts.atk,1);});
});
