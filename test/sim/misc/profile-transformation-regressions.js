'use strict';

const assert = require('../../assert');
const common = require('../../common');

describe('Profile transformation audit regressions', () => {
	let battle;
	afterEach(() => {
		battle?.destroy();
		battle = null;
	});

	function damage(source, target, overrides = {}) {
		const move = battle.dex.getActiveMove('tackle');
		Object.assign(move, { noDamageVariance: true, willCrit: false }, overrides);
		return battle.actions.getDamage(source, target, move);
	}

	function startSingles(teams) {
		battle = common.createBattle({ formatid: 'gen9nofieldsinglesgame' }, teams);
		battle.makeChoices(...teams.map(team => `team ${team.map((set, i) => i + 1).join('')}`));
	}

	for (const species of ['Necrozma-Dawn-Wings', 'Necrozma-Dusk-Mane']) {
		it(`${species} Ultra Bursts and consumes one gimmick`, () => {
			startSingles([[
				{ species, ability: 'Prism Armor', item: 'Ultranecrozium Z', moves: ['photongeyser'] },
			], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
			const necrozma = battle.p1.active[0];
			assert(necrozma.getMoveRequestData().canUltraBurst);
			battle.makeChoices('move photongeyser ultra', 'move splash');
			assert.species(necrozma, 'Necrozma-Ultra');
			assert.equal(necrozma.ability, 'neuroforce');
			assert.equal(battle.p1.gimmickCount, 1);
			assert.equal(battle.p1.megaEvoCount, 0);
			assert.false(necrozma.canUltraBurst);
			assert.false(necrozma.getMoveRequestData().canUltraBurst);
		});
	}

	it('counts Ultra Burst toward the side limit after another Pokemon uses a gimmick', () => {
		startSingles([[
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Necrozma-Dusk-Mane', ability: 'Prism Armor', item: 'Ultranecrozium Z', moves: ['splash'] },
			{ species: 'Charizard', ability: 'No Ability', item: 'Charizardite X', moves: ['splash'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('move splash terastallize', 'move splash');
		battle.makeChoices('switch 2', 'move splash');
		battle.makeChoices('move splash ultra', 'move splash');
		assert.species(battle.p1.active[0], 'Necrozma-Ultra');
		assert.equal(battle.p1.gimmickCount, 2);
		assert.false(battle.p1.pokemon[2].canMegaEvo);
		assert.false(battle.p1.pokemon[2].canTerastallize);
	});

	for (const [species, gmax, move, signature] of [
		['Machamp-Alt', 'Machamp-Gmax-Alt', 'brickbreak', 'gmaxchistrike'],
		['Grimmsnarl-Azzy', 'Grimmsnarl-Gmax-Azzy', 'bite', 'gmaxsnooze'],
		['Toxtricity-Low-Key', 'Toxtricity-Low-Key-Gmax', 'thundershock', 'gmaxstunshock'],
		['Urshifu-Rapid-Strike', 'Urshifu-Rapid-Strike-Gmax', 'watergun', 'gmaxrapidflow'],
	]) {
		it(`${gmax} retains its signature move and protections after switching`, () => {
			battle = common.createBattle({ formatid: 'gen9mistyfieldadrienn' }, [[
				{ species, ability: 'No Ability', gigantamax: true, moves: ['splash', move] },
				{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
			battle.makeChoices('team 12', 'team 1');
			const pokemon = battle.p1.active[0];
			battle.makeChoices('move splash dynamax', 'move splash');
			assert.species(pokemon, gmax);
			battle.makeChoices('switch 2', 'move splash');
			battle.makeChoices('switch 2', 'move splash');
			assert.species(pokemon, gmax);
			assert(pokemon.volatiles.dynamax);
			assert(pokemon.getMoveRequestData().maxMoves.maxMoves.some(option => option.move === signature));
			assert.false(pokemon.addVolatile('flinch'));
			assert.false(battle.runEvent('DragOut', pokemon));
		});
	}

	for (const [regular, skin] of [
		['Machamp-Gmax', 'Machamp-Gmax-Alt'],
		['Grimmsnarl-Gmax', 'Grimmsnarl-Gmax-Azzy'],
	]) {
		it(`${skin} has the same damage resistance as ${regular}`, () => {
			startSingles([[
				{ species: 'Mew', ability: 'No Ability', moves: ['tackle'] },
			], [
				{ species: regular, ability: 'No Ability', moves: ['splash'] },
				{ species: skin, ability: 'No Ability', moves: ['splash'] },
			]]);
			const [normal, alternate] = battle.p2.pokemon;
			assert.equal(normal.storedStats.def, alternate.storedStats.def);
			assert.equal(damage(battle.p1.active[0], normal), damage(battle.p1.active[0], alternate));
		});
	}

	it('does not apply Stellar or Z matchup modifiers to an untransformed Gmax candidate', () => {
		battle = common.createBattle({ formatid: 'gen9doublesmistyfieldadrienn' }, [[
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
			{ species: 'Mew', ability: 'No Ability', moves: ['splash'] },
		], [
			{ species: 'Machamp', ability: 'No Ability', gigantamax: true, moves: ['splash'] },
			{ species: 'Machamp', ability: 'No Ability', moves: ['splash'] },
		]]);
		battle.makeChoices('team 12', 'team 12');
		const [stellar, ordinary] = battle.p1.active;
		const [candidate, control] = battle.p2.active;
		battle.makeChoices('move splash terastallize, move splash', 'move splash, move splash');
		assert.equal(stellar.terastallized, 'Stellar');
		assert.false(candidate.volatiles.dynamax);
		assert.equal(damage(stellar, candidate), damage(stellar, control));
		assert.equal(damage(candidate, stellar), damage(control, stellar));
		assert.equal(damage(ordinary, candidate, { isZ: true }), damage(ordinary, control, { isZ: true }));
	});

	it('does not give an untransformed Gmax candidate FFA follow-up damage resistance', () => {
		battle = common.createBattle({ formatid: 'gen9freeforall4pmistyfieldadrienn' }, [
			[{ species: 'Mew', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Machamp', ability: 'No Ability', gigantamax: true, moves: ['splash'] }],
			[{ species: 'Machamp', ability: 'No Ability', moves: ['splash'] }],
			[{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }],
		]);
		battle.makeChoices('team 1', 'team 1', 'team 1', 'team 1');
		const attacker = battle.p1.active[0];
		assert.equal(damage(attacker, battle.p2.active[0], { hit: 2 }), damage(attacker, battle.p3.active[0], { hit: 2 }));
	});

	for (const species of ['Zygarde', 'Zygarde-10%']) {
		it(`${species} must activate Power Construct before it can Mega Evolve`, () => {
			startSingles([[
				{ species, ability: 'Power Construct', item: 'Zygardite', moves: ['splash'] },
			], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
			const zygarde = battle.p1.active[0];
			assert.false(zygarde.canMegaEvo);
			assert.false(zygarde.getMoveRequestData().canMegaEvo);
			zygarde.hp = Math.floor(zygarde.maxhp / 2);
			battle.makeChoices('move splash', 'move splash');
			assert.species(zygarde, 'Zygarde-Complete');
			assert.equal(zygarde.canMegaEvo, 'Zygarde-Mega');
			battle.makeChoices('move splash mega', 'move splash');
			assert.species(zygarde, 'Zygarde-Mega');
			assert.equal(battle.p1.gimmickCount, 1);
		});
	}

	it('preserves the custom Mega fallback for regular Floette holding Floettite', () => {
		startSingles([[
			{ species: 'Floette', ability: 'No Ability', item: 'Floettite', moves: ['splash'] },
		], [{ species: 'Blissey', ability: 'No Ability', moves: ['splash'] }]]);
		battle.makeChoices('move splash mega', 'move splash');
		assert.species(battle.p1.active[0], 'Floette-Mega');
		assert.equal(battle.p1.gimmickCount, 1);
	});
});
