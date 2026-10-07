'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(species='Decidueye-Hisui',ability='Unburden',doubles=false) {
	const p={species,ability,moves:['triplearrows','splash','transform']};
	const t={species:'Blissey',ability:'No Ability',moves:['splash']};
	battle=common.createBattle({formatid:doubles?'gen9nofielddoublesbattle':'gen9nofieldsinglesgame'},[[p,{species:'Mew',ability:'No Ability',moves:['splash']}],doubles?[t,{...t}]:[t]]);
	battle.makeChoices('team 12',doubles?'team 12':'team 1');
	for(const foe of battle.p2.active)foe.hp=foe.maxhp=foe.baseMaxhp=10000;
	return [battle.p1.active[0],battle.p2.active[0]];
}
function use(p,t,patch={}){const m=battle.dex.getActiveMove('triplearrows');Object.assign(m,patch);battle.actions.useMove(m,p,{target:t});}
function layers(p){return p.volatiles.triplearrows?.layers||0;}
function crit(p){return battle.runEvent('ModifyCritRatio',p,null,battle.dex.getActiveMove('tackle'),1);}
describe('Triple Arrows Hisuian active ally lifecycle',()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	for(const species of ['Decidueye-Hisui','Decidueye-Hisui-Alt'])for(const ability of ['Fallen Star','Unburden','Scrappy'])it(`${species} / ${ability} adds one finite active layer per landed hit`,()=>{
		const[p,t]=start(species,ability);use(p,t);assert.equal(layers(p),ability==='Fallen Star'?2:1);assert.equal(crit(p),1+layers(p));
		assert(Number.isFinite(crit(p)));assert.equal(p.volatiles.gmaxchistrike,undefined);assert.equal(p.side.sideConditions.gmaxchistrike,undefined);
		for(let i=0;i<4;i++)use(p,t);assert.equal(layers(p),3);assert.equal(crit(p),4);
	});
	it('two landed Dual Wield hits give two stacks',()=>{
		const[p,t]=start('Decidueye-Hisui','Dual Wield');use(p,t);assert.equal(layers(p),2);
		assert(battle.log.some(x=>x.startsWith('|-hitcount|')&&x.endsWith('|2')));
	});
	it('a landed first hit followed by a miss adds only one stack',()=>{
		const[p,t]=start('Decidueye-Hisui','Dual Wield');let checks=0;
		battle.randomChance=(n,d)=>d===100&&n===91?++checks===1:false;
		use(p,t,{accuracy:91});assert.equal(layers(p),1);assert.equal(checks,2);
	});
	for(const species of ['Decidueye','Decidueye-Alt','Mew','Gallade','Dodrio'])it(`${species} cannot activate the side boost`,()=>{
		const[p,t]=start(species,'No Ability');use(p,t);assert.equal(layers(p),0);assert.equal(crit(p),1);
	});
	for(const ability of ['Fallen Star','Dual Wield'])it(`ineligible users retain ${ability} followups`,()=>{
		const[p,t]=start('Mew',ability);use(p,t);assert.equal(layers(p),0);assert(battle.log.some(x=>x.startsWith('|-hitcount|')&&x.endsWith('|2')));
	});
	it('does not increment for failed, protected, missed or immune hits',()=>{
		const[p,t]=start();t.addVolatile('protect',t);use(p,t);assert.equal(layers(p),0);
		t.removeVolatile('protect');use(p,t,{accuracy:0});assert.equal(layers(p),0);
		t.setType('Ghost');use(p,t);assert.equal(layers(p),0);
		t.setType('Normal');t.setAbility('Wonder Guard');use(p,t,{type:'Normal'});assert.equal(layers(p),0);
	});
	it('shares stacks with allies, not foes, and multiple eligible users share the cap',()=>{
		const[p,t]=start('Decidueye-Hisui','Unburden',true);const ally=battle.p1.active[1];use(p,t);
		assert.equal(crit(ally),2);assert.equal(crit(t),1);
		ally.setSpecies(battle.dex.species.get('Decidueye-Hisui-Alt'));use(ally,t);assert.equal(layers(p),2);
		use(p,t);use(ally,t);assert.equal(layers(p),3);assert.equal(crit(ally),4);
	});
	it('increments for each landed target of a multi-target use',()=>{
		const[p,t]=start('Decidueye-Hisui','Unburden',true);use(p,t,{target:'allAdjacentFoes'});assert.equal(layers(p),2);
	});
	it('keeps layers while active but clears them on switching',()=>{
		const[p,t]=start();use(p,t);for(let i=0;i<4;i++)battle.makeChoices('move splash','move splash');
		assert.equal(layers(p),1);assert.equal(p.volatiles.triplearrows.duration,undefined);
		battle.makeChoices('switch 2','move splash');assert.equal(crit(battle.p1.active[0]),1);
		battle.makeChoices('switch 2','move splash');assert.equal(crit(p),1);
	});
	it('clears only the departing ally and cannot be passed with Baton Pass',()=>{
  const[p,t]=start('Decidueye-Hisui','Unburden',true); const ally=battle.p1.active[1]; use(p,t);
  p.clearVolatile(); assert.equal(crit(p),1); assert.equal(crit(ally),2);
  assert.equal(battle.dex.moves.get('triplearrows').condition.noCopy,true);
  assert.equal(p.side.sideConditions.triplearrows,undefined);
 });
 it('copying the move with Mimic does not grant eligibility',()=>{
		const[p,t]=start('Mew','No Ability');p.moveSlots[0].id='mimic';p.moveSlots[0].move='Mimic';t.lastMove=battle.dex.moves.get('triplearrows');
		battle.actions.useMove('mimic',p,{target:t});assert(p.hasMove('triplearrows'));use(p,t);assert.equal(layers(p),0);
	});
	it('Transform into Hisui qualifies; Transform away does not',()=>{
		const[p,t]=start('Mew','No Ability');t.setSpecies(battle.dex.species.get('Decidueye-Hisui'));t.setAbility('Unburden');assert(p.transformInto(t));use(p,t);assert.equal(layers(p),1);
	});
	it('a Hisuian original transformed away cannot activate it',()=>{
		const[p,t]=start();assert(p.transformInto(t));use(p,t);assert.equal(layers(p),0);
	});
	it('leaves all other Triple Arrows data and public text unchanged',()=>{
		start();const m=battle.dex.moves.get('triplearrows');assert.equal(m.basePower,90);assert.equal(m.critRatio,2);assert.equal(m.accuracy,100);
		assert.deepEqual(m.secondaries,[{chance:50,boosts:{def:-1}},{chance:30,volatileStatus:'flinch'}]);
		assert(!/Chi Strike|ally crit|raises the critical|user.s side/i.test(m.desc+' '+m.shortDesc));
	});
	it('leaves G-Max Chi Strike volatile scope, cap and switch reset intact',()=>{
		const[p,t]=start('Machamp','No Ability',true);const m=battle.dex.getActiveMove('gmaxchistrike');
		for(let i=0;i<4;i++)battle.singleEvent('Hit',m.self,{},p,p,m);
		for(const ally of p.alliesAndSelf()){assert.equal(ally.volatiles.gmaxchistrike.layers,3);assert.equal(crit(ally),4);}
		assert.equal(layers(p),0);p.clearVolatile();assert.equal(p.volatiles.gmaxchistrike,undefined);assert.equal(crit(p),1);
	});
});
