'use strict';
const assert=require('../../assert');
const common=require('../../common');
let battle;
describe('Mega Bronzong and Storm Bell',function(){
	afterEach(()=>battle?.destroy());
	it('Mega Evolves with rain, Fairy Tale boosts, reflection and Elevate',function(){
		battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Bronzong',item:'Bronzongite',ability:'Elevate',moves:['splash']}],[{species:'Mew',ability:'noability',moves:['splash']}]]);
		battle.makeChoices('team 1','team 1');
		const bell=battle.p1.active[0],foe=battle.p2.active[0];
		assert.equal(bell.canMegaEvo,'Bronzong-Mega');
		battle.field.setTerrain('fairytaleterrain',bell);
		battle.makeChoices('move splash mega','move splash');
		assert.equal(bell.species.name,'Bronzong-Mega');
		assert.equal(bell.ability,'stormbell');
		assert.deepEqual(bell.species.baseStats,{hp:67,atk:104,def:156,spa:104,spd:156,spe:23});
		assert(battle.field.isWeather('raindance'));
		assert.statStage(bell,'def',1);assert.statStage(bell,'spd',1);
		assert.equal(bell.isGrounded(),null);
		battle.boost({atk:-1},bell,foe,battle.dex.moves.get('growl'));
		assert.statStage(bell,'atk',0);assert.statStage(foe,'atk',-1);
		bell.getAbility().onSourceAfterFaint.call(battle,1,foe,bell,battle.dex.moves.get('psychic'));
		assert(bell.boosts.def===2 || bell.boosts.spd===2);
	});
});
