'use strict'; const assert = require('assert').strict, common = require('../../common'); let battle;
describe('Dread Dominion replaces Fairy overrides with Intimidate',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
	for (const species of ['Mightyena', 'Mightyena-Deso'])it(species + ' cannot evolve into a disabled Mega', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[{ species, ability: 'Quick Feet', item: 'Grimyinite', moves: ['crunch'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('team 1', 'team 1'); const p = battle.p1.active[0], q = battle.p2.active[0];
		assert.equal(battle.actions.runMegaEvo(p), false); assert.equal(p.species.name, species); assert.equal(q.boosts.atk, 0);
	});
	it('rejects disabled Mightyena-Grim even in direct battle construction', () => {
		assert.throws(() => common.createBattle({}, [[{ species: 'Mightyena-Grim', moves: ['splash'] }], [{ species: 'Mew', moves: ['splash'] }]]), /Mightyena-Grim is disabled/);
	});
	it('legacy Dread Dominion still activates Intimidate once per entry', () => {
		battle = common.createBattle({}, [[{ species: 'Mew', ability: 'Dread Dominion', moves: ['splash'] }], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
		const p = battle.p1.active[0], q = battle.p2.active[0]; assert.equal(q.boosts.atk, -1);
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p); assert.equal(q.boosts.atk, -1);
 });
 for(const block of ['gastroacid','substitute','innerfocus'])it('Intimidate respects '+block,()=>{
  battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability:'Dread Dominion',moves:['tackle']}],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 12');const p=battle.p1.active[0],q=battle.p2.active[0];q.boosts.atk=0;delete p.abilityState.intimidateActivated;if(block==='gastroacid')p.addVolatile(block);else if(block==='substitute')q.addVolatile(block);else q.setAbility(block);battle.singleEvent('Start',p.getAbility(),p.abilityState,p);assert.equal(q.boosts.atk,0);
 });
});
