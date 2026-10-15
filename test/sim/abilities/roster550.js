'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
const stats={mightyena:[90,115,80,60,80,125],mightyenadeso:[90,115,80,60,80,125],mightyenagrim:[90,115,80,60,80,125],mightyenamega:[90,140,105,85,100,130],mightyenamegagrim:[90,140,105,85,100,130],cinccino:[75,110,85,70,85,125],cinccinodeso:[75,110,90,60,90,125],toxicroak:[83,121,70,111,70,95],toxicroakdeso:[83,121,70,111,70,95]};
describe('Approved 550/650 roster and passives',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const[id,values]of Object.entries(stats))it(id+' exact spread and passive',()=>{const s=Dex.species.get(id);assert.deepEqual(Object.values(s.baseStats),values);assert.equal(s.bst,id.includes('mega')?650:550);assert.deepEqual(s.passives,[id.includes('mega')?'darkaura':id.startsWith('mightyena')?'rattled':id.startsWith('cinccino')?'shielddust':'limber']);});
});
