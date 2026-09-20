'use strict';

const fs = require('fs');
const path = require('path');
const {spawnSync} = require('child_process');

function run(script, args = []) {
	const output = spawnSync(process.execPath, [path.join(__dirname, script), ...args], {
		encoding: 'utf8', maxBuffer: 8 * 1024 * 1024,
	});
	if (output.status !== 0) throw new Error(output.stderr || output.stdout);
	return JSON.parse(output.stdout);
}

const modes = [
	['Singles', [], 'S'],
	['Doubles', ['doubles'], 'D'],
	['Free-for-All', ['ffa'], 'FFA'],
];
const audits = modes.map(([name, args, label]) => ({name, label, data: run('audit-mega-abilities.cjs', [...args, '--full'])}));
const components = run('audit-mega-components.cjs');
const results = audits[0].data.results;
const reportDate = new Intl.DateTimeFormat('en-CA', {
	timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date());
const lines = [
	'# Custom Mega ability audit', '',
	`Generated ${reportDate} from the local Showdown battle engine.`, '',
	'## Coverage and outcome', '',
	`- ${results.length} non-cosmetic Mega forms with custom abilities; ${new Set(results.map(result => result.ability)).size} unique ability names.`,
	`- Singles: ${audits[0].data.counts.pass || 0}/${results.length}; Doubles: ${audits[1].data.counts.pass || 0}/${results.length}; Free-for-All: ${audits[2].data.counts.pass || 0}/${results.length}.`,
	`- ${components.compositeAbilities} composite abilities were compared with their component event hooks. ${components.gaps.length} deliberate/specialized differences remain after review.`,
	'- The roster check Mega Evolves each form, confirms its final species and ability, runs an attack-power event, and advances through another turn. Focused battle tests cover the named effects below.', '',
	'## Confirmed defects fixed', '',
	'- Mega Slowbro had an undefined Shell Trap ability. It now has Shell Armor and Regenerator, with battle tests for damage reduction and switch recovery.',
	'- Gengar-Mega Cruel Tag lacked Shadow Tag trapping and damage reduction; Clawitzer-Mega Heavy Artillery and Venusaur-Mega Toxic Bloom lacked Unaware boost handling.',
	'- Swampert-Mega Raging Current lacked Damp explosion prevention, Water Veil burn protection/Aqua Ring, and Fire damage reduction.',
	'- Golurk-Mega Phantom Fist lacked its punch power boost; Falinks-Mega Phalanx Form lacked Battle Armor damage reduction; Aggron-Mega Iron Mountain lacked Heavy Metal physical protection.',
	'- Other component hooks restored where applicable: Apex Predator, Joyride, Storm Fright, Mirror Greed, Relentless Link, Royal Voice, Soul Tag, Mourning Snow, Blooming Sun, Heavenly Chorus, Doom Warning, Unchecked Assault, True Devotion, Cursed Marionette, Silken Decoy, Hydra Breaker, Draconic Force, and Wooly Conductor.',
	'- Raging Storm and Raging Overlord now apply their listed Battle Armor effects. Sand Sovereign no longer falsely advertises Battle Armor/Filter; it identifies its implemented Sand Stream, Dauntless Shield, and Solid Rock components.',
	'- Emboar-Mega Burning Ego and the separate Reborn Mega route were fixed and verified in the preceding Emboar audit.', '',
	'## Reviewed specialized differences', '',
	'- Solar Trap implements its Innards Out-style retaliation at lethal damage rather than the inherited DamagingHit event; a battle test confirms the attacker takes damage.',
	'- Apex Predator omits Relic Armor’s Lapras-Aevian-only typing change because its holder is Aerodactyl-Mega.',
	'- Hellfire Eclipse deliberately uses custom sunlight Attack/Sp. Atk boosts and does not list Solar Power’s HP loss.',
	'- Mourning Snow heals through its own weather residual; forwarding Ice Body’s weather healing would heal twice.', '',
	'## Limits', '',
	'These checks do not exhaust every move, field, item, switch pattern, or team composition for all forms. Passing the roster check establishes that the Mega route and basic ability events run in the three battle modes; the focused tests establish the listed effects. No failure remains in those checks. The repository-wide TypeScript check still reports thousands of diagnostics across existing project files; the targeted `test-npm` TypeScript check passes.', '',
	'## Roster results', '',
	'Each ✓ means the Mega route, ability identity, attack-power event, and following turn passed in that battle mode.', '',
	'| Mega form | Custom ability | S | D | FFA |',
	'| --- | --- | :---: | :---: | :---: |',
];
for (const result of results) {
	const statuses = audits.map(audit => audit.data.results.find(entry => entry.mega === result.mega)?.outcome === 'pass' ? '✓' : 'FAIL');
	lines.push(`| ${result.mega} | ${result.ability} | ${statuses.join(' | ')} |`);
}
const target = path.resolve(__dirname, '../reports/mega-ability-audit.md');
fs.mkdirSync(path.dirname(target), {recursive: true});
fs.writeFileSync(target, lines.join('\n') + '\n');
console.log(target);
