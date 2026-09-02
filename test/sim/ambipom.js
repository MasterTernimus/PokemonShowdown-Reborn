'use strict';

const assert = require('./../assert');
const {Dex} = require('./../../dist/sim/dex');

describe('Ambipom custom data', function () {
	const requestedMoves = [
		'aurasphere', 'focusblast', 'vacuumwave', 'swordsdance', 'nastyplot', 'bulkup', 'axekick', 'closecombat',
		'crosschop', 'drainpunch', 'forcepalm', 'focuspunch', 'hammerarm', 'karatechop',
		'machpunch', 'victorydance', 'tailslap', 'doubleslap', 'cometpunch',
	];

	it('uses the requested typing, 550 BST, abilities, and moves', function () {
		const ambipom = Dex.species.get('Ambipom');
		assert.deepEqual(ambipom.types, ['Normal', 'Fighting']);
		assert.deepEqual(ambipom.baseStats, {hp: 80, atk: 110, def: 70, spa: 100, spd: 70, spe: 120});
		assert.equal(Object.values(ambipom.baseStats).reduce((sum, stat) => sum + stat, 0), 550);
		assert.deepEqual(ambipom.abilities, {0: 'Unburden', 1: 'Double Strike', H: 'Scrappy'});
		for (const move of requestedMoves) {
			assert(Dex.species.getFullLearnset('Ambipom').some(data => data.learnset[move]?.length), `Ambipom should learn ${move}`);
		}
	});

	it('registers Double Strike as a composite ability', function () {
		const ability = Dex.abilities.get('Double Strike');
		assert.equal(ability.name, 'Double Strike');
		assert(ability.onModifyMove);
		assert(ability.onBasePower);
	});
});
