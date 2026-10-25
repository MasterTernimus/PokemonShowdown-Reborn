'use strict';
const assert = require('assert').strict;
const {Dex, TeamValidator} = require('../../../dist/sim');
const removed = {
	"feraligatr": [
		"aquastep"
	],
	"feraligatrmega": [
		"aquastep"
	],
	"feraligatrgmax": [
		"aquastep"
	],
	"floatzel": [
		"aquastep"
	],
	"mimikyu": [
		"astralbarrage"
	],
	"mimikyubusted": [
		"astralbarrage"
	],
	"mimikyutotem": [
		"astralbarrage"
	],
	"mimikyubustedtotem": [
		"astralbarrage"
	],
	"breloommega": [
		"barbbarrage"
	],
	"breloom": [
		"barbbarrage"
	],
	"typhlosion": [
		"bitterblade"
	],
	"typhlosionalt": [
		"bitterblade"
	],
	"typhlosionmega": [
		"bitterblade"
	],
	"typhlosionhisui": [
		"bitterblade"
	],
	"altaria": [
		"bleakwindstorm"
	],
	"altariamega": [
		"bleakwindstorm"
	],
	"froslass": [
		"bleakwindstorm",
		"magicpowder"
	],
	"froslassmega": [
		"bleakwindstorm",
		"magicpowder"
	],
	"ninetales": [
		"bleakwindstorm"
	],
	"ninetalesalola": [
		"bleakwindstorm"
	],
	"delibird": [
		"bleakwindstorm"
	],
	"volcarona": [
		"blueflare"
	],
	"dragalge": [
		"clangingscales"
	],
	"dragalgemega": [
		"clangingscales"
	],
	"flygon": [
		"clangingscales"
	],
	"flygonmega": [
		"clangingscales"
	],
	"flygonmegaz": [
		"clangingscales"
	],
	"noivernmega": [
		"clangingscales"
	],
	"noivern": [
		"clangingscales"
	],
	"gardevoir": [
		"darkvoid"
	],
	"gardevoirmega": [
		"darkvoid"
	],
	"gardevoirmegaalt": [
		"darkvoid"
	],
	"gardevoirvoidmega": [
		"darkvoid"
	],
	"gardevoirmegaz": [
		"darkvoid"
	],
	"gardevoirvoid": [
		"darkvoid"
	],
	"aurorus": [
		"diamondstorm"
	],
	"aurorusmega": [
		"diamondstorm"
	],
	"probopass": [
		"diamondstorm"
	],
	"drapion": [
		"direclaw"
	],
	"gliscor": [
		"direclaw"
	],
	"gliscoralt": [
		"direclaw"
	],
	"gligar": [
		"direclaw"
	],
	"gligaralt": [
		"direclaw"
	],
	"banette": [
		"magicpowder",
		"spectralthief"
	],
	"banettemega": [
		"magicpowder",
		"spectralthief"
	],
	"banettemegaz": [
		"magicpowder",
		"spectralthief"
	],
	"beautifly": [
		"magicpowder"
	],
	"dustox": [
		"magicpowder"
	],
	"florges": [
		"magicpowder"
	],
	"florgesyellow": [
		"magicpowder"
	],
	"florgesorange": [
		"magicpowder"
	],
	"florgesblue": [
		"magicpowder"
	],
	"florgeswhite": [
		"magicpowder"
	],
	"meganium": [
		"magicpowder"
	],
	"meganiummega": [
		"magicpowder"
	],
	"meganiummegay": [
		"magicpowder"
	],
	"venusaur": [
		"magicpowder"
	],
	"venusaurmega": [
		"magicpowder"
	],
	"venusaurgmax": [
		"magicpowder"
	],
	"haxorus": [
		"mightycleave"
	],
	"haxorusmega": [
		"mightycleave"
	],
	"gengar": [
		"spectralthief"
	],
	"gengarmega": [
		"spectralthief"
	],
	"gengargmax": [
		"spectralthief"
	],
	"absol": [
		"tachyoncutter"
	],
	"absolmega": [
		"tachyoncutter"
	],
	"absolmegaz": [
		"tachyoncutter"
	],
	"aegislash": [
		"tachyoncutter"
	],
	"aegislashblade": [
		"tachyoncutter"
	],
	"aegislashgmax": [
		"tachyoncutter"
	],
	"doublade": [
		"tachyoncutter"
	]
};

describe('Approved signature movepool removals', () => {
	const validator = TeamValidator.get('gen9doublesrockyfield@@@Obtainable Moves');
	for (const [id, moves] of Object.entries(removed)) {
		it(id + ' excludes every listed inherited move', () => {
			const species = Dex.species.get(id);
			assert(species.exists, id);
			for (const move of moves) {
				assert(!Dex.species.getFullLearnset(id).some(entry => entry.learnset[move]), id + ': inherited ' + move);
				assert(!Dex.species.getMovePool(id, true).has(move), id + ': NatDex pool ' + move);
				assert(validator.checkCanLearn(Dex.moves.get(move), species, undefined,
					{ability: Object.values(species.abilities)[0], level: 100}), id + ': strict ' + move);
			}
		});
	}
	for (const [id, move] of [['floette', 'magicpowder'], ['florgesreborn', 'magicpowder'],
		['breloomrejuv', 'barbbarrage'], ['drapionrejuv', 'direclaw']]) {
		it(id + ' keeps its unlisted branch access to ' + move, () => {
			assert(Dex.species.getFullLearnset(id).some(entry => entry.learnset[move]?.length));
		});
	}
	it('keeps ordinary Rocky import rules permissive', () => {
		assert(!Dex.formats.getRuleTable(Dex.formats.get('gen9doublesrockyfield')).has('obtainablemoves'));
	});
	it('leaves historical generation pools outside the Gen9 exclusion layer', () => {
		const dex = Dex.mod('gen8');
		assert(dex.species.getFullLearnset('florges').some(entry => entry.learnset.magicpowder?.length));
	});
});

