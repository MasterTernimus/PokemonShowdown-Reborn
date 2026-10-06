'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(foeAbility='No Ability',ability='Fallen Star'){
	battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['earthquake','watergun','tackle','triplearrows']}],[{species:'Mew',ability:foeAbility,moves:['splash']}]]);battle.makeChoices('team 1','team 1');return[battle.p1.active[0],battle.p2.active[0]];
}
describe('Fallen Star full local Mold Breaker',()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	for(const [ability,move] of [['Levitate','earthquake'],['Water Absorb','watergun'],['Sturdy','tackle']])it(`bypasses ${ability} with non-arrow ${move}`,()=>{
		const[p,t]=start(ability);if(ability==='Sturdy')t.hp=t.maxhp=t.baseMaxhp=1;
		battle.actions.useMove(move,p,{target:t});assert(t.hp<t.maxhp);if(ability==='Sturdy')assert.equal(t.hp,0);
	});
	it('announces the inherited component once on entry',()=>{
		const[p]=start();const entries=battle.log.filter(x=>x.startsWith('|-ability|')&&x.endsWith('|Mold Breaker'));
		assert.equal(entries.length,1);assert(p.hasAbility('moldbreaker'));
	});
	it('retains exactly the existing four components in server and calculator metadata',()=>{
		start();const {AbilityComponents}=require('../../../dist/data/ability-components');const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');
		assert.deepEqual(AbilityComponents.fallenstar,['moldbreaker','dualwield','selfsufficient','proficient']);
		assert.deepEqual(calculatorMetadata().abilityComponents.fallenstar,['Mold Breaker','Dual Wield','Self Sufficient']);
		const a=battle.dex.abilities.get('fallenstar');assert(/Mold Breaker/.test(a.desc));assert(require('../../../dist/data/ability-display').getAbilityDisplayComponents('fallenstar').includes('moldbreaker'));
	});
	it('retains Dual Wield, arrow priority, Proficient and protection without duplicates',()=>{
		const[p,t]=start();const m=battle.dex.getActiveMove('triplearrows');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert(m.ignoreAbility);assert.equal(m.multihit,2);
		assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('psychic'),1000),1300);
		p.hp=Math.floor(p.maxhp/2);
		assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('triplearrows'),0),1);
		assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove('tackle'),0),0);
		assert.equal(battle.runEvent('ModifyDamage',t,p,battle.dex.getActiveMove('tackle'),1000),500);
		assert(!/Skill Link|crit.*stack|side.*crit/i.test(p.getAbility().desc));
	});
});
describe('Four approved Mold Breaker composites',()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	for(const name of ['Fallen Star','Atrocity','Sun Sovereign','Void Omen']){
		for(const [ability,move] of [['Levitate','earthquake'],['Water Absorb','watergun'],['Sturdy','tackle']])it(`${name} bypasses ${ability}`,()=>{
			const[p,t]=start(ability,name);if(ability==='Sturdy')t.hp=t.maxhp=t.baseMaxhp=1;
			battle.actions.useMove(move,p,{target:t});assert(t.hp<t.maxhp);
		});
		it(`${name} announces and exposes Mold Breaker once`,()=>{
			const[p]=start('No Ability',name);assert(p.hasAbility('moldbreaker'));
			assert.equal(battle.log.filter(x=>x.startsWith('|-ability|')&&x.endsWith('|Mold Breaker')).length,1);
			assert(/Mold Breaker/.test(p.getAbility().desc));assert(require('../../../dist/data/ability-display').getAbilityDisplayComponents(p.ability).includes('moldbreaker'));
			const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');assert(calculatorMetadata().abilityComponents[p.ability].includes('Mold Breaker'));
		});
		it(`${name} preserves its existing suppression policy`,()=>{
			const[p,t]=start('Levitate',name);p.addVolatile('gastroacid',t);
			const unsuppressible=['Fallen Star','Atrocity'].includes(name);assert.equal(p.hasAbility('moldbreaker'),unsuppressible);
			battle.actions.useMove('earthquake',p,{target:t});assert.equal(t.hp<t.maxhp,unsuppressible);
		});
		it(`${name} does not bypass Protect or unbreakable Shadow Shield`,()=>{
			const[p,t]=start('Shadow Shield',name);t.addVolatile('protect',t);battle.actions.useMove('watergun',p,{target:t});assert.equal(t.hp,t.maxhp);
			t.removeVolatile('protect');const move=battle.dex.getActiveMove('watergun');move.ignoreAbility=true;battle.setActiveMove(move,p,t);
			assert.equal(battle.runEvent('ModifyDamage',p,t,move,1000),800);battle.clearActiveMove();
		});
	}
	for(const name of ['Atrocity','Sun Sovereign'])it(`${name} retains field entry, healing and Proficient once`,()=>{
		const[p,t]=start('No Ability',name);if(name==='Sun Sovereign'){assert.equal(battle.field.weather,'sunnyday');assert.equal(battle.field.weatherState.duration,8);}
		assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('psychic'),1000),name==='Atrocity'?1689:1300);
		battle.field.setTerrain('dragonsdenterrain',p,p.getAbility());battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.def,1);assert.equal(p.boosts.spd,1);
		p.hp=100;battle.singleEvent('Residual',p.getAbility(),p.abilityState,p);assert.equal(p.hp,100+Math.floor(p.baseMaxhp/16));
	});
	it('Atrocity retains its crit stage, Dragon Rush accuracy and defense multipliers',()=>{
		const[p,t]=start('No Ability','Atrocity');const m=battle.dex.getActiveMove('dragonrush');const originalCrit=m.critRatio;battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);
		assert.equal(m.critRatio,originalCrit+1);assert.equal(m.accuracy,true);assert(m.ignoreAbility);
		assert.equal(battle.runEvent('ModifyDef',p,null,null,1000),1300);assert.equal(battle.runEvent('ModifySpD',p,null,null,1000),1300);
	});
	it('Void Omen preserves Friend Guard, Serene Grace and its one-use ward',()=>{
		const mon={species:'Mew',ability:'No Ability',moves:['splash']};
		battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[{...mon,ability:'Void Omen'},{...mon}],[{...mon},{...mon}]]);battle.makeChoices('team 12','team 12');
		const p=battle.p1.active[0],ally=battle.p1.active[1],foe=battle.p2.active[0],move=battle.dex.getActiveMove('tackle');
		assert.equal(battle.runEvent('ModifyDamage',foe,ally,move,1000),750);assert.equal(battle.runEvent('ModifyDamage',foe,p,move,1000),1000);
		const flame=battle.dex.getActiveMove('flamethrower');const originalChance=flame.secondaries[0].chance;
		battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,flame,p,foe);assert.equal(flame.secondaries[0].chance,originalChance*2);assert(flame.ignoreAbility);
		const solar=battle.dex.getActiveMove('solarbeam');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,solar,p,foe);assert(!solar.flags.charge);
		battle.singleEvent('AfterSuccessfulSecondary',p.getAbility(),p.abilityState,p);
		battle.boost({atk:-1},ally,foe);assert.equal(ally.boosts.atk,0);battle.boost({atk:-1},ally,foe);assert.equal(ally.boosts.atk,-1);
		battle.singleEvent('AfterSuccessfulSecondary',p.getAbility(),p.abilityState,p);assert.equal(p.abilityState.ward,false);
	});
});
