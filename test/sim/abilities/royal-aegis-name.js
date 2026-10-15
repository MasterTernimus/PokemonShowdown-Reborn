'use strict';const assert=require('assert').strict,{Dex,Teams,TeamValidator}=require('../../../dist/sim');
describe('Royal Aegis display rename and saved-team compatibility',()=>{
 for(const name of ['Royal Aegis',"Matriarch's Vigil",'matriarchsvigil']){
  it(name+' resolves the original canonical ID and components',()=>{const a=Dex.abilities.get(name);assert(a.exists);assert.equal(a.id,'matriarchsvigil');assert.equal(a.name,'Royal Aegis');assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents[a.id],['thickfat','aromaveil']);});
  it(name+' validates and round-trips a saved team',()=>{const team=[{species:'Nidoqueen',name:'Nidoqueen',ability:name,moves:['earthpower'],nature:'Modest',evs:{hp:0,atk:0,def:0,spa:0,spd:0,spe:0}}];const restored=Teams.unpack(Teams.pack(team));assert(restored);assert.equal(TeamValidator.get('gen9nofieldsinglesgame').validateTeam(restored),null);assert.equal(restored[0].ability,'Royal Aegis');assert.equal(Dex.abilities.get(restored[0].ability).id,'matriarchsvigil');});
 }
 it('changes only the Nidoqueen hidden display name',()=>{assert.deepEqual(Dex.species.get('nidoqueen').abilities,{0:'Sheer Force',1:'Queenly Majesty',H:'Royal Aegis'});assert.equal(Dex.species.get('nidoking').abilities.H,"Patriarch's Wrath");assert.deepEqual(Dex.species.get('nidoqueen').passives,['rivalry']);assert.deepEqual(Dex.species.all().filter(s=>Object.values(s.abilities).includes('Royal Aegis')).map(s=>s.id),['nidoqueen']);});
});
