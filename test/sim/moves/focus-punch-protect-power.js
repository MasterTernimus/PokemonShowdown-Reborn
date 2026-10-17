'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Focus Punch custom power', () => {
 let battle;
 afterEach(() => battle?.destroy());
 function setup(reply, ability = 'No Ability') {
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'}, [
   [{species:'Chansey',ability,moves:['focuspunch']}],
   [{species:'Mew',ability:'No Ability',moves:[reply]}],
  ]);
  battle.makeChoices('team 1','team 1');
  for(const p of battle.getAllActive())p.getPassives=()=>[];
  battle.randomizer=damage=>damage;
  battle.onEvent('ModifyMove',battle.format,move=>{move.willCrit=false;});
  return battle.getAllActive();
 }
 for(const reply of ['splash','protect','detect','kingsshield','spikyshield','banefulbunker','obstruct','silktrap','burningbulwark','matblock']) {
  it('uses '+(['splash','tackle'].includes(reply)?150:75)+' BP against '+reply,()=>{
   const [p,q]=setup(reply),power=['splash','tackle'].includes(reply)?150:75;
   const expected=battle.actions.getDamage(p,q,{...battle.dex.getActiveMove('focuspunch'),basePower:power,onBasePower:undefined,willCrit:false});
   const hp=q.hp;battle.makeChoices('move 1','move 1');
   assert.equal(hp-q.hp,expected);
   assert(!battle.log.some(line=>line.includes('|cant|')&&line.includes('Focus Punch')));
  });
 }
 for(const ability of ['No Ability','Inner Focus','Parental Bond']) {
  it(ability+' fails if disturbed without Focus Energy',()=>{
   const [p,q]=setup('tackle',ability),hp=q.hp;
   battle.makeChoices();assert.equal(q.hp,hp);
   assert(battle.log.some(line=>line.includes('|cant|')&&line.includes('Focus Punch')));
  });
  for(const reply of ['tackle','protect'])it(ability+' keeps Focus Energy power against '+reply,()=>{
   const [p,q]=setup(reply,ability);p.addVolatile('focusenergy');
   const power=reply==='protect'?75:150;
   const move={...battle.dex.getActiveMove('focuspunch'),basePower:power,onBasePower:undefined,willCrit:false};
   let expected=battle.actions.getDamage(p,q,move);
   if(ability==='Parental Bond')expected+=battle.actions.getDamage(p,q,{...move,hit:2,multihitType:'parentalbond'});
   const hp=q.hp;battle.makeChoices();assert.equal(hp-q.hp,expected);
   if(ability==='Parental Bond')assert(battle.log.some(line=>line.includes('|-hitcount|')&&line.endsWith('|2')));
  });
 }
 it('does not bypass Fighting immunity',()=>{
  const [p,q]=setup('protect');q.setType('Ghost');const hp=q.hp;
  battle.makeChoices('move 1','move 1');assert.equal(q.hp,hp);
 });
});
