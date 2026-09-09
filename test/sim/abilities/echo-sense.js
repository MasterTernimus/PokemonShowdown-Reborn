'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Noivern and Echo Sense',function(){
	afterEach(()=>battle?.destroy());
	it('evolves with Noivernite and combines its component effects',function(){
		battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Noivern',item:'Noivernite',ability:'Wind Power',moves:['splash']}],[{species:'Mew',item:'Leftovers',ability:'noability',moves:['splash','boomburst']}]]);
		battle.makeChoices('team 1','team 1');
		const bat=battle.p1.active[0],foe=battle.p2.active[0];
		assert.equal(bat.canMegaEvo,'Noivern-Mega');
		battle.makeChoices('move splash mega','move splash');
		assert.equal(bat.ability,'echosense');
		assert.deepEqual(bat.species.baseStats,{hp:85,atk:100,def:80,spa:127,spd:90,spe:153});
		assert(battle.log.some(line=>line.includes('ability: Frisk')));
		const move=battle.dex.getActiveMove('boomburst');
		battle.singleEvent('ModifyType',bat.getAbility(),bat.abilityState,move,bat);
		battle.singleEvent('ModifyMove',bat.getAbility(),bat.abilityState,move,bat);
		assert.equal(move.type,'Flying');assert.equal(move.infiltrates,true);
		assert.equal(battle.runEvent('BasePower',bat,foe,move,100),150);
		const hp=bat.hp;
		battle.makeChoices('move splash','move boomburst');
		assert.equal(bat.hp,hp);
		battle.field.setTerrain('psychicterrain',bat);
		assert.equal(battle.runEvent('ModifySpe',bat,null,null,100),200);
		assert.equal(battle.runEvent('TryHit',bat,bat,battle.dex.getActiveMove('tackle')),true);
	});
	it('blocks an ally damaging move with Telepathy',function(){
		battle=common.createBattle({formatid:'gen9nofielddoublesbattle'},[[{species:'Noivern-Mega',ability:'Echo Sense',moves:['splash']},{species:'Mew',moves:['splash']}],[{species:'Mew',moves:['splash']},{species:'Mew',moves:['splash']}]]);
		battle.makeChoices('team 12','team 12');
		assert.equal(battle.runEvent('TryHit',battle.p1.active[0],battle.p1.active[1],battle.dex.getActiveMove('tackle')),null);
	});
});
