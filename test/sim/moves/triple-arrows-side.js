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
describe('Triple Arrows without self or ally critical stacks',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 for(const species of ['Decidueye-Hisui','Decidueye-Hisui-Alt'])for(const ability of ['Fallen Star','Unburden','Scrappy','Dual Wield'])it(species+' / '+ability+' never grants self or ally stacks',()=>{
  const[p,t]=start(species,ability,true);const ally=battle.p1.active[1];
  for(let i=0;i<5;i++)use(p,t);
  for(const member of [p,ally,t]){assert.equal(layers(member),0);assert.equal(crit(member),1);}
  assert(!battle.log.some(x=>x.startsWith('|-start|')&&x.includes('Triple Arrows')));
  assert(battle.log.some(x=>x.startsWith('|move|')&&x.includes('|Triple Arrows|')));
  if(['Fallen Star','Dual Wield'].includes(ability))assert(battle.log.some(x=>x.startsWith('|-hitcount|')&&x.endsWith('|2')));
 });
 it('has no residual self grant or critical-layer condition',()=>{start();const m=battle.dex.moves.get('triplearrows');assert.equal(m.self,undefined);assert.equal(m.condition,undefined);});
 it('multi-target attacks cannot grant layers to active allies',()=>{const[p,t]=start('Decidueye-Hisui','Unburden',true);use(p,t,{target:'allAdjacentFoes'});for(const ally of p.alliesAndSelf()){assert.equal(layers(ally),0);assert.equal(crit(ally),1);}});
 it('Transform into Hisui cannot restore the removed effect',()=>{const[p,t]=start('Mew','No Ability');t.setSpecies(battle.dex.species.get('Decidueye-Hisui'));t.setAbility('Unburden');assert(p.transformInto(t));use(p,t);assert.equal(layers(p),0);assert.equal(crit(p),1);});
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
