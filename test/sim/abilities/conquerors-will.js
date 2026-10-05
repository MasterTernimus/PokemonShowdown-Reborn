'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(ability="Conqueror's Will", doubles=false) {
	const mon={species:'Mew',ability,moves:['kowtowcleave','tackle','splash']};
	const foe={species:'Mew',ability:'No Ability',item:'Sitrus Berry',moves:['splash','protect']};
	battle=common.createBattle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},[doubles?[mon,{...foe}]:[mon],doubles?[{...foe},{...foe}]:[foe]]);
	battle.makeChoices(doubles?'team 12':'team 1',doubles?'team 12':'team 1');
	return [battle.p1.active[0],battle.p2.active[0]];
}
function screens(target) {
	for(const id of ['reflect','lightscreen','auroraveil'])target.side.addSideCondition(id,target,battle.dex.moves.get(id));
}
function checkScreens(target,present) {
	for(const id of ['reflect','lightscreen','auroraveil'])assert.equal(!!target.side.getSideCondition(id),present,id);
}
function use(p,target,id='kowtowcleave',patch={}) {
	const move=battle.dex.getActiveMove(id);Object.assign(move,patch);
	battle.actions.useMove(move,p,{target});
}
describe("Conqueror's Will",()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	it('has only the approved components and exact Kingambit slot',()=>{
		const [p]=start();
		assert.deepEqual(battle.dex.species.get('Kingambit').abilities,{0:'Defiant',1:"Conqueror's Will",H:'Royal Decree'});
		assert(p.hasAbility('supremeoverlord'));assert(p.hasAbility('unnerve'));assert(!p.hasAbility('battlearmor'));
		const {AbilityComponents}=require('../../../dist/data/ability-components');
		assert.deepEqual(AbilityComponents.conquerorswill,['supremeoverlord','unnerve']);
	});
	for(const fallen of [0,1,2,4,5,7])it(`scales once with a five-faint cap at ${fallen} fallen`,()=>{
		const [p,t]=start();p.side.totalFainted=fallen;
		assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1000+100*Math.min(5,fallen));
	});
	it('inherits the current allied-side and FFA fallen calculation',()=>{
		const [p]=start();p.side.totalFainted=2;
		const fn=p.getAbility().fallen;
		const fake={side:{totalFainted:2,allySide:{totalFainted:1}}};
		assert.equal(fn.call(battle,fake),3);
		const mode=battle.gameType;battle.gameType='freeforall';assert.equal(fn.call(battle,fake),5);battle.gameType=mode;
	});
	for(const mode of ['multi','freeforall'])it(`retains actual ${mode} power accounting`,()=>{
		const teams=Array.from({length:4},(_,i)=>[{species:'Mew',ability:i===0?"Conqueror's Will":'No Ability',moves:['splash']}]);
		battle=common.createBattle({gameType:mode},teams);
		const p=battle.p1.active[0],t=battle.p2.active[0];p.side.totalFainted=2;
		if(mode==='multi')p.side.allySide.totalFainted=1;
		assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),mode==='multi'?1300:1400);
	});
	it('inherits 2/4/5 thresholds and only one entry boost',()=>{
		const [p,t]=start();p.side.totalFainted=2;
		const m=battle.dex.getActiveMove('tackle');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);assert(m.infiltrates);
		p.side.totalFainted=4;assert(!p.addVolatile('flinch',t));
		p.side.totalFainted=5;
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,1);
		assert.equal(battle.runEvent('Damage',p,t,battle.dex.conditions.get('brn'),100),false);
		assert.equal(battle.runEvent('Damage',p,t,battle.dex.getActiveMove('tackle'),100),100);
	});
	it('updates fallen state on ally faint without double threshold boosts',()=>{
		const [p]=start("Conqueror's Will",true);const ally=battle.p1.active[1];p.side.totalFainted=5;
		battle.singleEvent('AnyFaint',p.getAbility(),p.abilityState,ally);
		battle.singleEvent('AnyFaint',p.getAbility(),p.abilityState,ally);
		assert.equal(p.abilityState.fallen,5);assert.equal(p.boosts.atk,1);assert.equal(p.boosts.spa,1);
	});
	it('blocks both foes Berries in doubles, not its ally, and releases them on suppression',()=>{
		const [p]=start("Conqueror's Will",true);
		for(const foe of battle.p2.active){foe.hp=1;assert.equal(foe.eatItem(),false);assert.equal(foe.item,'sitrusberry');}
		const ally=battle.p1.active[1];ally.hp=1;assert.equal(ally.eatItem(),true);
		p.addVolatile('gastroacid',battle.p2.active[0]);
		for(const foe of battle.p2.active)assert.equal(foe.eatItem(),true);
	});
	it('retains field Seed blocking and Cold Eclipse entry once',()=>{
		const [p,t]=start();t.setItem('elementalseed');
		assert.equal(t.useItem(),false);
		t.clearItem();
		battle.singleEvent('End',p.getAbility(),p.abilityState,p);
		battle.field.setTerrain('coldeclipseterrain',p,p.getAbility());
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(t.boosts.spe,-1);
	});
	it('removes all three opposing screens before attack damage',()=>{
		const [p,t]=start();screens(t);const before=battle.log.length;use(p,t);
		checkScreens(t,false);assert(t.hp<t.maxhp);
		const log=battle.log.slice(before);const hit=log.findIndex(x=>x.startsWith('|-damage|'));
		for(const screen of ['Reflect','Light Screen','Aurora Veil'])assert(log.findIndex(x=>x.includes('|-sideend|')&&x.includes(screen))<hit);
	});
	it('breaks screens through Substitute at zero fallen',()=>{
		const [p,t]=start();t.addVolatile('substitute',t);screens(t);use(p,t);checkScreens(t,false);
	});
	it('does not remove screens through Protect',()=>{
		const [p,t]=start();screens(t);t.addVolatile('protect',t);use(p,t);checkScreens(t,true);assert.equal(t.hp,t.maxhp);
	});
	it('does not remove screens on a forced miss',()=>{
		const [p,t]=start();screens(t);use(p,t,'kowtowcleave',{accuracy:0});checkScreens(t,true);assert.equal(t.hp,t.maxhp);
	});
	it('does not remove screens on type immunity',()=>{
		const [p,t]=start();t.setType('Ghost');screens(t);use(p,t,'kowtowcleave',{type:'Normal'});checkScreens(t,true);assert.equal(t.hp,t.maxhp);
	});
	it('does not remove screens on ability immunity',()=>{
		const [p,t]=start();t.setType('Normal');t.setAbility('Wonder Guard');screens(t);use(p,t);checkScreens(t,true);assert.equal(t.hp,t.maxhp);
	});
	it('leaves ordinary Kowtow Cleave and other moves unchanged',()=>{
		const [p,t]=start('Supreme Overlord');screens(t);use(p,t);checkScreens(t,true);
		p.setAbility("Conqueror's Will");use(p,t,'tackle');checkScreens(t,true);
		assert.equal(battle.dex.moves.get('kowtowcleave').onTryHit,undefined);
	});
	it('does not remove allied screens when targeting an ally',()=>{
		const [p]=start("Conqueror's Will",true);const ally=battle.p1.active[1];screens(ally);use(p,ally);checkScreens(ally,true);
	});
	it('loses inherited effects and screen breaking while suppressed',()=>{
		const [p,t]=start();p.side.totalFainted=5;p.addVolatile('gastroacid',t);screens(t);
		assert.equal(battle.runEvent('BasePower',p,t,battle.dex.getActiveMove('tackle'),1000),1000);
		assert.equal(battle.runEvent('Damage',p,t,battle.dex.conditions.get('brn'),100),100);
		use(p,t);checkScreens(t,true);
	});
	it('publishes exact calculator metadata',()=>{
		const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');const m=calculatorMetadata();
		assert.deepEqual(m.abilityComponents.conquerorswill,['Supreme Overlord','Unnerve']);
		assert.deepEqual(m.species.find(p=>p.name==='Kingambit').abilities,{0:'Defiant',1:"Conqueror's Will",H:'Royal Decree'});
	});
	it('does not add armor, forced-switch protection or Attack-drop cleansing',()=>{
		const [p,t]=start();p.side.totalFainted=5;
		assert.equal(p.getAbility().onCriticalHit,undefined);assert.equal(p.getAbility().onDragOut,undefined);
		battle.boost({atk:-2},p,t);assert.equal(p.boosts.atk,-2);
		assert.equal(battle.runEvent('ModifyDamage',t,p,battle.dex.getActiveMove('tackle'),1000),1000);
	});
});
