'use strict';
const assert = require('assert').strict;
const common = require('../../common');
describe('Approved activation-only Illusion reveal', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup() {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Zoroark', ability: 'Illusion', moves: ['splash'] }, { species: 'Zoroark', ability: 'Illusion', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 123', 'team 123');
		return battle.p1.active[0];
	}
	function disguise(foe) {
		foe.illusion = foe.side.pokemon[2];
		foe.addVolatile('illusioncopy');
		foe.volatiles.illusioncopy.originalAbility = 'illusion';
		foe.ability = 'overgrow';
		foe.abilityState = battle.initEffectState({ id: 'overgrow', target: foe });
	}
	const ids = ['keeneye', 'illuminate', 'astralwatcher', 'terragift', 'heavyartillery', 'blazingtempo', 'abysslure', 'astralcore', 'moonlightvigil', 'stormsovereign', 'triplethreat'];
	for (const id of ids) it(id + ' reveals both itemless foes once and clears copied abilities without revealing allies', () => {
		const p = setup(), ally = battle.p1.active[1];
		for (const foe of p.foes())disguise(foe);
		ally.illusion = battle.p1.pokemon[2];
		const from = battle.log.length;
		p.setAbility(id);
		for (const foe of p.foes()) {
			assert(!foe.illusion);
			assert(!foe.volatiles.illusioncopy);
			assert.equal(foe.ability, 'illusion');
		}
		assert(ally.illusion);
		assert.equal(battle.log.slice(from).filter(x => x.startsWith('|-end|') && x.endsWith('|Illusion')).length, 2);
		assert.equal(p.ability, id);
		for (const foe of p.foes())disguise(foe);
		battle.singleEvent('Residual', p.getAbility(), p.abilityState, p);
		assert(p.foes().every(foe => foe.illusion), 'not a continuous aura');
	});
	it('respects suppression, then reveals on a later real ability activation and reentry', () => {
		const p = setup(); for (const foe of p.foes())disguise(foe);
		p.addVolatile('gastroacid');
		p.setAbility('Keen Eye');
		assert(p.foes().every(foe => foe.illusion));
		p.removeVolatile('gastroacid');
		p.setAbility('No Ability');
		p.setAbility('Illuminate');
		assert(p.foes().every(foe => !foe.illusion));
		p.baseAbility = 'illuminate';
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		for (const foe of p.foes())disguise(foe);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(battle.p1.active[0], p);
		assert(p.foes().every(foe => !foe.illusion));
	});
	it('does not duplicate Astral Watcher item reveals or Embargo rolls', () => {
		const p = setup();
		p.setAbility('Astral Watcher');
		for (const foe of p.foes()) {
			disguise(foe);
			foe.item = 'leftovers';
		}
		const rolls = [];
		battle.randomChance = (a, b) => {
			rolls.push([a, b]);
			return true;
		};
		const from = battle.log.length;
		battle.singleEvent('Start', p.getAbility(), p.abilityState, p);
		assert.deepEqual(rolls, [[3, 10], [3, 10]]);
		assert.equal(battle.log.slice(from).filter(x => x.startsWith('|-item|')).length, 2);
		assert(p.foes().every(foe => foe.volatiles.embargo.duration === 5));
	});
	it('retains Keen Eye and Illuminate field boosts and Terra Gift healing exactly once', () => {
		const p = setup(), ally = battle.p1.active[1];
		battle.field.changeTerrain('mirrorarenaterrain', p);
		p.setAbility('Keen Eye');
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
		p.setAbility('No Ability');
		battle.field.changeTerrain('starlightarenaterrain', p);
		p.setAbility('Illuminate');
		assert.equal(p.boosts.spa, 2);
		assert(ally.volatiles.spotlight);
		battle.field.clearTerrain(); ally.hp = 1;
		p.setAbility('Terra Gift');
		assert.equal(ally.hp, 1 + Math.floor(ally.baseMaxhp / 4));
	});
});
