'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
function setup(species,ability){battle=common.createBattle({},[[{species,ability,moves:['tackle','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.field.terrain='';return battle.p1.active[0];}
describe('Approved Gorebyss and Huntail typing/passives',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const [species,passive,type,power,slots]of [['Gorebyss','pixilate','Fairy',120,{0:'Swift Swim',1:'Pearl Siphon',H:'Pearl Tide'}],['Huntail','duskilate','Dark',130,{0:'Swift Swim',1:'Abyssal Fang',H:'Abyssal Current'}]]){
  it(species+' preserves Swift Swim and other slots with exact typing/passive',()=>{const p=setup(species,'Swift Swim');assert.deepEqual(p.species.types,['Water',type]);assert.deepEqual(p.getPassives(),[passive]);assert.deepEqual(p.species.abilities,slots);battle.field.weather='raindance';assert.equal(battle.runEvent('ModifySpe',p,null,null,100),200);});
  for(const suppressed of [false,true])it(species+' converts once with duplicate active ability, suppression='+suppressed,()=>{const p=setup(species,passive),q=battle.p2.active[0];if(suppressed)p.addVolatile('gastroacid',q);const move=Dex.getActiveMove('tackle');battle.runEvent('ModifyType',p,q,move,move);assert.equal(move.type,type);assert.equal(battle.runEvent('BasePower',p,q,move,100),power);});
 }
 it('preserves local field conversion and power rules',()=>{const p=setup('Huntail','Swift Swim'),q=battle.p2.active[0];battle.field.terrain='holyterrain';let move=Dex.getActiveMove('tackle');battle.runEvent('ModifyType',p,q,move,move);assert.equal(move.type,'Fairy');assert.equal(battle.runEvent('BasePower',p,q,move,100),150);});
});
