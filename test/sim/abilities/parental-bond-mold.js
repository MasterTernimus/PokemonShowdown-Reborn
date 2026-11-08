'use strict';
const assert=require('assert').strict;
const common=require('../../common');
let battle;
function start(foeAbility = 'No Ability', doubles = false) {
	const ally = { species: 'Mew', ability: 'No Ability', moves: ['splash'] };
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[{ ...ally, species: 'Kangaskhan-Mega', ability: 'Family Guardian' }, ...(doubles ? [{ ...ally }] : [])], [{ ...ally, ability: foeAbility }, ...(doubles ? [{ ...ally }] : [])]]);
	battle.makeChoices(doubles ? 'team 12' : 'team 1', doubles ? 'team 12' : 'team 1');
	const p = battle.p1.active[0], t = battle.p2.active[0];
	t.hp = t.maxhp = t.baseMaxhp = 10000;
	return [p, t];
}
describe('Native Parental Bond with selected Family Guardian', () => {
	afterEach(()=>{battle?.destroy();battle=null;});
	for (const [ability, id] of [['Levitate', 'earthpower'], ['Water Absorb', 'watergun']])it(`the two-hit package respects ${ability}`, () => {
		const[p,t]=start(ability);const seen=[];const original=battle.actions.getDamage;
		battle.actions.getDamage=function(source,target,move,...args){if(source===p){seen.push([move.hit,move.ignoreAbility]);}return original.call(this,source,target,move,...args);};
		battle.actions.useMove(id, p, { target: t });
		assert.deepEqual(seen, []);
		assert.equal(t.hp, t.maxhp);
		assert(!battle.log.some(x => x.startsWith('|-hitcount|')));
	});
	it('does not bypass Sturdy', () => {
		const [p, t] = start('Sturdy');
		t.hp = t.maxhp = t.baseMaxhp = 1;
		battle.actions.useMove('watergun', p, { target: t });
		assert.equal(t.hp, 1);
	});
	it('retains exactly two hits and the 80% second-hit multiplier',()=>{
		const[p,t]=start();battle.randomizer=d=>d;const m=battle.dex.getActiveMove('watergun');m.type='???';m.multihitType='parentalbond';m.hit=1;
		const first=battle.actions.modifyDamage(998,p,t,m);m.hit=2;const second=battle.actions.modifyDamage(998,p,t,m);
		assert.equal(first,1000);assert.equal(second,800);
		const ordinary = battle.dex.getActiveMove('tackle');
		battle.runEvent('PrepareHit', p, t, ordinary);
		assert.equal(ordinary.multihit, 2);
		assert.equal(ordinary.multihitType, 'parentalbond');
	});
	it('preserves existing multihit and excluded moves',()=>{
		const [p, t] = start();
		for (const id of ['doublekick', 'solarbeam', 'futuresight', 'fling']) {
			const m = battle.dex.getActiveMove(id), prior = m.multihit;
			battle.runEvent('PrepareHit', p, t, m);
			assert.deepEqual(m.multihit, prior, id);
		}
	});
	it('keeps Ghost immunity and ordinary contact power while Family Guardian protects allies', () => {
		const[p,t]=start('No Ability',true);const ally=battle.p1.active[1];t.setType('Ghost');const m=battle.dex.getActiveMove('tackle');battle.singleEvent('ModifyMove',p.getAbility(),p.abilityState,m,p,t);
		assert(!m.ignoreAbility);
		assert(!m.ignoreImmunity || (!m.ignoreImmunity.Normal && !m.ignoreImmunity.Fighting));
		const hp = t.hp;
		battle.actions.useMove('tackle', p, { target: t });
		assert.equal(t.hp, hp);
		assert.equal(battle.runEvent('BasePower', p, t, m, 1000), 1000);
		assert.equal(battle.runEvent('ModifyDamage',t,ally,m,1000),750);assert.equal(battle.runEvent('ModifyDamage',t,p,m,1000),1000);
	});
	it('preserves suppression immunity and Protect/Shadow Shield exceptions',()=>{
		const [p, t] = start('Shadow Shield');
		p.addVolatile('gastroacid', t);
		assert(p.hasAbilityOrPassive('parentalbond'));
		assert(!p.hasAbility('moldbreaker'));
		const ordinary = battle.dex.getActiveMove('watergun');
		battle.runEvent('PrepareHit', p, t, ordinary);
		assert.equal(ordinary.multihit, 2);
		t.addVolatile('protect',t);battle.actions.useMove('watergun',p,{target:t});assert.equal(t.hp,t.maxhp);t.removeVolatile('protect');
		const m=battle.dex.getActiveMove('watergun');m.ignoreAbility=true;battle.setActiveMove(m,p,t);assert.equal(battle.runEvent('ModifyDamage',p,t,m,1000),800);battle.clearActiveMove();
	});
	it('exposes native Parental Bond separately without claiming Mold Breaker', () => {
		const [p] = start(); assert.equal(battle.log.filter(x => x.startsWith('|-ability|') && x.endsWith('|Mold Breaker')).length, 0);
		const { AbilityComponents } = require('../../../dist/data/ability-components'); assert.deepEqual(AbilityComponents.parentalbond, []);
		assert(!Object.values(AbilityComponents).some(parts=>parts.includes('parentalbond')));
		for(const id of ['hydrabond','dualwield'])assert(!(AbilityComponents[id]||[]).includes('moldbreaker'));
		const users = battle.dex.species.all().filter(s => Object.values(s.abilities).includes('Parental Bond')).map(s => s.name);
		assert.deepEqual(users, []);
		assert.deepEqual(p.getPassives(), ['parentalbond']);
		assert.equal(p.ability, 'familyguardian');
		const { calculatorMetadata } = require('../../../dist/sim/custom-calculator'); assert(!(calculatorMetadata().abilityComponents.parentalbond || []).includes('Mold Breaker')); assert(!require('../../../dist/data/ability-display').getAbilityDisplayComponents('parentalbond').includes('moldbreaker'));
	});
	it('does not bypass screens or field weather modifiers',()=>{
		const[p,t]=start();t.side.addSideCondition('reflect',t,battle.dex.moves.get('reflect'));
		const physical=battle.dex.getActiveMove('tackle');physical.ignoreAbility=true;battle.setActiveMove(physical,p,t);
		assert.equal(battle.runEvent('ModifyDamage',p,t,physical,1000),500);battle.clearActiveMove();
		battle.field.setWeather('sunnyday',p,p.getAbility());const water=battle.dex.getActiveMove('watergun');water.ignoreAbility=true;battle.setActiveMove(water,p,t);
		assert.equal(battle.runEvent('WeatherModifyDamage',p,t,water,1000),500);battle.clearActiveMove();
	});
});
