'use strict';const assert=require('assert').strict,common=require('../../common'),{Dex,TeamValidator}=require('../../../dist/sim');let battle;
function setup(types=['Fairy'],ability='No Ability'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Hydreigon',ability:'No Ability',item:'Dragonium Z',moves:['dragonrend','splash']}],[{species:'Mew',ability,moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);battle.makeChoices('team 1','team 12');battle.field.terrain='';const p=battle.p1.active[0],q=battle.p2.active[0];q.setType(types);q.hp=q.maxhp=q.baseMaxhp=5000;return[p,q];}
function use(p,q,id='dragonrend'){battle.actions.useMove(Object.assign(Dex.getActiveMove(id),{willCrit:false}),p,{target:q});return battle.activeMove;}
describe('Approved Dragon Rend replacement',()=>{afterEach(()=>{battle?.destroy();battle=null;});
 for(const[types,mod]of [[['Fairy'],0],[['Fairy','Steel'],-1],[['Fairy','Dragon'],1]])it(types.join('/')+' preserves the other defensive type',()=>{const[p,q]=setup(types);const hp=q.hp,m=use(p,q);assert(q.hp<hp);assert.equal(q.getMoveHitData(m).typeMod,mod);assert(!q.side.sideConditions.dragonrend);});
 it('does not change ordinary Dragon immunity or generic Z/Max attacks',()=>{const[p,q]=setup();const hp=q.hp;use(p,q,'dragonpulse');assert.equal(q.hp,hp);for(const m of [battle.actions.getActiveZMove(Dex.moves.get('dragonrend'),p),battle.actions.getActiveMaxMove(Dex.moves.get('dragonrend'),p)]){assert(!m.ignoreImmunity);assert(!m.onEffectiveness);battle.actions.useMove(m,p,{target:q});assert.equal(q.hp,hp);}});
 it('respects Wonder Guard and Protect',()=>{const[p,q]=setup(['Fairy'],'Wonder Guard');const hp=q.hp;use(p,q);assert.equal(q.hp,hp);q.setAbility('No Ability');q.addVolatile('protect');use(p,q);assert.equal(q.hp,hp);assert(!q.side.sideConditions.dragonrend);});
 it('damages Substitute without placing a hazard and preserves Volcanic conversion',()=>{const[p,q]=setup();q.addVolatile('substitute');q.volatiles.substitute.hp=2000;const hp=q.hp;battle.field.setTerrain('volcanicterrain',p);use(p,q);assert.equal(q.hp,hp);assert(q.volatiles.substitute.hp<2000);assert.equal(battle.field.terrain,'dragonsdenterrain');assert(!q.side.sideConditions.dragonrend);});
 it('keeps 75 power, 100 accuracy, 10 PP and staged adaptive category',()=>{const[p,q]=setup();const m=Dex.moves.get('dragonrend');assert.equal(m.basePower,75);assert.equal(m.accuracy,100);assert.equal(m.pp,10);p.storedStats.atk=p.storedStats.spa=100;assert.equal(use(p,q).category,'Special');p.boosts.atk=2;assert.equal(use(p,q).category,'Physical');});
 for(const species of ['Goodra-Hisui','Hydreigon','Cyclizar','Dragonite','Garchomp','Charizard'])it(species+' legally learns Dragon Rend',()=>{assert(Dex.species.getLearnsetData(Dex.species.get(species).id).learnset.dragonrend);assert.equal(TeamValidator.get('gen9nofieldsinglesgame').checkCanLearn(Dex.moves.get('dragonrend'),Dex.species.get(species)),null);});

	it('Dragon types receive both defensive field multipliers without stat stages', () => {
		const [p, q] = setup(['Normal']);
		const def = p.getStat('def'), spd = p.getStat('spd'), otherDef = q.getStat('def'), otherSpd = q.getStat('spd');
		battle.field.setTerrain('dragonsdenterrain', p);
		assert.equal(p.getStat('def'), battle.modify(def, 1.3));
		assert.equal(p.getStat('spd'), battle.modify(spd, 1.3));
		assert.equal(q.getStat('def'), otherDef); assert.equal(q.getStat('spd'), otherSpd);
		assert.equal(p.boosts.def, 0); assert.equal(p.boosts.spd, 0);
	});
	for (const substitute of [false, true])it('Dragon Rend sets ordinary Stealth Rock in the Den' + (substitute ? ' through Substitute' : ''), () => {
		const [p, q] = setup(); battle.field.setTerrain('dragonsdenterrain', p);
		if (substitute) { q.addVolatile('substitute'); q.volatiles.substitute.hp = 2000; }
		use(p, q); assert(q.side.sideConditions.stealthrock); assert(!q.side.sideConditions.dragonrend);
	});
	it('Dragon Rend cannot set Stealth Rock through Protect or Wonder Guard', () => {
		const [p, q] = setup(['Fairy'], 'Wonder Guard'); battle.field.setTerrain('dragonsdenterrain', p);
		use(p, q); assert(!q.side.sideConditions.stealthrock);
		q.setAbility('No Ability');
		q.addVolatile('protect');
		use(p, q);
		assert(!q.side.sideConditions.stealthrock);
	});
	it('Dragon Rend does not set rocks on the hit that creates the Den', () => {
		const [p, q] = setup(); battle.field.setTerrain('caveterrain', p); use(p, q);
		assert.equal(battle.field.terrain, 'dragonsdenterrain'); assert(!q.side.sideConditions.stealthrock);
		use(p, q); assert(q.side.sideConditions.stealthrock);
	});
	for (const field of ['caveterrain', 'volcanicterrain']) {
		it(`changes starting ${field} to Dragon's Den after damage`, () => {
			const [p, q] = setup(); battle.field.startTerrain(field);
			use(p, q);
			assert.equal(battle.field.terrain, 'dragonsdenterrain');
			assert.equal(battle.field.terrainState.terrain_type, 'Base');
			assert(!q.side.sideConditions.stealthrock);
			assert.equal(battle.field.clearTerrain('mid'), false);
		});
		it(`does not change ${field} through Protect or a field lock`, () => {
			const [p, q] = setup(); battle.field.startTerrain(field);
			q.addVolatile('protect'); use(p, q); assert.equal(battle.field.terrain, field);
			q.removeVolatile('protect'); q.setAbility('Neutralization');
			use(p, q); assert.equal(battle.field.terrain, field);
		});
		it(`lists Dragon Rend in the ${field} transition guide`, () => {
			const { fieldTransitionRoutes } = require('../../../dist/server/field-guide-transitions');
			assert(fieldTransitionRoutes().some(route => route.from === field &&
				route.to === 'dragonsdenterrain' && route.trigger === 'Dragon Rend' && route.uses === '1 damaging hit'));
		});
	}
});
