'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(ability='Triple Threat') {
	battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dodrio',ability,moves:['tackle','splash']}],[{species:'Blissey',ability:'No Ability',moves:['splash']}]]);
	battle.makeChoices('team 1','team 1');return [battle.p1.active[0],battle.p2.active[0]];
}
describe('Triple Threat Limber replacement',()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	it('has exactly the five approved identities and no Sniper or Inner Focus',()=>{
		const [p]=start();const {AbilityComponents}=require('../../../dist/data/ability-components');
		assert.deepEqual(AbilityComponents.triplethreat,['hydrabond','tangledfeet','keeneye','bigpecks','limber']);
		for(const id of AbilityComponents.triplethreat)assert(p.hasAbility(id));
		assert(!p.hasAbility('sniper'));assert(!p.hasAbility('innerfocus'));
		assert(Object.values(battle.dex.species.get('Dodrio').abilities).includes('Triple Threat'));
	});
	it('has no Sniper entry accuracy or critical-damage multiplier',()=>{
		const [p,t]=start();assert.equal(p.boosts.accuracy,0);assert.equal(p.getAbility().onModifyDamage,undefined);
		const m=battle.dex.getActiveMove('tackle');t.getMoveHitData(m).crit=true;
		assert.equal(battle.runEvent('ModifyDamage',p,t,m,1000),1000);
		assert(!/Sniper|2\.25x|Accuracy on entry/.test(p.getAbility().desc));
	});
	it('prevents paralysis and cures paralysis when acquired',()=>{
		const [p,t]=start();assert.equal(p.setStatus('par',t,battle.dex.moves.get('thunderwave')),false);
		p.setAbility('No Ability');assert(p.setStatus('par',t));p.setAbility('Triple Threat');
		battle.singleEvent('Update',p.getAbility(),p.abilityState,p);assert.equal(p.status,'');
	});
	it('blocks opposing Speed, accuracy and Defense drops, retaining current Big Pecks SpD behavior',()=>{
		const [p,t]=start();battle.boost({spe:-1,accuracy:-1,def:-1,spd:-1},p,t,battle.dex.moves.get('tackle'));
		assert.equal(p.boosts.spe,0);assert.equal(p.boosts.accuracy,0);assert.equal(p.boosts.def,0);assert.equal(p.boosts.spd,-1);
	});
	it('blocks field Speed drops but preserves self costs and item slowdown',()=>{
		const [p]=start();battle.boost({spe:-1},p,p,battle.dex.conditions.get('swampterrain'));assert.equal(p.boosts.spe,0);
		battle.boost({spe:-1},p,p,battle.dex.moves.get('hammerarm'));assert.equal(p.boosts.spe,-1);
		p.setItem('ironball');assert.equal(battle.runEvent('ModifySpe',p,null,null,1000),500);
	});
	for(const field of ['coldeclipseterrain','icyterrain','murkwatersurfaceterrain','newworldterrain','snowyterrain','midnightzoneterrain','underwaterterrain','watersurfaceterrain'])it(`retains local Limber protection on ${field}`,()=>{
		const [p]=start();p.setType('Normal');battle.field.setTerrain(field,p,p.getAbility());
		assert.equal(battle.field.terrain,field);
		assert.equal(battle.runEvent('ModifySpe',p,null,null,1000),1000);
	});
	it('preserves exactly three Hydra Bond hits and Dragon Den power',()=>{
		const [p,t]=start();t.hp=t.maxhp=t.baseMaxhp=10000;
		battle.actions.useMove('tackle',p,{target:t});assert(battle.log.some(x=>x.startsWith('|-hitcount|')&&x.endsWith('|3')));
		battle.field.setTerrain('dragonsdenterrain',p,p.getAbility());assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1200);
	});
	it('preserves Tangled Feet confusion and Big Top entry effects once',()=>{
		const [p,t]=start();p.addVolatile('confusion',p);
		assert.equal(battle.runEvent('ModifyCritRatio',p,t,battle.dex.getActiveMove('tackle'),1),2);
		assert.equal(battle.runEvent('ModifyAccuracy',p,t,battle.dex.getActiveMove('tackle'),100),50);
		battle.field.setTerrain('bigtopterrain',p,p.getAbility());battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.evasion,1);assert.equal(p.boosts.accuracy,0);
	});
	it('preserves independent Keen Eye and Tangled Feet Mirror Arena entry effects once',()=>{
		const [p,t]=start();battle.field.setTerrain('mirrorarenaterrain',p,p.getAbility());battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.accuracy,1);assert.equal(p.boosts.evasion,1);assert(p.volatiles.laserfocus);
		const m=battle.dex.getActiveMove('tackle');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert(m.ignoreEvasion);assert.equal(m.multihit,3);
	});
	it('suppression disables Limber and its field identity',()=>{
		const [p,t]=start();p.addVolatile('gastroacid',t);assert(!p.hasAbility('limber'));assert(p.setStatus('par',t));
	});
	it('calculator metadata matches the final composition',()=>{
		const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');
		assert.deepEqual(calculatorMetadata().abilityComponents.triplethreat,['Hydra Bond','Tangled Feet','Keen Eye','Big Pecks','Limber']);
	});
	it('keeps Dodrio at 525 BST with the final approved Attack and Speed',()=>{
		const [p]=start();assert.deepEqual(p.species.baseStats,{hp:90,atk:106,def:85,spa:50,spd:75,spe:119});assert.equal(p.species.bst,525);
		assert.deepEqual(p.species.types,['Ground','Flying']);assert.deepEqual(p.species.abilities,{0:'Triple Threat',1:'Speed Boost',H:'Striker Frenzy'});
	});
});
