'use strict';

const common = require('../test/common');

const doubles = process.argv[2] === 'doubles';
const ffa = process.argv[2] === 'ffa';
const formatid = ffa ? 'gen9freeforall4pfactoryfield' : doubles ? 'gen9nofielddoublesbattle' : 'gen9nofieldsinglesgame';
const overview = common.createBattle({formatid});
const megas = overview.dex.species.all().filter(species =>
	species.isMega && !species.isCosmeticForme && overview.dex.abilities.get(species.abilities[0]).num >= 10000
);
overview.destroy();

const results = [];
for (const {species, from} of megas.flatMap(species => {
	const sources = species.battleOnly || species.changesFrom || species.baseSpecies;
	return (Array.isArray(sources) ? sources : [sources]).map(from => ({species, from}));
})) {
	let battle;
	const result = {
		mega: species.name,
		ability: species.abilities[0],
		from,
		item: species.requiredItem || '',
	};
	try {
		const firstTeam = [{
			species: result.from,
			item: result.item,
			moves: ['tackle', 'splash'],
		}];
		const secondTeam = [{species: 'Blissey', ability: 'No Ability', moves: ['splash']}];
		if (doubles) {
			firstTeam.push({species: 'Mew', ability: 'No Ability', moves: ['splash']});
			secondTeam.push({species: 'Mew', ability: 'No Ability', moves: ['splash']});
		}
		const teams = ffa ? [firstTeam, secondTeam,
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}],
			[{species: 'Mew', ability: 'No Ability', moves: ['splash']}]] : [firstTeam, secondTeam];
		battle = common.createBattle({formatid}, teams);
		battle.makeChoices(...teams.map(() => doubles ? 'team 1, 2' : 'team 1'));
		const pokemon = battle.p1.active[0];
		const choices = [
			['mega', pokemon.canMegaEvo],
			['megax', pokemon.canMegaEvoX],
			['megay', pokemon.canMegaEvoY],
		];
		const choice = choices.find(([, candidate]) => candidate === species.name);
		if (!choice) {
			result.outcome = 'unavailable';
			result.options = choices.filter(([, candidate]) => candidate).map(([kind, candidate]) => `${kind}:${candidate}`);
			continue;
		}
		const megaMove = ffa ? `move 2 ${choice[0]}` : doubles ? `move 1 +1 ${choice[0]}, move 1` : `move 1 ${choice[0]}`;
		battle.makeChoices(megaMove, ...teams.slice(1).map(() => doubles ? 'move 1, move 1' : 'move splash'));
		if (pokemon.species.name !== species.name || pokemon.ability !== battle.dex.toID(species.abilities[0])) {
			result.outcome = 'wrong-form-or-ability';
			result.actual = `${pokemon.species.name}/${pokemon.ability}`;
			continue;
		}
		battle.runEvent('BasePower', pokemon, battle.p2.active[0], battle.dex.getActiveMove('tackle'), 100);
		battle.makeChoices();
		result.outcome = 'pass';
	} catch (err) {
		result.outcome = 'error';
		result.error = err && err.stack ? err.stack.split('\n').slice(0, 4).join(' ') : String(err);
	} finally {
		battle?.destroy();
		results.push(result);
	}
}

	console.log(JSON.stringify({
	formatid,
	total: results.length,
	counts: Object.fromEntries([...new Set(results.map(result => result.outcome))].map(
		outcome => [outcome, results.filter(result => result.outcome === outcome).length]
	)),
	issues: results.filter(result => result.outcome !== 'pass'),
	...(process.argv.includes('--full') ? {results} : {}),
}, null, 2));
