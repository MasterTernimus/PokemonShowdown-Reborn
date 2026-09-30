'use strict';
const assert = require('assert').strict;
require('../dist/lib/process-manager').ProcessManager.disabled = true;
global.Config = {routes: {dex: 'dex.pokemonshowdown.com'}};
global.Dex = require('../dist/sim/dex').Dex;
global.toID = Dex.toID;
const datasearch = require('../dist/server/chat-plugins/datasearch');
const positive = datasearch.testables.runDexsearch('Tough Claws, all, natdex', 'ds', '/ds Tough Claws').results;
const negative = datasearch.testables.runDexsearch('!Tough Claws, all, natdex', 'ds', '/ds !Tough Claws').results;
for (const species of ['Scizor', 'Mamoswine', 'Sandslash', 'Sandslash-Alola']) {
	assert(positive.includes(species), species);
	assert(!negative.includes(species), species);
}
console.log('PASS: /ds Tough Claws and /ds !Tough Claws include/exclude the same composite holders.');
for (const [component, species] of [['Current Coil','Eelektross-Mega'], ['Vital Spirit','Electivire'], ['Vital Spirit','Magmortar'],
 ['Black Viper','Seviper-Mega'], ['Tough Claws','Incineroar'], ['Solid Rock','Rhyperior']]) {
	// /ds normally collapses matching forms into the base species.
	const forms = species.endsWith('-Mega') ? ', mega' : '';
	const yes = datasearch.testables.runDexsearch(`${component}, all, natdex${forms}`, 'ds', `/ds ${component}`);
	const no = datasearch.testables.runDexsearch(`!${component}, all, natdex${forms}`, 'ds', `/ds !${component}`);
	const included = yes.results || (yes.dt ? [yes.dt] : []);
	const excluded = no.results || (no.dt ? [no.dt] : []);
	assert(included.includes(species),`${component}: ${species}`);
	assert(!excluded.includes(species),`!${component}: ${species}`);
}
console.log('PASS: new components and their negated searches agree.');
datasearch.destroy();
process.exit(0);
