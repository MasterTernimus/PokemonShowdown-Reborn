'use strict';

const fs = require('fs');
const common = require('../test/common');
const source = fs.readFileSync(require.resolve('../sim/pokemon.ts'), 'utf8');
const aliasesSource = source.split('const abilityAliases:')[1].split('\n\t\t\t};')[0];
const aliases = Object.fromEntries([...aliasesSource.matchAll(/^\s*([a-z]+): \[([^\]]*)\]/gm)].map(
	([, name, entries]) => [name, [...entries.matchAll(/'([^']+)'/g)].map(([, id]) => id)]
));
const battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'});
const megaAbilities = new Map(battle.dex.species.all().filter(species =>
	species.isMega && !species.isCosmeticForme && battle.dex.abilities.get(species.abilities[0]).num >= 10000
).map(species =>
	[battle.dex.abilities.get(species.abilities[0]).id, species.abilities[0]]
));
const gaps = [];
for (const [id, name] of megaAbilities) {
	const outer = battle.dex.abilities.get(id);
	const components = aliases[id] || [];
	for (const componentId of components) {
		const component = battle.dex.abilities.get(componentId);
		for (const event of Object.keys(component).filter(key => /^on[A-Z]/.test(key) && typeof component[key] === 'function' && !/Priority$|Order$|SubOrder$/.test(key))) {
			if (component[event] && !outer[event]) gaps.push({megaAbility: name, component: component.name, event});
		}
	}
}
console.log(JSON.stringify({uniqueMegaAbilities: megaAbilities.size, compositeAbilities: [...megaAbilities.keys()].filter(id => aliases[id]).length,
	gaps}, null, 2));
battle.destroy();
