/* eslint-disable @stylistic/max-statements-per-line */
'use strict';
const assert = require('assert').strict, common = require('../../common');
const { Dex, TeamValidator } = require('../../../dist/sim');
const approved = require('./shortlist-approved.json');
let battle;
function setup(species, ability = 'No Ability', doubles = false) {
	const set = (species = 'Mew', ability = 'No Ability') => ({ species, ability, moves: ['splash', 'tackle', 'gigadrain', 'thunderbolt'] });
	battle = common.createBattle({ formatid: doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame' }, [[set(species, ability), set(), set()], [set(), set(), set()]]);
	battle.makeChoices('team 123', 'team 123'); battle.field.terrain = ''; battle.field.weather = '';
	for (const side of battle.sides) for (const p of side.pokemon) p.hp = p.maxhp = p.baseMaxhp = 4000;
	return [battle.p1.active[0], battle.p2.active[0]];
}
function hit(p, q, id = 'tackle', extra = {}) {
	const move = Object.assign(Dex.getActiveMove(id), { accuracy: true, willCrit: false, secondaries: null }, extra);
	battle.actions.useMove(move, p, { target: q }); return move;
}
describe('Approved ordinary-species shortlist', () => {
	afterEach(() => { battle?.destroy(); battle = null; });
	it('Burning Rage names its actual components without changing its callbacks or passive attribution', () => {
		const { getAbilityDisplayComponents } = require('../../../dist/data/ability-display');
		const ability = Dex.abilities.get('burningrage');
		for (const name of ['Brute Force', 'Reckless', 'Rock Head', 'Iron Fist', 'Mold Breaker', 'Proficient']) assert(ability.desc.includes(name), name);
		assert.deepEqual(getAbilityDisplayComponents('burningrage', ['blaze'], 'infernape'), ['bruteforce', 'ironfist', 'moldbreaker']);
		assert.deepEqual(getAbilityDisplayComponents('burningrage', ['ironfist']), ['bruteforce', 'moldbreaker']);
	});
	it('Burning Rage registers actual top-level components without granting new primitive field identities', () => {
		const [p] = setup('Infernape', 'Burning Rage');
		for (const id of ['proficient', 'bruteforce', 'ironfist', 'moldbreaker']) assert(p.hasAbility(id), id);
		for (const id of ['reckless', 'rockhead']) assert(!p.hasAbilityOrPassive(id), id);
	});
	it('Burning Rage metadata expansion preserves damage, fields, recoil and ability-bypass outcomes', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		const { AbilityComponents } = require('../../../dist/data/ability-components');
		const current = AbilityComponents.burningrage;
		try {
			for (const field of ['', 'chessboardterrain', 'rockyterrain', 'caveterrain']) {
				for (const [move, ability, item] of [['Fire Punch', 'Flash Fire', ''], ['Fire Punch', 'Flash Fire', 'Ability Shield'], ['Flare Blitz', 'No Ability', ''], ['Earthquake', 'Levitate', '']]) {
					const input = { format: 'gen9nofieldsinglesgame', field, move, samples: 8, seed: 42,
						actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
					input.actors[0] = { species: 'Infernape', ability: 'Burning Rage' };
					input.actors[1] = { species: 'Mew', ability, item };
					AbilityComponents.burningrage = ['proficient']; const before = calculateScenario(input);
					AbilityComponents.burningrage = current; const after = calculateScenario(input);
					assert.deepEqual(after.results, before.results, field + '/' + move + '/' + item);
					const events = log => log.filter(line => !line.startsWith('|t:|'));
					assert.deepEqual(events(after.exampleLog), events(before.exampleLog), field + '/' + move + '/' + item);
				}
			}
		} finally { AbilityComponents.burningrage = current; }
	});
	for (const [species, passives] of Object.entries(approved.passives)) it(species + ' keeps its new passive through suppression, ability replacement and Transform', () => {
		const [p, q] = setup(species); assert.deepEqual(p.getPassives(), passives);
		p.setAbility('Run Away'); p.addVolatile('gastroacid'); q.setAbility('Neutralizing Gas'); assert.deepEqual(p.getPassives(), passives);
		// Transform cannot target a disguised Pokémon; reveal first.
		p.illusion = null;
		assert(q.transformInto(p)); assert.deepEqual(q.getPassives(), passives);
	});
	for (const field of ['', 'corrosivemistterrain']) for (const ability of ['No Ability', 'Aftermath']) it('Drifblim applies one full Aftermath with ' + ability + ' on ' + (field || 'no field'), () => {
		const [p, q] = setup('Drifblim', ability); p.setType('Normal'); p.hp = 1; battle.field.terrain = field;
		hit(q, p, 'tackle', { damage: 100 }); assert.equal(q.hp, field ? 2000 : 3000);
	});
	it('Aftermath remains contact-only and active under Gastro Acid', () => {
		const [p, q] = setup('Drifblim', 'No Ability'); p.hp = 1; p.addVolatile('gastroacid');
		hit(q, p, 'watergun', { damage: 100 }); assert.equal(q.hp, 4000);
	});
	for (const ability of ['No Ability', 'Analytic']) it('Beheeyem has one queue-dependent Analytic boost with ' + ability, () => {
		const [p, q] = setup('Beheeyem', ability); const move = Dex.getActiveMove('psychic');
		battle.queue.willMove = mon => mon === q ? {} : null;
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 100);
		battle.queue.willMove = () => null;
		assert.equal(battle.runEvent('BasePower', p, q, move, 100), 130);
		p.addVolatile('gastroacid'); assert.equal(battle.runEvent('BasePower', p, q, move, 100), 130);
	});
	for (const ability of ['No Ability', 'Early Bird']) it('Farigiraf decrements sleep twice, never three times, with ' + ability, () => {
		const [p, q] = setup('Farigiraf', ability); p.setStatus('slp', q); p.statusState.time = 4; p.hp = 1000;
		p.addVolatile('gastroacid');
		battle.singleEvent('BeforeMove', Dex.conditions.get('slp'), p.statusState, p, q, Dex.getActiveMove('splash'));
		assert.equal(p.statusState.time, 2);
		battle.singleEvent('BeforeMove', Dex.conditions.get('slp'), p.statusState, p, q, Dex.getActiveMove('splash'));
		assert.equal(p.status, ''); assert.equal(p.hp, 2000);
	});
	for (const species of ['Polteageist', 'Polteageist-Antique']) for (const field of ['', 'murkwatersurfaceterrain', 'wastelandterrain']) it(species + ' applies one Liquid Ooze on ' + (field || 'no field'), () => {
		const [p, q] = setup(species, 'Liquid Ooze'); q.hp = 1000; battle.field.terrain = field;
		battle.heal(100, q, p, 'drain'); assert.equal(q.hp, field ? 800 : 900);
	});
	for (const ability of ['No Ability', 'Plus', 'Symbiosis']) it('Dedenne applies local Plus once with selected ' + ability, () => {
		const [p, q] = setup('Dedenne', ability);
		for (const field of ['', 'electricterrain']) {
			battle.field.terrain = field;
			for (const id of ['thunderbolt', 'flashcannon', 'psychic']) {
				const eligible = id !== 'psychic', m = Dex.getActiveMove(id);
				assert.equal(battle.runEvent('ModifySpA', p, q, m, 100), field ? eligible ? 195 : 150 : eligible ? 130 : 100);
				assert.equal(battle.runEvent('ModifyAtk', p, q, m, 100), eligible ? 130 : 100);
			}
		}
	});
	it('selected Symbiosis transfers an item while Plus stays passive', () => {
		const [p] = setup('Dedenne', 'Symbiosis', true); const ally = battle.p1.active[1];
		p.setItem('Leftovers'); ally.setItem('Sitrus Berry'); ally.hp = 1000; ally.eatItem();
		assert.equal(p.item, ''); assert.equal(ally.item, 'leftovers'); assert.deepEqual(p.getPassives(), ['plus']);
	});
	it('Hospitality Swoobat heals its adjacent ally on genuine entry and retains Soundproof', () => {
		const [p] = setup('Swoobat', 'Hospitality', true); const ally = battle.p1.active[1];
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); ally.hp = 1000;
		battle.makeChoices('switch 3, move 1', 'move 1, move 1'); assert.equal(ally.hp, 2000);
		assert.deepEqual(p.getPassives(), ['soundproof']);
	});
	it('ordinary Avalugg Scrappy hits Ghosts and Overcoat stays passive', () => {
		const [p, q] = setup('Avalugg', 'Scrappy'); q.setType('Ghost'); hit(p, q); assert(q.hp < 4000);
		assert.deepEqual(p.getPassives(), ['overcoat']); assert.equal(Dex.species.get('avalugghisui').abilities[0], 'Strong Jaw');
	});
	it('Cursola retains local Cursed Body haunted disable and faint curses', () => {
		const [p, q] = setup('Cursola', 'Cursed Body'); battle.field.terrain = 'hauntedterrain'; p.setType('Normal');
		q.moveUsed(Dex.moves.get('tackle'), 1); hit(q, p); assert(q.volatiles.disable);
		battle.singleEvent('Faint', p.getAbility(), p.abilityState, p); assert(q.volatiles.curse);
		assert.deepEqual(p.getPassives(), ['overcoat']);
	});
	it('all five Veluza choices validate as ordinary sets and Unburden works after consuming an item', () => {
		const slots = Dex.species.get('veluza').abilities;
		assert.deepEqual(slots, { 0: 'Mold Breaker', 1: 'Swift Swim', H: 'Sharpness', S: 'Aevian Rocket', E: 'Unburden' });
		const validator = new TeamValidator('gen9nofieldsinglesgame');
		for (const ability of Object.values(slots)) assert.equal(validator.validateSet({ species: 'Veluza', ability, moves: ['aquajet'], level: 100, nature: 'Hardy', evs: {}, ivs: {} }), null, ability);
		const [p] = setup('Veluza', 'Unburden'); p.setItem('Sitrus Berry'); p.hp = 1000; p.eatItem();
		assert.equal(battle.runEvent('ModifySpe', p, null, null, 100), 200); assert.deepEqual(p.getPassives(), ['keeneye']);
		assert.deepEqual(Dex.species.get('veluzarejuv').abilities, { 0: 'Aevian Rocket' });
	});
	it('Klinklang remains unchanged and Galarian Slowking uses the approved replacement', () => {
		assert.deepEqual(Dex.species.get('klinklang').abilities, { 0: 'Closed Circuit', 1: 'Galvanize', H: 'Light Metal' });
		assert.deepEqual(Dex.species.get('klinklang').passives, ['soundproof']);
		assert.deepEqual(Dex.species.get('slowkinggalar').abilities, { 0: 'Neutralization', 1: 'Telepathy', H: 'Regenerator' });
		assert.deepEqual(Dex.species.get('slowkinggalar').passives, ['eldritchremedy']);
	});
	it('calculator applies each new damage passive once', () => {
		const { calculateScenario } = require('../../../dist/sim/custom-calculator');
		for (const [species, ability, move] of [['Dedenne', 'Plus', 'Thunderbolt'], ['Beheeyem', 'Analytic', 'Psychic']]) {
			const input = { format: 'gen9nofieldsinglesgame', move, samples: 8, seed: 42, actors: Array.from({ length: 4 }, () => ({ species: 'Mew', ability: 'No Ability' })) };
			input.actors[0] = { species, ability: 'No Ability' }; const single = calculateScenario(input);
			input.actors[0].ability = ability; assert.deepEqual(calculateScenario(input).results, single.results);
		}
	});
});
