'use strict';
const assert=require('assert').strict,common=require('../../common'),{Dex}=require('../../../dist/sim/dex');let battle;
function start(ability = 'Royal Presence', mode = 'doubles') {
	const p = { species: ability === 'Royal Presence' ? 'Vespiquen' : 'Lanturn', ability, moves: ['splash', 'attackorder', 'defendorder', 'healorder'] }, t = { species: 'Mew', ability: 'No Ability', moves: ['splash', 'tackle', 'quickattack'] };
 const team=[p,{...t},{...t}],other=[t,{...t},{...t}];battle=common.createBattle({formatid:mode==='ffa'?'gen9freeforall4pmistyfieldadrienn':mode==='singles'?'gen9nofieldsinglesgame':'gen9nofielddoublesbattle'},mode==='ffa'?[team,other,other,other]:[team,other]);battle.makeChoices(...battle.sides.map(()=> 'team 123'));battle.field.terrain='';battle.randomizer=d=>d;battle.randomChance=(a,b)=>a>=b;
 for(const side of battle.sides)for(const p of side.active)p.hp=p.maxhp=p.baseMaxhp=1600;
 return[battle.p1.active[0],battle.p2.active[0]];
}
function hit(p,t,id,extra={}){battle.clearActiveMove();const m=battle.dex.getActiveMove(id);Object.assign(m,{accuracy:true,willCrit:false},id==='attackorder'?{basePower:20}:{},extra);battle.actions.useMove(m,p,{target:t});return m;}
function modified(p,t){const m=battle.dex.getActiveMove('tackle');return battle.runEvent('ModifyDamage',p,t,m,1000);}
describe('Approved Guiding Light and Royal Escort',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
	it('uses the approved 540-BST Lanturn and revised Vespiquen slots', () => {
		assert.deepEqual(Dex.species.get('lanturn').abilities, { 0: 'Abyss Lure', 1: 'Drizzle', H: 'Guiding Light' });
		assert.deepEqual(Object.values(Dex.species.get('lanturn').baseStats), [125, 58, 88, 106, 96, 67]);
		assert.deepEqual(Dex.species.get('vespiquen').abilities, { 0: 'Royal Presence', 1: 'Queenly Majesty', H: 'Hive Sanctuary' });
		assert.deepEqual(Object.values(Dex.species.get('vespiquen').baseStats), [100, 100, 122, 40, 122, 30]);
	});
	it('Guiding Light retains all Dazzling and Healer hooks', () => {
		const [p, t] = start('Guiding Light');
		for (const id of ['dazzling', 'healer']) {
			assert(p.hasAbility(id));
			for (const key of Object.keys(battle.dex.abilities.get(id)).filter(x => x.startsWith('on')))assert.equal(p.getAbility()[key], battle.dex.abilities.get(id)[key]);
		}
		const ally = p.allies()[0], hp = ally.hp;
		hit(t, ally, 'quickattack');
		assert.equal(ally.hp, hp);
	});
 it('successful allied Spotlight reduces every attack hit 20% until turn end',()=>{const[p,t]=start('Guiding Light'),ally=p.allies()[0];hit(p,ally,'spotlight');assert(ally.volatiles.guidinglightguard);assert.equal(modified(t,ally),800);assert.equal(modified(t,ally),800);assert.equal(modified(t,p),1000);battle.fieldEvent('Residual');assert.equal(modified(t,ally),1000);});
 it('multiple Guiding Light sources do not stack',()=>{const[p,t]=start('Guiding Light'),ally=p.allies()[0];hit(p,ally,'spotlight');ally.removeVolatile('spotlight');const other=battle.p2.active[1];other.setAbility('Guiding Light');assert(!ally.addVolatile('guidinglightguard',other));assert.equal(modified(t,ally),800);});
 for(const mode of ['protect','opponent','suppressed','reflected','external'])it('Spotlight does not reward '+mode,()=>{const[p,t]=start('Guiding Light'),ally=p.allies()[0];if(mode==='protect')ally.addVolatile('protect',ally);if(mode==='suppressed')p.addVolatile('gastroacid',t);const target=mode==='opponent'?t:ally;hit(p,target,'spotlight',mode==='reflected'?{hasBounced:true}:mode==='external'?{isExternal:true}:{});assert(!target.volatiles.guidinglightguard);});
 it('single battles and FFA have no eligible allied Spotlight recipient',()=>{const[p,t]=start('Guiding Light','ffa');hit(p,t,'spotlight');assert(!t.volatiles.guidinglightguard);});
 it('Spotlight does not redirect spread moves or protect untargeted allies',()=>{const[p,t]=start('Guiding Light'),ally=p.allies()[0];hit(p,ally,'spotlight');const seen=[];const old=battle.actions.getDamage;battle.actions.getDamage=function(s,target,m,...args){if(m.id==='surf')seen.push(target);return old.call(this,s,target,m,...args);};hit(t,p,'surf');assert(seen.includes(p)&&seen.includes(ally));assert.equal(seen.filter(x=>x===p).length,1);assert.equal(seen.filter(x=>x===ally).length,1);});
	// The retired Order-reward package is replaced by Royal Presence and Hive Sanctuary.
	// Detailed entry/suppression/passive tests live in swalot-vespiquen-approved.js.
	it('legacy Royal Escort resolves to Royal Presence without retired Order callbacks', () => {
		assert.equal(Dex.abilities.get('royalescort').id, 'royalpresence');
		const ability = Dex.abilities.get('royalpresence');
		for (const key of ['onSourceDamagingHit', 'onAfterBoost', 'onHeal'])assert.equal(ability[key], undefined, key);
	});
	for (const mode of ['singles', 'doubles', 'ffa'])it('Royal Presence retains Pressure and Unnerve in ' + mode, () => {
		const [p, t] = start('Royal Presence', mode);
		assert(p.hasAbility('pressure')); assert(p.hasAbility('unnerve')); assert(!p.hasAbility('sweetveil'));
		assert.equal(t.boosts.def, -1); assert.equal(t.boosts.spd, -1);
		t.setItem('Sitrus Berry');
		t.hp = 100;
		assert(!t.eatItem());
		assert.equal(t.item, 'sitrusberry');
		assert.equal(battle.singleEvent('DeductPP', p.getAbility(), p.abilityState, p, t, Dex.getActiveMove('tackle')), 1);
	});
	it('new identities are available to the calculator without extra components', () => {
		const { calculatorMetadata } = require('../../../dist/sim/custom-calculator'), meta = calculatorMetadata();
		for (const [id, parts] of Object.entries({ nightwatch: ['Insomnia'], fruitfulbough: ['Harvest'], soulanchor: ['Steelworker'], guidinglight: ['Dazzling', 'Healer'], royalpresence: ['Pressure', 'Unnerve'] })) {
			assert.deepEqual([...meta.abilityComponents[id]].sort(), parts.sort());
			assert(Dex.abilities.get(id).shortDesc.length < 150);
		}
	});
});
