'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Mightyena Grim cosmetic Mega route',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const[a,b]of [['mightyenagrim','mightyena'],['mightyenamegagrim','mightyenamega']])it(a+' copies corresponding mechanics',()=>{for(const k of ['types','baseStats','abilities','passives'])assert.deepEqual(Dex.species.get(a)[k],Dex.species.get(b)[k],k);assert.deepEqual(Dex.species.getLearnsetData(a).learnset,Dex.species.getLearnsetData('mightyena').learnset);});
 for(const[species,expected]of [['Mightyena','mightyenamega'],['Mightyena-Grim','mightyenamegagrim'],['Mightyena-Deso','mightyenamega']])it(species+' preserves its intended Grimyinite route',()=>{battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,item:'Grimyinite',ability:'Intimidate',moves:['tackle']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');assert(battle.actions.runMegaEvo(battle.p1.active[0]));assert.equal(battle.p1.active[0].species.id,expected);assert.deepEqual(battle.p1.active[0].getPassives(),Dex.species.get(expected).passives);});
 it('preserves prior species mechanics',()=>{for(const row of require('../../../artifacts/mightyena-icons/before.json')){const s=Dex.species.get(row.id);assert.deepEqual(s.baseStats,row.stats);for(const k of ['abilities','types','passives'])assert.deepEqual(s[k],row[k]);}});
});
