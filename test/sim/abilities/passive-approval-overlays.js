'use strict';
exports.passives = expected => {
	for (const f of ['latest-passives-approved.json', 'settled-passives-approved.json'])
		for (const [p, ids] of Object.entries(require('./' + f).groups)) for (const id of ids) expected[id] = [p];
	Object.assign(expected, require('./passive-revision-approved.json').overrides);
	expected.grimer = ['liquidooze'];
	expected.muk = ['liquidooze'];
	Object.assign(expected, require('./mega-paused-explicit.json'));
	for (const [id, passive] of Object.entries(require('./mega-approved-choices.json'))) expected[id] = [passive];
	for (const [id, normal] of Object.entries(require('./mega-approved-variants.json'))) if (expected[normal]?.length) expected[id] = expected[normal];
	for (const [id, p] of Object.entries(require('./gmax-approved.json').passives)) expected[id] = [p];
	return expected;
};
exports.abilities = (id, expected) => {
	if (require('./gmax-approved.json').abilities[id]) return {...require('./gmax-approved.json').abilities[id]};
	if (id === 'mismagiusmega') expected[0] = 'Void Craft';
	for (const [species, slot, , name] of require('./latest-passives-approved.json').slots) if (species === id) expected[slot] = name;
	if (id === 'venusaur') expected.S = 'Uproot';
	if (id === 'lucariomegaz') expected[0] = 'Aura Precision';
	const slots = {lucariomega: ['0', 'Aura Convergence'], kangaskhan: ['1', 'Healer'], froslass: ['0', 'Haunting Veil'], salamencemega: ['0', 'Crescent Rend'], gengarmega: ['0', 'Shadow Double'], scovillainmega: ['0', 'Crossfire']};
	if (slots[id]) expected[slots[id][0]] = slots[id][1];
	return expected;
};

const megaExpected = Object.fromEntries(require('./mega-approved-before.json').map(s => [s.id, s.passives]));
Object.assign(megaExpected, require('./mega-paused-explicit.json'));
for (const [id, passive] of Object.entries(require('./mega-approved-choices.json'))) megaExpected[id] = [passive];
for (const [id, normal] of Object.entries(require('./mega-approved-variants.json'))) if (megaExpected[normal]?.length) megaExpected[id] = megaExpected[normal];
for (const [id, p] of Object.entries(require('./gmax-approved.json').passives)) megaExpected[id] = [p];
exports.current = (id, fallback) => megaExpected[id] || fallback;
