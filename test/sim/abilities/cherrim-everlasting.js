'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');

describe('Cherrim passive Flower Gift and personal sunlight', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(ability = 'Everlasting Bloom', item = '') {
		battle = common.createBattle({ gameType: 'doubles' }, [[
			{ species: 'Cherrim', ability, item, moves: ['splash', 'solarbeam', 'synthesis'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		]]);
		return [battle.p1.active[0], battle.p1.active[1], battle.p2.active[0]];
	}
	function boost(p, factor) {
		for (const stat of ['atk', 'spd']) assert.equal(p.getStat(stat), battle.modify(p.storedStats[stat], factor), stat);
	}
	it('assigns both forms and accepts all three choices, including pasted Sunshine sets', () => {
		for (const species of ['Cherrim', 'Cherrim-Sunshine']) {
			const data = Dex.species.get(species);
			assert.deepEqual(data.abilities, { 0: 'Chlorophyll', 1: 'Everlasting Bloom', H: 'Flower Veil' });
			assert(!data.requiredAbility);
			for (const ability of Object.values(data.abilities)) {
				assert.equal(new TeamValidator('gen9dragonsden').validateTeam([{ species, ability, moves: ['solarbeam'] }]), null);
			}
		}
	});
	for (const ability of ['Chlorophyll', 'Flower Veil', 'Everlasting Bloom']) {
		it(`preserves passive boosts and weather forms with ${ability}`, () => {
			const [p, ally] = setup(ability);
			assert.deepEqual(p.getPassives(), ['flowergift']);
			assert.equal(p.species.id, ability === 'Everlasting Bloom' ? 'cherrimsunshine' : 'cherrim');
			battle.field.setWeather('sunnyday', p);
			assert.equal(p.species.id, 'cherrimsunshine');
			assert.equal(p.getAbility().name, ability);
			boost(p, 1.5); boost(ally, 1.5);
			battle.field.setWeather('raindance', p);
			assert.equal(p.species.id, ability === 'Everlasting Bloom' ? 'cherrimsunshine' : 'cherrim');
			boost(p, ability === 'Everlasting Bloom' ? 1.5 : 1); boost(ally, 1);
			assert.equal(battle.field.weather, 'raindance');
		});
	}
	it('keeps personal sun between actions without affecting ally weather or boosts', () => {
		const [p, ally, foe] = setup();
		battle.field.setWeather('raindance', foe);
		battle.activePokemon = null;
		assert.equal(p.effectiveWeather(), 'sunnyday');
		assert.equal(ally.effectiveWeather(), 'raindance');
		assert.equal(foe.effectiveWeather(), 'raindance');
		boost(p, 1.5); boost(ally, 1);
		p.hp = Math.floor(p.maxhp / 4);
		const hp = p.hp;
		battle.actions.useMove('synthesis', p);
		assert.equal(p.hp - hp, Math.round(p.maxhp * 2 / 3));
		battle.actions.useMove('solarbeam', p, { target: foe });
		assert(!p.volatiles.twoturnmove);
		assert(foe.hp < foe.maxhp);
	});
	it('ends personal sun under suppression but retains the passive under real sun', () => {
		const [p, ally, foe] = setup();
		p.addVolatile('gastroacid', foe);
		battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrim');
		boost(p, 1);
		battle.field.setWeather('sunnyday', foe);
		assert.equal(p.species.id, 'cherrimsunshine');
		boost(p, 1.5); boost(ally, 1.5);
		battle.field.clearWeather();
		p.removeVolatile('gastroacid');
		battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrimsunshine');
		boost(p, 1.5); boost(ally, 1);
	});
	it('updates when gaining/losing the ability and when switching back in', () => {
		const [p] = setup();
		p.setAbility('Chlorophyll');
		p.setAbility('Everlasting Bloom');
		battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrimsunshine');
		p.setAbility('Flower Veil');
		battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrim');
		p.setAbility('Everlasting Bloom');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.notEqual(p.effectiveWeather(), 'sunnyday');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(p.species.id, 'cherrimsunshine');
		assert.equal(p.ability, 'everlastingbloom');
	});
	it('respects Utility Umbrella and restores personal sun after losing it', () => {
		const [p] = setup('Everlasting Bloom', 'Utility Umbrella');
		assert.equal(p.species.id, 'cherrim'); boost(p, 1);
		p.takeItem(); battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrimsunshine'); boost(p, 1.5);
	});
	it('does not double the stat boost if Flower Gift is copied into the ability slot', () => {
		const [p, ally] = setup('Flower Gift');
		battle.field.setWeather('sunnyday', p);
		boost(p, 1.5); boost(ally, 1.5);
	});
	it('suppresses selected personal sun under Neutralizing Gas, but preserves passive sun boosts', () => {
		const [p, ally, foe] = setup();
		foe.setAbility('Neutralizing Gas');
		battle.eachEvent('Update');
		assert.equal(p.effectiveWeather(), '');
		assert.equal(p.species.id, 'cherrim');
		battle.field.setWeather('sunnyday', foe);
		boost(p, 1.5); boost(ally, 1.5);
	});
	it('keeps personal sun through Cloud Nine without giving allies actual sun', () => {
		const [p, ally, foe] = setup();
		battle.field.setWeather('sunnyday', foe);
		foe.setAbility('Cloud Nine');
		battle.eachEvent('Update');
		assert.equal(p.effectiveWeather(), 'sunnyday');
		assert.equal(ally.effectiveWeather(), '');
		boost(p, 1.5); boost(ally, 1);
	});
	it('checks an ally’s Utility Umbrella separately from the holder', () => {
		const [p, ally] = setup();
		ally.setItem('Utility Umbrella');
		battle.field.setWeather('sunnyday', p);
		boost(p, 1.5); boost(ally, 1);
	});
	it('retains Garden stage 1 boosts, stage 4 Chlorophyll, and Bewitched form changes', () => {
		const [p, ally] = setup('Chlorophyll');
		battle.field.setTerrain('flowergarden1', p);
		assert.equal(p.species.id, 'cherrimsunshine');
		boost(p, 1.5); boost(ally, 1.5);
		battle.field.changeTerrain('flowergarden4', p, null, true);
		assert.equal(p.getStat('spe'), battle.modify(p.storedStats.spe, 2));
		battle.field.setWeather('sunnyday', p);
		assert.equal(p.getStat('spe'), battle.modify(p.storedStats.spe, 2));
		battle.field.clearWeather();
		battle.field.setTerrain('bewitchedwoodsterrain', p);
		assert.equal(p.species.id, 'cherrimsunshine');
		battle.eachEvent('Update');
		assert.equal(p.species.id, 'cherrimsunshine');
	});
	it('retains selectable Flower Veil protections', () => {
		const [p, , foe] = setup('Flower Veil');
		battle.boost({ atk: -1 }, p, foe);
		assert.equal(p.boosts.atk, 0);
		assert(!p.trySetStatus('par', foe, Dex.moves.get('thunderwave')));
	});
});
