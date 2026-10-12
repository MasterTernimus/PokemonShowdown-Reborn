'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');

let battle;

describe('Flygonite and Desert Spirit', () => {
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	it('gives Flygon two Mega forms with one stone and removes Leaf Stone Mega Evolution', () => {
		const mega = Dex.species.get('Flygon-Mega');
		assert.deepEqual(mega.types, ['Dragon', 'Bug']);
		assert.deepEqual(mega.baseStats, { hp: 80, atk: 100, def: 85, spa: 135, spd: 85, spe: 135 });
		assert.equal(Object.values(mega.baseStats).reduce((sum, stat) => sum + stat, 0), 620);
		assert.equal(mega.abilities[0], 'Desert Spirit');
		assert.equal(mega.requiredItem, 'Flygonite');
		assert.equal(Dex.species.get('Flygon-Mega-Z').requiredItem, 'Flygonite');
		assert.equal(Dex.items.get('Flygonite').megaStone.Flygon, 'Flygon-Mega');
		assert.equal(Dex.items.get('Leaf Stone').megaStone, undefined);
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Leaf Stone', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, null);
		assert.equal(battle.p1.active[0].canMegaEvoX, null);
		battle.destroy();
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		assert.equal(battle.p1.active[0].canMegaEvo, 'Flygon-Mega');
		assert.equal(battle.p1.active[0].canMegaEvoX, 'Flygon-Mega-Z');
		battle.makeChoices('move splash mega', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'flygonmega');
		assert(battle.field.isWeather('sandstorm'));
	});

	it('uses the alternate Mega control for Flygon-Mega-Z', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash megax', 'move splash');
		assert.equal(battle.p1.active[0].species.id, 'flygonmegaz');
		assert.equal(battle.p1.active[0].ability, 'tremor');
		assert.equal(battle.field.weather, '');
		const flygon = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const component of ['levitate', 'resonanceforce', 'sandforce']) {
			assert(flygon.hasAbilityOrPassive(component), `Missing ${component}`);
		}
		assert.equal(flygon.isGrounded(), null);
		assert.equal(flygon.runImmunity('Ground'), false);
		assert.equal(flygon.runStatusImmunity('sandstorm'), false);
		assert.equal(battle.runEvent('ModifySTAB', flygon, foe, battle.dex.getActiveMove('bugbuzz'), 1), 1.5);
		const soundMove = battle.dex.getActiveMove('bugbuzz');
		battle.singleEvent('ModifyMove', flygon.getAbility(), flygon.abilityState, soundMove, flygon, foe);
		assert.equal(soundMove.category, 'Special');
		assert.equal(soundMove.ignoreAbility, false);
		assert.equal(soundMove.overrideOffensiveStat,
			flygon.getStat('atk') >= flygon.getStat('spa') ? 'atk' : 'spa');
		assert.equal(battle.runEvent('BasePower', flygon, foe, soundMove, 100), 150);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('earthquake'), 100), 100);
		battle.field.setWeather('sandstorm');
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('earthquake'), 100), 130);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
	});

	it('boosts allied sound moves without doubling the holder\'s boost', () => {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash'] },
			{ species: 'Mew', moves: ['hypervoice'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		battle.makeChoices('move splash megax, move hypervoice', 'move splash, move splash');
		const flygon = battle.p1.active[0];
		const ally = battle.p1.active[1];
		const foe = battle.p2.active[0];
		assert.equal(flygon.ability, 'tremor');
		assert.equal(battle.runEvent('BasePower', ally, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
		assert.equal(battle.runEvent('BasePower', flygon, foe, battle.dex.getActiveMove('hypervoice'), 100), 150);
		assert.equal(battle.singleEvent('AnyTryHit', flygon.getAbility(), flygon.abilityState,
			ally, flygon, battle.dex.getActiveMove('hypervoice')), null);
	});

	it('grants Levitate, Ground STAB, and Overcoat', () => {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, [[
			{ species: 'Flygon', item: 'Flygonite', moves: ['splash', 'earthquake'] },
		], [
			{ species: 'Mew', moves: ['splash'] },
		]]);
		battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move splash mega', 'move splash');
		const flygon = battle.p1.active[0];
		const foe = battle.p2.active[0];
		for (const component of ['sandstream', 'overcoat']) {
			assert(flygon.hasAbility(component), `Missing ${component}`);
		}
		assert.equal(flygon.isGrounded(), null);
		assert.equal(flygon.runImmunity('Ground'), false);
		const groundMove = battle.dex.getActiveMove('earthquake');
		battle.singleEvent('ModifyMove', flygon.getAbility(), flygon.abilityState, groundMove, flygon, foe);
		assert.equal(groundMove.forceSTAB, true);
		foe.getMoveHitData(groundMove).typeMod = -1;
		assert.equal(battle.runEvent('ModifyDamage', flygon, foe, groundMove, 100), 100);
	});
});

describe('Desert Spirit Overcoat replacement',()=>{
 afterEach(()=>{battle?.destroy();battle=null;});
 function setup(ability='Desert Spirit'){battle=common.createBattle({formatid:'gen9nofieldsinglesgame'},[[{species:'Mew',ability,moves:['splash']}],[{species:'Mew',ability:'No Ability',moves:['spore','tackle']}]]);battle.makeChoices('team 1','team 1');battle.field.terrain='';return[battle.p1.active[0],battle.p2.active[0]];}
 it('keeps exactly the existing Mega Flygon holder and Levitate passive',()=>{assert.deepEqual(Dex.species.all().filter(s=>Object.values(s.abilities).includes('Desert Spirit')).map(s=>s.id),['flygonmega']);assert.deepEqual(Dex.species.get('flygonmega').passives,['levitate']);assert.equal(Dex.species.get('flygonmegaz').abilities[0],'Tremor');});
 for(const ability of ['Desert Spirit','Overcoat'])it(ability+' protects against powder and both damaging weathers',()=>{const[p,q]=setup(ability);assert.equal(p.runStatusImmunity('sandstorm'),false);assert.equal(p.runStatusImmunity('hail'),false);assert.equal(p.runStatusImmunity('powder'),false);battle.actions.useMove('spore',q,{target:p});assert.equal(p.status,'');assert.equal(battle.log.filter(x=>x.includes('|-immune|')).length,1);});
 it('suppression removes selected Overcoat defenses',()=>{const[p,q]=setup();p.addVolatile('gastroacid');assert.equal(p.runStatusImmunity('sandstorm'),true);battle.actions.useMove('spore',q,{target:p});assert.equal(p.status,'slp');});
 it('Mold Breaker bypasses powder-move protection',()=>{const[p,q]=setup();q.setAbility('Mold Breaker');battle.actions.useMove('spore',q,{target:p});assert.equal(p.status,'slp');});
 it('preserves standalone Tinted Lens while removing it from Desert Spirit',()=>{const[p,q]=setup();const m=Dex.getActiveMove('tackle');q.getMoveHitData(m).typeMod=-1;assert.equal(battle.runEvent('ModifyDamage',p,q,m,100),100);assert(!p.hasAbility('tintedlens'));p.setAbility('Tinted Lens');assert.equal(battle.runEvent('ModifyDamage',p,q,m,100),200);});
 it('skips duplicate Overcoat callbacks supplied by a passive',()=>{const[p,q]=setup();p.getPassives=()=>['overcoat'];const m=Dex.getActiveMove('spore');assert.equal(battle.singleEvent('TryHit',p.getAbility(),p.abilityState,p,q,m),true);});
 it('calculator metadata replaces only the Tinted Lens component',()=>{const m=require('../../../dist/sim/custom-calculator').calculatorMetadata();assert(m.abilityComponents.desertspirit.includes('Overcoat'));assert(!m.abilityComponents.desertspirit.includes('Tinted Lens'));assert(Dex.abilities.get('desertspirit').desc.includes('Overcoat')||Dex.abilities.get('desertspirit').desc.includes('powder'));});
});
