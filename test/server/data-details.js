'use strict';
const assert=require('assert').strict;
let commands;
const {Dex}=require('../../dist/sim');
function render(cmd,target,dex=Dex){
 let reply='';const user={getIdentity:()=>'+Audit'};
 const context={cmd,runBroadcast:()=>true,splitFormat:()=>({dex,targets:[target]}),sendReply:text=>{reply+=text;},parse:()=>{},run(name){return commands[name].call(this,target,null,user,null,cmd);}};
 commands[cmd].call(context,target,null,user,null,cmd);return reply;
}
describe('Data/details optional Z-move metadata and migrated records',()=>{
 before(()=>{commands=require('../../dist/server/chat-commands/info').commands;});
 for(const cmd of ['data','details'])for(const target of ['Pulverizing Pancake','Splintered Stormshards','Stoked Sparksurfer','Lycanroc-Dusk','Lycanroc','Lycanroc-Midnight','Infernape-Mega','Burning Spirit','Ultra Instinct','Tough Claws','Infiltrator','Defiant','Scrappy','Recharge Relay','Mire Chorus'])it('/'+cmd+' '+target+' renders without missing-array crashes',()=>{
  const html=render(cmd,target);assert(html.length>0);assert(!html.includes('undefined'));
  if(cmd==='details'&&['Pulverizing Pancake','Splintered Stormshards','Stoked Sparksurfer'].includes(target))assert(html.includes('Required Move Type'));
 });
 for(const from of [undefined,[], 'Stone Edge',['Stone Edge','Rock Slide']])for(const users of [undefined,[],['Lycanroc-Dusk']])it('handles optional required moves '+JSON.stringify(from)+' and users '+JSON.stringify(users),()=>{
  const dex=Object.create(Dex);dex.items={get:id=>Object.assign({},Dex.items.get(id),{zMoveFrom:from,itemUser:users,zMoveType:'Rock'})};
  const html=render('details','Splintered Stormshards',dex);assert(!html.includes('undefined'));assert(html.includes(from?.length?'Required Move':'Required Move Type'));
  if(Array.isArray(from)&&from.length)assert(html.includes('Stone Edge / Rock Slide'));
 });
 it('omits absent optional egg groups while still showing custom species passives',()=>{
  const dex=Object.create(Dex);dex.species={get:id=>Object.assign({},Dex.species.get(id),{eggGroups:undefined})};const html=render('details','Lycanroc-Dusk',dex);assert(!html.includes('Egg Group(s)'));assert(html.includes('Tough Claws'));
 });
 it('does not swallow genuine malformed metadata errors',()=>{
  const dex=Object.create(Dex);dex.items={get:id=>Object.assign({},Dex.items.get(id),{zMoveFrom:{length:1}})};
  assert.throws(()=>render('details','Splintered Stormshards',dex),TypeError);
 });
});
