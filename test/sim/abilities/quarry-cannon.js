'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Quarry Cannon physical projectiles',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Rhyperior',ability:'Quarry Cannon',moves:['waterpulse']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');return [battle.p1.active[0],battle.p2.active[0]];}
 for(const id of ['dragonpulse','fireblast','flashcannon','focusblast','mudbomb','rockblast','rockwrecker','zapcannon','waterpulse'])it(id+' converts once and preserves move properties',()=>{
  const[p,q]=setup(),m=Dex.getActiveMove(id),original=Dex.moves.get(id);battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.category,'Physical');assert.equal(m.accuracy,original.accuracy);assert.deepEqual(m.multihit,original.multihit);assert.deepEqual(m.secondaries,original.secondaries);assert.equal(battle.runEvent('BasePower',p,q,m,100),150);
 });
 it('preserves nonprojectiles, status, Z and Max categories',()=>{const[p,q]=setup();for(const [id,extra]of [['surf',{}],['healpulse',{}],['waterpulse',{isZ:'Waterium Z'}],['waterpulse',{isMax:true}]]){const m=Object.assign(Dex.getActiveMove(id),extra),cat=m.category;battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.category,cat);}});
 it('suppression disables selected conversion and power, not Solid Rock passive',()=>{const[p,q]=setup();p.addVolatile('gastroacid',q);const m=Dex.getActiveMove('waterpulse');battle.runEvent('ModifyMove',p,q,m,m);assert.equal(m.category,'Special');assert.equal(battle.runEvent('BasePower',p,q,m,100),100);assert(p.getPassives().includes('solidrock'));});
 it('learns legal Water Pulse and removes the old defensive delegate',()=>{assert(Dex.species.getLearnsetData('rhyperior').learnset.waterpulse.includes('9M'));assert.equal(require('../../../dist/sim/team-validator').TeamValidator.get('gen9nofieldsinglesgame').validateTeam([{species:'Rhyperior',ability:'Quarry Cannon',moves:['Water Pulse']}]),null);const a=Dex.abilities.get('quarrycannon');assert(!a.onSourceModifyDamage);assert.equal(a.onBasePower,Dex.abilities.get('megalauncher').onBasePower);assert.deepEqual(Dex.species.get('rhyperior').passives,['solidrock']);});
});
