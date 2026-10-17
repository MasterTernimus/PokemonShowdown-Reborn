const assert=require('assert').strict,common=require('../../common');describe('Cold Logic actual Mega knockout retaliation',()=>{let battle;afterEach(()=>{battle?.destroy();battle=null;});for(const move of ['earthquake','shadowball','flamethrower','tackle','seismictoss','fissure'])for(const reserve of [false,true])it(move+' knockout after real Mega Evolution, reserve='+reserve,()=>{const team=[{species:'Metagross',item:'Metagrossite',ability:'Clear Body',moves:['splash']}];if(reserve)team.push({species:'Mew',ability:'No Ability',moves:['splash']});battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[team,[{species:'Mew',ability:'No Ability',moves:[move]}]]);battle.makeChoices(...[team,[0]].map(t=>'team '+t.map((_,i)=>i+1).join('')));const p=battle.p1.active[0],q=battle.p2.active[0];p.hp=1;q.storedStats.atk=q.storedStats.spa=100000;battle.randomChance=()=>true;battle.randomizer=x=>x;const hp=q.hp;battle.makeChoices('move splash mega','move '+move);assert(battle.log.some(l=>l.startsWith('|-mega|')&&l.includes('Metagross')));assert.equal(p.hp,0);assert.equal(q.hp,hp-Math.floor(q.baseMaxhp/4));assert.equal(battle.log.filter(l=>l.includes('executed its final contingency')).length,1);});});

describe('Cold Logic suppression after actual Mega Evolution',()=>{
 let battle;afterEach(()=>{battle?.destroy();battle=null;});
 for(const mode of ['gastroacid','neutralizinggas','moldbreaker','burn'])it(mode,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Metagross',item:'Metagrossite',ability:'Clear Body',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['splash','shadowball']}]]);
  battle.makeChoices('team 12','team 1');battle.makeChoices('move splash mega','move splash');
  const p=battle.p1.active[0],q=battle.p2.active[0];assert.equal(p.species.id,'metagrossmega');assert.equal(p.ability,'coldlogic');p.hp=1;
  if(mode==='gastroacid')p.addVolatile('gastroacid',q);
  if(mode==='neutralizinggas')q.setAbility('Neutralizing Gas');
  if(mode==='moldbreaker')q.setAbility('Mold Breaker');
  const hp=q.hp;
  if(mode==='burn'){p.setStatus('brn',q);battle.makeChoices('move splash','move splash');}
  else battle.makeChoices('move splash','move shadowball');
  assert.equal(p.hp,0);assert.equal(q.hp,hp-(mode==='moldbreaker'?Math.floor(q.baseMaxhp/4):0));
 });
});
