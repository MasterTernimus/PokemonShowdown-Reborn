'use strict';
const assert=require('assert').strict,common=require('../../common');
describe('Victreebel and Tentacruel approved revisions',()=>{let b;afterEach(()=>b?.destroy());
function setup(ability='Digestive Sap',ffa=false,target='Mew',targetAbility='No Ability'){const p={species:'Victreebel',ability,moves:['sludgebomb','splash']},t={species:target,ability:targetAbility,moves:['splash']};b=common.createBattle({formatid:ffa?'gen9freeforall4pmistyfieldadrienn':'gen9nofieldsinglesgame'},ffa?[[p],[t],[t],[t]]:[[p],[t]]);b.makeChoices(...(ffa?['team 1','team 1','team 1','team 1']:['team 1','team 1']));if(ffa)b.field.setTerrain('factoryterrain',b.p1.active[0]);return[b.p1.active[0],b.p2.active[0]];}
function hit(p,t,extra={}){const m=b.dex.getActiveMove('sludgebomb');Object.assign(m,{damage:60,accuracy:true,willCrit:false,secondaries:undefined},extra);b.actions.runMove(m,p,p.getLocOf(t));}
it('drains actual damage and caps multihit healing at one eighth',()=>{const[p,t]=setup();p.hp=50;hit(p,t,{multihit:3});assert.equal(p.hp,50+Math.floor(p.maxhp/8));});
it('shares the cap across all FFA targets',()=>{const[p,t]=setup('Digestive Sap',true);p.hp=50;hit(p,t,{target:'allAdjacentFoes'});assert.equal(p.hp,50+Math.floor(p.maxhp/8));});
it('does not duplicate native drain',()=>{const[p,t]=setup();p.hp=50;hit(p,t,{drain:[1,2]});assert.equal(p.hp,80);});
it('respects Heal Block',()=>{const[p,t]=setup();p.hp=50;p.addVolatile('healblock');hit(p,t);assert.equal(p.hp,50);});
it('respects Liquid Ooze',()=>{const[p,t]=setup('Digestive Sap',false,'Mew','Liquid Ooze');p.hp=100;hit(p,t);assert.equal(p.hp,80);});
it('excludes substitute HP',()=>{const[p,t]=setup();p.hp=50;t.addVolatile('substitute');hit(p,t);assert.equal(p.hp,50);});
it('does not count resisted overkill beyond actual HP',()=>{const[p,t]=setup();p.hp=50;t.hp=9;hit(p,t);assert.equal(p.hp,53);});
it('base assignment preserves alternative slots and stats',()=>{const[p]=setup();assert.deepEqual(p.species.abilities,{0:'Chlorophyll',1:'Digestive Sap',H:'Gluttony'});assert.equal(p.species.bst,530);});
it('Mega package preserves Accumulation and gains Digestive Sap and Liquid Ooze',()=>{const[p]=setup('Solar Trap');for(const a of ['accumulation','digestivesap','liquidooze'])assert(p.hasAbility(a));for(const a of ['innardsout','solarpower'])assert(!p.hasAbility(a));const a=b.dex.abilities.get('solartrap');for(const h of ['onResidual','onAnyAfterDamageApplied','onTryHeal','onSourceTryHeal','onSourceModifyAtk','onSourceModifySpA'])assert.equal(typeof a[h],'function');});
for(const species of ['Registeel','Muk'])it('Venom Veil poisons '+species+' without defense drops',()=>{const[p,t]=setup('Venom Veil',false,species);p.moveSlots[0]={...p.moveSlots[0],id:'toxic',move:'Toxic'};b.makeChoices('move toxic','move splash');assert.equal(t.status,'tox');assert.equal(t.boosts.def,0);assert.equal(t.boosts.spd,0);assert(p.volatiles.aquaring);});
it('Tentacruel learns Clear Smog',()=>{setup();assert(b.dex.species.getLearnsetData('tentacruel').learnset.clearsmog.includes('9M'));});
});
