'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Mega Houndoom composite and Pelipper Drizzle passive',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(species='Houndoom-Mega',ability='Hellfire Eclipse',item=''){
  const m={species:'Mew',ability:'No Ability',moves:['splash','ember','tackle']};
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...m,species,ability,item},m],[m,m]]);b.makeChoices('team 12','team 12');
  for(const s of b.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4800;b.randomChance=(n,d)=>n>=d;return[b.p1.active[0],b.p2.active[0]];
 }
 function hit(p,q){b.actions.runMove(Object.assign(Dex.getActiveMove('ember'),{accuracy:true,willCrit:false}),p,p.getLocOf(q));}
 it('changes Mega only and inherits precisely the approved components',()=>{const[p,q]=setup();assert.deepEqual(p.getPassives(),['solarpower']);assert.deepEqual(Dex.species.get('houndoom').passives,['agonyflame']);for(const id of ['darkaura','agonyflame','intimidate'])assert(p.hasAbility(id));assert(!p.hasAbility('flashfire'));assert.equal(q.boosts.atk,-1);});
 it('allows Fire damage and no longer creates sunlight',()=>{const[p,q]=setup();const hp=p.hp;hit(q,p);assert(p.hp<hp);assert(!p.volatiles.flashfire);hit(p,q);assert.equal(b.field.weather,'');});
 it('inherits Dark Aura and Cold Eclipse hail immunity',()=>{const[p,q]=setup();assert.equal(b.runEvent('BasePower',q,p,Dex.getActiveMove('darkpulse'),120),160);const move=Object.assign(Dex.getActiveMove('darkpulse'),{hasAuraBreak:true});assert.equal(b.runEvent('BasePower',q,p,move,120),90);b.field.terrain='coldeclipseterrain';assert(!p.runStatusImmunity('hail'));});
 it('Agony Flame burns and Heal Blocks once after HP damage',()=>{const[p,q]=setup();hit(p,q);assert.equal(q.status,'brn');assert.equal(q.volatiles.healblock.duration,2);assert.equal(b.log.filter(l=>l.includes('|-status|p2a:')&&l.includes('|brn')).length,1);});
 it('suppression disables composite but not Solar Power',()=>{const[p,q]=setup();p.addVolatile('gastroacid');hit(p,q);assert.equal(q.status,'');assert(!q.volatiles.healblock);b.field.setWeather('sunnyday',p);const move=Dex.getActiveMove('tackle');assert.equal(b.runEvent('ModifySpA',p,q,move,100),150);assert.equal(b.runEvent('ModifyAtk',p,q,move,100),150);const hp=p.hp;b.fieldEvent('Residual');assert.equal(hp-p.hp,600);});
 it('Cold Eclipse disables both local Solar Power effects',()=>{const[p,q]=setup();b.field.terrain='coldeclipseterrain';b.field.setWeather('sunnyday',p);assert.equal(b.runEvent('ModifySpA',p,q,Dex.getActiveMove('tackle'),100),100);const hp=p.hp;b.fieldEvent('Residual');assert.equal(p.hp,hp);});
 it('selected Solar Power does not double the passive boost or HP cost',()=>{const[p,q]=setup('Houndoom-Mega','Solar Power');b.field.setWeather('sunnyday',p);assert.equal(b.runEvent('ModifySpA',p,q,Dex.getActiveMove('tackle'),100),150);const hp=p.hp;b.fieldEvent('Residual');assert.equal(hp-p.hp,600);});
 it('Agony Flame requires opposing HP damage',()=>{const[p,q]=setup();q.addVolatile('substitute');hit(p,q);assert.equal(q.status,'');assert(!q.volatiles.healblock);});
 for(const item of ['', 'Damp Rock'])it('Pelipper passive rain entry, item='+item,()=>{const[p]=setup('Pelipper','No Ability',item);assert.deepEqual(p.getPassives(),['drizzle']);assert.equal(b.field.weather,'raindance');assert.equal(b.field.weatherState.duration,item?8:5);p.addVolatile('gastroacid');b.field.clearWeather();b.makeChoices('switch 2','move splash');b.makeChoices('switch 2','move splash');assert.equal(b.field.weather,'raindance');});
 it('selected Drizzle and passive produce one rain start',()=>{setup('Pelipper','Drizzle');assert.equal(b.log.filter(l=>l.startsWith('|-weather|RainDance')).length,1);});
});
