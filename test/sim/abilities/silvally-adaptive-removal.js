'use strict';
const assert=require('assert').strict,{Dex}=require('../../../dist/sim');
describe('Silvally Adaptive Cycle selection removal',()=>{
 it('all eighteen forms retain three valid choices and no Adaptive Cycle',()=>{const forms=Dex.species.all().filter(s=>s.baseSpecies==='Silvally');assert.equal(forms.length,18);for(const s of forms){assert.deepEqual(s.abilities,{0:'RKS System',1:'Mimicry',H:'Memory Leak'},s.id);for(const a of Object.values(s.abilities))assert(Dex.abilities.get(a).exists);}});
 it('keeps the ability and its other selected holders intact',()=>{assert(Dex.abilities.get('Adaptive Cycle').exists);for(const id of ['kecleon','stunfisk','stunfiskgalar'])assert.equal(Dex.species.get(id).abilities.S,'Adaptive Cycle');});
});
