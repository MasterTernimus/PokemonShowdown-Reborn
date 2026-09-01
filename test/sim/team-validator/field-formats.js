'use strict';

const assert = require('../../assert');
const {TeamValidator} = require('../../../dist/sim/team-validator');

const CUSTOM_FIELD_PROFILES = [
	'Palossand-Fiery',
	'Palossand-Icy',
	'Palossand-Rocky',
	'Lapras-Aevian',
	'Musharna-Rejuv',
	'Ariados-Mega',
	'Divineon',
];

const FIELD_FORMATS = [
	'gen9watersurface',
	'gen9murkwatersurface',
	'gen9underwater',
	'gen9icyfield',
	'gen9doubleswatersurface',
	'gen9doublesmurkwatersurface',
	'gen9doublesunderwater',
	'gen9doublesicyfield',
];

describe('Field format custom legality', function () {
	it('uses the registered Murkwater Surface terrain', function () {
		assert.equal(TeamValidator.get('gen9murkwatersurface').format.terrain, 'murkwatersurfaceterrain');
	});

	for (const format of FIELD_FORMATS) {
		it(`allows custom profiles in ${format}`, function () {
			const team = CUSTOM_FIELD_PROFILES.map(species => ({
				species,
				ability: 'No Ability',
				moves: ['Protect'],
			}));
			if (format.includes('doubles')) team.push({
				species: 'Mew',
				ability: 'Synchronize',
				moves: ['Protect'],
			});
			assert.legalTeam(team.slice(0, 6), format);
		});
	}
});
