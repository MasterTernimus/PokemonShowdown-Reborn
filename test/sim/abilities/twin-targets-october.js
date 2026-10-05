'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Twin strike targeting',()=>{
 let battle;
 afterEach(()=>battle?.destroy());
 function setup(ability,format='ffa'){
  const p={species:'Mew',ability,moves:['splash']},f={species:'Mew',ability:'No Ability',moves:['splash']};
  const formats={ffa:'gen9freeforall4pmistyfieldadrienn',multi:'gen9multimistyfieldadrienn',doubles:'gen9nofielddoublesbattle',singles:'gen9nofieldsinglesgame'};
  const teams=['ffa','multi'].includes(format)?[[p,f],[f,f],[f,f],[f,f]]:format==='doubles'?[[p,f],[f,f,f]]:[[p,f],[f,f]];
  battle=common.createBattle({formatid:formats[format]},teams);
  battle.makeChoices(...teams.map(t=>t.length===3?'team 123':'team 12'));
  battle.randomChance=(n,d)=>n>=d;battle.randomizer=n=>n;
  return [battle.p1.active[0],battle.p2.active[0]];
 }
 function hit(p,t,extra={}){
  const m=battle.dex.getActiveMove(p.ability==='twincannons'?'psychic':'bitterblade');
  Object.assign(m,{accuracy:true,willCrit:false,basePower:30,secondaries:undefined,drain:undefined},extra);
  const events=[],original=battle.actions.getDamage;
  battle.actions.getDamage=function(s,target,move,...args){const result=original.call(this,s,target,move,...args);if(s===p&&move?.multihitType)events.push({target,hit:move.hit,damage:result,stat:move.overrideDefensiveStat,ignore:move.ignorePositiveDefensive});return result;};
  try{battle.actions.useMove(m,p,{target:t});}finally{battle.actions.getDamage=original;}
  return events;
 }
 for(const ability of ['Twin Cannons','Twin Blades']){
  it(ability+' redirects a Multi KO only to the other opposing trainer',()=>{
   const[p,t]=setup(ability,'multi');t.hp=1;const ally=battle.p3.active[0],hp=ally.hp,events=hit(p,t);assert.equal(events.length,2);assert.equal(events[1].target,battle.p4.active[0]);assert.equal(ally.hp,hp);assert.equal(battle.runEvent('BasePower',p,events[1].target,battle.activeMove,100,true),50);
  });
  it(ability+' splits FFA across selected and another foe at its approved power',()=>{
   const[p,t]=setup(ability),events=hit(p,t);assert.equal(events.length,2);assert.equal(events[0].target,t);assert.notEqual(events[1].target,t);assert(!events[1].target.isAlly(p));assert.deepEqual(events.map(e=>e.hit),[1,2]);
   if(ability==='Twin Cannons')assert.deepEqual(events.map(e=>e.stat),['spd','def']);else assert.deepEqual(events.map(e=>!!e.ignore),[false,true]);
   const m=battle.activeMove;m.hit=1;assert.equal(battle.runEvent('BasePower',p,t,m,100,true),ability==='Twin Blades'?60:100);m.hit=2;assert.equal(battle.runEvent('BasePower',p,t,m,100,true),ability==='Twin Blades'?60:100);
  });
  it(ability+' redirects KO in doubles without a spillover power penalty',()=>{
   const[p,t]=setup(ability,'doubles');t.hp=1;const allyHP=p.side.active[1].hp,events=hit(p,t);assert.equal(events.length,2);assert.equal(events[1].target,battle.p2.active[1]);assert.equal(p.side.active[1].hp,allyHP);assert.equal(battle.activeMove.spilloverDamageModifier,undefined);assert.equal(battle.runEvent('BasePower',p,events[1].target,battle.activeMove,100,true),50);
  });
  it(ability+' keeps two half-power hits on a surviving singles target',()=>{
   const[p,t]=setup(ability,'singles'),events=hit(p,t);assert.equal(events.length,2);assert(events.every(e=>e.target===t));assert.equal(battle.runEvent('BasePower',p,t,battle.activeMove,100,true),50);
  });
  it(ability+' stops on singles KO without striking the reserve',()=>{
   const[p,t]=setup(ability,'singles');t.hp=1;const reserve=t.side.pokemon[1],hp=reserve.hp;assert.equal(hit(p,t).length,1);assert.equal(reserve.hp,hp);
  });
  it(ability+' falls back to the original FFA enemy when the others are unavailable',()=>{
   const[p,t]=setup(ability);for(const s of battle.sides.slice(2))s.active[0].hp=0;const events=hit(p,t);assert.equal(events.length,2);assert(events.every(e=>e.target===t));
  });
  it(ability+' excludes protected and immune secondary targets',()=>{
   const[p,t]=setup(ability);battle.p3.active[0].addVolatile('protect');const other=battle.p4.active[0];if(ability==='Twin Cannons')other.setType('Dark');else other.setAbility('Flash Fire');const events=hit(p,t);assert.equal(events.length,2);assert(events.every(e=>e.target===t));
  });
  it(ability+' does not escape first-target Protect or immunity',()=>{
   const[p,t]=setup(ability);t.addVolatile('protect');assert.equal(hit(p,t).length,0);t.removeVolatile('protect');if(ability==='Twin Cannons')t.setType('Dark');else t.setAbility('Flash Fire');assert.equal(hit(p,t).length,0);
  });
  it(ability+' can break a substitute and still redirect its second FFA hit',()=>{
   const[p,t]=setup(ability);t.addVolatile('substitute');t.volatiles.substitute.hp=1;const hp=t.hp,events=hit(p,t);assert.equal(events.length,2);assert.equal(t.hp,hp);assert.notEqual(events[1].target,t);
  });
  it(ability+' stops if contact recoil faints the attacker',()=>{
   const[p,t]=setup(ability);p.hp=1;t.setAbility('Iron Barbs');const events=hit(p,t,{flags:{contact:1,slicing:1,protect:1}});assert.equal(p.hp,0);assert.equal(events.length,1);
  });
  it(ability+' rolls secondaries only on the selected target',()=>{
   const[p,t]=setup(ability),events=hit(p,t,{secondaries:[{chance:100,boosts:{spe:-1}}]});assert.equal(t.boosts.spe,-1);assert.equal(events[1].target.boosts.spe,0);
  });
  it(ability+' preserves exclusions and never expands an existing multihit',()=>{
   const[p,t]=setup(ability);for(const extra of [{category:'Status'},{multihit:3},{isZ:true},{isMax:true},{damage:20},{target:'allAdjacentFoes'},{type:'Water'}]){
    const m=battle.dex.getActiveMove(ability==='Twin Cannons'?'psychic':'bitterblade');Object.assign(m,extra);battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert.equal(m.multihitType,undefined);
   }
  });
 }
 it('Twin Cannons really uses the second foe Defense, not its Sp. Def',()=>{
  const[p,t]=setup('Twin Cannons');for(const s of battle.sides.slice(1)){s.active[0].storedStats.def=50;s.active[0].storedStats.spd=500;}const events=hit(p,t);assert(events[1].damage>events[0].damage*4);
 });
 it('Twin Blades ignores positive Defense only on its second hit',()=>{
  const[p,t]=setup('Twin Blades');for(const s of battle.sides.slice(1))s.active[0].boosts.def=6;const events=hit(p,t);assert(events[1].damage>events[0].damage*2);
 });
 it('uses battle sampling and excludes a newly entered replacement',()=>{
  const[p,t]=setup('Twin Cannons'),old=battle.p3.active[0],reserve=battle.p3.pokemon[1],hp=reserve.hp;
  let sampled;const sample=battle.sample.bind(battle);battle.sample=list=>{if(list.length&&list[0]?.side){sampled=list.slice();return list[list.length-1];}return sample(list);};
  const damage=battle.actions.getDamage;let changed=false;
  battle.actions.getDamage=function(s,target,move,...rest){const result=damage.call(this,s,target,move,...rest);if(s===p&&!changed){changed=true;old.isActive=false;reserve.isActive=true;reserve.position=old.position;battle.p3.active[0]=reserve;}return result;};
  const events=hit(p,t);assert.equal(events[1].target,battle.p4.active[0]);assert(!sampled.includes(reserve));assert.equal(reserve.hp,hp);
 });
});
