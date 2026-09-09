'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Weavile and Frost Stalker',function(){
	afterEach(()=>battle?.destroy());
	it('evolves with Weavilite and combines all three effects',function(){
		battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Weavile',item:'Weavilite',ability:'Pressure',moves:['splash']}],[{species:'Mew',moves:['splash']}]]);
		battle.makeChoices('team 1','team 1');
		const mon=battle.p1.active[0],foe=battle.p2.active[0];
		assert.deepEqual(mon.species.baseStats,{hp:85,atk:130,def:75,spa:30,spd:90,spe:130});
		assert.equal(mon.canMegaEvo,'Weavile-Mega');
		battle.makeChoices('move splash mega','move splash');
		assert.equal(mon.ability,'froststalker');
		assert.deepEqual(mon.species.baseStats,{hp:85,atk:160,def:85,spa:50,spd:100,spe:160});
		const move=battle.dex.getActiveMove('slash');
		battle.singleEvent('ModifyType',mon.getAbility(),mon.abilityState,move,mon);
		assert.equal(move.type,'Ice');
		assert.equal(battle.runEvent('BasePower',mon,foe,move,100),180);
		foe.activeTurns=0;
		assert.equal(battle.runEvent('ModifyAtk',mon,foe,move,100),200);
		foe.activeTurns=1;
		assert.equal(battle.runEvent('ModifyAtk',mon,foe,move,100),100);
	});
});
