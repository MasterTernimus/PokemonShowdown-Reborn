'use strict';
const assert = require('assert').strict;
const common = require('../../common');
const { AbilityComponents } = require('../../../dist/data/ability-components');
describe('Approved scouting distribution', () => {
	let battle;
	afterEach(() => battle?.destroy());
	function setup(species = 'Mew') {
		battle = common.createBattle({ formatid: 'gen9nofielddoublesbattle' }, [
			[{ species, ability: 'No Ability', moves: ['tackle'] }, { species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Mew', ability: 'No Ability', item: 'Leftovers', moves: ['splash'] }, { species: 'Mew', ability: 'No Ability', item: 'Sitrus Berry', moves: ['splash'] }],
		]);
		battle.makeChoices('team 12', 'team 12');
		return battle.p1.active[0];
	}
	for (const id of ['silksights', 'slipstream'])it(id + ' keeps a single Mirror Arena accuracy reward and full Keen Eye protection', () => {
		const p = setup();
		battle.field.changeTerrain('mirrorarenaterrain', p);
		for (const foe of p.foes())foe.illusion = foe.side.active[1];
		p.setAbility(id);
		assert.equal(p.boosts.accuracy, 1);
		assert(p.volatiles.laserfocus);
		assert(p.foes().every(foe => !foe.illusion));
		battle.boost({ accuracy: -1 }, p, p.foes()[0], battle.dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 1);
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(move.ignoreEvasion);
		if (id === 'longreach')assert(!move.flags.contact);
		if (id === 'silksights')assert.equal(battle.runEvent('ModifyAccuracy', p.foes()[0], p, move, 50), 65);
		assert(p.hasAbility('keeneye'));
	});
	it('Long Reach only removes contact, without independent Keen Eye rewards', () => {
		const p = setup();
		battle.field.changeTerrain('mirrorarenaterrain', p);
		for (const foe of p.foes()) foe.illusion = foe.side.active[1];
		p.setAbility('longreach');
		assert.equal(p.boosts.accuracy, 0);
		assert(!p.volatiles.laserfocus);
		assert(p.foes().every(foe => foe.illusion));
		battle.boost({ accuracy: -1 }, p, p.foes()[0], battle.dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, -1);
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(!move.flags.contact);
		assert(!move.ignoreEvasion);
		assert(!p.hasAbility('keeneye'));
	});
	it('Astral Ward keeps its reviewed accuracy-only replacement and native Magic Bounce passive', () => {
		const p = setup('Espeon');
		battle.field.changeTerrain('psychicterrain', p);
		p.boosts.spa = 0;
		p.setAbility('Astral Ward');
		assert.equal(p.boosts.spa, 0);
		assert(p.getPassives().includes('magicbounce'));
		assert(!p.hasAbility('anticipation'));
		battle.boost({ accuracy: -1 }, p, p.foes()[0], battle.dex.moves.get('sandattack'));
		assert.equal(p.boosts.accuracy, 0);
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(move.ignoreEvasion);
	});
	it('Doom Warning checks each opponent once, including with its Magic Bounce passive', () => {
		const p = setup('Absol-Mega');
		battle.field.changeTerrain('psychicterrain', p);
		p.boosts.spa = 0;
		p.setAbility('Doom Warning');
		// Two no-threat opponents each grant exactly +2, without duplicate delegates.
		assert.equal(p.boosts.spa, 4);
		p.setAbility('No Ability');
		p.boosts.spa = 0;
		p.foes()[0].moveSlots = [{ id: 'sludgebomb', move: 'Sludge Bomb', pp: 10, maxpp: 10, target: 'normal', disabled: false, used: false }];
		const from = battle.log.length;
		p.setAbility('Doom Warning');
		// Poison threatens Dark/Fairy Absol-Mega; only the other foe grants +2.
		assert.equal(p.boosts.spa, 2);
		assert.equal(battle.log.slice(from).filter(x => x.includes('ability: Anticipation|')).length, 1);
		assert(p.hasAbility('anticipation'));
		assert(p.getPassives().includes('magicbounce'));
	});
	it('Calculated Shot gets one Frisk roll per item holder and retains its Water modifier', () => {
		const p = setup('Inteleon'), rolls = [];
		battle.randomChance = (a, b) => {
			rolls.push([a, b]);
			return false;
		};
		p.setAbility('Calculated Shot');
		assert.deepEqual(rolls, [[3, 10], [3, 10]]);
		const move = battle.dex.getActiveMove('watergun');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(move.noDamageVariance);
		assert.equal(move.critRatio, 2);
		assert(p.hasAbility('frisk'));
	});
	it('Night Hunt retains Intimidate and Illuminate while excluding the removed Frisk and Infiltrator', () => {
		const p = setup('Luxray-Mega'), rolls = [];
		battle.field.changeTerrain('starlightarenaterrain', p);
		for (const foe of p.foes())foe.illusion = foe.side.active[1];
		battle.randomChance = (a, b) => {
			rolls.push([a, b]);
			return true;
		};
		const from = battle.log.length;
		p.setAbility('Night Hunt');
		assert.deepEqual(rolls, []);
		assert.equal(p.boosts.spa, 2);
		assert(battle.p1.active[1].volatiles.spotlight);
		assert(p.foes().every(foe => foe.boosts.atk === -1 && !foe.illusion));
		assert.equal(battle.log.slice(from).filter(x => x.startsWith('|-end|') && x.endsWith('|Illusion')).length, 2);
		assert.equal(battle.log.slice(from).filter(x => x.startsWith('|-item|')).length, 0);
		const move = battle.dex.getActiveMove('bite');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(move.ignoreEvasion);
		assert(!move.infiltrates);
		assert(!p.hasAbility('frisk'));
		assert(!p.hasAbility('infiltrator'));
		battle.field.clearTerrain();
		assert.equal(battle.runEvent('BasePower', p, p.foes()[0], move, 100), 150);
		assert.deepEqual(AbilityComponents.nighthunt, ['strongjaw', 'intimidate', 'illuminate']);
		p.setAbility('No Ability');
		battle.field.changeTerrain('mirrorarenaterrain', p);
		p.setAbility('Night Hunt');
		assert(p.foes().every(foe => foe.boosts.accuracy === -1));
	});
	it('keeps existing users and passes Long Reach through Razor Reach', () => {
		const p = setup();
		assert.deepEqual(battle.dex.species.all().filter(s => Object.values(s.abilities).includes('Long Reach')).map(s => s.name), ['Rowlet', 'Dartrix']);
		for (const [species, ability] of [['Galvantula', 'Silk Sights'], ['Espeon', 'Astral Ward'], ['Absol-Mega', 'Doom Warning'], ['Inteleon', 'Calculated Shot'], ['Yanmega', 'Slipstream'], ['Luxray-Mega', 'Night Hunt']])assert(Object.values(battle.dex.species.get(species).abilities).includes(ability));
		p.setAbility('Razor Reach');
		assert(p.hasAbility('keeneye'));
		const move = battle.dex.getActiveMove('tackle');
		battle.singleEvent('ModifyMove', p.getAbility(), p.abilityState, move, p, p.foes()[0]);
		assert(move.ignoreEvasion);
		assert(!move.flags.contact);
	});
	for (const id of ["silksights", "longreach", "slipstream", "nighthunt"]) it(id + " permits Mold Breaker accuracy drops like its full component", () => {
		const p = setup(), foe = p.foes()[0]; p.setAbility(id); foe.setAbility("Mold Breaker");
		const before = p.boosts.accuracy; battle.actions.useMove("sandattack", foe, { target: p });
		assert.equal(p.boosts.accuracy, before - 1);
	});
});
