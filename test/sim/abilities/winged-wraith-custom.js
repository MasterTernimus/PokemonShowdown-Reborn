'use strict';

const assert = require('./../../assert');
const common = require('./../../common');
const { Dex } = require('./../../../dist/sim');

let battle;

describe('Winged Wraith custom effects', () => {
	afterEach(() => {
		battle?.destroy();
	});

	it('should expose the reworked data on Crobat and Crobat-Alt', () => {
		for (const name of ['Crobat', 'Crobat-Alt']) {
			const species = Dex.species.get(name);
			assert.deepEqual(species.baseStats, {hp: 80, atk: 100, def: 80, spa: 100, spd: 80, spe: 130});
			assert.deepEqual(species.abilities, {0: 'Inner Focus', 1: 'Wind Rider', H: 'Winged Wraith'});
		}
	});

	it('should combine Infiltrator and Gale Wings', () => {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame'}, [[
			{species: 'Crobat-Alt', ability: 'Winged Wraith', moves: ['aerialace']},
		], [
			{species: 'Deoxys-Speed', moves: ['tackle']},
		]]);
		battle.makeChoices('team 1', 'team 1');
		const crobat = battle.p1.active[0];
		const deoxys = battle.p2.active[0];
		assert(crobat.hasAbility('infiltrator'));
		assert(crobat.hasAbility('galewings'));

		deoxys.addVolatile('substitute');
		const hpBefore = deoxys.hp;
		battle.makeChoices('move aerialace', 'move tackle');
		assert(deoxys.hp < hpBefore, 'Infiltrator should let Aerial Ace damage through Substitute');
		assert(battle.log.findIndex(line => line.includes('|move|p1a: Crobat|Aerial Ace')) <
			battle.log.findIndex(line => line.includes('|move|p2a: Deoxys|Tackle')),
		'Gale Wings should let full-HP Crobat move before Deoxys-Speed');
	});
});
