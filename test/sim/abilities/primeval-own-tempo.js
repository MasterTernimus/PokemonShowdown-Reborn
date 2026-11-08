'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim');
describe('Primeval Hunt Steadfast component', () => {
 let battle;afterEach(()=>{battle?.destroy();});
 function setup(species='Mew'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species,ability:'Primeval Hunt',moves:['rockblast','splash']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices();return[battle.p1.active[0],battle.p2.active[0]];}
	it('has Skill Link and Steadfast without Battle Armor callbacks', () => {
		const [p] = setup();
		const a = p.getAbility();
		assert.deepEqual(require('../../../dist/data/ability-components').AbilityComponents.primevalhunt, ['skilllink', 'steadfast']);
		for (const id of ['onCriticalHit', 'onSourceModifyDamage', 'onAfterEachBoost'])assert.equal(a[id], undefined, id);
		assert(p.hasAbility('steadfast'));
		assert(!p.hasAbility('owntempo'));
		assert(!p.hasAbility('battlearmor'));
	});

	it('allows confusion and does not cure it on acquisition', () => {
		const [p, q] = setup();
		assert(p.addVolatile('confusion', q));
		p.setAbility('No Ability');
		p.setAbility('Primeval Hunt');
		battle.singleEvent('Update', p.getAbility(), p.abilityState, p);
		assert(p.volatiles.confusion);
	});
	it('allows Intimidate and other opposing Attack drops', () => {
		const [p, q] = setup();
		battle.singleEvent('Start', Dex.abilities.get('intimidate'), {}, q);
		assert.equal(p.boosts.atk, -1);
		battle.boost({ atk: -1 }, p, q, Dex.moves.get('growl'));
		assert.equal(p.boosts.atk, -2);
		assert.equal(p.boosts.def, 0);
	});
	it('Steadfast raises Speed on flinch and respects suppression', () => {
		const [p, q] = setup();
		battle.runEvent('Flinch', p);
		assert.equal(p.boosts.spe, 1);
		p.addVolatile('gastroacid', q);
		battle.runEvent('Flinch', p);
		assert.equal(p.boosts.spe, 1);
	});
 it('retains maximum multihit count and power without final-hit crit',()=>{const[p,q]=setup();const m=Dex.getActiveMove('rockblast');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,q);assert.equal(m.multihit,5);assert.equal(battle.runEvent('BasePower',p,q,m,100),150);for(let hit=1;hit<=5;hit++){m.hit=hit;assert.equal(battle.runEvent('ModifyCritRatio',p,q,m,1),1);}});
 it('keeps Armaldo passive and slots and only its passive armor response',()=>{const[p,q]=setup('Armaldo');assert.deepEqual(p.getPassives(),['relicarmor']);assert.deepEqual(Dex.species.get('armaldo').abilities,{0:'Abyssal Claws',1:'Swift Swim',H:'Primeval Hunt'});p.clearBoosts();battle.boost({atk:-1},p,q,Dex.moves.get('growl'));assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);assert.equal(battle.runEvent('ModifyDamage',q,p,Dex.getActiveMove('tackle'),100),90);});
});
