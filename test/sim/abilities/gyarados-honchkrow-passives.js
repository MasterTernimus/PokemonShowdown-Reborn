'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim');let battle;
function setup(species='Gyarados',ability='Moxie',item='') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability,item,moves:['waterfall','tackle','outrage','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
 if(battle.requestState==='teampreview')battle.makeChoices('team 1','team 12');
 const p=battle.p1.active[0],q=battle.p2.active[0];for(const x of [p,q])x.hp=x.maxhp=x.baseMaxhp=2000;return[p,q];
}
function use(p,q,id='waterfall'){const m=Object.assign(Dex.getActiveMove(id),{accuracy:true,willCrit:false});battle.actions.useMove(m,p,{target:q});return battle.activeMove;}
describe('Gyarados and Honchkrow approved passive swaps',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 it('changes only the requested selectable slot and passives',()=>{
  assert.deepEqual(Dex.species.get('gyarados').abilities,{0:'Unbridled Wrath',1:'Tempest Fury',H:'Moxie'});
  assert.deepEqual(Dex.species.get('gyarados').passives,['intimidate']);
  assert.deepEqual(Dex.species.get('honchkrow').abilities,{0:'Pressure',1:'Void Command',H:'Supreme Overlord'});
  assert.deepEqual(Dex.species.get('honchkrow').passives,['stakeout']);
  assert.deepEqual(Dex.species.get('gyaradosmega').abilities,{0:'Unleashed Ego'});assert.deepEqual(Dex.species.get('gyaradosmega').passives,['defiant']);
  assert.deepEqual(Dex.species.get('gyaradosaevian').abilities,{0:'Multiscale',1:'Competitive',H:'Intimidate'});assert.deepEqual(Dex.species.get('gyaradosaevian').passives,[]);
  assert.deepEqual(Dex.species.get('gyaradosaevianmega').abilities,{0:'Helios'});assert.deepEqual(Dex.species.get('gyaradosaevianmega').passives,[]);
  assert.deepEqual(Dex.species.get('murkrow').passives,['infiltrator']);
 });
 for(const ability of ['Moxie','Tempest Fury','Intimidate'])it('Intimidate passive activates once: '+ability,()=>{const[p,q]=setup('Gyarados',ability);assert.equal(q.boosts.atk,-1);assert.deepEqual(p.getPassives(),['intimidate']);});
 for(const ability of ['Sheer Force','Unbridled Wrath'])for(const suppression of ['', 'gastroacid','gas'])it('selected Sheer Force boost: '+ability+'/'+suppression,()=>{const[p,q]=setup('Gyarados',ability,'Life Orb');if(suppression==='gastroacid')p.addVolatile('gastroacid',q);if(suppression==='gas')q.setAbility('Neutralizing Gas');const hp=p.hp,m=use(p,q);assert.equal(!!m.hasSheerForce,!suppression);assert.equal(battle.runEvent('BasePower',p,q,m,100),suppression?100:130);if(!suppression)assert.equal(p.hp,hp,'Sheer Force prevents Life Orb recoil');});
 for(const suppression of ['', 'gastroacid','gas'])it('selected Inner Focus respects suppression: '+suppression,()=>{const[p,q]=setup('Gyarados','Unbridled Wrath');if(suppression==='gastroacid')p.addVolatile('gastroacid',q);if(suppression==='gas')q.setAbility('Neutralizing Gas');assert.equal(!!p.addVolatile('flinch',q),!!suppression);battle.boost({atk:-1},p,q,Dex.abilities.get('intimidate'));assert.equal(p.boosts.atk,suppression?-1:0);});
 it('Wrath does not boost attacks without secondary effects',()=>{const[p,q]=setup('Gyarados','Unbridled Wrath');const m=use(p,q,'tackle');assert(!m.hasSheerForce);assert.equal(battle.runEvent('BasePower',p,q,m,100),100);});
 it('Wrath keeps the existing Outrage lock',()=>{const[p,q]=setup('Gyarados','Unbridled Wrath');use(p,q,'outrage');assert(p.volatiles.lockedmove);});
 it('Mega evolution changes only to the existing Mega passive',()=>{const[p]=setup('Gyarados','Intimidate','Gyaradosite');assert(battle.actions.runMegaEvo(p));assert.equal(p.species.id,'gyaradosmega');assert.deepEqual(p.getPassives(),['defiant']);assert.equal(p.ability,'unleashedego');});
 for(const ability of ['Pressure','Stakeout'])for(const suppressed of [false,true])for(const turns of [0,1])it('Honchkrow Stakeout offense once: '+ability+'/'+suppressed+'/'+turns,()=>{const[p,q]=setup('Honchkrow',ability);if(suppressed)p.addVolatile('gastroacid',q);q.activeTurns=turns;for(const event of ['ModifyAtk','ModifySpA'])assert.equal(battle.runEvent(event,p,q,Dex.getActiveMove('tackle'),100),turns?100:200);});
 it('Stakeout boosts an actual switch-in hit, then returns to ordinary damage',()=>{const[p,q]=setup('Honchkrow','Pressure');battle.randomizer=n=>n;const next=battle.p2.pokemon[1];next.hp=next.maxhp=next.baseMaxhp=2000;next.storedStats.def=q.storedStats.def;const hp=next.hp;battle.makeChoices('move tackle','switch 2');const boosted=hp-next.hp;const before=next.hp;battle.makeChoices('move tackle','move splash');assert(Math.abs(boosted-2*(before-next.hp))<=3);});
 it('Honchkrow no longer blocks the opposing berry',()=>{const[p,q]=setup('Honchkrow','Pressure');q.setItem('Sitrus Berry');q.hp=500;assert(q.eatItem());assert(q.hp>500);assert(!p.hasAbilityOrPassive('unnerve'));});
 it('copied Unbridled Wrath on a nonrecipient still works as an active ability',()=>{const[p,q]=setup('Mew','Unbridled Wrath');const m=use(p,q);assert.deepEqual(p.getPassives(),['synchronize']);assert(m.hasSheerForce);assert.equal(battle.runEvent('BasePower',p,q,m,100),130);p.addVolatile('gastroacid',q);const suppressed=use(p,q);assert(!suppressed.hasSheerForce);});
});

describe('Approved local Kingdra balance and scope',()=>{
 it('lowers only both offenses to 105, preserving the selected and passive kit',()=>{const s=Dex.species.get('kingdra');assert.deepEqual(s.baseStats,{hp:85,atk:105,def:90,spa:105,spd:90,spe:95});assert.equal(Object.values(s.baseStats).reduce((a,b)=>a+b),570);assert.deepEqual(s.abilities,{0:'Swift Swim',1:'Abyss Sniper',H:'Storm Drain'});assert.deepEqual(s.passives,['waterveil']);assert.deepEqual(s.types,['Water','Dragon']);});
 it('changes exactly the approved species including recorded subsequent roster revisions',()=>{const before=require('../../../artifacts/gyarados-honchkrow/before.json');const changed=before.filter(old=>{const s=Dex.species.get(old.id);return JSON.stringify(old)!==JSON.stringify({id:s.id,abilities:s.abilities,passives:s.passives,types:s.types,stats:s.baseStats});}).map(s=>s.id).sort();const expected=before.filter(old=>JSON.stringify(old)!==JSON.stringify(require('./passive-approval-overlays').snapshot(old))).map(s=>s.id).sort();assert.deepEqual(changed,expected);});
});
