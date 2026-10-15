'use strict';
// User-approved restoration supersedes Calculated Trajectory on both forms.
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const mon=(species='Mew',ability='No Ability')=>({species,ability,moves:['splash','kinesis','futuresight','psychic']});
function setup(species='Alakazam',ability='No Ability'){battle=common.createBattle({gameType:'doubles'},[[mon(species,ability),mon()],[mon(),mon()]]);battle.field.terrain='';return[battle.p1.active[0],battle.p2.active[0]];}
function use(p,q,id){return battle.actions.useMove(Dex.getActiveMove(id),p,{target:q});}
describe('Restored Alakazam Revealing Gaze passive',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const species of ['Alakazam','Alakazam-Mega']){
  it(species+' warns on entry without automatic Kinesis',()=>{const[p,q]=setup(species);assert.deepEqual(p.getPassives(),['revealinggaze']);assert.equal(q.boosts.accuracy,0);assert(q.volatiles.miracleeye);assert.equal(battle.log.filter(x=>x.includes('|Miracle Eye|')).length,1);assert(!battle.log.some(x=>x.includes('|Kinesis|')));});
  it(species+' manual Kinesis retains its drop without advancing Future Sight',()=>{const[p,q]=setup(species);use(p,q,'futuresight');const pending=q.side.slotConditions[q.position].futuremove,end=pending.endingTurn;use(p,q,'kinesis');assert.equal(q.boosts.accuracy,-1);assert.equal(pending.endingTurn,end);assert(!pending.calculatedTrajectoryAdvanced);});
  it(species+' retains Revealing Gaze under suppression and no Kinesis on restart',()=>{const[p,q]=setup(species);p.addVolatile('gastroacid',q);assert.deepEqual(p.getPassives(),['revealinggaze']);battle.runEvent('SwitchIn',p);p.removeVolatile('gastroacid');p.setAbility('Magic Guard');assert.equal(q.boosts.accuracy,0);assert(!battle.log.some(x=>x.includes('|Kinesis|')));});
 }
 it('preserves selected abilities',()=>{assert.deepEqual(Dex.species.get('alakazam').abilities,{0:'Insomnia',1:'Grandmaster',H:'Magic Guard'});assert.deepEqual(Dex.species.get('alakazammega').abilities,{0:'Perfect Foresight'});});
 for(const flag of ['perfectForesight','grandmasterForesight'])it('manual Kinesis leaves '+flag+' timing unchanged',()=>{const[p,q]=setup();use(p,q,'futuresight');const pending=q.side.slotConditions[q.position].futuremove;pending.moveData[flag]=true;const end=pending.endingTurn;use(p,q,'kinesis');assert.equal(pending.endingTurn,end);assert(!pending.calculatedTrajectoryAdvanced);});
 it('preserves ordinary Psychic Terrain Kinesis effects',()=>{const[p,q]=setup();battle.field.setTerrain('psychicterrain',p);use(p,q,'kinesis');assert.equal(q.boosts.accuracy,-2);assert.equal(p.boosts.spa,2);assert.equal(p.boosts.atk,2);});
});
