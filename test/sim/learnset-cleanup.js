'use strict';

const assert = require('./../assert');
const {Dex} = require('./../../dist/sim/dex');
const {CustomLearnsetRemovals} = require('./../../dist/data/learnsets');

describe('Custom learnset cleanup', function () {
	const requestedRemovals = {
		claydol: ['lightofruin', 'shoreup', 'lusterpurge'], chimecho: ['lightofruin'],
		gyarados: ['dragonascent'], archeops: ['dragonascent'], aerodactyl: ['dragonascent'],
		exploud: ['torchsong'], delphox: ['torchsong'], ninetales: ['torchsong'],
		chikorita: ['growth'], bayleef: ['growth'], meganium: ['growth'],
		lycanroc: ['precipiceblades', 'shoreup'], lycanrocmidnight: ['precipiceblades', 'shoreup'],
		lycanrocdusk: ['precipiceblades', 'shoreup'], arcanine: ['mightycleave'],
		donphan: ['mightycleave', 'shoreup'], druddigon: ['mightycleave', 'partingshot'],
		feraligatr: ['mightycleave', 'shoreup'], marowak: ['mightycleave', 'shoreup'],
		marowakalola: ['mightycleave', 'shoreup'], solrock: ['mightycleave', 'diamondstorm'],
		lucario: ['tachyoncutter', 'meteorassault'], sceptile: ['tachyoncutter'],
		gallade: ['tachyoncutter', 'bitterblade', 'triplearrows'],
		gardevoir: ['tachyoncutter', 'psychoboost', 'lunarwish', 'lunardance', 'psyblade'],
		empoleon: ['tachyoncutter'], starmie: ['diamondstorm'], lunatone: ['diamondstorm'],
		dodrio: ['triplearrows'], kabutops: ['ceaselessedge'], weavile: ['ceaselessedge'],
		drapion: ['ceaselessedge'], clawitzer: ['originpulse'],
		wailord: ['originpulse', 'sparklingaria', 'slackoff'], staraptor: ['thunderouskick'],
		garchomp: ['spacialrend', 'roaroftime'], dragonite: ['roaroftime'], kommoo: ['roaroftime'],
		altaria: ['roaroftime'], goodra: ['roaroftime', 'slackoff'],
		goodrahisui: ['roaroftime', 'slackoff'], salamence: ['roaroftime'], flygon: ['roaroftime'],
		hydreigon: ['roaroftime'], pangoro: ['ragefist'], hitmonchan: ['ragefist'],
		rhydon: ['saltcure'], rhyperior: ['saltcure'], crobat: ['direclaw'],
		toxicroak: ['direclaw', 'partingshot'], seviper: ['direclaw', 'partingshot'],
		mienshao: ['meteorassault'], escavalier: ['doubleironbash'], mawile: ['doubleironbash'],
		arcaninehisui: ['accelerock', 'shoreup'], volcanion: ['hydrosteam'],
		musharna: ['partingshot'], noivern: ['partingshot'], umbreon: ['partingshot'],
		abomasnow: ['partingshot'], cradily: ['sappyseed'], vespiquen: ['partingshot'], muk: ['partingshot'],
		mukalola: ['partingshot'], spiritomb: ['partingshot'], liepard: ['partingshot'],
		manectric: ['partingshot'], nidoking: ['partingshot'], kecleon: ['partingshot'],
		parasect: ['partingshot'], dusknoir: ['partingshot'], absol: ['partingshot'],
		granbull: ['partingshot'], zangoose: ['partingshot'], scyther: ['sacredsword'],
		scizor: ['sacredsword'], kleavor: ['sacredsword'], espeon: ['fierydance', 'lusterpurge'],
		reuniclus: ['lusterpurge'], sawsbuck: ['shoreup'], seismitoad: ['shoreup'],
		crustle: ['shoreup'], stoutland: ['shoreup'], armaldo: ['shoreup'], machamp: ['shoreup'],
		omastar: ['shoreup'], simipour: ['slackoff'], simisage: ['slackoff'], simisear: ['slackoff'],
		lapras: ['bouncybubble'], milotic: ['bouncybubble'],
	};
	const removals = {...CustomLearnsetRemovals, ...requestedRemovals};

	function canLearn(species, move) {
		return Dex.species.getFullLearnset(species).some(data => data.learnset[move]?.length);
	}

	it('should remove every requested move from the complete evolutionary learnset', function () {
		for (const [species, moves] of Object.entries(removals)) {
			for (const move of moves) {
				assert.false(canLearn(species, move), `${species} should not learn ${move}`);
			}
		}
	});

	it('should keep the requested replacement recovery and utility moves', function () {
		assert(canLearn('omastar', 'recover'));
		for (const species of ['goodra', 'goodrahisui']) {
			assert(canLearn(species, 'allyswitch'));
			assert(canLearn(species, 'recover'));
		}
		assert(canLearn('latios', 'lusterpurge'));
		assert(canLearn('wyrdeer', 'hypervoice'));
		for (const species of ['flareon', 'maractus']) assert(canLearn(species, 'sizzleslide'));
		for (const move of ['glaciallance', 'sappyseed']) assert(canLearn('abomasnow', move));
		for (const move of ['gyroball', 'heavyslam', 'irondefense', 'ironhead', 'metalburst', 'smartstrike', 'steelroller']) {
			assert(canLearn('falinks', move), `falinks should learn ${move}`);
		}
		for (const move of ['ragepowder', 'dazzlinggleam', 'stickyweb', 'reflecttype', 'hurricane', 'flashcannon', 'sludgebomb', 'spikes', 'weatherball']) {
			assert(canLearn('mothim', move), `mothim should learn ${move}`);
		}
		assert(canLearn('shiftry', 'weatherball'));
		const falinksGhostMoves = ['astonish', 'destinybond', 'nightshade', 'ominouswind', 'phantomforce', 'poltergeist', 'shadowball', 'shadowclaw', 'shadowpunch', 'shadowsneak', 'spectralthief'];
		for (const move of falinksGhostMoves) assert.false(canLearn('falinks', move), `falinks should not learn ${move}`);
		assert(canLearn('falinks', 'curse'));
	});
});
