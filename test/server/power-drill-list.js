'use strict';
const assert=require('assert').strict;
const {Dex}=require('../../dist/sim');
describe('Power Drill command discovery',()=>{
 it('both aliases list every drill and horn move, including Horn Attack, without Lunge',()=>{
  const {commands}=require('../../dist/server/chat-plugins/datasearch');
  assert.equal(commands.horn,'drill');let html='';
  commands.drill.call({checkBroadcast(){},sendReplyBox(value){html=value;}},'',null,null);
  for(const move of Dex.moves.all().filter(m=>m.exists&&(m.flags.drill||m.flags.horn)))assert(html.includes('/moves/'+move.id+'"'),move.name);
  assert(html.includes('Horn Attack'));assert(!html.includes('/moves/lunge"'));
 });
 it('Horn Attack already gets the existing horn multiplier without a drill flag',()=>{
  const move=Dex.moves.get('hornattack');assert(move.flags.horn);assert(!move.flags.drill);
  const power=Dex.abilities.get('powerdrill');for(const [field,multiplier]of [[false,1.5],[true,2]])assert.equal(power.onBasePower.call({field:{isTerrain:()=>field},chainModify:x=>x},90,null,null,move),multiplier);
 });
});
