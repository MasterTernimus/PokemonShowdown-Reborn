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
	expected.lapras = ['liquidvoice'];
	expected.yanmega = ['levitate'];
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
megaExpected.lapras = ['liquidvoice'];
megaExpected.yanmega = ['levitate'];
exports.current = (id, fallback) => megaExpected[id] || fallback;

const shortlist=require('./shortlist-approved.json');
const previousPassives=exports.passives;
exports.passives=expected=>Object.assign(previousPassives(expected),shortlist.passives);
Object.assign(megaExpected,shortlist.passives);
const previousAbilities=exports.abilities;
exports.abilities=(id,expected)=>Object.assign(previousAbilities(id,expected),shortlist.slots[id]||{});

const beforeSilvallyAbilities=exports.abilities;
exports.abilities=(id,expected)=>{const result=beforeSilvallyAbilities(id,expected);if(id==='silvally')delete result.S;return result;};

// Approved gym-signature migration removes only event slots with these exact old values.
const migratedEventAbilities = new Set(["Multipulse","Aquabatics","Fever Pitch","Thunder Raid","Desert's Mark","Super U.M.D. Move","Gale Strike","Spectral Scream","Barbed Web","Cold Truth","Bunraku Beatdown","Matrix Shot","Pyrokinesis","Venam's Kiss","Heavenly Wing","Uproot"]);
const beforeRejuvMoveAbilities = exports.abilities;
exports.abilities = (id, expected) => {
 const result = beforeRejuvMoveAbilities(id, expected);
 for (const slot of ['S', 'E']) if (migratedEventAbilities.has(result[slot])) delete result[slot];
 return result;
};

// Explicit Kingambit migration: replace Entrenched, do not append another passive.
const beforeKingambitPassives = exports.passives;
exports.passives = expected => Object.assign(beforeKingambitPassives(expected), {kingambit: ['supremeoverlord']});
megaExpected.kingambit = ['supremeoverlord'];
