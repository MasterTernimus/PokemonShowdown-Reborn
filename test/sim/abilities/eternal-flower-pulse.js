'use strict';
const assert=require('assert').strict,common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
describe('Eternal Flower Pulse weakness',()=>{
 let b;afterEach(()=>{b?.destroy();b=null;});
	for (const [species, selectedAbility, mega] of [['Mew', 'Eternal Flower', false], ['Floette-Eternal', 'Natural Cure', false], ['Floette-Eternal', 'Natural Cure', true]]) {
		const ability = mega ? 'Mega Floette Eternal Flower passive' : species + '/' + selectedAbility;
		function setup() {
			b = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: selectedAbility, item: mega ? 'Floettite' : '', moves: ['earthquake', 'splash'] }], [{ species: 'Mew', ability: 'Levitate', moves: ['splash'] }]]);
			b.makeChoices('team 1', 'team 1');
			const p = b.p1.active[0];
			if (mega)assert(b.actions.runMegaEvo(p));
			return p;
		}
  it(ability+' doubles damage against every registered Pulse form only',()=>{
   const p=setup(),target=b.p2.active[0],move=Dex.getActiveMove('tackle');let count=0;
   for(const species of Dex.species.all().filter(s=>/^Pulse(?:-|$)/i.test(s.forme))){target.species=species;assert.equal(b.runEvent('ModifyDamage',p,target,move,100),200,species.name);count++;}
   assert(count>0);target.species=Dex.species.get('Hippowdon-Rift');assert.equal(b.runEvent('ModifyDamage',p,target,move,100),100);
   target.species=Dex.species.get('Mew');assert.equal(b.runEvent('ModifyDamage',p,target,move,100),100);
  });
  it(ability+' bypasses Levitate in an actual attack',()=>{
   setup();const target=b.p2.active[0],hp=target.hp;b.makeChoices('move earthquake','move splash');assert(target.hp<hp);
  });
 }
});
