'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
let battle;
function setup(species,ability,field='') {
 battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[
  [{species,ability,moves:['tackle','splash','psychic','taunt']},{species:'Mew',ability:'No Ability',moves:['splash']}],
  [{species:'Mew',ability:'No Ability',moves:['splash','taunt','growl','quickattack']}],
 ]);battle.makeChoices('team 12','team 1');
 if(field)battle.field.startTerrain(field);
 return [battle.p1.active[0],battle.p2.active[0]];
}
function modified(p,q,id='tackle') {const move=battle.dex.getActiveMove(id);battle.runEvent('ModifyMove',p,q,move,move);return move;}
describe('Final approved passive migrations',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [id,passive,slots] of [
  ['ursaluna','thickfat',{0:'Raging Beast',1:'Bulletproof',H:'Territorial'}],
  ['ursalunabloodmoon','mindseye',{0:'Bloodmoon Gaze',1:'Lunar Dread',H:'Moonlit Hide'}],
  ['archaludon','stalwart',{0:'Stamina',1:'Anchor Bridge',H:'Rail Sight'}],
  ['tsareena','queenlymajesty',{0:'Empress',1:'Supreme Overlord',H:'Imperial Princess'}],
  ['tsareenaalt','queenlymajesty',{0:'Empress',1:'Supreme Overlord',H:'Imperial Princess'}],
  ['porygon2','download',{0:'Trace',1:'Defragment',H:'Memory Leak'}],
  ['porygonz','download',{0:'Defragment',1:'Error Handler',H:'Memory Leak'}],
  ['medicham','purepower',{0:'Still Mind',1:'Unburden',H:'Limber'}],
 ])it(id+' exact passive and selected slots',()=>{const s=Dex.species.get(id);assert.deepEqual(s.passives,[passive]);for(const [slot,name]of Object.entries(slots))assert.equal(s.abilities[slot],name);});
 it('preserves Mega Medicham passive and selected ability',()=>{assert.deepEqual(Dex.species.get('medichammega').passives,['purepower']);assert.equal(Dex.species.get('medichammega').abilities[0],'Enlightenment');});
 for(const species of ['porygon2','porygonz'])it(species+' Download owns separate state and survives selected ability replacement/suppression',()=>{
  const [p,q]=setup(species,'No Ability');assert.equal(p.passiveStates.download.downloadFirstHit,true);assert.equal(p.abilityState.downloadFirstHit,undefined);
  p.setAbility('Levitate');p.addVolatile('gastroacid');assert.equal(modified(p,q).willCrit,true);assert.equal(p.passiveStates.download.downloadFirstHit,false);assert(!modified(p,q).willCrit);
  p.removeVolatile('gastroacid');p.setAbility('No Ability');assert(!modified(p,q).willCrit);
 });
 it('Download ignores status moves and resets on genuine reentry',()=>{const[p,q]=setup('Porygon2','No Ability');modified(p,q,'splash');assert(p.passiveStates.download.downloadFirstHit);modified(p,q);battle.makeChoices('switch 2','move splash');battle.makeChoices('switch 2','move splash');assert(p.passiveStates.download.downloadFirstHit);});
 it('selected and passive Download boost once and consume one critical budget',()=>{const[p,q]=setup('Porygon2','Download');assert.equal(p.boosts.atk+p.boosts.spa,1);assert(modified(p,q).willCrit);assert(!modified(p,q).willCrit);});
 it('Transform acquires and initializes Download without touching selected ability state',()=>{const[p,q]=setup('Porygon2','No Ability');assert(q.transformInto(p));assert(q.passiveStates.download.downloadFirstHit);assert.equal(q.abilityState.downloadFirstHit,undefined);assert(modified(q,p).willCrit);});
 it('Medicham Pure Power stays active while Still Mind is suppressed and switches offense on Psychic Terrain',()=>{const[p,q]=setup('Medicham','Still Mind');p.addVolatile('gastroacid');let move=battle.dex.getActiveMove('tackle');assert.equal(battle.runEvent('ModifyAtk',p,q,move,100),200);battle.field.startTerrain('psychicterrain');assert.equal(battle.runEvent('ModifyAtk',p,q,move,100),100);assert.equal(battle.runEvent('ModifySpA',p,q,move,100),200);});
 it('Still Mind retains Oblivious Taunt prevention',()=>{const[p,q]=setup('Medicham','Still Mind');battle.actions.useMove('taunt',q,{target:p});assert(!p.volatiles.taunt);});
 it('Bloodmoon Gaze includes Infiltrator and Competitive; passive Mind’s Eye survives suppression',()=>{const[p,q]=setup('Ursaluna-Bloodmoon','Bloodmoon Gaze');let m=modified(p,q);assert(m.infiltrates);assert(m.ignoreEvasion);assert(m.ignoreImmunity.Normal);battle.boost({def:-1},p,q,battle.dex.getActiveMove('tailwhip'));assert.equal(p.boosts.spa,2);p.addVolatile('gastroacid');m=modified(p,q);assert(!m.infiltrates);assert(m.ignoreEvasion);});
 it('Error Handler combines Aroma Veil and Infiltrator independently of Download',()=>{const[p,q]=setup('Porygon-Z','Error Handler');assert(modified(p,q).infiltrates);battle.actions.useMove('taunt',q,{target:p});assert(!p.volatiles.taunt);assert.equal(p.passiveStates.download.downloadFirstHit,false);});
 for(const species of ['Tsareena','Tsareena-Alt'])it(species+' uses one Queenly Majesty multiplier and full Long Reach',()=>{const[p,q]=setup(species,'Empress','fairytaleterrain');const m=modified(p,q);assert(!m.flags.contact);assert.equal(battle.runEvent('ModifyDamage',p,q,m,100),150);assert(p.boosts.accuracy>=1);assert(p.getAbilityComponentExclusions().includes('queenlymajesty'));p.addVolatile('gastroacid');assert.equal(battle.runEvent('ModifyDamage',p,q,m,100),150);});
 it('other Empress users retain Queenly Majesty',()=>{const[p,q]=setup('Mew','Empress','fairytaleterrain');assert.equal(battle.runEvent('ModifyDamage',p,q,battle.dex.getActiveMove('tackle'),100),150);assert(!p.getAbilityComponentExclusions().includes('queenlymajesty'));});
 it('Archaludon passive Stalwart tracks targets while selected ability is suppressed',()=>{const[p,q]=setup('Archaludon','Stamina');p.addVolatile('gastroacid');assert(modified(p,q).tracksTarget);});
 it('Ursaluna passive Thick Fat halves Fire offense under suppression',()=>{const[p,q]=setup('Ursaluna','Bulletproof');p.addVolatile('gastroacid');const m=battle.dex.getActiveMove('flamethrower');assert.equal(battle.runEvent('ModifySpA',q,p,m,100),50);});
});

describe('Approved Electrode extra option',()=>{for(const id of ['electrode','electrodehisui'])it(id+' adds Brute Force without replacing existing choices',()=>{const before=require('../../../artifacts/nido-dragonite-before.json').find(s=>s.id===id);const s=Dex.species.get(id);assert.equal(s.abilities.S,'Brute Force');assert.deepEqual(s.passives,['soundproof']);if(before){assert.deepEqual(s.abilities,{...before.abilities,S:'Brute Force'});assert.deepEqual(s.baseStats,before.stats);}});});
