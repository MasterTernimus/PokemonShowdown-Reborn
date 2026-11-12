'use strict';

const assert = require('assert').strict;
const common = require('../../common');
const { Dex } = require('../../../dist/sim');
const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');

describe('Johto Mega Eruptions', () => {
	let battle;
	afterEach(() => { battle?.destroy(); });
	function setup(ability, gameType = 'doubles') {
		const set = name => ({ species: 'Mew', ability: name, moves: ['splash', 'ember', 'magicalleaf', 'dazzlinggleam'] });
		battle = common.createBattle({ gameType }, [
			[set(ability), set('No Ability'), set('No Ability')],
			[set('No Ability'), set('No Ability')],
		]);
		for (const p of battle.getAllActive()) {
			p.baseMaxhp = p.maxhp = 1600;
			p.hp = 800;
		}
		return [battle.p1.active[0], battle.p2.active[0], battle.p1.active[1]];
	}
	function attack(source, target, id, patch = {}) {
		battle.actions.useMove(Object.assign(Dex.getActiveMove(id), {
			accuracy: true, willCrit: false, damage: 10, secondaries: null,
		}, patch), source, { target });
	}
	it('assigns distinct Meganium abilities, retains canonical renamed IDs and component displays', () => {
		for (const [species, name, id, components] of [
			['Meganium-Mega', 'Verdant Eruption', 'bloomingsun', ['megasol', 'flowerveil']],
			['Meganium-Mega-Y', 'Solar Eruption', 'solareruption', ['megasol', 'flamebody']],
			['Feraligatr-Mega', 'Tidal Eruption', 'draconicforce', ['dragonize', 'strongjaw', 'moldbreaker']],
		]) {
			assert.equal(Dex.species.get(species).abilities[0], name);
			assert.equal(Dex.abilities.get(name).id, id);
			assert.equal(Dex.abilities.get(id).name, name);
			assert.deepEqual(getAbilityDisplayComponents(id, ['proficient'], Dex.species.get(species).id), components);
		}
		assert.equal(Dex.abilities.get('Blooming Sun'), Dex.abilities.get('Verdant Eruption'));
		assert.equal(Dex.abilities.get('Draconic Force'), Dex.abilities.get('Tidal Eruption'));
	});
	it('Verdant heals itself and adjacent allies once per turn across spread and multiple attacks', () => {
		const [p, q, ally] = setup('Verdant Eruption');
		attack(p, q, 'dazzlinggleam', { multihit: 2 });
		assert.equal(p.hp, 900);
		assert.equal(ally.hp, 900);
		attack(p, q, 'magicalleaf');
		assert.equal(p.hp, 900);
		assert.equal(ally.hp, 900);
		battle.turn++;
		attack(p, q, 'magicalleaf');
		assert.equal(p.hp, 1000);
		assert.equal(ally.hp, 1000);
	});
	for (const [choice, name] of [['mega', 'Verdant Eruption'], ['megay', 'Solar Eruption']]) {
		it(`Meganiumite activates ${name} through the battle choice`, () => {
			battle = common.createBattle({ formatid: 'gen9dragonsden' }, [[
				{ species: 'Meganium', ability: 'Triage', item: 'Meganiumite', moves: ['splash'] },
			], [{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }]]);
			battle.makeChoices('team 1', 'team 1');
			battle.makeChoices(`move splash ${choice}`, 'move splash');
			assert.equal(battle.p1.active[0].getAbility().name, name);
			assert.deepEqual(battle.p1.active[0].getPassives(), ['proficient']);
		});
	}
	it('Mega Sol remains identical for both Meganium abilities', () => {
		const [p, q] = setup('Mega Sol');
		// Remove variation from random damage rolls before comparing the component.
		battle.randomizer = damage => damage;
		const fixed = [];
		for (const ability of ['Mega Sol', 'Verdant Eruption', 'Solar Eruption']) {
			p.setAbility(ability);
			fixed.push(battle.actions.getDamage(p, q, Object.assign(Dex.getActiveMove('flamethrower'), { willCrit: false })));
		}
		assert(fixed[0] > 0);
		assert.deepEqual(fixed, [fixed[0], fixed[0], fixed[0]]);
	});
	it('Verdant also heals in singles and on a KO', () => {
		const [p, q] = setup('Verdant Eruption', 'singles');
		q.hp = 1;
		attack(p, q, 'magicalleaf');
		assert.equal(q.hp, 0);
		assert.equal(p.hp, 900);
	});
	for (const ability of ['Verdant Eruption', 'Solar Eruption']) {
		it(`${ability} ignores allied damage, misses, Protect, Substitute-only hits and wrong move types`, () => {
			const [p, q, ally] = setup(ability);
			const id = ability === 'Verdant Eruption' ? 'magicalleaf' : 'ember';
			attack(p, ally, id);
			attack(p, q, id, { accuracy: 0 });
			q.addVolatile('protect');
			attack(p, q, id);
			q.removeVolatile('protect');
			q.addVolatile('substitute');
			attack(p, q, id);
			q.removeVolatile('substitute');
			attack(p, q, 'tackle');
			assert.equal(p.hp, 800);
			assert.equal(p.boosts.spa, 0);
			assert.equal(p.m.solarEruptionSpent, undefined);
			assert.equal(p.m.verdantEruptionHealTurn, undefined);
		});
		it(`${ability} respects ability suppression`, () => {
			const [p, q] = setup(ability);
			p.addVolatile('gastroacid', q);
			attack(p, q, ability === 'Verdant Eruption' ? 'magicalleaf' : 'ember');
			assert.equal(p.hp, 800);
			assert.equal(p.boosts.spa, 0);
		});
	}
	it('Solar raises Sp. Atk only after every hit finishes, once per entry', () => {
		const [p, q] = setup('Solar Eruption');
		const stages = [], damage = battle.actions.getDamage;
		battle.actions.getDamage = function (source, target, ...args) {
			if (source === p) stages.push(p.boosts.spa);
			return damage.call(this, source, target, ...args);
		};
		attack(p, q, 'ember', { multihit: 3 });
		assert.deepEqual(stages, [0, 0, 0]);
		assert.equal(p.boosts.spa, 1);
		p.setAbility('No Ability');
		p.setAbility('Solar Eruption');
		attack(p, q, 'ember');
		assert.equal(p.boosts.spa, 1);
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		battle.makeChoices('switch 3, move splash', 'move splash, move splash');
		assert.equal(p.boosts.spa, 0);
		attack(p, q, 'ember');
		assert.equal(p.boosts.spa, 1);
	});
	it('Verdant honors Heal Block per recipient', () => {
		const [p, q, ally] = setup('Verdant Eruption');
		p.addVolatile('healblock', q);
		attack(p, q, 'magicalleaf');
		assert.equal(p.hp, 800);
		assert.equal(ally.hp, 900);
	});
	it('retains Solar Flame Body and Verdant Flower Veil', () => {
		const [p, q] = setup('Solar Eruption');
		battle.randomChance = () => true;
		attack(q, p, 'tackle');
		assert.equal(q.status, 'brn');
		p.setAbility('Verdant Eruption');
		p.setType('Grass');
		assert(!p.setStatus('par', q, Dex.moves.get('thunderwave')));
		battle.boost({ def: -1 }, p, q, Dex.moves.get('leer'));
		assert.equal(p.boosts.def, 0);
	});
});
