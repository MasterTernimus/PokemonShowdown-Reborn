'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(ability='Hydra Bond') {
	battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Dodrio',ability,moves:['tackle','splash']}],[{species:'Blissey',ability:'No Ability',moves:['splash']}]]);
	battle.makeChoices('team 1','team 1');return [battle.p1.active[0],battle.p2.active[0]];
}
describe('Triple Threat reviewed component replacement', () => {
	afterEach(()=>{battle?.destroy();battle=null;});
	it('has Inner Focus, Keen Eye and Early Bird; Triple Threat is the species passive', () => {
		const [p]=start();const {AbilityComponents}=require('../../../dist/data/ability-components');
		assert.deepEqual(AbilityComponents.triplethreat, ['innerfocus', 'keeneye', 'earlybird']);
		for(const id of AbilityComponents.triplethreat)assert(p.hasAbilityOrPassive(id));
		assert(!p.hasAbility('sniper')); assert(p.hasAbilityOrPassive('innerfocus')); assert.deepEqual(p.getPassives(), ['triplethreat']);
		assert(Object.values(battle.dex.species.get('Dodrio').abilities).includes('Hydra Bond'));
	});
	it('has no Sniper entry accuracy or critical-damage multiplier',()=>{
		const [p,t]=start();assert.equal(p.boosts.accuracy,0);assert.equal(p.getAbility().onModifyDamage,undefined);
		const m=battle.dex.getActiveMove('tackle');t.getMoveHitData(m).crit=true;
		assert.equal(battle.runEvent('ModifyDamage',p,t,m,1000),1000);
		assert(!/Sniper|2\.25x|Accuracy on entry/.test(p.getAbility().desc));
	});
	it('blocks flinching and Intimidate but permits paralysis', () => {
		const [p, t] = start(); assert(!p.addVolatile('flinch', t));
		battle.boost({ atk: -1 }, p, t, battle.dex.abilities.get('intimidate')); assert.equal(p.boosts.atk, 0);
		assert(p.setStatus('par', t, battle.dex.moves.get('thunderwave')));
	});
	it('blocks opposing accuracy drops without protecting Speed or defenses', () => {
		const [p,t]=start();battle.boost({spe:-1,accuracy:-1,def:-1,spd:-1},p,t,battle.dex.moves.get('tackle'));
		assert.equal(p.boosts.spe, -1);
		assert.equal(p.boosts.accuracy, 0);
		assert.equal(p.boosts.def, -1);
		assert.equal(p.boosts.spd, -1);
	});
	it('permits field Speed drops, self costs and item slowdown', () => {
		const [p] = start(); battle.boost({ spe: -1 }, p, p, battle.dex.conditions.get('swampterrain')); assert.equal(p.boosts.spe, -1);
		battle.boost({ spe: -1 }, p, p, battle.dex.moves.get('hammerarm')); assert.equal(p.boosts.spe, -2);
		p.setItem('ironball');assert.equal(battle.runEvent('ModifySpe',p,null,null,1000),500);
	});
	for (const [field, speed] of [['coldeclipseterrain', 1000], ['icyterrain', 750], ['murkwatersurfaceterrain', 750], ['newworldterrain', 750], ['snowyterrain', 750], ['midnightzoneterrain', 250], ['underwaterterrain', 500], ['watersurfaceterrain', 750]])it(`does not grant retired Limber protection on ${field}`, () => {
		const [p]=start();p.setType('Normal');battle.field.setTerrain(field,p,p.getAbility());
		assert.equal(battle.field.terrain,field);
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 1000), speed);
	});
	it('preserves exactly three Hydra Bond hits and Dragon Den power',()=>{
		const [p,t]=start();t.hp=t.maxhp=t.baseMaxhp=10000;
		battle.actions.useMove('tackle',p,{target:t});assert(battle.log.some(x=>x.startsWith('|-hitcount|')&&x.endsWith('|3')));
		battle.field.setTerrain('dragonsdenterrain',p,p.getAbility());assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1200);
	});
	it('does not retain Tangled Feet confusion or Big Top bonuses', () => {
		const [p,t]=start();p.addVolatile('confusion',p);
		assert.equal(battle.runEvent('ModifyCritRatio', p, t, battle.dex.getActiveMove('tackle'), 1), 1);
		assert.equal(battle.runEvent('ModifyAccuracy', p, t, battle.dex.getActiveMove('tackle'), 100), 100);
		battle.field.setTerrain('bigtopterrain',p,p.getAbility());battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.evasion, 0); assert.equal(p.boosts.accuracy, 0);
	});
	it('preserves Keen Eye Mirror Arena entry and selected Hydra Bond', () => {
		const [p,t]=start();battle.field.setTerrain('mirrorarenaterrain',p,p.getAbility());battle.singleEvent('Start',battle.dex.abilities.get('triplethreat'),p.passiveStates.triplethreat,p);
		assert.equal(p.boosts.accuracy, 1); assert.equal(p.boosts.evasion, 0); assert(p.volatiles.laserfocus);
		const m = battle.dex.getActiveMove('tackle');
		battle.runEvent('ModifyMove', p, t, m, m);
		assert(m.ignoreEvasion);
		assert.equal(m.multihit, 3);
	});
	it('suppression removes Hydra Bond while Triple Threat remains', () => {
		const [p, t] = start();
		p.addVolatile('gastroacid', t);
		assert(!p.hasAbility('innerfocus'));
		assert(!p.addVolatile('flinch', t));
		assert.deepEqual(p.getPassives(), ['triplethreat']);
	});
	it('calculator metadata matches the final composition',()=>{
		const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');
		assert.deepEqual(calculatorMetadata().abilityComponents.triplethreat, ['Inner Focus', 'Keen Eye', 'Early Bird']);
	});
	it('keeps Dodrio at 525 BST with the final approved Attack and Speed',()=>{
		const [p]=start();assert.deepEqual(p.species.baseStats,{hp:90,atk:106,def:85,spa:50,spd:75,spe:119});assert.equal(p.species.bst,525);
		assert.deepEqual(p.species.types, ['Ground', 'Flying']); assert.deepEqual(p.species.abilities, { 0: 'Hydra Bond', 1: 'Speed Boost', H: 'Long Stride' });
	});
});
