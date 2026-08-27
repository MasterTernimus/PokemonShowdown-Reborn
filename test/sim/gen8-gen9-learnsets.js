'use strict';

const assert = require('./../assert');

describe('Gen 8/9 and regional learnsets', function () {
	it('includes the official entries repaired in the local data patch', function () {
		const expected = {
			orbeetle: ['leechlife'],
			thievul: ['foulplay', 'lashout', 'mudshot', 'protect', 'round', 'uturn'],
			boltund: ['firefang', 'nuzzle'],
			cramorant: ['dive', 'raindance'],
			sinisteaantique: ['payback', 'round', 'snore', 'wonderroom'],
			polteageistantique: [
				'allyswitch', 'aromatherapy', 'aromaticmist', 'astonish', 'batonpass', 'calmmind', 'confuseray',
				'curse', 'darkpulse', 'endure', 'facade', 'foulplay', 'gigadrain', 'gigaimpact', 'hex',
				'hyperbeam', 'imprison', 'lightscreen', 'magicalleaf', 'megadrain', 'memento', 'metronome',
				'nastyplot', 'nightshade', 'painsplit', 'payback', 'phantomforce', 'poltergeist', 'protect',
				'psybeam', 'psychic', 'psyshock', 'reflect', 'rest', 'round', 'selfdestruct', 'shadowball',
				'shellsmash', 'skillswap', 'sleeptalk', 'snore', 'spite', 'storedpower', 'strengthsap',
				'substitute', 'suckerpunch', 'sweetscent', 'teatime', 'terablast', 'trick', 'trickroom',
				'willowisp', 'withdraw', 'wonderroom',
			],
			tandemaus: ['celebrate'],
			toedscool: ['celebrate'],
			houndstone: ['bite', 'shadowball', 'sleeptalk'],
			tatsugiristretchy: [
				'batonpass', 'chillingwater', 'counter', 'dragoncheer', 'dragondance', 'dragonpulse', 'endure',
				'facade', 'gigaimpact', 'harden', 'hydropump', 'hyperbeam', 'icywind', 'lunge', 'memento',
				'mirrorcoat', 'nastyplot', 'outrage', 'protect', 'raindance', 'rapidspin', 'rest', 'sleeptalk',
				'soak', 'splash', 'substitute', 'surf', 'takedown', 'taunt', 'terablast', 'watergun',
				'waterpulse', 'whirlpool',
			],
			annihilape: ['helpinghand'],
			poltchageistartisan: ['curse', 'painsplit', 'psychup'],
		};

		for (const [species, moves] of Object.entries(expected)) {
			const learnset = Dex.species.getLearnsetData(species).learnset;
			for (const move of moves) assert(learnset[move], `${species} should learn ${move}`);
		}
	});
});
