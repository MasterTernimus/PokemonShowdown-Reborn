'use strict';
const assert=require('assert').strict,{Dex,TeamValidator}=require('../../dist/sim');
describe('Approved Raichu and Ice stat changes',()=>{
 for(const format of ['gen9nofieldsinglesgame','gen9nofielddoublesbattle','gen9freeforall4pmistyfieldadrienn'])it('blocks all Sing sources for Raichu forms in '+format,()=>{
  const validator=new TeamValidator(format);
  for(const id of ['raichu','raichualola','raichumegax','raichumegay'])assert(validator.checkCanLearn(Dex.moves.get('sing'),Dex.species.get(id)),id);
  assert(!validator.checkCanLearn(Dex.moves.get('sing'),Dex.species.get('pikachu')),'Pikachu event source stays');
  for(const id of ['raichu','raichualola'])assert(!validator.checkCanLearn(Dex.moves.get('thunderbolt'),Dex.species.get(id)));
 });
 for(const [id,stats,bst] of [['froslassmega',[70,80,80,140,100,130],600],['glalie',[80,80,85,80,85,90],500],['glaliemega',[80,120,90,120,90,100],600]])it(id+' has exact stats and preserved BST',()=>{assert.deepEqual(Object.values(Dex.species.get(id).baseStats),stats);assert.equal(Dex.species.get(id).bst,bst);});
});
