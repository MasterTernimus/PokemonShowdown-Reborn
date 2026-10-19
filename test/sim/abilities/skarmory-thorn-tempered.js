'use strict';
const assert=require('assert').strict, common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Skarmory Thorn-Tempered',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(species='Skarmory',ability='No Ability',item='',foe='Mew'){
  const m={species:'Mew',ability:'No Ability',moves:['splash','tackle','bravebird','spikyshield']};
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...m,species},m],[{...m,species:foe,ability,item},m]]);
  b.makeChoices('team 12','team 12');for(const s of b.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4800;
  b.randomChance=(n,d)=>n>=d;return[b.p1.active[0],b.p2.active[0]];
 }
 function hit(p,q,id='tackle'){b.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false}),p,p.getLocOf(q));}
 it('replaces only base passive and keeps slots',()=>{const[p]=setup();assert.deepEqual(p.getPassives(),['thorntempered']);assert.deepEqual(p.species.abilities,{0:'Fresh Plumage',1:'Sturdy',H:'Burning Quake'});});
 for(const a of ['Rough Skin','Iron Barbs','Relentless Hunt'])it('blocks '+a+' retaliation under suppression',()=>{const[p,q]=setup('Skarmory',a,'Rocky Helmet');p.addVolatile('gastroacid');hit(p,q);assert.equal(p.hp,p.maxhp);});
 it('blocks species passive Rough Skin',()=>{const[p,q]=setup('Skarmory','No Ability','','Garchomp');hit(p,q);assert.equal(p.hp,p.maxhp);});
 it('preserves Brave Bird recoil',()=>{const[p,q]=setup('Skarmory','Rough Skin','Rocky Helmet');hit(p,q,'bravebird');assert(p.hp<p.maxhp);assert(b.log.some(l=>l.includes('[from] Recoil')));});
 it('preserves contact status',()=>{const[p,q]=setup('Skarmory','Static');b.randomChance=()=>true;hit(p,q);assert.equal(p.status,'par');});
 it('preserves Spiky Shield damage',()=>{const[p,q]=setup();q.addVolatile('spikyshield');hit(p,q);assert(p.hp<p.maxhp);});
 it('does not protect unrelated attackers',()=>{const[p,q]=setup('Mew','Rough Skin','Rocky Helmet');hit(p,q);assert(p.hp<p.maxhp);});
});
