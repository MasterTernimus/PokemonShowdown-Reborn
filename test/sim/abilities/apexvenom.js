'use strict';

const assert = require('./../../assert');
const common = require('./../../common');

let battle;

describe('Apex Venom', function () {
	afterEach(function () {
		battle?.destroy();
	});

	for (const move of ['poisonjab', 'poisontail', 'poisonfang', 'firefang', 'icefang', 'thunderfang', 'psychicfangs', 'crunch']) {
		for (const targetSpecies of ['Perrserker', 'Nidorina']) {
			it(`${move} is super effective against ${targetSpecies}`, function () {
				battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: true}, [
					[{species: 'Seviper', ability: 'apexvenom', moves: [move]}],
					[{species: targetSpecies, moves: ['splash']}],
				]);
				battle.makeChoices('team 1', 'team 1');
				let typeMod;
				battle.onEvent('ModifyDamage', battle.format, function (damage, attacker, defender, activeMove) {
					if (activeMove.id !== move) return;
					typeMod = defender.getMoveHitData(activeMove).typeMod;
					if (move === 'poisonfang') assert.equal(activeMove.type, 'Dragon');
				});
				battle.makeChoices(`move ${move}`, 'move splash');
				assert(typeMod > 0, `${move} vs ${targetSpecies}: typeMod=${typeMod}`);
			});
		}
	}
});
