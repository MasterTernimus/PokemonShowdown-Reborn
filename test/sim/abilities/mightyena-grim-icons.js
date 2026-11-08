'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');let battle;
describe('Mightyena Grim cosmetic Mega route',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const[a,b]of [['mightyenagrim','mightyena'],['mightyenamegagrim','mightyenamega']])it(a+' copies corresponding mechanics',()=>{for(const k of ['types','baseStats','abilities','passives'])assert.deepEqual(Dex.species.get(a)[k],Dex.species.get(b)[k],k);assert.deepEqual(Dex.species.getLearnsetData(a).learnset,Dex.species.getLearnsetData('mightyena').learnset);});

	for (const species of ['Mightyena', 'Mightyena-Grim', 'Mightyena-Deso'])it(species + ' cannot use the disabled Grimyinite route', () => {
		const create = () => common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, item: 'Grimyinite', ability: 'Intimidate', moves: ['tackle'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		if (species === 'Mightyena-Grim') { assert.throws(create, /Mightyena-Grim is disabled/); return; }
		battle = create(); battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.actions.runMegaEvo(battle.p1.active[0]), false);
		assert.equal(battle.p1.active[0].species.name, species);
	});

 it('preserves prior species mechanics',()=>{for(const row of require('../../../artifacts/mightyena-icons/before.json')){const s=Dex.species.get(row.id);if(!row.id.startsWith('mightyena'))assert.deepEqual(s.baseStats,row.stats);for(const k of ['abilities','types','passives'])if(k!=='passives'||!['mightyena','mightyenagrim','mightyenadeso'].includes(row.id))assert.deepEqual(s[k],row[k]);}});
});
