'use strict';

const assert = require('assert').strict;
const common = require('../../common');

describe('Approved mixed attacker and guardian abilities', () => {
	let battle;
	afterEach(() => { battle?.destroy(); battle = null; });

	function doubles(species, ability, allySpecies = 'Mew') {
		battle = common.createBattle({formatid: 'gen9nofielddoublesbattle'}, [[
			{species, ability, moves: ['splash', 'reflect', 'lightscreen', 'airslash']},
			{species: allySpecies, ability: 'No Ability', moves: ['splash']},
		], [
			{species: 'Blissey', ability: 'No Ability', moves: ['splash']},
			{species: 'Mew', ability: 'No Ability', moves: ['splash']},
		]]);
		battle.makeChoices('team 1, 2', 'team 1, 2');
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}

	it('Knuckle Tide primes both physical and special Water attacks', () => {
		const [holder, , foe] = doubles('Poliwrath', 'Knuckle Tide');
		assert.deepEqual(holder.species.baseStats, {hp: 100, atk: 100, def: 100, spa: 95, spd: 90, spe: 75});
		assert(holder.hasAbility('ironfist'));
		const punch = battle.dex.getActiveMove('drainpunch');
		assert.equal(battle.runEvent('BasePower', holder, foe, punch, 100), 140);
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, punch, 10);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, punch);
		for (const id of ['surf', 'liquidation']) {
			const water = battle.dex.getActiveMove(id);
			battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, water, holder);
			assert.equal(water.ignorePositiveDefensive, true, id);
		}
		const surf = battle.dex.getActiveMove('surf');
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, surf, 10);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, surf);
		assert.equal(holder.abilityState.waterPrimed, false);
	});

	it('Crosscurrent rewards alternating landed categories with exactly 1.3x power', () => {
		const [holder, , foe] = doubles('Poliwrath', 'Crosscurrent');
		assert(holder.hasAbility('swiftswim'));
		const punch = battle.dex.getActiveMove('drainpunch');
		const surf = battle.dex.getActiveMove('surf');
		assert.equal(battle.runEvent('BasePower', holder, foe, punch, 100), 100);
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, punch, 10);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, punch);
		assert.equal(battle.runEvent('BasePower', holder, foe, surf, 100), 130);
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, surf, 10);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, surf);
		assert.equal(battle.runEvent('BasePower', holder, foe, surf, 100), 100);
		assert.equal(battle.runEvent('BasePower', holder, foe, punch, 100), 130);
	});

	it("Knight's Guard intercepts only one ally-targeted attack and rewards survival", () => {
		const [holder, ally, foe] = doubles('Gallade', "Knight's Guard");
		assert.deepEqual(holder.species.abilities, {0: 'Dual Wield', 1: "Knight's Guard", H: 'Inner Focus'});
		assert.equal(holder.hasAbility('swornduty'), true);
		const tackle = battle.dex.getActiveMove('tackle');
		assert.equal(battle.priorityEvent('RedirectTarget', foe, foe, tackle, ally), holder);
		assert.equal(battle.runEvent('ModifyDamage', foe, holder, tackle, 100), 75);
		battle.singleEvent('DamagingHit', holder.getAbility(), holder.abilityState, holder, foe, tackle, 10);
		assert.equal(holder.boosts.atk, 1);
		assert.equal(battle.priorityEvent('RedirectTarget', foe, foe, tackle, ally), ally);
	});

	it('Void Veil phases its first Dark or Ghost attack through screens and Substitute', () => {
		const [holder, , foe] = doubles('Gardevoir', 'Void Veil');
		const shadow = battle.dex.getActiveMove('shadowball');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, shadow, holder);
		assert.equal(shadow.infiltrates, true);
		battle.singleEvent('AfterMove', holder.getAbility(), holder.abilityState, holder, foe, shadow);
		const next = battle.dex.getActiveMove('shadowball');
		battle.singleEvent('ModifyMove', holder.getAbility(), holder.abilityState, next, holder);
		assert(!next.infiltrates);
	});

	it('Slipstream gives Yanmega Levitate and three-turn Tailwind after a Flying hit', () => {
		const [holder, , foe] = doubles('Yanmega', 'Slipstream');
		assert(holder.hasAbilityOrPassive('levitate'));
		assert.equal(holder.runImmunity('Ground'), false);
		const air = battle.dex.getActiveMove('airslash');
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, air, 10);
		assert.equal(holder.side.sideConditions.tailwind.duration, 3);
		holder.side.sideConditions.tailwind.duration = 1;
		battle.singleEvent('SourceDamagingHit', holder.getAbility(), holder.abilityState, foe, holder, air, 10);
		assert.equal(holder.side.sideConditions.tailwind.duration, 1);
	});

	it('Mimecraft and Pearl Current heal allies from their stated triggers', () => {
		let [holder, ally, foe] = doubles('Mr. Mime', 'Soundproof');
		assert.deepEqual(holder.species.baseStats, {hp: 65, atk: 45, def: 80, spa: 110, spd: 125, spe: 95});
		assert.equal(holder.species.abilities[1], 'Soundproof');
		assert.deepEqual(holder.getPassives(), ['mimecraft']);
		assert(require('../../../dist/data/learnsets').Learnsets.mrmime.learnset.wideguard);
		ally.hp -= 40;
		const before = ally.hp;
		const reflect = battle.dex.getActiveMove('reflect');
		assert.equal(battle.runEvent('ModifyPriority', holder, ally, reflect, 0), 1);
		battle.runEvent('BeforeMove', holder, ally, reflect);
		assert(holder.side.addSideCondition('reflect', holder, reflect));
		battle.runEvent('AfterMove', holder, ally, reflect);
		assert(ally.hp > before);
		battle.destroy(); battle = null;
		[holder, ally, foe] = doubles('Cloyster', 'Shell Armor');
		assert.deepEqual(holder.getPassives(), ['pearlcurrent']);
		assert(holder.hasAbilityOrPassive('waterabsorb'));
		ally.hp -= 40;
		const hp = ally.hp;
		const surf = battle.dex.getActiveMove('surf');
		assert.equal(battle.runEvent('TryHit', holder, foe, surf), null);
		assert(ally.hp > hp);
	});

	it('Abyss Lure no longer redirects and Terra Resolve no longer includes Rocky Payload', () => {
		const [holder, ally, foe] = doubles('Lanturn', 'Abyss Lure');
		assert(!holder.hasAbility('lightningrod'));
		assert(!holder.hasAbility('stormdrain'));
		assert.equal(battle.priorityEvent('RedirectTarget', foe, foe,
			battle.dex.getActiveMove('thunderbolt'), ally), ally);
		battle.destroy(); battle = null;
		const [torterra] = doubles('Torterra-Mega-Y', 'Terra Resolve');
		assert(!torterra.hasAbility('rockypayload'));
		assert(torterra.hasAbility('stamina'));
		assert.equal(battle.dex.species.get('Tangrowth').abilities.H, 'Root Renewal');
		assert.equal(battle.dex.species.get('Luxrayalt').exists, false);
		assert.equal(battle.dex.species.get('Weavilealt').exists, false);
	});

 for (const species of ['Gallade','Gallade-Azzy']) for(const field of ['', 'fairytaleterrain']) it(species+' Knight Guard includes full Sworn Duty on '+(field||'normal field'),()=>{
  const[holder,ally]=doubles(species,"Knight's Guard");battle.field.terrain=field;ally.maxhp=ally.baseMaxhp=1200;ally.hp=100;holder.hp=10;
  battle.singleEvent('Start',holder.getAbility(),holder.abilityState,holder);
  assert.equal(ally.hp,field?500:400);assert.equal(holder.hp,10);assert(holder.hasAbility('swornduty'));
  assert.equal(holder.abilityState.interceptUsed,false);
 });
 it('Knight Guard Sworn Duty respects Heal Block and fainted allies',()=>{const[holder,ally,foe]=doubles('Gallade',"Knight's Guard");ally.hp=100;ally.addVolatile('healblock',foe);battle.singleEvent('Start',holder.getAbility(),holder.abilityState,holder);assert.equal(ally.hp,100);ally.removeVolatile('healblock');ally.hp=0;ally.fainted=true;battle.singleEvent('Start',holder.getAbility(),holder.abilityState,holder);assert.equal(ally.hp,0);});
 it('Knight Guard skips its entry-heal component when the same passive supplies it',()=>{const[holder,ally]=doubles('Gallade',"Knight's Guard");ally.hp=100;holder.getPassives=()=>['swornduty'];battle.singleEvent('Start',holder.getAbility(),holder.abilityState,holder);assert.equal(ally.hp,100);assert.equal(holder.abilityState.interceptUsed,false);});

 it('Knight Guard calculator components and unchanged ordinary attack damage',()=>{const {calculatorMetadata,calculateScenario}=require('../../../dist/sim/custom-calculator');assert.deepEqual(calculatorMetadata().abilityComponents.knightsguard,['Sworn Duty']);const scenario={format:'gen9nofieldsinglesgame',move:'Tackle',samples:8,seed:42,actors:Array.from({length:4},()=>({species:'Mew',ability:'No Ability'}))};const base=calculateScenario(scenario).results[1];scenario.actors[0].ability="Knight's Guard";const guard=calculateScenario(scenario).results[1];assert.equal(guard.min,base.min);assert.equal(guard.max,base.max);});
});
