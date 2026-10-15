'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
let battle;
function setup(){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Skeledirge-Aevian',ability:'Venom Canticle',moves:['hypervoice','torchsong','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');battle.field.terrain='';return[battle.p1.active[0],battle.p2.active[0]];}
describe('Approved Venom Canticle sound power',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const[id,type,power]of [['hypervoice','Poison',120],['torchsong','Fire',120],['surf','Water',100],['perishsong','Normal',100]])it(id+' preserves conversion boundaries and boosts sound damage once',()=>{const[p,q]=setup(),m=Dex.getActiveMove(id);battle.runEvent('ModifyType',p,q,m,m);assert.equal(m.type,type);assert.equal(battle.runEvent('BasePower',p,q,m,100),power);});
 it('suppression removes the conversion and power, preserving Blaze',()=>{const[p,q]=setup();p.addVolatile('gastroacid',q);const m=Dex.getActiveMove('hypervoice');battle.runEvent('ModifyType',p,q,m,m);assert.equal(m.type,'Normal');assert.equal(battle.runEvent('BasePower',p,q,m,100),100);assert.deepEqual(p.getPassives(),['blaze']);});
 it('has only its existing species user and no nested or inherited Liquid Voice package',()=>{const {AbilityComponents,abilityIncludesComponent}=require('../../../dist/data/ability-components');assert.deepEqual(Dex.species.all().filter(s=>Object.values(s.abilities).includes('Venom Canticle')).map(s=>s.id),['skeledirgeaevian']);assert.deepEqual(AbilityComponents.venomcanticle,[]);assert.deepEqual(Object.keys(AbilityComponents).filter(id=>id!=='venomcanticle'&&abilityIncludesComponent(id,'venomcanticle')),[]);assert(!abilityIncludesComponent('venomcanticle','liquidvoice'));assert(!abilityIncludesComponent('stormcalling','venomcanticle'));});
});
