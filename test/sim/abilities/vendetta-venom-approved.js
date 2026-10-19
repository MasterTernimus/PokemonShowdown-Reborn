'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Approved Vendetta, poison armor and Mienshao',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(ability='Vendetta',species='Mew'){
  const m={species:'Mew',ability:'No Ability',moves:['splash','tackle','metalclaw','doublehit','ember']};
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{...m,species,ability},m],[m,m]]);b.makeChoices('team 12','team 12');
  for(const s of b.sides)for(const p of s.pokemon)p.hp=p.maxhp=p.baseMaxhp=4800;b.randomChance=(n,d)=>n>=d;return[b.p1.active[0],b.p2.active[0]];
 }
 function hit(source,target,id='tackle'){b.actions.runMove(Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false}),source,source.getLocOf(target));}
 it('Vendetta inherits full Inner Focus',()=>{const[p,q]=setup();assert(p.hasAbility('innerfocus'));assert(!p.addVolatile('flinch',q));b.boost({atk:-1},p,q,Dex.abilities.get('intimidate'));assert.equal(p.boosts.atk,0);});
 it('Taunts once across multiple hits and ability restarts',()=>{const[p,q]=setup();hit(q,p,'doublehit');assert(q.volatiles.taunt);assert(p.volatiles.vendettaspent);q.removeVolatile('taunt');p.setAbility('No Ability');p.setAbility('Vendetta');hit(q,p);assert(!q.volatiles.taunt);assert(!p.volatiles.vendetta);assert(!q.volatiles.vendettatrap);});
 it('resets only after switching out and returning',()=>{const[p,q]=setup();hit(q,p);q.removeVolatile('taunt');b.makeChoices('switch 2','move splash');b.makeChoices('switch 2','move splash');hit(q,p);assert(q.volatiles.taunt);});
 it('Substitute and Protect do not spend the use',()=>{const[p,q]=setup();p.addVolatile('substitute');hit(q,p);assert(!p.volatiles.vendettaspent);p.removeVolatile('substitute');p.addVolatile('protect');hit(q,p);assert(!p.volatiles.vendettaspent);});
 it('a blocked Taunt spends the single attempt',()=>{const[p,q]=setup();q.setAbility('Oblivious');hit(q,p);assert(!q.volatiles.taunt);assert(p.volatiles.vendettaspent);q.setAbility('No Ability');hit(q,p);assert(!q.volatiles.taunt);});
 it('suppression prevents activation',()=>{const[p,q]=setup();p.addVolatile('gastroacid');hit(q,p);assert(!q.volatiles.taunt);assert(!p.volatiles.vendettaspent);});
 it('a fatal hit cannot Taunt its attacker',()=>{const[p,q]=setup();p.hp=1;hit(q,p);assert(!q.volatiles.taunt);});
 it('self or allied damage cannot spend Vendetta',()=>{const[p,q]=setup();const ally=p.side.pokemon[1];b.singleEvent('DamagingHit',p.getAbility(),p.abilityState,1,p,ally,Dex.getActiveMove('tackle'));b.singleEvent('DamagingHit',p.getAbility(),p.abilityState,1,p,p,Dex.getActiveMove('tackle'));assert(!p.volatiles.vendettaspent);});
 it('suppression cannot replenish a spent Vendetta use',()=>{const[p,q]=setup();hit(q,p);q.removeVolatile('taunt');p.addVolatile('gastroacid');p.removeVolatile('gastroacid');hit(q,p);assert(!q.volatiles.taunt);});
 it('Toxic Armor remains unsuppressible and protects poisoned Attack',()=>{const[p,q]=setup('Toxic Armor');p.status='tox';b.actions.runMove(Dex.getActiveMove('gastroacid'),q,q.getLocOf(p));assert(!p.ignoringAbility());b.boost({atk:-1},p,q);assert.equal(p.boosts.atk,0);});
 it('Mienshao Infiltrator actually bypasses Substitute',()=>{const[p,q]=setup('Infiltrator','Mienshao');q.addVolatile('substitute');const hp=q.hp;hit(p,q);assert(q.hp<hp);assert(q.volatiles.substitute);});
 for(const ability of ['Venom Armor','Toxic Armor'])for(const status of ['', 'psn','tox','brn'])it(ability+' Attack protection, status='+status,()=>{const[p,q]=setup(ability);p.status=status;b.boost({atk:-1,def:-1},p,q);assert.equal(p.boosts.atk,['psn','tox'].includes(status)?0:-1);assert.equal(p.boosts.def,-1);const atk=p.boosts.atk;b.boost({atk:-1},p,p);assert.equal(p.boosts.atk,atk-1);assert(p.hasAbility('dualwield'));const move=Dex.getActiveMove('metalclaw');b.runEvent('ModifyMove',p,q,move,move);assert.equal(move.multihit,2);});
 it('Toxic Armor retains Violent Rush and priority preparation callbacks',()=>{const[p]=setup('Toxic Armor');assert(p.hasAbility('violentrush'));assert.equal(typeof p.getAbility().onModifyPriority,'function');});
 it('Mienshao changes only the approved slot',()=>{const s=Dex.species.get('mienshao');assert.deepEqual(s.abilities,{0:'Inner Focus',1:'Regenerator',H:'Infiltrator'});assert.deepEqual(s.passives,['limber']);assert.deepEqual(s.types,['Fighting']);assert.deepEqual(Object.values(s.baseStats),[65,125,60,95,60,105]);});
 it('Infernal Dominion no longer generates Fire Spin or a trap',()=>{const[p,q]=setup('Infernal Dominion','Charizard');hit(p,q,'ember');assert(!q.volatiles.partiallytrapped);assert(!b.log.some(l=>/Fire Spin/.test(l)));assert(p.volatiles.moltenguard);});
});
