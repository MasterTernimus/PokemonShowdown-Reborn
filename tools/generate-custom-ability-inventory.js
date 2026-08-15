'use strict';

const fs = require('fs');
const path = require('path');
const {Dex} = require('../dist/sim');
const {AbilitiesText} = require('../dist/data/text/abilities');

Dex.includeData();

const usersByAbility = new Map();
for (const species of Dex.species.all()) {
	for (const abilityName of Object.values(species.abilities)) {
		const abilityId = Dex.toID(abilityName);
		if (!usersByAbility.has(abilityId)) usersByAbility.set(abilityId, []);
		usersByAbility.get(abilityId).push(species.name);
	}
}

const abilities = Dex.abilities.all()
	.filter(ability => ability.num >= 10000)
	.sort((a, b) => a.name.localeCompare(b.name));

const lines = [
	'# Custom Ability Inventory',
	'',
	'Generated from the live compiled server data by `node tools/generate-custom-ability-inventory.js`.',
	'',
	`Custom-numbered entries: ${abilities.length}`,
	'',
	'## Custom Abilities',
	'',
];

for (const ability of abilities) {
	const text = AbilitiesText[ability.id] || {};
	const effect = String(text.shortDesc || text.desc || ability.shortDesc || ability.desc || 'No description provided.')
		.replace(/\s+/g, ' ')
		.trim();
	const users = [...new Set(usersByAbility.get(ability.id) || [])].sort();
	lines.push(`- **${ability.name}** (\`${ability.id}\`): ${effect} **Users:** ${users.length ? users.join(', ') : 'None directly assigned.'}`);
}

fs.writeFileSync(path.resolve(__dirname, '..', 'CUSTOM-ABILITY-INVENTORY.md'), `${lines.join('\n')}\n`);
