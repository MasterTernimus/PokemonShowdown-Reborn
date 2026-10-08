'use strict';
exports.passives = expected => {
	for (const f of ['latest-passives-approved.json', 'settled-passives-approved.json'])
		for (const [p, ids] of Object.entries(require('./' + f).groups)) for (const id of ids) expected[id] = [p];
	Object.assign(expected, require('./passive-revision-approved.json').overrides);
	expected.grimer = ['liquidooze'];
	expected.muk = ['liquidooze'];
	return expected;
};
exports.abilities = (id, expected) => {
	for (const [species, slot, , name] of require('./latest-passives-approved.json').slots) if (species === id) expected[slot] = name;
	if (id === 'venusaur') expected.S = 'Uproot';
	return expected;
};
