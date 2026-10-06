'use strict';
const assert = require('assert').strict;
const common = require('../../common');
let battle;
function start(ability, foeAbility = 'No Ability') {
	battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
		{species: 'Mew', ability, moves: ['splash', 'tackle']},
	], [{species: 'Mew', ability: foeAbility, moves: ['splash', 'tackle']}]]);
	battle.makeChoices('team 1', 'team 1');
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(holder, foe, move = 'tackle') {
	return battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, battle.dex.getActiveMove(move), 10);
}
function damage(holder, foe, move = 'tackle', typeMod = 0) {
	const m = battle.dex.getActiveMove(move);
	holder.getMoveHitData(m).typeMod = typeMod;
	return battle.runEvent('ModifyDamage', foe, holder, m, 1000);
}
describe('Approved Glacial Mass, Unleashed Ego and Moonlit Hide', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('keeps exact roster slots and component identities', () => {
		const [p] = start('Moonlit Hide');
		assert.deepEqual(battle.dex.species.get('Ursaluna').abilities, {0: 'Raging Beast', 1: 'Bulletproof', H: 'Territorial'});
		assert.deepEqual(battle.dex.species.get('Ursaluna-Bloodmoon').abilities, {0: "Mind's Eye", 1: 'Lunar Dread', H: 'Moonlit Hide'});
		assert(Object.values(battle.dex.species.get('Cetitan').abilities).includes('Glacial Mass'));
		assert.equal(battle.dex.species.get('Gyarados-Mega').abilities[0], 'Unleashed Ego');
		for (const [ability, components] of [['Moonlit Hide', ['shadowshield','magicguard']], ['Glacial Mass',['heavymetal','thickfat']], ['Unleashed Ego',['ultraego','levitate','ragingstorm','battlearmor','moldbreaker']]]) {
			p.setAbility(ability, p, p.getAbility(), true);
			for (const c of components) assert(p.hasAbility(c), ability + ': ' + c);
		}
	});
	it('Glacial Mass doubles weight and halves physical damage exactly once', () => {
		const [p, foe] = start('Glacial Mass');
		assert.equal(p.getWeight(), p.weighthg * 2);
		assert.equal(battle.runEvent('Damage', p, foe, battle.dex.getActiveMove('tackle'), 1000), 500);
		assert.equal(battle.runEvent('Damage', p, foe, battle.dex.getActiveMove('psychic'), 1000), 1000);
	});
	for (const [event, move, expected] of [['ModifyAtk','firepunch',500],['ModifyAtk','icepunch',500],['ModifySpA','flamethrower',500],['ModifySpA','icebeam',500],['ModifyAtk','tackle',1000]]) {
		it(`Glacial Mass ${event} ${move} applies once`, () => {
			const [p, foe] = start('Glacial Mass');
			assert.equal(battle.runEvent(event, foe, p, battle.dex.getActiveMove(move), 1000), expected);
		});
	}
	it('Glacial Mass retains Factory entry and hail immunity', () => {
		const [p] = start('Glacial Mass');
		battle.field.setTerrain('factoryterrain', p, p.getAbility());
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.equal(p.boosts.def, 1); assert.equal(p.boosts.spe, -1);
		assert.equal(p.runStatusImmunity('hail'), false);
	});
	it('Glacial Mass is breakable and suppressible like its components', () => {
		const [p, foe] = start('Glacial Mass');
		assert.equal(p.getAbility().flags.breakable, 1);
		p.addVolatile('gastroacid', foe);
		assert.equal(p.getWeight(), p.weighthg);
		assert.equal(battle.runEvent('Damage', p, foe, battle.dex.getActiveMove('tackle'), 1000), 1000);
	});
	it('Unleashed Ego levitates, but Gravity and Thousand Arrows still ground it', () => {
		const [p, foe] = start('Unleashed Ego');
		assert.equal(p.isGrounded(), null);
		assert.equal(p.runImmunity('Ground'), false);
		battle.actions.runMove('thousandarrows', foe, 1, {externalMove: true});
		assert(p.hp < p.maxhp); assert.equal(p.isGrounded(), true);
		p.removeVolatile('smackdown');
		battle.field.addPseudoWeather('gravity', p, p.getAbility());
		assert.equal(p.isGrounded(), true);
	});
	it('Unleashed Ego heals outgoing damage only once per turn and records KO damage', () => {
		const [p, foe] = start('Unleashed Ego'); p.hp = 100;
		const m = battle.dex.getActiveMove('tackle');
		for(let i=0;i<2;i++) battle.singleEvent('SourceDamagingHit', p.getAbility(), p.abilityState, foe, p, m, 50);
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp / 16));
		assert.equal(p.abilityState.ragingStormDamage, 50);
		battle.turn++;
		battle.singleEvent('SourceDamagingHit', p.getAbility(), p.abilityState, foe, p, m, 60);
		assert.equal(p.hp, 100 + 2 * Math.floor(p.baseMaxhp / 16));
	});
	it('Unleashed Ego resets incoming hit boosts after an attack, not a status move', () => {
		const [p, foe] = start('Unleashed Ego'); p.hp = 100;
		hit(p, foe); hit(p, foe);
		assert.equal(p.boosts.atk, 1); assert.equal(p.boosts.spa, 1);
		assert.equal(p.hp, 100 + Math.floor(p.baseMaxhp/16) + Math.floor(p.baseMaxhp/20));
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('splash'));
		hit(p, foe); assert.equal(p.boosts.atk, 1);
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'));
		hit(p, foe); assert.equal(p.boosts.atk, 2);
	});
	it('Unleashed Ego preserves field defense and pinch-healing limits', () => {
		const [p, foe] = start('Unleashed Ego'); battle.field.setTerrain('ashenbeachterrain', p, p.getAbility()); p.hp = 50;
		hit(p, foe); assert.equal(p.boosts.def, 1); assert.equal(p.hp, 50 + Math.floor(p.baseMaxhp/4));
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'));
		hit(p, foe); assert.equal(p.boosts.def, 1);
		battle.singleEvent('AfterMove', p.getAbility(), p.abilityState, p, foe, battle.dex.getActiveMove('tackle'));
		hit(p, foe, 'psychic'); assert.equal(p.boosts.spd, 1);
		assert.equal(p.hp, 50 + Math.floor(p.baseMaxhp/4) + 2*Math.floor(p.baseMaxhp/16));
	});
	it('Unleashed Ego applies armor and priority reductions exactly once', () => {
		const [p, foe] = start('Unleashed Ego');
		assert.equal(damage(p, foe), 800); assert.equal(damage(p, foe, 'quickattack'), 400);
		assert.equal(battle.runEvent('CriticalHit', p, foe, battle.dex.getActiveMove('tackle')), false);
		battle.boost({atk:-1}, p, foe); assert.equal(p.boosts.def, 2);
	});
	it('Unleashed Ego combines conditional Royal Decree power and defense once', () => {
		const [p, foe] = start('Unleashed Ego', 'Royal Decree');
		assert.equal(battle.runEvent('BasePower', p, foe, battle.dex.getActiveMove('tackle'), 1000), 1300);
		assert.equal(damage(p, foe), 560); assert.equal(damage(p, foe, 'quickattack'), 280);
	});
	for (const field of ['bewitchedwoodsterrain','hauntedterrain','holyterrain']) {
		it(`Unleashed Ego disables only Ultra Ego on ${field}`, () => {
			const [p, foe] = start('Unleashed Ego'); battle.field.setTerrain(field, p, p.getAbility()); p.hp = 100;
			hit(p, foe); assert.equal(p.boosts.atk, 0); assert.equal(p.hp, 100);
			assert.equal(damage(p, foe), 800); assert.equal(p.isGrounded(), null);
		});
	}
	it('Unleashed Ego retains Raging Storm bypasses, crit ratio, hail immunity and suppression protection', () => {
		const [p, foe] = start('Unleashed Ego'); const m=battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, m, p, foe);
		assert(m.ignoreAbility && m.infiltrates && m.ignoreDefensive);
		assert.equal(battle.runEvent('ModifyCritRatio', p, foe, m, 1), 2);
		assert.equal(p.runStatusImmunity('hail'), false);
		p.addVolatile('gastroacid', foe); assert(p.hasAbility('ragingstorm'));
	});
	it('Unleashed Ego grants one Attack boost when a KO has no splash target', () => {
		const [p, foe] = start('Unleashed Ego');
		battle.singleEvent('SourceAfterFaint', p.getAbility(), p.abilityState, foe, p, battle.dex.getActiveMove('tackle'), 1);
		assert.equal(p.boosts.atk, 1);
	});
	it('Moonlit Hide applies 20%/40% reduction at any HP exactly once', () => {
		const [p, foe] = start('Moonlit Hide');
		for(const hp of [p.maxhp, 30]) {p.hp=hp; assert.equal(damage(p,foe),800); assert.equal(damage(p,foe,'tackle',1),600);}
		assert.equal(battle.runEvent('Damage',p,foe,battle.dex.conditions.get('brn'),50),false);
		assert.equal(battle.runEvent('Damage',p,foe,battle.dex.getActiveMove('tackle'),50),50);
	});
	it('Moonlit Hide retains Magic Guard Fairy Tale entry and suppression behavior', () => {
		const [p,foe] = start('Moonlit Hide'); battle.field.setTerrain('fairytaleterrain', p, p.getAbility());
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p); assert.equal(p.boosts.spd,1);
		p.addVolatile('gastroacid',foe); assert.equal(damage(p,foe),1000);
		assert.equal(battle.runEvent('Damage',p,foe,battle.dex.conditions.get('brn'),50),50);
	});
	it('Glacial Mass retains Thick Fat Cold Eclipse defense and speed benefits', () => {
		const [p] = start('Glacial Mass'); battle.field.setTerrain('coldeclipseterrain', p, p.getAbility());
		assert.equal(battle.runEvent('ModifyDef',p,null,null,100),150);
		assert.equal(battle.runEvent('ModifySpD',p,null,null,100),150);
		assert.equal(battle.runEvent('ModifySpe',p,null,null,100),100);
	});
	it('Unleashed Ego combines both Fairy Tale entry handlers once', () => {
		const [p] = start('Unleashed Ego'); battle.field.setTerrain('fairytaleterrain',p,p.getAbility());
		p.abilityState.ultraEgoHitTriggered=true;
		battle.singleEvent('Start',p.getAbility(),p.abilityState,p);
		assert.equal(p.boosts.def,1); assert.equal(p.abilityState.ultraEgoHitTriggered,false);
	});
	it('Unleashed Ego excludes Battle Bond from conditional power', () => {
		const [p,foe] = start('Unleashed Ego','Battle Bond');
		const original = battle.getAllActive;
		battle.getAllActive = () => [...original.call(battle), {hasAbility: value => Array.isArray(value) && value.includes('royaldecree')}];
		assert.equal(battle.runEvent('BasePower',p,foe,battle.dex.getActiveMove('tackle'),1000),1000);
	});
	it('Unleashed Ego splashes 60% once and respects Magic Guard fallback', () => {
		battle=common.createBattle({formatid:'gen9nofielddoublesbattle'}, [[
			{species:'Mew',ability:'Unleashed Ego',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']},
		],[{species:'Mew',ability:'No Ability',moves:['splash']},{species:'Mew',ability:'No Ability',moves:['splash']}]]);
		battle.makeChoices('team 12','team 12');
		const p=battle.p1.active[0], foe=battle.p2.active[0], other=battle.p2.active[1];
		p.abilityState.ragingStormDamage=100;
		const hp=other.hp;
		battle.singleEvent('SourceAfterFaint',p.getAbility(),p.abilityState,foe,p,battle.dex.getActiveMove('tackle'),1);
		assert.equal(other.hp,hp-60); assert.equal(p.boosts.atk,0);
		other.setAbility('Moonlit Hide');
		battle.singleEvent('SourceAfterFaint',p.getAbility(),p.abilityState,foe,p,battle.dex.getActiveMove('tackle'),1);
		assert.equal(other.hp,hp-60); assert.equal(p.boosts.atk,1);
	});
	it('Neutralization disables Ultra Ego royal modifiers without duplicating armor', () => {
		const [p,foe]=start('Unleashed Ego','Royal Decree');
		const original=battle.getAllActive;
		battle.getAllActive=()=>[...original.call(battle),{hasAbility:value=>value==='neutralization'}];
		assert.equal(battle.runEvent('BasePower',p,foe,battle.dex.getActiveMove('tackle'),1000),1000);
		assert.equal(damage(p,foe),800);
	});
	it('Glacial Mass heals exactly once in Cold Eclipse hail', () => {
		const [p]=start('Glacial Mass'); battle.field.setTerrain('coldeclipseterrain',p,p.getAbility());
		battle.field.setWeather('hail',p,p.getAbility()); p.hp=100;
		battle.singleEvent('Residual',battle.dex.conditions.get('coldeclipseterrain'),battle.field.terrainState,p);
		assert.equal(p.hp,100+Math.floor(p.baseMaxhp/10));
	});
	it('calculator metadata exposes the three exact packages and Ursaluna slots', () => {
		const {calculatorMetadata}=require('../../../dist/sim/custom-calculator');
		const m=calculatorMetadata();
		assert.deepEqual(m.abilityComponents.glacialmass,['Heavy Metal','Thick Fat']);
		assert.deepEqual(m.abilityComponents.unleashedego,['Ultra Ego','Levitate','Raging Storm']);
		assert.deepEqual(m.abilityComponents.moonlithide,['Shadow Shield','Magic Guard']);
		assert.equal(m.species.find(p=>p.name==='Ursaluna').abilities[1],'Bulletproof');
		assert.equal(m.species.find(p=>p.name==='Ursaluna-Bloodmoon').abilities.H,'Moonlit Hide');
	});
});
