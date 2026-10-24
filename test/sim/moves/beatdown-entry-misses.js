'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Beatdown per-hit misses and entry budget',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
 function setup(item='',ability='No Ability',foeAbility='No Ability') {
  const mon=(a='No Ability',i='')=>({species:'Mew',ability:a,item:i,moves:['beatdown','tackle','splash','protect']});
  b=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[mon(ability,item),mon()],[mon(foeAbility),mon()]]);
  if(b.requestState==='teampreview')b.makeChoices('team 12','team 12');b.field.terrain='';
  for(const side of b.sides)for(const p of side.pokemon)p.hp=p.maxhp=p.baseMaxhp=5000;
  return [b.p1.active[0],b.p2.active[0]];
 }
 function attack(p,q,miss=0,extra={}) {
  let checks=0;const random=b.randomChance.bind(b);b.randomChance=(n,d)=>n===95&&d===100?(++checks!==miss):random(n,d);
  const move=Object.assign(Dex.getActiveMove('beatdown'),{willCrit:false,damage:20},extra),before=q.hp;
  b.actions.runMove(move,p,p.getLocOf(q),{externalMove:true});b.randomChance=random;
  return {checks,damage:before-q.hp,result:p.moveThisTurnResult};
 }
 for(const miss of[1,2,3])it('boosts and stops on hit '+miss+' miss, preserving earlier hit success',()=>{const[p,q]=setup();const out=attack(p,q,miss);assert.equal(out.checks,miss);assert.equal(out.damage,(miss-1)*20);assert.equal(p.boosts.atk,2);assert.equal(!!out.result,miss>1);assert.equal(!!q.volatiles.taunt,miss>1);assert(p.m.beatdownMissSpent);});
 it('shares one budget between full and partial misses in either order',()=>{for(const sequence of[[1,2,3],[2,1,3]]){const[p,q]=setup();for(const miss of sequence){attack(p,q,miss);assert.equal(p.boosts.atk,2);}b.destroy();b=null;}});
 it('does not spend eligibility when all three hits land',()=>{const[p,q]=setup();const out=attack(p,q);assert.equal(out.checks,3);assert.equal(out.damage,60);assert(out.result);assert.equal(p.boosts.atk,0);assert(!p.m.beatdownMissSpent);attack(p,q,2);assert.equal(p.boosts.atk,2);});
 it('resets only on actual switch-out/in',()=>{const[p,q]=setup();attack(p,q,1);b.makeChoices('switch 2','move tackle');b.makeChoices('switch 2','move tackle');assert.equal(b.p1.active[0],p);assert(!p.m.beatdownMissSpent);attack(p,q,2);assert.equal(p.boosts.atk,2);});
 it('does not rearm on suppression ending or ability restarts/acquisition',()=>{const[p,q]=setup('','Inner Focus');attack(p,q,1);p.boosts.atk=0;p.addVolatile('gastroacid');p.removeVolatile('gastroacid');b.singleEvent('Start',p.getAbility(),p.abilityState,p);p.setAbility('Limber');attack(p,q,2);assert.equal(p.boosts.atk,0);assert(p.m.beatdownMissSpent);});
 it('works while ability-suppressed because the trigger belongs to the move',()=>{const[p,q]=setup('','Inner Focus');p.addVolatile('gastroacid');attack(p,q,3);assert.equal(p.boosts.atk,2);});
 it('spends eligibility at +6, and obeys the normal cap from +5 and -6',()=>{for(const[start,want]of[[6,6],[5,6],[-6,-4]]){const[p,q]=setup();p.boosts.atk=start;attack(p,q,1);assert.equal(p.boosts.atk,want);assert(p.m.beatdownMissSpent);p.boosts.atk=0;attack(p,q,2);assert.equal(p.boosts.atk,0);b.destroy();b=null;}});
 for(const mode of['protect','immune','no target','early KO'])it('does not boost or spend eligibility on '+mode,()=>{const[p,q]=setup();if(mode==='protect')q.addVolatile('protect');if(mode==='immune')q.setType('Ghost');if(mode==='no target'){q.hp=0;q.fainted=true;}if(mode==='early KO')q.hp=1;const out=attack(p,q,2);assert.equal(p.boosts.atk,0);assert(!p.m.beatdownMissSpent);assert(out.checks<2);assert(!q.volatiles.taunt);});
 it('counts a sub-only partial sequence as success but does not Taunt through it',()=>{const[p,q]=setup();q.addVolatile('substitute');q.volatiles.substitute.hp=1000;const out=attack(p,q,2);assert.equal(out.damage,0);assert(out.result);assert.equal(q.volatiles.substitute.hp,980);assert.equal(p.boosts.atk,2);assert(!q.volatiles.taunt);});
 it('Taunts only after a broken Substitute exposes actual HP',()=>{const[p,q]=setup();q.addVolatile('substitute');q.volatiles.substitute.hp=10;const out=attack(p,q);assert.equal(out.damage,40);assert.equal(q.volatiles.taunt.duration,4);assert.equal(b.log.filter(x=>x.includes('|-start|')&&x.includes('Taunt')).length,1);});
 it('keeps all-sub sequences free of Taunt',()=>{const[p,q]=setup();q.addVolatile('substitute');q.volatiles.substitute.hp=1000;attack(p,q);assert(!q.volatiles.taunt);assert.equal(q.volatiles.substitute.hp,940);});
 it('sets exactly four effect-counter turns without refreshing existing Taunt',()=>{const[p,q]=setup();attack(p,q);assert.equal(q.volatiles.taunt.duration,4);q.volatiles.taunt.duration=2;attack(p,q);assert.equal(q.volatiles.taunt.duration,2);});
 it('retries Taunt after a blocked first hit rather than locking the whole use',()=>{const[p,q]=setup();let attempts=0;b.onEvent('TryAddVolatile',b.format,(status,target)=>{if(status.id==='taunt'&&target===q){attempts++;if(attempts===1)return false;}});attack(p,q);assert.equal(attempts,2);assert.equal(q.volatiles.taunt.duration,4);});
 for(const ability of['Aroma Veil','Oblivious'])it('respects '+ability+' Taunt protection',()=>{const[p,q]=setup('','No Ability',ability);const out=attack(p,q);assert.equal(out.damage,60);assert(!q.volatiles.taunt);});
 for(const miss of[1,2,3])it('activates Blunder Policy exactly once on hit '+miss+' miss',()=>{const[p,q]=setup('Blunder Policy');attack(p,q,miss);assert.equal(p.item,'');assert.equal(p.boosts.spe,2);assert.equal(p.boosts.atk,2);attack(p,q,1);assert.equal(p.boosts.spe,2);assert.equal(p.boosts.atk,2);assert.equal(b.log.filter(x=>x.includes('|-enditem|')&&x.includes('Blunder Policy')).length,1);});
 it('does not activate Policy or the Attack boost on an initial semi-invulnerable failure',()=>{const[p,q]=setup('Blunder Policy');q.addVolatile('fly');const out=attack(p,q,1);assert.equal(out.checks,0);assert.equal(p.item,'blunderpolicy');assert.equal(p.boosts.atk,0);assert.equal(p.boosts.spe,0);assert(!p.m.beatdownMissSpent);});
 it('withholds Policy on a later accuracy miss while the target is semi-invulnerable',()=>{const[p,q]=setup('Blunder Policy');b.onEvent('DamagingHit',b.format,(damage,target,source,move)=>{if(target===q&&move.id==='beatdown')q.addVolatile('fly');});const out=attack(p,q,2);assert.equal(out.checks,2);assert(q.isSemiInvulnerable());assert.equal(p.item,'blunderpolicy');assert.equal(p.boosts.spe,0);assert.equal(p.boosts.atk,2);assert(out.result);});
 it('stops when contact damage faints the user before another accuracy roll',()=>{const[p,q]=setup('Blunder Policy','No Ability','Rough Skin');p.hp=1;const out=attack(p,q,2);assert.equal(p.hp,0);assert.equal(out.checks,1);assert.equal(p.item,'blunderpolicy');assert.equal(p.boosts.atk,0);});
 it('pins only Beatdown Z power to 160 while keeping its normal three-hit power',()=>{const m=Dex.moves.get('beatdown');assert.equal(m.basePower,30);assert.equal(m.multihit,3);assert.equal(m.zMove.basePower,160);const[p]=setup('Fightinium Z');const z=b.actions.getActiveZMove(m,p);assert.equal(z.basePower,160);assert.equal(z.baseMove,'beatdown');assert.equal(z.multihit,undefined);assert.equal(Dex.moves.get('triplekick').zMove.basePower,175);});
 it('counts down four native residual ticks and blocks status moves while active',()=>{const[p,q]=setup();attack(p,q);b.actions.runMove('growl',q,q.getLocOf(p),{externalMove:true});assert.equal(q.moveThisTurnResult,false);for(const turns of[3,2,1]){b.fieldEvent('Residual');assert.equal(q.volatiles.taunt.duration,turns);}b.fieldEvent('Residual');assert(!q.volatiles.taunt);b.actions.runMove('growl',q,q.getLocOf(p),{externalMove:true});assert.equal(q.moveThisTurnResult,true);});

});

