'use strict';
const assert=require('assert').strict;
const common=require('../../common');
const {Dex}=require('../../../dist/sim/dex');
const {TeamValidator}=require('../../../dist/sim/team-validator');
let battle;
describe('Fallen Star wording and Decidueye learnset cleanup',()=>{
	afterEach(()=>{battle?.destroy();battle=null;});
	const family=['rowlet','dartrix','decidueye','decidueyehisui','decidueyealt','decidueyehisuialt'];
	for(const id of family)for(const move of ['iciclespear','spikecannon'])it(`${id} cannot learn ${move} through any inheritance route`,()=>{
		assert(!Dex.species.getFullLearnset(id).some(data=>data.learnset[move]?.length));
		const validator=new TeamValidator('gen9nofieldsinglesgame');
		assert(validator.checkCanLearn(Dex.moves.get(move),Dex.species.get(id)), 'validator must reject the move');
	});
	it('preserves other family moves and unrelated species access',()=>{
		for(const id of ['decidueye','decidueyehisui','decidueyealt','decidueyehisuialt'])assert(Dex.species.getFullLearnset(id).some(data=>data.learnset.triplearrows?.length));
		assert(Dex.species.getFullLearnset('cloyster').some(data=>data.learnset.iciclespear?.length));
		assert(Dex.species.getFullLearnset('omastar').some(data=>data.learnset.spikecannon?.length));
	});
	it('states the arrow-only half-HP priority rule without redundant or hidden-feature text',()=>{
		const a=Dex.abilities.get('fallenstar');for(const text of [a.desc,a.shortDesc]){assert(/\+1 priority at half HP or less/.test(text));assert(!/Skill Link|crit.*stack|side.*crit/i.test(text));}
		const m=Dex.moves.get('triplearrows');assert(!/Chi Strike|ally crit|raises the critical|user.s side/i.test(m.desc+' '+m.shortDesc));
	});
	it('keeps the existing exact priority threshold and designated move applicability',()=>{
		battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Decidueye-Hisui',ability:'Fallen Star',moves:['triplearrows']}],[{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 1');
		const p=battle.p1.active[0],t=battle.p2.active[0];p.hp=p.maxhp=100;
		const arrows=['spiritshackle','thousandarrows','triplearrows','snipeshot','razorleaf','magicalleaf','spikecannon','pinmissile','iciclespear','rockblast','bulletseed','scaleshot','psychocut','ceaselessedge'];
		for(const hp of [100,51,50,49]){p.hp=hp;for(const id of [...arrows,'tackle','splash'])assert.equal(battle.runEvent('ModifyPriority',p,t,battle.dex.getActiveMove(id),0),hp<=50&&arrows.includes(id)?1:0,id+' at '+hp);}
	});
});
