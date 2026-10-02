'use strict';
const assert=require('assert').strict;
describe('Ability lookup command wiring',()=>{
 for(const cmd of ['data','dt','details'])it(`/${cmd} includes full mechanics outside its compact row`,()=>{
  const {commands}=require('../../dist/server/chat-commands/info');let reply;
  commands.data.call({runBroadcast:()=>true,splitFormat:()=>({dex:Dex,targets:['Heavy Artillery']}),sendReply:text=>{reply=text;}},'Heavy Artillery',null,{getIdentity:()=>'+Tester'},null,cmd);
  assert(reply.includes('Full mechanics'));assert(reply.includes('designated primary target'));assert(reply.includes('/dt Unaware, gen9'));
  assert(reply.split('\n').filter(x=>x.includes('|/raw ')).length>=2);
 });
});
