'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Coalossal entry and Soul-Heart field correction',()=>{
 let battle;afterEach(()=>battle?.destroy());
 function setup(format,ability='Furnace Engine',species='Coalossal-Gmax'){const p={species,ability,moves:['splash']},f={species:'Blissey',ability:'No Ability',moves:['splash']};const ffa=format.includes('freeforall');battle=common.createBattle({formatid:format},ffa?[[p],[f],[f],[f]]:[[p],[f]]);battle.makeChoices(...Array(ffa?4:2).fill('team 1'));return[battle.p1.active[0],battle.p2.active[0]];}
 for(const format of ['gen9freeforall4pmistyfieldadrienn','gen9freeforall4pdragonsden','gen9nofieldsinglesgame'])it('enters safely in '+format,()=>{const[p]=setup(format);assert(p.hp>0);assert.equal(p.ability,'furnaceengine');});
 it('Sky Drop inspection tolerates an unfilled slot but still detects a real carrier',()=>{const[p,t]=setup('gen9nofieldsinglesgame');const active=t.side.active.slice();try{t.side.active=[null,t];assert.equal(p.isSkyDropped(),false);t.volatiles.skydrop={id:'skydrop',source:p};assert.equal(p.isSkyDropped(),true);}finally{t.side.active=active;}});
 for(const ability of ['Soul-Heart','Celestial Heart'])for(const field of ['', 'dragonsdenterrain','mistyterrain','rainbowterrain'])it(ability+' grants the approved rewards on '+(field||'no field'),()=>{const[p]=setup('gen9nofieldsinglesgame',ability,ability==='Soul-Heart'?'Magearna':'Dragonite-Mega');battle.field.terrain=field;battle.singleEvent('AnyFaint',p.getAbility(),p.abilityState,p);assert.equal(p.boosts.spa,1);assert.equal(p.boosts.spd,['mistyterrain','rainbowterrain'].includes(field)?2:0);});
});
