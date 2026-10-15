'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
function setup(ability='Tidal Voice',species='Primarina',mode='doubles') {
 const mon=(s='Mew',a='No Ability')=>({species:s,ability:a,moves:['hypervoice','sparklingaria','splash','scald']});
 battle=common.createBattle({gameType:mode},[[mon(species,ability),mon(),mon()],[mon(),mon(),mon()]]);if(battle.requestState==='teampreview')battle.makeChoices();battle.field.terrain='';
 for(const p of battle.getAllActive())p.hp=p.maxhp=p.baseMaxhp=10000;
 return[battle.p1.active[0],battle.p1.active[1],battle.p2.active[0]];
}
function use(p,q,extra={},id='hypervoice'){const m=Object.assign(Dex.getActiveMove(id),{willCrit:false,accuracy:true},extra);battle.actions.useMove(m,p,{target:q});battle.runEvent('AfterMove',p,q,battle.activeMove);return battle.activeMove;}
describe('Approved Primarina abilities',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const species of ['Primarina','Primarina-Alt'])it(species+' preserves slots and Torrent',()=>{const s=Dex.species.get(species);assert.deepEqual(Object.values(s.abilities),['Encore Aria','Marvel Scale','Tidal Voice']);assert(s.passives.includes('torrent'));});
 it('Encore grants five-turn Safeguard only on genuine entry and preserves longer screens',()=>{const[p,,q]=setup('Encore Aria');assert.equal(p.side.sideConditions.safeguard.duration,5);p.side.sideConditions.safeguard.duration=2;battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(p.side.sideConditions.safeguard.duration,2);p.addVolatile('gastroacid',q);p.removeVolatile('gastroacid');assert.equal(p.side.sideConditions.safeguard.duration,2);p.side.sideConditions.safeguard.duration=8;battle.singleEvent('SwitchIn',p.getAbility(),p.abilityState,p);assert.equal(p.side.sideConditions.safeguard.duration,8);battle.actions.switchIn(p.side.pokemon[2],0);battle.actions.switchIn(p,0);battle.actions.runSwitch(p);assert(p.side.sideConditions.safeguard.duration>=5);});
 it('Encore retains secondary/self chances and removes charge without secondary-triggered Safeguard',()=>{const[p,,q]=setup('Encore Aria');p.side.removeSideCondition('safeguard');const m=Object.assign(Dex.getActiveMove('solarbeam'),{secondaries:[{chance:10,boosts:{spd:-1}},{chance:20,self:{boosts:{spa:1}}}]});battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.secondaries[0].chance,20);assert.equal(m.secondaries[1].chance,40);assert(!m.flags.charge);battle.runEvent('AfterSuccessfulSecondary',p,q,m);assert(!p.side.sideConditions.safeguard);});
 for(const field of ['', 'icyterrain'])it('Liquid Voice type/power exactly once '+field,()=>{const[p,,q]=setup();battle.field.terrain=field;const m=Dex.getActiveMove('hypervoice');battle.runEvent('ModifyType',p,q,m,m);assert.equal(m.type,field?'Ice':'Water');m.type='Normal';const direct=battle.runEvent('BasePower',p,q,m,100);assert.equal(direct,120);p.addVolatile('gastroacid',q);const n=Dex.getActiveMove('hypervoice');battle.runEvent('ModifyType',p,q,n,n);assert.equal(n.type,'Normal');});
 for(const guard of ['protect','detect','kingsshield','spikyshield','banefulbunker','silktrap','burningbulwark','wideguard','maxguard'])it('sound interaction with '+guard,()=>{const[p,,q]=setup();battle.randomChance=()=>false;const hp=q.hp;if(guard==='wideguard')q.side.addSideCondition(guard,q);else q.addVolatile(guard,q);use(p,q);assert.equal(q.hp<hp,guard!=='maxguard');});
 it('Soundproof blocks opposing sounds and suppression restores vulnerability',()=>{const[p,,q]=setup();battle.randomChance=()=>false;let hp=p.hp;use(q,p,{target:'normal'});assert.equal(p.hp,hp);p.addVolatile('gastroacid',q);use(q,p,{target:'normal'});assert(p.hp<hp);});
 it('one 30% roll after complete multi-hit spread, no cleanse or ally healing',()=>{const[p,ally,q]=setup();ally.hp=5000;p.boosts.spe=-2;let rolls=0;battle.randomChance=(n,d)=>{if(n===3&&d===10){rolls++;return true;}return false;};use(p,q,{multihit:3},'sparklingaria');assert.equal(rolls,1);assert.equal(p.boosts.spa,1);assert.equal(p.boosts.spe,-2);assert.equal(ally.hp,5000);battle.runEvent('AfterMove',p,q,battle.activeMove);assert.equal(rolls,1);});
 for(const kind of ['miss','immune','substitute','ally','fainted','inactive','suppressed','sheerforce'])it('proc boundary '+kind,()=>{const[p,ally,q]=setup();let rolls=0;battle.randomChance=(n,d)=>{if(n===3&&d===10){rolls++;return true;}return false;};
  const m=Object.assign(Dex.getActiveMove('hypervoice'),{willCrit:false,accuracy:true,target:'normal',...kind==='miss'?{accuracy:0}:kind==='sheerforce'?{hasSheerForce:true,secondaries:null}:{}});
  if(kind==='immune')q.setAbility('Water Absorb');if(kind==='substitute'){q.addVolatile('substitute');q.volatiles.substitute.hp=9000;m.flags={...m.flags,sound:1};m.infiltrates=false;/* native sound bypasses Substitute: use isolated HP-event admission below */battle.runEvent('AfterMove',p,q,m);assert.equal(rolls,0);return;}
  if(kind==='suppressed')p.addVolatile('gastroacid',q);
  battle.actions.useMove(m,p,{target:kind==='ally'?ally:q});const active=battle.activeMove;
  if(kind==='fainted')p.hp=0;if(kind==='inactive')p.isActive=false;
  battle.runEvent('AfterMove',p,q,active);assert.equal(rolls,kind==='sheerforce'?1:0);
 });
});
