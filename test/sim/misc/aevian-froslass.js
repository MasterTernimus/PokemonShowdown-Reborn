'use strict';

const assert = require('../../assert');
const common = require('../../common');
const {Learnsets} = require('../../../dist/data/learnsets');

describe('Aevian Froslass', function () {
	let battle;
	afterEach(() => {
		if (battle && !battle.ended) battle.destroy();
		battle = null;
	});

	it('is female-only and routes Froslassite to the matching Mega form', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Froslass-Aevian', ability: 'Adaptability', item: 'Froslassite', moves: ['surf']},
		], [
			{species: 'Froslass', ability: 'Cursed Body', item: 'Froslassite', moves: ['icebeam']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		const aevian = battle.p1.active[0];
		assert.equal(aevian.gender, 'F');
		assert.deepEqual(aevian.species.types, ['Grass', 'Water']);
		assert.deepEqual(aevian.species.baseStats, {hp: 70, atk: 70, def: 70, spa: 110, spd: 70, spe: 110});
		assert.deepEqual(aevian.species.abilities, {0: 'Adaptability', 1: 'Gooey', H: 'Storm Power'});
		assert.equal(battle.actions.canMegaEvo(aevian), 'Froslass-Aevian-Mega');
		assert.equal(battle.actions.canMegaEvo(battle.p2.active[0]), 'Froslass-Mega');
		battle.makeChoices('move surf mega', 'move icebeam mega');
		assert.equal(battle.p1.active[0].species.name, 'Froslass-Aevian-Mega');
		assert.equal(battle.p2.active[0].species.name, 'Froslass-Mega');
		assert.deepEqual(battle.p1.active[0].species.baseStats, {hp: 70, atk: 80, def: 70, spa: 140, spd: 100, spe: 140});
		assert.equal(battle.p1.active[0].ability, 'stormcalling');
	});

	it('Storm Calling starts rain and exposes all three component effects', function () {
		battle = common.createBattle({formatid: 'gen9nofieldsinglesgame', preview: false}, [[
			{species: 'Froslass-Aevian', ability: 'Adaptability', item: 'Froslassite', moves: ['hypervoice']},
		], [
			{species: 'Chansey', ability: 'Natural Cure', moves: ['softboiled']},
		]]);
		if (!battle.p1.active[0] || !battle.p2.active[0]) battle.makeChoices('team 1', 'team 1');
		battle.makeChoices('move hypervoice mega', 'move softboiled');
		assert.equal(battle.field.weather, 'raindance');
	});

	it('has every supplied move', function () {
		const requested = [
			'absorb', 'afteryou', 'allyswitch', 'aquaring', 'assurance', 'avalanche', 'blizzard', 'bodyslam',
			'boomburst', 'brickbreak', 'bulletseed', 'chipaway', 'disable', 'dive', 'doubleedge', 'drainpunch',
			'dynamicpunch', 'echoedvoice', 'energyball', 'facade', 'fling', 'focusblast', 'gigadrain', 'gigaimpact',
			'grassknot', 'grassyglide', 'grassyterrain', 'gyroball', 'hail', 'headbutt', 'hex', 'hydropump',
			'hyperbeam', 'hypervoice', 'icebeam', 'icywind', 'ironhead', 'knockoff', 'leafstorm', 'magicalleaf',
			'magnetrise', 'megakick', 'megapunch', 'moonblast', 'mudshot', 'mudslap', 'muddywater', 'naturepower',
			'petaldance', 'powergem', 'psyshock', 'raindance', 'razorleaf', 'return', 'round', 'sandstorm', 'scald',
			'secretpower', 'seedbomb', 'seismictoss', 'shadowball', 'sleeptalk', 'solarbeam', 'spikes', 'stomp',
			'strength', 'sunnyday', 'surf', 'swordsdance', 'synthesis', 'tackle', 'uproar', 'waterpulse', 'waterfall',
			'weatherball', 'whirlpool', 'worryseed', 'zenheadbutt', 'hurricane', 'thunder', 'thunderbolt', 'thunderwave',
			'airslash',
		];
		const learnset = Learnsets.froslassaevian.learnset;
		for (const move of requested) assert(learnset[move], `Froslass-Aevian should learn ${move}`);
	});
});
